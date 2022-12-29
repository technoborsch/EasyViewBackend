const fv = require('../../../validators/project/project.fields');

const cases = [
    ['Reeee', true],
    ['Petrovic', true],
    ['Arnold Schwarzenegger', true],
    ['    W6h#a*t9e2W)eR', false],
    ['W6h#a*t9e2W)eR gjfdsgj sdlfkjb dlsfkj sdlfj dlkgdljg sdlfkj', true],
    ['R'.repeat(499), true],
    ['E'.repeat(500), false],
];
describe("Tests for project description field validator", () => {
    test.each(cases)(
        "Validating %p should return %p", async (string, result) => {
            expect(fv.description(string)).toBe(result);
        }
    );
});