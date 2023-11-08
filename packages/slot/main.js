/* global Editor */
//'use strict';
const fs = require('fs');
const path = require('path');

// history scene
const historyScene = 'db20e681-1471-470d-8cd8-acfcd8481f5c';
const historyScript = 'c052e2a9-c0d2-45d3-b166-bc801a8dc134';
const historyPrefab = {
    HistoryPrefab: {
        uuid: '8927ff7d-bdfa-4a6f-adcd-b9c46e3965a3',
        script: 'HistoryPrefab'
    },
};

// loading scene
const loadingScene = '571cbb50-fd09-41b6-a1b9-d3b6457a093e';
// slot base
const baseScene = 'd59f9dc0-d0c9-443a-99f9-ab14a45c09d5';
const baseScript = {
    Director: '34c4b874-dfe0-41cb-b1ee-3a06baf48367',
    DataStore: '50ca3dd7-238a-4cb3-b255-97c679e61d41',
    Config: 'c2785752-dca0-46da-b0ad-c8675241dd8c',
    SlotGameDirector: '3248bc57-7dc0-4ab9-a511-25589c7abc52',
    SlotGameWriter: '3806d3f9-bde1-4356-b450-0c1d81d67f63',
    MiniBaseDirector: 'bd02ea0a-d1da-46ed-a5c9-00734dbaec93',
    MiniBaseWriter: 'ba206dbf-507e-4e78-8ef5-9041cbbbda49',
    MiniBaseTable: '59c7a8cb-a1ea-4508-a7d5-dc941edc9c36',
    GameModeBasic: '4e10c344-84a9-4065-ad32-53e79421aa42',
    SlotSoundPlayer: 'e15f829a-4f30-42c8-9fbe-faee9263f53c',
    SlotTable: '4ad9cad2-88a9-43a1-b0bf-50726e4d3ca1',
    SlotTableNearwinEffect: '5bdb8a57-3c85-4dc8-9b90-6ee3c6d698a9',
    NearWinTable: '2190b7cd-4a77-4f49-9d66-0194205d2ccb',
    SlotTableSoundEffect: '2c10c4f5-4d93-4beb-a68d-0eec11f23d3f',
    SlotTablePayline: '76bdc591-588b-4ec7-b6a3-c934d9238197',
    SlotSymbol: '593facb9-624c-415e-aa70-ad5700597913',
    SlotButton: '7f9b4c2c-0da5-4301-a5f1-6ab7510d1350',
    WinEffect: '967304dd-4b02-475a-b3e8-2f445d207795',
    JackpotWin: 'ba155ca1-4f4b-4682-ac46-1720c9be1ec2',
    SlotSymbolPayline: 'dc9f8e1f-ac68-45dc-8cd9-58e7f048baf0',
    SlotReel: '95fa9eb5-39e3-43b0-9354-b66307c0333a',
};
const basePrefab = {
    SlotReel: {
        uuid: '031fedae-1c25-42a7-9d93-1413cb346ea5',
        script: 'SlotReel'
    },
    SlotSymbol: {
        uuid: '2422082f-4397-41f3-b7e4-95243cb62941',
        script: 'SlotSymbol'
    },
    SlotSymbolPayline: {
        uuid: '66fed221-368b-47dc-92e6-d89eeea2a12a',
        script: 'SlotSymbolPayline'
    }
};

const baseJson = {
    version: {
        uuid: '3a2eff79-4396-4d9e-820f-2252b7cb5f32',
        script: 'Version',
        havingGameId: false
    },
    TutorialData: {
        uuid: '5a6bdfb7-bafd-4a5d-9825-8058ec40d2cc',
        script: 'TutorialData',
        havingGameId: true
    },
    TutorialStep: {
        uuid: '04fb1b6d-b836-4080-acf3-72be33df120b',
        script: 'TutorialStep',
        havingGameId: true
    },
    TutorialText: {
        uuid: 'd6be3b7f-59ff-4a42-a3d6-d0fa3ddade2b',
        script: 'TutorialText',
        havingGameId: true
    }
};

