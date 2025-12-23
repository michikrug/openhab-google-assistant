const Device = require('../../functions/devices/washer.js');

describe('Washer Device', () => {
  test('matchesDeviceType without members', () => {
    expect(
      Device.matchesDeviceType({
        metadata: {
          ga: {
            value: 'WASHER'
          }
        }
      })
    ).toBe(false);
  });

  test('matchesDeviceType with members', () => {
    expect(
      Device.matchesDeviceType({
        metadata: {
          ga: {
            value: 'WASHER'
          }
        },
        members: [
          {
            name: 'WasherPower',
            state: 'ON',
            type: 'Switch',
            metadata: { ga: { value: 'washerPower' } }
          }
        ]
      })
    ).toBe(true);
  });

  test('matchesItemType', () => {
    expect(Device.matchesItemType({ type: 'Group' })).toBe(true);
    expect(Device.matchesItemType({ type: 'Switch' })).toBe(false);
  });

  test('getTraits - Power only', () => {
    const item = {
      type: 'Group',
      members: [
        {
          name: 'WasherPower',
          type: 'Switch',
          metadata: { ga: { value: 'washerPower' } }
        }
      ]
    };
    const traits = Device.getTraits(item);
    expect(traits).toContain('action.devices.traits.StartStop');
    expect(traits).not.toContain('action.devices.traits.Timer');
  });

  test('getTraits - Timer only', () => {
    const item = {
      type: 'Group',
      members: [
        {
          name: 'WasherTimerRemaining',
          type: 'Number',
          metadata: { ga: { value: 'washerTimerRemaining' } }
        }
      ]
    };
    const traits = Device.getTraits(item);
    expect(traits).toContain('action.devices.traits.Timer');
    expect(traits).not.toContain('action.devices.traits.StartStop');
  });

  test('getState - Timer Active', () => {
    const item = {
      type: 'Group',
      members: [
        {
          name: 'WasherTimerRemaining',
          state: '1200',
          type: 'Number',
          metadata: { ga: { value: 'washerTimerRemaining' } }
        },
        {
          name: 'WasherTimerTotal',
          state: '3600',
          type: 'Number',
          metadata: { ga: { value: 'washerTimerTotal' } }
        }
      ]
    };
    const state = Device.getState(item);
    expect(state.timerRemainingSec).toBe(1200);
    expect(state.totalDurationSec).toBe(3600);
    expect(state.timerPaused).toBe(false);
  });

  test('getState - Timer Paused', () => {
    const item = {
      type: 'Group',
      members: [
        {
          name: 'WasherTimerRemaining',
          state: '600',
          type: 'Number',
          metadata: { ga: { value: 'washerTimerRemaining' } }
        },
        {
          name: 'WasherTimerPaused',
          state: 'ON',
          type: 'Switch',
          metadata: { ga: { value: 'washerTimerPaused' } }
        }
      ]
    };
    const state = Device.getState(item);
    expect(state.timerRemainingSec).toBe(600);
    expect(state.timerPaused).toBe(true);
  });

  test('getAttributes', () => {
    const item = {
        type: 'Group',
        members: [
          {
            name: 'WasherTimerRemaining',
            type: 'Number',
            metadata: { ga: { value: 'washerTimerRemaining' } }
          }
        ]
      };
    const attributes = Device.getAttributes(item);
    expect(attributes.maxTimerLimitSeconds).toBe(86400);
    expect(attributes.commandOnlyTimer).toBe(false);
  });
});
