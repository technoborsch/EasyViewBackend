const {updateProfileValidator} = require('../../validators/user.validator');
const ReqError = require("../../utils/ReqError");

describe('User profile updating data validation tests', () => {
    const next = () => {};
    const res = {};
        const cases = [
        [{
            password: 'supamegapassword',
            name: 'John',
            lastName: 'Петренко',
        }, true],
        [{
        }, false],
        [{
            password: 'supapassword',
        }, true],
        [null, false],
        ['great_body', false],
        [{
            password: 'supapassword',
            name: 'John',
            lastName: 'Петренко',
            patronymic: 'Петрович',
            isAdmin: true,
        }, false],
        [{
            password: 'supapassword',
            name: 'John',
            lastName: 'Петренко',
            patronymic: 'Петрович',
            isModerator: true,
        }, false],
        [{
            password: 'supapassword',
            name: 'John',
            lastName: 'Петренко',
            patronymic: 'Петрович',
            ping: 'pong',
        }, false],

    ];
    test.each(cases)(
        'Validation of object with body attribute %p should not throw an error: %p', (body, result) => {
            const req = {body: body};
            if (result) {
                expect(() => {updateProfileValidator(req, res, next)}).not.toThrow(ReqError);
            } else {
                expect(() => {updateProfileValidator(req, res, next)}).toThrow(ReqError);
            }
        }
    );
});