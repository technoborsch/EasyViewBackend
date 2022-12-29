const fv = require('../../../validators/viewpoint/viewpoint.fields');

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
            expect(fv.clipConstantsStatus(clipConstantsStatus)).toBe(result);
        }
    );
});