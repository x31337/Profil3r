/* eslint-env jest, node */
/* global describe, it, before, after, beforeEach, afterEach, expect, jest */
const Tester = require('../modules/Tester');
const EventBus = require('../modules/EventBus');

jest.mock('child_process', () => ({
  execSync: jest.fn()
}));

jest.mock('fs', () => ({
  existsSync: jest.fn(() => true),
  readFileSync: jest.fn(() => '{}')
}));

jest.mock('path', () => ({
  join: jest.fn((...args) => args.join('/'))
}));

const mockConfig = {
  projectRoot: '/fake/root',
  services: [{ name: 'testService', dir: 'testDir', type: 'node', port: 3000 }]
};

describe('Tester', () => {
  let tester, eventBus;

  beforeEach(() => {
    eventBus = new EventBus();
    tester = new Tester(mockConfig, eventBus);
  });

  it('should run all tests and aggregate results', async() => {
    jest.spyOn(tester, 'runUnitTests').mockResolvedValueOnce();
    jest.spyOn(tester, 'runCypressTests').mockResolvedValueOnce();
    jest.spyOn(tester, 'runIntegrationTests').mockResolvedValueOnce();
    await tester.runAllTests();
    expect(eventBus.getSubscribers('tests-completed').size).toBeGreaterThan(0);
    expect(eventBus.getSubscribers('tests-failed').size).toBe(0);
  });
});
