/* eslint-disable no-unused-vars */
const CryptoJS = require('./crypto-core');
const md5 = require('./md5');
const sha1 = require('./sha1');
const sha256 = require('./sha256');
const sha224 = require('./sha224');
const x64 = require("./x64-core");
const sha512 = require('./sha512');

const hash = (cipherMethodKey = '', message = '') => {
    if (!cipherMethodKey) {
        return '';
    }
    const upperCaseCipherMethodKey = cipherMethodKey.trim().toUpperCase();
    if (upperCaseCipherMethodKey.length < 3) {
        return '';
    }
    return CryptoJS[upperCaseCipherMethodKey](message).toString();
};

module.exports = {
    hash
};