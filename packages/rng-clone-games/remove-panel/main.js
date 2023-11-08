const packageUrl = "packages://rng-clone-games";
const Utils = Editor.require(`${packageUrl}/libs/utils.js`);
const path = require("path");
var fs = require("fs");

const electron = require("electron"), browserWindow = electron.remote.BrowserWindow;
let folders = {};
let imagesUsing = {};

Editor.Panel.extend({
    style: Utils.loadText(Editor.url(`${packageUrl}/remove-panel/main.css`)),

    template: Utils.loadText(Editor.url(`${packageUrl}/remove-panel/main.html`)),

    $: Utils.createHtmlID([
        'folderAsset', 'selectFolder', 'fileSize'
    ]),

    async ready() {
        this._vm = new window.Vue({
            el: this.shadowRoot,
            data: {
                folders: [],
                log: ""
            },
            methods: {
                onSelectFolder: this.onSelectFolder.bind(this),
                onClickRemove: this.onClickRemove.bind(this),
                onClickDebug: this.onClickDebug.bind(this),
                onClickCheckFileSize: this.onClickCheckFileSize.bind(this),
                onClickCheckUnusedAsset: this.onClickCheckUnusedAsset.bind(this),
            }
        });

        let {results, err} = await Utils.queryAssets(null, "folder");
        if (!err) {
            results.forEach(folder => {
                let arr = folder.url.split("/");
                let lastName = arr.pop();
                if(/-\d/.test(lastName))
                {
                    folders[folder.uuid] = folder.url;
                    this._vm.folders.push({value: folder.uuid, text: folder.url});
                }
            });
        }

        let thisWindow = browserWindow.getFocusedWindow();
        this.extensionWindow = Editor.remote.Window.find(thisWindow);

        this.extensionWindow.nativeWin.setTitle("RNG-Remove-Unused-Assets");
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

    async checkDataInput()
    {
        if(!Utils.isUUID(this.$folderAsset.value))
        {
            Editor.Dialog.messageBox({
                type: "error",
                buttons: ["OK"],
                title: "Lỗi",
                message: "Xin vui lòng chọn folder của game cần xoá asset dư",
                defaultId: 0,
                cancelId: 0,
                noLink: true
            });
            return false;
        }

        let {results, err} = await Utils.queryAssets(folders[this.$folderAsset.value] + "/**", "scene");
        if (!err && results.length === 0) {
            Editor.Dialog.messageBox({
                type: "error",
                buttons: ["OK"],
                title: "Lỗi",
                message: "Xin vui lòng chọn folder chứa scene game",
                defaultId: 0,
                cancelId: 0,
                noLink: true
            });
            return false;
        }
        return true;
    },

    async onClickCheckUnusedAsset(e)
    {
        e.stopPropagation();

        let result = await this.checkDataInput();
        if(!result)
            return;

        imagesUsing = {};
        this._vm.log = "===>Checking unused assets<===";
        Editor.log(this._vm.log);
        let assetInfo = Utils.assetInfoByUUID(this.$folderAsset.value);
        if(assetInfo)
        {
            this._vm.log = "";
            let pattern = assetInfo.url + "/**";
            let {results: assets1} = await Utils.queryAssets(pattern, ["prefab"]);
            await this.searchAndWarnAssets(assets1, assetInfo);

            let {results: assets2} = await Utils.queryAssets(pattern, ["bitmap-font", "ttf-font", "spine", "sprite-atlas", "audio-clip"]);
            await this.searchAndWarnAssets(assets2, assetInfo);

            let {results: assets3} = await Utils.queryAssets(pattern, "texture");
            await this.searchAndWarnAssets(assets3, assetInfo);

            this._vm.log = "===>Check unused assets done<===";
            Editor.log(this._vm.log);
        }
    },

    async onClickCheckFileSize(e)
    {
        e.stopPropagation();

        let result = await this.checkDataInput();
        if(!result)
            return;

        let fileSize = this.$fileSize.value;

        let assetInfo = Utils.assetInfoByUUID(this.$folderAsset.value);
        if(assetInfo)
        {
            this._vm.log = "";
            let pattern = assetInfo.url + "/**";
            let {results: assets} = await Utils.queryAssets(pattern);
            for(let i=0; i<assets.length; i++)
            {
                if(assets[i].path && assets[i].type !== "folder" &&
                    fs.existsSync(assets[i].path))
                {
                    let stat = fs.statSync(assets[i].path);
                    if(stat)
                    {
                        let size = stat.size / 1024 / 1024;
                        if(size >= fileSize)
                        {
                            Editor.warn(assets[i].url + " size larger or equal " + fileSize + " MB");
                        }
                    }
                }
            }
        }
        this._vm.log = "===>Check size assets done<===";
        Editor.log(this._vm.log);
    },

    async onClickRemove(e) {
        e.stopPropagation();

        let result = await this.checkDataInput();
        if(!result)
            return;

        imagesUsing = {};
        this._vm.log = "===>Removing unused assets<===";
        Editor.log(this._vm.log);
        let assetInfo = Utils.assetInfoByUUID(this.$folderAsset.value);
        if(assetInfo)
        {
            this._vm.log = "";
            let pattern = assetInfo.url + "/**";
            let {results: assets1} = await Utils.queryAssets(pattern, ["prefab"]);
            await this.searchAndDeleteUnusedAssets(assets1, assetInfo);

            let {results: assets2} = await Utils.queryAssets(pattern, ["bitmap-font", "ttf-font", "spine", "sprite-atlas", "audio-clip"]);
            await this.searchAndDeleteUnusedAssets(assets2, assetInfo);

            let {results: assets3} = await Utils.queryAssets(pattern, "texture");
            await this.searchAndDeleteUnusedAssets(assets3, assetInfo);

            this._vm.log = "===>Remove unused assets done<===";
            Editor.log(this._vm.log);

            await Utils.refreshAssets(assetInfo.url);
        }
    },

    async onSelectFolder(e) {
        //Editor.log(e.detail.value);
        this.$folderAsset.value = e.detail.value;
    },

    async searchData(searchAsset, assetInfo) {
        let searchValue = searchAsset.uuid.split('_')[0];
        let _uuid = searchValue;
        let results = [];
        let {type} = Utils.assetInfoByUUID(searchValue);
        (type === "javascript" || type === "typescript") && (searchValue = Editor.Utils.UuidUtils.compressUuid(searchValue, !1));

        let pattern = assetInfo.url + "/**";
        //let {results: assets} = await Utils.queryAssets(pattern);
        let {results: assets} = await Utils.queryAssets(pattern, ["scene", "prefab", "animation-clip"]);

        let check = (asset, checkUUID)=>{
            if(asset && asset.path !== searchAsset.path)
            {
                const {url, type, path, uuid} = asset;
                let isUsed = false;
                if (fs.existsSync(path)) {
                    if (fs.statSync(path).isFile()) {
                        const content = fs.readFileSync(path, "utf-8");
                        isUsed = content.includes(checkUUID);
                    }
                }
                isUsed && results.push(uuid);
            }
        };

        for (let i=0; i<assets.length; i++) {
            if(assets[i].type === "folder")
                continue;

            const subAssets = Utils.subAssetsByUUID(_uuid);
            check(assets[i], _uuid);
            if (subAssets && subAssets.length)
            {
                for (const asset of subAssets)
                {
                    let uuid = asset.uuid.split('_')[0];
                    check(assets[i], uuid);
                }
            }
        }

        return results;
    },

    async searchAndDeleteUnusedAssets(assets, assetInfo) {
        let uuidDelete = [];
        for(let i=0; i<assets.length; i++)
        {
            if(assets[i].path && assets[i].type !== "folder")
            {
                let asset = Utils.assetInfoByUUID(assets[i].uuid);
                this._vm.log = "==> checking: " + asset.path;
                Editor.log(this._vm.log);


                let isTexture = asset.type === "texture";
                let founds = await this.searchData(assets[i], assetInfo);
                if(isTexture && imagesUsing[ assets[i].uuid ])
                {
                    founds.push(imagesUsing[ assets[i].uuid ]);
                }

                if(founds.length === 0)
                {
                    uuidDelete.push(assets[i].uuid);
                    if(assets[i].type === "spine")
                    {
                        let {results: spineAtlases} = await Utils.queryAssets(assets[i].url.replace(".json", "*.*"), "asset");
                        for(let i=0; i<spineAtlases.length; i++)
                        {
                            uuidDelete.push(spineAtlases[i].uuid);
                        }
                    }
                }
                else if(fs.existsSync(assets[i].path))
                {
                    if(asset.type === "spine" || asset.type === "bitmap-font" || asset.type === "sprite-atlas")
                    {
                        let meta = Utils.getMetaInfoByUUID(assets[i].uuid);
                        if(meta)
                        {
                            if(meta.textures)
                            {
                                for(let i=0; i<meta.textures.length; i++)
                                {
                                    imagesUsing[ meta.textures[i] ] = assets[i].uuid;
                                }
                            }
                            if(meta.textureUuid)
                            {
                                imagesUsing[ meta.textureUuid ] = assets[i].uuid;
                            }
                            if(meta.rawTextureUuid)
                            {
                                imagesUsing[ meta.rawTextureUuid ] = assets[i].uuid;
                            }
                        }
                    }

                    let stat = fs.statSync(assets[i].path);
                    if(stat)
                    {
                        let size = stat.size / 1024 / 1024;
                        if(size >= 1) // > 1MB
                        {
                            Editor.warn(assets[i].url + " size larger or equal 1MB");
                        }
                    }
                }
            }
        }

        for(let i=0; i<uuidDelete.length; i++)
        {
            let asset = Utils.assetInfoByUUID( uuidDelete[i] );
            if(asset && asset.path)
            {
                this._vm.log = "==> delete file: " + asset.path;
                Editor.log(this._vm.log);
                Utils.deleteAsset(asset);
            }
        }
    },

    async searchAndWarnAssets(assets, assetInfo) {
        for(let i=0; i<assets.length; i++)
        {
            if(assets[i].path && assets[i].type !== "folder")
            {
                let asset = Utils.assetInfoByUUID(assets[i].uuid);
                let isTexture = asset.type === "texture";

                let founds = await this.searchData(assets[i], assetInfo);
                if(isTexture && imagesUsing[ assets[i].uuid ])
                {
                    founds.push(imagesUsing[ assets[i].uuid ]);
                }
                if(founds.length === 0 && fs.existsSync(assets[i].path))
                {
                    Editor.warn(assets[i].url + " is unused");
                    if(assets[i].type === "spine")
                    {
                        let {results: spineAtlases} = await Utils.queryAssets(assets[i].url.replace(".json", "*.*"), "asset");
                        for(let i=0; i<spineAtlases.length; i++)
                        {
                            Editor.warn(spineAtlases[i].url + " is unused");
                        }
                    }
                }
                else if(
                    (asset.type === "spine" || asset.type === "bitmap-font" || asset.type === "sprite-atlas")
                    && asset.path)
                {
                    let meta = Utils.getMetaInfoByUUID(assets[i].uuid);
                    if(meta)
                    {
                        if(meta.textures)
                        {
                            for(let i=0; i<meta.textures.length; i++)
                            {
                                imagesUsing[ meta.textures[i] ] = assets[i].uuid;
                            }
                        }
                        if(meta.textureUuid)
                        {
                            imagesUsing[ meta.textureUuid ] = assets[i].uuid;
                        }
                        if(meta.rawTextureUuid)
                        {
                            imagesUsing[ meta.rawTextureUuid ] = assets[i].uuid;
                        }
                    }
                }
            }
        }
    }
});