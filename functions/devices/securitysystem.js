const DefaultDevice = require('./default.js');

const memberArmed = 'securitySystemArmed';
const memberArmLevel = 'securitySystemArmLevel';
const memberZone = 'securitySystemZone';
const memberTrouble = 'securitySystemTrouble';
const memberErrorCode = 'securitySystemTroubleCode';
const zoneStateActive = ['ON', 'OPEN'];

class SecuritySystem extends DefaultDevice {
  get type() {
    return 'action.devices.types.SECURITYSYSTEM';
  }

  get traits() {
    return ['action.devices.traits.ArmDisarm', 'action.devices.traits.StatusReport'];
  }

  static get armedMemberName() {
    return memberArmed;
  }

  static get armLevelMemberName() {
    return memberArmLevel;
  }

  get requiredItemTypes() {
    return ['Group'];
  }

  get supportedMembers() {
    return [
      { name: memberArmed, types: ['Switch'] },
      { name: memberArmLevel, types: ['String'] },
      { name: memberZone, types: ['Contact'] },
      { name: memberTrouble, types: ['Switch'] },
      { name: memberErrorCode, types: ['String'] }
    ];
  }

  get validDeviceType() {
    return super.validDeviceType && Object.keys(this.members).length > 0;
  }

  get attributes() {
    const config = this.config;
    if ('armLevels' in config) {
      const attributes = {
        availableArmLevels: {
          levels: [],
          ordered: config.ordered === true
        }
      };
      attributes.availableArmLevels.levels = config.armLevels
        .split(',')
        .map((level) => level.split('='))
        .map(([levelName, levelSynonym]) => {
          return {
            level_name: levelName,
            level_values: [
              {
                level_synonym: [levelSynonym],
                lang: config.lang || 'en'
              }
            ]
          };
        });
      return attributes;
    }
    return {};
  }

  getMembers() {
    this._members = {};
    if (this.item.members && this.item.members.length) {
      this.item.members.forEach((member) => {
        if (member.metadata && member.metadata.ga) {
          const supportedMember = this.supportedMembers.find((m) => {
            const memberType = (member.groupType || member.type || '').split(':')[0];
            return m.types.includes(memberType) && member.metadata.ga.value.toLowerCase() === m.name.toLowerCase();
          });
          if (supportedMember) {
            const memberDetails = {
              name: member.name,
              state: member.state,
              config: (member && member.metadata && member.metadata.ga && member.metadata.ga.config) || {}
            };
            if (supportedMember.name === memberZone) {
              this._members.zones = this._members.zones || [];
              this._members.zones.push(memberDetails);
            } else {
              this._members[supportedMember.name] = memberDetails;
            }
          }
        }
      });
    }
    return this._members;
  }

  get state() {
    const state = {
      isArmed: false
    };

    const members = this.members;
    if (memberArmed in members) {
      state.isArmed = members[memberArmed].state === 'ON';
      if (state.isArmed && memberArmLevel in members) {
        state.currentArmLevel = members[memberArmLevel].state;
      }
      state.currentStatusReport = this.getStatusReport();
    }

    if (this.config.inverted === true) {
      state.isArmed = !state.isArmed;
    }

    return state;
  }

  getStatusReport() {
    const report = [];
    const isTrouble = memberTrouble in this.members && this.members[memberTrouble].state === 'ON';

    if (isTrouble) {
      report.push({
        blocking: false,
        deviceTarget: this.item.name,
        priority: 0,
        statusCode: (memberErrorCode in this.members && this.members[memberErrorCode].state) || 'noIssuesReported'
      });
    }

    if (this.members.zones) {
      for (const zone of this.members.zones) {
        if (zoneStateActive.includes(zone.state)) {
          let statusCode = 'notSupported';
          switch (zone.config.zoneType) {
            case 'OpenClose':
              statusCode = 'deviceOpen';
              break;
            case 'Motion':
              statusCode = 'motionDetected';
              break;
          }
          report.push({
            blocking: zone.config.blocking === true,
            deviceTarget: zone.name,
            priority: 1,
            statusCode: statusCode
          });
        }
      }
    }

    return report;
  }
}

module.exports = SecuritySystem;
