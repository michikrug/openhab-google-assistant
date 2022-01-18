const Command = require('../../functions/commands/mediaprevious.js');

describe('mediaPrevious Command', () => {
  test('hasValidParams', () => {
    expect(new Command({}).hasValidParams).toBe(true);
  });

  test('getItemName', () => {
    const device = {
      customData: {
        members: {
          tvTransport: 'TransportItem'
        }
      }
    };
    expect(new Command({}, device).itemName).toBe('TransportItem');
    expect(() => {
      new Command().itemName({ customData: { members: {} } });
    }).toThrow();
  });

  test('convertParamsToValue', () => {
    expect(new Command().convertParamsToValue()).toBe('PREVIOUS');
  });
});
