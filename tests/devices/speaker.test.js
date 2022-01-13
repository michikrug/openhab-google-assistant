const Device = require('../../functions/devices/speaker.js');

describe('Speaker Device', () => {
  test('validDeviceType', () => {
    expect(
      new Device({
        metadata: {
          ga: {
            value: 'SPEAKER'
          }
        }
      }).validDeviceType
    ).toBe(true);
  });

  test('validItemType', () => {
    expect(new Device({ type: 'Dimmer' }).validItemType).toBe(true);
    expect(new Device({ type: 'Number' }).validItemType).toBe(false);
    expect(new Device({ type: 'Group', groupType: 'Dimmer' }).validItemType).toBe(true);
    expect(new Device({ type: 'Group', groupType: 'Number' }).validItemType).toBe(false);
  });

  describe('get attributes', () => {
    test('get attributes no config', () => {
      const item = {
        metadata: {
          ga: {
            config: {}
          }
        }
      };
      expect(new Device(item).attributes).toStrictEqual({
        volumeCanMuteAndUnmute: false,
        volumeMaxLevel: 100
      });
    });

    test('get attributes volumeDefaultPercentage, volumeMaxLevel, levelStepSize', () => {
      const item = {
        metadata: {
          ga: {
            config: {
              volumeDefaultPercentage: '20',
              volumeMaxLevel: '90',
              levelStepSize: '10'
            }
          }
        }
      };
      expect(new Device(item).attributes).toStrictEqual({
        volumeCanMuteAndUnmute: false,
        volumeMaxLevel: 90,
        volumeDefaultPercentage: 20,
        levelStepSize: 10
      });
    });
  });

  test('get state', () => {
    expect(new Device({ state: '10' }).state).toStrictEqual({
      currentVolume: 10
    });
    expect(new Device({ state: '90' }).state).toStrictEqual({
      currentVolume: 90
    });
  });
});
