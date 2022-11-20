const url = 'http://localhost:8020/api/';

const getUserEmail = () => {
    return 'user' + (Math.floor(Math.random() * 10000000)).toString() + '@example.com';
};

const thisUserEmail = getUserEmail();

const register = () => fetch(url + 'signup', {
    method: 'post',
    headers: {
    'Content-Type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify({
        email: thisUserEmail,
        password: 'supapassword',
    }),
}).then(res => res.json());

const getPosts = () => fetch(url + 'posts', {
    headers: {
        'Authorization': 'Token ' + accessToken,
    }
}).then(res => res.json());

let accessToken;

test('Try to access protected path and be rejected', async () => {
    const returnedData = await getPosts();
    expect(returnedData).toHaveProperty('error');
});

test('Register new user and retrieve a token', async () => {
    const returnedData = await register();
    expect(returnedData).toHaveProperty('userId');
    expect(returnedData).toHaveProperty('email', thisUserEmail);
    expect(returnedData).toHaveProperty('token');
    expect(returnedData).toHaveProperty('expiry');
    accessToken = returnedData.token;
});

test('Try to register the same email again and get an error', async () => {
    const returnedData = await register();
    expect(returnedData).toHaveProperty('error');
});

test('Get access to protected view with received token', async () => {
    const returnedData = await getPosts();
    expect(returnedData).not.toHaveProperty('error');
});