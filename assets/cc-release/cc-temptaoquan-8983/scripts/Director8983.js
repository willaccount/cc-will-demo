cc.Class({
    extends: require('Director'),

    newGameMode({ name, data }, callback) {
        this._super({ name, data }, callback);

        if(this[name]) {
            switch (name) {
                case 'normalGame':
                    this.gui.emit('SHOW_GUI_NORMAL_GAME_MODE');
                    break;
                case 'freeGame':
                    this.gui.emit('SHOW_GUI_FREE_GAME_MODE');
                    break;
            }
        }
    },

    resumeGameMode({ name }, callback) {
        this._super({ name }, callback);

        if(this[name]) {
            switch (name) {
                case 'normalGame':
                    this.gui.emit('SHOW_GUI_NORMAL_GAME_MODE');
                    break;
                case 'freeGame':
                    this.gui.emit('SHOW_GUI_FREE_GAME_MODE');
                    break;
            }
        }
    },
});