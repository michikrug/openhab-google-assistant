const Device = require('../../functions/devices/doorbell.js');

describe('Doorbell Device', () => {
  test('matchesDeviceType', () => {
    expect(
      Device.matchesDeviceType({
        metadata: {
          ga: {
            value: 'DOORBELL'
          }
        }
      })
    ).toBe(true);
  });

  test('matchesItemType', () => {
    expect(Device.matchesItemType({ type: 'String' })).toBe(false);
    expect(Device.matchesItemType({ type: 'Switch' })).toBe(true);
    expect(Device.matchesItemType({ type: 'Group', groupType: 'String' })).toBe(false);
    expect(Device.matchesItemType({ type: 'Group', groupType: 'Switch' })).toBe(true);
  });

  test('getState', () => {
    expect(Device.getState({})).toStrictEqual({});
  });

  test('getNotification', () => {
    expect(Device.getNotification({})).toStrictEqual({});
    expect(Device.getNotification({ state: 'ON' }).ObjectDetection).not.toBeUndefined();
    expect(
      Device.getNotification({ state: 'OFF', metadata: { ga: { config: { inverted: true } } } }).ObjectDetection
    ).not.toBeUndefined();
  });
});
