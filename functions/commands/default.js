/* eslint-disable no-unused-vars */
/// <reference path="../../typedefs.js" />
const getDevice = require('../devices').getDevice;

class DefaultCommand {
  /**
   * @param {ExecuteIntentCommandExecutionParams} params
   * @param {ExecuteIntentCommandDevice} device
   * @param {ExecuteIntentCommandExecutionChallenge} [challenge]
   */
  constructor(params = {}, device = { id: '', customData: {} }, challenge) {
    this._params = params;
    this._device = device;
    this._challenge = challenge;
    this._customData = device.customData || {};
  }

  /**
   * @returns {string}
   */
  get type() {
    return '';
  }

  /**
   * @returns {ExecuteIntentCommandExecutionParams}
   */
  get params() {
    return this._params;
  }

  /**
   * @returns {ExecuteIntentCommandDevice}
   */
  get device() {
    return this._device;
  }
  /**
   * @returns {ExecuteIntentCommandExecutionChallenge}
   */
  get challenge() {
    return this._challenge;
  }

  /**
   * @returns {Object}
   */
  get customData() {
    return this._customData;
  }

  /**
   * @returns {string}
   */
  get itemName() {
    return this.device.id;
  }

  /**
   * @returns {string}
   */
  get deviceType() {
    return this.customData.deviceType || '';
  }

  /**
   * @returns {string}
   */
  get itemType() {
    return this.customData.itemType || '';
  }

  /**
   * @returns {Object}
   */
  get members() {
    return this.customData.members || {};
  }

  /**
   * @returns {boolean}
   */
  get hasMembers() {
    return Object.keys(this.members).length > 0;
  }

  /**
   * @returns {boolean}
   */
  get isInverted() {
    return !!(this.customData.inverted === true);
  }

  /**
   * @returns {boolean}
   */
  get requiresItem() {
    return false;
  }

  /**
   * @returns {boolean}
   */
  get hasValidParams() {
    return true;
  }

  /**
   * @returns {boolean}
   */
  get requiresUpdateValidation() {
    return false;
  }

  /**
   * Is the requested new state valid
   * @param {Item} item Current state of item
   * @returns {boolean} true if state change is valid otherwise throws error
   */
  validateStateChange(item) {
    return true;
  }

  /**
   * Check if new state is as expected
   * @param {Item} item
   * @return {ExecuteResponsePayloadCommand|void} Error message if state update failed. Null if all ok
   */
  validateUpdate(item) {
    return;
  }

  /**
   * @param {Item} item
   * @returns {string}
   */
  convertParamsToValue(item) {
    return null;
  }

  /**
   * @param {Item} item
   * @returns {Object}
   */
  getResponseStates(item) {
    return {};
  }

  /**
   * Allow individual commands to choose when to enforce the pin
   * e.g. Security System only enforcing for disarming but not arming
   * @returns {boolean}
   */
  get bypassPin() {
    return false;
  }

  /**
   * @returns {ExecuteResponsePayloadCommand}
   */
  handleAuthPin() {
    const pinRequired = this.customData.pinNeeded || this.customData.tfaPin;
    const pinReceived = this.challenge && this.challenge.pin;

    if (this.bypassPin || !pinRequired || pinRequired === pinReceived) {
      return;
    }

    return {
      ids: [this.device.id],
      status: 'ERROR',
      errorCode: 'challengeNeeded',
      challengeNeeded: {
        type: !this.challenge || !this.challenge.pin ? 'pinNeeded' : 'challengeFailedPinNeeded'
      }
    };
  }

  /**
   * @param {Object} responseStates
   * @returns {ExecuteResponsePayloadCommand}
   */
  handleAuthAck(responseStates) {
    if (!(this.customData.ackNeeded || this.customData.tfaAck) || (this.challenge && this.challenge.ack === true)) {
      return;
    }
    return {
      ids: [this.device.id],
      status: 'ERROR',
      states: responseStates,
      errorCode: 'challengeNeeded',
      challengeNeeded: {
        type: 'ackNeeded'
      }
    };
  }

