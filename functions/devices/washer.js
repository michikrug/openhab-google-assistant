const DefaultDevice = require('./default.js');

class Washer extends DefaultDevice {
  static get type() {
    return 'action.devices.types.WASHER';
  }

  static getTraits(item) {
    const traits = [];
    const members = this.getMembers(item);

    if ('washerTimerRemaining' in members) {
      traits.push('action.devices.traits.Timer');
    }
    if ('washerPower' in members) {
      traits.push('action.devices.traits.StartStop');
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
      { name: 'washerTimerRemaining', types: ['Number'] },
      { name: 'washerTimerPaused', types: ['Switch'] },
      { name: 'washerTimerTotal', types: ['Number'] },
      { name: 'washerPower', types: ['Switch'] }
    ];
  }

  static getAttributes(item) {
    const attributes = {};
    const members = this.getMembers(item);

    if ('washerTimerRemaining' in members) {
      attributes.maxTimerLimitSeconds = 86400; // 24 hours default max
      attributes.commandOnlyTimer = false;
    }

    if ('washerPower' in members) {
      attributes.pausable = false;
    }

    return attributes;
  }

  static getState(item) {
    const state = {};
    const config = this.getConfig(item);
    const members = this.getMembers(item);

    if ('washerTimerRemaining' in members) {
      const remaining = parseInt(members.washerTimerRemaining.state);
      if (!isNaN(remaining)) {
        state.timerRemainingSec = remaining;
      } else {
        state.timerRemainingSec = -1;
      }

      state.timerPaused = false;
      if ('washerTimerPaused' in members) {
        state.timerPaused = members.washerTimerPaused.state === 'ON';
      }

      if ('washerTimerTotal' in members) {
        const total = parseInt(members.washerTimerTotal.state);
        if (!isNaN(total)) {
          state.totalDurationSec = total;
        }
      }
    }

    if ('washerPower' in members) {
      let isRunning = members.washerPower.state === 'ON';
      if (config.inverted === true) {
        isRunning = !isRunning;
      }
      state.isRunning = isRunning;
      state.isPaused = state.timerPaused || false;
    }

    return state;
  }
}

module.exports = Washer;
