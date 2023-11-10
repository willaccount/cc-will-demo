const arrayTypeJackpot = ["MAJOR", "GRAND"];
cc.Class({
    extends: require("BetDetailHistory"),
    updateTitleJP(data) {
        let { latestWinJackpotInfo } = data;
        if (latestWinJackpotInfo) {
            let idJP = -1;
            arrayTypeJackpot.forEach((it, index) => {
                if (latestWinJackpotInfo.jackpotId.indexOf(it) >= 0)
                    idJP = index;
            });
            if (this.listJP.length <= arrayTypeJackpot.length && idJP != -1) {
                this.titleJP.getComponent(cc.Sprite).spriteFrame = this.listJP[idJP];
                this.titleJP.active = true;
                this.updateTitle(data);
                let tt = this.title.getComponent(cc.Label).string;
                this.title.getComponent(cc.Label).string = tt + "  +  ";
            }
        } else {
            this.titleJP.active = false;
        }
    },
    addButtonTotalPage() {
        let totalResultItem = cc.instantiate(this.scrollItem);
        let labelScroll = null;
        totalResultItem.getComponent(this.nameBetHistoryScrollItem).setIndex(-1);
        totalResultItem.parent = this.scrollContainer;
        if (totalResultItem.getComponent(cc.Label)) {
            labelScroll = totalResultItem.getComponent(cc.Label);
        } else {
            labelScroll = totalResultItem.getChildByName("Label").getComponent(cc.Label);
        }
        if (labelScroll) labelScroll.string = "Tổng kết ";
    },
});
