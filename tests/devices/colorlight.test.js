const Device = require('../../functions/devices/colorlight.js');

describe('ColorLight Device', () => {
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
    expect(new Device({ type: 'Color' }).validItemType).toBe(true);
    expect(new Device({ type: 'Dimmer' }).validItemType).toBe(false);
    expect(new Device({ type: 'Group', groupType: 'Color' }).validItemType).toBe(true);
    expect(new Device({ type: 'Group', groupType: 'Dimmer' }).validItemType).toBe(false);
  });

  describe('get attributes', () => {
    test('get attributes colorTemperatureRange', () => {
      const item = {
        metadata: {
          ga: {
            value: 'LIGHT',
            config: {
              colorTemperatureRange: '1000,2000'
            }
          }
        }
      };
      expect(new Device(item).attributes).toStrictEqual({
        colorModel: 'hsv',
        colorTemperatureRange: {
          temperatureMinK: 1000,
          temperatureMaxK: 2000
        }
      });
    });

    test('get attributes invalid colorTemperatureRange', () => {
      const item = {
        metadata: {
          ga: {
            value: 'LIGHT',
            config: {
              colorTemperatureRange: 'a,b'
            }
          }
        }
      };
      expect(new Device(item).attributes).toStrictEqual({
        colorModel: 'hsv'
      });
    });
  });

  test('get state', () => {
    expect(new Device({ state: '100,50,10' }).state).toStrictEqual({
      on: true,
      brightness: 10,
      color: {
        spectrumHSV: {
          hue: 100,
          saturation: 0.5,
          value: 0.1
        }
      }
    });
  });
});
