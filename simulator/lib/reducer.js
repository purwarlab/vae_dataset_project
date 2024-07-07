"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.reducer = undefined;

// This is importing the simulator 
var _sim = require("./simulator-prototype.js");


var reducer = exports.reducer = function reducer() {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
    var action = arguments[1];

    switch (action.type) {
        case "PROTO_SIM_JAPAN":{
            //let results = _sim.returnJank()
            //*
            let results = _sim.switchSol(
                action.data.type, 
                action.data.params, 
                action.data.steps, 
                action.data.speedScale,
                action.data.relativeTolerance)//*/
            // result = {'poses': null, 'meetAnEnd': false, 'solvable': false}; 
            return results
        }
        case "PROTO_SIM_JAPAN_Multi":{
            let results = _sim.switchSolMulti(action.data)
            //results = [result = {'poses': null, 'meetAnEnd': false, 'solvable': false}]
            //let results = [_sim.returnJank()]
            return results
        }
        case "PROTO_SIM_JAPAN_Multi_8BAR":{
            let results = _sim.switchSolMulti8bar(action.data)
            return results
        }
        default:
            {
                console.log('action ', action.type, ' is not defined or is intentionally left blank');
                return state;
        }
        // Old, but written by Zhijie 
        /*
        case "PROTO_SIM": {
            // old multi 
            let results = _sim.computeCurveSimpleMulti(
                action.data.tpMat, 
                action.data.params, 
                action.data.rMat, 
                action.data.steps, 
                action.data.speedScale, 
                action.data.relativeTolerance, 
                action.data.ccIdx)
            return results
        }
        case "PROTO_SIM_FOUR": {
            //adds frame 
            let results = _sim.computeCurvesSimpleFourbar(
                action.data.params, 
                action.data.rMat, 
                action.data.steps, 
                action.data.speedScale, 
                action.data.relativeTolerance, 
                action.data.ccIdx)
            return results
        }*/
        // links // Very very old codes by Prena, and Zhijie would like to not touch at all.  
        /*
        case "CHANGE_LINK_POINT":
            {
                //edit_link_joint
                // keeping this info to set the direction of RP dyad when its length is zero

                state = (0, _helper.setPoint)(state, action.jointId, action.xDragging, action.yDragging, "joints", true);

                // if PR joint, get the third joint to the interpreted location
                // updating regular joint locations connected to inlineJoints
                // console.log("starting search")
                state = updateReinterpretedLinks(state);
                state = (0, _helper.updateLinkedJoints)(state, [action.jointId]);
                //full refresh shapes matrices, whose global position remains the same.
                //although only the frame part should be recomputed.
                //@Prerna: would you give me which links are affected for this joint change
                //      so that I can partial refresh for the shapes that are assigned to the links?
                //      (i.e., refresh only the related shapes)
                state = setCoordinateForShapes(state, "Global");
                state = loadSimulation(state, undefined, action.window);

                return state;
            }
        case "LOAD_JOINTS_AND_LINKS":
            {
                state = state.set("viewMode", _constants.constants.VIEW_MODE.REGULAR);
                state = state.set("links", (0, _immutable.OrderedMap)({}));
                state = state.set("joints", (0, _immutable.OrderedMap)({}));
                state = state.set("drivingJoints", (0, _immutable.Set)([]));
                (0, _immutable.fromJS)(action.data.links).forEach(function (link, linkId) {
                    state = state.setIn(["links", Number(linkId)], link);
                });
                (0, _immutable.fromJS)(action.data.joints).forEach(function (joint, jointId) {
                    joint = joint.update("links", function (links) {
                        return (0, _immutable.Set)(links);
                    });
                    state = state.setIn(["joints", Number(jointId)], joint);
                });
                (0, _immutable.fromJS)(action.data.joints).forEach(function (jointId_, jointId) {
                    state = state.update("drivingJoints", function (st) {
                        return st.add(Number(jointId));
                    });
                });
                state = updateReinterpretedLinks(state);
                state = loadSimulation(state, undefined, action.window);
                return state;
            }
        */
        
    }
};



// Very very old lines. 
/* 
var _mathjs = require("mathjs");
var _helper = require("./helper.js");
const { json } = require("express/lib/response");
var counter = 0
//*/

