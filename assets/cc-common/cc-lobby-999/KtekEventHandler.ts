// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class KtekEventHandler extends cc.Component {
    static instance: KtekEventHandler = null;

    receiveKtekCallback = null; //message send from KTEK
    receiveOurCallback = null; //message send from us
    joinRoomData = null;

    static staticJoinRoomData = null;

    onLoad() {
        if (KtekEventHandler.instance == null) {
            KtekEventHandler.instance = this;
        }

        if( KtekEventHandler.staticJoinRoomData ){
            this.setJoinRoomData(KtekEventHandler.staticJoinRoomData.tableId,
                KtekEventHandler.staticJoinRoomData.gameId,
                KtekEventHandler.staticJoinRoomData.bet,
                KtekEventHandler.staticJoinRoomData.time);
            KtekEventHandler.staticJoinRoomData = null;
        }
    }

    start() {

    }

    getInstance() {
        return KtekEventHandler.instance;
    }

    sendToKtek(key, data) {
        cc.log("sendToKtek key: " + key + " | data: " + data);
        if (this.receiveOurCallback != null) {
            this.receiveOurCallback(key, data);
        }
    }

    sendToUs(key, data) {
        cc.log("sendToUs key: " + key + " | data: " + JSON.stringify(data));
        cc.log("sendToUs callback: " + this.receiveKtekCallback);
        if (this.receiveKtekCallback != null) {
            this.receiveKtekCallback(key, data);
        }
    }

    setJoinRoomData(tableID, gameID , betMoney,time) {
        let roomData = {
            tableId: tableID,
            gameId: gameID,
            bet: betMoney,
            time,
        };
        KtekEventHandler.instance.joinRoomData = roomData;
    }

    setStaticJoinRoomData(tableID, gameID, betMoney,time) {
        let roomData = {
            tableId: tableID,
            gameId: gameID,
            bet: betMoney,
            time,
        };

        KtekEventHandler.staticJoinRoomData = roomData;
        cc.sys.localStorage.setItem("invitation_"+gameID,JSON.stringify(roomData));
    }


    switchEnv({ isProd }) {
        cc.log("KtekEventHandler switchEnv: " + isProd);

        const loadConfigAsync = require('loadConfigAsync');
        loadConfigAsync.switchEnv(isProd);
    }

    // update (dt) {}
}
