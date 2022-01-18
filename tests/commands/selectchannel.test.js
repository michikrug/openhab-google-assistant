const Command = require('../../functions/commands/selectchannel.js');

describe('selectChannel Command', () => {
  test('hasValidParams', () => {
    expect(new Command({}).hasValidParams).toBe(false);
    expect(new Command({ channelCode: 'channel1' }).hasValidParams).toBe(true);
    expect(new Command({ channelName: 'Channel 1' }).hasValidParams).toBe(true);
    expect(new Command({ channelNumber: '1' }).hasValidParams).toBe(true);
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
          tvChannel: 'ChannelItem'
        }
      }
    };
    expect(new Command({}, device).itemName).toBe('ChannelItem');
  });

  test('convertParamsToValue', () => {
    const item = {
      metadata: {
        ga: {
          config: {
            availableChannels: '1=channel1=ARD,2=channel2=ZDF'
          }
        }
      }
    };
    expect(new Command({ channelCode: 'channel1' }).convertParamsToValue(item)).toBe('1');
    expect(new Command({ channelName: 'ARD' }).convertParamsToValue(item)).toBe('1');
    expect(new Command({ channelNumber: '1' }).convertParamsToValue(item)).toBe('1');
    expect(() => {
      new Command({ channelNumber: '0' }).convertParamsToValue(item);
    }).toThrow();
    expect(() => {
      new Command({ channelName: 'wrong' }).convertParamsToValue(item);
    }).toThrow();
  });

  test('getResponseStates', () => {
    const item = {
      metadata: {
        ga: {
          config: {
            availableChannels: '1=channel1=ARD,2=channel2=ZDF'
          }
        }
      }
    };
    expect(new Command({ channelName: 'ZDF' }).getResponseStates(item)).toStrictEqual({ channelNumber: '2' });
  });
});
