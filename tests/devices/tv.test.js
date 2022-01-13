const Device = require('../../functions/devices/tv.js');

describe('TV Device', () => {
  test('validDeviceType', () => {
    expect(
       new Device({
        metadata: {
          ga: {
            value: 'TV'
          }
        }
      }).validDeviceType
    ).toBe(false);
    expect(
       new Device({
        metadata: {
          ga: {
            value: 'TV'
          }
        },
        members: [
          {
            type: 'Switch',
            metadata: {
              ga: {
                value: 'tvPower'
              }
            }
          }
        ]
      }).validDeviceType
    ).toBe(true);
  });

  test('validItemType', () => {
    expect(new Device({ type: 'Switch' }).validItemType).toBe(false);
    expect(new Device({ type: 'Group' }).validItemType).toBe(true);
  });

  describe('get traits', () => {
    test('get traits only power', () => {
      const item = {
        members: [
          {
            state: 'ON',
            type: 'Switch',
            metadata: {
              ga: {
                value: 'tvPower'
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
            state: '1',
            type: 'Number',
            metadata: {
              ga: {
                value: 'tvChannel'
              }
            }
          },
          {
            state: '50',
            type: 'Dimmer',
            metadata: {
              ga: {
                value: 'tvVolume'
              }
            }
          },
          {
            state: 'input1',
            type: 'String',
            metadata: {
              ga: {
                value: 'tvInput'
              }
            }
          },
          {
            state: 'PLAY',
            type: 'Player',
            metadata: {
              ga: {
                value: 'tvTransport'
              }
            }
          },
          {
            state: 'ON',
            type: 'Switch',
            metadata: {
              ga: {
                value: 'tvPower'
              }
            }
          },
          {
            state: 'OFF',
            type: 'Switch',
            metadata: {
              ga: {
                value: 'tvMute'
              }
            }
          },
          {
            state: 'youtube',
            type: 'String',
            metadata: {
              ga: {
                value: 'tvApplication'
              }
            }
          }
        ]
      };
      expect(new Device(item).traits).toStrictEqual([
        'action.devices.traits.OnOff',
        'action.devices.traits.Volume',
        'action.devices.traits.Channel',
        'action.devices.traits.InputSelector',
        'action.devices.traits.TransportControl',
        'action.devices.traits.AppSelector'
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
        },
        members: [
          {
            type: 'Dimmer',
            metadata: {
              ga: {
                value: 'tvVolume'
              }
            }
          },
          {
            type: 'Player',
            metadata: {
              ga: {
                value: 'tvTransport'
              }
            }
          }
        ]
      };
      expect(new Device(item).attributes).toStrictEqual({
        transportControlSupportedCommands: ['NEXT', 'PREVIOUS', 'PAUSE', 'RESUME'],
        volumeCanMuteAndUnmute: false,
        volumeMaxLevel: 100
      });
    });

    test('get attributes volume', () => {
      const item = {
        metadata: {
          ga: {
            config: {
              volumeDefaultPercentage: '20',
              volumeMaxLevel: '80',
              levelStepSize: '10'
            }
          }
        },
        members: [
          {
            type: 'Number',
            metadata: {
              ga: {
                value: 'tvVolume'
              }
            }
          }
        ]
      };
      expect(new Device(item).attributes).toStrictEqual({
        levelStepSize: 10,
        volumeCanMuteAndUnmute: false,
        volumeDefaultPercentage: 20,
        volumeMaxLevel: 80
      });
    });

    test('get attributes transport, mute', () => {
      const item = {
        metadata: {
          ga: {
            config: {
              transportControlSupportedCommands: 'PAUSE,RESUME'
            }
          }
        },
        members: [
          {
            type: 'Player',
            metadata: {
              ga: {
                value: 'tvTransport'
              }
            }
          },
          {
            type: 'Switch',
            metadata: {
              ga: {
                value: 'tvMute'
              }
            }
          }
        ]
      };
      expect(new Device(item).attributes).toStrictEqual({
        transportControlSupportedCommands: ['PAUSE', 'RESUME'],
        volumeCanMuteAndUnmute: true
      });
    });

    test('get attributes inputs', () => {
      const item = {
        metadata: {
          ga: {
            config: {
              availableInputs: 'input1=hdmi1,input2=hdmi2'
            }
          }
        },
        members: [
          {
            type: 'String',
            metadata: {
              ga: {
                value: 'tvInput'
              }
            }
          }
        ]
      };
      expect(new Device(item).attributes).toStrictEqual({
        availableInputs: [
          {
            key: 'input1',
            names: [
              {
                lang: 'en',
                name_synonym: ['hdmi1']
              }
            ]
          },
          {
            key: 'input2',
            names: [
              {
                lang: 'en',
                name_synonym: ['hdmi2']
              }
            ]
          }
        ],
        orderedInputs: false,
        volumeCanMuteAndUnmute: false
      });
    });

    test('get attributes channels', () => {
      const item = {
        metadata: {
          ga: {
            config: {
              availableChannels: '1=channel1=ARD,2=channel2=ZDF'
            }
          }
        },
        members: [
          {
            type: 'Number',
            metadata: {
              ga: {
                value: 'tvChannel'
              }
            }
          }
        ]
      };
      expect(new Device(item).attributes).toStrictEqual({
        availableChannels: [
          {
            key: 'channel1',
            names: ['ARD'],
            number: '1'
          },
          {
            key: 'channel2',
            names: ['ZDF'],
            number: '2'
          }
        ],
        volumeCanMuteAndUnmute: false
      });
    });
  });

  test('get attributes applications', () => {
    const item = {
      metadata: {
        ga: {
          config: {
            availableApplications: 'youtube=YouTube,netflix=Netflix'
          }
        }
      },
      members: [
        {
          type: 'String',
          metadata: {
            ga: {
              value: 'tvApplication'
            }
          }
        }
      ]
    };
    expect(new Device(item).attributes).toStrictEqual({
      availableApplications: [
        {
          key: 'youtube',
          names: [
            {
              lang: 'en',
              name_synonym: ['YouTube']
            }
          ]
        },
        {
          key: 'netflix',
          names: [
            {
              lang: 'en',
              name_synonym: ['Netflix']
            }
          ]
        }
      ],
      volumeCanMuteAndUnmute: false
    });
  });

  test('get members', () => {
    expect(new Device({ members: [{}] }).members).toStrictEqual({});
    expect(new Device({ members: [{ metadata: { ga: { value: 'invalid' } } }] }).members).toStrictEqual({});
    const item = {
      members: [
        {
          name: 'Channel',
          state: '1',
          type: 'Number',
          metadata: {
            ga: {
              value: 'tvChannel'
            }
          }
        },
        {
          name: 'Volume',
          state: '50',
          type: 'Dimmer',
          metadata: {
            ga: {
              value: 'tvVolume'
            }
          }
        },
        {
          name: 'Input',
          state: 'input1',
          type: 'String',
          metadata: {
            ga: {
              value: 'tvInput'
            }
          }
        },
        {
          name: 'Transport',
          state: 'PLAY',
          type: 'Player',
          metadata: {
            ga: {
              value: 'tvTransport'
            }
          }
        },
        {
          name: 'Power',
          state: 'ON',
          type: 'Switch',
          metadata: {
            ga: {
              value: 'tvPower'
            }
          }
        },
        {
          name: 'Mute',
          state: 'OFF',
          type: 'Switch',
          metadata: {
            ga: {
              value: 'tvMute'
            }
          }
        },
        {
          name: 'Application',
          state: 'youtube',
          type: 'String',
          metadata: {
            ga: {
              value: 'tvApplication'
            }
          }
        }
      ]
    };
    expect(new Device(item).members).toStrictEqual({
      tvChannel: {
        name: 'Channel',
        state: '1'
      },
      tvInput: {
        name: 'Input',
        state: 'input1'
      },
      tvMute: {
        name: 'Mute',
        state: 'OFF'
      },
      tvPower: {
        name: 'Power',
        state: 'ON'
      },
      tvTransport: {
        name: 'Transport',
        state: 'PLAY'
      },
      tvVolume: {
        name: 'Volume',
        state: '50'
      },
      tvApplication: {
        name: 'Application',
        state: 'youtube'
      }
    });
  });

  test('get channelMap', () => {
    const item = {
      metadata: {
        ga: {
          config: {
            availableChannels: '20=channel1=Channel 1:Kanal 1,10=channel2=Channel 2:Kanal 2'
          }
        }
      }
    };
    expect(new Device(item).channelMap).toStrictEqual({
      10: ['Channel 2', 'Kanal 2', 'channel2'],
      20: ['Channel 1', 'Kanal 1', 'channel1']
    });
  });

  test('get applicationMap', () => {
    const item = {
      metadata: {
        ga: {
          config: {
            availableApplications: 'youtube=YouTube:Tube,netflix=Net Flix:Flix'
          }
        }
      }
    };
    expect(new Device(item).applicationMap).toStrictEqual({
      youtube: ['YouTube', 'Tube', 'youtube'],
      netflix: ['Net Flix', 'Flix', 'netflix']
    });
  });

  describe('get state', () => {
    test('get state', () => {
      const item = {
        type: 'Group',
        metadata: {
          ga: {
            value: 'TV',
            config: {
              transportControlSupportedCommands: 'PAUSE,RESUME',
              availableInputs: 'input1=hdmi1,input2=hdmi2',
              availableChannels: '1=channel1=ARD,2=channel2=ZDF',
              availableApplications: 'youtube=YouTube'
            }
          }
        },
        members: [
          {
            state: '1',
            type: 'Number',
            metadata: {
              ga: {
                value: 'tvChannel'
              }
            }
          },
          {
            state: '50',
            type: 'Dimmer',
            metadata: {
              ga: {
                value: 'tvVolume'
              }
            }
          },
          {
            state: 'input1',
            type: 'String',
            metadata: {
              ga: {
                value: 'tvInput'
              }
            }
          },
          {
            state: 'PLAY',
            type: 'Player',
            metadata: {
              ga: {
                value: 'tvTransport'
              }
            }
          },
          {
            state: 'ON',
            type: 'Switch',
            metadata: {
              ga: {
                value: 'tvPower'
              }
            }
          },
          {
            state: 'OFF',
            type: 'Switch',
            metadata: {
              ga: {
                value: 'tvMute'
              }
            }
          },
          {
            state: 'youtube',
            type: 'String',
            metadata: {
              ga: {
                value: 'tvApplication'
              }
            }
          }
        ]
      };
      expect(new Device(item).state).toStrictEqual({
        channelName: 'ARD',
        channelNumber: '1',
        currentInput: 'input1',
        currentApplication: 'youtube',
        currentVolume: 50,
        isMuted: false,
        on: true
      });
    });

    test('getState only channel without map', () => {
      const item = {
        type: 'Group',
        members: [
          {
            state: '1',
            type: 'Number',
            metadata: {
              ga: {
                value: 'tvChannel'
              }
            }
          }
        ]
      };
      expect(new Device(item).state).toStrictEqual({
        channelNumber: '1'
      });
    });

    test('getState only power, mute', () => {
      const item = {
        type: 'Group',
        metadata: {
          ga: {
            value: 'TV'
          }
        },
        members: [
          {
            state: '50',
            type: 'Number',
            metadata: {
              ga: {
                value: 'tvVolume'
              }
            }
          },
          {
            state: 'ON',
            type: 'Switch',
            metadata: {
              ga: {
                value: 'tvPower'
              }
            }
          }
        ]
      };
      expect(new Device(item).state).toStrictEqual({
        currentVolume: 50,
        on: true
      });
    });
  });
});
