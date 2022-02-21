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
/// <reference path="../typedefs.js" />
const { v4: uuidv4 } = require('uuid');
const getDeviceForItem = require('./devices').getDeviceForItem;
const getCommandType = require('./commands').getCommandType;

class OpenHAB {
  /**
   * @param {Object} apiHandler
   */
  constructor(apiHandler) {
    this._apiHandler = apiHandler;
  }

  /**
   * @returns {string}
   */
  static uuid() {
    return uuidv4();
  }

  /**
   * @param {Object} headers
   */
  setTokenFromHeader(headers) {
    this._apiHandler.authToken = headers.authorization ? headers.authorization.substr(7) : null;
  }

  /**
   * @returns {Object}
   */
  onDisconnect() {
    return {};
  }

  /**
   * @param {SyncIntent} body
   * @param {Object} headers
   * @returns {Promise<SyncResponse>}
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
   * @param {QueryIntent} body
   * @param {Object} headers
   * @returns {Promise<QueryResponse>}
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
   * @param {ExecuteIntent} body
   * @param {Object} headers
   * @returns {Promise<ExecuteResponse>}
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

  /**
   * @returns {Promise<SyncResponsePayload>}
   */
  async handleSync() {
    const result = await this._apiHandler.getItems().then((/** @type {Item[]} */ items) => {
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
   * @param {QueryIntentDevice[]} devices
   * @returns {Promise<QueryResponsePayload>}
   */
  async handleQuery(devices) {
    const payload = { devices: {} };
    for (const queryDevice of devices) {
      try {
        const item = await this._apiHandler.getItem(queryDevice.id);
        const device = getDeviceForItem(item);
        if (!device) {
          throw { statusCode: 404, message: `Device type not found for item: ${item.type} ${item.name}` };
        }
        if (item.state === 'NULL' && !device.supportedMembers.length) {
          throw { statusCode: 406, message: `Item state is NULL: ${item.type} ${item.name}` };
        }
        payload.devices[queryDevice.id] = Object.assign({ status: 'SUCCESS', online: true }, device.state);
      } catch (error) {
        console.error(`openhabGoogleAssistant - handleQuery - getItem: ERROR ${JSON.stringify(error)}`);
        payload.devices[queryDevice.id] = {
          status: 'ERROR',
          errorCode:
            error.statusCode == 404 ? 'deviceNotFound' : error.statusCode == 406 ? 'deviceNotReady' : 'deviceOffline'
        };
      }
    }
    return payload;
  }

  /**
   * @param {ExecuteIntentCommand[]} commands
   * @returns {Promise<ExecuteResponsePayload>}
   */
  async handleExecute(commands) {
    const /** @type {ExecuteResponsePayloadCommand[]} */ responses = [];
    for (const command of commands) {
      for (const execution of command.execution) {
        try {
          // Special handling of ThermostatTemperatureSetRange that requires updating two values
          if (execution.command === 'action.devices.commands.ThermostatTemperatureSetRange') {
            const SetHigh = getCommandType(
              'action.devices.commands.ThermostatTemperatureSetpointHigh',
              execution.params
            );
            const SetLow = getCommandType('action.devices.commands.ThermostatTemperatureSetpointLow', execution.params);
            if (SetHigh && SetLow) {
              await this.execute(SetHigh, command.devices, execution.params, execution.challenge);
              responses.push(...(await this.execute(SetLow, command.devices, execution.params, execution.challenge)));
            }
          } else {
            const CommandType = getCommandType(execution.command, execution.params);
            if (!CommandType) {
              console.error(
                `openhabGoogleAssistant - handleExecute - functionNotSupported: ERROR ${JSON.stringify(execution)}`
              );
              throw {};
            }
            responses.push(
              ...(await this.execute(CommandType, command.devices, execution.params, execution.challenge))
            );
          }
        } catch (error) {
          responses.push({
            ids: command.devices.map((device) => device.id),
            status: 'ERROR',
            errorCode: 'functionNotSupported'
          });
        }
      }
    }

    return { commands: responses };
  }

  /**
   * @param {Object} commandType
   * @param {ExecuteIntentCommandDevice[]} devices
   * @param {ExecuteIntentCommandExecutionParams} params
   * @param {ExecuteIntentCommandExecutionChallenge} challenge
   * @returns {Promise<ExecuteResponsePayloadCommand[]>}
   */
  async execute(commandType, devices, params, challenge) {
    const /** @type {ExecuteResponsePayloadCommand[]} */ responses = [];
    for (const device of devices) {
      responses.push(await new commandType(params, device, challenge).execute(this._apiHandler));
    }
    return responses;
  }

  /**
   * @param {Object} req
   * @param {Object} res
   * @param {Object} homegraphClient
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
   * @param {Item} item
   * @param {string} userId
   * @param {Object} homegraphClient
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
