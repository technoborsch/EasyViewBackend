const {generateUserEmail} = require('../../../utils/GenerateUserEmail');

const {
    signin,
} = require('../auth/auth.request');

const {
    registerActivateAndLogin
} = require('../auth/auth.action')

const {
    getMyProfile,
    updateProfile,
    deleteProfile,
} = require('./user.request')

const { getPosts } = require('../misc/misc.request')

const email = generateUserEmail();
const password = 'verystrongpassword';
const name = 'Vasya';
const lastName = 'Petrovisch';
const patronymic = 'Petrenko'

test('Try to get my profile as not logged user and be rejected', async () => {
    const res = await getMyProfile();
    expect(res.status).toBe(401);
    const userData = await res.json();
    expect(userData).toHaveProperty('error');
});

let accessToken;

test('Retrieve an access token', async () => {
    const data = await registerActivateAndLogin(email, name, lastName, password, patronymic);
    expect(data).toHaveProperty('user');
    expect(data).toHaveProperty('accessToken');
    expect(data).toHaveProperty('refreshToken');
    accessToken = data.accessToken;
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

const newPassword = 'evenmorestrongandmightypassword';
let newName = 'Ulfich'

test('Update profile and see changes', async () => {
    const res = await updateProfile(accessToken, newName, newPassword, lastName, patronymic);
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

test('Check that user is able to login with new password', async () => {
    const res = await signin(email, newPassword);
    const resData = await res.json();
    expect(res.status).toBe(200);
    expect(resData).toHaveProperty('user');
    expect(resData).toHaveProperty('accessToken');
    expect(resData).toHaveProperty('refreshToken');
});

test('Check that user is not able to login with old password', async () => {
    const res = await signin(email, password);
    const resData = await res.json();
    expect(res.status).toBe(401);
    expect(resData).toHaveProperty('error');
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