/* eslint-disable */
// panel/index.js, this filename needs to match the one registered in package.json
Editor.Panel.extend({
    // css style for panel
    style: `
    :host { margin: 5px; }
    h2 { color: #f90; }
    #selectFolder { width: 200px; }
    #dragFolder {width: 200px; }
    #texturesPath {width: 200px; }
    #plistPath {width: 200px; }
  `,

    // html template for panel
    template: `
    <h2>pack-textures</h2>
    <hr />
    <div><p>Pack Folder</p></div>
    <br>
    <ui-asset id="dragFolder" type="folder"></ui-asset>
    <br>
    <p id="compressText">Compress Level: 7</p>
    <input id="compressLevel" type="range" min="1" max="7" step="1" value="7"></input>
    <br>
    <p id="type">Texture Type: </p>
    <ui-select id="textureType" value="png">
      <option value="png8">png8</option>
      <option value="png">png</option>
    </ui-select>
    <span>Force Squared : <input id="forceSquared" type="checkbox" value="" ></span>
    <br><br>
    <ui-button id="btnPack">Pack Textures</ui-button>
    <ui-button id="btnUnpack">Unpack Textures</ui-button>
    <hr />
    <p>Map UUID</p>
    <br>
    <div><ui-asset id="texturesPath" type="folder"></ui-asset>
    <ui-asset id="plistPath"></ui-asset></div>
    <br>
    <ui-button id="btnSwitch">Switch UUID</ui-button>
  `,
    //
    // element and variable binding
    $: {
        btnPack: '#btnPack',
        btnUnpack: '#btnUnpack',
        dragFolder: '#dragFolder',
        compressLevel: '#compressLevel',
        compressText: '#compressText',
        textureType: '#textureType',
        texturesPath: '#texturesPath',
        plistPath: '#plistPath',
        btnSwitch: '#btnSwitch',
        forceSquared: '#forceSquared',
    },

    // method executed when template and styles are successfully loaded and initialized
    ready () {
        Editor.Ipc.sendToMain('pack-textures:ready', (data) =>{
        
        });

        this.$btnPack.addEventListener('confirm', () => {
            Editor.assetdb.queryPathByUuid(this.$dragFolder.value,(err, path)=>{
                let compressLevel = this.$compressLevel.value;
                let textureType = this.$textureType.value;
                let squared = this.$forceSquared.checked ? ' --force-squared' : '';
                Editor.Ipc.sendToMain('pack-textures:onPackClick', path, compressLevel, textureType, squared);
            });
        });

        this.$btnUnpack.addEventListener('confirm', () => {
            Editor.assetdb.queryPathByUuid(this.$dragFolder.value,(err, path)=>{
                Editor.Ipc.sendToMain('pack-textures:onUnpackClick', path);
            });
        });

        this.$compressLevel.oninput = (value)=>{
            this.$compressText.innerHTML = "Compress Level: " + this.$compressLevel.value;
        };

        this.$btnSwitch.addEventListener('confirm', ()=>{
          Editor.assetdb.queryPathByUuid(this.$texturesPath.value, (err, folder)=>{
              Editor.assetdb.queryPathByUuid(this.$plistPath.value, (err, plist)=>{
                  Editor.Ipc.sendToMain('pack-textures:btnSwitch', folder, plist);
              })
          })
      });
    },

    // register your ipc messages here
    messages: {
        'pack-textures:hello' (event) {
            this.$label.innerText = 'Hello!';
        }
    }
});