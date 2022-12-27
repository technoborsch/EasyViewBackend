const {viewpointClipConstantsStatusValidator} = require('../../../validators/fieldValidators');

const cases = [
    ['Wrong', false],
    [[false, true, true, true, false, false], true],
    [[false, true, true, true, false, false, false], false],
    [[false, true, true, true, false], false],
    [[false, true, true, true, 'banana', false], false],
];

describe('Test cases for viewpoint clip constants status field validator', () => {
    test.each(cases)(
        'Validating %p should return %p', async (clipConstantsStatus, result) => {
            expect(viewpointClipConstantsStatusValidator(clipConstantsStatus)).toBe(result);
        }
    );
});