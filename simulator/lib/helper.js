"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getPointsForConvexHull = exports.setInlineJointSetForJoint = exports.createNewDummyJointForInlineJoint = exports.getOtherJointId = exports.deleteInlineJoint = exports.setInlineJoint = exports.setInlineJointDist = exports.getInlineJoint = exports.validateInlineJoints = exports.snappifyLink = exports.addInlineJoint = exports.setSnappyXOPivotsForPR = exports.getContrastColor = exports.increaseOpacity = exports.duplicateSelection = exports.getJointSet = exports.getFixedJointId = exports.allotPlanes = exports.getSelectionRectangleParas_links = exports.getResetViewParameters = exports.getCornerFixedPivots = exports.transformJoints = exports.updateLinkedJoints = exports.recursivelyUpdateLinkedRegularJoints = exports.updatePoints = exports.get_GCS_points = exports.isVirtualJoint = exports.findEndforJointId = exports.getPointSide = exports.inverseUpdateBackgroundImage = exports.updateBackgroundImage = exports.inverseUpdateCouplerCurves = exports.updateCouplerCurves = exports.updateMultiSelectionRectangleScale = exports.updateMultiSelectionRectangleTranslation = exports.updateJoints = exports.calcSimLength = exports.clearCouplerCurves = exports.setLinkageInfo = exports.getJoint = exports.setPoint = exports.getScalingTransformationMatrix = exports.getInverseScalingTransformationMatrix = exports.getTransformationMatrix = exports.getInverseTransformationMatrix = exports.addJoint = exports.deleteLink = exports.deleteJoint = exports.recursivelyRemoveDrivingJoints = exports.getSimulationInfo = exports.getDrivingLinks = exports.getDrivingStatus = exports.getEndPoint = exports.getSignedDistance = exports.getDistance = exports.getMidPoint = exports.getInclination = exports.getNewJoint = exports.getNewId = undefined;

var _mathjs = require("mathjs");

var _constants = require("./constants");

var _immutable = require("immutable");

var window = require("global/window")
console.log(window)

// from helper.js
var helper = {
  minConstrain: function (value, lowerLimit) {
      return (value < lowerLimit) ? lowerLimit : value;
  },
  getPointSide: function(point1, point2, qPoint) {
      return Math.sign((point2.x-point1.x)*(qPoint.y-point1.y)-(point2.y-point1.y)*(qPoint.x-point1.x));
  },
  maxConstrain: function (value, upperLimit) {
      return (value > upperLimit) ? upperLimit : value;
  },
  constrain: function (value, lowerLimit, upperLimit) {
      return (value < lowerLimit) ? lowerLimit : ((value > upperLimit) ? upperLimit : value);
  },
  convertLengthFromGridUnitsToPixels: function (length) {
      return length * canvasCore.scaleFactor / constants.SCREEN_COMPRESSION_FACTOR;
  },
  convertLengthFromPixelsToGridUnits: function (length) {
      return length * constants.SCREEN_COMPRESSION_FACTOR / canvasCore.scaleFactor;
  },
  getDistance: function (x1, y1, x2, y2) {
      if(typeof x2 == 'undefined' && typeof y2 == 'undefined') {
          //incase Point object is passed
          return Math.sqrt(Math.pow(x1.x - y1.x, 2) + Math.pow(x1.y - y1.y, 2));
      } 
      return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
  },
  getEndPoint: function (startPoint, length, angle) {
      return new Point(startPoint.x + (length * Math.cos(angle)), startPoint.y + (length * Math.sin(angle)));
  },
  getInclination: function (point1, point2) {
      return Math.atan2(point2.y - point1.y, point2.x - point1.x);
  },
  complexRoot: function (number) {
      var real = Math.sqrt((number.real + Math.sqrt(Math.pow(number.real, 2) + Math.pow(number.imag, 2))) / 2);
      var imag = Math.sqrt((-number.real + Math.sqrt(Math.pow(number.real, 2) + Math.pow(number.imag, 2))) / 2) * (number.imag < 0 ? -1 : 1);

      return new Complex(real, imag);
  },
  complexPower: function (number, power) {
      var angle = Math.atan2(number.imag, number.real);
      var R = Math.pow(Math.sqrt(Math.pow(number.real, 2) + Math.pow(number.imag, 2)), power);

      return new Complex(R * Math.cos(angle * power), R * Math.sin(angle * power));
  },
  getIntersectionPoint: function (point1, slope1, point2, slope2) {
      var returnPoint = new Point(0, 0);

      if (Math.abs(slope1) != Math.abs(slope2)) {
          var c1 = point1.y - slope1 * point1.x;
          var c2 = point2.y - slope2 * point2.x;

          var x = (c1 - c2) / (slope2 - slope1);
          var y = slope1 * x + c1;

          returnPoint.setPoint(x, y);
      }

      return returnPoint;
  },
  toRadians: function (angle) {
      return (angle * Math.PI / 180);
  },
  toDegrees: function (angle) {
      return (((angle * 180 / Math.PI) + 360) % 360);
  },
  unitizeAngle: function (angle) {
      return (angle + 360) % 360;
  },
  unitizeRadians: function (angle) {
      return (angle + (2 * Math.PI)) % (2 * Math.PI);
  },
  
  closeToZero: function (number) {
      if(Math.abs(parseFloat(number)) < 1 * Math.pow(10,-12)) return true;
      else return false;
  },
  
  createZeroMatrix: function (dimensions) {
  var array = [];

  for (var i = 0; i < dimensions[0]; ++i) {
      array.push(dimensions.length == 1 ? 0 : helper.createZeroMatrix(dimensions.slice(1)));
  }

  return array;
},

  /* ---- XML Helper ---- */
  getXMLNode: function (xmlContent, parent, elementName) {
      var nodes = xmlContent.getElementsByTagName(elementName);
      var node;

      if (nodes.length == 0) {
          node = xmlContent.createElement(elementName);
          parent.appendChild(node);
      } else if (nodes.length > 0) {
          node = nodes[0];
      }

      return node;

  },
  getAttributes: function (element) {
      var attributes;

      if (element) {
          attributes = {};
          var l = element.attributes.length;

          for (var i = 0; i < l; i++)
              attributes[element.attributes[i].name] = element.attributes[i].value;
      }

      return attributes;
  },
  setAttributes: function (element, attributes) {
      for (var i = 0; i < attributes.length; i++) {
          element.setAttribute(attributes[i][0], attributes[i][1]);
      }
  },
  addChildElementsOfType: function (xmlContent, parent, childType, attributeList) {
      for (var i = 0; i < attributeList.length; i++) {
          var child = xmlContent.createElement(childType);
          this.setAttributes(child, attributeList[i]);
          parent.appendChild(child);
      }
  },
  getChildElementsOfType: function (parent, childType) {
      var children = [];

      if (parent) {
          for (var i = 0; i < parent.childNodes.length; i++) {
              if ((childType != '' && parent.childNodes[i].tagName == childType) || childType == '')
                  children.push(this.getAttributes(parent.childNodes[i]));
          }
      }
      return children;
  },
  removeChildElements: function (parent) {
      while (parent.hasChildNodes())
          parent.removeChild(parent.firstChild);
  },
  convertImageToBlob: function (dataURL) {
      var data = atob(dataURL.replace(/data:image\/jpeg;base64,/, ''));
      var array = [];

      for (i = 0; i < data.length; i++) {
          array.push(data.charCodeAt(i));
      }

      return new Blob([new Uint8Array(array)], {
          type: 'image/jpeg'
      });
  },
  xmlToString: function (xmlContent) {
      return (new XMLSerializer()).serializeToString(xmlContent);
  },

  /* ---- End XML Helper ---- */
  numFromRC: function (i, j) {
      return (i * (i + 1) / 2 + j);
  },
  // Returns the inverse transpose of the Transformation Matrix
  getTransformationMatrix: function (pose) {
      var z3 = Math.sin(pose.angle / 2);
      var z4 = Math.cos(pose.angle / 2);
      var z1 = 0.5 * (pose.center.x * z3 - pose.center.y * z4);
      var z2 = 0.5 * (pose.center.x * z4 + pose.center.y * z3);

      return [
          [z4 * z4 - z3 * z3, -2 * z3 * z4, 0], //
          [2 * z3 * z4, z4 * z4 - z3 * z3, 0], //
          [2 * (z1 * z3 - z2 * z4), 2 * (z2 * z3 + z1 * z4), z4 * z4 + z3 * z3]
      ];
  },
  getFittingError: function (q) {
      return (((q[0].times(q[5]).plus(q[1].times(q[4])).minus(q[2].times(q[3]))).pow(2)).plus(
          ((q[0].times(q[6]).times(2)).minus(q[1].times(q[3])).minus(q[2].times(q[4]))).pow(2))).squareRoot()
  },

  // Get the value corresponding to a key in a list of key-value pairs
  getValueInList: function (list, key) {
      for (var i = 0; i < list.length; i++) {
          if (list[i][0] === key) return list[i][1];
      }
      return "";
  },
  getMidPoint: function(point1, point2){
      var midpoint = new Point;
      midpoint.x = (point1.x + point2.x) / 2;
      midpoint.y = (point1.y + point2.y) / 2;
      return midpoint;
  },
  getCentroid: function(point1, point2, point3){
      var centroid = new Point;
      var midpointx = (point1.x + point2.x) / 2;
      var midpointy = (point1.y + point2.y) / 2;
      centroid.x = point3.x + (2 / 3 * (midpointx - point3.x));
      centroid.y = point3.y + (2 / 3 * (midpointy - point3.y));
      return centroid;
  },
  getPlanarDualQuarternion: function (pose) {
      var dualQ = new PlanarQC();
      var absPosAngle = Math.abs(pose.angle);
      var angle = absPosAngle;
      if (absPosAngle > (2 * Math.PI)) {
          while (angle > (2 * Math.PI)) {
              angle = absPosAngle - (2 * Math.PI)
          }
      }
      if (angle != 0) {
          angle = angle * pose.angle / absPosAngle
      }
      //        if (angle < 0) {
      //            angle = angle + (2 * Math.PI);
      //        }
      dualQ.z3 = Math.sin(angle / 2);
      dualQ.z4 = Math.cos(angle / 2);
      dualQ.z1 = 0.5 * (pose.center.x * dualQ.z3 - pose.center.y * dualQ.z4);
      dualQ.z2 = 0.5 * (pose.center.x * dualQ.z4 + pose.center.y * dualQ.z3);
      return dualQ;
  },
  getPosefromDualQuarternion: function (dualQ) {
      var pose = new Pose();
      pose.angle = 2 * Math.atan2(dualQ.z3, dualQ.z4);
      pose.center.y = 2 * (dualQ.z2 * dualQ.z3 - dualQ.z1 * dualQ.z4);
      pose.center.x = 2 * (dualQ.z2 * dualQ.z4 + dualQ.z1 * dualQ.z3);
      return pose;
  }
};

// From constant.js 
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

// From drawables.js
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

