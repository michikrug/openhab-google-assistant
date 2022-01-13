const DefaultDevice = require('./default.js');

class Doorbell extends DefaultDevice {
  get type() {
    return 'action.devices.types.DOORBELL';
  }

  get traits() {
    return ['action.devices.traits.ObjectDetection'];
  }

  get requiredItemTypes() {
    return ['Switch'];
  }

  getNotification() {
    let state = this.item.state === 'ON';
    if (this.config.inverted === true) {
      state = !state;
    }
    return state
      ? {
          ObjectDetection: {
            objects: {
              unclassified: 1
            },
            priority: 0,
            detectionTimestamp: Date.now()
          }
        }
      : {};
  }
}

module.exports = Doorbell;
