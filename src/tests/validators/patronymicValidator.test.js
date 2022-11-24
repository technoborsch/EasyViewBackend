const {patronymicValidator} = require('../../validators/fieldValidators');

const cases = [
    ['Reeee', true],
    ['Petrovic', true],
    ['Arnold Schwarzenegger', false],
    [' Dog', false],
    ['Сергеевич', true],
    ['Игорь ', false],
    ['Иг0рь ', false],
    ['', false],
    ['04352Игорь', false],
    ['RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR', false]
];
describe("Tests for name field validator", () => {
    test.each(cases)(
        "Validating %p should return %p", async (string, result) => {
            expect(patronymicValidator(string)).toBe(result);
        }
    );
});