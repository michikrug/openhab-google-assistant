const DefaultDevice = require('./default.js');

class DimmableLight extends DefaultDevice {
  get type() {
    return 'action.devices.types.LIGHT';
  }

  get traits() {
    return ['action.devices.traits.OnOff', 'action.devices.traits.Brightness'];
  }

  get requiredItemTypes() {
    return ['Dimmer'];
  }

  get state() {
    const brightness = Number(this.item.state) || 0;
    return {
      on: brightness > 0,
      brightness: brightness
    };
  }
}

module.exports = DimmableLight;
