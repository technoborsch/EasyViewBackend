const {generateUserEmail} = require('../../../utils/GenerateUserEmail');
const extractDataFromEmailLink = require('../../../utils/ExtractDataFromEmailLink');
const {getPosts} = require("../misc/misc.request");
const {
    registerUser,
    activate,
    signin,
    resetPasswordRequest,
    resetPassword,
    refreshToken,
} = require("./auth.request");
const {deleteProfile} = require("../user/user.request");

const userEmail = generateUserEmail();
let password = 'superstrongpassword';
let name = 'John';
let lastName = 'Wick';
let accessToken;
let refreshingToken;
let activationToken;
let id;

test('Try to access protected path and be rejected', async () => {
    const res = await getPosts('something');
    expect(res.status).toBe(401);
    const returnedData = await res.json();
    expect(returnedData).toHaveProperty('error');
});

test('Register new user and retrieve an activation token', async () => {
    const res = await registerUser(userEmail);
    const returnedData = await res.json();
    expect(res.status).toBe(200);
    expect(returnedData).toHaveProperty('success', true);
    const data = await extractDataFromEmailLink(userEmail);
    activationToken = data[0];
    id = data[1];
});

test('Try to reset password while account is not already active', async () => {
    const res = await resetPasswordRequest(userEmail);
    const receivedData = await res.json();
    expect(res.status).toBe(404);
    expect(receivedData).toHaveProperty('error');
});

test("Try to register the same email while previous account hasn't been activated", async () => {
    const res = await registerUser(userEmail);
    const returnedData = await res.json();
    expect(res.status).toBe(409);
    expect(returnedData).toHaveProperty('error');
});

const someRandomValidActivationToken = '1a374cf0bf7ed91d0afef40c6a58616292d946016eae948dc9a5cc535c2fb929';

test('Try to activate an account with valid but wrong token', async () => {
    const res = await activate(id, someRandomValidActivationToken, name, lastName, password);
    const receivedData = await res.json();
    expect(res.status).toBe(401);
    expect(receivedData).toHaveProperty('error');
});

const someRandomID = '6380890a09b31d5e01f1fe50';

test('Try to activate an account with valid token but another ID', async () => {
    const res = await activate(someRandomID, activationToken, name, lastName, password);
    const receivedData = await res.json();
    expect(res.status).toBe(401);
    expect(receivedData).toHaveProperty('error');
});

test('Activate new user', async () => {
    const res = await activate(id, activationToken, name, lastName, password);
    const returnedData = await res.json();
    expect(res.status).toBe(200);
    expect(returnedData).toHaveProperty('success', true);
});

test('Try to signin with another password and be furiously rejected', async () => {
    const res = await signin(userEmail, 'Someanotherrandompassword');
    const returnedData = await res.json();
    expect(res.status).toBe(401);
    expect(returnedData).toHaveProperty('error');
});

test('Signin and get access token, refresh token and user data', async () => {
    const res = await signin(userEmail, password);
    const returnedData = await res.json();
    expect(res.status).toBe(200);
    expect(returnedData).toHaveProperty('user');
    expect(returnedData).toHaveProperty('accessToken');
    expect(returnedData).toHaveProperty('refreshToken');
    accessToken = returnedData.accessToken;
    refreshingToken = returnedData.refreshToken;
});

test('Try to register the same email again and get an error', async () => {
    const res = await registerUser(userEmail);
    const returnedData = await res.json();
    expect(res.status).toBe(409);
    expect(returnedData).toHaveProperty('error');
});

test('Get access to protected view with received token', async () => {
    const res = await getPosts(accessToken);
    const returnedData = await res.json();
    expect(res.status).toBe(200);
    expect(returnedData).not.toHaveProperty('error');
});

test('Try to get access to protected view with received refresh token and be rejected', async () => {
    const res = await getPosts(refreshingToken);
    const returnedData = await res.json();
    expect(res.status).toBe(400);
    expect(returnedData).toHaveProperty('error');
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
    const receivedData = await res.json();
    expect(res.status).toBe(409);
    expect(receivedData).toHaveProperty('error');
});

const anotherNewPassword = 'newpasswordiwillneverforget';

test('Not to be able to login with new password', async () => {
    const res = await signin(userEmail, anotherNewPassword);
    const receivedData = await res.json();
    expect(res.status).toBe(401);
    expect(receivedData).toHaveProperty('error');
});

test('Use received letter to set new password', async () => {
    const res = await resetPassword(resetToken, newlyReceivedId, anotherNewPassword);
    const receivedData = await res.json();
    expect(res.status).toBe(200);
    expect(receivedData).toHaveProperty('success', true);
});

test('Be able to login with new password', async () => {
    const res = await signin(userEmail, anotherNewPassword);
    const receivedData = await res.json();
    expect(res.status).toBe(200);
    expect(receivedData).toHaveProperty('user');
    expect(receivedData).toHaveProperty('accessToken');
    expect(receivedData).toHaveProperty('refreshToken');
    expect(receivedData.token).not.toBe(accessToken);
    accessToken = receivedData.token;
});

test('Not to be able to login with old password', async () => {
    const res = await signin(userEmail, password);
    const returnedData = await res.json();
    expect(res.status).toBe(401);
    expect(returnedData).toHaveProperty('error');
});

let newRefreshingToken;

test('Refresh token', async () => {
    const res = await refreshToken(refreshingToken);
    const receivedData = await res.json();
    expect(res.status).toBe(200);
    expect(receivedData).toHaveProperty('accessToken');
    expect(receivedData).toHaveProperty('refreshToken');
    expect(receivedData.accessToken).not.toBe(accessToken);
    expect(receivedData.refreshToken).not.toBe(refreshingToken);
    accessToken = receivedData.accessToken;
    newRefreshingToken = receivedData.refreshToken;
});

test('Not to be able to use previous refresh token', async () => {
    const res = await refreshToken(refreshingToken);
    const receivedData = await res.json();
    expect(res.status).toBe(401);
    expect(receivedData).toHaveProperty('error');
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

test('Delete account (actually deactivate)', async () => {
    const res = await deleteProfile(accessToken);
    const receivedData = await res.json();
    expect(res.status).toBe(200);
    expect(receivedData).toHaveProperty('success', true);
});

test('Register and get registration info again', async () => {
    const res = await registerUser(userEmail);
    const receivedData = await res.json();
    const data = await extractDataFromEmailLink(userEmail);
    activationToken = data[0];
    const newId = data[1];
    expect(res.status).toBe(200);
    expect(receivedData).toHaveProperty('success', true);
    expect(activationToken).toBeTruthy();
    expect(newId).toBe(id);
});

test('Activate again', async () => {
    const res = await activate(id, activationToken, name, lastName, password, 'Petrovich');
    const receivedData = await res.json();
    expect(res.status).toBe(200);
    expect(receivedData).toHaveProperty('success', true);
});

test('Not to be able to reset password using token issued before deletion', async () => {
    const res = await resetPassword(resetToken, id, "Somenewpassword");
    const receivedData = await res.json();
    expect(res.status).toBe(401);
    expect(receivedData).toHaveProperty('error');
});