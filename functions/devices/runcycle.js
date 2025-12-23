const DefaultDevice = require('./default.js');

class RunCycleDevice extends DefaultDevice {
  static get devicePrefix() {
    // action.devices.types.WASHER -> washer
    return this.type.split('.').pop().toLowerCase();
  }

  static getTraits(item) {
    const traits = [];
    const members = this.getMembers(item);
    const prefix = this.devicePrefix;

    if (`${prefix}Power` in members) {
      traits.push('action.devices.traits.StartStop');
    }
    if (`${prefix}TimerRemaining` in members || `${prefix}CurrentCycle` in members) {
      traits.push('action.devices.traits.RunCycle');
    }

    return traits;
  }

  static get requiredItemTypes() {
    return ['Group'];
  }

  static matchesDeviceType(item) {
    return super.matchesDeviceType(item) && Object.keys(this.getMembers(item)).length > 0;
  }

  static get supportedMembers() {
    const prefix = this.devicePrefix;
    return [
      { name: `${prefix}TimerRemaining`, types: ['Number'] },
      { name: `${prefix}CurrentCycle`, types: ['String'] },
      { name: `${prefix}Power`, types: ['Switch'] }
    ];
  }

  static getAttributes(item) {
    const attributes = {};
    const members = this.getMembers(item);
    const prefix = this.devicePrefix;

    if (`${prefix}Power` in members) {
      attributes.pausable = false;
    }

    return attributes;
  }

  static getState(item) {
    const state = {};
    const config = this.getConfig(item);
    const members = this.getMembers(item);
    const prefix = this.devicePrefix;

    if (`${prefix}Power` in members) {
      let isRunning = members[`${prefix}Power`].state === 'ON';
      if (config.inverted === true) {
        isRunning = !isRunning;
      }
      state.isRunning = isRunning;
      state.isPaused = false;
    }

    if (`${prefix}TimerRemaining` in members || `${prefix}CurrentCycle` in members) {
      state.currentRunCycle = [
        {
          currentCycle: 'unknown',
          lang: 'en'
        }
      ];

      if (`${prefix}CurrentCycle` in members) {
        state.currentRunCycle[0].currentCycle = members[`${prefix}CurrentCycle`].state;
      }

      if (`${prefix}TimerRemaining` in members) {
        const remaining = parseInt(members[`${prefix}TimerRemaining`].state);
        if (!isNaN(remaining)) {
          state.currentTotalRemainingTime = remaining;
          state.currentCycleRemainingTime = remaining;
        }
      }
    }

    return state;
  }
}

module.exports = RunCycleDevice;
