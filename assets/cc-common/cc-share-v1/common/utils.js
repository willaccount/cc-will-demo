/* global jsb */
const lodash = require('lodash');
const floatUtils = require('floatUtils');
const Big = require("big");


const UTIL_CONFIG = {
    CURRENCY_CONFIG: null
}

function updateUtilConfig(key, value) {
    if (UTIL_CONFIG.hasOwnProperty(key)) {
        UTIL_CONFIG[key] = value;
    }
}

function getUtilConfig() {
    return UTIL_CONFIG;
};

function getDecimalCount(number, min = 0, max = 0) {
    const converted = number.toString();
    if (converted.includes('.')) {
        let count = converted.split('.')[1].length;
        count = Math.max(count, min);
        if (max && count > max) {
            count = max;
        }
        return count;
    };
    return min || 0;
};

function formatCoin(amount, decimalCount = 0, decimal = ".", thousands = ",") {
    if (amount < 0) return toFixed(0, decimalCount);

    const splitStr = toFixed(amount, decimalCount).split(".");
    const decimalStr = splitStr[1] || "";
    const integerArr = splitStr[0].split("");
    let index = integerArr.length;
    while ((index -= 3) > 0) {
        integerArr.splice(index, 0, thousands);
    }
    if (decimalStr) {
        integerArr.push(decimal, decimalStr);
    }
    return integerArr.join("");
}

