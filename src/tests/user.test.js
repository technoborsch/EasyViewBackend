const {getUserEmail, register, requestFactory, activate, signin, getPosts} = require('../utils/RequestFactory');
const {token} = require("morgan");

const email = getUserEmail();
let password = 'verystrongpassword';
let name = 'John';
let lastName = 'Wick';
let patronymic = 'Petrovich'
let accessToken;
let activationToken;
let id;

const getMyProfile = (token) => requestFactory('get', '/user', token, null);
const updateProfile = (token, name, password, lastName, patronymic) => {
    return requestFactory('post', '/user', token, {
        name: name,
        password: password,
        patronymic: patronymic
    });
};
const deleteProfile = (token) => requestFactory('delete', '/user', token);

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
    const returnedData = await res.json();
    expect(res.status).toBe(200);
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

password = 'evenmorestrongandmightypassword';
let newName = 'Ulfich'

test('Update profile and see changes', async () => {
    const res = await updateProfile(accessToken, newName, password, lastName, patronymic);
    const userData = await res.json();
    expect(res.status).toBe(200);
    expect(userData).toHaveProperty('email', email);
    expect(userData).toHaveProperty('name', newName);
    expect(userData).toHaveProperty('lastName', lastName);
    expect(userData).toHaveProperty('patronymic', patronymic);
    expect(userData).toHaveProperty('isAdmin', false);
    expect(userData).toHaveProperty('isModerator', false);
    expect(userData).not.toHaveProperty('password');
    expect(userData).not.toHaveProperty('_v');
});

test('Delete profile', async () => {
    const res = await deleteProfile(accessToken);
    const resData = await res.json();
    expect(res.status).toBe(200);
    expect(resData).toHaveProperty('success', true);
});

test('Not to be able to access protected pages', async () => {
    const res = await getMyProfile(accessToken);
    expect(res.status).toBe(401);
    const secondRes = await getPosts(accessToken);
    expect(secondRes.status).toBe(401);
});