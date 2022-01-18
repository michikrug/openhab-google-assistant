const DefaultCommand = require('./default.js');
const Charger = require('../devices/charger.js');

class Charge extends DefaultCommand {
  get type() {
    return 'action.devices.commands.Charge';
  }

  get hasValidParams() {
    return 'charge' in this.params && typeof this.params.charge === 'boolean';
  }

  get requiresItem() {
    return true;
  }

  get itemName() {
    if ('chargerCharging' in this.members) {
      return this.members.chargerCharging;
    }
    throw { statusCode: 400 };
  }

  convertParamsToValue() {
    let charge = this.params.charge;
    if (this.isInverted === true) {
      charge = !charge;
    }
    return charge ? 'ON' : 'OFF';
  }

  getResponseStates(item) {
    const states = new Charger(item).state;
    states.isCharging = this.params.charge;
    return states;
  }
}

module.exports = Charge;
