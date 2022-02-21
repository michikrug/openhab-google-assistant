const Device = require('../../functions/devices/dynamicmodesdevice.js');

describe('DynamicModesDevice Device', () => {
  const item = {
    type: 'Group',
    metadata: {
      ga: {
        value: '',
        config: {
          mode: 'mode_name,alternate_mode_name',
          ordered: true
        }
      }
    },
    members: [
      {
        name: 'CurrentMode',
        state: 'mode_value',
        type: 'String',
        metadata: {
          ga: {
            value: 'modesCurrentMode'
          }
        }
      },
      {
        name: 'Settings',
        state: 'setting1=mode_value:alternate_mode_value,setting2=mode_value2',
        type: 'String',
        metadata: {
          ga: {
            value: 'modesSettings'
          }
        }
      }
    ]
  };

  test('validItemType', () => {
    expect(new Device({ type: 'Color' }).validItemType).toBe(false);
    expect(new Device({ type: 'Group', groupType: 'Color' }).validItemType).toBe(false);
    expect(new Device({ type: 'Group', groupType: 'Dimmer' }).validItemType).toBe(false);
  });

  describe('get attributes', () => {
    test('get attributes no config', () => {
      const invalid_item = {
        metadata: {
          ga: {
            value: '',
            config: {}
          }
        }
      };
      expect(new Device(invalid_item).attributes).toStrictEqual({});
    });

    test('get attributes mode', () => {
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
    expect(new Device(item).state).toStrictEqual({
      currentModeSettings: {
        mode_name: 'mode_value'
      }
    });
  });
});
