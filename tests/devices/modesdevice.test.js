const Device = require('../../functions/devices/modesdevice.js');

describe('ModesDevice Device', () => {
  test('validItemType', () => {
    expect(new Device({ type: 'Group' }).validItemType).toBe(false);
    expect(new Device({ type: 'Group', groupType: 'Number' }).validItemType).toBe(true);
    expect(new Device({ type: 'String' }).validItemType).toBe(true);
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
      expect(new Device(item).attributes).toStrictEqual({});
    });

    test('get attributes mode', () => {
      const item = {
        metadata: {
          ga: {
            config: {
              mode: 'mode_name,alternate_mode_name',
              settings: 'setting1=mode_value:alternate_mode_value,setting2=mode_value2',
              ordered: true
            }
          }
        }
      };
      expect(new Device(item).attributes).toStrictEqual({
        availableModes: [
          {
            name: 'mode_name',
            name_values: [
              {
                lang: 'en',
                name_synonym: ['mode_name', 'alternate_mode_name']
              }
            ],
            ordered: true,
            settings: [
              {
                setting_name: 'setting1',
                setting_values: [
                  {
                    lang: 'en',
                    setting_synonym: ['setting1', 'mode_value', 'alternate_mode_value']
                  }
                ]
              },
              {
                setting_name: 'setting2',
                setting_values: [
                  {
                    lang: 'en',
                    setting_synonym: ['setting2', 'mode_value2']
                  }
                ]
              }
            ]
          }
        ]
      });
    });
  });

  test('get state', () => {
    expect(new Device({ state: 'mode_value' }).state).toStrictEqual({});
    expect(
      new Device({
        state: 'mode_value',
        metadata: {
          ga: {
            config: {
              mode: 'mode_name,alternate_mode_name',
              settings: 'setting1=mode_value:alternate_mode_value,setting2=mode_value2'
            }
          }
        }
      }).state
    ).toStrictEqual({
      currentModeSettings: {
        mode_name: 'mode_value'
      }
    });
  });
});
