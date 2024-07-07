function Point(x, y) {
    this.x = x;
    this.y = y;
    this.isSelected = false;
    this.setPoint = function (x, y) {
        this.x = x;
        this.y = y;
    };
    this.draw = function (context) {
        if (this.isSelected)
            advancedGraphicsGeometry.drawHighlightedPoint(context, this);
        else
            advancedGraphicsGeometry.drawControlPoint(context, this);
    };
    this.add = function (point) {
        return new Point(this.x + point.x, this.y + point.y);
    };
    this.times = function (val) {
        return new Point(this.x * val, this.y * val);
    };
    this.copy = function () {
        return new Point(this.x, this.y);
    };
    this.getDistanceFrom = function (point) {
        return helper.getDistance(point.x, point.y, this.x, this.y);
    };
    this.setSelected = function (value) {
        this.isSelected = value;
    };
    this.getDimensions = function () {
        return [[
            DimensionType.X, (this.x).toFixed(2)
        ], [
            DimensionType.Y, (this.y).toFixed(2)
        ]];
    };
    this.getParametricForm = function () {
        return [this.x, this.y, 1];
    };
    this.getSavableInfo = function () {
        return [
            [
                XMLAttributes.TYPE, ConstraintType.POINT_CONSTRAINT
            ], [
                XMLAttributes.X, this.x
            ], [
                XMLAttributes.Y, this.y
            ]
        ];
    };
    this.getState = function (transactionType, index) {
        return new HistoryModel(transactionType, ConstraintType.PATH_CONSTRAINT, null, index, ((transactionType == TransactionType.ADD) ? null : this.copy()), ((transactionType == TransactionType.ADD) ? null : this.copy()), ((transactionType == TransactionType.DELETE) ? null : this.copy()), ((transactionType == TransactionType.DELETE) ? null : this.copy()), null);
    };
}

function Pose(x, y, angle) {
    this.center = new Point(x, y);
    this.type = 'input';
    this.angle = angle;
    this.tweakResolution = 1;
    this.tweakTolerance = 5 * 3.1415926535 / 180;
    this.positionToleranceFactor = 0.1;
    this.angularToleranceFactor = 0.1;
    this.isSelected = false;
    this.isCaptured = false;
    this.poseColor = constants.POSE_LINE_COLOR;
    this.behavior = ConstraintBehavior.REGULAR;
    this.draw = function (context) {
        if (this.type == 'input') {
            if (this.isSelected)
                advancedGraphicsGeometry.drawPoseEditingFeatures(context, this.center, constants.FINGER_RADIUS, constants.POSE_EDITING_OUTER_RING_RADIUS, constants.POSE_EDITING_OUTER_RING_WIDTH, constants.POSE_EDITING_ARROW_LENGTH, constants.POSE_EDITING_ARROW_WIDTH * 3, constants.POSE_HIGHLIGHT_COLOR);
            /*advancedGraphicsGeometry.drawPose(context, this.center, this.angle + this.tweakTolerance, helper.convertLengthFromPixelsToGridUnits(constants.POSE_LINE_LENGTH), constants.POSE_LINE_THICKNESS, helper.convertLengthFromPixelsToGridUnits(constants.POSE_ARROW_LENGTH), helper.convertLengthFromPixelsToGridUnits(constants.POSE_ARROW_WIDTH), this.isCaptured ? constants.POSE_CAPTURED_LINE_COLOR : constants.POSE_LINE_GRAY_COLOR);
            advancedGraphicsGeometry.drawPose(context, this.center, this.angle - this.tweakTolerance, helper.convertLengthFromPixelsToGridUnits(constants.POSE_LINE_LENGTH), constants.POSE_LINE_THICKNESS, helper.convertLengthFromPixelsToGridUnits(constants.POSE_ARROW_LENGTH), helper.convertLengthFromPixelsToGridUnits(constants.POSE_ARROW_WIDTH), this.isCaptured ? constants.POSE_CAPTURED_LINE_COLOR : constants.POSE_LINE_GRAY_COLOR);*/
            advancedGraphicsGeometry.drawPose(context, this.center, this.angle, helper.convertLengthFromPixelsToGridUnits(constants.POSE_LINE_LENGTH), constants.POSE_LINE_THICKNESS, helper.convertLengthFromPixelsToGridUnits(constants.POSE_ARROW_LENGTH), helper.convertLengthFromPixelsToGridUnits(constants.POSE_ARROW_WIDTH), this.isCaptured ? constants.POSE_CAPTURED_LINE_COLOR : this.poseColor, this.tweakTolerance, true);
        }
        if (this.type == 'output') {
            if (this.isSelected)
                advancedGraphicsGeometry.drawPoseEditingFeatures(context, this.center, constants.FINGER_RADIUS, constants.POSE_EDITING_OUTER_RING_RADIUS, constants.POSE_EDITING_OUTER_RING_WIDTH, constants.POSE_EDITING_ARROW_LENGTH, constants.POSE_EDITING_ARROW_WIDTH, constants.POSE_HIGHLIGHT_COLOR);
            advancedGraphicsGeometry.drawPose(context, this.center, this.angle, helper.convertLengthFromPixelsToGridUnits(constants.POSE_LINE_LENGTH), constants.POSE_LINE_THICKNESS, helper.convertLengthFromPixelsToGridUnits(constants.POSE_ARROW_LENGTH), helper.convertLengthFromPixelsToGridUnits(constants.POSE_ARROW_WIDTH), this.isCaptured ? constants.POSE_CAPTURED_LINE_COLOR : constants.POSE_OUTPUT_COLOR, false);
        }
    };
    this.setPoint = function (x, y) {
        this.center.setPoint(x, y);
    };
    this.getPoint = function () {
        return this.center.copy();
    };
    this.setAngle = function (angle) {
        this.angle = angle;
    };
    this.addAngle = function (angle) {
        this.angle += angle;
    };
    this.getAngle = function () {
        return this.angle;
    };
    this.setExact = function (isExact) {
        this.tweakResolution = isExact ? 0 : 1;
        this.behavior = isExact ? ConstraintBehavior.EXACT : ConstraintBehavior.REGULAR;
        console.log(this.behavior);
    };
    this.isExact = function () {
        // this.tweakResolution = 0;
        return (this.behavior == ConstraintBehavior.EXACT);
    };
    this.setSelected = function (value) {
        this.isSelected = value;
    };
    this.getDistanceFrom = function (point) {
        return this.center.getDistanceFrom(point); // helper.getDistance(point.x, point.y, this.center.x, this.center.y);
    };
    this.setAsCaptured = function () {
        this.isCaptured = true;
    };
    this.getDimensions = function () {
        return [[
            DimensionType.X, (this.center.x).toFixed(3)
        ], [
            DimensionType.Y, (this.center.y).toFixed(3)
        ], [
            DimensionType.Angle, helper.toDegrees(this.angle).toFixed(3)
        ]];
    };
    this.getSavableInfo = function () {
        var pointInfo = this.center.getSavableInfo();
        var point2Info = helper.getEndPoint(this.center, 1, this.angle).getSavableInfo();

        pointInfo[0][1] = ConstraintType.POSE;
        pointInfo.push([XMLAttributes.X1, point2Info[1][1]]);
        pointInfo.push([XMLAttributes.Y1, point2Info[2][1]]);
        pointInfo.push([XMLAttributes.LENGTH, 1]);
        pointInfo.push([XMLAttributes.ANGLE, helper.toDegrees(this.angle)]);
        pointInfo.push([XMLAttributes.BEHAVIOR, this.behavior]);

        return pointInfo;
    };
    this.getState = function (transactionType, index) {
        return new HistoryModel(transactionType, ConstraintType.POSE, this.isExact(), index, ((transactionType == TransactionType.ADD) ? null : this.getPoint()), ((transactionType == TransactionType.ADD) ? null : helper.getEndPoint(this.getPoint(), 1, this.getAngle())), ((transactionType == TransactionType.DELETE) ? null : this.getPoint()), ((transactionType == TransactionType.DELETE) ? null : helper.getEndPoint(this.getPoint(), 1, this.getAngle())), this.isExact());
    };
}

function LineConstraint(x, y) {
    this.isSelected = false;
    this.enabled = true;
    this.positionToleranceFactor = 0.015 * canvasCore.width / canvasCore.scaleFactor;
    this.point1 = new Point(x, y);
    this.point2 = new Point(x, y);
    this.point3 = new Point(x, y);
    this.point4 = new Point(x, y);
    this.point5 = new Point(x, y);
    this.point6 = new Point(x, y);
    this.approxLines = [[], [], [], [], []];
    this.approxLineLimits = [[this.point1, this.point2], [this.point3, this.point6], [this.point3, this.point4], [this.point5, this.point6], [this.point5, this.point4]];
    this.length = 0;
    this.behavior = ConstraintBehavior.FIXED;
    this.draw = function (context) {
        if (this.enabled) {
            if (this.isSelected) {
                advancedGraphicsGeometry.drawHighlightedPoint(context, this.point1);
                advancedGraphicsGeometry.drawHighlightedPoint(context, this.point2);
            }
            advancedGraphicsGeometry.drawLineConstraint(context, this.point1.x, this.point1.y, this.point2.x, this.point2.y, this.isMoving() ? constants.LINE_CONSTRAINT_MOVING_LINE_COLOR : constants.TOLERANCE_REGION_COLOR, this.positionToleranceFactor * 4 * canvasCore.scaleFactor / constants.SCREEN_COMPRESSION_FACTOR, constants.LINE_CONSTRAINT_LINE_THICKNESS);
        }
        /*graphicsGeometry.drawDashedLine(context, this.point3.x, this.point3.y, this.point6.x, this.point6.y, this.isMoving() ? constants.LINE_CONSTRAINT_MOVING_LINE_COLOR : constants.COLOR_GRAY, constants.LINE_CONSTRAINT_LINE_THICKNESS);*/
        /*graphicsGeometry.drawDashedLine(context, this.point3.x, this.point3.y, this.point4.x, this.point4.y, this.isMoving() ? constants.LINE_CONSTRAINT_MOVING_LINE_COLOR : constants.COLOR_GRAY, constants.LINE_CONSTRAINT_LINE_THICKNESS);
        graphicsGeometry.drawDashedLine(context, this.point5.x, this.point5.y, this.point6.x, this.point6.y, this.isMoving() ? constants.LINE_CONSTRAINT_MOVING_LINE_COLOR : constants.COLOR_GRAY, constants.LINE_CONSTRAINT_LINE_THICKNESS);
        graphicsGeometry.drawDashedLine(context, this.point5.x, this.point5.y, this.point4.x, this.point4.y, this.isMoving() ? constants.LINE_CONSTRAINT_MOVING_LINE_COLOR : constants.COLOR_GRAY, constants.LINE_CONSTRAINT_LINE_THICKNESS);*/
    };
    this.isMoving = function () {
        return (this.behavior == ConstraintBehavior.MOVING);
    };
    this.setAsMoving = function (isMoving) {
        this.behavior = isMoving ? ConstraintBehavior.MOVING : ConstraintBehavior.FIXED;
    };
    this.getStartPoint = function () {
        return this.point1.copy();
    };
    this.setStartPoint = function (x, y) {
        this.point1.setPoint(x, y);
        this.length = this.point2.getDistanceFrom(this.point1);
    };
    this.getEndPoint = function () {
        return this.point2.copy();
    };
    this.setEndPoint = function (x, y) {
        this.point2.setPoint(x, y);
        this.length = this.point2.getDistanceFrom(this.point1);
    };
    this.setSelected = function (value) {
        this.isSelected = value;
    };
    this.getClosestEnd = function (point) {
        //        if (helper.getDistance(point.x, point.y, this.point1.x, this.point1.y) <= helper.convertLengthFromPixelsToGridUnits(constants.FINGER_RADIUS))
        if (this.point1.getDistanceFrom(point) <= helper.convertLengthFromPixelsToGridUnits(constants.FINGER_RADIUS))
            return 1;
        //        else if (helper.getDistance(point.x, point.y, this.point2.x, this.point2.y) <= helper.convertLengthFromPixelsToGridUnits(constants.FINGER_RADIUS))
        else if (this.point2.getDistanceFrom(point) <= helper.convertLengthFromPixelsToGridUnits(constants.FINGER_RADIUS))
            return 2;
        else
            return 0;
    };
    this.getDistanceFrom = function (point) {
        var distance = helper.convertLengthFromPixelsToGridUnits(constants.FINGER_RADIUS);

        var a = this.point1.getDistanceFrom(point); // helper.getDistance(point.x, point.y, this.point1.x, this.point1.y);
        var b = this.length;
        var c = this.point2.getDistanceFrom(point); //helper.getDistance(point.x, point.y, this.point2.x, this.point2.y);

        var height = Math.sqrt(Math.pow(Math.pow(a, 2) + Math.pow(b, 2) + Math.pow(c, 2), 2) - (2 * (Math.pow(a, 4) + Math.pow(b, 4) + Math.pow(c, 4)))) / (2 * b);

        if (c <= b && a <= b)
            distance = height;
        else if (a < c)
            distance = a;
        else
            distance = c;

        return distance;
    };
    this.getLength = function () {
        return this.length;
    };
    this.getParametricForm = function () {
        return numericHelper.cross(this.point1.getParametricForm(), this.point2.getParametricForm()).normalizeLine();
    };
    this.getDimensions = function () {
        return [[
            DimensionType.X, (this.point1.x).toFixed(3)
        ], [
            DimensionType.Y, (this.point1.y).toFixed(3)
        ], [
            DimensionType.Length, (this.length).toFixed(3)
        ], [
            DimensionType.Angle, helper.toDegrees(helper.getInclination(this.point1, this.point2)).toFixed(3)
        ]];
    };
    this.getSavableInfo = function () {
        var point1Info = this.point1.getSavableInfo();
        var point2Info = this.point2.getSavableInfo();

        point1Info[0][1] = ConstraintType.LINE_CONSTRAINT;
        point1Info.push([XMLAttributes.X1, point2Info[1][1]]);
        point1Info.push([XMLAttributes.Y1, point2Info[2][1]]);
        point1Info.push([XMLAttributes.LENGTH, this.length]);
        point1Info.push([XMLAttributes.ANGLE, helper.toDegrees(helper.getInclination(this.point1, this.point2))]);
        point1Info.push([XMLAttributes.BEHAVIOR, this.behavior]);

        return point1Info;
    };
    this.getState = function (transactionType, index) {
        return new HistoryModel(transactionType, ConstraintType.LINE_CONSTRAINT, this.isMoving(), index, ((transactionType == TransactionType.ADD) ? null : this.getStartPoint()), ((transactionType == TransactionType.ADD) ? null : this.getEndPoint()), ((transactionType == TransactionType.DELETE) ? null : this.getStartPoint()), ((transactionType == TransactionType.DELETE) ? null : this.getEndPoint()), this.isMoving());
    };
    this.generateApproxLines = function () {
        var L = this.getParametricForm();
        if (L[0] != 0) {
            var normalSlope = L[1] / L[0];
            var dx = this.positionToleranceFactor / Math.sqrt(1 + normalSlope * normalSlope);
            var dy = dx * normalSlope;
            this.point3.setPoint(this.point1.x + dx, this.point1.y + dy);
            this.point5.setPoint(this.point1.x - dx, this.point1.y - dy);
            this.point6.setPoint(this.point2.x + dx, this.point2.y + dy);
            this.point4.setPoint(this.point2.x - dx, this.point2.y - dy);
        } else {
            var dy = this.positionToleranceFactor;
            this.point3.setPoint(this.point1.x, this.point1.y + dy);
            this.point5.setPoint(this.point1.x, this.point1.y - dy);
            this.point6.setPoint(this.point2.x, this.point2.y + dy);
            this.point4.setPoint(this.point2.x, this.point2.y - dy);
        }
        this.approxLines[0] = numericHelper.cross(this.point1.getParametricForm(), this.point2.getParametricForm()).normalizeLine();
        this.approxLines[1] = numericHelper.cross(this.point3.getParametricForm(), this.point6.getParametricForm()).normalizeLine();
        this.approxLines[2] = numericHelper.cross(this.point3.getParametricForm(), this.point4.getParametricForm()).normalizeLine();
        this.approxLines[3] = numericHelper.cross(this.point5.getParametricForm(), this.point6.getParametricForm()).normalizeLine();
        this.approxLines[4] = numericHelper.cross(this.point5.getParametricForm(), this.point4.getParametricForm()).normalizeLine();
    }
}

function PointConstraint(x, y) {
    this.isSelected = false;
    this.positionToleranceFactor = 0.015 * canvasCore.width / canvasCore.scaleFactor;
    this.point = new Point(x, y);
    this.point2 = new Point(x + this.positionToleranceFactor, y);
    this.point3 = new Point(x, y + this.positionToleranceFactor);
    this.point4 = new Point(x - this.positionToleranceFactor, y);
    this.point5 = new Point(x, y - this.positionToleranceFactor);
    this.approximatePoints = [this.point.getParametricForm(), this.point2.getParametricForm(), this.point3.getParametricForm(), this.point4.getParametricForm(), this.point5.getParametricForm()];
    this.behavior = ConstraintBehavior.FIXED;
    this.draw = function (context) {
        if (this.isSelected) {
            advancedGraphicsGeometry.drawHighlightedPoint(context, this.point);
        }
        /*advancedGraphicsGeometry.drawGroundJoint(context, this.point, constants.LINK_END_CIRCLE_RADIUS, constants.GROUND_JOINT_LINE_COLOR_INPUT, constants.GROUND_JOINT_LINE_THICKNESS, constants.LINK_END_CIRCLE_LINE_THICKNESS, constants.LINK_COLOR, constants.LINK_END_CIRCLE_FILL_COLOR, true, this.behavior != ConstraintBehavior.FIXED);*/
        /*graphicsGeometry.drawCircle(context, this.point.x, this.point.y, constants.MOVING_PIVOT_OUTER_CIRCLE_RADIUS, constants.MOVING_PIVOT_LINE_COLOR, constants.GROUND_JOINT_LINE_THICKNESS);*/

        advancedGraphicsGeometry.drawPointConstraints(context, this.point.x, this.point.y, this.positionToleranceFactor * 2 * canvasCore.scaleFactor / constants.SCREEN_COMPRESSION_FACTOR /*constants.LINK_END_CIRCLE_RADIUS*/ , constants.COLOR_BLACK, constants.LINK_END_CIRCLE_LINE_THICKNESS, this.behavior != ConstraintBehavior.FIXED ? constants.LINE_CONSTRAINT_MOVING_LINE_COLOR : constants.TOLERANCE_REGION_COLOR);
    };
    this.isMoving = function () {
        return (this.behavior == ConstraintBehavior.MOVING);
    };
    this.setAsMoving = function (isMoving) {
        this.behavior = isMoving ? ConstraintBehavior.MOVING : ConstraintBehavior.FIXED;
    };
    this.setPoint = function (x, y) {
        this.point.setPoint(x, y);
        this.point2.setPoint(x + this.positionToleranceFactor, y);
        this.point3.setPoint(x, y + this.positionToleranceFactor);
        this.point4.setPoint(x - this.positionToleranceFactor, y);
        this.point5.setPoint(x, y - this.positionToleranceFactor);
        this.approximatePoints = [this.point.getParametricForm(), this.point2.getParametricForm(), this.point3.getParametricForm(), this.point4.getParametricForm(), this.point5.getParametricForm()];
    };
    this.getPoint = function (x, y) {
        return this.point.copy();
    };
    this.setSelected = function (value) {
        this.isSelected = value;
    };
    this.getDistanceFrom = function (point) {
        return this.point.getDistanceFrom(point); // helper.getDistance(point.x, point.y, this.point.x, this.point.y);
    };
    this.getDimensions = function () {
        return this.point.getDimensions();
    };
    this.getParametricForm = function () {
        return this.point.getParametricForm();
    };
    this.getSavableInfo = function () {
        var pointInfo = this.point.getSavableInfo();

        pointInfo.push([XMLAttributes.X1, pointInfo[1][1]]);
        pointInfo.push([XMLAttributes.Y1, pointInfo[2][1]]);
        pointInfo.push([XMLAttributes.LENGTH, 0]);
        pointInfo.push([XMLAttributes.ANGLE, 0]);
        pointInfo.push([XMLAttributes.BEHAVIOR, this.behavior]);

        return pointInfo;
    };
    this.getState = function (transactionType, index) {
        return new HistoryModel(transactionType, ConstraintType.POINT_CONSTRAINT, this.isMoving(), index, ((transactionType == TransactionType.ADD) ? null : this.getPoint()), ((transactionType == TransactionType.ADD) ? null : this.getPoint()), ((transactionType == TransactionType.DELETE) ? null : this.getPoint()), ((transactionType == TransactionType.DELETE) ? null : this.getPoint()), this.isMoving());
    };
}

function CapturedPoses() {
    this.poses = [];
    this.addToCapturedPoses = function (pose) {
        var capturedPose = new Pose(pose.center.x, pose.center.y, pose.angle);
        capturedPose.setAsCaptured();

        this.poses.push(capturedPose);
    };
    this.draw = function (context) {
        for (var index = 0; index < this.poses.length; index++)
            this.poses[index].draw(context);
    };
    this.getCapturedPoses = function () {
        return this.poses.slice(0);
    };
    this.clear = function () {
        this.poses.splice(0, this.poses.length);
        //        while (this.poses.length > 0)
        //            this.poses.pop();
    };
    this.getSavableInfo = function () {
        var posesInfo = [];

        this.poses.forEach(function (item) {
            posesInfo.push(item.getSavableInfo().slice(0, -1));
        });

        return posesInfo;
    };
}

