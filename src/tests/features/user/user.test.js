const fs = require('fs');
const { Readable } = require('stream');
const { finished } = require('stream/promises');

const {generateUserEmail} = require('../../../utils/GenerateUserEmail');
const generateUsername = require('../../../utils/GenerateUsername');

const {
    signin,
} = require('../auth/auth.request');

const {
    registerActivateAndLogin
} = require('../auth/auth.action');

const {
    getUserByUsername,
    getAvatar,
    updateProfile,
    deleteProfile,
    getProtected,
} = require('./user.request');

const {
    expectError,
    expectSuccess,
    expectToReceiveObject, loginData,
} = require('../../common');

describe('Tests for users', () => {
    jest.setTimeout(30000);

    const user = {
        id: null,
        email: generateUserEmail(),
        username: generateUsername(),
        name: null,
        lastName: null,
        about: null,
        organization: null,
        isAdmin: false,
        isModerator: false,
        isPremium: false,
        visibility: 2,
    };

    let token;
    const password = 'Verystrongpassword55';
    let id;

    beforeAll(async () => {
        const data = await registerActivateAndLogin(user.email, user.username, password);
        token = data.accessToken;
    });

    test('Retrieve data about myself', async () => {
        const res = await getUserByUsername(token, user.username);
        const receivedData = await expectToReceiveObject(res, user);
        expect(receivedData).not.toHaveProperty('password');
        expect(receivedData).not.toHaveProperty('_v');
        id = receivedData.id;
        updatedUser.avatar = `http://127.0.0.1:8020/api/v1/user/${id}/avatar`;
    });

    const newPassword = 'Evenmorestrongandmightypassword88';
    const updateData = {
        name: 'Ulfrich',
        about: 'Its me',
        organization: 'Microsoft',
        password: newPassword,
    };
    const update = new FormData();
    update.append('name', 'Ulfrich');
    update.append('about', 'Its me');
    update.append('organization', 'Microsoft');
    update.append('password', 'Evenmorestrongandmightypassword88');
    update.append('avatar', new Blob([fs.readFileSync(__dirname + '/image.png')], {type: 'image/png'}), 'image.png');
    const updatedUser = {
        ...user,
        ...updateData,
    };
    delete updatedUser.password;

    test('Check that user is able to login', async () => {
        const res = await signin(user.email, password);
        const receivedData = await expectToReceiveObject(res, loginData);
        token = receivedData.accessToken;
    });

    test('Update profile and see changes', async () => {
        const res = await updateProfile(token, id, update);
        const receivedData = await expectToReceiveObject(res, updatedUser);
        expect(receivedData).not.toHaveProperty('password');
        expect(receivedData).not.toHaveProperty('_v');
    });

    test('Get avatar and assure that it is equal to a file that has been sent', async () => {
        const stream = fs.createWriteStream(__dirname + '/avatar.png');
        const res = await getAvatar(token, id);
        const webStream = await res.body;
        await finished(Readable.fromWeb(webStream).pipe(stream));
        expect(fs.readFileSync(__dirname + '/image.png')).toEqual(fs.readFileSync(__dirname + '/avatar.png'));
    });

    test('Check that user is able to login with new password', async () => {
        const res = await signin(updatedUser.email, newPassword);
        const receivedData = await expectToReceiveObject(res, loginData);
        token = receivedData.accessToken;
    });

    test('Check that user is not able to login with old password', async () => {
        const res = await signin(updatedUser.email, password);
        await expectError(res, 401);
    });

    test('Get user route should process random requests to get user adequately', async () => {
        const res = await getUserByUsername('shaka laka', 'uga buga');
        await expectError(res, 401);
    });

    test('Delete profile', async () => {
        const res = await deleteProfile(token);
        await expectSuccess(res);
    });

    test('The profile is not accessible after deletion', async () => {
        const res = await getUserByUsername(null, updatedUser.username);
        await expectError(res, 404);
    });

    test('Not to be able to access protected pages with old token', async () => {
        const res = await getProtected(token);
        await expectError(res, 401);
    });

    afterAll(async () => {
        //Nothing to tear down after this test suit
    });

});
