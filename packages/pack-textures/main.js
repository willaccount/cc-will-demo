/* eslint-disable */
'use strict';

const fs = require('fs-extra');
const path = require('path');
const projectPath = Editor.Project.path;
const assetPath = path.join(projectPath,'assets');
const modulePath = path.join(assetPath, 'slot');
const {execSync, exec} = require("child_process");
const { readdirSync, readdir, readFile, readFileSync, writeFile, writeFileSync, unlinkSync } = require('fs');
const { reject } = require('lodash');
const { resolve } = require('path');
const prefixSearch = 'tp_';
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const Plist = require('plist');

let compressLevel = 7;
let textureType = 'png';
let plistFileExported = [];
let forceSquared = '';
const getFolders = function(searchPath) {
    let result = [];
    const items = fs.readdirSync(searchPath);
    items.forEach(it=>{
        const itemPath = path.join(searchPath, it);
        const stat = fs.statSync(itemPath);
        if (stat.isDirectory()) {
            result.push(it);
        }
    });
    return result;
};

const searchFolderWithPrefix = function(searchPath, prefix, inherritPack = false) {
    let result = [];
    const items = fs.readdirSync(searchPath);
    items.forEach(it=>{
        const itemPath = path.join(searchPath, it);
        const stat = fs.statSync(itemPath);
        let isPack = false;
        if (stat.isDirectory()) {
            if (it.startsWith(prefix) || (inherritPack && !it.startsWith('np_'))) {
                result.push(itemPath);
                isPack = true;
            }
            result = result.concat(searchFolderWithPrefix(itemPath, prefix, isPack));
        }
    });
    return result;
};

const searchImages = function(searchPath) {
    let result = [];
    const items = fs.readdirSync(searchPath);
    items.forEach(it=>{
        const itemPath = path.join(searchPath, it);
        const stat = fs.statSync(itemPath);
        if (!stat.isDirectory() && !it.startsWith('atlas_') && path.extname(it) == '.png') {
            result.push(path.join(searchPath, it));
        }
    });
    return result;
};

const searchImagesDeep = function(searchPath) {
    let result = [];
    const items = fs.readdirSync(searchPath);
    items.forEach(it=>{
        const itemPath = path.join(searchPath, it);
        const stat = fs.statSync(itemPath);
        if (!stat.isDirectory() && it.startsWith('atlas_')) {
            unlinkSync(path.join(searchPath, it));
        }
        else
        if (stat.isDirectory() && !it.startsWith('np_')) {
            result = result.concat(searchImagesDeep(path.join(searchPath, it)));
        }
        else
        if (!it.startsWith('atlas_') && path.extname(it) == '.png') {
            result.push(path.join(searchPath, it));
        }
    });
    return result;
};

const _packFolder = function(folder) {
    return new Promise((resolve, reject)=>{
        let pngList = searchImages(folder);
        Editor.log(pngList.length);
        if (pngList.length > 0) {
            const packCmd = `TexturePacker ${String(pngList).replace(/[,]/g," ")} --sheet ${folder}/atlas_{n1}.png --data ${folder}/atlas_{n1}.plist --trim-mode None --multipack --disable-rotation --max-size 2048 --texture-format ${textureType} --png-opt-level ${compressLevel}${forceSquared}`;
            Editor.log(packCmd);
            exec(packCmd, (error, stdout, stderr)=>{
                const regex = /^Writing..*plist$/gm;
                const plistFiles = stdout.match(regex);
                Editor.log('Finish pack ' + folder);
                if (plistFiles && plistFiles.length > 0) {
                    Editor.log(plistFiles);
                    plistFiles.forEach(it=>{
                        const path = it.replace('Writing ', "");
                        Editor.log('replace path ' + path);
                        plistFileExported.push({plist: path, folder});
                    });
                }
                resolve();
            });
        }
        else {
            Editor.log('No png found');
            resolve();
        }
    });
};

const remapUUID = function() {
    let tasks = [];
    Editor.log('RemapUUID');
    Editor.log(plistFileExported);
    plistFileExported.forEach(({plist, folder})=>{
        tasks.push(_remapUUID(plist, folder));
    });
    return Promise.all(tasks);
};