function Constraints() {
    this.pointConstraints = [];
    this.poses = [];
    this.pathPoints = [];
    this.inputPoses = [];
    this.ExtremePoses = [];
    this.smartPoses = [];
    this.lineConstraints = [];
    this.addPoseExplicitly = function (x, y, angle, hasSpecialBehavior) { // Use this is only for examples
        this.poses.push(new Pose(x, y, angle));
        var addedAt = this.poses.length - 1;

        this.poses[addedAt].setExact(hasSpecialBehavior || false);
        this.inputPoses = this.poses.createCopy();
        return this.poses[addedAt].getState(TransactionType.ADD, addedAt).setEntityType(hasSpecialBehavior || false);

    };
    this.addLineConstraint = function (L1, L2, L3, hasSpecialBehavior) { // Use this is only for examples
        var historyItem = false;
        var angle = Math.atan2(-L1, L2);
        var c = -L3 / L2;

        var p1 = new Point(0, c);

        historyItem = this.addConstraint(ConstraintType.LINE_CONSTRAINT, -1, helper.getEndPoint(p1, -3, angle));

        if (historyItem) {
            historyItem.setNewEndPoint((this.setEndPoint(ConstraintType.LINE_CONSTRAINT, -1, helper.getEndPoint(p1, 3, angle))).getNewEndPoint());
            this.setBehavior(ConstraintType.LINE_CONSTRAINT, -1, hasSpecialBehavior || false);
            historyItem.entityType = (hasSpecialBehavior || false);
        }

        return historyItem;
    };
    this.addConstraint = function (constraintType, index, point) {
        var historyItem = false;

        if (index == -1) {
            var addedAt;
            if (constraintType == ConstraintType.POSE) {
                this.poses.push(new Pose(point.x, point.y, 0));
                addedAt = this.poses.length - 1;
                historyItem = this.poses[addedAt].getState(TransactionType.ADD, addedAt);
                this.inputPoses = this.poses.createCopy();

            } else if (constraintType == ConstraintType.LINE_CONSTRAINT /*&& this.lineConstraints.length < 2*/ ) {
                //                var isMoving = (this.lineConstraints.length > 10) ? !this.lineConstraints[0].isMoving() : false;
                this.lineConstraints.push(new LineConstraint(point.x, point.y));

                addedAt = this.lineConstraints.length - 1;
                this.lineConstraints[addedAt].setAsMoving(false);

                historyItem = this.lineConstraints[addedAt].getState(TransactionType.ADD, addedAt);
            } else if (constraintType == ConstraintType.POINT_CONSTRAINT /*&& this.pointConstraints.length < 2*/ ) {
                this.pointConstraints.push(new PointConstraint(point.x, point.y));
                addedAt = this.pointConstraints.length - 1;

                historyItem = this.pointConstraints[addedAt].getState(TransactionType.ADD, addedAt);
            } else if (constraintType == ConstraintType.PATH_CONSTRAINT) {
                this.pathPoints.push(new Point(point.x, point.y));
                addedAt = this.pathPoints.length - 1;
                historyItem = this.pathPoints[addedAt].getState(TransactionType.ADD, addedAt);
            }
        } else if (index >= 0 && index <= (this.getLastIndex(constraintType) + 1)) {
            if (constraintType == ConstraintType.POSE) {
                this.poses.splice(index, 0, new Pose(point.x, point.y, 0));
                addedAt = this.getLastIndex(constraintType);

                historyItem = this.poses[addedAt].getState(TransactionType.ADD, addedAt);
            } else if (constraintType == ConstraintType.LINE_CONSTRAINT /*&& this.lineConstraints.length < 2*/ ) {
                //                var isMoving = (this.lineConstraints.length > 0) ? !this.lineConstraints[0].isMoving() : false;
                this.lineConstraints.splice(index, 0, new LineConstraint(point.x, point.y));

                addedAt = this.getLastIndex(constraintType);
                this.lineConstraints[addedAt].setAsMoving(false);

                historyItem = this.lineConstraints[addedAt].getState(TransactionType.ADD, addedAt);
            } else if (constraintType == ConstraintType.POINT_CONSTRAINT /*&& this.pointConstraints.length < 2*/ ) {
                this.pointConstraints.splice(index, 0, new PointConstraint(point.x, point.y));
                addedAt = this.getLastIndex(constraintType);

                historyItem = this.pointConstraints[addedAt].getState(TransactionType.ADD, addedAt);
            } else if (constraintType == ConstraintType.PATH_CONSTRAINT) {
                this.pathPoints.splice(index, 0, new Point(point.x, point.y));
                addedAt = this.pathPoints.length - 1;
                historyItem = this.pathPoints[addedAt].getState(TransactionType.ADD, addedAt);
            }
        }

        return historyItem;
    };
    this.clear = function (constraintType, index) {
        var historyEvent = [];
        //        = false;

        if (index >= 0) {
            if (constraintType == ConstraintType.POSE && this.poses.length > index) {
                historyEvent.push(this.poses[index].getState(TransactionType.DELETE, index));
                this.poses.splice(index, 1);
                this.inputPoses.splice(index, 1);
            } else if (constraintType == ConstraintType.LINE_CONSTRAINT && this.lineConstraints.length > index) {
                historyEvent.push(this.lineConstraints[index].getState(TransactionType.DELETE, index));
                this.lineConstraints.splice(index, 1);
            } else if (constraintType == ConstraintType.POINT_CONSTRAINT && this.pointConstraints.length > index) {
                historyEvent.push(this.pointConstraints[index].getState(TransactionType.DELETE, index));
                this.pointConstraints.splice(index, 1);
            }else if (constraintType == ConstraintType.PATH_CONSTRAINT && this.pathPoints.length > index) {
                historyEvent.push(this.pathPoints[index].getState(TransactionType.DELETE, index));
                this.pathPoints.splice(index, 1);
            }
        } else {
            while (this.poses.length > 0) {
                historyEvent.push(this.poses[this.poses.length - 1].getState(TransactionType.DELETE, this.poses.length - 1));
                this.poses.pop();
                this.inputPoses.pop();
            }

            while (this.lineConstraints.length > 0) {
                historyEvent.push(this.lineConstraints[this.lineConstraints.length - 1].getState(TransactionType.DELETE, this.lineConstraints.length - 1));
                this.lineConstraints.pop();
            }

            while (this.pointConstraints.length > 0) {
                historyEvent.push(this.pointConstraints[this.pointConstraints.length - 1].getState(TransactionType.DELETE, this.pointConstraints.length - 1));
                this.pointConstraints.pop();
            }

             while (this.pathPoints.length > 0) {
                historyEvent.push(this.pathPoints[this.pathPoints.length - 1].getState(TransactionType.DELETE, this.pointConstraints.length - 1));
                this.pathPoints.pop();
            }
        }

        if (historyEvent.length == 0)
            historyEvent = false;

        return historyEvent;
    };
    this.draw = function (context) {
        this.pointConstraints.forEach(function (item) {
            item.draw(context);
        });
        this.lineConstraints.forEach(function (item) {
            item.draw(context);
        });
        this.poses.forEach(function (item) {
            item.type = 'output';
            item.draw(context);
        });
        this.inputPoses.forEach(function (item) {
            item.type = 'input';
            item.draw(context);
        });
        this.pathPoints.forEach(function (item) {
            if (item.isSelected) {
            advancedGraphicsGeometry.drawHighlightedPoint(context, item.copy());
        }
            advancedGraphicsGeometry.drawPathPoint(context, item, constants.LINK_END_CIRCLE_RADIUS * 1.5, constants.LINK_END_CIRCLE_LINE_THICKNESS, constants.COLOR_BLACK);
        });
    };
    this.getConstraints = function () {
        var d = {
            additionalConstraintCount: this.getExactPoseCount(),
            poses: this.poses,
            lineConstraints: {
                hasFixed: false,
                fixedLine: [],
                hasFloating: false,
                floatingLine: [],
                lineLimits: []
            },
            pivotConstraints: {
                fixedPivots: [],
                movingPivots: []
            }
        };

        this.lineConstraints.forEach(function (item) {
            item.generateApproxLines();
            if (!item.isMoving()) {
                d.lineConstraints.hasFixed = true;
                d.lineConstraints.fixedLine = d.lineConstraints.fixedLine.concat(item.approxLines);
                d.lineConstraints.lineLimits = d.lineConstraints.lineLimits.concat(item.approxLineLimits);
            } else {
                d.lineConstraints.hasFloating = true;
                d.lineConstraints.floatingLine = d.lineConstraints.floatingLine.concat(item.approxLines);
                d.lineConstraints.lineLimits = d.lineConstraints.lineLimits.concat(item.approxLineLimits);
            }
        });

        this.pointConstraints.forEach(function (item) {
            item
            if (item.isMoving())
                d.pivotConstraints.movingPivots = d.pivotConstraints.movingPivots.concat(item.approximatePoints);
            else
                d.pivotConstraints.fixedPivots = d.pivotConstraints.fixedPivots.concat(item.approximatePoints);
        });

        return d;
    };
    this.getSmartConstraints = function (InputPoses) {
        var d = {
            additionalConstraintCount: this.getExactPoseCount(),
            poses: InputPoses,
            lineConstraints: {
                hasFixed: false,
                fixedLine: [],
                hasFloating: false,
                floatingLine: [],
                lineLimits: []
            },
            pivotConstraints: {
                fixedPivots: [],
                movingPivots: []
            }
        };

        this.lineConstraints.forEach(function (item) {
            item.generateApproxLines();
            if (!item.isMoving()) {
                d.lineConstraints.hasFixed = true;
                d.lineConstraints.fixedLine = d.lineConstraints.fixedLine.concat(item.approxLines);
                d.lineConstraints.lineLimits = d.lineConstraints.lineLimits.concat(item.approxLineLimits);
            } else {
                d.lineConstraints.hasFloating = true;
                d.lineConstraints.floatingLine = d.lineConstraints.floatingLine.concat(item.approxLines);
                d.lineConstraints.lineLimits = d.lineConstraints.lineLimits.concat(item.approxLineLimits);
            }
        });

        this.pointConstraints.forEach(function (item) {
            if (item.isMoving())
                d.pivotConstraints.movingPivots = d.pivotConstraints.movingPivots.concat(item.approximatePoints);
            else
                d.pivotConstraints.fixedPivots = d.pivotConstraints.fixedPivots.concat(item.approximatePoints);
        });

        return d;
    };
    this.getLastIndex = function (constraintType) {
        var lastIndex = -1;

        if (constraintType == ConstraintType.POSE && this.poses.length > 0)
            lastIndex = this.poses.length - 1;
        else if (constraintType == ConstraintType.LINE_CONSTRAINT && this.lineConstraints.length > 0)
            lastIndex = this.lineConstraints.length - 1;
        else if (constraintType == ConstraintType.POINT_CONSTRAINT && this.pointConstraints.length > 0)
            lastIndex = this.pointConstraints.length - 1;
        else if (constraintType == ConstraintType.PATH_CONSTRAINT && this.pathPoints.length > 0)
            lastIndex = this.pathPoints.length - 1;

        return lastIndex;
    };
    this.getExactPoseCount = function () {
        var exactPoseCount = 0;
        this.poses.forEach(function (item) {
            if (item.isExact())
                exactPoseCount++;
        });
        return exactPoseCount;
    };
    this.getAdditionalConstraintCount = function () {
        var constraintObj = this;
        var additionalConstraintCount = 0;
        var hasMoving = false,
            hasFixed = false;

        this.lineConstraints.forEach(function (item) {
            if (item.isMoving()) {
                hasMoving = true;
            } else {
                hasFixed = true;
            }
        });
        if (hasFixed || hasMoving)
            additionalConstraintCount++;
        if (hasFixed && hasMoving)
            additionalConstraintCount++;

        var pointConstraintCount = 0;

        this.pointConstraints.forEach(function (item) {
            if ((item.isMoving() && !hasMoving) || (!item.isMoving() && !hasFixed))
                pointConstraintCount++;
            //                additionalConstraintCount++;
        });

        if (pointConstraintCount >= 2)
            additionalConstraintCount += 2;

        return additionalConstraintCount;
    };
    this.isValidForComputation = function () {
        if (this.poses.length >= 5 || (this.poses.length >= 4 && this.lineConstraints.length > 0) || (this.poses.length >= 3 && this.pointConstraints.length > 1))
            return true;
        else
            return false;
    };
//Models by SS
    this.isValidForPathSynth = function (){
        if (this.pathPoints.length >= 5)
            return true;
        else
            return false;
    }
    this.isValidForHybridSynth = function (){
        if (this.poses.length >= 3 && this.pathPoints.length >= 2)
            return true;
        else
            return false;
    }


    this.setStartPoint = function (constraintType, index, point) {
        var historyItem = false;

        if (index < 0)
            return false;

        if (constraintType == ConstraintType.POSE && this.poses.length > index) {
            historyItem = this.poses[index].getState(TransactionType.EDIT, index).setNewStartPoint(point.copy()).setNewEndPoint(helper.getEndPoint(point, 1, this.poses[index].getAngle()));
            this.poses[index].setPoint(point.x, point.y);
        } else if (constraintType == ConstraintType.LINE_CONSTRAINT && this.lineConstraints.length > index) {
            historyItem = this.lineConstraints[index].getState(TransactionType.EDIT, index).setNewStartPoint(point.copy());
            this.lineConstraints[index].setStartPoint(point.x, point.y);
        } else if (constraintType == ConstraintType.POINT_CONSTRAINT && this.pointConstraints.length > index) {
            historyItem = this.pointConstraints[index].getState(TransactionType.EDIT, index).setNewStartPoint(point.copy()).setNewEndPoint(point.copy());
            this.pointConstraints[index].setPoint(point.x, point.y);
        } else if (constraintType == ConstraintType.PATH_CONSTRAINT && this.pathPoints.length > index) {
            historyItem = this.pathPoints[index].getState(TransactionType.EDIT, index).setNewStartPoint(point.copy()).setNewEndPoint(point.copy());
            this.pathPoints[index].setPoint(point.x, point.y);
        }

        return historyItem;
    };
    this.setEndPoint = function (constraintType, index, point, previousPoint) {
        var historyItem = false;

        if (index < -1)
            return false;

        if (index == -1) {
            var lastIndex = this.getLastIndex(constraintType);

            if (constraintType == ConstraintType.POSE && this.poses.length > 0) {
                var angle = helper.getInclination(this.poses[lastIndex].getPoint(), point);
                historyItem = this.poses[lastIndex].getState(TransactionType.EDIT, lastIndex).setNewEndPoint(helper.getEndPoint(this.poses[lastIndex].getPoint(), 1, angle));
                this.poses[lastIndex].setAngle(angle);
            } else if (constraintType == ConstraintType.LINE_CONSTRAINT && this.lineConstraints.length > 0) {
                historyItem = this.lineConstraints[lastIndex].getState(TransactionType.EDIT, lastIndex).setNewEndPoint(point.copy());
                this.lineConstraints[lastIndex].setEndPoint(point.x, point.y);
            } else if (constraintType == ConstraintType.POINT_CONSTRAINT && this.pointConstraints.length > 0) {
                historyItem = this.pointConstraints[lastIndex].getState(TransactionType.EDIT, lastIndex).setNewStartPoint(point.copy()).setNewEndPoint(point.copy());
                this.pointConstraints[lastIndex].setPoint(point.x, point.y);
            }else if (constraintType == ConstraintType.PATH_CONSTRAINT && this.pathPoints.length > 0) {
                historyItem = this.pathPoints[lastIndex].getState(TransactionType.EDIT, lastIndex).setNewStartPoint(point.copy()).setNewEndPoint(point.copy());
                this.pathPoints[lastIndex].setPoint(point.x, point.y);
            }
        } else {
            if (constraintType == ConstraintType.POSE && this.poses.length > index) {
                historyItem = this.poses[index].getState(TransactionType.EDIT, index);

                if (!previousPoint)
                    this.poses[index].setAngle(helper.getInclination(this.poses[index].getPoint(), point));
                else
                    this.poses[index].addAngle(helper.getInclination(point, this.poses[index].getPoint()) - helper.getInclination(previousPoint, this.poses[index].getPoint()));

                historyItem.setNewEndPoint(helper.getEndPoint(this.poses[index].getPoint(), 1, this.poses[index].getAngle()));
            } else if (constraintType == ConstraintType.LINE_CONSTRAINT && this.lineConstraints.length > index) {
                historyItem = this.lineConstraints[index].getState(TransactionType.EDIT, index).setNewEndPoint(point.copy());
                this.lineConstraints[index].setEndPoint(point.x, point.y);
            } else if (constraintType == ConstraintType.POINT_CONSTRAINT && this.pointConstraints.length > index) {
                historyItem = this.pointConstraints[index].getState(TransactionType.EDIT, index).setNewStartPoint(point.copy()).setNewEndPoint(point.copy());
                this.pointConstraints[index].setPoint(point.x, point.y);
            } else if (constraintType == ConstraintType.PATH_CONSTRAINT && this.pathPoints.length > index) {
                historyItem = this.pathPoints[index].getState(TransactionType.EDIT, index).setNewStartPoint(point.copy()).setNewEndPoint(point.copy());
                this.pathPoints[index].setPoint(point.x, point.y);
            }

        }

        return historyItem;
    };
    this.finalizeConstraints = function (constraintType) {
        var popped = false;
        var i = this.lineConstraints.length;

        if (constraintType == ConstraintType.LINE_CONSTRAINT && i > 0 && this.lineConstraints[i - 1].getLength() <= helper.convertLengthFromPixelsToGridUnits(constants.FINGER_RADIUS) / 2) {
            this.lineConstraints.pop();
            popped = true;
        }

        return popped;
    };
    this.setBehavior = function (constraintType, index, hasSpecialBehavior) {
        var historyItem = false;
        if (index < 0) {
            var lastIndex = this.getLastIndex(constraintType);;

            if (constraintType == ConstraintType.POSE && this.poses.length > 0) {
                historyItem = this.poses[lastIndex].getState(TransactionType.EDIT, lastIndex).setEntityType(hasSpecialBehavior);
                this.poses[lastIndex].setExact(hasSpecialBehavior);
            } else if (constraintType == ConstraintType.LINE_CONSTRAINT && this.lineConstraints.length > 0) {
                historyItem = this.lineConstraints[lastIndex].getState(TransactionType.EDIT, lastIndex).setEntityType(hasSpecialBehavior);
                this.lineConstraints[lastIndex].setAsMoving(hasSpecialBehavior);
            } else if (constraintType == ConstraintType.POINT_CONSTRAINT && this.pointConstraints.length > 0) {
                historyItem = this.pointConstraints[lastIndex].getState(TransactionType.EDIT, lastIndex).setEntityType(hasSpecialBehavior);
                this.pointConstraints[lastIndex].setAsMoving(hasSpecialBehavior);
            }
        } else {
            if (constraintType == ConstraintType.POSE && this.poses.length > index) {
                historyItem = this.poses[index].getState(TransactionType.EDIT, index).setEntityType(hasSpecialBehavior);
                this.poses[index].setExact(hasSpecialBehavior);
            } else if (constraintType == ConstraintType.LINE_CONSTRAINT && this.lineConstraints.length > index) {
                if (this.lineConstraints.length > 1 && this.lineConstraints[(index == 0) ? 1 : 0].isMoving() == hasSpecialBehavior) {
                    historyItem = [
                        this.lineConstraints[(index == 0) ? 1 : 0].getState(TransactionType.EDIT, (index == 0) ? 1 : 0).setEntityType(!hasSpecialBehavior)
                    ];
                    this.lineConstraints[(index == 0) ? 1 : 0].setAsMoving(!hasSpecialBehavior);
                }

                if (historyItem instanceof Array)
                    historyItem.push(this.lineConstraints[index].getState(TransactionType.EDIT, index).setEntityType(hasSpecialBehavior));
                else
                    historyItem = this.lineConstraints[index].getState(TransactionType.EDIT, index).setEntityType(hasSpecialBehavior);

                this.lineConstraints[index].setAsMoving(hasSpecialBehavior);
            } else if (constraintType == ConstraintType.POINT_CONSTRAINT && this.pointConstraints.length > index) {
                historyItem = this.pointConstraints[index].getState(TransactionType.EDIT, index).setEntityType(hasSpecialBehavior);
                this.pointConstraints[index].setAsMoving(hasSpecialBehavior);
            }
        }
        return historyItem;
    };
    this.getBehavior = function (constraintType, index) {
        if (index < 0)
            return false;

        var r = false;

        if (constraintType == ConstraintType.POSE && this.poses.length > index)
            r = this.poses[index].isExact();
        else if (constraintType == ConstraintType.LINE_CONSTRAINT && this.lineConstraints.length > index)
            r = this.lineConstraints[index].isMoving();
        else if (constraintType == ConstraintType.POINT_CONSTRAINT && this.pointConstraints.length > index)
            r = this.pointConstraints[index].isMoving();

        return r;
    };
    this.getClosestConstraintInfo = function (point) {
        var responseDistance = helper.convertLengthFromPixelsToGridUnits(constants.FINGER_RADIUS);
        var constraintIndex = -1;
        var constraintType = '';
        var selectedEnd = -1;

        this.pointConstraints.forEach(function (item, index) {
            item.setSelected(false);
            var d = item.getDistanceFrom(point);

            if (d < responseDistance) {
                constraintIndex = index;
                constraintType = ConstraintType.POINT_CONSTRAINT;
                responseDistance = d;
                selectedEnd = 1;
            }
        });

        this.lineConstraints.forEach(function (item, index) {
            item.setSelected(false);
            var d = item.getDistanceFrom(point);

            if (d < responseDistance) {
                constraintIndex = index;
                constraintType = ConstraintType.LINE_CONSTRAINT;
                responseDistance = d;
                selectedEnd = item.getClosestEnd(point);
            }
        });

        this.poses.forEach(function (item, index) {
            item.setSelected(false);
            var d = item.getDistanceFrom(point);

            if (d < responseDistance) {
                constraintIndex = index;
                constraintType = ConstraintType.POSE;
                responseDistance = d;
                selectedEnd = 1;
            }
        });

       this.pathPoints.forEach(function (item, index) {
            item.setSelected(false);
            var d = item.getDistanceFrom(point);

            if (d < responseDistance) {
                constraintIndex = index;
                constraintType = ConstraintType.PATH_CONSTRAINT;
                responseDistance = d;
                selectedEnd = 1;
            }
        });


        var distanceInfo = {
            constraintIndex: constraintIndex,
            constraintType: constraintType,
            constraintDistance: responseDistance,
            selectedEnd: selectedEnd
        };

        return distanceInfo;
    };
    this.setSelectedState = function (constraintType, constraintIndex, selected) {
        if (constraintIndex < 0)
            return;

        if (constraintType == ConstraintType.POSE && this.poses.length > constraintIndex)
            this.poses[constraintIndex].setSelected(selected);
        else if (constraintType == ConstraintType.LINE_CONSTRAINT && this.lineConstraints.length > constraintIndex)
            this.lineConstraints[constraintIndex].setSelected(selected);
        else if (constraintType == ConstraintType.POINT_CONSTRAINT && this.pointConstraints.length > constraintIndex)
            this.pointConstraints[constraintIndex].setSelected(selected);
        else if (constraintType == ConstraintType.PATH_CONSTRAINT && this.pathPoints.length > constraintIndex)
            this.pathPoints[constraintIndex].setSelected(selected);
    };
    this.selectConstraint = function (constraintType, constraintIndex) {
        this.setSelectedState(constraintType, constraintIndex, true);
    };
    this.cancelSelection = function (constraintType, constraintIndex) {
        this.setSelectedState(constraintType, constraintIndex, false);
    };
    this.getDimensions = function (constraintType, constraintIndex) {
        if (constraintIndex < 0)
            return;

        if (constraintType == ConstraintType.POSE && this.poses.length > constraintIndex)
            return this.poses[constraintIndex].getDimensions();
        else if (constraintType == ConstraintType.LINE_CONSTRAINT && this.lineConstraints.length > constraintIndex)
            return this.lineConstraints[constraintIndex].getDimensions();
        else if (constraintType == ConstraintType.POINT_CONSTRAINT && this.pointConstraints.length > constraintIndex)
            return this.pointConstraints[constraintIndex].getDimensions();
         else if (constraintType == ConstraintType.PATH_CONSTRAINT && this.pathPoints.length > constraintIndex)
            return this.pathPoints[constraintIndex].getDimensions();
    };
    this.getSavableInfo = function () {
        var detailedInfo = [];

        this.poses.forEach(function (item) {
            detailedInfo.push(item.getSavableInfo());
        });
        this.lineConstraints.forEach(function (item) {
            detailedInfo.push(item.getSavableInfo());
        });
        this.pointConstraints.forEach(function (item) {
            detailedInfo.push(item.getSavableInfo());
        });
        this.pathPoints.forEach(function (item) {
            var point1Info = item.getSavableInfo();
            point1Info[0][1] = ConstraintType.PATH_CONSTRAINT;
            detailedInfo.push(point1Info);
        });

        return detailedInfo;
    };
    this.checkForPoseRotation = function (index, point) {
        if (this.poses.length > index && index >= 0) {
            var distance = this.poses[index].getDistanceFrom(point);
            return (distance <= helper.convertLengthFromPixelsToGridUnits(constants.POSE_EDITING_OUTER_RING_RADIUS + (constants.POSE_EDITING_OUTER_RING_WIDTH / 2)) &&
                distance >= helper.convertLengthFromPixelsToGridUnits(constants.POSE_EDITING_OUTER_RING_RADIUS - (constants.POSE_EDITING_OUTER_RING_WIDTH / 2))) ? 2 : -1;
        }
        return -1;
    };
    this.hasConstraints = function () {
        return (this.poses.length > 0 || this.pointConstraints.length > 0 || this.lineConstraints.length > 0)
    };
}

