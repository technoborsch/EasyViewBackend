const { requestFactory } = require('../utils/RequestFactory');

test('Try to GET some random routes and get 404', async () => {
    const randomGet = await requestFactory('get', '/rgfdg');
    expect(randomGet.status).toBe(404);
});