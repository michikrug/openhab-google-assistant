const Command = require('../../functions/commands/setvolume.js');

describe('setVolume Command', () => {
  const params = { volumeLevel: 20 };

  test('hasValidParams', () => {
    expect(new Command().hasValidParams).toBe(false);
    expect(new Command(params).hasValidParams).toBe(true);
  });

  describe('getItemName', () => {
    test('getItemName', () => {
      expect(new Command({}, { id: 'Item' }).itemName).toBe('Item');
      expect(new Command({}, { id: 'Item', customData: {} }).itemName).toBe('Item');
    });

    test('getItemName TV', () => {
      expect(() => {
        new Command({}, { id: 'Item', customData: { deviceType: 'TV' } }).itemName();
      }).toThrow();
      const device = {
        id: 'Item',
        customData: {
          deviceType: 'TV',
          members: {
            tvVolume: 'VolumeItem'
          }
        }
      };
      expect(new Command({}, device).itemName).toBe('VolumeItem');
    });
  });

  test('convertParamsToValue', () => {
    expect(new Command(params).convertParamsToValue()).toBe('20');
  });

  test('getResponseStates', () => {
    expect(new Command(params).getResponseStates()).toStrictEqual({ currentVolume: 20 });
  });
});