const updateOffset = function(plist, spriteMeta) {
    let spriteOffset = `{${spriteMeta.offsetX},${spriteMeta.offsetX}}`;
    let spriteSize = `{${spriteMeta.width},${spriteMeta.height}}`;
    let textureRect = `{{${1 + spriteMeta.trimX},${1 + spriteMeta.trimY}},{${spriteMeta.width},${spriteMeta.height}}}`;
}

const parseRectObject = function(rect) {

}

const _remapUUID = function(plist, folder) {
    return new Promise((resolve, reject) =>{
        let meta = readFileSync(plist + '.meta');
        Editor.log('Read plist file ' + plist);
        let plistXml = Plist.parse(readFileSync(plist, 'utf8'))
        let metaJson = JSON.parse(meta.toString());
        let frames = Object.keys(metaJson.subMetas);

        frames.forEach((frame)=>{
            Editor.log(`Update frame` + frame);
            let filePath = path.join(folder, frame + '.meta');
            let meta = readFileSync(filePath);
            let spriteJson = JSON.parse(meta);
            let frameName = frame.split('.')[0];
            let frameUUID = spriteJson['subMetas'][frameName].uuid.split('_')[0];
            spriteJson['subMetas'][frameName].uuid = frameUUID + '_r';
            metaJson.subMetas[frame].uuid = frameUUID;
            metaJson.subMetas[frame].borderTop = spriteJson.subMetas[frameName].borderTop;
            metaJson.subMetas[frame].borderBottom = spriteJson.subMetas[frameName].borderBottom;
            metaJson.subMetas[frame].borderLeft = spriteJson.subMetas[frameName].borderLeft;
            metaJson.subMetas[frame].borderRight = spriteJson.subMetas[frameName].borderRight;

            plistXml.frames[frame].spriteOffset = `{${spriteJson.subMetas[frameName].offsetX},${spriteJson.subMetas[frameName].offsetY}}`;
            plistXml.frames[frame].spriteSize = `{${spriteJson.subMetas[frameName].width},${spriteJson.subMetas[frameName].height}}`;

            let currentRect = plistXml.frames[frame].textureRect.replace(/[{}]/g,"").split(',')
            currentRect = currentRect.map(it => {return parseInt(it)});
            plistXml.frames[frame].textureRect = `{{${currentRect[0] + spriteJson.subMetas[frameName].trimX},${currentRect[1] + spriteJson.subMetas[frameName].trimY}},{${spriteJson.subMetas[frameName].width},${spriteJson.subMetas[frameName].height}}}`;
            writeFileSync(filePath, JSON.stringify(spriteJson));
        });
        Editor.log(`Write plist file`);
        writeFileSync(plist + '.meta', JSON.stringify(metaJson));
        writeFileSync(plist, Plist.build(plistXml));
        resolve();
    });
};

const packFolders = function(folders) {
    let tasks = [];
    folders.forEach(folder => {
        tasks.push(_packFolder(folder));
    });
    return Promise.all(tasks);
};

const refreshFolders = function(folders) {
    let tasks = [];
    folders.forEach(folder => {
        const path = "db://assets" + folder.split('assets')[1];
        tasks.push(refreshFolder(path));
    });
    return Promise.all(tasks);
};

const refreshFolder = function(path) {
    Editor.log('Refreshing ' + path);
    return new Promise((resolve, reject) => {
        Editor.assetdb.refresh(path, function (err, results) {
            resolve({err, results});
        });
    });
};

const revertMetaFile = function(metaFile) {
    return new Promise((resolve, reject)=>{
        const fileName = path.basename(metaFile, '.png.meta');
        readFile(metaFile, (err, data)=>{
            let json = JSON.parse(data.toString());
            let frameUUID = json['subMetas'][fileName].uuid.replace('_r','');
            json['subMetas'][fileName].uuid = frameUUID;
            writeFile(metaFile, JSON.stringify(json), ()=>{
                Editor.log('Reverted ' + metaFile);
                resolve();
            });
        });
    });
};

