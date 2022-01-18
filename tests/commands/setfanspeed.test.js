const Command = require('../../functions/commands/setfanspeed.js');

describe('SetFanSpeed Command', () => {
  const params = { fanSpeed: '50' };

  test('hasValidParams', () => {
    expect(new Command({}).hasValidParams).toBe(false);
    expect(new Command(params).hasValidParams).toBe(true);
  });

  describe('getItemName', () => {
    test('getItemName', () => {
      expect(new Command({}, { id: 'Item' }).itemName).toBe('Item');
    });

    test('getItemName Fan', () => {
      expect(() => {
        new Command({}, { id: 'Item', customData: { deviceType: 'Fan', itemType: 'Group' } }).itemName;
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
      expect(new Command({}, device).itemName).toBe('SpeedItem');
      expect(new Command({}, { id: 'Item', customData: { deviceType: 'Fan', itemType: 'Dimmer' } }).itemName).toBe(
        'Item'
      );
    });
  });

  test('convertParamsToValue', () => {
    expect(new Command(params).convertParamsToValue()).toBe('50');
  });

  test('getResponseStates', () => {
    expect(new Command(params).getResponseStates()).toStrictEqual({ currentFanSpeedSetting: '50' });
  });
});
