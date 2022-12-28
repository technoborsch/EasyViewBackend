const {
    getViewpointById,
    createViewpoint,
    editViewpoint,
    deleteViewpoint,
} = require('./viewpoint.request');
const {registerActivateAndLogin} = require('../auth/auth.action');
const {getUserByUsername, deleteProfile} = require('../user/user.request');
const {createProject} = require('../project/project.request');
const {
    createBuilding,
    getBuildingByID
} = require('../building/building.request');
const {
    expectSuccess,
    expectError,
    expectToReceiveObject,
} = require('../../common');
const generateUsername = require('../../../utils/GenerateUsername');
const {generateUserEmail} = require('../../../utils/GenerateUserEmail');

describe('Tests for viewpoint feature', () => {
    jest.setTimeout(30000);

    let user1;
    let user2;
    let token1;
    let token2;

    let project1 = {
        name: 'Someproject',
    };
    let project2 = {
        name: 'Anotherproject',
        private: true,
    }

    let building1 = {
        name: 'Somebuilding',
        description: 'Amazing building',
    };
    let building2 = {
        name: 'Someotherbuilding',
        description: 'Super one',
    }

    let viewpoint1;
    let viewpoint1creationData;
    let viewpoint1data;

    let viewpoint2;
    let viewpoint2creationData;
    let viewpoint2data;

    let viewpoint1update;
    let viewpoint1updatedData;

    beforeAll(async () => {
        const user1mail = generateUserEmail();
        const user1username = generateUsername();
        const user1password = 'ReallyStrongPassword45';
        const user2mail = generateUserEmail();
        const user2username = generateUsername();
        const user2password = 'SuperPassword11';

        const data1 = await registerActivateAndLogin(user1mail, user1username, user1password);
        const data2 = await registerActivateAndLogin(user2mail, user2username, user2password);

        user1 = data1.user;
        token1 = data1.accessToken;
        user2 = data2.user;
        token2 = data2.accessToken;

        const project1res = await createProject(token1, project1);
        project1 = await project1res.json();

        const project2res = await createProject(token1, project2);
        project2 = await project2res.json();

        const building1res = await createBuilding(token1, {...building1, projectID: project1.id});
        building1 = await building1res.json();

        const building2res = await createBuilding(token1, {...building2, projectID: project2.id});
        building2 =await building2res.json();

        viewpoint1creationData = {
            buildingID: building1.id,
            position: [0, 0, 0],
            quaternion: [0, 0, 0, 0],
            distanceToTarget: 1000,
            public: true,
        };

        viewpoint1data = {
            ...viewpoint1creationData,
            id: null,
            author: user1.id,
            description: null,
            fov: null,
            clipConstantsStatus: Array(6).fill(false),
            clipConstants: [],
        };

        viewpoint2creationData = {
            ...viewpoint1creationData,
            buildingID: building2.id,
        };

        viewpoint2data = {
            ...viewpoint1data,
            ...viewpoint2creationData,
        };

        viewpoint1update = {
            description: 'Nice viewpoint',
        };

        viewpoint1updatedData = {
            ...viewpoint1data,
            ...viewpoint1update,
        };
    });

    test('A project owner user is able to create a viewpoint in building in public project', async () => {
        const res = await createViewpoint(token1, viewpoint1creationData);
        viewpoint1 = await expectToReceiveObject(res, viewpoint1data);
    });

    test('A project owner user is able to create a viewpoint in building in private project', async () => {
        const res = await createViewpoint(token1, viewpoint2creationData);
        viewpoint2 = await expectToReceiveObject(res, viewpoint2data);
    });

    test('Another user is able to create a viewpoint in building in public project', async () => {
        const res = await createViewpoint(token2, viewpoint1creationData);
        await expectToReceiveObject(res, {...viewpoint1data, author: user2.id});
    });

    test('Another user is not able to create a viewpoint in building in private project', async () => {
        const res = await createViewpoint(token2, viewpoint2creationData);
        await expectError(res, 403);
    });

    test('Anonymous user is not able to create a viewpoint in building in public project', async ()=> {
        const res = await createViewpoint(null, viewpoint1creationData);
        await expectError(res, 401);
    });

    test('Anonymous user is not able to create a viewpoint in building in private project', async ()=> {
        const res = await createViewpoint(null, viewpoint2creationData);
        await expectError(res, 401);
    });

    test('Project owner user is able to get created viewpoint in public project', async () => {
        const res = await getViewpointById(token1, viewpoint1.id);
        await expectToReceiveObject(res, viewpoint1data);
    });

    test('Project owner user is able to get created viewpoint in private project', async () => {
        const res = await getViewpointById(token1, viewpoint2.id);
        await expectToReceiveObject(res, viewpoint2data);
    });

    test('Another user is able to get viewpoint in public project', async () => {
        const res = await getViewpointById(token2, viewpoint1.id);
        await expectToReceiveObject(res, viewpoint1data);
    });

    test('Another user is not able to get viewpoint in private project', async () => {
        const res = await getViewpointById(token2, viewpoint2.id);
        await expectError(res, 403);
    });

    test('A viewpoint is also seen in viewpoints of a building', async () => {
        const res = await getBuildingByID(token1, building1.id);
        const buildingData = await res.json();
        expect(buildingData.viewpoints).toContain(viewpoint1.id);
    });

    test('Viewpoint is seen in user viewpoints', async () => {
        const res = await getUserByUsername(token1, user1.username);
        const user1data = await res.json();
        expect(user1data.viewpoints).toContain(viewpoint1.id);
    });

    test('As another user has seen this viewpoint once, it also should be in his viewpoints too', async () => {
        const res = await getUserByUsername(token2, user2.username);
        const user2data = await res.json();
        expect(user2data.viewpoints).toContain(viewpoint1.id);
    });

    test('Viewpoint creator is able to edit a viewpoint', async () => {
        const res = await editViewpoint(token1, viewpoint1.id, viewpoint1update);
        viewpoint1 = await expectToReceiveObject(res, viewpoint1updatedData);
    });

    test('Another user is not able to edit a viewpoint', async () => {
        const res = await editViewpoint(token2, viewpoint1.id, viewpoint1update);
        await expectError(res, 403);
    });

    test('Anonymous user is not able to edit a viewpoint', async () => {
        const res = await editViewpoint(token2, viewpoint1.id, viewpoint1update);
        await expectError(res,403);
    });

    test('A user is able to delete a viewpoint', async () => {
        const res = await deleteViewpoint(token1, viewpoint1.id);
        await expectSuccess(res);
    });

    test('A viewpoint is not absent after deletion because another user has seen it', async ()=> {
        const res = await getViewpointById(token2, viewpoint1.id);
        await expectToReceiveObject(res, viewpoint1data);
    });

    test('Another user deletes a viewpoint', async () => {
        const res = await deleteViewpoint(token2, viewpoint1.id);
        await expectSuccess(res);
    });

    test('Now as everyone has deleted it, it is really deleted', async () => {
        const res = await getViewpointById(token1, viewpoint1.id);
        await expectError(res, 404);
    });

    afterAll(async () => {
        await deleteProfile(token1);
        await deleteProfile(token2);
    });

});