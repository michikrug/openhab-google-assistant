const Command = require('../../functions/commands/thermostatsetmode.js');

describe('ThermostatSetMode Command', () => {
  const params = { thermostatMode: 'eco' };

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
          thermostatMode: 'ModeItem'
        }
      }
    };
    expect(new Command({}, device).itemName).toBe('ModeItem');
  });

  test('convertParamsToValue', () => {
    const item = {
      metadata: {
        ga: {
          config: {
            modes: 'eco=ECO'
          }
        }
      }
    };
    expect(new Command(params).convertParamsToValue(item)).toBe('ECO');
  });

  test('getResponseStates', () => {
    const item = {
      members: [
        {
          metadata: {
            ga: {
              value: 'thermostatMode'
            }
          }
        }
      ]
    };
    expect(new Command(params).getResponseStates(item)).toStrictEqual({ thermostatMode: 'eco' });
  });
});
