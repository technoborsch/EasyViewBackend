const {getUserEmail, register, getPosts} = require('../utils/RequestFactory');

const userEmail = getUserEmail();
const password = 'superstrongpassword';
let accessToken;

test('Try to access protected path and be rejected', async () => {
    const res = await getPosts();
    expect(res.status).toBe(401);
    const returnedData = await res.json();
    expect(returnedData).toHaveProperty('error');
});

test('Register new user and retrieve a token', async () => {
    const res = await register(userEmail, password);
    expect(res.status).toBe(200);
    const returnedData = await res.json();
    expect(returnedData).toHaveProperty('userId');
    expect(returnedData).toHaveProperty('email', userEmail);
    expect(returnedData).toHaveProperty('token');
    expect(returnedData).toHaveProperty('expiry');
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