// from simulator.js
var simulator = {
  simulationResult: "",
  unKnownJoints: [],
  links: [],
  joints: [],
  crankLimits: {},
  drivingElement: 0,
  knownJoint1: [], // will be used as out parameters while calling functions
  knownJoint2: [],
  angleIncrement: 1,
  defaultAngleIncrement: 1,
  crankAngle: -1,
  //branch: Branch.ONE,
  snappyXOMode: false,
  XOstep: null,
  branchAngle: 0,

  generateCurves: function(joints, links, drivingElements, crankLimits) {
    var counter = 0;
    let steps = 0;
    this.initialize(joints, links, drivingElements, crankLimits);

    while (
      Math.abs(this.crankAngle) <= 359 &&
      counter < 2 * this.branch &&
      steps < 362
    ) {
      steps += 1;
      if (
        this.setJointPositions(joints, links, drivingElements, this.crankAngle)
      ) {
        this.updateJointCurves(this.branch - 1);
        if (this.crankAngle == 359) {
          for (var i = 0; i < this.links.length; i++) this.links[i].reset();
          if (drivingElements.length == 1) {
            this.updateJointCurves(this.branch - 1);
          } else {
            var crankJoint = links[drivingElements[0]].getJoints(1);
            crankJoint.addCurvePoint(
              this.branch - 1,
              crankJoint.getAnimatedPoint()
            );
          }
        }
        this.crankAngle = this.crankAngle + this.angleIncrement;
      } else {
        for (var i = 0; i < this.links.length; i++) this.links[i].reset();
        if (counter < 2)
          this.crankLimits.crankLimitingAngles.push(
            (this.crankAngle - this.angleIncrement + 360) % 360
          );
        if (counter % 2 == 0)
          for (var i = 0; i < this.joints.length; i++)
            this.joints[i].reverseCurve(this.branch - 1);
        counter++;
        this.crankAngle -= this.crankAngle;
        this.angleIncrement *= -1;
      }
    }
    this.crankLimits.crankLimitingAngles.push(360);
  },

  initialize: function(joints, links, drivingElements, crankLimits) {
    this.reset();
    this.joints = joints;
    this.links = links;
    this.drivingElement = drivingElements[0];
    this.crankLimits = crankLimits;
    this.crankLimits.crankLimitingAngles = [0];

    //        var drivingJoint = (this.links[this.drivingElement].getJoints(0));
    //        var groundJoints = this.joints.filter(item=> item.isGround == true && item != drivingJoint);
    //        var theta1 = helper.getInclination(drivingJoint.getPoint(), groundJoints[0].getPoint());
    //        var phi = helper.toDegrees(this.links[this.drivingElement].getAngle() - theta1);
    //        this.branchAngle = -2 * phi;
  },

  setJointPositions: function(joints, links, drivingElements, crankAngle) {
    this.simulationResult = simulationStatus.inProgress;
    this.joints = joints;
    this.links = links;
    this.drivingElement = drivingElements[0];
    if (this.setInitialState(crankAngle, drivingElements)) {
      this.unKnownJoints = this.joints.filter(j => j.position == State.unKnown);
      if (this.unKnownJoints.length == 0) return true;
      if (this.snappyXOMode) {
        this.simulationResult = simulationStatus.inSolvable;
      } else {
        while (
          this.simulationResult != simulationStatus.inSolvable &&
          this.unKnownJoints.length > 0
        ) {
          this.simulationResult = simulationStatus.inSolvable;
          for (var i = 0; i < this.joints.length; i++) {
            var j = this.joints[i];

            if (j.position == State.Known || j.isConnected == false) continue;
            if (j.type == JointType.R) {
              // for R-R-R ternary links
              if (
                this.checkKnownJointOnLink(j, j.link1, this.knownJoint1) &&
                this.checkKnownJointOnLink(j, j.link2, this.knownJoint2)
              ) {
                var newPoint = this.getIntersectionOfCircles(
                  j,
                  this.knownJoint1[0],
                  this.knownJoint2[0]
                );
                this.setJointPoint(j, newPoint);
                //j.link1.updateLinkAnimationParameters();
                // j.link2.updateLinkAnimationParameters();
              } else if (j.isLinkedJoint) {
                var pj = j.getParentJoint();
                var newlink1;
                var newlink2;
                if (pj.getOtherLink(j.link1)) {
                  var newlink1 = j.link2;
                  var newlink2 = pj.getOtherLink(j.link1);
                } else if (pj.getOtherLink(j.link2)) {
                  var newlink1 = j.link1;
                  var newlink2 = pj.getOtherLink(j.link2);
                }
                if (newlink1 != undefined)
                  if (
                    this.checkKnownJointOnLink(j, newlink1, this.knownJoint1) &&
                    this.checkKnownJointOnLink(pj, newlink2, this.knownJoint2)
                  ) {
                    var newPoint = this.getIntersectionOfCircles(
                      j,
                      this.knownJoint1[0],
                      this.knownJoint2[0]
                    );
                    this.setJointPoint(j, newPoint);
                  }
              }
            }
            if (this.simulationResult == simulationStatus.invalidPositions)
              return false;
          }
          this.unKnownJoints = this.joints.filter(
            j => j.position == State.unKnown
          );
        }
      }
      if (
        this.simulationResult == simulationStatus.inSolvable &&
        this.unKnownJoints.length > 0
      ) {
        try {
          if (crankAngle == -1)
            solveByOptimisation.initialize(
              this,
              this.snappyXOMode,
              this.XOstep
            );
          solveByOptimisation.run(this);
        } catch (e) {
          return false;
        }
      }
      if (this.simulationResult == simulationStatus.invalidPositions)
        return false;
      return true;
    } else return false;
  },

  setInitialState: function(crankAngle, drivingElements) {
    for (var i = 0; i < this.joints.length; i++)
      this.joints[i].position = State.unKnown;
    this.joints
      .filter(j => j.isGround == true)
      .forEach(function(item) {
        item.setAnimatedPoint(item.getPoint());
      });

    var dRPM = this.links[this.drivingElement].getRPM();
    if (dRPM > 0) {
      this.links[this.drivingElement].setCrankAngle(
        helper.toRadians(crankAngle)
      );
      //the following part sets the angle for all other inputs if any

      var dRotation = this.links[this.drivingElement].getRotationDirection();
      for (var k = 1; k < drivingElements.length; k++) {
        var link = this.links[drivingElements[k]];
        var iRPM = link.getRPM();
        var iRotation = link.getRotationDirection();
        var relativeAngle = link.getRelativeAngleChange(null);
        this.links[drivingElements[k]].setCrankAngle(
          relativeAngle +
            dRotation *
              iRotation *
              ((iRPM / dRPM) * helper.toRadians(crankAngle))
        );
        //dRotation = iRotation; //this is set because the angle of link just depends on movement of the link attached to it.
      }
      return true;
    } else return false;
  },

  setJointPoint(joint, point) {
    if (
      isNaN(point.x) ||
      isNaN(point.y) ||
      !isFinite(point.x) ||
      !isFinite(point.y)
    )
      this.simulationResult = simulationStatus.invalidPositions;
    else {
      joint.setAnimatedPoint(point);
      //joint.addCurvePoint(this.branch, point);
      this.simulationResult = simulationStatus.inProgress;
    }
  },

  updateJointCurves(branch) {
    for (var i = 0; i < this.joints.length; i++)
      this.joints[i].addCurvePoint(branch, this.joints[i].getAnimatedPoint());
  },

  getIntersectionOfCircles: function(intersectionJoint, center1, center2) {
    //this function will return intersection point of two circles which ever is closest to the previous point of intersectionJoint;
    // please refer http://2000clicks.com/MathHelp/GeometryConicSectionCircleIntersection.aspx for proof
    var point1 = center1.getAnimatedPoint();
    var point2 = center2.getAnimatedPoint();
    var oldPoint = intersectionJoint.getAnimatedPoint();
    var link1;
    var link2;
    var r1 = 0;
    var r2 = 0;
    if ((link1 = center1.getCommonLink(intersectionJoint)))
      r1 = helper.getDistance(center1.getPoint(), intersectionJoint.getPoint());
    if ((link2 = center2.getCommonLink(intersectionJoint)))
      r2 = helper.getDistance(center2.getPoint(), intersectionJoint.getPoint());
    if (helper.closeToZero(r1)) return center1;
    if (helper.closeToZero(r2)) return center2;

    var dSquare = Math.pow(
      helper.getDistance(point1.x, point1.y, point2.x, point2.y),
      2
    );
    var ratio = (r1 * r1 - r2 * r2) / (2 * dSquare);
    var xBase = (point1.x + point2.x) / 2 + (point2.x - point1.x) * ratio;
    var yBase = (point1.y + point2.y) / 2 + (point2.y - point1.y) * ratio;
    var fourTimesKsquare =
      ((r1 + r2) * (r1 + r2) - dSquare) * (dSquare - (r1 - r2) * (r1 - r2)); //4K^2
    if (helper.closeToZero(fourTimesKsquare)) return new Point(xBase, yBase);
    if (fourTimesKsquare < 0) return new Point(NaN, NaN);

    var K = Math.sqrt(fourTimesKsquare) / 4;
    var xOffset = (2 * (point2.y - point1.y) * K) / dSquare;
    var yOffset = (2 * (point1.x - point2.x) * K) / dSquare;
    var xPos = xBase + xOffset;
    var yPos = yBase + yOffset;
    var xNeg = xBase - xOffset;
    var yNeg = yBase - yOffset;
    var distFromPos = helper.getDistance(xPos, yPos, oldPoint.x, oldPoint.y);
    var distFromNeg = helper.getDistance(xNeg, yNeg, oldPoint.x, oldPoint.y);
    if (distFromPos > distFromNeg) return new Point(xNeg, yNeg);
    return new Point(xPos, yPos);
  },

  checkKnownJointOnLink: function(unknownJoint, link, knownJoint) {
    //this function will check if there is any joint whose position is known on the link and if true then it will set that joint as knownJoint

    knownJoint[0] = link
      .getJoints()
      .filter(j => j != unknownJoint && j.position == State.Known)[0];
    return knownJoint[0] != null;
  },
  checkKnownDirectionOfLink: function(
    unknownJoint,
    link,
    knownJoint,
    excludeJoint = null
  ) {
    //this function will check direction of the link is known and if true then it will set a joint as knownJoint whose direction is known.
    knownJoint = null;
  },
  reset: function() {
    this.simulationResult = "";
    this.unKnownJoints = [];
    this.links = [];
    this.joints = [];
    this.crankLimits = {};
    this.drivingElement = 0;
    this.knownJoint1 = []; // will be used as out parameters while calling functions
    this.knownJoint2 = [];
    this.angleIncrement = this.defaultAngleIncrement;
    this.crankAngle = -1;
    this.branch = Branch.ONE;
  }
};

function loadXMLDoc(filename) {
  if (window.XMLHttpRequest) {
      xhttp = new XMLHttpRequest();
  } else // code for IE5 and IE6
  {
      xhttp = new ActiveXObject("Microsoft.XMLHTTP");
  }
  xhttp.open("GET", filename, false);
  xhttp.send();
  return xhttp.responseXML;
}

// from model.js
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
      var index = this.joints.findIndex(item=> item.getJointId()===joint.getJointId());
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

window.simulator =  simulator;
window.drawables = drawables;

var solveByOptimisation = {
  linkFunction: [],
  unKnownJoints: [],
  error: 0,
  xStar: [],

  initialize: function(simulator, snappyXOMode = false, XOstep = 1) {
    // console.log("-")
    if (snappyXOMode) {
      newtonRaphsonMethod.iterLimit = 3000;
    }
    this.reset(simulator.crankAngle);
    this.unKnownJoints = simulator.joints.filter(
      j =>
        j.position == State.unKnown &&
        j.isConnected == true &&
        j.isLinkedJoint == false
    );
    for (var c = 0; c < simulator.links.length; c++) {
      var l = simulator.links[c];
      for (var i = 0; i < l.joints.length - 1; i++)
        for (var j = i + 1; j < l.joints.length; j++) {
          var j1 = l.getJoints(i, true);
          var j2 = l.getJoints(j, true);
          if (j1.isConnected == false || j2.isConnected == false) continue;
          var j1varIndex = this.unKnownJoints.findIndex(
            item => item.getJointId() == j1.getJointId()
          );
          var j2varIndex = this.unKnownJoints.findIndex(
            item => item.getJointId() == j2.getJointId()
          );
          var j1Index = simulator.joints.findIndex(
            item => item.getJointId() == j1.getJointId()
          );
          var j2Index = simulator.joints.findIndex(
            item => item.getJointId() == j2.getJointId()
          );

          if (j1varIndex == -1 && j2varIndex == -1) continue; //as both joints are known, no function req.
          let linkLength = helper.getDistance(j1.getPoint(), j2.getPoint());
          // let info = c + " : " + linkLength  + " => "
          if (
            simulator.links[c].isLengthLocked &&
            simulator.links[c].lockedLength !== undefined
          ) {
            linkLength = simulator.links[c].lockedLength;
            console.log(linkLength, simulator.links[c].isSnappyXOLink);
          }
          if (snappyXOMode && simulator.links[c].isSnappyXOLink) {
            linkLength = Math.round(linkLength / XOstep) * XOstep;
            if (linkLength === 0) {
              linkLength = XOstep;
            }
            // info = info + linkLength
            // console.log(info)
          }
          this.linkFunction.push(
            new linkLengthFunctions(
              j1varIndex,
              j1Index,
              j2varIndex,
              j2Index,
              linkLength
            )
          );
        }
    }
  },
  run: function(simulator) {
    var xInit = helper.createZeroMatrix([2 * this.unKnownJoints.length]);
    for (var i = 0; i < simulator.joints.length; i++) {
      var j = simulator.joints[i];
      var point = j.getAnimatedPoint();
      if (j.position == State.unKnown) {
        var index = this.unKnownJoints.findIndex(
          item => item.getJointId() == j.getJointId()
        );
        xInit[2 * index] = point.x;
        xInit[2 * index + 1] = point.y;
      }
      for (var k = 0; k < this.linkFunction.length; k++) {
        this.linkFunction[k].setInitialPositions(i, point.x, point.y);
      }
    }

    this.xStar = newtonRaphsonMethod.run(xInit);
    if (this.xStar == false)
      simulator.simulationResult = simulationStatus.invalidPositions;
    else {
      for (var i = 0; i < this.unKnownJoints.length; i++) {
        simulator.setJointPoint(
          this.unKnownJoints[i],
          new Point(this.xStar[2 * i], this.xStar[2 * i + 1])
        );
      }
    }
  },
  calculate: function(xi) {
    var sum = 0;
    for (var i = 0; i < this.linkFunction.length; i++) {
      sum += this.linkFunction[i].calculate(xi);
    }
    return sum;
  },
  deri_wrt_xi: function(xi, i) {
    var sum = 0;
    for (var k = 0; k < this.linkFunction.length; k++) {
      sum += this.linkFunction[k].deri_wrt_xi(xi, i);
    }
    return sum;
  },
  second_deri_wrt_xi: function(xi, i, j) {
    var sum = 0;
    for (var k = 0; k < this.linkFunction.length; k++) {
      sum += this.linkFunction[k].second_deri_wrt_xi(xi, i, j);
    }
    return sum;
  },
  reset: function(crankAngle) {
    var resetDeltaF = false;
    this.linkFunction = [];
    this.unKnownJoints = [];
    this.error = 0;
    this.xStar = [];
    if (crankAngle == -1) resetDeltaF = true;
    newtonRaphsonMethod.reset(resetDeltaF);
  }
};
var newtonRaphsonMethod = {
  // https://en.wikipedia.org/wiki/Newton%27s_method_in_optimization
  alphaStar: 0,
  dk: [],
  fk: 0,
  gradF: [],
  xStar: [],
  fStar: 0,
  iterator: 0,
  xLast: null,
  fLast: 0,
  iterLimit: 300,

  run: function(xi) {
    this.reset(false);
    this.xStar = xi.slice();
    this.fStar = this.fk = solveByOptimisation.calculate(xi);
    while (this.notConverged(this.iterator, this.fk, xi)) {
      this.iterator++;
      this.gradF = helper.createZeroMatrix([xi.length]);
      //creating the gradient matrix
      for (var i = 0; i < this.gradF.length; i++)
        this.gradF[i] = solveByOptimisation.deri_wrt_xi(xi, i);
      // creating the Hessian matrix
      var Hessian = helper.createZeroMatrix([xi.length, xi.length]);
      for (var i = 0; i < xi.length; i++)
        for (var j = 0; j < xi.length; j++)
          Hessian[i][j] = Hessian[j][
            i
          ] = solveByOptimisation.second_deri_wrt_xi(xi, i, j);

      dk = math.multiply(-1, math.multiply(math.inv(Hessian), this.gradF));
      if (isNaN(math.sum(dk))) dk = math.multiply(-1, this.gradF);
      var step = math.norm(dk);
      if (helper.closeToZero(step)) continue;
      dk = math.divide(dk, step);
      this.alphaStar = this.findAlphaStar(xi, dk, step);

      xi = math.add(xi, math.multiply(this.alphaStar, dk));
      this.fk = solveByOptimisation.calculate(xi);
      if (this.fk < this.fStar) {
        this.fStar = this.fk;
        this.xStar = xi.slice();
      }
    }
    if (this.bestFConvergence(this.fk) || this.iterator == 1)
      //iterator == 1 to account for crankAngle = 0 condition
      return this.xStar;
    else return false;
  },
  notConverged: function(iteration = -1, fBest = NaN, xBest = null) {
    // will return true if notConverged. So the while loop in run() keeps executing.
    if (iteration == 0) return true; // first step
    return !(
      this.bestFConvergence(fBest) ||
      this.deltaFConvergence(fBest, xBest) ||
      iteration >= this.iterLimit
    );
  },
  bestFConvergence: function(fBest = NaN) {
    if (isNaN(fBest))
      console.log("Error: bestFConvergence: fBest cannot be NaN");
    return fBest <= constants.EPSILON;
  },
  deltaFConvergence: function(fBest = NaN, xBest = null) {
    if (isNaN(fBest))
      console.log("Error: deltaFConvergence: fBest cannot be NaN");
    if (xBest == null)
      console.log("Error: deltaFConvergence: xBest cannot be Null");
    if (
      this.xLast == null ||
      math.sum(math.abs(math.add(xBest, math.multiply(-1, this.xLast)))) > 0
    ) {
      var result = Math.abs(fBest - this.fLast) <= constants.EPSILON;
      this.xLast = xBest;
      this.fLast = fBest;
      return result;
    }
    return false;
  },

  findAlphaStar: function(x, dir, stepSize) {
    {
      var golden62 = 0.61803398874989484820458683436564;
      var golden38 = 1 - golden62;
      var alphaLow = 0.0;
      var alphaHigh = stepSize;
      var alpha1 = golden38 * alphaHigh;
      var alpha2 = golden62 * alphaHigh;

      var fLow = this.calcF(x, alphaLow, dir);
      var fHigh = this.calcF(x, alphaHigh, dir);
      var f2 = this.calcF(x, alpha2, dir);
      var f1 = NaN;

      if (fHigh < f2 && fHigh < fLow) return alphaHigh;

      f1 = this.calcF(x, alpha1, dir);

      var kMax = Math.ceil(
        -2.078086921235 *
          (Math.log(1e-13, Math.E) - Math.log(alphaHigh, Math.E))
      );

      for (var k = 0; k <= kMax; k++) {
        if (f1 < f2) {
          alphaHigh = alpha2;
          alpha2 = alpha1;
          f2 = f1;
          alpha1 = golden38 * (alphaHigh - alphaLow) + alphaLow;
          f1 = this.calcF(x, alpha1, dir);
        } else {
          alphaLow = alpha1;
          alpha1 = alpha2;
          f1 = f2;
          alpha2 = golden62 * (alphaHigh - alphaLow) + alphaLow;
          f2 = this.calcF(x, alpha2, dir);
        }
      }
      if (f1 < f2) return alpha1;
      return alpha2;
    }
  },
  calcF: function(start, alpha, dir) {
    var point = math.add(start, math.multiply(alpha, dir));
    return solveByOptimisation.calculate(point);
  },
  reset: function(resetDeltaF) {
    this.alphaStar = 0;
    this.dk = [];
    this.fk = 0;
    this.gradF = [];
    this.xStar = [];
    this.fStar = 0;
    this.iterator = 0;
    if (resetDeltaF) {
      this.xLast = null;
      this.fLast = 0;
    }
  }
};

