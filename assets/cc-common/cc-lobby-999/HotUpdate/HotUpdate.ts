import { UpdatePanel } from './UpdatePanel';

const jsb = (<any>window).jsb;

const { ccclass, property } = cc._decorator;

@ccclass
export class HotUpdate extends cc.Component {

    @property(UpdatePanel)
    panel: UpdatePanel = null!;

    @property
    manifestFileName = 'project.manifest';

    @property
    storageDownloadPath = 'eno-hotupdate';

    @property
    maximumRetry = 3;

    @property
    autodownload = true;

    public get IsUpdating(): boolean {
        return this._updating;
    }

    private _updating = false;
    private _canRetry = false;
    private _storagePath = '';
    private _am: any = null!;
    private _updateListener = null;
    private _failCount = 0;

    onLoad() {
        this.panel.node.active = false;
        
        if (!jsb) {
            return;
        }
        let writablePath = jsb.fileUtils ? jsb.fileUtils.getWritablePath() : '/';
        this._storagePath = `${writablePath}${this.storageDownloadPath}`;
        console.log('Storage path for remote asset : ' + this._storagePath);
        this._am = new jsb.AssetsManager('', this._storagePath, this.versionCompareHandle);

        //TODO MD5 compare check
        this._am.setVerifyCallback(this._verifyFileHandle.bind(this));

        this.loadManifest();
        this.checkUpdate();
    }

    _verifyFileHandle(path: string, asset: any) {
        var compressed = asset.compressed;
        var relativePath = asset.path;
        var size = asset.size;
        if (compressed) {
            cc.log(`Verification passed: ${relativePath}`);
            return true;
        }
        else {
            //TODO implement md5 content, it's too lagging
            var fileSize = jsb.fileUtils.getFileSize(path);
            if (size == fileSize) {
                cc.log(`Verification passed: ${relativePath}`);
                return true;
            }
            cc.log(`Verification failed: ${relativePath} ${size}/${fileSize}`);
            return false;
        }
    }

    loadManifest() {
        if (cc.sys.isNative) {
            if (jsb.fileUtils.isFileExist(this.manifestFileName)) {
                let path = jsb.fileUtils.fullPathForFilename(this.manifestFileName);
                cc.log(`find manifest at path ${path}`);
                this._am.loadLocalManifest(path);
            }
            else {
                cc.log(`cant find manifest`);
            }
        }
    }

    loadManifestFromString(customManifestStr) {
        if (this._am.getState() === jsb.AssetsManager.State.UNINITED) {
            cc.log('load custom manifest');
            var manifest = new jsb.Manifest(customManifestStr, this._storagePath);
            this._am.loadLocalManifest(manifest, this._storagePath);
        }
    }

    checkUpdate() {
        if (!this._am) return;
        if (this._updating) {
            this.panel.info.string = 'Checking version';
            return;
        }

        this._updating = true;
        if (this._am.getState() === jsb.AssetsManager.State.UNINITED) {
            cc.log(`Failed to checkUpdate, need to load manifest first`);
        }
        if (!this._am.getLocalManifest() || !this._am.getLocalManifest().isLoaded()) {
            cc.log(`Failed to load local manifest ...`);
            return;
        }
        this._am.setEventCallback(this.checkCb.bind(this));
        this._am.checkUpdate();
    }

    checkCb(event: any) {
        console.log('Code: ' + event.getEventCode());
        let hasNewVersion = false;
        switch (event.getEventCode()) {
            case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                cc.log("No local manifest file found, hot update skipped.");
                break;
            case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
            case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                cc.log("Fail to download manifest file, hot update skipped.");
                break;
            case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                cc.log("Already up to date with the latest remote version.");
                break;
            case jsb.EventAssetsManager.NEW_VERSION_FOUND:
                cc.log('New version found');
                hasNewVersion = true;
                this.panel.node.active = true;
                this.panel.byteProgress.progress = 0;
                break;
            default:
                return;
        }

        this._am.setEventCallback(null!);
        this._updating = false;

        if (hasNewVersion && this.autodownload) {
            this.hotUpdate();
        }
    }