const MD5 = (e) => {
    function h(a, b) {
        var c, d, e, f, g;
        e = a & 2147483648;
        f = b & 2147483648;
        c = a & 1073741824;
        d = b & 1073741824;
        g = (a & 1073741823) + (b & 1073741823);
        return c & d ? g ^ 2147483648 ^ e ^ f : c | d ? g & 1073741824 ? g ^ 3221225472 ^ e ^ f : g ^ 1073741824 ^ e ^ f : g ^ e ^ f;
    }

    function k(a, b, c, d, e, f, g) {
        a = h(a, h(h(b & c | ~b & d, e), g));
        return h(a << f | a >>> 32 - f, b);
    }

    function l(a, b, c, d, e, f, g) {
        a = h(a, h(h(b & d | c & ~d, e), g));
        return h(a << f | a >>> 32 - f, b);
    }

    function m(a, b, d, c, e, f, g) {
        a = h(a, h(h(b ^ d ^ c, e), g));
        return h(a << f | a >>> 32 - f, b);
    }

    function n(a, b, d, c, e, f, g) {
        a = h(a, h(h(d ^ (b | ~c), e), g));
        return h(a << f | a >>> 32 - f, b);
    }

    function p(a) {
        var b = "",
            d = "",
            c;
        for (c = 0; 3 >= c; c++) d = a >>> 8 * c & 255, d = "0" + d.toString(16), b += d.substr(d.length - 2, 2);
        return b;
    }
    var f = [],
        q, r, s, t, a, b, c, d;
    e = function (a) {
        a = a.replace(/\r\n/g, "\n");
        for (var b = "", d = 0; d < a.length; d++) {
            var c = a.charCodeAt(d);
            128 > c ? b += String.fromCharCode(c) : (127 < c && 2048 > c ? b += String.fromCharCode(c >> 6 | 192) : (b += String.fromCharCode(c >> 12 | 224), b += String.fromCharCode(c >> 6 & 63 | 128)), b += String.fromCharCode(c & 63 | 128));
        }
        return b;
    }(e);
    f = function (b) {
        var a, c = b.length;
        a = c + 8;
        for (var d = 16 * ((a - a % 64) / 64 + 1), e = Array(d - 1), f = 0, g = 0; g < c;) a = (g - g % 4) / 4, f = g % 4 * 8, e[a] |= b.charCodeAt(g) << f, g++;
        a = (g - g % 4) / 4;
        e[a] |= 128 << g % 4 * 8;
        e[d - 2] = c << 3;
        e[d - 1] = c >>> 29;
        return e;
    }(e);
    a = 1732584193;
    b = 4023233417;
    c = 2562383102;
    d = 271733878;
    for (e = 0; e < f.length; e += 16) q = a, r = b, s = c, t = d, a = k(a, b, c, d, f[e + 0], 7, 3614090360), d = k(d, a, b, c, f[e + 1], 12, 3905402710), c = k(c, d, a, b, f[e + 2], 17, 606105819), b = k(b, c, d, a, f[e + 3], 22, 3250441966), a = k(a, b, c, d, f[e + 4], 7, 4118548399), d = k(d, a, b, c, f[e + 5], 12, 1200080426), c = k(c, d, a, b, f[e + 6], 17, 2821735955), b = k(b, c, d, a, f[e + 7], 22, 4249261313), a = k(a, b, c, d, f[e + 8], 7, 1770035416), d = k(d, a, b, c, f[e + 9], 12, 2336552879), c = k(c, d, a, b, f[e + 10], 17, 4294925233), b = k(b, c, d, a, f[e + 11], 22, 2304563134), a = k(a, b, c, d, f[e + 12], 7, 1804603682), d = k(d, a, b, c, f[e + 13], 12, 4254626195), c = k(c, d, a, b, f[e + 14], 17, 2792965006), b = k(b, c, d, a, f[e + 15], 22, 1236535329), a = l(a, b, c, d, f[e + 1], 5, 4129170786), d = l(d, a, b, c, f[e + 6], 9, 3225465664), c = l(c, d, a, b, f[e + 11], 14, 643717713), b = l(b, c, d, a, f[e + 0], 20, 3921069994), a = l(a, b, c, d, f[e + 5], 5, 3593408605), d = l(d, a, b, c, f[e + 10], 9, 38016083), c = l(c, d, a, b, f[e + 15], 14, 3634488961), b = l(b, c, d, a, f[e + 4], 20, 3889429448), a = l(a, b, c, d, f[e + 9], 5, 568446438), d = l(d, a, b, c, f[e + 14], 9, 3275163606), c = l(c, d, a, b, f[e + 3], 14, 4107603335), b = l(b, c, d, a, f[e + 8], 20, 1163531501), a = l(a, b, c, d, f[e + 13], 5, 2850285829), d = l(d, a, b, c, f[e + 2], 9, 4243563512), c = l(c, d, a, b, f[e + 7], 14, 1735328473), b = l(b, c, d, a, f[e + 12], 20, 2368359562), a = m(a, b, c, d, f[e + 5], 4, 4294588738), d = m(d, a, b, c, f[e + 8], 11, 2272392833), c = m(c, d, a, b, f[e + 11], 16, 1839030562), b = m(b, c, d, a, f[e + 14], 23, 4259657740), a = m(a, b, c, d, f[e + 1], 4, 2763975236), d = m(d, a, b, c, f[e + 4], 11, 1272893353), c = m(c, d, a, b, f[e + 7], 16, 4139469664), b = m(b, c, d, a, f[e + 10], 23, 3200236656), a = m(a, b, c, d, f[e + 13], 4, 681279174), d = m(d, a, b, c, f[e + 0], 11, 3936430074), c = m(c, d, a, b, f[e + 3], 16, 3572445317), b = m(b, c, d, a, f[e + 6], 23, 76029189), a = m(a, b, c, d, f[e + 9], 4, 3654602809), d = m(d, a, b, c, f[e + 12], 11, 3873151461), c = m(c, d, a, b, f[e + 15], 16, 530742520), b = m(b, c, d, a, f[e + 2], 23, 3299628645), a = n(a, b, c, d, f[e + 0], 6, 4096336452), d = n(d, a, b, c, f[e + 7], 10, 1126891415), c = n(c, d, a, b, f[e + 14], 15, 2878612391), b = n(b, c, d, a, f[e + 5], 21, 4237533241), a = n(a, b, c, d, f[e + 12], 6, 1700485571), d = n(d, a, b, c, f[e + 3], 10, 2399980690), c = n(c, d, a, b, f[e + 10], 15, 4293915773), b = n(b, c, d, a, f[e + 1], 21, 2240044497), a = n(a, b, c, d, f[e + 8], 6, 1873313359), d = n(d, a, b, c, f[e + 15], 10, 4264355552), c = n(c, d, a, b, f[e + 6], 15, 2734768916), b = n(b, c, d, a, f[e + 13], 21, 1309151649), a = n(a, b, c, d, f[e + 4], 6, 4149444226), d = n(d, a, b, c, f[e + 11], 10, 3174756917), c = n(c, d, a, b, f[e + 2], 15, 718787259), b = n(b, c, d, a, f[e + 9], 21, 3951481745), a = h(a, q), b = h(b, r), c = h(c, s), d = h(d, t);
    return (p(a) + p(b) + p(c) + p(d)).toLowerCase();
};