function Link(id, linkType, isSnappyXOLink, isLengthLocked, lockedLength) {
    /* ---- Properties ---- */
    this.id = id;
    this.class = LinkClass.BINARY;
    this.joints = [];
    this.linkType = linkType;
    this.color = 'rgba(173, 255, 47, 0.6)';
    this.thirdPointAngle = 0.0;
    this.thirdPointLength = 0.0;
    this.minLength = helper.convertLengthFromPixelsToGridUnits(constants.FINGER_RADIUS);
    this.length = 0;
    this.angle = 0.0;
    this.crankAngle = 0.0;
    this.effectiveLength = 0;
    this.effectiveAngle = 0;
    this.initialOffset = 0;
    this.isSelected = false;
    this.selectedEnd = 0;
    // snappyXo Property: Author Prerna Kothari
    this.isSnappyXOLink = isSnappyXOLink
    this.isLengthLocked = isLengthLocked
    this.lockedLength = lockedLength

    /* ---- Functions ---- */
    this.draw = function (context, inAnimation, number) {
        if (this.isSelected)
            if(this.selectedEnd == 0){
                if(this.class == LinkClass.TERNARY)
                    advancedGraphicsGeometry.drawLinkHighlight(context, this.linkType, this.joints[0].getPoint(), this.joints[1].getPoint(), this.joints[2].getPoint());
                else
                advancedGraphicsGeometry.drawLinkHighlight(context, this.linkType, this.joints[0].getPoint(), this.joints[1].getPoint());
        } else if(this.selectedEnd == 1){
            advancedGraphicsGeometry.drawLinkHighlight(context, this.linkType, this.joints[0].getPoint(), null, null);
        } else if(this.selectedEnd == 2){
            advancedGraphicsGeometry.drawLinkHighlight(context, this.linkType, null, this.joints[1].getPoint(), null);
        } else if(this.selectedEnd == 3){
            advancedGraphicsGeometry.drawLinkHighlight(context, this.linkType, null, null, this.joints[2].getPoint());
        }
        //        if (!inAnimation || this.linkType == LinkType.PR) {
        //            advancedGraphicsGeometry.drawLinkPath(context, this.linkType, this.point1, this.point2, this.length, constants.LINK_PATH_LINE_THICKNESS, constants.LINK_PATH_LINE_COLOR);
        //        }
        if(this.linkType!=LinkType.RR)
            advancedGraphicsGeometry.drawLink(context, this.linkType, this.joints[0].getAnimatedPoint(), this.joints[1].getAnimatedPoint(), this.effectiveAngle, constants.LINK_THICKNESS, constants.LINK_END_CIRCLE_RADIUS, constants.LINK_END_CIRCLE_LINE_THICKNESS, constants.LINK_COLOR, constants.LINK_END_CIRCLE_FILL_COLOR, constants.GROUND_JOINT_LINE_COLOR, constants.GROUND_JOINT_LINE_THICKNESS);

        else{
            if(this.class == LinkClass.TERNARY){
                advancedGraphicsGeometry.drawRRLink(context, this.linkType, this.class, this.joints[0].getAnimatedPoint(), this.joints[1].getAnimatedPoint(),this.joints[2].getAnimatedPoint(), this.joints[0].isGround, constants.LINK_THICKNESS, constants.LINK_END_CIRCLE_RADIUS, constants.LINK_END_CIRCLE_LINE_THICKNESS, constants.LINK_COLOR, constants.LINK_END_CIRCLE_FILL_COLOR, this.color, constants.GROUND_JOINT_LINE_COLOR, constants.GROUND_JOINT_LINE_THICKNESS);
                 var location = helper.getCentroid(this.joints[0].getAnimatedPoint(),this.joints[1].getAnimatedPoint(), this.joints[2].getAnimatedPoint());
            } else {
                advancedGraphicsGeometry.drawRRLink(context, this.linkType, this.class, this.joints[0].getAnimatedPoint(), this.joints[1].getAnimatedPoint(), null, this.joints[0].isGround, constants.LINK_THICKNESS, constants.LINK_END_CIRCLE_RADIUS, constants.LINK_END_CIRCLE_LINE_THICKNESS, constants.LINK_COLOR, constants.LINK_END_CIRCLE_FILL_COLOR,this.color, constants.GROUND_JOINT_LINE_COLOR, constants.GROUND_JOINT_LINE_THICKNESS);
                var location = helper.getMidPoint(this.joints[0].getAnimatedPoint(),this.joints[1].getAnimatedPoint());
            }
            var angle = helper.getInclination(this.joints[0].getAnimatedPoint(),this.joints[1].getAnimatedPoint());
            if(canvasGrid.showLinkNumbers)
            advancedGraphicsGeometry.drawText(context, number + 2, location, angle)

        }
        //this.joints[0].draw(context, inAnimation);
        //this.joints[1].draw(context, inAnimation);

    };
    this.annotate = function (context, fixedText, movingText) {
        if(fixedText == null && movingText == null){
            //the following code combines the symbols of all overlapping joints into one string like (A,B,C)
            if(!this.joints[0].isLinkedJoint){
                var linkedJoints1 = this.joints[0].getLinkedJoints();
                if(linkedJoints1.length == 0)
                    var joint1Symbol = this.joints[0].getSymbol();
                else{
                    var joint1Symbol = '(' + this.joints[0].getSymbol() + ',';
                    for(var lj1=0; lj1<linkedJoints1.length; lj1++)
                        joint1Symbol +=  linkedJoints1[lj1].getSymbol() + ',';
                    joint1Symbol = joint1Symbol.substr(0, joint1Symbol.length-1) + ')';
                }
                advancedGraphicsGeometry.drawAnnotation(context, this.joints[0].getAnimatedPoint(), joint1Symbol);
            }

            if(!this.joints[1].isLinkedJoint){
                var linkedJoints2 = this.joints[1].getLinkedJoints();
                if(linkedJoints2.length == 0)
                    var joint2Symbol = this.joints[1].getSymbol();
                else{
                    var joint2Symbol = '(' + this.joints[1].getSymbol() + ',';
                    for(var lj2=0; lj2<linkedJoints2.length; lj2++)
                        joint2Symbol +=  linkedJoints2[lj2].getSymbol() + ',';
                    joint2Symbol = joint2Symbol.substr(0, joint2Symbol.length-1) + ')';
                }
                advancedGraphicsGeometry.drawAnnotation(context, this.joints[1].getAnimatedPoint(), joint2Symbol);
            }

            if(this.class == LinkClass.TERNARY){
                if(!this.joints[2].isLinkedJoint){
                    var linkedJoints3 = this.joints[2].getLinkedJoints();
                    if(linkedJoints3.length == 0)
                        var joint3Symbol = this.joints[2].getSymbol();
                    else{
                        var joint3Symbol = '(' + this.joints[2].getSymbol() + ',';
                        for(var lj3=0; lj3<linkedJoints3.length; lj3++)
                            joint3Symbol +=  linkedJoints3[lj3].getSymbol() + ',';
                        joint3Symbol = joint3Symbol.substr(0, joint3Symbol.length-1) + ')';
                    }
                advancedGraphicsGeometry.drawAnnotation(context, this.joints[2].getAnimatedPoint(), joint3Symbol);
                }
            }
        } else{
            advancedGraphicsGeometry.drawAnnotation(context, this.joints[0].getPoint(), fixedText);
            advancedGraphicsGeometry.drawAnnotation(context, this.joints[1].getPoint(), movingText);
        }
    };
    this.drawActuation = function (constraintLayerContext) {
        if (this.linkType == LinkType.PR) {
            var l1 = this.length / 4;
            var l2 = helper.convertLengthFromPixelsToGridUnits(constants.FINGER_RADIUS);
            var l3 = Math.sqrt(Math.pow(l1, 2) + Math.pow(l2, 2));

            var actLength = this.length - 2 * l1;
            var angle1 = Math.atan2(l2, l1);

            var actPoint1 = helper.getEndPoint(this.joints[0].getPoint(), l3, this.effectiveAngle - angle1);
            var actPoint2 = helper.getEndPoint(actPoint1, actLength, this.effectiveAngle);
            var actAngle = helper.getInclination(this.joints[0].getPoint(), this.joints[1].getPoint());

            advancedGraphicsGeometry.drawLinkTranslation(constraintLayerContext, actPoint1, actPoint2, Math.abs(actLength), actAngle, constants.GROUND_JOINT_ACTUATION_LINE_COLOR, constants.GROUND_JOINT_ACTUATION_LINE_THICKNESS);
        } else {
            advancedGraphicsGeometry.drawLinkRotation(constraintLayerContext,this.getRotationDirection(0), this.joints[0].getAnimatedPoint(), constants.FINGER_RADIUS * 1.5, constants.GROUND_JOINT_ACTUATION_LINE_COLOR, constants.GROUND_JOINT_ACTUATION_LINE_THICKNESS);
        }
    };
    this.getLinkId = function () {
        return this.id;
    };
    this.getLinkColor = function () {
        return this.color
    };
    this.setLinkColor = function (value) {
        this.color = value
    };
    this.getStartPoint = function () {
        return this.joints[0].getPoint();
    };
    this.setStartPoint = function (x, y) {
        //this.point1.setPoint(x, y);//wbg
        //this.point2 = helper.getEndPoint(this.point1, this.length, this.angle);
        this.joints[0].setPoint(x,y);

        this.updateLinkParameters();

        this.joints[0].setAnimatedPoint(helper.getEndPoint(this.joints[0].getPoint(), this.initialOffset, this.angle));
        //this.animatedPoint1 = helper.getEndPoint(this.point1, this.initialOffset, this.angle);
        //this.animatedPoint2 = helper.getEndPoint(this.animatedPoint1, this.effectiveLength, this.effectiveAngle);
        //joints implemented

        //this.joints[1].setPoint(helper.getEndPoint(this.joints[0].getPoint(), this.length, this.angle));

        //this.joints[1].setAnimatedPoint(helper.getEndPoint(this.joints[0].getAnimatedPoint(), this.effectiveLength, this.effectiveAngle));
    };
    this.getEndPoint = function () {
        return this.joints[1].getPoint();
    };
    this.setEndPoint = function (x, y) {
        //this.point2.setPoint(x, y);

        //joints implemented
        this.joints[1].setPoint(x,y);

        this.updateLinkParameters()

        this.joints[0].setAnimatedPoint(helper.getEndPoint(this.joints[0].getPoint(), this.initialOffset, this.angle));
        this.joints[1].setAnimatedPoint(helper.getEndPoint(this.joints[0].getAnimatedPoint(), this.effectiveLength, this.effectiveAngle));
        //this.animatedPoint1 = helper.getEndPoint(this.point1, this.initialOffset, this.angle);
        //this.animatedPoint2 = helper.getEndPoint(this.animatedPoint1, this.effectiveLength, this.effectiveAngle);


    };
    this.getThirdPoint = function () {
        if(this.joints.length=3)
        return this.joints[2].getPoint();
        else return false;
    };
    this.setThirdPoint = function (x, y) {
        //this.point2.setPoint(x, y);

        //joints implemented
        this.joints[2].setPoint(x,y);

        this.updateLinkParameters()

        this.joints[0].setAnimatedPoint(helper.getEndPoint(this.joints[0].getPoint(), this.initialOffset, this.angle));
        this.joints[2].setAnimatedPoint(helper.getEndPoint(this.joints[0].getAnimatedPoint(), this.thirdPointLength, this.angle - this.thirdPointAngle));
        //this.animatedPoint1 = helper.getEndPoint(this.point1, this.initialOffset, this.angle);
        //this.animatedPoint2 = helper.getEndPoint(this.animatedPoint1, this.effectiveLength, this.effectiveAngle);


    };
    this.setAngle = function (angle) {
        this.angle = angle;
        this.effectiveAngle = this.angle + ((this.linkType == LinkType.RP && this.length < this.minLength) ? (Math.PI / 2) : 0);

        //this.point2 = helper.getEndPoint(this.point1, this.length, this.angle);
        //this.animatedPoint1 = helper.getEndPoint(this.point1, this.initialOffset, this.angle);
        //this.animatedPoint2 = helper.getEndPoint(this.animatedPoint1, this.effectiveLength, this.effectiveAngle);
         //joints implemented
        this.joints[1].setPoint(helper.getEndPoint(this.joints[0].getPoint(), this.length, this.angle));
        this.joints[0].setAnimatedPoint(helper.getEndPoint(this.joints[0].getPoint(), this.initialOffset, this.angle));
        this.joints[1].setAnimatedPoint(helper.getEndPoint(this.joints[0].getAnimatedPoint(), this.effectiveLength, this.effectiveAngle));
    };
    this.getAngle = function () {
        return this.angle;
    };
    this.setCrankAngle = function (crankAngle) {
        this.crankAngle = crankAngle;

        if (this.linkType == LinkType.PR)
            this.effectiveLength = this.length * (1 - Math.sin(this.crankAngle));
        else
            this.effectiveAngle = this.angle + this.crankAngle + ((this.linkType == LinkType.RP && this.length < this.minLength) ? (Math.PI / 2) : 0);

        //this.animatedPoint2 = helper.getEndPoint(this.animatedPoint1, this.effectiveLength, this.effectiveAngle);
        //joints implemented
        this.joints[1].setAnimatedPoint(helper.getEndPoint(this.joints[0].getAnimatedPoint(), this.effectiveLength, this.effectiveAngle));
        if(this.class == LinkClass.TERNARY)
        this.joints[2].setAnimatedPoint(helper.getEndPoint(this.joints[0].getAnimatedPoint(), this.thirdPointLength, this.effectiveAngle - this.thirdPointAngle));
    };
    this.getBranch = function (drivingLink, couplerLength, couplerAngle, initialCouplerAngle) {
        var branch = Branch.ONE;
        var point1=this.joints[0].getPoint();
        var point2=this.joints[1].getPoint();
        var animatedPoint1=this.joints[0].getAnimatedPoint();
        var animatedPoint2=this.joints[1].getAnimatedPoint();

        var crankAngle = helper.getInclination(drivingLink.fixedPivot, drivingLink.movingPivot);
        var theta1 = helper.getInclination(drivingLink.fixedPivot, point1);
        var phi = crankAngle - theta1;

        var l1 = helper.getDistance(drivingLink.fixedPivot.x, drivingLink.fixedPivot.y, point1.x, point1.y); //fixed link
        var l2 = helper.getDistance(drivingLink.fixedPivot.x, drivingLink.fixedPivot.y, drivingLink.movingPivot.x, drivingLink.movingPivot.y); //input link
        var l3 = couplerLength; //coupler
        var l4 = this.effectiveLength; //output link

        var A, B, C;
        var A1, B1, C1;

        if (drivingLink.endJointType == JointType.R) {
            if (this.linkType == LinkType.RR) {
                var K1 = l1 / l2;
                var K2 = l1 / l4;
                var K3 = (Math.pow(l1, 2) + Math.pow(l2, 2) - Math.pow(l3, 2) + Math.pow(l4, 2)) / (2 * l2 * l4);

                A = (Math.cos(phi) * (1 - K2)) + K3 - K1;
                B = -2 * Math.sin(phi);
                C = -(Math.cos(phi) * (1 + K2)) + K3 + K1;

                var delta = Math.pow(B, 2) - (4 * A * C);

                if (delta > 0) {
                    var linkAngle1 = Math.atan2((-B + Math.sqrt(delta)), (2 * A)) * 2;
                    var linkAngle2 = Math.atan2((-B - Math.sqrt(delta)), (2 * A)) * 2;

                    var intersection1 = helper.getEndPoint(point1, l4, theta1 + linkAngle1);
                    var intersection2 = helper.getEndPoint(point1, l4, theta1 + linkAngle2);

                    branch = helper.getDistance(animatedPoint2.x, animatedPoint2.y, intersection1.x, intersection1.y) <
                        helper.getDistance(animatedPoint2.x, animatedPoint2.y, intersection2.x, intersection2.y) ? Branch.ONE : Branch.TWO;
                }
            } else if (this.linkType == LinkType.PR) {
                var psy = this.angle - theta1;

                A = 1;
                B = -2 * l2 * Math.cos(phi - psy);
                C = Math.pow(l1 * Math.sin(psy), 2) + Math.pow(l2, 2) - Math.pow(l3, 2) + (2 * l1 * l2 * Math.sin(psy) * Math.sin(phi - psy));

                var delta = Math.pow(B, 2) - (4 * A * C);

                if (delta > 0) {
                    var lenP = (-B + Math.sqrt(delta)) / (2 * A);
                    var lenN = (-B - Math.sqrt(delta)) / (2 * A);

                    var intersection1 = helper.getEndPoint(point1, lenP - l1 * Math.cos(psy), this.angle);
                    var intersection2 = helper.getEndPoint(point1, lenN - l1 * Math.cos(psy), this.angle);

                    branch = helper.getDistance(animatedPoint2.x, animatedPoint2.y, intersection1.x, intersection1.y) <
                        helper.getDistance(animatedPoint2.x, animatedPoint2.y, intersection2.x, intersection2.y) ? Branch.ONE : Branch.TWO;
                } else {
                    violatesConstraints = true;
                }
            } else if (this.linkType == LinkType.RP) {
                A = l1 - l4 - l2 * Math.cos(phi) + l3;
                B = 2 * l2 * Math.sin(phi);
                C = -l1 - l4 + l2 * Math.cos(phi) + l3;

                A1 = l1 - l4 - l2 * Math.cos(phi) - l3;
                B1 = 2 * l2 * Math.sin(phi);
                C1 = -l1 - l4 + l2 * Math.cos(phi) - l3;

                var delta = Math.pow(B, 2) - (4 * A * C);
                var delta1 = Math.pow(B1, 2) - (4 * A1 * C1);

                var distance = -1;

                if (delta > 0) {
                    var linkAngle1 = Math.atan2((-B + Math.sqrt(delta)), (2 * A)) * 2;
                    var linkAngle2 = Math.atan2((-B - Math.sqrt(delta)), (2 * A)) * 2;

                    var intersection1 = helper.getEndPoint(animatedPoint1, l4, theta1 + linkAngle1);
                    var intersection2 = helper.getEndPoint(animatedPoint1, l4, theta1 + linkAngle2);

                    if (distance < 0)
                        distance = helper.getDistance(animatedPoint2.x, animatedPoint2.y, intersection1.x, intersection1.y);

                    if (helper.getDistance(animatedPoint2.x, animatedPoint2.y, intersection2.x, intersection2.y) < distance) {
                        branch = Branch.TWO;
                        distance = helper.getDistance(animatedPoint2.x, animatedPoint2.y, intersection2.x, intersection2.y);
                    }

                }
                if (delta1 > 0) {
                    var linkAngle1n = Math.atan2((-B1 + Math.sqrt(delta1)), (2 * A1)) * 2;
                    var linkAngle2n = Math.atan2((-B1 - Math.sqrt(delta1)), (2 * A1)) * 2;

                    var intersection1n = helper.getEndPoint(animatedPoint1, l4, theta1 + linkAngle1n);
                    var intersection2n = helper.getEndPoint(animatedPoint1, l4, theta1 + linkAngle2n);

                    if (distance < 0) {
                        distance = helper.getDistance(animatedPoint2.x, animatedPoint2.y, intersection1n.x, intersection1n.y);
                        branch = -Branch.ONE;
                    }

                    if (helper.getDistance(animatedPoint2.x, animatedPoint2.y, intersection1n.x, intersection1n.y) < distance) {
                        branch = -Branch.ONE;
                        distance = helper.getDistance(animatedPoint2.x, animatedPoint2.y, intersection1n.x, intersection1n.y);
                    }
                    if (helper.getDistance(animatedPoint2.x, animatedPoint2.y, intersection2n.x, intersection2n.y) < distance) {
                        branch = -Branch.TWO;
                    }
                }

            }
        } else {
            if (this.linkType == LinkType.RR) {
                A = (l1 - l4) * Math.cos(phi) - l2 - l3;
                B = 2 * l4 * Math.sin(phi);
                C = (l1 + l4) * Math.cos(phi) - l2 - l3;

                A1 = (l1 - l4) * Math.cos(phi) - l2 + l3;
                B1 = 2 * l4 * Math.sin(phi);
                C1 = (l1 + l4) * Math.cos(phi) - l2 + l3;

                var delta = Math.pow(B, 2) - (4 * A * C);
                var delta1 = Math.pow(B1, 2) - (4 * A1 * C1);

                var distance = -1;

                if (delta > 0) {
                    var linkAngle1 = Math.atan2((-B + Math.sqrt(delta)), (2 * A)) * 2;
                    var linkAngle2 = Math.atan2((-B - Math.sqrt(delta)), (2 * A)) * 2;

                    var intersection1 = helper.getEndPoint(animatedPoint1, l4, theta1 + linkAngle1);
                    var intersection2 = helper.getEndPoint(animatedPoint1, l4, theta1 + linkAngle2);

                    if (distance < 0)
                        distance = helper.getDistance(animatedPoint2.x, animatedPoint2.y, intersection1.x, intersection1.y);

                    if (helper.getDistance(animatedPoint2.x, animatedPoint2.y, intersection2.x, intersection2.y) < distance) {
                        branch = Branch.TWO;
                        distance = helper.getDistance(animatedPoint2.x, animatedPoint2.y, intersection2.x, intersection2.y);
                    }
                }

                if (delta1 > 0) {
                    var linkAngle1n = Math.atan2((-B1 + Math.sqrt(delta1)), (2 * A1)) * 2;
                    var linkAngle2n = Math.atan2((-B1 - Math.sqrt(delta1)), (2 * A1)) * 2;

                    var intersection1n = helper.getEndPoint(animatedPoint1, l4, theta1 + linkAngle1n);
                    var intersection2n = helper.getEndPoint(animatedPoint1, l4, theta1 + linkAngle2n);

                    if (distance < 0) {
                        distance = helper.getDistance(animatedPoint2.x, animatedPoint2.y, intersection1n.x, intersection1n.y);
                        branch = -Branch.ONE;
                    }

                    if (helper.getDistance(animatedPoint2.x, animatedPoint2.y, intersection1n.x, intersection1n.y) < distance) {
                        branch = -Branch.ONE;
                        distance = helper.getDistance(animatedPoint2.x, animatedPoint2.y, intersection1n.x, intersection1n.y);
                    }
                    if (helper.getDistance(animatedPoint2.x, animatedPoint2.y, intersection2n.x, intersection2n.y) < distance) {
                        branch = -Branch.TWO;
                    }
                }

            } else if (this.linkType == LinkType.PR) {
                var psy = this.angle - theta1;

                A = Math.pow(Math.cos(phi - psy), 2);
                B = -2 * (l2 + l1 * Math.sin(psy) * Math.sin(phi - psy)) * Math.cos(phi - psy);
                C = Math.pow(l1 * Math.sin(psy) * Math.sin(phi - psy), 2) + Math.pow(l2, 2) - Math.pow(l3, 2) + (2 * l2 * l1 * Math.sin(psy) * Math.sin(phi - psy));

                var delta = Math.pow(B, 2) - (4 * A * C);

                if (delta > 0) {
                    var lenP = (-B + Math.sqrt(delta)) / (2 * A);
                    var lenN = (-B - Math.sqrt(delta)) / (2 * A);

                    var intersection1 = helper.getEndPoint(point1, lenP - l1 * Math.cos(psy), this.angle);
                    var intersection2 = helper.getEndPoint(point1, lenN - l1 * Math.cos(psy), this.angle);

                    branch = helper.getDistance(animatedPoint2.x, animatedPoint2.y, intersection1.x, intersection1.y) <
                        helper.getDistance(animatedPoint2.x, animatedPoint2.y, intersection2.x, intersection2.y) ? Branch.ONE : Branch.TWO;
                } else {
                    violatesConstraints = true;
                }
            } else if (this.linkType == LinkType.RP) {
                var angle1 = (phi + initialCouplerAngle + theta1) % (2 * Math.PI);
                var angle2 = (phi + (2 * Math.PI - initialCouplerAngle) + theta1) % (2 * Math.PI);

                branch = Math.abs(angle1 - this.effectiveAngle) < Math.abs(angle2 - this.effectiveAngle) ? Branch.ONE : Branch.TWO;
            }
        }

        return branch;
    };
    this.changeBranch = function () {
        this.angle = this.effectiveAngle - ((this.linkType == LinkType.RP && this.length < this.minLength) ? (Math.PI / 2) : 0);

        if (this.linkType == LinkType.PR) {
            //            this.angle = helper.unitizeRadians(this.angle + Math.PI);
            //            this.length = helper.getDistance(this.point1.x, this.point1.y, this.animatedPoint2.x, this.animatedPoint2.y);
        }

        //        this.length *= (this.linkType == LinkType.PR) ? -1 : 1;

        this.joints[1].setPoint(helper.getEndPoint(this.joints[0].getPoint(), this.length, this.angle));
        if(this.class == LinkClass.TERNARY)
        this.joints[2].setPoint(helper.getEndPoint(this.joints[0].getPoint(), this.thirdPointLength, this.angle - this.thirdPointAngle));

        //        this.angle = helper.getInclination(this.point1, this.point2);
        //        this.length = helper.getDistance(this.point1.x, this.point1.y, this.point2.x, this.point2.y);
    };
    this.changeRotationDirection = function (index) {
        if(index < this.joints.length)
            this.joints[index].changeRotationDirection();
        else
            this.joints[0].changeRotationDirection();
    };
    this.getRotationDirection = function (index) {
        if(index < this.joints.length)
            return this.joints[index].getRotationDirection();
        else
            return this.joints[0].getRotationDirection();
    };
    this.getDistanceFrom = function (point) {
        var distance = helper.convertLengthFromPixelsToGridUnits(constants.FINGER_RADIUS);

        if(this.class == LinkClass.BINARY){
        var a = this.joints[0].getPoint().getDistanceFrom(point); // helper.getDistance(point.x, point.y, this.point1.x, this.point1.y);
        var b = this.length;
        var c = this.joints[1].getPoint().getDistanceFrom(point); //helper.getDistance(point.x, point.y, this.point2.x, this.point2.y);

        var height = Math.sqrt(Math.pow(Math.pow(a, 2) + Math.pow(b, 2) + Math.pow(c, 2), 2) - (2 * (Math.pow(a, 4) + Math.pow(b, 4) + Math.pow(c, 4)))) / (2 * b);

        if (c <= b && a <= b)
            distance = height;
        else if (a < c)
            distance = a;
        else
            distance = c;
        } else{
            var b1 = helper.getPointSide(this.joints[0].getPoint(), this.joints[1].getPoint(), point);
            var b2 = helper.getPointSide(this.joints[1].getPoint(), this.joints[2].getPoint(), point);
            var b3 = helper.getPointSide(this.joints[2].getPoint(), this.joints[0].getPoint(), point);
            if((b1 == b2) && (b2 == b3))
                distance = helper.convertLengthFromPixelsToGridUnits(constants.FINGER_RADIUS);
            else{
                var d1 = this.joints[0].getPoint().getDistanceFrom(point);
                var d2 = this.joints[1].getPoint().getDistanceFrom(point);
                var d3 = this.joints[2].getPoint().getDistanceFrom(point);
                distance = Math.min(d1,d2,d3);
            }
        }
        return distance;
    };
    this.getDimensions = function () {
        if(this.selectedEnd == 0){
        return [[
            DimensionType.X, (this.joints[0].getPoint().x).toFixed(2)
        ], [
            DimensionType.Y, (this.joints[0].getPoint().y).toFixed(2)
        ], [
            DimensionType.Length, (this.length).toFixed(2)
        ], [
            DimensionType.Angle, helper.toDegrees(this.angle).toFixed(2)
        ]];
        } else
            return this.joints[this.selectedEnd -1].getDimensions();
    };
    this.getSavableInfo = function () {
        var point1Info = this.joints[0].getPoint().getSavableInfo();
        var point2Info = this.joints[1].getPoint().getSavableInfo();
        var plotCurves = [this.joints[0].plotCurve, this.joints[1].plotCurve];
        if(this.class == LinkClass.TERNARY){
            var point3Info = this.joints[2].getPoint().getSavableInfo();
            plotCurves.push(this.joints[2].plotCurve)
        }

        point1Info[0][1] = this.linkType;
        point1Info.push([XMLAttributes.X1, point2Info[1][1]]);
        point1Info.push([XMLAttributes.Y1, point2Info[2][1]]);
        point1Info.push([XMLAttributes.LENGTH, this.length]);
        point1Info.push([XMLAttributes.ANGLE, helper.toDegrees(this.angle)]);
        point1Info.push([XMLAttributes.GROUND, this.joints[0].isGround])
        point1Info.push([XMLAttributes.COLOR, this.color]);
        point1Info.push([XMLAttributes.RPM, this.getRPM()]);
        point1Info.push([XMLAttributes.DIRECTION, this.getRotationDirection(0)]);
        point1Info.push([XMLAttributes.PLOT, plotCurves]);
        if(this.class == LinkClass.TERNARY){
            point1Info.push([XMLAttributes.CLASS, this.class])
            point1Info.push([XMLAttributes.X2, point3Info[1][1]]);
            point1Info.push([XMLAttributes.Y2, point3Info[2][1]]);
        }


        return point1Info;
    };
    this.getExportInfo = function (index) {
        var exportData = {};
        var symbol = [];
        var name ='';
        var length
        var relativeAngle

        for(var ljt = 0; ljt<this.joints.length; ljt++)
            symbol.push(this.joints[ljt].getSymbol());

        if(!this.joints[0].isGround){
            var otherLinkJoint = this.joints[0].getOtherLink(this).getJoints(0);
            var otherAngle = (helper.getInclination(this.joints[0].getAnimatedPoint(), otherLinkJoint.getAnimatedPoint()) + (2*Math.PI)) % (2*Math.PI);
            var angleName = symbol[1] + symbol[0] + otherLinkJoint.getSymbol();
            relativeAngle = otherAngle - ((this.effectiveAngle + (2*Math.PI)) % (2*Math.PI));
            if(relativeAngle > Math.PI){
                relativeAngle =  (2* Math.PI) - relativeAngle;
                angleName = otherLinkJoint.getSymbol() + symbol[0] + symbol[1];
            }
        }else{
            relativeAngle = (this.effectiveAngle + (2*Math.PI)) % (2*Math.PI);
            var angleName = symbol[0] + symbol[1] + ' (X-axis)';
        }

        if(this.class == LinkClass.BINARY){
            name = symbol[0] + symbol[1] //something like AB
            length = this.length.toFixed(3)
        } else{
            name = symbol[0] + symbol[1] + '-' + symbol[1] + symbol[2] + '-' + symbol[2] + symbol[0]; //something like AB-BC-AC
            length = this.length.toFixed(3) + ', ' + helper.getDistance(this.joints[1].getAnimatedPoint(), this.joints[2].getAnimatedPoint()).toFixed(3) + ', ' + this.thirdPointLength.toFixed(3);
            var thirdAngle = helper.toDegrees(this.thirdPointAngle);
            if(thirdAngle > 180){
                thirdAngle =  360 - thirdAngle;
            }
            exportData['angle1'] = thirdAngle > 180 ? symbol[1] + symbol[0] + symbol[2] : symbol[2] + symbol[0] + symbol[1];
            exportData['value1'] = thirdAngle.toFixed(3);
        }


        exportData['desc'] = this.class;
        exportData['name'] = name + ' (' + index + ')'; //this is name of link
        exportData['length'] = length; //this is length of link
        exportData['angleName'] = angleName;
        exportData['value'] = helper.toDegrees(relativeAngle).toFixed(3);

        return exportData
    };
    this.getClosestEnd = function (point) {
        if (helper.getDistance(point.x, point.y, this.joints[1].getPoint().x, this.joints[1].getPoint().y) <= helper.convertLengthFromPixelsToGridUnits(constants.FINGER_RADIUS))
            return 2;
        else if (helper.getDistance(point.x, point.y, this.joints[0].getPoint().x, this.joints[0].getPoint().y) <= helper.convertLengthFromPixelsToGridUnits(constants.FINGER_RADIUS))
            return 1;
        else if(this.class == LinkClass.TERNARY)
            if(helper.getDistance(point.x, point.y, this.joints[2].getPoint().x, this.joints[2].getPoint().y) <= helper.convertLengthFromPixelsToGridUnits(constants.FINGER_RADIUS))
                return 3;
            else
                return 0;
        else
            return 0;
    };
    this.getLinkSummary = function () {
        return {
            fixedPivot: this.joints[0].getPoint(),
            movingPivot: this.joints[1].getAnimatedPoint(),
            length: this.effectiveLength,
            angle: this.effectiveAngle,
            endJointType: (this.linkType == LinkType.RP) ? JointType.P : JointType.R
        };
    };
    this.getState = function (transactionType, index) {
        return new HistoryModel(transactionType, SelectionType.LINK, this.linkType, index, ((transactionType == TransactionType.ADD) ? null : this.getStartPoint()), ((transactionType == TransactionType.ADD) ? null : this.getEndPoint()), ((transactionType == TransactionType.DELETE) ? null : this.getStartPoint()), ((transactionType == TransactionType.DELETE) ? null : this.getEndPoint()), this.getLinkId());
    };
    this.setAnimatedPoint = function (drivingLink, couplerLength, branch, initialCouplerAngle) {
        var violatesConstraints = false;
        var tempPoint;

        var theta1 = helper.getInclination(drivingLink.fixedPivot, this.joints[0].getPoint());
        var phi = helper.getInclination(drivingLink.fixedPivot, drivingLink.movingPivot) - theta1;

        var l1 = helper.getDistance(drivingLink.fixedPivot.x, drivingLink.fixedPivot.y, this.joints[0].getPoint().x, this.joints[0].getPoint().y); //fixed link
        var l2 = drivingLink.length; //input link
        var l3 = couplerLength * branch / Math.abs(branch); //coupler
        var l4 = this.effectiveLength; //output link

        var A, B, C;

        if (drivingLink.endJointType == JointType.R) {
            if (this.linkType == LinkType.RR) {
                var K1 = l1 / l2;
                var K2 = l1 / l4;
                var K3 = (Math.pow(l1, 2) + Math.pow(l2, 2) - Math.pow(l3, 2) + Math.pow(l4, 2)) / (2 * l2 * l4);

                A = (Math.cos(phi) * (1 - K2)) + K3 - K1;
                B = -2 * Math.sin(phi);
                C = -(Math.cos(phi) * (1 + K2)) + K3 + K1;
            } else if (this.linkType == LinkType.PR) {
                var psy = this.angle - theta1;

                A = 1;
                B = -2 * l2 * Math.cos(phi - psy);
                C = Math.pow(l1 * Math.sin(psy), 2) + Math.pow(l2, 2) - Math.pow(l3, 2) + (2 * l1 * l2 * Math.sin(psy) * Math.sin(phi - psy));

            } else if (this.linkType == LinkType.RP) {
                A = l1 - l4 - l2 * Math.cos(phi) + l3;
                B = 2 * l2 * Math.sin(phi);
                C = -l1 - l4 + l2 * Math.cos(phi) + l3;
            }
        } else {
            if (this.linkType == LinkType.RR) {
                A = (l1 - l4) * Math.cos(phi) - l2 - l3;
                B = 2 * l4 * Math.sin(phi);
                C = (l1 + l4) * Math.cos(phi) - l2 - l3;
            } else if (this.linkType == LinkType.PR) {
                var psy = this.angle - theta1;

                A = Math.pow(Math.cos(phi - psy), 2);
                B = -2 * (l2 + l1 * Math.sin(psy) * Math.sin(phi - psy)) * Math.cos(phi - psy);
                C = Math.pow(l1 * Math.sin(psy) * Math.sin(phi - psy), 2) + Math.pow(l2, 2) - Math.pow(l3, 2) + (2 * l2 * l1 * Math.sin(psy) * Math.sin(phi - psy));

            } else if (this.linkType == LinkType.RP) {
                this.effectiveAngle = (theta1 + ((Math.abs(branch) == Branch.ONE) ? (phi + initialCouplerAngle) : (phi - initialCouplerAngle))) % (2 * Math.PI);
                //this.animatedPoint2 = helper.getEndPoint(this.point1, this.effectiveLength, this.effectiveAngle);
                this.joints[1].setAnimatedPoint(helper.getEndPoint(this.joints[0].getPoint(), this.effectiveLength, this.effectiveAngle));
                if(this.class == LinkClass.TERNARY)
                    this.joints[2].setAnimatedPoint(helper.getEndPoint(this.joints[0].getAnimatedPoint(), this.thirdPointLength, this.effectiveAngle - this.thirdPointAngle));

            }
        }

        if (drivingLink.endJointType == JointType.R || (drivingLink.endJointType == JointType.P && this.linkType != LinkType.RP)) {
            var delta = Math.pow(B, 2) - (4 * A * C);

            if (delta > 0 && (this.linkType != LinkType.PR || (this.linkType == LinkType.PR && Math.abs(A) > 0.0001))) {
                var linkLength = l4;
                var linkAngle = this.effectiveAngle;

                if (this.linkType == LinkType.RR || this.linkType == LinkType.RP) {
                    linkAngle = (theta1 + ((Math.abs(branch) == Branch.ONE) ? Math.atan2((-B + Math.sqrt(delta)), (2 * A)) * 2 : Math.atan2((-B - Math.sqrt(delta)), (2 * A)) * 2)) % (2 * Math.PI);
                    this.effectiveAngle = linkAngle;
                } else if (this.linkType == LinkType.PR) {
                    linkLength = ((Math.abs(branch) == Branch.ONE) ? ((-B + Math.sqrt(delta)) / (2 * A)) : ((-B - Math.sqrt(delta)) / (2 * A))) - l1 * Math.cos(this.angle - theta1);
                }

                //tempPoint = helper.getEndPoint(this.point1, linkLength, linkAngle);
                //this.animatedPoint2.setPoint(tempPoint.x, tempPoint.y);
                this.joints[1].setAnimatedPoint(helper.getEndPoint(this.joints[0].getPoint(), linkLength, linkAngle))
                if(this.class == LinkClass.TERNARY)
                    this.joints[2].setAnimatedPoint(helper.getEndPoint(this.joints[0].getAnimatedPoint(), this.thirdPointLength, this.effectiveAngle - this.thirdPointAngle));

            } else {
                violatesConstraints = true;
            }
        }

        return violatesConstraints;
    };
    this.verifyLinkage = function (drivingLink, couplerLength) {
        var violatesConstraints = false;
        var tempPoint;

        var theta1 = helper.getInclination(drivingLink.fixedPivot, this.joints[0].getPoint());
        var phi = helper.getInclination(drivingLink.fixedPivot, drivingLink.movingPivot) - theta1;

        var l1 = helper.getDistance(drivingLink.fixedPivot.x, drivingLink.fixedPivot.y, this.joints[0].getPoint().x, this.joints[0].getPoint().y); //fixed link
        var l2 = drivingLink.length; //input link
        var l3 = couplerLength * branch / Math.abs(branch); //coupler
        var l4 = this.effectiveLength; //output link

        var A, B, C;

        if (drivingLink.endJointType == JointType.R) {
            if (this.linkType == LinkType.RR) {
                var K1 = l1 / l2;
                var K2 = l1 / l4;
                var K3 = (Math.pow(l1, 2) + Math.pow(l2, 2) - Math.pow(l3, 2) + Math.pow(l4, 2)) / (2 * l2 * l4);

                A = (Math.cos(phi) * (1 - K2)) + K3 - K1;
                B = -2 * Math.sin(phi);
                C = -(Math.cos(phi) * (1 + K2)) + K3 + K1;
            } else if (this.linkType == LinkType.PR) {
                var psy = this.angle - theta1;

                A = 1;
                B = -2 * l2 * Math.cos(phi - psy);
                C = Math.pow(l1 * Math.sin(psy), 2) + Math.pow(l2, 2) - Math.pow(l3, 2) + (2 * l1 * l2 * Math.sin(psy) * Math.sin(phi - psy));

            } else if (this.linkType == LinkType.RP) {
                A = l1 - l4 - l2 * Math.cos(phi) + l3;
                B = 2 * l2 * Math.sin(phi);
                C = -l1 - l4 + l2 * Math.cos(phi) + l3;
            }
        } else {
            if (this.linkType == LinkType.RR) {
                A = (l1 - l4) * Math.cos(phi) - l2 - l3;
                B = 2 * l4 * Math.sin(phi);
                C = (l1 + l4) * Math.cos(phi) - l2 - l3;
            } else if (this.linkType == LinkType.PR) {
                var psy = this.angle - theta1;

                A = Math.pow(Math.cos(phi - psy), 2);
                B = -2 * (l2 + l1 * Math.sin(psy) * Math.sin(phi - psy)) * Math.cos(phi - psy);
                C = Math.pow(l1 * Math.sin(psy) * Math.sin(phi - psy), 2) + Math.pow(l2, 2) - Math.pow(l3, 2) + (2 * l2 * l1 * Math.sin(psy) * Math.sin(phi - psy));

            } else if (this.linkType == LinkType.RP) {

            }
        }

        if (drivingLink.endJointType == JointType.R || (drivingLink.endJointType == JointType.P && this.linkType != LinkType.RP)) {
            var delta = Math.pow(B, 2) - (4 * A * C);

            if (delta > 0 && (this.linkType != LinkType.PR || (this.linkType == LinkType.PR && Math.abs(A) > 0.0001))) {

            } else {
                violatesConstraints = true;
            }
        }

        return violatesConstraints;
    };
    this.setSelected = function (value, selectedEnd = 0) {
        this.isSelected = value;
        this.selectedEnd = selectedEnd;
    };
    this.reset = function () {
        this.crankAngle = 0;
        this.effectiveAngle = this.angle + ((this.linkType == LinkType.RP && this.length < this.minLength) ? (Math.PI / 2) : 0);

        if (this.linkType == LinkType.PR)
            this.effectiveLength = this.length;

        //this.animatedPoint1 = helper.getEndPoint(this.point1, this.initialOffset, this.angle);
       // this.animatedPoint2 = helper.getEndPoint(this.animatedPoint1, this.effectiveLength, this.effectiveAngle);
        //joints implemented
        this.joints[0].setAnimatedPoint(helper.getEndPoint(this.joints[0].getPoint(), this.initialOffset, this.angle));
        this.joints[1].setAnimatedPoint(helper.getEndPoint(this.joints[0].getAnimatedPoint(), this.effectiveLength, this.effectiveAngle));
        if(this.class == LinkClass.TERNARY)
            this.joints[2].setAnimatedPoint(helper.getEndPoint(this.joints[0].getAnimatedPoint(), this.thirdPointLength, this.effectiveAngle - this.thirdPointAngle));

    };
    this.updateJointOrder = function () {
        if(this.joints[1].isGround){
            if(this.joints[0].isGround)
                this.joints[0].setGroundState(false);
            else{
            this.swapJoints(1,0);
            if(this.selectedEnd != 0)
                this.selectedEnd = 1;
            }
        }
        if(this.class == LinkClass.TERNARY)
            if(this.joints[2].isGround){
                if(this.joints[0].isGround)
                    this.joints[0].setGroundState(false);
                else{
                    this.swapJoints(2,0);
                    if(this.selectedEnd != 0)
                        this.selectedEnd = 1;
                }
            }

    };
    this.updateLinkParameters = function(){
        this.angle = helper.getInclination(this.joints[0].getPoint(), this.joints[1].getPoint());
        this.length = this.joints[0].getPoint().getDistanceFrom(this.joints[1].getPoint());

        this.effectiveLength = (this.linkType == LinkType.RP && this.length < this.minLength) ? 0.0001 : this.length;
        this.effectiveAngle = this.angle + ((this.linkType == LinkType.RP && this.length < this.minLength) ? (Math.PI / 2) : 0);

        if(this.class == LinkClass.TERNARY){
            this.thirdPointAngle = this.angle - helper.getInclination(this.joints[0].getPoint(), this.joints[2].getPoint());
            this.thirdPointLength = this.joints[0].getPoint().getDistanceFrom(this.joints[2].getPoint());
        }
    };
    this.updateLinkAnimationParameters = function() {
        // this function updates other joint if two joints of a ternary link are known, currently implemented for RRR links only.
        if(this.class == LinkClass.TERNARY){
            var knownJoints = this.joints.filter(item=> item.position == State.Known);
            if(knownJoints.length == 2){

                if(this.joints[0].position == State.Known && this.joints[1].position == State.Known){
                    this.effectiveAngle = helper.getInclination(this.joints[0].getAnimatedPoint(), this.joints[1].getAnimatedPoint());
                    this.joints[2].setAnimatedPoint(helper.getEndPoint(this.joints[0].getAnimatedPoint(), this.thirdPointLength, this.effectiveAngle - this.thirdPointAngle));

                }else if(this.joints[0].position == State.Known && this.joints[2].position == State.Known){
                    var effectiveThirdAngle = helper.getInclination(this.joints[0].getAnimatedPoint(), this.joints[2].getAnimatedPoint());
                    this.effectiveAngle = this.thirdPointAngle + effectiveThirdAngle;
                    this.joints[1].setAnimatedPoint(helper.getEndPoint(this.joints[0].getAnimatedPoint(), this.effectiveLength, this.effectiveAngle ));

                } else if(this.joints[1].position == State.Known && this.joints[2].position == State.Known){
                    var internalAngle = helper.getInclination(this.joints[2].getPoint(), this.joints[0].getPoint()) - helper.getInclination(this.joints[2].getPoint(), this.joints[1].getPoint());
                    var animatedInclination = helper.getInclination(this.joints[2].getAnimatedPoint(), this.joints[1].getAnimatedPoint())
                    this.joints[0].setAnimatedPoint(helper.getEndPoint(this.joints[2].getAnimatedPoint(), this.thirdPointLength, animatedInclination + internalAngle));
                }
            }
        }
    };
    this.setRPM = function (value) {
        this.rpm = this.joints[0].setRPM(value);
    };
    this.getRPM = function () {
        return this.joints[0].getRPM();
    };
    this.setJoint = function (index, joint){
        if (this.joints.length <= 3){
        if(index==-1)
            this.joints.push(joint);
        else
            this.joints[index]= joint;
        }
    };
    this.deleteJoint = function (index) {
        this.joints.splice(index, 1);
    };
    this.getJointTypes = function(){
        var joints = [];
        if(this.linkType==LinkType.RR){
            joints.push(JointType.R);
            joints.push(JointType.R);
        }else if(this.linkType==LinkType.RP){
            joints.push(JointType.R);
            joints.push(JointType.P);
        }else if(this.linkType==LinkType.PR){
            joints.push(JointType.P);
            joints.push(JointType.R);
        }
        return joints;
    };
    this.getJoints = function(x, linkedParent = false){
        if(x!= 'undefined' && x< this.joints.length){
            if(!linkedParent)
                return this.joints[x];
            else if(this.joints[x].isLinkedJoint)
                return this.joints[x].getParentJoint();
            else
                return this.joints[x];
        }else
            return this.joints.slice();
    };
    this.swapJoints = function (swapNumber, swapWith) {
        //this function swaps joints in this.joints array
        var temp = this.joints[swapNumber];
        this.joints[swapNumber] = this.joints[swapWith];
        this.joints[swapWith] = temp;
        this.updateLinkParameters();
    };
    this.isGround = function () {
        return this.joints[0].isGround
    };
    this.getRelativeAngleChange = function (change) {
        if(change == null){
            this.crankAngle = 0;
            change = 0
        }
        if(this.joints[0].isGround && this.joints[1].position == State.unKnown)
            this.crankAngle = 0;
        if(this.joints[0].isGround)
            return this.crankAngle + change;
        else
            return this.joints[0].getOtherLink(this).crankAngle;
//            return this.joints[0].getOtherLink(this).getRelativeAngleChange(this.crankAngle + change)
    };

    this.switchClass = function(){
      if(this.joints.length == 3) {
          this.class = LinkClass.TERNARY;
          this.color = 'rgba(255, 128, 191, 0.6)';
      }
        else{
            this.class = LinkClass.BINARY;
            this.color = 'rgba(173, 255, 47, 0.6)';
            if(this.selectedEnd == 3)
                this.selectedEnd = 2;
        }
    };
    this.initializeTernaryLink = function () {
        this.thirdPointAngle = helper.toRadians(constants.LINK_THIRD_JOINT_ANGLE);
        this.thirdPointLength = this.length / 2 / Math.cos(this.thirdPointAngle);
        this.joints[2].setPoint(helper.getEndPoint(this.joints[0].getPoint(), this.thirdPointLength, this.angle - this.thirdPointAngle))
        this.joints[2].setAnimatedPoint(helper.getEndPoint(this.joints[0].getPoint(), this.thirdPointLength, this.angle - this.thirdPointAngle))
    };
//    this.checkConnectionWith = function (link, excludeLink) {
//        //this function checks if this.joints(2) is the joint via which the input link is connected if not then if it is joints[3] it will swap joints[2] and joints[3].
//        // this is done because this.setAnimatedPoint just sets animated point for joints[2]. Just for the case of four bar linkage
//        var connected = false;
//        if(link == this) connected = true;
//        else{
//            var link1 = this.joints[0].getOtherLink(this);
//            var link2 = this.joints[1].getOtherLink(this);
//            if(link1 != null && link1 != GroundLink && link1 != excludeLink)
//                if(link1.checkConnectionWith(link, this)) connected = true;
//            if(link2 != null && link2 != GroundLink && link2 != excludeLink)
//                if(link2.checkConnectionWith(link, this)) connected = true;
//
//            //if(this.class == LinkClass.TERNARY){
//             //   var link3 = this.joints[2].getOtherLink(this);
//            //    if(link3 != null && link3 != GroundLink && link3 != excludeLink)
//            //        if(link3.checkConnectionWith(link, this)) connected = true;
//            //}
//        }
//        return connected
//    };

}

