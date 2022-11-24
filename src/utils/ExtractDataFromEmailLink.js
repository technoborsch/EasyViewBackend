const mailhog = require('mailhog')({});
const {parse} = require("node-html-parser");

/**
 * A function that gets data from links in emails that were sent to mailhog server.
 *
 * @param {string} email Email address mail was sent to
 * @returns {Promise<string[]>} An array of strings containing data from link in order of their occurrences.
 */
const extractDataFromEmailLink = async (email) => {
    //First we need to wait for messages to be delivered. Timeout time may cause bugs if delivery time will exceed it.
    await new Promise(resolve => setTimeout(resolve, 1000));
    const message = await mailhog.latestTo(email);
    const htmlDoc = parse(message.html);
    const link = htmlDoc.getElementById('link').getAttribute('href');
    const dataString = link.split('?')[1];
    const splitDataString = dataString.split('&');
    const result = [];
    for (const dataPair of splitDataString) {
        result.push(dataPair.split('=')[1]);
    }
    return result
};

module.exports = extractDataFromEmailLink;