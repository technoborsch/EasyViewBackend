const fv = require('../../../validators/viewpoint/viewpoint.fields');

const cases = [
    [
        ['Something', 'Another'],
        false,
    ],
    [
        [
            {text: 'Text', position: [0, 0, 0]},
            {text: 'Another text', position: [1, -3, 0]},
        ],
        true,
    ],
    [
        [
            //Empty array case
        ],
        true,
    ],
    [
        [
            {text: 'Text', position: [0, 0, 0], extra: true}, //Extra parameter
        ],
        false,
    ],
    [
        [
            {text: 'Text', }, //Without necessary attribute
        ],
        false,
    ],
    [
        null, //Not the array
        false,
    ],
    [
        [
            {text: 'R'.repeat(500), position: [0, 0, 0]}, //Not valid text
        ],
        false,
    ],
    [
        [
            {text: 'R', position: [0, 0, 0, 9]}, //Not valid position
        ],
        false,
    ],
];

describe('Test cases for viewpoint notes field validator', () => {

    test.each(cases)(
        'Validating %p should return %p', async (notesArray, result) => {
            expect(fv.notes(notesArray)).toBe(result);
        }
    );
});