// from canvascore.js
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


var getNewId = exports.getNewId = function getNewId(state, entity) {
  return state.get(entity).size === 0 ? 0 : state.get(entity).keySeq().last() + 1;
};

var getNewJoint = exports.getNewJoint = function getNewJoint(state) {
  var action = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var isGround = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  var jointType = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "R";
  var plotCurve = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : true;
  var point = arguments[5];

  if (point !== undefined) {
    action.xDragging = point.x;
    action.yDragging = point.y;
    action.x_ = point.x_;
    action.y_ = point.y_;
  } else {
    var mat = getInverseTransformationMatrix(state); //Inverse means, C->G, GCf_matrix.
    // coordinates in Canvas CS (with Y up)
    var canvasX = (0, _mathjs.matrix)([action.xDragging, -action.yDragging, 1]);
    // coordinates in Global CS
    var GCS_X = (0, _mathjs.multiply)(mat, canvasX);
    action.x_ = GCS_X.get([0]);
    action.y_ = GCS_X.get([1]);
  }
  // x_, y_ store the coordinates w.r.t global coordinate system
  var newJoint = (0, _immutable.Map)({
    x: action.xDragging,
    y: action.yDragging,
    x_: action.x_,
    y_: action.y_,
    links: (0, _immutable.Set)([]),
    curve: (0, _immutable.List)([]),
    snapping: true,
    isGround: isGround,
    jointType: jointType,
    plotCurve: plotCurve
  });
  if (isGround) {
    newJoint = newJoint.update("links", function (links) {
      return links.add("groundLink");
    });
  }
  return { id: getNewId(state, "joints"), joint: newJoint };
};

var getInclination = exports.getInclination = function getInclination(point1, point2) {
  var gcs = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  var degree = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

  if (gcs) {
    var ang = Math.atan2(point2.y_ - point1.y_, point2.x_ - point1.x_);
    if (degree) ang = ang * 180 / Math.PI;
    return ang;
  }

  return Math.atan2(point2.y - point1.y, point2.x - point1.x);
};

var getMidPoint = exports.getMidPoint = function getMidPoint(point1, point2) {
  var midpoint = {};
  midpoint.x = (point1.x + point2.x) / 2;
  midpoint.y = (point1.y + point2.y) / 2;
  midpoint.x_ = (point1.x_ + point2.x_) / 2;
  midpoint.y_ = (point1.y_ + point2.y_) / 2;
  return midpoint;
};

var getDistance = exports.getDistance = function getDistance(x1, y1, x2, y2) {
  var gcs = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;

  if (typeof x2 == "undefined" && typeof y2 == "undefined") {
    if (gcs) return Math.sqrt(Math.pow(x1.x_ - y1.x_, 2) + Math.pow(x1.y_ - y1.y_, 2));
    //incase Point object is passed
    return Math.sqrt(Math.pow(x1.x - y1.x, 2) + Math.pow(x1.y - y1.y, 2));
  }
  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
};

var getSignedDistance = exports.getSignedDistance = function getSignedDistance(pt1, pt2) {
  var gcs = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

  if (gcs) return { dist: getDistance(pt1, pt2, undefined, undefined, true), sign: Math.sign((0, _mathjs.cross)([pt1.x_, pt1.y_, 0], [pt2.x_, pt2.y_, 0])[2]) };
  //incase Point object is passed
  return { dist: getDistance(pt1, pt2), sign: Math.sign((0, _mathjs.cross)([pt1.x, pt1.y, 0], [pt2.x, pt2.y, 0])[2]) };
};

var getEndPoint = exports.getEndPoint = function getEndPoint(startPoint, length, angle) {
  var gcs = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

  if (!gcs) {
    angle = parseFloat(angle);
    length = parseFloat(length);
    return {
      x: parseFloat(startPoint.x) + length * Math.cos(angle),
      y: parseFloat(startPoint.y) + length * Math.sin(angle)
    };
  } else {
    angle = parseFloat(angle);
    length = parseFloat(length);
    return {
      x_: parseFloat(startPoint.x_) + length * Math.cos(angle),
      y_: parseFloat(startPoint.y_) + length * Math.sin(angle)
    };
  }
};

var updateJointDS = function updateJointDS(canvasState, jointIdSet, jointId) {
  // update state and jointDS for mapping state joints and joints in legacy code
  // hidden joints the joints which exist in temporary variable jointsJs but do not exist in immutable canvasState
  // these hidden joints are added to support simulation of inlineJoints
  if (!jointIdSet.jointMap.has(jointId)) {
    // first occerence of joint
    var isGround = false;
    if (canvasState.hasIn(["joints", jointId])) {
      isGround = canvasState.getIn(["joints", jointId, "isGround"]);
    }
    if (canvasState.hasIn(["joints", jointId])) {
      // do not add hidden joints to state
      canvasState = canvasState.setIn(["simJointMap", jointId], jointIdSet.numJoints);
    }
    jointIdSet.jointMap.set(jointId, 0);
    if (isGround) {
      jointIdSet.jointMap.set(jointId, 1);
    }

    jointIdSet.numJoints += 1;
  } else if (jointIdSet.jointMap.get(jointId) == 0) {
    jointIdSet.jointMap.set(jointId, 1);
  } else {
    jointIdSet.numJoints += 1;
  }

  return canvasState;
};

var updateLinkDS = function updateLinkDS(linkIdSet, linkId) {
  if (!linkIdSet.linkMap.has(linkId)) {
    linkIdSet.linkMap.set(linkId, linkIdSet.numLinks);
  }
  linkIdSet.numLinks++;
};

var isDrivingLink = function isDrivingLink(state, linkId) {
  var bool = false;
  state.getIn(["info", "drivingJoints"]).forEach(function (drivingJointId) {
    if (state.getIn(["joints", drivingJointId, "links"]).has(linkId)) bool = true;
  });
  return bool;
};

var getDrivingStatus = exports.getDrivingStatus = function getDrivingStatus(state) {
  // return is drivingJoints are valid, and if PR is one of the driving link
  var isSimValid = true;
  var bool = false;
  state.getIn(["info", "drivingJoints"]).forEach(function (drivingJointId) {
    if (!state.hasIn(["joints", drivingJointId])) {
      isSimValid = false;
      state = recursivelyRemoveDrivingJoints(state, drivingJointId);
      return;
    }
    state.getIn(["joints", drivingJointId, "links"]).forEach(function (linkId) {
      if (state.getIn(["links", linkId, "linkType"]) === "PR") bool = true;
    });
  });
  return { state: state, isSimValid: isSimValid, isPRDriving: bool };
};

var recursivelyAddDrivingLinkSet = function recursivelyAddDrivingLinkSet(state, jointId, linkSet, explored) {
  if (!explored.has(jointId)) {
    var addedForThisJoint = false;
    state.getIn(["joints", jointId, "links"]).forEach(function (linkId) {
      if (linkId === "groundLink") return;
      if (!linkSet.has(linkId) && !addedForThisJoint) {
        linkSet = linkSet.add(linkId);
        addedForThisJoint = true;
        explored.add(jointId);
      }
    });

    var childJointId = state.getIn(["info", "dependencyGraph", jointId, "child"]);
    if (childJointId !== undefined) {
      linkSet = recursivelyAddDrivingLinkSet(state, childJointId, linkSet, explored);
    }
  }
  return linkSet;
};

var getDrivingLinks = exports.getDrivingLinks = function getDrivingLinks(state) {
  // returns an array of driving links
  var linkSet = (0, _immutable.OrderedSet)([]);
  var explored = new Set();
  state.getIn(["info", "drivingJoints"]).forEach(function (drivingJointId) {
    if (!state.hasIn(["info", "dependencyGraph", drivingJointId, "parent"])) {
      linkSet = recursivelyAddDrivingLinkSet(state, drivingJointId, linkSet, explored);
    }
  });
  linkSet = linkSet.subtract(["groundLink"]);
  return linkSet;
};

var addRRLinkToLinkageInfo = function addRRLinkToLinkageInfo(canvasState, jointIdSet, linkIdSet, linkageInfo, jointsJs, link, linkId) {
  var isSnappyXOLink = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : false;

  var linkInfo = { type: "RR" };
  linkInfo.isSnappyXOLink = isSnappyXOLink;
  window.simulator.snappyXOMode = window.simulator.snappyXOMode || link.get("lengthLock") && link.get("length") !== undefined ? true : false;
  linkInfo.isLengthLocked = link.get("lengthLock");
  linkInfo.lockedLength = link.get("length");
  var jointId1 = void 0,
      jointId2 = void 0,
      jointId3 = void 0,
      jointId4 = void 0,
      jointId5 = void 0;

  // whichever joint is Ground should be x, y and other one x1, y1
  // else doesn't matter
  if (jointsJs[link.get("joint1").get("id")].isGround) {
    jointId1 = link.get("joint1").get("id");
    jointId2 = link.get("joint2").get("id");
    if (link.has("joint3")) jointId3 = link.get("joint3").get("id");
    linkInfo.isGround = true;
  } else if (jointsJs[link.get("joint2").get("id")].isGround) {
    jointId1 = link.get("joint2").get("id");
    jointId2 = link.get("joint1").get("id");
    if (link.has("joint3")) jointId3 = link.get("joint3").get("id");
    linkInfo.isGround = true;
  } else {
    linkInfo.isGround = false;
    if (link.has("joint3")) {
      jointId1 = link.get("joint3").get("id");
      if (jointsJs[link.get("joint3").get("id")].isGround) linkInfo.isGround = true;

      jointId2 = link.get("joint1").get("id");
      jointId3 = link.get("joint2").get("id");
    } else {
      jointId1 = link.get("joint1").get("id");
      jointId2 = link.get("joint2").get("id");
    }
  }
  if (canvasState.getIn(["info", "drivingJoints"]).has(jointId2) && !canvasState.getIn(["info", "drivingJoints"]).has(jointId1)) {
    // in case of multiDOFs links should have their actuating joint in x, y position. (p1 position)
    var jointId1_ = jointId2;
    jointId2 = jointId1;
    jointId1 = jointId1_;
  }
  if (canvasState.getIn(["info", "drivingJoints"]).has(jointId3) && !canvasState.getIn(["info", "drivingJoints"]).has(jointId1)) {
    // in case of multiDOFs links should have their actuating joint in x, y position. (p1 position)
    var _jointId1_ = jointId3;
    jointId3 = jointId1;
    jointId1 = _jointId1_;
  }
  if (jointsJs[jointId1].isGround && isSnappyXOLink) {
    jointsJs[jointId1].x_ = Math.round(jointsJs[jointId1].x_ / (_constants.constants.XOstep / 2)) * (_constants.constants.XOstep / 2);
    jointsJs[jointId1].y_ = Math.round(jointsJs[jointId1].y_ / (_constants.constants.XOstep / 2)) * (_constants.constants.XOstep / 2);
  }

  if (isDrivingLink(canvasState, linkId) && link.get("lengthLock") && link.get("length") !== undefined) {
    // if link is actuated, manually discretizing the length
    var linkLength = link.get("length");
    var temp = getEndPoint({ x: jointsJs[jointId1].x_, y: jointsJs[jointId1].y_ }, linkLength, getInclination(jointsJs[jointId1], jointsJs[jointId2], true));
    jointsJs[jointId2] = { x_: temp.x, y_: temp.y };
  }

  if (isDrivingLink(canvasState, linkId) && isSnappyXOLink) {
    // if link is actuated, manually discretizing the length
    var _linkLength = getDistance(jointsJs[jointId1].x_, jointsJs[jointId1].y_, jointsJs[jointId2].x_, jointsJs[jointId2].y_);
    _linkLength = Math.round(_linkLength / (_constants.constants.XOstep / 2)) * (_constants.constants.XOstep / 2);
    if (_linkLength === 0) _linkLength = _constants.constants.XOstep / 2;
    var _temp = getEndPoint({ x: jointsJs[jointId1].x_, y: jointsJs[jointId1].y_ }, _linkLength, getInclination(jointsJs[jointId1], jointsJs[jointId2], true));
    jointsJs[jointId2] = { x_: _temp.x, y_: _temp.y };
  }

  linkInfo.x = jointsJs[jointId1].x_;
  linkInfo.y = jointsJs[jointId1].y_;
  linkInfo.x1 = jointsJs[jointId2].x_;
  linkInfo.y1 = jointsJs[jointId2].y_;
  linkInfo.p1 = jointId1;
  linkInfo.p2 = jointId2;

  canvasState = updateJointDS(canvasState, jointIdSet, jointId1);

  canvasState = updateJointDS(canvasState, jointIdSet, jointId2);

  linkInfo.plotCurves = "false,false";

  if (jointId3 !== undefined) {
    linkInfo.x2 = jointsJs[jointId3].x_;
    linkInfo.y2 = jointsJs[jointId3].y_;
    linkInfo.p3 = jointId3;
    canvasState = updateJointDS(canvasState, jointIdSet, jointId3);
    linkInfo.plotCurves = "false,false,false";
    linkInfo.class = "Ternary Link";
  }
  linkInfo.rpm = link.get("rpm") === undefined ? "6" : link.get("rpm");
  linkInfo.rotationDirection = link.get("direction") === undefined ? "1" : link.get("direction");

  updateLinkDS(linkIdSet, linkId);
  linkageInfo.data.push(linkInfo);
  return canvasState;
};

