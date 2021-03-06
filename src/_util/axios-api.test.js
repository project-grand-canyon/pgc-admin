import { axiosMock } from "../jest/axios-mock";

import { getAllCallers, getCallerHistories, getHydratedDistict, getThemes, updateRequest, updateScript, updateUnhydratedDistrict } from "./axios-api";

const districts = require('../fixtures/districts.json');
const districtsById = new Map(districts.map((dist) => [dist.districtId, dist]));
const calls = require('../fixtures/calls.json');
const callers = require('../fixtures/callers.json');
const hydratedDistrict = require('../fixtures/hydrated_district.json')
const reminders = require('../fixtures/reminders.json');
const themes = require('../fixtures/themes.json')

const callsURL = /\/calls(\/(\d+))?/;
const remindersURL = /\/reminders\/(\d+)/;

function verifyRequest(result, method, path, body) {
    expect(result.config.method).toBe(method)
    expect(result.config.url).toBe(`/${path}`)
    if (body) {
        expect(result.config.data).toBe(JSON.stringify(body))
    }
}

describe('district info', () => {
    test('can get hydrated district', async () => {
        axiosMock.onGet(/.*/).reply(() => {
            return [200, hydratedDistrict];
        });
        const result = await getHydratedDistict(hydratedDistrict)
        verifyRequest(result, 'get', `districts/${hydratedDistrict.districtId}/hydrated`)
    })

    test('can update district', async () => {
        const district = {
            'lastModified': 'xxx',
            'created': 'xxx',
            'senatorDistrict': 'xxx',
            'districtId': 1
        }
        axiosMock.onPut(/.*/).reply(() => {
            return [200, "ok"]            
        })
        const result = await updateUnhydratedDistrict(district)
        verifyRequest(result, 'put', `districts/${district.districtId}`, {'districtId': district.districtId})
    })
})

describe('script updating', () => {
    test('can get themes', async () => {
        axiosMock.onGet(/.*/).reply(() => {
            return [200, themes];
        });
        const result = await getThemes()
        verifyRequest(result, 'get', 'themes')
    })

    test('can update request' ,async () => {
        const request = {"requestId": "a", "content": "hello"}
        const district = districts[0]
        axiosMock.onPut(/.*/).reply(() => {
            return [200, {"a": "b"}];
        });
        const result = await updateRequest(district, request)        
        verifyRequest(result, 'put', `requests/${request.requestId}`, {'districtId': district.districtId, 'content': 'hello'})
    })

    test('can create request' ,async () => {
        const request = {"content": "hello"}
        const district = districts[0]
        axiosMock.onPost(/.*/).reply(() => {
            return [200, {"a": "b"}];
        });
        const result = await updateRequest(district, request)
        verifyRequest(result, 'post', `requests`, {'districtId': district.districtId, 'content': 'hello'})
    })

    test('can update script', async () => {
        const talkingPointIds = [1, 2, 3]
        const district = districts[0]
        axiosMock.onPut(/.*/).reply(() => {
            return [200, "ok"]
        })
        const result = await updateScript(district, talkingPointIds)
        verifyRequest(result, 'put', `districts/${district.districtId}/script`, talkingPointIds)
    })
});


describe('callerHistory', () => {

    axiosMock.onGet('/callers').reply(200, callers);
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
