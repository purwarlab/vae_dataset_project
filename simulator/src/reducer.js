// data flow and manipuation
import window from 'global';
import { constants } from "./constants.js";
import { List, Map, Set, OrderedMap, OrderedSet, fromJS } from "immutable";
import { matrix, multiply } from "mathjs";
// link and its drawings and animations
import {
    getEndPoint,
    getInclination,
    getDistance,
    getSimulationInfo,
    calcSimLength,
    updateLinkedJoints,
    getJoint,
    setPoint,
    clearCouplerCurves,
    updateJoints
} from "./helper.js";
// paper 2D shapes and its manipulations
//

const updateReinterpretedLinks = (state) => {
  state.get("joints").forEach( (j_, jointId) => {
    state.getIn(["joints", jointId, "links"]).forEach(linkId => {
        if (state.getIn(["links", linkId, "linkType"]) === constants.LINK_TYPE.RP && !state.hasIn(["links", linkId, "joint2"])) {
            let joint1 = getJoint(state, linkId, "joint1");
            let joint4 = getJoint(state, linkId, "joint4");
            let inclination = getInclination(joint1, joint4);
            state = state.setIn(["links", linkId, "inclination"], inclination);
            state = setThirdPointAtInfinity(state, linkId, inclination);
        } else if (state.getIn(["links", linkId, "linkType"]) === "PR"){
           state = setThirdPointAtInfinity(state, linkId);
        } else if (state.getIn(["links", linkId, "linkType"]) === "RP"){
            let R = 1220 * 120;
            // joint 3 is at infinity, joint 4 is the end of second link coming down
            //  should be calculated based on canvas max of width or height
            let joint1 = getJoint(state, linkId, "joint1");
            let joint2;
            let inclination;
            if (state.hasIn(["links", linkId, "joint2"])) {
                joint2 = getJoint(state, linkId, "joint2");
                inclination = getInclination(joint1, joint2);
            }

            if (joint2 === undefined) joint2 = joint1;

            let temp = getEndPoint(joint1, R, inclination);
                        let joint3Info = state
                .getIn(["links", linkId, "joint3"])
                .toJS();
            state = state.setIn(
                ["links", linkId, "inclination"],
                inclination
            );
            state = setPoint(state, joint3Info.id, temp.x, temp.y);
            // This length is the offset for prismatic joint
            // TODO : Exclude the snapping of this joint4 and joint2
            // set this only if joint4 is not connected to anyone
            let joint4Info = state
                .getIn(["links", linkId, "joint4"])
                .toJS();
            if (state.getIn(["joints", joint4Info.id, "links"]).size === 1) {
                // prevents updating the joint location when it is connected to someother links
                //      as we move the joint1 or joint2
                temp = getEndPoint(joint2, 200, inclination + Math.PI / 2.0);
                state = setPoint(state, joint4Info.id, temp.x, temp.y);
            }
        }
    })
  })
   return state
}

/* assisting functions and variables/constants */
const setThirdPointAtInfinity = (state, linkId, theta = null) => {
    let R = 1220 * 120;
    //  should be calculated based on canvas max of width or height
    let joint1 = getJoint(state, linkId, "joint1");
    let temp;
    if (theta === null) {
        let joint2 = getJoint(state, linkId, "joint2");
        temp = getEndPoint(joint1, R, getInclination(joint1, joint2) + Math.PI / 2.0);
    } else {
        temp = getEndPoint(joint1, R, theta + Math.PI / 2.0);
    }
    let joint3Info = state.getIn(["links", linkId, "joint3"]).toJS();
    state = setPoint(state, joint3Info.id, temp.x, temp.y);
    return state;
};

