var constants = {
    APP_BUNDLE: 'com.stonybrookuniversity.motiongenerator',
    DASH_SIZE: 30, //dashed line
    DASH_SIZE_SMALL: 15,
    ANIMATION_DELAY: 1, //ms
    MAX_LINK_COUNT: 100,
    MAX_JOINT_COUNT: 100,
    MAX_HISTORY_EVENTS: 20,
    EPSILON: 1e-9,
    DOUBLE_TAP: 400,
    //folder structure PARENT_FOLDER_NAME>EXAMPLES_FOLDER_NAME;
    //folder structure PARENT_FOLDER_NAME>STORED_FILES_FOLDER_NAME;
    //folder structure PARENT_FOLDER_NAME>CONSTRAINTS_FOLDER_NAME;
    //folder structure PARENT_FOLDER_NAME>LINKAGE_FOLDER_NAME;
    PARENT_FOLDER_NAME: "MotionGen_Files",
    LINKAGE_FOLDER_NAME: "MotionGen_Linkages",
    CONSTRAINTS_FOLDER_NAME: "MotionGen_Constraints",
    EXPORT_FOLDER_NAME: "MotionGen_Export_Data",
    STORED_FILES_FOLDER_NAME: "MotionGen_User_Files",
    EXAMPLES_FOLDER_NAME: "MotionGen_Examples",
    MAIL_SUBJECT: "Linkage Details",
    GRID_SCALE: "Grid 1:",
    // PDF export
    IMAGE_WIDTH: 900,
    IMAGE_HEIGHT: 500,

    // Colors
    COLOR_BLACK: '#000000',
    COLOR_BLACK_TRANSPARENT: 'rgba(20, 20, 20, 0.6)',
    COLOR_GRAY: '#7b7272',
    COLOR_RED: '#c0392b',
    COLOR_GREEN: '#27ae60',
    COLOR_BLUE: '#2980b9',
    TOLERANCE_REGION_COLOR: 'rgba(155, 155, 155, 0.6)',

    // Screen
    SCREEN_COMPRESSION_FACTOR: 2, // 2
    WORKSPACE_HEIGHT: 10, // 10
    WORKSPACE_WIDTH: 25, // 25
    WORKSPACE_MARGIN: 1.5, // 1.5
    INITIAL_HORIZONTAL_DIVISIONS: 10, // 10
    MIN_HORIZONTAL_DIVISIONS: 5, // 5
    MIN_ZOOM: 0.1, // new
    MAX_ZOOM_MULTIPLIER: 1.2, // new
    MAX_HORIZONTAL_DIVISIONS: 1000, // 150
    VISIBLE_HORIZONTAL_DIVISIONS: 15, // 15
    FINGER_RADIUS: 27, // 27

    //Grid
    GRID_LINE_THICKNESS: 1,
    GRID_LINE_COLOR: '#56B4E9',
    GRID_WORKSPACE_LINE_THICKNESS: 4,
    GRID_WORKSPACE_LINE_COLOR: '#2ecc71',
    GRID_CENTER_LINE_COLOR: '#0072B2',
    GRID_CENTER_LINE_THICKNESS: 3,
    GRID_CENTER_LINE_ALPHA: 0.8,
    GRID_AXIS_POINTER_LINE_LENGTH: 1.5,
    GRID_AXIS_POINTER_LINE_THICKNESS: 6,
    GRID_AXIS_POINTER_ARROW_LENGTH: 0.32,
    GRID_AXIS_POINTER_ARROW_WIDTH: 0.18,
    GRID_AXIS_POINTER_ARROW_COLOR: '#3791A6',

    //Link
    LINK_THIRD_JOINT_ANGLE: 10,
    LINK_THICKNESS: 6,
    LINK_COLOR: '#000',
    LINK_END_CIRCLE_FILL_COLOR: '#fff',
    LINK_END_CIRCLE_SECOND_FILL_COLOR: '#000',
    LINK_END_CIRCLE_RADIUS: 15,
    LINK_END_CIRCLE_LINE_THICKNESS: 4, //px
    LINK_PATH_LINE_THICKNESS: 2,
    LINK_PATH_LINE_COLOR: '#16a085',

    //Ground Joint
    GROUND_JOINT_LINE_COLOR: '#000',
    GROUND_JOINT_LINE_COLOR_INPUT: 'rgba(62, 62, 62,0.7)',
    GROUND_JOINT_LINE_THICKNESS: 6,
    GROUND_JOINT_ACTUATION_ARROW_LENGTH: 0.48,
    GROUND_JOINT_ACTUATION_LINE_THICKNESS: 5,
    GROUND_JOINT_ACTUATION_LINE_COLOR: '#16a085',
    GROUND_JOINT_FILL_COLOR: '#E0DBBE',

    //Pose
    POSE_LINE_THICKNESS: 4, //px
    POSE_LINE_LENGTH: 1.5,
    POSE_ARROW_LENGTH: 0.45,
    POSE_ARROW_WIDTH: 0.2,
    POSE_EDITING_ARROW_LENGTH: 0.3,
    POSE_EDITING_ARROW_WIDTH: 0.15,
    POSE_EDITING_LINE_THICKNESS: 3,
    POSE_LINE_COLOR: 'rgba(0, 0, 0, 1)',
    POSE_LINE_GRAY_COLOR: 'rgba(124, 124, 124, 0.5)',
    POSE_CAPTURED_LINE_COLOR: '#2EB8C1',
    POSE_OUTPUT_COLOR: '#2c8059',
    POSE_HIGHLIGHT_COLOR: '#33E5C5',
    POSE_EDITING_OUTER_RING_RADIUS: 70,
    POSE_EDITING_OUTER_RING_WIDTH: 33,

    //Line Constraint
    LINE_CONSTRAINT_LINE_THICKNESS: 4,
    LINE_CONSTRAINT_MOVING_LINE_COLOR: 'rgba(39, 174, 96,0.6)',

    //Point Constraint
    MOVING_PIVOT_OUTER_CIRCLE_RADIUS: 33,
    MOVING_PIVOT_LINE_COLOR: '#27ae60',

    //Coupler
    COUPLER_LINE_THICKNESS: 6,
    COUPLER_END_CIRCLE_RADIUS: 4,
    COUPLER_FILL_COLOR: '#27ae60',
    COUPLER_LINE_COLOR: '#5d6a6b',

    //Coupler Curve
    COUPLER_CURVE_1_COLOR: '#2971C1',
    COUPLER_CURVE_2_COLOR: '#e74c3c',
    
    //RPM
    MAX_RPM: 60,
    MIN_RPM: 0,

    finalizeConstants: function () {
        this.GRID_AXIS_POINTER_LINE_LENGTH = helper.convertLengthFromGridUnitsToPixels(this.GRID_AXIS_POINTER_LINE_LENGTH);
        this.GRID_AXIS_POINTER_ARROW_LENGTH = helper.convertLengthFromGridUnitsToPixels(this.GRID_AXIS_POINTER_ARROW_LENGTH);
        this.GRID_AXIS_POINTER_ARROW_WIDTH = helper.convertLengthFromGridUnitsToPixels(this.GRID_AXIS_POINTER_ARROW_WIDTH);
        this.POSE_LINE_LENGTH = helper.constrain(helper.convertLengthFromGridUnitsToPixels(this.POSE_LINE_LENGTH), 44, 1000);
        this.POSE_ARROW_LENGTH = helper.constrain(helper.convertLengthFromGridUnitsToPixels(this.POSE_ARROW_LENGTH), 12.5, 1000);
        this.POSE_ARROW_WIDTH = helper.constrain(helper.convertLengthFromGridUnitsToPixels(this.POSE_ARROW_WIDTH), 5, 1000);
        this.POSE_EDITING_ARROW_LENGTH = helper.constrain(helper.convertLengthFromGridUnitsToPixels(this.POSE_EDITING_ARROW_LENGTH), 12.5, 1000);
        this.POSE_EDITING_ARROW_WIDTH = helper.constrain(helper.convertLengthFromGridUnitsToPixels(this.POSE_EDITING_ARROW_WIDTH), 5, 1000);
    }
};

