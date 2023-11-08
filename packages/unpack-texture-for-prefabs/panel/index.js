// panel/index.js, this filename needs to match the one registered in package.json
/*eslint-disable */
const fs = require('fs-extra');
const packageUrl = "packages://unpack-textures-modify-prefab";
const UnPack = Editor.require(`${packageUrl}/unpack.js`);
const Support = Editor.require(`${packageUrl}/support.js`);

Editor.Panel.extend({
  // css style for panel
  style: `
    :host { margin: 5px; }
    h2 { color: #f90; }
    #selectFolder { width: 200px; }
    ui-asset {width: 200px;}
    #dragFolder {width: 200px; }
    #projectFolder {width: 200px; }
    input[type=text] { font-size: 18px;}
    .matched { color: #1E8449;  width: 180px; }
    .non-matched-miss { color: #D4AC0D;  }
    .non-matched-dup { color: #D4AC0D; }
    span { padding : 0px, margin: 0px;}
  `,

  // html template for panel
  template: `

    <hr />
    <h2>unpack-textures-modify-prefabs</h2>
    <hr />

    <div><p>Folder</p></div>
    <ui-asset id="projectFolder" type="folder"></ui-asset>
    <hr />

    <ui-button id="btnUnpack_v2">Unpack Textures V2</ui-button>
    <ui-button id="btnReimportAll">Re-Import All</ui-button>
    <ui-button id="btnDebug">Debug</ui-button>
    <ui-button id="btnTest" hidden>TestFunction</ui-button>
    <hr />
    <div><p>Num Plist : <span id="numPlist" value=0>0</span></p></div>
    <hr />
    <div id="output" style="overflow:auto; height:510px;"> </div>

    <br />
    <br />
    <br />
    <span id="labelText"><span>
  `,
  //
  // element and variable binding
  $: {

    labelText: '#labelText',
    projectFolder: '#projectFolder',
    // btnPack_v2: '#btnPack_v2',
    btnUnpack_v2: '#btnUnpack_v2',
    numPlist: '#numPlist',
    output: '#output',
    btn: 'ui-button' ,
    btnReimportAll : '#btnReimportAll',
    btnDebug : '#btnDebug'
  },

  loadPlist(filePack, projectPath, forceUpdateImages = false) {
    return new Promise((resolve, reject) => {
        let isNeedSearchImage = false;
        let plistPaths = [];
        let content = {};
        UnPack.setPlistPaths(plistPaths);
        UnPack.getALlPlistMeta2(projectPath, plistPaths);
        if (!fs.existsSync(filePack)) {
          isNeedSearchImage = true;
          content = {
            "projectPath": projectPath,
            "plistS": [
            ]
          }
        } else {
          content = JSON.parse(fs.readFileSync(filePack));
        }
        
        
        Editor.log('plistPaths ' + plistPaths.length);
        let plistS = [];
        plistPaths.forEach(function (file, index) {
          let shortPath = file.replace(projectPath, '').replace(/\//g, '_').split('.')[0];
          let fileNamePlist = file.split('/').pop().replace('.meta', '') + '.' + shortPath;
          
          Editor.log('Found ' + fileNamePlist);
          if ( !content[fileNamePlist]) {
              isNeedSearchImage = true;
          }
          
          if (file.includes('plist.meta')) {
            let content = JSON.parse(fs.readFileSync(file));
            if (content && content['uuid']) {
              plistS.push({ '__uuid__': content['uuid'] , 'fileName' : fileNamePlist});
            }
          }
          if (index == plistPaths.length - 1) {
            content['plistS'] = plistS;
            fs.writeFileSync(filePack, JSON.stringify(content));
            resolve(isNeedSearchImage || forceUpdateImages);
          }
        });
    });
  },

  reImportAll(isForceUpdate = false) {
    let folderPaths = [];
    let uuidImgDir = {};
    let filePack = this.projectPath + this.projectFile;
    UnPack.getAllFolder(this.projectPath, folderPaths);

    // if (!isNeedSearchImage) {
    //   this.loadUI(filePack);
    // }

      this.loadPlist(filePack, this.projectPath, isForceUpdate)
      .then((isNeedSearchImage) => {
         Editor.log('is Need Searching Images ' + isNeedSearchImage);
         return new Promise((resolve, reject) => {
            if (!isNeedSearchImage) {
                this.loadUI(filePack);
            }
            resolve(isNeedSearchImage);
         });
      })
      .then((isNeedSearchImage)=>{
        if (isNeedSearchImage) {
          return new Promise((resolve, reject) => {
            this.searchImgPlist(filePack, folderPaths, uuidImgDir)
            .then(()=>{
              return this.saveImgsPlist(uuidImgDir, filePack);
            }).then(()=>{
              return this.loadUI(filePack);
            }).
            then(()=>{
              Editor.log('Done Searching Images for Plist');
              this.checkDuplicate();
              resolve(isNeedSearchImage);
            })
            .catch(()=>{
                Editor.log('Load plist Done');
            });
          });
        } else {
          return new Promise((resolve, reject) => {
             this.checkDuplicate();
             resolve(true);
          });
        }
        
      })
      .then(()=>{
         Editor.log('Load plist Done');
      })
      .catch(() => {
          
      });
  },

  saveImgsPlist(uuidImgDir, filePack) {
    let content = JSON.parse(fs.readFileSync(filePack));
    return new Promise((resolve, reject) => {
      let countKey = 0;
      for(let att in uuidImgDir) {
          content[att] = uuidImgDir[att];
          if (countKey == Object.keys(uuidImgDir).length - 1) {
              fs.writeFileSync(filePack, JSON.stringify(content));
              resolve(true);
          }
          countKey++;
      }
    });
  },

  searchImgPlist(filePack, folderPaths, uuidImgDir) {
    let content = JSON.parse(fs.readFileSync(filePack));
    let tasks = [];
    if (content && content['plistS']) {
      const list = content['plistS'];
      list.forEach(item => {
        let task = () => {
           return new Promise((resolve, reject) => {
            Editor.assetdb.queryPathByUuid(item['__uuid__'], (err, path) => {
              let contentPlistMeta = JSON.parse(fs.readFileSync(path + '.meta'));
              UnPack.searchByName(folderPaths, contentPlistMeta, item['fileName'], uuidImgDir);
              resolve(true);
            });
          });
        };
        tasks.push(task);
      });
    }
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

  checkDuplicate() {

    let filePack = this.projectPath + this.projectFile;
    let content = JSON.parse(fs.readFileSync(filePack));
    let plistS = content['plistS'];
    for(let attName in content) {
      if (typeof (content[attName]) == 'object') {
        let plistObj = Support.findUuidOfPlist(attName, plistS);
        if (plistObj) {
          Support.checkDuplicate(content[attName], plistObj, this.projectPath)
          .then(( {listDuplicate, missImages} )=>{
             Editor.log('Done Check Duplicate ' + plistObj['fileName']);
             this.queryID('checkDup' + plistObj['index']).innerText = `Miss:${missImages.length},Duplicate:${listDuplicate.length}`;
             this.queryID('checkPlist' + plistObj['index']).value = {listDuplicate, missImages} ;
           }).catch(()=>{});
        }
      }
    }
  },

  projectFile: '/filePacks.json',
  projectPath: '',
  // method executed when template and styles are successfully loaded and initialized
  ready() {
    Editor.log('Ready');
    UnPack.ready();
    Editor.Ipc.sendToMain('unpack-textures-modify-prefab:ready', (data) => {
     
    });

    this.$btnDebug.addEventListener('confirm', () => {
      UnPack.openDebug();
    });

    this.$btnReimportAll.addEventListener('confirm', () => {
       this.reImportAll(true);
    });

    this.$btnUnpack_v2.addEventListener('confirm', () => {
      let filePack = this.projectPath + this.projectFile;
      UnPack.unPackTexture(filePack, this.projectPath);
    });

    this.$projectFolder.addEventListener('change', () => {
      if (!this.$projectFolder.value) {
        this.$output.innerHTML = '';
        return;
      }
      Editor.assetdb.queryPathByUuid(this.$projectFolder.value, (err, path) => {
        this.projectPath = path;
        this.reImportAll(false);
      });
    });

    this.queryID('btnTest').addEventListener('confirm', () => {
        UnPack.uniTest();
    });

  },

  addEventPngImage(key, content, filePack, curValue, uuidPlist, index) {
    setTimeout(()=>{
      this.queryID(key).curValue = curValue;
      this.queryID(key).uuidPlist = uuidPlist;
      this.queryID(key).addEventListener('change', () => {
        // Editor.log(this.queryID(key).value);
        if (this.queryID(key).value && content && content['plistS']) {
          let list = content['plistS'];
          let res = list.find(item => item['__uuid__'] == this.queryID(key).uuidPlist);
          if (res && res['fileName'] && content && content[res['fileName']]) {
            let found = content[res['fileName']].find(item=> item == this.queryID(key).value);
            if (!found) {
              content[res['fileName']].push(this.queryID(key).value);
              this.queryID(key).curValue = this.queryID(key).value;
              fs.writeFileSync(filePack, JSON.stringify(content));
              this.checkDuplicate();
            } else {
              this.queryID(key).value = null;
              this.queryID(key).curValue = null;
              Editor.log('Folder Added');
            }
          }
        } if (!this.queryID(key).value  && content && content['plistS']) { 
          let list = content['plistS'];
          let res = list.find(item => item['__uuid__'] == this.queryID(key).uuidPlist);
          let curValue = this.queryID(key).curValue;
          if (res && res['fileName'] && content && content[res['fileName']] && this.queryID(key).curValue) {
            let oldList =  content[res['fileName']];
            let newList = [];
            for(let index = 0 ; index < oldList.length ; index++) {
                if (oldList[index] != curValue) {
                   newList.push(oldList[index]);
                }
            }
            content[res['fileName']] = newList;
            this.queryID(key).curValue = null;
            fs.writeFileSync(filePack, JSON.stringify(content));

            const fileName = res['fileName'];
            this.queryID('output' + index).innerHTML = '';
            for (let indexImg = 0; indexImg < newList.length ; indexImg++) {
              let item = newList[indexImg] ;
              let key = 'pngImages' + indexImg + '_' + fileName;;
              let temp2 = `---------<ui-asset id="${key}" type="folder" value=${item} curValue=${item}></ui-asset> <br \> <br \> `;
              this.queryID('output' + index).innerHTML += temp2;
              this.addEventPngImage(key, content, filePack, item, uuidPlist, index);
            }
            Editor.log('Save Done');
            this.queryID('output' + index).numImage = newList.length;

            this.checkDuplicate();
          }
        }
      });
    },100);
   
  },

  savePack() {
  },

  loadUI(filePack, numPlistControl = 0, forceUse = false) {
    let numPlist;
    let content;
    if (fs.existsSync(filePack)) {
      content = JSON.parse(fs.readFileSync(filePack));
      numPlist = content['plistS'].length;
    }
    numPlist = numPlist ? Number(numPlist) : 0;
    if (forceUse) {
      numPlist = Number(numPlistControl);
    }
    this.queryID('numPlist').innerText = numPlist;
    let temp = '';
    for (let index = 0; index < Number(numPlist); index++) {
      temp += `Plist ${index+1}  <ui-asset id="plist${index}" type="sprite-atlas"></ui-asset>  
               <ui-button id="addPlist${index}" value="addPlist${index}" >Add</ui-button>
               <ui-button id="removePlist${index}" value="removePlist${index}" >Delete</ui-button>
               <ui-button id="unPack${index}" value="unPack${index}" >UnPack</ui-button>
               <ui-button id="checkPlist${index}" value="">
                 <span class="non-matched-dup" id="checkDup${index}">Checking...</span>
               </ui-button>
               <br />
               <br />
              <div id="output${index}"></div> 
              <br />
              <br />
              `;
    }
    this.$output.innerHTML = temp;
    temp = '';
    for (let index = 0; index < Number(numPlist); index++) {
      let uuid = '';
      let fileNamePlist = '';
      if (content && content['plistS'] && content['plistS'][index] && content['plistS'][index]['__uuid__']) {
        uuid = content['plistS'][index]['__uuid__'];
        
        this.queryID('plist' + (index)).value = uuid;
        if (content['plistS'][index]['fileName']) {
          const fileName = content['plistS'][index]['fileName'];
          Editor.log('import ' + fileName);
          if (Array.isArray(content[fileName])) {
            // Editor.log(content[fileName]);
            const list = content[fileName];
            this.queryID('output' + index).innerHTML = '';
            this.queryID('output' + index).numImage = list.length;
            list.forEach((item, indexImg) => {
            
              let key = 'pngImages' + indexImg + '_' + fileName;
              let temp2 = `---------<ui-asset id="${key}" type="folder" value=${item} curValue=${item}></ui-asset> <br \> <br \> `;
              this.queryID('output' + index).innerHTML += temp2;
              this.queryID(key).uuidPlist = uuid;
              this.queryID(key).curValue = item;
              this.addEventPngImage(key, content, filePack, item, uuid, index);
              
            })
          }
        }
      }
    

      this.queryID('addPlist' + index).addEventListener('confirm', () => {
        let uuidPlist = this.queryID('plist' + index).value;
        let numImage = 0;
        this.queryID('output' + index).innerHTML = '';
        if (content && content['plistS'] && content['plistS'][index] && content['plistS'][index]['fileName']) {
          const fileName = content['plistS'][index]['fileName'];
          if (Array.isArray(content[fileName])) {
            const list = content[fileName];
            for (let indexImg = 0; indexImg < list.length + 1; indexImg++) {
              let item = list[indexImg] ? list[indexImg] : null;
              let key = 'pngImages' + indexImg + '_' + fileName;;
              let temp2 = `---------<ui-asset id="${key}" type="folder" value=${item} curValue=${item}></ui-asset> <br \> <br \> `;
              this.queryID('output' + index).innerHTML += temp2;
              this.queryID(key).uuidPlist = uuidPlist;
              this.queryID(key).curValue = item;
              this.addEventPngImage(key, content, filePack, item, uuidPlist, index);
            }
            this.queryID('output' + index).numImage = list.length + 1;
            numImage = list.length + 1;
          }
        }

        
      });

      this.queryID('removePlist' + index).addEventListener('confirm', () => {
        let numImage = this.queryID('output' + index).numImage;
        numImage = numImage ? Number(numImage) : 0;
        let uuidPlist = this.queryID('plist' + index).value;

        this.queryID('output' + index).innerHTML = '';
        if (content && content['plistS'] && content['plistS'][index] && content['plistS'][index]['fileName']) {
          const fileName = content['plistS'][index]['fileName'];
          let newList = [];
          if (Array.isArray(content[fileName])) {
            // Editor.log(content[fileName]);
            const list = content[fileName];
            for (let indexImg = 0; indexImg < numImage - 1; indexImg++) {
              let item = list[indexImg] ? list[indexImg] : "";
              let key = 'pngImages' + indexImg + '_' + fileName;;
              let temp2 = `---------<ui-asset id="${key}" type="folder" value=${item} curValue=${item}></ui-asset> <br \> <br \> `;
              this.queryID('output' + index).innerHTML += temp2;
              this.queryID(key).uuidPlist = uuidPlist;
              this.queryID(key).curValue = item;
              this.addEventPngImage(key, content, filePack, item, uuidPlist, index);
              newList.push(item);
            }

            content[fileName] = newList;
            fs.writeFileSync(filePack, JSON.stringify(content));
            Editor.log('Save Done');
            this.queryID('output' + index).numImage = numImage - 1;
            this.checkDuplicate();
          }
        }
      });

      this.queryID('checkPlist' + index).addEventListener('confirm', () => {
         const {listDuplicate, missImages}  = this.queryID('checkPlist' + index).value;
         if (listDuplicate) {
            listDuplicate.forEach(item => {
              Editor.log(item['image'] + ' duplicate in ' + JSON.stringify(item['folderDup']));
            });
         } 
         if (missImages) {
             missImages.forEach(item => {
              Editor.log('Miss ' + item);
            });
         }
         
      });

      this.queryID('unPack' + index).addEventListener('confirm', () => {
        if (content && content['plistS'] && content['plistS'][index] && content['plistS'][index]['fileName']) {
          const fileName = content['plistS'][index]['fileName'];
          if (Array.isArray(content[fileName])) {
            let shortList = [];
            shortList.push(content['plistS'][index]);
            let filePack = this.projectPath + this.projectFile;
            UnPack.unPackTexture(filePack, this.projectPath, shortList);
          }
        }
        
     });


    }
  },
  // register your ipc messages here
  messages: {
    'pack-textures:hello'(event) {
      this.$label.innerText = ` <hr />
      <h2>pack-textures - plist 2 prefabs</h2>
      <hr />`;
    }
  }
});