function Coupler() {
    /* ---- Properties ---- */
    this.enabled = false;
    this.selected = false;
    this.couplerSet = false;

    this.firstJoint = new Point(0, 0);
    this.secondJoint = new Point(0, 0);

    this.effectiveCouplerLength = 0;
    this.couplerAngle = 0;

    this.baseAngle = 0;

    this.traceLength = 0;
    this.traceAngle = 10 * Math.PI / 180;
    this.tracePointOrientation = 0;

    this.firstLinkLength = 0;
    this.firstLinkAngle = 0;

    this.secondLinkLength = 0;
    this.secondLinkAngle = 0;

    this.joint1Type = JointType.R;
    this.joint2Type = JointType.R;


    /* ---- Methods ---- */
    this.initializeCoupler = function (drivingLinkInfo, drivenLinkInfo) {

        this.firstJoint.setPoint(drivingLinkInfo.movingPivot.x, drivingLinkInfo.movingPivot.y);
        this.secondJoint.setPoint(drivenLinkInfo.movingPivot.x, drivenLinkInfo.movingPivot.y);

        this.couplerAngle = helper.getInclination(this.firstJoint, this.secondJoint);

        this.joint1Type = drivingLinkInfo.endJointType;
        this.joint2Type = drivenLinkInfo.endJointType;

        var m1 = (drivingLinkInfo.endJointType == JointType.P) ? Math.tan(drivingLinkInfo.angle + (Math.PI / 2)) : Math.tan(drivenLinkInfo.angle);
        var m2 = (drivenLinkInfo.endJointType == JointType.P) ? Math.tan(drivenLinkInfo.angle + (Math.PI / 2)) : Math.tan(drivingLinkInfo.angle);

        var intersection;
        var intersection2;

        if (drivingLinkInfo.endJointType == JointType.P || drivenLinkInfo.endJointType == JointType.P) {
            intersection = helper.getIntersectionPoint(drivingLinkInfo.movingPivot, m1, drivenLinkInfo.movingPivot, m2);
        }

        if (drivingLinkInfo.endJointType == JointType.P && drivenLinkInfo.endJointType == JointType.P) {
            intersection2 = helper.getIntersectionPoint(drivingLinkInfo.movingPivot, -1 / m1, drivenLinkInfo.movingPivot, -1 / m2);
        }

        this.firstLinkAngle = (drivingLinkInfo.endJointType == JointType.P) ? helper.getInclination(drivingLinkInfo.movingPivot, intersection) - this.couplerAngle : 0;
        this.secondLinkAngle = (drivenLinkInfo.endJointType == JointType.P) ? helper.getInclination(drivenLinkInfo.movingPivot, intersection) - this.couplerAngle : 0;

        this.firstLinkLength = (drivingLinkInfo.endJointType == JointType.P) ? helper.getDistance(drivingLinkInfo.movingPivot.x, drivingLinkInfo.movingPivot.y, intersection.x, intersection.y) : 0;
        this.secondLinkLength = (drivenLinkInfo.endJointType == JointType.P) ? helper.getDistance(drivenLinkInfo.movingPivot.x, drivenLinkInfo.movingPivot.y, intersection.x, intersection.y) : 0;

        var point1 = helper.getEndPoint(this.firstJoint, this.firstLinkLength, this.firstLinkAngle + this.couplerAngle);
        var point2 = helper.getEndPoint(this.secondJoint, this.secondLinkLength, this.secondLinkAngle + this.couplerAngle);

        this.effectiveCouplerLength = helper.getDistance(point1.x, point1.y, point2.x, point2.y);
        this.baseAngle = (drivingLinkInfo.endJointType == JointType.P && drivenLinkInfo.endJointType == JointType.P) ? (helper.getInclination(intersection, intersection2) - this.couplerAngle) : (helper.getInclination(point1, point2) - this.couplerAngle);

        this.enabled = true;
    };
    this.setInitialTraceLength = function () {
        if (this.enabled && !this.couplerSet) {
            this.traceLength = this.effectiveCouplerLength / 2;
            this.traceAngle = 10 * Math.PI / 180;
            this.tracePointOrientation = 0 - this.baseAngle - this.couplerAngle;
        }
    };
    this.setCoupler = function (drivingLinkInfo, drivenLinkInfo) {
        this.firstJoint.setPoint(drivingLinkInfo.movingPivot.x, drivingLinkInfo.movingPivot.y);
        this.secondJoint.setPoint(drivenLinkInfo.movingPivot.x, drivenLinkInfo.movingPivot.y);

        this.couplerAngle = helper.getInclination(this.firstJoint, this.secondJoint);

        var m1 = (drivingLinkInfo.endJointType == JointType.P) ? Math.tan(drivingLinkInfo.angle + (Math.PI / 2)) : Math.tan(drivenLinkInfo.angle);
        var m2 = (drivenLinkInfo.endJointType == JointType.P) ? Math.tan(drivenLinkInfo.angle + (Math.PI / 2)) : Math.tan(drivingLinkInfo.angle);

        var intersection;
        var intersection2;

        if (drivingLinkInfo.endJointType == JointType.P || drivenLinkInfo.endJointType == JointType.P) {
            intersection = helper.getIntersectionPoint(drivingLinkInfo.movingPivot, m1, drivenLinkInfo.movingPivot, m2);
        }

        if (drivingLinkInfo.endJointType == JointType.P && drivenLinkInfo.endJointType == JointType.P) {
            intersection2 = helper.getIntersectionPoint(drivingLinkInfo.movingPivot, -1 / m1, drivenLinkInfo.movingPivot, -1 / m2);
        }

        this.firstLinkAngle = (drivingLinkInfo.endJointType == JointType.P) ? helper.getInclination(drivingLinkInfo.movingPivot, intersection) - this.couplerAngle : 0;
        this.secondLinkAngle = (drivenLinkInfo.endJointType == JointType.P) ? helper.getInclination(drivenLinkInfo.movingPivot, intersection) - this.couplerAngle : 0;

        this.firstLinkLength = (drivingLinkInfo.endJointType == JointType.P) ? helper.getDistance(drivingLinkInfo.movingPivot.x, drivingLinkInfo.movingPivot.y, intersection.x, intersection.y) : 0;
        this.secondLinkLength = (drivenLinkInfo.endJointType == JointType.P) ? helper.getDistance(drivenLinkInfo.movingPivot.x, drivenLinkInfo.movingPivot.y, intersection.x, intersection.y) : 0;

        var point1 = helper.getEndPoint(this.firstJoint, this.firstLinkLength, this.firstLinkAngle + this.couplerAngle);
        var point2 = helper.getEndPoint(this.secondJoint, this.secondLinkLength, this.secondLinkAngle + this.couplerAngle);

        if (drivingLinkInfo.endJointType == JointType.P && drivenLinkInfo.endJointType == JointType.P) {
            this.baseAngle = (helper.getInclination(intersection, intersection2) - this.couplerAngle);
        } else if (drivingLinkInfo.endJointType == JointType.P || drivenLinkInfo.endJointType == JointType.P) {
            this.baseAngle = helper.getInclination(point1, point2) - this.couplerAngle;
        }
    };
    this.incrementCouplerAngle = function (angle) {
        this.couplerAngle = this.couplerAngle + angle;
    };
    this.getLength = function () {
        return this.effectiveCouplerLength;
    };
    this.getAngle = function () {
        var angle = ((-Math.PI - this.secondLinkAngle + this.firstLinkAngle) + (2 * Math.PI)) / (2 * Math.PI);
        return (this.joint1Type == JointType.P && this.joint2Type == JointType.P) ? angle : (this.baseAngle + this.couplerAngle);
    };
    this.isEnabled = function () {
        return this.enabled;
    };
    this.disable = function () {
        this.enabled = false;
        this.couplerSet = false;
        this.setSelected(false);
    };
    this.isSelected = function () {
        return this.selected;
    };
    this.setSelected = function (value) {
        this.selected = value;
    };
    this.getFirstPoint = function () {
        var point1 = helper.getEndPoint(this.firstJoint, this.firstLinkLength, this.firstLinkAngle + this.couplerAngle);
        return point1;
    };
    this.getSecondPoint = function () {
        var point1 = helper.getEndPoint(this.firstJoint, this.firstLinkLength, this.firstLinkAngle + this.couplerAngle);
        var point2 = helper.getEndPoint(point1, this.effectiveCouplerLength, this.baseAngle + this.couplerAngle);
        return point2;
    };
    this.getTracePoint = function () {
        var point1 = helper.getEndPoint(this.firstJoint, this.firstLinkLength, this.firstLinkAngle + this.couplerAngle);
        return helper.getEndPoint(point1, this.traceLength, this.traceAngle + this.baseAngle + this.couplerAngle);
    };
    this.getTraceDetail = function () {
        var tracePoint = this.getTracePoint();
        var traceOrientation = this.tracePointOrientation + this.baseAngle + this.couplerAngle;

        return new Pose(tracePoint.x, tracePoint.y, traceOrientation);
    };
    this.setTracePoint = function (point, orientation) {
        var point1 = helper.getEndPoint(this.firstJoint, this.firstLinkLength, this.firstLinkAngle + this.couplerAngle);
        this.traceLength = helper.getDistance(point1.x, point1.y, point.x, point.y);
        this.traceAngle = helper.getInclination(point1, point) - this.baseAngle - this.couplerAngle; //

        this.tracePointOrientation = orientation - this.baseAngle - this.couplerAngle; //orientation of the pose at the tip of the coupler
        this.couplerSet = true;
    };
    this.setTraceDetail = function (length, angle, orientation, absolute) {
        this.traceLength = length;
        this.traceAngle = angle;

        if (orientation)
            this.tracePointOrientation = orientation - (absolute ? 0 : (this.baseAngle + this.couplerAngle));
    };
    this.getTraceOrientation = function () {
        return this.tracePointOrientation + this.baseAngle + this.couplerAngle;
    };
    this.getDistanceFrom = function (point) {
        var tracePoint = this.getTracePoint();
        return helper.getDistance(point.x, point.y, tracePoint.x, tracePoint.y);
    };
    this.getDimensions = function () {
        //        return [[DimensionType.Length, this.traceLength.toFixed(2)],
        //                [DimensionType.Angle, helper.toDegrees(this.traceAngle).toFixed(2)]
        //        ];

        var tracePoint = this.getTraceDetail();
        return [[DimensionType.X, tracePoint.center.x.toFixed(2)], [DimensionType.Y, tracePoint.center.y.toFixed(2)], [DimensionType.Angle, helper.toDegrees(tracePoint.angle).toFixed(2)]];
    };
    this.getSavableInfo = function () {
        var savableInfo = [
            [
                XMLAttributes.TYPE, SelectionType.COUPLER
            ],
            [
                XMLAttributes.LENGTH, this.traceLength
            ],
            [
                XMLAttributes.ANGLE, helper.toDegrees(this.traceAngle)
            ],
            [
                XMLAttributes.ORIENTATION, helper.toDegrees(this.tracePointOrientation)
            ]
        ];

        return savableInfo;
    };
    this.getState = function (transactionType) {
        var historyItem = this.getTraceDetail().getState(transactionType, -2);
        historyItem.drawableType = SelectionType.COUPLER;
        historyItem.oldBehavior = this.traceLength + ',' + this.traceAngle;

        return historyItem;
    };
    this.draw = function (context) {
        if (this.enabled){
            advancedGraphicsGeometry.drawCoupler(context, this.selected, this.firstJoint, this.secondJoint, this.firstLinkLength, this.firstLinkAngle + this.couplerAngle, this.traceLength, this.traceAngle, this.effectiveCouplerLength, this.baseAngle + this.couplerAngle, this.tracePointOrientation, this.joint1Type, this.joint2Type, constants.COUPLER_LINE_THICKNESS, constants.LINK_END_CIRCLE_RADIUS, constants.LINK_END_CIRCLE_LINE_THICKNESS, constants.LINK_COLOR, constants.LINK_END_CIRCLE_FILL_COLOR, constants.COUPLER_FILL_COLOR);
        }
    };
    this.annotate = function (context, point1, endEffector, point2) {
        if (this.enabled) {
            if (this.joint1Type == JointType.P)
                advancedGraphicsGeometry.drawAnnotation(context, helper.getEndPoint(this.firstJoint, this.firstLinkLength, this.firstLinkAngle + this.couplerAngle), 'C');
            else if (this.joint2Type == JointType.P)
                advancedGraphicsGeometry.drawAnnotation(context, helper.getEndPoint(this.secondJoint, this.secondLinkLength, this.secondLinkAngle + this.couplerAngle), 'C');

            advancedGraphicsGeometry.drawAnnotation(context, this.getTracePoint(), 'P');
        }
    };
}

