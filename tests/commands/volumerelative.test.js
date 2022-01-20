const Command = require('../../functions/commands/volumerelative.js');

describe('volumeRelative Command', () => {
  const params = { relativeSteps: 10 };

  test('hasValidParams', () => {
    expect(new Command().hasValidParams).toBe(false);
    expect(new Command(params).hasValidParams).toBe(true);
  });

  test('requiresItem', () => {
    expect(new Command().requiresItem).toBe(true);
  });

  describe('getItemName', () => {
    test('getItemName', () => {
      expect(new Command({}, { id: 'Item' }).itemName).toBe('Item');
      expect(new Command({}, { id: 'Item', customData: {} }).itemName).toBe('Item');
    });

    test('getItemName TV', () => {
      expect(() => {
        new Command({}, { id: 'Item', customData: { deviceType: 'TV' } }).itemName;
      }).toThrow();
      const device = {
        id: 'Item',
        customData: {
          deviceType: 'TV',
          members: {
            tvVolume: 'VolumeItem'
          }
        }
      };
      expect(new Command({}, device).itemName).toBe('VolumeItem');
    });
  });

  describe('convertParamsToValue', () => {
    test('convertParamsToValue', () => {
      expect(new Command(params).convertParamsToValue({ state: 20 })).toBe('30');
    });

    test('convertParamsToValue TV', () => {
      const item = {
        members: [
          {
            state: '20',
            type: 'Number',
            metadata: {
              ga: {
                value: 'tvVolume'
              }
            }
          }
        ]
      };
      expect(new Command(params, { id: 'Item', customData: { deviceType: 'TV' } }).convertParamsToValue(item)).toBe(
        '30'
      );
      expect(() => {
        new Command(params, { id: 'Item', customData: { deviceType: 'TV' } }).convertParamsToValue({});
      }).toThrow();
    });
  });

  test('getResponseStates', () => {
    expect(new Command(params).getResponseStates({ state: 20 })).toStrictEqual({ currentVolume: 30 });
  });
});
