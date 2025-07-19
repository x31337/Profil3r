const Builder = require('../modules/Builder');
const EventBus = require('../modules/EventBus');

jest.mock('child_process', () => ({
  execSync: jest.fn()
}));

jest.mock('fs', () => ({
  existsSync: jest.fn(() => true)
}));

jest.mock('path', () => ({
  join: jest.fn((...args) => args.join('/'))
}));

const mockConfig = {
  projectRoot: '/fake/root',
  services: [{ name: 'testService', dir: 'testDir', type: 'node', port: 3000 }]
};

describe('Builder', () => {
  let builder, eventBus;

  beforeEach(() => {
    eventBus = new EventBus();
    builder = new Builder(mockConfig, eventBus);
  });

  it('should perform a full build', async() => {
    await builder.fullBuild();
    expect(eventBus.getSubscribers('build-completed').size).toBeGreaterThan(0);
    expect(eventBus.getSubscribers('build-failed').size).toBe(0);
  });

  it('should perform an incremental build', async() => {
    const changedFiles = ['testDir/file.js'];
    await builder.incrementalBuild(changedFiles);
    expect(
      eventBus.getSubscribers('incremental-build-completed').size
    ).toBeGreaterThan(0);
  });
});