const getFBAvatar = (url, spriteA, defaultAvatar, AvatarAtlas) => {
    let dirpath = jsb.fileUtils.getWritablePath() + 'avaImg/';
    let filepath = dirpath + MD5(url) + '.png';

    function loadEnd() {
        cc.loader.load(filepath, function (err, tex) {
            if (err) {
                cc.warn(err);
                spriteA.spriteFrame = defaultAvatar;
            } else {
                let spriteFrame = new cc.SpriteFrame(tex);
                if (spriteFrame) {
                    spriteA.spriteFrame = spriteFrame;
                }
            }
        });

    }

    if (cc.sys.os === cc.sys.OS_ANDROID && cc.sys.isNative) {
        if (jsb.fileUtils.isFileExist(filepath)) {
            //remove old file
            jsb.fileUtils.removeFile(filepath);
        }
    }

    let saveFile = function (data) {
        if (typeof data !== 'undefined') {
            if (!jsb.fileUtils.isDirectoryExist(dirpath)) {
                jsb.fileUtils.createDirectory(dirpath);
            }

            if (jsb.fileUtils.writeDataToFile(new Uint8Array(data), filepath)) {
                cc.warn('Remote write file succeed.');
                loadEnd();
            } else {
                spriteA.spriteFrame = defaultAvatar;
                cc.warn('Remote write file failed.');
            }
        } else {
            spriteA.spriteFrame = defaultAvatar;
            cc.warn('Remote download file failed.');
        }
    };

    if (cc.sys.os === cc.sys.OS_IOS && cc.sys.isNative) {
        if (url.indexOf("facebook") !== -1) {
            if (jsb.fileUtils.isFileExist(filepath)) {
                loadEnd();
            }
            let xhr = new XMLHttpRequest();
            xhr.responseType = 'arraybuffer';

            xhr.onreadystatechange = function () {
                cc.log("xhr.readyState  " + xhr.readyState);
                cc.log("xhr.status  " + xhr.status);
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        saveFile(xhr.response);
                    }
                }
            }.bind(this);
            xhr.open("GET", url, true);
            xhr.send();
        }
        else {
            let spFrame = defaultAvatar;
            if (url) {
                let filename = url.substring(url.lastIndexOf('/') + 1);
                if (filename.match(/avatar_[0-9][0-9].png/)) {
                    let num = filename.substring(7, 8);
                    let spInt = parseInt(num);
                    if (spInt >= 0 && spInt <= 32) {
                        spFrame = filename.split('.')[0];
                    }
                    else {
                        spFrame = defaultAvatar;
                    }
                }
                else {
                    spFrame = defaultAvatar;
                }
            }
            spriteA.spriteFrame = AvatarAtlas.getSpriteFrame(spFrame);
        }
    }
    else {
        let xhr = new XMLHttpRequest();
        xhr.responseType = 'arraybuffer';

        xhr.onreadystatechange = function () {
            cc.log("xhr.readyState  " + xhr.readyState);
            cc.log("xhr.status  " + xhr.status);
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    saveFile(xhr.response);
                } else {
                    saveFile(null);
                }
            }
        }.bind(this);
        xhr.open("GET", url, true);
        xhr.send();
    }
};

