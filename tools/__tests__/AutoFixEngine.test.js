const AutoFixEngine = require('../modules/AutoFixEngine');
const EventBus = require('../modules/EventBus');

jest.mock('child_process', () => ({
    execSync: jest.fn()
}));

const mockConfig = {
    projectRoot: '/fake/root'
};

describe('AutoFixEngine', () => {
    let autoFixEngine, eventBus;

    beforeEach(() => {
        eventBus = new EventBus();
        autoFixEngine = new AutoFixEngine(mockConfig, eventBus);
    });

    it('should match pattern and run associated fix', async () => {
        const errorMessage = 'npm ERR! peer dep missing xyz';
        const fix = await autoFixEngine.mapErrorToFix(errorMessage);
        expect(fix).toBe('npm install --legacy-peer-deps');
    });

    it('should broadcast fix completion events', async () => {
        jest.spyOn(autoFixEngine, 'runFix').mockImplementationOnce(async () => {});
        await autoFixEngine.autoFixIssues();
        expect(eventBus.getSubscribers('auto-fix-completed').size).toBeGreaterThan(0);
    });
});
