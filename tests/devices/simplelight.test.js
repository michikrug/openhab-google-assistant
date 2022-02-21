const Device = require('../../functions/devices/simplelight.js');

describe('SimpleLight Device', () => {
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
});