const loadAvatarFacebook = (avatarSprite, ava, atlas, prefix = 'avatar_', leadingZeroLength = 0, avatarDefault = 'avatar_01') => {
    if (!avatarSprite || !avatarSprite.node) return;
    const defaultAvatar = atlas.getSpriteFrame(avatarDefault);
    if (!defaultAvatar) return;

    let _sframe = decodeURIComponent(ava);

    if ((ava + '').indexOf('avatar_') > -1) {
        _sframe = ava || avatarDefault;
    } else {
        if (!isNaN(ava)) {
            ava = Number.parseInt(ava);
        }

        if (lodash.isNumber(ava)) {
            // avatar start from 1
            ava += 1;
            if (leadingZeroLength > 0) {
                const zeroPad = (num, places) => String(num).padStart(places, '0');
                ava = zeroPad(ava, leadingZeroLength);
            }
            _sframe = prefix + ava;
        }
    }
    
    if (_sframe.indexOf('avatar_') > -1 && _sframe.indexOf("facebook") === -1 && _sframe.indexOf("http") > -1) {
        let avaId = _sframe.split('avatar_');
        let frame = defaultAvatar;
        if (avaId[1]) {
            frame = atlas.getSpriteFrame('avatar_' + avaId[1].replace('.png', ''));
        }
        frame = frame ? frame : defaultAvatar;
        avatarSprite.spriteFrame = frame;
        return false;
    }
    else 
    if (_sframe.indexOf("http") === -1) {
        let frame = atlas.getSpriteFrame(_sframe);
        frame = frame ? frame : defaultAvatar;
        avatarSprite.spriteFrame = frame;
        return false;
    }
    // else if(cc.sys.isNative){
    //     getFBAvatar(_sframe, avatarSprite, defaultAvatar, atlas);
    // } 
    else {
        
        if (_sframe.indexOf("facebook") !== -1) {
            _sframe = _sframe.replace("http://", "https://");
        }
        cc.loader.load({url: decodeURIComponent(ava), type: 'png'}, (err, imageRes) => {
            if (!avatarSprite || !avatarSprite.node) return;
            if (err) {
                avatarSprite.spriteFrame = defaultAvatar;
            } else if (imageRes instanceof cc.Texture2D) {
                let spriteFrame = new cc.SpriteFrame;
                spriteFrame.setTexture(imageRes);
                if (avatarSprite && avatarSprite.node && avatarSprite.node.getComponent) {
                    let com = avatarSprite.node.getComponent(cc.Sprite);
                    if(!com || cc.isValid(com,true)==false) {
                        com = avatarSprite.node.addComponent(cc.Sprite);
                    }
                    com.spriteFrame = new cc.SpriteFrame(spriteFrame.getTexture());
                }

            } else {
                avatarSprite.spriteFrame = defaultAvatar;
            }
        });
        return true;
    }
};

const findKeyByValue = (object,value) => {
    return Object.keys(object).find(key => object[key] == value);
};

const convertObjectToArrayKey = (object) => {
    let newArray = [];
    for(let key in object){
        newArray.push({key:key, value:object[key]});
    }
    newArray = newArray.sort(function(a,b) { return a.value - b.value; });
    newArray.forEach( (item,index) =>{
        newArray[index] = item.key;
    });
    return newArray;
};


const convertObjectToArray = (object) => {
    let newArray = [];
    for(let key in object){
        newArray.push({key:key, value:object[key]});
    }
    newArray = newArray.sort(function(a,b) { return a.value - b.value; });
    newArray.forEach( (item,index) =>{
        newArray[index] = item.value;
    });
    return newArray;
};

const convertElementArrayToString = arr => {
    const newArr = [];
    if (!lodash.isEmpty(arr)) {
        for (let i = 0; i < arr.length; i++) {
            const number = parseFloat(arr[i]);
            newArr.push(number + '');
        }
    }
    return newArr;
};

const convertTo2DArray = ({ arr, isReserve, ROW_NUMBER, REEL_NUMBER }) => {
    let finalArr = [];
    for (let i = 0; i < ROW_NUMBER; i++) {
        finalArr.push([]);
    }
    if (!lodash.isEmpty(arr)) {
        for (let i = 0; i < arr.length; i++) {
            const currentRow = Math.floor(i / REEL_NUMBER);
            finalArr[currentRow].push(arr[i]);
        }
    }
    if (isReserve) finalArr = finalArr.reverse();

    return finalArr;
};
const convertPayLine = (payLines = []) => {
    const listNewPL = [];
    for (let i = 0; i < payLines.length; i++) {
        const dataSplit = payLines[i].split(';');
        if (dataSplit.length >= 3) {
            listNewPL.push({
                payLineID: dataSplit[0],
                payLineWinNumbers: parseInt(dataSplit[1]),
                payLineWinAmount: dataSplit[2],
                payLineSymbol: dataSplit[3]
            });
        }
    }
    return listNewPL;
};


const convertPayLineAllways = (payLines = [], multiplier = 1, betDenom) => 
{
    const listNewPL = [];
    for (let i = 0; i < payLines.length; i++) 
    {
        if (payLines[i].includes(';'))
        {
            const dataSplit = payLines[i].split(';');
            if (dataSplit.length !== 0) {
                listNewPL.push({
                    symbolId: dataSplit[0],
                    totalWinAmount: dataSplit[1],
                    symbolCount: dataSplit[2],
                    combination: dataSplit[3],
                    payableSymbol: dataSplit[4],
                    betDenom,
                    multiplier,
                });
            }
            else {
                cc.log("payLines is not right AKTV formatted");
            }
        }
    }
    return listNewPL;
};


