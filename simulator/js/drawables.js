var canvasGrid = {
    gridOn: false,
    kinematicViewStyle: false,
    showLinkNumbers: true,
    center: new Point(0, 0),
    isOn: function () {
        return this.gridOn;
    },
    toggleViewStyle: function(value){
        if(value != undefined)
            this.kinematicViewStyle = Boolean(value);
        else
            this.kinematicViewStyle=!this.kinematicViewStyle;
    },
    toggleLinkNumbers: function(value){
        if(value != undefined)
            this.showLinkNumbers = Boolean(value);
        else
            this.showLinkNumbers=!this.showLinkNumbers;
    },
    toggleGrid: function () {
        this.gridOn = !this.gridOn;
    },
    draw: function (context, width, height, workspaceWidth, workspaceHeight) {

        if (this.gridOn) {
            advancedGraphicsGeometry.drawGrid(context, width, height, constants.GRID_LINE_COLOR, constants.GRID_LINE_THICKNESS);
        advancedGraphicsGeometry.drawGridCenterLines(context, width, height, constants.GRID_CENTER_LINE_COLOR, constants.GRID_CENTER_LINE_THICKNESS, constants.GRID_CENTER_LINE_ALPHA);
        advancedGraphicsGeometry.drawGridAxis(context, constants.GRID_AXIS_POINTER_LINE_LENGTH, constants.GRID_AXIS_POINTER_LINE_THICKNESS, constants.GRID_AXIS_POINTER_ARROW_LENGTH, constants.GRID_AXIS_POINTER_ARROW_WIDTH, constants.GRID_AXIS_POINTER_ARROW_COLOR);
        }
        //advancedGraphicsGeometry.drawWorkspace(context, workspaceWidth, workspaceHeight, constants.GRID_WORKSPACE_LINE_COLOR, constants.GRID_WORKSPACE_LINE_THICKNESS);
    },
    getSavableInfo: function () {
        return [
            [XMLAttributes.VISIBLE, this.gridOn],
            [XMLAttributes.KINEMATIC_STYLE, this.kinematicViewStyle],
            [XMLAttributes.LINK_NUMBERS, this.showLinkNumbers]
        ];
    }
};

var canvasBackgroundImage = {
    /* ---- Properties ---- */
    enabled: false,
    source: 'img/Test.png',
    image: null,
    isSelected: false,
    redrawImage: false,
    moveImage: false,
    scale: 1,
    width: 0,
    height: 0,
    xOffsetStatic: 0,
    yOffsetStatic: 0,
    xOffset: 0,
    yOffset: 0,

    /* ---- Methods ---- */
    draw: function (context, workspaceWidth, workspaceHeight) {
        if (this.enabled){
            this.image = advancedGraphicsGeometry.drawImage(context, this.image, this.source, this.scale, this.xOffset, this.yOffset, workspaceWidth, workspaceHeight);
        }
        if(this.isSelected){
            var xCenter = helper.convertLengthFromPixelsToGridUnits(this.xOffset/constants.SCREEN_COMPRESSION_FACTOR);
            var yCenter = -helper.convertLengthFromPixelsToGridUnits(this.yOffset/constants.SCREEN_COMPRESSION_FACTOR);
            graphicsGeometry.drawRectangle(context,  new Point(xCenter, yCenter), this.height, this.width, 0, '#33E5B5', 20);
        }
        this.redrawImage = false;
    },
    calculateDimensions: function () {
        var width
        var height
        var image = this.image;
        var workspaceWidth = canvasCore.workWidth;
        var workspaceHeight = canvasCore.workHeight;
        var screenAspectRatio = Math.abs(workspaceWidth / workspaceHeight);
        var aspectRatio = image.width / image.height;

            width = image.width * this.scale * canvasCore.scaleFactor * constants.SCREEN_COMPRESSION_FACTOR * constants.MIN_HORIZONTAL_DIVISIONS / canvasCore.height;
            height = image.height * this.scale * canvasCore.scaleFactor * constants.SCREEN_COMPRESSION_FACTOR * constants.MIN_HORIZONTAL_DIVISIONS / canvasCore.height;

            if (screenAspectRatio > aspectRatio) {
                height = helper.maxConstrain(helper.convertLengthFromGridUnitsToPixels(workspaceHeight) * constants.SCREEN_COMPRESSION_FACTOR, height);
                width = height * aspectRatio;
            } else {
                width = helper.maxConstrain(helper.convertLengthFromGridUnitsToPixels(workspaceWidth) * constants.SCREEN_COMPRESSION_FACTOR, width);
                height = width / aspectRatio;
            }
            this.width = helper.convertLengthFromPixelsToGridUnits(width/constants.SCREEN_COMPRESSION_FACTOR);
            this.height = helper.convertLengthFromPixelsToGridUnits(height/constants.SCREEN_COMPRESSION_FACTOR);
    },
    isPointInside: function (point) {
        if(!this.enabled)
            return false;
        if(this.image == null)
            return false;
        this.calculateDimensions();
        var xCenter = helper.convertLengthFromPixelsToGridUnits(this.xOffset/constants.SCREEN_COMPRESSION_FACTOR);
        var yCenter = -helper.convertLengthFromPixelsToGridUnits(this.yOffset/constants.SCREEN_COMPRESSION_FACTOR);
        //top left is the first point, then bottom left, then bottom right, then top right
        var point1 = new Point(xCenter - (this.width / 2), yCenter - (this.height / 2));
        var point2 = new Point(xCenter - (this.width / 2), yCenter + (this.height / 2));
        var point3 = new Point(xCenter + (this.width / 2), yCenter + (this.height / 2));
        var point4 = new Point(xCenter + (this.width / 2), yCenter - (this.height / 2));
        var b1 = helper.getPointSide(point1, point2, point);
        var b2 = helper.getPointSide(point2, point3, point);
        var b3 = helper.getPointSide(point3, point4, point);
        var b4 = helper.getPointSide(point4, point1, point);
        if((b1 == b2) && (b2 == b3) && (b3 == b4))
            return true
        else{
            if(this.isSelected)
                this.redrawImageOnDraw();
            this.isSelected = false
            return false
        }
    },
    isMovingImage: function () {
        return (this.isSelected && this.moveImage);
    },
    enable: function () {
        this.enabled = true;
    },
    disable: function () {
        this.enabled = false;
        this.image = null;
        this.isSelected = false;
    },
    setSelected: function(value) {
        if(this.isSelected != value){
        this.isSelected = value;
        this.redrawImage = true;
        this.moveImage = false;
        }

    },
    setStaticOffset: function () {
        this.xOffsetStatic = this.xOffset;
        this.yOffsetStatic = this.yOffset;
    },
    setScale: function(value){
        this.scale = Math.abs(value);
        this.calculateDimensions();
    },
    setMoveImage: function (value) {
        this.moveImage = value;
    },
    setSource: function (source) {
        this.source = source;
        this.image = null;
    },
    setOffset: function (xOffset, yOffset) {
        this.xOffset = this.xOffsetStatic + xOffset;
        this.yOffset = this.yOffsetStatic + yOffset;
        this.redrawImageOnDraw();
    },
    redrawImageOnDraw: function () {
        this.redrawImage = true
    },
    getSavableInfo: function () {
        return [
            [XMLAttributes.VISIBLE, this.enabled], [XMLAttributes.FILE_PATH, (this.enabled ? this.source : '')]
        ];
    }
};

