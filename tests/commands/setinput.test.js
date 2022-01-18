const Command = require('../../functions/commands/setinput.js');

describe('SetInput Command', () => {
  const params = { newInput: 'hdmi1' };

  test('hasValidParams', () => {
    expect(new Command({}).hasValidParams).toBe(false);
    expect(new Command(params).hasValidParams).toBe(true);
  });

  test('getItemName', () => {
    expect(() => {
      new Command({}, { id: 'Item' }).itemName;
    }).toThrow();
    const device = {
      customData: {
        members: {
          tvInput: 'InputItem'
        }
      }
    };
    expect(new Command({}, device).itemName).toBe('InputItem');
  });

  test('convertParamsToValue', () => {
    expect(new Command(params).convertParamsToValue()).toBe('hdmi1');
  });

  test('getResponseStates', () => {
    expect(new Command(params).getResponseStates()).toStrictEqual({ currentInput: 'hdmi1' });
  });
});