var addRPLinkToLinkageInfo = function addRPLinkToLinkageInfo(canvasState, jointIdSet, linkIdSet, linkageInfo, jointsJs, link, linkId) {
  var isSnappyXOLink = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : false;
  var drawBothLinks = arguments.length > 8 && arguments[8] !== undefined ? arguments[8] : true;

  var linkInfo = { type: "RR" };
  linkInfo.isSnappyXOLink = isSnappyXOLink;
  var jointId1 = void 0,
      jointId2 = void 0,
      jointId3 = void 0,
      jointId4 = void 0,
      jointId5 = void 0;
  // in RP we push two links
  // first link
  var isBinary = true;
  var isTernary = false;
  jointId1 = link.get("joint1").get("id");
  if (link.has("joint2")) {
    jointId2 = link.get("joint2").get("id");
    isBinary = false;
  }
  if (link.has("joint5")) {
    jointId5 = link.get("joint5").get("id");
    isTernary = true;
  }
  jointId3 = link.get("joint3").get("id");
  jointId4 = link.get("joint4").get("id");
  if (jointsJs[jointId1].isGround) {
    linkInfo.isGround = true;
  } else {
    linkInfo.isGround = false;
    if (canvasState.getIn(["info", "drivingJoints"]).has(jointId2) && !canvasState.getIn(["info", "drivingJoints"]).has(jointId1)) {
      // in case of multiDOFs links should have their actuating joint in x, y position. (p1 position)
      var jointId1_ = jointId2;
      jointId2 = jointId1;
      jointId1 = jointId1_;
    }
  }

  linkInfo.x = jointsJs[jointId1].x_;
  linkInfo.y = jointsJs[jointId1].y_;
  linkInfo.p1 = jointId1;
  if (!isBinary) {
    linkInfo.class = "Ternary Link";
    linkInfo.x1 = jointsJs[jointId2].x_;
    linkInfo.y1 = jointsJs[jointId2].y_;
    linkInfo.x2 = jointsJs[jointId3].x_;
    linkInfo.y2 = jointsJs[jointId3].y_;
    linkInfo.p2 = jointId2;
    linkInfo.p3 = jointId3;
    linkInfo.plotCurves = "false,false,false";
  } else {
    linkInfo.x1 = jointsJs[jointId3].x_;
    linkInfo.y1 = jointsJs[jointId3].y_;
    linkInfo.p2 = jointId3;
    linkInfo.plotCurves = "false,false";
  }
  linkInfo.rpm = link.get("rpm") === undefined ? "6" : link.get("rpm");
  linkInfo.rotationDirection = link.get("direction") === undefined ? "1" : link.get("direction");

  if (drawBothLinks) {
    canvasState = updateJointDS(canvasState, jointIdSet, jointId1);
    if (!isBinary) {
      canvasState = updateJointDS(canvasState, jointIdSet, jointId2);
    }
    canvasState = updateJointDS(canvasState, jointIdSet, jointId3);
    updateLinkDS(linkIdSet, linkId);
    linkageInfo.data.push(linkInfo);
  } else {
    canvasState = updateJointDS(canvasState, jointIdSet, jointId3);
  }

  var linkInfo2 = { type: "RR" };
  linkInfo2.isSnappyXOLink = isSnappyXOLink;
  linkInfo2.isGround = false;
  linkInfo2.x = jointsJs[jointId3].x_;
  linkInfo2.y = jointsJs[jointId3].y_;
  linkInfo2.p1 = jointId3;
  linkInfo2.x1 = jointsJs[jointId4].x_;
  linkInfo2.y1 = jointsJs[jointId4].y_;
  linkInfo2.p2 = jointId4;

  canvasState = updateJointDS(canvasState, jointIdSet, jointId4);

  linkInfo2.plotCurves = "false,false";

  if (isTernary) {
    canvasState = updateJointDS(canvasState, jointIdSet, jointId5);
    linkInfo2.x2 = jointsJs[jointId5].x_;
    linkInfo2.y2 = jointsJs[jointId5].y_;
    linkInfo2.p3 = jointId5;
    linkInfo2.plotCurves = "false,false,false";
    linkInfo2.class = "Ternary Link";
  }

  linkInfo2.rpm = link.get("rpm") === undefined ? "6" : link.get("rpm");
  linkInfo2.rotationDirection = link.get("direction") === undefined ? "1" : link.get("direction");

  updateLinkDS(linkIdSet, linkId);
  linkageInfo.data.push(linkInfo2);
  return canvasState;
};

var addPRLinkToLinkageInfo = function addPRLinkToLinkageInfo(canvasState, jointIdSet, linkIdSet, linkageInfo, jointsJs, link, linkId) {
  var isSnappyXOLink = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : false;

  var linkInfo = { type: "RR" };
  var jointId1 = void 0,
      jointId2 = void 0,
      jointId3 = void 0,
      jointId4 = void 0,
      jointId5 = void 0;
  // joint3 is always the ground joint
  {
    jointId1 = link.get("joint3").get("id");
    jointId2 = link.get("joint1").get("id");
    jointId3 = link.get("joint2").get("id");

    linkInfo.isGround = true;
    linkInfo.x = jointsJs[jointId1].x_;
    linkInfo.y = jointsJs[jointId1].y_;
    linkInfo.x1 = jointsJs[jointId2].x_;
    linkInfo.y1 = jointsJs[jointId2].y_;
    linkInfo.p1 = jointId1;
    linkInfo.p2 = jointId2;
    linkInfo.class = "Binary Link";
    linkInfo.plotCurves = "false,false";
    linkInfo.rpm = "0.1"; //link.get("rpm") === undefined ? "6" : link.get("rpm")
    linkInfo.rotationDirection = link.get("direction") === undefined ? "1" : link.get("direction");
    linkInfo.snappyXOImmune = true;

    canvasState = updateJointDS(canvasState, jointIdSet, jointId1);

    canvasState = updateJointDS(canvasState, jointIdSet, jointId2);

    updateLinkDS(linkIdSet, linkId);
    linkageInfo.data.push(linkInfo);
  }

  {
    var linkInfo2 = { type: "RR" };

    linkInfo2.isGround = true;
    linkInfo2.x = jointsJs[jointId1].x_;
    linkInfo2.y = jointsJs[jointId1].y_;
    linkInfo2.x1 = jointsJs[jointId3].x_;
    linkInfo2.y1 = jointsJs[jointId3].y_;
    linkInfo2.p1 = jointId1;
    linkInfo2.p2 = jointId3;
    linkInfo2.class = "Binary Link";
    linkInfo2.plotCurves = "false,false";
    linkInfo2.rpm = "0.1"; //link.get("rpm") === undefined ? "1" : link.get("rpm")
    linkInfo2.rotationDirection = link.get("direction") === undefined ? "1" : link.get("direction");
    linkInfo2.snappyXOImmune = true;

    canvasState = updateJointDS(canvasState, jointIdSet, jointId1);

    canvasState = updateJointDS(canvasState, jointIdSet, jointId3);

    updateLinkDS(linkIdSet, linkId);
    linkageInfo.data.push(linkInfo2);
  }

  {
    var linkInfo3 = { type: "RR" };

    linkInfo3.isSnappyXOLink = isSnappyXOLink;
    window.simulator.snappyXOMode = window.simulator.snappyXOMode || link.get("lengthLock") && link.get("length") !== undefined ? true : false;
    linkInfo3.isGround = true;
    linkInfo3.isLengthLocked = link.get("lengthLock");
    linkInfo3.lockedLength = link.get("length");
    linkInfo3.x = jointsJs[jointId2].x_;
    linkInfo3.y = jointsJs[jointId2].y_;
    linkInfo3.x1 = jointsJs[jointId3].x_;
    linkInfo3.y1 = jointsJs[jointId3].y_;
    linkInfo3.class = "Binary Link";
    linkInfo3.plotCurves = "false,false";
    linkInfo3.rpm = "0.1"; //link.get("rpm") === undefined ? "1" : link.get("rpm")
    linkInfo3.rotationDirection = link.get("direction") === undefined ? "1" : link.get("direction");
    linkInfo3.snappyXOImmune = true;

    canvasState = updateJointDS(canvasState, jointIdSet, jointId2);

    canvasState = updateJointDS(canvasState, jointIdSet, jointId3);

    updateLinkDS(linkIdSet, linkId);
    linkageInfo.data.push(linkInfo3);
    return canvasState;
  }
};