const convertAssetArrayToObject = (arr) => {
    let ret = {};
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] && arr[i]._name) {
            ret[arr[i]._name] = arr[i];
        }
    }
    return ret;
};
const convertSlotMatrixTBLR = (arr = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14], format = [3,4,5,3]) => {
    const finalArr = [];
    let copyArr = arr.slice();
    const colNum = format.length;
    for (let col = 0; col < colNum; col++) {
        finalArr[col] = [];
        const rowNum = format[col];
        for (let row = 0; row < rowNum; row++) {
            finalArr[col][row] = copyArr.shift();
        }
    }
    return finalArr;
};
const convertSlotMatrixLRTB = (arr = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14], format = [3,3,3,3,3]) => {
    const finalArr = [];
    const colNum = format.length;
    for (let col = 0; col < colNum; col++) {
        finalArr[col] = [];
        const rowNum = format[col];
        for (let row = 0; row < rowNum; row++) {
            finalArr[col][row] = arr[row*colNum+col];
        }
    }
    return finalArr;
};

const convertSlotMatrixBatch1ToBase = (arr = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15], format = [3,3,3,3,3]) => {
    const finalArr = [];
    const colNum = format.length;
    for (let col = 0; col < colNum; col++) {
        finalArr[col] = [];
        const rowNum = format[col];
        for (let row = 0; row < rowNum; row++) {
            finalArr[col][row] = arr[col + colNum*row];
        }
    }
    return finalArr;
};

const setDeviceOrientation = function(isPortrait = false) {
    if (!cc.sys.isNative || !jsb) return;
    if (isPortrait) {
        if (cc.sys.os == cc.sys.OS_ANDROID) {
            cc.log("==== Android setDeviceOrientation Portrait ====");
            let className = "org/cocos2dx/javascript/AppActivity";
            let methodName = "setNativeOrientation";
            let methodSignature = "(I)V";
            jsb.reflection.callStaticMethod(className, methodName, methodSignature, 1);
        }
        else if (cc.sys.os == cc.sys.OS_IOS) {
            jsb.reflection.callStaticMethod('RootViewController', 'setGamePortrait');
        }
        cc.view.setOrientation(cc.macro.ORIENTATION_PORTRAIT);
    }
    else {
        if (cc.sys.os == cc.sys.OS_ANDROID) {
            cc.log("==== Android setDeviceOrientation Landscape ====");
            let className = "org/cocos2dx/javascript/AppActivity";
            let methodName = "setNativeOrientation";
            let methodSignature = "(I)V";
            jsb.reflection.callStaticMethod(className, methodName, methodSignature, 0);
        }
        else if (cc.sys.os == cc.sys.OS_IOS) {
            jsb.reflection.callStaticMethod('RootViewController', 'setGameLandScape');
        }
        cc.view.setOrientation(cc.macro.ORIENTATION_LANDSCAPE);
    }
};

function changeParent(child, newParent) {
    if (newParent === child.parent) return;
    const worldPos = child.convertToWorldSpaceAR(cc.v2(0, 0));
    const newPos = newParent.convertToNodeSpaceAR(worldPos);
    const angle = getWorldAngle(child) - getWorldAngle(newParent);
    child.parent = newParent;
    child.setPosition(newPos);
    child.angle = angle;
}

function getWorldAngle(node) { // degree
    let currNode = node;
    let angle = currNode.angle;
    while (currNode.parent != null) {
        currNode = currNode.parent;
        angle += currNode.angle;
    }
    return angle % 360;
}

const getPostionInOtherNode = (spaceNode, targetNode) => {
    if (targetNode.parent == null) {
        return null;
    }
    let pos = targetNode.parent.convertToWorldSpaceAR(targetNode.getPosition());
    return spaceNode.convertToNodeSpaceAR(pos);
};

const mapObjectKey = (obj, keysMap) => {
    return lodash.transform(obj, function(result, value, key) {
        var currentKey = key;
        if (keysMap[key]) { 
            currentKey = keysMap[key].name;
            if (keysMap[key].type == Boolean)
                value = (value == 'T');
            if (keysMap[key].keepKey && !lodash.isObject(value)) {
                result[key] = value;
            }
        }
        if (lodash.isObject(value)) {
            result[currentKey] = mapObjectKey(value, keysMap);
        }
        else {
            result[currentKey] = value;
        }
    });
};

