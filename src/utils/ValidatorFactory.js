const ReqError = require("./ReqError");

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
            throw new ReqError('Request must contain body', 400);
        }
        const data = req[requestPropertyToCheck];
        const providedNumberOfAttributes = Object.keys(data).length;
        if (providedNumberOfAttributes === 0) throw new ReqError(`No attributes have been provided in request ${requestPropertyToCheck}`, 400)
        if (attributes) {
            for (const attr of attributes) {
                const attribute = attr[0];
                const validatorFunction = attr[1];
                if (!data.hasOwnProperty(attribute) || !data[attribute]) {
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
                if (data.hasOwnProperty(attribute)) {
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
    validateThatBodyIsAbsent,
};