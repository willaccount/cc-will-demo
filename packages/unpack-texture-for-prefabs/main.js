'use strict';


module.exports = {
    load () {
    // execute when package loaded
    },

    unload () {
    // execute when package unloaded
    },

    reload() {
        Editor.Package.reload('unpack-textures-modify-prefab');
        Editor.log("===========Reload pack-textures===========");
    },
    // register your ipc messages here
    messages: {
        'open' () {
            // open entry panel registered in package.json
            Editor.Panel.open('unpack-textures-modify-prefab');
        },
        'ready' (event) {
           
        },
        'onPackClick' () {
            
        },
        'onUnpackClick' (event, value) {

        }
    },
};