  /**
   * Returns an async timeout of the configured waitForStateChange in seconds
   * @returns {Promise<NodeJS.Timeout>}
   * @private
   */
  async waitForStateChange() {
    const secondsToWait = this.customData.waitForStateChange || 0;
    if (secondsToWait === 0) {
      return;
    }

    console.log(`openhabGoogleAssistant - ${this.type}: Waiting ${secondsToWait} second(s) for state to update`);
    await new Promise((resolve) => setTimeout(resolve, secondsToWait * 1000));
    console.log(`openhabGoogleAssistant - ${this.type}: Finished Waiting`);
  }

  /**
   * Returns an async timeout of the configured waitForStateChange in seconds
   * @returns {Promise<ExecuteResponsePayloadCommand>}
   * @private
   */
  async handleUpdateValidation(apiHandler) {
    await this.waitForStateChange();
    const item = await apiHandler.getItem(this.device.id);
    const validateUpdateResponse = this.validateUpdate(this.params);
    if (validateUpdateResponse) {
      return validateUpdateResponse;
    } else {
      const deviceType = getDevice(this.device.customData.deviceType);
      if (!deviceType) {
        throw { statusCode: 404 };
      }
      const deviceInstance = new deviceType(item);
      if (!deviceInstance.validItemType || !deviceInstance.validDeviceType) {
        throw { statusCode: 404 };
      }
      return {
        ids: [this.device.id],
        status: 'SUCCESS',
        states: Object.assign({ online: true }, deviceInstance.state)
      };
    }
  }

  /**
   * returns true if the command requires active acknowledgement
   * @returns {boolean}
   * @private
   */
  get needsAcknowledgement() {
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
    return (
      ackSupported.includes(this.type) &&
      (this.customData.ackNeeded || this.customData.tfaAck) &&
      !(this.challenge && this.challenge.ack)
    );
  }

  /**
   * @returns {boolean}
   * @private
   */
  get willGetItem() {
    return this.requiresItem || this.needsAcknowledgement || this.requiresUpdateValidation;
  }

  /**
   * @param {Item} item
   * @returns {void}
   * @private
   */
  getMembersAsFallback(item) {
    if (this.requiresItem && !this.device.customData.members) {
      const deviceType = getDevice(this.device.customData.deviceType);
      if (!deviceType) {
        throw { statusCode: 400 };
      }
      const deviceInstance = new deviceType(item);
      if (deviceInstance.supportedMembers.length) {
        const members = deviceInstance.members;
        this._customData.members = {};
        for (const member in members) {
          this._customData.members[member] = members[member].name;
        }
      }
    }
  }

  /**
   * Execute the command including checking for pin, ack and update validation
   * @param {Object} apiHandler
   * @returns {Promise<ExecuteResponsePayloadCommand>}
   */
  async execute(apiHandler) {
    const authPinResponse = this.handleAuthPin();
    if (authPinResponse) {
      return authPinResponse;
    }

    try {
      const item = this.willGetItem ? await apiHandler.getItem(this.device.id) : { name: this.device.id };

      // fallback for commands executed on devices that did not have their members attached in customData yet
      this.getMembersAsFallback(item);

      this.validateStateChange(item);

      const responseStates = this.getResponseStates(item);
      if (Object.keys(responseStates).length) {
        responseStates.online = true;
      }

      const authAckResponse = this.handleAuthAck(responseStates);
      if (authAckResponse) {
        return authAckResponse;
      }

      const targetItem = this.itemName;
      const targetValue = this.convertParamsToValue(item);
      let sendCommandPromise = Promise.resolve();
      if (typeof targetItem === 'string' && typeof targetValue === 'string') {
        sendCommandPromise = apiHandler.sendCommand(targetItem, targetValue, this.device.id);
      }

      await sendCommandPromise;
      if (this.requiresUpdateValidation) {
        return await this.handleUpdateValidation(apiHandler);
      } else {
        return {
          ids: [this.device.id],
          status: 'SUCCESS',
          states: responseStates
        };
      }
    } catch (error) {
      console.error(`openhabGoogleAssistant - ${this.type}: ERROR ${JSON.stringify(error)}`);
      return {
        ids: [this.device.id],
        status: 'ERROR',
        errorCode:
          typeof error.errorCode === 'string'
            ? error.errorCode
            : error.statusCode == 404
            ? 'deviceNotFound'
            : error.statusCode == 400
            ? 'notSupported'
            : 'deviceOffline'
      };
    }
  }
}

module.exports = DefaultCommand;
