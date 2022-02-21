const OpenCloseDevice = require('./openclosedevice.js');

class Garage extends OpenCloseDevice {
  get type() {
    return 'action.devices.types.GARAGE';
  }
}

module.exports = Garage;
