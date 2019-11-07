const expect = require('chai').expect;
const sinon = require('sinon');
const commands = require('../functions/commands');
const devices = require('../functions/devices');
const ApiHandler = require('../functions/apihandler');
const apiHandlerMock = sinon.stub(new ApiHandler.ApiHandler());
const lockUnlockCommand = new commands.LockUnlockCommand(apiHandlerMock);
let lock = new devices.Lock();
lock.id = 1;

describe('LockUnlock command', function () {

  beforeEach(function () {
    apiHandlerMock.sendCommand.reset();
    apiHandlerMock.sendCommand.resolves({});
  });

  it('should unlock the device without a pin configured', async () => {
    apiHandlerMock.getItem.resolves({});

    await lockUnlockCommand.execute([lock], {lock: true}).then(result => {
      expect(result[0].ids).to.be.deep.equal([1]);
      expect(result[0].states).to.be.deep.equal({on: true, online: true});
      expect(result[0].status).to.be.equal('SUCCESS');
    });

    sinon.assert.calledWith(apiHandlerMock.sendCommand, 1, 'ON');
  });

  it('should return authentication is required if pin is configured without a pin being passed', async () => {
    apiHandlerMock.getItem.resolves({tags: ['Protected:1234']});

    await lockUnlockCommand.execute([lock], {lock: true}).then(result => {
      expect(result[0].ids).to.be.deep.equal([1]);
      expect(result[0].status).to.be.equal('ERROR');
      expect(result[0].errorCode).to.be.equal('challengeNeeded');
      expect(result[0].challengeNeeded).to.be.deep.equal({
        'type': 'pinNeeded'
      });
    });

    sinon.assert.notCalled(apiHandlerMock.sendCommand);
  });

  it('should return challengeFailedPinNeeded if pin is incorrect', async () => {
    apiHandlerMock.getItem.resolves({tags: ['Protected:1234']});

    await lockUnlockCommand.execute([lock], {lock: true}, {pin: '4567'}).then(result => {
      expect(result[0].ids).to.be.deep.equal([1]);
      expect(result[0].status).to.be.equal('ERROR');
      expect(result[0].errorCode).to.be.equal('challengeNeeded');
      expect(result[0].challengeNeeded).to.be.deep.equal({
        'type': 'challengeFailedPinNeeded'
      });
    });

    sinon.assert.notCalled(apiHandlerMock.sendCommand);
  });

  it('should unlock the door if the pincode is correct for a protected lock', async () => {
    apiHandlerMock.getItem.resolves({tags: ['Protected:1234']});

    await lockUnlockCommand.execute([lock], {lock: true}, {pin: '1234'}).then(result => {
      expect(result[0].ids).to.be.deep.equal([1]);
      expect(result[0].status).to.be.equal('SUCCESS');
      expect(result[0].states).to.be.deep.equal({on: true, online: true});
    });

    sinon.assert.calledWith(apiHandlerMock.sendCommand, 1, 'ON');
  });

  it('should unlock multiple locks', async () => {
    apiHandlerMock.getItem.resolves({tags: ['Protected:1234']});

    let lockTwo = new devices.Lock();
    lockTwo.id = 2;

    await lockUnlockCommand.execute([lock, lockTwo], {lock: true}, {pin: '1234'}).then(result => {
      expect(result[0].ids).to.be.deep.equal([1]);
      expect(result[0].status).to.be.equal('SUCCESS');
      expect(result[0].states).to.be.deep.equal({on: true, online: true});

      expect(result[1].ids).to.be.deep.equal([2]);
      expect(result[1].status).to.be.equal('SUCCESS');
      expect(result[1].states).to.be.deep.equal({on: true, online: true});
    });

    sinon.assert.calledWith(apiHandlerMock.sendCommand, 1, 'ON');
    sinon.assert.calledWith(apiHandlerMock.sendCommand, 2, 'ON');
  });

  it('should not require pin for locking if only UnlockProtected tag is present', async () => {
    apiHandlerMock.getItem.resolves({tags: ['UnlockProtected:1234']});

    await lockUnlockCommand.execute([lock], {lock: true}).then(result => {
      expect(result[0].ids).to.be.deep.equal([1]);
      expect(result[0].status).to.be.equal('SUCCESS');
      expect(result[0].states).to.be.deep.equal({on: true, online: true});
    });

    sinon.assert.calledWith(apiHandlerMock.sendCommand, 1, 'ON');
  });

  it('should require pin for locking if LockProtected tag is present', async () => {
    apiHandlerMock.getItem.resolves({tags: ['LockProtected:1234']});

    await lockUnlockCommand.execute([lock], {lock: true}).then(result => {
      expect(result[0].ids).to.be.deep.equal([1]);
      expect(result[0].status).to.be.equal('ERROR');
      expect(result[0].errorCode).to.be.equal('challengeNeeded');
      expect(result[0].challengeNeeded).to.be.deep.equal({
        'type': 'pinNeeded'
      });
    });

    sinon.assert.notCalled(apiHandlerMock.sendCommand);
  });

  it('should require pin for unlocking if UnlockProtected tag is present', async () => {
    apiHandlerMock.getItem.resolves({tags: ['UnlockProtected:1234']});

    await lockUnlockCommand.execute([lock], {lock: false}).then(result => {
      expect(result[0].ids).to.be.deep.equal([1]);
      expect(result[0].status).to.be.equal('ERROR');
      expect(result[0].errorCode).to.be.equal('challengeNeeded');
      expect(result[0].challengeNeeded).to.be.deep.equal({
        'type': 'pinNeeded'
      });
    });

    sinon.assert.notCalled(apiHandlerMock.sendCommand);
  });

  it('should unlock if UnlockProtected tag is present and the correct pin is entered', async () => {
    apiHandlerMock.getItem.resolves({tags: ['UnlockProtected:1234']});

    await lockUnlockCommand.execute([lock], {lock: false}, {pin: '1234'}).then(result => {
      expect(result[0].ids).to.be.deep.equal([1]);
      expect(result[0].status).to.be.equal('SUCCESS');
      expect(result[0].states).to.be.deep.equal({on: false, online: true});
    });

    sinon.assert.calledWith(apiHandlerMock.sendCommand, 1, 'OFF');
  });
});
