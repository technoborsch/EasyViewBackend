const ReqError = require("./ReqError");
const fs = require('fs');

/**
 * Factory that returns a function to check request property (body, params) with given attributes, optional attributes and their validators.
 * @param {string} requestPropertyToCheck A property of req object that should be validated.
 * @param {[[string, function]]} attributes An array of arrays in format: first element is string with an attribute that
 * must present in body and second element is validation function for this attribute.
 * @param {[[string, function]]} [optionalAttributes] An array of arrays in format: first element is string with an attribute
 * that can be in request body and second element is validation function for this attribute.
 * @returns {(function(*): void)|*} request body validator for given attributes
 */
const requestPropertyValidatorFactory = (requestPropertyToCheck, attributes, optionalAttributes) => {
    return function (req) {
        if (!req.hasOwnProperty(requestPropertyToCheck) || !req[requestPropertyToCheck]) {
            throw new ReqError(`Request must contain "${requestPropertyToCheck}" property`, 400);
        }
        const data = req[requestPropertyToCheck];
        const providedNumberOfAttributes = Object.keys(data).length;
        if (providedNumberOfAttributes === 0) throw new ReqError(`No attributes have been provided in request ${requestPropertyToCheck}`, 400)
        if (attributes) {
            for (const attr of attributes) {
                const attribute = attr[0];
                const validatorFunction = attr[1];
                if (!Object.hasOwn(data, attribute) || !data[attribute]) {
                    throw new ReqError(`Request ${requestPropertyToCheck} must contain "${attribute}" attribute`, 400);
                }
                if (validatorFunction && !validatorFunction(data[attribute])) {
                    throw new ReqError(`Not valid data has been provided in request ${requestPropertyToCheck} attribute "${attribute}"`, 400);
                }
            }
        }
        let optionalsCounter = 0;
        if (optionalAttributes) {
            for (const optionalAttrArray of optionalAttributes) {
                const attribute = optionalAttrArray[0];
                const optionalAttributeValidator = optionalAttrArray[1];
                if (Object.hasOwn(data, attribute)) {
                    optionalsCounter++;
                    if (!data[attribute]) {
                        throw new ReqError(`If provided, optional attribute of 
                        request ${requestPropertyToCheck} "${attribute}" must be not empty`, 400);
                    }
                    if (optionalAttributeValidator && !optionalAttributeValidator(data[attribute])) {
                        throw new ReqError(`If provided, optional attribute of 
                        request ${requestPropertyToCheck} "${attribute}" must contain valid data`, 400);
                    }
                }
            }
        }
        const targetNumberOfAttributes = attributes.length + optionalsCounter;
        if (targetNumberOfAttributes !== providedNumberOfAttributes) {
            throw new ReqError(`Extra data was provided in 
            request ${requestPropertyToCheck}, but it is not allowed`, 400);
        }
    };
};

/**
 * Factory that returns a function to check request headers with given headers and their validators.
 *
 * @param {[[string||function]]} headers An array of arrays in format: first element is string with name of header that
 * must present in request headers and second element is validation function for this header's content.
 * @returns {(function(*): void)|*} request headers validator for given headers
 */
const headersValidatorFactory = (headers) => {
    return function (req) {
        for (const headerArray of headers) {
            const header = headerArray[0];
            const headerValidator = headerArray[1];
            const headerContent = req.get(header);
            if (!headerContent) {
                throw new ReqError(`Request must contain "${header}" header`, 400);
            }
            if (headerValidator && !headerValidator(headerContent)) {
                throw new ReqError(`Header "${header}" contains not valid data`, 400);
            }
        }
    };
};

/**
 * Factory to create attached file validators
 *
 * @param {String[]} acceptableExtensions List of acceptable extensions without dots like ['jpeg', 'jpg']
 * @param {String[]} acceptableMimetypes List of acceptable mimetypes like ['image/jpeg', 'image/jpg']
 * @param {Number} maximumFilesize Maximum allowable size of uploaded file in megabytes
 * @returns {(function(*): void)|*} Returns a function that checks request with given parameters and throws an error if
 * something is wrong with the file
 */
const uploadedFileValidatorFactory = (acceptableExtensions, acceptableMimetypes, maximumFilesize) => {
    return function (req) {
        if (req.file) { // Not validate if no file is attached
            const fileExtension = req.file.originalname.slice(
                ((req.file.originalname.lastIndexOf('.') - 1) >>> 0) + 2
            );
            if (!acceptableExtensions.includes(fileExtension)) {
                fs.rmSync(req.file.path);
                throw new ReqError('The extension of the uploaded file is not acceptable', 400);
            }
            if (!acceptableMimetypes.includes(req.file.mimetype)) {
                fs.rmSync(req.file.path);
                throw new ReqError('The mimetype of the uploaded file is not acceptable', 400);
            }
            if (req.file.size / (1024 * 1024) > maximumFilesize) {
                fs.rmSync(req.file.path);
                throw new ReqError(`Uploaded file is too big, maximum size is ${maximumFilesize} MB`, 400);
            }
        }
    }
}

/**
 * A simple function that validates that a request does not have body
 *
 * @param {Object} req Request that should be validated
 */
const validateThatBodyIsAbsent = (req) => {
    if (Object.keys(req.body).length > 0) {
        throw new ReqError('Request body not allowed on this route and method', 400);
    }
};

module.exports = {
    requestPropertyValidatorFactory,
    headersValidatorFactory,
    uploadedFileValidatorFactory,
    validateThatBodyIsAbsent,
};