function Joint(id, link1, link2, jointType) {
    this.id= id;
    this.type = jointType;
    this.point = new Point(0,0);
    this.animatedPoint = new Point(0, 0);
    this.lastPoint = new Point(0, 0);
    //////////////////////////////////////////////////////
    // the following values may have been accessed directly in functions in Linkage
    //Thus these are treated as public parameters, DO NOT CHANGE THEIR NAMES
    this.isGround = false;//true if connected to Ground link
    this.isSelected = false;
    this.plotCurve = false;
    this.isConnected = false;//true if connected to two links
    this.isLinkedJoint = false;// this is only set for eight bar linkages where link is connected to a already connected joint
    this.position = State.unKnown;
    this.link1 = link1;
    this.link2 = link2;
    /////////////////////////////////////////////////////
    this.linkedJoints = [];
    this.curves = [new Curve(constants.COUPLER_CURVE_1_COLOR),
        new Curve(constants.COUPLER_CURVE_2_COLOR),
        new Curve(constants.COUPLER_CURVE_1_COLOR),
        new Curve(constants.COUPLER_CURVE_2_COLOR)
    ];
    this.rpm = 6.00;
    this.rotationDirection = 1;
    this.symbol = '';

    this.draw = function(context, inAnimation){

        graphicsGeometry.drawSolidCircle(context, this.animatedPoint.x, this.animatedPoint.y, constants.LINK_END_CIRCLE_RADIUS-3, constants.LINK_COLOR, constants.LINK_END_CIRCLE_LINE_THICKNESS, '#000');

    };
    this.drawCurve = function (constraintLayerContext, curvePoseDensity, curveThickness) {
        if(this.plotCurve && !this.isGround)
            for (var i = 0; i < this.curves.length; i++)
                this.curves[i].draw(constraintLayerContext, curvePoseDensity, curveThickness);
    };

    //set functions
    this.setPoint = function (x, y, comingFromParent = false) {
        if(typeof x == 'object' && typeof y == 'undefined'){
            // if x is a point Object
            var tempPoint = x;
            y = tempPoint.y;
            x = tempPoint.x
        }

        if(this.isLinkedJoint && !comingFromParent){
            this.linkedJoints[0].setPoint(x, y, false);
        }else if(this.linkedJoints.length > 0 && !this.isLinkedJoint && !comingFromParent){
            for(var lj = 0; lj<this.linkedJoints.length; lj++)
                this.linkedJoints[lj].setPoint(x, y, true);
        }

        this.point.setPoint(x, y);

        if(this.link1 != GroundLink && this.link1 != null)
            this.link1.updateLinkParameters();
        if(this.link2 != GroundLink && this.link2 != null)
            this.link2.updateLinkParameters();
    };
    this.setAnimatedPoint = function(x,y, comingFromParent = false){
        this.position = State.Known;
        if(typeof x == 'object' && typeof y == 'undefined'){
            // if x is a point Object
            var tempPoint = x;
            y = tempPoint.y;
            x=tempPoint.x
        }

        // following for linked joints
        if(this.isLinkedJoint && !comingFromParent){
            this.linkedJoints[0].setAnimatedPoint(x, y, false);
        } else if(this.linkedJoints.length > 0 && !this.isLinkedJoint && !comingFromParent){
            for(var lj = 0; lj<this.linkedJoints.length; lj++)
                this.linkedJoints[lj].setAnimatedPoint(x, y, true);
        }

        // following can handle both Point and x & y as input
        this.lastPoint.setPoint(this.animatedPoint.x, this.animatedPoint.y);
        this.animatedPoint.setPoint(x,y);

        //following adjjust the boolean function ad updates parameters


        if(this.link1 != GroundLink && this.link1 != null)
            this.link1.updateLinkAnimationParameters();
        if(this.link2 != GroundLink && this.link2 != null)
            this.link2.updateLinkAnimationParameters();
    };
    this.setAnimatedPointFromCurve = function(index){
        if(index<0) index =0;
        if(index>this.curves[0].points.length - 1) index = this.curves[0].points.length - 1;
        this.lastPoint.setPoint(this.animatedPoint.x, this.animatedPoint.y);
        var point = this.curves[0].points[index];
        this.animatedPoint.setPoint(point.x, point.y);
        this.position = State.Known;
    };
    this.setPlotCurve = function (value) {
            this.plotCurve = value;
        if(this.link1 == GroundLink || this.link2 == GroundLink)
            this.plotCurve = false;
    };
    this.setIsLinkedJoint = function (value) {
            this.isLinkedJoint = value;
    };
    this.setSelected = function (value) {
        this.isSelected = value;
    };
    this.setLink = function(newLink, oldLink){
        if(typeof oldLink == 'undefined') oldLink=null;
        if(oldLink==this.link1) this.link1=newLink;
        else if(oldLink==this.link2) this.link2=newLink;
        else return false;
        this.updateIsGround();
        this.updateIsConnected();
        return true;//this is returned if new link is set
    };
    this.setGroundState = function(state) {
        if(state){
            if(this.link1 == null)
                this.link1 = GroundLink;
            else if(this.link2 == null)
                this.link2 = GroundLink;
            else
                return false
        } else {
            if(this.link1 == GroundLink)
                this.link1 = null
            else if(this.link2 == GroundLink)
                this.link2 = null
            else
                return false
        }
        this.updateIsGround();
        this.updateIsConnected();
        if(this.link1 != GroundLink && this.link1 != null)
            this.link1.updateJointOrder();
        if(this.link2 != GroundLink && this.link2 != null)
            this.link2.updateJointOrder();
        return true

    };
    this.updateIsGround = function (){
        this.isGround = false;
        if(this.link1!=null)
            if(this.link1.linkType==LinkType.Ground){
                this.isGround = true;
                this.plotCurve = false;
            }
        if(this.link2!=null)
            if(this.link2.linkType==LinkType.Ground){
                this.isGround = true;
                this.link2 = this.link1;
                this.link1 = GroundLink;
                this.plotCurve = false;
            }
            };
    this.updateIsConnected = function (value){
        if(this.link1!=null && this.link2!=null)
            this.isConnected=true;
        else {
            if(this.link1==null){
                this.link1 = this.link2;
                this.link2 = null;
            }
            this.isConnected=false;
        }
    };
    this.setRPM = function (value) {
        this.rpm = helper.constrain(parseFloat(value), constants.MIN_RPM, constants.MAX_RPM);
    };
    this.setJointSymbol = function (index) {
        this.symbol = String.fromCharCode('A'.charCodeAt(0) + index);
    };
    this.changeRotationDirection = function () {
        this.rotationDirection = -1 * this.rotationDirection;
    };

    //Curve functions
    this.addCurvePoint = function (index, point) {
        this.curves[index].addPoint(point);
    };
    this.clearCurves = function (index) {
        if (index = -1)
            for (var j = 0; j < this.curves.length; j++)
                this.curves[j].clear();
        else
            this.curves[index].clear();
    };
    this.reverseCurve = function (index) {
        this.curves[index].reverse();
    };
    this.hasCurve = function () {
        return this.curves[0].points.length > 0
    };

    // get functions
    this.getJointId = function () {
        return this.id;
    };
    this.getPoint = function () {
        return this.point.copy();
    };
    this.getAnimatedPoint = function () {
        return this.animatedPoint.copy();
    };
    this.getLastPoint = function () {
        return this.lastPoint.copy();
    };
    this.getOtherLink = function (link) {
        if (link == this.link1) return this.link2;
        else if (link == this.link2) return this.link1;
        else return false;
    };
    this.getCommonLink = function (joint) {
        if (this.link1 == joint.link1 || this.link1 == joint.link2) return this.link1;
        else if (this.link2 == joint.link1 || this.link2 == joint.link2) return this.link2;
        else if(this.linkedJoints.length >0 && this.isLinkedJoint)
            return this.linkedJoints[0].getCommonLink(joint)
        else if(joint.getLinkedJoints().length >0 && joint.isLinkedJoint)
            return joint.getLinkedJoints(0).getCommonLink(joint)
        else return false;
    };
    this.getDistanceFrom = function (point) {
        var distance = this.point.getDistanceFrom(point)

        return distance;
    };
    this.getRPM = function () {
        return this.rpm;
    };
    this.getDescription = function () {
        var desc ='';
        if(!this.isConnected)
            desc = 'Coupler End Point'
        else if(this.isGround)
            desc = 'Fixed Pivot '
        else
            desc = 'Moving Pivot '
        if(this.linkedJoints.length > 0)
            desc += '(Overlapping Joint) '
        else if(this.plotCurve)
            desc += '(Plotting Curve) '
        return desc
    };
    this.getSavableInfo = function (index) {
        this.setJointSymbol(index);
        var pointInfo = this.animatedPoint.getSavableInfo();
        pointInfo[1][1] = pointInfo[1][1].toFixed(3)
        pointInfo[2][1] = pointInfo[2][1].toFixed(3)
        pointInfo[0][1] = SelectionType.JOINT;
        pointInfo.push([XMLAttributes.DESCRIPTION, this.getDescription()])
        pointInfo.push([XMLAttributes.SYMBOL, this.symbol])
//        var info =
//            {
//                joint: this.symbol,
//                desc: this.getDescription(),
//                x: this.animatedPoint.x.toFixed(4),
//                y: this.animatedPoint.y.toFixed(4)
//            }
        return pointInfo
    };
    this.getSymbol = function () {
        return this.symbol
    };
    this.getRotationDirection = function () {
        return this.rotationDirection;
    };
    this.getDimensions   = function () {
        return [[
            DimensionType.X, (this.point.x).toFixed(2)
        ], [
            DimensionType.Y, (this.point.y).toFixed(2)
        ]];
    };
    // linked Joint Functions
    this.addLinkedJoint = function (index, joint) {
        if(index == -1 && (!this.isLinkedJoint || this.linkedJoints.length == 0))
            this.linkedJoints.push(joint);
        else
            this.linkedJoints.splice(index, 0, joint)
    };
    this.updateLinkedJointsLink = function (oldLink) {
        for(var lj = 0; lj < this.linkedJoints.length; lj++)
            this.linkedJoints[lj].setLink(this.link1, oldLink)
    };
    this.getLinkedJoints = function (index) {
        if(index!= 'undefined' && index< this.linkedJoints.length) return this.linkedJoints[index];
        return this.linkedJoints.slice();
    };
    this.getParentJoint = function () {
        if(this.isLinkedJoint){
            return this.linkedJoints[0].getParentJoint();
        }else
            return this

    };
    this.clearLinkedJoints = function (index) {
        if(index == -1){
            this.linkedJoints = [];
            this.isLinkedJoint = false;
        }
        else if(typeof index == 'object'){
            var ljIndex = this.linkedJoints.findIndex(item=> item == index);
            this.linkedJoints.splice(ljIndex, 1);
        }
        else
            this.linkedJoints.splice(index, 1);
    };

}

function linkLengthFunctions(varListIndex1, jointListIndex1, varListIndex2, jointListIndex2, linkLength) {
    // variableListIndex is index of that joint in the unknown joints array of Optimisation. And jointListIndex is the index of that joint in linkage.joints array.
    if(varListIndex1 < varListIndex2){
        this.variableListIndex1 = varListIndex1;
        this.variableListIndex2 = varListIndex2;
        this.jointListIndex1 = jointListIndex1;
        this.jointListIndex2 = jointListIndex2;
    } else {
        this.variableListIndex1 = varListIndex2;
        this.variableListIndex2 = varListIndex1;
        this.jointListIndex1 = jointListIndex2;
        this.jointListIndex2 = jointListIndex1;
    }
    this.linkLength = linkLength;

    this.x1;
    this.y1;
    this.x2;
    this.y2;
    this.deltaX;
    this.deltaY;
    this.newLength;

    this.calculate = function (xi) {
        // this function calculates the value of objective function at xi
        this.assignPositions(xi);
        return Math.pow((this.newLength - this.linkLength), 2);
    };
    this.setInitialPositions = function (index, x, y) {
        //this function sets the initial positions for the objective function
        if(index == this.jointListIndex1){
            this.x1 = x;
            this.y1 = y;
        }
        if(index == this.jointListIndex2){
            this.x2 = x;
            this.y2 = y;
        }

    };
    this.assignPositions = function (xi) {
        // this function assigns positons to the respective variables from the xi matrix
        if(this.variableListIndex1 >= 0){
            this.x1 = xi[2 * this.variableListIndex1];
            this.y1 = xi[2 * this.variableListIndex1 + 1];
        }
        if(this.variableListIndex2 >= 0){
            this.x2 = xi[2 * this.variableListIndex2];
            this.y2 = xi[2 * this.variableListIndex2 + 1];
        }
        this.deltaX = this.x1 - this.x2;
        this.deltaY = this.y1 - this.y2;
        this.newLength = Math.sqrt((this.deltaX * this.deltaX) + (this.deltaY * this.deltaY));
    };
    this.deri_wrt_xi = function (xi, i) {
        // this function computed the first derivative or Gradient of the objective function
        // https://en.wikipedia.org/wiki/Newton%27s_method_in_optimization
        if(!(i == 2 * this.variableListIndex1 || i == 2 * this.variableListIndex1 +1 || i == 2 * this.variableListIndex2 || i == 2 * this.variableListIndex2 + 1)) return 0;

        this.assignPositions(xi);
        if(i == 2 * this.variableListIndex1)
            //this is drivative wrt x1
            return -2 * this.deltaX * (this.linkLength / this.newLength - 1);
        if(i == 2 * this.variableListIndex1 + 1)
            //this is drivative wrt y1
            return -2 * this.deltaY * (this.linkLength / this.newLength - 1);
        if(i == 2 * this.variableListIndex2)
            //this is drivative wrt x2
            return 2 * this.deltaX * (this.linkLength / this.newLength - 1);
        if(i == 2 * this.variableListIndex2 + 1)
            //this is drivative wrt y2
            return 2 * this.deltaY * (this.linkLength / this.newLength - 1);
        else return false;
    };
    this.second_deri_wrt_xi = function (xi, i, j) {
        // this function creates the Hessian matrix for Newton Raphson method
        // refer https://en.wikipedia.org/wiki/Hessian_matrix to know more
        if((!(i == 2 * this.variableListIndex1 || i == 2 * this.variableListIndex1 +1 || i == 2 * this.variableListIndex2 || i == 2 * this.variableListIndex2 + 1)) || (!(j == 2 * this.variableListIndex1 || j == 2 * this.variableListIndex1 +1 || j == 2 * this.variableListIndex2 || j == 2 * this.variableListIndex2 + 1)))return 0;

        this.assignPositions(xi);
        var const1 = 2 * (1- (this.linkLength / this.newLength));
        var const2 = 2 * this.linkLength / Math.pow(this.newLength, 3);
        if(i == j) {
            //these are second derivatives wrt to xi or yi; so d/dxi^2 or d/dyi^2
            if(i == 2 * this.variableListIndex1 || i == 2 * this.variableListIndex2) return const1 + (this.deltaX * this.deltaX * const2);
            if(i == 2 * this.variableListIndex1 + 1 || i == 2 * this.variableListIndex2 + 1) return const1 + (this.deltaY * this.deltaY * const2);
        }
        if(i > j){
            // switch them as hessian matrix is always symmetric
            var temp = i;
            i = j;
            j = temp;
        }
        if(i == 2 * this.variableListIndex1){
            if(j == 2 * this.variableListIndex1 + 1) return this.deltaX * this.deltaY * const2;
            if(j == 2 * this.variableListIndex2) return -const1 - (this.deltaX * this.deltaX * const2);
            if(j == 2 * this.variableListIndex2 + 1) return -this.deltaX * this.deltaY * const2;
        }
        if(i == 2 * this.variableListIndex1 + 1){
            if(j == 2 * this.variableListIndex2) return -this.deltaY * this.deltaX * const2;
            if(j == 2 * this.variableListIndex2 + 1) return  -const1 - (this.deltaY * this.deltaY * const2);
        }
        if(i == 2 * this.variableListIndex2){
            if(j == 2 * this.variableListIndex2 + 1) return this.deltaX * this.deltaY * const2;
        }
        console.log('Please check Hessian matrix formation');
        return 0; // this means something went wrong
    };


}

function Curve(color) {
    this.points = [];
    this.color = color;
    this.isClosed = false;
    this.addPoint = function (point) {
        this.points.push(point);
    };
    this.clear = function () {
        this.points = [];
        //this.points.length = 0;
        //                while (this.points.length > 0) {
        //                    this.points.pop();
        //                }
    };
    this.draw = function (context, poseDensity, curveThickness) {
        if(this.points.length > 0){
            if (this.isClosed) {
                advancedGraphicsGeometry.drawClosedCurve(context, this.points, this.color, poseDensity, curveThickness);
            } else {
                advancedGraphicsGeometry.drawOpenCurve(context, this.points, this.color, poseDensity, curveThickness);
            }
        }
    };
    this.setClosed = function (isClosed) {
        this.isClosed = isClosed;
    };
    this.toArray = function () {
        var pointArray = [];

        for (var i = 0; i < this.points.length; i++)
            pointArray.push([this.points[i].x, this.points[i].y]);

        return pointArray;
    };
    this.exportCurve = function () {
        return this.points.slice(0);
    };
    this.reverse = function () {
        this.points.reverse();
    };
}

