const Device = require('../../functions/devices/thermostat.js');

describe('Thermostat Device', () => {
  test('validDeviceType', () => {
    expect(
      new Device({
        metadata: {
          ga: {
            value: 'THERMOSTAT'
          }
        }
      }).validDeviceType
    ).toBe(false);
    expect(
      new Device({
        metadata: {
          ga: {
            value: 'THERMOSTAT'
          }
        },
        members: [
          {
            type: 'Number',
            metadata: {
              ga: {
                value: 'thermostatTemperatureAmbient'
              }
            }
          }
        ]
      }).validDeviceType
    ).toBe(true);
  });

  test('validItemType', () => {
    expect(new Device({ type: 'Number' }).validItemType).toBe(false);
    expect(new Device({ type: 'Group' }).validItemType).toBe(true);
  });

  describe('useFahrenheit', () => {
    test('useFahrenheit thermostatTemperatureUnit', () => {
      const item = {
        metadata: {
          ga: {
            config: {
              thermostatTemperatureUnit: 'F'
            }
          }
        }
      };
      expect(new Device(item).useFahrenheit).toBe(true);
    });
    test('useFahrenheit useFahrenheit', () => {
      const item = {
        metadata: {
          ga: {
            config: {
              useFahrenheit: true
            }
          }
        }
      };
      expect(new Device(item).useFahrenheit).toBe(true);
    });
  });

  describe('get attributes', () => {
    test('get attributes no config', () => {
      const item = {
        metadata: {
          ga: {
            config: {}
          }
        }
      };
      expect(new Device(item).attributes).toStrictEqual({
        availableThermostatModes: ['off', 'heat', 'cool', 'on', 'heatcool', 'auto', 'eco'],
        thermostatTemperatureUnit: 'C'
      });
    });

    test('get attributes modes, fahrenheit', () => {
      const item = {
        metadata: {
          ga: {
            config: {
              modes: 'on=1,off=2',
              useFahrenheit: true
            }
          }
        }
      };
      expect(new Device(item).attributes).toStrictEqual({
        availableThermostatModes: ['on', 'off'],
        thermostatTemperatureUnit: 'F'
      });
    });

    test('get attributes temperaturerange', () => {
      const item = {
        metadata: {
          ga: {
            config: {
              thermostatTemperatureRange: '10,30'
            }
          }
        }
      };
      expect(new Device(item).attributes).toStrictEqual({
        availableThermostatModes: ['off', 'heat', 'cool', 'on', 'heatcool', 'auto', 'eco'],
        thermostatTemperatureUnit: 'C',
        thermostatTemperatureRange: {
          maxThresholdCelsius: 30,
          minThresholdCelsius: 10
        }
      });
    });

    test('get attributes invalid temperaturerange', () => {
      const item = {
        metadata: {
          ga: {
            config: {
              thermostatTemperatureRange: 'a,b'
            }
          }
        }
      };
      expect(new Device(item).attributes).toStrictEqual({
        availableThermostatModes: ['off', 'heat', 'cool', 'on', 'heatcool', 'auto', 'eco'],
        thermostatTemperatureUnit: 'C'
      });
    });

    test('get attributes queryOnly', () => {
      const item = {
        metadata: {
          ga: {
            config: {}
          }
        },
        members: [
          {
            type: 'Number',
            metadata: {
              ga: {
                value: 'thermostatTemperatureAmbient'
              }
            }
          }
        ]
      };
      expect(new Device(item).attributes).toStrictEqual({
        thermostatTemperatureUnit: 'C',
        queryOnlyTemperatureSetting: true
      });
    });
  });

  describe('getMembers', () => {
    expect(new Device({ members: [{}] }).members).toStrictEqual({});
    expect(new Device({ members: [{ metadata: { ga: { value: 'invalid' } } }] }).members).toStrictEqual({});
    test('get members', () => {
      const item = {
        members: [
          {
            name: 'Mode',
            state: 'on',
            type: 'String',
            metadata: {
              ga: {
                value: 'thermostatMode'
              }
            }
          },
          {
            name: 'Setpoint',
            state: '20',
            type: 'Number',
            metadata: {
              ga: {
                value: 'thermostatTemperatureSetpoint'
              }
            }
          },
          {
            name: 'High',
            state: '25',
            type: 'Number',
            metadata: {
              ga: {
                value: 'thermostatTemperatureSetpointHigh'
              }
            }
          },
          {
            name: 'Low',
            state: '5',
            type: 'Number',
            metadata: {
              ga: {
                value: 'thermostatTemperatureSetpointLow'
              }
            }
          },
          {
            name: 'Temperature',
            state: '20',
            type: 'Number',
            metadata: {
              ga: {
                value: 'thermostatTemperatureAmbient'
              }
            }
          },
          {
            name: 'Humidity',
            state: '50',
            type: 'Number',
            metadata: {
              ga: {
                value: 'thermostatHumidityAmbient'
              }
            }
          }
        ]
      };
      expect(new Device(item).members).toStrictEqual({
        thermostatMode: {
          name: 'Mode',
          state: 'on'
        },
        thermostatTemperatureSetpoint: {
          name: 'Setpoint',
          state: '20'
        },
        thermostatTemperatureSetpointHigh: {
          name: 'High',
          state: '25'
        },
        thermostatTemperatureSetpointLow: {
          name: 'Low',
          state: '5'
        },
        thermostatTemperatureAmbient: {
          name: 'Temperature',
          state: '20'
        },
        thermostatHumidityAmbient: {
          name: 'Humidity',
          state: '50'
        }
      });
    });
  });

  test('get modeMap', () => {
    const item = {
      metadata: {
        ga: {
          config: {
            modes: 'on=ON:1,off=OFF:2,auto=3'
          }
        }
      }
    };
    expect(new Device(item).modeMap).toStrictEqual({
      on: ['ON', '1'],
      off: ['OFF', '2'],
      auto: ['3']
    });
    expect(new Device({}).modeMap).toStrictEqual({
      off: ['off'],
      heat: ['heat'],
      cool: ['cool'],
      on: ['on'],
      heatcool: ['heatcool'],
      auto: ['auto'],
      eco: ['eco']
    });
  });

  test('translateModeToOpenhab', () => {
    const item = {
      metadata: {
        ga: {
          config: {
            modes: 'on=ON:1,off=OFF:2,auto=3'
          }
        }
      }
    };
    expect(new Device(item).translateModeToOpenhab('off')).toBe('OFF');
    expect(new Device(item).translateModeToOpenhab('auto')).toBe('3');
    expect(() => {
      new Device(item).translateModeToOpenhab('invalid');
    }).toThrow();
  });

  test('translateModeToGoogle', () => {
    const item = {
      metadata: {
        ga: {
          config: {
            modes: 'on=ON:1,off=OFF:2,auto=3'
          }
        }
      }
    };
    expect(new Device(item).translateModeToGoogle('OFF')).toBe('off');
    expect(new Device(item).translateModeToGoogle('3')).toBe('auto');
    expect(new Device(item).translateModeToGoogle('invalid')).toBe('on');
  });

  describe('get state', () => {
    test('get state', () => {
      const item = {
        members: [
          {
            name: 'Mode',
            state: 'on',
            type: 'String',
            metadata: {
              ga: {
                value: 'thermostatMode'
              }
            }
          },
          {
            name: 'Setpoint',
            state: '20',
            type: 'Number',
            metadata: {
              ga: {
                value: 'thermostatTemperatureSetpoint'
              }
            }
          },
          {
            name: 'High',
            state: '25',
            type: 'Number',
            metadata: {
              ga: {
                value: 'thermostatTemperatureSetpointHigh'
              }
            }
          },
          {
            name: 'Low',
            state: '5',
            type: 'Number',
            metadata: {
              ga: {
                value: 'thermostatTemperatureSetpointLow'
              }
            }
          },
          {
            name: 'Temperature',
            state: '20',
            type: 'Number',
            metadata: {
              ga: {
                value: 'thermostatTemperatureAmbient'
              }
            }
          },
          {
            name: 'Humidity',
            state: '50',
            type: 'Number',
            metadata: {
              ga: {
                value: 'thermostatHumidityAmbient'
              }
            }
          }
        ]
      };
      expect(new Device(item).state).toStrictEqual({
        thermostatHumidityAmbient: 50,
        thermostatMode: 'on',
        thermostatTemperatureAmbient: 20,
        thermostatTemperatureSetpoint: 20,
        thermostatTemperatureSetpointHigh: 25,
        thermostatTemperatureSetpointLow: 5
      });
    });

    test('getState only temperature', () => {
      const item = {
        metadata: {
          ga: {
            config: {
              useFahrenheit: true
            }
          }
        },
        members: [
          {
            name: 'Temperature',
            state: '20',
            type: 'Number',
            metadata: {
              ga: {
                value: 'thermostatTemperatureAmbient'
              }
            }
          }
        ]
      };
      expect(new Device(item).state).toStrictEqual({
        thermostatTemperatureAmbient: -6.7
      });
    });
  });
});
