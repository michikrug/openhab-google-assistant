const Device = require('../../functions/devices/camera.js');

describe('Camera Device', () => {
  test('validDeviceType', () => {
    expect(
       new Device({
        metadata: {
          ga: {
            value: 'CAMERA'
          }
        }
      }).validDeviceType
    ).toBe(true);
  });

  test('validItemType', () => {
    expect(new Device({ type: 'String' }).validItemType).toBe(true);
    expect(new Device({ type: 'Number' }).validItemType).toBe(false);
    expect(new Device({ type: 'Group', groupType: 'String' }).validItemType).toBe(true);
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
        cameraStreamSupportedProtocols: ['hls', 'dash', 'smooth_stream', 'progressive_mp4'],
        cameraStreamNeedAuthToken: false,
        cameraStreamNeedDrmEncryption: false
      });
    });

    test('get attributes protocols, token', () => {
      const item = {
        metadata: {
          ga: {
            config: {
              protocols: 'hls,test',
              token: true
            }
          }
        }
      };
      expect(new Device(item).attributes).toStrictEqual({
        cameraStreamSupportedProtocols: ['hls', 'test'],
        cameraStreamNeedAuthToken: true,
        cameraStreamNeedDrmEncryption: false
      });
    });
  });

  test('get state', () => {
    expect(new Device({}).state).toStrictEqual({});
  });
});
