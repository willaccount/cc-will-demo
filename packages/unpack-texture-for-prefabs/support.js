/*eslint-disable */
const fs = require("fs-extra");
const os = require('os');
const path = require('path');
const desktopDir = path.join(os.homedir(), "Desktop");
const pathTemp2 = `${desktopDir}/temp2/`;
const Support = {

    findUuidOfPlist(fileNamePlist, plistS) {
        // let res = plistS.find(item => { return (fileNamePlist == item['fileName']);})
        // return res;
        for(let index = 0 ; index < plistS.length ; index++) { 
            let item = plistS[index];
            if (item['fileName'] == fileNamePlist) {
                item['index'] = index;
                return item;
            }
        }
        return undefined;
    },

    collectFiles(uuidDirs = [], plistObject, projectPath,infoDirs = []) {
        let folderCheck = pathTemp2 + plistObject['fileName'] + plistObject['__uuid__'];
        fs.ensureDirSync(folderCheck);
        fs.emptyDirSync(folderCheck);
        if (uuidDirs.length < 0) {
            return new Promise((resolve, reject) => {
                resolve(true);
            });
        }
        let tasks = [];
        uuidDirs.forEach(item => {
            let task = new Promise((resolve, reject) => {
                Editor.assetdb.queryPathByUuid(item, (err, directory) => {
                    // let fileNamePlist = path.split('/').pop().replace('.meta', '');
                    // Editor.log('Test path ' + content[fileNamePlist]);
                    // infoDirs.push({'__uuid__' : item, directory : path})
                    fs.readdir(directory, function (err, files) {
                        if (!err) {
                            files.forEach(function (file, index) {
                                const fileName = file.replace('.meta', '');
                                const newExt =  directory.replace(projectPath, '').replace(/\//g, '_');
                                const path = directory + '/' + file ;
                                const newPath = folderCheck +  '/' + fileName + '.' + newExt + '.meta' ;
                                if (file.includes('png.meta') && !infoDirs.includes(newPath)) {
                                    fs.copySync(path, newPath);
                                    infoDirs.push(fileName + '.' + newExt + '.meta');
                                }
                                if (index == files.length - 1) {
                                    // Editor.log('Done  collectFiles ' + plistObject['fileName']);
                                    resolve(true);
                                } 
                            });
                        } else {
                            Editor.log(err);
                        }
                    });
                });
            });
            tasks.push(task);
        });
        return Promise.all(tasks);
    },

    checkMissFile(listDuplicate, plistObject, infoDirs) {
        return new Promise((resolve, reject) => {
            Editor.assetdb.queryPathByUuid(plistObject['__uuid__'], (err, file) => {
                const fileMeta = file + '.meta';
                const contentPlistMeta = JSON.parse(fs.readFileSync(fileMeta));
                let imageNames = [];
                let missImages = [];
                if (contentPlistMeta && contentPlistMeta['subMetas']) {
                    for(let att in contentPlistMeta['subMetas']) {
                        imageNames.push(att);
                    }
                    if (infoDirs.length <= 0) {
                        missImages = imageNames;
                        resolve({listDuplicate, missImages});
                        return;
                    }
                
                    while(imageNames.length > 0) {
                        let name = imageNames.pop();
                        let found = false;
                      
                        infoDirs.forEach(item =>{
                            let name2 = item.split('.')[0] + '.' + item.split('.')[1];
                            if (name == name2) found = true;
                        });
                        if (!found) missImages.push(name);
                    }
                }
               
                resolve({listDuplicate, missImages});
            });
        });
    },

    checkDuplicate(uuidDirs = [], plistObject, projectPath) {
        return new Promise((resolve, reject) => {      
            let infoDirs = []
            Support.collectFiles(uuidDirs, plistObject, projectPath, infoDirs).then(()=>{
                return Support.countDuplicate(infoDirs, plistObject);
            }).
            then((listDuplicate)=>{
                // Editor.log('listDuplicate ' + JSON.stringify(listDuplicate));
                // resolve(listDuplicate);
                // Editor.log('checkMissFile ' + JSON.stringify(plistObject));
                return Support.checkMissFile(listDuplicate, plistObject, infoDirs);
            }).
            then(( {listDuplicate, missImages} )=>{
                // Editor.log('missImages ' + JSON.stringify(missImages));
                resolve( {listDuplicate, missImages} );
            }).
            catch(()=>{ });
        });
    },

    countDuplicate(infoDirs, plistObject) {
        return new Promise((resolve, reject) => {           
            let listDuplicate = [];
            if (infoDirs.length <= 0) {
                resolve(listDuplicate);
                return;
            }
            
            Editor.assetdb.queryPathByUuid(plistObject['__uuid__'], (err, pathPlist) => {
                let contentPlistMeta = JSON.parse(fs.readFileSync(pathPlist + '.meta'));
                let subMetas = contentPlistMeta['subMetas'];
                for(let index = 0 ; index < infoDirs.length ; index++) {
                    let ele1 = infoDirs[index].split('.');
                    let checkElement = ele1[0] + '.' + ele1[1];
                    let folderDup = [ele1[2].split('_').pop()];
                    for(let index2 = index + 1 ; subMetas[checkElement] && index2 < infoDirs.length ; index2++) {
                        let ele2 = infoDirs[index2].split('.');
                        let loopElement = ele2[0] + '.' + ele2[1];
                        if (loopElement && checkElement == loopElement) {
                            folderDup.push(ele2[2].split('_').pop());
                            listDuplicate.push({image : checkElement , folderDup : folderDup});
                        }
                    }
                    if (index == infoDirs.length - 1) {
                        resolve(listDuplicate);
                    }
                }
            });
           
            
        });
    },

};

module.exports = Support;