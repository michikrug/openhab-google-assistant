const Device = require('../../functions/devices/startstopswitch.js');

describe('StartStopSwitch Device', () => {
  test('validItemType', () => {
    expect(new Device({ type: 'Switch' }).validItemType).toBe(true);
    expect(new Device({ type: 'Dimmer' }).validItemType).toBe(false);
    expect(new Device({ type: 'Group', groupType: 'Switch' }).validItemType).toBe(true);
    expect(new Device({ type: 'Group', groupType: 'Dimmer' }).validItemType).toBe(false);
  });

  test('get attributes', () => {
    expect(new Device({}).attributes).toStrictEqual({ pausable: false });
  });

  describe('get state', () => {
    test('get state', () => {
      expect(new Device({ state: 'ON' }).state).toStrictEqual({
        isRunning: true,
        isPaused: false
      });
      expect(new Device({ state: 'OFF' }).state).toStrictEqual({
        isRunning: false,
        isPaused: true
      });
    });

    test('getState inverted', () => {
      const item = {
        state: 'ON',
        metadata: {
          ga: {
            value: '',
            config: {
              inverted: true
            }
          }
        }
      };
      expect(new Device(item).state).toStrictEqual({
        isRunning: false,
        isPaused: true
      });
      item.state = 'OFF';
      expect(new Device(item).state).toStrictEqual({
        isRunning: true,
        isPaused: false
      });
    });
  });
});
