"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var constants = exports.constants = {
  GRID_UNIT_LENGTH: 1 / 0.675,
  COUPLER_FILL_COLOR_KINEMATIC_VIEW: "rgba(39, 174, 96, 0.6)",
  LINK_LINE_THIKESS_KINEMAITC_VIEW: 8,
  PR_LINK_COLOR: "lightgray",
  PR_LINK_THICKNESS: 675 / 10,
  LINK_THICKNESS: 675 / 10,
  LINK_THICKNESS_REGULAR: 26,
  CURVE_THICKNESS: 6,
  SELECTION_RADIUS: 50,
  LINK_END_CIRCLE_RADIUS: 26,
  LINK_TYPE: { RR: "RR", PR: "PR", RP: "RP" },
  ML_BACKEND_URI: "http://129.49.32.192:8000",
  BACKEND_URI: "https://motiongenpro-backend.appspot.com",
  xSlot: "X",
  oSlot: "O",
  VIEW_MODE: {
    REGULAR: "regular",
    SNAPPY_XO: "snappyXO",
    KINEMATIC: "kinematic",
    FREE_FORM: "freeform"
  },
  XOstep: 1,
  POSE_LINE_THICKNESS: 5,
  ARROW_HEAD_WIDTH: 30,
  ARROW_HEAD_LENGTH: 50,
  POSE_LINE_LENGTH: 200,
  HIGHLIGHT_COLOR: "rgba(51, 229, 181, 0.6)",
  POSE_EDITING_LINE_THICKNESS: 2,
  SOLUTION_SORTING: {
    COLLISION: "collision",
    PATH_SIMILARITY: "path_similarity"
  },
  COUPLER_COLOR: "rgba(200, 2, 27, 0.6)",
  LINK_COLOR: "rgba(173, 255, 47, 0.6)",
  PR_OFFSET_FREEFROM: 675 / 10 * 1.8, // LINK_THICKNESS * 1.8
  PR_OFFSET_REGULAR: 26 * 2,
  JOINT_RADIUS: 16,

  //For 3D
  INIT_ZOOM_FACTOR: 10, //larger number -> smaller size, for inital size of the 3D objects
  XO_LENGTH: 337.5, //the lenght of a X shape to next O shape
  XX_LENGTH: 675, //the lenght of a X shape to next X shape, it is also a unit length in grid. 675 = 0.675 inch in the product
  BEAM_THICKNESS: 125,
  PLANE_GAP: 250,
  PIN_DIAMETER: 190,
  SHAPE_Z_OFFSET: 125, //if the number equal to BEAM_THICKNESS, the shape will be on top of the beam.
  GRID_RATIO_3D: 1000, //means 1 unit = 1 inch
  GRID_SIZE_3D: 100,
  BACKGROUND_SOURCE: ["/img_babylon/white.svg", "/img_babylon/dark.svg", "/img_babylon/night.png", "/img_babylon/universe.jpg", "/img_babylon/christmas.jpg"],

  //For export SVG
  SVG_STROKE_WIDTH: 3,
  SVG_PADDING: 10
};