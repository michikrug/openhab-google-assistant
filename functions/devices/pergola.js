const OpenCloseDevice = require('./openclosedevice.js');

class Pergola extends OpenCloseDevice {
  get type() {
    return 'action.devices.types.PERGOLA';
  }
}

module.exports = Pergola;
