const {viewpointQuaternionValidator} = require('../../../validators/fieldValidators');

const cases = [
    ['Wrong', false],
    [[0, 0, 0], false],
    [[0, 0, 0, 0], true],
    [[-1200, +42432, 0, 0], true],
    [[-1.2, +4.3, +3, +500], true],
    [[0, 1, 'banana', 1], false],
    [[null, null, null, null], false],
    [[0, 3], false],
    [[10000, 100000000000000000000, 100000000, -1000000], true],
];

describe('Test cases for viewpoint quaternion field validator', () => {

    test.each(cases)(
        'Validating %p should return %p', async (quaternion, result) => {
            expect(viewpointQuaternionValidator(quaternion)).toBe(result);
        }
    );
});