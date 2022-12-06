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
    deleteProject
} = require('../project/project.request');

const {generateUserEmail} = require('../../../utils/GenerateUserEmail');
const generateUsername = require('../../../utils/GenerateUsername');
const {deleteProfile} = require("../user/user.request");

describe('Tests for a building feature', () => {

    const email = generateUserEmail();
    const username = generateUsername();
    const password = 'Testbuildingswell33';
    let token;

    const project = {
        name: 'Project',
        slug: 'project',
    };

    const building = {
        name: 'First building',
        description: 'Nice building',
        slug: 'first',
    };


    beforeAll(async () => {
        //Register and activate a user
        const data = await registerActivateAndLogin(email, username, password);
        token = data.accessToken;
        //Create a project
        const res = await createProject(token, project);
        const receivedData = await res.json();
        project.id = receivedData.id;
        building.projectID = receivedData.id;
    });

    test('Anonymous user cannot create buildings', async () => {
        const res = await createBuilding('erhrth', building);
        const receivedData = await res.json();
        expect(res.status).toBe(401);
        expect(receivedData).toHaveProperty('error');
    });

    test('A user is able to create a building object', async () => {
        const res = await createBuilding(token, building);
        const receivedData = await res.json();
        expect(res.status).toBe(200);
        expect(receivedData).toHaveProperty('id');
        expect(receivedData).toHaveProperty('name', building.name);
        expect(receivedData).toHaveProperty('description', building.description);
        expect(receivedData).toHaveProperty('slug', building.slug);
        expect(receivedData).toHaveProperty('projectID', project.id);
        expect(receivedData).toHaveProperty('author', username);
        building.id = receivedData.id;
    });

    test('It is possible to take this project by slug', async () => {
        const res = await getBuildingBySlug(null, username, project.slug, building.slug);
        const receivedData = await res.json();
        expect(res.status).toBe(200);
        expect(receivedData).toHaveProperty('id');
        expect(receivedData).toHaveProperty('name', building.name);
        expect(receivedData).toHaveProperty('description', building.description);
        expect(receivedData).toHaveProperty('slug', building.slug);
        expect(receivedData).toHaveProperty('projectID', project.id);
        expect(receivedData).toHaveProperty('author', username);
    });

    test('It is possible to take this project by ID', async () => {
        const res = await getBuildingByID(null, building.id);
        const receivedData = await res.json();
        console.log(receivedData)
        expect(res.status).toBe(200);
        expect(receivedData).toHaveProperty('id');
        expect(receivedData).toHaveProperty('name', building.name);
        expect(receivedData).toHaveProperty('description', building.description);
        expect(receivedData).toHaveProperty('slug', building.slug);
        expect(receivedData).toHaveProperty('projectID', project.id);
        expect(receivedData).toHaveProperty('author', username);
    });

    test('It is possible to edit a project', async () => {
        const data = {
            name: 'Another name',
            slug: 'another_slug',
        };
        const res = await editBuilding(token, building.id, data);
        const receivedData = await res.json();
        expect(receivedData).toHaveProperty('id');
        expect(receivedData).toHaveProperty('name', data.name);
        expect(receivedData).toHaveProperty('description', building.description);
        expect(receivedData).toHaveProperty('slug', data.slug);
        expect(receivedData).toHaveProperty('projectID', project.id);
        expect(receivedData).toHaveProperty('author', username);
        building.slug = data.slug;
        building.name = data.name;
    });

    test('It is possible to get a building by a new slug', async () => {
        const res = await getBuildingBySlug(null, username, project.slug, 'another_slug');
        const receivedData = await res.json();
        expect(res.status).toBe(200);
        expect(receivedData).toHaveProperty('id');
        expect(receivedData).toHaveProperty('name', building.name);
        expect(receivedData).toHaveProperty('description', building.description);
        expect(receivedData).toHaveProperty('slug', building.slug);
        expect(receivedData).toHaveProperty('projectID', project.id);
        expect(receivedData).toHaveProperty('author', username);
    });

    test('A user is not able to delete a building anonymously', async () => {
        const res = await deleteBuilding('eyrthrte', building.id);
        const receivedData = await res.json();
        expect(res.status).toBe(401);
        expect(receivedData).toHaveProperty('error');
    });

    test('A user is able to delete their building', async () => {
        const res = await deleteBuilding(token, building.id);
        const receivedData = await res.json();
        console.log(receivedData)
        expect(res.status).toBe(200);
        expect(receivedData).toHaveProperty('success', true);
    });

    afterAll(async () => {
        //Delete a project
        await deleteProject(token, project.id);
        //Delete a user
        await deleteProfile(token, username);
    });
});