const readCodeFromFile = function (path) {
    let fileContent = fs.readFileSync(path).toString();
    let fileCodeBegin = fileContent.indexOf('cc._RF.push');
    let fileCodeEnd = fileContent.indexOf(')', fileCodeBegin + 1);
    let codeString = fileContent.substring(fileCodeBegin, fileCodeEnd);
    let code = codeString.split(',')[1].replace(/'/g, '').replace(/ /g, '');
    return code;
};

const cloneProject = function (gameId, projectPath) {
    const listScript = Object.keys(baseScript);
    const listPrefab = Object.keys(basePrefab);
    const rootPath = Editor.Project.path;
    let baseSceneUrl = Editor.assetdb.uuidToFspath(baseScene);
    let sceneString = fs.readFileSync(baseSceneUrl).toString();
    sceneString = sceneString.split('9000').join(gameId);
    let sceneDest = `db://assets/${projectPath}/g${gameId}L.fire`;
    let newScriptCode = {};
    let oldScriptCode = {};

    const listHistoryScript = Object.keys(historyScript);
    const listHistoryPrefab = Object.keys(historyPrefab);
    let historySceneUrl = Editor.assetdb.uuidToFspath(historyScene);
    let historySceneString = fs.readFileSync(historySceneUrl).toString();

    Editor.log('============ Copy Base Script =============');
    listScript.forEach(it => {
        let uuid = baseScript[it];
        let fsPath = Editor.assetdb.uuidToFspath(uuid);
        let url = Editor.assetdb.uuidToUrl(uuid).replace('db://', '');
        let fileName = path.basename(fsPath, '.js');
        let dest = `db://assets/${projectPath}/${it}${gameId}.js`;
        let destString = dest.replace('db://', '');
        let content = `cc.Class({
    extends: require('${fileName}'),
});`;
        if (fileName === 'Config9000') {
            let configContent = fs.readFileSync(rootPath + '/' + url).toString();
            configContent = configContent.split('9977').join(gameId);
            configContent = configContent.split('MGEAR_JP').join(gameId);
            content = configContent;
        }
        Editor.assetdb.create(dest, content, () => {
            setTimeout(() => {
                let code = readCodeFromFile(`${rootPath}/temp/quick-scripts/${url}`);
                let newCode = readCodeFromFile(`${rootPath}/temp/quick-scripts/${destString}`);
                oldScriptCode[it] = code;
                newScriptCode[it] = newCode;
                sceneString = sceneString.split(code).join(newCode);
                if (it.includes('DataStore') || it.includes('Config')) {
                    historySceneString = historySceneString.split(code).join(newCode);
                }
            }, 1000);
        });
    });
    const listJsons = Object.keys(baseJson);
    listJsons.forEach(it => {
        let uuid = baseJson[it].uuid;
        let path = Editor.assetdb.uuidToFspath(uuid);
        let content = fs.readFileSync(path).toString();
        let dest = `db://assets/${projectPath}/${it}${baseJson[it].havingGameId ? gameId : ''}.json`;
        Editor.assetdb.create(dest, content, (err, results) => {
            let code = uuid;
            let newCode = results[0].uuid;
            sceneString = sceneString.split(code).join(newCode);
        });
    });

    setTimeout(() => {
        Editor.log('============ Copy Base Prefab =============');
        listPrefab.forEach(it => {
            let uuid = basePrefab[it].uuid;
            let path = Editor.assetdb.uuidToFspath(uuid);
            let content = fs.readFileSync(path).toString();

            if (oldScriptCode.hasOwnProperty(it)) {
                content = content.split(oldScriptCode[it]).join(newScriptCode[it]);
            }
            let dest = `db://assets/${projectPath}/${it}${gameId}.prefab`;
            Editor.assetdb.create(dest, content, (err, results) => {
                let newUUID = results[0].uuid;
                sceneString = sceneString.split(uuid).join(newUUID);
            });
        });
    }, 10000);

    setTimeout(()=>{
        Editor.assetdb.create(sceneDest, sceneString, ()=>{
            Editor.log('============ Done Base Scene =============');
        });
    }, 15000);
    // historyScript

    Editor.log('============ Copy History Script =============');
    listHistoryScript.forEach(it => {
        // let uuid = historyScript[it];
        // let url = Editor.assetdb.uuidToUrl(uuid).replace('db://', '');
        // let dest = `db://assets/${projectPath}/${it}${gameId}.js`;
        // let destString = dest.replace('db://', '');
        // let code = readCodeFromFile(`${rootPath}/temp/quick-scripts/${url}`);
        // let newCode = readCodeFromFile(`${rootPath}/temp/quick-scripts/${destString}`);
        // historySceneString = historySceneString.split(code).join(newCode);
    });

    setTimeout(() => {
        Editor.log('============ Copy History Prefab =============');
        listHistoryPrefab.forEach(it => {
            let uuid = historyPrefab[it].uuid;
            let path = Editor.assetdb.uuidToFspath(uuid);
            let content = fs.readFileSync(path).toString();

            let dest = `db://assets/${projectPath}/${it}${gameId}.prefab`;
            Editor.assetdb.create(dest, content, (err, results) => {
                let newUUID = results[0].uuid;
                historySceneString = historySceneString.split(uuid).join(newUUID);
                Editor.log('onCreate prefab ' + JSON.stringify(results));
            });
        });
    }, 10000);

    let sceneHistoryDest = `db://assets/${projectPath}/g${gameId}H.fire`;
    setTimeout(()=>{
        Editor.assetdb.create(sceneHistoryDest, historySceneString, ()=>{
            Editor.log('============ Done History Scene =============');
        });
    }, 15000);

    let loadingSceneUrl = Editor.assetdb.uuidToFspath(loadingScene);
    let loadingSceneString = fs.readFileSync(loadingSceneUrl).toString();
    loadingSceneString = loadingSceneString.split('9000').join(gameId);
    let loadingSceneDest = `db://assets/${projectPath}/g${gameId}.fire`;
    setTimeout(()=>{
        Editor.assetdb.create(loadingSceneDest, loadingSceneString, ()=>{
            Editor.log('============ Done History Scene =============');
            Editor.log('============ All Finished!! =============');
        });
    }, 20000);
};

module.exports = {
    load() {
        // execute when package loaded
    },

    unload() {
        // execute when package unloaded
    },

    // register your ipc messages here
    messages: {
        /*'open' () {
          // open entry panel registered in package.json
          Editor.Panel.open('slot');
        },
        'say-hello' () {
          Editor.log('Hello World!');
          // send ipc message to panel
          Editor.Ipc.sendToPanel('slot', 'slot:hello');
        },*/
        'open-menu'() {
            Editor.Panel.open('slot');
        },
        'clone'(target, gameId, path) {
            cloneProject(gameId, path);
        }
    },
};