/*
// data flow and manipuation
var updateReinterpretedLinks = function updateReinterpretedLinks(state) {
    state.get("joints").forEach(function (j_, jointId) {
        state.getIn(["joints", jointId, "links"]).forEach(function (linkId) {
            if (state.getIn(["links", linkId, "linkType"]) === _constants.constants.LINK_TYPE.RP && !state.hasIn(["links", linkId, "joint2"])) {
                var joint1 = (0, _helper.getJoint)(state, linkId, "joint1");
                var joint4 = (0, _helper.getJoint)(state, linkId, "joint4");
                var inclination = (0, _helper.getInclination)(joint1, joint4);
                state = state.setIn(["links", linkId, "inclination"], inclination);
                state = setThirdPointAtInfinity(state, linkId, inclination);
            } else if (state.getIn(["links", linkId, "linkType"]) === "PR") {
                state = setThirdPointAtInfinity(state, linkId);
            } else if (state.getIn(["links", linkId, "linkType"]) === "RP") {
                var R = 1220 * 120;
                // joint 3 is at infinity, joint 4 is the end of second link coming down
                //  should be calculated based on canvas max of width or height
                var _joint = (0, _helper.getJoint)(state, linkId, "joint1");
                var joint2 = void 0;
                var _inclination = void 0;
                if (state.hasIn(["links", linkId, "joint2"])) {
                    joint2 = (0, _helper.getJoint)(state, linkId, "joint2");
                    _inclination = (0, _helper.getInclination)(_joint, joint2);
                }

                if (joint2 === undefined) joint2 = _joint;

                var temp = (0, _helper.getEndPoint)(_joint, R, _inclination);
                var joint3Info = state.getIn(["links", linkId, "joint3"]).toJS();
                state = state.setIn(["links", linkId, "inclination"], _inclination);
                state = (0, _helper.setPoint)(state, joint3Info.id, temp.x, temp.y);
                // This length is the offset for prismatic joint
                // TODO : Exclude the snapping of this joint4 and joint2
                // set this only if joint4 is not connected to anyone
                var joint4Info = state.getIn(["links", linkId, "joint4"]).toJS();
                if (state.getIn(["joints", joint4Info.id, "links"]).size === 1) {
                    // prevents updating the joint location when it is connected to someother links
                    //      as we move the joint1 or joint2
                    temp = (0, _helper.getEndPoint)(joint2, 200, _inclination + Math.PI / 2.0);
                    state = (0, _helper.setPoint)(state, joint4Info.id, temp.x, temp.y);
                }
            }
        });
    });
    return state;
};*/

/* 
//assisting functions and variables/constants
// link and its drawings and animations
var setThirdPointAtInfinity = function setThirdPointAtInfinity(state, linkId) {
    var theta = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

    var R = 1220 * 120;
    //  should be calculated based on canvas max of width or height
    var joint1 = (0, _helper.getJoint)(state, linkId, "joint1");
    var temp = void 0;
    if (theta === null) {
        var joint2 = (0, _helper.getJoint)(state, linkId, "joint2");
        temp = (0, _helper.getEndPoint)(joint1, R, (0, _helper.getInclination)(joint1, joint2) + Math.PI / 2.0);
    } else {
        temp = (0, _helper.getEndPoint)(joint1, R, theta + Math.PI / 2.0);
    }
    var joint3Info = state.getIn(["links", linkId, "joint3"]).toJS();
    state = (0, _helper.setPoint)(state, joint3Info.id, temp.x, temp.y);
    return state;
};

var loadSimulation = function loadSimulation(state) {
    var convertTriads = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    var window = arguments[2];

    // animation computation for links.
    // animation matrices computation.
    // computation of new joint positions in respective frames.
    // using state to form a json object accepted by legacy code for simulation
    if (state.getIn(["info", "drivingJoints"]).size === 0 && state.get("joints").size > 0) {
        var jointId = state.get("joints").findKey(function (joint, jId) {
            return joint.get("isGround");
        });
        if (jointId !== undefined && jointId !== null) {
            state = state.updateIn(["info", "drivingJoints"], function (st) {
                return st.add(jointId);
            });
        }
    }

    state = (0, _helper.clearCouplerCurves)(state);
    // some changes for links are done and immediately passed here. Thus new joints are to computed.
    state = (0, _helper.getSimulationInfo)(state, window); //compute links
    state = (0, _helper.updateJoints)(state);
    // alloting plane and getting corner fixed pivot dimension
    //reseting simulation parameters
    state = state.set("simLength", (0, _helper.calcSimLength)(state));
    state = state.set("servoMax", (0, _helper.calcSimLength)(state));
    return state;
};
*/

