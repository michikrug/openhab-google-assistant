const Command = require('../../functions/commands/setfanspeed.js');

describe('SetFanSpeed Command', () => {
  const params = { fanSpeed: '50' };

  test('validateParams', () => {
    expect(Command.validateParams({})).toBe(false);
    expect(Command.validateParams(params)).toBe(true);
  });

  describe('getItemName', () => {
    test('getItemName', () => {
      expect(Command.getItemName({ id: 'Item' })).toBe('Item');
      expect(Command.getItemName({ id: 'Item', customData: {} })).toBe('Item');
    });

    test('getItemName Fan', () => {
      expect(() => {
        Command.getItemName({ id: 'Item', customData: { deviceType: 'Fan', itemType: 'Group' } });
      }).toThrow();
      const device = {
        customData: {
          deviceType: 'Fan',
          itemType: 'Group',
          members: {
            fanSpeed: 'SpeedItem'
          }
        }
      };
      expect(Command.getItemName(device)).toBe('SpeedItem');
      expect(Command.getItemName({ id: 'Item', customData: { deviceType: 'Fan', itemType: 'Dimmer' } })).toBe('Item');
    });
  });

  test('convertParamsToValue', () => {
    expect(Command.convertParamsToValue(params)).toBe('50');
  });

  test('getResponseStates', () => {
    expect(Command.getResponseStates(params)).toStrictEqual({ currentFanSpeedSetting: '50' });
  });
});
