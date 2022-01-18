const Command = require('../../functions/commands/activatescene.js');

describe('ActivateScene Command', () => {
  test('hasValidParams', () => {
    expect(new Command({}).hasValidParams).toBe(true);
    expect(new Command({ deactivate: true }).hasValidParams).toBe(true);
  });

  describe('convertParamsToValue', () => {
    test('convertParamsToValue', () => {
      expect(new Command({ deactivate: true }, {}).convertParamsToValue()).toBe('OFF');
      expect(new Command({ deactivate: false }, {}).convertParamsToValue()).toBe('ON');
    });

    test('convertParamsToValue inverted', () => {
      expect(new Command({ deactivate: true }, { customData: { inverted: true } }).convertParamsToValue()).toBe('ON');
      expect(new Command({ deactivate: false }, { customData: { inverted: true } }).convertParamsToValue()).toBe('OFF');
    });
  });
});
