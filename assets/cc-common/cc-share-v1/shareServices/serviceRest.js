
// Rest API to connect to server


function encodeQueryData(data) {
    return Object.keys(data).map(function(key) {
        return [key, data[key]].map(encodeURIComponent).join("=");
    }).join("&");
}

const apiObject = {

    getRawDataWeb: ({fullURL = '', callback = () => {}, callbackErr = () => {}}) => {

        const request = new XMLHttpRequest();
        request.open("GET", fullURL, true);
        request.timeout = 15000;
        request.onreadystatechange = function () {
            if (request.readyState == 4) {
                //get status text
                if (callback) {
                    if (request.responseText) {
                        callback(JSON.parse(request.responseText));
                    } else {
                        callbackErr();
                    }
                }
            } else if (request.readyState === 0) {
                callbackErr();
            }
            if (request.status !== 200) {
                callbackErr();
            }
        };
        request.ontimeout = function (e) {
            callbackErr(e);
        };
        request.onerror = (e) => {
            callbackErr(e);
        };
        request.send();
    },

    get: ({url = '', params = {}, callback = () => {}, apiUrl = '', callbackErr = () => {}}) => {

        const loadConfigAsync = require('loadConfigAsync');
        const {API_URL} = loadConfigAsync.getConfig();

        const request = cc.loader.getXMLHttpRequest();
        const querystring = '?' + encodeQueryData(params);
        const fullURL = (apiUrl ? apiUrl : API_URL) + url + querystring;
        request.open("GET", fullURL, true);
        request.timeout = 15000;
        request.setRequestHeader("Content-Type","application/json;charset=UTF-8");
        request.onreadystatechange = function () {
            if (request.readyState == 4) {
                //get status text
                if (callback) {
                    if (request.responseText) {
                        callback(JSON.parse(request.responseText));
                    } else {
                        callbackErr();
                    }
                }
            } else if (request.readyState === 0) {
                callbackErr();
            }
            if (request.status !== 200) {
                callbackErr();
            }
        };
        request.ontimeout = function (e) {
            callbackErr(e);
        };
        request.onerror = (e) => {
            callbackErr(e);
        };
        request.send();
    },
    
    getWithHeader: ({url = '', params = {}, headers = {}, callback = () => {}, apiUrl = '', callbackErr = () => {}}) => {
        const loadConfigAsync = require('loadConfigAsync');
        const {API_URL} = loadConfigAsync.getConfig();

        const request = cc.loader.getXMLHttpRequest();
        const querystring = '?' + encodeQueryData(params);
        const fullURL = (apiUrl ? apiUrl : API_URL) + url + querystring;
        request.open("GET", fullURL, true);
        request.timeout = 15000;
        request.setRequestHeader("Content-Type","application/json;charset=UTF-8");
        
        Object.keys(headers).forEach( (key) => {
            request.setRequestHeader(key, headers[key]);
        });

        request.onreadystatechange = function () {
            if (request.readyState == 4) {
                //get status text
                if (callback) {
                    if (request.responseText) {
                        callback(JSON.parse(request.responseText));
                    } else {
                        callbackErr();
                    }
                }
            } else if (request.readyState === 0) {
                callbackErr();
            }
            if (request.status !== 200) {
                callbackErr();
            }
        };
        request.ontimeout = function () {
            callbackErr();
        };
        request.onerror = () => {
            callbackErr();
        };
        request.send();
    },

    post: ({url = '', data = {}, callback = () => {}, apiUrl = '', callbackErr = () => {}}) => {
        const loadConfigAsync = require('loadConfigAsync');
        const {API_URL} = loadConfigAsync.getConfig();
        const request = cc.loader.getXMLHttpRequest();
        const dataPost = encodeQueryData(data);
        const fullURL = (apiUrl ? apiUrl : API_URL) + url;
        request.open('POST', fullURL, true);
        request.timeout = 15000;
        request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        request.onreadystatechange = function() {
            if(request.readyState == 4) {
                if (request.responseText) {
                    callback({
                        status: request.status,
                        data: JSON.parse(request.responseText)
                    });
                } else {
                    callbackErr();
                }
            } else if (request.readyState === 0) {
                callbackErr();
            }
            if (request.status !== 200) {
                callbackErr();
            }
        };
        request.ontimeout = function (e) {
            callbackErr(e);
        };
        request.onerror = (e) => {
            callbackErr(e);
        };
        request.send(dataPost);
    },

    postWithHeader: ({url = '',params = {}, headers = {}, data = {}, callback = () => {}, apiUrl = '', callbackErr = () => {}}) => {
        const loadConfigAsync = require('loadConfigAsync');
        const {API_URL} = loadConfigAsync.getConfig();
        const request = cc.loader.getXMLHttpRequest();
        const dataPost = JSON.stringify(data);
        const querystring = '?' + encodeQueryData(params);
        const fullURL = (apiUrl ? apiUrl : API_URL) + url + querystring;
        request.open('POST', fullURL, true);
        request.timeout = 15000;
        request.setRequestHeader('Content-type', 'application/json');

        Object.keys(headers).forEach( (key) => {
            request.setRequestHeader(key, headers[key]);
        });

        request.onreadystatechange = function() {
            if(request.readyState == 4) {
                if (request.responseText) {
                    callback({
                        status: request.status,
                        data: JSON.parse(request.responseText)
                    });
                } else {
                    callbackErr();
                }
            } else if (request.readyState === 0) {
                callbackErr();
            }
            if (request.status !== 200) {
                callbackErr();
            }
        };
        request.ontimeout = function (e) {
            callbackErr(e);
        };
        request.onerror = (e) => {
            callbackErr(e);
        };
        request.send(dataPost);
    },

    postRaw: ({url = '', data = {}, callback = () => {}, apiUrl = '', callbackErr = () => {}}) => {
        const loadConfigAsync = require('loadConfigAsync');
        const {API_URL} = loadConfigAsync.getConfig();
        const request = cc.loader.getXMLHttpRequest();
        const dataPost = data;
        const fullURL = (apiUrl ? apiUrl : API_URL) + url;
        request.open('POST', fullURL, true);
        request.timeout = 15000;
        request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        request.onreadystatechange = function() {
            if(request.status == 200) {
                callback({
                    status: request.status,
                    data: request.responseText
                });
            } else {
                callbackErr();
            }
        };
        request.ontimeout = function (e) {
            callbackErr(e);
        };
        request.onerror = (e) => {
            callbackErr(e);
        };
        request.send(dataPost);
    },

    put: ({url = '', data = {}, callback = () => {}, apiUrl = '', callbackErr = () => {}}) => {
        const loadConfigAsync = require('loadConfigAsync');
        const {API_URL} = loadConfigAsync.getConfig();
        const request = cc.loader.getXMLHttpRequest();
        const dataPost = encodeQueryData(data);
        const fullURL = (apiUrl ? apiUrl : API_URL) + url;

        request.open('PUT', fullURL, true);
        request.timeout = 15000;
        request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        request.onreadystatechange = function() {
            if(request.readyState == 4) {
                if (request.responseText) {
                    callback({
                        status: request.status,
                        data: JSON.parse(request.responseText)
                    });
                } else {
                    callbackErr();
                }
            } else if (request.readyState === 0) {
                callbackErr();
            }
            if (request.status !== 200) {
                callbackErr();
            }
        };
        request.ontimeout = function (e) {
            callbackErr(e);
        };
        request.onerror = (e) => {
            callbackErr(e);
        };
        request.send(dataPost);
    }
};

module.exports = apiObject;