var Mode = {
    SELECT: 'Tap Entity to Select',
    ADD_CONSTRAINTS: 'Tap & Drag to Draw',
    ADD_PATH: 'Add Control Points',
    ADD_LINKS: 'Tap & Drag to Draw 0 Dyad',
    TOGGLE_LINK_CLASS: 'Select a Link to Switch' 
};

var Text = {
    TOGGLE_LINK_CLASS: 'Select a Link to Switch' ,
    MULTIPLE_TOGGLE_LINK_CLASS: 'Select Multiple Links to Switch',
    SELECTION_MODE: 'Tap Entity to Select'
};

var ConstraintType = {
    POSE: 'Poses',
    LINE_CONSTRAINT: 'Line Constraint',
    POINT_CONSTRAINT: 'Point Constraints',
    PATH_CONSTRAINT: 'Path Constraints'
};

var ConstraintBehavior = {
    REGULAR: 'regular',
    FIXED: 'fixed',
    MOVING: 'moving',
    EXACT: 'exact'
};

var SelectionType = {
    CONTROL_POINT: 'Control Point',
    LINK: 'Link',
    JOINT: 'Joint',
    COUPLER: 'Coupler',
    LINKAGE_PROPERTY: 'Linkage Property',
    IMAGE: 'Image'
};

