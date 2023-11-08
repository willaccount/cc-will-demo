/* global onFirstSceneLaunched */

cc.Class({
    extends: cc.Component,

    update()
    {
        const globalState = require('globalState');
        const firstSceneLoad = globalState.getStatusFirstSceneLoad();
        if (firstSceneLoad && typeof (onFirstSceneLaunched) === 'function') {
            this.node.runAction(
                cc.sequence(
                    cc.delayTime(1.0),
                    cc.callFunc(() => {
                        onFirstSceneLaunched();
                    })));
            globalState.setStatusFirstSceneLoad(false);
        }
    },
});
