const {getUserEmail, register, requestFactory} = require('../utils/RequestFactory');

const email = getUserEmail();
const password = 'verystrongpassword';

let token;

const getMyProfile = (token) => requestFactory('get', '/user', token, null);

test('Try to get my profile as not logged user and be rejected', async () => {
    const res = await getMyProfile();
    expect(res.status).toBe(401);
    const userData = await res.json();
    expect(userData).toHaveProperty('error');
});

test('Register new user and retrieve a token', async () => {
    const res = await register(email, password);
    expect(res.status).toBe(200);
    const returnedData = await res.json();
    expect(returnedData).toHaveProperty('userId');
    expect(returnedData).toHaveProperty('email', email);
    expect(returnedData).toHaveProperty('token');
    expect(returnedData).toHaveProperty('expiry');
    token = returnedData.token;
});

test('Retrieve data about myself', async () => {
    const res = await getMyProfile(token);
    expect(res.status).toBe(200);
    const userData = await res.json();
    expect(userData).toHaveProperty('email', email);
    expect(userData).not.toHaveProperty('password');
    expect(userData).not.toHaveProperty('_v');
});