var drawables = {
    /* ---- Properties ---- */
    selectedDrawableIndex: -1,
    selectedEnd: -1,
    selectedDrawableType: '',
    constraints: new Constraints(),
    controlPolygon: new ControlPolygon(),
    linkage: new Linkage(),
    capturedPoses: new CapturedPoses(),
    newLinkType: LinkType.RR,
    newConstraintType: ConstraintType.POSE,
    refreshConstraints: false,
    showCaptured: false,
    generatedDyads: [],
    selectedDyads: [],
    history: new History(),
    curvePoseDensity: 10,
    curveThickness: 5,
    historyEvent: null,
    eventInProgress: false,
    noSolution: false,
    deleteCount: 0,
    initialPose: null,
    dyadVectors: [],

    /* ---- Methods ---- */
    addConstraint: function (point) {
        this.historyEvent = this.constraints.addConstraint(this.newConstraintType, -1, point);
        this.refreshConstraints = true;
    },
    addControlPoint: function (point) {
        this.controlPolygon.addControlPoint(point);
        this.refreshConstraints = true;
    },
    addLink: function (point, thresholdDistance) {
        var linkCount = this.linkage.getLinkCount();
        this.historyEvent = this.linkage.addLink(this.newLinkType, -1, point, -1, thresholdDistance);
        return linkCount;
    },
    setNewLinkType: function (linkType) {
        this.newLinkType = linkType;
    },
    setNewConstraintType: function (constraintType) {
        this.newConstraintType = constraintType;
    },
    setControlPolygonClosed: function (value) {
        this.controlPolygon.setAsClosed(value);
        this.refreshConstraints = true;
    },
    setCouplerCurvePoseDensity: function (value) {
        this.curvePoseDensity = helper.constrain(value, 0, 100);
        this.refreshConstraints = true;
    },
    getCouplerCurvePoseDensity: function () {
        return this.curvePoseDensity;
    },
    setCouplerCurveThickness: function (value) {
        this.curveThickness = helper.constrain(value, 1, 10);
        this.refreshConstraints = true;
    },
    getCouplerCurveThickness: function () {
        return this.curveThickness;
    },
    getCapturedPoseCount: function () {
        return this.capturedPoses.getCapturedPoses().length;
    },
    finalizeConstraints: function () {
        if (this.constraints.finalizeConstraints(this.newConstraintType)) {
            this.historyEvent = false;
        }
    },
    refreshConstraintsOnDraw: function () {
        this.refreshConstraints = true;
    },
    reSimulate: function (stationaryCouplerPoint = false) {
        this.refreshConstraintsOnDraw();
        this.linkage.completeLinkage(true, true, stationaryCouplerPoint);
    },
    annotate: function (context) {
        this.linkage.annotate(context);
    },
    draw: function (context, constraintLayerContext, inAnimation) {
        if (this.refreshConstraints) {
            this.constraints.draw(constraintLayerContext);
            this.controlPolygon.draw(constraintLayerContext);
            if (this.showCaptured)
                this.capturedPoses.draw(constraintLayerContext);
        }
        this.linkage.draw(context, constraintLayerContext, inAnimation, this.refreshConstraints, this.curvePoseDensity, this.curveThickness);
        this.refreshConstraints = false;
    },
    checkDrawableInProximity: function (point) {
       this.selectedEnd = -1;

        if (this.selectedDrawableIndex != -1 && this.selectedDrawableType == ConstraintType.POSE) {
            this.selectedEnd = this.constraints.checkForPoseRotation(this.selectedDrawableIndex, point);
        }

        if (this.selectedEnd == -1) {
            var constraintDistanceInfo = this.constraints.getClosestConstraintInfo(point);
            var controlPointDistanceInfo = this.controlPolygon.getClosestControlPointInfo(point);
            var linkDistanceInfo = this.linkage.getClosestLinkInfo(point);
            var imageSelectionState = canvasBackgroundImage.isPointInside(point);

            if (constraintDistanceInfo.constraintIndex != -1 && (constraintDistanceInfo.constraintType == ConstraintType.POINT_CONSTRAINT || (constraintDistanceInfo.constraintDistance <= controlPointDistanceInfo.controlPointDistance && constraintDistanceInfo.constraintDistance <= linkDistanceInfo.linkDistance))) {
                this.selectedEnd = constraintDistanceInfo.selectedEnd;
                this.selectedDrawableIndex = constraintDistanceInfo.constraintIndex;
                this.selectedDrawableType = constraintDistanceInfo.constraintType;
                this.constraints.selectConstraint(this.selectedDrawableType, this.selectedDrawableIndex);
                canvasBackgroundImage.setSelected(false);
            } else if (controlPointDistanceInfo.controlPointDistance < constraintDistanceInfo.constraintDistance && controlPointDistanceInfo.controlPointDistance <= linkDistanceInfo.linkDistance && controlPointDistanceInfo.controlPointIndex != -1) {
                this.selectedEnd = controlPointDistanceInfo.selectedEnd;
                this.selectedDrawableIndex = controlPointDistanceInfo.controlPointIndex;
                this.selectedDrawableType = controlPointDistanceInfo.constraintType;
                this.controlPolygon.selectControlPoint(this.selectedDrawableIndex);
                canvasBackgroundImage.setSelected(false);
            } else if (linkDistanceInfo.linkIndex != -1) {
                this.selectedEnd = linkDistanceInfo.selectedEnd;
                this.selectedDrawableIndex = linkDistanceInfo.linkIndex;
                this.selectedDrawableType = linkDistanceInfo.constraintType;
                this.linkage.selectLink(this.selectedDrawableType, this.selectedDrawableIndex, this.selectedEnd);
                canvasBackgroundImage.setSelected(false);
            } else if(imageSelectionState && applicationController.getCurrentMode() == Mode.SELECT) {
                this.selectedEnd = 0;
                this.selectedDrawableIndex = 1;
                this.selectedDrawableType = SelectionType.IMAGE;
                canvasBackgroundImage.setSelected(true);
            } else {
                this.selectedDrawableIndex = -1;
                this.selectedDrawableType = '';
            }
        }

        this.refreshConstraints = true;
        return this.selectedEnd;
    },
    hasSelection: function () {
        return (this.selectedDrawableIndex != -1);
    },
    isConstraintSelected: function () {
        return (this.hasSelection && (this.selectedDrawableType == ConstraintType.POSE || this.selectedDrawableType == ConstraintType.POINT_CONSTRAINT || this.selectedDrawableType == ConstraintType.LINE_CONSTRAINT ));
    },
    isJointSelected: function () {
        return (this.selectedDrawableType == SelectionType.LINK && this.selectedEnd != 0)
    },
    cancelSelection: function () {
        if (this.selectedDrawableIndex != -1) {
            if (this.selectedDrawableType == ConstraintType.POSE || this.selectedDrawableType == ConstraintType.POINT_CONSTRAINT || this.selectedDrawableType == ConstraintType.LINE_CONSTRAINT || this.selectedDrawableType == ConstraintType.PATH_CONSTRAINT)
                this.constraints.cancelSelection(this.selectedDrawableType, this.selectedDrawableIndex);
            else if (this.selectedDrawableType == SelectionType.CONTROL_POINT)
                this.controlPolygon.cancelSelection(this.selectedDrawableIndex);
            else if (this.selectedDrawableType == SelectionType.LINK || this.selectedDrawableType == SelectionType.COUPLER)
                this.linkage.cancelSelection(this.selectedDrawableType, this.selectedDrawableIndex);
            else if(this.selectedDrawableType == SelectionType.IMAGE)
                canvasBackgroundImage.setSelected(false);
        }

        this.refreshConstraints = true;
        this.selectedDrawableIndex = -1;
        this.selectedEnd = -1;
        this.selectedDrawableType = '';
    },
    deleteItems: function (option, state) {
        var updateDyads = false;
        this.noSolution = false;

        if (this.selectedDrawableIndex != -1 && option != -1) {
            this.beginEvent();

            if (this.selectedDrawableType == ConstraintType.POSE || this.selectedDrawableType == ConstraintType.POINT_CONSTRAINT || this.selectedDrawableType == ConstraintType.LINE_CONSTRAINT || this.selectedDrawableType == ConstraintType.PATH_CONSTRAINT)
                this.historyEvent = this.constraints.clear(this.selectedDrawableType, this.selectedDrawableIndex);
            else if (this.selectedDrawableType == SelectionType.CONTROL_POINT)
                this.controlPolygon.clear(this.selectedDrawableIndex);
            else if (this.selectedDrawableType == SelectionType.LINK) {
                var selectedAt = this.selectedDyads.getIndexOfObject(1, this.linkage.getLinkId(this.selectedDrawableIndex));

                if (selectedAt != -1) {
                    this.selectedDyads.splice(selectedAt, 1);
                    updateDyads = true;
                }

                this.historyEvent = this.linkage.clear(this.selectedDrawableIndex, state);
            } else if (this.selectedDrawableType == SelectionType.COUPLER)
                this.linkage.cancelSelection(this.selectedDrawableType, this.selectedDrawableIndex);
            else if(this.selectedDrawableType == SelectionType.IMAGE)
                applicationController.setBackgroundImage(false, '');

            this.completeEvent();
        } else {
            this.history.clear();
            this.constraints.clear('', -1);
            this.controlPolygon.clear(-1);
            this.linkage.clear(-1);
            this.capturedPoses.clear();
            linkIds.reset();
        }
        this.selectedDrawableIndex = -1;
        this.selectedDrawableType = '';
        this.selectedEnd = -1;
        this.refreshConstraints = true;
        return updateDyads;
    },
    setConstraintEndPoint: function (point) {
        var historyItem = this.constraints.setEndPoint(this.newConstraintType, -1, point);

        if (this.historyEvent && historyItem)
            this.historyEvent.setNewEndPoint(historyItem.getNewEndPoint());

        this.refreshConstraints = true;
    },
    setConstraintBehavior: function (hasSpecialBehavior) {
        var historyItem

        if (this.isConstraintSelected())
            historyItem = this.constraints.setBehavior(this.selectedDrawableType, this.selectedDrawableIndex, hasSpecialBehavior);

        if (historyItem)
            this.historyEvent = (historyItem instanceof Array) ? historyItem : historyItem.copy();

        if(this.isJointSelected){
            var resimulate = this.linkage.setBehavior(this.selectedDrawableType, this.selectedDrawableIndex, this.selectedEnd - 1, hasSpecialBehavior);
            if(resimulate){
                drawables.reSimulate();
                drawables.refreshConstraintsOnDraw();
            }
        };
    },
    getSelectionState: function () {
        var state = -1;
        if (this.isConstraintSelected() || this.isJointSelected()) {
            if (this.selectedDrawableType == ConstraintType.POSE){
                state = this.constraints.getBehavior(this.selectedDrawableType, this.selectedDrawableIndex);
            }

            else if (this.selectedDrawableType == ConstraintType.POINT_CONSTRAINT || this.selectedDrawableType == ConstraintType.LINE_CONSTRAINT){
                state = this.constraints.getBehavior(this.selectedDrawableType, this.selectedDrawableIndex);
            }

            else if (this.selectedDrawableType == SelectionType.LINK && this.selectedEnd != 0){
                state = this.linkage.getBehavior(this.selectedDrawableIndex, this.selectedEnd -1);
            }

            }else if(this.selectedDrawableType == SelectionType.LINK && this.selectedEnd == 0){
                state = this.linkage.getLinkColor(this.selectedDrawableIndex);
        }
        return state;
    },
    setJointGroundState: function (state) {
        if(this.selectedDrawableType == SelectionType.LINK && this.selectedEnd != 0)
            if(this.linkage.setJointGroundState(this.selectedDrawableIndex, this.selectedEnd - 1, state)){
                this.selectedEnd = 1;
                return true
            }
        else
            return false
    },
    setAsInput: function (state) {
        var change = this.linkage.setAsInput(this.selectedDrawableIndex, this.selectedEnd - 1, state);
        this.selectedDrawableIndex = change[0];
        this.selectedEnd = change[1];
    },
    setRPM: function (value) {
        if(this.selectedDrawableIndex != -1)
           var resimulate = this.linkage.setRPM(this.selectedDrawableIndex, this.selectedEnd - 1, value);
         if(resimulate){
            drawables.reSimulate();
            drawables.refreshConstraintsOnDraw();
        }

        return this.updateAnimationStep();
    },
    changeRotationDirection: function (index) {
        if(index == -1)
            this.linkage.changeRotationDirection(-1, 0);
        else
            if(this.selectedDrawableType == SelectionType.LINK)
                var resimulate = this.linkage.changeRotationDirection(this.selectedDrawableIndex, this.selectedEnd - 1);
        if(resimulate){
            drawables.reSimulate();
            drawables.refreshConstraintsOnDraw();
        }
    },
    updateAnimationStep: function () {
        var step = -1;
            var rpm = this.linkage.getRPM(this.linkage.getInputElements()[0]);
            var step =  rpm * 0.25 / 6; // these numbers were taken by recording the animation time.
        return step
    },
    setLinkColor: function(color) {
      this.linkage.setLinkColor(this.selectedDrawableIndex, color);
    },
    setControlPointLocation: function (point) {
        this.controlPolygon.setControlPoint(-1, point);
        this.refreshConstraints = true;
    },
    setLinkEndPoint: function (point, thresholdDistance) {
        var historyItem = this.linkage.setLinkEndPoint(-1, point, false, false, thresholdDistance);

        if (this.historyEvent && historyItem)
            this.historyEvent.setNewEndPoint(historyItem.getNewEndPoint());

        this.refreshConstraints = true;
    },
    setCouplerPoint: function (pose) {
        if (pose) {
            this.linkage.setCouplerPoint(pose.center, pose.angle);
            this.refreshConstraints = true;
        }
    },
    editDrawableStartPoint: function (point) {
        var changedConstraints = false;
        var historyItem = false;

        if (this.selectedDrawableIndex != -1) {
            if (this.selectedDrawableType == ConstraintType.POSE || this.selectedDrawableType == ConstraintType.POINT_CONSTRAINT || this.selectedDrawableType == ConstraintType.LINE_CONSTRAINT || this.selectedDrawableType == ConstraintType.PATH_CONSTRAINT) {
                historyItem = this.constraints.setStartPoint(this.selectedDrawableType, this.selectedDrawableIndex, point);
                changedConstraints = true;
            } else if (this.selectedDrawableType == SelectionType.CONTROL_POINT)
                this.controlPolygon.setControlPoint(this.selectedDrawableIndex, point);
            else if (this.selectedDrawableType == SelectionType.LINK) {
                historyItem = this.linkage.setLinkStartPoint(this.selectedDrawableIndex, point);
                this.linkage.completeLinkage(true, false, true);
            } else if (this.selectedDrawableType == SelectionType.COUPLER) {
                historyItem = this.linkage.setCouplerPoint(point, 0);
            }
        }

        if (historyItem != false) {
            if (this.historyEvent == null)
                this.historyEvent = historyItem.copy();
            else {
                this.historyEvent.setNewStartPoint(historyItem.getNewStartPoint());
                this.historyEvent.setNewEndPoint(historyItem.getNewEndPoint());
            }
        }

        this.refreshConstraints = true;
        return changedConstraints;
    },
    editDrawableEndPoint: function (point, previousPoint) {
        var changedConstraints = false;
        var historyItem = false;

        if (this.selectedDrawableIndex != -1) {
            if (this.selectedDrawableType == ConstraintType.POSE || this.selectedDrawableType == ConstraintType.POINT_CONSTRAINT || this.selectedDrawableType == ConstraintType.LINE_CONSTRAINT || this.selectedDrawableType == ConstraintType.PATH_CONSTRAINT) {
                historyItem = this.constraints.setEndPoint(this.selectedDrawableType, this.selectedDrawableIndex, point, previousPoint);
                changedConstraints = true;
            } else if (this.selectedDrawableType == SelectionType.LINK)
                if(this.selectedEnd == 2)
                    historyItem = this.linkage.setLinkEndPoint(this.selectedDrawableIndex, point, true, false);
                else if (this.selectedEnd == 3)
                    this.linkage.setLinkThirdPoint(this.selectedDrawableIndex, point, true, false)
        }

        if (historyItem != false) {
            if (this.historyEvent == null)
                this.historyEvent = historyItem.copy();
            else
                this.historyEvent.setNewEndPoint(historyItem.getNewEndPoint());
        }

        this.refreshConstraints = true;
        return changedConstraints;
    },
    mergeJoint: function(point){
        // this function will merge the joints if they are overlapping.
        var jointNumber = -1;

        if(this.selectedEnd==2) jointNumber = 1;
        else if(this.selectedEnd==3) jointNumber = 2;

        this.linkage.mergeJoint(this.selectedDrawableIndex, jointNumber, point);
        this.refreshConstraints = true;
        applicationController.refreshDisplay();
    },
    editDrawableValues: function (x, y, length, angle) {
        var point1 = new Point(x, y);
        var angleRadians = helper.toRadians(angle);
        length = (this.selectedDrawableType == ConstraintType.POSE) ? 1 : length;

        if (this.selectedDrawableIndex != -1) {
            if (this.selectedDrawableType == ConstraintType.POSE || this.selectedDrawableType == ConstraintType.POINT_CONSTRAINT || this.selectedDrawableType == ConstraintType.LINE_CONSTRAINT || this.selectedDrawableType == ConstraintType.PATH_CONSTRAINT) {
                this.constraints.setStartPoint(this.selectedDrawableType, this.selectedDrawableIndex, point1);
                this.constraints.setEndPoint(this.selectedDrawableType, this.selectedDrawableIndex, helper.getEndPoint(point1, length, angleRadians));
            } else if (this.selectedDrawableType == SelectionType.CONTROL_POINT) {
                this.controlPolygon.setControlPoint(this.selectedDrawableIndex, point1);
            } else if (this.selectedDrawableType == SelectionType.LINK) {
                if(this.selectedEnd == 0){
                this.linkage.setLinkStartPoint(this.selectedDrawableIndex, point1);
                this.linkage.setLinkEndPoint(this.selectedDrawableIndex, helper.getEndPoint(point1, length, angleRadians), true, false, Math.pow(10, -6));
                } else if(this.selectedEnd == 1)
                    this.editDrawableStartPoint(point1);
                else
                    this.editDrawableEndPoint(point1);
            } else if (this.selectedDrawableType == SelectionType.COUPLER) {
                //                this.linkage.setCouplerTracePoint(length, angleRadians);
                this.linkage.setCouplerPoint(point1, angleRadians);
            }
            this.refreshConstraints = true;
        }
    },
    getDimensions: function () {
        if (this.selectedDrawableIndex != -1) {
            if (this.selectedDrawableType == ConstraintType.POSE || this.selectedDrawableType == ConstraintType.POINT_CONSTRAINT || this.selectedDrawableType == ConstraintType.LINE_CONSTRAINT || this.selectedDrawableType == ConstraintType.PATH_CONSTRAINT)
                return this.constraints.getDimensions(this.selectedDrawableType, this.selectedDrawableIndex);
            else if (this.selectedDrawableType == SelectionType.CONTROL_POINT)
                return this.controlPolygon.getDimensions(this.selectedDrawableIndex);
            else if (this.selectedDrawableType == SelectionType.LINK || this.selectedDrawableType == SelectionType.COUPLER)
                return this.linkage.getDimensions(this.selectedDrawableType, this.selectedDrawableIndex);
            else
                return [];
        } else
            return [];
    },
    getConstraintBehavior: function () {
        var r = {
            text: '',
            value: false
        };

        if (this.isConstraintSelected()) {
            if (this.selectedDrawableType == ConstraintType.POSE){
                r.text = "Is Exact";
                r.value = this.constraints.getBehavior(this.selectedDrawableType, this.selectedDrawableIndex);
            }

            else if (this.selectedDrawableType == ConstraintType.POINT_CONSTRAINT || this.selectedDrawableType == ConstraintType.LINE_CONSTRAINT){
                r.text = "Is Moving";
                r.value = this.constraints.getBehavior(this.selectedDrawableType, this.selectedDrawableIndex);
            }

//            else if (this.selectedDrawableType == SelectionType.LINK && this.selectedEnd != 0){
//                r.text = "Plot Curve";
//                r.value = this.linkage.getBehavior(this.selectedDrawableType, this.selectedDrawableIndex, this.selectedEnd);
//            }

        }

        return r;
    },
    getLinkageType: function () {
        return this.noSolution ? "No Solution" : this.linkage.getLinkageType();
    },
    captureCouplerPose: function () {
        var pose = this.linkage.capturePose();
        if (pose != false) {
            this.showCaptured = true;
            this.capturedPoses.addToCapturedPoses(pose);
            this.refreshConstraints = true;
        }
    },
    switchLinkClass: function () {
        if(this.selectedDrawableType == SelectionType.LINK){
        this.linkage.switchLinkClass(this.selectedDrawableIndex)
        return true;
        }
        else
            return false;
    },
    hasConstraints: function () {
      return this.constraints.hasConstraints();
    },

    /* --- ---*/
    exportCouplerCurve: function () {
        return this.linkage.exportCouplerCurve();
    },
    exportData: function (context) {
        var result = {
            image: null,
            success: false,
            linkageDetail: {
                joints: [],
                lengths: [],
                angles: []
            },
            constraintData: [],
            capturedData: [],

            hasLinkage: false,
            isTraditionalFourBar: false,
            linkageType: "Linkage"
        };

        this.constraints.getSavableInfo().forEach(function (item) {
            var dataObj = {};

            item.forEach(function (attr) {
                dataObj[attr[0]] = attr[1];
            });

            result.constraintData.push(dataObj);
        });

        this.capturedPoses.getSavableInfo().forEach(function (item) {
            var dataObj = {};

            item.forEach(function (attr) {
                dataObj[attr[0]] = attr[1];
            });

            result.capturedData.push(dataObj);
        });

        var data = this.linkage.getLinkageDetails();

        if (drawables.linkage.isTraditionalFourBar()) {
            graphicsGeometry.drawOnExportCanvas(context, data.linkData[0], data.linkData[1], data.couplerData);
            var cData = (data.linkData[0][3] == LinkType.RP || data.linkData[1][3] == LinkType.RP) ? (LinkageSymbols.COUPLER_JOINT + " : (" + (data.linkData[0][3] == LinkType.RP ? (data.couplerData[0].x.toFixed(4) + ", " + data.couplerData[0].y.toFixed(4)) : (data.couplerData[2].x.toFixed(4) + ", " + data.couplerData[2].y.toFixed(4))) + "),  ") : "";
            var startPointSymbol = (data.linkData[0][3] == LinkType.RP) ? LinkageSymbols.COUPLER_JOINT : LinkageSymbols.CRANK_MOVING_PIVOT;
            result.hasLinkage = true;
            result.isTraditionalFourBar = true;
            result.linkageType = data.linkData[0][3] + (data.linkData[1][3] == LinkType.RR ? LinkType.RR : (data.linkData[1][3] == LinkType.PR ? LinkType.RP : LinkType.PR));


            /* ---- Joints ---- */
            result.linkageDetail.joints.push({
                symbol: LinkageSymbols.CRANK_FIXED_PIVOT,
                desc: 'Fixed Pivot (Driving Link)',
                x: data.linkData[0][0].x.toFixed(4),
                y: data.linkData[0][0].y.toFixed(4)
            });
            result.linkageDetail.joints.push({
                symbol: LinkageSymbols.CRANK_MOVING_PIVOT,
                desc: 'Moving Pivot (Driving Link)',
                x: data.linkData[0][1].x.toFixed(4),
                y: data.linkData[0][1].y.toFixed(4)
            });
            // IF driving is RP
            if (data.linkData[0][3] == LinkType.RP) {
                result.linkageDetail.joints.push({
                    symbol: LinkageSymbols.COUPLER_JOINT,
                    desc: 'Coupler Joint 1',
                    x: data.couplerData[0].x.toFixed(4),
                    y: data.couplerData[0].y.toFixed(4)
                });
            }
            result.linkageDetail.joints.push({
                symbol: LinkageSymbols.COUPLER_POINT,
                desc: 'Coupler End Point',
                x: data.couplerData[1].x.toFixed(4),
                y: data.couplerData[1].y.toFixed(4)
            });
            //IF driven is RP
            if (data.linkData[1][3] == LinkType.RP) {
                result.linkageDetail.joints.push({
                    symbol: LinkageSymbols.COUPLER_JOINT,
                    desc: 'Coupler Joint 2',
                    x: data.couplerData[2].x.toFixed(4),
                    y: data.couplerData[2].y.toFixed(4)
                });
            }
            result.linkageDetail.joints.push({
                symbol: LinkageSymbols.FOLLOWER_MOVING_PIVOT,
                desc: 'Moving Pivot (Driven Link)',
                x: data.linkData[1][1].x.toFixed(4),
                y: data.linkData[1][1].y.toFixed(4)
            });
            result.linkageDetail.joints.push({
                symbol: LinkageSymbols.FOLLOWER_FIXED_PIVOT,
                desc: 'Fixed Pivot (Driven Link)',
                x: data.linkData[1][0].x.toFixed(4),
                y: data.linkData[1][0].y.toFixed(4)
            });


            /* ---- Link Lengths ---- */
            result.linkageDetail.lengths.push({
                link: LinkageSymbols.CRANK_FIXED_PIVOT + LinkageSymbols.FOLLOWER_FIXED_PIVOT,
                name: 'Ground Link',
                length: helper.getDistance(data.linkData[0][0].x, data.linkData[0][0].y, data.linkData[1][0].x, data.linkData[1][0].y).toFixed(4)
            });
            result.linkageDetail.lengths.push({
                link: LinkageSymbols.CRANK_FIXED_PIVOT + LinkageSymbols.CRANK_MOVING_PIVOT,
                name: 'Crank',
                length: helper.getDistance(data.linkData[0][0].x, data.linkData[0][0].y, data.linkData[0][1].x, data.linkData[0][1].y).toFixed(4)
            });
            result.linkageDetail.lengths.push({
                link: LinkageSymbols.FOLLOWER_FIXED_PIVOT + LinkageSymbols.FOLLOWER_MOVING_PIVOT,
                name: 'Follower',
                length: helper.getDistance(data.linkData[1][0].x, data.linkData[1][0].y, data.linkData[1][1].x, data.linkData[1][1].y).toFixed(4)
            });

            if (data.linkData[0][3] != LinkType.RP || data.linkData[1][3] != LinkType.RP) {
                result.linkageDetail.lengths.push({
                    link: ((data.linkData[0][3] == LinkType.RP) ? LinkageSymbols.COUPLER_JOINT : LinkageSymbols.CRANK_MOVING_PIVOT) + ((data.linkData[1][3] == LinkType.RP) ? LinkageSymbols.COUPLER_JOINT : LinkageSymbols.FOLLOWER_MOVING_PIVOT),
                    name: 'Coupler Fixed Length',
                    length: helper.getDistance(data.couplerData[0].x, data.couplerData[0].y, data.couplerData[2].x, data.couplerData[2].y).toFixed(4)
                });
            }

            result.linkageDetail.lengths.push({
                link: ((data.linkData[0][3] == LinkType.RP) ? LinkageSymbols.COUPLER_JOINT : LinkageSymbols.CRANK_MOVING_PIVOT) + LinkageSymbols.COUPLER_POINT,
                name: 'Coupler Arm Length',
                length: helper.getDistance(data.couplerData[0].x, data.couplerData[0].y, data.couplerData[1].x, data.couplerData[1].y).toFixed(4)
            });


            /* ---- Link Angles ---- */
            result.linkageDetail.angles.push({
                angle: LinkageSymbols.FOLLOWER_FIXED_PIVOT + LinkageSymbols.CRANK_FIXED_PIVOT + LinkageSymbols.CRANK_MOVING_PIVOT,
                name: 'Crank Angle',
                value: helper.toDegrees(data.linkData[0][2] - helper.getInclination(data.linkData[0][0], data.linkData[1][0])).toFixed(2)
            });
            result.linkageDetail.angles.push({
                angle: LinkageSymbols.CRANK_FIXED_PIVOT + LinkageSymbols.FOLLOWER_FIXED_PIVOT + LinkageSymbols.FOLLOWER_MOVING_PIVOT,
                name: '180 - Follower Angle',
                value: helper.toDegrees(helper.getInclination(data.linkData[0][0], data.linkData[1][0]) + Math.PI - data.linkData[1][2]).toFixed(2)
            });

            if (data.linkData[0][3] != LinkType.RP || data.linkData[1][3] != LinkType.RP) {
                result.linkageDetail.angles.push({
                    angle: LinkageSymbols.COUPLER_POINT + ((data.linkData[0][3] == LinkType.RP) ? LinkageSymbols.COUPLER_JOINT : LinkageSymbols.CRANK_MOVING_PIVOT) + ((data.linkData[1][3] == LinkType.RP) ? LinkageSymbols.COUPLER_JOINT : LinkageSymbols.FOLLOWER_MOVING_PIVOT),
                    name: 'Coupler Arm Angle',
                    value: helper.toDegrees(helper.getInclination(data.couplerData[0], data.couplerData[1]) - helper.getInclination(data.couplerData[0], data.couplerData[2])).toFixed(2)
                });
            } else {
                result.linkageDetail.angles.push({
                    angle: LinkageSymbols.CRANK_MOVING_PIVOT + LinkageSymbols.COUPLER_JOINT + LinkageSymbols.COUPLER_POINT,
                    name: 'Coupler Arm Angle',
                    value: helper.toDegrees(helper.getInclination(data.couplerData[0], data.linkData[0][2]) - helper.getInclination(data.couplerData[0], data.couplerData[1])).toFixed(2)
                });
            }

            result.linkageDetail.angles.push({
                angle: '-',
                name: 'Crank End Effector Angle (Global Coordinates)',
                value: helper.toDegrees(data.couplerData[3]).toFixed(2)
            });

            //            result.linkageDetail = ["Joint Locations:\n\n" +
            //                                    LinkageSymbols.CRANK_FIXED_PIVOT + " : (" + data.linkData[0][0].x.toFixed(4) + ", " + data.linkData[0][0].y.toFixed(4) + "),  "
            //                                    + LinkageSymbols.FOLLOWER_FIXED_PIVOT + " : (" + data.linkData[1][0].x.toFixed(4) + ", " + data.linkData[1][0].y.toFixed(4) + "),  "
            //                                    + LinkageSymbols.CRANK_MOVING_PIVOT + " : (" + data.linkData[0][1].x.toFixed(4) + ", " + data.linkData[0][1].y.toFixed(4) + "),\n"
            //                                    + LinkageSymbols.FOLLOWER_MOVING_PIVOT + " : (" + data.linkData[1][1].x.toFixed(4) + ", " + data.linkData[1][1].y.toFixed(4) + "),  "
            //                                    + cData
            //                                    + LinkageSymbols.COUPLER_POINT + " : (" + data.couplerData[1].x.toFixed(4) + ", " + data.couplerData[1].y.toFixed(4) + ")",
            //
            //                                    "Link Lengths:\n\n" + LinkageSymbols.CRANK_FIXED_PIVOT + LinkageSymbols.FOLLOWER_FIXED_PIVOT + " (Ground Link Length) : " + helper.getDistance(data.linkData[0][0].x, data.linkData[0][0].y, data.linkData[1][0].x, data.linkData[1][0].y).toFixed(4) + "\n"
            //                                      + LinkageSymbols.CRANK_FIXED_PIVOT + LinkageSymbols.CRANK_MOVING_PIVOT + " (Crank Length) : " + helper.getDistance(data.linkData[0][0].x, data.linkData[0][0].y, data.linkData[0][1].x, data.linkData[0][1].y).toFixed(4) + "\n"
            //                                      + LinkageSymbols.CRANK_MOVING_PIVOT + LinkageSymbols.FOLLOWER_MOVING_PIVOT + " (Coupler Length) : " + helper.getDistance(data.linkData[0][1].x, data.linkData[0][1].y, data.linkData[1][1].x, data.linkData[1][1].y).toFixed(4) + "\n"
            //                                      + LinkageSymbols.FOLLOWER_FIXED_PIVOT + LinkageSymbols.FOLLOWER_MOVING_PIVOT + " (Follower Length) : " + helper.getDistance(data.linkData[1][0].x, data.linkData[1][0].y, data.linkData[1][1].x, data.linkData[1][1].y).toFixed(4) + "\n"
            //                                      + startPointSymbol + LinkageSymbols.COUPLER_POINT + " (Coupler Arm Length) : " + helper.getDistance(data.couplerData[0].x, data.couplerData[0].y, data.couplerData[1].x, data.couplerData[1].y).toFixed(4) + ((data.linkData[0][3] == LinkType.RP) ? ("\n" + LinkageSymbols.CRANK_MOVING_PIVOT + LinkageSymbols.COUPLER_JOINT + " : " + helper.getDistance(data.linkData[0][1].x, data.linkData[0][1].y, data.couplerData[0].x, data.couplerData[0].y).toFixed(4)) : "") + ((data.linkData[1][3] == LinkType.RP) ? ("\n" + LinkageSymbols.FOLLOWER_MOVING_PIVOT + LinkageSymbols.COUPLER_JOINT + " : " + helper.getDistance(data.linkData[1][1].x, data.linkData[1][1].y, data.couplerData[0].x, data.couplerData[0].y).toFixed(4)) : ""),
            //                "Angles:\n\n" + "Crank Angle : " + helper.toDegrees(data.linkData[0][2]).toFixed(4) + "\nFollower Angle : " + helper.toDegrees(data.linkData[1][2]).toFixed(4)
            //            ];
        } else if(drawables.linkage.getDegreeOfFreedom() == 1) {
            result.hasLinkage = true;
            data.jointData.forEach(function (item) {
                var dataObj = {};

                item.forEach(function (attr) {
                    dataObj[attr[0]] = attr[1];
                });

                result.linkageDetail.joints.push(dataObj)
            });
            data.linkData.forEach(function (item) {

                result.linkageDetail.lengths.push({
                    link: item.name,
                    name: item.desc,
                    length: item.length
                });
                result.linkageDetail.angles.push({
                    angle: item.angleName,
                    value: item.value
                });
                if(item.angle1 > '')
                    result.linkageDetail.angles.push({
                        angle: item.angle1,
                        value: item.value1
                    });
            });

        }

        result.success = (result.constraintData.length || result.capturedData.length || result.hasLinkage);
        return result;
    },
    getSavableConstraintsInfo: function () {
        return this.constraints.getSavableInfo();
    },
    getSavableLinksInfo: function () {
        return this.linkage.getSavableInfo();
    },
    getSavableLinksData: function () {
        return this.linkage.getSavableData();
    },
    getSavableCapturedInfo: function () {
        return [[
            [XMLAttributes.SHOW_CAPTURED, this.showCaptured]
        ]].concat(this.capturedPoses.getSavableInfo());
    },
    getSavableSynthesisResultInfo: function () {
        var info = [];

        info.push([
            [XMLAttributes.SELECTED, this.getSelectedDyads() + '']
        ]);

        this.generatedDyads.forEach(function (dyad, index) {
            info.push([
                [XMLAttributes.TYPE, dyad.linkType],
                [XMLAttributes.X, dyad.point1.x],
                [XMLAttributes.Y, dyad.point1.y],
                [XMLAttributes.X1, dyad.point2.x],
                [XMLAttributes.Y1, dyad.point2.y],
                [XMLAttributes.ANGLE, dyad.initialAngle || 0],
                [XMLAttributes.LENGTH, dyad.length],
                [XMLAttributes.MOVING_PIVOT, dyad.linem + ''],
                [XMLAttributes.MOVING_LINE, dyad.point2m + ''],
                [XMLAttributes.TRUE_DYAD, dyad.trueDyad || false],
            ]);
        });

        return info;
    },
    getSavableDyadVectors: function () {
        var info = [];
        this.dyadVectors.forEach(function (qi, i) {
            info.push([
                ['q1', qi[0]],
                ['q2', qi[1]],
                ['q3', qi[2]],
                ['q4', qi[3]],
                ['q5', qi[4]],
                ['q6', qi[5]],
                ['q7', qi[6]],
                ['q8', qi[7]]
            ]);
        });

        return info;
    },
    getSavableTextInfo: function () {
        var r=[];
        r.push('Posses: ');
        r.push('// Enter each pose info on new line in following format; no need to delete this line, it will  be read as comment');
        r.push('// x-coordinate <space> y-coordinate <space> angle(in Degrees)');

        this.constraints.getSavableInfo().forEach(function (item) {
            var dataObj = {};
            item.forEach(function (attr) {
                dataObj[attr[0]] = attr[1];
            });

            if(dataObj.type = ConstraintType.POSE){
                var pose = String(dataObj.x) + ' ' + String(dataObj.y) + ' ' + String(dataObj.angle);
                r.push(pose);
            }
            });

        r = r.concat(this.linkage.getSavableTextData());
        return r
    },

    /* --- ---*/
    loadCapturedExample: function () {
        var capturedPoses = this.capturedPoses.getCapturedPoses();
        this.showCaptured = false;

        this.linkage.clear(-1);
        this.constraints.clear();

        this.history.startNewEvent();

        for (var i = 0; i < capturedPoses.length; i++) {
            this.history.pushIntoHistory(this.constraints.addPoseExplicitly(capturedPoses[i].center.x, capturedPoses[i].center.y, capturedPoses[i].angle));
        }

        //        this.history.pushIntoHistory(this.constraints.addLineConstraint(-0.7071067811865475, 0.7071067811865476, 3.3306690738754696e-16));
    },
    loadArbitraryFivePositions: function (width, heigth) {
        this.linkage.clear(-1);
        this.constraints.clear();

        this.history.startNewEvent();

        for (var i = 0; i < 5; i++) {
            var x = ((Math.random().toFixed(2) - 0.5) * Math.abs(width) / 2);
            var y = ((Math.random().toFixed(2) - 0.5) * Math.abs(heigth) / 2);
            var angle = (Math.random().toFixed(2) * 360);

            this.history.pushIntoHistory(this.constraints.addPoseExplicitly(x, y, angle * Math.PI / 180));
        }

    },
    loadArbitraryFourPositions: function (width, heigth) {
        this.linkage.clear(-1);
        this.constraints.clear();

        this.history.startNewEvent();

        for (var i = 0; i < 4; i++) {
            var x = ((Math.random().toFixed(2) - 0.5) * Math.abs(width) / 2);
            var y = ((Math.random().toFixed(2) - 0.5) * Math.abs(heigth) / 2);
            var angle = (Math.random().toFixed(2) * 360);

            this.history.pushIntoHistory(this.constraints.addPoseExplicitly(x, y, angle * Math.PI / 180));
        }

        this.history.pushIntoHistory(this.constraints.addLineConstraint(1, -1, 0));
    },

    /* --- Load from Files ---- */
    loadConstraintsFromXMLFile: function (constraintInfo) {
        this.constraints.clear();

        for (var i = 0; i < constraintInfo.length; i++) {
            if (constraintInfo[i][XMLAttributes.TYPE] == ConstraintType.POSE || constraintInfo[i][XMLAttributes.TYPE] == ConstraintType.POINT_CONSTRAINT || constraintInfo[i][XMLAttributes.TYPE] == ConstraintType.LINE_CONSTRAINT) {
                var length = (constraintInfo[i][XMLAttributes.TYPE] == ConstraintType.LINE_CONSTRAINT) ? parseFloat(constraintInfo[i][XMLAttributes.LENGTH]) : ((constraintInfo[i][XMLAttributes.TYPE] == ConstraintType.POSE) ? 1 : 0);
                var angle = helper.toRadians((constraintInfo[i][XMLAttributes.TYPE] == ConstraintType.POINT_CONSTRAINT) ? 0 : parseFloat(constraintInfo[i][XMLAttributes.ANGLE]));
                var startPoint = new Point(parseFloat(constraintInfo[i][XMLAttributes.X]), parseFloat(constraintInfo[i][XMLAttributes.Y]));
                var endPoint = helper.getEndPoint(startPoint, length, angle);

                this.constraints.addConstraint(constraintInfo[i][XMLAttributes.TYPE], -1, startPoint);
                this.constraints.setEndPoint(constraintInfo[i][XMLAttributes.TYPE], -1, endPoint);
                this.constraints.setBehavior(constraintInfo[i][XMLAttributes.TYPE], -1, (constraintInfo[i][XMLAttributes.BEHAVIOR] == ConstraintBehavior.EXACT || constraintInfo[i][XMLAttributes.BEHAVIOR] == ConstraintBehavior.MOVING));
            } else if(constraintInfo[i][XMLAttributes.TYPE] == ConstraintType.PATH_CONSTRAINT){
                var startPoint = new Point(parseFloat(constraintInfo[i][XMLAttributes.X]), parseFloat(constraintInfo[i][XMLAttributes.Y]));
                this.constraints.addConstraint(constraintInfo[i][XMLAttributes.TYPE], -1, startPoint);
            }

        }

    },
    loadPosesFromTextFile: function (poseInfo) {
        this.constraints.clear();

        for (var i = 0; i < poseInfo.length; i++) {
                var length = 1;
                var angle = helper.toRadians(parseFloat(poseInfo[i].angle));
                var startPoint = new Point(parseFloat(poseInfo[i].x), parseFloat(poseInfo[i].y));
                var endPoint = helper.getEndPoint(startPoint, length, angle);

                this.constraints.addConstraint(ConstraintType.POSE, -1, startPoint);
                this.constraints.setEndPoint(ConstraintType.POSE, -1, endPoint);
                this.constraints.setBehavior(ConstraintType.POSE, -1, false);
        }

    },
    loadLinkageFromTextFile: function (joints, links) {
        // this function reads the text input and then adds links into the models.
        //merge joint is used only if the distance is zero as we need to only merge those joitns and let user add joints which are really close

        for(var i=0; i < links.length; i++){
            if(links[i].joint3 != undefined)
                this.setNewLinkType('RR');
            else{
                var type = String((joints[links[i].joint1 - 1].type == 0) ? 'R' : 'P') + String((joints[links[i].joint2 - 1].type == 0) ? 'R' : 'P');
                this.setNewLinkType(type);
            }
            var startPoint = new Point(parseFloat(joints[links[i].joint1 - 1].x),parseFloat(joints[links[i].joint1 - 1].y));
            var endPoint = new Point(parseFloat(joints[links[i].joint2 - 1].x), parseFloat(joints[links[i].joint2 - 1].y));
            this.linkage.addLink(this.newLinkType, -1, startPoint, -1, Math.pow(10, -6), true);
            if(joints[links[i].joint1 - 1].isGround)
                this.linkage.setJointGroundState(-1, 0, true);
            this.setLinkEndPoint(endPoint, Math.pow(10, -6));
            this.linkage.mergeJoint(-1, 1, endPoint, Math.pow(10,-6));
            if(links[i].joint3 != undefined){
                this.linkage.switchLinkClass(this.linkage.getLinkCount() - 1);
                var thirdPoint = new Point(parseFloat(joints[links[i].joint3 - 1].x), parseFloat(joints[links[i].joint3 - 1].y));
                this.linkage.setLinkThirdPoint(this.linkage.getLinkCount() - 1, thirdPoint, true, false,  Math.pow(10, -6));
                this.linkage.mergeJoint(-1, 2, thirdPoint, Math.pow(10,-6));
            }
            if(links[i].color != undefined)
                this.linkage.setLinkColor(this.linkage.getLinkCount() - 1, links[i].color)
        }

    },
    loadCapturedConstraintsFromXMLFile: function (capturedInfo) {
        this.capturedPoses.clear();
        var currentObj = this;

        this.showCaptured = (capturedInfo.info && !$.isEmptyObject(capturedInfo.info)) ? (capturedInfo.info[XMLAttributes.SHOW_CAPTURED] == 'true') : true;

        capturedInfo.data.forEach(function (constraint) {
            currentObj.capturedPoses.addToCapturedPoses(new Pose(parseFloat(constraint[XMLAttributes.X]), parseFloat(constraint[XMLAttributes.Y]), helper.toRadians(parseFloat(constraint[XMLAttributes.ANGLE]))));
        });
    },
    loadSynthResultsFromXMLFile: function (synthInfo) {
        this.clearDyads();

        var currentObj = this;

        var selectedDyads = (synthInfo.info && !$.isEmptyObject(synthInfo.info)) ? (synthInfo.info[XMLAttributes.SELECTED].split(',').toNumbers()) : [];

        synthInfo.data.forEach(function (dyad) {
            currentObj.generatedDyads.push({
                point1: new Point(parseFloat(dyad[XMLAttributes.X]), parseFloat(dyad[XMLAttributes.Y])),
                point2: new Point(parseFloat(dyad[XMLAttributes.X1]), parseFloat(dyad[XMLAttributes.Y1])),
                point2m: dyad[XMLAttributes.MOVING_PIVOT].split(',').toNumbers(),
                linem: dyad[XMLAttributes.MOVING_LINE].split(',').toNumbers(),
                length: parseFloat(dyad[XMLAttributes.LENGTH]),
                initialAngle: parseFloat(dyad[XMLAttributes.ANGLE]),
                linkType: dyad[XMLAttributes.TYPE],
                trueDyad: (dyad[XMLAttributes.TRUE_DYAD] == 'true')
            });
        });

        selectedDyads.forEach(function (index) {
            drawables.setDyad(index);
        });
    },
    loadLinkageFromXMLFile: function (linkInfo) {
        //let startTime = new Date().getTime()
        var triggerBranchChange = false;
        var stationaryCouplerPoint = false;
            this.clearDyads();
            this.linkage.clear(-1);
            var currentObj = this;

        //let endTime = new Date().getTime()
        //console.log('Reseting took', endTime - startTime, ' miliseconds.')

        //startTime = new Date().getTime()

            linkInfo.data.forEach(function (link) {
                if (link[XMLAttributes.TYPE] == SelectionType.COUPLER) {
                    if (linkInfo.info[XMLAttributes.DRIVING] != '0')
                        currentObj.linkage.interchangeCrankElement();

                    if (linkInfo.info[XMLAttributes.CHANGE_BRANCH] == 'true') {
                        triggerBranchChange = true;
                        currentObj.linkage.changeBranch();
                    }

                    currentObj.linkage.setCouplerTracePoint(parseFloat(link[XMLAttributes.LENGTH]), helper.toRadians(parseFloat(link[XMLAttributes.ANGLE])), helper.toRadians(parseFloat(link[XMLAttributes.ORIENTATION])), true);
                    this.refreshConstraints = true;
                    stationaryCouplerPoint = true;
                } else {
                    currentObj.setNewLinkType(link[XMLAttributes.TYPE]);
                    var startPoint = new Point(parseFloat(link[XMLAttributes.X]), parseFloat(link[XMLAttributes.Y]));
                    var endPoint = new Point(parseFloat(link[XMLAttributes.X1]), parseFloat(link[XMLAttributes.Y1]));
                    currentObj.linkage.addLink(currentObj.newLinkType, -1, startPoint, -1, Math.pow(10, -6), true, link["isSnappyXOLink"], link["isLengthLocked"], link["lockedLength"]);
                    if(JSON.parse(link[XMLAttributes.GROUND] == undefined ? false : link[XMLAttributes.GROUND]))
                        currentObj.linkage.setJointGroundState(-1, 0, true);
                    currentObj.setLinkEndPoint(endPoint, Math.pow(10, -6));
                    currentObj.linkage.mergeJoint(-1, 1, endPoint, Math.pow(10,-6));
                    var linkIndex = currentObj.linkage.getLinkCount() -1;
                    currentObj.linkage.setLinkColor(linkIndex, (link[XMLAttributes.COLOR]));
                    currentObj.linkage.setRPM(linkIndex, 0, (link[XMLAttributes.RPM]));
                    if(parseFloat(link[XMLAttributes.DIRECTION]) != 1)
                        currentObj.linkage.changeRotationDirection(linkIndex, 0);
                    if(link[XMLAttributes.CLASS] == LinkClass.TERNARY){
                        currentObj.linkage.switchLinkClass(linkIndex);
                        var thirdPoint = new Point(parseFloat(link[XMLAttributes.X2]), parseFloat(link[XMLAttributes.Y2]));
                        currentObj.linkage.setLinkThirdPoint(linkIndex, thirdPoint, true, false,  Math.pow(10, -6));
                        currentObj.linkage.mergeJoint(-1, 2, thirdPoint, Math.pow(10,-6));
                    }
                    var plotCurves = JSON.parse('[' + link[XMLAttributes.PLOT] + ']');
                    //for(var pt = 0; pt < plotCurves.length; pt++)
                    //    currentObj.linkage.setBehavior(SelectionType.LINK, linkIndex, pt, plotCurves[pt])

                }
            });
        //endTime = new Date().getTime()
        //console.log('Adding Links took', endTime - startTime, ' miliseconds.')
        //startTime = new Date().getTime()
        if(linkInfo.info[XMLAttributes.DRIVING] != undefined)
            this.linkage.setInputElements(linkInfo.info[XMLAttributes.DRIVING], JSON.parse('[' + linkInfo.info[XMLAttributes.OTHER_INPUTS] + ']'));
        drawables.reSimulate(stationaryCouplerPoint);
        //endTime = new Date().getTime()
        //console.log('Running Last Chunk of Code Took', endTime - startTime, ' miliseconds.')
        return triggerBranchChange;
    },

    /*
        Load from Local Storage
                    parseInt(helper.getValueInList(bgImageInfo, XMLAttributes.OPACITY)));
    */

    // Load a set of constraints from local storage
    loadConstraintsFromLocalStorage: function (constraintInfo) {
        this.constraints.clear();

        for (var i = 0; i < constraintInfo.length; i++) {
            var type = helper.getValueInList(constraintInfo[i],
                XMLAttributes.TYPE);
            // Check that it's a valid type?
            if (type == ConstraintType.POSE ||
                type == ConstraintType.POINT_CONSTRAINT ||
                type == ConstraintType.LINE_CONSTRAINT) {
                var length = (type == ConstraintType.LINE_CONSTRAINT) ?
                    parseFloat(helper.getValueInList(constraintInfo[i], XMLAttributes.LENGTH)) :
                    ((type == ConstraintType.POSE) ? 1 : 0);

                var angle = helper.toRadians((type == ConstraintType.POINT_CONSTRAINT) ? 0 :
                    parseFloat(helper.getValueInList(constraintInfo[i], XMLAttributes.ANGLE)));

                var startPoint = new Point(parseFloat(helper.getValueInList(constraintInfo[i], XMLAttributes.X)),
                    parseFloat(helper.getValueInList(constraintInfo[i], XMLAttributes.Y)));

                var endPoint = helper.getEndPoint(startPoint, length, angle);
                var behavior = helper.getValueInList(constraintInfo[i], XMLAttributes.BEHAVIOR);

                this.constraints.addConstraint(type, -1, startPoint);
                this.constraints.setEndPoint(type, -1, endPoint);
                this.constraints.setBehavior(type, -1, (behavior == ConstraintBehavior.EXACT ||
                    behavior == ConstraintBehavior.MOVING));
            }
        }
        this.firstPose = this.constraints.poses[0];

    },

    // Load a set of captured constarints from local storage
    loadCapturedConstraintsFromLocalStorage: function (capturedInfo) {
        this.capturedPoses.clear();

        var showCap = helper.getValueInList(capturedInfo[0], XMLAttributes.SHOW_CAPTURED);
        this.showCaptured = (capturedInfo[0] && !$.isEmptyObject(capturedInfo[0])) ? (showCap == 'true') : true;

        // Create a new pose for each captured constraint
        for (var i = 1; i < capturedInfo.length; i++) {
            var x = parseFloat(helper.getValueInList(capturedInfo[i], XMLAttributes.X));
            var y = parseFloat(helper.getValueInList(capturedInfo[i], XMLAttributes.Y));
            var angle = helper.toRadians(parseFloat(
                helper.getValueInList(capturedInfo[i], XMLAttributes.ANGLE)));
            this.capturedPoses.addToCapturedPoses(new Pose(x, y, angle));
        }

    },

    // Load a set of synthesis results from local storage
    loadSynthResultsFromLocalStorage: function (synthInfo) {
        this.clearDyads();

        // Load the selected dyads
        var selectedDyads = (synthInfo[0] && !$.isEmptyObject(synthInfo[0])) ?
            (helper.getValueInList(synthInfo[0], XMLAttributes.SELECTED).split(',').toNumbers()) : [];

        // Load each dyad from the table
        for (var i = 1; i < synthInfo.length; i++) {
            var dyad = synthInfo[i]
            this.generatedDyads.push({
                point1: new Point(parseFloat(helper.getValueInList(dyad, XMLAttributes.X)),
                    parseFloat(helper.getValueInList(dyad, XMLAttributes.Y))),
                point2: new Point(parseFloat(helper.getValueInList(dyad, XMLAttributes.X1)),
                    parseFloat(helper.getValueInList(dyad, XMLAttributes.Y1))),
                point2m: helper.getValueInList(dyad,
                    XMLAttributes.MOVING_PIVOT).split(',').toNumbers(),
                linem: helper.getValueInList(dyad,
                    XMLAttributes.MOVING_LINE).split(',').toNumbers(),
                length: parseFloat(helper.getValueInList(dyad, XMLAttributes.LENGTH)),
                initialAngle: parseFloat(helper.getValueInList(dyad, XMLAttributes.ANGLE)),
                linkType: helper.getValueInList(dyad, XMLAttributes.TYPE),
                trueDyad: (helper.getValueInList(dyad, XMLAttributes.TRUE_DYAD) == 'true')
            });
        }

        // Set the selected dyads
        selectedDyads.forEach(function (index) {
            drawables.setDyad(index);
        });

    },

    // Load a linkage from local storage data
    loadLinkageFromLocalStorage: function (linkInfo) {

        var triggerBranchChange = false;
        if (this.selectedDyads.length == 0) {
            this.linkage.clear(-1);

            var driving = helper.getValueInList(linkInfo[0], XMLAttributes.DRIVING);
            var change = helper.getValueInList(linkInfo[0], XMLAttributes.CHANGE_BRANCH);
            for (var i = 1; i < linkInfo.length; i++) {
                if (helper.getValueInList(linkInfo[i], XMLAttributes.TYPE) ==
                    SelectionType.COUPLER) {

                    if (driving != '0')
                        this.linkage.interchangeCrankElement();

                    if (change == 'true') {
                        triggerBranchChange = true;
                        this.linkage.changeBranch();
                    }

                    var l = parseFloat(helper.getValueInList(linkInfo[i], XMLAttributes.LENGTH));
                    var a = helper.toRadians(parseFloat(helper.getValueInList(linkInfo[i],
                        XMLAttributes.ANGLE)));
                    var o = helper.toRadians(parseFloat(helper.getValueInList(linkInfo[i],
                        XMLAttributes.ORIENTATION)));
                    this.linkage.setCouplerTracePoint(l, a, o, true);
                    this.refreshConstraints = true;
                } else {
                    var startPoint = new Point(parseFloat(helper.getValueInList(linkInfo[i], XMLAttributes.X)),
                        parseFloat(helper.getValueInList(linkInfo[i], XMLAttributes.Y)));
                    var endPoint = new Point(parseFloat(helper.getValueInList(linkInfo[i], XMLAttributes.X1)),
                        parseFloat(helper.getValueInList(linkInfo[i], XMLAttributes.Y1)));
                    this.linkage.addLink(helper.getValueInList(linkInfo[i], XMLAttributes.TYPE), -1, startPoint, -1, Math.pow(10, -6));
                    this.linkage.setLinkEndPoint(-1, endPoint, false, true,  Math.pow(10, -6));
                }
            }
        } else {

        }
        return triggerBranchChange;

    },


    /* --- Examples --- */
    loadNoSolution: function () {
        this.linkage.clear(-1);
        this.constraints.clear();

        this.history.startNewEvent();

        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(-3.896, -2.500, 118.800));
        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(5.148, 2.150, 111.600));
        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(-4.452, 0.300, 172.800));
        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(6.261, -0.950, 331.200));
        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(0.278, 1.250, 115.200));
    },
    loadMixedAppr: function () {
        this.linkage.clear(-1);
        this.constraints.clear();

        this.history.startNewEvent();

        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(-7.35277, 1.83234, 42.4862 * Math.PI / 180));
        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(-4.44913, 2.9212, -4.20536 * Math.PI / 180));
        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(-2.23627, 3.28416, -62.9164 * Math.PI / 180));
        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(-0.362955, 2.25383, -112.751 * Math.PI / 180));


        //        this.history.pushIntoHistory(this.constraints.addLineConstraint(1, -1 / (-0.18292), 0.0452610 / (-0.18292)));
        this.history.pushIntoHistory(this.constraints.addLineConstraint(-0.18292, -1, 0.0452610));
        //        this.constraints.setBehavior(ConstraintType.LINE_CONSTRAINT, -1, true);

        //        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(-4.02763, 3.61199, -5 * Math.PI / 180));
        //        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(-0.690786, 2.59337, -45 * Math.PI / 180));

    },
    loadMixed: function () {
        this.linkage.clear(-1);
        this.constraints.clear();

        this.history.startNewEvent();

        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(-7.9264, 1.2469, 11.07 * Math.PI / 180));
        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(-6.6736, 1.4108, 1.301 * Math.PI / 180));
        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(-4.4959, 0.883971, -40.23 * Math.PI / 180));
        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(-2.3065, -0.82543, -28.96 * Math.PI / 180));
        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(-0.52687, -1.7152, -4.92 * Math.PI / 180));

        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(-8.6172, 0.532724, 67.61 * Math.PI / 180));
        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(1.7211, -1.4459, 29.4 * Math.PI / 180));

    },
    loadThree: function () {
        this.linkage.clear(-1);
        this.constraints.clear();

        this.history.startNewEvent();

        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(-5.5262849783, 3.3309916872, 10 * Math.PI / 180));
        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(-4.0276314249, 3.6119892284, -5 * Math.PI / 180));
        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(-0.69078562229, 2.5933731413, -45 * Math.PI / 180));

        this.historyEvent = this.constraints.addConstraint(ConstraintType.POINT_CONSTRAINT, -1, new Point(-7.34106, 1.17668));
        this.historyEvent = this.constraints.addConstraint(ConstraintType.POINT_CONSTRAINT, -1, new Point(-3, 1));
    },
    loadThree1: function () {
        this.linkage.clear(-1);
        this.constraints.clear();

        this.history.startNewEvent();

        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(-5.5262849783, 3.3309916872, 10 * Math.PI / 180));
        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(-3.0276314249, 2.6119892284, -5 * Math.PI / 180));
        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(-0.69078562229, 2.5933731413, -45 * Math.PI / 180));

        this.historyEvent = this.constraints.addConstraint(ConstraintType.POINT_CONSTRAINT, -1, new Point(5.1, -1.2));
        this.historyEvent = this.constraints.addConstraint(ConstraintType.POINT_CONSTRAINT, -1, new Point(-1.4, 3.2));
    },
    loadShoulder: function () {
        this.linkage.clear(-1);
        this.constraints.clear();

        this.history.startNewEvent();

        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(-3.9696, -2.6338, 37.23 * Math.PI / 180));
        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(-0.2223, -0.3211, 27.48 * Math.PI / 180));
        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(3.3279, 3.9568, 8.17 * Math.PI / 180));
        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(7.7225, 10.0149, -14.86 * Math.PI / 180));
        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(5.7615, 18.8535, -25.64 * Math.PI / 180));
    },
    loadHip: function () {
        this.linkage.clear(-1);
        this.constraints.clear();

        this.history.startNewEvent();

        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(-7.8120, -9.6524, 22.90 * Math.PI / 180));
        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(-1.3585, -6.5336, 24.75 * Math.PI / 180));
        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(0.1182, -2.2528, 18.92 * Math.PI / 180));
        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(1.7686, 4.9971, -6.59 * Math.PI / 180));
        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(5.3102, 8.7562, -39.91 * Math.PI / 180));
    },
    loadRRRRExample: function () {
        this.linkage.clear(-1);
        this.constraints.clear();

        this.history.startNewEvent();

        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(-0.8253, -1.0329, 91.91 * Math.PI / 180));
        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(-1.6554, -0.2721, 66.99 * Math.PI / 180));
        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(-2.6392, 0.2920, 49.90 * Math.PI / 180));
        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(-3.5027, 0.3088, 43.94 * Math.PI / 180));
        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(-4.0549, -0.2141, 45.58 * Math.PI / 180));
        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(-4.1022, -1.0521, 52.87 * Math.PI / 180));
        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(-3.5805, -1.8708, 64.52 * Math.PI / 180));
        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(-2.6250, -2.3408, 78.84 * Math.PI / 180));
        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(-1.5557, -2.2742, 93.02 * Math.PI / 180));
        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(-0.8016, -1.7382, 101.25 * Math.PI / 180));
    },
    loadRRRPExample: function () {
        this.linkage.clear(-1);
        this.constraints.clear();

        this.history.startNewEvent();

        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(4.2333, 0.4588, -74.56 * Math.PI / 180));
        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(3.6700, 0.6457, -77.54 * Math.PI / 180));
        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(3.1974, 1.1114, -69.78 * Math.PI / 180));
        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(2.7965, 1.5640, -56.69 * Math.PI / 180));
        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(2.5215, 1.7742, -43.91 * Math.PI / 180));
        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(2.5562, 1.7066, -35.27 * Math.PI / 180));
        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(3.0101, 1.4572, -33.32 * Math.PI / 180));
        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(3.7451, 1.1415, -38.67 * Math.PI / 180));
        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(4.3905, 0.8285, -49.68 * Math.PI / 180));
        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(4.5797, 0.5694, -63.17 * Math.PI / 180));
    },
    loadRRPRExample: function () {
        this.linkage.clear(-1);
        this.constraints.clear();

        this.history.startNewEvent();

        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(-0.2632, 5.2514, 65.14 * Math.PI / 180));
        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(2.4011, 6.0359, 4.05 * Math.PI / 180));
        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(1.2685, 5.9747, 2.14 * Math.PI / 180));
        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(-0.3345, 5.5449, 12.84 * Math.PI / 180));
        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(-1.5528, 4.5777, 26.56 * Math.PI / 180));
        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(-2.0939, 3.3984, 41.27 * Math.PI / 180));
        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(-1.9950, 2.4302, 56.14 * Math.PI / 180));
        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(-1.5422, 1.9847, 70.50 * Math.PI / 180));
        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(-1.1217, 2.1684, 83.14 * Math.PI / 180));
        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(-1.0000, 3.0000, 90.00 * Math.PI / 180));
    },
    loadPRPRExample: function () {
        this.linkage.clear(-1);
        this.constraints.clear();

        this.history.startNewEvent();

        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(3.4099, -4.2601, -19.18 * Math.PI / 180));
        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(4.0197, -4.3714, -15.94 * Math.PI / 180));
        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(4.6593, -4.3932, -11.89 * Math.PI / 180));
        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(5.3252, -4.2873, -6.71 * Math.PI / 180));
        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(6.0000, -4.0000, 0.00 * Math.PI / 180));
        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(6.6343, -3.4644, 8.75 * Math.PI / 180));
        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(7.1222, -2.6291, 19.98 * Math.PI / 180));
        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(7.3017, -1.5359, 33.69 * Math.PI / 180));
        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(7.0562, -0.4015, 48.81 * Math.PI / 180));
        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(6.4721, 0.4721, 63.43 * Math.PI / 180));
    },
    loadPRRPExample: function () {
        this.linkage.clear(-1);
        this.constraints.clear();

        this.history.startNewEvent();

        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(4.4548, 1.4274, 35.23 * Math.PI / 180));
        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(4.6078, 1.7039, 41.76 * Math.PI / 180));
        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(4.6878, 1.9439, 48.24 * Math.PI / 180));
        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(4.6948, 2.1474, 54.77 * Math.PI / 180));
        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(4.6259, 2.3129, 61.43 * Math.PI / 180));
        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(4.4745, 2.4372, 68.33 * Math.PI / 180));
        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(4.2288, 2.5144, 75.61 * Math.PI / 180));
        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(3.8683, 2.5341, 83.48 * Math.PI / 180));
        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(3.3533, 2.4767, 92.34 * Math.PI / 180));
        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(2.5933, 2.2967, 103.05 * Math.PI / 180));
    },
    loadRPRPExample: function () {
        this.linkage.clear(-1);
        this.constraints.clear();

        this.history.startNewEvent();

        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(2.0823, -4.3526, -103.93 * Math.PI / 180));
        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(2.2938, -4.4509, -99.43 * Math.PI / 180));
        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(2.5323, -4.5512, -94.93 * Math.PI / 180));
        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(2.8008, -4.6479, -90.43 * Math.PI / 180));
        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(3.1010, -4.7350, -85.93 * Math.PI / 180));
        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(3.4336, -4.8060, -81.43 * Math.PI / 180));
        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(3.7980, -4.8541, -76.93 * Math.PI / 180));
        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(4.1926, -4.8725, -72.43 * Math.PI / 180));
        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(4.6145, -4.8548, -67.93 * Math.PI / 180));
        this.history.pushIntoHistory(this.constraints.addPoseExplicitly(5.0596, -4.7947, -63.43 * Math.PI / 180));
    },

    /* --- Synthesis Functions --- */
    resetNoSolution: function () {
        this.noSolution = false;
    },
    checkForSolution: function () {
        this.noSolution = (this.constraints.isValidForComputation() && this.generatedDyads.length == 0);
    },
    shouldResynthesize: function () {
        return (this.selectedDrawableIndex == -1 || (this.selectedDrawableIndex != -1 && (this.selectedDrawableType == ConstraintType.POSE || this.selectedDrawableType == ConstraintType.POINT_CONSTRAINT || this.selectedDrawableType == ConstraintType.LINE_CONSTRAINT || this.selectedDrawableType == ConstraintType.PATH_CONSTRAINT)));
    },
    synthesizeMechanismFromCurve: function () {
        //        generateFourierCoefficients(this.linkage.exportCouplerCurve());
        //generateFourierCoefficients(this.controlPolygon.getCurve());
    },
    synthesizeMechanism: function (workspaceWidth, workspaceHeight, workspaceMargin) {
        this.noSolution = false;
        this.linkage.clear(-1);
        this.refreshConstraints = true;
        var validSolution = 0;

        this.clearDyads();

        if (this.constraints.isValidForComputation()) {
            if(typeof(computationCore) == 'undefined')
                //START NEW CODE BY SS
                server.callServer2Synthesize();
                //END NEW CODE BY SS
            else{
                var mechanismResult = computationCore.synthesizeMechanism(this.constraints.getConstraints(), workspaceWidth, workspaceHeight, workspaceMargin);
                console.log(mechanismResult);
                if (mechanismResult.dyadInfo.length == 0)
                    validSolution = -1;
                else {
                    for (var i = 0; i < mechanismResult.dyadInfo.length; i++)
                        this.generatedDyads.push(mechanismResult.dyadInfo[i]);
                    this.firstPose = mechanismResult.firstPose;
                }
            }
        }
        var choice = 4;
        if (this.constraints.isValidForHybridSynth()) {
            server.callServer2HybridSynth()
        } else if (this.constraints.isValidForPathSynth()) {
            if (choice == 1) {
                server.callServer2PathSynthJeff();
            } else if (choice == 2) {
                server.callServer2PathSynthFrenetFourier();
            } else if (choice == 3) {
                server.callServer2PathSynthFrenetBspline();
            } else if (choice == 4) {
                server.callServer2PathSynthOpennR();
            }
        }
        return validSolution;
    },
    getGeneratedDyadDetail: function () {
        var dyadDetail = [];

        for (var i = 0; i < this.generatedDyads.length; i++)
            dyadDetail.push({
                linktype: this.generatedDyads[i].linkType,
                index: i,
                isTrue: this.generatedDyads[i].trueDyad
            });

        return dyadDetail;
    },
    getSelectedDyads: function () {
        var selectedDyads = [];
        this.selectedDyads.forEach(function (dyad) {
            selectedDyads.push(dyad[0]);
        });
        return selectedDyads.sort();
    },

    // Reverted from previous backup
    setDyad: function (index) {
        var returnIndex = 1;

        if (this.selectedDyads.length == 0) {
            this.linkage.clear(-1);
            this.refreshConstraints = true;
        }

        var linkCount = this.linkage.getLinkCount();

        if (linkCount < 2 && index >= 0 && index < this.generatedDyads.length) {
            if (this.selectedDyads.getIndexOfObject(0, index) == -1) {
                this.linkage.addLink(this.generatedDyads[index].linkType, -1, this.generatedDyads[index].point1, -1, 0);

                //                var endPoint = helper.getEndPoint(this.generatedDyads[index].point1, this.generatedDyads[index].length, this.generatedDyads[index].initialAngle);
                this.linkage.setLinkEndPoint(-1, this.generatedDyads[index].point2, false, false, 0);
                //                this.linkage.setLinkEndPoint(-1, endPoint, false);


                this.selectedDyads.push([index, this.linkage.getLinkId(-1)]);

                if (this.selectedDyads.length == 2)
                    this.linkage.setCouplerPoint(this.firstPose.center, this.firstPose.angle);
            }

            //            var foundAt = this.selectedDyads.getIndexOf(index);
            //
            //            if (foundAt == -1)
            //                this.selectedDyads.push(index);





            /* ---- Begin Send to linkage ---- */
            //            if (linkCount == 0)
            //                this.setLinkEndPoint(helper.getEndPoint(this.generatedDyads[index].point1, this.generatedDyads[index].length, helper.toRadians(120)));
            //            else {
            //                // mcp - Moving Coupler Point
            //                var mcp1 = this.generatedDyads[this.selectedDyads[0]].point2m.parametricToPoint(),
            //                    mcp2 = this.generatedDyads[index].point2m.parametricToPoint();
            //
            //                if (this.generatedDyads[this.selectedDyads[0]].linkType == LinkType.RP) {
            //                    //                    var slope
            //                }
            //
            //
            //
            //                var couplerLen = helper.getDistance(mcp1.x, mcp1.y, mcp2.x, mcp2.y);
            //                //                var couplerAng =
            //                this.setLinkEndPoint(this.generatedDyads[index].point2);
            //            }
            //
            //            if (this.linkage.getLinkCount() >= 2) {
            //                this.setCouplerPoint(this.firstPose);
            //            }
            /* ---- End Send to linkage ---- */


            //            this.newLinkType = currentLinkType;

            //            var foundAt = this.selectedDyads.getElementId(index);
            //
            //            if (foundAt == -1)
            //                this.selectedDyads.push(index);

            this.refreshConstraints = true;
        }

        return returnIndex;
    },
    /*
    // Updated function breaks three position synthesis w/ moving pivots
    setDyad: function(index) {
        var returnIndex = 1;

        if (this.selectedDyads.length == 0) {
            this.linkage.clear(-1);
            this.refreshConstraints = true;
        }

        var linkCount = this.linkage.getLinkCount();

        if (index >= 0 && index < this.generatedDyads.length && this.selectedDyads.getIndexOfObject(0, index) == -1) {

            var currentDyad = this.generatedDyads[index];

            if (linkCount == 0) {
                // just add the link
                var endPoint = helper.getEndPoint(currentDyad.point1, currentDyad.length, currentDyad.initialAngle);

                this.linkage.addLink(currentDyad.linkType, -1, currentDyad.point1, -1);
                this.linkage.setLinkEndPoint(-1, endPoint, false);

                this.selectedDyads.push([index, this.linkage.getLinkId(-1)]);

            } else if (linkCount < constants.MAX_LINK_COUNT) {
                var existingDyad = this.generatedDyads[this.selectedDyads[0][0]];

                if (existingDyad.linkType == LinkType.RR && currentDyad.linkType == LinkType.RR) {
                    var setAngles = this.linkage.testLink(currentDyad.linkType, currentDyad.point1, currentDyad.length, currentDyad.initialAngle, existingDyad.point2m.dSub(currentDyad.point2m).dNorm2());

                    this.linkage.addLink(currentDyad.linkType, -1, currentDyad.point1, -1);
                    var endPoint = helper.getEndPoint(currentDyad.point1, currentDyad.length, setAngles[1]);
                    //                    this.linkage.setLinkEndPoint(-1, currentDyad.point2, false);
                    this.linkage.setLinkEndPoint(-1, endPoint, false);
                    this.selectedDyads.push([index, this.linkage.getLinkId(-1)]);

                    if (this.selectedDyads.length >= 2) {
                        this.linkage.setCouplerFromDyads(existingDyad, currentDyad);
                        //                        this.linkage.setCouplerPoint(this.firstPose.center, this.firstPose.angle);
                    }
                } else {
                    this.linkage.addLink(currentDyad.linkType, -1, currentDyad.point1, -1);
                    this.linkage.setLinkEndPoint(-1, currentDyad.point2, false);

                    this.selectedDyads.push([index, this.linkage.getLinkId(-1)]);

                    if (this.selectedDyads.length >= 2)
                        this.linkage.setCouplerPoint(this.firstPose.center, this.firstPose.angle);
                }


            }
            this.refreshConstraints = true;
        }
        //            var foundAt = this.selectedDyads.getIndexOf(index);
        //
        //            if (foundAt == -1)
        //                this.selectedDyads.push(index);





        /* ---- Begin Send to linkage ---- */
    //            if (linkCount == 0)
    //                this.setLinkEndPoint(helper.getEndPoint(this.generatedDyads[index].point1, this.generatedDyads[index].length, helper.toRadians(120)));
    //            else {
    //                // mcp - Moving Coupler Point
    //                var mcp1 = this.generatedDyads[this.selectedDyads[0]].point2m.parametricToPoint(),
    //                    mcp2 = this.generatedDyads[index].point2m.parametricToPoint();
    //
    //                if (this.generatedDyads[this.selectedDyads[0]].linkType == LinkType.RP) {
    //                    //                    var slope
    //                }
    //
    //
    //
    //                var couplerLen = helper.getDistance(mcp1.x, mcp1.y, mcp2.x, mcp2.y);
    //                //                var couplerAng =
    //                this.setLinkEndPoint(this.generatedDyads[index].point2);
    //            }
    //
    //            if (this.linkage.getLinkCount() >= 2) {
    //                this.setCouplerPoint(this.firstPose);
    //            }
    /* ---- End Send to linkage ---- */


    //            this.newLinkType = currentLinkType;

    //            var foundAt = this.selectedDyads.getElementId(index);
    //
    //            if (foundAt == -1)
    //                this.selectedDyads.push(index);

    //                this.refreshConstraints = true;
    //            }
    /*
            return returnIndex;
        },
        */

    removeDyad: function (index) {
        var popAt = this.selectedDyads.getIndexOfObject(0, index);

        if (popAt >= 0 && popAt < this.selectedDyads.length) {
            this.linkage.deleteLink(this.selectedDyads[popAt][1]);
            this.selectedDyads.splice(popAt, 1);
        }

        this.refreshConstraints = true;
    },
    clearDyads: function () {
        this.selectedDyads = []
        this.generatedDyads = []
    },

    /* --- Simulation Functions --- */
    switchCrankElement: function () {
        this.historyEvent = this.linkage.interchangeCrankElement();
        this.refreshConstraints = true;
    },
    switchBranch: function () {
        this.historyEvent = this.linkage.changeBranch();
        this.refreshConstraints = true;
    },
    switchCircuit: function () {
        this.historyEvent = this.linkage.changeCircuit();
        this.refreshConstraints = true;
    },
    isAnimationReady: function () {
        return this.linkage.isAnimationReady();
    },
    isCircuitSwitchable: function () {
        return this.linkage.isCircuitSwitchable();
    },
    setCrankPosition: function (value) {
        this.linkage.setCrankPosition(value);
    },
    resetAnimation: function () {
        drawables.linkage.resetAngle();
    },

    /* History Functions */
    beginEvent: function () {
        if (!this.eventInProgress) {
            this.history.startNewEvent();
            this.historyEvent = null;
            this.eventInProgress = true;
        }
    },
    completeEvent: function () {
        if (this.historyEvent) {
            if (this.historyEvent instanceof Array)
                this.historyEvent.forEach(function (hEvent) {
                    drawables.history.pushIntoHistory(hEvent);
                });
            else
                this.history.pushIntoHistory(this.historyEvent);

            this.historyEvent = null;
        }

        this.eventInProgress = false;
    },
    undo: function () {
        var events = this.history.getPreviousEvent();
        this.cancelSelection();
        var isConstraint = false,
            toggleBranch = false;

        for (var i = 0; i < events.length; i++) {

            if (events[i].transactionType == TransactionType.ADD) {
                if (events[i].drawableType == ConstraintType.POSE || events[i].drawableType == ConstraintType.POINT_CONSTRAINT || events[i].drawableType == ConstraintType.LINE_CONSTRAINT || events[i].drawableType == ConstraintType.PATH_CONSTRAINT)
                    this.constraints.clear(events[i].drawableType, events[i].index);
                else if (events[i].drawableType == SelectionType.LINK)
                    this.linkage.clear(events[i].index);
            } else if (events[i].transactionType == TransactionType.EDIT) {
                if (events[i].drawableType == ConstraintType.POSE || events[i].drawableType == ConstraintType.POINT_CONSTRAINT || events[i].drawableType == ConstraintType.LINE_CONSTRAINT || events[i].drawableType == ConstraintType.PATH_CONSTRAINT) {
                    this.constraints.setStartPoint(events[i].drawableType, events[i].index, events[i].getOldStartPoint());
                    this.constraints.setEndPoint(events[i].drawableType, events[i].index, events[i].getOldEndPoint());
                    this.constraints.setBehavior(events[i].drawableType, events[i].index, events[i].oldBehavior || false);
                } else if (events[i].drawableType == SelectionType.LINK) {
                    this.linkage.setLinkStartPoint(events[i].index, events[i].getOldStartPoint());
                    this.linkage.setLinkEndPoint(events[i].index, events[i].getOldEndPoint(), true, true,  Math.pow(10, -6));
                } else if (events[i].drawableType == SelectionType.COUPLER) {
                    this.linkage.setCouplerPoint(events[i].getOldStartPoint(), helper.getInclination(events[i].getOldStartPoint(), events[i].getOldEndPoint()));
                } else if (events[i].drawableType == SelectionType.LINKAGE_PROPERTY) {
                    if (events[i].entityType == LinkageProperty.DRIVING)
                        this.linkage.setDriving(null, events[i].oldBehavior);
                    else if (events[i].entityType == LinkageProperty.BRANCH) {
                        this.linkage.changeBranch();
                        toggleBranch = true;
                    } else if (events[i].entityType == LinkageProperty.CIRCUIT) {
                        this.linkage.changeCircuit();
                        //                        toggleBranch = true;
                    }
                }
            } else if (events[i].transactionType == TransactionType.DELETE) {
                if (events[i].drawableType == ConstraintType.POSE || events[i].drawableType == ConstraintType.POINT_CONSTRAINT || events[i].drawableType == ConstraintType.LINE_CONSTRAINT || events[i].drawableType == ConstraintType.PATH_CONSTRAINT) {
                    this.constraints.addConstraint(events[i].drawableType, events[i].index, events[i].getOldStartPoint());
                    this.constraints.setEndPoint(events[i].drawableType, events[i].index, events[i].getOldEndPoint());
                    this.constraints.setBehavior(events[i].drawableType, events[i].index, events[i].oldBehavior || false);
                } else if (events[i].drawableType == SelectionType.LINK) {
                    //Add link at its previous index, also include its id
                    this.linkage.addLink(events[i].entityType, events[i].index, events[i].getOldStartPoint(), events[i].oldBehavior, Math.pow(10, -6));
                    this.linkage.setLinkEndPoint(events[i].index, events[i].getOldEndPoint(), false, true,  Math.pow(10, -6));
                } else if (events[i].drawableType == SelectionType.COUPLER) {
                    this.linkage.setCouplerPoint(events[i].getOldStartPoint(), helper.getInclination(events[i].getOldStartPoint(), events[i].getOldEndPoint()));
                    if (toggleBranch) {
                        this.linkage.changeBranch();
                        this.linkage.completeLinkage(true, false, false);
                        this.linkage.changeBranch();
                    }
                } else if (events[i].drawableType == SelectionType.LINKAGE_PROPERTY) {
                    if (events[i].entityType == LinkageProperty.DRIVING)
                        this.linkage.setDriving(null, events[i].oldBehavior);
                    else if (events[i].entityType == LinkageProperty.BRANCH) {
                        toggleBranch = events[i].oldBehavior;
                    }
                }
            }

            if (events[i].drawableType == ConstraintType.POSE || events[i].drawableType == ConstraintType.POINT_CONSTRAINT || events[i].drawableType == ConstraintType.LINE_CONSTRAINT  || events[i].drawableType == ConstraintType.PATH_CONSTRAINT) {
                isConstraint = true;
            }
        }

        this.refreshConstraints = true;
        return {
            isConstraint: isConstraint,
            toggleBranch: toggleBranch
        };
    },
    redo: function () {
        var events = this.history.getNextEvent();
        this.cancelSelection();
        var isConstraint = false,
            toggleBranch = false;

        for (var i = 0; i < events.length; i++) {
            if (events[i].transactionType == TransactionType.ADD) {
                if (events[i].drawableType == ConstraintType.POSE || events[i].drawableType == ConstraintType.POINT_CONSTRAINT || events[i].drawableType == ConstraintType.LINE_CONSTRAINT || events[i].drawableType == ConstraintType.PATH_CONSTRAINT) {
                    this.constraints.addConstraint(events[i].drawableType, -1, events[i].getNewStartPoint());
                    this.constraints.setEndPoint(events[i].drawableType, -1, events[i].getNewEndPoint());
                    this.constraints.setBehavior(events[i].drawableType, -1, events[i].entityType || false);
                } else if (events[i].drawableType == SelectionType.LINK) {
                    this.linkage.addLink(events[i].entityType, -1, events[i].getNewStartPoint(), events[i].oldBehavior, Math.pow(10, -6));
                    this.linkage.setLinkEndPoint(-1, events[i].getNewEndPoint(), false, true, Math.pow(10, -6));
                }
            } else if (events[i].transactionType == TransactionType.EDIT) {
                if (events[i].drawableType == ConstraintType.POSE || events[i].drawableType == ConstraintType.POINT_CONSTRAINT || events[i].drawableType == ConstraintType.LINE_CONSTRAINT || events[i].drawableType == ConstraintType.PATH_CONSTRAINT) {
                    this.constraints.setStartPoint(events[i].drawableType, events[i].index, events[i].getNewStartPoint());
                    this.constraints.setEndPoint(events[i].drawableType, events[i].index, events[i].getNewEndPoint());
                    this.constraints.setBehavior(events[i].drawableType, events[i].index, events[i].entityType || false);
                } else if (events[i].drawableType == SelectionType.LINK) {
                    this.linkage.setLinkStartPoint(events[i].index, events[i].getNewStartPoint());
                    this.linkage.setLinkEndPoint(events[i].index, events[i].getNewEndPoint(), true, true,  Math.pow(10, -6));
                } else if (events[i].drawableType == SelectionType.COUPLER) {
                    this.linkage.setCouplerPoint(events[i].getNewStartPoint(), helper.getInclination(events[i].getNewStartPoint(), events[i].getNewEndPoint()));
                } else if (events[i].drawableType == SelectionType.LINKAGE_PROPERTY) {
                    if (events[i].entityType == LinkageProperty.DRIVING)
                        this.linkage.setDriving(events[i].oldBehavior, null);
                    else if (events[i].entityType == LinkageProperty.BRANCH) {
                        this.linkage.changeBranch();
                        toggleBranch = true;
                    } else if (events[i].entityType == LinkageProperty.CIRCUIT) {
                        this.linkage.changeCircuit();
                        //                        toggleBranch = true;
                    }
                }
            } else if (events[i].transactionType == TransactionType.DELETE) {
                if (events[i].drawableType == ConstraintType.POSE || events[i].drawableType == ConstraintType.POINT_CONSTRAINT || events[i].drawableType == ConstraintType.LINE_CONSTRAINT || events[i].drawableType == ConstraintType.PATH_CONSTRAINT) {
                    this.constraints.clear(events[i].drawableType, events[i].index);
                } else if (events[i].drawableType == SelectionType.LINK) {
                    this.linkage.clear(events[i].index);
                }
            }

            if (events[i].drawableType == ConstraintType.POSE || events[i].drawableType == ConstraintType.POINT_CONSTRAINT || events[i].drawableType == ConstraintType.LINE_CONSTRAINT || events[i].drawableType == ConstraintType.PATH_CONSTRAINT) {
                isConstraint = true;
            }
        }

        this.refreshConstraints = true;
        return {
            isConstraint: isConstraint,
            toggleBranch: toggleBranch
        };
    },

    isValidForComputation: function () {
        return this.constraints.isValidForComputation();
    }
};

