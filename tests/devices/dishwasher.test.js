const Device = require('../../functions/devices/dishwasher.js');

describe('Dishwasher Device', () => {
  test('matchesDeviceType without members', () => {
    expect(
      Device.matchesDeviceType({
        metadata: {
          ga: {
            value: 'DISHWASHER'
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
            value: 'DISHWASHER'
          }
        },
        members: [
          {
            name: 'DishwasherPower',
            state: 'ON',
            type: 'Switch',
            metadata: { ga: { value: 'dishwasherPower' } }
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
          name: 'DishwasherPower',
          type: 'Switch',
          metadata: { ga: { value: 'dishwasherPower' } }
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
          name: 'DishwasherTimerRemaining',
          type: 'Number',
          metadata: { ga: { value: 'dishwasherTimerRemaining' } }
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
          name: 'DishwasherTimerRemaining',
          state: '1200',
          type: 'Number',
          metadata: { ga: { value: 'dishwasherTimerRemaining' } }
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
          name: 'DishwasherCurrentCycle',
          state: 'pots_pans',
          type: 'String',
          metadata: { ga: { value: 'dishwasherCurrentCycle' } }
        }
      ]
    };
    const state = Device.getState(item);
    expect(state.currentRunCycle[0].currentCycle).toBe('pots_pans');
  });

  test('getState - Full State', () => {
    const item = {
      type: 'Group',
      members: [
        {
          name: 'DishwasherTimerRemaining',
          state: '600',
          type: 'Number',
          metadata: { ga: { value: 'dishwasherTimerRemaining' } }
        },
        {
          name: 'DishwasherCurrentCycle',
          state: 'eco',
          type: 'String',
          metadata: { ga: { value: 'dishwasherCurrentCycle' } }
        },
        {
          name: 'DishwasherPower',
          state: 'ON',
          type: 'Switch',
          metadata: { ga: { value: 'dishwasherPower' } }
        }
      ]
    };
    const state = Device.getState(item);
    expect(state.currentTotalRemainingTime).toBe(600);
    expect(state.currentCycleRemainingTime).toBe(600);
    expect(state.currentRunCycle[0].currentCycle).toBe('eco');
    expect(state.isRunning).toBe(true);
  });
});
