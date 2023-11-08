/*eslint-disable */
const fs = require("fs-extra");
const exception = ['.git' , '.DS_Store'];
const os = require('os');
const path = require('path');
const desktopDir = path.join(os.homedir(), "Desktop");
const pathTemp2 = `${desktopDir}/temp2/`;
const pathCopy = `${desktopDir}/temp2/pathCopy.json`;

const electron = require("electron"), browserWindow = electron.remote.BrowserWindow;
const UnPack = {

    plistPaths : [],
    listPngUuid : [],
    pngPaths : [],
    fileCount : 0,
    filePathJson : '',
    printHello() {
        Editor.log('UnPack Hello ' + JSON.stringify( this.plistPaths));
        // fs.ensureDirSync('./temp2');
        // fs.removeSync('./temp2');
        Editor.log(desktopDir);
    },

    setPlistPaths(plistPaths = []) {
        this.plistPaths = plistPaths;
    },

    openDebug() {
        if(!this.extensionWindow) {
            let thisWindow = browserWindow.getFocusedWindow();
            this.extensionWindow = Editor.remote.Window.find(thisWindow);
        }

        if (this.extensionWindow) this.extensionWindow.openDevTools();
    },

    ready() {
        fs.ensureDirSync(pathTemp2);
        fs.emptyDirSync(pathTemp2);
        let contentCopy = {};
        fs.writeFileSync(pathCopy, JSON.stringify(contentCopy));
    },

    reset(){
        // this.plistPaths = [];
    },

    getAllFolder(directory, folderPaths) {
        let files = fs.readdirSync(directory);
        files.forEach(function (file, index) {
            const path = directory + '/' + file;
            
            if (fs.statSync(path).isDirectory() && exception.indexOf(file) == -1) {
                const pathMeta = path + '.meta';
                if (fs.existsSync(pathMeta)) {
                    const content = JSON.parse(fs.readFileSync(pathMeta));
                    const object = { '__uuid__' : content['uuid'] , directory : path}; 
                    folderPaths.push(object);
                }
                
                UnPack.getAllFolder(path , folderPaths);
            }
        });
    },

    searchByName(folderPaths, contentPlistMeta, plistName , imgUuidDirs) {
        folderPaths.forEach(item => {
            let found = false;
            let subMetas = contentPlistMeta['subMetas'];
            for(let pngName in subMetas) {
                if (!found && pngName.includes('.png') && item['directory']) {
                    let files = fs.readdirSync(item['directory']);
                    files.forEach(function (file, index) {
                        if(file == pngName) {
                            if (!imgUuidDirs[plistName]) imgUuidDirs[plistName] = [];
                            imgUuidDirs[plistName].push(item['__uuid__']);
                            found = true;
                        }          
                    });
                }
            }
        });
        
    },

    getALlPlistMeta(directory) {
        // Editor.log(directory);
        let plistPaths = [];
        this.plistPaths = plistPaths;
        return new Promise((resolve, reject) => {
            fs.readdir(directory, function (err, files) {
                // Editor.log(directory);
                if (!err) {
                    files.forEach(function (file, index) {
                        const path = directory + '/' + file;
                        if (exception.indexOf(file) == -1
                            && file.includes('plist.meta')
                            && !plistPaths.includes(path)) {
                            plistPaths.push(path);
                        }
                        if (files.length - 1 == index) {
                            resolve(true);
                        }
                    });
                } else {
                    console.log(err);
                }
            });
        });
    },

    
    getALlPlistMeta2(directory, plistPaths) {
        let files = fs.readdirSync(directory);
        files.forEach(function (file, index) {
            const path = directory + '/' + file;
            const pngPath = path.replace('.meta', '');
            if (fs.statSync(path).isDirectory() && exception.indexOf(file) == -1) {
                UnPack.getALlPlistMeta2(path , plistPaths)
            } else if (file.includes('plist.meta')
                && fs.existsSync(pngPath)
                && fs.existsSync(path)
                && !plistPaths.includes(path)) 
            {
                const contentMeta = JSON.parse(fs.readFileSync(path));
                if (contentMeta['type'] == "Texture Packer") {
                    plistPaths.push(path);
                }
            }
        });
    },

    getPngPathFiles(pngPath, pngPathFiles = []) {
        return new Promise((resolve, reject) => {
            fs.readdir(pngPath, function (err, files) {
                if (!err) {
                    files.forEach(function (file, index) {
                        const path = pngPath + '/' + file;
                        if (file.includes('png.meta') || file.includes('jpg.meta')) {
                            pngPathFiles.push(path);
                        }
                        if (index == files.length - 1) {
                            resolve(true);
                        }
                    });
                } else {
                    console.log(err);
                }
            });
        });
    },

    queryPngUUID (pngPaths, pngUuid, plistS, item, pngPathFiles, contentCopy) {
        return new Promise((resolve, reject) => {
            Editor.assetdb.queryPathByUuid(pngUuid, async (err, path) => {    
                pngPaths.push(path);
                if (!plistS[item['fileName']]) plistS[item['fileName']] = {} ;
                plistS[item['fileName']]['folders'] = pngPaths;
                await this.getPngPathFiles(path, pngPathFiles);
                plistS[item['fileName']]['pngFiles'] = pngPathFiles;
                fs.writeFileSync(pathCopy, JSON.stringify(contentCopy));
                Editor.log('Done 111');
                resolve(true);
            });
          });
       
    },

    getPngDirsUuid(filePack, shortListImages = null) {
        let listPngUuid = [];
        this.listPngUuid = listPngUuid;
        let contentCopy = JSON.parse(fs.readFileSync(pathCopy));
        let plistS = {};
        contentCopy['plistS'] = plistS;
        let task = () => {
            return new Promise( async (resolve, reject) => {
                if (fs.existsSync(filePack)) {
                    let content = JSON.parse(fs.readFileSync(filePack));
                    if (content && content['plistS']) {
                        let list = content['plistS'];
                        let shortList = [];
                        if (Array.isArray(shortListImages)) {
                            shortList = shortListImages;
                        } else {
                            shortList = list.filter(item => (item['fileName'] && content[item['fileName']] && content[item['fileName']].length > 0));
                        }
                        shortList.forEach(async (item , index)=> {
                            if (item['fileName'] && content[item['fileName']]) {
                                const pngS = content[item['fileName']];
                                let pngPaths = [];
                                let pngPathFiles = [];
                                pngS.forEach(async (pngUuid, indexImg) =>{
                                    listPngUuid.push(pngUuid);
                                    await this.queryPngUUID(pngPaths, pngUuid, plistS, item, pngPathFiles, contentCopy);
                                    if (index == shortList.length - 1 && indexImg == pngS.length - 1) {
                                        resolve(true);
                                    }
                                });
                            }
                        });
                        if (shortList.length == 0) {
                            resolve(true);
                        }
                    } else {
                        resolve(true);
                    }
                    
                } 
            });
        };
        return task();
    },

    getPngPathDirs() {
        let tasks = [];
        this.listPngUuid.forEach(pngUuid => {
            let task = () => {
                return new Promise((resolve, reject) => {
                    Editor.assetdb.queryPathByUuid(pngUuid, (err, path) => {
                        this.pngPaths.push(path);
                        resolve(true);
                    });
                });
            };
            tasks.push(task);
        });
        const callTasks = () => {
            return tasks.reduce((prev, task) => {
              return prev
                .then(task)
                .catch(err => {
                    console.warn('err', err.message);
                });
            }, Promise.resolve());
        };
        return callTasks();
    },

    readDirSync(directory, filePlistMeta, pngDirectory, callback) {
        UnPack.fileCount++;
        // Editor.log(' readDirSync ' + filePlistMeta.split('/').pop() + '  ' + pngDirectory.split('/').pop());
        fs.readdir(directory, function (err, files) {
            UnPack.fileCount--;
            //handling error
            if (err) {
                // console.log("can not read directory " + directory);
            } else {
                let raw = fs.readFileSync(filePlistMeta);
                let contentMeta = JSON.parse(raw);
                files.forEach(function (file, index) {
                    const prefabFile = directory + '/' + file;
                    let ext = file.split('.').pop();
                    // Editor.log('ext ' + ext);
                    if (ext == 'prefab' || ext == 'fire' || ext == 'anim') {
                        changeUUID(pngDirectory, prefabFile, contentMeta, filePlistMeta);
                    }
                });
            }
    
            if (UnPack.fileCount == 0) {
                setTimeout(()=>{
                    Editor.log('DONE readDirSync ');
                    callback && callback();
                }, 1000);
            }
        });
    },

    preparePrefabs(directory , content,  callback) {
        UnPack.fileCount++;
        fs.readdir(directory, function (err, files) {
            UnPack.fileCount--;
            //handling error
            if (err) {
                // console.log("can not read directory " + directory);
            } else {
                files.forEach(function (file, index) {
                    const prefabFile = directory + '/' + file;
                    let ext = file.split('.').pop();
                    if (ext == 'prefab' || ext == 'fire' || ext == 'anim') {
                        content[file] = prefabFile;
                        // fs.copySync(prefabFile, pathTemp2 + file);
                    }
                    if (exception.indexOf(file) == -1) {
                        UnPack.preparePrefabs(prefabFile, content , callback);
                    }
                });
            }
    
            if (UnPack.fileCount == 0) {
                setTimeout(()=>{
                    Editor.log('DONE preparePrefabs ');
                    callback && callback();
                }, 1000);
            }
        });
    },

    applyToGame() {
        return new Promise((resolve, reject) => {
            let contentCopy = JSON.parse(fs.readFileSync(pathCopy));
            fs.readdir(pathTemp2, function (err, files) {
                if (err) {
                    // console.log("can not read directory " + directory);
                } else {
                    files.forEach(function (file, index) {
                        const prefabFile = pathTemp2 + file;
                        if (file && contentCopy[file]) {
                            const oldPath = contentCopy[file];
                            fs.copySync(prefabFile, oldPath);
                            // Editor.log('copy ' + prefabFile + ' oldPath ' + oldPath);
                        }
    
                        if (index == files.length - 1) {
                            resolve(true);
                        }
                    });
                }
            });
        });
    },


    changeUUID_Item_Plist2Png(item, attribute, pngUuid, plistUuid) {
        const key = '__uuid__';
        let result = false;

        if (item[attribute] && item[attribute][key] && item[attribute][key] == plistUuid) {
            item[attribute][key] = pngUuid;
            Editor.log(`------- changeUUID_Item ${plistUuid} to ${pngUuid}`);
            result = true;
        }
        return result;
    },


    changeAttribute_Atlas(attribute, fileName, newValue, contentMeta) {
        if (contentMeta && contentMeta['subMetas'] && contentMeta['subMetas'][fileName]) {
            contentMeta['subMetas'][fileName][attribute] = newValue;
        }
    },

    changeContentInSprites(sprites, pngUuid, plistUuid) {
        let hasChanged = false;
        for (let index = 0; index < sprites.length; index++) {
            let spriteUuid = sprites[index];
            if (spriteUuid && spriteUuid['__uuid__'] && spriteUuid['__uuid__'] == plistUuid) {
                sprites[index]['__uuid__'] = pngUuid;
                Editor.log(`------- changeUUID_Item Sprite ${plistUuid} to ${pngUuid}`);
                hasChanged = true;
            }
        }
        for (let index = 0; index < sprites.length; index++) {
            let spriteUuid = sprites[index];
            if (spriteUuid && spriteUuid['value'] 
                && spriteUuid['value'] ['__uuid__'] 
                && spriteUuid['value'] ['__uuid__'] == plistUuid) {
                sprites[index]['value']['__uuid__'] = pngUuid;
                Editor.log(`------- changeUUID_Item Sprite ${plistUuid} to ${pngUuid}`);
                hasChanged = true;
            }
        }
        return hasChanged;
    },

    changeContentPrefab(contentPrefab, contentPlistMeta, contentPngMeta, fileNamePng, fileNameNoExt) {
        let hasChanged = false;
        let plistUuid = this.getUuidInPlist(contentPlistMeta, fileNamePng);
        let pngUuid = this.getUuidInPng(contentPngMeta, fileNameNoExt);
  
        if (Array.isArray(contentPrefab)) {
            contentPrefab.forEach((item, index) => {           
                for (let attribute in item) {
                    if (item.hasOwnProperty(attribute) && item[attribute]) {
                        if (UnPack.changeUUID_Item_Plist2Png(item, attribute, pngUuid, plistUuid)) {
                            hasChanged = true;
                        }
                    }
                   
                    if (attribute == '_atlas' && item[attribute]) {
                        item[attribute] = null;
                    }
                    if (item.hasOwnProperty(attribute) && item[attribute]){ 
                        if (Array.isArray(item[attribute])) {
                            let list = item[attribute];
                            if (UnPack.changeContentInSprites(list, pngUuid, plistUuid)) {
                                hasChanged = true;
                                hasChangedContentSprite = true;
                            }
                        } else {
                            if (UnPack.changeContentPrefab(contentPrefab[attribute], contentPlistMeta, contentPngMeta, fileNamePng, fileNameNoExt)) {
                                hasChanged = true;
                            }
                        }
                    }
                }
            });
        } else if (typeof (contentPrefab) == 'object') {

            for (let attribute in contentPrefab) {
                if (attribute == '_spriteFrame') {
                    debugger;
                }
                if (contentPrefab.hasOwnProperty(attribute) && contentPrefab[attribute]) {
                    if (UnPack.changeUUID_Item_Plist2Png(contentPrefab, attribute, pngUuid, plistUuid)) {
                        hasChanged = true;
                    }
                }
    
                if (contentPrefab.hasOwnProperty(attribute) && contentPrefab[attribute] && Array.isArray(contentPrefab[attribute])) {
                    let list = contentPrefab[attribute];
                    if (UnPack.changeContentInSprites(list, pngUuid, plistUuid)) {
                        hasChangedContentSprite = true;
                        hasChanged = true;
                    }
                }
            }
    
            for (let attribute in contentPrefab) {
                if (contentPrefab.hasOwnProperty(attribute) && contentPrefab[attribute]) {
                    if (UnPack.changeContentPrefab(contentPrefab[attribute], contentPlistMeta, contentPngMeta, fileNamePng, fileNameNoExt)) {
                        hasChanged = true;
                    }
                }
            }
        }
        return hasChanged;
    },

    getUuidInPlist(contentMeta, fileName) {
        if (contentMeta['subMetas'] && contentMeta['subMetas'][fileName] && contentMeta['subMetas'][fileName]['uuid'] != undefined) {
            return contentMeta['subMetas'][fileName]['uuid'];
        }
        return undefined;
    },

    getUuidInPng(content, fileName) {
        if (content && content['subMetas'] && content['subMetas'][fileName] && content['subMetas'][fileName]['uuid']) {
            return content['subMetas'][fileName]['uuid'];
        }
        return undefined;
    },
    
    unPack() {
        let contentCopy = JSON.parse(fs.readFileSync(pathCopy));
        let contentPack = JSON.parse(fs.readFileSync(this.filePack));
        let plistS = contentCopy['plistS'];
        let prefabs = contentCopy['prefabs'];
        
        return new Promise((resolve, reject) => {
            UnPack.plistPaths.forEach((plistMeta, index) =>{
                let pathPlist = plistMeta.replace('.meta', '');
                let plistName = plistMeta.split('/').pop().replace('.meta', '');
                let shortPath = plistMeta.replace(this.projectPath, '').replace(/\//g, '_').split('.')[0];
                let fileNamePlist = plistMeta.split('/').pop().replace('.meta', '') + '.' + shortPath;
              
                let contentPlistMeta = JSON.parse(fs.readFileSync(plistMeta));
                let countKey = 0;
                for(let keyPrefab in prefabs) {
                    countKey++;
                    if (prefabs[keyPrefab]) {
                        let filePrefab = prefabs[keyPrefab];
                        let contentPrefab = JSON.parse(fs.readFileSync(filePrefab));
                        Editor.log(' keyPrefab ' + keyPrefab);
                        // if (keyPrefab == 'MegaSymbol.prefab') {
                        //     debugger;
                        // }
                        if (plistS[fileNamePlist] && plistS[fileNamePlist]['pngFiles']) {
                            let pngPaths = plistS[fileNamePlist]['pngFiles'];
                            pngPaths.forEach(item => {
                                const fileNamePng = item.split('/').pop().replace('.meta', '');
                                const fileNameNoExt = item.split('/').pop().split('.')[0];
                                let contentPngMeta = JSON.parse(fs.readFileSync(item));
                                // Editor.log('aaaaaa ' + JSON.stringify(contentPngMeta));
                                // Editor.log('aaaaaa ' + item.split('/').pop().replace('.meta', ''));
                                let hasChanged = false;
                                hasChanged = UnPack.changeContentPrefab(contentPrefab, contentPlistMeta, contentPngMeta, fileNamePng, fileNameNoExt);
                                if (hasChanged) {
                                    fs.writeFileSync(filePrefab, JSON.stringify(contentPrefab));
                                }
                            });
                        }
                    }
                    if (countKey === Object.keys(prefabs).length) {
                        setTimeout(()=>{
                            resolve(true);
                        },100);
                    }
                }
            });
        });
    },
    
    unPackTexture(filePack, projectPath, shortList = null) {
        debugger;
        fs.ensureDirSync(pathTemp2);
        this.filePack = filePack;
        this.projectPath = projectPath;
        let task = this.getPngDirsUuid(filePack, shortList);
        task.then(()=>{
            Editor.log('Task getPngDirsUuid Done');
            return this.getPngPathDirs();
        })
        .then(()=>{
            Editor.log('Task getALlPlistMeta Done  this.plistPaths.length ' + this.plistPaths.length);
            UnPack.fileCount = 0;
            let contentCopy = JSON.parse(fs.readFileSync(pathCopy));
            contentCopy['prefabs'] = {};
            return new Promise((resolve, reject) => {
                UnPack.preparePrefabs(this.projectPath, contentCopy['prefabs'], ()=>{
                    Editor.log('Copy Prefabs Done');
                    fs.writeFileSync(pathCopy, JSON.stringify(contentCopy));
                    resolve(true);
                });
            });
        })
        .then(()=>{
            return this.unPack();
        })
        .then(()=>{
            // return this.applyToGame();
            return new Promise((resolve, reject) => {
                resolve(true);
            });
        })
        .then(()=>{
            Editor.log('UnPack Done');
            // fs.ensureDirSync(pathTemp2);
            // fs.removeSync(pathTemp2);
        })
        .catch(()=>{});
    },

    uniTest() {
        let pathPrefab = '/Users/vhungtr/Documents/SoftForGameCty/cc-all-in-one/assets/cc-release-8/cc-frozen-9990/prefabs/table/MegaSymbol.prefab';
        let pathMetaPlist = '/Users/vhungtr/Documents/SoftForGameCty/cc-all-in-one/assets/cc-release-8/cc-frozen-9990/data/AtlasFiles/MainUI.plist.meta';
        let pathPngMeta = '/Users/vhungtr/Documents/SoftForGameCty/cc-all-in-one/assets/cc-release-8/cc-frozen-9990/data/Sprites/ui/Frame_Corner.png.meta';
        let fileNamePng = 'Frame_Corner.png';
        let fileNameNoExt = 'Frame_Corner';
      
        let contentPrefab = JSON.parse(fs.readFileSync(pathPrefab));
        let contentPlistMeta = JSON.parse(fs.readFileSync(pathMetaPlist));
        let contentPngMeta = JSON.parse(fs.readFileSync(pathPngMeta));
        debugger;
        let hasChanged = UnPack.changeContentPrefab(contentPrefab, contentPlistMeta, contentPngMeta, fileNamePng, fileNameNoExt);
        if (hasChanged) {
            fs.writeFileSync(pathPrefab, JSON.stringify(contentPrefab));
        }

    }
    
};

module.exports = UnPack;