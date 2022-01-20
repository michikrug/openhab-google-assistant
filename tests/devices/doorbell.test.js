const Device = require('../../functions/devices/doorbell.js');

describe('Doorbell Device', () => {
  test('validDeviceType', () => {
    expect(
      new Device({
        metadata: {
          ga: {
            value: 'DOORBELL'
          }
        }
      }).validDeviceType
    ).toBe(true);
  });

  test('validItemType', () => {
    expect(new Device({ type: 'String' }).validItemType).toBe(false);
    expect(new Device({ type: 'Switch' }).validItemType).toBe(true);
    expect(new Device({ type: 'Group', groupType: 'String' }).validItemType).toBe(false);
    expect(new Device({ type: 'Group', groupType: 'Switch' }).validItemType).toBe(true);
  });

  test('get state', () => {
    expect(new Device({}).state).toStrictEqual({});
  });

  test('getNotification', () => {
    expect(new Device({}).getNotification()).toStrictEqual({});
    expect(new Device({ state: 'ON' }).getNotification().ObjectDetection).not.toBeUndefined();
    expect(
      new Device({
        state: 'OFF',
        metadata: { ga: { value: 'DOORBELL', config: { inverted: true } } }
      }).getNotification().ObjectDetection
    ).not.toBeUndefined();
  });
});
