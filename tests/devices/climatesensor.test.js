const Device = require('../../functions/devices/climatesensor.js');

describe('ClimateSensor Device', () => {
  test('matchesDeviceType', () => {
    expect(
      Device.matchesDeviceType({
        metadata: {
          ga: {
            value: 'climatesensor'
          }
        }
      })
    ).toBe(false);
    expect(
      Device.matchesDeviceType({
        metadata: {
          ga: {
            value: 'climatesensor'
          }
        },
        members: [
          {
            type: 'Number',
            metadata: {
              ga: {
                value: 'thermostatTemperatureAmbient'
              }
            }
          }
        ]
      })
    ).toBe(true);
  });

  test('matchesItemType', () => {
    expect(Device.matchesItemType({ type: 'Number' })).toBe(false);
    expect(Device.matchesItemType({ type: 'Number:Temperature' })).toBe(false);
    expect(Device.matchesItemType({ type: 'Dimmer' })).toBe(false);
    expect(Device.matchesItemType({ type: 'Group', groupType: 'Number' })).toBe(false);
    expect(Device.matchesItemType({ type: 'Group' })).toBe(true);
  });

  describe('getAttributes', () => {
    test('getAttributes no config', () => {
      const item1 = {
        metadata: {
          ga: {
            config: {}
          }
        }
      };
      expect(Device.getAttributes(item1)).toStrictEqual({
        queryOnlyTemperatureSetting: true,
        thermostatTemperatureUnit: 'C'
      });
    });

    test('getAttributes useFahrenheit', () => {
      const item2 = {
        metadata: {
          ga: {
            config: {
              useFahrenheit: true
            }
          }
        }
      };
      expect(Device.getAttributes(item2)).toStrictEqual({
        queryOnlyTemperatureSetting: true,
        thermostatTemperatureUnit: 'F'
      });
    });
  });

  test('getState', () => {
    const item1 = {
      members: [
        {
          name: 'Temperature',
          state: '20',
          type: 'Number',
          metadata: {
            ga: {
              value: 'thermostatTemperatureAmbient'
            }
          }
        },
        {
          name: 'Humidity',
          state: '60',
          type: 'Number',
          metadata: {
            ga: {
              value: 'thermostatHumidityAmbient'
            }
          }
        }
      ]
    };
    expect(Device.getState(item1)).toStrictEqual({
      thermostatTemperatureAmbient: 20,
      thermostatHumidityAmbient: 60
    });
    const item2 = {
      members: [
        {
          name: 'Temperature',
          state: '10',
          type: 'Number',
          metadata: {
            ga: {
              value: 'thermostatTemperatureAmbient'
            }
          }
        }
      ],
      metadata: {
        ga: {
          config: {
            useFahrenheit: true
          }
        }
      }
    };
    expect(Device.getState(item2)).toStrictEqual({
      thermostatTemperatureAmbient: -12.2
    });
  });
});
