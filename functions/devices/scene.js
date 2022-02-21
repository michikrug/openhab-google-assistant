const DefaultDevice = require('./default.js');

class Scene extends DefaultDevice {
  get type() {
    return 'action.devices.types.SCENE';
  }

  get traits() {
    return ['action.devices.traits.Scene'];
  }

  get requiredItemTypes() {
    return ['Switch'];
  }

  get attributes() {
    return {
      sceneReversible: this.config.sceneReversible !== false
    };
  }
}

module.exports = Scene;
