const DefaultDevice = require('./default.js');

class Doorbell extends DefaultDevice {
  static get type() {
    return 'action.devices.types.DOORBELL';
  }

  static getTraits() {
    return ['action.devices.traits.ObjectDetection'];
  }

  static get requiredItemTypes() {
    return ['Switch'];
  }

  static getNotification(item) {
    let state = item.state === 'ON';
    if (this.getConfig(item).inverted === true) {
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
