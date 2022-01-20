const Device = require('../../functions/devices/lock.js');

describe('Lock Device', () => {
  test('validDeviceType', () => {
    expect(
      new Device({
        metadata: {
          ga: {
            value: 'LOCK'
          }
        }
      }).validDeviceType
    ).toBe(true);
  });

  test('validItemType', () => {
    expect(new Device({ type: 'Switch' }).validItemType).toBe(true);
    expect(new Device({ type: 'Contact' }).validItemType).toBe(true);
    expect(new Device({ type: 'String' }).validItemType).toBe(false);
    expect(new Device({ type: 'Group', groupType: 'Switch' }).validItemType).toBe(true);
    expect(new Device({ type: 'Group', groupType: 'Contact' }).validItemType).toBe(true);
    expect(new Device({ type: 'Group', groupType: 'String' }).validItemType).toBe(false);
  });

  describe('get state', () => {
    test('get state Switch', () => {
      expect(new Device({ state: 'ON' }).state).toStrictEqual({
        isLocked: true
      });
      expect(new Device({ state: 'OFF' }).state).toStrictEqual({
        isLocked: false
      });
    });

    test('get state Contact', () => {
      expect(new Device({ state: 'CLOSED' }).state).toStrictEqual({
        isLocked: true
      });
      expect(new Device({ state: 'OPEN' }).state).toStrictEqual({
        isLocked: false
      });
    });

    test('get state inverted Swtich', () => {
      const item1 = {
        state: 'ON',
        metadata: {
          ga: {
            value: 'LOCK',
            config: {
              inverted: true
            }
          }
        }
      };
      expect(new Device(item1).state).toStrictEqual({
        isLocked: false
      });
    });

    test('getState inverted Contact', () => {
      const item2 = {
        state: 'OPEN',
        metadata: {
          ga: {
            value: 'LOCK',
            config: {
              inverted: true
            }
          }
        }
      };
      expect(new Device(item2).state).toStrictEqual({
        isLocked: true
      });
    });
  });
});
