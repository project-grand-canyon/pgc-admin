import { Settings, DateTime} from 'luxon'
import { cloneDeep } from 'lodash'


const mockNow = DateTime.fromSQL("2020-03-05").toMillis();
Settings.now = () => mockNow;

const callers = require('../fixtures/callers.json');
const { callerStatus, Status, sortedByStatus, asCsv } = require('./caller')

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

const [_waitingNewCaller, _waitingCurrentCaller, _waitingLapsedCaller] = (
    [_brandNewCaller, _currentCaller, _firstLapsedCaller].map(caller => {
        const waiting = cloneDeep(caller)
        waiting.lastReminderTimestamp = DateTime.local().minus({days: 2}).toSQL()
        waiting.status = callerStatus(waiting)
        return waiting
    })
)

describe('statusPrecedence', () => {
    test('waiting hides new', () => {
        expect(_waitingNewCaller.status.status).toBe(Status.WAITING);
    });
    test('waiting hides current', () => {
        expect(_waitingCurrentCaller.status.status).toBe(Status.WAITING);
    });
    test('lapsed hides waiting', () => {
        expect(_waitingLapsedCaller.status.status).toBe(Status.LAPSED);
    });
});

const _waitingCaller = _waitingCurrentCaller;

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

describe('asCsv', () => {
    // test('bla', () => {
    //     console.log('1')
    //     const actual = asCsv(callers)
    //     console.log('2')
    //     const expected = generate(callers)
    //     console.log('3')
    //     expect(actual).toEqual(expected);
    //     console.log('4')
    //     expect(4).toBe(5);
    // });
})