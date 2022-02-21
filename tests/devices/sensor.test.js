const Device = require('../../functions/devices/sensor.js');

describe('Sensor Device', () => {
  test('validDeviceType', () => {
    expect(
      new Device({
        metadata: {
          ga: {
            value: 'SENSOR'
          }
        }
      }).validDeviceType
    ).toBe(false);
    expect(
      new Device({
        metadata: {
          ga: {
            value: 'SENSOR',
            config: {
              sensorName: 'Sensor',
              valueUnit: 'PERCENT'
            }
          }
        }
      }).validDeviceType
    ).toBe(true);
    expect(
      new Device({
        metadata: {
          ga: {
            value: 'SENSOR',
            config: {
              sensorName: 'Sensor',
              states: '50=good,100=bad'
            }
          }
        }
      }).validDeviceType
    ).toBe(true);
  });

  test('validItemType', () => {
    expect(new Device({ type: 'Group' }).validItemType).toBe(false);
    expect(new Device({ type: 'Group', groupType: 'String' }).validItemType).toBe(true);
    expect(new Device({ type: 'Number' }).validItemType).toBe(true);
  });

  describe('get attributes', () => {
    test('get attributes no config', () => {
      const item = {
        metadata: {
          ga: {
            value: 'SENSOR',
            config: {}
          }
        }
      };
      expect(new Device(item).attributes).toStrictEqual({});
    });

    test('get attributes states', () => {
      const item = {
        metadata: {
          ga: {
            value: 'SENSOR',
            config: {
              sensorName: 'Sensor',
              valueUnit: 'AQI',
              states: 'good=10,moderate=50,poor=90'
            }
          }
        }
      };
      expect(new Device(item).attributes).toStrictEqual({
        sensorStatesSupported: [
          {
            descriptiveCapabilities: {
              availableStates: ['good', 'moderate', 'poor']
            },
            name: 'Sensor',
            numericCapabilities: {
              rawValueUnit: 'AQI'
            }
          }
        ]
      });
    });
  });

  describe('get state', () => {
    test('get state', () => {
      const item = {
        metadata: {
          ga: {
            value: 'SENSOR',
            config: {
              sensorName: 'Sensor',
              valueUnit: 'AQI',
              states: 'good=10,moderate=50,poor=90'
            }
          }
        },
        state: '10'
      };
      expect(new Device(item).state).toStrictEqual({
        currentSensorStateData: [
          {
            currentSensorState: 'good',
            name: 'Sensor',
            rawValue: 10
          }
        ]
      });
    });

    test('getState no matching state', () => {
      const item = {
        metadata: {
          ga: {
            value: 'SENSOR',
            config: {
              sensorName: 'Sensor',
              valueUnit: 'AQI',
              states: 'good=10,moderate=50,poor=90'
            }
          }
        },
        state: '20'
      };
      expect(new Device(item).state).toStrictEqual({
        currentSensorStateData: [
          {
            currentSensorState: '',
            name: 'Sensor',
            rawValue: 20
          }
        ]
      });
    });
  });

  test('getNotifcation', () => {
    const item = {
      metadata: {
        ga: {
          value: 'SENSOR',
          config: {
            sensorName: 'Sensor',
            valueUnit: 'AQI',
            states: 'good=10,moderate=50,poor=90'
          }
        }
      },
      state: '10'
    };
    expect(new Device(item).getNotification()).toStrictEqual({
      SensorState: {
        name: 'Sensor',
        currentSensorState: 'good',
        priority: 0
      }
    });
  });
});
