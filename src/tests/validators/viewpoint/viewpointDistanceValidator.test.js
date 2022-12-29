const fv = require('../../../validators/viewpoint/viewpoint.fields');

const cases = [
    ['Wrong', false],
    [70, true],
    ['-70', false],
    ['0.1', true],
    ['1.4', true],
    [149, true],
    [0, false],
    [-30, false],
    [null, false],
];

describe('Test cases for viewpoint distance to target field validator', () => {
    test.each(cases)(
        'Validating %p should return %p', async (distance, result) => {
            expect(fv.distanceToTarget(distance)).toBe(result);
        }
    );
});