function Linkage() {
    /* ----- Properties ----- */
    this.crankAngle = 0;
    this.angleIncrement = 1;

    this.drivingElement = 0;
    this.drivenElement = 1;
    this.otherInputs = [];
    this.couplerElement = 2;

    this.branchCount = 2;

    this.links = [];
    this.joints= [];
    this.coupler = new Coupler();

    this.couplerCurves = [new Curve(constants.COUPLER_CURVE_1_COLOR),
        new Curve(constants.COUPLER_CURVE_2_COLOR),
        new Curve(constants.COUPLER_CURVE_1_COLOR),
        new Curve(constants.COUPLER_CURVE_2_COLOR)
    ];
    this.crankLimits = {
        crankLimitingAngles: [],
        totalAngle: 0,
        angleIncrement: 0,
        firstLimit: 99
    };
    this.linkageParameters = {
        branch: Branch.ONE,
        circuit: (+1), //use + or - 1
        linkageType: '',
        initialCouplerAngle: 0
    };

    /* ----- Methods ----- */
    this.addLink = function (linkType, index, point, id, thresholdDistance = helper.convertLengthFromPixelsToGridUnits(constants.FINGER_RADIUS), comingFromImport = false, isSnappyXOLink=false, isLengthLocked = false, lockedLength = undefined) {
        //index -1 means adding a new link, if other then link is pushed at that position; draw connected is ket false for the synthesis dyads loading when they cannot be connected.
        //if comingFromImport then dont set default joint to ground as grounds will be set seperately.
        var historyItem = false;

        if(this.links.length < constants.MAX_LINK_COUNT && this.checkIfRevolute() && this.joints.length < constants.MAX_JOINT_COUNT && linkType != "PP") {
            var newId = id == -1 ? linkIds.getAvailableId() : id;

            if (index == -1) {
                this.links.push(new Link(newId, linkType, isSnappyXOLink, isLengthLocked, lockedLength));
            } else {
                this.links.splice(index, 0, new Link(newId, linkType, isSnappyXOLink, isLengthLocked, lockedLength));
            }
            var addedAt = (index == -1) ? (this.links.length - 1) : index;
            var jointType = this.links[addedAt].getJointTypes()
            //adds both the joints for the link
            var closestJointInfo = this.getClosestJointInfo(point);
            if(closestJointInfo && closestJointInfo.jointDistance <= thresholdDistance){
                //checks if there is any joint close to added link; if yes then it is a connected link

                if(closestJointInfo.isConnected)
                    //this will check if joint is already a connected 1DOF joint, if yes then add a new linked joint; usefull in 8 bar mechanism
                    this.addLinkedJoint(jointType[0],-1,this.joints[closestJointInfo.jointIndex],this.links[addedAt],-1);
                else
                    if(this.joints[closestJointInfo.jointIndex].setLink(this.links[addedAt])){
                        this.links[addedAt].setJoint(-1,this.joints[closestJointInfo.jointIndex]);
                        //jointType[1]= (this.joints[closestJointInfo.jointIndex].type == JointType.P) ? JointType.R : jointType[1];//if first joint is P set the second to R to avoid PP dyads
                    }
                    else//this is case if joint already has two links connected; will not be used ever but just in case.
                        this.addJoint(jointType[0],-1,GroundLink,this.links[addedAt],-1);
            } else if (comingFromImport) {
                this.addJoint(jointType[0], -1, this.links[addedAt], null, -1);
            } else
                this.addJoint(jointType[0],-1,GroundLink,this.links[addedAt],-1);
            this.addJoint(jointType[1],-1,this.links[addedAt],null,-1);//null as this joint is free and not connected to any other link
            //set start point accordingly
            if(closestJointInfo && closestJointInfo.jointDistance <= thresholdDistance)
                this.setLinkStartPoint(index, this.joints[closestJointInfo.jointIndex].getPoint());
            else
                this.setLinkStartPoint(index, point);
            if (id != -1)
                linkIds.removeAvailableId(id);

            historyItem = this.links[addedAt].getState(TransactionType.ADD, addedAt);

        }
        return historyItem;

    };
    this.addJoint = function(jointType, index, link1, link2, id){
        if(this.joints.length < constants.MAX_JOINT_COUNT){
           var newId = id == -1 ? jointIds.getAvailableId() : id;
            if (index == -1) {
                this.joints.push(new Joint(newId, link1, link2, jointType));
            } else {
                this.joints.splice(index, 0, new Joint(newId, link1, link2, jointType));
            }
            var addedAt = (index == -1) ? (this.joints.length - 1) : index;
            this.joints[addedAt].updateIsGround(); //updates the ground state of the joint
            this.joints[addedAt].updateIsConnected(); //updates the connection state of the joint
            if(link1 != null)
                if(link1.linkType!=LinkType.Ground)
                    link1.setJoint(-1,this.joints[addedAt]);//adds joint to respective links
            if(link2 != null)
                if(link2.linkType!=LinkType.Ground)
                    link2.setJoint(-1,this.joints[addedAt]);

            if (id != -1)
                jointIds.removeAvailableId(id);
        }
        else return false;
    };
    this.addLinkedJoint = function(jointType, index, linkedJoint, newLink, id){
        if(this.joints.length < constants.MAX_JOINT_COUNT){
           var newId = id == -1 ? jointIds.getAvailableId() : id;
            var link1 = linkedJoint.link1;
            if (index == -1) {
                this.joints.push(new Joint(newId, link1, newLink, jointType));
            } else {
                this.joints.splice(index, 0, new Joint(newId, link1, newLink, jointType));
            }
            var addedAt = (index == -1) ? (this.joints.length - 1) : index;
            this.joints[addedAt].setIsLinkedJoint(true);// set just for this joint
            this.joints[addedAt].addLinkedJoint(-1, linkedJoint);
            linkedJoint.addLinkedJoint(-1, this.joints[addedAt]);
            newLink.setJoint(-1,this.joints[addedAt]);

            this.joints[addedAt].updateIsGround(); //updates the ground state of the joint
            this.joints[addedAt].updateIsConnected(); //updates the connection state of the joint

            if (id != -1)
                jointIds.removeAvailableId(id);
        }
        else return false;
    };
    this.mergeJoint = function(index, jointNumber, point, thresholdDistance = helper.convertLengthFromPixelsToGridUnits(constants.FINGER_RADIUS)){//index is index of link in this.links, jointNumber is index of joint in joints array of that link
        //thresholdDistance is the distance if specified then joints will only merge if distance between them is less than thresholdDistance
        // if the destination joint is already connected then it will add a linked joint, which is used in Eight bar applications.

        if (index >= -1 && index < this.links.length) {
            var lindex = (index == -1) ? (this.links.length - 1) : index;
            var joints = this.links[lindex].getJoints();
            jointNumber = (jointNumber == -1) ? joints.length-1 : jointNumber;


            var closestJointInfo = this.getClosestJointInfo(point, joints[jointNumber]);
            //the following will check if the joint satisfies all criterias to be merged or linked or it will switch linkt type to Binary
            if(closestJointInfo){
                if(this.joints[closestJointInfo.jointIndex].type == JointType.R && this.links[lindex].getJoints(jointNumber).type == JointType.R){
                if(closestJointInfo.jointDistance <= thresholdDistance){
                    if(this.joints[closestJointInfo.jointIndex].getOtherLink(this.links[lindex]) != false){
                        if(this.links[lindex].class == LinkClass.TERNARY && joints[jointNumber].isConnected == false){
                            // this converts ternary to binary if two joints are merged
                            this.deleteJoint(joints[jointNumber]);
                            this.links[lindex].deleteJoint(jointNumber);
                            this.links[lindex].switchClass();
                        }
                        else return
                    }else if(closestJointInfo.isConnected){
                        this.links[lindex].getJoints(jointNumber).addLinkedJoint(-1, this.joints[closestJointInfo.jointIndex]);
                        this.links[lindex].getJoints(jointNumber).setIsLinkedJoint(true);
                        this.links[lindex].getJoints(jointNumber).setLink(this.joints[closestJointInfo.jointIndex].link1);
                        this.joints[closestJointInfo.jointIndex].addLinkedJoint(-1, this.links[lindex].getJoints(jointNumber));
                    } else if(this.joints[closestJointInfo.jointIndex].setLink(this.links[lindex])){
                            this.links[lindex].setJoint(jointNumber, this.joints[closestJointInfo.jointIndex]);
                            this.deleteJoint(joints[jointNumber]);
                    }
                }
            }
        }
        }
    };
    this.testLink = function (linkType, startPoint, length, angle, couplerLength) {
        var drivingLinkInfo = this.links[this.drivingElement].getLinkSummary();
        var testLink = new Link(-1, linkType);
        var endPoint = helper.getEndPoint(startPoint, length, angle);
        var incrementedAngle = 0;

        testLink.setStartPoint(startPoint.x, startPoint.y);
        testLink.setEndPoint(endPoint.x, endPoint.y);

        while (testLink.setAnimatedPoint(drivingLinkInfo, couplerLength, 1) //
            && testLink.setAnimatedPoint(drivingLinkInfo, couplerLength, -1) //
            && testLink.setAnimatedPoint(drivingLinkInfo, couplerLength, 2) //
            && testLink.setAnimatedPoint(drivingLinkInfo, couplerLength, -2) //
            && incrementedAngle < 360) {
            incrementedAngle++;
            this.links[this.drivingElement].setAngle(this.links[this.drivingElement].angle + ((1 * Math.PI) / 180));
        }

        var angles = [this.links[this.drivingElement].angle,
            testLink.angle
        ];

        return angles;
    };
    this.setLinkStartPoint = function (index, point) {
        var historyItem = false;

        if (index >= -1 && index < this.links.length) {
            var lindex = (index == -1) ? (this.links.length - 1) : index;

            historyItem = this.links[lindex].getState(TransactionType.EDIT, lindex).setNewStartPoint(point.copy());
            this.links[lindex].setStartPoint(point.x, point.y);
            historyItem.setNewEndPoint(this.links[lindex].getEndPoint());
        }

        return historyItem;
    };
    this.setLinkEndPoint = function (index, point, stationaryCouplerPoint, mergeJoint = false, thresholdDistance = helper.convertLengthFromPixelsToGridUnits(constants.FINGER_RADIUS)) {
        var historyItem = false;

        if (index >= -1 && index < this.links.length) {
            var lindex = (index == -1) ? (this.links.length - 1) : index;

            // this if loop is for snapping and if(mergejoint) is true then it will merge
            if(!this.links[lindex].getJoints(1).isConnected && this.links[lindex].linkType == LinkType.RR && !this.coupler.isEnabled()){
                var closestJointInfo = this.getClosestJointInfo(point, this.links[lindex].getJoints(1));
                if(closestJointInfo.jointDistance <= thresholdDistance){
                point = (closestJointInfo) ? this.joints[closestJointInfo.jointIndex].getPoint() : point;

                if(mergeJoint)
                    this.mergeJoint(index, 1, point);
                }
            }
            this.links[lindex].setEndPoint(point.x, point.y);
            historyItem = this.links[lindex].getState(TransactionType.EDIT, lindex).setNewEndPoint(point.copy());
        }

        // this.completeLinkage(true, true, stationaryCouplerPoint);
        return historyItem;
    };
    this.setLinkThirdPoint = function(index, point, stationaryCouplerPoint, mergeJoint = false, thresholdDistance = helper.convertLengthFromPixelsToGridUnits(constants.FINGER_RADIUS)) {
        //var historyItem = false;

        if (index >= -1 && index < this.links.length) {
            var lindex = (index == -1) ? (this.links.length - 1) : index;


            if(!this.links[lindex].getJoints(2).isConnected){
                var closestJointInfo = this.getClosestJointInfo(point, this.links[lindex].getJoints(2));
                if(closestJointInfo.jointDistance <= thresholdDistance){
                    point = (closestJointInfo) ? this.joints[closestJointInfo.jointIndex].getPoint() : point;
                    //historyItem = this.links[lindex].getState(TransactionType.EDIT, lindex).setNewEndPoint(point.copy());
                    if(mergeJoint)
                        this.mergeJoint(index, 2, point);
                }
            }
            this.links[lindex].setThirdPoint(point.x, point.y);
        }

        // this.completeLinkage(true, true, stationaryCouplerPoint);
        //return historyItem;
    };
    this.setCouplerPoint = function (point, angle) {
        var historyItem = false;

        if (this.coupler.isEnabled()) {
            historyItem = this.coupler.getState(TransactionType.EDIT).setNewStartPoint(point.copy()).setNewEndPoint(helper.getEndPoint(point, 1, angle));

            this.coupler.setTracePoint(point, angle);
            this.generateCouplerCurve();
        }

        return historyItem;
    };
    this.setCouplerTracePoint = function (length, angle, orientation, absolute) {
        if (this.coupler.isEnabled()) {
            this.coupler.setTraceDetail(length, angle, orientation, absolute);
            this.generateCouplerCurve();
        }
    };
    this.getLinkId = function (index) {
        var rIndex = -1;

        if (index == -1)
            rIndex = this.links.length - 1;
        else if (index >= 0 && index < this.getLinkCount())
            rIndex = index;

        return (rIndex != -1) ? this.links[rIndex].getLinkId() : -1;
    };
    this.getLinkCount = function () {
        return this.links.length;
    };
    this.setLinkColor = function (index, color) {
        this.links[index].setLinkColor(color);
    };
    this.getLinkColor = function (index) {
        return this.links[index].getLinkColor();
    };
    this.setRPM = function (index, jointIndex, RPM) {
        this.links[index].getJoints(jointIndex).setRPM(RPM);
        return (this.otherInputs.length > 0)
    };
    this.getRPM = function (index) {
        if(index < this.links.length)
        return this.links[index].getRPM();
        else return 6.00;
    };
    this.getInputElements = function () {
        return [this.drivingElement].concat(this.otherInputs)
    };
    this.setInputElements = function (drivingElement, otherInputs) {
        if(drivingElement < this.links.length)
            this.drivingElement = drivingElement;
        this.otherInputs = otherInputs;
    };
    this.changeRotationDirection = function (index, jointIndex) {
        if(index < this.links.length){
        index = (index == -1) ? this.drivingElement : index
        this.links[index].changeRotationDirection(jointIndex);
        }
        return (this.otherInputs.length > 0)
    };
    this.getLinkageType = function () {
        return this.linkageParameters.linkageType;
    };
    this.isCircuitSwitchable = function () {
        return (this.branchCount > 2);
    };
    this.interchangeCrankElement = function () {

        var historyItem = false;

        if (this.drivingElement < this.links.length && this.drivenElement < this.links.length) {
            historyItem = new HistoryModel(TransactionType.EDIT, SelectionType.LINKAGE_PROPERTY, LinkageProperty.DRIVING, -1, null, null, null, null, this.drivingElement);

            if(this.isTraditionalFourBar()) {
                var temp = this.drivenElement;
                this.drivenElement = this.drivingElement;
                this.drivingElement = temp;

                var tracePoint = this.coupler.getTraceDetail();
                // this.completeLinkage(false, true, false);
                this.coupler.setTracePoint(tracePoint.center, tracePoint.angle);
                this.setLinkageType();
                this.generateCouplerCurve();
            }else {
                var groundJoints = this.joints.filter(item=> item.isGround == true);
                for(var i=0; i<groundJoints.length; i++){
                    if(groundJoints[i] == this.links[this.drivingElement].getJoints(0)){
                        var drivingElement = this.links.findIndex(item=> item == groundJoints[(i + 1) % (groundJoints.length)].link2)
                        if(this.otherInputs.findIndex(item=> item == drivingElement) == -1){
                            this.drivingElement = drivingElement;
                            break;
                        }
                        else{
                            this.drivingElement = this.links.findIndex(item=> item == groundJoints[(i + 2) % (groundJoints.length)].link2);
                            break;
                        }

                    }
                }
                //var temp = this.drivenElement;
                //this.drivenElement = this.drivingElement;
                //this.drivingElement = temp;
            this.clearCurves(-1);
            simulator.generateCurves(this.joints, this.links, [this.drivingElement].concat(this.otherInputs), this.crankLimits);
            this.calculateCrankLimits();
        }

        return historyItem;
        }
    };
    this.changeBranch = function () {
        var historyItem = false;

        if (this.isTraditionalFourBar()) {
            historyItem = new HistoryModel(TransactionType.EDIT, SelectionType.LINKAGE_PROPERTY, LinkageProperty.BRANCH, -1, null, null, null, null, this.linkageParameters.branch);

            var multipler = this.linkageParameters.branch / Math.abs(this.linkageParameters.branch);
            this.linkageParameters.branch = (Math.abs(this.linkageParameters.branch) == Branch.ONE ? Branch.TWO : Branch.ONE) * multipler;

            var drivingLinkInfo = this.links[this.drivingElement].getLinkSummary();
            this.links[this.drivenElement].changeBranch();
            this.links[this.drivenElement].setAnimatedPoint(drivingLinkInfo, this.coupler.getLength(), this.linkageParameters.branch, this.linkageParameters.initialCouplerAngle);

            //TODO: the next step needs to be fixed for PR Dyad

            // this.completeLinkage(false, false, false);
        }

        return historyItem;
    };
    this.changeCircuit = function () {
        var historyItem = false;

        if (this.isTraditionalFourBar()) {
            historyItem = new HistoryModel(TransactionType.EDIT, SelectionType.LINKAGE_PROPERTY, LinkageProperty.CIRCUIT, -1, null, null, null, null, this.linkageParameters.circuit);
            this.linkageParameters.circuit *= -1;

            var drivingLinkInfo = this.links[this.drivingElement].getLinkSummary();
            var drivenLinkInfo = this.links[this.drivenElement].getLinkSummary();

            var theta1 = helper.getInclination(drivingLinkInfo.fixedPivot, drivenLinkInfo.fixedPivot);
            var phiInitial = drivingLinkInfo.angle - theta1;
            var psyInitial = drivenLinkInfo.angle - theta1;

            this.links[this.drivingElement].setAngle(theta1 - phiInitial);
            this.links[this.drivenElement].setAngle(theta1 - psyInitial);
            // this.completeLinkage(false, true, false);
        } else if(this.crankLimits.crankLimitingAngles.length > 2) {
            //TO DO
//            var temp = this.crankLimits.crankLimitingAngles[2];
//            this.crankLimits.crankLimitingAngles[2] = this.crankLimits.crankLimitingAngles[1];
//            this.crankLimits.crankLimitingAngles[1] = temp;
//            simulator.changeBranch();
        }



        return historyItem;
    };
    this.getBranch = function () {
        return this.linkageParameters.branch.toString();
    };
    this.getCircuit = function () {
        return this.linkageParameters.circuit.toString();
    };
    this.setDriving = function (oldIndex, newIndex) {
        //Setting a new index if old index is known or set the new index

        if (oldIndex != null && oldIndex >= 0) {
            if (oldIndex < this.links.length && this.drivingElement == oldIndex)
                this.interchangeCrankElement();
        } else if (newIndex != null && newIndex >= 0) {
            if (newIndex < this.links.length && this.drivingElement != newIndex)
                this.interchangeCrankElement();
        }
    };
    this.setJointGroundState = function(linkIndex, jointIndex, state) {
        linkIndex = (linkIndex == -1) ? (this.links.length - 1) : linkIndex;
        if(state == false)
            if(this.drivingElement == linkIndex)
                return false;
        var oiIndex = this.otherInputs.findIndex(item=> item == linkIndex)
        if(oiIndex != -1)
            this.otherInputs.splice(oiIndex, 1);

        return this.links[linkIndex].getJoints(jointIndex).setGroundState(state);
    };
    this.setAsInput = function (linkIndex, jointIndex, state) {
        if(jointIndex == 0){
            if(state){
                this.otherInputs.push(linkIndex);
                this.otherInputs.sort();
            } else{
                var index = this.otherInputs.findIndex(item=> item == linkIndex);
                this.otherInputs.splice(index, 1);
            }
        } else{
            var joint = this.links[linkIndex].getJoints(jointIndex);
            var link = joint.getOtherLink(this.links[linkIndex]);

            if(this.otherInputs.findIndex(item=> item == linkIndex) != -1 || linkIndex == this.drivingElement)
                linkIndex = this.links.findIndex(item => item == link);

            jointIndex = link.getJoints().findIndex(item=> item == joint);
            if(jointIndex != 0){
                this.links[linkIndex].swapJoints(jointIndex, 0);
                this.links[linkIndex].selectedEnd = 1;
            }
            this.setAsInput(linkIndex, 0, state);
        }
        return [linkIndex, 1];
    };
    this.setCouplerFromDyads = function (firstDyad, secondDyad) {
        var p1 = (firstDyad.linkType == LinkType.RP) ? ((secondDyad.linkType == LinkType.RP) ? numericHelper.cross(firstDyad.linem, secondDyad.linem).normalizePoint() : numericHelper.cross(firstDyad.linem, numericHelper.cross(secondDyad.point2m, firstDyad.linem)).normalizePoint()) : firstDyad.point2m.normalizePoint();
        var p2 = (secondDyad.linkType == LinkType.RP) ? ((firstDyad.linkType == LinkType.RP) ? numericHelper.cross(firstDyad.linem, secondDyad.linem).normalizePoint() : numericHelper.cross(secondDyad.linem, numericHelper.cross(firstDyad.point2m, secondDyad.linem)).normalizePoint()) : secondDyad.point2m.normalizePoint();

        var couplerLineVector = p2.dSub(p1);
        var couplerLength = (couplerLineVector.dNorm2()).toNumber();
        var couplerAngle = Math.atan2(couplerLineVector[1].toNumber(), couplerLineVector[0].toNumber());

        var Hp = [
            [Math.cos(couplerAngle), Math.sin(couplerAngle), 0],
            [-Math.sin(couplerAngle), Math.cos(couplerAngle), 0],
            p1.toNum()
        ].transpose();

        var cAngle = this.coupler.getAngle();
        var ep = this.links[0].point2;

        var Hq = [
            [Math.cos(cAngle), Math.sin(cAngle), 0],
            [-Math.sin(cAngle), Math.cos(cAngle), 0],
            [ep.x, ep.y, 1]
        ].transpose();

        var p = Hq.dot(numeric.inv(Hp)).dot([0, 0, 1]);
        var a = Hq.dot(numeric.inv(Hp)).dot([1, 0, 0]);

        this.setCouplerPoint(new Point(p[0], p[1]), Math.atan2(a[1], a[0]));


        //        if (this.getLinkCount() < constants.MAX_LINK_COUNT && dyads.length > 0) {
        //            var currentEntity = this,
        //                initialAngle = helper.toRadians(120);
        //
        //            //            this.clear(-1);
        //
        //            //            if (dyads.length == 1) {
        //            this.addLink(dyads.getLast().linkType, -1, dyads.getLast().point1, -1);
        //            this.setLinkEndPoint(-1, dyads.getLast().point2, false);
        //            //            helper.getEndPoint(dyads.getLast().point1, dyads.getLast().length, initialAngle)
        //            //            } else
        //            if (dyads.length == 2) {
        //                //                var p1, p2;
        //
        //                //                if (dyads[0].linkType == LinkType.RP && dyads[1].linkType == LinkType.RP) {
        //                //                    p1 = numericHelper.cross(dyads[0].linem, dyads[1].linem).normalizePoint();
        //                //                    p2 = numericHelper.cross(dyads[0].linem, dyads[1].linem).normalizePoint();
        //                //                } else {
        //                //closest point pi on a line from a point p; pi = l x (p x l)
        //                var p1 = (dyads[0].linkType == LinkType.RP) ? ((dyads[1].linkType == LinkType.RP) ? numericHelper.cross(dyads[0].linem, dyads[1].linem).normalizePoint() : numericHelper.cross(dyads[0].linem, numericHelper.cross(dyads[1].point2m, dyads[0].linem)).normalizePoint()) : dyads[0].point2m.normalizePoint();
        //                var p2 = (dyads[1].linkType == LinkType.RP) ? ((dyads[0].linkType == LinkType.RP) ? numericHelper.cross(dyads[0].linem, dyads[1].linem).normalizePoint() : numericHelper.cross(dyads[1].linem, numericHelper.cross(dyads[0].point2m, dyads[1].linem)).normalizePoint()) : dyads[1].point2m.normalizePoint();
        //                //                }
        //
        //                //                var couplerLineVector = p2.dSub(p1);
        //                //                var couplerLength = (couplerLineVector.dNorm2()).toNumber();
        //                //                var couplerAngle = Math.atan2(couplerLineVector[1].toNumber(), couplerLineVector[0].toNumber());
        //                //
        //                //                var Hp = [
        //                //                    [Math.cos(couplerAngle), Math.sin(couplerAngle), 0],
        //                //                    [-Math.sin(couplerAngle), Math.cos(couplerAngle), 0],
        //                //                    p1.toNum()
        //                //                ].transpose();
        //
        //                //                dyads.forEach(function(dyad) {
        //                //                    currentEntity.addLink(dyad.linkType, dyad.point1);
        //                //                    currentEntity.setLinkEndPoint('last', dyad.point2, 0, false);
        //                //                });
        //
        //                //                var drivingDyadInfo = this.links[this.drivingElement].getLinkSummary();
        //                //                this.links[this.drivenElement].setAnimatedPoint(drivingDyadInfo, couplerLength, 1, 0);
        //                //                this.completeLinkage(true, true, false);
        //
        //                //                var cAngle = this.coupler.getAngle();
        //                //                var ep = this.links[0].point2;
        //                //
        //                //                var Hq = [
        //                //                    [Math.cos(cAngle), Math.sin(cAngle), 0],
        //                //                    [-Math.sin(cAngle), Math.cos(cAngle), 0],
        //                //                    [ep.x, ep.y, 1]
        //                //                ].transpose();
        //                //
        //                //                var p = Hq.dot(numeric.inv(Hp)).dot([0,0,1]);
        //                //                var a = Hq.dot(numeric.inv(Hp)).dot([1,0,0]);
        //
        //                //                console.log(p);
        //                //                console.log(helper.toDegrees(Math.atan2(a[1], a[0])));
        //                //                this.setCouplerPoint(new Point(p[0], p[1]), Math.atan2(a[1], a[0]));
        //
        //                this.setCouplerPoint(firstPose.center, firstPose.angle);
        //            }
        //        }
    };
    this.completeLinkage = function (recomputeCouplerCurve, computeBranch, stationaryCouplerPoint) {
        if(this.links.length == 2) {
            if(this.joints.filter(item=> item.isGround == true).length == 2) {
                //this.initializeFourBar();

                var drivingLinkInfo = this.links[this.drivingElement].getLinkSummary();
                var drivenLinkInfo = this.links[this.drivenElement].getLinkSummary();
                var couplerPoint;

                if (this.coupler.isEnabled())
                    couplerPoint = this.coupler.getTraceDetail();

                this.coupler.initializeCoupler(drivingLinkInfo, drivenLinkInfo);

                if (recomputeCouplerCurve)
                    this.coupler.setInitialTraceLength();

                if (stationaryCouplerPoint != null && stationaryCouplerPoint)
                    this.coupler.setTracePoint(couplerPoint.center, couplerPoint.angle);

                if (computeBranch) {
                    this.linkageParameters.initialCouplerAngle = drivenLinkInfo.angle - drivingLinkInfo.angle;
                    this.linkageParameters.branch = this.links[this.drivenElement].getBranch(drivingLinkInfo, this.coupler.getLength(), this.coupler.getAngle(), this.linkageParameters.initialCouplerAngle);
                }

                if (recomputeCouplerCurve) {
                    this.setLinkageType();
                    this.generateCouplerCurve();
                }
            } else if(this.getDegreeOfFreedom() == 1 && recomputeCouplerCurve){
                this.setLinkageType();
                this.clearCurves(-1);
                simulator.generateCurves(this.joints, this.links, [this.drivingElement].concat(this.otherInputs), this.crankLimits);
                this.checkIfPlotting();
                this.calculateCrankLimits();
            }else {
                this.setLinkageType();
                this.coupler.disable();
                this.clearCurves(-1);
        }
        }else if(this.getDegreeOfFreedom() == 1 && recomputeCouplerCurve){
            this.setLinkageType();
            this.clearCurves(-1);
            simulator.generateCurves(this.joints, this.links, [this.drivingElement].concat(this.otherInputs), this.crankLimits);
            this.checkIfPlotting();
            this.calculateCrankLimits();
        }else {
            this.coupler.disable();
            this.clearCurves(-1);
        }
    };
    this.isTraditionalFourBar = function () {
        return (this.links.length == 2 && this.coupler.isEnabled())
    };
    this.setLinkageType = function () {
        this.branchCount = 2;
        this.linkageParameters.circuit = 1;

        if (this.isTraditionalFourBar()) {
            var linkageType = '';
            if (this.links[this.drivingElement].linkType == LinkType.RR && this.links[this.drivenElement].linkType == LinkType.RR) {
                var drivingLinkInfo = this.links[this.drivingElement].getLinkSummary();
                var drivenLinkInfo = this.links[this.drivenElement].getLinkSummary();

                var li = drivingLinkInfo.length; //input link
                var lo = drivenLinkInfo.length; //output link
                var lf = helper.getDistance(drivingLinkInfo.fixedPivot.x, drivingLinkInfo.fixedPivot.y, drivenLinkInfo.fixedPivot.x, drivenLinkInfo.fixedPivot.y); //fixed link
                var lc = this.coupler.getLength(); //coupler

                var test = [lf + lc - li - lo, lo + lf - li - lc, lo + lc - li - lf];

                if (test[0] < 0 && test[1] < 0 && test[2] > 0) {
                    linkageType = LinkageType.GRASHOF + LinkageType.DOUBLE + LinkageType.CRANK;
                } else if (test[0] > 0 && test[1] > 0 && test[2] > 0) {
                    linkageType = LinkageType.GRASHOF + LinkageType.CRANK + '-' + LinkageType.ROCKER;
                } else if (test[0] > 0 && test[1] < 0 && test[2] < 0) {
                    linkageType = LinkageType.GRASHOF + LinkageType.ROCKER + '-' + LinkageType.CRANK;
                    this.branchCount = 4;
                } else if (test[0] < 0 && test[1] > 0 && test[2] < 0) {
                    linkageType = LinkageType.GRASHOF + LinkageType.DOUBLE + LinkageType.ROCKER;
                    this.branchCount = 4;
                } else if ((test[0] < 0 && test[1] < 0 && test[2] < 0) //
                    || (test[0] < 0 && test[1] > 0 && test[2] > 0) //
                    || (test[0] > 0 && test[1] < 0 && test[2] > 0) //
                    || (test[0] > 0 && test[1] > 0 && test[2] < 0)) {
                    linkageType = LinkageType.NON_GRASHOF + LinkageType.TRIPLE + LinkageType.ROCKER;
                } else
                    linkageType = '';
            } else if (this.links[this.drivingElement].linkType == LinkType.RR && this.links[this.drivenElement].linkType == LinkType.RP ||
                this.links[this.drivingElement].linkType == LinkType.RP && this.links[this.drivenElement].linkType == LinkType.RR) {
                linkageType = LinkageType.SWINGING_BLOCK;
            } else if (this.links[this.drivingElement].linkType == LinkType.RR && this.links[this.drivenElement].linkType == LinkType.PR ||
                this.links[this.drivingElement].linkType == LinkType.PR && this.links[this.drivenElement].linkType == LinkType.RR) {
                linkageType = LinkageType.CRANK_SLIDER;
            } else if (this.links[this.drivingElement].linkType == LinkType.PR && this.links[this.drivenElement].linkType == LinkType.PR) {
                linkageType = LinkageType.DOUBLE_SLIDER;
            } else if (this.links[this.drivingElement].linkType == LinkType.PR && this.links[this.drivenElement].linkType == LinkType.RP ||
                this.links[this.drivingElement].linkType == LinkType.RP && this.links[this.drivenElement].linkType == LinkType.PR) {
                linkageType = LinkageType.SLIDER_SWINGING;
            } else if (this.links[this.drivingElement].linkType == LinkType.RP && this.links[this.drivenElement].linkType == LinkType.RP) {
                linkageType = LinkageType.DOUBLE_SWINGING;
            }

            //            if(linkageType != '')
            //                this.linkageParameters.linkageType = 'Linkage Type : ' + linkageType;
            //            else
            this.linkageParameters.linkageType = linkageType;
        } else if(this.getDegreeOfFreedom() == 1 && this.links.length == 5){
            this.branchCount = 1;
            var ternarylinks = this.links.filter(item=> item.class == LinkClass.TERNARY)
            if(ternarylinks.length == 1){
                var joints = ternarylinks[0].getJoints();
                if(joints[0].getOtherLink(ternarylinks[0]) == GroundLink) this.linkageParameters.linkageType = LinkageType.WATT_SIX_BAR;
                else
                    this.linkageParameters.linkageType = LinkageType.STEPHENSON_SIX_BAR;
            } else if(ternarylinks.length == 2){
                var joints = ternarylinks[0].getJoints();
                if(joints[0].getOtherLink(ternarylinks[0]) == ternarylinks[1] || (joints[1].getOtherLink(ternarylinks[0]) == ternarylinks[1]) || (joints[2].getOtherLink(ternarylinks[0]) == ternarylinks[1]))
                    this.linkageParameters.linkageType = LinkageType.WATT_SIX_BAR;
                else
                    this.linkageParameters.linkageType = LinkageType.STEPHENSON_SIX_BAR;
            }
        } else{
                this.linkageParameters.linkageType = '';
                this.branchCount = 1;
        }
    };
    this.generateCouplerCurve = function () {

        this.crankLimits.crankLimitingAngles = [];

        //        return 0;

        if (this.drivingElement < this.links.length && this.drivenElement < this.links.length) {
            this.crankLimits.crankLimitingAngles.push(this.crankAngle);
            var reversalCounter = 0;

            this.clearCurves(-1);

            for (var i = 0; i < this.branchCount; i++) {
                reversalCounter = 0;
                this.angleIncrement = Math.abs(this.angleIncrement);

                while (reversalCounter < 2 && this.crankAngle <= 358) {
                    this.crankAngle = (this.crankAngle + this.angleIncrement) % 360;
                    this.links[this.drivingElement].setCrankAngle(this.crankAngle * Math.PI / 180);

                    this.coupler.incrementCouplerAngle(this.angleIncrement * Math.PI / 180);

                    var drivingLinkInfo = this.links[this.drivingElement].getLinkSummary();

                    if (this.links[this.drivenElement].setAnimatedPoint(drivingLinkInfo, this.coupler.getLength(), this.linkageParameters.branch, this.linkageParameters.initialCouplerAngle)) {
                        this.angleIncrement *= -1;
                        reversalCounter++;

                        if (i == 0)
                            this.crankLimits.crankLimitingAngles.push((this.crankAngle + this.angleIncrement + 360) % 360);

                        if (reversalCounter == 1) {
                           //this.couplerCurves[i].clear();
                            this.crankAngle = 0;
                            this.reverseCurves(-1, i);
                        }
                    } else {
                        var drivenLinkInfo = this.links[this.drivenElement].getLinkSummary();
                        this.links[this.drivingElement].getJoints(1).addCurvePoint(i, drivingLinkInfo.movingPivot);
                        this.links[this.drivenElement].getJoints(1).addCurvePoint(i, drivenLinkInfo.movingPivot);
                        this.coupler.setCoupler(drivingLinkInfo, drivenLinkInfo);
                        this.couplerCurves[i].addPoint(this.coupler.getTraceDetail());
                    }
                }

                this.couplerCurves[i].setClosed(reversalCounter == 0);
                this.resetAngle();
                this.changeBranch();

                if (this.branchCount > 2 && (i + 1) % 2 == 0)
                    this.changeCircuit();
            }

            this.crankLimits.crankLimitingAngles.push(360);

            if (this.crankLimits.crankLimitingAngles.length > 2 && (this.crankLimits.crankLimitingAngles[2] - this.crankLimits.crankLimitingAngles[0]) < (this.crankLimits.crankLimitingAngles[1] - this.crankLimits.crankLimitingAngles[0])) {
                this.crankLimits.crankLimitingAngles[2] = this.crankLimits.crankLimitingAngles[0];
                this.crankLimits.crankLimitingAngles[3] = this.crankLimits.crankLimitingAngles[0];
            }

            this.calculateCrankLimits();
        }
    };
    this.calculateCrankLimits = function () {
        if (this.crankLimits.crankLimitingAngles.length > 0) {
            var multiplier = 1;
            var l = this.crankLimits.crankLimitingAngles[1] - this.crankLimits.crankLimitingAngles[0];
            var m = 0;

            if (this.crankLimits.crankLimitingAngles.length > 2) {
                multiplier = 2;
                if(this.crankLimits.crankLimitingAngles[2] == 0) this.crankLimits.crankLimitingAngles[2] = 360;
                m = this.crankLimits.crankLimitingAngles[3] - this.crankLimits.crankLimitingAngles[2];
            }

            this.crankLimits.totalAngle = multiplier * (l + m);
            this.crankLimits.angleIncrement = multiplier * (l + m) / 100;
            this.crankLimits.firstLimit = l * 100 / (multiplier * (l + m));
        }
    };
    this.getLinkageDetails = function () {
        //used in exporting as PDF
        var linkageData = {
            linkCount: this.links.length,
            linkData: [],
            couplerData: [],
            jointData: []
        };

        if (this.isTraditionalFourBar()) {
            //        for (var index = 0; index < this.links.length; index++) {
            linkageData.linkData.push([this.links[this.drivingElement].getStartPoint(),
                this.links[this.drivingElement].getEndPoint(),
                this.links[this.drivingElement].effectiveAngle,
                this.links[this.drivingElement].linkType
            ]);

            linkageData.linkData.push([this.links[this.drivenElement].getStartPoint(),
                this.links[this.drivenElement].getEndPoint(),
                this.links[this.drivenElement].effectiveAngle,
                this.links[this.drivenElement].linkType
            ]);


        if (this.coupler.isEnabled())
            linkageData.couplerData = [this.coupler.getFirstPoint(), this.coupler.getTracePoint(), this.coupler.getSecondPoint(), this.coupler.getTraceOrientation()];
        } else if (this.getDegreeOfFreedom() == 1){

            for(var jt = 0; jt<this.joints.length; jt++){
                var jointData = this.joints[jt].getSavableInfo(jt)
                if(this.joints[jt] == this.links[this.drivingElement].getJoints(0) || this.otherInputs.findIndex(item=> this.links[item].getJoints(0) == this.joints[jt]) != -1)
                    jointData[3][1] = 'Driving Joint ' + '(' + this.joints[jt].getRPM() + ' RPM)'
                linkageData.jointData.push(jointData)
            }

            var groundJoints = this.joints.filter(item=> item.isGround == true);
            for(var gj=1; gj<groundJoints.length; gj++){
                var symbol = groundJoints[0].getSymbol() + groundJoints[gj].getSymbol();
                var groundData = {
                    desc: 'Ground Link',
                    name: symbol + ' (1)',
                    length: helper.getDistance(groundJoints[0].getPoint(), groundJoints[gj].getPoint()).toFixed(3),
                    angleName: symbol + ' (X-axis)',
                    value: helper.toDegrees(helper.getInclination(groundJoints[0].getPoint(), groundJoints[gj].getPoint())).toFixed(3)
                }
                linkageData.linkData.push(groundData);
            }

            for (var lk = 0; lk < this.links.length; lk++){
                var linkData = (this.links[lk].getExportInfo(lk + 2));
                if(lk == this.drivingElement || this.otherInputs.findIndex(item=> item == lk) != -1)
                    linkData.desc = 'Driving Link'
                linkageData.linkData.push(linkData);
            }
        }

        return linkageData;
    };
    this.getDimensions = function (drawableType, index) {
        if (drawableType == SelectionType.LINK) {
            if (index < this.links.length)
                return this.links[index].getDimensions();
            else
                return [];
        } else if (drawableType == SelectionType.COUPLER)
            return this.coupler.getDimensions();
        else
            return [];
    };
    this.getSavableInfo = function () {
        //used for exporting as XML
        var savableInfo = [
            [XMLAttributes.BRANCH, this.linkageParameters.branch],
            [XMLAttributes.CIRCUIT, this.linkageParameters.circuit],
            [XMLAttributes.DRIVING, this.drivingElement],
            [XMLAttributes.OTHER_INPUTS, this.otherInputs]
        ];

        return savableInfo;
    };
    this.getSavableData = function () {
        //used for exporting as XML
        var savableData = [];

        for (var i = 0; i < this.links.length; i++) {
            savableData.push(this.links[i].getSavableInfo());
        }

        if (this.coupler.isEnabled())
            savableData.push(this.coupler.getSavableInfo());

        return savableData;
    };
    this.getSavableTextData = function () {
        var r = [];
        //used for exporting as TXT, as we need indices of joints so cannot use the same function used for XML
        r.push('');
        r.push('Joints: ');
        r.push('// Enter each joint on new line in the following format');
        r.push('// x-coordinate <space> y-coordinate <space> jointType(R or P) <space> Ground(if fixed to ground)');

        this.joints.forEach(function (item) {
            var joint = String(item.getPoint().x) + ' ' + String(item.getPoint().y) + ' ' + String((item.type == 0) ? 'R' : 'P');
            if(item.isGround == true)
                joint = joint + ' ' + 'Ground'
            r.push(joint)
        })

        r.push('');
        r.push('Links: ');
        r.push('// Now state each link in the following format');
        r.push('// Start Joint(number of joint as above) <space> End Joint <space> Third Joint(if ternary link) <space> Link Color(rgba) <optional>');
        var currentObj = this
        this.links.forEach(function (item) {
            var joints = item.getJoints();
            var link = String('');
            for(i=0; i < joints.length; i++){
            var index = currentObj.joints.findIndex(item => item == joints[i])
            if(i != 0)
            link = link + String(' -> ');
            link = link + String(index + 1); //+1 as array starts from zero
            }
            link += ' ' + item.getLinkColor();
            r.push(link)
        })
        return r
    };
    this.getClosestLinkInfo = function (point) {
        var responseDistance = helper.convertLengthFromPixelsToGridUnits(constants.FINGER_RADIUS);
        var linkIndex = -1;
        var selectedEnd = -1;
        var distanceInfo;
        var constraintType;
        var distanceFromClick;

        for (var index = 0; index < this.links.length; index++) {
            this.links[index].setSelected(false);
            distanceFromClick = this.links[index].getDistanceFrom(point);

            if (distanceFromClick <= responseDistance) {
                linkIndex = index;
                responseDistance = distanceFromClick;
                constraintType = SelectionType.LINK;
            }
        }

        if (linkIndex != -1)
            selectedEnd = this.links[linkIndex].getClosestEnd(point);

        if (this.coupler.isEnabled()) {
            this.coupler.setSelected(false);
            distanceFromClick = this.coupler.getDistanceFrom(point);

            if (distanceFromClick < responseDistance) {
                linkIndex = 0;
                responseDistance = distanceFromClick;
                constraintType = SelectionType.COUPLER;
                selectedEnd = 1;
            }
        }

        distanceInfo = {
            linkIndex: linkIndex,
            constraintType: constraintType,
            linkDistance: responseDistance,
            selectedEnd: selectedEnd
        };

        return distanceInfo;
    };
    this.getClosestJointInfo = function (point, excludeJoint) {
        var responseDistance = helper.convertLengthFromPixelsToGridUnits(constants.FINGER_RADIUS);
        var jointIndex = -1;
        var selectedEnd = 1;
        var distanceInfo = false;
        var constraintType;
        var distanceFromClick;
        var isConnected = false;

        for (var index = 0; index < this.joints.length; index++) {
            if(this.joints[index] != excludeJoint && (!this.joints[index].isLinkedJoint || this.joints[index].isConnected == false)){
            this.joints[index].setSelected(false);
            distanceFromClick = this.joints[index].getDistanceFrom(point);

                if (distanceFromClick < responseDistance) {
                    jointIndex = index;
                    responseDistance = distanceFromClick;
                    constraintType = SelectionType.JOINT;
                    isConnected = this.joints[index].isConnected
                }
            }
        }

        if(jointIndex!=-1){
                distanceInfo = {
                    jointIndex: jointIndex,
                    constraintType: constraintType,
                    jointDistance: responseDistance,
                    selectedEnd: selectedEnd,
                    isConnected: isConnected
                };
        }

        return distanceInfo;
    };
    this.exportCouplerCurve = function () {
        return this.couplerCurves[0].exportCurve();
    };
    this.selectLink = function (drawableType, index, selectedEnd) {
        if (drawableType == SelectionType.LINK) {
            if (index >= 0 && this.links.length > index)
                this.links[index].setSelected(true, selectedEnd);
        } else if (drawableType == SelectionType.COUPLER) {
            if (this.coupler.isEnabled())
                this.coupler.setSelected(true);
        }
    };
    this.cancelSelection = function (drawableType, index) {
        if (drawableType == SelectionType.LINK) {
            if (index >= 0 && this.links.length > index)
                this.links[index].setSelected(false);
        } else if (drawableType == SelectionType.COUPLER) {
            if (this.coupler.isEnabled())
                this.coupler.setSelected(false);
        }
    };
    this.capturePose = function () {
        if (this.coupler.isEnabled())
            return this.coupler.getTraceDetail();

        return false;
    };
    this.deleteJoint = function(joint){
        jointIds.addToAvailableId(joint.getJointId());

        // following part will delete the joint from the linked joints array of its parent joint.
        if(joint.isLinkedJoint)
            joint.getLinkedJoints(0).clearLinkedJoints(joint);
        else if(joint.isGround && joint.getLinkedJoints().length > 0){
            var linkedJoints =  joint.getLinkedJoints();
            var firstLinked = linkedJoints[0];
            if(firstLinked.isLinkedJoint == true){
                firstLinked.clearLinkedJoints(-1);
                firstLinked.setIsLinkedJoint(false);
                for(var glj = 1; glj < linkedJoints.length; glj++)
                    firstLinked.addLinkedJoint(-1, linkedJoints[glj]);
            }
        }
        index = this.joints.findIndex(item=> item.getJointId()===joint.getJointId());
        //gets index of a joint in Linkage.joints array
        this.joints.splice(index,1);//deletes the joint
    };
    this.deleteLink = function (id) {
        var index = -1;

        for (var i = 0; i < this.links.length; i++)
            if (this.links[i].getLinkId() == id) {
                index = i;
                break;
            }

        if (index >= 0)
            this.clear(index);
    };
    this.clear = function (index, state) {
        var historyEvent = [];

        if (index >= 0 && index < this.links.length) {
            // clears the specific links with index as number in links array
            historyEvent.push(this.links[index].getState(TransactionType.DELETE, index));
            linkIds.addToAvailableId(this.links[index].getLinkId());

            //following code deletes joints just connected to the link to be deleted.
            var joints=this.links[index].getJoints();

            var filtered=joints.filter(j=> j.isConnected == false || j.isGround == true || j.isLinkedJoint == true);
            for(var i=0; i<filtered.length; i++)
                this.deleteJoint(filtered[i]);

            // following code sets the links in joints of deletedLink to be null;
            for(var i=0; i<joints.length; i++){
                var linkedJoints =  joints[i].getLinkedJoints(0);
                joints[i].setLink(null, this.links[index]);
            //following code deals with the linked joints for eight bar mechanisms
             if(linkedJoints)
                 if(linkedJoints.isLinkedJoint == true)
                    if(linkedJoints.setLink(null, this.links[index])){
                        linkedJoints.setIsLinkedJoint(false);
                        linkedJoints.clearLinkedJoints(-1);
                        var link = linkedJoints.getOtherLink(null);
                        var linkIndex = this.links.findIndex(item=> item==link);
                        var jointIndex = link.joints.findIndex(item=> item==linkedJoints);
                        joints[i].clearLinkedJoints(linkedJoints);
                        this.mergeJoint(linkIndex, jointIndex, linkedJoints.getPoint(), Math.pow(10, -6));
                        joints[i].updateLinkedJointsLink(this.links[index]);
                    }

            }


            if(index == this.drivingElement)
                this.otherInputs = [];
            var otherIndex = this.otherInputs.findIndex(item=> item == index);
            if(otherIndex != -1)
                this.otherInputs.splice(index, this.otherInputs.length)
            var drivingLinkId = this.links[this.drivingElement].getLinkId();
            var ids =[];
            for(var oi = 0; oi< this.otherInputs.length; oi++)
                ids.push(this.links[this.otherInputs[oi]].getLinkId());

            this.links.splice(index, 1);
            //following code updates the driving element index
            var dindex = this.links.findIndex(item=> item.getLinkId() == drivingLinkId);
            if(dindex >= 0 && dindex <= this.links.length)
                this.drivingElement = dindex;
            else{
                var groundJoints = this.joints.filter(item=> item.isGround == true);
                if(groundJoints.length == 0)
                    this.clear(-1);
                else
                    this.drivingElement = this.links.findIndex(item=> item == groundJoints[(i + 1) % (groundJoints.length)].link2);
            }
            //following code updates the otherInput indexes
            var oiIndex = this.otherInputs.findIndex(item=> item == index);
            if(oiIndex == -1){
            this.otherInputs = [];
            for(var oiL=0; oiL < ids.length; oiL++)
                this.otherInputs.push(this.links.findIndex(item=> item.getLinkId() == ids[oiL]));
            } else
                this.otherInputs.splice(oiIndex, 1);

        } else {//clears all the links
            this.joints = [];
            while (this.links.length > 0) {
                historyEvent.push(this.links[this.links.length - 1].getState(TransactionType.DELETE, this.links.length - 1));
                this.links.pop();
            }

            linkIds.reset();
            jointIds.reset();
        }

        if (this.links.length < 2) {
            if (this.coupler.isEnabled()) {
                historyEvent.push(this.coupler.getState(TransactionType.DELETE));

                historyEvent.push(new HistoryModel(TransactionType.DELETE, SelectionType.LINKAGE_PROPERTY, LinkageProperty.CIRCUIT, -1, null, null, null, null, (state && !$.isEmptyObject(state)) ? state.changedCircuit : false));
                historyEvent.push(new HistoryModel(TransactionType.DELETE, SelectionType.LINKAGE_PROPERTY, LinkageProperty.BRANCH, -1, null, null, null, null, (state && !$.isEmptyObject(state)) ? state.changedBranch : false));
                historyEvent.push(new HistoryModel(TransactionType.DELETE, SelectionType.LINKAGE_PROPERTY, LinkageProperty.DRIVING, -1, null, null, null, null, this.drivingElement));
            }
            this.otherInputs = [];
            this.drivingElement = 0;
            this.drivenElement = 1;
            this.coupler.disable();

            for (var i = 0; i < this.couplerCurves.length; i++)
                this.couplerCurves[i].clear();

            this.setLinkageType();
            this.crankLimits.crankLimitingAngles = [];
        } else {
            this.completeLinkage(true, true, false);
            this.setLinkageType();
        }

        if (historyEvent.length == 0)
            historyEvent = false;

        return historyEvent;
    };
    this.draw = function (context, constraintLayerContext, inAnimation, redrawConstraints, curvePoseDensity, curveThickness) {
        if (redrawConstraints) {
            for (var i = 0; i < this.branchCount; i++)
                this.couplerCurves[i].draw(constraintLayerContext, curvePoseDensity, curveThickness);
            if(this.joints.length > 2){
                for(var i=0; i<this.joints.length; i++)
                    this.joints[i].drawCurve(constraintLayerContext, 0, curveThickness);
            }
            if (this.drivingElement < this.links.length)
                this.links[this.drivingElement].drawActuation(constraintLayerContext);
        }
        for(var oi = 0; oi<this.otherInputs.length; oi++)
                this.links[this.otherInputs[oi]].drawActuation(context);
        for (var index = 0; index < this.links.length; index++)
            this.links[index].draw(context, inAnimation, index);
        this.coupler.draw(context);


    };
    this.annotate = function (context) {
        if (this.isTraditionalFourBar()) {
            this.links[this.drivingElement].annotate(context, ('O').concat(String.fromCharCode(8322)), 'A');
            this.links[this.drivenElement].annotate(context, ('O').concat(String.fromCharCode(8324)), 'B');

            this.coupler.annotate(context, 'C', 'P', 'D');
        } else if(this.getDegreeOfFreedom() == 1){
            for(var alk =0; alk<this.links.length; alk++)
                this.links[alk].annotate(context, null, null)

        }
    };
    this.setCrankPosition = function (value) {
        if (this.links.length >= 2) {
            if (value <= this.crankLimits.firstLimit) //between 0 and firstlimit
                this.setCrankAngle(value * this.crankLimits.angleIncrement);
            else if (value > this.crankLimits.firstLimit && value <= (this.crankLimits.firstLimit + 50)) //between firstlimit and  firstlimit+ 50%
                this.setCrankAngle((2 * this.crankLimits.crankLimitingAngles[1]) - (value * this.crankLimits.angleIncrement));
            else if (value < 100)
                this.setCrankAngle((value * this.crankLimits.angleIncrement) - this.crankLimits.totalAngle);
        }
    };
    this.setCrankAngle = function (crankAngle) {
        if(this.isTraditionalFourBar()){
            var difference = crankAngle - (this.linkageParameters.circuit * this.crankAngle);

            if (this.links.length >= 1) {
                this.crankAngle = crankAngle;
                this.links[this.drivingElement].setCrankAngle(this.linkageParameters.circuit * this.crankAngle * Math.PI / 180);
            }

            if (this.links.length >= 2) {
                this.coupler.incrementCouplerAngle(difference * Math.PI / 180);

                var drivingLinkInfo = this.links[this.drivingElement].getLinkSummary();
                this.links[this.drivenElement].setAnimatedPoint(drivingLinkInfo, this.coupler.getLength(), this.linkageParameters.branch, this.linkageParameters.initialCouplerAngle);

                var drivenLinkInfo = this.links[this.drivenElement].getLinkSummary();
                this.coupler.setCoupler(drivingLinkInfo, drivenLinkInfo);
            }
        } else if(this.getDegreeOfFreedom() == 1) {
            var position = Math.floor((crankAngle + 360) % 360);
            if(this.crankLimits.crankLimitingAngles.length > 2){
                if(position < this.crankLimits.crankLimitingAngles[1])
                    position = this.crankLimits.crankLimitingAngles[1] - position;
                else
                    position = 360 - position + this.crankLimits.crankLimitingAngles[1] + 2;
                if((crankAngle + 360) < this.crankLimits.crankLimitingAngles[1])
                    position += 360;
            }
                for(var jt=0; jt<this.joints.length; jt++)
                    this.joints[jt].setAnimatedPointFromCurve(position - 1);
            if(!simulator.setJointPositions(this.joints, this.links, [this.drivingElement].concat(this.otherInputs), crankAngle)){
                var position = Math.floor((crankAngle + 360) % 360);
                if(this.crankLimits.crankLimitingAngles.length > 2){
                if(position < this.crankLimits.crankLimitingAngles[1])
                    position = this.crankLimits.crankLimitingAngles[1] - position;
                else
                    position = 360 - position + this.crankLimits.crankLimitingAngles[1] + 2;
                }
                for(var jt=0; jt<this.joints.length; jt++)
                    this.joints[jt].setAnimatedPointFromCurve(position -1)
            }

        }
    };
    this.incrementAngle = function () {
        if (this.links.length >= 1) {
            this.crankAngle = (this.crankAngle + this.angleIncrement) % 360;
            this.links[this.drivingElement].setCrankAngle(this.crankAngle * Math.PI / 180);
        }

        if (this.isTraditionalFourBar()) {
            this.coupler.incrementCouplerAngle(this.angleIncrement * Math.PI / 180);
            var drivingLinkInfo = this.links[this.drivingElement].getLinkSummary();

            if (this.links[this.drivenElement].setAnimatedPoint(drivingLinkInfo, this.coupler.getLength(), this.linkageParameters.branch, this.linkageParameters.initialCouplerAngle)) {
                this.angleIncrement *= -1;
                this.crankAngle = (this.crankAngle + this.angleIncrement) % 360;
                this.coupler.incrementCouplerAngle(this.angleIncrement * Math.PI / 180);
            } else {
                var drivenLinkInfo = this.links[this.drivenElement].getLinkSummary();
                this.coupler.setCoupler(drivingLinkInfo, drivenLinkInfo);
            }
        }
    };
    this.resetAngle = function () {
        this.crankAngle = 0;

        if (this.links.length >= 1)
            this.links[this.drivingElement].setCrankAngle(this.crankAngle * Math.PI / 180);

        for (var index = 0; index < this.links.length; index++)
            this.links[index].reset();

        if (this.isTraditionalFourBar()) {
            var drivingLinkInfo = this.links[this.drivingElement].getLinkSummary();
            var drivenLinkInfo = this.links[this.drivenElement].getLinkSummary();

            this.coupler.setCoupler(drivingLinkInfo, drivenLinkInfo);
        }

        this.angleIncrement = Math.abs(this.angleIncrement);
    };
    this.clearCurves = function (index) {
        //this function clears all curves of all the joints or the specified joint
        if(this.joints.length > 0){
            if(index != -1)
                this.joints[index].clearCurves(-1);
            else
                for(var i=0; i<this.joints.length; i++)
                    this.joints[i].clearCurves(-1);
        }
        for (var j = 0; j < this.couplerCurves.length; j++)
                this.couplerCurves[j].clear();
    };
    this.reverseCurves = function (indexOfJoint, indexOfCurve) {
        //this function reverses the points arrary of all curves of all the joints or the specified joint
        this.couplerCurves[indexOfCurve].reverse();

        if(indexOfJoint == -1)
            for(var i=0; i<this.joints.length; i++)
                this.joints[i].reverseCurve(indexOfCurve);
        else
            this.joints[indexOfJoint].reverseCurve(indexOfCurve);
    };
    this.switchLinkClass = function (index){
    // this function is responsible for switching the class from binary to ternary and vice versa. It also adds and deletes the joints as req.
            if(this.links[index].linkType == LinkType.RR){
                if(this.links[index].class == LinkClass.BINARY){
                    if(this.joints.length < constants.MAX_JOINT_COUNT){
                        this.addJoint(JointType.R, -1, this.links[index], null, -1);
                        this.links[index].switchClass();
                        this.links[index].initializeTernaryLink();
                    }
                } else {
                    var joints = this.links[index].getJoints();
                    var filtered = joints.filter(j=>j.isConnected==false && j.isGround == false);
                    if(filtered.length>0){
                        jindex = joints.findIndex(item => item == filtered[filtered.length-1])
                        this.links[index].joints.splice(jindex,1);
                        this.deleteJoint(filtered[filtered.length - 1]);
                        this.links[index].switchClass();
                    }
                }
            }
    };
    this.getDegreeOfFreedom = function () {

        if(this.isTraditionalFourBar())
            return 1
        // this function returns the Degrees of freedom of a linkage
        else if(this.links.length > 1){
            if(this.links.filter(item=> item.linkType != LinkType.RR).length == 0){
            var linkCount = this.links.length;
            var filtered = this.joints.filter(j=>j.isConnected == false)// && (j.link1 == null ? false : j.link1.class == LinkClass.Ternary || j.link2 == null ? false : j.link2.class == LinkClass.Ternary));
            var jointCount = (this.joints.length - filtered.length);
            if(this.coupler.isEnabled()){
                jointCount += 2;
                linkCount += 1;
            }
            return (3 * linkCount - 2 * jointCount - this.otherInputs.length);
            }
        }else
            return 0;
    };
//    this.initializeFourBar = function (){
//
//        var movingJoints = this.joints.filter(j=> j.isGround == false && j.isConnected == true);
//
//        while(movingJoints[0].getOtherLink(this.links[this.drivingElement]) !=movingJoints[1].getOtherLink(this.links[this.drivenElement])){
//            this.drivenElement = (this.drivenElement + 1)  % 3;// this increases the index of driven element but not above 2
//        }
//        this.couplerElement = this.links.findIndex(item => item.id == movingJoints[0].getOtherLink(this.links[this.drivingElement].getId()));
//
//        //this function will trigger if driven link is ternary and check which among the three joints is //moving pivot connected to the driving element
//        if(this.links[this.drivingElement].class == LinkClass.TERNARY){
//            if(this.links[this.drivingElement].getJoints(1).isConnected == false){
//                var temp = this.links[this.drivingElement].getJoints(1);
//                this.links[this.drivingElement].deleteJoint(1);
//                this.links[this.drivingElement].setJoint(-1, temp);
//                this.links[this.drivingElement].updateLinkParameters();
//            }
//        }
//        if(this.links[this.drivenElement].class == LinkClass.TERNARY){
//            if(this.links[this.drivenElement].getJoints(1).isConnected == false){
//                var temp = this.links[this.drivenElement].getJoints(1);
//                this.links[this.drivenElement].deleteJoint(1);
//                this.links[this.drivenElement].setJoint(-1, temp);
//                this.links[this.drivenElement].updateLinkParameters();
//            }
//        }
//
//        /*if(this.links[this.drivenElement].class == LinkClass.TERNARY){
//            if(!this.links[this.drivenElement].checkConnectionWith(this.links[this.drivingElement])){
//                var temp = this.links[this.drivenElement].getJoints(1);
//                this.links[this.drivenElement].deleteJoint(1);
//                this.links[this.drivenElement].setJoint(-1, temp);
//                this.links[this.drivenElement].updateLinkParameters();
//                if(!this.links[this.drivenElement].checkConnectionWith(this.links[this.drivingElement])){
//                    var temp = this.links[this.drivenElement].getJoints(1);
//                    this.links[this.drivenElement].deleteJoint(1);
//                    this.links[this.drivenElement].setJoint(-1, temp);
//                    this.links[this.drivenElement].updateLinkParameters();
//                    return false;
//                }
//            }
//        }*/
//    };
    this.getBehavior = function (linkIndex, jointIndex) {
        var joint = this.links[linkIndex].getJoints(jointIndex);
        var rpm = null;
        var addedInput = false;
        var addInput = false;

        var temp = this.otherInputs.findIndex(item=> this.links[item] == joint.link1 || this.links[item] == joint.link2)
        if(temp != -1)
            addInput = true;

        if(joint.link1 == this.links[this.drivingElement] || joint.link2 == this.links[this.drivingElement])
            addInput = true;

        if(this.otherInputs.length > 0 && joint.isConnected){
            //if(this.otherInputs.findIndex(item=> item == linkIndex) != -1)
//                rpm = joint.getRPM();
            if(jointIndex != 0){
                var link = joint.getOtherLink(this.links[linkIndex]);
                linkIndex = this.links.findIndex(item=> item == link);
                jointIndex = link.getJoints().findIndex(item=> item == joint);
            }
            if(jointIndex == 0){
                for(var i = 0; i<this.otherInputs.length; i++)
                    if(this.otherInputs[i] == linkIndex){
                        rpm = this.links[linkIndex].getRPM();
                        addedInput = true;
                }
            }
        }
        if(linkIndex == this.drivingElement && jointIndex == 0)
            rpm = this.links[this.drivingElement].getRPM();
        var state = {
                    plotCurve: joint.plotCurve,
                    connected: joint.isConnected,
                    ground: joint.isGround,
                    rpm: rpm,
                    addInput: (this.getDegreeOfFreedom() > 1 && rpm == null && joint.isConnected && (joint.isGround || addInput) ),
                    addedInput: addedInput
                };
        return state
    };
    this.setBehavior = function (selectedDrawableType, selectedDrawableIndex, selectedEnd, hasSpecialBehavior) {
      if(selectedDrawableType == SelectionType.LINK){
          var joint = this.links[selectedDrawableIndex].getJoints(selectedEnd);
          joint.setPlotCurve(hasSpecialBehavior);
          if(!joint.hasCurve())
              return true
          else
              return false
      }
    };
    this.checkIfPlotting = function () {
        //this functions checks if any joint is plotting if not then makes some joint plot curve;
        var plottingJoints = this.joints.filter(item=> item.plotCurve == true);
        if(plottingJoints.length == 0){
            var freeJoints = this.joints.filter(item=> item.isConnected == false);
            if(freeJoints.length == 0)
                this.links[this.drivingElement].joints[1].setPlotCurve(true);
            else
                freeJoints[0].setPlotCurve(true);
        }
    };
    this.checkIfRevolute = function() {
        if(this.links.length >= 2)
            return (this.links.filter(item=> item.linkType != LinkType.RR).length == 0)
        else
            return true
    };
    this.isAnimationReady = function () {
//         if (this.getLinkCount() == 2)
//             return (this.joints.filter(item=> item.isGround == true).length == 2)
//        else
            return (this.getDegreeOfFreedom() == 1)
    };

}

