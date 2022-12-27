const {
    getViewpointById,
    createViewpoint,
    editViewpoint,
    deleteViewpoint,
} = require('./viewpoint.request');

const {registerActivateAndLogin} = require('../auth/auth.action');

const {createProject} = require('../project/project.request');

const {createBuilding} = require('../building/building.request');

const {
    expectSuccess,
    expectError,
    expectToReceiveObject,
} = require('../../common');

describe('Tests for viewpoint feature', () => {

    beforeAll(async () => {

    });

    test('Something', async () => {

    });

    afterAll(async () => {

    });

});