const DefaultDevice = require('./default.js');

class DynamicModesDevice extends DefaultDevice {
  get traits() {
    return ['action.devices.traits.Modes'];
  }

  get requiredItemTypes() {
    return ['Group'];
  }

  get supportedMembers() {
    return [
      { name: 'modesCurrentMode', types: ['String', 'Number'] },
      { name: 'modesSettings', types: ['String'] }
    ];
  }

  get validDeviceType() {
    return super.validDeviceType && !!this.attributes.availableModes;
  }

  get attributes() {
    if (!this.config.mode || !('modesSettings' in this.members) || !this.members.modesSettings.state.includes('=')) {
      return {};
    }
    const modeNames = this.config.mode.split(',').map((s) => s.trim());
    const attributes = {
      availableModes: [
        {
          name: modeNames[0],
          name_values: [
            {
              name_synonym: modeNames,
              lang: this.config.lang || 'en'
            }
          ],
          settings: [],
          ordered: this.config.ordered === true
        }
      ]
    };
    this.members.modesSettings.state.split(',').forEach((setting) => {
      try {
        const [settingName, settingSynonyms] = setting
          .trim()
          .split('=')
          .map((s) => s.trim());
        attributes.availableModes[0].settings.push({
          setting_name: settingName,
          setting_values: [
            {
              setting_synonym: [settingName].concat(settingSynonyms.split(':').map((s) => s.trim())),
              lang: this.config.lang || 'en'
            }
          ]
        });
      } catch {}
    });
    return attributes;
  }

  get state() {
    const state = {};
    if (this.config.mode && 'modesCurrentMode' in this.members) {
      const modeNames = this.config.mode.split(',').map((s) => s.trim());
      state.currentModeSettings = {
        [modeNames[0]]: this.members.modesCurrentMode.state
      };
    }
    return state;
  }
}

module.exports = DynamicModesDevice;
