const StartStopSwitch = require('./startstopswitch.js');

class Vacuum extends StartStopSwitch {
  get type() {
    return 'action.devices.types.VACUUM';
  }
}

module.exports = Vacuum;
