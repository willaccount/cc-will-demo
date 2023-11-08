const ENABLE_COLOR = new cc.Color(255, 255, 255);
const DISABLE_COLOR = new cc.Color(100, 100, 100);

cc.Class({
    extends: cc.Component,

    properties: {
        lines: [cc.Node]
    },
    onLoad() {
        this.reset();
        this.node.on('SHOW_BET_LINE', this.showBetLine, this);
    },
    showBetLine(betLine) {
        this.reset();
        const betLines = betLine ? betLine.replace('[', '').replace(']', '').replace(/ /g, '').split(',') : [];
        betLines.forEach(line => {
            this.lines[line - 1].color = ENABLE_COLOR;
        });
    },
    reset() {
        this.lines.forEach(line => {
            line.color = DISABLE_COLOR;
        });
    }
});
