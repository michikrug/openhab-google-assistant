const Device = require('../../functions/devices/modeslight.js');

describe('ModesLight Device', () => {
  test('validDeviceType', () => {
    expect(new Device({ type: 'Group' }).validDeviceType).toBe(false);
    expect(
      new Device({
        type: 'Switch',
        metadata: {
          ga: {
            value: 'light',
            config: {}
          }
        }
      }).validDeviceType
    ).toBe(false);
    expect(
      new Device({
        type: 'Switch',
        metadata: {
          ga: {
            value: 'light',
            config: {
              mode: 'testMode',
              settings: '1=test'
            }
          }
        }
      }).validDeviceType
    ).toBe(true);
  });
});
