const {generateUserEmail} = require('../../../utils/GenerateUserEmail');
const generateUsername = require('../../../utils/GenerateUsername');

const {
    signin,
} = require('../auth/auth.request');

const {
    registerActivateAndLogin
} = require('../auth/auth.action')

const {
    getMyProfile,
    getUserByUsername,
    updateProfile,
    deleteProfile,
} = require('./user.request')

const email = generateUserEmail();
const password = 'Verystrongpassword55';
const username = generateUsername();
const lastName = 'Petrovich';

test('Try to get my profile as not logged user and be rejected', async () => {
    const res = await getMyProfile('sdgfvdb');
    expect(res.status).toBe(401);
    const userData = await res.json();
    expect(userData).toHaveProperty('error');
});

let accessToken;

test('Retrieve an access token', async () => {
    const data = await registerActivateAndLogin(email, username, password);
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
    expect(userData).toHaveProperty('username', username);
    expect(userData).toHaveProperty('isAdmin', false);
    expect(userData).toHaveProperty('isModerator', false);
    expect(userData).toHaveProperty('isPremium', false);
    expect(userData).not.toHaveProperty('password');
    expect(userData).not.toHaveProperty('_v');
});

test('Get profile via username', async () =>{
    const res = await getUserByUsername(username);
    const userData = await res.json();
    expect(res.status).toBe(200);
    expect(userData).toHaveProperty('email', email);
    expect(userData).toHaveProperty('username', username);
    expect(userData).toHaveProperty('isAdmin', false);
    expect(userData).toHaveProperty('isModerator', false);
    expect(userData).toHaveProperty('isPremium', false);
    expect(userData).not.toHaveProperty('password');
    expect(userData).not.toHaveProperty('_v');

});

const newPassword = 'Evenmorestrongandmightypassword88';
const newName = 'Ulfrich';
const about = 'Its me';
const organization = 'Microsoft'

test('Update profile and see changes', async () => {
    const res = await updateProfile(accessToken, newName, newPassword, lastName, about, organization);
    const userData = await res.json();
    expect(res.status).toBe(200);
    expect(userData).toHaveProperty('email', email);
    expect(userData).toHaveProperty('username', username);
    expect(userData).toHaveProperty('lastName', lastName);
    expect(userData).toHaveProperty('name', newName);
    expect(userData).toHaveProperty('about', about);
    expect(userData).toHaveProperty('organization', organization);
    expect(userData).toHaveProperty('isAdmin', false);
    expect(userData).toHaveProperty('isModerator', false);
    expect(userData).toHaveProperty('isPremium', false);
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
});