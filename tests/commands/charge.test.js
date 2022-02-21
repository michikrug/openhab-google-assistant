const Command = require('../../functions/commands/charge.js');

describe('Charge Command', () => {
  test('hasValidParams', () => {
    expect(new Command().hasValidParams).toBe(false);
    expect(new Command({ charge: true }).hasValidParams).toBe(true);
  });

  test('getItemName', () => {
    expect(() => {
      new Command({}, { id: 'Item' }).itemName;
    }).toThrow();

    const device = {
      id: 'Item',
      customData: {
        members: {
          chargerCharging: 'ChargingItem'
        }
      }
    };
    expect(new Command({}, device).itemName).toBe('ChargingItem');
  });

  describe('convertParamsToValue', () => {
    test('convertParamsToValue', () => {
      expect(new Command({ charge: true }).convertParamsToValue()).toBe('ON');
    });

    test('convertParamsToValue inverted', () => {
      expect(new Command({ charge: true }, { id: 'Item', customData: { inverted: true } }).convertParamsToValue()).toBe(
        'OFF'
      );
    });
  });

  test('getResponseStates', () => {
    const item = {
      members: [
        {
          type: 'Switch',
          metadata: {
            ga: {
              value: 'chargerCharging'
            }
          },
          state: 'OFF'
        },
        {
          type: 'Number',
          metadata: {
            ga: {
              value: 'chargerCapacityRemaining'
            }
          },
          state: '50'
        }
      ]
    };
    expect(new Command({ charge: true }).getResponseStates(item)).toStrictEqual({
      isCharging: true,
      descriptiveCapacityRemaining: 'MEDIUM',
      capacityRemaining: [
        {
          rawValue: 50,
          unit: 'PERCENTAGE'
        }
      ]
    });
    expect(new Command({ charge: false }).getResponseStates(item)).toStrictEqual({
      isCharging: false,
      descriptiveCapacityRemaining: 'MEDIUM',
      capacityRemaining: [
        {
          rawValue: 50,
          unit: 'PERCENTAGE'
        }
      ]
    });
  });
});
