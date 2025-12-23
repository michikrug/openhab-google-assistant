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
    expect(traits).not.toContain('action.devices.traits.RunCycle');
  });

  test('getTraits - Timer/RunCycle only', () => {
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
    expect(traits).toContain('action.devices.traits.RunCycle');
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
        }
      ]
    };
    const state = Device.getState(item);
    expect(state.currentTotalRemainingTime).toBe(1200);
    expect(state.currentCycleRemainingTime).toBe(1200);
    expect(state.currentRunCycle[0].currentCycle).toBe('unknown');
  });

  test('getState - Current Cycle', () => {
    const item = {
      type: 'Group',
      members: [
        {
          name: 'WasherCurrentCycle',
          state: 'rinse',
          type: 'String',
          metadata: { ga: { value: 'washerCurrentCycle' } }
        }
      ]
    };
    const state = Device.getState(item);
    expect(state.currentRunCycle[0].currentCycle).toBe('rinse');
  });

  test('getState - Full State', () => {
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
          name: 'WasherCurrentCycle',
          state: 'spin',
          type: 'String',
          metadata: { ga: { value: 'washerCurrentCycle' } }
        },
        {
          name: 'WasherPower',
          state: 'ON',
          type: 'Switch',
          metadata: { ga: { value: 'washerPower' } }
        }
      ]
    };
    const state = Device.getState(item);
    expect(state.currentTotalRemainingTime).toBe(600);
    expect(state.currentCycleRemainingTime).toBe(600);
    expect(state.currentRunCycle[0].currentCycle).toBe('spin');
    expect(state.isRunning).toBe(true);
  });
});
