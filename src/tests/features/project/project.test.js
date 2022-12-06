const {registerActivateAndLogin} = require('../auth/auth.action');
const {
    getAllProjects,
    getAllMyProjects,
    getProjectById,
    getProjectBySlug,
    createProject,
    editProject,
    deleteProject,
} = require('./project.request');
const {generateUserEmail} = require("../../../utils/GenerateUserEmail");
const generateUsername = require('../../../utils/GenerateUsername');

describe('Tests for project feature', () => {

    const user1mail = generateUserEmail();
    const user1name = generateUsername();
    const user1password = 'thisPasswordisunique99';

    const user2mail = generateUserEmail();
    const user2name = generateUsername();
    const user2password = 'Thispasswordismoreunique55';

    let token1;
    let token2;

    test('Register two users', async () => {
        const loginData1 = await registerActivateAndLogin(user1mail, user1name, user1password);
        const loginData2 = await registerActivateAndLogin(user2mail, user2name, user2password);
        expect(loginData1).toBeTruthy();
        expect(loginData2).toBeTruthy();
        token1 = loginData1.accessToken;
        token2 = loginData2.accessToken;
    });

    const project1 = {
        name: 'First',
        slug: 'first',
        private: 'false',
    };

    const project2 = {
        name: 'Second',
        slug: 'second',
        private: 'true',
    };

    test('First user creates two projects - public and private', async () => {
        const res1 = await createProject(token1, project1);
        const res2 = await createProject(token1, project2);
        const receivedData1 = await res1.json();
        const receivedData2 = await res2.json();
        expect(res1.status).toBe(200);
        expect(res2.status).toBe(200);
        expect(receivedData1).toHaveProperty('id');
        expect(receivedData1).toHaveProperty('name', project1.name);
        expect(receivedData1).toHaveProperty('slug', project1.slug);
        expect(receivedData1).toHaveProperty('private', false);
        expect(receivedData2).toHaveProperty('id');
        expect(receivedData2).toHaveProperty('name', project2.name);
        expect(receivedData2).toHaveProperty('slug', project2.slug);
        expect(receivedData2).toHaveProperty('private', true);
        project1.id = receivedData1.id;
        project2.id = receivedData2.id;
    });

    test('First user tries to create a project with the same name and gets rejected', async () => {
        const sameNameProject = {
            name: project1.name,
            description: 'Nice project',
            slug: 'another_slug'
        };
        const res = await createProject(token1, sameNameProject);
        const receivedData = await res.json();
        expect(res.status).toBe(409);
        expect(receivedData).toHaveProperty('error');
    });

    test('First user tries to create a project with the same slug and gets rejected', async () => {
        const sameSlugProject = {
            name: 'UniqueName',
            description: 'Nice project',
            slug: project2.slug,
        };
        const res = await createProject(token1, sameSlugProject);
        const receivedData = await res.json();
        expect(res.status).toBe(409);
        expect(receivedData).toHaveProperty('error');
    });

    test('First user gets all projects and sees there only a public project', async () => {
        const res = await getAllProjects(token1);
        const receivedData = await res.json();
        expect(res.status).toBe(200);
        expect(receivedData.length).toBe(1);
        const publicProject = receivedData[0];
        expect(publicProject).toHaveProperty('id', project1.id);
        expect(publicProject).toHaveProperty('name', project1.name);
        expect(publicProject).toHaveProperty('slug', project1.slug);
    });

    test('First user gets their projects and sees there both projects', async () => {
        const res = await getAllMyProjects(token1);
        const receivedData = await res.json();
        expect(res.status).toBe(200);
        expect(receivedData.length).toBe(2);
        const publicProject = receivedData[0];
        const privateProject = receivedData[1];
        expect(publicProject).toHaveProperty('id', project1.id);
        expect(publicProject).toHaveProperty('name', project1.name);
        expect(publicProject).toHaveProperty('slug', project1.slug);
        expect(privateProject).toHaveProperty('id', project2.id);
        expect(privateProject).toHaveProperty('name', project2.name);
        expect(privateProject).toHaveProperty('slug', project2.slug);
    });

    test('It is possible to get a list of projects without authentication and see there only a public project', async () => {
        const res = await getAllProjects(null);
        const receivedData = await res.json();
        expect(res.status).toBe(200);
        expect(receivedData.length).toBe(1);
        const publicProject = receivedData[0];
        expect(publicProject).toHaveProperty('id', project1.id);
        expect(publicProject).toHaveProperty('name', project1.name);
        expect(publicProject).toHaveProperty('slug', project1.slug);
    });

    test('It is possible to get a public project by ID without authentication', async () => {
        const res = await getProjectById(null, project1.id);
        const receivedData = await res.json();
        expect(res.status).toBe(200);
        expect(receivedData).toHaveProperty('id', project1.id);
        expect(receivedData).toHaveProperty('name', project1.name);
        expect(receivedData).toHaveProperty('slug', project1.slug);
    });

    test('It is possible to get a public project by slug without authentication', async () => {
        const res = await getProjectBySlug(null, user1name, project1.slug);
        const receivedData = await res.json();
        expect(res.status).toBe(200);
        expect(receivedData).toHaveProperty('id', project1.id);
        expect(receivedData).toHaveProperty('name', project1.name);
        expect(receivedData).toHaveProperty('slug', project1.slug);
    });

    test('It is not possible to get a private project by ID without authentication', async () => {
        const res = await getProjectById(null, project2.id);
        const receivedData = await res.json();
        expect(res.status).toBe(404);
        expect(receivedData).toHaveProperty('error');
    });

    test('It is not possible to get a private project by slug without authentication', async () => {
        const res = await getProjectBySlug(null, user1name, project2.slug);
        const receivedData = await res.json();
        expect(res.status).toBe(404);
        expect(receivedData).toHaveProperty('error');
    });

    test('Second user gets all projects and sees there only a public project too', async () => {
        const res = await getAllProjects(token2);
        const receivedData = await res.json();
        expect(res.status).toBe(200);
        expect(receivedData.length).toBe(1);
        const publicProject = receivedData[0];
        expect(publicProject).toHaveProperty('id', project1.id);
        expect(publicProject).toHaveProperty('name', project1.name);
        expect(publicProject).toHaveProperty('slug', project1.slug);
    });

    test('Second user gets their projects and sees there an empty list', async () => {
        const res = await getAllMyProjects(token2);
        const receivedData = await res.json();
        expect(res.status).toBe(200);
        expect(receivedData.length).toBe(0);
    });

    test('First user is able to get their public project by ID', async () => {
        const res = await getProjectById(token1, project1.id);
        const receivedData = await res.json();
        expect(res.status).toBe(200);
        expect(receivedData).toHaveProperty('id', project1.id);
        expect(receivedData).toHaveProperty('name', project1.name);
        expect(receivedData).toHaveProperty('slug', project1.slug);
    });

    test('First user is able to get their public project by slug', async () => {
        const res = await getProjectBySlug(token1, user1name, project1.slug);
        const receivedData = await res.json();
        expect(res.status).toBe(200);
        expect(receivedData).toHaveProperty('id', project1.id);
        expect(receivedData).toHaveProperty('name', project1.name);
        expect(receivedData).toHaveProperty('slug', project1.slug);
    });

    test('First user is able to get their private project by id', async () => {
        const res = await getProjectById(token1, project2.id);
        const receivedData = await res.json();
        expect(res.status).toBe(200);
        expect(receivedData).toHaveProperty('id', project2.id);
        expect(receivedData).toHaveProperty('name', project2.name);
        expect(receivedData).toHaveProperty('slug', project2.slug);
    });

    test('First user is able to get their private project by slug', async () => {
        const res = await getProjectBySlug(token1, user1name, project2.slug);
        const receivedData = await res.json();
        expect(res.status).toBe(200);
        expect(receivedData).toHaveProperty('id', project2.id);
        expect(receivedData).toHaveProperty('name', project2.name);
        expect(receivedData).toHaveProperty('slug', project2.slug);
    });

    test('Second user is able to get a public project by id', async () => {
        const res = await getProjectById(token2, project1.id);
        const receivedData = await res.json();
        expect(res.status).toBe(200);
        expect(receivedData).toHaveProperty('id', project1.id);
        expect(receivedData).toHaveProperty('name', project1.name);
        expect(receivedData).toHaveProperty('slug', project1.slug);
    });

    test('Second user is able to get a public project by slug', async () => {
        const res = await getProjectBySlug(token2, user1name, project1.slug);
        const receivedData = await res.json();
        expect(res.status).toBe(200);
        expect(receivedData).toHaveProperty('id', project1.id);
        expect(receivedData).toHaveProperty('name', project1.name);
        expect(receivedData).toHaveProperty('slug', project1.slug);
    });

    test('Second user is not able to get a private project by id', async () => {
        const res = await getProjectBySlug(token2, project2.id);
        const receivedData = await res.json();
        expect(res.status).toBe(404);
        expect(receivedData).toHaveProperty('error');
    });

    test('Second user is not able to get a private project by slug', async () => {
        const res = await getProjectBySlug(token2, user1name, project2.slug);
        const receivedData = await res.json();
        expect(res.status).toBe(404);
        expect(receivedData).toHaveProperty('error');
    });

    test('First user is able to edit their public project', async () => {
        const data = {
            description: 'Really nice project',
        }
        const res = await editProject(token1, project1.id, data);
        const receivedData = await res.json();
        expect(res.status).toBe(200);
        expect(receivedData).toHaveProperty('id', project1.id);
        expect(receivedData).toHaveProperty('name', project1.name);
        expect(receivedData).toHaveProperty('description', data.description);
        expect(receivedData).toHaveProperty('slug', project1.slug);
        project1.description = data.description;
    });

    test('First user is able to edit their private project', async () => {
        const data = {
            description: 'Really nice project',
        }
        const res = await editProject(token1, project2.id, data);
        const receivedData = await res.json();
        expect(res.status).toBe(200);
        expect(receivedData).toHaveProperty('id', project2.id);
        expect(receivedData).toHaveProperty('name', project2.name);
        expect(receivedData).toHaveProperty('description', data.description);
        expect(receivedData).toHaveProperty('slug', project2.slug);
        project2.description = data.description;
    });

    test('First user is not able to set a name to the project that is already in use', async () => {
        const data = {
            name: project2.name,
        }
        const res = await editProject(token1, project1.id, data);
        const receivedData = await res.json();
        expect(res.status).toBe(409);
        expect(receivedData).toHaveProperty('error');
    });

    test('First user is not able to set a slug to the project that is already in use', async () => {
        const data = {
            slug: project2.slug,
        }
        const res = await editProject(token1, project1.id, data);
        const receivedData = await res.json();
        expect(res.status).toBe(409);
        expect(receivedData).toHaveProperty('error');
    });

    test('Second user is not able to edit a public project', async () => {
        const data = {
            description: 'Really nice project',
        }
        const res = await editProject(token2, project1.id, data);
        const receivedData = await res.json();
        expect(res.status).toBe(403);
        expect(receivedData).toHaveProperty('error');
    });

    test('Second user is not able to edit a private project', async () => {
        const data = {
            description: 'Really nice project',
        }
        const res = await editProject(token2, project2.id, data);
        const receivedData = await res.json();
        expect(res.status).toBe(404);
        expect(receivedData).toHaveProperty('error');
    });

    test('Second user is not able to delete a public project', async () => {
        const res = await deleteProject(token2, project1.id);
        const receivedData = await res.json();
        expect(res.status).toBe(403);
        expect(receivedData).toHaveProperty('error');
    });

    test('Second user is not able to delete a private project', async () => {
        const res = await deleteProject(token2, project2.id);
        const receivedData = await res.json();
        expect(res.status).toBe(404);
        expect(receivedData).toHaveProperty('error');
    });

    test('First user deletes those two projects', async () => {
        const res1 = await deleteProject(token1, project1.id);
        const res2 = await deleteProject(token1, project2.id);
        const receivedData1 = await res1.json();
        const receivedData2 = await res2.json();
        expect(res1.status).toBe(200);
        expect(res2.status).toBe(200);
        expect(receivedData1).toHaveProperty('success', true);
        expect(receivedData2).toHaveProperty('success', true);
    });

});