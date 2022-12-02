const {projectNameValidator} = require('../../../validators/fieldValidators');

const cases = [
    ['Reeee', true],
    ['Petrovic', true],
    ['Arnold Schwarzenegger', true],
    ['Arnold  Schwarzenegger', true],
    [' Dog', false],
    ['Сергеевич', true],
    ['Игорь ', false],
    ['Иг0рь', true],
    ['Иг0рь ', false],
    ['', false],
    ['04352Игорь', true],
    ['RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR', false]
];
describe("Tests for project name field validator", () => {
    test.each(cases)(
        "Validating %p should return %p", async (string, result) => {
            expect(projectNameValidator(string)).toBe(result);
        }
    );
});