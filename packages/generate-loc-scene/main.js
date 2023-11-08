const fs = require('fs');
const fsExtra = require('fs-extra');
const { result } = require('lodash');
const Path = require('path');
const defaultLanguage = 'VI-VND';

let generate_log = {
  defaultLanguage: defaultLanguage,
  localizationAssets: [],
  relatedRefs: [],
  mappingPairs: [],
  scenes: [],
  prefabRefs: []
};

let output = {};

var languageList = [];
var dataFolderPath = '';
var dataFolderUrl = '';
var gameFolderPath = ''
var gameFolderUrl = '';
var locFolderPath = '';
var overrideScene = false;
var fromLanguage = defaultLanguage;

function writeLog() {
  const outputPath = Path.join(locFolderPath, 'log.json');
  Editor.log(`Write output log ${outputPath}`)
  fsExtra.writeJSONSync(outputPath, generate_log);
}

function queryAssets(pattern, type) {
  return new Promise((resolve, reject) => {
      Editor.assetdb.queryAssets(pattern, type, (err, results) => {
          if (err) reject(err);
          resolve(results);
      });
  });
}

function refreshAssets(path = "db://assets/gameModule/Localization/generated") {
  Editor.log(`Refresh ${path}`)
    return new Promise((resolve, reject) => {
        Editor.assetdb.refresh(path, function (err, results) {
            resolve();
        });
    });
}

function copyLocalizationData(folderPath, isLocFolder=false) {
  var result = [];
  Editor.log(`Read folder ${folderPath}`);
  fsExtra.readdirSync(folderPath).forEach(it => {

    const itemPath = Path.join(folderPath, it);
    const stat = fsExtra.statSync(itemPath);

    if (it.indexOf('.git') >= 0) return;

    if (stat.isDirectory()) {
      result = result.concat(copyLocalizationData(itemPath, (it.indexOf('L10N') >= 0)));
      return;
    }

    const isLocalization = (isLocFolder || it.indexOf('L10N') >= 0);
    const isMappingFile = (it.indexOf('.png') >= 0 || it.indexOf('.jpeg') >= 0 || it.indexOf('.jpg') >= 0 
                          || it.indexOf('.plist') >= 0 || it.indexOf('.json') >=0  || it.indexOf('.prefab') >= 0);
    if (isLocalization && it.indexOf('.meta') < 0) {
      const relativePath = itemPath.replace(dataFolderPath, '');
      let item = null;
      if (isMappingFile) {
        item = {};
        item.name = Path.basename(it);
        item.type = Path.extname(it);
        item.relativePath = relativePath;
        item[`${fromLanguage}-url`] = itemPath;
      }
      languageList.forEach(lang => {
        const locPath = Path.join(locFolderPath, lang, relativePath);
        if (!fsExtra.existsSync(locPath)) {
          fsExtra.ensureDirSync(Path.dirname(locPath));
          fsExtra.copySync(itemPath, locPath);
        }
        if (item) item[`${lang}-url`] = locPath;        
      });

      item && result.push(item);
    }
  });
  return result;
}

function getMappingData() {
  Editor.log('getMappingList');
  generate_log.localizationAssets.forEach(asset => {
    languageList.concat(fromLanguage).forEach(lang => {
      asset[`uuid-${lang}`] = {};
      const json = fsExtra.readJSONSync(asset[`${lang}-url`] + '.meta');
      if (asset.type === '.png' || asset.type === '.jpeg' || asset.type === '.jpg' || asset.type === '.plist') {
        if (json.subMetas) {
          Object.keys(json.subMetas).forEach(key => {
            asset[`uuid-${lang}`][key] = json.subMetas[key].uuid;
          })
        }
      }
      else if (asset.type === '.json') {
        asset[`uuid-${lang}`] = json.uuid;
      }
    })
  })
}

function generateMappingPairs() {
  var result = [];
  generate_log.localizationAssets.forEach(asset => {
    const defaultValue = asset[`uuid-${fromLanguage}`];
    if (typeof defaultValue === 'string') {
      let item = {};
      languageList.concat(fromLanguage).forEach(lang=>{
        item[lang] = asset[`uuid-${lang}`];
      })

      result.push(item);
    }
    else if (typeof defaultValue === 'object') {
      Object.keys(defaultValue).forEach(it => {
        let item = {};
        languageList.concat(fromLanguage).forEach(lang=>{
          item[lang] = asset[`uuid-${lang}`][it];
        })
        result.push(item);
      })
    }
  })
  generate_log.mappingPairs = result;
}

function isRelatedAsset(path) {
  const meta = fsExtra.readFileSync(path).toString();
  for (let i=0; i<generate_log.mappingPairs.length; i++) {
    var asset = generate_log.mappingPairs[i];
    if (meta.indexOf(asset[`${fromLanguage}`]) >= 0) {
      return true;
    }
  }
  return false;
}