var getSimulationInfo = exports.getSimulationInfo = function getSimulationInfo(canvasState) {
  // creating linkageInfo json object which is read by legacy code
  // it should also update the state with information needed for linking the simulation info back
  var linkageInfo = {
    data: [],
    info: canvasState.get("info").toJS()
  };
  linkageInfo.info.otherInputs = [];

  // I may need to do something from simulator.
  window.simulator.snappyXOMode = canvasState.get("viewMode") === _constants.constants.VIEW_MODE.SNAPPY_XO;
  window.simulator.XOstep = _constants.constants.XOstep;
  // below line of code changes the angle increment of driving link when pr dyad is driving, which is a very long rr dyad
  // if same angular velocity is kept, linear velocity of slider gets very high, thus reducing it by doing this
  var op = getDrivingStatus(canvasState);
  if (!op.isSimValid) {
    // simulation is not valid
    return canvasState;
  }

  if (op.isPRDriving && canvasState.getIn(["info", "drivingJoints"]).size === 1) {
    window.simulator.defaultAngleIncrement = 1 / 200.0;
  } else {
    window.simulator.defaultAngleIncrement = 1.0;
  }

  var jointsJs = canvasState.get("joints").toJS();

  //if(canvasState.get("viewMode")===constants.VIEW_MODE.SNAPPY_XO){
  //  canvasState.get("links").forEach((link, linkId, iter) => {
  //    if (link.get("linkType") === "PR") {
  //          let jointId1 = link.get("joint3").get("id");
  //          let jointId2 = link.get("joint1").get("id");
  //          let jointId3 = link.get("joint2").get("id");
  //          setSnappyXOPivotsForPR(jointsJs, jointId2, jointId3, jointId1, canvasState)
  //     }
  //  })
  //}

  canvasState = canvasState.update("simJointMap", function (simJointMap) {
    return simJointMap.clear();
  });

  var jointIdSet = {
    numJoints: 0,
    jointMap: new Map()
  };
  //to keep track of which link is hidden, which link is real
  var linkIdSet = {
    numLinks: 0,
    linkMap: new Map()

    // add links corresponding to inlineJoints
    // for each unexplored inlineJoints,
    //      skip if inlineJoints is not connected to a regular joint (regJ)
    //      1. siblings of the inlineJoint => regJ.inlineJointSet
    //      2. add all the siblings to explored set, (siblings include current inline joint as well)
    //      3. for each inlineJoint in siblings, add two link links
    //        2.1 use connected regular joint (regJ) as the joint to update jointDS
    //        2.2 link1 => inlineJoint.joint1 <-> regJ
    //        2.2 link2 => inlineJoint.joint2 <-> regJ
  };var exploredInlineJointIds = new Set();
  var exploredLinks = new Map();
  var hiddenJointId = canvasState.get("joints").keySeq().last();
  // for each 'unique' inlineJoint, a hidden joint is created, which connects inlineJoint and joint1 to form a non-skew triangle
  var hJointId = void 0;
  var hJointId2 = void 0;
  if (canvasState.has("inlineJoints")) {
    canvasState.get("inlineJoints").forEach(function (inlineJoint, inlineJointId) {
      if (!exploredInlineJointIds.has(inlineJointId)) {
        var regJId = canvasState.getIn(["inlineJoints", inlineJointId, "connectedJointId"]);
        var j1 = canvasState.getIn(["links", inlineJoint.get("linkId"), inlineJoint.get("joint1"), "id"]);
        var j2 = canvasState.getIn(["links", inlineJoint.get("linkId"), inlineJoint.get("joint2"), "id"]);
        var j3 = canvasState.getIn(["links", inlineJoint.get("linkId"), inlineJoint.get("joint3"), "id"]);
        var j4 = canvasState.getIn(["links", inlineJoint.get("linkId"), inlineJoint.get("joint4"), "id"]);
        var j5 = canvasState.getIn(["links", inlineJoint.get("linkId"), inlineJoint.get("joint5"), "id"]);
        var RPCoupler = canvasState.getIn(["inlineJoints", inlineJointId, "RPCoupler"]);
        var linkType = canvasState.getIn(["links", inlineJoint.get("linkId"), "linkType"]);
        if (regJId !== null) {
          var inlineJointSet = canvasState.getIn(["joints", regJId, "inlineJointSet"]);
          if (inlineJointSet !== undefined && inlineJointSet.has(inlineJointId) && !canvasState.getIn(["joints", regJId, "links"]).has(inlineJoint.get("linkId"))) {
            inlineJointSet.forEach(function (sibling) {
              exploredInlineJointIds.add(sibling);
            });
            var link = void 0;
            if (!exploredLinks.has(inlineJoint.get("linkId"))) {
              hiddenJointId = hiddenJointId + 1;
              hJointId = hiddenJointId;
              hJointId2 = null;
              var angle = void 0;
              var point = void 0;
              var angle2 = void 0;
              var point2 = void 0;
              var dist2 = void 0;
              var temp2 = void 0;
              var dist = void 0;
              var temp = void 0;
              if (canvasState.getIn(["links", inlineJoint.get("linkId"), "linkType"]) === _constants.constants.LINK_TYPE.RR) {
                dist = getDistance(jointsJs[j1], jointsJs[j2], undefined, undefined, true);
                angle = getInclination(jointsJs[j1], jointsJs[j2], true) - Math.PI / 2;
                point = getEndPoint(jointsJs[j1], dist, angle, true);
              } else if (canvasState.getIn(["links", inlineJoint.get("linkId"), "linkType"]) === _constants.constants.LINK_TYPE.RP) {
                if (j2 !== undefined) {
                  dist = getDistance(jointsJs[j1], jointsJs[j2], undefined, undefined, true);
                  angle = getInclination(jointsJs[j1], jointsJs[j2], true) - Math.PI / 4;
                  point = getEndPoint(jointsJs[j1], dist * 2, angle, true);
                  hJointId2 = hJointId + 1;
                  hiddenJointId = hiddenJointId + 1;
                } else {
                  hJointId2 = hJointId;
                  hJointId = null;
                }
                dist2 = getDistance(jointsJs[j3], jointsJs[j4], undefined, undefined, true);
                angle2 = getInclination(jointsJs[j3], jointsJs[j4], true) - Math.PI / 2;
                point2 = getEndPoint(jointsJs[j3], dist2, angle2, true);
                temp2 = getNewJoint(canvasState, {}, false, "R", true, point2);
              } else {
                dist = getDistance(jointsJs[j1], jointsJs[j2], undefined, undefined, true);
                angle = getInclination(jointsJs[j1], jointsJs[j2], true) - Math.PI / 4;
                point = getEndPoint(jointsJs[j1], dist * 2, angle, true);
              }
              exploredLinks.set(inlineJoint.get("linkId"), { h1: hJointId, h2: hJointId2 });
              if (hJointId !== null) {
                temp = getNewJoint(canvasState, {}, false, "R", true, point);
                jointsJs[hJointId] = temp.joint.toJS();
              }
              if (hJointId2 !== null) {
                // in this case temp2 will be defined
                jointsJs[hJointId2] = temp2.joint.toJS();
              }
              // adding a link between joint1 and joint2
              link = (0, _immutable.Map)({
                joint1: (0, _immutable.Map)({ id: j1 }),
                joint2: (0, _immutable.Map)({ id: j2 }),
                linkType: "RR",
                linkClass: "binary", // can be binary or ternary but by default ternary
                linkColor: _constants.constants.LINK_COLOR,
                hideLink: false
              });
              if (j2 !== undefined) {
                canvasState = addRRLinkToLinkageInfo(canvasState, jointIdSet, linkIdSet, linkageInfo, jointsJs, link, inlineJoint.get("linkId"), canvasState.get("viewMode") === _constants.constants.VIEW_MODE.SNAPPY_XO);
              }
              if (j3 !== undefined) {
                // adding a link between joint1 and joint3
                link = link.setIn(["joint1", "id"], j1);
                link = link.setIn(["joint2", "id"], j3);
                canvasState = addRRLinkToLinkageInfo(canvasState, jointIdSet, linkIdSet, linkageInfo, jointsJs, link, inlineJoint.get("linkId"), canvasState.get("viewMode") === _constants.constants.VIEW_MODE.SNAPPY_XO && linkType === _constants.constants.LINK_TYPE.RR);

                if (hJointId !== null) {
                  // adding a link between joint3 and hiddenJointId
                  link = link.setIn(["joint1", "id"], j3);
                  link = link.setIn(["joint2", "id"], hJointId);
                  canvasState = addRRLinkToLinkageInfo(canvasState, jointIdSet, linkIdSet, linkageInfo, jointsJs, link, inlineJoint.get("linkId"));
                }
              }

              if (hJointId !== null) {
                // adding a link between joint1 and hidden joint
                link = link.setIn(["joint1", "id"], j1);
                link = link.setIn(["joint2", "id"], hJointId);
                canvasState = addRRLinkToLinkageInfo(canvasState, jointIdSet, linkIdSet, linkageInfo, jointsJs, link, inlineJoint.get("linkId"));
              }

              if (j2 !== undefined) {
                // adding a link between joint2 and hidden joint
                link = link.setIn(["joint1", "id"], j2);
                link = link.setIn(["joint2", "id"], hJointId);
                canvasState = addRRLinkToLinkageInfo(canvasState, jointIdSet, linkIdSet, linkageInfo, jointsJs, link, inlineJoint.get("linkId"));
              }

              if (j4 !== undefined) {
                // if j4 exists, it is given that j3 should exists
                if (j3 == undefined || hJointId2 == null) {
                  throw "j3 is undefined or hJointId2 is null or both, something is wrong";
                }
                // adding a link between joint3 and joint4
                link = link.setIn(["joint1", "id"], j3);
                link = link.setIn(["joint2", "id"], j4);
                canvasState = addRRLinkToLinkageInfo(canvasState, jointIdSet, linkIdSet, linkageInfo, jointsJs, link, inlineJoint.get("linkId"));
                if (j5 !== undefined) {
                  // adding a link between joint3 and joint5
                  link = link.setIn(["joint1", "id"], j3);
                  link = link.setIn(["joint2", "id"], j5);
                  canvasState = addRRLinkToLinkageInfo(canvasState, jointIdSet, linkIdSet, linkageInfo, jointsJs, link, inlineJoint.get("linkId"));
                  // adding a link between joint5 and hJointId2
                  link = link.setIn(["joint1", "id"], j5);
                  link = link.setIn(["joint2", "id"], hJointId2);
                  canvasState = addRRLinkToLinkageInfo(canvasState, jointIdSet, linkIdSet, linkageInfo, jointsJs, link, inlineJoint.get("linkId"));
                }
                // adding a link between joint3 and hJointId2
                link = link.setIn(["joint1", "id"], j3);
                link = link.setIn(["joint2", "id"], hJointId2);
                canvasState = addRRLinkToLinkageInfo(canvasState, jointIdSet, linkIdSet, linkageInfo, jointsJs, link, inlineJoint.get("linkId"));
                // adding a link between joint4 and hJointId2
                link = link.setIn(["joint1", "id"], j4);
                link = link.setIn(["joint2", "id"], hJointId2);
                canvasState = addRRLinkToLinkageInfo(canvasState, jointIdSet, linkIdSet, linkageInfo, jointsJs, link, inlineJoint.get("linkId"));
              }
            } else {
              hJointId = exploredLinks.get(inlineJoint.get("linkId")).h1;
              hJointId2 = exploredLinks.get(inlineJoint.get("linkId")).h2;
            }
            if (RPCoupler) {
              // if regular joint also has this inlineJoint in its set otherwise remove connectedJointId property of the inlineJoint
              link = (0, _immutable.Map)({
                joint1: (0, _immutable.Map)({ id: j3 }),
                joint2: (0, _immutable.Map)({ id: regJId }),
                linkType: "RR",
                linkClass: "binary", // can be binary or ternary but by default ternary
                linkColor: _constants.constants.LINK_COLOR,
                hideLink: false
              });
              canvasState = addRRLinkToLinkageInfo(canvasState, jointIdSet, linkIdSet, linkageInfo, jointsJs, link, inlineJoint.get("linkId"));

              link = link.setIn(["joint1", "id"], hJointId2);
              canvasState = addRRLinkToLinkageInfo(canvasState, jointIdSet, linkIdSet, linkageInfo, jointsJs, link, inlineJoint.get("linkId"));
            } else {
              // if regular joint also has this inlineJoint in its set otherwise remove connectedJointId property of the inlineJoint
              link = (0, _immutable.Map)({
                joint1: (0, _immutable.Map)({ id: j1 }),
                joint2: (0, _immutable.Map)({ id: regJId }),
                linkType: "RR",
                linkClass: "binary", // can be binary or ternary but by default ternary
                linkColor: _constants.constants.LINK_COLOR,
                hideLink: false
              });
              canvasState = addRRLinkToLinkageInfo(canvasState, jointIdSet, linkIdSet, linkageInfo, jointsJs, link, inlineJoint.get("linkId"));

              link = link.setIn(["joint1", "id"], hJointId);
              canvasState = addRRLinkToLinkageInfo(canvasState, jointIdSet, linkIdSet, linkageInfo, jointsJs, link, inlineJoint.get("linkId"));
            }
          } else {
            canvasState = canvasState.setIn(["inlineJoints", inlineJointId, "connectedJointId"], null);
          }
        }
      }
    });
  }

  canvasState.get("links").forEach(function (link, linkId, iter) {
    if (link.get("linkType") === "RR" && !exploredLinks.has(linkId)) {
      canvasState = addRRLinkToLinkageInfo(canvasState, jointIdSet, linkIdSet, linkageInfo, jointsJs, link, linkId, canvasState.get("viewMode") === _constants.constants.VIEW_MODE.SNAPPY_XO);
    } else if (link.get("linkType") === "PR" && !exploredLinks.has(linkId)) {
      canvasState = addPRLinkToLinkageInfo(canvasState, jointIdSet, linkIdSet, linkageInfo, jointsJs, link, linkId, canvasState.get("viewMode") === _constants.constants.VIEW_MODE.SNAPPY_XO);
    } else if (link.get("linkType") === "RP" && !exploredLinks.has(linkId)) {
      canvasState = addRPLinkToLinkageInfo(canvasState, jointIdSet, linkIdSet, linkageInfo, jointsJs, link, linkId, false, !exploredLinks.has(linkId));
    }
  });

  var linkSet = getDrivingLinks(canvasState).toJS();
  var inlineJointDrivingLinks = [];
  if (linkSet.length === 0 && canvasState.getIn(["info", "drivingJoints"]).size > 0) {
    // check if inlineJoints are actuated
    var explored = new Set();
    canvasState.getIn(["info", "drivingJoints"]).forEach(function (drivingJointId) {
      for (var i = 0; i < linkageInfo.data.length; i++) {
        if (linkageInfo.data[i].p1 === drivingJointId) {
          if (!explored.has(i)) {
            inlineJointDrivingLinks.push(i);
            explored.add(i);
          }
          break;
        }
      }
    });
  }
  while (linkSet.length > 0) {
    if (linkSet.length === 1) {
      linkageInfo.info.driving = linkIdSet.linkMap.get(linkSet.pop());
    } else {
      var otherInputs = linkIdSet.linkMap.get(linkSet.pop());
      linkageInfo.info.otherInputs.push(otherInputs.toString());
    }
  }

  if (linkageInfo.info.otherInputs.length > 0) {
    linkageInfo.info.otherInputs = linkageInfo.info.otherInputs.reverse().join(",");
  }
  while (inlineJointDrivingLinks.length > 0) {
    if (linkageInfo.info.driving === undefined) {
      linkageInfo.info.driving = inlineJointDrivingLinks.pop();
    } else {
      var _otherInputs = inlineJointDrivingLinks.pop();
      linkageInfo.info.otherInputs.push(_otherInputs.toString());
    }
  }

  for (var i = 0; i < linkageInfo.data.length; i++) {
    if (linkageInfo.data[i].p1 !== undefined) {
      linkageInfo.data[i].x = jointsJs[linkageInfo.data[i].p1].x_;
      linkageInfo.data[i].y = jointsJs[linkageInfo.data[i].p1].y_;
    }
    if (linkageInfo.data[i].p2 !== undefined) {
      linkageInfo.data[i].x1 = jointsJs[linkageInfo.data[i].p2].x_;
      linkageInfo.data[i].y1 = jointsJs[linkageInfo.data[i].p2].y_;
    }
    if (linkageInfo.data[i].p3 !== undefined) {
      linkageInfo.data[i].x2 = jointsJs[linkageInfo.data[i].p3].x_;
      linkageInfo.data[i].y2 = jointsJs[linkageInfo.data[i].p3].y_;
    }
  }

  // console.log(linkageInfo, linkIdSet, canvasState.toJS(), jointIdSet)
  // console.log("linkegInfo", linkageInfo)
  // loading it into legacy code
  canvasState = canvasState.set("linkageInfo", linkageInfo);
  window.drawables.loadLinkageFromXMLFile(linkageInfo);
  // updating the state with new simJointMap and simulation data
  // console.log(linkageInfo)
  // console.log(window.drawables.linkage.joints)

  var closestSimIndex = 0;
  var distance = Infinity;
  var isSimIndexSet = false;
  var mat = getTransformationMatrix(canvasState);
  if (window.drawables.linkage.joints.length > 0 && canvasState.get("joints").size > 2 && canvasState.get("links").size > 1) {
    if (window.drawables.linkage.joints[0].curves[0].points.length > 0 && jointIdSet.numJoints === window.drawables.linkage.joints.length) {
      canvasState.get("simJointMap").forEach(function (jointDrawId, jointId, iter) {
        canvasState = canvasState.updateIn(["joints", jointId, "curve"], function (curve) {
          return curve.clear();
        });

        var _loop = function _loop(_i) {
          var temp = window.drawables.linkage.joints[jointDrawId].curves[0].points[_i];
          if (!canvasState.getIn(["joints", jointId, "isGround"]) && !isSimIndexSet) {
            var dist = getDistance(temp.x, temp.y, canvasState.getIn(["joints", jointId, "x_"]), canvasState.getIn(["joints", jointId, "y_"]));
            if (dist < distance) {
              closestSimIndex = _i;
              distance = dist;
            }
            if (_i === window.drawables.linkage.joints[jointDrawId].curves[0].points.length - 1) {
              isSimIndexSet = true;
            }
          }
          //add these points to state -> joints -> curves
          var GCS_X = (0, _mathjs.matrix)([temp.x, temp.y, 1]);
          var canvasX = (0, _mathjs.multiply)(mat, GCS_X);
          canvasState = canvasState.updateIn(["joints", jointId, "curve"], function (curve) {
            return curve.push({
              x_: temp.x,
              y_: temp.y,
              x: canvasX.get([0]),
              y: -canvasX.get([1])
            });
          });
        };

        for (var _i = 0; _i < window.drawables.linkage.joints[jointDrawId].curves[0].points.length; _i++) {
          _loop(_i);
        }
      });
    }
  }
  canvasState = canvasState.set("simIndex", closestSimIndex);
  if (window.simulator.snappyXOMode) canvasState = setLinkageInfo(canvasState, closestSimIndex);
  canvasState = canvasState.set("initialSimIndex", closestSimIndex);

  return canvasState;
};

var recursivelyRemoveDrivingJoints = exports.recursivelyRemoveDrivingJoints = function recursivelyRemoveDrivingJoints(state, jointId) {
  var childJointId = state.getIn(["info", "dependencyGraph", jointId, "child"]);
  // console.log("before state: ", state.get("info").toJS())
  state = state.deleteIn(["info", "drivingJoints", jointId]);
  state = state.deleteIn(["info", "dependencyGraph", state.getIn(["info", "dependencyGraph", jointId, "parent"])]);
  state = state.deleteIn(["info", "dependencyGraph", jointId]);
  // console.log("removing input", jointId)
  // console.log("state: ", state.get("info").toJS())
  // console.log(childJointId)
  if (childJointId !== undefined) {
    state = recursivelyRemoveDrivingJoints(state, childJointId);
  }
  return state;
};

var deleteJoint = exports.deleteJoint = function deleteJoint(state, joint_id, link_id) {
  var override = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

  // note the this function is called on when the link_id is also goint to be deleted
  if (state.getIn(["joints", joint_id, "links"]).size === 0 || state.getIn(["joints", joint_id, "links"]).subtract([link_id, "groundLink"]).size === 0 || override) {
    //make sure that joint being deleted is not connected to any link other than link_id
    // but it is a linked joint, than delete it , but before than, remove its all respective links
    if (state.getIn(["info", "drivingJoints"]).has(joint_id)) {
      state = recursivelyRemoveDrivingJoints(state, joint_id);
    }
    state = state.deleteIn(["joints", joint_id]);
    state = state.deleteIn(["simJointMap", joint_id]);
  }
  return state;
};

var deleteLink = exports.deleteLink = function deleteLink(state, linkId) {
  // make sure to delete 'links' of the link from all the connected joints
  var jointId = void 0;
  for (var i = 1; i < 5; i++) {
    if (state.hasIn(["links", linkId, "joint" + i])) {
      // then check if the joint itself is not deleted
      jointId = state.getIn(["links", linkId, "joint" + i, "id"]);
      if (state.hasIn(["joints", jointId])) {
        // if joint exist, remove the link from its 'links' set
        state = state.updateIn(["joints", jointId, "links"], function (links) {
          return links.delete(linkId);
        });
      }
    }
  }

  var depJSet = state.getIn(["links", linkId, "dependentInlineJointSet"]);
  if (depJSet !== undefined) {
    depJSet.forEach(function (inlineJId) {
      state = deleteInlineJoint(state, inlineJId);
    });
  }
  state = state.deleteIn(["links", linkId]);
  return state;
};

var addJoint = exports.addJoint = function addJoint(state, joint_id, joint) {
  return state.update("joints", function (joints) {
    return state.get("joints").set(joint_id, joint);
  });
};

var getInverseTransformationMatrix = exports.getInverseTransformationMatrix = function getInverseTransformationMatrix(state) {
  var paras = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

  var tx = void 0,
      ty = void 0,
      theta = void 0,
      scale = void 0,
      mat = void 0;
  if (paras === null) {
    tx = state.getIn(["GCS", "tx"]);
    ty = state.getIn(["GCS", "ty"]);
    theta = state.getIn(["GCS", "theta"]);
    scale = state.getIn(["GCS", "scale"]);
  } else {
    tx = paras.tx;
    ty = paras.ty;
    theta = paras.theta;
    scale = paras.scale;
  }
  var sin = Math.sin(theta);
  var cos = Math.cos(theta);
  mat = (0, _mathjs.matrix)([[cos / scale, sin / scale, 1 / scale * (-tx * cos - ty * sin)], [-sin / scale, cos / scale, 1 / scale * (tx * sin - ty * cos)], [0, 0, 1]]);
  return mat;
};

var getTransformationMatrix = exports.getTransformationMatrix = function getTransformationMatrix(state) {
  var paras = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

  var tx = void 0,
      ty = void 0,
      theta = void 0,
      scale = void 0,
      mat = void 0;
  var ix = 1,
      iy = 1;
  if (paras === null) {
    tx = state.getIn(["GCS", "tx"]);
    ty = state.getIn(["GCS", "ty"]);
    theta = state.getIn(["GCS", "theta"]);
    scale = state.getIn(["GCS", "scale"]);
  } else {
    tx = paras.tx;
    ty = paras.ty;
    theta = paras.theta;
    scale = paras.scale;
    if (paras.mirror !== undefined) {
      switch (paras.mirror) {
        case "x":
          iy = -1;
          break;
        case "y":
          ix = -1;
          break;
      }
    }
  }
  var sin = Math.sin(theta);
  var cos = Math.cos(theta);
  mat = (0, _mathjs.matrix)([[cos * scale * ix, -sin * scale, tx], [sin * scale, cos * scale * iy, ty], [0, 0, 1]]);

  return mat;
};

