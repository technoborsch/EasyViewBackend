const requestFactory = (method, url, token, body, baseauth) => {
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
    if (baseauth)
        init.headers = { ...init.headers, 'Authorization': 'Bearer ' + baseauth}
    return fetch(baseUrl + url, init).then(res => res);
}

const getUserEmail = () => {
    return 'user' + (Math.floor(Math.random() * 10000000)).toString() + '@example.com';
};

const register = async (email) => requestFactory(
    'post',
    '/signup',
    null,
    {
        email: email,
    }
);

const activate = async (id, token, name, lastName, password) => requestFactory(
    'post',
    '/activate',
    null,
    {
        id: id,
        token: token,
        name: name,
        lastName: lastName,
        password: password,
    }
);

const signin = async (email, password) => requestFactory(
    'post',
    '/signin',
    null,
    null,
    btoa(email + ':' + password),
)

const getPosts = async (token) => requestFactory(
    'get',
    '/posts',
    token,
    null,
);

module.exports = { requestFactory, getUserEmail, register, activate, signin, getPosts }