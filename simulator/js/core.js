var canvasCore = {
    redrawBackground: false,
    maxHorizontalDivisions: constants.INITIAL_HORIZONTAL_DIVISIONS,

    //Dimensions
    height: 0,
    width: 0,
    aspectRatio: 1,

    //for GIF canvas
    encoder: null,

    //Workspace Dimensions
    workHeight: 1,
    workWidth: 1,
    workAspectRatio: 1,
    workMargin: 5,

    //Transformation
    canvasCenter: new Point(0, 0),
    scaleFactor: 1,
    panX: 0,
    panY: 0,

    //To zoom to bounds and back
    //used during export to pdf
    normalInfo: {
        scaleFactor: 1,
        panX: 0,
        panY: 0,
    },

    //Methods
    initializeCanvas: function () {
        this.resizeCanvas();
        this.setInitialState();
    },
    refreshCanvas: function () {
        this.resizeCanvas();
        this.workMargin = parseFloat(5);
        this.workWidth = helper.minConstrain(Math.ceil(this.aspectRatio * constants.INITIAL_HORIZONTAL_DIVISIONS), constants.MIN_HORIZONTAL_DIVISIONS).toFixed(3);
        this.workHeight = helper.minConstrain(parseFloat(this.workHeight), constants.MIN_HORIZONTAL_DIVISIONS).toFixed(3);
        this.workAspectRatio = this.workWidth / this.workHeight;

        $('#workspaceWidthValue').val(this.workWidth);
        $('#workspaceHeightValue').val(this.workHeight);
        $('#marginSlider').val(this.workMargin);
        $('#marginValue').text(this.workMargin + 'X');

        this.redrawBackground = true;
        this.setPanAndZoom(this.panX, this.panY, this.scaleFactor);
        drawables.refreshConstraintsOnDraw();
        applicationController.refreshDisplay(true);

    },
    resizeCanvas: function () {
        var animationLayer = $('#foregroundCanvas');

        this.width = animationLayer.width() * constants.SCREEN_COMPRESSION_FACTOR;
        this.height = animationLayer.height() * constants.SCREEN_COMPRESSION_FACTOR;
        this.aspectRatio = this.width / this.height;

        $('#foregroundCanvas, #constraintLayer, #backgroundCanvas, #imageCanvas, #mixer, #gifCanvas, #markupLayer').attr({
            width: this.width,
            height: this.height
        });

        $('#exportCanvas').attr({
            width: constants.IMAGE_WIDTH,
            height: constants.IMAGE_HEIGHT
        });

        // Set the info screen dimensions
        var h = $('#infoScreen').height();
        var w = $('#infoScreen').width();
        if (this.height / this.width < 0.6) {
            // Set the width relative to the height and set the x position
            $('#infoDetailHolder').width(h / 0.6);
            $('#infoDetailHolder').css({
                left: (w - h / 0.6) / 2
            });
        } else {
            // Set the height relative to the width and set the y position
            $('#infoDetailHolder').height(w * 0.6);
            $('#infoDetailHolder').css({
                top: (h - w * 0.6) / 2
            });
        }

    },
    setInitialState: function () {
        this.setPanAndZoom(0, 0, this.height / constants.INITIAL_HORIZONTAL_DIVISIONS);
        this.setWorkspace(Math.ceil(this.aspectRatio * constants.INITIAL_HORIZONTAL_DIVISIONS), constants.INITIAL_HORIZONTAL_DIVISIONS, 5);
    },
    pan: function (panX, panY) {
        this.panX += panX;
        this.panY += panY;
        this.canvasCenter.setPoint((this.width / 2) + this.panX, (this.height / 2) + this.panY);
        this.redrawBackground = true;
        drawables.refreshConstraintsOnDraw();
    },
    zoom: function (value) {
        var maxHorizontalDivisions = (this.workAspectRatio < this.aspectRatio) ? (this.workHeight * this.workMargin) : (this.workWidth * this.workMargin / this.aspectRatio);

        if (maxHorizontalDivisions < this.height / this.scaleFactor * constants.MAX_ZOOM_MULTIPLIER)
            maxHorizontalDivisions = this.height / this.scaleFactor * constants.MAX_ZOOM_MULTIPLIER;

        this.scaleFactor = helper.constrain(this.scaleFactor * value, this.height / maxHorizontalDivisions, this.height / constants.MIN_ZOOM); // MIN_HORIZONTAL_DIVISIONS
        this.redrawBackground = true;
        drawables.refreshConstraintsOnDraw();
    },
    getXonGrid: function (pointerX) {
        return ((pointerX * constants.SCREEN_COMPRESSION_FACTOR) - this.canvasCenter.x) / this.scaleFactor;
    },
    getYonGrid: function (pointerY) {
        return -((pointerY * constants.SCREEN_COMPRESSION_FACTOR) - this.canvasCenter.y) / this.scaleFactor;
    },
    getPointonGrid: function (pointer) {
        return new Point(this.getXonGrid(pointer.x), this.getYonGrid(pointer.y));
    },
    getSavableInfoForGrid: function () {
        return canvasGrid.getSavableInfo().concat([
            [
                'panX', this.panX
            ], [
                'panY', this.panY
            ], [
                'scale', this.scaleFactor
            ]
        ]);
    },
    getSavableInfoForWorkspace: function () {
        return [
            [
                'width', this.workWidth
            ], [
                'height', this.workHeight
            ], [
                'margin', this.workMargin
            ]
        ];
    },
    displayEditingValues: function () {
        var values = drawables.getDimensions();
        menuCore.cancelEditingSelection(false);

        $('.editing-display-holder, .x-value, .y-value, .length-value, .angle-value, .orientation-value, .keypad-holder').hide();
        $('#optionsMenu').show();
        if (values.length != 0) {
            $('.editing-display-holder').show();
            for (var i = 0; i < values.length; i++) {
                $('.' + values[i][0]).show();
                $('input.' + values[i][0]).val(values[i][1]);
            }
        }
    },
    displayLinkageType: function () {
        var linkageType = drawables.getLinkageType();

        if (linkageType == '') {
            $('#linkageType').hide();
        } else {
            if (linkageType == 'No Solution')
                $('#linkageType').addClass('no-sol');
            else
                $('#linkageType').removeClass('no-sol');

            $('#linkageType').text(linkageType).show();
        }
    },
    setPanAndZoom: function (panX, panY, scaleFactor) {
        this.panX = parseFloat(panX);
        this.panY = parseFloat(panY);
        this.scaleFactor = parseFloat(scaleFactor);
        this.canvasCenter.setPoint((this.width / 2) + this.panX, (this.height / 2) + this.panY);
        this.redrawBackground = true;
    },
    setWorkspace: function (width, height, margin) {
        this.workMargin = parseFloat(margin);
        this.workWidth = helper.minConstrain(parseFloat(width), constants.MIN_HORIZONTAL_DIVISIONS).toFixed(3);
        this.workHeight = helper.minConstrain(parseFloat(height), constants.MIN_HORIZONTAL_DIVISIONS).toFixed(3);
        this.workAspectRatio = this.workWidth / this.workHeight;

        $('#workspaceWidthValue').val(this.workWidth);
        $('#workspaceHeightValue').val(this.workHeight);
        $('#marginSlider').val(this.workMargin);
        $('#marginValue').text(this.workMargin + 'X');

        this.redrawBackground = true;
        menuCore.synthesizeMechanism();
    },
    draw: function () {
        var canvas = $('#foregroundCanvas');
        var context = canvas.get(0).getContext("2d");

        context.clearRect(0, 0, canvasCore.width, canvasCore.height);

        var constraintLayerContext = $('#constraintLayer').get(0).getContext("2d");

        if (drawables.refreshConstraints)
            constraintLayerContext.clearRect(0, 0, canvasCore.width, canvasCore.height);

        if (canvasCore.redrawBackground) {
            var backgroundContext = $('#backgroundCanvas').get(0).getContext("2d");
            var imageBackgroundContext = $('#imageCanvas').get(0).getContext("2d");

            backgroundContext.clearRect(0, 0, canvasCore.width, canvasCore.height);
            imageBackgroundContext.clearRect(0, 0, canvasCore.width, canvasCore.height);

            canvasBackgroundImage.draw(imageBackgroundContext, canvasCore.workWidth, canvasCore.workHeight);
            canvasGrid.draw(backgroundContext, canvasCore.width, canvasCore.height, canvasCore.workWidth, canvasCore.workHeight);

            canvasCore.redrawBackground = false;
        }else if(canvasBackgroundImage.redrawImage){
            var imageBackgroundContext = $('#imageCanvas').get(0).getContext("2d");
            imageBackgroundContext.clearRect(0, 0, canvasCore.width, canvasCore.height);
            canvasBackgroundImage.draw(imageBackgroundContext, canvasCore.workWidth, canvasCore.workHeight);
        }

        drawables.draw(context, constraintLayerContext, applicationController.inAnimation);
    },
    drawToSingleLayer: function () {
        var canvas = $('#exportCanvas');
        var context = canvas.get(0).getContext("2d");

        context.clearRect(0, 0, constants.IMAGE_WIDTH, constants.IMAGE_HEIGHT);

        canvasBackgroundImage.draw(context, constants.IMAGE_WIDTH, constants.IMAGE_HEIGHT);
        canvasGrid.draw(context, constants.IMAGE_WIDTH, constants.IMAGE_HEIGHT, canvasCore.workWidth, canvasCore.workHeight);
        drawables.draw(context, context, applicationController.inAnimation);
    },
    getGIFCanvas: function () {
        var sources = [
            $('#imageCanvas').get(0),
            $('#backgroundCanvas').get(0),
            $('#constraintLayer').get(0),
            $('#foregroundCanvas').get(0)
        ];

        var target = $('#gifCanvas').get(0).getContext("2d");
        target.clearRect(0, 0, this.width, this.height);
        target.fillStyle = '#fff';
        target.fillRect(0, 0, this.width, this.height);

        graphicsGeometry.drawOverlappedImages(sources, target);

        return target.getImageData(0, 0, this.width, this.height).data.buffer;
    },
    getCombinedImage: function (getAnnotateLayer) {
        var sources = [
            $('#imageCanvas').get(0),
            $('#backgroundCanvas').get(0),
            $('#constraintLayer').get(0),
            $('#foregroundCanvas').get(0)
        ];

        if (getAnnotateLayer)
            sources.splice(4, 0, $('#markupLayer').get(0));

        var target = $('#mixer').get(0).getContext("2d");
        target.clearRect(0, 0, this.width, this.height);
        target.fillStyle = '#fff';
        target.fillRect(0, 0, this.width, this.height);

        graphicsGeometry.drawOverlappedImages(sources, target);

        return $('#mixer').get(0).toDataURL('image/jpeg', 0.75);
    },
    zoomToBounds: function () {
        var maxHorizontalDivisions = (this.workAspectRatio < this.aspectRatio) ? (this.workHeight) : (this.workWidth / this.aspectRatio);

        if (maxHorizontalDivisions < this.height / this.scaleFactor)
            maxHorizontalDivisions = this.height / this.scaleFactor;

        this.normalInfo.panX = this.panX;
        this.normalInfo.panY = this.panY;
        this.normalInfo.scaleFactor = this.scaleFactor;
        this.setPanAndZoom(0, 0, this.height / maxHorizontalDivisions);
        drawables.refreshConstraintsOnDraw();
    },
    zoomToNormal: function () {
        this.setPanAndZoom(this.normalInfo.panX, this.normalInfo.panY, this.normalInfo.scaleFactor);
        drawables.refreshConstraintsOnDraw();
    },
    annotate: function () {
        var annoLayer = $('#markupLayer').get(0).getContext("2d");
        annoLayer.clearRect(0, 0, canvasCore.width, canvasCore.height);

        drawables.annotate(annoLayer);

        //        $('#markupLayer').show();
        //        $('#markupLayer').show();
    }
};
