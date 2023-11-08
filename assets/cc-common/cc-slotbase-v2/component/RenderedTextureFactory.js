

const SymbolContext = cc.Class({
    name: 'SymbolContext',
    properties:{
        symbolNode: cc.Node,
        spine: sp.Skeleton,
        symbolIndex: 0,
        symbolCode: "",
    },
    
});

const NormalSymbolContainer = cc.Class({
    name: 'NormalSymbolContainer',
    properties: {
        container: cc.Node,
        row:2,
        col: 4,
        padding: 10,
        symbolList: {
            type: SymbolContext,
            default: [],
        }
    },
});

const MegaSymbolData = cc.Class({
    name: 'MegaSymbolData',
    properties:{
        skeletonFile: sp.SkeletonData,
        symbolCode: "",
    },
});

const MegaSymbolContainer = cc.Class({
    name: 'MegaSymbolContainer',
    properties:{
        symbolNode: cc.Node,
        spine: sp.Skeleton,
        currentSymbolCode: '',
        megaSymbols:{
            type: MegaSymbolData,
            default: [],
        },
    },
});
const SymbolDataType = cc.Enum({
    NORMAL: 0,
    MEGA: 1,
});
const SymbolSpriteData = cc.Class({
    name : 'SymbolSpriteData',
    properties:{
        spriteFrame: cc.SpriteFrame,
        width: 100,
        height: 100,
        symbolType: {
            type: SymbolDataType,
            default: SymbolDataType.NORMAL,
        },
        symbolCode: '',
        index: 0,
        isRendering: true,
    }
});

