const DefaultDevice = require('./default.js');

class TV extends DefaultDevice {
  get type() {
    return 'action.devices.types.TV';
  }

  get traits() {
    const traits = [];
    const members = this.members;
    if ('tvPower' in members) traits.push('action.devices.traits.OnOff');
    if ('tvMute' in members || 'tvVolume' in members) traits.push('action.devices.traits.Volume');
    if ('tvChannel' in members) traits.push('action.devices.traits.Channel');
    if ('tvInput' in members) traits.push('action.devices.traits.InputSelector');
    if ('tvTransport' in members)
      traits.push('action.devices.traits.TransportControl', 'action.devices.traits.MediaState');
    if ('tvApplication' in members) traits.push('action.devices.traits.AppSelector');
    return traits;
  }

  get requiredItemTypes() {
    return ['Group'];
  }

  get supportedMembers() {
    return [
      { name: 'tvApplication', types: ['Number', 'String'] },
      { name: 'tvChannel', types: ['Number', 'String'] },
      { name: 'tvVolume', types: ['Number', 'Dimmer'] },
      { name: 'tvInput', types: ['Number', 'String'] },
      { name: 'tvTransport', types: ['Player'] },
      { name: 'tvPower', types: ['Switch'] },
      { name: 'tvMute', types: ['Switch'] }
    ];
  }

  get validDeviceType() {
    return super.validDeviceType && Object.keys(this.members).length > 0;
  }

  get attributes() {
    const config = this.config;
    const members = this.members;
    const attributes = {
      volumeCanMuteAndUnmute: 'tvMute' in members
    };
    if ('tvVolume' in members) {
      attributes.volumeMaxLevel = 100;
      if ('volumeMaxLevel' in config) {
        attributes.volumeMaxLevel = Number(config.volumeMaxLevel);
      }
      if ('volumeDefaultPercentage' in config) {
        attributes.volumeDefaultPercentage = Number(config.volumeDefaultPercentage);
      }
      if ('levelStepSize' in config) {
        attributes.levelStepSize = Number(config.levelStepSize);
      }
    }
    if ('tvTransport' in members) {
      attributes.supportPlaybackState = true;
      attributes.transportControlSupportedCommands = ['NEXT', 'PREVIOUS', 'PAUSE', 'RESUME'];
      if ('transportControlSupportedCommands' in config) {
        attributes.transportControlSupportedCommands = config.transportControlSupportedCommands
          .split(',')
          .map((s) => s.toUpperCase());
      }
    }
    if ('tvInput' in members && 'availableInputs' in config) {
      attributes.availableInputs = [];
      config.availableInputs.split(',').forEach((input) => {
        const [key, synonyms] = input.split('=');
        attributes.availableInputs.push({
          key: key,
          names: [
            {
              name_synonym: synonyms.split(':'),
              lang: config.lang || 'en'
            }
          ]
        });
      });
      attributes.orderedInputs = config.orderedInputs === true;
    }
    if ('tvChannel' in members && 'availableChannels' in config) {
      attributes.availableChannels = [];
      config.availableChannels.split(',').forEach((channel) => {
        const [number, key, names] = channel.split('=');
        attributes.availableChannels.push({
          key: key,
          names: names.split(':'),
          number: number
        });
      });
    }
    if ('tvApplication' in members && 'availableApplications' in config) {
      attributes.availableApplications = [];
      config.availableApplications.split(',').forEach((application) => {
        const [key, synonyms] = application.split('=');
        attributes.availableApplications.push({
          key: key,
          names: [
            {
              name_synonym: synonyms.split(':'),
              lang: config.lang || 'en'
            }
          ]
        });
      });
    }
    return attributes;
  }

  get state() {
    const state = {};
    const members = this.members;
    for (const member in members) {
      switch (member) {
        case 'tvPower':
          state.on = members[member].state === 'ON';
          break;
        case 'tvMute':
          state.isMuted = members[member].state === 'ON';
          break;
        case 'tvInput':
          state.currentInput = members[member].state;
          break;
        case 'tvTransport':
          state.playbackState = members[member].state;
          break;
        case 'tvVolume':
          state.currentVolume = Number(members[member].state) || 0;
          break;
        case 'tvChannel':
          state.channelNumber = members[member].state;
          try {
            state.channelName = this.channelMap[members[member].state][0];
          } catch (error) {
            //
          }
          break;
        case 'tvApplication':
          state.currentApplication = members[member].state;
      }
    }
    return state;
  }

  get channelMap() {
    const channelMap = {};
    if ('availableChannels' in this.config) {
      this.config.availableChannels.split(',').forEach((channel) => {
        const [number, key, names] = channel.split('=');
        channelMap[number] = [...names.split(':'), key];
      });
    }
    return channelMap;
  }

  get applicationMap() {
    const applicationMap = {};
    if ('availableApplications' in this.config) {
      this.config.availableApplications.split(',').forEach((application) => {
        const [key, synonyms] = application.split('=');
        applicationMap[key] = [...synonyms.split(':'), key];
      });
    }
    return applicationMap;
  }
}

module.exports = TV;
