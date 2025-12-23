const DefaultDevice = require('./default.js');

class Dishwasher extends DefaultDevice {
  static get type() {
    return 'action.devices.types.DISHWASHER';
  }

  static getTraits(item) {
    const traits = [];
    const members = this.getMembers(item);

    if ('dishwasherPower' in members) {
      traits.push('action.devices.traits.StartStop');
    }
    if ('dishwasherTimerRemaining' in members || 'dishwasherCurrentCycle' in members) {
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
    return [
      { name: 'dishwasherTimerRemaining', types: ['Number'] },
      { name: 'dishwasherCurrentCycle', types: ['String'] },
      { name: 'dishwasherPower', types: ['Switch'] }
    ];
  }

  static getAttributes(item) {
    const attributes = {};
    const members = this.getMembers(item);

    if ('dishwasherPower' in members) {
      attributes.pausable = false;
    }

    return attributes;
  }

  static getState(item) {
    const state = {};
    const config = this.getConfig(item);
    const members = this.getMembers(item);

    if ('dishwasherPower' in members) {
      let isRunning = members.dishwasherPower.state === 'ON';
      if (config.inverted === true) {
        isRunning = !isRunning;
      }
      state.isRunning = isRunning;
      state.isPaused = false;
    }

    if ('dishwasherTimerRemaining' in members || 'dishwasherCurrentCycle' in members) {
      state.currentRunCycle = [
        {
          currentCycle: 'unknown',
          lang: 'en'
        }
      ];

      if ('dishwasherCurrentCycle' in members) {
        state.currentRunCycle[0].currentCycle = members.dishwasherCurrentCycle.state;
      }

      if ('dishwasherTimerRemaining' in members) {
        const remaining = parseInt(members.dishwasherTimerRemaining.state);
        if (!isNaN(remaining)) {
          state.currentTotalRemainingTime = remaining;
          state.currentCycleRemainingTime = remaining;
        }
      }
    }

    return state;
  }
}

module.exports = Dishwasher;
