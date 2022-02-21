const DefaultDevice = require('./default.js');

class Charger extends DefaultDevice {
  get type() {
    return 'action.devices.types.CHARGER';
  }

  get traits() {
    return ['action.devices.traits.EnergyStorage'];
  }

  get requiredItemTypes() {
    return ['Group'];
  }

  get supportedMembers() {
    return [
      { name: 'chargerCharging', types: ['Switch'] },
      { name: 'chargerPluggedIn', types: ['Switch'] },
      { name: 'chargerCapacityRemaining', types: ['Number', 'Dimmer'] },
      { name: 'chargerCapacityUntilFull', types: ['Number', 'Dimmer'] }
    ];
  }

  get validDeviceType() {
    return super.validDeviceType && Object.keys(this.members).length > 0;
  }

  get attributes() {
    return {
      isRechargeable: this.config.isRechargeable || false,
      queryOnlyEnergyStorage: !('chargerCharging' in this.members)
    };
  }

  get state() {
    const state = {};
    const config = this.config;
    const members = this.members;
    for (const member in members) {
      switch (member) {
        case 'chargerCharging':
          state.isCharging = members[member].state === 'ON';
          break;
        case 'chargerPluggedIn':
          state.isPluggedIn = members[member].state === 'ON';
          break;
        case 'chargerCapacityRemaining': {
          if (!config.unit || config.unit === 'PERCENTAGE') {
            let descCapacity = 'UNKNOWN';
            const capacity = Number(members[member].state);
            if (capacity <= 10) {
              descCapacity = 'CRITICALLY_LOW';
            } else if (capacity <= 40) {
              descCapacity = 'LOW';
            } else if (capacity <= 75) {
              descCapacity = 'MEDIUM';
            } else if (capacity < 100) {
              descCapacity = 'HIGH';
            } else {
              descCapacity = 'FULL';
            }
            state.descriptiveCapacityRemaining = descCapacity;
          }
          state.capacityRemaining = [
            {
              unit: config.unit || 'PERCENTAGE',
              rawValue: Number(members[member].state)
            }
          ];
          break;
        }
        case 'chargerCapacityUntilFull': {
          state.capacityUntilFull = [
            {
              unit: config.unit || 'PERCENTAGE',
              rawValue: Number(members[member].state)
            }
          ];
          break;
        }
      }
    }
    return state;
  }
}

module.exports = Charger;
