/**
 * Copyright (c) 2010-2019 Contributors to the openHAB project
 *
 * See the NOTICE file(s) distributed with this work for additional
 * information.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0
 *
 * SPDX-License-Identifier: EPL-2.0
 */

/**
 * openHAB handler for incoming intents from Google Assistant platform
 *
 * @author Mehmet Arziman - Initial contribution
 * @author Michael Krug - Rework
 *
 */
const { v4: uuidv4 } = require('uuid');
const getDeviceForItem = require('./devices').getDeviceForItem;
const getCommandType = require('./commands').getCommandType;

class OpenHAB {
  /**
   * @param {object} apiHandler
   */
  constructor(apiHandler) {
    this._apiHandler = apiHandler;
  }

  static uuid() {
    return uuidv4();
  }

  /**
   * @param {object} headers
   */
  setTokenFromHeader(headers) {
    this._apiHandler.authToken = headers.authorization ? headers.authorization.split(' ')[1] : null;
  }

  onDisconnect() {
    return {};
  }

  /**
   * @param {object} body
   * @param {object} headers
   */
  async onSync(body, headers) {
    console.log('openhabGoogleAssistant - onSync');

    this.setTokenFromHeader(headers);

    const payload = await this.handleSync().catch(() => ({
      errorCode: 'actionNotAvailable',
      status: 'ERROR',
      devices: []
    }));

    return {
      requestId: body.requestId,
      payload: Object.assign({ agentUserId: this._apiHandler._openhabUser }, payload)
    };
  }

  /**
   * @param {object} body
   * @param {object} headers
   */
  async onQuery(body, headers) {
    const devices =
      (body && body.inputs && body.inputs[0] && body.inputs[0].payload && body.inputs[0].payload.devices) || [];

    console.log(`openhabGoogleAssistant - onQuery - devices: ${JSON.stringify(devices)}`);

    this.setTokenFromHeader(headers);

    const payload = await this.handleQuery(devices).catch(() => ({
      errorCode: 'actionNotAvailable',
      status: 'ERROR',
      devices: {}
    }));

    return {
      requestId: body.requestId,
      payload: payload
    };
  }

  /**
   * @param {object} body
   * @param {object} headers
   */
  async onExecute(body, headers) {
    const commands =
      (body && body.inputs && body.inputs[0] && body.inputs[0].payload && body.inputs[0].payload.commands) || [];

    console.log(`openhabGoogleAssistant - onExecute - commands: ${JSON.stringify(commands)}`);

    this.setTokenFromHeader(headers);

    const payload = await this.handleExecute(commands).catch(() => ({
      errorCode: 'actionNotAvailable',
      status: 'ERROR',
      commands: []
    }));

    return {
      requestId: body.requestId,
      payload: payload
    };
  }

  async handleSync() {
    const result = await this._apiHandler.getItems().then((items) => {
      const discoveredDevicesList = [];
      items = items.filter((item) => item.metadata && item.metadata.ga);
      items.forEach((item) => {
        item.members = items.filter((member) => member.groupNames && member.groupNames.includes(item.name));
        const device = getDeviceForItem(item);
        if (device) {
          console.log(
            `openhabGoogleAssistant - handleSync - SYNC is adding: ${item.type}:${item.name}` +
              ` with type: ${device.type}`
          );
          discoveredDevicesList.push(device.metadata);
        }
      });
      return { devices: discoveredDevicesList };
    });
    return result;
  }

  /**
   * @param {array} devices
   */
  async handleQuery(devices) {
    const payload = { devices: {} };
    const promises = devices.map((queryDevice) =>
      this._apiHandler
        .getItem(queryDevice.id)
        .then((item) => {
          const device = getDeviceForItem(item);
          if (!device) {
            throw { statusCode: 404, message: `Device type not found for item: ${item.type} ${item.name}` };
          }
          if (item.state === 'NULL' && !device.supportedMembers.length) {
            throw { statusCode: 406, message: `Item state is NULL: ${item.type} ${item.name}` };
          }
          payload.devices[queryDevice.id] = Object.assign({ status: 'SUCCESS', online: true }, device.state);
        })
        .catch((error) => {
          console.error(`openhabGoogleAssistant - handleQuery - getItem: ERROR ${JSON.stringify(error)}`);
          payload.devices[queryDevice.id] = {
            status: 'ERROR',
            errorCode:
              error.statusCode == 404 ? 'deviceNotFound' : error.statusCode == 406 ? 'deviceNotReady' : 'deviceOffline'
          };
        })
    );

    await Promise.all(promises);
    return payload;
  }

