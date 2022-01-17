const Device = require('../../functions/devices/default.js');
const packageVersion = require('../../functions/package.json').version;

describe('Default Device', () => {
  const item = {
    type: 'Number',
    state: '50',
    name: 'DefaultDevice',
    label: 'Default Device',
    metadata: {
      ga: {
        value: '',
        config: {
          inverted: true,
          ackNeeded: true,
          pinNeeded: '1234'
        }
      },
      synonyms: {
        value: 'Standard Device'
      }
    }
  };

  test('validItemType', () => {
    expect(new Device({ type: 'Number' }).validItemType).toBe(true);
  });

  test('get config', () => {
    expect(new Device(item).config).toStrictEqual({
      ackNeeded: true,
      inverted: true,
      pinNeeded: '1234'
    });
  });

  test('get state', () => {
    expect(new Device(item).state).toStrictEqual({});
  });

  test('getMetadata', () => {
    expect(new Device(item).metadata).toStrictEqual({
      attributes: {},
      customData: {
        ackNeeded: true,
        deviceType: 'DefaultDevice',
        members: {},
        inverted: true,
        itemType: 'Number',
        pinNeeded: '1234'
      },
      deviceInfo: {
        manufacturer: 'openHAB',
        model: 'Number:DefaultDevice',
        hwVersion: '3.0.0',
        swVersion: packageVersion
      },
      id: 'DefaultDevice',
      name: {
        defaultNames: ['Default Device'],
        name: 'Default Device',
        nicknames: ['Default Device', 'Standard Device']
      },
      notificationSupportedByAgent: true,
      roomHint: undefined,
      structureHint: undefined,
      traits: [],
      type: '',
      willReportState: false
    });
  });

  test('get mtadata legacy', () => {
    const metadata = new Device({
      metadata: {
        ga: {
          config: {
            tfaAck: true,
            tfaPin: '1234'
          }
        }
      }
    }).metadata;
    expect(metadata.customData.ackNeeded).toBe(true);
    expect(metadata.customData.pinNeeded).toBe('1234');
  });

  test('get metadata no label fallback', () => {
    const metadata = new Device({
      type: 'Number',
      state: '50',
      name: 'DefaultDevice'
    }).metadata;
    expect(metadata.name.name).toBe('DefaultDevice');
  });
});
