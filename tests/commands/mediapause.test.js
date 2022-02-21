const Command = require('../../functions/commands/mediapause.js');

describe('mediaPause Command', () => {
  test('hasValidParams', () => {
    expect(new Command({}).hasValidParams).toBe(true);
  });

  test('getItemName', () => {
    const device = {
      id: 'Item',
      customData: {
        members: {
          tvTransport: 'TransportItem'
        }
      }
    };
    expect(new Command({}, device).itemName).toBe('TransportItem');
    expect(() => {
      new Command().itemName({ id: 'Item', customData: { members: {} } });
    }).toThrow();
  });

  test('convertParamsToValue', () => {
    expect(new Command().convertParamsToValue()).toBe('PAUSE');
  });
});