    hotUpdate() {
        if (this._am && !this._updating) {
            this._updating = true;

            this._am.setEventCallback(this.updateCb.bind(this));
            if (this._am.getState() === jsb.AssetsManager.State.UNINITED) {
                cc.log(`Failed to load hotupdate, need load manifest first`);
            }
            this._failCount = 0;
            this._am.update();
        }
    }

    updateCb(event: any) {
        var doFinishJob = false;
        var failed = false;
        switch (event.getEventCode()) {
            case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                cc.log(`No local manifest file found, hot update skipped.`);
                failed = true;
                break;
            case jsb.EventAssetsManager.UPDATE_PROGRESSION:
                let percent = event.getPercent();

                if (!isNaN(percent)) {
                    this.panel.byteProgress.progress = percent;
                    this.panel.info.string = `Updating...${Math.floor(percent * 100)}%`
                }
                var msg = event.getMessage();
                if (msg) {
                    cc.log(`Updated file: ${msg}`);
                }
                break;
            case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
            case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                cc.log(`Fail to download manifest file, hot update skipped.`);
                failed = true;
                break;
            case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                cc.log(`Already up to date with the latest remote version.`);
                failed = true;
                break;
            case jsb.EventAssetsManager.UPDATE_FINISHED:
                cc.log(`Update finished. ${event.getMessage()}`);
                doFinishJob = true;
                break;
            case jsb.EventAssetsManager.UPDATE_FAILED:
                cc.log(`Update failed. ${event.getMessage()}`);
                this._updating = false;
                this._canRetry = true;
                break;
            case jsb.EventAssetsManager.ERROR_UPDATING:
                cc.log(`Asset update error: ${event.getAssetId()}, ${event.getMessage()}`);
                break;
            case jsb.EventAssetsManager.ERROR_DECOMPRESS:
                this.panel.info.string = event.getMessage();
                break;
            default:
                break;
        }

        if (failed) {
            this._am.setEventCallback(null!);
            this._updateListener = null;
            this._updating = false;
        }

        if (this._canRetry) {
            if (this._failCount < this.maximumRetry) {
                this._failCount += 1;
                this.retry();
            }
            else {
                this.panel.info.string = "Failed to update new version, restart game to try again";
            }
        }

        if (doFinishJob) {
            this._am.setEventCallback(null!);
            this._updateListener = null;

            var searchPaths = jsb.fileUtils.getSearchPaths();
            var newPaths = this._am.getLocalManifest().getSearchPaths();
            console.log(JSON.stringify(newPaths));
            Array.prototype.unshift.apply(searchPaths, newPaths);

            localStorage.setItem('HotUpdateSearchPaths', JSON.stringify(searchPaths));
            jsb.fileUtils.setSearchPaths(searchPaths);

            setTimeout(() => {
                cc.game.restart();
            }, 1000)
        }
    }

    versionCompareHandle = function (versionA: string, versionB: string) {
        console.log(`JS Custom Version Compare: version A is ${versionA} version B is ${versionB}`);
        var vA = versionA.split('.');
        var vB = versionB.split('.');
        for (var i = 0; i < vA.length; ++i) {
            var a = parseInt(vA[i]);
            var b = parseInt(vB[i] || '0');
            if (a === b) {
                continue;
            }
            else {
                return a - b;
            }
        }
        if (vB.length > vA.length) {
            return -1;
        }
        else {
            return 0;
        }
    };

    retry() {
        if (!this._updating && this._canRetry) {
            this._canRetry = false;
            this.panel.info.string = `Retry failed Assets...`;
            this._am.downloadFailedAssets();
        }
    }

    onDestroy() {
        if (this._updateListener) {
            this._am.setEventCallback(null!);
            this._updateListener = null;
        }
    }
}
