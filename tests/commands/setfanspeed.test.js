const Command = require('../../functions/commands/setfanspeed.js');

describe('SetFanSpeed Command', () => {
  const params = { fanSpeed: '50' };

  test('validateParams', () => {
    expect(Command.validateParams({})).toBe(false);
    expect(Command.validateParams(params)).toBe(true);
  });

  describe('getItemName', () => {
    test('getItemName', () => {
      expect(Command.getItemName({ name: 'Item' }, {})).toBe('Item');
      expect(Command.getItemName({ name: 'Item' }, { customData: {} })).toBe('Item');
    });

    test('getItemName Fan', () => {
      expect(() => {
        Command.getItemName({ name: 'Item' }, { customData: { deviceType: 'Fan', itemType: 'Group' } });
      }).toThrow();
      const item = {
        members: [
          {
            name: 'SpeedItem',
            type: 'Dimmer',
            metadata: {
              ga: {
                value: 'fanSpeed'
              }
            }
          }
        ]
      };
      expect(Command.getItemName(item, { customData: { deviceType: 'Fan', itemType: 'Group' } })).toBe('SpeedItem');
      expect(Command.getItemName({ name: 'Item' }, { customData: { deviceType: 'Fan', itemType: 'Dimmer' } })).toBe(
        'Item'
      );
    });
  });

  test('convertParamsToValue', () => {
    expect(Command.convertParamsToValue(params)).toBe('50');
  });

  test('getResponseStates', () => {
    expect(Command.getResponseStates(params)).toStrictEqual({ currentFanSpeedSetting: '50' });
  });
});
