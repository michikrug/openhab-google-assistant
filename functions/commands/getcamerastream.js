const DefaultCommand = require('./default.js');

class GetCameraStream extends DefaultCommand {
  get type() {
    return 'action.devices.commands.GetCameraStream';
  }

  get hasValidParams() {
    return (
      'StreamToChromecast' in this.params &&
      typeof this.params.StreamToChromecast === 'boolean' &&
      'SupportedStreamProtocols' in this.params &&
      typeof this.params.SupportedStreamProtocols === 'object'
    );
  }

  get requiresItem() {
    return true;
  }

  convertParamsToValue() {
    return null;
  }

  getResponseStates(item) {
    return {
      cameraStreamAccessUrl: item.state
    };
  }
}

module.exports = GetCameraStream;
