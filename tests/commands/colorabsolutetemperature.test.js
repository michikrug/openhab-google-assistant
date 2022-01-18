const Command = require('../../functions/commands/colorabsolutetemperature.js');

describe('ColorAbsoluteTemperature Command', () => {
  const params = {
    color: {
      temperature: 2000
    }
  };

  test('hasValidParams', () => {
    expect(new Command({}).hasValidParams).toBe(false);
    expect(new Command({ color: {} }).hasValidParams).toBe(false);
    expect(new Command(params).hasValidParams).toBe(true);
  });

  test('requiresItem', () => {
    expect(new Command({}, {}).requiresItem).toBe(true);
    expect(new Command({}, { customData: { deviceType: 'SpecialColorLight' } }).requiresItem).toBe(true);
    expect(
      new Command({}, { customData: { deviceType: 'SpecialColorLight', members: { test: 1 } } }).requiresItem
    ).toBe(false);
  });

  test('getItemName', () => {
    expect(new Command({}, { id: 'Item' }).itemName).toBe('Item');
    expect(new Command({}, { id: 'Item', customData: {} }).itemName).toBe('Item');
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
              lightColorTemperature: 'ColorItem'
            }
          }
        }
      ).itemName
    ).toBe('ColorItem');
  });

  describe('convertParamsToValue', () => {
    test('convertParamsToValue', () => {
      expect(new Command(params, {}).convertParamsToValue({ state: '100,100,50' })).toBe('30.62,95,50');
    });

    test('convertParamsToValue SpecialColorLight', () => {
      expect(
        new Command(params, {
          customData: {
            deviceType: 'SpecialColorLight',
            colorTemperatureRange: { temperatureMinK: 1000, temperatureMaxK: 5000 }
          }
        }).convertParamsToValue({})
      ).toBe('75');
      expect(
        new Command(params, {
          customData: {
            deviceType: 'SpecialColorLight'
          }
        }).convertParamsToValue({ state: '100,100,50' })
      ).toBe('0');
    });

    test('convertParamsToValue SpecialColorLight Kelvin', () => {
      expect(
        new Command(params, {
          customData: { deviceType: 'SpecialColorLight', useKelvin: true }
        }).convertParamsToValue()
      ).toBe('2000');
    });
  });

  test('getResponseStates', () => {
    expect(new Command(params).getResponseStates()).toStrictEqual({
      color: {
        temperatureK: 2000
      }
    });
  });
});
