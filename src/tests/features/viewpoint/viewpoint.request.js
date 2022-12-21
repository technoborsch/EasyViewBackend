const requestFactory = require('../../../utils/RequestFactory');

const getViewpointById = (token, id) => requestFactory(
    'get',
    '/viewpoints/' + id,
    token,
);

const createViewpoint = (token, data) => requestFactory(
    'post',
    '/viewpoints',
    token,
    data,
);

const editViewpoint = (token, id, data) => requestFactory(
    'put',
    '/viewpoints/' + id,
    token,
    data,
);

const deleteViewpoint = (token, id) => requestFactory(
    'delete',
    '/viewpoints/' + id,
    token,
);

module.exports = {
    getViewpointById,
    createViewpoint,
    editViewpoint,
    deleteViewpoint,
};