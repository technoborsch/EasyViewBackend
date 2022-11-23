const ReqError = require("./ReqError");

const bodyValidatorFactory = (attributes, optionalAttributes) => {
    return function (req) {
        if (!req.hasOwnProperty('body') || !req.body) throw new ReqError('Request must contain body', 400);
        const data = req.body;
        for (const attr of attributes) {
            const attribute = attr[0];
            const validatorFunction = attr[1];
            if (!data.hasOwnProperty(attribute) || !data.attribute) {
                throw new ReqError(`Request body must contain "${attribute}" attribute`, 400);
            }
            if (validatorFunction && !validatorFunction(attribute)) {
                throw new ReqError(`Not valid data has been provided in field "${attribute}"`, 400);
            }
        }
        let optionalsCounter = 0;
        for (const optionalAttrArray of optionalAttributes) {
            const attribute = optionalAttrArray[0];
            const optionalAttributeValidator = optionalAttrArray[1];
            if (data.hasOwnProperty(attribute)) {
                optionalsCounter++;
                if (!data.attribute) {
                    throw new ReqError(`If attached, optional attribute "${attribute}" must be not empty`, 400);
                }
            }
            if (optionalAttributeValidator && !optionalAttributeValidator(attribute)) {
                throw new ReqError(`If attached, optional attribute "${attribute}" must contain valid data`, 400);
            }
        }
        const targetNumberOfAttributes = attributes.length + optionalsCounter;
        const providedNumberOfAttributes = Object.keys(attributes).length;
        if (targetNumberOfAttributes !== providedNumberOfAttributes) {
            throw new ReqError('Extra data was provided in body request, but it is not allowed', 400);
        }
    };
};

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

module.exports = { bodyValidatorFactory, headersValidatorFactory};