const Command = require('../../functions/commands/openclose.js');

describe('OpenClose Command', () => {
  test('hasValidParams', () => {
    expect(new Command().hasValidParams).toBe(false);
    expect(new Command({ openPercent: 100 }).hasValidParams).toBe(true);
    expect(new Command({ openPercent: '5' }).hasValidParams).toBe(false);
  });

  describe('convertParamsToValue', () => {
    test('convertParamsToValue', () => {
      expect(new Command({ openPercent: 0 }).convertParamsToValue()).toBe('0');
      expect(new Command({ openPercent: 20 }).convertParamsToValue()).toBe('20');
      expect(new Command({ openPercent: 50 }).convertParamsToValue()).toBe('50');
      expect(new Command({ openPercent: 70 }).convertParamsToValue()).toBe('70');
      expect(new Command({ openPercent: 100 }).convertParamsToValue()).toBe('100');
    });

    test('convertParamsToValue inverted', () => {
      const device = { id: 'Item', customData: { inverted: true } };
      expect(new Command({ openPercent: 0 }, device).convertParamsToValue()).toBe('100');
      expect(new Command({ openPercent: 20 }, device).convertParamsToValue()).toBe('80');
      expect(new Command({ openPercent: 50 }, device).convertParamsToValue()).toBe('50');
      expect(new Command({ openPercent: 70 }, device).convertParamsToValue()).toBe('30');
      expect(new Command({ openPercent: 100 }, device).convertParamsToValue()).toBe('0');
    });

    test('convertParamsToValue Rollershutter', () => {
      const device = { id: 'Item', customData: { itemType: 'Rollershutter' } };
      expect(new Command({ openPercent: 0 }, device).convertParamsToValue()).toBe('DOWN');
      expect(new Command({ openPercent: 20 }, device).convertParamsToValue()).toBe('80');
      expect(new Command({ openPercent: 100 }, device).convertParamsToValue()).toBe('UP');
    });

    test('convertParamsToValue Switch', () => {
      const device = { id: 'Item', customData: { itemType: 'Switch' } };
      expect(new Command({ openPercent: 0 }, device).convertParamsToValue()).toBe('OFF');
      expect(new Command({ openPercent: 20 }, device).convertParamsToValue()).toBe('ON');
      expect(new Command({ openPercent: 100 }, device).convertParamsToValue()).toBe('ON');
    });

    test('convertParamsToValue Contact', () => {
      const device = { id: 'Item', customData: { itemType: 'Contact' } };
      expect(() => {
        new Command({}, device).convertParamsToValue();
      }).toThrow();
    });
  });

  test('getResponseStates', () => {
    expect(new Command({ openPercent: 10 }).getResponseStates()).toStrictEqual({ openPercent: 10 });
  });
});
