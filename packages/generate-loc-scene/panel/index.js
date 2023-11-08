const fsExtra = require('fs-extra');
const Path = require('path');
const SUPPORTED_LANGUAGE = ['EN-USD', 'TH-USD'];

function queryAssetsInfoByUUID(uuid) {
  return new Promise((resolve, reject) => {
      Editor.assetdb.queryInfoByUuid(Editor.Utils.UuidUtils.decompressUuid(uuid), function (err, result) {
          if (err) reject(err);
          resolve(result);
      });
  });
}

async function detectDataFolder(mainFolder, dataFolder) {
  Editor.log('Detect Loc Folder');
  const mainFolderPath = await getPathByUUID(mainFolder.value);
  const dataFolderPath = Path.join(mainFolderPath, 'data');

  if (fsExtra.existsSync(dataFolderPath)) {
    Editor.log(`Detected loc folder at: ${dataFolderPath}`);
    const dataFolderMeta = fsExtra.readJSONSync(dataFolderPath + '.meta');
    dataFolder.value = dataFolderMeta.uuid;
    //detectLanguage(dataFolder);
    Editor.log(`List supported language ${SUPPORTED_LANGUAGE}`);
  }
  else {
    Editor.log('Cant detect data folder, please drag it manually');
  }
}

/*async function detectLanguage(dataFolder) {
  languageList = [];
  const dataFolderPath = await getPathByUUID(dataFolder.value);
  const childFolder = fsExtra.readdirSync(dataFolderPath);
  childFolder.forEach(it => {
    let stat = fsExtra.statSync(Path.join(dataFolderPath,it));
    if (stat.isDirectory() && SUPPORTED_LANGUAGE.indexOf(it) >= 0) {
      languageList.push(it);
    }
  })
  Editor.log(`Detect language: ${languageList}`);
}*/

async function sendRequestGenerate(mainFolderUUID, dataFolderUUID, languageList, fromLanguage) {
    const mainFolderInfo = await queryAssetsInfoByUUID(mainFolderUUID);
    const dataFolderInfo = await queryAssetsInfoByUUID(dataFolderUUID);
    Editor.Ipc.sendToMain('generate-loc-scene:generate', {mainFolderInfo, dataFolderInfo, languageList, isOverride: true, fromLanguage});
}

function getUUIDByPath(url) {
  return new Promise((resolve, reject) => {
      Editor.assetdb.queryUuidByUrl(url, function (err, uuid) {
          if (err) {
            Editor.log(err);
            reject(err);
          }
          resolve(uuid);
      });
  });
}

function getPathByUUID(uuid) {
  return new Promise((resolve, reject)=>{
    Editor.assetdb.queryPathByUuid(uuid, (err, folder)=>{
      if (err) {
        reject(err);
      }
      resolve(folder);
    });
  })
}

Editor.Panel.extend({
  // css style for panel
  style: `
    :host { margin: 5px; }
    h2 { color: #f90; }
    #mainFolder {width: 200px; }
    #dataFolder {width: 200px; }
  `,

  // html template for panel
  template: `
    <h2>generate-loc-scene</h2>
    <hr />
    </br>
    <span id="label">Game Folder</span>
    <ui-asset id="mainFolder" type="folder"></ui-asset>
    <span id="label">Data Folder</span>
    <ui-asset id="dataFolder" type="folder"></ui-asset>
    </br></br>
    <ui-checkbox id="en-usd" checked></ui-checkbox>
    <span id="label">EN-USD</span>
    <ui-checkbox id="th-usd" checked></ui-checkbox>
    <span id="label">TH-USD</span>
    <hr />
    <span id="label">Clone From</span>
    <ui-select id="fromLanguage">
      <option value="VI-VND">VI-VND</option>
      <option value="EN-USD">EN-USD</option>
    </ui-select>
    <hr />
    <div>State: <span id="label">--</span></div>
    <hr />
    <ui-button id="btn">Generate</ui-button>
  `,

  // element and variable binding
  $: {
    btn: '#btn',
    label: '#label',
    mainFolder: '#mainFolder',
    dataFolder: '#dataFolder',
    en_usd: '#en-usd',
    th_usd: '#th-usd',
    fromLanguage: '#fromLanguage'
  },

  // method executed when template and styles are successfully loaded and initialized
  async ready () {
    this.$btn.addEventListener('confirm', ()=>{
      var languageList = [this.$en_usd.checked ? 'EN-USD' : '', this.$th_usd.checked ? 'TH-USD' : ''];
      languageList = languageList.filter(it => it != ''); // remove empty string
      Editor.log(`Generate Loc Scene: ${languageList}`);
      sendRequestGenerate(this.$mainFolder.value, this.$dataFolder.value, languageList, this.$fromLanguage.value);
    });
    this.$mainFolder.addEventListener('change', ()=>{
      Editor.log(this.$mainFolder.value);
      detectDataFolder(this.$mainFolder, this.$dataFolder);
    })

    this.$dataFolder.addEventListener('change', ()=>{
      detectLanguage(this.$dataFolder);
    })
  },

  // register your ipc messages here
  messages: {
    'generate-loc-scene:hello' (event) {
      this.$label.innerText = 'Hello!';
    }
  }
});