import { DateTime} from 'luxon'
import { cloneDeep } from 'lodash'

const callers = require('../fixtures/callers.json');
const { callerStatus, Status, sortedByStatus } = require('./caller')

const _allCallers = callers.map(caller => {
    return {
        ...caller,
        status: callerStatus(caller),
      }
});

const _currentCaller = _allCallers.find((el) => {
    return el.status.status == Status.CURRENT
});

const _firstLapsedCaller = _allCallers.find((el) => {
    return el.status.status == Status.LAPSED
});

const _recentlyLapsedCaller = cloneDeep(_allCallers).reverse().find((el) => {
    return el.status.status == Status.LAPSED
});

const _pausedCaller = _allCallers.find((el) => {
    return el.status.status == Status.PAUSED
});

const _brandNewCaller = _allCallers.find((el) => {
    return el.status.status == Status.BRAND_NEW
});

const _waitingCallerFunc = () => {
    const waiting = cloneDeep(_firstLapsedCaller)
    waiting.status.status = Status.WAITING
    waiting.lastReminderTimestamp = DateTime.local().toSQL()
    return waiting
}

const _waitingCaller = _waitingCallerFunc()

describe('sortedByStatus', () => {

    test('current comes before lapsed', () => {
        expect(sortedByStatus(_currentCaller, _firstLapsedCaller)).toBeLessThan(0);
    });

    test('current comes before paused', () => {
        expect(sortedByStatus(_currentCaller, _pausedCaller)).toBeLessThan(0);
    });

    test('current comes before brand new', () => {
        expect(sortedByStatus(_currentCaller, _brandNewCaller)).toBeLessThan(0);
    });

    test('current comes before waiting', () => {
        expect(sortedByStatus(_currentCaller, _waitingCaller)).toBeLessThan(0);
    });

    test('waiting comes before lapsed', () => {
        expect(sortedByStatus(_waitingCaller, _firstLapsedCaller)).toBeLessThan(0);
    });

    test('waiting comes before paused', () => {
        expect(sortedByStatus(_waitingCaller, _pausedCaller)).toBeLessThan(0);
    });

    test('waiting comes before brand new', () => {
        expect(sortedByStatus(_waitingCaller, _brandNewCaller)).toBeLessThan(0);
    });

    test('paused comes before lapsed', () => {
        expect(sortedByStatus(_pausedCaller, _firstLapsedCaller)).toBeLessThan(0);
    });

    test('recently lapsed comes before old lapsed', () => {
        expect(sortedByStatus(_recentlyLapsedCaller, _firstLapsedCaller)).toBeLessThan(0);
    });

    test('same statuses are equal', () => {
        expect(sortedByStatus(_currentCaller, _currentCaller)).toBe(0);
    });
});
