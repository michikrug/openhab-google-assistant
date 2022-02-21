const Device = require('../../functions/devices/switch.js');

describe('Switch Device', () => {
  test('validDeviceType', () => {
    expect(
      new Device({
        metadata: {
          ga: {
            value: 'SWITCH'
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

  test('get state', () => {
    expect(new Device({ state: 'ON' }).state).toStrictEqual({ on: true });
    expect(new Device({ state: 'OFF' }).state).toStrictEqual({ on: false });
  });

  test('getState inverted', () => {
    const item = {
      state: 'ON',
      metadata: {
        ga: {
          value: 'SWITCH',
          config: {
            inverted: true
          }
        }
      }
    };
    expect(new Device(item).state).toStrictEqual({ on: false });

    item.state = 'OFF';
    expect(new Device(item).state).toStrictEqual({ on: true });
  });
});
