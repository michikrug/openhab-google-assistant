const Command = require('../../functions/commands/appselect.js');

describe('appSelect Command', () => {
  const paramsKey = { newApplication: 'netflix' };
  const paramsName = { newApplicationName: 'Net Flix' };

  test('hasValidParams', () => {
    expect(new Command({}).hasValidParams).toBe(false);
    expect(new Command(paramsKey).hasValidParams).toBe(true);
    expect(new Command(paramsName).hasValidParams).toBe(true);
  });

  test('requiresItem', () => {
    expect(new Command().requiresItem).toBe(true);
  });

  test('getItemName', () => {
    expect(() => {
      new Command({}, { id: 'Item' }).itemName;
    }).toThrow();
    const device = {
      customData: {
        members: {
          tvApplication: 'ApplicationItem'
        }
      }
    };
    expect(new Command({}, device).itemName).toBe('ApplicationItem');
  });

  test('convertParamsToValue', () => {
    const item = {
      metadata: {
        ga: {
          config: {
            availableApplications: 'youtube=YouTube:Tube,netflix=Net Flix:Flix'
          }
        }
      }
    };
    expect(new Command(paramsKey).convertParamsToValue(item)).toBe('netflix');
    expect(new Command(paramsName).convertParamsToValue(item)).toBe('netflix');
    expect(new Command({ newApplicationName: 'Tube' }).convertParamsToValue(item)).toBe('youtube');
    expect(() => {
      new Command({ newApplication: 'wrong' }).convertParamsToValue(item);
    }).toThrow();
    expect(() => {
      new Command({ newApplicationName: 'wrong' }).convertParamsToValue(item);
    }).toThrow();
  });

  test('getResponseStates', () => {
    const item = {
      metadata: {
        ga: {
          config: {
            availableApplications: 'youtube=YouTube,netflix=Net Flix'
          }
        }
      }
    };
    expect(new Command(paramsKey).getResponseStates(item)).toStrictEqual({ currentApplication: 'netflix' });
    expect(new Command(paramsName).getResponseStates(item)).toStrictEqual({ currentApplication: 'netflix' });
  });
});
