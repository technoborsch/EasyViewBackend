const {
    getViewpointById,
    createViewpoint,
    editViewpoint,
    deleteViewpoint,
} = require('./viewpoint.request');
const {registerActivateAndLogin} = require('../auth/auth.action');
const {deleteProfile} = require('../user/user.request');
const {createProject} = require('../project/project.request');
const {createBuilding} = require('../building/building.request');
const {
    expectSuccess,
    expectError,
    expectToReceiveObject,
} = require('../../common');
const generateUsername = require('../../../utils/GenerateUsername');
const {generateUserEmail} = require('../../../utils/GenerateUserEmail');

describe('Tests for viewpoint feature', () => {

    let user1;
    let token1;
    let project1 = {
        name: 'Someproject',
    };

    let building1 = {
        name: 'Somebuilding',
        description: 'Amazing building',
    };

    let viewpoint1;
    let viewpoint1data;

    let viewpoint1update;
    let viewpoint1updatedData;

    beforeAll(async () => {
        const user1mail = generateUserEmail();
        const user1username = generateUsername();
        const user1password = 'ReallyStrongPassword45';
        const data = await registerActivateAndLogin(user1mail, user1username, user1password);
        user1 = data.user;
        token1 = data.accessToken;

        const project1res = await createProject(token1, project1);
        project1 = await project1res.json();

        const building1res = await createBuilding(token1, {...building1, projectID: project1.id});
        building1 = await building1res.json();

        viewpoint1 = {
            buildingID: building1.id,
            position: [0, 0, 0],
            quaternion: [0, 0, 0, 0],
            distanceToTarget: 1000,
        };

        viewpoint1data = {
            ...viewpoint1,
            id: null,
            author: user1.id,
            description: null,
            fov: null,
            clipConstantsStatus: Array(6).fill(false),
            clipConstants: [],
        };

        viewpoint1update = {
            description: 'Nice viewpoint',
        };

        viewpoint1updatedData = {
            ...viewpoint1data,
            ...viewpoint1update,
        };
    });

    test('A user is able to create a viewpoint', async () => {
        const res = await createViewpoint(token1, viewpoint1);
        viewpoint1 = await expectToReceiveObject(res, viewpoint1data);
    });

    test('A user is able to get created viewpoint', async () => {
        const res = await getViewpointById(token1, viewpoint1.id);
        await expectToReceiveObject(res, viewpoint1data);
    });

    test('A user is able to edit a viewpoint', async () => {
        const res = await editViewpoint(token1, viewpoint1.id, viewpoint1update);
        viewpoint1 = await expectToReceiveObject(res, viewpoint1updatedData);
    });

    test('A user is able to delete a viewpoint', async () => {
        const res = await deleteViewpoint(token1, viewpoint1.id);
        await expectSuccess(res);
    });

    afterAll(async () => {
        await deleteProfile(token1);
    });

});