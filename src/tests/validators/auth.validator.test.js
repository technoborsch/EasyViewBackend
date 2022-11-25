const {activateValidator} = require('../../validators/auth.validator');
const ReqError = require("../../utils/ReqError");

describe('Activation data validation tests', () => {
    const next = () => {};
    const res = {};
    const cases = [
        [{
            id: '63805bee5673dc4b8d060252',
            password: 'supapassword',
            token: '4dec63b7d89d10dff6c4eaeac45dd468',
            name: 'John',
            lastName: 'Петренко',
        }, true],
        [{
            id: '63805bee5673dc4b8d060252',
            password: 'supapassword',
            token: '4dec63b7d89d10dff6c4eaeac45dd468',
            name: 'John',
            lastName: 'Петренко',
            patronymic: 'Петрович'
        }, true],
        [{
            id: '63805bee5673dc4b8d060252',
            password: 'supapassword',
            token: '4dec63b7d89d10dff6c4eaeac45dd468',
            name: 'John',
            lastName: 'Петренко',
            patronymic: 'Петрович',
            isAdmin: true,
        }, false],
        [{
            id: '63805bee5673dc4b8d060252',
            password: 'supapassword',
            token: '4dec63b7d89d10dff6c4eaeac45dd468',
            name: 'John',
            lastName: 'Петренко',
            patronymic: 'Петрович',
            isModerator: true,
        }, false],
        [{
            id: '63805bee5673dc4b8d060252',
            password: 'supapassword',
            name: 'John',
            lastName: 'Петренко',
        }, false],
        [{}, false],

    ];
    test.each(cases)(
        'Validation of object with body attribute %p should not throw an error: %p', (body, result) => {
            const req = {body: body};
            if (result) {
                expect(() => {activateValidator(req, res, next)}).not.toThrow(ReqError);
            } else {
                expect(() => {activateValidator(req, res, next)}).toThrow(ReqError);
            }
        }
    )
});