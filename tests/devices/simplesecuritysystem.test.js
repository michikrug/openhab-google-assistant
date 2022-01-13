const Device = require('../../functions/devices/simplesecuritysystem.js');

describe('SimpleSecuritySystem Device', () => {
  test('validDeviceType', () => {
    expect(
      new Device({
        metadata: {
          ga: {
            value: 'SECURITYSYSTEM'
          }
        }
      }).validDeviceType
    ).toBe(true);
  });

  test('validItemType', () => {
    expect(new Device({ type: 'Switch' }).validItemType).toBe(true);
    expect(new Device({ type: 'String' }).validItemType).toBe(false);
    expect(new Device({ type: 'Group', groupType: 'Switch' }).validItemType).toBe(true);
    expect(new Device({ type: 'Group', groupType: 'String' }).validItemType).toBe(false);
  });

  describe('get state', () => {
    test('get state', () => {
      expect(new Device({ state: 'ON' }).state).toStrictEqual({
        isArmed: true
      });
      expect(new Device({ state: 'OFF' }).state).toStrictEqual({
        isArmed: false
      });
    });

    test('getState inverted', () => {
      const item = {
        state: 'ON',
        metadata: {
          ga: {
            config: {
              inverted: true
            }
          }
        }
      };
      expect(new Device(item).state).toStrictEqual({
        isArmed: false
      });
    });
  });
});
