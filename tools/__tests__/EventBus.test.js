const EventBus = require('../modules/EventBus');

describe('EventBus', () => {
    let eventBus;
    beforeEach(() => {
        eventBus = new EventBus();
    });

    it('should allow subscription to events', () => {
        const callback = jest.fn();
        eventBus.subscribe('testEvent', callback);
        eventBus.broadcast('testEvent', { data: 123 });
        expect(callback).toHaveBeenCalledWith({ data: 123 });
    });

    it('should allow unsubscription from events', () => {
        const callback = jest.fn();
        eventBus.subscribe('testEvent', callback);
        eventBus.unsubscribe('testEvent', callback);
        eventBus.broadcast('testEvent', { data: 123 });
        expect(callback).not.toHaveBeenCalled();
    });

    it('should handle multiple subscribers', () => {
        const callback1 = jest.fn();
        const callback2 = jest.fn();
        eventBus.subscribe('testEvent', callback1);
        eventBus.subscribe('testEvent', callback2);
        eventBus.broadcast('testEvent', { data: 123 });
        expect(callback1).toHaveBeenCalledWith({ data: 123 });
        expect(callback2).toHaveBeenCalledWith({ data: 123 });
    });
});
