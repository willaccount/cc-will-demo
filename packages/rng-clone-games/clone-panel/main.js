const packageUrl = "packages://rng-clone-games";
const Utils = Editor.require(`${packageUrl}/libs/utils.js`);
const path = require("path");
var fs = require("fs");

const electron = require("electron"), browserWindow = electron.remote.BrowserWindow;

let config = {
    cloneGameID: 0,
    cloneGamePath: "",
    newGameID: 0,
    newGamePath: ""
};

Editor.Panel.extend({
    style: Utils.loadText(Editor.url(`${packageUrl}/clone-panel/main.css`)),

    template: Utils.loadText(Editor.url(`${packageUrl}/clone-panel/main.html`)),

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
                isRelaunch: false
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

            let {results: assetsFolder} = await Utils.queryAssets(config.cloneGameUrl + "**/", "folder");
            await this.copyAssets(assetsFolder);
            await Utils.refreshAssets(config.newGameUrl);

            let {results: assetsTexture} = await Utils.queryAssets(config.cloneGameUrl + "**/*.*", "texture");
            await this.copyAssets(assetsTexture);
            await Utils.refreshAssets(config.newGameUrl);

            let {results: assetsSpine} = await Utils.queryAssets(config.cloneGameUrl + "**/*.*", "spine");
            await this.copyAssets(assetsSpine);
            await Utils.refreshAssets(config.newGameUrl);

            let {results: assetsAll} = await Utils.queryAssets(config.cloneGameUrl + "**/*.*", null);
            let {prefabs, scenes, animations} = await this.copyAssets(assetsAll);
            await Utils.refreshAssets(config.newGameUrl);

            let assets = prefabs.concat(scenes).concat(animations);
            for(let i=0; i<assets.length; i++)
            {
                let asset = assets[i].asset;
                let newFilePath = assets[i].newFilePath;
                let newFileUrl = assets[i].newFileUrl;

                this._vm.log = `Replace uuid in ${newFileUrl}`;
                Editor.log(this._vm.log);
                let content = await this.replaceUUID(asset);

                Utils.createFile(newFilePath, content);
            }
            await Utils.refreshAssets(config.newGameUrl);

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

                let {result: checkAsset} = await Utils.queryUuidByUrl(newFileUrl);
                if(checkAsset || asset.url.indexOf(".git") >= 0)
                {
                    //asset đã có rồi
                    //hoặc là git
                    continue;
                }

                if (asset.type !== "folder")
                {
                    this._vm.log = "Copying: " + asset.url;
                    Editor.log(this._vm.log);
                    switch (asset.type) {
                        default:
                            await Utils.copyAsset(asset.path, newFilePath);
                            break;
                        case "texture":
                            await Utils.copyFileTo( asset.path, newFilePath, [".meta"]);
                            break;
                        case "spine":
                            await Utils.copyFilesTo( path.dirname(asset.path), path.dirname(newFilePath), [".meta"]);
                            break;
                        case "scene":
                            scenes.push({asset, newFilePath, newFileUrl});
                            break;
                        case "prefab":
                            prefabs.push({asset, newFilePath, newFileUrl});
                            break;
                        case "animation-clip":
                            animations.push({asset, newFilePath, newFileUrl});
                            break;
                        case "javascript":
                        case "typescript":
                            let content = fs.readFileSync(asset.path, "utf8");
                            let regex = new RegExp(`${config.cloneGameID}`, 'g');
                            content = content.replace(regex, config.newGameID);

                            await Utils.createAsset(newFileUrl, content);
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

    async replaceUUID(asset) {
        let content = fs.readFileSync(asset.path, "utf8");

        let componentUUID = /\"__type__\"\: \"(.*)\"/g;
        let assetUUID = /\"__uuid__\"\: \"(.*)\"/g;
        let founds = [].concat(content.match(componentUUID));
        founds = founds.concat(content.match(assetUUID));

        for (let i = 0; i < founds.length; i++) {
            if (!founds[i]) {
                continue;
            }

            let arr = founds[i].split(":");
            if (arr.length > 1) {
                let uuid = arr[1].replace(/\"/g, "").trim();

                if (Utils.isUUID(uuid)) {

                    let isCompressUUID = Utils.isCompressUUID(uuid);
                    //Editor.log("====> uuid: " + uuid);
                    //Editor.log("====> isCompressUUID: ", isCompressUUID);
                    let {result: oldAssetInfo} = await Utils.queryAssetsInfoByUUID(uuid);
                    if (oldAssetInfo) {
                        let source = oldAssetInfo.path;
                        if (source.indexOf(config.cloneGamePath) < 0)
                            continue;

                        let newFileUrl = oldAssetInfo.url.replace(config.cloneGameUrl, config.newGameUrl);
                        let newFilePath = oldAssetInfo.path.replace(config.cloneGamePath, config.newGamePath);

                        let re = new RegExp(config.cloneGameID, 'g');
                        newFilePath = newFilePath.replace(re, config.newGameID);
                        newFileUrl = newFileUrl.replace(re, config.newGameID);

                        if(oldAssetInfo.type === "prefab" &&
                            !fs.existsSync(newFilePath)
                        )
                        {
                            //scene có thể ref tới prefab
                            Utils.createFile(newFilePath, []);
                            await Utils.refreshAssets(newFileUrl);
                        }

                        let newUUID = await Utils.urlToUUID(newFileUrl);
                        if (newUUID) {
                            newUUID = isCompressUUID ? Utils.compressUUID(newUUID) : newUUID;
                            re = new RegExp(Utils.escapeRegex(uuid), 'g');
                            content = content.replace(re, newUUID);
                        }
                    }
                }
            }
        }
        return content;
    }
});