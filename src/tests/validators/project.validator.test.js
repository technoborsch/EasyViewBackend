const {
    createProjectValidator,
    editProjectValidator,
} = require('../../validators/project.validator');
const ReqError = require("../../utils/ReqError");

describe('Project creating data validation tests', () => {
    const next = () => {};
    const res = {};
        const cases = [
        [{
            name: 'First project',
            description: 'Very good and cool project',
            private: 'true',
        }, true],
        [{
            name: 'First project',
            private: 'true',
        }, true],
        [{
            name: 'First project',
            description: 'Very good and cool project',
        }, true],
        [{
            name: 'First project',
        }, true],
        [{}, false],
        ['nice body', false],

    ];
    test.each(cases)(
        'Validation of object with body attribute %p should not throw an error: %p', (body, result) => {
            const req = {body: body};
            if (result) {
                expect(() => {createProjectValidator(req, res, next)}).not.toThrow(ReqError);
            } else {
                expect(() => {createProjectValidator(req, res, next)}).toThrow(ReqError);
            }
        }
    );
});

describe('Project edition data validation tests', () => {
    const next = () => {};
    const res = {};
        const cases = [
        [{
            name: 'First project',
            description: 'Very good and cool project',
            private: 'true',
        }, false],
        [{
            name: 'First project',
        }, true],
        [{
            description: 'Very good and cool project',
        }, true],
        [{
            name: 'First project',
            slug: 'first_project',
        }, false],
        [{
            name: 'First project',
        }, true],
        [{}, false],
        ['nice body', false],

    ];
    test.each(cases)(
        'Validation of object with body attribute %p should not throw an error: %p', (body, result) => {
            const req = {body: body, params: {id: '6398483c4b16732ee22db0e0'}};
            if (result) {
                expect(() => {editProjectValidator(req, res, next)}).not.toThrow(ReqError);
            } else {
                expect(() => {editProjectValidator(req, res, next)}).toThrow(ReqError);
            }
        }
    );
});