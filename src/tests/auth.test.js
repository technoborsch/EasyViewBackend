const {getUserEmail, register, activate, signin, getPosts} = require('../utils/RequestFactory');

const userEmail = getUserEmail();
const password = 'superstrongpassword';
const name = 'John';
const lastName = 'Wick';
let accessToken;
let activationToken;
let id;

test('Try to access protected path and be rejected', async () => {
    const res = await getPosts();
    expect(res.status).toBe(401);
    const returnedData = await res.json();
    expect(returnedData).toHaveProperty('error');
});

test('Register new user and retrieve an activation token', async () => {
    const res = await register(userEmail);
    const returnedData = await res.json();
    expect(res.status).toBe(200);
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
    const res = await signin(userEmail, password);
    const returnedData = await res.json();
    expect(res.status).toBe(200);
    expect(returnedData).toHaveProperty('user');
    expect(returnedData).toHaveProperty('token');
    accessToken = returnedData.token;
});

test('Try to register the same email again and get an error', async () => {
    const res = await register(userEmail, password);
    expect(res.status).toBe(409);
    const returnedData = await res.json();
    expect(returnedData).toHaveProperty('error');
});

test('Get access to protected view with received token', async () => {
    const res = await getPosts(accessToken);
    expect(res.status).toBe(200);
    const returnedData = await res.json();
    expect(returnedData).not.toHaveProperty('error');
});