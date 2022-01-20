const Command = require('../../functions/commands/lockunlock.js');

describe('LockUnlock Command', () => {
  test('hasValidParams', () => {
    expect(new Command().hasValidParams).toBe(false);
    expect(new Command({ lock: true }).hasValidParams).toBe(true);
  });

  describe('convertParamsToValue', () => {
    test('convertParamsToValue', () => {
      expect(new Command({ lock: true }).convertParamsToValue()).toBe('ON');
      expect(new Command({ lock: false }).convertParamsToValue()).toBe('OFF');
    });
    test('convertParamsToValue inverted', () => {
      expect(new Command({ lock: true }, { id: 'Item', customData: { inverted: true } }).convertParamsToValue()).toBe(
        'OFF'
      );
      expect(new Command({ lock: false }, { id: 'Item', customData: { inverted: true } }).convertParamsToValue()).toBe(
        'ON'
      );
    });
    test('convertParamsToValue Contact', () => {
      expect(() => {
        new Command({ lock: true }, { id: 'Item', customData: { itemType: 'Contact' } }).convertParamsToValue();
      }).toThrow();
    });
  });

  test('getResponseStates', () => {
    expect(new Command({ lock: true }).getResponseStates()).toStrictEqual({ isLocked: true });
    expect(new Command({ lock: false }).getResponseStates()).toStrictEqual({ isLocked: false });
  });
});