function TimeSequence(node, list, speed) {
    this.node = node;
    this.list = list || [];
    this.speed = speed || 1;
    this.isRun = false;
    this.currentSeq = null;
    this.run = function() {
        if (this.list.length == 0 || this.isRun) return;

        const action = this.list.shift();
        this.isRun = true;
        this.currentSeq = cc.speed(
            cc.sequence(
                action,
                cc.callFunc(() => {
                    this.isRun = false;
                    this.run();
                })
            )
            ,this.speed);
        this.node.runAction(this.currentSeq);
    };
    this.cancel = function() {
        this.list = [];
        if(this.currentSeq!=null && this.currentSeq.target !=null){
            this.node.stopAction(this.currentSeq);
        }
    };
    this.updateSpeed = function(speed) {
        this.speed = speed;
    };
}

function convertNumberToDecimal(total, n) {
    if (!n) return total;

    let ran = 1;
    for (let i = 0; i < n; i++){
        ran *= 10;
    }

    return  Math.floor(Math.round((total * ran*10))/10)/ran;
}

function convertNumberToK(value, n = 3){
    const b = 1000000000;
    const m = 1000000;
    const k = 1000;

    if (value >= b) {
        return convertNumberToDecimal(value / b,n) + "B";
    }

    if (value >= m) {
        return convertNumberToDecimal(value / m,n) + "M";
    }

    if (value >= k) {
        return convertNumberToDecimal(value / k,n) + "K";
    }

    return convertNumberToDecimal(value,n);
}

function randRange(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function toFixed(num, fixed = 0) {
    Big.RM = 0;
    if (isNaN(+num) || typeof num === "object") num = 0;
    return Big(num).toFixed(fixed);
}

function toLocalTime(ts,format){
    return customDateFormat(new Date(ts * 1000), format);
}

function secondsToHHMMSS(secs){
    if(secs == 0) return "00:00";
    let sec_num = parseInt(secs, 10);
    let hours   = Math.floor(sec_num / 3600);
    let minutes = Math.floor(sec_num / 60) % 60;
    let seconds = sec_num % 60;

    return [hours,minutes,seconds]
        .map(v => v < 10 ? "0" + v : v)
        .filter((v,i) => v !== "00" || i > 0)
        .join(":");
}

function customDateFormat(date, formatString) {
    var YYYY,YY,MMMM,MMM,MM,M,DDDD,DDD,DD,D,hhhh,hhh,hh,h,mm,m,ss,s,ampm,AMPM,dMod,th;
    YY = ((YYYY=date.getFullYear())+"").slice(-2);
    MM = (M=date.getMonth()+1)<10?('0'+M):M;
    MMM = (MMMM=["January","February","March","April","May","June","July","August","September","October","November","December"][M-1]).substring(0,3);
    DD = (D=date.getDate())<10?('0'+D):D;
    DDD = (DDDD=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][date.getDay()]).substring(0,3);
    th=(D>=10&&D<=20)?'th':((dMod=D%10)==1)?'st':(dMod==2)?'nd':(dMod==3)?'rd':'th';
    formatString = formatString.replace("#YYYY#",YYYY).replace("#YY#",YY).replace("#MMMM#",MMMM).replace("#MMM#",MMM).replace("#MM#",MM).replace("#M#",M).replace("#DDDD#",DDDD).replace("#DDD#",DDD).replace("#DD#",DD).replace("#D#",D).replace("#th#",th);
    h=(hhh=date.getHours());
    if (h==0) h=24;
    if (h>12) h-=12;
    hh = h<10?('0'+h):h;
    hhhh = hhh<10?('0'+hhh):hhh;
    AMPM=(ampm=hhh<12?'am':'pm').toUpperCase();
    mm=(m=date.getMinutes())<10?('0'+m):m;
    ss=(s=date.getSeconds())<10?('0'+s):s;
    return formatString.replace("#hhhh#",hhhh).replace("#hhh#",hhh).replace("#hh#",hh).replace("#h#",h).replace("#mm#",mm).replace("#m#",m).replace("#ss#",ss).replace("#s#",s).replace("#ampm#",ampm).replace("#AMPM#",AMPM);
}