var _constants = require("./constants.js");

var _immutable = require("immutable");


var initialState = (0, _immutable.Map)({
    knn: 30,
    multiSelectionDragging: false,
    multiSelectionRotating: false,
    drawingRectangleForSelecting: false,
    multiSelectionScaling: false,
    multiSelectionSet: (0, _immutable.Map)({
        links: (0, _immutable.Set)([]),
        poses: (0, _immutable.Set)([]),
        shapes: (0, _immutable.Set)([]), //saves ObjectID. Only the selected. Shapes with assigned links is in a different set.
        inlineJoints: (0, _immutable.Set)([]),
        GB_matrix: (0, _immutable.List)([1, 0, 0, 1, 0, 0]), //identity matrix
        BS_matmap: (0, _immutable.OrderedMap)({}),
        assignShapeSelected: true
    }),
    multiSelectionRectangle: (0, _immutable.Map)({ x: null, y: null, height: null, width: null, theta: 0, x_: null, y_: null, height_: null, width_: null }),
    rectangleForSelection: (0, _immutable.Map)({ x1: null, y1: null, x2: null, y2: null, x1_: null, y1_: null, x2_: null, y2_: null }), // two corners of the rectangle
    duplicateProps: (0, _immutable.Map)({ x_: 5, y_: 0 }),
    copyBuffer: (0, _immutable.Map)({}),
    points: (0, _immutable.List)([]),
    obstacles: (0, _immutable.List)([]),
    poses: (0, _immutable.OrderedMap)([]),
    links: (0, _immutable.OrderedMap)({}),
    joints: (0, _immutable.OrderedMap)({}),
    inlineJoints: (0, _immutable.OrderedMap)({}),
    freeFormLinksAndJoints: (0, _immutable.OrderedMap)({
        joints: (0, _immutable.OrderedMap)({}),
        inlineJoints: (0, _immutable.OrderedMap)({}),
        links: (0, _immutable.OrderedMap)({})
    }), // joints before switching to discrete mode, to display to discrepancy
    simJointMap: (0, _immutable.OrderedMap)({}),
    info: (0, _immutable.Map)({
        drivingJoints: (0, _immutable.Set)([]),
        dependencyGraph: (0, _immutable.Map)({}),
        //drivingJoint: 0,
        //otherInputs: Set([]),
        //otherInputsJoints: Set([]),
        direction: 1,
        speed: 3
    }),
    canvasHeight: 1220,
    canvasWidth: 1220,
    GCS: (0, _immutable.Map)({
        tx: 1220,
        ty: 1220,
        theta: 0,
        scale: 70
    }),
    canvasId: "drawableCanvas",
    synthesisCanvasId: "synthesisCanvas",
    backgroundImage: (0, _immutable.Map)({
        image: null,
        imageSrc: null,
        id: "backgroundImageCanvas",
        dx: null,
        dy: null,
        ix: 1,
        iy: 1,
        theta: null,
        dx_: null,
        dy_: null,
        aspectRatio: null,
        opacity: 0.5,
        corner: null,
        pan: false
    }),
    backgroundGridCanvasId: "backgroundGridCanvas",
    GIFcanvasId: "GIFcanvas",
    _3DSceneCanvasId: "_3DSceneCanvas",
    _3DSceneVisibility: "hidden", //hidden or visible
    navbarHeight: 0,
    simIndex: 0,
    initialSimIndex: 0,
    simLength: 0,
    servoMin: 0,
    servoMax: 0,
    selectedLink: null,
    selectedEnd: null,
    animationTimer: null,
    mouseDown: false,
    xDragging: null,
    yDragging: null,
    addingLink: false,
    snappingThreshold: 50,
    pinchDist: undefined,
    mode: "draw", //main modes: 'select', 'draw', 'selectShape', 'drawShape'
    msg: "Tap & Drag to Draw RR Dyad",
    linkType: "RR",
    RFactor: 20, // reinterpretation factor with respect to window width
    gridOn: true,
    showLinkNumber: true,
    progressBar: (0, _immutable.Map)({ isActive: false, value: null }),
    showWaitScreen: false,
    curveThickness: _constants.constants.CURVE_THICKNESS,
    showHelpGIFs: false,
    inputType: null,
    viewMode: _constants.constants.VIEW_MODE.REGULAR,

    //recorder
    mediaRecorder: null,
    streamCanvasId: "streamCanvas",

    //Shape
    shapeCanvasId: "shapeCanvas",
    selectedShape: null,
    shapeInfo: null, //other information for selected shape.
    shapeMatMap: (0, _immutable.OrderedMap)([]), //animation frame save.

    //XO system
    XOInfo: (0, _immutable.OrderedMap)({}),
    XOpattern: ['X', 'O'], // [['X', 'O'],['O','X']],
    XOinterval: 0.5,
    // Link Frame system
    jointPos_frame: (0, _immutable.OrderedMap)({}),
    needFullReload: false, //isSomethingAboutShapeChanged: false,
    needPartReload: (0, _immutable.Set)([]),
    isShapeScalingChanged: false,
    isShapeSegmentChanged: false,
    allowPaperLevelEdit: false,
    // possibly redundant
    ShapeAssignedLink: (0, _immutable.List)([]),
    LinkAssignedShape: (0, _immutable.OrderedMap)([]),

    linking: false,

    shapeOptions: (0, _immutable.Map)({
        drawOptions: (0, _immutable.Map)({
            shapeType: undefined,
            polySide: 5,
            innerRadius: 0.7,
            strokeWidth: 1.5,
            strokeColor: "black",
            fillColor: (0, _immutable.List)([0.9, 0.9, 0.9, 0.3]),
            booleanType: undefined,
            curveSimplify: 10,
            minDiag: 5
        }),

        drawGrid: false,

        hitMode: "bbox", //'bbox', segment and multi-select
        hitOption: (0, _immutable.Map)({
            segments: false, //hit segments with segment result.
            stroke: true,
            fill: true,
            tolerance: 10
        }),

        bboxSettings: (0, _immutable.Map)({
            bboxColor: (0, _immutable.List)([51 / 255, 229 / 255, 181 / 255, 0.6]),
            bboxColorChildren: "red",
            strokeWidth: 3,
            strokeWidthChildren: 1.5,
            rotationNodePixel: 60,
            rotationNodePixelChildren: 20,
            NodeRadius: 20, //when it is big enough
            NodeRadiusMin: 5, //when shape is too small and they clash to each other.
            NodeRadiusChildren: 3
        }),

        highLightSettings: (0, _immutable.Map)({
            highLightColor: (0, _immutable.List)([51 / 255, 229 / 255, 181 / 255, 0.6]),
            strokeWidth: 15
        }),

        highLightSegmentsSettings: (0, _immutable.Map)({
            pointRadius: 10,
            fillColor: (0, _immutable.List)([51 / 255, 229 / 255, 181 / 255, 0.6])
        })
    }),
    deleteLinkAlso: false, //when delete shape   //no way to change it as of now
    deleteShapeAlso: false, //when delete link(s) //no way to change it as of now
    colorMode: "fill",
    //synthesis solutions
    synthSolutions: (0, _immutable.Map)({
        solutions: (0, _immutable.OrderedMap)([]),
        shown: (0, _immutable.OrderedSet)([]),
        normParaSet: null,
        solutionFilters: (0, _immutable.Map)({
            grashof: false,
            linkageType: null,
            criteria: _constants.constants.SOLUTION_SORTING.COLLISION
        }),
        breakPoints: (0, _immutable.List)([]),
        plausibleInputPoints: (0, _immutable.List)([])
    }),
    selectedPose: null,
    showInputFeedback: false,
    showInput: true,
    showBreakPoints: false,
    expandAllMenus: false
});