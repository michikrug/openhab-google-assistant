const DefaultDevice = require('./default.js');

class Speaker extends DefaultDevice {
  get type() {
    return 'action.devices.types.SPEAKER';
  }

  get traits() {
    return ['action.devices.traits.Volume'];
  }

  get requiredItemTypes() {
    return ['Dimmer'];
  }

  get attributes() {
    const config = this.config;
    const attributes = {
      volumeMaxLevel: 100,
      volumeCanMuteAndUnmute: false
    };
    if ('volumeMaxLevel' in config) {
      attributes.volumeMaxLevel = Number(config.volumeMaxLevel);
    }
    if ('volumeDefaultPercentage' in config) {
      attributes.volumeDefaultPercentage = Number(config.volumeDefaultPercentage);
    }
    if ('levelStepSize' in config) {
      attributes.levelStepSize = Number(config.levelStepSize);
    }
    return attributes;
  }

  get state() {
    return {
      currentVolume: Number(this.item.state) || 0
    };
  }
}

module.exports = Speaker;