var getInverseScalingTransformationMatrix = exports.getInverseScalingTransformationMatrix = function getInverseScalingTransformationMatrix(state) {
  var paras = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

  var scale = void 0,
      mat = void 0;
  if (paras === null) {
    scale = state.getIn(["GCS", "scale"]);
  } else {
    scale = paras.scale;
  }
  mat = (0, _mathjs.matrix)([[1 / scale, 0, 0], [0, 1 / scale, 0], [0, 0, 1]]);
  return mat;
};

var getScalingTransformationMatrix = exports.getScalingTransformationMatrix = function getScalingTransformationMatrix(state) {
  var paras = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

  var scale = void 0,
      mat = void 0;
  if (paras === null) {
    scale = state.getIn(["GCS", "scale"]);
  } else {
    scale = paras.scale;
  }
  mat = (0, _mathjs.matrix)([[scale, 0, 0], [0, scale, 0], [0, 0, 1]]);
  return mat;
};

var setPoint = exports.setPoint = function setPoint(state, joint_id, x_, y_) {
  var entity = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : "joints";
  var inverse = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : false;

  if (!inverse) {
    state = state.updateIn([entity, joint_id, "x"], function (x) {
      return x_;
    });
    state = state.updateIn([entity, joint_id, "y"], function (y) {
      return y_;
    });

    var mat = getInverseTransformationMatrix(state);
    var _canvasX = (0, _mathjs.matrix)([x_, -y_, 1]);
    // coordinates in Global CS
    var GCS_X = (0, _mathjs.multiply)(mat, _canvasX);

    state = state.updateIn([entity, joint_id, "x_"], function (x) {
      return GCS_X.get([0]);
    });
    state = state.updateIn([entity, joint_id, "y_"], function (y) {
      return GCS_X.get([1]);
    });
  } else {
    state = state.updateIn([entity, joint_id, "x_"], function (x) {
      return x_;
    });
    state = state.updateIn([entity, joint_id, "y_"], function (y) {
      return y_;
    });

    var _mat = getTransformationMatrix(state);
    var _GCS_X = (0, _mathjs.matrix)([x_, y_, 1]);
    // coordinates in Global CS
    var _canvasX2 = (0, _mathjs.multiply)(_mat, _GCS_X);

    state = state.updateIn([entity, joint_id, "x"], function (x) {
      return _canvasX2.get([0]);
    });
    state = state.updateIn([entity, joint_id, "y"], function (y) {
      return -_canvasX2.get([1]);
    });
  }
  return state;
};

var getJoint = exports.getJoint = function getJoint(state, link_id, jointEnd) {
  var immutable = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

  // returns the coordinates of joint among 'joint1', 'joint2',..
  var jointInfo = state.getIn(["links", link_id, jointEnd]);
  if (!state.hasIn(["joints", jointInfo.get("id")])) return null;
  if (immutable) return state.getIn(["joints", jointInfo.get("id")]);
  return state.getIn(["joints", jointInfo.get("id")]).toJS();
};

var setLinkageInfo = exports.setLinkageInfo = function setLinkageInfo(state, simIndex) {
  state.get("simJointMap").forEach(function (jointDrawId, jointId, iter) {
    var temp = state.getIn(["joints", jointId, "curve", simIndex]);
    if (temp !== undefined) state = setPoint(state, jointId, temp.x, temp.y);
  });
  return state;
};

var clearCouplerCurves = exports.clearCouplerCurves = function clearCouplerCurves(state) {
  state.get("joints").forEach(function (joint, jointId, iter) {
    if (state.hasIn(["joints", jointId, "curve"])) {
      state = state.updateIn(["joints", jointId, "curve"], function (curve) {
        return curve.clear();
      });
    }
  });
  return state;
};

var calcSimLength = exports.calcSimLength = function calcSimLength(state) {
  var simLength = 0;
  if (state.get("joints").size > 0) simLength = state.get("joints").find(function (v, k, i) {
    return true;
  }).get("curve").size;
  return simLength;
};

var updateJoints = exports.updateJoints = function updateJoints(state) {
  var mat = getTransformationMatrix(state);
  var entities = ["joints", ["freeFormLinksAndJoints", "joints"], "cornerFixedPivots", "poses"];

  entities.forEach(function (entity, ind, self) {
    if (state.has(entity)) {
      var list = void 0;
      if (typeof entity == "string") list = state.get(entity);else list = state.getIn(entity);
      list.forEach(function (joint, jointId) {
        var x_ = 0;
        var y_ = 0;
        if (!isNaN(joint.get("x_"))) x_ = joint.get("x_");

        if (!isNaN(joint.get("y_"))) y_ = joint.get("y_");

        var GCS_X = (0, _mathjs.matrix)([x_, y_, 1]);
        var canvasX = (0, _mathjs.multiply)(mat, GCS_X);

        if (typeof entity == "string") {
          state = state.updateIn([entity, jointId, "x"], function (x) {
            return canvasX.get([0]);
          });
          state = state.updateIn([entity, jointId, "y"], function (y) {
            return -canvasX.get([1]);
          });
        } else {
          state = state.updateIn(entity.concat([jointId, "x"]), function (x) {
            return canvasX.get([0]);
          });
          state = state.updateIn(entity.concat([jointId, "y"]), function (y) {
            return -canvasX.get([1]);
          });
        }
      });
    }
  });

  return state;
};

var updateMultiSelectionRectangleTranslation = exports.updateMultiSelectionRectangleTranslation = function updateMultiSelectionRectangleTranslation(state) {
  if (state.getIn(["multiSelectionRectangle", "x"]) !== null) {
    var mat = getTransformationMatrix(state); //Global-> HTML Canvas coordinate system.
    var GCS_X = [state.getIn(["multiSelectionRectangle", "x_"]), state.getIn(["multiSelectionRectangle", "y_"]), 1];
    var _canvasX3 = (0, _mathjs.multiply)(mat, GCS_X);
    state = state.setIn(["multiSelectionRectangle", "x"], _canvasX3.get([0]));
    state = state.setIn(["multiSelectionRectangle", "y"], -_canvasX3.get([1]));
  }
  return state;
};

var updateMultiSelectionRectangleScale = exports.updateMultiSelectionRectangleScale = function updateMultiSelectionRectangleScale(state, deltaScale) {
  if (state.getIn(["multiSelectionRectangle", "x"]) !== null) {
    state = state.updateIn(["multiSelectionRectangle", "width"], function (wt) {
      return wt * deltaScale;
    });
    state = state.updateIn(["multiSelectionRectangle", "height"], function (ht) {
      return ht * deltaScale;
    });
  }
  return state;
};

var updateCouplerCurves = exports.updateCouplerCurves = function updateCouplerCurves(state) {
  var mat = getTransformationMatrix(state);
  var jointSets = ["joints", ["freeFormLinksAndJoints", "joints"]];
  jointSets.forEach(function (joints) {
    var list = void 0;
    if (typeof joints == "string") list = state.get(joints);else list = state.getIn(joints);
    list.forEach(function (joint, jointId, iter) {
      joint.get("curve").forEach(function (point, i_) {
        var x_ = point.x_;
        var y_ = point.y_;
        var GCS_X = (0, _mathjs.matrix)([x_, y_, 1]);
        var canvasX = (0, _mathjs.multiply)(mat, GCS_X);
        var jd = void 0;
        if (typeof joints == "string") state = state.updateIn([joints, jointId, "curve", i_], function (pt) {
          pt.x = canvasX.get([0]);
          pt.y = -canvasX.get([1]);
          return pt;
        });else state = state.updateIn(joints.concat([jointId, "curve", i_]), function (pt) {
          pt.x = canvasX.get([0]);
          pt.y = -canvasX.get([1]);
          return pt;
        });
      });
    });
  });

  return state;
};

var inverseUpdateCouplerCurves = exports.inverseUpdateCouplerCurves = function inverseUpdateCouplerCurves(state) {
  var mat = getInverseTransformationMatrix(state);
  state.get("joints").forEach(function (joint, jointId, iter) {
    joint.get("curve").forEach(function (point, i_) {
      var x = point.x;
      var y = point.y;
      var canvasX = (0, _mathjs.matrix)([x, -y, 1]);
      var GCS_X = (0, _mathjs.multiply)(mat, canvasX);
      state = state.updateIn(["joints", jointId, "curve", i_], function (pt) {
        pt.x_ = GCS_X.get([0]);
        pt.y_ = GCS_X.get([1]);
        return pt;
      });
    });
  });

  return state;
};

var updateBackgroundImage = exports.updateBackgroundImage = function updateBackgroundImage(state) {
  var image = state.getIn(["backgroundImage", "image"]);
  var imageSrc = state.getIn(["backgroundImage", "imageSrc"]);
  if (!image && imageSrc) {
    image = new Image();
    image.src = imageSrc;
    state = state.setIn(["backgroundImage", "image"], image);
  }
  if (image !== null) {
    var mat = getTransformationMatrix(state);
    var x_ = state.getIn(["backgroundImage", "dx_"]);
    var y_ = state.getIn(["backgroundImage", "dy_"]);
    var GCS_X = (0, _mathjs.matrix)([x_, y_, 1]);
    var _canvasX4 = (0, _mathjs.multiply)(mat, GCS_X);
    state = state.setIn(["backgroundImage", "dx"], _canvasX4.get([0]));
    state = state.setIn(["backgroundImage", "dy"], -_canvasX4.get([1]));
  }
  return state;
};

var inverseUpdateBackgroundImage = exports.inverseUpdateBackgroundImage = function inverseUpdateBackgroundImage(state) {
  var image = state.getIn(["backgroundImage", "image"]);
  if (image !== null) {
    var mat = getInverseTransformationMatrix(state);
    var x = state.getIn(["backgroundImage", "dx"]);
    var y = state.getIn(["backgroundImage", "dy"]);
    var _canvasX5 = (0, _mathjs.matrix)([x, -y, 1]);
    var GCS_X = (0, _mathjs.multiply)(mat, _canvasX5);
    state = state.setIn(["backgroundImage", "dx_"], GCS_X.get([0]));
    state = state.setIn(["backgroundImage", "dy_"], GCS_X.get([1]));
  }
  return state;
};

var getPointSide = exports.getPointSide = function getPointSide(point1, point2, qPoint) {
  return Math.sign((point2.x - point1.x) * (qPoint.y - point1.y) - (point2.y - point1.y) * (qPoint.x - point1.x));
};

var findEndforJointId = exports.findEndforJointId = function findEndforJointId(state, linkId, jointId) {
  // finds end name for jointId on the given link
  // ex. links = {1: { joint1: {id: 4}}}
  // for jointId 4, linkId 1, end is 'joint1'
  var link = state.getIn(["links", linkId]);
  if (link.getIn(["joint1", "id"]) === jointId) return "joint1";
  if (link.getIn(["joint2", "id"]) === jointId) return "joint2";
  if (link.getIn(["joint3", "id"]) === jointId) return "joint3";
  if (link.getIn(["joint4", "id"]) === jointId) return "joint4";
  if (link.getIn(["joint5", "id"]) === jointId) return "joint5";
};

var isVirtualJoint = exports.isVirtualJoint = function isVirtualJoint(state, jointId) {
  var found = false;
  state.getIn(['joints', jointId, 'links']).forEach(function (linkId, linkid, self) {
    if (linkId !== 'groundLink') {
      var end = findEndforJointId(state, linkId, jointId);
      if ((state.getIn(['links', linkId, 'linkType']) === 'PR' || state.getIn(['links', linkId, 'linkType']) === 'RP') && end === 'joint3') found = true;
    }
  });
  return found;
};

var get_GCS_points = exports.get_GCS_points = function get_GCS_points(state) {
  var points = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "points";

  if (typeof points == "string") {
    state.get(points).forEach(function (point, ind, self) {
      var mat = getInverseTransformationMatrix(state);
      var canvasX = (0, _mathjs.matrix)([point.x, -point.y, 1]);
      // coordinates in Global CS
      var GCS_X = (0, _mathjs.multiply)(mat, canvasX);
      state = state.updateIn([points, ind], function (pt) {
        pt.x_ = GCS_X.get([0]);
        pt.y_ = GCS_X.get([1]);
        return pt;
      });
    });
  } else {
    state.getIn(points).forEach(function (point, ind, self) {
      var mat = getInverseTransformationMatrix(state);
      var canvasX = (0, _mathjs.matrix)([point.x, -point.y, 1]);
      // coordinates in Global CS
      var GCS_X = (0, _mathjs.multiply)(mat, canvasX);
      state = state.updateIn(points + [ind], function (pt) {
        pt.x_ = GCS_X.get([0]);
        pt.y_ = GCS_X.get([1]);
        return pt;
      });
    });
  }
  return state;
};

var updatePoints = exports.updatePoints = function updatePoints(state) {
  var points = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'points';

  var mat = getTransformationMatrix(state);
  if (typeof points == "string") {
    state.get(points).forEach(function (point, id, iter) {
      var GCS_X = (0, _mathjs.matrix)([point.x_, point.y_, 1]);
      var canvasX = (0, _mathjs.multiply)(mat, GCS_X);
      state = state.updateIn([points, id], function (pt) {
        pt.x = canvasX.get([0]);
        pt.y = -canvasX.get([1]);
        return pt;
      });
    });
  } else {
    state.getIn(points).forEach(function (point, id, iter) {
      var GCS_X = (0, _mathjs.matrix)([point.x_, point.y_, 1]);
      var canvasX = (0, _mathjs.multiply)(mat, GCS_X);
      var ptid = points.slice();
      ptid.push(id);
      state = state.updateIn(ptid, function (pt) {
        pt.x = canvasX.get([0]);
        pt.y = -canvasX.get([1]);
        return pt;
      });
    });
  }
  return state;
};

var recursivelyUpdateLinkedRegularJoints = exports.recursivelyUpdateLinkedRegularJoints = function recursivelyUpdateLinkedRegularJoints(state, linkId) {
  var exploredSet = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : new Set();
  var regJointSet = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : new Set();

  //console.log("link", linkId)
  if (!exploredSet.has(linkId)) {
    exploredSet.add(linkId);
    if (state.hasIn(["links", linkId, "dependentInlineJointSet"])) {
      state.getIn(["links", linkId, "dependentInlineJointSet"]).forEach(function (inlineJointId) {
        var regJId = state.getIn(["inlineJoints", inlineJointId, "connectedJointId"]);
        if (regJId !== null && !regJointSet.has(regJId)) {
          regJointSet.add(regJId);
          //console.log("reg", regJId, "inlineJointId", inlineJointId)
          var inlineJointSet = state.getIn(["joints", regJId, "inlineJointSet"]);
          if (inlineJointSet !== undefined && inlineJointSet.has(inlineJointId)) {
            // connected inlineJoints
            var point = getInlineJoint(state, inlineJointId);
            state = setPoint(state, regJId, point.x, point.y);
            state.getIn(["joints", regJId, "links"]).forEach(function (lId) {
              state = recursivelyUpdateLinkedRegularJoints(state, lId, exploredSet, regJointSet);
            });
          }
        }
      });
    }
  }
  return state;
};

