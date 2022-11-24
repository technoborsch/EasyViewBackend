const {generateUserEmail} = require('../../../utils/GenerateUserEmail');
const extractDataFromEmailLink = require('../../../utils/ExtractDataFromEmailLink');
const {getPosts} = require("../misc/misc.request");
const {
    registerUser,
    activate,
    signin,
} = require("./auth.request");

const userEmail = generateUserEmail();
let password = 'superstrongpassword';
let name = 'John';
let lastName = 'Wick';
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
    const res = await registerUser(userEmail);
    const returnedData = await res.json();
    console.log(returnedData);
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