

cc.Class({
    extends: cc.Component,
    onLoad(){
        this._customEngineIOS();
    },
    _customEngineIOS(){
        const isIOS14Device = (cc.sys.os === cc.sys.OS_IOS || cc.sys.os === cc.sys.OS_OSX) && cc.sys.isBrowser && /(OS 1[4-9])|(Version\/1[4-9])/.test(window.navigator.userAgent);
        if (isIOS14Device) {
            let isOverride = false;
            let flush = function () {
                let material = this.material,
                    buffer = this._buffer,
                    indiceStart = buffer.indiceStart,
                    indiceOffset = buffer.indiceOffset,
                    indiceCount = indiceOffset - indiceStart;
                if (!this.walking || !material || indiceCount <= 0) {
                    return;
                }
        
                let effect = material.effect;
                if (!effect) return;
        
                // Generate ia
                let ia = this._iaPool.add();
                ia._vertexBuffer = buffer._vb;
                ia._indexBuffer = buffer._ib;
                ia._start = indiceStart;
                ia._count = indiceCount;
        
                // Generate model
                let model = this._modelPool.add();
                this._batchedModels.push(model);
                model.sortKey = this._sortKey++;
                model._cullingMask = this.cullingMask;
                model.setNode(this.node);
                model.setEffect(effect, this.customProperties);
                model.setInputAssembler(ia);
        
                this._renderScene.addModel(model);
        
                if (isIOS14Device) {
                    buffer.uploadData();
                    buffer.switchBuffer();
                } else {
                    buffer.byteStart = buffer.byteOffset;
                    buffer.indiceStart = buffer.indiceOffset;
                    buffer.vertexStart = buffer.vertexOffset;
                }
            };
        
            cc.MeshBuffer.prototype.checkAndSwitchBuffer = function (vertexCount) {
                if (!isOverride) {
                    //method 1
                    this._batcher.__proto__._flush = flush;
                    isOverride = true;
                }
                //method 2
                //this._batcher._flush = flush;
        
                if (this.vertexOffset + vertexCount > 65535) {
                    this.uploadData();
                    this._batcher._flush();
                }
            };
        }
    }
});