const unPackFolder = function(folderPath) {
    const deleteAtlas = true;
    const images = searchImagesDeep(folderPath, deleteAtlas);
    Editor.log(images);
    let tasks = [];
    images.forEach(it => {
        tasks.push(revertMetaFile(it + '.meta'));
    });
    Promise.all(tasks)
        .then(()=>{
            Editor.log('Refreshing folder ' + folderPath);
            return refreshFolders([folderPath]);
        })
        .then(()=>{
            Editor.log('Finished All');
        });
};

const swapFrameValue = function(a,b) {
    let t = a.uuid;
    a.uuid = b.uuid;
    b.uuid = t;

    t = a.borderTop;
    a.borderTop = b.borderTop;
    b.borderTop = t;

    t = a.borderBottom;
    a.borderBottom = b.borderBottom;
    b.borderBottom = t;

    t = a.borderLeft;
    a.borderLeft = b.borderLeft;
    b.borderLeft = t;

    t = a.borderRight;
    a.borderRight = b.borderRight;
    b.borderRight = t;
}

const switchUUID = function(folder, plist) {
    return new Promise((resolve, reject) =>{
        let data = readFileSync(plist + '.meta');
        let plistJson = JSON.parse(data.toString());
        let frames = Object.keys(plistJson.subMetas);
        frames.forEach((frame)=>{
            let filePath = path.join(folder, frame + '.meta');
            if (fs.existsSync(filePath)) {
                Editor.log('Mapping frame ' + frame);
                let data = readFileSync(filePath);
                let spriteJson = JSON.parse(data);
                let frameName = frame.split('.')[0];
                Editor.log('swapValue ' + plistJson.subMetas[frame] + ' ' + spriteJson['subMetas'][frameName]);
                swapFrameValue(plistJson.subMetas[frame], spriteJson['subMetas'][frameName]);
                writeFileSync(filePath, JSON.stringify(spriteJson));
            }
            else {
                Editor.log('Failed to map frame ' + frame);
            }
        });
        writeFileSync(plist + '.meta', JSON.stringify(plistJson));
        resolve();
    });
}

module.exports = {
    load () {
    // execute when package loaded
    },

    unload () {
    // execute when package unloaded
    },

    // register your ipc messages here
    messages: {
        'open' () {
            // open entry panel registered in package.json
            Editor.Panel.open('pack-textures');
        },
        'ready' (event) {
            const folders = getFolders(modulePath);
            event.reply(folders);
            //Editor.Ipc.sendToPanel('pack-textures', 'pack-textures:loadfolder');
        },
        'onPackClick' (event, value, level, type, squared) {
            forceSquared = squared;
            compressLevel = level;
            textureType = type;
            plistFileExported = [];
            Editor.log('Searching folders');
            let folders = [];
            let mainFolder = path.basename(value);
            if (mainFolder.startsWith('tp_')) {
                folders = [value];
                folders = folders.concat(searchFolderWithPrefix(value, prefixSearch, true));
            }
            else {
                folders = searchFolderWithPrefix(value, prefixSearch, false);
            }
            Editor.log('List folder to pack');
            Editor.log(folders);
            Editor.log('Start packing textures');
            packFolders(folders)
                .then(()=>{
                    Editor.log('Refresh to import plist');
                    return refreshFolders(folders);
                })
                .then(()=>{
                    Editor.log('Remap UUID for sprites');
                    return remapUUID();
                })
                .then(()=>{
                    Editor.log('Refresh all asset');
                    return refreshFolders(folders);
                })
                .then(()=>{
                    Editor.log('===== Finished =====');
                });
        },
        'onUnpackClick' (event, value) {
            Editor.log('Unpack folder ' + value);
            unPackFolder(value);
        },
        'btnSwitch' (event, folder, plist) {
            Editor.log('switch UUID folder ' + folder + ' plist ' + plist);
            switchUUID(folder, plist).then(()=>{
                Editor.log('===== Finished =====');
            })
        }
    },
};