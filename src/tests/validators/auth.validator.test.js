const {activateValidator} = require('../../validators/auth.validator');
const ReqError = require("../../utils/ReqError");

describe('Activation data validation tests', () => {
    const next = () => {};
    const res = {};
    const cases = [
        [{
            id: '63805bee5673dc4b8d060252',
            token: '4dec63b7d89d10dff6c4eaeac45dd468',
        }, true],
        [{
            id: '63805bee5673dc4b8d060252',
            token: '4dec63b7d89d10dff6c4eaeac45dd468',
            isAdmin: true,
        }, false],
        [{
            id: '63805bee5673dc4b8d060252',
            token: '4dec63b7d89d10dff6c4eaeac45dd468',
            isModerator: true,
        }, false],
        [{
            id: '63805bee5673dc4b8d060252',
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