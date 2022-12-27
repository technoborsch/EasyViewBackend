const {viewpointClipConstantsValidator} = require('../../../validators/fieldValidators');

const cases = [
    ['Wrong', false],
    [[0, 0, 0, 0, 0, 0], true],
    [[0, 0, 0, 0, 0, 45, 5], false],
    [[0, 0, 0, 0, 0], false],
    [[0, 0, 0, 0, 0, 'banana'], false],
];

describe('Test cases for viewpoint clip constants field validator', () => {
    test.each(cases)(
        'Validating %p should return %p', async (clipConstants, result) => {
            expect(viewpointClipConstantsValidator(clipConstants)).toBe(result);
        }
    );
});