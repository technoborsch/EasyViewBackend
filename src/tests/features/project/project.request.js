const requestFactory = require('../../../utils/RequestFactory');

const getAllProjects = (token) => requestFactory(
    'get',
    '/projects',
    token,
);

const getAllMyProjects = (token) => requestFactory(
    'get',
    '/projects/my',
    token,
);

const getProjectById = (token, id) => requestFactory(
    'get',
    '/projects/' + id,
    token,
);

const getProjectBySlug = (token, slug) => requestFactory(
    'get',
    '/projects/slug/' + slug,
    token,
);

const createProject = (token, data) => requestFactory(
    'post',
    '/projects',
    token,
    data,
);

const editProject = (token, projectId, data) => requestFactory(
    'put',
    '/projects/' + projectId,
    token,
    data,
);

const deleteProject = (token, id) => requestFactory(
    'delete',
    '/projects/' + id,
    token,
);

module.exports = {
    getAllProjects,
    getAllMyProjects,
    getProjectById,
    getProjectBySlug,
    createProject,
    editProject,
    deleteProject,
};