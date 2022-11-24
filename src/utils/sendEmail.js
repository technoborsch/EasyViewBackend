const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');

const mailHost = process.env['EMAIL_HOST'];
const mailPort = process.env['EMAIL_PORT'];
const mailFrom = process.env['EMAIL_FROM'];

/***
 * Function used to send emails.
 *
 * @param {string} email Valid email address to whom the message should be sent to
 * @param {string} subject Subject of a message
 * @param {Object} payload Data that will be delivered to template
 * @param {string} template Path string to a template
 * @returns {Promise<*>}
 */
const sendEmail = async (email, subject, payload, template) => {
    try {
        const transporter = nodemailer.createTransport({
            host: mailHost,
            port: mailPort,
        });
        const source = fs.readFileSync(path.join(__dirname, template), 'utf8');
        const compiledTemplate = handlebars.compile(source);
        const options = () => {
            return {
                from: mailFrom,
                to: email,
                subject: subject,
                html: compiledTemplate(payload),
            };
        };
        transporter.sendMail(options(), (err, info) => {
            if (err) { return err;}
        });
    } catch (err) {
        return err;
    }
};

module.exports = sendEmail;