function isNestedAsset(path) {
  const meta = fsExtra.readFileSync(path).toString();
  for (let i=0; i<generate_log.relatedRefs.length; i++) {
    var asset = generate_log.relatedRefs[i];
    if (meta.indexOf(asset[`uuid-${fromLanguage}`]) >= 0) {
      return true;
    }
  }
  return false;
}

async function copyRelatedRefs() {
  Editor.log(`copyRelatedRefs`);
  let assets = await queryAssets(gameFolderUrl + "/**/*.*", ["prefab", "animation-clip"]);
  assets.forEach(asset => {
    if (isRelatedAsset(asset.path) && !isExcludeData(asset.path)) {
      var relativePath = asset.path;
      relativePath = relativePath.replace(locFolderPath + '/' + fromLanguage, '');
      relativePath = relativePath.replace(gameFolderPath, '');

      var item = {
        name: Path.basename(asset.path),
        type: Path.extname(asset.path),
        relativePath
      }
      item[`${fromLanguage}-url`] = asset.path;
      languageList.forEach(lang => {
        const assetPath = Path.join(locFolderPath, lang, relativePath);
        if (!fsExtra.existsSync(assetPath)) {
          fsExtra.copySync(asset.path, assetPath);
        }
        item[`${lang}-url`] = assetPath;
      })
      generate_log.relatedRefs.push(item);
      Editor.log(`Total Items: ${generate_log.relatedRefs.length}`);
    }
  })
}

function isCopiedRelatedAssets(path) {
  for (let i=0; i<generate_log.relatedRefs.length; i++) {
    var asset = generate_log.relatedRefs[i];
    if (asset.relativePath === path) {
      return true;
    }
  }
  return false;
}

async function copyNestedRefs() {
  Editor.log('copyNestedRefs =========================');
  let assets = await queryAssets(gameFolderUrl + "/**/*.*", ["prefab"]);
  assets.forEach(asset => {
    Editor.log('check nested refs ' + asset.path);
    if (isNestedAsset(asset.path) && !isExcludeData(asset.path) < 0) {
      const relativePath = asset.path.replace(gameFolderPath, '');
      if (!isCopiedRelatedAssets(relativePath)) {
        var item = {
          name: Path.basename(asset.path),
          type: Path.extname(asset.path),
          relativePath
        }
        item[`${fromLanguage}-url`] = asset.path;
  
        languageList.forEach(lang => {
          const assetPath = Path.join(locFolderPath, lang, relativePath);
          Editor.log(`check if ${assetPath}`);
          if (!fsExtra.existsSync(assetPath)) {
            fsExtra.copySync(asset.path, assetPath);
          }
          item[`${lang}-url`] = assetPath;
        })
        generate_log.relatedRefs.push(item);
        Editor.log(`Total Items: ${generate_log.relatedRefs.length}`);
      }
    }
  });
}

function getRelatedRefsUUID() {
  Editor.log(`getRelatedRefsUUID`);
  generate_log.relatedRefs.forEach(asset => {
    var item = {};
    languageList.concat(fromLanguage).forEach(lang => {
      const meta = asset[`${lang}-url`] + '.meta';
      Editor.log(`Read ${meta}`);
      const json = fsExtra.readJSONSync(meta);
      asset[`uuid-${lang}`] = json.uuid;
      item[`${lang}`] = json.uuid;
    })
    generate_log.mappingPairs.push(item);

  })
}

function mappingRelatedAssets() {
  Editor.log(`mappingRelatedAssets`);
  generate_log.relatedRefs.forEach(asset => {
    var item = {};
    languageList.forEach(lang => {
      var fileUrl = asset[`${lang}-url`];
      Editor.log(`Read ${fileUrl}`);
      var fileStr = fsExtra.readFileSync(fileUrl).toString();
      generate_log.mappingPairs.forEach(it => {
        const oldUUID = it[fromLanguage];
        const newUUID = it[lang];
        const regex = new RegExp(`${oldUUID}`, 'g');
        fileStr = fileStr.replace(regex, newUUID);
      });
      Editor.log(`Write ${fileUrl}`);
      fsExtra.writeFileSync(fileUrl, fileStr);
    })
  })
}

function findNodeInScene(scene, nodeId) {
  for (let i=0; i<scene.length; i++) {
    if (scene[i]._id === nodeId) {
      return scene[i];
    }
  }
  return null;
}