const loadSimulation = (state, convertTriads = false, window) => {
    // animation computation for links.
    // animation matrices computation.
       // computation of new joint positions in respective frames.
    // using state to form a json object accepted by legacy code for simulation
    if (state.getIn(["info", "drivingJoints"]).size === 0 && state.get("joints").size > 0) {
        let jointId = state.get("joints").findKey((joint, jId) => joint.get("isGround"))
        if (jointId !== undefined && jointId !== null) {
            state = state.updateIn(["info", "drivingJoints"], st => st.add(jointId))
        }
    }

    state = clearCouplerCurves(state);
    // some changes for links are done and immediately passed here. Thus new joints are to computed.
    state = getSimulationInfo(state, window); //compute links
    state = updateJoints(state);
    // alloting plane and getting corner fixed pivot dimension
    //reseting simulation parameters
    state = state.set("simLength", calcSimLength(state));
    state = state.set("servoMax", calcSimLength(state));
    return state;
};

export const reducer = (state = initialState, action) => {
    switch (action.type) {
        // links
               case "CHANGE_LINK_POINT": {     //edit_link_joint
            // keeping this info to set the direction of RP dyad when its length is zero

            state = setPoint(state, action.jointId, action.xDragging, action.yDragging, "joints", true);

            // if PR joint, get the third joint to the interpreted location
                        // updating regular joint locations connected to inlineJoints
            // console.log("starting search")
            state = updateReinterpretedLinks(state)
            state = updateLinkedJoints(state, [action.jointId])
            //full refresh shapes matrices, whose global position remains the same.
            //although only the frame part should be recomputed.
            //@Prerna: would you give me which links are affected for this joint change
            //      so that I can partial refresh for the shapes that are assigned to the links?
            //      (i.e., refresh only the related shapes)
            state = setCoordinateForShapes(state, "Global");
            state = loadSimulation(state, undefined, action.window);

            return state;
        }
        case "LOAD_JOINTS_AND_LINKS": {
          state = state.set("viewMode", constants.VIEW_MODE.REGULAR);
          state = state.set("links", OrderedMap({}))
          state = state.set("joints", OrderedMap({}))
          state = state.set("drivingJoints", Set([]))
          fromJS(action.data.links).forEach( (link, linkId) => {
            state = state.setIn(["links", Number(linkId)], link)
          })
          fromJS(action.data.joints).forEach( (joint, jointId) => {
            joint = joint.update("links", links => Set(links))
            state = state.setIn(["joints", Number(jointId)], joint)
          })
          fromJS(action.data.joints).forEach( (jointId_, jointId) => {
            state = state.update("drivingJoints", st => st.add(Number(jointId)))
          })
          state = updateReinterpretedLinks(state)
          state = loadSimulation(state, undefined, action.window);
          return state;
        }
        default: {
            console.log('action ', action.type, ' is not defined or is intentionally left blank')
            return state;
        }
    }
};
const initialState = Map({
    knn: 30,
    multiSelectionDragging: false,
    multiSelectionRotating: false,
    drawingRectangleForSelecting: false,
    multiSelectionScaling: false,
    multiSelectionSet: Map({
        links: Set([]),
        poses: Set([]),
        shapes: Set([]), //saves ObjectID. Only the selected. Shapes with assigned links is in a different set.
        inlineJoints: Set([]),
        GB_matrix: List([1, 0, 0, 1, 0, 0]), //identity matrix
        BS_matmap: OrderedMap({}),
        assignShapeSelected: true
    }),
    multiSelectionRectangle: Map({ x: null, y: null, height: null, width: null, theta: 0, x_: null, y_: null, height_: null, width_: null }),
    rectangleForSelection: Map({ x1: null, y1: null, x2: null, y2: null, x1_: null, y1_: null, x2_: null, y2_: null }), // two corners of the rectangle
    duplicateProps: Map({ x_: 5, y_: 0 }),
    copyBuffer: Map({}),
    points: List([]),
    obstacles: List([]),
        poses: OrderedMap([]),
    links: OrderedMap({}),
    joints: OrderedMap({}),
    inlineJoints: OrderedMap({}),
    freeFormLinksAndJoints: OrderedMap({
        joints: OrderedMap({}),
        inlineJoints: OrderedMap({}),
        links: OrderedMap({}),
    }), // joints before switching to discrete mode, to display to discrepancy
    simJointMap: OrderedMap({}),
    info: Map({
        drivingJoints: Set([]),
        dependencyGraph: Map({}),
        //drivingJoint: 0,
        //otherInputs: Set([]),
        //otherInputsJoints: Set([]),
        direction: 1,
        speed: 3
    }),
    canvasHeight: 1220,
    canvasWidth: 1220,
    GCS: Map({
        tx: 1220,
                ty: 1220,
        theta: 0,
        scale: 70
    }),
    canvasId: "drawableCanvas",
    synthesisCanvasId: "synthesisCanvas",
    backgroundImage: Map({
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
    progressBar: Map({ isActive: false, value: null }),
    showWaitScreen: false,
    curveThickness: constants.CURVE_THICKNESS,
    showHelpGIFs: false,
    inputType: null,
    viewMode: constants.VIEW_MODE.REGULAR,

    //recorder
    mediaRecorder: null,
    streamCanvasId: "streamCanvas",

    //Shape
    shapeCanvasId: "shapeCanvas",
    selectedShape: null,
    shapeInfo: null, //other information for selected shape.
    shapeMatMap: OrderedMap([]),  //animation frame save.

    //XO system
    XOInfo: OrderedMap({}),
    XOpattern: ['X', 'O'], // [['X', 'O'],['O','X']],
    XOinterval: 0.5,
        // Link Frame system
    jointPos_frame: OrderedMap({}),
    needFullReload: false, //isSomethingAboutShapeChanged: false,
    needPartReload: Set([]),
    isShapeScalingChanged: false,
    isShapeSegmentChanged: false,
    allowPaperLevelEdit: false,
    // possibly redundant
    ShapeAssignedLink: List([]),
    LinkAssignedShape: OrderedMap([]),

    linking: false,

    shapeOptions: Map({
        drawOptions: Map({
            shapeType: undefined,
            polySide: 5,
            innerRadius: 0.7,
            strokeWidth: 1.5,
            strokeColor: "black",
            fillColor: List([0.9, 0.9, 0.9, 0.3]),
            booleanType: undefined,
            curveSimplify: 10,
                        minDiag: 5
        }),

        drawGrid: false,

        hitMode: "bbox", //'bbox', segment and multi-select
        hitOption: Map({
            segments: false, //hit segments with segment result.
            stroke: true,
            fill: true,
            tolerance: 10
        }),

        bboxSettings: Map({
            bboxColor: List([51 / 255, 229 / 255, 181 / 255, 0.6]),
            bboxColorChildren: "red",
            strokeWidth: 3,
            strokeWidthChildren: 1.5,
            rotationNodePixel: 60,
            rotationNodePixelChildren: 20,
            NodeRadius: 20, //when it is big enough
            NodeRadiusMin: 5, //when shape is too small and they clash to each other.
            NodeRadiusChildren: 3
                    }),

        highLightSettings: Map({
            highLightColor: List([51 / 255, 229 / 255, 181 / 255, 0.6]),
            strokeWidth: 15
        }),

        highLightSegmentsSettings: Map({
            pointRadius: 10,
            fillColor: List([51 / 255, 229 / 255, 181 / 255, 0.6])
        })
    }),
    deleteLinkAlso: false, //when delete shape   //no way to change it as of now
    deleteShapeAlso: false, //when delete link(s) //no way to change it as of now
    colorMode: "fill",
    //synthesis solutions
    synthSolutions: Map({
        solutions: OrderedMap([]),
        shown: OrderedSet([]),
        normParaSet: null,
        solutionFilters: Map({
            grashof: false,
            linkageType: null,
                        criteria: constants.SOLUTION_SORTING.COLLISION
        }),
        breakPoints: List([]),
        plausibleInputPoints: List([])
    }),
    selectedPose: null,
    showInputFeedback: false,
    showInput: true,
    showBreakPoints: false,
    expandAllMenus: false
});
