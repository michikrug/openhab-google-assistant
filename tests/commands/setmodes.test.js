const Command = require('../../functions/commands/setmodes.js');

describe('SetModes Command', () => {
  const params = { updateModeSettings: { mode: 'value' } };

  test('hasValidParams', () => {
    expect(new Command({}).hasValidParams).toBe(false);
    expect(new Command(params).hasValidParams).toBe(true);
  });

  describe('getItemName', () => {
    test('getItemName', () => {
      expect(new Command({}, { id: 'Item' }).itemName).toBe('Item');
    });

    test('getItemName DynamicModesLight', () => {
      expect(() => {
        new Command({}, { id: 'Item', customData: { deviceType: 'DynamicModesLight' } }).itemName;
      }).toThrow();
      const device = {
        id: 'Item',
        customData: {
          deviceType: 'DynamicModesLight',
          members: {
            modesCurrentMode: 'CurrentMode'
          }
        }
      };
      expect(new Command({}, device).itemName).toBe('CurrentMode');
    });

    test('getItemName Fan', () => {
      expect(() => {
        new Command({}, { name: 'Item', customData: { deviceType: 'Fan' } }).itemName;
      }).toThrow();
      const device = {
        id: 'Item',
        customData: {
          deviceType: 'Fan',
          members: {
            fanMode: 'ModeItem'
          }
        }
      };
      expect(new Command({}, device).itemName).toBe('ModeItem');
    });
  });

  test('convertParamsToValue', () => {
    expect(new Command(params).convertParamsToValue()).toBe('value');
  });

  test('getResponseStates', () => {
    expect(new Command(params).getResponseStates()).toStrictEqual({
      currentModeSettings: { mode: 'value' }
    });
  });
});
