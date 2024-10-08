const {updateProfileValidator} = require('../../../validators/user/user.validator');
const ReqError = require("../../../utils/ReqError");

describe('User profile updating data validation tests', () => {
    const next = () => {};
    const res = {};
        const cases = [
        [{
            password: 'supaMegapassword77',
            name: 'John',
            lastName: 'Петренко',
            visibility: 3,
        }, true],
        [{
        }, false],
        [{
            password: 'supaPassword55',
        }, true],
        [null, false],
        ['great_body', false],
        [{
            password: '55supaPassword',
            name: 'John',
            lastName: 'Петренко',
            isAdmin: true,
        }, false],
        [{
            password: 'supaMassword87878',
            name: 'John',
            lastName: 'Петренко',
            isModerator: true,
        }, false],
        [{
            password: 'supa4asswoRd',
            name: 'John',
            lastName: 'Петренко',
            ping: 'pong',
        }, false],
                [{
            password: 'supa4asswoRd',
            name: 'John',
            lastName: 'Петренко',
            visibility: 44
        }, false],
    ];
    test.each(cases)(
        'Validation of object with body attribute %p should not throw an error: %p', (body, result) => {
            const req = {body: body, params: {id: '6398483c4b16732ee22db0e0'}};
            if (result) {
                expect(() => {updateProfileValidator(req, res, next)}).not.toThrow(ReqError);
            } else {
                expect(() => {updateProfileValidator(req, res, next)}).toThrow(ReqError);
            }
        }
    );
});