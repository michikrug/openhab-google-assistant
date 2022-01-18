const Device = require('../../functions/devices/dimmablelight.js');

describe('DimmableLight Device', () => {
  test('validDeviceType', () => {
    expect(
      new Device({
        metadata: {
          ga: {
            value: 'LIGHT'
          }
        }
      }).validDeviceType
    ).toBe(true);
  });

  test('validItemType', () => {
    expect(new Device({ type: 'Dimmer' }).validItemType).toBe(true);
    expect(new Device({ type: 'String' }).validItemType).toBe(false);
    expect(new Device({ type: 'Group', groupType: 'Dimmer' }).validItemType).toBe(true);
    expect(new Device({ type: 'Group', groupType: 'String' }).validItemType).toBe(false);
  });

  test('get state', () => {
    expect(new Device({ state: '50' }).state).toStrictEqual({
      on: true,
      brightness: 50
    });
    expect(new Device({ state: 'NULL' }).state).toStrictEqual({
      on: false,
      brightness: 0
    });
  });
});
