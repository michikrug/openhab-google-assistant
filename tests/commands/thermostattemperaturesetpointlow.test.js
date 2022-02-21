const Command = require('../../functions/commands/thermostattemperaturesetpointlow.js');

describe('ThermostatTemperatureSetpointLow Command', () => {
  const params = { thermostatTemperatureSetpointLow: 20 };

  test('hasValidParams', () => {
    expect(new Command().hasValidParams).toBe(false);
    expect(new Command(params).hasValidParams).toBe(true);
  });

  test('requiresItem', () => {
    expect(new Command().requiresItem).toBe(true);
  });

  test('getItemName', () => {
    expect(() => {
      new Command({}, { id: 'Item' }).itemName;
    }).toThrow();
    const device = {
      id: 'Item',
      customData: {
        members: {
          thermostatTemperatureSetpointLow: 'SetpointItem'
        }
      }
    };
    expect(new Command({}, device).itemName).toBe('SetpointItem');
  });

  test('convertParamsToValue', () => {
    const item = {
      metadata: {
        ga: {
          config: {
            useFahrenheit: true
          }
        }
      }
    };
    expect(new Command(params).convertParamsToValue(item)).toBe('68');
    expect(new Command(params).convertParamsToValue({})).toBe('20');
  });

  test('getResponseStates', () => {
    const item = {
      members: [
        {
          metadata: {
            ga: {
              value: 'thermostatTemperatureSetpointLow'
            }
          }
        }
      ]
    };
    expect(new Command(params).getResponseStates(item)).toStrictEqual({ thermostatTemperatureSetpointLow: 20 });
  });
});
