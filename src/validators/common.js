const {
    isEmail,
    isMongoId,
    isAlphanumeric,
    isSlug,
    isLength,
} = require('validator');

const startsOrEndsWithWhiteSpace = (string) => {
    return string[0] === ' ' || string[string.length - 1] === ' ';
};

const idValidator = (id) => {
    return isMongoId(id + '');
};

const usernameValidator = (username) => {
    if (!isAlphanumeric(username) && !isSlug) {return false}
    return isLength(username, 5, 50);
};

const slugValidator = (slug) => {
    return isSlug(slug + '');
}

module.exports = {
    startsOrEndsWithWhiteSpace,
    idValidator,
    usernameValidator,
    slugValidator,
};