cc.Class({
    extends: cc.Component,

    properties: {
        turnOnAtStart: false,
        fps: 30,
        rootContainer: cc.Node,
        renderCamera: cc.Camera,
        padding: 10,
        renderTexture: {
            type: cc.RenderTexture,
            default: null,
            visible: false,
        },

        normalSymbolContainer:{
            type: NormalSymbolContainer,
            default: null,
        },

        megaSymbolContainer: {
            type: MegaSymbolContainer,
            default: null,
        },

        IsEnable:{
            get (){
                return this._isEnable;
            },

            set(value){
                this._isEnable = value;
            },

            visible: false,
        },

        IsPlayingMegaSymbol:{
            get (){
                return this._isPlayingMegaSymbol;
            },
            visible: false,
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this._spriteDatabase = [];
        this._isEnable = false; 
        this._standartFps = 60;
        this._tick = 0;
        this._isPlayingMegaSymbol = false;
        cc.log("Load Rendered Texture System");
    },

    start () {
        this.renderTexture = new cc.RenderTexture();
        
        const spriteCount = this.normalSymbolContainer.symbolList.length + 1;
        cc.log(`Total Sprite Frame in Render Texture: ${spriteCount}`);
        for(let i = 0; i < this.normalSymbolContainer.symbolList.length; i++){
            let symbolSpriteData = new SymbolSpriteData();
            symbolSpriteData.spriteFrame = new cc.SpriteFrame();
            symbolSpriteData.symbolCode = this.normalSymbolContainer.symbolList[i].symbolCode;
            symbolSpriteData.width = this.normalSymbolContainer.symbolList[i].symbolNode.width;
            symbolSpriteData.height = this.normalSymbolContainer.symbolList[i].symbolNode.height;
            symbolSpriteData.symbolType = SymbolDataType.NORMAL;
            symbolSpriteData.index = this.normalSymbolContainer.symbolList[i].symbolIndex;
            symbolSpriteData.isRendering = true;
            this._spriteDatabase.push(symbolSpriteData);
        }
        let megaSymbolSpriteData = new SymbolSpriteData();
        megaSymbolSpriteData.spriteFrame = new cc.SpriteFrame();
        megaSymbolSpriteData.symbolCode = 'M';
        megaSymbolSpriteData.width = this.megaSymbolContainer.symbolNode.width*4/5;
        megaSymbolSpriteData.height = this.megaSymbolContainer.symbolNode.height;
        megaSymbolSpriteData.symbolType = SymbolDataType.MEGA;
        megaSymbolSpriteData.isRendering = true;
        this._spriteDatabase.push(megaSymbolSpriteData);
        this.snapShot();
        this.turnOffRenderTextureSystem();
        if(this.turnOnAtStart){
            this.turnOnRenderTextureSystem();
        }
        // this.snapShot();
        // cc.log(this._spriteDatabase);
        // cc.log(this.renderTexture);
        this.renderCamera.node.active = false;
    },

    turnOffRenderTextureSystem(){
        this.stopAllNormalSymbolAnimation();
        this.stopMegaSymbolAnimation();
        this._isEnable = false;
    },

    turnOnRenderTextureSystem(){
        this._isEnable = true;
    },

    setDefaultPerformance(){
        this.fps = 60;
    },

    setLowPerformance(){
        this.fps = 30;
    },

    getRTSpriteFrame(symbolCode, skinName = '', isMega = false){
        let spriteFrame = null;
        let _symbolCode = symbolCode;

        if(isMega&&this._isEnable){
            if(symbolCode != this.megaSymbolContainer.currentSymbolCode){
                this.setUpMegaSymbol(symbolCode);
            }
            _symbolCode = 'M';
        }
        
        for(let i = 0; i < this._spriteDatabase.length; i++){
            if(this._spriteDatabase[i].symbolCode == _symbolCode && this._isEnable){
                if(this._spriteDatabase[i].symbolType == SymbolDataType.NORMAL){
                    this.playNormalSymbolAnimation(_symbolCode, skinName, true);
                }else{
                    this.playMegaSymbolAnimation(skinName, true);
                }
                spriteFrame = this._spriteDatabase[i].spriteFrame;
                break;
            }
        }
        return spriteFrame;
    },

    setUpMegaSymbol(symbolCode){
        for(let i = 0; i< this.megaSymbolContainer.megaSymbols.length; i++){
            if(this.megaSymbolContainer.megaSymbols[i].symbolCode == symbolCode){
                this.megaSymbolContainer.spine.node.active = true;
                if(this.megaSymbolContainer.currentSymbolCode != symbolCode){
                    // this.megaSymbolContainer.spine.clearTracks();
                    this.megaSymbolContainer.spine.skeletonData = null;
                    this.megaSymbolContainer.spine.skeletonData = this.megaSymbolContainer.megaSymbols[i].skeletonFile;
                    this.megaSymbolContainer.currentSymbolCode = symbolCode;
                    this._isPlayingMegaSymbol = false;
                }
                break;
            }
        }
    },

    playMegaSymbolAnimation(skinName = '', isloop = true ){
        this.megaSymbolContainer.spine.node.active = true;
        this.megaSymbolContainer.spine.paused = false;
        this.megaSymbolContainer.spine.node.angle = 180;
        this.megaSymbolContainer.symbolNode.opacity = 255;
        if(this._isPlayingMegaSymbol == false){
            if(skinName&&skinName!==''){
                this.megaSymbolContainer.spine.setSkin(skinName);
            }
            this.megaSymbolContainer.spine.setAnimation (0, 'animation', isloop);
            this._isPlayingMegaSymbol = true;
        }
        for(let i = 0; i< this._spriteDatabase.length; i++){
            if(this._spriteDatabase[i].symbolType == SymbolDataType.MEGA){
                this._spriteDatabase[i].isRendering = true;
                break;
            }
        }
    },

    stopMegaSymbolAnimation(){
        // this.megaSymbolContainer.spine.clearTracks();
        this.megaSymbolContainer.spine.paused = true;
        this.megaSymbolContainer.spine.node.active = false;
        this.megaSymbolContainer.symbolNode.opacity = 0;
        this._isPlayingMegaSymbol = false;
        for(let i = 0; i< this._spriteDatabase.length; i++){
            if(this._spriteDatabase[i].symbolType == SymbolDataType.MEGA){
                this._spriteDatabase[i].isRendering = false;
                break;
            }
        }
    },

    playNormalSymbolAnimation(symbolCode, skinName = '', isloop = true){
        for(let i = 0; i< this.normalSymbolContainer.symbolList.length; i++){
            if(this.normalSymbolContainer.symbolList[i].symbolCode == symbolCode){
                if(this.normalSymbolContainer.symbolList[i].spine){
                    this.normalSymbolContainer.symbolList[i].spine.node.active = true;
                    this.normalSymbolContainer.symbolList[i].spine.node.paused = false;
                    this.normalSymbolContainer.symbolList[i].spine.node.angle = 180;
                    // this.normalSymbolContainer.symbolList[i].spine.clearTracks();
                    if(skinName&&skinName!==''){
                        this.normalSymbolContainer.symbolList[i].spine.setSkin(skinName);
                    }
                    this.normalSymbolContainer.symbolList[i].spine.setAnimation(0, 'animation', isloop);
                }else{
                    if(this.normalSymbolContainer.symbolList[i].symbolNode.children){
                        const childNode = this.normalSymbolContainer.symbolList[i].symbolNode.children[0];
                        if(childNode){
                            childNode.active = true;
                        }
                    }
                }
                
                break;
            }
        }

        for(let i = 0; i< this._spriteDatabase.length; i++){
            if(this._spriteDatabase[i].symbolType == SymbolDataType.NORMAL){
                if(this._spriteDatabase[i].symbolCode == symbolCode){
                    this._spriteDatabase[i].isRendering = true;
                    break;
                }
            }
        }
    },

    stopNormalSymbolAnimation(symbolCode){
        for(let i = 0; i< this.normalSymbolContainer.symbolList.length; i++){
            if(this.normalSymbolContainer.symbolList[i].symbolCode == symbolCode){
                if(this.normalSymbolContainer.symbolList[i].spine){
                    // this.normalSymbolContainer.symbolList[i].spine.clearTracks();
                    this.normalSymbolContainer.symbolList[i].spine.node.paused = true;
                    this.normalSymbolContainer.symbolList[i].spine.node.active = false;
                }else{
                    if(this.normalSymbolContainer.symbolList[i].symbolNode.children){
                        const childNode = this.normalSymbolContainer.symbolList[i].symbolNode.children[0];
                        if(childNode){
                            childNode.active = false;
                        }
                    }
                }
                break;
            }
        }

        for(let i = 0; i< this._spriteDatabase.length; i++){
            if(this._spriteDatabase[i].symbolType == SymbolDataType.NORMAL){
                if(this._spriteDatabase[i].symbolCode == symbolCode){
                    this._spriteDatabase[i].isRendering = false;
                    break;
                }
            }
        }
    },

    playAllNormalSymbolAnimation(isLoop = true){
        for(let i = 0; i< this.normalSymbolContainer.symbolList.length; i++){
            
            if(this.normalSymbolContainer.symbolList[i].spine){
                this.normalSymbolContainer.symbolList[i].spine.node.active = true;
                this.normalSymbolContainer.symbolList[i].spine.node.angle = 180;
                // this.normalSymbolContainer.symbolList[i].spine.clearTracks();
                this.normalSymbolContainer.symbolList[i].spine.setAnimation(0, 'animation', isLoop);
            }else{
                if(this.normalSymbolContainer.symbolList[i].symbolNode.children){
                    const childNode = this.normalSymbolContainer.symbolList[i].symbolNode.children[0];
                    if(childNode){
                        childNode.active = true;
                    }
                }
                
            }
        }

        for(let i = 0; i< this._spriteDatabase.length; i++){
            if(this._spriteDatabase[i].symbolType == SymbolDataType.NORMAL){
                this._spriteDatabase[i].isRendering = true;
            }
        }
    },

    stopAllNormalSymbolAnimation(){
        for(let i = 0; i< this.normalSymbolContainer.symbolList.length; i++){
            if(this.normalSymbolContainer.symbolList[i].spine){
                // this.normalSymbolContainer.symbolList[i].spine.clearTracks();
                this.normalSymbolContainer.symbolList[i].spine.node.active = false;
            }else{
                if(this.normalSymbolContainer.symbolList[i].symbolNode.children){
                    const childNode = this.normalSymbolContainer.symbolList[i].symbolNode.children[0];
                    if(childNode){
                        childNode.active = false;
                    }
                }
            }
        }

        for(let i = 0; i< this._spriteDatabase.length; i++){
            if(this._spriteDatabase[i].symbolType == SymbolDataType.NORMAL){
                this._spriteDatabase[i].isRendering = false;
            }
        }
    },

    snapShot(){
        this.renderTexture.initWithSize(this.rootContainer.width, this.rootContainer.height);
        this.renderCamera.targetTexture = this.renderTexture;
        this.renderCamera.render(this.rootContainer);
        let normalPadding = this.normalSymbolContainer.padding;
        for(let i = 0; i< this._spriteDatabase.length; i++){
            if(this._spriteDatabase[i].isRendering == true){
                if(this._spriteDatabase[i].symbolType == SymbolDataType.NORMAL){
                    let normalIndex = this._spriteDatabase[i].index;
                    let width = this._spriteDatabase[i].width;
                    let height = this._spriteDatabase[i].height;
                    let colIndex = normalIndex%this.normalSymbolContainer.col;
                    let rowIndex = Math.floor(normalIndex/this.normalSymbolContainer.col);
                    let preWidth = colIndex==0?0:this._spriteDatabase[normalIndex-1].width;
    
                    let preHeight = (rowIndex==0)?0:this._spriteDatabase[normalIndex - this.normalSymbolContainer.col].height;
    
                    let x = normalPadding + (colIndex)* (preWidth + normalPadding);
                    let y = this.megaSymbolContainer.symbolNode.height+ normalPadding + (rowIndex)* (preHeight + normalPadding);
                    this._spriteDatabase[i].spriteFrame.setTexture(this.renderTexture, new cc.Rect(x, y, width, height));
    
                }else{
                    let x = (this.megaSymbolContainer.symbolNode.width - this._spriteDatabase[i].width)/2;
                    let y = 0;
                    let width = this._spriteDatabase[i].width;
                    let height = this._spriteDatabase[i].height;
                    this._spriteDatabase[i].spriteFrame.setTexture(this.renderTexture, new cc.Rect(x, y, width, height));
                }
            }
            
        }
    },

    update () {
        if(this._isEnable == true){
            this._tick++;
            if(this._tick>=this._standartFps/this.fps){
                this._tick = 0;
                this.snapShot();
            }
        }
    },

    onDestroy(){
        if(this._spriteDatabase.length>0){
            for(let i = 0; i<this._spriteDatabase.length; i++){
                this._spriteDatabase[i] = null;
            }
        }
        this._spriteDatabase = null;
        if(this.renderCamera!=null){
            this.renderCamera.targetTexture = null;
        }
        if(this.renderTexture!=null){
            this.renderTexture.destroy();
        }
        this.normalSymbolContainer = null;
        this.megaSymbolContainer = null;
    }
});
