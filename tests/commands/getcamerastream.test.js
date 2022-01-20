const Command = require('../../functions/commands/getcamerastream.js');

describe('GetCameraStream Command', () => {
  test('hasValidParams', () => {
    expect(new Command().hasValidParams).toBe(false);
    expect(new Command({ StreamToChromecast: true }).hasValidParams).toBe(false);
    expect(new Command({ StreamToChromecast: true, SupportedStreamProtocols: {} }).hasValidParams).toBe(true);
  });

  test('requiresItem', () => {
    expect(new Command().requiresItem).toBe(true);
  });

  test('convertParamsToValue', () => {
    expect(new Command().convertParamsToValue()).toBe(null);
  });

  test('getResponseStates', () => {
    expect(new Command().getResponseStates({ state: 'https://example.org' })).toStrictEqual({
      cameraStreamAccessUrl: 'https://example.org'
    });
  });
});
