

const PoolPrefab = cc.Class({
    name: 'PoolPrefab',
    properties:{
        prefabName: {
            default: '',
        },

        objectPrefab: {
            type: cc.Prefab,
            default: null,
        },

        initialCount: 5,
    }
});
cc.Class({
    extends: cc.Component,

    properties: {
        poolPrefabList: {
            type: PoolPrefab,
            default: [],
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.pools = [];
        for(let i = 0; i<this.poolPrefabList.length; i++){
            let compName = this.poolPrefabList[i].prefabName;
            const aPool = new cc.NodePool(compName);

            for(let j = 0; j<this.poolPrefabList[i].initialCount; j++){
                let obj = cc.instantiate(this.poolPrefabList[i].objectPrefab);
                obj.name = compName;
                obj.active = false;
                aPool.put(obj);
            }
            const poolObject = {
                prefabName: this.poolPrefabList[i].prefabName,
                objectPrefab: this.poolPrefabList[i].objectPrefab,
                pool: aPool,
            };
            this.pools[i] = poolObject;
        }
        this.node.poolFactory = this;
    },

    getObject(_prefabName){
        let obj = null;
        for(let i = 0; i<this.pools.length; i++){
            const {prefabName, objectPrefab, pool} = this.pools[i];
            if(prefabName == _prefabName){
                if(pool.size()>0){
                    obj = pool.get();
                }else{
                    obj = cc.instantiate(objectPrefab);
                    obj.name = prefabName;
                    obj.active = false;
                }
                break;
            }
        }
        return obj;
    },

    removeObject(node){
        let name = node.name;
        for(let i = 0; i<this.pools.length; i++){
            const {prefabName, pool} = this.pools[i];
            if(name == prefabName){
                node.active = false;
                pool.put(node);
                break;
            }
        }
    },

    onDestroy(){
        for(let i = 0; i<this.pools.length; i++){
            const {pool} = this.pools[i];
            if(pool){
                pool.clear();
            }
            this.poolPrefabList[i].objectPrefab = null;
        }
        this.pools = [];
        this.pools = null;
        this.poolPrefabList = [];
        this.poolPrefabList = null;
        this.node.poolFactory = null;
    },
});
