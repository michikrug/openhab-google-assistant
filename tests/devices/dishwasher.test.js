const Washer = require('../../functions/devices/washer.js');

class Dishwasher extends Washer {
  static get type() {
    return 'action.devices.types.DISHWASHER';
  }
}

const Device = Dishwasher;

describe('Dishwasher Device (as Washer Variant)', () => {
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

  test('matchesDeviceType with members (washer prefix)', () => {
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
            metadata: { ga: { value: 'washerPower' } }
          }
        ]
      })
    ).toBe(true);
  });

  test('getTraits - Power only (washerPower)', () => {
    const item = {
      type: 'Group',
      members: [
        {
          name: 'DishwasherPower',
          type: 'Switch',
          metadata: { ga: { value: 'washerPower' } }
        }
      ]
    };
    const traits = Device.getTraits(item);
    expect(traits).toContain('action.devices.traits.StartStop');
  });

  test('getState - Full State (washer members)', () => {
    const item = {
      type: 'Group',
      members: [
        {
          name: 'DishwasherTimerRemaining',
          state: '600',
          type: 'Number',
          metadata: { ga: { value: 'washerTimerRemaining' } }
        },
        {
          name: 'DishwasherCurrentCycle',
          state: 'eco',
          type: 'String',
          metadata: { ga: { value: 'washerCurrentCycle' } }
        },
        {
          name: 'DishwasherPower',
          state: 'ON',
          type: 'Switch',
          metadata: { ga: { value: 'washerPower' } }
        }
      ]
    };
    const state = Device.getState(item);
    expect(state.currentTotalRemainingTime).toBe(600);
    expect(state.isRunning).toBe(true);
  });
});
