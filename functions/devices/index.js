/// <reference path="../../typedefs.js" />
const glob = require('glob');

const Devices = {};

glob.sync('./!(index).js', { cwd: __dirname }).forEach((file) => {
  const device = require(file);
  Devices[device.name] = device;
});

module.exports = {
  /**
   * @param {Item} item
   */
  getDeviceForItem: (item) => {
    if (!item.metadata || !item.metadata.ga) {
      return;
    }
    for (const device of Object.values(Devices)) {
      const deviceInstance = new device(item);
      if (deviceInstance.validItemType && deviceInstance.validDeviceType) {
        return deviceInstance;
      }
    }
  },
  /**
   * @param {string} deviceType
   */
  getDevice: (deviceType) => {
    return Devices[deviceType];
  }
};
