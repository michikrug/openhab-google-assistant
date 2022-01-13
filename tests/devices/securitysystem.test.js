const SecuritySystem = require('../../functions/devices/securitysystem.js');
const Device = require('../../functions/devices/securitysystem.js');

describe('SecuritySystem Device', () => {
  test('validDeviceType', () => {
    expect(
      new Device({
        metadata: {
          ga: {
            value: 'SECURITYSYSTEM'
          }
        }
      }).validDeviceType
    ).toBe(false);
    expect(
      new Device({
        type: 'Group',
        members: [
          {
            type: 'Switch',
            metadata: {
              ga: {
                value: SecuritySystem.armedMemberName
              }
            }
          }
        ],
        metadata: {
          ga: {
            value: 'SECURITYSYSTEM'
          }
        }
      }).validDeviceType
    ).toBe(true);
  });

  test('validItemType', () => {
    const item = {
      type: 'Group',
      members: [
        {
          type: 'Switch',
          metadata: {
            ga: {
              value: SecuritySystem.armedMemberName
            }
          }
        }
      ]
    };
    expect(new Device(item).validItemType).toBe(true);
    expect(new Device({ type: 'Switch' }).validItemType).toBe(false);
    expect(new Device({ type: 'String' }).validItemType).toBe(false);
    expect(new Device({ type: 'Group', groupType: 'Switch' }).validItemType).toBe(false);
    expect(new Device({ type: 'Group', groupType: 'String' }).validItemType).toBe(false);
  });

  test('get traits', () => {
    expect(new Device().traits).toStrictEqual([
      'action.devices.traits.ArmDisarm',
      'action.devices.traits.StatusReport'
    ]);
  });

  describe('get state', () => {
    test('getState without armLevel', () => {
      const item = {
        type: 'Group',
        members: [
          {
            type: 'Switch',
            metadata: {
              ga: {
                value: Device.armedMemberName
              }
            },
            state: 'ON'
          }
        ]
      };
      expect(new Device(item).state).toStrictEqual({
        currentStatusReport: [],
        isArmed: true
      });

      item.members[0].state = 'OFF';
      expect(new Device(item).state).toStrictEqual({
        currentStatusReport: [],
        isArmed: false
      });
    });

    test('getState without armed', () => {
      const item = {
        members: [
          {
            type: 'String',
            metadata: {
              ga: {
                value: Device.armLevelMemberName
              }
            },
            state: 'L1'
          }
        ]
      };
      expect(new Device(item).state).toStrictEqual({
        isArmed: false
      });

      item.members[0].state = 'OFF';
      expect(new Device(item).state).toStrictEqual({
        isArmed: false
      });
    });

    test('getState with armLevel', () => {
      const item = {
        members: [
          {
            type: 'Switch',
            metadata: {
              ga: {
                value: Device.armedMemberName
              }
            },
            state: 'ON'
          },
          {
            type: 'String',
            metadata: {
              ga: {
                value: Device.armLevelMemberName
              }
            },
            state: 'L1'
          }
        ]
      };
      expect(new Device(item).state).toStrictEqual({
        isArmed: true,
        currentArmLevel: 'L1',
        currentStatusReport: []
      });

      item.members[0].state = 'OFF';
      expect(new Device(item).state).toStrictEqual({
        isArmed: false,
        currentStatusReport: []
      });
    });

    test('getState inverted', () => {
      const item = {
        members: [
          {
            type: 'Switch',
            metadata: {
              ga: {
                value: Device.armedMemberName
              }
            },
            state: 'ON'
          }
        ],
        metadata: {
          ga: {
            config: {
              inverted: true
            }
          }
        }
      };

      expect(new Device(item).state).toStrictEqual({
        isArmed: false,
        currentStatusReport: []
      });
    });
  });

  describe('get attributes', () => {
    test('just a switch with no config', () => {
      const item = {
        metadata: {
          ga: {
            config: {}
          }
        }
      };
      const attributes = new Device(item).attributes;
      expect(attributes).toStrictEqual({});
    });

    test('no arm levels defined', () => {
      const item = {
        metadata: {
          ga: {
            config: {
              lang: 'de',
              ordered: true
            }
          }
        }
      };
      const attributes = new Device(item).attributes;
      expect(attributes).toStrictEqual({});
    });

    test('armLevels, 1 level with lang and ordered set', () => {
      const item = {
        metadata: {
          ga: {
            config: {
              armLevels: 'L1=Stay',
              lang: 'de',
              ordered: true
            }
          }
        }
      };
      const attributes = new Device(item).attributes;
      expect(attributes.availableArmLevels).toBeDefined();
      expect(attributes.availableArmLevels.ordered).toBe(true);
      expect(attributes.availableArmLevels.levels).toStrictEqual([
        {
          level_name: 'L1',
          level_values: [
            {
              level_synonym: ['Stay'],
              lang: 'de'
            }
          ]
        }
      ]);
    });

    test('armLevels, 1 level with default ordered value', () => {
      const item = {
        metadata: {
          ga: {
            config: {
              armLevels: 'L1=Stay',
              lang: 'en'
            }
          }
        }
      };
      const attributes = new Device(item).attributes;
      expect(attributes.availableArmLevels).toBeDefined();
      expect(attributes.availableArmLevels.ordered).toBe(false);
    });

    test('armLevels, 1 level with default lang', () => {
      const item = {
        metadata: {
          ga: {
            config: {
              armLevels: 'L1=Stay'
            }
          }
        }
      };
      const attributes = new Device(item).attributes;
      expect(attributes.availableArmLevels.levels).toStrictEqual([
        {
          level_name: 'L1',
          level_values: [
            {
              level_synonym: ['Stay'],
              lang: 'en'
            }
          ]
        }
      ]);
    });

    test('armLevels, multiple levels', () => {
      const item = {
        metadata: {
          ga: {
            config: {
              armLevels: 'L1=Stay,L2=Night,L3=Away',
              lang: 'en',
              ordered: true
            }
          }
        }
      };
      const attributes = new Device(item).attributes;
      expect(attributes.availableArmLevels).toBeDefined();
      expect(attributes.availableArmLevels.ordered).toBe(true);
      expect(attributes.availableArmLevels.levels).toStrictEqual([
        {
          level_name: 'L1',
          level_values: [
            {
              level_synonym: ['Stay'],
              lang: 'en'
            }
          ]
        },
        {
          level_name: 'L2',
          level_values: [
            {
              level_synonym: ['Night'],
              lang: 'en'
            }
          ]
        },
        {
          level_name: 'L3',
          level_values: [
            {
              level_synonym: ['Away'],
              lang: 'en'
            }
          ]
        }
      ]);
    });
  });

  describe('getMembers', () => {
    const memberArmed = 'securitySystemArmed';
    const memberArmLevel = 'securitySystemArmLevel';
    const memberZone = 'securitySystemZone';
    const memberTrouble = 'securitySystemTrouble';
    const memberErrorCode = 'securitySystemTroubleCode';

    test('member without ga metadata', () => {
      const item = {
        members: [
          {
            name: 'armed',
            type: 'Switch',
            metadata: {
              ga: {
                value: memberArmed
              }
            },
            state: 'ON'
          },
          {
            name: 'someOtherMember',
            state: 'L1'
          }
        ]
      };
      const members = new Device(item).members;
      let expectedMembers = {};
      expectedMembers[memberArmed] = { name: 'armed', state: 'ON', config: {} };
      expect(members).toStrictEqual(expectedMembers);
    });

    test('member with ga metadata but not an alarm item', () => {
      const item = {
        members: [
          {
            name: 'armed',
            metadata: {
              ga: {
                value: 'someOtherMember'
              }
            },
            state: 'ON'
          }
        ]
      };
      const members = new Device(item).members;
      let expectedMembers = {};
      expect(members).toStrictEqual(expectedMembers);
    });

    test('all possible members defined with no extra config', () => {
      const item = {
        members: [
          {
            name: 'armed',
            type: 'Switch',
            metadata: {
              ga: {
                value: memberArmed
              }
            },
            state: 'ON'
          },
          {
            name: 'armLevel',
            type: 'String',
            metadata: {
              ga: {
                value: memberArmLevel
              }
            },
            state: 'L1'
          },
          {
            name: 'trouble',
            type: 'Switch',
            metadata: {
              ga: {
                value: memberTrouble
              }
            },
            state: 'OFF'
          },
          {
            name: 'errorCode',
            type: 'String',
            metadata: {
              ga: {
                value: memberErrorCode
              }
            },
            state: 'ErrorCode123'
          },
          {
            name: 'zone1',
            type: 'Contact',
            metadata: {
              ga: {
                value: memberZone
              }
            },
            state: 'OPEN'
          }
        ]
      };
      const members = new Device(item).members;
      let expectedMembers = {};
      expectedMembers[memberArmed] = { name: 'armed', state: 'ON', config: {} };
      expectedMembers[memberArmLevel] = { name: 'armLevel', state: 'L1', config: {} };
      expectedMembers[memberTrouble] = { name: 'trouble', state: 'OFF', config: {} };
      expectedMembers[memberErrorCode] = { name: 'errorCode', state: 'ErrorCode123', config: {} };
      expectedMembers.zones = [{ name: 'zone1', state: 'OPEN', config: {} }];
      expect(members).toStrictEqual(expectedMembers);
    });

    test('bare minimum members', () => {
      const item = {
        members: [
          {
            name: 'armed',
            type: 'Switch',
            metadata: {
              ga: {
                value: memberArmed
              }
            },
            state: 'ON'
          }
        ]
      };
      const members = new Device(item).members;
      let expectedMembers = {};
      expectedMembers[memberArmed] = { name: 'armed', state: 'ON', config: {} };
      expect(members).toStrictEqual(expectedMembers);
    });

    test('zones with extra config', () => {
      const item = {
        members: [
          {
            name: 'zone1',
            type: 'Contact',
            metadata: {
              ga: {
                value: memberZone,
                config: { zoneType: 'OpenClose' }
              }
            },
            state: 'OPEN'
          }
        ]
      };
      const members = new Device(item).members;
      let expectedMembers = {};
      expectedMembers.zones = [{ name: 'zone1', state: 'OPEN', config: { zoneType: 'OpenClose' } }];
      expect(members).toStrictEqual(expectedMembers);
    });
  });

  describe('getStatusReport', () => {
    const memberZone = 'securitySystemZone';
    const memberTrouble = 'securitySystemTrouble';
    const memberErrorCode = 'securitySystemTroubleCode';

    test('trouble', () => {
      const item = {
        name: 'alarm',
        members: [
          {
            name: 'trouble',
            type: 'Switch',
            metadata: {
              ga: {
                value: memberTrouble
              }
            },
            state: 'ON'
          },
          {
            name: 'errorCode',
            type: 'String',
            metadata: {
              ga: {
                value: memberErrorCode
              }
            },
            state: 'ErrorCode123'
          }
        ]
      };
      expect(new Device(item).getStatusReport()).toStrictEqual([
        {
          blocking: false,
          deviceTarget: 'alarm',
          priority: 0,
          statusCode: 'ErrorCode123'
        }
      ]);
    });

    test('zones', () => {
      const item = {
        name: 'alarm',
        members: [
          {
            name: 'zone1',
            type: 'Contact',
            metadata: {
              ga: {
                value: memberZone,
                config: {
                  zoneType: 'OpenClose',
                  blocking: true
                }
              }
            },
            state: 'OPEN'
          },
          {
            name: 'zone2',
            type: 'Contact',
            metadata: {
              ga: {
                value: memberZone,
                config: {
                  zoneType: 'Motion',
                  blocking: false
                }
              }
            },
            state: 'OPEN'
          },
          {
            name: 'zone3',
            type: 'Contact',
            metadata: {
              ga: {
                value: memberZone,
                config: {
                  zoneType: 'OpenClose',
                  blocking: true
                }
              }
            },
            state: 'CLOSED'
          }
        ]
      };

      expect(new Device(item).getStatusReport()).toStrictEqual([
        {
          blocking: true,
          deviceTarget: 'zone1',
          priority: 1,
          statusCode: 'deviceOpen'
        },
        {
          blocking: false,
          deviceTarget: 'zone2',
          priority: 1,
          statusCode: 'motionDetected'
        }
      ]);
    });
  });
});