  /**
   * @param {array} commands
   */
  async handleExecute(commands) {
    const promises = [];
    commands.forEach((command) => {
      command.execution.forEach((execution) => {
        // Special handling of ThermostatTemperatureSetRange that requires updating two values
        if (execution.command === 'action.devices.commands.ThermostatTemperatureSetRange') {
          const SetHigh = getCommandType('action.devices.commands.ThermostatTemperatureSetpointHigh', execution.params);
          const SetLow = getCommandType('action.devices.commands.ThermostatTemperatureSetpointLow', execution.params);
          if (SetHigh && SetLow) {
            promises.push(
              SetHigh.execute(this._apiHandler, command.devices, execution.params, execution.challenge).then(() => {
                return SetLow.execute(this._apiHandler, command.devices, execution.params, execution.challenge);
              })
            );
            return;
          }
        }
        const CommandType = getCommandType(execution.command, execution.params);
        if (!CommandType) {
          console.error(
            `openhabGoogleAssistant - handleExecute - functionNotSupported: ERROR ${JSON.stringify(execution)}`
          );
          promises.push(
            Promise.resolve({
              ids: command.devices.map((device) => device.id),
              status: 'ERROR',
              errorCode: 'functionNotSupported'
            })
          );
          return;
        }
        promises.push(this.execute(CommandType, command.devices, execution.params, execution.challenge));
      });
    });

    const responseDetails = await Promise.all(promises);
    let responses = [];
    responseDetails.forEach((response) => (responses = responses.concat(response)));
    return { commands: responses };
  }

  /**
   * @param {object} commandType
   * @param {array} devices
   * @param {object} params
   * @param {object} challenge
   */
  async execute(commandType, devices, params, challenge) {
    const promises = devices.map((device) => {
      const command = new commandType(device, params, challenge);
      return command.execute(this._apiHandler);
    });
    const responseDetails = await Promise.all(promises);
    let responses = [];
    responseDetails.forEach((response) => (responses = responses.concat(response)));
    return responses;
  }

  /**
   * @param {object} req
   * @param {object} res
   * @param {object} homegraphClient
   */
  async onStateReport(req, res, homegraphClient) {
    try {
      const userId = req.headers['x-openhab-user'];
      const result = await this.handleStateReport(req.body, userId, homegraphClient);
      console.log(JSON.stringify(result));
      res.json(result.statusText);
    } catch (error) {
      console.log(JSON.stringify(error));
      res.json({
        status: 'ERROR',
        errorCode: !error.statusCode ? error : error.statusCode == 404 ? 'deviceNotFound' : 'deviceNotReady'
      });
    }
  }

  /**
   * @param {object} item
   * @param {string} userId
   * @param {object} homegraphClient
   */
  async handleStateReport(item, userId, homegraphClient) {
    const device = getDeviceForItem(item);
    if (!device) {
      throw { statusCode: 404 };
    }
    if (item.state === 'NULL' && !device.supportedMembers.length) {
      throw { statusCode: 406 };
    }
    const payload = { devices: { states: {}, notifications: {} } };
    const state = device.state;
    const notification = device.getNotification();
    if (!Object.keys(state).length && !Object.keys(notification).length) {
      return { statusText: 'OK' };
    }
    if (Object.keys(state).length) {
      payload.devices.states[item.name] = state;
    }
    if (Object.keys(notification).length) {
      payload.devices.notifications[item.name] = notification;
    }
    return homegraphClient.devices.reportStateAndNotification({
      requestBody: {
        requestId: OpenHAB.uuid(),
        eventId: OpenHAB.uuid(),
        agentUserId: userId,
        payload: payload
      }
    });
  }
}

module.exports = OpenHAB;
