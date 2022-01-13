const DefaultDevice = require('./default.js');

class OpenCloseDevice extends DefaultDevice {
  get traits() {
    return ['action.devices.traits.OpenClose', 'action.devices.traits.StartStop'];
  }

  get attributes() {
    const attributes = {
      pausable: false,
      discreteOnlyOpenClose: this.config.discreteOnly === true,
      queryOnlyOpenClose: this.config.queryOnly === true
    };
    if (this.itemType === 'Switch') {
      attributes.discreteOnlyOpenClose = true;
    }
    if (this.itemType === 'Contact') {
      attributes.discreteOnlyOpenClose = true;
      attributes.queryOnlyOpenClose = true;
    }
    return attributes;
  }

  get requiredItemTypes() {
    return ['Rollershutter', 'Switch', 'Contact'];
  }

  get state() {
    let state = 0;
    if (this.itemType === 'Rollershutter') {
      state = Number(this.item.state);
    } else {
      state = this.item.state === 'ON' || this.item.state === 'OPEN' ? 0 : 100;
    }
    return {
      openPercent: this.config.inverted !== true ? 100 - state : state
    };
  }
}

module.exports = OpenCloseDevice;
