const DefaultCommand = require('./default.js');
const SecuritySystem = require('../devices/securitysystem.js');

class ArmDisarm extends DefaultCommand {
  get type() {
    return 'action.devices.commands.ArmDisarm';
  }

  get hasValidParams() {
    return 'arm' in this.params && typeof this.params.arm === 'boolean';
  }

  convertParamsToValue() {
    if (this.params.armLevel && this.deviceType === 'SecuritySystem') {
      return this.params.armLevel;
    }
    let arm = this.params.arm;
    if (this.isInverted) {
      arm = !arm;
    }
    return arm ? 'ON' : 'OFF';
  }

  get itemName() {
    if (this.deviceType === 'SecuritySystem') {
      const members = this.members;
      if (this.params.armLevel) {
        if (SecuritySystem.armLevelMemberName in members) {
          return members[SecuritySystem.armLevelMemberName];
        }
        throw { statusCode: 400 };
      }
      if (SecuritySystem.armedMemberName in members) {
        return members[SecuritySystem.armedMemberName];
      }
      throw { statusCode: 400 };
    }
    return this.device.id;
  }

  get requiresItem() {
    return true;
  }

  get bypassPin() {
    return !!(this.customData.pinOnDisarmOnly && (this.params.armLevel || this.params.arm));
  }

  getResponseStates() {
    const response = {
      isArmed: this.params.arm
    };
    if (this.params.armLevel) {
      response.currentArmLevel = this.params.armLevel;
    }
    return response;
  }

  get requiresUpdateValidation() {
    return true;
  }

  validateStateChange(item) {
    let isCurrentlyArmed;
    let currentLevel;

    if (this.deviceType === 'SecuritySystem') {
      const members = new SecuritySystem(item).members;
      isCurrentlyArmed =
        (SecuritySystem.armedMemberName in members && members[SecuritySystem.armedMemberName].state) ===
        (this.isInverted ? 'OFF' : 'ON');
      currentLevel =
        (SecuritySystem.armLevelMemberName in members && members[SecuritySystem.armLevelMemberName].state) || undefined;
    } else {
      isCurrentlyArmed = item.state === (this.isInverted ? 'OFF' : 'ON');
    }

    if (this.params.armLevel && this.deviceType === 'SecuritySystem') {
      if (this.params.arm && isCurrentlyArmed && this.params.armLevel === currentLevel) {
        throw { errorCode: 'alreadyInState' };
      }
      return true;
    }

    if (this.params.arm && isCurrentlyArmed) {
      throw { errorCode: 'alreadyArmed' };
    }

    if (!this.params.arm && !isCurrentlyArmed) {
      throw { errorCode: 'alreadyDisarmed' };
    }

    return true;
  }

  // @ts-ignore
  validateUpdate(item) {
    if (this.deviceType === 'SecuritySystem') {
      const securitySystem = new SecuritySystem(item);
      const members = securitySystem.members;
      const isCurrentlyArmed = members[SecuritySystem.armedMemberName].state === (this.isInverted ? 'OFF' : 'ON');
      const currentLevel =
        SecuritySystem.armLevelMemberName in members ? members[SecuritySystem.armLevelMemberName].state : '';
      const armStatusSuccessful = this.params.arm === isCurrentlyArmed;
      const armLevelSuccessful = this.params.armLevel ? this.params.armLevel === currentLevel : true;
      if (!armStatusSuccessful || !armLevelSuccessful) {
        if (!this.params.arm) {
          throw { errorCode: 'disarmFailure' };
        } else {
          const report = securitySystem.getStatusReport();
          if (report.length) {
            return {
              ids: [this.device.id],
              status: 'EXCEPTIONS',
              states: Object.assign({ online: true, currentStatusReport: report }, securitySystem.state)
            };
          }
          throw { errorCode: 'armFailure' };
        }
      }
    } else {
      if (this.params.arm !== (item.state === (this.isInverted ? 'OFF' : 'ON'))) {
        throw { errorCode: this.params.arm ? 'armFailure' : 'disarmFailure' };
      }
    }
  }
}

module.exports = ArmDisarm;