var serverHelper = {
    //Get workspace info as json (only workspaceInfo, constraintInfo)
    getData2MotSynth() {
        //Make Workspace Info Object
        var workspaceInfoArr = canvasCore.getSavableInfoForWorkspace();
        var workspaceInfoObj = {};
        workspaceInfoArr.forEach(function (data) {
            workspaceInfoObj[data[0]] = data[1];
        });

        //Make Constraint Info Object
        var constraintInfoArr = drawables.getSavableConstraintsInfo();
        var constraintInfoObj = [];
        for (var i = 0; i < constraintInfoArr.length; i++) {
            var temp = {};
            for (var j = 0; j < constraintInfoArr[i].length; j++) {
                temp[constraintInfoArr[i][j][0]] = constraintInfoArr[i][j][1];
            }
            constraintInfoObj.push(temp);
        }

        //Combine all data into single object
        var r = {
            workspaceInfo: workspaceInfoObj,
            constraintInfo: constraintInfoObj,
        };
        return r;
    },
    //Get path pts info
    getData2PathSynth() {
        var ptsObj=drawables.constraints.pathPoints;
        var pts=[];
        for (var i=0;i<ptsObj.length;i++){
            pts.push([parseFloat(ptsObj[i].x),parseFloat(ptsObj[i].y)]);
        }
        return {path:pts,
            har: 15,
            paramAlpha: 0,};
    },
    //TO-DO
    getData2HybridSynth() {},

    //Process XML file returned by server and update workspace according to generated dyads
    updateAfterServerSynthesis: function (xmlTextReceived) {

        //data = serverHelper.Xml2Obj(xmlTextReceived);
        data = JSON.parse(xmlTextReceived);

        //Copied from menucore.registerSideMenuEvents $(#openXmlFileOnDesktop)
        //Only Importing generated Dyads so commented other stuff
        /*
                if (data.displayName)
                    applicationController.screenName = data.displayName;

                if (data.applicationInfo && !$.isEmptyObject(data.applicationInfo)) {
                    applicationController.setApplicationMode(data.applicationInfo[XMLAttributes.MODE],
                        data.applicationInfo[XMLAttributes.DRAWABLE],
                        data.applicationInfo[XMLAttributes.POSE_DENSITY]);
                }

                if (data.gridInfo && !$.isEmptyObject(data.gridInfo)) {
                    applicationController.setGridDisplay(data.gridInfo[XMLAttributes.VISIBLE] == 'true');
                    canvasCore.setPanAndZoom(data.gridInfo[XMLAttributes.PAN_X],
                        data.gridInfo[XMLAttributes.PAN_Y],
                        data.gridInfo[XMLAttributes.SCALE]);
                }

                if (data.workspaceInfo && !$.isEmptyObject(data.workspaceInfo)) {
                    canvasCore.setWorkspace(data.workspaceInfo.width, data.workspaceInfo.height, data.workspaceInfo.margin);
                }

                drawables.loadConstraintsFromXMLFile(data.constraintInfo);
                drawables.loadCapturedConstraintsFromXMLFile(data.capturedConstraints);

                drawables.refreshConstraintsOnDraw();

                menuCore.synthesizeMechanism();
        */

        //Initialize drawables.generatedDyads (Dyad1, Dyad2, ......)
        //Initialize drawables.linkage (Link1, Link2, Coupler) (NOT exported by server by choice)
        //Initialize drawables.dyadVectors (q1,q2,q3,q4,q5,q6,q7,q8) (NOT exported by server by choice)
        if (data.synthResults.length <= 1)
            console.log('No Solutions Found!!');
        else
            serverHelper.initDyads(data.synthResults);


        //Update the other workspace variables to reflect the new state.
        menuCore.loadDyadMenu(true, true);
        applicationController.refreshDisplay();


        applicationController.setCapturedPoseCount();
        applicationController.refreshDisplay();
    },
    initDyads: function (synthResults) {
        var info = JSON.parse(JSON.stringify(synthResults[0]));
        var data = JSON.parse(JSON.stringify(synthResults));
        data.splice(0, 1);
        drawables.clearDyads();
        //UPDATE drawables.generatedDyads
        for (var i = 0; i < data.length; i++) {
            var dyadInfo = {
                point1: new Point(parseFloat(data[i].x), parseFloat(data[i].y)),
                point2: new Point(parseFloat(data[i].x1), parseFloat(data[i].y1)),
                length: parseFloat(data[i].length, 10),
                initialAngle: parseFloat(data[i].angle, 10),
                trueDyad: (data[i].trueDyad == 'True'),
                linkType: data[i].type,
                point2m: JSON.parse('[' + data[i].movingPivot + ']'),
                linem: JSON.parse('[' + data[i].movingLine + ']')
            }

            drawables.generatedDyads.push(dyadInfo);
        }

        //UPDATE drawables.firstPose
        drawables.firstPose = new Pose(Number(info.couplerPoseX), Number(info.couplerPoseY), Number(info.couplerPoseAng));
    },
    importNRManipulator: function (data) {
        drawables.setNewLinkType('RR');
        var inputElements = [];
        for(var lk = 0; lk<data.sol.length - 1; lk++){
            if(lk != 0)
                inputElements.push(lk)
            drawables.addLink(new Point(data.sol[lk][0], data.sol[lk][1]), Math.pow(10, -6));
            drawables.linkage.setRPM(lk, 0, Math.abs(data.sol[lk][2]) * 6);
            drawables.setLinkEndPoint(new Point(data.sol[lk+1][0], data.sol[lk+1][1]), Math.pow(10, -6));
            if(lk % 2 != 0)
                drawables.linkage.changeRotationDirection(lk, 0);
        }
        drawables.linkage.setInputElements(0, inputElements)
        drawables.reSimulate();
    }

};

