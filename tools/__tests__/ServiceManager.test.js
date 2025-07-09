const ServiceManager = require('../modules/ServiceManager');
const EventBus = require('../modules/EventBus');

jest.mock('child_process', () => ({
  spawn: jest.fn(() => ({
    kill: jest.fn(),
    on: jest.fn()
  }))
}));

jest.mock('fs', () => ({
  existsSync: jest.fn(() => true)
}));

jest.mock('path', () => ({
  join: jest.fn((...args) => args.join('/'))
}));

jest.mock('axios', () => ({
  get: jest.fn(() => Promise.resolve({ status: 200 }))
}));

const mockConfig = {
  projectRoot: '/fake/root',
  services: [{ name: 'testService', dir: 'testDir', type: 'node', port: 3000 }]
};

describe('ServiceManager', () => {
  let serviceManager, eventBus;

  beforeEach(() => {
    eventBus = new EventBus();
    serviceManager = new ServiceManager(mockConfig, eventBus);
  });

  it('should start a service', async() => {
    await serviceManager.startService(mockConfig.services[0]);
    expect(eventBus.getSubscribers('service-started').size).toBeGreaterThan(0);
    expect(eventBus.getSubscribers('service-start-failed').size).toBe(0);
  });

  it('should stop a running service', async() => {
    await serviceManager.startService(mockConfig.services[0]);
    await serviceManager.stopService('testService');
    expect(eventBus.getSubscribers('service-stopped').size).toBeGreaterThan(0);
  });
});
