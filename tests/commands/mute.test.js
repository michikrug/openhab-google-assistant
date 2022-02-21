const Command = require('../../functions/commands/mute.js');

describe('Mute Command', () => {
  test('hasValidParams', () => {
    expect(new Command().hasValidParams).toBe(false);
    expect(new Command({ mute: true }).hasValidParams).toBe(true);
  });

  describe('getItemName', () => {
    test('getItemName', () => {
      expect(new Command({}, { id: 'Item' }).itemName).toBe('Item');
    });

    test('getItemName TV no members', () => {
      expect(() => {
        new Command({}, { id: 'Item', customData: { deviceType: 'TV' } }).itemName;
      }).toThrow();
    });

    test('getItemName TV mute', () => {
      const device = {
        id: 'Item',
        customData: {
          deviceType: 'TV',
          members: {
            tvMute: 'MuteItem'
          }
        }
      };
      expect(new Command({}, device).itemName).toBe('MuteItem');
    });

    test('getItemName TV volume', () => {
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

  describe('convertParamsToValue', () => {
    test('convertParamsToValue no Switch', () => {
      expect(new Command({ mute: true }).convertParamsToValue()).toBe('0');
      expect(new Command({ mute: false }).convertParamsToValue()).toBeUndefined();
    });

    test('convertParamsToValue Switch', () => {
      expect(
        new Command({ mute: true }, { id: 'Item', customData: { itemType: 'Switch' } }).convertParamsToValue()
      ).toBe('ON');
      expect(
        new Command({ mute: false }, { id: 'Item', customData: { itemType: 'Switch' } }).convertParamsToValue()
      ).toBe('OFF');
    });

    test('convertParamsToValue inverted', () => {
      expect(
        new Command(
          { mute: true },
          { id: 'Item', customData: { itemType: 'Switch', inverted: true } }
        ).convertParamsToValue()
      ).toBe('OFF');
      expect(
        new Command(
          { mute: false },
          { id: 'Item', customData: { itemType: 'Switch', inverted: true } }
        ).convertParamsToValue()
      ).toBe('ON');
    });

    test('convertParamsToValue TV mute', () => {
      expect(
        new Command(
          { mute: true },
          { id: 'Item', customData: { deviceType: 'TV', members: { tvMute: 'MuteItem' } } }
        ).convertParamsToValue()
      ).toBe('ON');
    });

    test('convertParamsToValue TV volume', () => {
      expect(
        new Command(
          { mute: true },
          { id: 'Item', customData: { deviceType: 'TV', members: { tvVolume: 'VolumeItem' } } }
        ).convertParamsToValue()
      ).toBe('0');
    });
  });

  test('getResponseStates', () => {
    expect(new Command({ mute: true }).getResponseStates()).toStrictEqual({ isMuted: true });
    expect(new Command({ mute: false }).getResponseStates()).toStrictEqual({ isMuted: false });
  });
});