var LinkageProperty = {
    DRIVING: 'Driving',
    BRANCH: 'Branch',
    CIRCUIT: 'Circuit'
};

var LinkType = {
    RR: 'RR',
    PR: 'PR',
    RP: 'RP',
    Ground: 'Ground Link',
};
var GroundLink = {
    linkType: LinkType.Ground
};

var LinkClass = {
    BINARY: 'Binary Link',
    TERNARY: 'Ternary Link'
};

var JointType = {
    R: 0,
    P: 1
};
var State = {
    Known: 'Known',
    unKnown: 'Unknown',
    Incomplete: 'Incomplete'
};
var simulationStatus = {
    invalidPositions: 'Invalid Positions of Joints',
    inProgress: 'In Progress',
    inSolvable: 'Cannot be Solved'
};
var DimensionType = {
    X: 'x-value',
    Y: 'y-value',
    Length: 'length-value',
    Angle: 'angle-value'
};

var LinkageType = {
    GRASHOF: 'Grashof ',
    NON_GRASHOF: 'Non-Grashof ',
    CRANK: 'crank',
    ROCKER: 'rocker',
    DOUBLE: 'double-',
    TRIPLE: 'triple-',
    SWINGING_BLOCK: 'Swinging Block Mechanism',
    CRANK_SLIDER: 'Crank Slider Mechanism',
    DOUBLE_SLIDER: 'Double Slider Mechanism',
    SLIDER_SWINGING: 'Slider-Swinging Block Mechanism',
    DOUBLE_SWINGING: 'Double Swinging Block Mechanism',
    STEPHENSON_SIX_BAR: 'Stephenson Six-Bar Mechanism',
    WATT_SIX_BAR: 'Watt Six-Bar Mechanism'
};

var Branch = {
    ONE: 1,
    TWO: 2
};

var TransactionType = {
    ADD: 0,
    EDIT: 1,
    DELETE: 2
};

var LinkageSymbols = {
    CRANK_FIXED_PIVOT: 'O2',
    CRANK_MOVING_PIVOT: 'A',
    FOLLOWER_FIXED_PIVOT: 'O4',
    FOLLOWER_MOVING_PIVOT: 'B',
    COUPLER_JOINT: 'C',
    COUPLER_POINT: 'P'
};

