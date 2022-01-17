const DefaultDevice = require('./default.js');

class Camera extends DefaultDevice {
  get type() {
    return 'action.devices.types.CAMERA';
  }

  get traits() {
    return ['action.devices.traits.CameraStream'];
  }

  get requiredItemTypes() {
    return ['String'];
  }

  get attributes() {
    return {
      cameraStreamSupportedProtocols: (this.config.protocols || 'hls,dash,smooth_stream,progressive_mp4')
        .split(',')
        .map((s) => s.trim()),
      cameraStreamNeedAuthToken: this.config.token === true,
      cameraStreamNeedDrmEncryption: false
    };
  }

}

module.exports = Camera;
