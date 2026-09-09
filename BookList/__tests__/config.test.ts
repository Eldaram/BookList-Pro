describe('API Config Validation', () => {
  const originalEnv = process.env.EXPO_PUBLIC_API_URL;

  afterEach(() => {
    process.env.EXPO_PUBLIC_API_URL = originalEnv;
    jest.resetModules();
  });

  it('should throw an error immediately if EXPO_PUBLIC_API_URL is missing or empty', () => {
    delete process.env.EXPO_PUBLIC_API_URL;
    jest.resetModules();

    expect(() => {
      require('../services/config');
    }).toThrow('[CONFIG ERROR] EXPO_PUBLIC_API_URL environment variable is missing.');
  });

  it('should load API_CONFIG when EXPO_PUBLIC_API_URL is provided', () => {
    process.env.EXPO_PUBLIC_API_URL = 'http://localhost:3000';
    jest.resetModules();

    const { API_CONFIG } = require('../services/config');
    expect(API_CONFIG.baseUrl).toBe('http://localhost:3000');
  });
});
