const {viewpointPositionValidator} = require('../../../validators/fieldValidators');

const cases = [
    ['Wrong', false],
    [[0, 0, 0], true],
    [[0, 0, 0, 0], false],
    [[-1200, +42432, 0], true],
    [[-1.2, +4.3, +3], true],
    [[0, 1, 'banana'], false],
    [[null, null, null], false],
    [[0, 3], false],
    [[10000, 100000000000000000000, 100000000], true]
];

describe('Test cases for viewpoint position field validator', () => {
    test.each(cases)(
        'Validating %p should return %p', async (position, result) => {
            expect(viewpointPositionValidator(position)).toBe(result);
        }
    );
});