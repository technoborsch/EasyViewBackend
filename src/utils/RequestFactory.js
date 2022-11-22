const requestFactory = (method, url, token, body) => {
    const baseUrl = 'http://localhost:8020/api/v1'
    const init = {
        method: method
    }
    if (body) {
        init.body = JSON.stringify(body);
        init.headers = { ...init.headers, 'Content-Type': 'application/json;charset=utf-8'};
    }
    if (token) {
        init.headers = { ...init.headers, 'Authorization': 'Token ' + token};
    }
    return fetch(baseUrl + url, init).then(res => res);
}

const getUserEmail = () => {
    return 'user' + (Math.floor(Math.random() * 10000000)).toString() + '@example.com';
};

const register = async (email, password) => requestFactory(
    'post',
    '/signup',
    null,
    {
        email: email,
        password: password
    }
    );

const getPosts = async (token) => requestFactory(
    'get',
    '/posts',
    token,
    null,
);

module.exports = { requestFactory, getUserEmail, register, getPosts }