function toLocalTimeHHMM(ts) {
    let timestamp = new Date(parseInt(ts));
    let hour = timestamp.getHours();
    let minutes = timestamp.getMinutes();
    let localTime = (hour < 10 ? "0" : "") + hour + "h" + (minutes < 10 ? "0" : "") + minutes;
    return localTime;
}

function toLocalClockTime(ts) {
    let timestamp = new Date(parseInt(ts));
    let hour = timestamp.getHours();
    let minutes = timestamp.getMinutes();
    let localTime = hour + "h" + (minutes < 10 ? "0" : "") + minutes;
    return localTime;
}

function formatUserName(userName){
    return userName.trim();
}

function getAnimationsName(spine){
    return Object.keys(spine.skeletonData._skeletonJson.animations);
}

function pickOutRandomElements(array, pickNumber = 1) {
    if (!array || array.length <= 0) throw new Error("invalid array");
    const pickElements = [];
    for(let i = 0; i< pickNumber; i++){
        let randomIndex = Math.floor(Math.random() * array.length);
        pickElements.push(array.splice(randomIndex, 1)[0]);
    }
    return pickElements;
}

/**
 * ! just using for the spine have a few animations
 */
function setMixAllAnims(spine, mixTime = 0.15){
    const animNames = getAnimationsName(spine);
    if(animNames.length < 2){
        cc.error("spine have to have many animations");
        return;
    }
    for(let i = 0; i < animNames.length; i++){
        for(let j = 0; j < animNames.length; j++){
            spine.setMix(animNames[i], animNames[j], mixTime);
        }
    }
}

function copyTextToClipboard(text) {
    if (cc.sys.isBrowser) {
        const el = document.createElement('textarea');  // Create a <textarea> element
        el.value = text;                                 // Set its value to the string that you want copied
        el.setAttribute('readonly', '');                // Make it readonly to be tamper-proof
        el.style.position = 'absolute';                 
        el.style.left = '-9999px';                      // Move outside the screen to make it invisible
        document.body.appendChild(el);                  // Append the <textarea> element to the HTML document
        const selected =            // eslint-disable-line
            document.getSelection().rangeCount > 0        // Check if there is any content selected previously
                ? document.getSelection().getRangeAt(0)     // Store selection if found
                : false;                                    // Mark as false to know no selection existed before
        el.select();                                    // Select the <textarea> content
        el.setSelectionRange(0, text.length);
        document.execCommand('copy');                   // Copy - only works as a result of a user action (e.g. click events)
        document.body.removeChild(el);
    } else if (cc.sys.isNative) {
        if (jsb != undefined) {
            jsb.copyTextToClipboard(text);
        }
    }
}

function registerLoadHowl (){
    if (window.Howl) {
        cc.loader.downloader.extMap['mp3cached'] = cc.loader.downloader.extMap.mp3;
        cc.loader.downloader.extMap.mp3 =(file, callback)=>{
            let howl = new window.Howl({
                src: [file.url],
                preload: true
            });

            howl.once('load', ()=>{
                callback(null, howl);
            });
        };
    }
}

function unregisterLoadHowl() {
    let cacheLoader = cc.loader.downloader.extMap['mp3cached'];
    if (cacheLoader) {
        cc.loader.downloader.extMap.mp3 = cacheLoader;
    }
}

function formatMoneyByCurrency(amount, decimalCount = 0, decimal = ".", thousands = ",") {
	let prefix = UTIL_CONFIG.CURRENCY_CONFIG.CURRENCY_PREFIX || "";
	decimalCount = decimalCount || UTIL_CONFIG.CURRENCY_CONFIG.DECIMAL_COUNT;
	return prefix + formatCoin(amount, decimalCount, decimal, thousands);
}

function formatWalletMoneyByCurrency(num, digits) {
    let prefix = UTIL_CONFIG.CURRENCY_CONFIG.CURRENCY_PREFIX || "";
    digits = digits || UTIL_CONFIG.CURRENCY_CONFIG.DECIMAL_COUNT || 2;
    let trimZero = UTIL_CONFIG.CURRENCY_CONFIG.TRIM_ZERO;
    return prefix + formatWallet(num, digits, trimZero);
}

