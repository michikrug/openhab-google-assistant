const glob = require('glob');

const Devices = [];

glob.sync('./!(index).js', { cwd: __dirname }).forEach((file) => {
  Devices.push(require(file));
});

module.exports = {
  /**
   * @param {object} item
   */
  getDeviceForItem: (item) => {
    if (!item.metadata || !item.metadata.ga) {
      return;
    }
    for (const device of Devices) {
      const d = new device(item);
      if (d.validItemType && d.validDeviceType) {
        return d;
      }
    }
  }
};