function ControlPolygon() {
    this.isClosed = true;
    this.enabled = false;
    this.controlPoints = [];
    this.curve = new Curve(constants.COLOR_BLACK);
    this.addControlPoint = function (point) {
        this.controlPoints.push(point);

        if (!this.enabled)
            this.enabled = true;

        this.generateCurve();
    };
    this.getClosestControlPointInfo = function (point) {
        var responseDistance = helper.convertLengthFromPixelsToGridUnits(constants.FINGER_RADIUS);
        var controlPointIndex = -1;
        var selectedEnd = -1;

        for (var index = 0; index < this.controlPoints.length; index++) {
            this.controlPoints[index].setSelected(false);
            var distanceFromClick = this.controlPoints[index].getDistanceFrom(point);

            if (distanceFromClick < responseDistance) {
                controlPointIndex = index;
                responseDistance = distanceFromClick;
                selectedEnd = 1;
            }
        }

        var distanceInfo = {
            controlPointIndex: controlPointIndex,
            constraintType: SelectionType.CONTROL_POINT,
            controlPointDistance: responseDistance,
            selectedEnd: selectedEnd
        };

        return distanceInfo;
    };
    this.getCurve = function () {
        return this.curve;
    };
    this.setControlPoint = function (index, point) {
        if (index == -1) {
            this.controlPoints[this.controlPoints.length - 1].setPoint(point.x, point.y);
            this.generateCurve();
        } else if (this.controlPoints.length > index && index >= 0) {
            this.controlPoints[index].setPoint(point.x, point.y);
            this.generateCurve();
        }
    };
    this.setAsClosed = function (value) {
        this.isClosed = value;
        this.curve.setClosed(value);
        this.generateCurve();
    };
    this.selectControlPoint = function (index) {
        if (this.controlPoints.length > index && index >= 0)
            this.controlPoints[index].setSelected(true);
    };
    this.cancelSelection = function (index) {
        if (this.controlPoints.length > index && index >= 0)
            this.controlPoints[index].setSelected(false);
    };
    this.clear = function (index) {
        if (index >= 0 && index < this.controlPoints.length) {
            this.controlPoints.splice(index, 1);
            this.generateCurve();
        } else {
            while (this.controlPoints.length > 0)
                this.controlPoints.pop();
        }

        if (this.controlPoints.length == 0) {
            this.curve.clear();
            this.enabled = false;
        }
    };
    this.draw = function (context) {
        if (this.enabled) {
            for (var index = 0; index < this.controlPoints.length; index++)
                this.controlPoints[index].draw(context);

            this.curve.draw(context, 0);
        }
    };
    this.getBezierPoint = function (index, degree, t) {
        if (degree == 0)
            return this.controlPoints[index];
        else
            return (this.getBezierPoint(index, degree - 1, t).times(1.0 - t)).add(this.getBezierPoint(index + 1, degree - 1, t).times(t));
    };
    this.generateCurve = function () {
        if (this.isClosed)
            this.generateBSplineCurve();
        else
            this.genetateBezierCurve();
    };
    this.genetateBezierCurve = function () {
        this.curve.clear();

        var degree = this.controlPoints.length - 1;

        if (degree > 0) {
            for (var t = 0.0; t <= 1.01; t += 0.04) {
                var point = this.getBezierPoint(0, degree, t);
                this.curve.addPoint(new Pose(point.x, point.y, 0));
            }
        }
    };
    this.generateBSplineCurve = function () {
        this.curve.clear();

        var curvePoints = this.controlPoints.slice(0);

        for (var refinement = 1; refinement <= 4; refinement++) {
            for (var i = 0; i < curvePoints.length; i += 2) {
                var nextPoint = i == curvePoints.length - 1 ? 0 : i + 1;
                curvePoints.splice((i + 1), 0, curvePoints[i].add(curvePoints[nextPoint]).times(0.5));
            }

            for (var k = 1; k < curvePoints.length; k += 2) {
                var prevPoint = k == 1 ? curvePoints.length - 1 : k - 2;
                curvePoints[k - 1] = curvePoints[k - 1].add(curvePoints[prevPoint].add(curvePoints[k]).times(0.5)).times(0.5);
            }
        }

        for (var j = 0; j < curvePoints.length; j++) {
            this.curve.addPoint(new Pose(curvePoints[j].x, curvePoints[j].y, 0));
        }
    };
    this.getDimensions = function (index) {
        if (this.controlPoints.length > index && index >= 0)
            return this.controlPoints[index].getDimensions();
        else
            return [];
    };
}

