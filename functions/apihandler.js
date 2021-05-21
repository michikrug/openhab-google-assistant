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
 * openHAB REST API handler for requests towards the openHAB REST API
 *
 * @author Mehmet Arziman - Initial contribution
 * @author Michael Krug - Rework
 *
 */
const http = require('http');
const https = require('https');

class ApiHandler {
  /**
   * @param {object} config
   */
  constructor(config = { host: '', path: '/rest/items/', port: 80 }) {
    if (!config.path.startsWith('/')) {
      config.path = '/' + config.path;
    }
    if (!config.path.endsWith('/')) {
      config.path += '/';
    }
    this._config = config;
    this._authToken = '';
    this._openhabUser = '';
    this._cache = {};
  }

  /**
   * @param {string} authToken
   */
  set authToken(authToken) {
    this._authToken = authToken;
  }

  /**
   * @param {object} data
   */
  updateCache(data) {
    if (data.name) {
      this._cache[data.name] = { item: data, timestamp: Date.now() };
    }
  }

  /**
   * @param {string} itemName
   */
  getFromCache(itemName) {
    if (itemName) {
      const cachedItem = this._cache[itemName];
      if (cachedItem && Date.now() - cachedItem.timestamp < 60 * 1000) {
        return cachedItem.item;
      }
    }
  }

  /**
   * @param {string} method
   * @param {string} itemName
   * @param {number} length
   */
  getOptions(method = 'GET', itemName = '', length = 0) {
    const queryString =
      method === 'GET'
        ? '?metadata=ga,synonyms' + (itemName ? '' : '&fields=groupNames,groupType,name,label,metadata,type,state')
        : '';
    const options = {
      hostname: this._config.host,
      port: this._config.port,
      path: this._config.path + (itemName ? itemName : '') + queryString,
      method: method,
      headers: {
        Accept: 'application/json'
      }
    };

    if (this._config.userpass) {
      options.auth = this._config.userpass;
    } else if (this._authToken) {
      options.headers['Authorization'] = 'Bearer ' + this._authToken;
    }

    if (method === 'POST') {
      options.headers['Content-Type'] = 'text/plain';
      options.headers['Content-Length'] = length;
    }

    return options;
  }

  /**
   * @param {string} itemName
   */
  getItem(itemName = '') {
    const cached = this.getFromCache(itemName);
    if (cached) return Promise.resolve(cached);

    const options = this.getOptions('GET', itemName);
    return new Promise((resolve, reject) => {
      const protocol = options.port === 443 ? https : http;
      const req = protocol.request(options, (response) => {
        if (200 !== response.statusCode) {
          console.error(
            'openhabGoogleAssistant - getItem - failed for path: ' + options.path + ' code: ' + response.statusCode
          );
          reject({ statusCode: response.statusCode, message: 'getItem failed' });
          return;
        }

        response.setEncoding('utf8');
        let body = '';

        this._openhabUser = response.headers['x-openhab-user'];

        response.on('data', (data) => {
          body += data.toString('utf-8');
        });

        response.on('end', () => {
          const data = JSON.parse(body);
          this.updateCache(data);
          resolve(data);
        });
      });
      req.on('error', reject);
      req.end();
    });
  }

  getItems() {
    return this.getItem();
  }

  /**
   * @param {string} itemName
   * @param {string} payload
   * @param {string} deviceId
   */
  sendCommand(itemName, payload, deviceId) {
    const options = this.getOptions('POST', itemName, payload.length);
    return new Promise((resolve, reject) => {
      const protocol = options.port === 443 ? https : http;
      const req = protocol.request(options, (response) => {
        if (![200, 201].includes(response.statusCode)) {
          console.error(
            'openhabGoogleAssistant - sendCommand - failed for path: ' + options.path + ' code: ' + response.statusCode
          );
          reject({ statusCode: response.statusCode, message: 'sendCommand failed' });
          return;
        }
        delete this._cache[itemName];
        delete this._cache[deviceId];
        resolve();
      });
      req.on('error', reject);
      req.write(payload);
      req.end();
    });
  }
}

module.exports = ApiHandler;
