const Device = require('../../functions/devices/specialcolorlight.js');

describe('SpecialColorLight Device', () => {
  test('validDeviceType', () => {
    const item1 = {
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
          value: 'LIGHT'
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
          value: 'LIGHT',
          config: {
            useKelvin: true
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
          value: 'LIGHT'
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
          value: 'LIGHT'
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
          value: 'LIGHT'
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
    expect(new Device(item1).validDeviceType).toBe(true);
    expect(new Device(item2).validDeviceType).toBe(false);
    expect(new Device(item3).validDeviceType).toBe(true);
    expect(new Device(item4).validDeviceType).toBe(true);
    expect(new Device(item5).validDeviceType).toBe(true);
    expect(new Device(item6).validDeviceType).toBe(false);
  });

  test('validItemType', () => {
    expect(new Device({ type: 'Group' }).validItemType).toBe(true);
    expect(new Device({ type: 'Color' }).validItemType).toBe(false);
    expect(new Device({ type: 'Group', groupType: 'Color' }).validItemType).toBe(false);
    expect(new Device({ type: 'Group', groupType: 'Dimmer' }).validItemType).toBe(false);
  });

  describe('get attributes', () => {
    test('get attributes colorTemperatureRange', () => {
      const item = {
        metadata: {
          ga: {
            value: 'LIGHT',
            config: {
              colorTemperatureRange: '1000,2000'
            }
          }
        }
      };
      expect(new Device(item).attributes).toStrictEqual({
        colorTemperatureRange: {
          temperatureMinK: 1000,
          temperatureMaxK: 2000
        }
      });
    });

    test('get attributes invalid colorTemperatureRange', () => {
      const item1 = {
        metadata: {
          ga: {
            value: 'LIGHT',
            config: {
              colorTemperatureRange: 'a,b'
            }
          }
        }
      };
      expect(new Device(item1).attributes).toStrictEqual({});
    });

    test('get attributes color', () => {
      const item = {
        metadata: {
          ga: {
            value: 'LIGHT',
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
      expect(new Device(item).attributes).toStrictEqual({
        colorModel: 'hsv',
        colorTemperatureRange: {
          temperatureMinK: 1000,
          temperatureMaxK: 2000
        }
      });
    });
  });

  test('get metadata', () => {
    const item = {
      name: 'LightItem',
      type: 'Group',
      metadata: {
        ga: {
          value: 'LIGHT',
          config: {
            colorTemperatureRange: '1000,2000',
            useKelvin: true
          }
        }
      }
    };
    expect(new Device(item).metadata.customData).toStrictEqual({
      colorTemperatureRange: {
        temperatureMaxK: 2000,
        temperatureMinK: 1000
      },
      deviceType: 'SpecialColorLight',
      itemType: 'Group',
      members: {},
      useKelvin: true
    });
  });

  describe('get state', () => {
    test('get state', () => {
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
      expect(new Device(item).state).toStrictEqual({
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
              useKelvin: true
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
      expect(new Device(item).state).toStrictEqual({
        on: true,
        brightness: 50,
        color: {
          temperatureK: 2000
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
      expect(new Device(item).state).toStrictEqual({
        on: false,
        brightness: 0,
        color: {
          temperatureK: 3400
        }
      });
    });

    test('getState use kelvin', () => {
      const item = {
        type: 'Group',
        metadata: {
          ga: {
            value: 'LIGHT',
            config: {
              colorTemperatureRange: '1000,4000',
              useKelvin: true
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
      expect(new Device(item).state).toStrictEqual({
        on: true,
        brightness: 50,
        color: {
          temperatureK: 2000
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
      expect(new Device(item).state).toStrictEqual({
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
      expect(new Device(item).state).toStrictEqual({
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
      expect(new Device(item).state).toStrictEqual({
        on: true,
        brightness: 50,
        color: {
          temperatureK: 3400
        }
      });
    });
  });
});
