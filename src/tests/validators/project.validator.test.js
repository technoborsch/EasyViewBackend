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
            slug: 'first_project',
            private: 'true',
        }, true],
        [{
            name: 'First project',
            slug: 'first_project',
            private: 'true',
        }, true],
        [{
            name: 'First project',
            description: 'Very good and cool project',
            slug: 'first_project',
        }, true],
        [{
            name: 'First project',
            slug: 'first_project',
        }, true],
        [{
            name: 'First project',
        }, false],
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
            slug: 'first_project',
            private: 'true',
        }, false],
        [{
            name: 'First project',
            slug: 'first_project',
        }, true],
        [{
            description: 'Very good and cool project',
        }, true],
        [{
            name: 'First project',
            slug: 'first_project',
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
                expect(() => {editProjectValidator(req, res, next)}).not.toThrow(ReqError);
            } else {
                expect(() => {editProjectValidator(req, res, next)}).toThrow(ReqError);
            }
        }
    );
});