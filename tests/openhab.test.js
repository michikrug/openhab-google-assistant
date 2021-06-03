const OpenHAB = require('../functions/openhab.js');
const packageVersion = require('../package.json').version;

describe('OpenHAB', () => {
  test('getCommandType', () => {
    const command = OpenHAB.getCommandType('action.devices.commands.OnOff', { on: true });
    expect(command).not.toBeUndefined();
    expect(command.name).toBe('OnOff');
  });

  describe('getDeviceForItem', () => {
    test('getDeviceForItem switch', () => {
      const device = OpenHAB.getDeviceForItem({ type: 'Switch', metadata: { ga: { value: 'Switch' } } });
      expect(device).not.toBeUndefined();
      expect(device.name).toBe('Switch');
    });
  });

  test('setTokenFromHeader', () => {
    const openHAB = new OpenHAB({ authToken: '' });
    openHAB.setTokenFromHeader({});
    expect(openHAB._apiHandler.authToken).toBe(null);
    openHAB.setTokenFromHeader({ authorization: 'Bearer token' });
    expect(openHAB._apiHandler.authToken).toBe('token');
  });

  test('onDisconnect', () => {
    const openHAB = new OpenHAB({});
    expect(openHAB.onDisconnect()).toStrictEqual({});
  });

  describe('onSync', () => {
    const openHAB = new OpenHAB({});

    beforeEach(() => {
      jest.spyOn(openHAB, 'handleSync').mockReset();
    });

    test('onSync failure', async () => {
      const handleSyncMock = jest.spyOn(openHAB, 'handleSync');
      handleSyncMock.mockRejectedValue();
      const result = await openHAB.onSync({ requestId: '1234' }, {});
      expect(handleSyncMock).toBeCalledTimes(1);
      expect(result).toStrictEqual({
        requestId: '1234',
        payload: {
          agentUserId: undefined,
          devices: [],
          errorCode: 'actionNotAvailable',
          status: 'ERROR'
        }
      });
    });

    test('onSync empty', async () => {
      const handleSyncMock = jest.spyOn(openHAB, 'handleSync');
      const payload = { agentUserId: undefined, devices: [] };
      handleSyncMock.mockResolvedValue(payload);
      const result = await openHAB.onSync({ requestId: '1234' }, {});
      expect(handleSyncMock).toBeCalledTimes(1);
      expect(result).toStrictEqual({
        requestId: '1234',
        payload: payload
      });
    });
  });

  describe('handleSync', () => {
    const getItemsMock = jest.fn();

    const apiHandler = {
      getItems: getItemsMock
    };

    const openHAB = new OpenHAB(apiHandler);

    beforeEach(() => {
      getItemsMock.mockClear();
    });

    test('handleSync no matching items', async () => {
      getItemsMock.mockResolvedValue([{ name: 'TestItem' }]);
      const result = await openHAB.handleSync();
      expect(getItemsMock).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual({ devices: [] });
    });

    test('handleSync single switch', async () => {
      getItemsMock.mockReturnValue(
        Promise.resolve([
          {
            type: 'Switch',
            name: 'SwitchItem',
            label: 'Switch Item',
            metadata: { ga: { value: 'Switch' } }
          }
        ])
      );
      const result = await openHAB.handleSync();
      expect(getItemsMock).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual({
        devices: [
          {
            attributes: {},
            customData: {
              deviceType: 'Switch',
              itemType: 'Switch'
            },
            deviceInfo: {
              manufacturer: 'openHAB',
              model: 'Switch:SwitchItem',
              hwVersion: '3.0.0',
              swVersion: packageVersion
            },
            id: 'SwitchItem',
            name: {
              defaultNames: ['Switch Item'],
              name: 'Switch Item',
              nicknames: ['Switch Item']
            },
            notificationSupportedByAgent: true,
            roomHint: undefined,
            structureHint: undefined,
            traits: ['action.devices.traits.OnOff'],
            type: 'action.devices.types.SWITCH',
            willReportState: false
          }
        ]
      });
    });

    test('handleSync switch and light group', async () => {
      getItemsMock.mockReturnValue(
        Promise.resolve([
          {
            type: 'Switch',
            name: 'SwitchItem',
            label: 'Switch Item',
            metadata: { ga: { value: 'Switch' } }
          },
          {
            type: 'Group',
            name: 'TVItem',
            label: 'TV Item',
            metadata: { ga: { value: 'TV' } }
          },
          {
            type: 'Switch',
            name: 'TVMute',
            label: 'TV Mute',
            groupNames: ['TVItem'],
            metadata: { ga: { value: 'tvMute' } }
          },
          {
            type: 'Switch',
            name: 'TVPower',
            label: 'TV Power',
            groupNames: ['TVItem'],
            metadata: { ga: { value: 'tvPower' } }
          }
        ])
      );
      const result = await openHAB.handleSync();
      expect(getItemsMock).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual({
        devices: [
          {
            attributes: {},
            customData: {
              deviceType: 'Switch',
              itemType: 'Switch'
            },
            deviceInfo: {
              manufacturer: 'openHAB',
              model: 'Switch:SwitchItem',
              hwVersion: '3.0.0',
              swVersion: packageVersion
            },
            id: 'SwitchItem',
            name: {
              defaultNames: ['Switch Item'],
              name: 'Switch Item',
              nicknames: ['Switch Item']
            },
            notificationSupportedByAgent: true,
            roomHint: undefined,
            structureHint: undefined,
            traits: ['action.devices.traits.OnOff'],
            type: 'action.devices.types.SWITCH',
            willReportState: false
          },
          {
            attributes: {
              volumeCanMuteAndUnmute: true
            },
            customData: {
              deviceType: 'TV',
              itemType: 'Group',
              members: {
                tvMute: 'TVMute',
                tvPower: 'TVPower'
              }
            },
            deviceInfo: {
              manufacturer: 'openHAB',
              model: 'Group:TVItem',
              hwVersion: '3.0.0',
              swVersion: packageVersion
            },
            id: 'TVItem',
            name: {
              defaultNames: ['TV Item'],
              name: 'TV Item',
              nicknames: ['TV Item']
            },
            notificationSupportedByAgent: true,
            roomHint: undefined,
            structureHint: undefined,
            traits: ['action.devices.traits.OnOff', 'action.devices.traits.Volume'],
            type: 'action.devices.types.TV',
            willReportState: false
          }
        ]
      });
    });
  });

  describe('onQuery', () => {
    const openHAB = new OpenHAB({});

    beforeEach(() => {
      jest.spyOn(openHAB, 'handleQuery').mockReset();
    });

    test('onQuery failure', async () => {
      const handleQueryMock = jest.spyOn(openHAB, 'handleQuery');
      handleQueryMock.mockRejectedValue();
      const result = await openHAB.onQuery({ requestId: '1234' }, {});
      expect(handleQueryMock).toBeCalledTimes(1);
      expect(handleQueryMock).toBeCalledWith([]);
      expect(result).toStrictEqual({
        requestId: '1234',
        payload: {
          devices: {},
          errorCode: 'actionNotAvailable',
          status: 'ERROR'
        }
      });
    });

    test('onQuery empty', async () => {
      const handleQueryMock = jest.spyOn(openHAB, 'handleQuery');
      const payload = { devices: {} };
      handleQueryMock.mockResolvedValue(payload);
      const result = await openHAB.onQuery({ requestId: '1234' }, {});
      expect(handleQueryMock).toBeCalledTimes(1);
      expect(handleQueryMock).toBeCalledWith([]);
      expect(result).toStrictEqual({
        requestId: '1234',
        payload: payload
      });
    });

    test('onQuery', async () => {
      const handleQueryMock = jest.spyOn(openHAB, 'handleQuery');
      const payload = { devices: {} };
      handleQueryMock.mockResolvedValue(payload);
      const devices = [{ id: 'TestItem1' }, { id: 'TestItem2' }];
      const body = {
        requestId: '1234',
        inputs: [
          {
            intent: 'action.devices.QUERY',
            payload: {
              devices: devices
            }
          }
        ]
      };
      const result = await openHAB.onQuery(body, {});
      expect(handleQueryMock).toBeCalledTimes(1);
      expect(handleQueryMock).toBeCalledWith(devices);
      expect(result).toStrictEqual({
        requestId: '1234',
        payload: payload
      });
    });
  });

  describe('handleQuery', () => {
    const getItemMock = jest.fn();

    const apiHandler = {
      getItem: getItemMock
    };

    const openHAB = new OpenHAB(apiHandler);

    beforeEach(() => {
      getItemMock.mockReset();
    });

    test('handleQuery device offline', async () => {
      getItemMock.mockRejectedValue({ statusCode: 500 });
      const result = await openHAB.handleQuery([{ id: 'TestItem' }]);
      expect(getItemMock).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual({
        devices: {
          TestItem: {
            errorCode: 'deviceOffline',
            status: 'ERROR'
          }
        }
      });
    });

    test('handleQuery device not found', async () => {
      getItemMock.mockResolvedValue({ name: 'TestItem' });
      const result = await openHAB.handleQuery([{ id: 'TestItem' }]);
      expect(getItemMock).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual({
        devices: {
          TestItem: {
            errorCode: 'deviceNotFound',
            status: 'ERROR'
          }
        }
      });
    });

    test('handleQuery device not ready', async () => {
      getItemMock.mockReturnValue(
        Promise.resolve({
          name: 'TestItem',
          type: 'Group',
          groupType: 'Switch',
          state: 'NULL',
          metadata: { ga: { value: 'Switch' } }
        })
      );
      const result = await openHAB.handleQuery([{ id: 'TestItem' }]);
      expect(getItemMock).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual({
        devices: {
          TestItem: {
            errorCode: 'deviceNotReady',
            status: 'ERROR'
          }
        }
      });
    });

    test('handleQuery Switch', async () => {
      getItemMock.mockReturnValue(
        Promise.resolve({
          name: 'TestItem',
          type: 'Switch',
          state: 'ON',
          metadata: { ga: { value: 'Switch' } }
        })
      );
      const result = await openHAB.handleQuery([{ id: 'TestItem' }]);
      expect(getItemMock).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual({
        devices: {
          TestItem: {
            status: 'SUCCESS',
            on: true,
            online: true
          }
        }
      });
    });

    test('handleQuery mutliple devices', async () => {
      getItemMock.mockReturnValueOnce(
        Promise.resolve({
          name: 'TestItem',
          type: 'Switch',
          state: 'ON',
          metadata: { ga: { value: 'Switch' } }
        })
      );
      getItemMock.mockReturnValueOnce(
        Promise.resolve({
          name: 'TestItem2',
          type: 'Dimmer',
          state: '50',
          metadata: { ga: { value: 'Light' } }
        })
      );
      const result = await openHAB.handleQuery([{ id: 'TestItem' }, { id: 'TestItem2' }]);
      expect(getItemMock).toHaveBeenCalledTimes(2);
      expect(result).toStrictEqual({
        devices: {
          TestItem: {
            status: 'SUCCESS',
            on: true,
            online: true
          },
          TestItem2: {
            status: 'SUCCESS',
            brightness: 50,
            on: true,
            online: true
          }
        }
      });
    });
  });

  describe('onExecute', () => {
    const openHAB = new OpenHAB({});

    beforeEach(() => {
      jest.spyOn(openHAB, 'handleExecute').mockReset();
    });

    test('onExecute failure', async () => {
      const handleExecuteMock = jest.spyOn(openHAB, 'handleExecute');
      handleExecuteMock.mockRejectedValue();
      const result = await openHAB.onExecute({ requestId: '1234' }, {});
      expect(handleExecuteMock).toBeCalledTimes(1);
      expect(handleExecuteMock).toBeCalledWith([]);
      expect(result).toStrictEqual({
        requestId: '1234',
        payload: {
          commands: [],
          errorCode: 'actionNotAvailable',
          status: 'ERROR'
        }
      });
    });

    test('onExecute empty', async () => {
      const handleExecuteMock = jest.spyOn(openHAB, 'handleExecute');
      const payload = { commands: [] };
      handleExecuteMock.mockResolvedValue(payload);
      const result = await openHAB.onExecute({ requestId: '1234' }, {});
      expect(handleExecuteMock).toBeCalledTimes(1);
      expect(handleExecuteMock).toBeCalledWith([]);
      expect(result).toStrictEqual({
        requestId: '1234',
        payload: payload
      });
    });

    test('onExecute', async () => {
      const handleExecuteMock = jest.spyOn(openHAB, 'handleExecute');
      const payload = { commands: [] };
      handleExecuteMock.mockResolvedValue(payload);
      const commands = [
        {
          devices: [{ id: '123' }, { id: '456' }],
          execution: [
            {
              command: 'action.devices.commands.OnOff',
              params: { on: true }
            }
          ]
        }
      ];
      const body = {
        requestId: '1234',
        inputs: [
          {
            intent: 'action.devices.EXECUTE',
            payload: {
              commands: commands
            }
          }
        ]
      };
      const result = await openHAB.onExecute(body, {});
      expect(handleExecuteMock).toBeCalledTimes(1);
      expect(handleExecuteMock).toBeCalledWith(commands);
      expect(result).toStrictEqual({
        requestId: '1234',
        payload: payload
      });
    });
  });

  describe('handleExecute', () => {
    const getItemMock = jest.fn();
    const sendCommandMock = jest.fn();

    const apiHandler = {
      getItem: getItemMock,
      sendCommand: sendCommandMock
    };

    const openHAB = new OpenHAB(apiHandler);

    beforeEach(() => {
      getItemMock.mockReset();
      sendCommandMock.mockReset();
    });

    test('handleExecute OnOff', async () => {
      sendCommandMock.mockResolvedValue();
      const commands = [
        {
          devices: [
            {
              id: 'TestItem',
              customData: {}
            }
          ],
          execution: [
            {
              command: 'action.devices.commands.OnOff',
              params: { on: true }
            }
          ]
        }
      ];
      const result = await openHAB.handleExecute(commands);
      expect(getItemMock).toHaveBeenCalledTimes(0);
      expect(sendCommandMock).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual({
        commands: [
          {
            ids: ['TestItem'],
            states: {
              on: true,
              online: true
            },
            status: 'SUCCESS'
          }
        ]
      });
    });

    test('handleExecute function not supported', async () => {
      const commands = [
        {
          devices: [
            {
              id: 'TestItem',
              customData: {}
            }
          ],
          execution: [
            {
              command: 'action.devices.commands.Invalid',
              params: {}
            }
          ]
        }
      ];
      const result = await openHAB.handleExecute(commands);
      expect(getItemMock).toHaveBeenCalledTimes(0);
      expect(sendCommandMock).toHaveBeenCalledTimes(0);
      expect(result).toStrictEqual({
        commands: [
          {
            ids: ['TestItem'],
            errorCode: 'functionNotSupported',
            status: 'ERROR'
          }
        ]
      });
    });

    test('handleExecute ThermostatTemperatureSetRange', async () => {
      getItemMock.mockReturnValue(
        Promise.resolve({
          name: 'TestItem',
          type: 'Group',
          metadata: {
            ga: {
              value: 'Thermostat'
            }
          },
          members: [
            {
              name: 'High',
              state: '25',
              type: 'Number',
              metadata: {
                ga: {
                  value: 'thermostatTemperatureSetpointHigh'
                }
              }
            },
            {
              name: 'Low',
              state: '5',
              type: 'Number',
              metadata: {
                ga: {
                  value: 'thermostatTemperatureSetpointLow'
                }
              }
            }
          ]
        })
      );
      sendCommandMock.mockResolvedValue();
      const commands = [
        {
          devices: [
            {
              id: 'TestItem',
              customData: {
                members: {
                  thermostatTemperatureSetpointHigh: 'Test1',
                  thermostatTemperatureSetpointLow: 'Test2'
                }
              }
            }
          ],
          execution: [
            {
              command: 'action.devices.commands.ThermostatTemperatureSetRange',
              params: {
                thermostatTemperatureSetpointLow: 10,
                thermostatTemperatureSetpointHigh: 20
              }
            }
          ]
        }
      ];
      const result = await openHAB.handleExecute(commands);
      expect(getItemMock).toHaveBeenCalledTimes(2);
      expect(sendCommandMock).toHaveBeenCalledTimes(2);
      expect(result).toStrictEqual({
        commands: [
          {
            ids: ['TestItem'],
            states: {
              thermostatTemperatureSetpointHigh: 25,
              thermostatTemperatureSetpointLow: 10,
              online: true
            },
            status: 'SUCCESS'
          }
        ]
      });
    });
  });

  describe('onStateReport', () => {
    const openHAB = new OpenHAB();
    const handleStateReportMock = jest.spyOn(openHAB, 'handleStateReport');

    beforeEach(() => {
      handleStateReportMock.mockClear();
    });

    test('onStateReport success', async () => {
      handleStateReportMock.mockResolvedValue({ statusText: 'OK' });
      const jsonMock = jest.fn((d) => JSON.stringify(d));
      const req = { headers: { 'x-openhab-user': 'tester@test.com' }, body: 'TestItem' };
      const res = { json: jsonMock };
      await openHAB.onStateReport(req, res, {});
      expect(handleStateReportMock).toHaveBeenCalledWith('TestItem', 'tester@test.com', {});
      expect(jsonMock).toHaveBeenCalledWith('OK');
    });

    test('onStateReport failed', async () => {
      handleStateReportMock.mockRejectedValue({ statusCode: 404 });
      const jsonMock = jest.fn((d) => JSON.stringify(d));
      const req = { headers: { 'x-openhab-user': 'tester@test.com' }, body: 'TestItem' };
      const res = { json: jsonMock };
      await openHAB.onStateReport(req, res, {});
      expect(handleStateReportMock).toHaveBeenCalledWith('TestItem', 'tester@test.com', {});
      expect(jsonMock).toHaveBeenCalledWith({
        errorCode: 'deviceNotFound',
        status: 'ERROR'
      });
    });
  });

  describe('handleStateReport', () => {
    const uuidMock = jest.spyOn(OpenHAB, 'uuid');
    uuidMock.mockReturnValue('1234');
    const nowMock = jest.spyOn(Date, 'now');
    nowMock.mockReturnValue(1234);
    const openHAB = new OpenHAB();
    const reportStateAndNotificationMock = jest.fn();
    reportStateAndNotificationMock.mockResolvedValue({ statusText: 'OK' });
    const homegraphClientMock = {
      devices: {
        reportStateAndNotification: reportStateAndNotificationMock
      }
    };

    beforeEach(() => {
      reportStateAndNotificationMock.mockClear();
    });

    afterAll(() => {
      uuidMock.mockRestore();
      nowMock.mockRestore();
    });

    test('handleStateReport no valid item', async () => {
      expect.assertions(2);
      return openHAB
        .handleStateReport({ name: 'TestItem', type: 'Switch', state: 'NULL' }, 'tester@test.com', homegraphClientMock)
        .catch((error) => {
          expect(reportStateAndNotificationMock).toHaveBeenCalledTimes(0);
          expect(error).toEqual({ statusCode: 404 });
        });
    });

    test('handleStateReport no valid state', async () => {
      expect.assertions(2);
      return openHAB
        .handleStateReport(
          { name: 'TestItem', type: 'Switch', state: 'NULL', metadata: { ga: { value: 'Switch' } } },
          'tester@test.com',
          homegraphClientMock
        )
        .catch((error) => {
          expect(reportStateAndNotificationMock).toHaveBeenCalledTimes(0);
          expect(error).toEqual({ statusCode: 406 });
        });
    });

    test('handleStateReport states', async () => {
      const result = await openHAB.handleStateReport(
        { name: 'TestItem', type: 'Switch', state: 'ON', metadata: { ga: { value: 'Switch' } } },
        'tester@test.com',
        homegraphClientMock
      );
      expect(reportStateAndNotificationMock).toHaveBeenCalledTimes(1);
      expect(reportStateAndNotificationMock).toHaveBeenCalledWith({
        requestBody: {
          agentUserId: 'tester@test.com',
          eventId: '1234',
          payload: {
            devices: {
              notifications: {},
              states: {
                TestItem: {
                  on: true
                }
              }
            }
          },
          requestId: '1234'
        }
      });
      expect(result).toStrictEqual({ statusText: 'OK' });
    });

    test('handleStateReport notifications', async () => {
      const result = await openHAB.handleStateReport(
        { name: 'TestItem', type: 'Switch', state: 'ON', metadata: { ga: { value: 'Doorbell' } } },
        'tester@test.com',
        homegraphClientMock
      );
      expect(reportStateAndNotificationMock).toHaveBeenCalledTimes(1);
      expect(reportStateAndNotificationMock).toHaveBeenCalledWith({
        requestBody: {
          agentUserId: 'tester@test.com',
          eventId: '1234',
          payload: {
            devices: {
              notifications: {
                TestItem: {
                  ObjectDetection: {
                    detectionTimestamp: 1234,
                    objects: {
                      unclassified: 1
                    },
                    priority: 0
                  }
                }
              },
              states: {}
            }
          },
          requestId: '1234'
        }
      });
      expect(result).toStrictEqual({ statusText: 'OK' });
    });

    test('handleStateReport do nothing', async () => {
      const result = await openHAB.handleStateReport(
        { name: 'TestItem', type: 'Switch', state: 'OFF', metadata: { ga: { value: 'Doorbell' } } },
        'tester@test.com',
        homegraphClientMock
      );
      expect(reportStateAndNotificationMock).toHaveBeenCalledTimes(0);
      expect(result).toStrictEqual({ statusText: 'OK' });
    });
  });
});
