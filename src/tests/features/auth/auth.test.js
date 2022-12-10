const {generateUserEmail} = require('../../../utils/GenerateUserEmail');
const generateUsername = require('../../../utils/GenerateUsername');
const extractDataFromEmailLink = require('../../../utils/ExtractDataFromEmailLink');
const {getProtected, getUserByUsername} = require("../user/user.request");
const {
    registerUser,
    activate,
    signin,
    logout,
    resetPasswordRequest,
    resetPassword,
    refreshToken,
} = require("./auth.request");
const {deleteProfile} = require("../user/user.request");

const {
    expectError,
    expectSuccess,
    expectWithoutErrors,
    expectToReceiveObject,
    loginData,
    refreshData,
} = require('../../common');

describe('Authentication, registration, activation, token refresh tests', () => {

    const userEmail = generateUserEmail();
    let password = 'superStrongpassword88';
    let username = generateUsername();
    let accessToken;
    let refreshingToken;
    let activationToken;
    let id;

    test('Try to access protected path and be rejected', async () => {
        const res = await getProtected('something');
        await expectError(res, 401);
    });

    test('Register new user and retrieve an activation token', async () => {
        const res = await registerUser(userEmail, username, password);
        await expectSuccess(res);
        const data = await extractDataFromEmailLink(userEmail);
        activationToken = data[0];
        id = data[1];
    });

    test('Try to reset password while account is not already active', async () => {
        const res = await resetPasswordRequest(userEmail);
        await expectError(res, 404);
    });

    test('Try to get accout info while account is not already active', async () => {
        const res = await getUserByUsername(username);
        await expectError(res, 404);
    });

    test("Try to register the same email while previous account hasn't been activated", async () => {
        const res = await registerUser(userEmail, 'mega_john', password);
        await expectError(res, 409);
    });

    const someRandomValidActivationToken = '1a374cf0bf7ed91d0afef40c6a58616292d946016eae948dc9a5cc535c2fb929';

    test('Try to activate an account with valid but wrong token', async () => {
        const res = await activate(id, someRandomValidActivationToken);
        await expectError(res, 401);
    });

    const someRandomID = '6380890a09b31d5e01f1fe50';

    test('Try to activate an account with valid token but another ID', async () => {
        const res = await activate(someRandomID, activationToken);
        await expectError(res, 401);
    });

    test('Activate new user', async () => {
        const res = await activate(id, activationToken);
        await expectSuccess(res);
    });

    test('Try to signin with another password and be furiously rejected', async () => {
        const res = await signin(userEmail, 'Someanotherrandompassword777');
        await expectError(res, 401);
    });

    test('Signin and get access token, refresh token and user data', async () => {
        const res = await signin(userEmail, password);
        const receivedData = await expectToReceiveObject(res, loginData);
        accessToken = receivedData.accessToken;
        refreshingToken = receivedData.refreshToken;
    });

    test('Try to register the same email again and get an error', async () => {
        const res = await registerUser(userEmail, generateUsername(), password);
        await expectError(res, 409);
    });

    test('Get access to protected view with received token', async () => {
        const res = await getProtected(accessToken);
        await expectWithoutErrors(res);
    });

    test('Try to get access to protected view with received refresh token and be rejected', async () => {
        const res = await getProtected(refreshingToken);
        await expectError(res, 400);
    });

    let resetToken;
    let newlyReceivedId;

    test('User forgot a password and asks for reset, receive resetting letter', async () => {
        await resetPasswordRequest(userEmail);
        const data = await extractDataFromEmailLink(userEmail);
        resetToken = data[0];
        newlyReceivedId = data[1];
        expect(resetToken).toBeTruthy();
        expect(newlyReceivedId).toBe(id);
    });

    test('Try to reset password again and be rejected because too early', async () => {
        const res = await resetPasswordRequest(userEmail);
        await expectError(res, 409);
    });

    const anotherNewPassword = 'newPasswordiwillneverforget55';

    test('Not to be able to login with new password', async () => {
        const res = await signin(userEmail, anotherNewPassword);
        await expectError(res, 401);
    });

    test('Use received letter to set new password', async () => {
        const res = await resetPassword(resetToken, newlyReceivedId, anotherNewPassword);
        await expectSuccess(res);
    });

    test('Be able to login with new password using username', async () => {
        const res = await signin(username, anotherNewPassword);
        const receivedData = await expectToReceiveObject(res, loginData);
        expect(receivedData.accessToken).not.toBe(accessToken);
        expect(receivedData.refreshToken).not.toBe(refreshingToken);
        accessToken = receivedData.accessToken;
        refreshingToken = receivedData.refreshToken;
    });

    test('Not to be able to login with old password', async () => {
        const res = await signin(userEmail, password);
        await expectError(res, 401);
    });

    let newRefreshingToken;

    test('Refresh token', async () => {
        const res = await refreshToken(refreshingToken);
        const receivedData = await expectToReceiveObject(res, refreshData);
        accessToken = receivedData.accessToken;
        newRefreshingToken = receivedData.refreshToken;
    });

    test('Not to be able to use previous refresh token', async () => {
        const res = await refreshToken(refreshingToken);
        await expectError(res, 401);
        refreshingToken = newRefreshingToken;
    });

    test('Request password reset and receive token again', async () => {
        await resetPasswordRequest(userEmail);
        const data = await extractDataFromEmailLink(userEmail);
        resetToken = data[0];
        newlyReceivedId = data[1];
        expect(resetToken).toBeTruthy();
        expect(newlyReceivedId).toBe(id);
    });

    test('Delete account', async () => {
        const res = await deleteProfile(accessToken);
        await expectSuccess(res);
    });

    const allNewAllDifferentPassword = 'DifferentPassword33';

    const newUsername = generateUsername();
    let newId;

    test('Register and get registration info again with new username and password', async () => {
        const res = await registerUser(userEmail, newUsername, allNewAllDifferentPassword);
        await expectSuccess(res);
        const data = await extractDataFromEmailLink(userEmail);
        activationToken = data[0];
        newId = data[1];
        expect(activationToken).toBeTruthy();
        expect(newId).not.toBe(id);
    });

    test('Activate again', async () => {
        const res = await activate(newId, activationToken);
        await expectSuccess(res);
    });

    test('Login with new password', async () => {
        const res = await signin(newUsername, allNewAllDifferentPassword);
        const receivedData = await expectToReceiveObject(res, loginData);
        expect(receivedData.accessToken).not.toBe(accessToken);
        expect(receivedData.refreshToken).not.toBe(refreshingToken);
        accessToken = receivedData.accessToken;
        refreshingToken = receivedData.refreshToken;
    });

    test('Not to be able to reset password using token issued before deletion', async () => {
        const res = await resetPassword(resetToken, newId, "SomeNewpassword22");
        await expectError(res, 401);
    });

    test('Logout from current session', async () => {
        const res = await logout(accessToken);
        await expectSuccess(res);
    });

    test('Now access token should not work', async () => {
        const res = await getProtected(accessToken);
        await expectError(res, 401);
    });

    test('Refresh token also must not work', async () => {
        const res = await refreshToken(refreshingToken);
        await expectError(res, 401);
    });
});