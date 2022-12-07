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
    deleteProject, editProject
} = require('../project/project.request');

const {generateUserEmail} = require('../../../utils/GenerateUserEmail');
const generateUsername = require('../../../utils/GenerateUsername');
const {deleteProfile} = require("../user/user.request");

describe('Tests for a building feature', () => {

    const email1 = generateUserEmail();
    const email2 = generateUserEmail();
    const email3 = generateUserEmail();

    const username1 = generateUsername();
    const username2 = generateUsername();
    const username3 = generateUsername();

    const password = 'Testbuildingswell33';

    let token1;
    let token2;
    let token3;

    let project1 = {
        name: 'Project',
        slug: 'project',
        private: 'false',
    };

    let project2 = {
        name: 'Project2',
        slug: 'project2',
        private: 'true',
    };

    const building1 = {
        name: 'First building',
        description: 'Nice building',
        slug: 'first',
    };

    const building2 = {
        name: 'First building',
        description: 'Nice building',
        slug: 'first',
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
        const receivedData = await res.json();
        expect(res.status).toBe(401);
        expect(receivedData).toHaveProperty('error');
    });

    test('A user is able to create a building object in public project', async () => {
        const res = await createBuilding(token1, building1);
        const receivedData = await res.json();
        expect(res.status).toBe(200);
        expect(receivedData).toHaveProperty('id');
        expect(receivedData).toHaveProperty('name', building1.name);
        expect(receivedData).toHaveProperty('description', building1.description);
        expect(receivedData).toHaveProperty('slug', building1.slug);
        expect(receivedData).toHaveProperty('projectID', project1.id);
        expect(receivedData).toHaveProperty('author', username1);
        building1.id = receivedData.id;
    });

    test('A user is able to create a building object in private project', async () => {
        const res = await createBuilding(token1, building2);
        const receivedData = await res.json();
        expect(res.status).toBe(200);
        expect(receivedData).toHaveProperty('id');
        expect(receivedData).toHaveProperty('name', building2.name);
        expect(receivedData).toHaveProperty('description', building2.description);
        expect(receivedData).toHaveProperty('slug', building2.slug);
        expect(receivedData).toHaveProperty('projectID', project2.id);
        expect(receivedData).toHaveProperty('author', username1);
        building2.id = receivedData.id;
    });

    test('First user adds a second user as project participator', async () => {
        const data = {participants: [username2]};
        const res = await editProject(token1, project1.id, data);
        const receivedData = await res.json();
        console.log(receivedData)
        expect(res.status).toBe(200);
        project1 = receivedData;
    });

    test('It is possible to take this building by slug', async () => {
        const res = await getBuildingBySlug(null, username1, project1.slug, building1.slug);
        const receivedData = await res.json();
        expect(res.status).toBe(200);
        expect(receivedData).toHaveProperty('id');
        expect(receivedData).toHaveProperty('name', building1.name);
        expect(receivedData).toHaveProperty('description', building1.description);
        expect(receivedData).toHaveProperty('slug', building1.slug);
        expect(receivedData).toHaveProperty('projectID', project1.id);
        expect(receivedData).toHaveProperty('author', username1);
    });

    test('It is possible to take this project by ID', async () => {
        const res = await getBuildingByID(null, building1.id);
        const receivedData = await res.json();
        console.log(receivedData)
        expect(res.status).toBe(200);
        expect(receivedData).toHaveProperty('id');
        expect(receivedData).toHaveProperty('name', building1.name);
        expect(receivedData).toHaveProperty('description', building1.description);
        expect(receivedData).toHaveProperty('slug', building1.slug);
        expect(receivedData).toHaveProperty('projectID', project1.id);
        expect(receivedData).toHaveProperty('author', username1);
    });

    test('It is possible to edit a project', async () => {
        const data = {
            name: 'Another name',
            slug: 'another_slug',
        };
        const res = await editBuilding(token1, building1.id, data);
        const receivedData = await res.json();
        expect(receivedData).toHaveProperty('id');
        expect(receivedData).toHaveProperty('name', data.name);
        expect(receivedData).toHaveProperty('description', building1.description);
        expect(receivedData).toHaveProperty('slug', data.slug);
        expect(receivedData).toHaveProperty('projectID', project1.id);
        expect(receivedData).toHaveProperty('author', username1);
        building1.slug = data.slug;
        building1.name = data.name;
    });

    test('It is possible to get a building by a new slug', async () => {
        const res = await getBuildingBySlug(null, username1, project1.slug, 'another_slug');
        const receivedData = await res.json();
        expect(res.status).toBe(200);
        expect(receivedData).toHaveProperty('id');
        expect(receivedData).toHaveProperty('name', building1.name);
        expect(receivedData).toHaveProperty('description', building1.description);
        expect(receivedData).toHaveProperty('slug', building1.slug);
        expect(receivedData).toHaveProperty('projectID', project1.id);
        expect(receivedData).toHaveProperty('author', username1);
    });

    test('A user is not able to delete a building anonymously', async () => {
        const res = await deleteBuilding('eyrthrte', building1.id);
        const receivedData = await res.json();
        expect(res.status).toBe(401);
        expect(receivedData).toHaveProperty('error');
    });

    test('A user is able to delete their building', async () => {
        const res = await deleteBuilding(token1, building1.id);
        const receivedData = await res.json();
        console.log(receivedData)
        expect(res.status).toBe(200);
        expect(receivedData).toHaveProperty('success', true);
    });

    afterAll(async () => {
        await Promise.all([
                //Delete both projects
                deleteProject(token1, project1.id),
                deleteProject(token1, project2.id),
                //Delete all users
                deleteProfile(token1, username1),
                deleteProfile(token2, username2),
                deleteProfile(token3, username3),
            ]
        );
    });
});