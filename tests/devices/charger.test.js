const Device = require('../../functions/devices/charger.js');

describe('Charger Device', () => {
  test('validDeviceType', () => {
    expect(
      new Device({
        type: 'Group',
        metadata: {
          ga: {
            value: 'Charger'
          }
        }
      }).validDeviceType
    ).toBe(false);
    expect(
      new Device({
        type: 'Group',
        metadata: {
          ga: {
            value: 'Charger'
          }
        },
        members: [
          {
            type: 'Switch',
            metadata: {
              ga: {
                value: 'chargerCharging'
              }
            }
          }
        ]
      }).validDeviceType
    ).toBe(true);
  });

  test('validItemType', () => {
    expect(new Device({ type: 'Group' }).validItemType).toBe(true);
    expect(new Device({ type: 'Switch' }).validItemType).toBe(false);
  });

  describe('get attributes', () => {
    test('get attributes no config', () => {
      const item = {
        metadata: {
          ga: {
            value: 'Charger',
            config: {}
          }
        },
        members: [
          {
            type: 'Number',
            metadata: {
              ga: {
                value: 'chargerCapacityRemaining'
              }
            }
          }
        ]
      };
      expect(new Device(item).attributes).toStrictEqual({
        isRechargeable: false,
        queryOnlyEnergyStorage: true
      });
    });

    test('get attributes with charging', () => {
      const item = {
        metadata: {
          ga: {
            value: 'Charger',
            config: {}
          }
        },
        members: [
          {
            type: 'Switch',
            metadata: {
              ga: {
                value: 'chargerCharging'
              }
            }
          }
        ]
      };
      expect(new Device(item).attributes).toStrictEqual({
        isRechargeable: false,
        queryOnlyEnergyStorage: false
      });
    });

    test('get attributes with charging', () => {
      const item = {
        metadata: {
          ga: {
            value: 'Charger',
            config: {
              isRechargeable: true
            }
          }
        },
        members: [
          {
            type: 'Switch',
            metadata: {
              ga: {
                value: 'chargerCharging'
              }
            }
          }
        ]
      };
      expect(new Device(item).attributes).toStrictEqual({
        isRechargeable: true,
        queryOnlyEnergyStorage: false
      });
    });
  });

  test('get members', () => {
    expect(new Device({ members: [{}] }).members).toStrictEqual({});
    expect(new Device({ members: [{ metadata: { ga: { value: 'invalid' } } }] }).members).toStrictEqual({});
    const item = {
      members: [
        {
          name: 'Charging',
          state: 'ON',
          type: 'Switch',
          metadata: {
            ga: {
              value: 'chargerCharging'
            }
          }
        },
        {
          name: 'CapacityRemaining',
          state: '40',
          type: 'Number',
          metadata: {
            ga: {
              value: 'chargerCapacityRemaining'
            }
          }
        },
        {
          name: 'CapacityUntilFull',
          state: '60',
          type: 'Number',
          metadata: {
            ga: {
              value: 'chargerCapacityUntilFull'
            }
          }
        }
      ]
    };
    expect(new Device(item).members).toStrictEqual({
      chargerCharging: {
        name: 'Charging',
        state: 'ON'
      },
      chargerCapacityRemaining: {
        name: 'CapacityRemaining',
        state: '40'
      },
      chargerCapacityUntilFull: {
        name: 'CapacityUntilFull',
        state: '60'
      }
    });
  });

  describe('get state', () => {
    test('get state default unit', () => {
      const item = {
        type: 'Group',
        metadata: {
          ga: {
            value: 'Charger',
            config: {}
          }
        },
        members: [
          {
            name: 'Charging',
            state: 'ON',
            type: 'Switch',
            metadata: {
              ga: {
                value: 'chargerCharging'
              }
            }
          },
          {
            name: 'CapacityRemaining',
            state: '60',
            type: 'Number',
            metadata: {
              ga: {
                value: 'chargerCapacityRemaining'
              }
            }
          },
          {
            name: 'CapacityUntilFull',
            state: '40',
            type: 'Number',
            metadata: {
              ga: {
                value: 'chargerCapacityUntilFull'
              }
            }
          }
        ]
      };
      expect(new Device(item).state).toStrictEqual({
        capacityRemaining: [
          {
            rawValue: 60,
            unit: 'PERCENTAGE'
          }
        ],
        capacityUntilFull: [
          {
            rawValue: 40,
            unit: 'PERCENTAGE'
          }
        ],
        descriptiveCapacityRemaining: 'MEDIUM',
        isCharging: true
      });

      item.members[1].state = '10';
      expect(new Device(item).state).toStrictEqual({
        capacityRemaining: [
          {
            rawValue: 10,
            unit: 'PERCENTAGE'
          }
        ],
        capacityUntilFull: [
          {
            rawValue: 40,
            unit: 'PERCENTAGE'
          }
        ],
        descriptiveCapacityRemaining: 'CRITICALLY_LOW',
        isCharging: true
      });

      item.members[1].state = '22';
      expect(new Device(item).state).toStrictEqual({
        capacityRemaining: [
          {
            rawValue: 22,
            unit: 'PERCENTAGE'
          }
        ],
        capacityUntilFull: [
          {
            rawValue: 40,
            unit: 'PERCENTAGE'
          }
        ],
        descriptiveCapacityRemaining: 'LOW',
        isCharging: true
      });

      item.members[1].state = '80';
      expect(new Device(item).state).toStrictEqual({
        capacityRemaining: [
          {
            rawValue: 80,
            unit: 'PERCENTAGE'
          }
        ],
        capacityUntilFull: [
          {
            rawValue: 40,
            unit: 'PERCENTAGE'
          }
        ],
        descriptiveCapacityRemaining: 'HIGH',
        isCharging: true
      });

      item.members[1].state = '100';
      expect(new Device(item).state).toStrictEqual({
        capacityRemaining: [
          {
            rawValue: 100,
            unit: 'PERCENTAGE'
          }
        ],
        capacityUntilFull: [
          {
            rawValue: 40,
            unit: 'PERCENTAGE'
          }
        ],
        descriptiveCapacityRemaining: 'FULL',
        isCharging: true
      });
    });

    test('getState KILOWATT_HOURS unit', () => {
      const item = {
        type: 'Group',
        metadata: {
          ga: {
            value: 'Charger',
            config: {
              unit: 'KILOWATT_HOURS'
            }
          }
        },
        members: [
          {
            name: 'Charging',
            state: 'OFF',
            type: 'Switch',
            metadata: {
              ga: {
                value: 'chargerCharging'
              }
            }
          },
          {
            name: 'PluggedIn',
            state: 'ON',
            type: 'Switch',
            metadata: {
              ga: {
                value: 'chargerPluggedIn'
              }
            }
          },
          {
            name: 'CapacityRemaining',
            state: '4000',
            type: 'Number',
            metadata: {
              ga: {
                value: 'chargerCapacityRemaining'
              }
            }
          },
          {
            name: 'CapacityUntilFull',
            state: '6000',
            type: 'Number',
            metadata: {
              ga: {
                value: 'chargerCapacityUntilFull'
              }
            }
          }
        ]
      };
      expect(new Device(item).state).toStrictEqual({
        capacityRemaining: [
          {
            rawValue: 4000,
            unit: 'KILOWATT_HOURS'
          }
        ],
        capacityUntilFull: [
          {
            rawValue: 6000,
            unit: 'KILOWATT_HOURS'
          }
        ],
        isCharging: false,
        isPluggedIn: true
      });
    });
  });
});
