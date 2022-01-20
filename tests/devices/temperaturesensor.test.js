const Device = require('../../functions/devices/temperaturesensor.js');

describe('TemperatureSensor Device', () => {
  test('validDeviceType', () => {
    expect(
      new Device({
        metadata: {
          ga: {
            value: 'temperaturesensor'
          }
        }
      }).validDeviceType
    ).toBe(true);
  });

  test('validItemType', () => {
    expect(new Device({ type: 'Number' }).validItemType).toBe(true);
    expect(new Device({ type: 'Number:Temperature' }).validItemType).toBe(true);
    expect(new Device({ type: 'Dimmer' }).validItemType).toBe(false);
    expect(new Device({ type: 'Group', groupType: 'Dimmer' }).validItemType).toBe(false);
    expect(new Device({ type: 'Group', groupType: 'Number' }).validItemType).toBe(true);
  });

  describe('get attributes', () => {
    test('get attributes no config', () => {
      const item1 = {
        metadata: {
          ga: {
            value: 'temperaturesensor',
            config: {}
          }
        }
      };
      expect(new Device(item1).attributes).toStrictEqual({
        queryOnlyTemperatureControl: true,
        temperatureUnitForUX: 'C'
      });
    });

    test('get attributes useFahrenheit', () => {
      const item2 = {
        metadata: {
          ga: {
            value: 'temperaturesensor',
            config: {
              useFahrenheit: true
            }
          }
        }
      };
      expect(new Device(item2).attributes).toStrictEqual({
        queryOnlyTemperatureControl: true,
        temperatureUnitForUX: 'F'
      });
    });
  });

  test('get state', () => {
    expect(new Device({ state: '10' }).state).toStrictEqual({
      temperatureSetpointCelsius: 10,
      temperatureAmbientCelsius: 10
    });
    const item = {
      state: '10',
      metadata: {
        ga: {
          value: 'temperaturesensor',
          config: {
            useFahrenheit: true
          }
        }
      }
    };
    expect(new Device(item).state).toStrictEqual({
      temperatureSetpointCelsius: -12.2,
      temperatureAmbientCelsius: -12.2
    });
  });
});