var linkIds = {
    nextId: 0,
    availbleIds: [],
    addToAvailableId: function (id) {
        this.availbleIds.push(id);
        this.availbleIds.sort();
    },
    removeAvailableId: function (id) {
        var index = this.availbleIds.getIndexOf(id);

        if (index != -1)
            this.availbleIds.splice(index, 1);
    },
    getAvailableId: function () {
        var returnValue = 0;
        if (this.availbleIds.length != 0) {
            returnValue = this.availbleIds[0];
            this.availbleIds.splice(0, 1);
        } else {
            returnValue = this.nextId;
            this.nextId++;
        }
        return returnValue;
    },
    reset: function () {
        while (this.availbleIds.length != 0)
            this.availbleIds.pop();

        this.nextId = 0;
    }
};
var jointIds = {
    nextId: 0,
    availableIds: [],
    addToAvailableId: function (id) {
        this.availableIds.push(id);
        this.availableIds.sort();
    },
    removeAvailableId: function (id) {
        var index = this.availableIds.getIndexOf(id);

        if (index != -1)
            this.availableIds.splice(index, 1);
    },
    getAvailableId: function () {
        var returnValue = 0;
        if (this.availableIds.length != 0) {
            returnValue = this.availableIds[0];
            this.availableIds.splice(0, 1);
        } else {
            returnValue = this.nextId;
            this.nextId++;
        }
        return returnValue;
    },
    reset: function () {
        while (this.availableIds.length != 0)
            this.availableIds.pop();

        this.nextId = 0;
    }
};