var updateLinkedJoints = exports.updateLinkedJoints = function updateLinkedJoints(state, jointIdList) {
  jointIdList.forEach(function (jointId) {
    state.getIn(["joints", jointId, "links"]).forEach(function (linkId) {
      if (linkId !== "groundLink") {
        state = recursivelyUpdateLinkedRegularJoints(state, linkId);
        if (state.hasIn(["links", linkId, "dependentInlineJointSet"]) && state.getIn(["links", linkId, "dependentInlineJointSet"]).size > 0 && state.hasIn(["links", linkId, "snappified"])) {
          state = snappifyLink(state, linkId);
        } else if (state.hasIn(["links", linkId, "dependentInlineJointSet"]) && state.getIn(["links", linkId, "dependentInlineJointSet"]).size > 0) {
          state = validateInlineJoints(state, linkId);
        }
      }
    });
  });
  return state;
};

var transformJoints = exports.transformJoints = function transformJoints(state, mat) {
  var newJointSet = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

  // if newJointSet is not null, this function only transforms newly added joints given in newJointSet
  state.get("joints").forEach(function (joint, jointId, iter) {
    if (joint.get("lock")) return;
    if (newJointSet === null || newJointSet.has(jointId)) {
      var x_ = 0;
      var y_ = 0;
      if (!isNaN(joint.get("x_"))) x_ = joint.get("x_");

      if (!isNaN(joint.get("y_"))) y_ = joint.get("y_");

      var old_X = (0, _mathjs.matrix)([x_, y_, 1]);
      var new_X = (0, _mathjs.multiply)(mat, old_X);
      state = state.updateIn(["joints", jointId, "x_"], function (x) {
        return new_X.get([0]);
      });
      state = state.updateIn(["joints", jointId, "y_"], function (y) {
        return new_X.get([1]);
      });
    }
  });
  // if all joints are transformed, there is no need ot updating linked joints,
  // they are automatically transformed
  if (newJointSet !== null) {
    state = updateLinkedJoints(state, newJointSet);
  }

  return state;
};

var getCornerFixedPivots = exports.getCornerFixedPivots = function getCornerFixedPivots(state) {
  // finds jointIndexes for x_min, y_min, x_max, y_max
  var x_min = Infinity,
      y_min = Infinity,
      x_max = -Infinity,
      y_max = -Infinity;
  var x_min_ = null,
      y_min_ = null,
      x_max_ = null,
      y_max_ = null;
  // incase when no RR link or valid link is present
  var validLinks = false;
  state.get("links").forEach(function (link, linkdId) {
    if (link.get("linkType") === _constants.constants.LINK_TYPE.RR) {
      ["joint1", "joint2", "joint3", "joint4", "joint5"].forEach(function (end) {
        if (link.has(end)) {
          var joint = state.getIn(["joints", link.getIn([end, "id"])]);
          if (joint.get("isGround")) {
            if (joint.get("x") > x_max) {
              x_max = joint.get("x");
              x_max_ = joint.get("x_");
            }
            if (joint.get("y") > y_max) {
              y_max = joint.get("y");
              y_max_ = joint.get("y_");
            }
            if (joint.get("x") < x_min) {
              x_min = joint.get("x");
              x_min_ = joint.get("x_");
            }
            if (joint.get("y") < y_min) {
              y_min = joint.get("y");
              y_min_ = joint.get("y_");
            }
            if (!validLinks) validLinks = true;
          }
        }
      });
    }
  });
  if (validLinks) {
    var min = (0, _immutable.Map)({ x: x_min, y: y_min, x_: x_min_, y_: y_min_ });
    var max = (0, _immutable.Map)({ x: x_max, y: y_max, x_: x_max_, y_: y_max_ });
    state = state.set("cornerFixedPivots", (0, _immutable.Map)({ min: min, max: max }));
  }
  return state;
};

var getResetViewParameters = exports.getResetViewParameters = function getResetViewParameters(state) {
  return null;
};

var getSelectionRectangleParas_links = exports.getSelectionRectangleParas_links = function getSelectionRectangleParas_links(state, linkSet) {
  return null;
};

var allotPlanes = exports.allotPlanes = function allotPlanes(state) {
  if (state.get("joints").size !== 0) {
    var graph = new Map();
    state.get("joints").forEach(function (joint, jointId) {
      var linkArr = joint.get("links").toJS();
      for (var i = 0; i < linkArr.length; i++) {
        for (var j = 0; j < linkArr.length; j++) {
          if (i !== j) {
            if (!graph.has(linkArr[i])) {
              graph.set(linkArr[i], [linkArr[j]]);
            } else {
              graph.get(linkArr[i]).push(linkArr[j]);
            }
          }
        }
      }
    });

    // console.log("before", graph)
    var linkSet = getDrivingLinks(state);

    if (graph.size !== 0) {
      var linkArr = graph.get("groundLink");
      if (linkArr != undefined) {
        linkArr.sort(function (a, b) {
          // actuation link should be the first one to get assigned
          if (linkSet.has(a)) {
            return -1;
          }
          if (linkSet.has(b)) {
            return 1;
          }
          if (a < b) {
            return -1;
          }
          if (a > b) {
            return 1;
          }
          if (a === b) {
            return 0;
          }
        });
        // console.log("after", graph)
        var explored = new Set();
        var link = void 0,
            plane = void 0;

        explored.add("groundLink");
        var stack = [["groundLink", 1]];
        while (stack.length !== 0) {
          var stacked = stack.splice(0, 1);
          link = stacked[0][0];
          plane = stacked[0][1];
          //if (link !== "groundLink") {
          //  state = state.setIn(["links", link, "plane"], plane);
          //}
          var p = 1;
          //console.log("Node", link, plane);
          for (var i = 0; i < graph.get(link).length; i++) {
            //console.log("Neighbor", graph.get(link)[i], "explored set :", explored);
            if (!explored.has(graph.get(link)[i])) {
              for (var j = 0; j < graph.get(graph.get(link)[i]).length; j++) {
                if (explored.has(graph.get(graph.get(link)[i])[j])) {
                  // console.log(
                  //   "explored sibbling of " + graph.get(link)[i] + " is : ",
                  //   graph.get(graph.get(link)[i])[j]
                  // );
                  // console.log("plane ", plane, "p", p, state.getIn([
                  //     "links",
                  //     graph.get(graph.get(link)[i])[j],
                  //     "plane"
                  //   ]))
                  // siblings of i that are already explored (alloted plane)
                  if (plane + p === state.getIn(["links", graph.get(graph.get(link)[i])[j], "plane"])) {
                    plane = plane + 1;
                  }
                }
              }

              explored.add(graph.get(link)[i]);
              stack.push([graph.get(link)[i], plane + p]);
              if (graph.get(link)[i] !== "groundLink") {
                state = state.setIn(["links", graph.get(link)[i], "plane"], plane + p);
              }
              p += 1;
              // console.log("Plane Alloted", stack[stack.length-1]);
            }
          }
        }
      }
    }
  }
  return state;
};

var getFixedJointId = exports.getFixedJointId = function getFixedJointId(state, linkId) {
  // returns the coordinates of joint among 'joint1', 'joint2',..
  var ends = ["joint1", "joint2", "joint3", "joint4"];
  for (var i = 0; i < ends.length; i++) {
    var id = state.getIn(["links", linkId, ends[i], "id"]);
    if (id !== undefined) {
      if (state.getIn(["joints", id, "isGround"])) {
        return id;
      }
    }
  }
  return null;
};

var getJointSet = exports.getJointSet = function getJointSet(state, linkSet) {
  var visibleOnly = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

  var jointSet = new Set(); //stores newly added joints for transforming them
  var joints = ["joint1", "joint2", "joint3", "joint4", "joint5"];
  linkSet.forEach(function (linkId) {
    var newLink = state.getIn(["links", linkId]);
    joints.forEach(function (end) {
      var condition = true;
      if (visibleOnly) {
        if (newLink.get("linkType") !== "RR" && end == "joint3") {
          condition = false;
        }
      }
      if (newLink.has(end) && condition) {
        // create a new joint and map it to end
        var jointId = state.getIn(["links", linkId, end, "id"]);
        jointSet.add(jointId);
      }
    });
  });
  return jointSet;
};

var duplicateSelection = exports.duplicateSelection = function duplicateSelection(state) {
  // copying links, joints, poses and (shapes not implemented TODO for zhijie)
  var pasteLinkMap = new Map(); //hashmap that stores newIds => originalIds
  var pasteJointMap = new Map(); //hashmap that stores newIds => originalIds
  var newJointSet = new Set(); //stores newly added joints for transforming them
  var newLinkSet = []; //stores newly added joints for transforming them
  var newLinkId = null;
  var joints = ["joint1", "joint2", "joint3", "joint4", "joint5"];
  var selectedLinkSet = void 0;
  if (state.get("mode") === "multiSelect") {
    selectedLinkSet = state.getIn(["multiSelectionSet", "links"]);
  }
  // this logic needs re-design. if a shape should follow such logic.
  else if (state.get("selectedLink") !== null) {
      selectedLinkSet = (0, _immutable.Set)([state.get("selectedLink")]);
    }

  if (selectedLinkSet !== undefined) {
    if (selectedLinkSet.size > 0) {

      selectedLinkSet.forEach(function (linkId) {
        newLinkId = getNewId(state, "links");
        pasteLinkMap.set(linkId, newLinkId);
        newLinkSet.push(newLinkId);

        //// copying link, then replacing joint ids with new joints
        var newLink = state.getIn(["links", linkId]);
        joints.forEach(function (end) {
          if (newLink.has(end)) {
            // create a new joint and map it to end
            var newJoint = void 0,
                newJointId = void 0,
                linkSet = void 0;
            var jointId = state.getIn(["links", linkId, end, "id"]);
            if (pasteJointMap.has(jointId)) {
              // this joint has occurred before in pasting a previous link
              newJointId = pasteJointMap.get(jointId);
              newJoint = state.getIn(["joints", pasteJointMap.get(jointId)]);
              linkSet = newJoint.get("links");
            } else {
              newJoint = state.getIn(["joints", jointId]);
              newJointId = getNewId(state, "joints");
              // for now, temparary translation
              pasteJointMap.set(jointId, newJointId);
              newJointSet.add(newJointId);
              // now remove linkIds in the links which are not selected
              linkSet = newJoint.get("links").intersect(selectedLinkSet);
            }
            linkSet.forEach(function (linkedLinkId) {
              if (pasteLinkMap.has(linkedLinkId)) {
                linkSet = linkSet.add(pasteLinkMap.get(linkedLinkId));
                linkSet = linkSet.remove(linkedLinkId);
              }
            });

            newJoint = newJoint.set("links", linkSet);

            newLink = newLink.setIn([end, "id"], newJointId);
            state = state.setIn(["joints", newJointId], newJoint);
          }
        });
        state = state.setIn(["links", newLinkId], newLink);
        if (state.hasIn(["links", linkId, "dependentInlineJointSet"])) {
          state.getIn(["links", linkId, "dependentInlineJointSet"]).forEach(function (inlineJointId) {
            //since inlineJointId are exlusive for each link, there can not be a inlineJoint which is shared between two links
            var newInlineJointId = getNewId(state, "inlineJoints");
            var inlineJoint = state.getIn(["inlineJoints", inlineJointId]);
            inlineJoint = inlineJoint.set("linkId", newLinkId);
            inlineJoint = inlineJoint.set("connectedJointId", null);
            newLink = newLink.update("dependentInlineJointSet", function (st) {
              st = st.remove(inlineJointId);
              st = st.add(newInlineJointId);
              return st;
            });
            state = state.setIn(["inlineJoints", newInlineJointId], inlineJoint);
            if (inlineJoint.get("highlightException")) {
              state = createNewDummyJointForInlineJoint(state, newInlineJointId);
            }
          });
        }
        state = state.setIn(["links", newLinkId], newLink);
      });
      var mat = getTransformationMatrix(null, { tx: state.getIn(["duplicateProps", "x_"]), ty: state.getIn(["duplicateProps", "y_"]), theta: 0, scale: 1 });
      state = transformJoints(state, mat, newJointSet);
      state = state.setIn(["multiSelectionSet", "links"], (0, _immutable.Set)(newLinkSet));
    }
  }

  // to duplicate a shape: see duplicate_selectedShape.
  return state;
};

var increaseOpacity = exports.increaseOpacity = function increaseOpacity(color) {
  var val = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0.3;

  // assumes color format as rbga = "rgba(5,3,1,0.8)"
  color = color.substr(0, color.length - 4) + (parseFloat(color.substr(color.length - 4, color.length - 1)) + val) + ")";
  return color;
};

var getContrastColor = exports.getContrastColor = function getContrastColor(color) {
  return color === _constants.constants.LINK_COLOR ? _constants.constants.COUPLER_COLOR : _constants.constants.COUPLER_COLOR;
};

var setSnappyXOPivotsForPR = exports.setSnappyXOPivotsForPR = function setSnappyXOPivotsForPR(jointsJs, jointId1, jointId2, jointId3, state) {
  // joint1 and joint2 are visible joints of PR link
  // obtain fixed points P1 and P2 for the stationary part of the slider link
  // P1 and P2 should lie on the grid
  // recompute joint1 and joint2
  // joint1 and joint2 are changed in-place inside the function
  var joint1 = jointsJs[jointId1];
  var joint2 = jointsJs[jointId2];
  var l = getDistance(joint1, joint2, undefined, undefined, true);
  var theta = getInclination(joint1, joint2, true);
  var d = _constants.constants.PR_OFFSET * state.getIn(["GCS", "scale"]) / 120 / 120;
  var P1 = {
    x_: joint1.x_ + l / 2 * Math.cos(theta) + d * Math.sin(theta),
    y_: joint1.y_ + l / 2 * Math.sin(theta) - d * Math.cos(theta)
  };
  var P2 = {
    x_: joint1.x_ + l / 2 * Math.cos(theta) - d * Math.sin(theta),
    y_: joint1.y_ + l / 2 * Math.sin(theta) + d * Math.cos(theta)
  };
  P1.x_ = Math.round(P1.x_ / (_constants.constants.XOstep / 2)) * (_constants.constants.XOstep / 2);
  P1.y_ = Math.round(P1.y_ / (_constants.constants.XOstep / 2)) * (_constants.constants.XOstep / 2);
  P2.x_ = Math.round(P2.x_ / (_constants.constants.XOstep / 2)) * (_constants.constants.XOstep / 2);
  P2.y_ = Math.round(P2.y_ / (_constants.constants.XOstep / 2)) * (_constants.constants.XOstep / 2);
  var theta_ = getInclination(P1, P2, true) - Math.PI / 2;

  jointsJs[jointId1].x_ = P1.x_ - l / 2 * Math.cos(theta_) - d * Math.sin(theta_);
  jointsJs[jointId1].y_ = P1.y_ - l / 2 * Math.sin(theta_) + d * Math.cos(theta_);

  jointsJs[jointId2].x_ = P1.x_ + l / 2 * Math.cos(theta_) - d * Math.sin(theta_);
  jointsJs[jointId2].y_ = P1.y_ + l / 2 * Math.sin(theta_) + d * Math.cos(theta_);

  var canvas = document.getElementById(state.get("canvasId"));
  var R = Math.max(canvas.width, canvas.height) * state.get("RFactor") * state.getIn(["GCS", "scale"]) / 120 / 120;
  jointsJs[jointId3].x_ = jointsJs[jointId1].x_ + R * Math.cos(theta_ + Math.PI / 2);
  jointsJs[jointId3].y_ = jointsJs[jointId1].y_ + R * Math.sin(theta_ + Math.PI / 2);
};

