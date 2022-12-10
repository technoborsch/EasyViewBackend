const {
    getBuildingBySlug,
    getBuildingByID,
    createBuilding,
    editBuilding,
    deleteBuilding,
} = require('./building.request');

const {registerActivateAndLogin} = require('../auth/auth.action');

const {
    createProject,
    deleteProject,
    editProject,
} = require('../project/project.request');

const {
    expectError,
    expectSuccess,
    expectToReceiveObject,
} = require('../../common');

const {generateUserEmail} = require('../../../utils/GenerateUserEmail');
const generateUsername = require('../../../utils/GenerateUsername');

const {deleteProfile} = require("../user/user.request");

describe('Tests for building feature', () => {

    const email1 = generateUserEmail();
    const email2 = generateUserEmail();
    const email3 = generateUserEmail();

    const username1 = generateUsername();
    const username2 = generateUsername();
    const username3 = generateUsername();

    const password = 'Testbuildingswell33';

    let user1id;
    let user2id;
    let user3id;

    let token1;
    let token2;
    let token3;

    let project1 = {
        name: 'Project',
        private: 'false',
    };

    let project2 = {
        name: 'Project2',
        private: 'true',
    };

    const building1 = {
        name: 'First building',
        description: 'Nice building',
    };

    const building2 = {
        name: 'First building',
        description: 'Nice building',
    };

    const update1 = {
        participants: null,
    }

    const updatedProject1Data1 = {
        ...project1,
        private: false,
    };

    beforeAll(async () => {
        //Register and activate three users
        //First will be those projects owner
        const data1 = await registerActivateAndLogin(email1, username1, password);
        //Second one will be a participant of both projects
        const data2 = await registerActivateAndLogin(email2, username2, password);
        //Third one will have no relations with the project
        const data3 = await registerActivateAndLogin(email3, username3, password);

        token1 = data1.accessToken;
        token2 = data2.accessToken;
        token3 = data3.accessToken;

        user1id = data1.user.id;
        user2id = data2.user.id;
        user3id = data3.user.id;

        building1Data.author = data1.user.id;
        building2Data.author = data1.user.id;
        update1.participants = [data2.user.id];
        updatedProject1Data1.participants = [data2.user.id];

        //Create two projects as first user - one is private and another is public
        const res1 = await createProject(token1, project1);
        const receivedData1 = await res1.json();
        const res2 = await createProject(token1, project2);
        const receivedData2 = await res2.json();
        project1 = receivedData1;
        building1.projectID = receivedData1.id;
        project2 = receivedData2;
        building2.projectID = receivedData2.id;
    });

    test('Anonymous user cannot create buildings', async () => {
        const res = await createBuilding('erhrth', building1);
        await expectError(res, 401);
    });

    const building1Data = {
        ...building1,
        id: null,
        slug: null,
    };

    test('First user is able to create a building object in his public project', async () => {
        const res = await createBuilding(token1, building1);
        const receivedData = await expectToReceiveObject(res, building1Data);
        building1.id = receivedData.id;
        building1.slug = receivedData.slug;
        building1Data.id = receivedData.id;
        building1Data.slug = receivedData.slug;
    });

    const building2Data = {
        ...building2,
        id: null,
        slug: null,
    };

    test('A user is able to create a building object in private project', async () => {
        const res = await createBuilding(token1, building2);
        const receivedData = await expectToReceiveObject(res, building2Data);
        building2.id = receivedData.id;
        building2Data.id = receivedData.id;
        building2Data.slug = receivedData.slug;
    });

    test('First user adds second user as a project participant', async () => {
        console.log(update1);
        const res = await editProject(token1, project1.id, update1);
        project1 = await expectToReceiveObject(res, updatedProject1Data1);
    });

    test('It is possible to take this building by slug', async () => {
        const res = await getBuildingBySlug(null, username1, project1.slug, building1.slug);
        await expectToReceiveObject(res, building1Data);
    });

    test('It is possible to take this building by ID', async () => {
        const res = await getBuildingByID(null, building1.id);
        await expectToReceiveObject(res, building1Data);
    });

    const update2 = {
        name: 'Another name',
    };

    const updatedBuilding1Data2 = {
        ...building1Data,
        ...update2,
    };

    let newBuilding1Slug;
    let newBuilding1Name;

    test('It is possible to edit a building', async () => {
        const res = await editBuilding(token1, building1.id, update2);
        const receivedData = await expectToReceiveObject(res, updatedBuilding1Data2);
        newBuilding1Slug = receivedData.slug;
        newBuilding1Name = receivedData.name;
    });

    test('It is possible to get a building by a new slug', async () => {
        const res = await getBuildingBySlug(null, username1, project1.slug, newBuilding1Slug);
        await expectToReceiveObject(res, updatedBuilding1Data2);
    });

    test('A user is not able to delete a building anonymously', async () => {
        const res = await deleteBuilding('eyrthrte', building1.id);
        await expectError(res, 401);
    });

    test('A user is able to delete their building', async () => {
        const res = await deleteBuilding(token1, building1.id);
        await expectSuccess(res);
    });

    afterAll(async () => {
        await Promise.all([
                //Delete both projects
                deleteProject(token1, project1.id),
                deleteProject(token1, project2.id),
                //Delete all users
                deleteProfile(token1),
                deleteProfile(token2),
                deleteProfile(token3),
            ]
        );
    });
});