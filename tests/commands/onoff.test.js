const Command = require('../../functions/commands/onoff.js');

describe('OnOff Command', () => {
  test('hasValidParams', () => {
    expect(new Command().hasValidParams).toBe(false);
    expect(new Command({ on: true }).hasValidParams).toBe(true);
  });

  describe('getItemName', () => {
    test('getItemName', () => {
      expect(new Command({}, { id: 'Item' }).itemName).toBe('Item');
      expect(new Command({}, { id: 'Item', customData: {} }).itemName).toBe('Item');
    });

    test('getItemName DynamicModesLight', () => {
      expect(() => {
        new Command({}, { id: 'Item', customData: { deviceType: 'DynamicModesLight' } }).itemName;
      }).toThrow();
    });

    test('getItemName SpecialColorLight', () => {
      expect(() => {
        new Command({}, { id: 'Item', customData: { deviceType: 'SpecialColorLight' } }).itemName;
      }).toThrow();
      const device = {
        id: 'Item',
        customData: {
          deviceType: 'SpecialColorLight',
          members: {
            lightBrightness: 'BrightnessItem'
          }
        }
      };
      expect(new Command({}, device).itemName).toBe('BrightnessItem');
      const device_power = {
        id: 'Item',
        customData: {
          deviceType: 'SpecialColorLight',
          members: {
            lightPower: 'PowerItem'
          }
        }
      };
      expect(new Command({}, device_power).itemName).toBe('PowerItem');
    });

    test('getItemName TV', () => {
      expect(() => {
        new Command({}, { id: 'Item', customData: { deviceType: 'TV' } }).itemName;
      }).toThrow();
      const device = {
        id: 'Item',
        customData: {
          deviceType: 'TV',
          members: {
            tvPower: 'PowerItem'
          }
        }
      };
      expect(new Command({}, device).itemName).toBe('PowerItem');
    });

    test('getItemName Fan', () => {
      expect(() => {
        new Command({}, { id: 'Item', customData: { deviceType: 'Fan', itemType: 'Group' } }).itemName;
      }).toThrow();
      const device = {
        id: 'Item',
        customData: {
          deviceType: 'Fan',
          itemType: 'Group',
          members: {
            fanPower: 'PowerItem'
          }
        }
      };
      expect(new Command({}, device).itemName).toBe('PowerItem');
      expect(new Command({}, { id: 'Item', customData: { deviceType: 'Fan', itemType: 'Dimmer' } }).itemName).toBe(
        'Item'
      );
    });
  });

  describe('convertParamsToValue', () => {
    test('convertParamsToValue', () => {
      expect(new Command({ on: true }).convertParamsToValue()).toBe('ON');
    });

    test('convertParamsToValue inverted', () => {
      expect(new Command({ on: true }, { id: 'Item', customData: { inverted: true } }).convertParamsToValue()).toBe(
        'OFF'
      );
    });
  });

  test('getResponseStates', () => {
    expect(new Command({ on: true }).getResponseStates()).toStrictEqual({ on: true });
    expect(new Command({ on: false }).getResponseStates()).toStrictEqual({ on: false });
  });
});
