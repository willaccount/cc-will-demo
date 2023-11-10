cc.Class({
    extends: cc.NodePool,
    init(prefab, initCount = 5) {
        cc.log(this.LOGTAG, "Init Node Pool");
        this.objPrefab = prefab;
        for (let i = 0; i < initCount; i++) {
            let item = cc.instantiate(this.objPrefab);
            this.put(item);
        }
    },
    getSize() {
        return this.size();
    },
    getObj() {
        let obj = null;
        if (this.size() > 0) {
            obj = this.get(this);
        } else {
            obj = cc.instantiate(this.objPrefab);
            this.put(obj);
            obj = this.get(this);
        }
        return obj;
    },

    clearPool() {
        this.clear();
    },
    reinit() {
        this.clear();
        this.init(this.objPrefab);
    }
});
