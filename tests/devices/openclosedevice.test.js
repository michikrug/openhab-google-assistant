const Device = require('../../functions/devices/openclosedevice.js');

describe('OpenCloseDevice Device', () => {
  test('get attributes', () => {
    expect(new Device({ type: 'Rollershutter' }).attributes).toStrictEqual({
      pausable: false,
      discreteOnlyOpenClose: false,
      queryOnlyOpenClose: false
    });
    expect(
      new Device({
        type: 'Rollershutter',
        metadata: {
          ga: {
            value: '',
            config: {
              discreteOnly: true,
              queryOnly: true
            }
          }
        }
      }).attributes
    ).toStrictEqual({
      pausable: false,
      discreteOnlyOpenClose: true,
      queryOnlyOpenClose: true
    });
    expect(new Device({ type: 'Switch' }).attributes).toStrictEqual({
      pausable: false,
      discreteOnlyOpenClose: true,
      queryOnlyOpenClose: false
    });
    expect(new Device({ type: 'Contact' }).attributes).toStrictEqual({
      pausable: false,
      discreteOnlyOpenClose: true,
      queryOnlyOpenClose: true
    });

    expect(new Device({ type: 'Group' }).attributes).toStrictEqual({
      pausable: false,
      discreteOnlyOpenClose: false,
      queryOnlyOpenClose: false
    });
    expect(new Device({ type: 'Group', groupType: 'Switch' }).attributes).toStrictEqual({
      pausable: false,
      discreteOnlyOpenClose: true,
      queryOnlyOpenClose: false
    });
    expect(new Device({ type: 'Group', groupType: 'Contact' }).attributes).toStrictEqual({
      pausable: false,
      discreteOnlyOpenClose: true,
      queryOnlyOpenClose: true
    });
  });

  describe('get state', () => {
    test('get state Contact', () => {
      const item = {
        type: 'Contact',
        state: 'OPEN'
      };
      expect(new Device(item).state).toStrictEqual({
        openPercent: 100
      });
      item.state = 'CLOSED';
      expect(new Device(item).state).toStrictEqual({
        openPercent: 0
      });
    });

    test('get state Switch', () => {
      const item = {
        type: 'Switch',
        state: 'ON'
      };
      expect(new Device(item).state).toStrictEqual({
        openPercent: 100
      });
      item.state = 'OFF';
      expect(new Device(item).state).toStrictEqual({
        openPercent: 0
      });
    });

    test('get state Rollershutter', () => {
      const item = {
        type: 'Rollershutter',
        state: '25'
      };
      expect(new Device(item).state).toStrictEqual({
        openPercent: 75
      });
    });

    test('get state Group Rollershutter', () => {
      const item = {
        type: 'Group',
        groupType: 'Rollershutter',
        state: '25'
      };
      expect(new Device(item).state).toStrictEqual({
        openPercent: 75
      });
    });

    test('get state inverted Contact', () => {
      const item = {
        type: 'Contact',
        state: 'CLOSED',
        metadata: {
          ga: {
            value: '',
            config: {
              inverted: true
            }
          }
        }
      };
      expect(new Device(item).state).toStrictEqual({
        openPercent: 100
      });
    });

    test('get state inverted Switch', () => {
      const item = {
        type: 'Switch',
        state: 'ON',
        metadata: {
          ga: {
            value: '',
            config: {
              inverted: true
            }
          }
        }
      };
      expect(new Device(item).state).toStrictEqual({
        openPercent: 0
      });
    });

    test('get state inverted Rollershutter', () => {
      const item = {
        type: 'Rollershutter',
        state: '25',
        metadata: {
          ga: {
            value: '',
            config: {
              inverted: true
            }
          }
        }
      };
      expect(new Device(item).state).toStrictEqual({
        openPercent: 25
      });
    });
  });
});
