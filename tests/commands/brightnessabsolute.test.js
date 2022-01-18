const Command = require('../../functions/commands/brightnessabsolute.js');

describe('BrightnessAbsolute Command', () => {
  test('hasValidParams', () => {
    expect(new Command({}).hasValidParams).toBe(false);
    expect(new Command({ brightness: 100 }).hasValidParams).toBe(true);
    expect(new Command({ brightness: '100' }).hasValidParams).toBe(false);
  });

  test('getItemName', () => {
    expect(new Command({}, { id: 'Item' }).itemName).toBe('Item');
    expect(new Command({}, { id: 'Item', customData: {} }).itemName).toBe('Item');
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
  });

  test('convertParamsToValue', () => {
    expect(new Command({ brightness: 0 }).convertParamsToValue()).toBe('0');
    expect(new Command({ brightness: 100 }).convertParamsToValue()).toBe('100');
  });

  test('getResponseStates', () => {
    expect(new Command({ brightness: 0 }).getResponseStates()).toStrictEqual({ brightness: 0 });
    expect(new Command({ brightness: 100 }).getResponseStates()).toStrictEqual({ brightness: 100 });
  });
});