var XMLNodes = {
    APPLICATION_NODE: 'application',
    BACKGROUND_NODE: 'background',
    GRID_NODE: 'grid',
    WORKSPACE_NODE: 'workspace',
    CONSTRAINTS_NODE: 'constraints',
    CONSTRAINT_NODE: 'constraint',
    LINKAGE_NODE: 'linkage',
    LINK_NODE: 'link',
    SYNTHESIZED_NODE: 'synthesized',
    CAPTURED_NODE: 'captured',
    DYAD_VECTORS: 'dyadVectors',
    FILE: 'file'
};

var XMLAttributes = {
    //File
    ID: 'id',
    NAME: 'name',
    DISPLAY_NAME: 'display',
    IMAGE_NAME: 'image',
    IS_OPEN: 'opened',

    //Application
    MODE: 'mode',
    POSE_DENSITY: 'poseDensity',
    DRAWABLE: 'drawable',
    SHOW_CAPTURED: 'showCaptured',

    //Background Image
    FILE_PATH: 'path',
    VISIBLE: 'visible',
    OPACITY: 'opacity',

    //Grid
    PAN_X: 'panX',
    PAN_Y: 'panY',
    SCALE: 'scale',
    KINEMATIC_STYLE: 'kinematicStyleView',
    LINK_NUMBERS: 'showLinkNumbers',

    //Drawables
    TYPE: 'type',
    CLASS: 'class',
    COLOR: 'color',
    RPM: 'rpm',
    DIRECTION: 'rotationDirection',
    PLOT: 'plotCurves',
    X: 'x',
    Y: 'y',
    X1: 'x1',
    Y1: 'y1',
    X2: 'x2',
    Y2: 'y2',
    LENGTH: 'length',
    ANGLE: 'angle',
    GROUND: 'isGround',
    BEHAVIOR: 'behavior',
    ORIENTATION: 'orientation',
    SYMBOL: 'symbol',
    DESCRIPTION: 'desc',
    

    //Linkage
    DRIVING: 'driving',
    BRANCH: 'branch',
    CIRCUIT: 'circuit',
    ELAPSED: 'elapsed',
    OTHER_INPUTS: 'otherInputs',
    CHANGE_BRANCH: 'changeBranch',

    //Dyad ---- Note: these values are in moving frame
    MOVING_PIVOT: 'movingPivot',
    MOVING_LINE: 'movingLine',
    SELECTED: 'selected',
    TRUE_DYAD: 'trueDyad'
};

var Files = {
    APPLICATION_FILE: 'application_files.xml',
    NEW_FILE: 'new_file{d}.xml'
};

var ErrorMessages = {

};

/* ------- These are used while inputing data from a txt file --------- */ // Not implemented by Anshul, the text parser that is implemented in under fileHandler
var Escapes = {
    POSE_OPEN: '{',
    POSE_CLOSE: '}',
    LINE_OPEN: '[',
    LINE_CLOSE: ']',
    POINT_OPEN: '<',
    POINT_CLOSE: '>',
    LINK_OPEN: '([',
    LINK_CLOSE: '])',
    COUPLER_OPEN: '(<',
    COUPLER_CLOSE: '>)'
};

var TextExportHeader = '\/\/' + Escapes.POSE_OPEN + 'x,y,angle' + Escapes.POSE_CLOSE + ' represents a pose\n\/\/' + Escapes.LINE_OPEN + 'x1,y1,length,angle' + Escapes.LINE_CLOSE + ' represents a line constraint\n\/\/' + Escapes.POINT_OPEN + 'x,y' + Escapes.POINT_CLOSE + ' represents a point constraint\n\/\/' + Escapes.LINK_OPEN + 'x1,y1,length,angle,type' + Escapes.LINK_CLOSE + ' represents a link, types= ' + LinkType.RR + ', ' + LinkType.PR + ', ' + LinkType.RP + '\n\/\/' + Escapes.COUPLER_OPEN + 'length,angle,orientation' + Escapes.COUPLER_CLOSE + ' represents a coupler link\n\n';
