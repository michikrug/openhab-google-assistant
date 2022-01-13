/* eslint-disable no-unused-vars */
const packageVersion = require('../package.json').version;

class DefaultDevice {
  constructor(item) {
    this._item = item;
    this._metadata = (item && item.metadata && item.metadata.ga) || {};
  }

  get item() {
    return this._item;
  }

  get config() {
    return this._metadata.config || {};
  }

  get itemType() {
    return (this.item.groupType || this.item.type || '').split(':')[0];
  }

  get deviceType() {
    return this._metadata.value || '';
  }

  get validItemType() {
    return !!(!this.requiredItemTypes.length || this.requiredItemTypes.includes(this.itemType));
  }

  get type() {
    return '';
  }

  get traits() {
    return [];
  }

  get requiredItemTypes() {
    return [];
  }

  get validDeviceType() {
    return !!(this.type.toLowerCase() === `action.devices.types.${this.deviceType}`.toLowerCase());
  }

  get attributes() {
    return {};
  }

  get metadata() {
    const config = this.config;
    const deviceName = config.name || this.item.label || this.item.name;
    const metadata = {
      id: this.item.name,
      type: this.type,
      traits: this.traits,
      name: {
        name: deviceName,
        defaultNames: [deviceName],
        nicknames: [
          deviceName,
          ...(this.item.metadata && this.item.metadata.synonyms
            ? this.item.metadata.synonyms.value.split(',').map((s) => s.trim())
            : [])
        ]
      },
      willReportState: config.reportState === true,
      notificationSupportedByAgent: true,
      roomHint: config.roomHint,
      structureHint: config.structureHint,
      deviceInfo: {
        manufacturer: 'openHAB',
        model: `${this.itemType}:${this.item.name}`,
        hwVersion: '3.0.0',
        swVersion: packageVersion
      },
      attributes: this.attributes,
      customData: {
        deviceType: this.constructor.name,
        itemType: this.itemType
      }
    };
    if (config.inverted === true) {
      metadata.customData.inverted = true;
    }
    if (config.ackNeeded === true || config.tfaAck === true) {
      metadata.customData.ackNeeded = true;
    }
    if (typeof config.pinNeeded === 'string' || typeof config.tfaPin === 'string') {
      metadata.customData.pinNeeded = config.pinNeeded || config.tfaPin;
      if (config.pinOnDisarmOnly === true) {
        metadata.customData.pinOnDisarmOnly = true;
      }
    }
    if (config.waitForStateChange) {
      metadata.customData.waitForStateChange = parseInt(config.waitForStateChange);
    }
    if (this.supportedMembers.length) {
      const members = this.members;
      metadata.customData.members = {};
      for (const member in members) {
        metadata.customData.members[member] = members[member].name;
      }
    }
    return metadata;
  }

  get state() {
    return {};
  }

  getNotification() {
    return {};
  }

  get supportedMembers() {
    return [];
  }

  get members() {
    if (this._members && Object.keys(this._members).length > 0) return this._members;
    const supportedMembers = this.supportedMembers;
    const members = {};
    if (this.item.members && this.item.members.length && supportedMembers.length) {
      this.item.members.forEach((member) => {
        if (member.metadata && member.metadata.ga) {
          const memberType = supportedMembers.find((m) => {
            const memberType = (member.groupType || member.type || '').split(':')[0];
            return m.types.includes(memberType) && member.metadata.ga.value.toLowerCase() === m.name.toLowerCase();
          });
          if (memberType) {
            members[memberType.name] = { name: member.name, state: member.state };
          }
        }
      });
    }
    this._members = members;
    return members;
  }
}

module.exports = DefaultDevice;
