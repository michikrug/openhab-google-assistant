const Switch = require('./switch.js');

class Outlet extends Switch {
  get type() {
    return 'action.devices.types.OUTLET';
  }
}

module.exports = Outlet;
