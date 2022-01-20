const Command = require('../../functions/commands/colorabsolute.js');

describe('ColorAbsolute Command', () => {
  const params = {
    color: {
      spectrumHSV: { hue: 10, saturation: 0.2, value: 0.3 }
    }
  };

  test('hasValidParams', () => {
    expect(new Command().hasValidParams).toBe(false);
    expect(new Command({ color: {} }).hasValidParams).toBe(false);
    expect(new Command(params).hasValidParams).toBe(true);
  });

  test('getItemName', () => {
    expect(new Command({}, { id: 'Item' }).itemName).toBe('Item');
    expect(new Command({}, { id: 'Item', customData: {} }).itemName).toBe('Item');
    expect(new Command({}, { id: 'Item', customData: { deviceType: 'ColorLight' } }).itemName).toBe('Item');
    expect(() => {
      new Command({}, { id: 'Item', customData: { deviceType: 'SpecialColorLight' } }).itemName;
    }).toThrow();
    expect(
      new Command(
        {},
        {
          id: 'Item',
          customData: {
            deviceType: 'SpecialColorLight',
            members: {
              lightColor: 'ColorItem'
            }
          }
        }
      ).itemName
    ).toBe('ColorItem');
  });

  test('convertParamsToValue', () => {
    expect(new Command(params, { id: 'Item', customData: { deviceType: 'ColorLight' } }).convertParamsToValue()).toBe(
      '10,20,30'
    );
    expect(
      new Command(params, { id: 'Item', customData: { deviceType: 'SpecialColorLight' } }).convertParamsToValue()
    ).toBe('10,20,30');
    expect(() =>
      new Command(params, { id: 'Item', customData: { deviceType: 'Light' } }).convertParamsToValue()
    ).toThrow();
  });

  test('getResponseStates', () => {
    expect(new Command(params).getResponseStates()).toStrictEqual({
      color: {
        spectrumHsv: { hue: 10, saturation: 0.2, value: 0.3 }
      }
    });
  });
});
