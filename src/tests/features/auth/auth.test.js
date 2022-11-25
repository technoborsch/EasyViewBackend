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

const userEmail = generateUserEmail();
let password = 'superstrongpassword';
let name = 'John';
let lastName = 'Wick';
let accessToken;
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

test("Try to register the same email while previous account hasn't been activated", async () => {
    const res = await registerUser(userEmail);
    const returnedData = await res.json();
    expect(res.status).toBe(409);
    expect(returnedData).toHaveProperty('error');
});

test('Activate new user', async () => {
    const res = await activate(id, activationToken, name, lastName, password);
    const returnedData = await res.json();
    expect(res.status).toBe(200);
    expect(returnedData).toHaveProperty('success', true);
});

test('Try to signin with another rassword and be furiously rejected', async () => {
    const res = await signin(userEmail, 'Someanotherrandompassword');
    const returnedData = await res.json();
    expect(res.status).toBe(401);
    expect(returnedData).toHaveProperty('error');
});

test('Signin and get access token and user data', async () => {
    const res = await signin(userEmail, password);
    const returnedData = await res.json();
    expect(res.status).toBe(200);
    expect(returnedData).toHaveProperty('user');
    expect(returnedData).toHaveProperty('token');
    accessToken = returnedData.token;
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
    expect(receivedData).toHaveProperty('token');
    expect(receivedData.token).not.toBe(accessToken);
    accessToken = receivedData.token;
});

test('Refresh token', async () => {
    //Wait for a while to receive slightly different JWT
    await new Promise(resolve => setTimeout(resolve, 1000));
    const res = await refreshToken(accessToken);
    const receivedData = await res.json();
    console.log(accessToken);
    console.log(receivedData.token);
    expect(res.status).toBe(200);
    expect(receivedData).toHaveProperty('token');
    expect(receivedData.token).not.toBe(accessToken);
});
