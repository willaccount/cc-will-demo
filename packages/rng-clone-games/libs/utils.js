const fs = require("fs-extra");
const pathUtil = require("path");
const assetUtils = Editor.require("packages://assets/panel/utils/utils");
const electron = require('electron');

const Utils = {

    loadText(path) {
        if(!fs.existsSync(path))
            return "";
        let file = fs.readFileSync(path, 'utf8');
        return file;
    },

    saveText(path, text) {
        fs.writeFileSync(path, text, 'utf8');
    },

    createHtmlID(arr) {
        let obj = {};
        for(let i=0; i<arr.length; i++)
        {
            obj[arr[i]] = "#" + arr[i];
        }
        return obj;
    },

    makeDirExist(dir)
    {
        if (fs.existsSync(dir))
        {
            return true;
        }
        try {
            //fs.mkdirSync(dir, { recursive: true });
            fs.ensureDirSync(dir);
            return true;
        }
        catch (e)
        {
            return false;
        }
    },

    copyFilesTo(src, dest, excludeExt = [])
    {
        if (!fs.existsSync(src))
            return;

        Utils.makeDirExist(dest);
        var listFiles = fs.readdirSync(src);
        var file, file1, file2;
        for(let i=0; i<listFiles.length; i++)
        {
            const ext = pathUtil.extname(listFiles[i]);
            file1 = pathUtil.join(src, listFiles[i]);
            file2 = pathUtil.join(dest, listFiles[i]);

            if(fs.existsSync(file2))
            {
                console.log("skip " + file2);
                continue;
            }

            const status = fs.statSync(file1);
            if(status.isFile() && excludeExt.indexOf(ext) < 0)
            {
                file = fs.readFileSync(file1);
                fs.writeFileSync(file2, file);
            }
        }
    },

    copyFileTo(src, dest)
    {
        if (!fs.existsSync(src) || fs.existsSync(dest))
            return;
        Utils.makeDirExist(pathUtil.dirname(dest));
        let file = fs.readFileSync(src);
        fs.writeFileSync(dest, file);
    },

    createFile(dest, data = [], overWrite = true)
    {
        if (!overWrite && fs.existsSync(dest))
            return;
        Utils.makeDirExist(pathUtil.dirname(dest));
        fs.writeFileSync(dest, data);
    },

    isUUID(txt) {
        return Editor.Utils.UuidUtils.isUuid(txt);
    },

    isCompressUUID(txt) {
        let isCompress = Editor.Utils.UuidUtils.isUuid(txt);
        if(isCompress)
        {
            isCompress = Editor.Utils.UuidUtils.decompressUuid(txt) !== txt;
            return isCompress;
        }
        return false;
    },

    compressUUID(txt) {
        return Editor.Utils.UuidUtils.compressUuid(txt);
    },

    decompressUUID(txt)
    {
        return Editor.Utils.UuidUtils.decompressUuid(txt);
    },

    queryAssets(pattern, type) {
        // Example:
        //- pattern: "db://**/*.pac"
        //- type:
        //   + ["scene", "sprite-frame"]
        //   + "texture"
        return new Promise((resolve, reject) => {
            Editor.assetdb.queryAssets(pattern, type, (err, results) => {
                resolve({err, results});
            });
        });
    },

    queryAssetsInfoByUUID(uuid) {
        return new Promise((resolve, reject) => {
            Editor.assetdb.queryInfoByUuid(Editor.Utils.UuidUtils.decompressUuid(uuid), function (err, result) {
                resolve({err, result});
            });
        });
    },

    queryUuidByUrl(url) {
        return new Promise((resolve, reject) => {
            Editor.assetdb.queryUuidByUrl(url, function (err, result) {
                resolve({err, result});
            });
        });
    },

    getNumber(str) {
        return str.replace(/[^0-9]/g, "");
    },

    async copyAsset(sourcePath, destPath) {
        //Example
        //- sourcePath: "/Volumes/Data/test.js
        //- destPath: "/Volumes/Data2/test.js
        await assetUtils.copy(sourcePath, destPath);
    },

    createAsset(assetPath, data) {
        //Editor.log("createAsset: " + assetPath);
        return new Promise((resolve, reject) => {
            Editor.assetdb.create(assetPath, data, function (err, results) {
                resolve({err, results});
            });
        });
    },

    escapeRegex(txt) {
        return txt.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    },

    refreshAssets(path = "db://assets/") {
        return new Promise((resolve, reject) => {
            Editor.assetdb.refresh(path, function (err, results) {
                resolve({err, results});
            });
        });
    },

    urlToUUID(url)
    {
        return Editor.assetdb.remote.urlToUuid(url);
    },

    subAssetsByUUID(uuid)
    {
        return Editor.assetdb.remote.subAssetInfosByUuid(uuid);
    },

    assetInfoByUUID(uuid)
    {
        return Editor.assetdb.remote.assetInfoByUuid(uuid);
    },

    assetInfoByPath(path)
    {
        return Editor.assetdb.remote.assetInfoByPath(path);
    },

    deleteAsset(asset)
    {
        fs.unlinkSync(asset.path);
        fs.unlinkSync(asset.path + ".meta");
    },

    deleteAssets(urls)
    {
        return new Promise((resolve, reject) => {
            Editor.assetdb.delete( urls, function ( err, results ) {
                resolve({err, results});
            });
        });
    },

    relaunch()
    {
        electron.remote.app.relaunch();
        electron.remote.app.quit();
    },

    replaceAll(content, txtSearch, txtReplace)
    {
        let re = new RegExp(Utils.escapeRegex(txtSearch), 'g');
        content = content.replace(re, txtReplace);
        return content;
    },

    getMetaInfoByUUID(uuid)
    {
        return Editor.assetdb.remote.loadMetaByUuid(uuid);
    }
};

module.exports = Utils;