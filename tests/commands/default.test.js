const Command = require('../../functions/commands/default.js');

class TestCommand1 extends Command {
  get type() {
    return 'action.devices.commands.OnOff';
  }
  convertParamsToValue() {
    return 'TEST';
  }
  getResponseStates() {
    return this.params;
  }
}

class TestCommand2 extends TestCommand1 {
  get requiresItem() {
    return true;
  }
}

class TestCommand3 extends TestCommand1 {
  convertParamsToValue() {
    return null;
  }
}

class TestCommand4 extends TestCommand1 {
  // @ts-ignore
  convertParamsToValue() {
    throw { statusCode: 400 };
  }
}

class TestCommand5 extends TestCommand1 {
  get requiresUpdateValidation() {
    return true;
  }
  get bypassPin() {
    return true;
  }
}

class TestCommand6 extends TestCommand1 {
  get requiresUpdateValidation() {
    return true;
  }
  // @ts-ignore
  validateUpdate() {
    return {
      ids: ['TestDevice'],
      status: 'EXCEPTIONS',
      states: { online: true, currentStatusReport: 'report' }
    };
  }
}

describe('Default Command', () => {
  test('hasValidParams', () => {
    expect(new Command({}, { id: 'Item' }).hasValidParams).toBe(true);
  });

  test('convertParamsToValue', () => {
    expect(new Command({}, { id: 'Item' }).convertParamsToValue({})).toBe(null);
  });

  test('getResponseStates', () => {
    expect(new Command({}, { id: 'Item' }).getResponseStates({})).toStrictEqual({});
  });

  test('getItemName', () => {
    expect(new Command({}, { id: 'Item' }).itemName).toBe('Item');
  });

  test('getMembers', () => {
    expect(new Command().members).toStrictEqual({});
    expect(new Command({}, { id: 'Item', customData: { members: { testMember: 'testItem' } } }).members).toStrictEqual({
      testMember: 'testItem'
    });
  });

  test('handleAuthPin', () => {
    expect(new Command({}, { id: 'Item', customData: {} }, undefined).handleAuthPin()).toBeUndefined();
    expect(
      new Command({}, { id: 'Item', customData: { pinNeeded: '1234' } }, { pin: '1234' }).handleAuthPin()
    ).toBeUndefined();
    expect(new Command({}, { id: 'Item', customData: { pinNeeded: '1234' } }, undefined).handleAuthPin()).toStrictEqual(
      {
        ids: ['Item'],
        status: 'ERROR',
        errorCode: 'challengeNeeded',
        challengeNeeded: {
          type: 'pinNeeded'
        }
      }
    );
    expect(
      new Command({}, { id: 'Item', customData: { pinNeeded: '1234' } }, { pin: '5678' }).handleAuthPin()
    ).toStrictEqual({
      ids: ['Item'],
      status: 'ERROR',
      errorCode: 'challengeNeeded',
      challengeNeeded: {
        type: 'challengeFailedPinNeeded'
      }
    });
    // legacy tfa
    expect(
      new Command({}, { id: 'Item', customData: { tfaPin: '1234' } }, { pin: '1234' }).handleAuthPin()
    ).toBeUndefined();
    expect(new Command({}, { id: 'Item', customData: { tfaPin: '1234' } }, undefined).handleAuthPin()).toStrictEqual({
      ids: ['Item'],
      status: 'ERROR',
      errorCode: 'challengeNeeded',
      challengeNeeded: {
        type: 'pinNeeded'
      }
    });
    // bypasspin
    expect(
      new TestCommand5({}, { id: 'Item', customData: { pinNeeded: '1234' } }, undefined).handleAuthPin()
    ).toBeUndefined();
  });

  test('handleAuthAck', () => {
    expect(new Command({}, { id: 'Item', customData: {} }, undefined).handleAuthAck()).toBeUndefined();
    expect(
      new Command({}, { id: 'Item', customData: { ackNeeded: true } }, { ack: true }).handleAuthAck()
    ).toBeUndefined();
    expect(
      new Command({}, { id: 'Item', customData: { ackNeeded: true } }).handleAuthAck({ key: 'value' })
    ).toStrictEqual({
      ids: ['Item'],
      status: 'ERROR',
      states: { key: 'value' },
      errorCode: 'challengeNeeded',
      challengeNeeded: {
        type: 'ackNeeded'
      }
    });
    // legacy tfa
    expect(
      new Command({}, { id: 'Item', customData: { tfaAck: true } }, { ack: true }).handleAuthAck()
    ).toBeUndefined();
    expect(new Command({}, { id: 'Item', customData: { tfaAck: true } }).handleAuthAck({ key: 'value' })).toStrictEqual(
      {
        ids: ['Item'],
        status: 'ERROR',
        states: { key: 'value' },
        errorCode: 'challengeNeeded',
        challengeNeeded: {
          type: 'ackNeeded'
        }
      }
    );
  });

  describe('execute', () => {
    const getItemMock = jest.fn();
    const sendCommandMock = jest.fn();

    const apiHandler = {
      getItem: getItemMock,
      sendCommand: sendCommandMock
    };

    const successResponse = {
      ids: ['Item1'],
      states: {
        on: true,
        online: true
      },
      status: 'SUCCESS'
    };

    beforeEach(() => {
      getItemMock.mockClear();
      sendCommandMock.mockClear();
      sendCommandMock.mockReturnValue(Promise.resolve());
      getItemMock.mockReturnValue(
        Promise.resolve({ name: 'TestItem', type: 'Switch', metadata: { ga: { value: 'Switch' } } })
      );
    });

    test('execute without responseStates', async () => {
      const device = { id: 'Item1' };
      const result = await new TestCommand1({}, device).execute(apiHandler);
      expect(getItemMock).toHaveBeenCalledTimes(0);
      expect(sendCommandMock).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual({
        ids: ['Item1'],
        states: {},
        status: 'SUCCESS'
      });
    });

    test('execute without sent command', async () => {
      const device = { id: 'Item1' };
      const result = await new TestCommand3({ on: true }, device).execute(apiHandler);
      expect(getItemMock).toHaveBeenCalledTimes(0);
      expect(sendCommandMock).toHaveBeenCalledTimes(0);
      expect(result).toStrictEqual(successResponse);
    });

    test('execute without getItem', async () => {
      const device = { id: 'Item1' };
      const result = await new TestCommand1({ on: true }, device).execute(apiHandler);
      expect(getItemMock).toHaveBeenCalledTimes(0);
      expect(sendCommandMock).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual(successResponse);
    });

    test('execute with getItem', async () => {
      const device = { id: 'Item1', customData: { deviceType: 'Switch' } };
      const result = await new TestCommand2({ on: true }, device).execute(apiHandler);
      expect(getItemMock).toHaveBeenCalledTimes(1);
      expect(sendCommandMock).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual(successResponse);
    });

    test('execute with pinNeeded', async () => {
      const device = { id: 'Item1', customData: { pinNeeded: '1234' } };
      const result = await new TestCommand1({ on: true }, device).execute(apiHandler);
      expect(getItemMock).toHaveBeenCalledTimes(0);
      expect(sendCommandMock).toHaveBeenCalledTimes(0);
      expect(result).toStrictEqual({
        ids: ['Item1'],
        challengeNeeded: {
          type: 'pinNeeded'
        },
        errorCode: 'challengeNeeded',
        status: 'ERROR'
      });
    });

    test('execute with corrrect pin', async () => {
      const device = { id: 'Item1', customData: { pinNeeded: '1234' } };
      const result = await new TestCommand1({ on: true }, device, { pin: '1234' }).execute(apiHandler);
      expect(getItemMock).toHaveBeenCalledTimes(0);
      expect(sendCommandMock).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual(successResponse);
    });

    test('execute with ackNeeded', async () => {
      const device = { id: 'Item1', customData: { ackNeeded: true } };
      const result = await new TestCommand1({ on: true }, device).execute(apiHandler);
      expect(getItemMock).toHaveBeenCalledTimes(1);
      expect(sendCommandMock).toHaveBeenCalledTimes(0);
      expect(result).toStrictEqual({
        ids: ['Item1'],
        challengeNeeded: {
          type: 'ackNeeded'
        },
        errorCode: 'challengeNeeded',
        states: {
          on: true,
          online: true
        },
        status: 'ERROR'
      });
    });

    test('execute with ackNeeded and state', async () => {
      const device = { id: 'Item1', customData: { ackNeeded: true, deviceType: 'Switch' } };
      const result = await new TestCommand2({ on: true }, device).execute(apiHandler);
      expect(getItemMock).toHaveBeenCalledTimes(1);
      expect(sendCommandMock).toHaveBeenCalledTimes(0);
      expect(result).toStrictEqual({
        ids: ['Item1'],
        challengeNeeded: {
          type: 'ackNeeded'
        },
        errorCode: 'challengeNeeded',
        states: {
          on: true,
          online: true
        },
        status: 'ERROR'
      });
    });

    test('execute with ackNeeded and ack', async () => {
      const device = { id: 'Item1', customData: { ackNeeded: true } };
      const result = await new TestCommand3({ on: true }, device, { ack: true }).execute(apiHandler);
      expect(getItemMock).toHaveBeenCalledTimes(0);
      expect(sendCommandMock).toHaveBeenCalledTimes(0);
      expect(result).toStrictEqual({
        ids: ['Item1'],
        states: {
          on: true,
          online: true
        },
        status: 'SUCCESS'
      });
    });

    test('execute with ack', async () => {
      const device = { id: 'Item1', customData: { ackNeeded: true } };
      const result = await new TestCommand1({ on: true }, device, { ack: true }).execute(apiHandler);
      expect(getItemMock).toHaveBeenCalledTimes(0);
      expect(sendCommandMock).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual(successResponse);
    });

    test('execute with device not found', async () => {
      getItemMock.mockRejectedValue({ statusCode: '404' });
      const device = { id: 'Item1' };
      const result = await new TestCommand2({ on: true }, device).execute(apiHandler);
      expect(getItemMock).toHaveBeenCalledTimes(1);
      expect(sendCommandMock).toHaveBeenCalledTimes(0);
      expect(result).toStrictEqual({
        errorCode: 'deviceNotFound',
        ids: ['Item1'],
        status: 'ERROR'
      });
    });

    test('execute with not supported', async () => {
      const device = { id: 'Item1' };
      const result = await new TestCommand4({ on: true }, device).execute(apiHandler);
      expect(getItemMock).toHaveBeenCalledTimes(0);
      expect(sendCommandMock).toHaveBeenCalledTimes(0);
      expect(result).toStrictEqual({
        errorCode: 'notSupported',
        ids: ['Item1'],
        status: 'ERROR'
      });
    });

    test('execute with device offline', async () => {
      sendCommandMock.mockRejectedValue({ statusCode: 500 });
      const device = { id: 'Item1' };
      const result = await new TestCommand1({ on: true }, device).execute(apiHandler);
      expect(getItemMock).toHaveBeenCalledTimes(0);
      expect(sendCommandMock).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual({
        errorCode: 'deviceOffline',
        ids: ['Item1'],
        status: 'ERROR'
      });
    });

    test('execute with errorCode', async () => {
      sendCommandMock.mockRejectedValue({ errorCode: 'noAvailableChannel' });
      const device = { id: 'Item1' };
      const result = await new TestCommand1({ on: true }, device).execute(apiHandler);
      expect(getItemMock).toHaveBeenCalledTimes(0);
      expect(sendCommandMock).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual({
        errorCode: 'noAvailableChannel',
        ids: ['Item1'],
        status: 'ERROR'
      });
    });

    test('execute with updateValidation', async () => {
      getItemMock.mockReturnValue(
        Promise.resolve({ name: 'TestItem', type: 'Switch', state: 'ON', metadata: { ga: { value: 'Switch' } } })
      );
      const device = { id: 'Item1', customData: { deviceType: 'Switch' } };
      const result = await new TestCommand5({ on: true }, device).execute(apiHandler);
      expect(getItemMock).toHaveBeenCalledTimes(2);
      expect(sendCommandMock).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual(successResponse);
    });

    test('execute with updateValidation and device not found', async () => {
      getItemMock.mockReturnValue(Promise.resolve({ name: 'TestItem', type: 'Invalid' }));
      const device = { id: 'Item1', customData: { deviceType: 'Switch' } };
      const result = await new TestCommand5({ on: true }, device).execute(apiHandler);
      expect(getItemMock).toHaveBeenCalledTimes(2);
      expect(sendCommandMock).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual({
        errorCode: 'deviceNotFound',
        ids: ['Item1'],
        status: 'ERROR'
      });
    });

    test('execute with failed updateValidation', async () => {
      getItemMock.mockReturnValue(
        Promise.resolve({ name: 'TestItem', type: 'Switch', state: 'ON', metadata: { ga: { value: 'Switch' } } })
      );
      const device = { id: 'Item1' };
      const result = await new TestCommand6({ on: true }, device).execute(apiHandler);
      expect(getItemMock).toHaveBeenCalledTimes(2);
      expect(sendCommandMock).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual({
        ids: ['TestDevice'],
        status: 'EXCEPTIONS',
        states: { online: true, currentStatusReport: 'report' }
      });
    });

    test('execute with updateValidation and wait time', async () => {
      const timeoutSpy = jest.spyOn(global, 'setTimeout');
      // @ts-ignore
      timeoutSpy.mockImplementation((fn) => fn());
      getItemMock.mockReturnValue(
        Promise.resolve({ name: 'TestItem', type: 'Switch', state: 'ON', metadata: { ga: { value: 'Switch' } } })
      );
      const device = { id: 'Item1', customData: { deviceType: 'Switch', waitForStateChange: 5 } };
      const result = await new TestCommand5({ on: true }, device).execute(apiHandler);
      expect(getItemMock).toHaveBeenCalledTimes(2);
      expect(sendCommandMock).toHaveBeenCalledTimes(1);
      expect(setTimeout).toHaveBeenCalledTimes(1);
      expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 5000);
      expect(result).toStrictEqual(successResponse);
    });
  });
});
