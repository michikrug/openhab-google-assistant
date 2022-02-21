const Device = require('../../functions/devices/scene.js');

describe('Scene Device', () => {
  test('validDeviceType', () => {
    expect(
      new Device({
        metadata: {
          ga: {
            value: 'SCENE'
          }
        }
      }).validDeviceType
    ).toBe(true);
  });

  test('validItemType', () => {
    expect(new Device({ type: 'Switch' }).validItemType).toBe(true);
    expect(new Device({ type: 'String' }).validItemType).toBe(false);
    expect(new Device({ type: 'Group', groupType: 'Switch' }).validItemType).toBe(true);
    expect(new Device({ type: 'Group', groupType: 'String' }).validItemType).toBe(false);
  });

  describe('get attributes', () => {
    test('get attributes no config', () => {
      expect(new Device({}).attributes).toStrictEqual({
        sceneReversible: true
      });
    });

    test('get attributes with sceneReversible = true', () => {
      const item = {
        metadata: {
          ga: {
            value: 'SCENE',
            config: {
              sceneReversible: true
            }
          }
        }
      };
      expect(new Device(item).attributes).toStrictEqual({
        sceneReversible: true
      });
    });

    test('get attributes with sceneReversible = false', () => {
      const item = {
        metadata: {
          ga: {
            value: 'SCENE',
            config: {
              sceneReversible: false
            }
          }
        }
      };
      expect(new Device(item).attributes).toStrictEqual({
        sceneReversible: false
      });
    });
  });

  test('get state', () => {
    expect(new Device({}).state).toStrictEqual({});
  });
});
