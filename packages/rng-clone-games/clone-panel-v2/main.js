const packageUrl = "packages://rng-clone-games";
const Utils = Editor.require(`${packageUrl}/libs/utils.js`);
const path = require("path");
var fs = require("fs");
var UUID = require("node-uuid");

const electron = require("electron"), browserWindow = electron.remote.BrowserWindow;

let config = {
    cloneGameID: 0,
    cloneGamePath: "",
    newGameID: 0,
    newGamePath: ""
};

let changedUUID = {};

Editor.Panel.extend({
    style: Utils.loadText(Editor.url(`${packageUrl}/clone-panel-v2/main.css`)),

    template: Utils.loadText(Editor.url(`${packageUrl}/clone-panel-v2/main.html`)),

    $: Utils.createHtmlID([
        'btnClone', 'gameID', 'folderName', 'sceneAsset'
    ]),

    async ready() {
        this.$gameID.addEventListener('change', this.onChangeGameID.bind(this));
        this.$folderName.addEventListener('change', this.onChangeFolder.bind(this));


        this._vm = new window.Vue({
            el: this.shadowRoot,
            data: {
                scenes: [],
                log: "",
                isRelaunch: false,
                isAutoAddFirstScene: true
            },
            methods: {
                onSelectScene: this.onSelectScene.bind(this),
                onClickClone: this.onClickClone.bind(this),
                onClickDebug: this.onClickDebug.bind(this)
            }
        });

        let {results, err} = await Utils.queryAssets(null, "scene");
        if (!err) {
            results.forEach(scene => {
                this._vm.scenes.push({value: scene.uuid, text: scene.url});
            });
        }

        let thisWindow = browserWindow.getFocusedWindow();
        this.extensionWindow = Editor.remote.Window.find(thisWindow);

        this.extensionWindow.nativeWin.setTitle("RNG-Clone-Games");
    },

    onChangeFolder() {
        //Editor.log(this.$folderName.value);
    },

    onChangeGameID() {
        //Editor.log(this.$gameID.value);
    },

    onClickDebug(e)
    {
        e.stopPropagation();

        if(!this.extensionWindow)
        {
            let thisWindow = browserWindow.getFocusedWindow();
            this.extensionWindow = Editor.remote.Window.find(thisWindow);
        }

        if (this.extensionWindow)
            this.extensionWindow.openDevTools();
    },

    async onClickClone(e) {
        e.stopPropagation();

        if(!Utils.isUUID(this.$sceneAsset.value))
        {
            Editor.Dialog.messageBox({
                type: "error",
                buttons: ["OK"],
                title: "Lỗi",
                message: "Xin vui lòng chọn scene của game cần clone",
                defaultId: 0,
                cancelId: 0,
                noLink: true
            });
            return false;
        }
        if(isNaN(this.$gameID.value) || !this.$gameID.value.length)
        {
            Editor.Dialog.messageBox({
                type: "error",
                buttons: ["OK"],
                title: "Lỗi",
                message: "Xin vui nhập game id mới",
                defaultId: 0,
                cancelId: 0,
                noLink: true
            });
            return false;
        }
        if(!this.$folderName.value)
        {
            Editor.Dialog.messageBox({
                type: "error",
                buttons: ["OK"],
                title: "Lỗi",
                message: "Xin vui nhập tên folder cho game",
                defaultId: 0,
                cancelId: 0,
                noLink: true
            });
            return false;
        }
        changedUUID = {};

        let {result: assetInfo} = await Utils.queryAssetsInfoByUUID(this.$sceneAsset.value);
        if(assetInfo)
        {
            let cloneGameID = Utils.getNumber(path.basename(assetInfo.url));
            if(isNaN(cloneGameID))
            {
                Editor.Dialog.messageBox({
                    type: "error",
                    buttons: ["OK"],
                    title: "Lỗi",
                    message: "Tên scene không đúng định dạng, không phải là scene game",
                    defaultId: 0,
                    cancelId: 0,
                    noLink: true
                });
                return false;
            }
            let arrUrl = assetInfo.url.split("/");
            arrUrl.length = arrUrl.length-2;
            arrUrl.push(
                this.$folderName.value,
                ""
            );

            let arrPath = assetInfo.path.split("/");
            arrPath.length = arrPath.length-2;
            arrPath.push(
                this.$folderName.value,
                ""
            );

            config.cloneGameID = cloneGameID;
            config.newGameID = this.$gameID.value.toString();
            config.cloneGamePath = assetInfo.path.replace(path.basename(assetInfo.path), "");
            config.newGamePath = arrPath.join("/");

            config.cloneGameUrl = assetInfo.url.replace(path.basename(assetInfo.url), "");
            config.newGameUrl = arrUrl.join("/");

            Utils.makeDirExist(config.newGamePath);

            console.log("Clone Game Config:", config);
            this._vm.log = `New Game: ${config.newGameUrl}`;
            Editor.log(this._vm.log);

            let {results: assets1} = await Utils.queryAssets(config.cloneGameUrl + "**/", "folder");
            await this.copyAssets(assets1);

            let {results: assets2} = await Utils.queryAssets(config.cloneGameUrl + "**/*.*", ["script", "texture"]);
            await this.copyAssets(assets2);

            let {results: assets3} = await Utils.queryAssets(config.cloneGameUrl + "**/*.*", "material");
            await this.copyAssets(assets3);

            let {results: assetsAll} = await Utils.queryAssets(config.cloneGameUrl + "**/*.*", null);
            let {prefabs, scenes} = await this.copyAssets(assetsAll);

            let assets = prefabs.concat(scenes);
            let sceneGameUrl = null;
            for(let i=0; i<assets.length; i++)
            {
                let asset = assets[i].asset;
                let newFilePath = assets[i].newFilePath;
                let content = await this.replaceUUID(asset);
                await Utils.createFile(newFilePath, content, true);

                let sceneName = path.basename(assets[i].newFilePath);
                if(/R\d+L/.test(sceneName))
                {
                    sceneGameUrl = assets[i].newFileUrl;
                }
            }

            await Utils.refreshAssets(config.newGameUrl);

            if(this._vm.isAutoAddFirstScene)
            {
                if(!sceneGameUrl)
                {
                    this._vm.log = "Không tìm thấy scene game clone để add _FirstScene";
                    Editor.log(this._vm.log);
                }
                let uuid = Utils.urlToUUID(sceneGameUrl);
                if(!uuid)
                {
                    this._vm.log = "Scene game clone chưa được import";
                    Editor.log(this._vm.log);
                }

                this._vm.log = `Mở scene ${ sceneGameUrl }`;
                Editor.log(this._vm.log);
                await this.autoAddFirstScene(uuid);
            }

            this._vm.log = "=====>Clone Game Done<=====";
            Editor.log(this._vm.log);

            if(this._vm.isRelaunch)
                Utils.relaunch();
        }
    },

    async onSelectScene(e) {
        //Editor.log(e.detail.value);
        this.$sceneAsset.value = e.detail.value;
    },

    async copyAssets(assets) {
        let prefabs = [];
        let scenes = [];
        let animations = [];

        if(assets)
        {
            for (let i = 0; i < assets.length; i++) {
                let asset = assets[i];
                asset.name = path.basename(asset.url);

                let newFileUrl = asset.url.replace(config.cloneGameUrl, config.newGameUrl);
                let newFilePath = asset.path.replace(config.cloneGamePath, config.newGamePath);

                let re = new RegExp(config.cloneGameID, 'g');
                newFilePath = newFilePath.replace(re, config.newGameID);
                newFileUrl = newFileUrl.replace(re, config.newGameID);

                if(fs.existsSync(newFilePath) || asset.url.indexOf(".git") >= 0)
                {
                    //asset đã có rồi
                    continue;
                }

                if (asset.type !== "folder")
                {
                    this._vm.log = "Copying: " + asset.url;
                    Editor.log(this._vm.log);
                    switch (asset.type) {
                        default:
                            await Utils.copyFileTo( asset.path, newFilePath);
                            await this.replaceMetaUUID(asset);
                            break;
                        case "scene":
                            await this.replaceMetaUUID(asset);
                            scenes.push({asset, newFilePath, newFileUrl});
                            break;
                        case "prefab":
                            await this.replaceMetaUUID(asset);
                            prefabs.push({asset, newFilePath, newFileUrl});
                            break;
                        case "animation-clip":
                        case "material":
                            await this.replaceFileUUID(asset);
                            await this.replaceMetaUUID(asset);
                            break;
                        case "javascript":
                        case "typescript":
                            let content = fs.readFileSync(asset.path, "utf8");
                            let regex = new RegExp(`${config.cloneGameID}`, 'g');
                            content = content.replace(regex, config.newGameID);

                            await Utils.createFile(newFilePath, content, true);
                            await this.replaceMetaUUID(asset);
                            break;
                    }
                }
                else
                {
                    //Kiểm tra đường dẫn đã được nhận như asset folder
                    this._vm.log = `Create dir: ${newFilePath}`;
                    Editor.log(this._vm.log);
                    Utils.makeDirExist(newFilePath);
                }
            }
        }
        return {prefabs, scenes, animations};
    },

    async replaceFileUUID(asset)  {
        if(asset.path && fs.existsSync(asset.path))
        {
            this._vm.log = `"===> Replace file uuid: " ${asset.path}`;
            Editor.log(this._vm.log);
            let content = fs.readFileSync(asset.path, "utf8");

            let assetUUID = /[\w]{8}-[\w]{4}-[\w]{4}-[\w]{4}-[\w]{12}/g;
            let founds = [].concat(content.match(assetUUID));

            for(let i=0; i<founds.length; i++) {
                if (!founds[i]) {
                    continue;
                }

                let uuid = founds[i];
                if (Utils.isUUID(uuid)) {
                    let cachedAsset = Utils.assetInfoByUUID(uuid);
                    if(cachedAsset)
                    {
                        if(cachedAsset.path.indexOf(config.cloneGamePath) < 0)
                        {
                            //uuid sử dụng chung
                            changedUUID[uuid] = uuid;
                            continue;
                        }
                        else if(!cachedAsset)
                        {
                            Editor.warn("===> WARNING: Missing asset uuid: " + uuid);
                        }
                    }
                    if(!changedUUID[uuid])
                        changedUUID[uuid] = UUID();

                    content = Utils.replaceAll(content, uuid, changedUUID[uuid]);
                }
            }
            let newFile = asset.path.replace(config.cloneGamePath, config.newGamePath);
            newFile = Utils.replaceAll(newFile, config.cloneGameID, config.newGameID);
            await Utils.createFile(newFile, content, true);
        }
    },

    async replaceUUID(asset) {
        let content = fs.readFileSync(asset.path, "utf8");
        content = Utils.replaceAll(content, `"R${config.cloneGameID}`, `"R${config.newGameID}`);

        let componentUUID = /\"__type__\"\: \"(.*)\"/g;
        let assetUUID = /[\w]{8}-[\w]{4}-[\w]{4}-[\w]{4}-[\w]{12}/g;
        let componentFounds = content.match(componentUUID);
        let assetsFounds = content.match(assetUUID);

        let founds = [].concat(assetsFounds).concat(componentFounds);

        for(let i=0; i<founds.length; i++)
        {
            if(!founds[i])
            {
                continue;
            }

            let arr = founds[i].split(":");
            let uuid = arr.length > 1 ? arr[1].replace(/\"/g, "").trim() : founds[i];
            if(uuid && Utils.isUUID(uuid))
            {
                let isCompressUUID = Utils.isCompressUUID(uuid);
                // log("====> uuid: " + uuid);
                // log("====> isCompressUUID: ", isCompressUUID);
                let compressUUID = uuid;
                uuid = Utils.decompressUUID(uuid);
                let cachedAsset = Utils.assetInfoByUUID(uuid);
                if(cachedAsset)
                {
                    if(cachedAsset.path.indexOf(config.cloneGamePath) < 0)
                    {
                        //uuid sử dụng chung
                        continue;
                    }
                    else if(!cachedAsset)
                    {
                        console.warn("===> WARNING: Missing asset uuid: " + uuid);
                    }
                }

                if(changedUUID[uuid])
                {
                    let newUUID = changedUUID[uuid];
                    if(newUUID)
                    {
                        //log("=====> newAssetInfo: ", newUUID);
                        newUUID = isCompressUUID ? Utils.compressUUID(newUUID) : newUUID;
                        uuid = compressUUID;
                        content = Utils.replaceAll(content, uuid, newUUID);
                    }
                }
            }
        }
        return content;
    },

    async replaceMetaUUID(asset) {
        let metaFile = asset.path + ".meta";
        if(fs.existsSync(metaFile))
        {
            this._vm.log = "===> Replace meta uuid: " + metaFile;
            Editor.log(this._vm.log);
            let content = fs.readFileSync(metaFile, "utf8");

            let assetUUID = /[\w]{8}-[\w]{4}-[\w]{4}-[\w]{4}-[\w]{12}/g;
            let founds = [].concat(content.match(assetUUID));

            for(let i=0; i<founds.length; i++) {
                if (!founds[i]) {
                    continue;
                }

                let uuid = founds[i];
                if (Utils.isUUID(uuid)) {
                    let cachedAsset = Utils.assetInfoByUUID(uuid);
                    if(cachedAsset)
                    {
                        if(cachedAsset.path.indexOf(config.cloneGamePath) < 0)
                        {
                            //uuid sử dụng chung
                            changedUUID[uuid] = uuid;
                            continue;
                        }
                        else if(!cachedAsset)
                        {
                            Editor.warn("===> WARNING: Missing asset uuid: " + uuid);
                        }
                    }

                    if(!changedUUID[uuid])
                        changedUUID[uuid] = UUID();
                    content = Utils.replaceAll(content, uuid, changedUUID[uuid]);
                }
            }
            let newMetaFile = metaFile.replace(config.cloneGamePath, config.newGamePath);
            newMetaFile = Utils.replaceAll(newMetaFile, config.cloneGameID, config.newGameID);
            await Utils.createFile(newMetaFile, content, true);
        }
    },

    async autoAddFirstScene(sceneUUID)
    {
        return new Promise((resolve, reject) => {
            Editor.Ipc.sendToPanel('scene', 'rng-clone-games:check-scene-component', sceneUUID, "Canvas", "_FirstScene", (err, message) => {
                if(err)
                {
                    this._vm.log = "Có lỗi xảy ra: " + err.message;
                }
                if(message)
                {
                    this._vm.log = message;
                }
                Editor.log(this._vm.log);
                resolve({err, message});
            });
        });
    }
});