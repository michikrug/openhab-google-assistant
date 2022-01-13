const Device = require('../../functions/devices/fan.js');

describe('Fan Device', () => {
  test('validDeviceType', () => {
    expect(
      new Device({
        type: 'Dimmer',
        metadata: {
          ga: {
            value: 'FAN'
          }
        }
      }).validDeviceType
    ).toBe(true);
    expect(
      new Device({
        type: 'Group',
        metadata: {
          ga: {
            value: 'FAN'
          }
        }
      }).validDeviceType
    ).toBe(false);
    expect(
      new Device({
        type: 'Group',
        metadata: {
          ga: {
            value: 'FAN'
          }
        },
        members: [
          {
            type: 'Number',
            state: '10',
            metadata: {
              ga: {
                value: 'fanSpeed'
              }
            }
          }
        ]
      }).validDeviceType
    ).toBe(true);
  });

  test('validItemType', () => {
    expect(new Device({ type: 'Dimmer' }).validItemType).toBe(true);
    expect(new Device({ type: 'String' }).validItemType).toBe(false);
    expect(new Device({ type: 'Group', groupType: 'Dimmer' }).validItemType).toBe(true);
    expect(new Device({ type: 'Group', groupType: 'String' }).validItemType).toBe(false);
  });

  describe('get traits', () => {
    test('get traits Dimmer', () => {
      const item = {
        type: 'Dimmer'
      };
      expect(new Device(item).traits).toStrictEqual(['action.devices.traits.OnOff', 'action.devices.traits.FanSpeed']);
    });

    test('get traits Group Dimmer', () => {
      const item = {
        type: 'Group',
        groupType: 'Dimmer'
      };
      expect(new Device(item).traits).toStrictEqual(['action.devices.traits.OnOff', 'action.devices.traits.FanSpeed']);
    });

    test('get traits only fanPower', () => {
      const item = {
        type: 'Group',
        members: [
          {
            type: 'Switch',
            state: 'ON',
            metadata: {
              ga: {
                value: 'fanPower'
              }
            }
          }
        ]
      };
      expect(new Device(item).traits).toStrictEqual(['action.devices.traits.OnOff']);
    });

    test('get traits all members', () => {
      const item = {
        members: [
          {
            type: 'Switch',
            state: 'ON',
            metadata: {
              ga: {
                value: 'fanPower'
              }
            }
          },
          {
            type: 'Dimmer',
            state: '50',
            metadata: {
              ga: {
                value: 'fanSpeed'
              }
            }
          },
          {
            type: 'String',
            state: 'Mode1',
            metadata: {
              ga: {
                value: 'fanMode'
              }
            }
          },
          {
            type: 'Number',
            state: '10',
            metadata: {
              ga: {
                value: 'fanFilterLifeTime'
              }
            }
          }
        ]
      };
      expect(new Device(item).traits).toStrictEqual([
        'action.devices.traits.OnOff',
        'action.devices.traits.FanSpeed',
        'action.devices.traits.Modes',
        'action.devices.traits.SensorState'
      ]);
    });
  });

  describe('get attributes', () => {
    test('get attributes no config', () => {
      const item = {
        metadata: {
          ga: {
            config: {}
          }
        }
      };
      expect(new Device(item).attributes).toStrictEqual({ supportsFanSpeedPercent: true });
    });

    test('get attributes fanSpeeds', () => {
      const item = {
        metadata: {
          ga: {
            config: {
              ordered: true,
              fanSpeeds: '0=null:off,50=slow,100=full:fast',
              lang: 'en'
            }
          }
        }
      };
      expect(new Device(item).attributes).toStrictEqual({
        availableFanSpeeds: {
          speeds: [
            {
              speed_name: '0',
              speed_values: [
                {
                  speed_synonym: ['null', 'off'],
                  lang: 'en'
                }
              ]
            },
            {
              speed_name: '50',
              speed_values: [
                {
                  speed_synonym: ['slow'],
                  lang: 'en'
                }
              ]
            },
            {
              speed_name: '100',
              speed_values: [
                {
                  speed_synonym: ['full', 'fast'],
                  lang: 'en'
                }
              ]
            }
          ],
          ordered: true
        },
        reversible: false
      });
    });

    test('get attributes fanMode', () => {
      const item = {
        metadata: {
          ga: {
            config: {
              fanModeName: 'OperationMode,Modus',
              fanModeSettings: '1=Silent,2=Normal,3=Night'
            }
          }
        },
        members: [
          {
            name: 'FanMode',
            type: 'String',
            metadata: {
              ga: {
                value: 'fanMode'
              }
            }
          }
        ]
      };
      expect(new Device(item).attributes).toStrictEqual({
        supportsFanSpeedPercent: true,
        availableModes: [
          {
            name: 'OperationMode',
            name_values: [
              {
                lang: 'en',
                name_synonym: ['OperationMode', 'Modus']
              }
            ],
            ordered: false,
            settings: [
              {
                setting_name: '1',
                setting_values: [
                  {
                    lang: 'en',
                    setting_synonym: ['1', 'Silent']
                  }
                ]
              },
              {
                setting_name: '2',
                setting_values: [
                  {
                    lang: 'en',
                    setting_synonym: ['2', 'Normal']
                  }
                ]
              },
              {
                setting_name: '3',
                setting_values: [
                  {
                    lang: 'en',
                    setting_synonym: ['3', 'Night']
                  }
                ]
              }
            ]
          }
        ]
      });
    });

    test('get attributes fanFilterLifeTime', () => {
      const item = {
        members: [
          {
            name: 'FanFilterLifeTime',
            type: 'Number',
            metadata: {
              ga: {
                value: 'fanFilterLifeTime'
              }
            }
          }
        ]
      };
      expect(new Device(item).attributes).toStrictEqual({
        supportsFanSpeedPercent: true,
        sensorStatesSupported: [
          {
            descriptiveCapabilities: {
              availableStates: ['new', 'good', 'replace soon', 'replace now']
            },
            numericCapabilities: {
              rawValueUnit: 'PERCENTAGE'
            },
            name: 'FilterLifeTime'
          }
        ]
      });
    });

    test('get attributes fanPM25', () => {
      const item = {
        members: [
          {
            name: 'FanPM25',
            type: 'Number',
            metadata: {
              ga: {
                value: 'fanPM25'
              }
            }
          }
        ]
      };
      expect(new Device(item).attributes).toStrictEqual({
        supportsFanSpeedPercent: true,
        sensorStatesSupported: [
          {
            numericCapabilities: {
              rawValueUnit: 'MICROGRAMS_PER_CUBIC_METER'
            },
            name: 'PM2.5'
          }
        ]
      });
    });
  });

  describe('get state', () => {
    test('getState Dimmer', () => {
      expect(new Device({ type: 'Dimmer', state: '50' }).state).toStrictEqual({
        currentFanSpeedSetting: '50',
        on: true
      });
    });

    test('getState Group fanPower', () => {
      const item = {
        type: 'Group',
        metadata: {
          ga: {
            value: 'FAN'
          }
        },
        members: [
          {
            name: 'FanPower',
            type: 'Switch',
            metadata: {
              ga: {
                value: 'fanPower'
              }
            },
            state: 'ON'
          }
        ]
      };
      expect(new Device(item).state).toStrictEqual({
        on: true
      });
    });

    test('getState Group fanSpeed', () => {
      const item = {
        type: 'Group',
        metadata: {
          ga: {
            value: 'FAN'
          }
        },
        members: [
          {
            name: 'FanSpeed',
            type: 'Dimmer',
            metadata: {
              ga: {
                value: 'fanSpeed'
              }
            },
            state: '50'
          }
        ]
      };
      expect(new Device(item).state).toStrictEqual({
        currentFanSpeedSetting: '50',
        on: true
      });
    });

    test('getState Group fanMode', () => {
      const item = {
        type: 'Group',
        metadata: {
          ga: {
            value: 'FAN',
            config: {
              fanModeName: 'OperationMode,Modus',
              fanModeSettings: '1=Silent,2=Normal,3=Night'
            }
          }
        },
        members: [
          {
            name: 'FanMode',
            type: 'Number',
            metadata: {
              ga: {
                value: 'fanMode'
              }
            },
            state: '2'
          }
        ]
      };
      expect(new Device(item).state).toStrictEqual({
        currentModeSettings: {
          OperationMode: '2'
        }
      });
    });

    test('getState Group fanFilterLifeTime', () => {
      const item = {
        type: 'Group',
        metadata: {
          ga: {
            value: 'FAN'
          }
        },
        members: [
          {
            name: 'FanFilterLifeTime',
            type: 'Number',
            metadata: {
              ga: {
                value: 'fanFilterLifeTime'
              }
            },
            state: '70'
          }
        ]
      };
      expect(new Device(item).state).toStrictEqual({
        currentSensorStateData: [
          {
            name: 'FilterLifeTime',
            currentSensorState: 'good',
            rawValue: 70
          }
        ]
      });
    });

    test('getState Group fanPM25', () => {
      const item = {
        type: 'Group',
        metadata: {
          ga: {
            value: 'FAN'
          }
        },
        members: [
          {
            name: 'FanPM25',
            type: 'Number',
            metadata: {
              ga: {
                value: 'fanPM25'
              }
            },
            state: '20'
          }
        ]
      };
      expect(new Device(item).state).toStrictEqual({
        currentSensorStateData: [
          {
            name: 'PM2.5',
            rawValue: 20
          }
        ]
      });
    });
  });

  describe('getNotifcation', () => {
    test('getNotifcation fanFilterLifeTime', () => {
      const item = {
        type: 'Group',
        metadata: {
          ga: {
            value: 'FAN',
            config: {
              fanFilterLifeTimeNotification: '60'
            }
          }
        },
        members: [
          {
            name: 'FanFilterLifetime',
            type: 'Number',
            metadata: {
              ga: {
                value: 'fanFilterLifeTime'
              }
            },
            state: '50'
          }
        ]
      };
      expect(new Device(item).getNotification()).toStrictEqual({
        SensorState: {
          name: 'FilterLifeTime',
          currentSensorState: 'good',
          priority: 0
        }
      });
    });

    test('getNotifcation fanPM25', () => {
      const item = {
        type: 'Group',
        metadata: {
          ga: {
            value: 'FAN',
            config: {
              fanPM25Notification: '20'
            }
          }
        },
        members: [
          {
            name: 'FanPM25',
            type: 'Number',
            metadata: {
              ga: {
                value: 'FanPM25'
              }
            },
            state: '30'
          }
        ]
      };
      expect(new Device(item).getNotification()).toStrictEqual({
        SensorState: {
          name: 'PM2.5',
          currentSensorState: 30,
          priority: 0
        }
      });
    });
  });
});
