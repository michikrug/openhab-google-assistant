const Command = require('../../functions/commands/armdisarm.js');
const SecuritySystem = require('../../functions/devices/securitysystem.js');

describe('ArmDisarm Command', () => {
  test('hasValidParams', () => {
    expect(new Command().hasValidParams).toBe(false);
    expect(new Command({ arm: true }).hasValidParams).toBe(true);
    expect(new Command({ arm: 'true' }).hasValidParams).toBe(false);
  });

  describe('convertParamsToValue', () => {
    test('convertParamsToValue', () => {
      expect(new Command({ arm: true }).convertParamsToValue()).toBe('ON');
      expect(new Command({ arm: false }).convertParamsToValue()).toBe('OFF');
      expect(
        new Command(
          { arm: true, armLevel: 'L1' },
          { id: 'Item', customData: { deviceType: 'SecuritySystem' } }
        ).convertParamsToValue()
      ).toBe('L1');
    });

    test('convertParamsToValue inverted', () => {
      expect(new Command({ arm: true }, { id: 'Item', customData: { inverted: true } }).convertParamsToValue()).toBe(
        'OFF'
      );
      expect(new Command({ arm: false }, { id: 'Item', customData: { inverted: true } }).convertParamsToValue()).toBe(
        'ON'
      );
    });
  });

  test('getResponseStates', () => {
    expect(new Command({ arm: true }).getResponseStates()).toStrictEqual({ isArmed: true });
    expect(new Command({ arm: true, armLevel: 'L1' }).getResponseStates()).toStrictEqual({
      isArmed: true,
      currentArmLevel: 'L1'
    });
  });

  describe('getItemName', () => {
    test('getItemName SimpleSecuritySystem', () => {
      const device = {
        id: 'SwitchItem'
      };
      expect(new Command({}, device).itemName).toStrictEqual('SwitchItem');
    });

    describe('getItemName SecuritySystem', () => {
      const itemNameArmed = 'itemNameArmed';
      const itemNameArmLevel = 'itemNameArmLevel';

      test('getItemName SecuritySystem normal', () => {
        const device = {
          id: 'Item',
          customData: {
            deviceType: 'SecuritySystem',
            members: {}
          }
        };
        device.customData.members[SecuritySystem.armedMemberName] = itemNameArmed;
        device.customData.members[SecuritySystem.armLevelMemberName] = itemNameArmLevel;
        expect(new Command({ arm: true }, device).itemName).toStrictEqual(itemNameArmed);
        expect(new Command({ arm: true, armLevel: 'L1' }, device).itemName).toStrictEqual(itemNameArmLevel);
      });

      test('getItemName SecuritySystem missing armed member', () => {
        const device = {
          id: 'Item',
          customData: {
            deviceType: 'SecuritySystem',
            members: {}
          }
        };
        device.customData.members[SecuritySystem.armLevelMemberName] = itemNameArmLevel;
        expect(() => {
          new Command({ arm: true }, device).itemName;
        }).toThrow();
      });

      test('getItemName SecuritySystem missing armLevel member', () => {
        const device = {
          id: 'Item',
          customData: {
            deviceType: 'SecuritySystem',
            members: {}
          }
        };
        device.customData.members[SecuritySystem.armedMemberName] = itemNameArmed;
        expect(() => {
          new Command({ arm: true, armLevel: 'L1' }, device).itemName;
        }).toThrow();
      });
    });
  });

  test('requiresItem', () => {
    expect(new Command().requiresItem).toBe(true);
  });

  test('requiresUpdateValidation', () => {
    expect(new Command().requiresUpdateValidation).toBe(true);
  });

  test('bypassPin', () => {
    expect(new Command({}, { id: 'Item', customData: {} }).bypassPin).toBe(false);
    expect(new Command({}, { id: 'Item', customData: { pinOnDisarmOnly: true } }).bypassPin).toBe(false);
    expect(new Command({ arm: true }, { id: 'Item', customData: { pinOnDisarmOnly: true } }).bypassPin).toBe(true);
    expect(new Command({ armLevel: 'L1' }, { id: 'Item', customData: { pinOnDisarmOnly: true } }).bypassPin).toBe(true);
  });

  describe('validateStateChange', () => {
    test('validateStateChange SimpleSecuritySystem', () => {
      expect.assertions(6);

      const item = { type: 'Switch', state: 'ON' };

      expect(new Command({ arm: false }).validateStateChange(item)).toBe(true);
      try {
        new Command({ arm: true }).validateStateChange(item);
      } catch (e) {
        expect(e.errorCode).toBe('alreadyArmed');
      }

      item.state = 'OFF';
      expect(new Command({ arm: true }).validateStateChange(item)).toBe(true);
      try {
        new Command({ arm: false }).validateStateChange(item);
      } catch (e) {
        expect(e.errorCode).toBe('alreadyDisarmed');
      }

      item.state = 'ON';
      expect(new Command({ arm: true }, { id: 'Item', customData: { inverted: true } }).validateStateChange(item)).toBe(
        true
      );
      item.state = 'OFF';
      try {
        new Command({ arm: true }, { id: 'Item', customData: { inverted: true } }).validateStateChange(item);
      } catch (e) {
        expect(e.errorCode).toBe('alreadyArmed');
      }
    });

    describe('validateStateChange SecuritySystem', () => {
      const item = {
        members: [
          {
            state: 'ON',
            type: 'Switch',
            metadata: { ga: { value: SecuritySystem.armedMemberName } }
          },
          {
            state: 'L0',
            type: 'String',
            metadata: { ga: { value: SecuritySystem.armLevelMemberName } }
          }
        ]
      };

      test('arming without level', () => {
        expect.assertions(2);
        item.members[0].state = 'ON';
        try {
          new Command({ arm: true }, { id: 'Item', customData: { deviceType: 'SecuritySystem' } }).validateStateChange(
            item
          );
        } catch (e) {
          expect(e.errorCode).toBe('alreadyArmed');
        }

        item.members[0].state = 'OFF';
        expect(
          new Command({ arm: true }, { id: 'Item', customData: { deviceType: 'SecuritySystem' } }).validateStateChange(
            item
          )
        ).toBe(true);
      });

      test('arming without level inverted', () => {
        expect.assertions(2);
        item.members[0].state = 'OFF';
        try {
          new Command(
            { arm: true },
            { id: 'Item', customData: { deviceType: 'SecuritySystem', inverted: true } }
          ).validateStateChange(item);
        } catch (e) {
          expect(e.errorCode).toBe('alreadyArmed');
        }

        item.members[0].state = 'ON';
        expect(
          new Command(
            { arm: true },
            { id: 'Item', customData: { deviceType: 'SecuritySystem', inverted: true } }
          ).validateStateChange(item)
        ).toBe(true);
      });

      test('arming with level', () => {
        expect.assertions(2);
        item.members[0].state = 'OFF';
        item.members[1].state = 'L1';
        expect(
          new Command(
            { arm: true, armLevel: 'L2' },
            { id: 'Item', customData: { deviceType: 'SecuritySystem' } }
          ).validateStateChange(item)
        ).toBe(true);

        item.members[0].state = 'ON';
        try {
          new Command(
            { arm: true, armLevel: 'L1' },
            { id: 'Item', customData: { deviceType: 'SecuritySystem' } }
          ).validateStateChange(item);
        } catch (e) {
          expect(e.errorCode).toBe('alreadyInState');
        }
      });

      test('disarming', () => {
        expect.assertions(2);
        item.members[0].state = 'ON';
        expect(
          new Command({ arm: false }, { id: 'Item', customData: { deviceType: 'SecuritySystem' } }).validateStateChange(
            item
          )
        ).toBe(true);

        item.members[0].state = 'OFF';
        try {
          new Command({ arm: false }, { id: 'Item', customData: { deviceType: 'SecuritySystem' } }).validateStateChange(
            item
          );
        } catch (e) {
          expect(e.errorCode).toBe('alreadyDisarmed');
        }
      });
    });
  });

  describe('validateUpdate', () => {
    test('validateUpdate SimpleSecuritySystem', () => {
      expect.assertions(6);
      const item = {
        state: 'ON'
      };
      expect(new Command({ arm: true }).validateUpdate(item)).toBeUndefined();
      try {
        new Command({ arm: false }).validateUpdate(item);
      } catch (e) {
        expect(e.errorCode).toBe('disarmFailure');
      }

      item.state = 'OFF';
      expect(new Command({ arm: false }).validateUpdate(item)).toBeUndefined();
      try {
        new Command({ arm: true }).validateUpdate(item);
      } catch (e) {
        expect(e.errorCode).toBe('armFailure');
      }

      item.state = 'ON';
      expect(
        new Command({ arm: false }, { id: 'Item', customData: { inverted: true } }).validateUpdate(item)
      ).toBeUndefined();
      try {
        new Command({ arm: true }, { id: 'Item', customData: { inverted: true } }).validateUpdate(item);
      } catch (e) {
        expect(e.errorCode).toBe('armFailure');
      }
    });

    describe('validateUpdate SecuritySystem', () => {
      const item = {
        name: 'itemName',
        members: [
          {
            type: 'Switch',
            metadata: { ga: { value: SecuritySystem.armedMemberName } }
          },
          {
            type: 'String',
            metadata: { ga: { value: SecuritySystem.armLevelMemberName } }
          }
        ]
      };

      test('arming without level', () => {
        expect.assertions(7);
        item.members[0].state = 'ON';
        expect(
          new Command({ arm: true }, { id: 'Item', customData: { deviceType: 'SecuritySystem' } }).validateUpdate(item)
        ).toBeUndefined();

        try {
          new Command({ arm: false }, { id: 'Item', customData: { deviceType: 'SecuritySystem' } }).validateUpdate(
            item
          );
        } catch (e) {
          expect(e.errorCode).toBe('disarmFailure');
        }

        item.members[0].state = 'OFF';
        expect(
          new Command({ arm: false }, { id: 'Item', customData: { deviceType: 'SecuritySystem' } }).validateUpdate(item)
        ).toBeUndefined();
        try {
          new Command({ arm: true }, { id: 'Item', customData: { deviceType: 'SecuritySystem' } }).validateUpdate(item);
        } catch (e) {
          expect(e.errorCode).toBe('armFailure');
        }

        item.members[0].state = 'ON';
        expect(
          new Command(
            { arm: false },
            { id: 'Item', customData: { deviceType: 'SecuritySystem', inverted: true } }
          ).validateUpdate(item)
        ).toBeUndefined();
        try {
          new Command(
            { arm: true },
            { id: 'Item', customData: { deviceType: 'SecuritySystem', inverted: true } }
          ).validateUpdate(item);
        } catch (e) {
          expect(e.errorCode).toBe('armFailure');
        }

        const item2 = {
          name: 'itemName',
          members: [
            { type: 'Switch', metadata: { ga: { value: SecuritySystem.armedMemberName } } },
            { type: 'String', metadata: { ga: { value: SecuritySystem.armLevelMemberName } } },
            { type: 'Switch', name: 'trouble', metadata: { ga: { value: 'securitySystemTrouble' } }, state: 'ON' },
            {
              type: 'String',
              name: 'errorCode',
              metadata: { ga: { value: 'securitySystemTroubleCode' } },
              state: 'ErrorCode123'
            }
          ]
        };
        expect(
          new Command({ arm: true }, { id: '123', customData: { deviceType: 'SecuritySystem' } }).validateUpdate(item2)
        ).toStrictEqual({
          ids: ['123'],
          states: {
            currentStatusReport: [
              {
                blocking: false,
                deviceTarget: 'itemName',
                priority: 0,
                statusCode: 'ErrorCode123'
              }
            ],
            isArmed: false,
            online: true
          },
          status: 'EXCEPTIONS'
        });
      });

      test('arming with level', () => {
        expect.assertions(3);
        item.members[0].state = 'ON';
        item.members[1].state = 'L1';
        expect(
          new Command(
            { arm: true, armLevel: 'L1' },
            { id: 'Item', customData: { deviceType: 'SecuritySystem' } }
          ).validateUpdate(item)
        ).toBeUndefined();

        item.members[0].state = 'OFF';
        try {
          new Command(
            { arm: true, armLevel: 'L1' },
            { id: 'Item', customData: { deviceType: 'SecuritySystem' } }
          ).validateUpdate(item);
        } catch (e) {
          expect(e.errorCode).toBe('armFailure');
        }

        item.members[0].state = 'OFF';
        try {
          new Command({ arm: true, armLevel: 'L3' }, { id: 'Item' }).validateUpdate(item);
        } catch (e) {
          expect(e.errorCode).toBe('armFailure');
        }
      });

      test('disarming', () => {
        expect.assertions(2);
        item.members[0].state = 'OFF';
        expect(
          new Command({ arm: false }, { id: 'Item', customData: { deviceType: 'SecuritySystem' } }).validateUpdate(item)
        ).toBeUndefined();

        item.members[0].state = 'ON';
        try {
          new Command({ arm: false }, { id: 'Item', customData: { deviceType: 'SecuritySystem' } }).validateUpdate(
            item
          );
        } catch (e) {
          expect(e.errorCode).toBe('disarmFailure');
        }
      });
    });
  });
});
