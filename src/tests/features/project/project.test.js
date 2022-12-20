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
const {generateUserEmail} = require("../../../utils/GenerateUserEmail"); //TODO move in single file 'generators'
const generateUsername = require('../../../utils/GenerateUsername');
const {
    expectSuccess,
    expectError,
    expectToReceiveObject,
    expectToReceiveObjectArray,
} = require('../../common');
const {
    getUserByUsername,
    deleteProfile,
} = require("../user/user.request");

describe('Tests for project feature', () => {
    jest.setTimeout(30000);

    const user1mail = generateUserEmail();
    const user1name = generateUsername();
    const user1password = 'thisPasswordisunique99';
    let user1id;

    const user2mail = generateUserEmail();
    const user2name = generateUsername();
    const user2password = 'Thispasswordismoreunique55';
    let user2id;

    let token1;
    let token2;

    const project1 = {
        name: 'First',
        private: 'false',
    };

    const project2 = {
        name: 'Second',
        private: 'true',
    };

    const project1Data = {
        ...project1,
        private: false,
        id: null,
        description: null,
        author: user1id,
        participants: [],
        buildings: [],
        slug: null,
    };

    const project2Data = {
        ...project1Data,
        name: project2.name,
        private: true,
    }

    beforeAll(async () => {
        const loginData1 = await registerActivateAndLogin(user1mail, user1name, user1password);
        const loginData2 = await registerActivateAndLogin(user2mail, user2name, user2password);
        token1 = loginData1.accessToken;
        user1id = loginData1.user.id;
        token2 = loginData2.accessToken;
        user2id = loginData2.user.id;
    });

    test('First user creates two projects - public and private', async () => {
        const res1 = await createProject(token1, project1);
        const res2 = await createProject(token1, project2);
        const receivedData1 = await expectToReceiveObject(res1, project1Data);
        const receivedData2 = await expectToReceiveObject(res2, project2Data);
        project1.id = receivedData1.id;
        project1.slug = receivedData1.slug;
        project1Data.id = receivedData1.id;
        project1Data.author = user1id;
        project1Data.slug = receivedData1.slug;
        project2.id = receivedData2.id;
        project2.slug = receivedData2.slug;
        project2Data.id = receivedData2.id;
        project2Data.author = user1id;
        project2Data.slug = receivedData2.slug;
    });

    const userData = {
        id: null,
        email: user1mail,
        username: user1name,
        name: null,
        lastName: null,
        about: null,
        organization: null,
        isAdmin: false,
        isModerator: false,
        isPremium: false,
        visibility: 2,
        projects: null,
    };

    test('Assure that those projects present in users profile', async () => {
        const res = await getUserByUsername(token1, user1name);
        const receivedData = await expectToReceiveObject(res, userData);
        expect(receivedData.projects).toContain(project1.id);
        expect(receivedData.projects).toContain(project2.id);
        expect(receivedData.projects.length).toBe(2);
    });

    test('First user tries to create a project with the same name and gets rejected', async () => {
        const sameNameProject = {
            name: project1.name,
            description: 'Nice project',
        };
        const res = await createProject(token1, sameNameProject);
        await expectError(res, 409);
    });

    test('First user gets all projects and sees there both projects', async () => {
        const res = await getAllProjects(token1);
        await expectToReceiveObjectArray(res, [project1Data, project2Data]);
    });

    test('First user gets their projects and sees there both projects', async () => {
        const res = await getAllMyProjects(token1);
        await expectToReceiveObjectArray(res, [project1Data, project2Data]);
    });

    test('It is possible to get a list of projects without authentication and see there only a public project', async () => {
        const res = await getAllProjects(null);
        await expectToReceiveObjectArray(res, [project1Data]);
    });

    test('It is possible to get a public project by ID without authentication', async () => {
        const res = await getProjectById(null, project1.id);
        await expectToReceiveObject(res, project1Data);
    });

    test('It is possible to get a public project by slug without authentication', async () => {
        const res = await getProjectBySlug(null, user1name, project1.slug);
        await expectToReceiveObject(res, project1Data);
    });

    test('It is not possible to get a private project by ID without authentication', async () => {
        const res = await getProjectById(null, project2.id);
        await expectError(res, 403);
    });

    test('It is not possible to get a private project by slug without authentication', async () => {
        const res = await getProjectBySlug(null, user1name, project2.slug);
        await expectError(res, 403);
    });

    test('Second user gets all projects and sees there only a public project too', async () => {
        const res = await getAllProjects(token2);
        await expectToReceiveObjectArray(res, [project1Data]);
    });

    test('Second user gets their projects and sees there an empty list', async () => {
        const res = await getAllMyProjects(token2);
        await expectToReceiveObjectArray(res, []);
    });

    test('First user is able to get their public project by ID', async () => {
        const res = await getProjectById(token1, project1.id);
        await expectToReceiveObject(res, project1Data);
    });

    test('First user is able to get their public project by slug', async () => {
        const res = await getProjectBySlug(token1, user1name, project1.slug);
        await expectToReceiveObject(res, project1Data);
    });

    test('First user is able to get their private project by id', async () => {
        const res = await getProjectById(token1, project2.id);
        await expectToReceiveObject(res, project2Data);
    });

    test('First user is able to get their private project by slug', async () => {
        const res = await getProjectBySlug(token1, user1name, project2.slug);
        await expectToReceiveObject(res, project2Data);
    });

    test('Second user is able to get a public project by id', async () => {
        const res = await getProjectById(token2, project1.id);
        await expectToReceiveObject(res, project1Data);
    });

    test('Second user is able to get a public project by slug', async () => {
        const res = await getProjectBySlug(token2, user1name, project1.slug);
        await expectToReceiveObject(res, project1Data);
    });

    test('Second user is not able to get a private project by id', async () => {
        const res = await getProjectBySlug(token2, project2.id);
        await expectError(res, 404);
    });

    test('Second user is not able to get a private project by slug', async () => {
        const res = await getProjectBySlug(token2, user1name, project2.slug);
        await expectError(res, 403);
    });

    const update1 = {
        description: 'Really nice project',
    };

    const updatedProject1Data = {
        ...project1Data,
        description: update1.description,
    };

    test('First user is able to edit their public project', async () => {
        const res = await editProject(token1, project1.id, update1);
        const data = await expectToReceiveObject(res, updatedProject1Data);
        project1.description = data.description;
    });

    const update2 = {
            description: 'Really nice project',
    };

    const updatedProject2Data = {
        ...project2Data,
        description: update2.description,
    };

    test('First user is able to edit their private project', async () => {
        const res = await editProject(token1, project2.id, update2);
        const data = await expectToReceiveObject(res, updatedProject2Data);
        project2.description = data.description;
    });

    test('First user is not able to set a name to the project that is already in use', async () => {
        const data = {
            name: project2.name,
        }
        const res = await editProject(token1, project1.id, data);
        await expectError(res, 409);
    });

    test('Second user is not able to edit a public project', async () => {
        const data = {
            description: 'Really nice project',
        }
        const res = await editProject(token2, project1.id, data);
        await expectError(res, 403);
    });

    test('Second user is not able to edit a private project', async () => {
        const data = {
            description: 'Really nice project',
        }
        const res = await editProject(token2, project2.id, data);
        await expectError(res, 403);
    });

    test('Second user is not able to delete a public project', async () => {
        const res = await deleteProject(token2, project1.id);
        await expectError(res, 403);
    });

    test('Second user is not able to delete a private project', async () => {
        const res = await deleteProject(token2, project2.id);
        await expectError(res, 403);
    });

    test('First user deletes those two projects', async () => {
        const res1 = await deleteProject(token1, project1.id);
        const res2 = await deleteProject(token1, project2.id);
        await expectSuccess(res1);
        await expectSuccess(res2);
    });

    test('After deletion, those projects are not anymore in first user projects list', async () => {
        const res = await getUserByUsername(token1, user1name);
        const receivedData = await res.json();
        expect(receivedData.projects.length).toBe(0);
    });

    afterAll(async () => {
        await deleteProfile(token1);
        await deleteProfile(token2);
    });

});