const Command = require('../../functions/commands/mediaresume.js');

describe('mediaResume Command', () => {
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
      new Command({}, { id: 'Item', customData: { members: {} } }).itemName();
    }).toThrow();
  });

  test('convertParamsToValue', () => {
    expect(new Command().convertParamsToValue()).toBe('PLAY');
  });
});
