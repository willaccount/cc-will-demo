const RichTextChildImageName = "RICHTEXT_Image_CHILD";
const CustomHTMLTextParser = require('CustomHTMLTextParser');

cc.RichText.prototype._addRichTextImageElement = function (richTextElement) {
    let spriteFrameName = richTextElement.style.src;
    let spriteFrame = this.imageAtlas.getSpriteFrame(spriteFrameName);
    let anchorY = richTextElement.style.anchorY || 0;
    if (spriteFrame) {
        let spriteNode = new cc.PrivateNode(RichTextChildImageName);
        let spriteComponent = spriteNode.addComponent(cc.Sprite);
        spriteNode.setAnchorPoint(0, anchorY);
        spriteComponent.type = cc.Sprite.Type.SLICED;
        spriteComponent.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        this.node.addChild(spriteNode);
        this._labelSegments.push(spriteNode);
        let spriteRect = spriteFrame.getRect();
        let scaleFactor = 1;
        let spriteWidth = spriteRect.width;
        let spriteHeight = spriteRect.height;
        let expectWidth = richTextElement.style.imageWidth;
        let expectHeight = richTextElement.style.imageHeight;

        //follow the original rule, expectHeight must less then lineHeight
        //AD use the scale property to adjust image scale
        if (richTextElement.style.scale) {
            scaleFactor = richTextElement.style.scale;
            spriteWidth = spriteWidth * scaleFactor;
            spriteHeight = spriteHeight * scaleFactor;
        }
        else if (expectHeight > 0 && expectHeight < this.lineHeight) {
            scaleFactor = expectHeight / spriteHeight;
            spriteWidth = spriteWidth * scaleFactor;
            spriteHeight = spriteHeight * scaleFactor;
        }
        else {
            scaleFactor = this.lineHeight / spriteHeight;
            spriteWidth = spriteWidth * scaleFactor;
            spriteHeight = spriteHeight * scaleFactor;
        }

        if (expectWidth > 0) spriteWidth = expectWidth;

        if (this.maxWidth > 0) {
            if (this._lineOffsetX + spriteWidth > this.maxWidth) {
                this._updateLineInfo();
            }
            this._lineOffsetX += spriteWidth;

        }
        else {
            this._lineOffsetX += spriteWidth;
            if (this._lineOffsetX > this._labelWidth) {
                this._labelWidth = this._lineOffsetX;
            }
        }
        spriteComponent.spriteFrame = spriteFrame;
        spriteNode.setContentSize(spriteWidth, spriteHeight);
        spriteNode._lineCount = this._lineCount;

        if (richTextElement.style.event) {
            if (richTextElement.style.event.click) {
                spriteNode._clickHandler = richTextElement.style.event.click;
            }
            if (richTextElement.style.event.param) {
                spriteNode._clickParam = richTextElement.style.event.param;
            }
            else {
                spriteNode._clickParam = '';
            }
        }
        else {
            spriteNode._clickHandler = null;
        }
    }
    else {
        cc.warnID(4400);
    }
}

cc.RichText.prototype._updateRichText = function() {
    if (!this.enabled) return;
    const _customHTMLTextParser = new CustomHTMLTextParser();
    let newTextArray = _customHTMLTextParser.parse(this.string);
    if (!this._needsUpdateTextLayout(newTextArray)) {
        this._textArray = newTextArray;
        this._updateLabelSegmentTextAttributes();
        return;
    }

    this._textArray = newTextArray;
    this._resetState();

    let lastEmptyLine = false;
    let label;
    let labelSize;

    for (let i = 0; i < this._textArray.length; ++i) {
        let richTextElement = this._textArray[i];
        let text = richTextElement.text;
        //handle <br/> <img /> tag
        if (text === "") {
            if (richTextElement.style && richTextElement.style.newline) {
                this._updateLineInfo();
                continue;
            }
            if (richTextElement.style && richTextElement.style.isImage && this.imageAtlas) {
                this._addRichTextImageElement(richTextElement);
                continue;
            }
        }
        let multilineTexts = text.split("\n");

        for (let j = 0; j < multilineTexts.length; ++j) {
            let labelString = multilineTexts[j];
            if (labelString === "") {
                //for continues \n
                if (this._isLastComponentCR(text)
                    && j === multilineTexts.length - 1) {
                    continue;
                }
                this._updateLineInfo();
                lastEmptyLine = true;
                continue;
            }
            lastEmptyLine = false;

            if (this.maxWidth > 0) {
                let labelWidth = this._measureText(i, labelString);
                this._updateRichTextWithMaxWidth(labelString, labelWidth, i);

                if (multilineTexts.length > 1 && j < multilineTexts.length - 1) {
                    this._updateLineInfo();
                }
            }
            else {
                label = this._addLabelSegment(labelString, i);
                labelSize = label.getContentSize();

                this._lineOffsetX += labelSize.width;
                if (this._lineOffsetX > this._labelWidth) {
                    this._labelWidth = this._lineOffsetX;
                }

                if (multilineTexts.length > 1 && j < multilineTexts.length - 1) {
                    this._updateLineInfo();
                }
            }
        }
    }
    if (!lastEmptyLine) {
        this._linesWidth.push(this._lineOffsetX);
    }

    if (this.maxWidth > 0) {
        this._labelWidth = this.maxWidth;
    }
    this._labelHeight = (this._lineCount + 0.26) * this.lineHeight;

    // trigger "size-changed" event
    this.node.setContentSize(this._labelWidth, this._labelHeight);

    this._updateRichTextPosition();
    this._layoutDirty = false;
}