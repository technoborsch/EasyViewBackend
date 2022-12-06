const requestFactory = require('../../../utils/RequestFactory');

const getBuildingBySlug = (token, username, projectSlug, buildingSlug) => requestFactory(
    'get',
    '/projects/' + username + '/' + projectSlug + '/buildings/' + buildingSlug,
    token,
);

const getBuildingByID = (token, id) => requestFactory(
    'get',
    '/buildings/' + id,
    token,
);

const createBuilding = (token, data) => requestFactory(
    'post',
    '/buildings',
    token,
    data,
);

const editBuilding = (token, id, data) => requestFactory(
    'put',
    '/buildings/' + id,
    token,
    data,
);

const deleteBuilding = (token, id) => requestFactory(
    'delete',
    '/buildings/' + id,
    token,
);

module.exports = {
    getBuildingBySlug,
    getBuildingByID,
    createBuilding,
    editBuilding,
    deleteBuilding,
};