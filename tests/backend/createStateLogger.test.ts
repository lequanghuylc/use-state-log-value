import { createStateLogger } from '../../src/backend/createStateLogger';

describe('createStateLogger', () => {
  it('updates state and logs changes', () => {
    const logger = jest.fn();
    const service = createStateLogger({ status: 'idle', count: 0 }, logger);

    service.update('status', 'running');
    service.update('count', 1);

    expect(service.getState()).toEqual({ status: 'running', count: 1 });
    expect(logger).toHaveBeenCalledTimes(2);
    expect(logger.mock.calls[0][0]).toMatchObject({ key: 'status', prev: 'idle', next: 'running' });
  });

  it('does not log when value does not change', () => {
    const logger = jest.fn();
    const service = createStateLogger({ status: 'idle' }, logger);
    service.update('status', 'idle');
    expect(logger).not.toHaveBeenCalled();
  });
});
