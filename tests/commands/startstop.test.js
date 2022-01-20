const Command = require('../../functions/commands/startstop.js');

describe('StartStop Command', () => {
  test('hasValidParams', () => {
    expect(new Command().hasValidParams).toBe(false);
    expect(new Command({ start: true }).hasValidParams).toBe(true);
    expect(new Command({ start: '1' }).hasValidParams).toBe(false);
  });

  describe('convertParamsToValue', () => {
    test('convertParamsToValue', () => {
      expect(new Command({ start: true }).convertParamsToValue()).toBe('ON');
      expect(new Command({ start: false }).convertParamsToValue()).toBe('OFF');
    });

    test('convertParamsToValue Rollershutter', () => {
      const device = { id: 'Item', customData: { itemType: 'Rollershutter' } };
      expect(new Command({ start: true }, device).convertParamsToValue()).toBe('MOVE');
      expect(new Command({ start: false }, device).convertParamsToValue()).toBe('STOP');
    });

    test('convertParamsToValue Contact', () => {
      const device = { id: 'Item', customData: { itemType: 'Contact' } };
      expect(() => {
        new Command({}, device).convertParamsToValue();
      }).toThrow();
    });
  });

  test('getResponseStates', () => {
    expect(new Command({ start: true }).getResponseStates()).toStrictEqual({ isRunning: true, isPaused: false });
    expect(new Command({ start: false }).getResponseStates()).toStrictEqual({ isRunning: false, isPaused: true });
  });
});
