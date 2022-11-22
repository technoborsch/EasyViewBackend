const {getUserEmail, register, requestFactory, activate, signin} = require('../utils/RequestFactory');

const email = getUserEmail();
const password = 'verystrongpassword';
const name = 'John';
const lastName = 'Wick';
let accessToken;
let activationToken;
let id;

const getMyProfile = (token) => requestFactory('get', '/user', token, null);

test('Try to get my profile as not logged user and be rejected', async () => {
    const res = await getMyProfile();
    expect(res.status).toBe(401);
    const userData = await res.json();
    expect(userData).toHaveProperty('error');
});

test('Register new user and retrieve an activation token', async () => {
    const res = await register(email);
    expect(res.status).toBe(200);
    const returnedData = await res.json();
    expect(returnedData).toHaveProperty('userId');
    expect(returnedData).toHaveProperty('token');
    id = returnedData.userId;
    activationToken = returnedData.token;
});

test('Activate new user', async () => {
    const res = await activate(id, activationToken, name, lastName, password);
    expect(res.status).toBe(200);
    const returnedData = await res.json();
    expect(returnedData).toHaveProperty('success', true);
});

test('Signin and get access token and user data', async () => {
    const res = await signin(email, password);
    expect(res.status).toBe(200);
    const returnedData = await res.json();
    expect(returnedData).toHaveProperty('user');
    expect(returnedData).toHaveProperty('token');
    accessToken = returnedData.token;
});

test('Retrieve data about myself', async () => {
    const res = await getMyProfile(accessToken);
    expect(res.status).toBe(200);
    const userData = await res.json();
    expect(userData).toHaveProperty('email', email);
    expect(userData).toHaveProperty('name', name);
    expect(userData).toHaveProperty('lastName', lastName);
    expect(userData).toHaveProperty('isAdmin', false);
    expect(userData).toHaveProperty('isModerator', false);
    expect(userData).not.toHaveProperty('password');
    expect(userData).not.toHaveProperty('_v');
});