const Device = require('../../functions/devices/valve.js');

describe('Valve Device', () => {
  test('validDeviceType', () => {
    expect(
       new Device({
        metadata: {
          ga: {
            value: 'VALVE'
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
        openPercent: 100
      });
      expect(new Device({ state: 'OFF' }).state).toStrictEqual({
        openPercent: 0
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
        openPercent: 0
      });
      item.state = 'OFF';
      expect(new Device(item).state).toStrictEqual({
        openPercent: 100
      });
    });
  });
});
