const fv = require('../../../validators/user/user.fields');

const cases = [
    ['John', true],
    ['F', false],
    ['Arnold Schwarzenegger', false],
    [' Dog', false],
    ['Никита', true],
    ['Игорь ', false],
    ['', false],
    ['FFFFFFFFFFFFFFFFFFFFFFF', true],
    ['R'.repeat(101), false]
];
describe("Tests for name field validator", () => {
    test.each(cases)(
        "Validating %p should return %p", async (string, result) => {
            expect(fv.name(string)).toBe(result);
        }
    );
});