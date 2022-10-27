const Device = require('../../functions/devices/specialcolorlight.js');

describe('SpecialColorLight Device', () => {
  test('matchesDeviceType', () => {
    const item1 = {
      metadata: {
        ga: {
          value: 'SpecialColorLight',
          config: {
            colorTemperatureRange: '1000,4000'
          }
        }
      },
      members: [
        {
          type: 'Number',
          metadata: {
            ga: {
              value: 'lightBrightness'
            }
          }
        },
        {
          type: 'Number',
          metadata: {
            ga: {
              value: 'lightColorTemperature'
            }
          }
        }
      ]
    };
    const item2 = {
      metadata: {
        ga: {
          value: 'SpecialColorLight'
        }
      },
      members: [
        {
          type: 'Number',
          metadata: {
            ga: {
              value: 'lightBrightness'
            }
          }
        },
        {
          type: 'Number',
          metadata: {
            ga: {
              value: 'lightColorTemperature'
            }
          }
        }
      ]
    };
    const item3 = {
      metadata: {
        ga: {
          value: 'SpecialColorLight',
          config: {
            colorUnit: 'kelvin'
          }
        }
      },
      members: [
        {
          type: 'Number',
          metadata: {
            ga: {
              value: 'lightBrightness'
            }
          }
        },
        {
          type: 'Number',
          metadata: {
            ga: {
              value: 'lightColorTemperature'
            }
          }
        }
      ]
    };
    const item4 = {
      metadata: {
        ga: {
          value: 'SpecialColorLight'
        }
      },
      members: [
        {
          type: 'Dimmer',
          metadata: {
            ga: {
              value: 'lightBrightness'
            }
          }
        },
        {
          type: 'Color',
          metadata: {
            ga: {
              value: 'lightColor'
            }
          }
        }
      ]
    };
    const item5 = {
      metadata: {
        ga: {
          value: 'SpecialColorLight'
        }
      },
      members: [
        {
          type: 'Dimmer',
          metadata: {
            ga: {
              value: 'lightBrightness'
            }
          }
        },
        {
          type: 'Switch',
          metadata: {
            ga: {
              value: 'lightPower'
            }
          }
        }
      ]
    };
    const item6 = {
      metadata: {
        ga: {
          value: 'SpecialColorLight'
        }
      },
      members: [
        {
          type: 'Number',
          metadata: {
            ga: {
              value: 'lightBrightness'
            }
          }
        },
        {
          type: 'Number',
          metadata: {
            ga: {
              value: 'lightColorTemperature'
            }
          }
        }
      ]
    };
    const item7 = {
      type: 'Group',
      metadata: {
        ga: {
          value: 'SpecialColorLight',
          config: {
            colorUnit: 'mired'
          }
        }
      },
      members: [
        {
          type: 'Number',
          metadata: {
            ga: {
              value: 'lightBrightness'
            }
          }
        },
        {
          type: 'Number',
          metadata: {
            ga: {
              value: 'lightColorTemperature'
            }
          }
        }
      ]
    };
    expect(Device.matchesDeviceType(item1)).toBe(true);
    expect(Device.matchesDeviceType(item2)).toBe(false);
    expect(Device.matchesDeviceType(item3)).toBe(true);
    expect(Device.matchesDeviceType(item4)).toBe(true);
    expect(Device.matchesDeviceType(item5)).toBe(true);
    expect(Device.matchesDeviceType(item6)).toBe(false);
    expect(Device.matchesDeviceType(item7)).toBe(true);
  });

  test('matchesItemType', () => {
    expect(Device.matchesItemType({ type: 'Group' })).toBe(true);
    expect(Device.matchesItemType({ type: 'Color' })).toBe(false);
    expect(Device.matchesItemType({ type: 'Group', groupType: 'Color' })).toBe(false);
    expect(Device.matchesItemType({ type: 'Group', groupType: 'Dimmer' })).toBe(false);
  });

  describe('getAttributes', () => {
    test('getAttributes colorTemperatureRange', () => {
      const item = {
        metadata: {
          ga: {
            config: {
              colorTemperatureRange: '1000,2000'
            }
          }
        }
      };
      expect(Device.getAttributes(item)).toStrictEqual({
        colorTemperatureRange: {
          temperatureMinK: 1000,
          temperatureMaxK: 2000
        }
      });
    });

    test('getAttributes invalid colorTemperatureRange', () => {
      const item1 = {
        metadata: {
          ga: {
            config: {
              colorTemperatureRange: 'a,b'
            }
          }
        }
      };
      expect(Device.getAttributes(item1)).toStrictEqual({});
    });

    test('getAttributes colorTemperatureRange with mired', () => {
      const item = {
        metadata: {
          ga: {
            config: {
              colorUnit: 'mired',
              colorTemperatureRange: '250,454'
            }
          }
        }
      };
      expect(Device.getAttributes(item)).toStrictEqual({
        colorTemperatureRange: {
          temperatureMinK: 2203,
          temperatureMaxK: 4000
        }
      });
    });

    test('getAttributes color', () => {
      const item = {
        metadata: {
          ga: {
            config: {
              colorTemperatureRange: '1000,2000'
            }
          }
        },
        members: [
          {
            type: 'Color',
            metadata: {
              ga: {
                value: 'lightColor'
              }
            }
          }
        ]
      };
      expect(Device.getAttributes(item)).toStrictEqual({
        colorModel: 'hsv',
        colorTemperatureRange: {
          temperatureMinK: 1000,
          temperatureMaxK: 2000
        }
      });
    });
  });

  test('getMetadata', () => {
    const item = {
      name: 'LightItem',
      type: 'Group',
      metadata: {
        ga: {
          config: {
            colorTemperatureRange: '1000,2000',
            colorUnit: 'kelvin'
          }
        }
      }
    };
    expect(Device.getMetadata(item).customData).toStrictEqual({
      colorTemperatureRange: {
        temperatureMaxK: 2000,
        temperatureMinK: 1000
      },
      deviceType: 'SpecialColorLight',
      itemType: 'Group',
      members: {},
      colorUnit: 'kelvin'
    });
  });

  describe('getState', () => {
    test('getState', () => {
      const item = {
        type: 'Group',
        metadata: {
          ga: {
            value: 'LIGHT',
            config: {
              colorTemperatureRange: '1000,4000'
            }
          }
        },
        members: [
          {
            state: '50',
            type: 'Number',
            metadata: {
              ga: {
                value: 'lightBrightness'
              }
            }
          },
          {
            state: '20',
            type: 'Number',
            metadata: {
              ga: {
                value: 'lightColorTemperature'
              }
            }
          }
        ]
      };
      expect(Device.getState(item)).toStrictEqual({
        on: true,
        brightness: 50,
        color: {
          temperatureK: 3400
        }
      });
    });

    test('getState kelvin', () => {
      const item = {
        type: 'Group',
        metadata: {
          ga: {
            value: 'LIGHT',
            config: {
              colorUnit: 'kelvin'
            }
          }
        },
        members: [
          {
            state: '50',
            type: 'Number',
            metadata: {
              ga: {
                value: 'lightBrightness'
              }
            }
          },
          {
            state: '2000',
            type: 'Number',
            metadata: {
              ga: {
                value: 'lightColorTemperature'
              }
            }
          }
        ]
      };
      expect(Device.getState(item)).toStrictEqual({
        on: true,
        brightness: 50,
        color: {
          temperatureK: 2000
        }
      });
    });

    test('getState mired', () => {
      const item = {
        type: 'Group',
        metadata: {
          ga: {
            value: 'LIGHT',
            config: {
              colorUnit: 'mired'
            }
          }
        },
        members: [
          {
            state: '50',
            type: 'Number',
            metadata: {
              ga: {
                value: 'lightBrightness'
              }
            }
          },
          {
            state: '200',
            type: 'Number',
            metadata: {
              ga: {
                value: 'lightColorTemperature'
              }
            }
          }
        ]
      };
      expect(Device.getState(item)).toStrictEqual({
        on: true,
        brightness: 50,
        color: {
          temperatureK: 5000
        }
      });
    });

    test('getState zero brightness', () => {
      const item = {
        type: 'Group',
        metadata: {
          ga: {
            value: 'LIGHT',
            config: {
              colorTemperatureRange: '1000,4000'
            }
          }
        },
        members: [
          {
            state: '0',
            type: 'Number',
            metadata: {
              ga: {
                value: 'lightBrightness'
              }
            }
          },
          {
            state: '20',
            type: 'Number',
            metadata: {
              ga: {
                value: 'lightColorTemperature'
              }
            }
          }
        ]
      };
      expect(Device.getState(item)).toStrictEqual({
        on: false,
        brightness: 0,
        color: {
          temperatureK: 3400
        }
      });
    });

    test('getState lightPower', () => {
      const item = {
        type: 'Group',
        metadata: {
          ga: {
            value: 'LIGHT',
            config: {
              colorTemperatureRange: '1000,4000'
            }
          }
        },
        members: [
          {
            state: 'OFF',
            type: 'Switch',
            metadata: {
              ga: {
                value: 'lightPower'
              }
            }
          },
          {
            state: '50',
            type: 'Number',
            metadata: {
              ga: {
                value: 'lightBrightness'
              }
            }
          },
          {
            state: '20',
            type: 'Number',
            metadata: {
              ga: {
                value: 'lightColorTemperature'
              }
            }
          }
        ]
      };
      expect(Device.getState(item)).toStrictEqual({
        on: false,
        brightness: 50,
        color: {
          temperatureK: 3400
        }
      });
    });

    test('getState color', () => {
      const item = {
        type: 'Group',
        metadata: {
          ga: {
            value: 'LIGHT',
            config: {
              colorTemperatureRange: '1000,4000'
            }
          }
        },
        members: [
          {
            state: '50',
            type: 'Number',
            metadata: {
              ga: {
                value: 'lightBrightness'
              }
            }
          },
          {
            state: '100,50,10',
            type: 'Color',
            metadata: {
              ga: {
                value: 'lightColor'
              }
            }
          },
          {
            state: '20',
            type: 'Number',
            metadata: {
              ga: {
                value: 'lightColorTemperature'
              }
            }
          }
        ]
      };
      expect(Device.getState(item)).toStrictEqual({
        on: true,
        brightness: 50,
        color: {
          spectrumHSV: {
            hue: 100,
            saturation: 0.5,
            value: 0.1
          }
        }
      });
    });

    test('getState color off', () => {
      const item = {
        type: 'Group',
        metadata: {
          ga: {
            value: 'LIGHT',
            config: {
              colorTemperatureRange: '1000,4000'
            }
          }
        },
        members: [
          {
            state: '50',
            type: 'Number',
            metadata: {
              ga: {
                value: 'lightBrightness'
              }
            }
          },
          {
            state: '100,50,0',
            type: 'Color',
            metadata: {
              ga: {
                value: 'lightColor'
              }
            }
          },
          {
            state: '20',
            type: 'Number',
            metadata: {
              ga: {
                value: 'lightColorTemperature'
              }
            }
          }
        ]
      };
      expect(Device.getState(item)).toStrictEqual({
        on: true,
        brightness: 50,
        color: {
          temperatureK: 3400
        }
      });
    });
  });
});