function formatWallet(num, digits, trimZero = true) {
    if (isNaN(parseFloat(num))) num = 0; 
    const si = [
        { value: 1, symbol: "" },
        { value: 1E3, symbol: "K" },
        { value: 1E6, symbol: "M" },
        { value: 1E9, symbol: "B" },
        { value: 1E12, symbol: "T" },
        { value: 1E15, symbol: "P" },
        { value: 1E18, symbol: "E" }
    ];
    const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    let i;
    for (i = si.length - 1; i > 0; i--) {
        if (num >= si[i].value) break;
    }
    let wallet = toFixed((num / si[i].value), digits);
    if (trimZero) wallet = wallet.replace(rx, "$1");
    return wallet + si[i].symbol;
}

module.exports = {
    copyTextToClipboard,
    loadAvatarFacebook,
    getFBAvatar,
    convertElementArrayToString,
    convertTo2DArray,
    convertPayLine,
    convertSlotMatrixTBLR,
    convertSlotMatrixLRTB,
    convertAssetArrayToObject,
    changeParent,
    findKeyByValue,
    convertObjectToArrayKey,
    getPostionInOtherNode,
    TimeSequence,
    setDeviceOrientation,
    convertSlotMatrixBatch1ToBase,
    convertPayLineAllways,
    convertObjectToArray,
    toLocalTimeHHMM,
    toLocalClockTime,
    toLocalTime,
    secondsToHHMMSS,
    customDateFormat,
    mapObjectKey,
    formatWalletMoney: function (num, digits = 2) {
        if (UTIL_CONFIG.CURRENCY_CONFIG) {
            return formatWalletMoneyByCurrency(num, digits);
        }
        return formatWallet(num, digits);
    },
    formatMoney: function (amount, decimalCount = 0, decimal = ".", thousands = ",") {
        if (UTIL_CONFIG.CURRENCY_CONFIG) {
            return formatMoneyByCurrency(amount, decimalCount, decimal, thousands);
        }
        return formatCoin(amount, decimalCount, decimal, thousands);
    },
    generateId: function () {
        return this.uuid();
    },
    uuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
            .replace(/[xy]/g, function (c) {
                var r = (Math.random() * 16) | 0,
                    v = c === 'x' ? r : (r & 0x3) | 0x8;
                return v.toString(16);
            })
            .replace(/-/gi, '');
    },
    getRandomInt: function (min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    getText: function(text = '', length = 0) {
        let result = text;
        const n = length - text.length;
        if (n) {
            for (var i = 0; i < n; i++) {
                result += ' ';
            }
        }
        return result;
    },
    getTime: function() {
        function addZero(i) {
            if (i < 10) {
                i = '0' + i;
            }
            return i;
        }

        const d = new Date();
        const h = addZero(d.getHours());
        const m = addZero(d.getMinutes());
        const s = addZero(d.getSeconds());
        const t = h + ':' + m + ':' + s;
        return t;
    },
    getLeftTime: function(endTime, serverTime, millisecond = 1000) {
        serverTime = serverTime ? new Date(serverTime).getTime() : new Date().getTime();
        let time = Math.floor((new Date(endTime).getTime() - serverTime) / millisecond);
        if (time < 0) time = 0;
        return time;
    },
    getRandomElement: function(array) {
        if (!array || array.length <= 0) throw new Error("invalid array");
        return array[Math.floor(Math.random() * array.length)];
    },
    getClip: function (animation, clipName) {
        return animation.getClips().find(clip => clip.name === clipName);
    },
    getClipDuration: function (animation, clipName) {
        const clip = animation.getClips().find(clip => clip.name === clipName);
        if(!clip) return null;
        return clip.duration;
    },
    addDecimals: function (number1, number2) {
        return floatUtils.plus(number1, number2);
    },
    subtractDecimals: function (number1, number2) {
        return floatUtils.minus(number1, number2);
    },
    multiplyDecimals: function (number1, number2) {
        return floatUtils.mul(number1, number2);
    },
    divideDecimals: function (number1, number2) {
        return floatUtils.div(number1, number2);
    },
    convertNumberToDecimal,
    convertNumberToK,
    randRange,
    formatUserName,
    setMixAllAnims,
    getWorldAngle,
    pickOutRandomElements,
    registerLoadHowl,
    unregisterLoadHowl,
    updateUtilConfig,
    getUtilConfig,
    getDecimalCount,
    toFixed,
    formatCoin,
    floatUtils
};
