const DefaultDevice = require('./default.js');

class Fan extends DefaultDevice {
  get type() {
    return 'action.devices.types.FAN';
  }

  get traits() {
    const traits = [];
    const members = this.members;
    if (this.itemType === 'Dimmer' || 'fanPower' in members) traits.push('action.devices.traits.OnOff');
    if (this.itemType === 'Dimmer' || 'fanSpeed' in members) traits.push('action.devices.traits.FanSpeed');
    if ('fanMode' in members) traits.push('action.devices.traits.Modes');
    if ('fanFilterLifeTime' in members || 'fanPM25' in members) traits.push('action.devices.traits.SensorState');
    return traits;
  }

  get requiredItemTypes() {
    return ['Group', 'Dimmer'];
  }

  get supportedMembers() {
    return [
      { name: 'fanPower', types: ['Switch'] },
      { name: 'fanSpeed', types: ['Dimmer', 'Number'] },
      { name: 'fanMode', types: ['Number', 'String'] },
      { name: 'fanFilterLifeTime', types: ['Number'] },
      { name: 'fanPM25', types: ['Number'] }
    ];
  }

  get validDeviceType() {
    return super.validDeviceType && (this.itemType === 'Dimmer' || Object.keys(this.members).length > 0);
  }

  get attributes() {
    const config = this.config;
    const members = this.members;
    const attributes = {};
    if (config.fanSpeeds) {
      attributes.availableFanSpeeds = {
        speeds: [],
        ordered: config.ordered === true
      };
      attributes.reversible = false;
      config.fanSpeeds.split(',').forEach((speedEntry) => {
        try {
          const [speedName, speedSynonyms] = speedEntry
            .trim()
            .split('=')
            .map((s) => s.trim());
          attributes.availableFanSpeeds.speeds.push({
            speed_name: speedName,
            speed_values: [
              {
                speed_synonym: speedSynonyms.split(':').map((s) => s.trim()),
                lang: config.lang || 'en'
              }
            ]
          });
        } catch (error) {
          //
        }
      });
    } else {
      attributes.supportsFanSpeedPercent = true;
    }
    if ('fanMode' in members && config.fanModeName && config.fanModeSettings) {
      const modeNames = config.fanModeName.split(',').map((s) => s.trim());
      attributes.availableModes = [
        {
          name: modeNames[0],
          name_values: [
            {
              name_synonym: modeNames,
              lang: config.lang || 'en'
            }
          ],
          settings: [],
          ordered: config.ordered === true
        }
      ];
      config.fanModeSettings.split(',').forEach((setting) => {
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
                lang: config.lang || 'en'
              }
            ]
          });
        } catch (error) {
          //
        }
      });
    }
    // Sensors
    if ('fanFilterLifeTime' in members || 'fanPM25' in members) {
      attributes.sensorStatesSupported = [];
      if ('fanFilterLifeTime' in members) {
        attributes.sensorStatesSupported.push({
          name: 'FilterLifeTime',
          descriptiveCapabilities: {
            availableStates: ['new', 'good', 'replace soon', 'replace now']
          },
          numericCapabilities: {
            rawValueUnit: 'PERCENTAGE'
          }
        });
      }
      if ('fanPM25' in members) {
        attributes.sensorStatesSupported.push({
          name: 'PM2.5',
          numericCapabilities: {
            rawValueUnit: 'MICROGRAMS_PER_CUBIC_METER'
          }
        });
      }
    }
    return attributes;
  }

  get state() {
    if (this.itemType === 'Dimmer') {
      return {
        currentFanSpeedSetting: this.item.state.toString(),
        on: Number(this.item.state) > 0
      };
    } else {
      const state = {};
      const config = this.config;
      const members = this.members;
      if ('fanPower' in members) {
        state.on = members.fanPower.state === 'ON';
      } else if ('fanSpeed' in members) {
        state.on = Number(members.fanSpeed.state) > 0;
      }
      if ('fanSpeed' in members) {
        state.currentFanSpeedSetting = members.fanSpeed.state.toString();
      }
      if ('fanMode' in members && config.fanModeName && config.fanModeSettings) {
        const modeNames = config.fanModeName.split(',').map((s) => s.trim());
        state.currentModeSettings = {
          [modeNames[0]]: members.fanMode.state
        };
      }
      // Sensors
      if ('fanFilterLifeTime' in members || 'fanPM25' in members) {
        state.currentSensorStateData = [];
        if ('fanFilterLifeTime' in members) {
          const itemState = Number(members.fanFilterLifeTime.state);
          state.currentSensorStateData.push({
            name: 'FilterLifeTime',
            currentSensorState: this.translateFilterLifeTime(itemState),
            rawValue: itemState
          });
        }
        if ('fanPM25' in members) {
          state.currentSensorStateData.push({
            name: 'PM2.5',
            rawValue: Number(members.fanPM25.state)
          });
        }
      }
      return state;
    }
  }

  getNotification() {
    const config = this.config;
    const members = this.members;
    if (
      'fanFilterLifeTime' in members &&
      Number(config.fanFilterLifeTimeNotification) >= Number(members.fanFilterLifeTime.state)
    ) {
      return {
        SensorState: {
          priority: 0,
          name: 'FilterLifeTime',
          currentSensorState: this.translateFilterLifeTime(Number(members.fanFilterLifeTime.state))
        }
      };
    }
    if ('fanPM25' in members && Number(config.fanPM25Notification) <= Number(members.fanPM25.state)) {
      return {
        SensorState: {
          priority: 0,
          name: 'PM2.5',
          currentSensorState: Number(members.fanPM25.state)
        }
      };
    }
    return {};
  }

  /**
   * Translate the filter life time to a descriptive state
   * @param {number} state - The filter life time in percent
   * @return {string} - The descriptive state
   * @private
   */
  translateFilterLifeTime(state) {
    const map = [
      { value: 'new', threshold: 90 },
      { value: 'good', threshold: 20 },
      { value: 'replace soon', threshold: 10 },
      { value: 'replace now', threshold: 0 }
    ];
    for (const entry of map) {
      if (state >= entry.threshold) return entry.value;
    }
    return 'unknown';
  }
}

module.exports = Fan;
