const {lastNameValidator} = require('../../validators/fieldValidators');

const cases = [
    ['Smith', true],
    ['E', true],
    ['Arnold Schwarzenegger', false],
    [' Dog', false],
    ['Никита', true],
    ['Игорь ', false],
    ['', false],
    ['FFFFFFFFFFFFFFFFFFFFFFF', true],
    ['RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR', false]
];
describe("Tests for name field validator", () => {
    test.each(cases)(
        "Validating %p should return %p", async (string, result) => {
            expect(lastNameValidator(string)).toBe(result);
        }
    );
});