function PlanarQC() { //planar dual quaternian class
    this.z1 = 0;
    this.z2 = 0;
    this.z3 = 0;
    this.z4 = 0;
    this.add = function (dQC1) {
        var dQC = new PlanarQC();
        dQC.z1 = this.z1 + dQC1.z1;
        dQC.z2 = this.z2 + dQC1.z2;
        dQC.z3 = this.z3 + dQC1.z3;
        dQC.z4 = this.z4 + dQC1.z4;
        return dQC;
    };
    this.dot = function (t) {
        var dQC = new PlanarQC();
        dQC.z1 = this.z1 * t;
        dQC.z2 = this.z2 * t;
        dQC.z3 = this.z3 * t;
        dQC.z4 = this.z4 * t;
        return dQC;
    };
    this.mag = function (a) {
        var magnitude = Math.sqrt(this.z1 * this.z1 + this.z2 * this.z2 + this.z3 * this.z3 + this.z4 * this.z4);
        magnitude = Math.pow(magnitude, a)
        return magnitude;
    };
}

// This class stores history
// Event Id can be common for multiple entries; ex: inputing multiple poses at once
function History() {
    this.index = 0;
    this.eventId = 0;
    this.eventIds = [];
    this.historyEvents = [];
    this.pushIntoHistory = function (historyItem) {
        if (historyItem !== false) {
            historyItem.setEventId(this.eventId);

            if (this.eventIds.indexOf(this.eventId) == -1)
                this.eventIds.push(this.eventId);

            if (this.eventIds.length > constants.MAX_HISTORY_EVENTS) {
                var firstId = this.eventIds[0];
                for (var i = 0; i < this.historyEvents.length; i++) {
                    if (this.historyEvents[i].getEventId() == firstId) {
                        this.historyEvents.splice(i, 1);
                        this.index--;
                    }
                }
                this.eventIds.splice(0, 1);
            }

            if (this.index < this.historyEvents.length)
                this.historyEvents.splice(this.index, this.historyEvents.length - this.index);

            this.historyEvents.push(historyItem);

            this.index++;
        }
    };
    this.pushChangesAtAdd = function (historyItem) {
        if (historyItem !== false) {
            if (this.index != 0 && this.historyEvents[this.index - 1].transactionType == TransactionType.ADD && this.historyEvents[this.index - 1].index == historyItem.index) {
                this.historyEvents[this.index - 1].setNewStartPoint(historyItem.startPoint2);
                this.historyEvents[this.index - 1].setNewEndPoint(historyItem.endPoint2);
            }
        }
    };
    this.getPreviousEvent = function () {
        var events = [];

        if (this.index > 0 && this.index <= this.historyEvents.length) {
            var eventId = this.historyEvents[this.index - 1].getEventId();

            for (var index = this.index; index > 0; index--) {
                if (this.historyEvents[index - 1].getEventId() == eventId) {
                    events.push(this.historyEvents[index - 1]);

                    this.index--;

                    var eventIndex = this.eventIds.indexOf(eventId);

                    if (eventIndex != -1)
                        this.eventIds.splice(eventIndex, 1);
                }
            }

        }

        return events.sortBy('index', -1);
    };
    this.getNextEvent = function () {
        var events = [];

        if (this.index >= 0 && this.index < this.historyEvents.length) {
            var eventId = this.historyEvents[this.index].getEventId();

            for (var index = this.index; index < this.historyEvents.length; index++) {
                if (this.historyEvents[index].getEventId() == eventId) {
                    events.push(this.historyEvents[index]);

                    this.index++;

                    var eventIndex = this.eventIds.indexOf(eventId);

                    if (eventIndex == -1)
                        this.eventIds.push(eventIndex);
                }
            }

        }

        return events.sortBy('index', 1);
    };
    this.startNewEvent = function () {
        this.eventId++;
    };
    this.clear = function () {
        this.index = 0;
        this.eventId = 0;
        this.eventIds = [];
        this.historyEvents = [];
    };
}

/* ---- History ---- */
/* ---- transactionType = Add/Edit/Delete ---- */
/* ---- drawableType = Pose, Line, Point, Link, Coupler ---- */
/* ---- entityType = RR, PR, RP, isExact, isFixed ---- */
/* ---- oldBehavior = isExact, isFixed, linkId ---- */
function HistoryModel(transactionType, drawableType, entityType, index, startPoint1, endPoint1, startPoint2, endPoint2, oldBehavior) {
    this.transactionType = transactionType;
    this.drawableType = drawableType;
    this.entityType = entityType;
    this.index = index;
    this.eventId = 0;
    this.startPoint1 = null;
    this.endPoint1 = null;
    this.startPoint2 = null;
    this.endPoint2 = null;
    this.oldBehavior = oldBehavior;
    if (startPoint1 && endPoint1) {
        this.startPoint1 = new Point(startPoint1.x, startPoint1.y);
        this.endPoint1 = new Point(endPoint1.x, endPoint1.y);
    }
    if (startPoint2 && endPoint2) {
        this.startPoint2 = new Point(startPoint2.x, startPoint2.y);
        this.endPoint2 = new Point(endPoint2.x, endPoint2.y);
    }
    this.copy = function () {
        return new HistoryModel(this.transactionType, this.drawableType, this.entityType, this.index, this.startPoint1, this.endPoint1, this.startPoint2, this.endPoint2, this.oldBehavior);
    };
    this.setEventId = function (eventId) {
        this.eventId = eventId;
    };
    this.getEventId = function (eventId) {
        return this.eventId;
    };
    this.setOldStartPoint = function (point) {
        if (this.startPoint1 == null)
            this.startPoint1 = new Point(point.x, point.y);
        else
            this.startPoint1.setPoint(point.x, point.y);

        return this;
    };
    this.getOldStartPoint = function () {
        return this.startPoint1;
    };
    this.setNewStartPoint = function (point) {
        if (this.startPoint2 == null)
            this.startPoint2 = new Point(point.x, point.y);
        else
            this.startPoint2.setPoint(point.x, point.y);

        return this;
    };
    this.getNewStartPoint = function () {
        return this.startPoint2;
    };
    this.setOldEndPoint = function (point) {
        if (this.endPoint1 == null)
            this.endPoint1 = new Point(point.x, point.y);
        else
            this.endPoint1.setPoint(point.x, point.y);

        return this;
    };
    this.getOldEndPoint = function () {
        return this.endPoint1;
    };
    this.setNewEndPoint = function (point) {
        if (this.endPoint2 == null)
            this.endPoint2 = new Point(point.x, point.y);
        else
            this.endPoint2.setPoint(point.x, point.y);

        return this;
    };
    this.getNewEndPoint = function () {
        return this.endPoint2;
    };
    this.setEntityType = function (entityType) {
        this.entityType = entityType;

        return this;
    };
}
