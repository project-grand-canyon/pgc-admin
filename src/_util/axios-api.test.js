import { axiosMock } from "../jest/axios-mock";

import { getAllCallers, getCallerHistories, getHydratedDistict, getThemes } from "./axios-api";

const districts = require('../fixtures/districts.json');
const districtsById = new Map(districts.map((dist) => [dist.districtId, dist]));
const calls = require('../fixtures/calls.json');
const callers = require('../fixtures/callers.json');
const hydratedDistrict = require('../fixtures/hydrated_district.json')
const reminders = require('../fixtures/reminders.json');
const themes = require('../fixtures/themes.json')

const callsURL = /\/mockapi\/calls(\/(\d+))?/;
const remindersURL = /\/mockapi\/reminders\/(\d+)/;
const requestURL = /\/mockapi\/requests\/(\d+)/;
const hydratedDistrictURL = /\mockapi\/districts\/(\d+)\/hydrated/;

describe('district info', () => {
    test('can get hydrated district', async () => {
        axiosMock.onGet(/.*/).reply(() => {
            return [200, hydratedDistrict];
        });
        const result = await getHydratedDistict(hydratedDistrict)
        expect(result.config.url).toBe(`/mockapi/districts/${hydratedDistrict.districtId}/hydrated`)
    })
})

describe('script updating', () => {

    test('can get themes', async () => {
        axiosMock.onGet(/.*/).reply(() => {
            return [200, themes];
        });
        const result = await getThemes()
        expect(result.config.url).toBe(`/mockapi/themes`)
    })

})


describe('callerHistory', () => {

    axiosMock.onGet('/mockapi/callers').reply(200, callers);
    axiosMock.onGet(callsURL).reply((config) => {
        const match = config.url.match(callsURL);
        let matchingCalls = calls;
        if (match[1]) {
            const callerId = parseInt(match[2]);
            matchingCalls = matchingCalls.filter((el) => el.callerId == callerId);
        }
        return [200, matchingCalls];
    });
    axiosMock.onGet(remindersURL).reply((config) => {
        const callerId = parseInt(config.url.match(remindersURL)[1]);
        return [200, reminders.filter((el) => el.callerId == callerId)];
    });


    test('can load callers', (done) => {
        getAllCallers(districtsById, (err, callers) => {
            expect(err).toBeNull();
            const stephen = callers.find((el) => el.callerId == 452);
            expect(stephen).toBeDefined();
            expect(stephen.contactMethodSMS).toBe(false);
            expect(stephen.contactMethodEmail).toBe(true);
            expect(stephen.districtName).toBe('AA-3');
            expect(stephen.state).toBe('AA');
            expect(stephen.districtNumber).toBe(3);
            done();
        });
    });

    test('can load caller history', (done) => {
        getAllCallers(districtsById, (err, callers) => {
            const stephen = callers.find((el) => el.callerId == 452);
            const haran = callers.find((el) => el.callerId == 131);
            getCallerHistories([stephen, haran], districtsById, (err, results) => {
                expect(err).toBeNull();
                const [stephenHistory, haranHistory] = results;
                expect(stephenHistory.signUpHistory.length).toBe(1);
                expect(stephenHistory.reminderHistory.length).toBe(2);
                expect(stephenHistory.reminderHistory[1].url)
                    .toBe('http://www.cclcalls.org/call/aa/2?t=RZnaDi0q&c=452&d=3');
                expect(stephenHistory.callHistory.length).toBe(1);
                expect(stephenHistory.callHistory[0].recipient)
                  .toBe('AA3FirstName AA3LastName (AA-3)');
                expect(haranHistory.reminderHistory.length).toBe(1);
                done();
            });
        });
    });

});
