const Device = require('../../functions/devices/dynamicmodeslight.js');

describe('DynamicModesLight Device', () => {
  const item = {
    type: 'Group',
    metadata: {
      ga: {
        value: 'light',
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

  test('validDeviceType', () => {
    expect(new Device(item).validDeviceType).toBe(true);
    expect(new Device({ metadata: { ga: { value: 'test' } } }).validDeviceType).toBe(false);
    expect(new Device({ metadata: { ga: { value: 'light' } } }).validDeviceType).toBe(false);
  });
});
