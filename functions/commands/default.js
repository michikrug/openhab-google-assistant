const ackSupported = [
  'action.devices.commands.ArmDisarm',
  'action.devices.commands.Fill',
  'action.devices.commands.LockUnlock',
  'action.devices.commands.OnOff',
  'action.devices.commands.OpenClose',
  'action.devices.commands.ActivateScene',
  'action.devices.commands.ThermostatTemperatureSetpoint',
  'action.devices.commands.ThermostatTemperatureSetRange',
  'action.devices.commands.ThermostatSetMode',
  'action.devices.commands.TemperatureRelative'
];

class DefaultCommand {
  static get type() {
    return '';
  }

  static validateParams(params = {}) {
    return false;
  }

  static convertParamsToValue(params = {}, item = {}, device = {}) {
    return null;
  }

  static getResponseStates(params = {}, item = {}) {
    return {};
  }

  static getItemName(item = {}) {
    return item.name;
  }

  static get requiresItem() {
    return false;
  }

  static handlAuthPin(device = {}, challenge = {}) {
    if (!device.customData || !device.customData.pinNeeded || challenge.pin === device.customData.pinNeeded) {
      return;
    }
    return {
      ids: [device.id],
      status: 'ERROR',
      errorCode: 'challengeNeeded',
      challengeNeeded: {
        type: !challenge.pin ? 'pinNeeded' : 'challengeFailedPinNeeded'
      }
    };
  }

  static handlAuthAck(device = {}, challenge = {}, responseStates = {}) {
    if (!device.customData || !device.customData.ackNeeded || challenge.ack === true) {
      return;
    }
    return {
      ids: [device.id],
      status: 'ERROR',
      states: responseStates,
      errorCode: 'challengeNeeded',
      challengeNeeded: {
        type: 'ackNeeded'
      }
    };
  }

  static execute(apiHandler = {}, devices = [], params = {}, challenge = {}) {
    console.log(`openhabGoogleAssistant - ${this.type}: ${JSON.stringify({ devices: devices, params: params })}`);
    const commandsResponse = [];
    const promises = devices.map((device) => {

      const authPinResponse = this.handlAuthPin(device, challenge);
      if (authPinResponse) {
        commandsResponse.push(authPinResponse);
        return Promise.resolve();
      }

      const ackWithState = ackSupported.includes(this.type) && device.customData && device.customData.ackNeeded && !challenge.ack;

      let getItemPromise = Promise.resolve(({ name: device.id }));
      if (this.requiresItem || ackWithState) {
        getItemPromise = apiHandler.getItem(device.id);
      }

      return getItemPromise.then((item) => {
        const responseStates = this.getResponseStates(params, item);
        if (Object.keys(responseStates).length) {
          responseStates.online = true;
        }

        const authAckResponse = this.handlAuthAck(device, challenge, responseStates);
        if (authAckResponse) {
          commandsResponse.push(authAckResponse);
          return;
        }

        const targetItem = this.getItemName(item);
        const targetValue = this.convertParamsToValue(params, item, device);
        let sendCommandPromise = Promise.resolve();
        if (typeof targetItem === 'string' && typeof targetValue === 'string') {
          sendCommandPromise = apiHandler.sendCommand(targetItem, targetValue);
        }
        return sendCommandPromise.then(() => {
          commandsResponse.push({
            ids: [device.id],
            status: 'SUCCESS',
            states: responseStates
          });
        });
      }).catch((error) => {
        console.error(`openhabGoogleAssistant - ${this.type}: ERROR ${JSON.stringify(error)}`);
        commandsResponse.push({
          ids: [device.id],
          status: 'ERROR',
          errorCode: error.statusCode == 404 ? 'deviceNotFound' : error.statusCode == 400 ? 'notSupported' : 'deviceOffline'
        });
      });
    });
    return Promise.all(promises).then(() => commandsResponse);
  }
}

module.exports = DefaultCommand;