var addInlineJoint = exports.addInlineJoint = function addInlineJoint(state, action) {
  var dist = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  var offset = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
  var isX = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;

  // add an inlineJoint on a link at distance dicteted by mouse click
  if (action.linkId === undefined || action.linkId === null) throw new Error("link is not selected");
  var newId = getNewId(state, "inlineJoints");
  var joint1 = void 0,
      joint2 = void 0;
  if (action.RPCoupler) {
    joint1 = getJoint(state, action.linkId, action.end3);
    joint2 = getJoint(state, action.linkId, action.end4);
  } else {
    joint1 = getJoint(state, action.linkId, action.end1);
    joint2 = getJoint(state, action.linkId, action.end2);
  }
  if (dist === null) {
    var mat = getInverseTransformationMatrix(state);
    // coordinates in Canvas CS (with Y up)
    var loc = (0, _mathjs.multiply)(mat, (0, _mathjs.matrix)([action.xDragging, -action.yDragging, 1]));
    var pt = { x_: loc.get([0]), y_: loc.get([1])
      // coordinates in Global CS
    };dist = getDistance(joint1, pt, undefined, undefined, true);
    if (state.getIn(["links", action.linkId, "linkClass"]) !== "binary" && state.getIn(["links", action.linkId, "linkType"]) === _constants.constants.LINK_TYPE.RR || action.RPCoupler) {
      var angle1 = getInclination(joint1, pt, true);
      var angle2 = getInclination(joint1, joint2, true);
      offset = angle1 - angle2;
    }
  }

  var newInlineJoint = (0, _immutable.Map)({ joint1: action.end1, joint2: action.end2, joint3: action.end3, joint4: action.end4, joint5: action.end5, RPCoupler: action.RPCoupler, linkId: action.linkId, offsetAngle: offset, connectedJointId: null, type: isX ? _constants.constants.xSlot : _constants.constants.oSlot, highlightException: action.highlightException });
  state = state.setIn(["inlineJoints", newId], newInlineJoint);

  //adding dist via seperate function
  state = setInlineJointDist(state, newId, dist, offset);

  state = state.updateIn(["links", action.linkId, "dependentInlineJointSet"], function (set) {
    if (set === undefined) set = (0, _immutable.Set)([]);
    set = set.add(newId);
    return set;
  });

  return state;
};

var snappifyLink = exports.snappifyLink = function snappifyLink(state, linkId) {
  if (linkId === undefined || linkId === null) throw new Error("link is not selected");

  state = state.setIn(["links", linkId, "snappified"], true);
  state.get("inlineJoints").forEach(function (inlineJoint, inlineJointId) {
    if (inlineJoint.get("linkId") === linkId && inlineJoint.get("connectedJointId") === null) {
      state = deleteInlineJoint(state, inlineJointId);
    }
  });

  var endslist = [];
  if (state.getIn(["links", linkId, "linkClass"]) === "binary" && state.getIn(["links", linkId, "linkType"]) === _constants.constants.LINK_TYPE.RR) {
    endslist.push(["joint1", "joint2", undefined]);
  } else if (state.getIn(["links", linkId, "linkType"]) === _constants.constants.LINK_TYPE.PR) {
    endslist.push(["joint1", "joint2", "joint3"]);
  } else if (state.getIn(["links", linkId, "linkType"]) === _constants.constants.LINK_TYPE.RR) {
    endslist.push(["joint1", "joint2", "joint3"]);
    endslist.push(["joint1", "joint3", "joint2"]);
    endslist.push(["joint2", "joint3", "joint1"]);
  }

  endslist.forEach(function (ends) {
    var newId = getNewId(state, "inlineJoints");
    var joint1 = getJoint(state, linkId, ends[0]);
    var joint2 = getJoint(state, linkId, ends[1]);
    var linkLength = getDistance(joint1, joint2, undefined, undefined, true);
    var step = _constants.constants.XOstep / 2;
    var a = step;
    var b = linkLength - step;
    //let roundLinkLength = Math.round(linkLength / (constants.XOstep / 2)) * (constants.XOstep/2);
    // console.log("linkLength", linkLength)
    var isX = true;

    while (a <= b + 0.05) {
      // console.log("drawing at l", ldist)
      state = addInlineJoint(state, { linkId: linkId, end1: ends[0], end2: ends[1], end3: ends[2] }, a, 0, isX);
      a += step;
      isX = !isX;
    }
  });
  state = validateInlineJoints(state, linkId);

  return state;
};

var validateInlineJoints = exports.validateInlineJoints = function validateInlineJoints(state, linkId) {
  if (linkId === undefined || linkId === null) throw new Error("link is not selected");
  if (state.getIn(["links", linkId, "linkClass"]) !== "binary") {
    return state;
  }
  var maxdist = 0;
  var mindist = 0;
  state.getIn(["links", linkId, "dependentInlineJointSet"]).forEach(function (inlineJointId) {
    var inlineJoint = state.getIn(["inlineJoints", inlineJointId]);
    var dist = state.getIn(["inlineJoints", inlineJointId, "dist"]);
    if (state.get('viewMode') === _constants.constants.VIEW_MODE.SNAPPY_XO) {
      dist = Math.round(dist / (_constants.constants.XOstep / 2)) * (_constants.constants.XOstep / 2);
      state = setInlineJointDist(state, inlineJointId, dist);
    }
    if (dist > maxdist) {
      maxdist = dist;
    }
    if (dist < mindist) {
      mindist = dist;
    }
  });

  state = state.setIn(["links", linkId, "maxdist"], maxdist);
  state = state.setIn(["links", linkId, "mindist"], mindist);
  return state;
};

var getInlineJoint = exports.getInlineJoint = function getInlineJoint(state, inlineJointId) {
  var inlineJoint = state.getIn(["inlineJoints", inlineJointId]);
  var joint1Id = void 0,
      joint2Id = void 0;
  if (state.getIn(["inlineJoints", inlineJointId, "RPCoupler"])) {
    joint1Id = state.getIn(["links", inlineJoint.get("linkId"), inlineJoint.get("joint3"), "id"]);
    joint2Id = state.getIn(["links", inlineJoint.get("linkId"), inlineJoint.get("joint4"), "id"]);
  } else {
    joint1Id = state.getIn(["links", inlineJoint.get("linkId"), inlineJoint.get("joint1"), "id"]);
    joint2Id = state.getIn(["links", inlineJoint.get("linkId"), inlineJoint.get("joint2"), "id"]);
  }
  var pt1 = state.getIn(["joints", joint1Id]).toJS();
  var pt2 = state.getIn(["joints", joint2Id]).toJS();
  var dist = inlineJoint.get("dist");
  var offsetAngle = inlineJoint.get("offsetAngle");
  // TODO: Sometimes pt1 or pt2 is undefined, need to find out which case
  var angle = getInclination(pt1, pt2, true);
  var point = getEndPoint(pt1, dist, angle + offsetAngle, true);
  var mat = getTransformationMatrix(state);
  var GCS_X = (0, _mathjs.matrix)([point.x_, point.y_, 1]);
  var canvasX = (0, _mathjs.multiply)(mat, GCS_X);
  point.x = canvasX.get([0]);
  point.y = -canvasX.get([1]);
  return point;
};

var setInlineJointDist = exports.setInlineJointDist = function setInlineJointDist(state, inlineJointId, dist) {
  var offset = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

  state = state.setIn(["inlineJoints", inlineJointId, "dist"], dist);
  state = state.setIn(["inlineJoints", inlineJointId, "offsetAngle"], offset);
  var inlineJoint = state.getIn(["inlineJoints", inlineJointId]);
  state = state.updateIn(["links", inlineJoint.get("linkId"), "maxdist"], function (maxdist) {
    if (maxdist === undefined) {
      maxdist = 0;
    }
    maxdist = Math.max(maxdist, dist);
    return maxdist;
  });
  state = state.updateIn(["links", inlineJoint.get("linkId"), "mindist"], function (mindist) {
    if (mindist === undefined) {
      mindist = 0;
    }
    mindist = Math.min(mindist, dist);
    return mindist;
  });
  if (inlineJoint.get("connectedJointId") !== null) {
    var pt = getInlineJoint(state, inlineJointId);
    state = setPoint(state, inlineJoint.get("connectedJointId"), pt.x, pt.y, "joints");
  }

  return state;
};

var setInlineJoint = exports.setInlineJoint = function setInlineJoint(state, inlineJointId, x, y) {
  var inlineJoint = state.getIn(["inlineJoints", inlineJointId]);
  if (!state.hasIn(["links", inlineJoint.get("linkId")])) {
    return deleteInlineJoint(state, inlineJointId);
  }
  var joint1Id = void 0,
      joint2Id = void 0;
  if (state.getIn(["inlineJoints", inlineJointId, "RPCoupler"])) {
    joint1Id = state.getIn(["links", inlineJoint.get("linkId"), inlineJoint.get("joint3"), "id"]);
    joint2Id = state.getIn(["links", inlineJoint.get("linkId"), inlineJoint.get("joint4"), "id"]);
  } else {
    joint1Id = state.getIn(["links", inlineJoint.get("linkId"), inlineJoint.get("joint1"), "id"]);
    joint2Id = state.getIn(["links", inlineJoint.get("linkId"), inlineJoint.get("joint2"), "id"]);
  }
  var pt1 = state.getIn(["joints", joint1Id]).toJS();
  var pt2 = state.getIn(["joints", joint2Id]).toJS();
  var mat = getInverseTransformationMatrix(state);
  // coordinates in Canvas CS (with Y up)
  var loc = (0, _mathjs.multiply)(mat, (0, _mathjs.matrix)([x, -y, 1]));
  var pt = { x_: loc.get([0]), y_: loc.get([1]) };
  var offset = 0;
  // coordinates in Global CS
  var lineInc = getInclination(pt1, pt2, true); //inclination of line pt1-pt2
  var ptAngle = getInclination(pt1, pt, true); // inclination of line pt1-pt
  var dist = getDistance(pt1, pt, undefined, undefined, true);
  if (state.getIn(["links", inlineJoint.get("linkId"), "linkClass"]) !== "binary" && state.getIn(["links", inlineJoint.get("linkId"), "linkType"]) === _constants.constants.LINK_TYPE.RR || state.getIn(["inlineJoints", inlineJointId, "RPCoupler"])) {
    offset = ptAngle - lineInc;
  } else {
    dist = dist * Math.cos(lineInc - ptAngle);
  }

  state = setInlineJointDist(state, inlineJointId, dist, offset);
  state = validateInlineJoints(state, inlineJoint.get("linkId"));

  return state;
};

var deleteInlineJoint = exports.deleteInlineJoint = function deleteInlineJoint(state, inlineJointId) {
  // removing inlineJointId from connected joint set
  var inlineJoint = state.getIn(["inlineJoints", inlineJointId]);
  if (inlineJoint != undefined && inlineJoint.get("connectedJointId") !== null) {
    state = state.updateIn(["joints", inlineJoint.get("connectedJointId"), "inlineJointSet"], function (st) {
      return st.remove(inlineJointId);
    });
  }
  if (inlineJoint != undefined && state.hasIn(["links", inlineJoint.get("linkId")])) {
    state = state.updateIn(["links", inlineJoint.get("linkId"), "dependentInlineJointSet"], function (st) {
      return st.remove(inlineJointId);
    });
  }

  state = state.deleteIn(["inlineJoints", inlineJointId]);
  return state;
};

var getOtherJointId = exports.getOtherJointId = function getOtherJointId(state, linkId, jointId) {
  // returns the first jointId different than current jointId
  var ends = ["joint1", "joint2", "joint3", "joint4"];
  for (var i = 0; i < ends.length; i++) {
    var id = state.getIn(["links", linkId, ends[i], "id"]);
    if (id !== undefined) {
      if (id !== jointId) {
        return id;
      }
    }
  }
  return null;
};

var createNewDummyJointForInlineJoint = exports.createNewDummyJointForInlineJoint = function createNewDummyJointForInlineJoint(state, inlineJointId) {
  var newJoint = getNewJoint(state, {}, false, "R", true, getInlineJoint(state, inlineJointId));
  state = state.setIn(["joints", newJoint.id], newJoint.joint);
  state = state.setIn(["joints", newJoint.id, "inlineJointSet"], (0, _immutable.Set)([inlineJointId]));
  state = state.setIn(["joints", newJoint.id, "snapping"], false);
  state = state.setIn(["inlineJoints", inlineJointId, "connectedJointId"], newJoint.id);
  // so that the inlineJoint should be highlighted when selected
  state = state.setIn(["inlineJoints", inlineJointId, "highlightException"], true);
  return state;
};

var setInlineJointSetForJoint = exports.setInlineJointSetForJoint = function setInlineJointSetForJoint(state, jId, inlineJointSet) {
  if (state.getIn(["joints", jId, "inlineJointSet"]) !== null && state.getIn(["joints", jId, "inlineJointSet"]) !== undefined) {
    state.getIn(["joints", jId, "inlineJointSet"]).forEach(function (inlineJointId) {
      if (!inlineJointSet.has(inlineJointId)) {
        // true means this joint is not goint to be in the future inlineJointSet
        // creating new joint for it only if it is not generated by snappifying entire link
        if (state.getIn(["inlineJoints", inlineJointId, "highlightException"])) {
          state = createNewDummyJointForInlineJoint(state, inlineJointId);
        }
      }
    });
  }

  inlineJointSet.forEach(function (inlineJointId) {
    var prevJId = state.getIn(["inlineJoints", inlineJointId, "connectedJointId"]);
    if (prevJId !== null && prevJId !== jId) {
      // delete this joint if dummy
      state = deleteJoint(state, prevJId);
    }
    state = state.setIn(["inlineJoints", inlineJointId, "connectedJointId"], jId);
  });

  state = state.updateIn(["joints", jId], function (jt) {
    return jt.set("inlineJointSet", inlineJointSet);
  });
  return state;
};

var getPointsForConvexHull = exports.getPointsForConvexHull = function getPointsForConvexHull(state, linkId, jointArray) {
  var points = [];
  var explored = new Set();
  jointArray.forEach(function (jointId) {
    if (state.hasIn(["joints", jointId])) {
      var pt = state.getIn(["joints", jointId]).toJS();
      var key = Math.round(pt.x) + "," + Math.round(pt.y);
      if (!explored.has(key)) {
        points.push({ x: pt.x, y: pt.y });
        explored.add(key);
      }
    }
  });

  if (state.hasIn(["links", linkId, "dependentInlineJointSet"])) {
    state.getIn(["links", linkId, "dependentInlineJointSet"]).forEach(function (inlineJointId) {
      var jointId = state.getIn(["inlineJoints", inlineJointId, "connectedJointId"]);
      if (jointId !== null && state.hasIn(["joints", jointId])) {
        var pt = state.getIn(["joints", jointId]).toJS();
        var key = Math.round(pt.x) + "," + Math.round(pt.y);
        if (!explored.has(key)) {
          points.push({ x: pt.x, y: pt.y });
          explored.add(key);
        }
      }
    });
  }

  var mat = getInverseTransformationMatrix(state); //GCf_matrix
  for (var i = 0; i < points.length; i++) {
    var _canvasX6 = (0, _mathjs.matrix)([points[i].x, -points[i].y, 1]); //point in Cf system.
    var GCS_X = (0, _mathjs.multiply)(mat, _canvasX6);
    points[i].x_ = GCS_X.get([0]);
    points[i].y_ = GCS_X.get([1]);
  }

  return points;
};