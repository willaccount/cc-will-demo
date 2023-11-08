cc.Class({
    extends: cc.Component,
    properties: {
        cell: cc.Prefab,
    },
    onLoad() {
        this.node.on("UPDATE_DATA", this.updateData, this);
        this.node.on("CLEAR_DATA", this.clearData, this);
    },

    initCells(itemPerPage){
        for (let i = 0; i < itemPerPage; ++i) {
            const cell = cc.instantiate(this.cell);
            cell.parent = this.node;
            cell.opacity = 1;
        }
    },

    updateData(data) {
        this.node.children.forEach((child, index) => {
            if (index < data.length)
            {
                child.updateData(data[index]);
                child.active = true;
                child.opacity = 255;
            }
            else
            {
                child.active = false;
            }
        });
    },

    clearData()
    {
        this.node.children.forEach(child => child.active = false);
    }
});