async function generateScenes() {
  Editor.log('generateScenes')
  let transformLock = null;
  let scenes = await queryAssets(gameFolderUrl + "/**/*.*", ["scene"]);
  if (fsExtra.existsSync(Path.join(locFolderPath, 'transform-lock.json'))) {
    Editor.log('transform-lock.json exists');
    transformLock = fsExtra.readJSONSync(Path.join(locFolderPath, 'transform-lock.json'));
    Editor.log('transformLock: ' + transformLock);
    if (transformLock.fontMapping) {
      generate_log.mappingPairs = generate_log.mappingPairs.concat(transformLock.fontMapping);
    }
  }
  Editor.log('scenes: ========================================== ' + scenes.length);
  scenes.forEach(scene => {
    Editor.log('clone scene ' + scene.path);

    if (!isExcludeData(scene.path)) {
      Editor.log(`Open scene ${scene.path}`)
      const sceneStr = fsExtra.readFileSync(scene.path).toString();
      const sceneName = Path.basename(scene.path, Path.extname(scene.path));
      languageList.forEach(lang => {
        var newScene = JSON.parse(sceneStr);
        const newPath = Path.join(locFolderPath, lang, `${sceneName.split('-')[0]}-${lang}.fire`);
        if (fsExtra.existsSync(newPath)) {
          if (overrideScene) {
            Editor.log('Override Scene');
            let oldScene = fsExtra.readJSONSync(newPath);
            transformLock.nodes.forEach(it => {
              Editor.log('Keep transform for ' + it);
              let oldNode = findNodeInScene(oldScene, it);
              let newNode = findNodeInScene(newScene, it);
              if (newNode && oldNode) {
                Editor.log('Update old transform for ' + it);
                newNode._position = oldNode._position;
                newNode._rotation = oldNode._rotation;
                newNode._scale = oldNode._scale;
              }
            })
          }
          else {
            newScene = fsExtra.readJSONSync(newPath);
          }
        }
        newScene = JSON.stringify(newScene);
        generate_log.mappingPairs.forEach(it => {
          const oldUUID = it[fromLanguage];
          const newUUID = it[lang];
          const regex = new RegExp(`${oldUUID}`, 'g');
          newScene = newScene.replace(regex, newUUID);
        });
        Editor.log(`Rewrite scene ${newPath}`)
        fsExtra.writeFileSync(newPath, newScene);
      })
    }
  })
}

function isExcludeData(dataPath) {
  if (fromLanguage === defaultLanguage) {
    return dataPath.indexOf('Localization') >= 0;
  }
  else {
    return dataPath.indexOf(fromLanguage) < 0;
  }
}

async function generateLocalization(data) {
  Editor.log('Start generating...');

  input = {
    defaultLanguage: defaultLanguage,
    assets: [],
    refs: [],
    scenes: []
  };

  dataFolderPath = data.dataFolderInfo.path;
  dataFolderUrl = data.dataFolderInfo.url;
  gameFolderPath = data.mainFolderInfo.path;
  gameFolderUrl = data.mainFolderInfo.url;
  languageList = data.languageList;
  overrideScene = data.isOverride;
  fromLanguage = data.fromLanguage;

  Editor.log('Generate localize with language list ' + languageList);
  Editor.log('is Override ' + overrideScene);

  languageList = languageList.filter(it => it !== fromLanguage);
  locFolderPath = gameFolderPath + '/Localization';
  locFolderUrl = gameFolderUrl + '/Localization';
  if (fromLanguage !== defaultLanguage) {
    Editor.log('Generate localization from ' + fromLanguage);
    dataFolderPath = locFolderPath + '/' + fromLanguage;
  }
  
  let locFolderExists = fsExtra.existsSync(locFolderPath + '.meta');
  generate_log.localizationAssets = copyLocalizationData(dataFolderPath);
  await refreshAssets(locFolderExists ? locFolderUrl : gameFolderUrl);

  getMappingData();
  generateMappingPairs();

  //copy related assets prefab, animation-clip
  copyRelatedRefs();
  await refreshAssets(locFolderExists ? locFolderUrl : gameFolderUrl);
  getRelatedRefsUUID();

  //copy nested assets prefab in prefab
  copyNestedRefs();
  await refreshAssets(locFolderExists ? locFolderUrl : gameFolderUrl);
  getRelatedRefsUUID();

  //mapping generated mapping pairs
  mappingRelatedAssets();
  generateScenes();
  writeLog();
  await refreshAssets(locFolderExists ? locFolderUrl : gameFolderUrl);
}

module.exports = {
  load() {},

  unload() {},

  messages: {
    'open'() {
      Editor.Panel.open('generate-loc-scene');
    },
    'say-hello'() {
      Editor.log('Hello World!');
      Editor.Ipc.sendToPanel('generate-loc-scene', 'generate-loc-scene:hello');
    },
    'generate'(event, data) {
      try {
        generateLocalization(data);
      }
      catch(e) {
        Editor.log(e);
      }
    }
  },
};