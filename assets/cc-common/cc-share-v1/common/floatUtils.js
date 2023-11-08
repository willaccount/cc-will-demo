const Big = require("big");

function _verifyNumbers(...args) {
    args.forEach((num, index) => {
        if (typeof num === "object" || num === void 0 || isNaN(+num)) {
            cc.warn("invalid number: " + index, num);
        }
    });
}

function plus(a, b) {
    _verifyNumbers(a, b);
    return Big(a || 0).plus(b || 0).toNumber();
}
function minus(a, b) {
    _verifyNumbers(a, b);
    return Big(a || 0).minus(b || 0).toNumber();
}
function mul(a, b) {
    _verifyNumbers(a, b);
    return Big(a || 0).times(b || 0).toNumber();
}
function div(a, b) {
    _verifyNumbers(a, b);
    return Big(a || 0).div(b || 1).toNumber();
}
function sum(...numbers) {
    _verifyNumbers(...numbers);
    let result = Big(0);
    numbers.forEach(num => {
        result = result.plus(num);
    })
    return result.toNumber();
}
function product(...numbers) {
    _verifyNumbers(...numbers);
    let result = Big(1);
    numbers.forEach(num => {
        result = result.times(num);
    })
    return result.toNumber();
}
function isEqual(a, b) {
    _verifyNumbers(a, b);
    return Math.abs(a - b) < 1e-12;
}

module.exports = {
    plus, minus, mul, div, sum, product, isEqual
}