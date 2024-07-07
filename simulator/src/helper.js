import window from 'global';
import { matrix, multiply, cross } from "mathjs";
import { constants } from "./constants";
import { Map as imMap, List, Set as imSet, OrderedSet } from "immutable";

export const getNewId = (state, entity) => {
  return state.get(entity).size === 0 ? 0 : state.get(entity).keySeq().last() + 1;
};

export const getNewJoint = (
    state,
    action = {},
    isGround = false,
    jointType = "R",
    plotCurve = true,
    point
) => {
    if (point !== undefined){
      action.xDragging = point.x
      action.yDragging = point.y
      action.x_ = point.x_
      action.y_ = point.y_
    } else {
    let mat = getInverseTransformationMatrix(state); //Inverse means, C->G, GCf_matrix.
    // coordinates in Canvas CS (with Y up)
    let canvasX = matrix([action.xDragging, -action.yDragging, 1]);
    // coordinates in Global CS
    let GCS_X = multiply(mat, canvasX);
    action.x_ = GCS_X.get([0])
    action.y_ = GCS_X.get([1])
    }
    // x_, y_ store the coordinates w.r.t global coordinate system
    let newJoint = imMap({
        x: action.xDragging,
        y: action.yDragging,
        x_: action.x_,
        y_: action.y_,
        links: imSet([]),
        curve: List([]),
        snapping: true,
        isGround: isGround,
        jointType: jointType,
        plotCurve: plotCurve
    });
    if (isGround) {
        newJoint = newJoint.update("links", links => links.add("groundLink"));
    }
    return { id: getNewId(state, "joints"), joint: newJoint };
};

export const getInclination = (point1, point2, gcs = false, degree = false) => {
  if (gcs) {
    let ang = Math.atan2(point2.y_ - point1.y_, point2.x_ - point1.x_);
    if (degree) ang = (ang * 180) / Math.PI;
    return ang;
  }

  return Math.atan2(point2.y - point1.y, point2.x - point1.x);
};

export const getMidPoint = (point1, point2) => {
  let midpoint = {};
  midpoint.x = (point1.x + point2.x) / 2;
  midpoint.y = (point1.y + point2.y) / 2;
  midpoint.x_ = (point1.x_ + point2.x_) / 2;
  midpoint.y_ = (point1.y_ + point2.y_) / 2;
  return midpoint;
};

export const getDistance = (x1, y1, x2, y2, gcs = false) => {
  if (typeof x2 == "undefined" && typeof y2 == "undefined") {
    if (gcs)
      return Math.sqrt(Math.pow(x1.x_ - y1.x_, 2) + Math.pow(x1.y_ - y1.y_, 2));
    //incase Point object is passed
    return Math.sqrt(Math.pow(x1.x - y1.x, 2) + Math.pow(x1.y - y1.y, 2));
  }
  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
};

export const getSignedDistance = (pt1, pt2, gcs = false) => {
  if (gcs)
    return {dist: getDistance(pt1, pt2, undefined, undefined, true), sign: Math.sign(cross([pt1.x_, pt1.y_, 0],[pt2.x_, pt2.y_, 0])[2])};
  //incase Point object is passed
  return {dist: getDistance(pt1, pt2), sign: Math.sign(cross([pt1.x, pt1.y, 0],[pt2.x, pt2.y, 0])[2])};
};

export const getEndPoint = (startPoint, length, angle, gcs = false) => {
  if (!gcs){
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

const updateJointDS = (canvasState, jointIdSet, jointId) => {
  // update state and jointDS for mapping state joints and joints in legacy code
  // hidden joints the joints which exist in temporary variable jointsJs but do not exist in immutable canvasState
  // these hidden joints are added to support simulation of inlineJoints
  if (!jointIdSet.jointMap.has(jointId)) {
    // first occerence of joint
    let isGround = false
    if (canvasState.hasIn(["joints", jointId])){
      isGround = canvasState.getIn(["joints", jointId, "isGround"])
    }
    if (canvasState.hasIn(["joints", jointId])){
      // do not add hidden joints to state
      canvasState = canvasState.setIn(
        ["simJointMap", jointId],
        jointIdSet.numJoints
      );
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

const updateLinkDS = (linkIdSet, linkId) => {
  if (!linkIdSet.linkMap.has(linkId)){
     linkIdSet.linkMap.set(linkId, linkIdSet.numLinks)
  }
  linkIdSet.numLinks++
};

const isDrivingLink = (state, linkId) => {
  let bool = false
  state.getIn(["info", "drivingJoints"]).forEach( drivingJointId => {
    if (state.getIn(["joints", drivingJointId, "links"]).has(linkId))
      bool = true
  })
  return bool
}

export const getDrivingStatus = (state) => {
  // return is drivingJoints are valid, and if PR is one of the driving link
  let isSimValid = true
  let bool = false
  state.getIn(["info", "drivingJoints"]).forEach( drivingJointId => {
    if (!state.hasIn(["joints", drivingJointId])){
       isSimValid = false
       state = recursivelyRemoveDrivingJoints(state, drivingJointId)
       return
    }
    state.getIn(["joints", drivingJointId, "links"]).forEach( linkId => {
      if (state.getIn(["links", linkId, "linkType"]) === "PR")
        bool = true
    })
  })
  return {state: state, isSimValid:isSimValid, isPRDriving:bool}
}

const recursivelyAddDrivingLinkSet = (state, jointId, linkSet, explored) => {
  if (!explored.has(jointId)){
    let addedForThisJoint = false
    state.getIn(["joints", jointId, "links"]).forEach( linkId => {
      if (linkId === "groundLink")
        return
      if (!linkSet.has(linkId) && !addedForThisJoint){
        linkSet = linkSet.add(linkId)
        addedForThisJoint = true
        explored.add(jointId)
      }
    })

    let childJointId = state.getIn(["info", "dependencyGraph", jointId, "child"])
    if (childJointId !== undefined){
      linkSet = recursivelyAddDrivingLinkSet(state, childJointId, linkSet, explored)
    }
  }
  return linkSet
}

export const getDrivingLinks = (state) => {
  // returns an array of driving links
  let linkSet = OrderedSet([])
  let explored = new Set()
  state.getIn(["info", "drivingJoints"]).forEach( drivingJointId => {
    if (!state.hasIn(["info", "dependencyGraph", drivingJointId, "parent"])){
      linkSet = recursivelyAddDrivingLinkSet(state, drivingJointId, linkSet, explored)
    }
  })
  linkSet = linkSet.subtract(["groundLink"])
  return linkSet
}

const addRRLinkToLinkageInfo = (canvasState, jointIdSet, linkIdSet, linkageInfo, jointsJs, link, linkId, isSnappyXOLink=false) => {
      let linkInfo = { type: "RR" };
      linkInfo.isSnappyXOLink = isSnappyXOLink
      window.simulator.snappyXOMode = window.simulator.snappyXOMode || link.get("lengthLock") && link.get("length") !== undefined ? true : false
      linkInfo.isLengthLocked = link.get("lengthLock")
      linkInfo.lockedLength = link.get("length")
      let jointId1, jointId2, jointId3, jointId4, jointId5;

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
          if (jointsJs[link.get("joint3").get("id")].isGround)
            linkInfo.isGround = true;


          jointId2 = link.get("joint1").get("id");
          jointId3 = link.get("joint2").get("id");
        } else {
          jointId1 = link.get("joint1").get("id");
          jointId2 = link.get("joint2").get("id");
        }
      }
      if (canvasState.getIn(["info", "drivingJoints"]).has(jointId2) && !canvasState.getIn(["info", "drivingJoints"]).has(jointId1)){
         // in case of multiDOFs links should have their actuating joint in x, y position. (p1 position)
        let jointId1_ = jointId2
        jointId2 = jointId1
        jointId1 = jointId1_
      }
      if (canvasState.getIn(["info", "drivingJoints"]).has(jointId3) && !canvasState.getIn(["info", "drivingJoints"]).has(jointId1)){
         // in case of multiDOFs links should have their actuating joint in x, y position. (p1 position)
        let jointId1_ = jointId3
        jointId3 = jointId1
        jointId1 = jointId1_
      }
      if (jointsJs[jointId1].isGround && isSnappyXOLink){
        jointsJs[jointId1].x_ = Math.round(jointsJs[jointId1].x_/(constants.XOstep/2)) * (constants.XOstep/2)
        jointsJs[jointId1].y_ = Math.round(jointsJs[jointId1].y_/(constants.XOstep/2)) * (constants.XOstep/2)
      }

      if (isDrivingLink(canvasState, linkId) && link.get("lengthLock") && link.get("length") !== undefined) {
        // if link is actuated, manually discretizing the length
        let linkLength = link.get("length")
        let temp = getEndPoint(
          { x: jointsJs[jointId1].x_, y: jointsJs[jointId1].y_ },
          linkLength,
          getInclination(jointsJs[jointId1], jointsJs[jointId2], true)
        );
        jointsJs[jointId2] = { x_: temp.x, y_: temp.y };
      }

      if (isDrivingLink(canvasState, linkId) && isSnappyXOLink) {
        // if link is actuated, manually discretizing the length
        let linkLength = getDistance(
          jointsJs[jointId1].x_,
          jointsJs[jointId1].y_,
          jointsJs[jointId2].x_,
          jointsJs[jointId2].y_
        );
        linkLength =
          Math.round(linkLength / (constants.XOstep / 2)) * (constants.XOstep/2);
        if (linkLength === 0) linkLength = (constants.XOstep / 2);
        let temp = getEndPoint(
          { x: jointsJs[jointId1].x_, y: jointsJs[jointId1].y_ },
          linkLength,
          getInclination(jointsJs[jointId1], jointsJs[jointId2], true)
        );
        jointsJs[jointId2] = { x_: temp.x, y_: temp.y };
      }

      linkInfo.x = jointsJs[jointId1].x_;
      linkInfo.y = jointsJs[jointId1].y_;
      linkInfo.x1 = jointsJs[jointId2].x_;
      linkInfo.y1 = jointsJs[jointId2].y_;
      linkInfo.p1 = jointId1
      linkInfo.p2 = jointId2

      canvasState = updateJointDS(canvasState, jointIdSet, jointId1);

      canvasState = updateJointDS(canvasState, jointIdSet, jointId2);

      linkInfo.plotCurves = "false,false";

      if (jointId3 !== undefined) {
        linkInfo.x2 = jointsJs[jointId3].x_;
        linkInfo.y2 = jointsJs[jointId3].y_;
        linkInfo.p3 = jointId3
        canvasState = updateJointDS(canvasState, jointIdSet, jointId3);
        linkInfo.plotCurves = "false,false,false";
        linkInfo.class = "Ternary Link";
      }
      linkInfo.rpm = link.get("rpm") === undefined ? "6" : link.get("rpm")
      linkInfo.rotationDirection = link.get("direction") === undefined ? "1" : link.get("direction")

      updateLinkDS(linkIdSet, linkId);
      linkageInfo.data.push(linkInfo);
      return canvasState
}

const addRPLinkToLinkageInfo = (canvasState, jointIdSet, linkIdSet, linkageInfo, jointsJs, link, linkId, isSnappyXOLink=false, drawBothLinks = true) => {
   let linkInfo = { type: "RR" };
   linkInfo.isSnappyXOLink = isSnappyXOLink
   let jointId1, jointId2, jointId3, jointId4, jointId5;
   // in RP we push two links
   // first link
   let isBinary = true;
   let isTernary = false;
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
     if (canvasState.getIn(["info", "drivingJoints"]).has(jointId2) && !canvasState.getIn(["info", "drivingJoints"]).has(jointId1)){
        // in case of multiDOFs links should have their actuating joint in x, y position. (p1 position)
        let jointId1_ = jointId2
       jointId2 = jointId1
       jointId1 = jointId1_
     }
   }

   linkInfo.x = jointsJs[jointId1].x_;
   linkInfo.y = jointsJs[jointId1].y_;
   linkInfo.p1 = jointId1
   if (!isBinary) {
     linkInfo.class = "Ternary Link";
     linkInfo.x1 = jointsJs[jointId2].x_;
     linkInfo.y1 = jointsJs[jointId2].y_;
     linkInfo.x2 = jointsJs[jointId3].x_;
     linkInfo.y2 = jointsJs[jointId3].y_;
     linkInfo.p2 = jointId2
     linkInfo.p3 = jointId3
     linkInfo.plotCurves = "false,false,false";
   } else {
     linkInfo.x1 = jointsJs[jointId3].x_;
     linkInfo.y1 = jointsJs[jointId3].y_;
     linkInfo.p2 = jointId3
     linkInfo.plotCurves = "false,false";
   }
   linkInfo.rpm = link.get("rpm") === undefined ? "6" : link.get("rpm")
   linkInfo.rotationDirection = link.get("direction") === undefined ? "1" : link.get("direction")

   if (drawBothLinks){
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

   let linkInfo2 = { type: "RR" };
   linkInfo2.isSnappyXOLink = isSnappyXOLink
   linkInfo2.isGround = false;
   linkInfo2.x = jointsJs[jointId3].x_;
   linkInfo2.y = jointsJs[jointId3].y_;
   linkInfo2.p1 = jointId3
   linkInfo2.x1 = jointsJs[jointId4].x_;
   linkInfo2.y1 = jointsJs[jointId4].y_;
   linkInfo2.p2 = jointId4

   canvasState = updateJointDS(canvasState, jointIdSet, jointId4);

   linkInfo2.plotCurves = "false,false";

   if (isTernary) {
     canvasState = updateJointDS(canvasState, jointIdSet, jointId5);
     linkInfo2.x2 = jointsJs[jointId5].x_;
     linkInfo2.y2 = jointsJs[jointId5].y_;
     linkInfo2.p3 = jointId5
     linkInfo2.plotCurves = "false,false,false";
     linkInfo2.class = "Ternary Link";
   }

   linkInfo2.rpm = link.get("rpm") === undefined ? "6" : link.get("rpm")
   linkInfo2.rotationDirection = link.get("direction") === undefined ? "1" : link.get("direction")

   updateLinkDS(linkIdSet, linkId);
   linkageInfo.data.push(linkInfo2);
   return canvasState
}

const addPRLinkToLinkageInfo = (canvasState, jointIdSet, linkIdSet, linkageInfo, jointsJs, link, linkId, isSnappyXOLink=false) => {
   let linkInfo = { type: "RR" };
   let jointId1, jointId2, jointId3, jointId4, jointId5;
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
     linkInfo.p1 = jointId1
     linkInfo.p2 = jointId2
     linkInfo.class = "Binary Link"
     linkInfo.plotCurves = "false,false";
     linkInfo.rpm = "0.1" //link.get("rpm") === undefined ? "6" : link.get("rpm")
     linkInfo.rotationDirection = link.get("direction") === undefined ? "1" : link.get("direction")
     linkInfo.snappyXOImmune = true

     canvasState = updateJointDS(canvasState, jointIdSet, jointId1);

     canvasState = updateJointDS(canvasState, jointIdSet, jointId2);

     updateLinkDS(linkIdSet, linkId);
     linkageInfo.data.push(linkInfo);
   }

   {
     let linkInfo2 = { type: "RR" };

     linkInfo2.isGround = true;
     linkInfo2.x = jointsJs[jointId1].x_;
     linkInfo2.y = jointsJs[jointId1].y_;
     linkInfo2.x1 = jointsJs[jointId3].x_;
     linkInfo2.y1 = jointsJs[jointId3].y_;
     linkInfo2.p1 = jointId1
     linkInfo2.p2 = jointId3
     linkInfo2.class = "Binary Link"
     linkInfo2.plotCurves = "false,false";
     linkInfo2.rpm = "0.1" //link.get("rpm") === undefined ? "1" : link.get("rpm")
     linkInfo2.rotationDirection = link.get("direction") === undefined ? "1" : link.get("direction")
     linkInfo2.snappyXOImmune = true


     canvasState = updateJointDS(canvasState, jointIdSet, jointId1);

     canvasState = updateJointDS(canvasState, jointIdSet, jointId3);

     updateLinkDS(linkIdSet, linkId);
     linkageInfo.data.push(linkInfo2);
   }

   {
     let linkInfo3 = { type: "RR" };

     linkInfo3.isSnappyXOLink = isSnappyXOLink
     window.simulator.snappyXOMode = window.simulator.snappyXOMode || link.get("lengthLock") && link.get("length") !== undefined ? true : false
     linkInfo3.isGround = true;
     linkInfo3.isLengthLocked = link.get("lengthLock")
     linkInfo3.lockedLength = link.get("length")
     linkInfo3.x = jointsJs[jointId2].x_;
     linkInfo3.y = jointsJs[jointId2].y_;
     linkInfo3.x1 = jointsJs[jointId3].x_;
     linkInfo3.y1 = jointsJs[jointId3].y_;
     linkInfo3.class = "Binary Link"
     linkInfo3.plotCurves = "false,false";
     linkInfo3.rpm = "0.1" //link.get("rpm") === undefined ? "1" : link.get("rpm")
     linkInfo3.rotationDirection = link.get("direction") === undefined ? "1" : link.get("direction")
     linkInfo3.snappyXOImmune = true


     canvasState = updateJointDS(canvasState, jointIdSet, jointId2);

     canvasState = updateJointDS(canvasState, jointIdSet, jointId3);

     updateLinkDS(linkIdSet, linkId);
     linkageInfo.data.push(linkInfo3);
     return canvasState
   }
}

export const getSimulationInfo = canvasState => {
  // creating linkageInfo json object which is read by legacy code
  // it should also update the state with information needed for linking the simulation info back
  let linkageInfo = {
    data: [],
    info: canvasState.get("info").toJS()
  };
  linkageInfo.info.otherInputs = [];

  window.simulator.snappyXOMode = canvasState.get("viewMode")===constants.VIEW_MODE.SNAPPY_XO;
  window.simulator.XOstep = constants.XOstep;
  // below line of code changes the angle increment of driving link when pr dyad is driving, which is a very long rr dyad
  // if same angular velocity is kept, linear velocity of slider gets very high, thus reducing it by doing this
  let op = getDrivingStatus(canvasState)
  if (!op.isSimValid){
    // simulation is not valid
    return canvasState
  }

  if (op.isPRDriving && canvasState.getIn(["info", "drivingJoints"]).size === 1) {
    window.simulator.defaultAngleIncrement = 1 / 200.0;
  } else {
    window.simulator.defaultAngleIncrement = 1.0;
  }

  let jointsJs = canvasState.get("joints").toJS();

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

  canvasState = canvasState.update("simJointMap", simJointMap =>
    simJointMap.clear()
  );

  let jointIdSet = {
    numJoints: 0,
    jointMap: new Map()
  };
  //to keep track of which link is hidden, which link is real
  let linkIdSet = {
    numLinks: 0,
    linkMap:new Map()
  }

  // add links corresponding to inlineJoints
  // for each unexplored inlineJoints,
  //      skip if inlineJoints is not connected to a regular joint (regJ)
  //      1. siblings of the inlineJoint => regJ.inlineJointSet
  //      2. add all the siblings to explored set, (siblings include current inline joint as well)
  //      3. for each inlineJoint in siblings, add two link links
  //        2.1 use connected regular joint (regJ) as the joint to update jointDS
  //        2.2 link1 => inlineJoint.joint1 <-> regJ
  //        2.2 link2 => inlineJoint.joint2 <-> regJ
  let exploredInlineJointIds = new Set();
  let exploredLinks = new Map();
  let hiddenJointId = canvasState.get("joints").keySeq().last();
  // for each 'unique' inlineJoint, a hidden joint is created, which connects inlineJoint and joint1 to form a non-skew triangle
  let hJointId;
  let hJointId2;
  if (canvasState.has("inlineJoints")){
    canvasState.get("inlineJoints").forEach((inlineJoint, inlineJointId) => {
      if (!exploredInlineJointIds.has(inlineJointId)){
        let regJId = canvasState.getIn(["inlineJoints", inlineJointId, "connectedJointId"])
        let j1 = canvasState.getIn(["links", inlineJoint.get("linkId"), inlineJoint.get("joint1"), "id"]);
        let j2 = canvasState.getIn(["links", inlineJoint.get("linkId"), inlineJoint.get("joint2"), "id"]);
        let j3 = canvasState.getIn(["links", inlineJoint.get("linkId"), inlineJoint.get("joint3"), "id"]);
        let j4 = canvasState.getIn(["links", inlineJoint.get("linkId"), inlineJoint.get("joint4"), "id"]);
        let j5 = canvasState.getIn(["links", inlineJoint.get("linkId"), inlineJoint.get("joint5"), "id"]);
        let RPCoupler = canvasState.getIn(["inlineJoints", inlineJointId, "RPCoupler"])
        let linkType = canvasState.getIn(["links", inlineJoint.get("linkId"), "linkType"]);
        if (regJId !== null){
          let inlineJointSet = canvasState.getIn(["joints", regJId, "inlineJointSet"])
          if (inlineJointSet !== undefined && inlineJointSet.has(inlineJointId) && ! canvasState.getIn(["joints", regJId, "links"]).has(inlineJoint.get("linkId"))){
            inlineJointSet.forEach( sibling => {
              exploredInlineJointIds.add(sibling)
            })
            let link;
            if (!exploredLinks.has(inlineJoint.get("linkId"))){
              hiddenJointId = hiddenJointId + 1
              hJointId = hiddenJointId
              hJointId2 = null
              let angle;
              let point;
              let angle2;
              let point2;
              let dist2;
              let temp2;
              let dist;
              let temp;
              if (canvasState.getIn(["links", inlineJoint.get("linkId"), "linkType"]) === constants.LINK_TYPE.RR){
                dist = getDistance(jointsJs[j1], jointsJs[j2], undefined, undefined, true)
                angle = getInclination(jointsJs[j1], jointsJs[j2], true) - Math.PI / 2
                point = getEndPoint(jointsJs[j1], dist, angle, true)
              } else if (canvasState.getIn(["links", inlineJoint.get("linkId"), "linkType"]) === constants.LINK_TYPE.RP){
                if (j2 !== undefined){
                  dist = getDistance(jointsJs[j1], jointsJs[j2], undefined, undefined, true)
                  angle = getInclination(jointsJs[j1], jointsJs[j2], true) - Math.PI / 4
                  point = getEndPoint(jointsJs[j1], dist*2, angle, true)
                  hJointId2 = hJointId + 1
                  hiddenJointId = hiddenJointId + 1
                } else {
                  hJointId2 = hJointId
                  hJointId = null
                }
                dist2 = getDistance(jointsJs[j3], jointsJs[j4], undefined, undefined, true)
                angle2 = getInclination(jointsJs[j3], jointsJs[j4], true) - Math.PI / 2
                point2 = getEndPoint(jointsJs[j3], dist2, angle2, true)
                temp2 = getNewJoint(canvasState, {}, false, "R", true, point2)
              } else {
                dist = getDistance(jointsJs[j1], jointsJs[j2], undefined, undefined, true)
                angle = getInclination(jointsJs[j1], jointsJs[j2], true) - Math.PI / 4
                point = getEndPoint(jointsJs[j1], dist*2, angle, true)
              }
              exploredLinks.set(inlineJoint.get("linkId"), {h1: hJointId, h2: hJointId2})
              if (hJointId !== null){
                temp = getNewJoint(canvasState, {}, false, "R", true, point)
                jointsJs[hJointId] = temp.joint.toJS()
              }
              if (hJointId2 !== null){
                // in this case temp2 will be defined
                jointsJs[hJointId2] = temp2.joint.toJS()
              }
              // adding a link between joint1 and joint2
              link = imMap({
                joint1: imMap({id: j1}),
                joint2: imMap({id: j2}),
                linkType: "RR",
                linkClass: "binary", // can be binary or ternary but by default ternary
                linkColor: constants.LINK_COLOR,
                hideLink: false,
              })
              if (j2 !== undefined){
                canvasState = addRRLinkToLinkageInfo(canvasState, jointIdSet, linkIdSet, linkageInfo, jointsJs, link, inlineJoint.get("linkId"), canvasState.get("viewMode")===constants.VIEW_MODE.SNAPPY_XO)

              }
              if (j3 !== undefined){
              // adding a link between joint1 and joint3
              link = link.setIn(["joint1", "id"], j1)
              link = link.setIn(["joint2", "id"], j3)
              canvasState = addRRLinkToLinkageInfo(canvasState, jointIdSet, linkIdSet, linkageInfo, jointsJs, link, inlineJoint.get("linkId"), canvasState.get("viewMode")===constants.VIEW_MODE.SNAPPY_XO && linkType === constants.LINK_TYPE.RR)

                if (hJointId !== null){
                // adding a link between joint3 and hiddenJointId
                link = link.setIn(["joint1", "id"], j3)
                link = link.setIn(["joint2", "id"], hJointId)
                canvasState = addRRLinkToLinkageInfo(canvasState, jointIdSet, linkIdSet, linkageInfo, jointsJs, link, inlineJoint.get("linkId"))
                }
              }

              if (hJointId !== null){
                // adding a link between joint1 and hidden joint
                link = link.setIn(["joint1", "id"], j1)
                link = link.setIn(["joint2", "id"], hJointId)
                canvasState = addRRLinkToLinkageInfo(canvasState, jointIdSet, linkIdSet, linkageInfo, jointsJs, link, inlineJoint.get("linkId"))
              }

              if (j2 !== undefined){
                // adding a link between joint2 and hidden joint
                link = link.setIn(["joint1", "id"], j2)
                link = link.setIn(["joint2", "id"], hJointId)
                canvasState = addRRLinkToLinkageInfo(canvasState, jointIdSet, linkIdSet, linkageInfo, jointsJs, link, inlineJoint.get("linkId"))
              }

              if (j4 !== undefined){
                // if j4 exists, it is given that j3 should exists
                if (j3 == undefined || hJointId2 == null){
                  throw "j3 is undefined or hJointId2 is null or both, something is wrong"
                }
                // adding a link between joint3 and joint4
                link = link.setIn(["joint1", "id"], j3)
                link = link.setIn(["joint2", "id"], j4)
                canvasState = addRRLinkToLinkageInfo(canvasState, jointIdSet, linkIdSet, linkageInfo, jointsJs, link, inlineJoint.get("linkId"))
                if (j5 !== undefined){
                  // adding a link between joint3 and joint5
                  link = link.setIn(["joint1", "id"], j3)
                  link = link.setIn(["joint2", "id"], j5)
                  canvasState = addRRLinkToLinkageInfo(canvasState, jointIdSet, linkIdSet, linkageInfo, jointsJs, link, inlineJoint.get("linkId"))
                  // adding a link between joint5 and hJointId2
                  link = link.setIn(["joint1", "id"], j5)
                  link = link.setIn(["joint2", "id"], hJointId2)
                  canvasState = addRRLinkToLinkageInfo(canvasState, jointIdSet, linkIdSet, linkageInfo, jointsJs, link, inlineJoint.get("linkId"))
                }
                // adding a link between joint3 and hJointId2
                link = link.setIn(["joint1", "id"], j3)
                link = link.setIn(["joint2", "id"], hJointId2)
                canvasState = addRRLinkToLinkageInfo(canvasState, jointIdSet, linkIdSet, linkageInfo, jointsJs, link, inlineJoint.get("linkId"))
                // adding a link between joint4 and hJointId2
                link = link.setIn(["joint1", "id"], j4)
                link = link.setIn(["joint2", "id"], hJointId2)
                canvasState = addRRLinkToLinkageInfo(canvasState, jointIdSet, linkIdSet, linkageInfo, jointsJs, link, inlineJoint.get("linkId"))
              }
            } else {
              hJointId = exploredLinks.get(inlineJoint.get("linkId")).h1
              hJointId2 = exploredLinks.get(inlineJoint.get("linkId")).h2
            }
              if (RPCoupler){
                // if regular joint also has this inlineJoint in its set otherwise remove connectedJointId property of the inlineJoint
                link = imMap({
                  joint1: imMap({id: j3}),
                  joint2: imMap({id: regJId}),
                  linkType: "RR",
                  linkClass: "binary", // can be binary or ternary but by default ternary
                  linkColor: constants.LINK_COLOR,
                  hideLink: false,
                })
                canvasState = addRRLinkToLinkageInfo(canvasState, jointIdSet, linkIdSet, linkageInfo, jointsJs, link, inlineJoint.get("linkId"))

                link = link.setIn(["joint1", "id"], hJointId2)
                canvasState = addRRLinkToLinkageInfo(canvasState, jointIdSet, linkIdSet, linkageInfo, jointsJs, link, inlineJoint.get("linkId"))
              } else {
                // if regular joint also has this inlineJoint in its set otherwise remove connectedJointId property of the inlineJoint
                link = imMap({
                  joint1: imMap({id: j1}),
                  joint2: imMap({id: regJId}),
                  linkType: "RR",
                  linkClass: "binary", // can be binary or ternary but by default ternary
                  linkColor: constants.LINK_COLOR,
                  hideLink: false,
                })
                canvasState = addRRLinkToLinkageInfo(canvasState, jointIdSet, linkIdSet, linkageInfo, jointsJs, link, inlineJoint.get("linkId"))

                link = link.setIn(["joint1", "id"], hJointId)
                canvasState = addRRLinkToLinkageInfo(canvasState, jointIdSet, linkIdSet, linkageInfo, jointsJs, link, inlineJoint.get("linkId"))
              }
          } else {
           canvasState = canvasState.setIn(["inlineJoints", inlineJointId, "connectedJointId"], null)
          }
        }
      }
    })
  }

  canvasState.get("links").forEach((link, linkId, iter) => {
    if (link.get("linkType") === "RR" && !exploredLinks.has(linkId)) {
      canvasState = addRRLinkToLinkageInfo(canvasState, jointIdSet, linkIdSet, linkageInfo, jointsJs, link, linkId, canvasState.get("viewMode")===constants.VIEW_MODE.SNAPPY_XO)
    } else if (link.get("linkType") === "PR" && !exploredLinks.has(linkId)) {
      canvasState = addPRLinkToLinkageInfo(canvasState, jointIdSet, linkIdSet, linkageInfo, jointsJs, link, linkId, canvasState.get("viewMode")===constants.VIEW_MODE.SNAPPY_XO)
    } else if (link.get("linkType") === "RP" && !exploredLinks.has(linkId)) {
      canvasState = addRPLinkToLinkageInfo(canvasState, jointIdSet, linkIdSet, linkageInfo, jointsJs, link, linkId, false, !exploredLinks.has(linkId))
    }
  });

  let linkSet = getDrivingLinks(canvasState).toJS()
  let inlineJointDrivingLinks = []
  if (linkSet.length === 0 && canvasState.getIn(["info", "drivingJoints"]).size > 0){
     // check if inlineJoints are actuated
     let explored = new Set()
     canvasState.getIn(["info", "drivingJoints"]).forEach( drivingJointId => {
        for(let i=0; i<linkageInfo.data.length; i++){
          if (linkageInfo.data[i].p1 === drivingJointId){
             if (!explored.has(i)){
                inlineJointDrivingLinks.push(i)
                explored.add(i)
             }
             break
          }
        }
     })
  }
  while (linkSet.length > 0){
    if (linkSet.length === 1){
       linkageInfo.info.driving = linkIdSet.linkMap.get(linkSet.pop())
    } else {
      let otherInputs = linkIdSet.linkMap.get(linkSet.pop())
      linkageInfo.info.otherInputs.push(otherInputs.toString());
    }
  }

  if (linkageInfo.info.otherInputs.length > 0){
    linkageInfo.info.otherInputs = linkageInfo.info.otherInputs.reverse().join(",")
  }
  while (inlineJointDrivingLinks.length > 0){
    if (linkageInfo.info.driving === undefined){
       linkageInfo.info.driving = inlineJointDrivingLinks.pop()
    } else {
      let otherInputs = inlineJointDrivingLinks.pop()
      linkageInfo.info.otherInputs.push(otherInputs.toString());
    }
  }


  for(let i=0; i<linkageInfo.data.length; i++){
    if (linkageInfo.data[i].p1 !== undefined){
      linkageInfo.data[i].x = jointsJs[linkageInfo.data[i].p1].x_
      linkageInfo.data[i].y = jointsJs[linkageInfo.data[i].p1].y_
    }
    if (linkageInfo.data[i].p2 !== undefined){
      linkageInfo.data[i].x1 = jointsJs[linkageInfo.data[i].p2].x_
      linkageInfo.data[i].y1 = jointsJs[linkageInfo.data[i].p2].y_
    }
    if (linkageInfo.data[i].p3 !== undefined){
      linkageInfo.data[i].x2 = jointsJs[linkageInfo.data[i].p3].x_
      linkageInfo.data[i].y2 = jointsJs[linkageInfo.data[i].p3].y_
    }
  }

  // console.log(linkageInfo, linkIdSet, canvasState.toJS(), jointIdSet)
  // console.log("linkegInfo", linkageInfo)
  // loading it into legacy code
  canvasState = canvasState.set("linkageInfo", linkageInfo)
  window.drawables.loadLinkageFromXMLFile(linkageInfo);
  // updating the state with new simJointMap and simulation data
  // console.log(linkageInfo)
  // console.log(window.drawables.linkage.joints)

  let closestSimIndex = 0;
  let distance = Infinity;
  let isSimIndexSet = false;
  let mat = getTransformationMatrix(canvasState);
  if (
    window.drawables.linkage.joints.length > 0 &&
    canvasState.get("joints").size > 2 &&
    canvasState.get("links").size > 1
  ) {
    if (
      window.drawables.linkage.joints[0].curves[0].points.length > 0 &&
      jointIdSet.numJoints === window.drawables.linkage.joints.length
    ) {
      canvasState.get("simJointMap").forEach((jointDrawId, jointId, iter) => {
        canvasState = canvasState.updateIn(
          ["joints", jointId, "curve"],
          curve => curve.clear()
        );
        for (
          let i = 0;
          i <
          window.drawables.linkage.joints[jointDrawId].curves[0].points.length;
          i++
        ) {
          let temp =
            window.drawables.linkage.joints[jointDrawId].curves[0].points[i];
          if (
            !canvasState.getIn(["joints", jointId, "isGround"]) &&
            !isSimIndexSet
          ) {
            let dist = getDistance(
              temp.x,
              temp.y,
              canvasState.getIn(["joints", jointId, "x_"]),
              canvasState.getIn(["joints", jointId, "y_"])
            );
            if (dist < distance) {
              closestSimIndex = i;
              distance = dist;
            }
            if (
              i ===
              window.drawables.linkage.joints[jointDrawId].curves[0].points
                .length -
                1
            ) {
              isSimIndexSet = true;
            }
          }
          //add these points to state -> joints -> curves
          let GCS_X = matrix([temp.x, temp.y, 1]);
          let canvasX = multiply(mat, GCS_X);
          canvasState = canvasState.updateIn(
            ["joints", jointId, "curve"],
            curve =>
              curve.push({
                x_: temp.x,
                y_: temp.y,
                x: canvasX.get([0]),
                y: -canvasX.get([1])
              })
          );
        }
      });
    }
  }
  canvasState = canvasState.set("simIndex", closestSimIndex);
  if (window.simulator.snappyXOMode)
    canvasState = setLinkageInfo(canvasState, closestSimIndex);
  canvasState = canvasState.set("initialSimIndex", closestSimIndex);

  return canvasState;
};

export const recursivelyRemoveDrivingJoints = (state, jointId) => {
  let childJointId = state.getIn(["info", "dependencyGraph", jointId, "child"])
  // console.log("before state: ", state.get("info").toJS())
  state = state.deleteIn(["info", "drivingJoints", jointId])
  state = state.deleteIn(["info", "dependencyGraph", state.getIn(["info", "dependencyGraph", jointId, "parent"])])
  state = state.deleteIn(["info", "dependencyGraph", jointId])
  // console.log("removing input", jointId)
  // console.log("state: ", state.get("info").toJS())
  // console.log(childJointId)
  if (childJointId !== undefined){
     state = recursivelyRemoveDrivingJoints(state, childJointId)
  }
  return state
}

export const deleteJoint = (state, joint_id, link_id, override = false) => {
  // note the this function is called on when the link_id is also goint to be deleted
  if (state.getIn(["joints", joint_id, "links"]).size === 0 ||
    state.getIn(["joints", joint_id, "links"]).subtract([link_id, "groundLink"])
      .size === 0 || override
  ) {
    //make sure that joint being deleted is not connected to any link other than link_id
    // but it is a linked joint, than delete it , but before than, remove its all respective links
    if (state.getIn(["info", "drivingJoints"]).has(joint_id)){
      state = recursivelyRemoveDrivingJoints(state, joint_id)
    }
    state = state.deleteIn(["joints", joint_id]);
    state = state.deleteIn(["simJointMap", joint_id]);
  }
  return state;
};

export const deleteLink = (state, linkId) => {
  // make sure to delete 'links' of the link from all the connected joints
  let jointId;
  for (let i = 1; i < 5; i++) {
    if (state.hasIn(["links", linkId, "joint" + i])) {
      // then check if the joint itself is not deleted
      jointId = state.getIn(["links", linkId, "joint" + i, "id"]);
      if (state.hasIn(["joints", jointId])) {
        // if joint exist, remove the link from its 'links' set
        state = state.updateIn(["joints", jointId, "links"], links =>
          links.delete(linkId)
        );
      }
    }
  }

  let depJSet = state.getIn(["links", linkId, "dependentInlineJointSet"])
  if (depJSet !== undefined){
    depJSet.forEach(inlineJId => {
       state = deleteInlineJoint(state, inlineJId)
    })
  }
  state = state.deleteIn(["links", linkId]);
  return state;
};

export const addJoint = (state, joint_id, joint) => {
  return state.update("joints", joints =>
    state.get("joints").set(joint_id, joint)
  );
};

export const getInverseTransformationMatrix = (state, paras=null) => {
  let tx, ty, theta, scale, mat;
  if (paras === null){
      tx = state.getIn(["GCS", "tx"]);
      ty = state.getIn(["GCS", "ty"]);
      theta = state.getIn(["GCS", "theta"]);
      scale = state.getIn(["GCS", "scale"]);
  } else {
      tx = paras.tx
      ty = paras.ty
      theta = paras.theta
      scale = paras.scale
  }
  let sin = Math.sin(theta);
  let cos = Math.cos(theta);
  mat = matrix([
    [cos / scale, sin / scale, (1 / scale) * (-tx * cos - ty * sin)],
    [-sin / scale, cos / scale, (1 / scale) * (tx * sin - ty * cos)],
    [0, 0, 1]
  ]);
  return mat;
};


export const getTransformationMatrix = (state, paras=null) => {
  let tx, ty, theta, scale, mat;
  let ix = 1, iy = 1;
  if (paras === null){
      tx = state.getIn(["GCS", "tx"]);
      ty = state.getIn(["GCS", "ty"]);
      theta = state.getIn(["GCS", "theta"]);
      scale = state.getIn(["GCS", "scale"]);
  } else {
      tx = paras.tx
      ty = paras.ty
      theta = paras.theta
      scale = paras.scale
      if (paras.mirror !== undefined){
        switch (paras.mirror){
          case "x":
            iy = -1
            break;
          case "y":
            ix = -1
            break;
        }
      }
  }
  let sin = Math.sin(theta);
  let cos = Math.cos(theta);
  mat = matrix([
    [cos * scale * ix, -sin * scale, tx],
    [sin * scale, cos * scale * iy, ty],
    [0, 0, 1]
  ]);

  return mat;
};

export const getInverseScalingTransformationMatrix = (state, paras=null) => {
  let scale, mat;
  if (paras === null){
      scale = state.getIn(["GCS", "scale"]);
  } else {
      scale = paras.scale
  }
  mat = matrix([
    [1 / scale, 0, 0],
    [0, 1 / scale, 0],
    [0, 0, 1]
  ]);
  return mat;
};

export const getScalingTransformationMatrix = (state, paras=null) => {
  let scale, mat;
  if (paras === null){
      scale = state.getIn(["GCS", "scale"]);
  } else {
      scale = paras.scale
  }
  mat = matrix([
    [scale, 0, 0],
    [0, scale, 0],
    [0, 0, 1]
  ]);
  return mat;
};

export const setPoint = (state, joint_id, x_, y_, entity="joints", inverse=false) => {
  if (!inverse){
    state = state.updateIn([entity, joint_id, "x"], x => x_);
    state = state.updateIn([entity, joint_id, "y"], y => y_);

    let mat = getInverseTransformationMatrix(state);
    let canvasX = matrix([x_, -y_, 1]);
    // coordinates in Global CS
    let GCS_X = multiply(mat, canvasX);

    state = state.updateIn([entity, joint_id, "x_"], x => GCS_X.get([0]));
    state = state.updateIn([entity, joint_id, "y_"], y => GCS_X.get([1]));
  } else {
    state = state.updateIn([entity, joint_id, "x_"], x => x_);
    state = state.updateIn([entity, joint_id, "y_"], y => y_);

    let mat = getTransformationMatrix(state);
    let GCS_X = matrix([x_, y_, 1]);
    // coordinates in Global CS
    let canvasX = multiply(mat, GCS_X);

    state = state.updateIn([entity, joint_id, "x"], x => canvasX.get([0]));
    state = state.updateIn([entity, joint_id, "y"], y => -canvasX.get([1]));
  }
  return state;
};

export const getJoint = (state, link_id, jointEnd, immutable = false) => {
  // returns the coordinates of joint among 'joint1', 'joint2',..
  let jointInfo = state.getIn(["links", link_id, jointEnd]);
  if (!state.hasIn(["joints", jointInfo.get("id")]))
    return null
  if (immutable) return state.getIn(["joints", jointInfo.get("id")]);
  return state.getIn(["joints", jointInfo.get("id")]).toJS();
};

export const setLinkageInfo = (state, simIndex) => {
  state.get("simJointMap").forEach((jointDrawId, jointId, iter) => {
    let temp = state.getIn(["joints", jointId, "curve", simIndex]);
    if (temp !== undefined) state = setPoint(state, jointId, temp.x, temp.y);
  });
  return state;
};

export const clearCouplerCurves = state => {
  state.get("joints").forEach((joint, jointId, iter) => {
    if (state.hasIn(["joints", jointId, "curve"])){
      state = state.updateIn(["joints", jointId, "curve"], curve =>
        curve.clear()
      );
    }
  });
  return state;
};

export const calcSimLength = state => {
  let simLength = 0;
  if (state.get("joints").size > 0)
    simLength = state
      .get("joints")
      .find((v, k, i) => true)
      .get("curve").size;
  return simLength;
};

export const updateJoints = state => {
  const mat = getTransformationMatrix(state);
  let entities = ["joints", ["freeFormLinksAndJoints", "joints"], "cornerFixedPivots", "poses"]

  entities.forEach( (entity, ind, self)  => {
      if (state.has(entity)){
        let list;
        if (typeof entity == "string")
          list = state.get(entity)
        else
          list = state.getIn(entity)
        list.forEach((joint, jointId) => {
          let x_ = 0;
          let y_ = 0;
          if (!isNaN(joint.get("x_"))) x_ = joint.get("x_");

          if (!isNaN(joint.get("y_"))) y_ = joint.get("y_");

          let GCS_X = matrix([x_, y_, 1]);
          let canvasX = multiply(mat, GCS_X);

          if (typeof entity == "string"){
            state = state.updateIn([entity, jointId, "x"], x => canvasX.get([0]));
            state = state.updateIn([entity, jointId, "y"], y => -canvasX.get([1]));
          } else {
            state = state.updateIn(entity.concat([jointId, "x"]), x => canvasX.get([0]));
            state = state.updateIn(entity.concat([jointId, "y"]), y => -canvasX.get([1]));
          }
        })
      }
  })

  return state;
};

export const updateMultiSelectionRectangleTranslation = state => {
  if (state.getIn(["multiSelectionRectangle", "x"]) !== null){
    const mat = getTransformationMatrix(state); //Global-> HTML Canvas coordinate system.
    let GCS_X = [state.getIn(["multiSelectionRectangle", "x_"]), state.getIn(["multiSelectionRectangle", "y_"]), 1]
    let canvasX = multiply(mat, GCS_X);
    state = state.setIn(["multiSelectionRectangle", "x"], canvasX.get([0]))
    state = state.setIn(["multiSelectionRectangle", "y"], -canvasX.get([1]))
  }
  return state
}

export const updateMultiSelectionRectangleScale = (state, deltaScale) => {
  if (state.getIn(["multiSelectionRectangle", "x"]) !== null){
    state = state.updateIn(["multiSelectionRectangle", "width"], wt => wt * deltaScale )
    state = state.updateIn(["multiSelectionRectangle", "height"], ht => ht * deltaScale )
  }
  return state
}

export const updateCouplerCurves = state => {
  let mat = getTransformationMatrix(state);
  let jointSets = ["joints", ["freeFormLinksAndJoints", "joints"]]
  jointSets.forEach(joints=>{
    let list;
    if (typeof joints == "string")
      list = state.get(joints)
    else
      list = state.getIn(joints)
    list.forEach((joint, jointId, iter) => {
      joint.get("curve").forEach((point, i_) => {
        let x_ = point.x_;
        let y_ = point.y_;
        let GCS_X = matrix([x_, y_, 1]);
        let canvasX = multiply(mat, GCS_X);
        let jd;
        if (typeof joints == "string")
          state = state.updateIn([joints, jointId, "curve", i_], pt => {
            pt.x = canvasX.get([0]);
            pt.y = -canvasX.get([1]);
            return pt;
          });
        else
          state = state.updateIn(joints.concat([jointId, "curve", i_]), pt => {
            pt.x = canvasX.get([0]);
            pt.y = -canvasX.get([1]);
            return pt;
          });
      });
    });
  })

  return state;
};

export const inverseUpdateCouplerCurves = state => {
  let mat = getInverseTransformationMatrix(state);
  state.get("joints").forEach((joint, jointId, iter) => {
    joint.get("curve").forEach((point, i_) => {
      let x = point.x;
      let y = point.y;
      let canvasX = matrix([x, -y, 1]);
      let GCS_X = multiply(mat, canvasX);
      state = state.updateIn(["joints", jointId, "curve", i_], pt => {
        pt.x_ = GCS_X.get([0]);
        pt.y_ = GCS_X.get([1]);
        return pt;
      });
    });
  });

  return state;
};

export const updateBackgroundImage = state => {
  let image = state.getIn(["backgroundImage", "image"]);
  let imageSrc = state.getIn(["backgroundImage", "imageSrc"]);
  if (!image && imageSrc){
    image = new Image()
    image.src = imageSrc
    state = state.setIn(["backgroundImage", "image"], image);
  }
  if (image !== null) {
    let mat = getTransformationMatrix(state);
    let x_ = state.getIn(["backgroundImage", "dx_"]);
    let y_ = state.getIn(["backgroundImage", "dy_"]);
    let GCS_X = matrix([x_, y_, 1]);
    let canvasX = multiply(mat, GCS_X);
    state = state.setIn(["backgroundImage", "dx"], canvasX.get([0]));
    state = state.setIn(["backgroundImage", "dy"], -canvasX.get([1]));
  }
  return state;
};

export const inverseUpdateBackgroundImage = state => {
  let image = state.getIn(["backgroundImage", "image"]);
  if (image !== null) {
    let mat = getInverseTransformationMatrix(state);
    let x = state.getIn(["backgroundImage", "dx"]);
    let y = state.getIn(["backgroundImage", "dy"]);
    let canvasX = matrix([x, -y, 1]);
    let GCS_X = multiply(mat, canvasX);
    state = state.setIn(["backgroundImage", "dx_"], GCS_X.get([0]));
    state = state.setIn(["backgroundImage", "dy_"], GCS_X.get([1]));
  }
  return state;
};

export const getPointSide = (point1, point2, qPoint) => {
  return Math.sign(
    (point2.x - point1.x) * (qPoint.y - point1.y) -
      (point2.y - point1.y) * (qPoint.x - point1.x)
  );
};

export const findEndforJointId = (state, linkId, jointId) => {
  // finds end name for jointId on the given link
  // ex. links = {1: { joint1: {id: 4}}}
  // for jointId 4, linkId 1, end is 'joint1'
  let link = state.getIn(["links", linkId]);
  if (link.getIn(["joint1", "id"]) === jointId) return "joint1";
  if (link.getIn(["joint2", "id"]) === jointId) return "joint2";
  if (link.getIn(["joint3", "id"]) === jointId) return "joint3";
  if (link.getIn(["joint4", "id"]) === jointId) return "joint4";
  if (link.getIn(["joint5", "id"]) === jointId) return "joint5";
};

export const isVirtualJoint = (state, jointId) => {
   let found = false
   state.getIn(['joints', jointId, 'links']).forEach((linkId, linkid, self)=>{
       if (linkId !== 'groundLink'){
       let end = findEndforJointId(state, linkId, jointId)
       if ((state.getIn(['links', linkId, 'linkType']) === 'PR' || state.getIn(['links', linkId, 'linkType']) === 'RP' ) && end === 'joint3')
          found = true
       }
   });
   return found
}

export const get_GCS_points = (state, points="points") => {
     if (typeof points == "string"){
        state.get(points).forEach((point, ind, self )=>{
            let mat = getInverseTransformationMatrix(state)
            let canvasX = matrix([point.x, -point.y, 1])
            // coordinates in Global CS
            let GCS_X = multiply(mat, canvasX)
            state = state.updateIn([points, ind], pt => {
                    pt.x_ = GCS_X.get([0])
                    pt.y_ = GCS_X.get([1])
                    return pt
            });
        });
     }
     else {
        state.getIn(points).forEach((point, ind, self )=>{
            let mat = getInverseTransformationMatrix(state)
            let canvasX = matrix([point.x, -point.y, 1])
            // coordinates in Global CS
            let GCS_X = multiply(mat, canvasX)
            state = state.updateIn(points + [ind], pt => {
                    pt.x_ = GCS_X.get([0])
                    pt.y_ = GCS_X.get([1])
                    return pt
            });
        });
     }
    return state
}

export const updatePoints = (state, points='points') => {
  let mat = getTransformationMatrix(state)
  if (typeof points == "string"){
    state.get(points).forEach( (point, id, iter) => {
       let GCS_X = matrix([ point.x_, point.y_, 1])
       let canvasX = multiply(mat, GCS_X)
       state = state.updateIn([points, id], pt => {
                pt.x = canvasX.get([0])
                pt.y = -canvasX.get([1])
                return pt
       })
    });
  } else {
    state.getIn(points).forEach( (point, id, iter) => {
       let GCS_X = matrix([ point.x_, point.y_, 1])
       let canvasX = multiply(mat, GCS_X)
       let ptid = points.slice()
       ptid.push(id)
       state = state.updateIn(ptid, pt => {
                pt.x = canvasX.get([0])
                pt.y = -canvasX.get([1])
                return pt
       })
    })
  }
  return state
}

export const recursivelyUpdateLinkedRegularJoints = (state, linkId, exploredSet = new Set(), regJointSet = new Set()) => {
  //console.log("link", linkId)
  if (!exploredSet.has(linkId)){
    exploredSet.add(linkId)
    if (state.hasIn(["links", linkId, "dependentInlineJointSet"])){
      state.getIn(["links", linkId, "dependentInlineJointSet"]).forEach( inlineJointId => {
         let regJId = state.getIn(["inlineJoints", inlineJointId, "connectedJointId"])
         if (regJId !== null && !regJointSet.has(regJId)){
           regJointSet.add(regJId)
           //console.log("reg", regJId, "inlineJointId", inlineJointId)
           let inlineJointSet = state.getIn(["joints", regJId, "inlineJointSet"])
           if (inlineJointSet !== undefined && inlineJointSet.has(inlineJointId)){
              // connected inlineJoints
              let point = getInlineJoint(state, inlineJointId)
              state = setPoint(state, regJId, point.x, point.y);
              state.getIn(["joints", regJId, "links"]).forEach( lId => {
                state = recursivelyUpdateLinkedRegularJoints(state, lId, exploredSet, regJointSet)
              })
           }
         }
      })
    }
  }
  return state
}

export const updateLinkedJoints = (state, jointIdList) => {
  jointIdList.forEach( jointId => {
    state.getIn(["joints", jointId, "links"]).forEach(linkId => {
      if (linkId !== "groundLink") {
        state = recursivelyUpdateLinkedRegularJoints(state, linkId);
        if (
          state.hasIn(["links", linkId, "dependentInlineJointSet"]) &&
          state.getIn(["links", linkId, "dependentInlineJointSet"]).size > 0 &&
          state.hasIn(["links", linkId, "snappified"])
        ) {
          state = snappifyLink(state, linkId);
        } else if (
          state.hasIn(["links", linkId, "dependentInlineJointSet"]) &&
          state.getIn(["links", linkId, "dependentInlineJointSet"]).size > 0
        ) {
          state = validateInlineJoints(state, linkId)
        }
      }
    });
  })
  return state
}

export const transformJoints = (state, mat, newJointSet=null) => {
  // if newJointSet is not null, this function only transforms newly added joints given in newJointSet
  state.get("joints").forEach((joint, jointId, iter) => {
    if (joint.get("lock"))
      return
    if (newJointSet === null || newJointSet.has(jointId)){
      let x_ = 0
      let y_ = 0
      if (!isNaN(joint.get("x_")))
         x_ = joint.get("x_")

      if (!isNaN(joint.get("y_")))
         y_ = joint.get("y_")

      let old_X = matrix([x_, y_, 1]);
      let new_X = multiply(mat, old_X);
      state = state.updateIn(["joints", jointId, "x_"], x => new_X.get([0]));
      state = state.updateIn(["joints", jointId, "y_"], y => new_X.get([1]));
    }
  });
  // if all joints are transformed, there is no need ot updating linked joints,
  // they are automatically transformed
  if (newJointSet !== null){
    state = updateLinkedJoints(state, newJointSet)
  }

  return state;
}

export const getCornerFixedPivots = state => {
  // finds jointIndexes for x_min, y_min, x_max, y_max
  let x_min=Infinity, y_min=Infinity, x_max=-Infinity, y_max =-Infinity;
  let x_min_=null, y_min_=null, x_max_=null, y_max_ =null;
  // incase when no RR link or valid link is present
  let validLinks = false
  state.get("links").forEach((link, linkdId) =>{
    if (link.get("linkType") === constants.LINK_TYPE.RR){
      ["joint1", "joint2", "joint3", "joint4", "joint5"].forEach(end => {
        if (link.has(end)){
          let joint = state.getIn(["joints", link.getIn([end, "id"])])
          if (joint.get("isGround")){
            if (joint.get("x") > x_max){
              x_max = joint.get("x")
              x_max_ = joint.get("x_")
            }
            if (joint.get("y") > y_max){
              y_max = joint.get("y")
              y_max_ = joint.get("y_")
            }
            if (joint.get("x") < x_min){
              x_min = joint.get("x")
              x_min_ = joint.get("x_")
            }
            if (joint.get("y") < y_min){
              y_min = joint.get("y")
              y_min_ = joint.get("y_")
            }
            if (!validLinks)
              validLinks = true
          }
        }
      })
    }
  })
  if (validLinks){
    let min = imMap({x: x_min, y: y_min, x_:x_min_, y_:y_min_})
    let max = imMap({x: x_max, y: y_max, x_:x_max_, y_:y_max_})
    state = state.set("cornerFixedPivots", imMap({min:min, max:max}))
  }
  return state
}

export const getResetViewParameters = state => {
  return null
}

export const getSelectionRectangleParas_links = (state, linkSet) => {
  return null
}

export const allotPlanes = state => {
  if (state.get("joints").size !== 0) {
    let graph = new Map();
    state.get("joints").forEach((joint, jointId) => {
      let linkArr = joint.get("links").toJS();
      for (let i = 0; i < linkArr.length; i++) {
        for (let j = 0; j < linkArr.length; j++) {
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
    let linkSet = getDrivingLinks(state)

    if (graph.size !== 0){
      let linkArr = graph.get("groundLink")
      if (linkArr != undefined){
        linkArr.sort((a, b) => {
          // actuation link should be the first one to get assigned
          if (linkSet.has(a))
            {return -1}
          if (linkSet.has(b))
            {return 1}
          if (a < b) { return -1; }
          if (a > b) { return 1; }
          if (a === b) { return 0; }
        })
        // console.log("after", graph)
        let explored = new Set();
        let link, plane;

        explored.add("groundLink");
        let stack = [["groundLink", 1]];
        while (stack.length !== 0) {
            let stacked = stack.splice(0, 1);
            link = stacked[0][0];
            plane = stacked[0][1];
            //if (link !== "groundLink") {
            //  state = state.setIn(["links", link, "plane"], plane);
            //}
            let p = 1;
            //console.log("Node", link, plane);
            for (let i = 0; i < graph.get(link).length; i++) {
              //console.log("Neighbor", graph.get(link)[i], "explored set :", explored);
              if (!explored.has(graph.get(link)[i])) {
                for (let j = 0; j < graph.get(graph.get(link)[i]).length; j++) {
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
                    if (
                      plane + p ===
                      state.getIn([
                        "links",
                        graph.get(graph.get(link)[i])[j],
                        "plane"
                      ])
                    ) {
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

export const getFixedJointId = (state, linkId) => {
  // returns the coordinates of joint among 'joint1', 'joint2',..
  let ends = ["joint1", "joint2", "joint3", "joint4"]
  for (let i=0; i<ends.length; i++){
      let id = state.getIn(["links", linkId, ends[i], "id"])
      if (id !== undefined){
        if(state.getIn(["joints", id, "isGround"])){
            return id
        }
      }
  }
  return null
}

export const getJointSet = (state, linkSet, visibleOnly=false) => {
    let jointSet = new Set() //stores newly added joints for transforming them
    let joints = ["joint1", "joint2", "joint3", "joint4", "joint5"]
    linkSet.forEach( linkId => {
      let newLink = state.getIn(["links", linkId])
      joints.forEach( end => {
         let condition = true
         if (visibleOnly){
           if (newLink.get("linkType") !== "RR" && end == "joint3"){
             condition = false
           }
         }
         if (newLink.has(end) && condition){
            // create a new joint and map it to end
            let jointId = state.getIn(["links", linkId, end, "id"])
            jointSet.add(jointId)
         }
      })
    })
    return jointSet
}

export const duplicateSelection = state => {
    // copying links, joints, poses and (shapes not implemented TODO for zhijie)
    let pasteLinkMap = new Map() //hashmap that stores newIds => originalIds
    let pasteJointMap = new Map() //hashmap that stores newIds => originalIds
    let newJointSet = new Set() //stores newly added joints for transforming them
    let newLinkSet = [] //stores newly added joints for transforming them
    let newLinkId = null
    let joints = ["joint1", "joint2", "joint3", "joint4", "joint5"]
    let selectedLinkSet;
    if (state.get("mode") === "multiSelect"){
      selectedLinkSet = state.getIn(["multiSelectionSet", "links"])
    }
    // this logic needs re-design. if a shape should follow such logic.
    else if (state.get("selectedLink") !== null){
      selectedLinkSet = imSet([state.get("selectedLink")])
    }

    if (selectedLinkSet !== undefined){
      if (selectedLinkSet.size > 0){

        selectedLinkSet.forEach( linkId => {
          newLinkId = getNewId(state, "links")
          pasteLinkMap.set(linkId, newLinkId)
          newLinkSet.push(newLinkId)

          //// copying link, then replacing joint ids with new joints
          let newLink = state.getIn(["links", linkId])
          joints.forEach( end => {
             if (newLink.has(end)){
                // create a new joint and map it to end
                let newJoint, newJointId, linkSet;
                let jointId = state.getIn(["links", linkId, end, "id"])
                if (pasteJointMap.has(jointId)){
                    // this joint has occurred before in pasting a previous link
                  newJointId = pasteJointMap.get(jointId)
                  newJoint = state.getIn(["joints", pasteJointMap.get(jointId)])
                  linkSet = newJoint.get("links")
                } else {
                  newJoint = state.getIn(["joints", jointId])
                  newJointId = getNewId(state, "joints")
                  // for now, temparary translation
                  pasteJointMap.set(jointId, newJointId)
                  newJointSet.add(newJointId)
                  // now remove linkIds in the links which are not selected
                  linkSet = newJoint.get("links").intersect(selectedLinkSet)
                }
                linkSet.forEach( linkedLinkId => {
                  if (pasteLinkMap.has(linkedLinkId)){
                      linkSet = linkSet.add(pasteLinkMap.get(linkedLinkId))
                      linkSet = linkSet.remove(linkedLinkId)
                  }
                })

                newJoint = newJoint.set("links", linkSet)

                newLink = newLink.setIn([end, "id"], newJointId)
                state = state.setIn(["joints", newJointId], newJoint)
             }
          })
          state = state.setIn(["links", newLinkId], newLink)
          if (state.hasIn(["links", linkId, "dependentInlineJointSet"])){
            state.getIn(["links", linkId, "dependentInlineJointSet"]).forEach( inlineJointId => {
              //since inlineJointId are exlusive for each link, there can not be a inlineJoint which is shared between two links
              let newInlineJointId = getNewId(state, "inlineJoints")
              let inlineJoint = state.getIn(["inlineJoints", inlineJointId])
              inlineJoint = inlineJoint.set("linkId", newLinkId)
              inlineJoint = inlineJoint.set("connectedJointId", null)
              newLink = newLink.update("dependentInlineJointSet", st => {
                st = st.remove(inlineJointId)
                st = st.add(newInlineJointId)
                return st
              })
              state = state.setIn(["inlineJoints", newInlineJointId], inlineJoint)
              if (inlineJoint.get("highlightException")){
                state = createNewDummyJointForInlineJoint(state, newInlineJointId)
              }
            })
          }
          state = state.setIn(["links", newLinkId], newLink)
        })
        let mat = getTransformationMatrix(null, {tx:state.getIn(["duplicateProps", "x_"]), ty:state.getIn(["duplicateProps", "y_"]), theta:0, scale:1})
        state = transformJoints(state, mat, newJointSet)
        state = state.setIn(["multiSelectionSet", "links"], imSet(newLinkSet))
        }
    }

    // to duplicate a shape: see duplicate_selectedShape.
    return state
}

export const increaseOpacity = (color, val=0.3) => {
    // assumes color format as rbga = "rgba(5,3,1,0.8)"
    color = color.substr(0, color.length-4) + (parseFloat(color.substr(color.length-4, color.length-1)) + val) +  ")"
    return color
}

export const getContrastColor = (color) => {
    return color === constants.LINK_COLOR ? constants.COUPLER_COLOR : constants.COUPLER_COLOR
}

export const setSnappyXOPivotsForPR = (jointsJs, jointId1, jointId2, jointId3, state) => {
  // joint1 and joint2 are visible joints of PR link
  // obtain fixed points P1 and P2 for the stationary part of the slider link
  // P1 and P2 should lie on the grid
  // recompute joint1 and joint2
  // joint1 and joint2 are changed in-place inside the function
  let joint1 = jointsJs[jointId1]
  let joint2 = jointsJs[jointId2]
  let l = getDistance(joint1, joint2, undefined, undefined, true)
  let theta = getInclination(joint1, joint2, true)
  let d = constants.PR_OFFSET  * state.getIn(["GCS", "scale"]) / 120 / 120;
  let P1 = {
      x_ : joint1.x_ + l/2*Math.cos(theta) + d*Math.sin(theta),
      y_ : joint1.y_ + l/2*Math.sin(theta) - d*Math.cos(theta),
  }
  let P2 = {
      x_ : joint1.x_ + l/2*Math.cos(theta) - d*Math.sin(theta),
      y_ : joint1.y_ + l/2*Math.sin(theta) + d*Math.cos(theta),
  }
  P1.x_ = Math.round(P1.x_/(constants.XOstep/2)) * (constants.XOstep/2)
  P1.y_ = Math.round(P1.y_/(constants.XOstep/2)) * (constants.XOstep/2)
  P2.x_ = Math.round(P2.x_/(constants.XOstep/2)) * (constants.XOstep/2)
  P2.y_ = Math.round(P2.y_/(constants.XOstep/2)) * (constants.XOstep/2)
  let theta_ = getInclination(P1, P2, true) - Math.PI/2

  jointsJs[jointId1].x_ = P1.x_ - l/2*Math.cos(theta_) - d*Math.sin(theta_)
  jointsJs[jointId1].y_ = P1.y_ - l/2*Math.sin(theta_) + d*Math.cos(theta_)

  jointsJs[jointId2].x_ = P1.x_ + l/2*Math.cos(theta_) - d*Math.sin(theta_)
  jointsJs[jointId2].y_ = P1.y_ + l/2*Math.sin(theta_) + d*Math.cos(theta_)

  const canvas = document.getElementById(state.get("canvasId"));
  let R = Math.max(canvas.width, canvas.height) * state.get("RFactor") * state.getIn(["GCS", "scale"]) / 120 / 120;
  jointsJs[jointId3].x_ = jointsJs[jointId1].x_ + R * Math.cos(theta_ + Math.PI/2)
  jointsJs[jointId3].y_ = jointsJs[jointId1].y_ + R * Math.sin(theta_ + Math.PI/2)
}

export const addInlineJoint = (state, action, dist=null, offset=0, isX = false) => {
    // add an inlineJoint on a link at distance dicteted by mouse click
    if (action.linkId === undefined || action.linkId === null)
      throw new Error("link is not selected");
    let newId = getNewId(state, "inlineJoints")
    let joint1, joint2;
    if (action.RPCoupler){
      joint1 = getJoint(state, action.linkId, action.end3);
      joint2 = getJoint(state, action.linkId, action.end4);
    } else {
      joint1 = getJoint(state, action.linkId, action.end1);
      joint2 = getJoint(state, action.linkId, action.end2);
    }
    if (dist === null){
      let mat = getInverseTransformationMatrix(state);
      // coordinates in Canvas CS (with Y up)
      let loc = multiply(mat, matrix([action.xDragging, -action.yDragging, 1]));
      let pt = {x_:loc.get([0]), y_:loc.get([1])}
        // coordinates in Global CS
      dist = getDistance(joint1, pt, undefined, undefined, true)
      if ((state.getIn(["links", action.linkId, "linkClass"]) !== "binary" && state.getIn(["links", action.linkId, "linkType"]) === constants.LINK_TYPE.RR) || action.RPCoupler){
        let angle1 = getInclination(joint1, pt, true)
        let angle2 = getInclination(joint1, joint2, true)
        offset = angle1 - angle2
      }
    }

    let newInlineJoint = imMap({ joint1: action.end1, joint2: action.end2, joint3: action.end3, joint4: action.end4, joint5: action.end5, RPCoupler: action.RPCoupler, linkId:action.linkId, offsetAngle: offset, connectedJointId: null, type: isX ? constants.xSlot : constants.oSlot, highlightException: action.highlightException })
    state = state.setIn(["inlineJoints", newId], newInlineJoint)

    //adding dist via seperate function
    state = setInlineJointDist(state, newId, dist, offset)

    state = state.updateIn(["links", action.linkId, "dependentInlineJointSet"], set => {
            if (set === undefined)
               set = imSet([])
            set = set.add(newId)
            return set
    })

    return state
}

export const snappifyLink = (state, linkId) => {
  if (linkId === undefined || linkId === null)
    throw new Error("link is not selected");

  state = state.setIn(["links", linkId, "snappified"], true)
  state.get("inlineJoints").forEach( (inlineJoint, inlineJointId) => {
    if (inlineJoint.get("linkId") === linkId && inlineJoint.get("connectedJointId") === null){
       state = deleteInlineJoint(state, inlineJointId)
    }
  })

  let endslist = []
  if (state.getIn(["links", linkId, "linkClass"]) === "binary" && state.getIn(["links", linkId, "linkType"]) === constants.LINK_TYPE.RR) {
    endslist.push(["joint1", "joint2", undefined])
  } else if (state.getIn(["links", linkId, "linkType"]) === constants.LINK_TYPE.PR){
    endslist.push(["joint1", "joint2", "joint3"])
  } else if (state.getIn(["links", linkId, "linkType"]) === constants.LINK_TYPE.RR) {
    endslist.push(["joint1", "joint2", "joint3"])
    endslist.push(["joint1", "joint3", "joint2"])
    endslist.push(["joint2", "joint3", "joint1"])
  }

  endslist.forEach( ends => {
    let newId = getNewId(state, "inlineJoints")
    let joint1 = getJoint(state, linkId, ends[0]);
    let joint2 = getJoint(state, linkId, ends[1]);
    let linkLength = getDistance(joint1, joint2, undefined, undefined, true)
    let step = constants.XOstep/2;
    let a = step
    let b = linkLength - step;
    //let roundLinkLength = Math.round(linkLength / (constants.XOstep / 2)) * (constants.XOstep/2);
    // console.log("linkLength", linkLength)
    let isX = true

    while (a <= b + 0.05){
      // console.log("drawing at l", ldist)
      state = addInlineJoint(state, {linkId: linkId, end1: ends[0], end2: ends[1], end3: ends[2]}, a, 0, isX)
      a += step
      isX = !isX
    }


  })
  state = validateInlineJoints(state, linkId)

  return state
}

export const validateInlineJoints = (state, linkId) => {
  if (linkId === undefined || linkId === null)
    throw new Error("link is not selected");
  if (state.getIn(["links", linkId, "linkClass"]) !== "binary"){
    return state
  }
  let maxdist = 0
  let mindist = 0
  state.getIn(["links", linkId, "dependentInlineJointSet"]).forEach( inlineJointId => {
     let inlineJoint = state.getIn(["inlineJoints", inlineJointId])
     let dist = state.getIn(["inlineJoints", inlineJointId, "dist"])
     if (state.get('viewMode') === constants.VIEW_MODE.SNAPPY_XO){
       dist = Math.round(dist / (constants.XOstep / 2)) * (constants.XOstep/2)
       state = setInlineJointDist(state, inlineJointId, dist)
     }
     if (dist > maxdist){
       maxdist = dist
     }
     if (dist < mindist){
       mindist = dist
     }
  })

  state = state.setIn(["links", linkId, "maxdist"], maxdist)
  state = state.setIn(["links", linkId, "mindist"], mindist)
  return state
}

export const getInlineJoint = (state, inlineJointId) => {
  let inlineJoint = state.getIn(["inlineJoints", inlineJointId])
  let joint1Id, joint2Id
  if (state.getIn(["inlineJoints", inlineJointId, "RPCoupler"])){
    joint1Id = state.getIn(["links", inlineJoint.get("linkId"), inlineJoint.get("joint3"), "id"]);
    joint2Id = state.getIn(["links", inlineJoint.get("linkId"), inlineJoint.get("joint4"), "id"]);
  } else {
    joint1Id = state.getIn(["links", inlineJoint.get("linkId"), inlineJoint.get("joint1"), "id"]);
    joint2Id = state.getIn(["links", inlineJoint.get("linkId"), inlineJoint.get("joint2"), "id"]);
  }
  let pt1 = state.getIn(["joints", joint1Id]).toJS()
  let pt2 = state.getIn(["joints", joint2Id]).toJS()
  let dist = inlineJoint.get("dist")
  let offsetAngle = inlineJoint.get("offsetAngle")
  // TODO: Sometimes pt1 or pt2 is undefined, need to find out which case
  let angle = getInclination(pt1, pt2, true)
  let point = getEndPoint(pt1, dist, angle + offsetAngle, true)
  let mat = getTransformationMatrix(state);
  let GCS_X = matrix([point.x_, point.y_, 1]);
  let canvasX = multiply(mat, GCS_X);
  point.x = canvasX.get([0])
  point.y = -canvasX.get([1])
  return point
}

export const setInlineJointDist = (state, inlineJointId, dist, offset=0) => {
  state = state.setIn(["inlineJoints", inlineJointId, "dist"], dist)
  state = state.setIn(["inlineJoints", inlineJointId, "offsetAngle"], offset)
  let inlineJoint = state.getIn(["inlineJoints", inlineJointId])
  state = state.updateIn(["links", inlineJoint.get("linkId"), "maxdist"], maxdist => {
     if (maxdist === undefined){
        maxdist = 0
     }
     maxdist = Math.max(maxdist, dist)
     return maxdist
  });
  state = state.updateIn(["links", inlineJoint.get("linkId"), "mindist"], mindist => {
     if (mindist === undefined){
        mindist = 0
     }
     mindist = Math.min(mindist, dist)
     return mindist
  });
  if (inlineJoint.get("connectedJointId") !== null){
    let pt = getInlineJoint(state, inlineJointId)
    state = setPoint(state, inlineJoint.get("connectedJointId"), pt.x, pt.y, "joints")
  }

  return state
}

export const setInlineJoint = (state, inlineJointId, x, y) => {
  let inlineJoint = state.getIn(["inlineJoints", inlineJointId])
  if (!state.hasIn(["links", inlineJoint.get("linkId")])){
    return deleteInlineJoint(state, inlineJointId)
  }
  let joint1Id, joint2Id
  if (state.getIn(["inlineJoints", inlineJointId, "RPCoupler"])){
    joint1Id = state.getIn(["links", inlineJoint.get("linkId"), inlineJoint.get("joint3"), "id"]);
    joint2Id = state.getIn(["links", inlineJoint.get("linkId"), inlineJoint.get("joint4"), "id"]);
  } else {
    joint1Id = state.getIn(["links", inlineJoint.get("linkId"), inlineJoint.get("joint1"), "id"]);
    joint2Id = state.getIn(["links", inlineJoint.get("linkId"), inlineJoint.get("joint2"), "id"]);
  }
  let pt1 = state.getIn(["joints", joint1Id]).toJS()
  let pt2 = state.getIn(["joints", joint2Id]).toJS()
  let mat = getInverseTransformationMatrix(state);
  // coordinates in Canvas CS (with Y up)
  let loc = multiply(mat, matrix([x, -y, 1]));
  let pt = {x_:loc.get([0]), y_:loc.get([1])}
  let offset = 0
    // coordinates in Global CS
  let lineInc = getInclination(pt1, pt2, true) //inclination of line pt1-pt2
  let ptAngle = getInclination(pt1, pt, true) // inclination of line pt1-pt
  let dist = getDistance(pt1, pt, undefined, undefined, true)
  if ((state.getIn(["links", inlineJoint.get("linkId"), "linkClass"]) !== "binary" && state.getIn(["links", inlineJoint.get("linkId"), "linkType"]) === constants.LINK_TYPE.RR) || state.getIn(["inlineJoints", inlineJointId, "RPCoupler"])){
    offset = ptAngle - lineInc
  } else {
    dist = dist*Math.cos(lineInc-ptAngle)
  }

  state = setInlineJointDist(state, inlineJointId, dist, offset)
  state = validateInlineJoints(state, inlineJoint.get("linkId"))

  return state
}

export const deleteInlineJoint = (state, inlineJointId) => {
  // removing inlineJointId from connected joint set
  let inlineJoint = state.getIn(["inlineJoints", inlineJointId])
  if (inlineJoint != undefined && inlineJoint.get("connectedJointId") !== null){
     state = state.updateIn(["joints", inlineJoint.get("connectedJointId"), "inlineJointSet"], st => st.remove(inlineJointId))
  }
  if (inlineJoint != undefined && state.hasIn(["links", inlineJoint.get("linkId")])){
    state = state.updateIn(["links", inlineJoint.get("linkId"), "dependentInlineJointSet"], st => st.remove(inlineJointId))
  }

  state = state.deleteIn(["inlineJoints", inlineJointId])
  return state
}

export const getOtherJointId = (state, linkId, jointId) => {
  // returns the first jointId different than current jointId
  let ends = ["joint1", "joint2", "joint3", "joint4"]
  for (let i=0; i<ends.length; i++){
      let id = state.getIn(["links", linkId, ends[i], "id"])
      if (id !== undefined){
        if(id !== jointId){
            return id
        }
      }
  }
  return null
}

export const createNewDummyJointForInlineJoint = (state, inlineJointId) => {
  let newJoint = getNewJoint(state, {}, false, "R", true, getInlineJoint(state, inlineJointId))
  state = state.setIn(["joints", newJoint.id], newJoint.joint)
  state = state.setIn(["joints", newJoint.id, "inlineJointSet"], imSet([inlineJointId]))
  state = state.setIn(["joints", newJoint.id, "snapping"], false)
  state = state.setIn(["inlineJoints", inlineJointId, "connectedJointId"], newJoint.id)
  // so that the inlineJoint should be highlighted when selected
  state = state.setIn(["inlineJoints", inlineJointId, "highlightException"], true)
  return state
}

export const setInlineJointSetForJoint = (state, jId, inlineJointSet) => {
  if (state.getIn(["joints", jId, "inlineJointSet"]) !== null && state.getIn(["joints", jId, "inlineJointSet"]) !== undefined){
    state.getIn(["joints", jId, "inlineJointSet"]).forEach( inlineJointId => {
      if (!inlineJointSet.has(inlineJointId)){
        // true means this joint is not goint to be in the future inlineJointSet
        // creating new joint for it only if it is not generated by snappifying entire link
        if (state.getIn(["inlineJoints", inlineJointId, "highlightException"])){
          state = createNewDummyJointForInlineJoint(state, inlineJointId)
        }
      }
    })
  }

  inlineJointSet.forEach(inlineJointId => {
      let prevJId = state.getIn(["inlineJoints", inlineJointId, "connectedJointId"])
      if (prevJId !== null && prevJId !== jId){
        // delete this joint if dummy
        state = deleteJoint(state, prevJId)
      }
    state = state.setIn(["inlineJoints", inlineJointId, "connectedJointId"], jId)
  });

  state = state.updateIn(["joints", jId], jt =>
    jt.set("inlineJointSet", inlineJointSet)
  )
  return state
}

export const getPointsForConvexHull = (state, linkId, jointArray) => {
  let points = []
  let explored = new Set()
  jointArray.forEach( jointId => {
    if (state.hasIn(["joints", jointId])){
      let pt = state.getIn(["joints", jointId]).toJS()
      let key = Math.round(pt.x) + "," + Math.round(pt.y)
      if (!explored.has(key)){
        points.push({x: pt.x, y:pt.y})
        explored.add(key)
      }
    }
  })

  if (state.hasIn(["links", linkId, "dependentInlineJointSet"])){
    state.getIn(["links", linkId, "dependentInlineJointSet"]).forEach( inlineJointId => {
      let jointId = state.getIn(["inlineJoints", inlineJointId, "connectedJointId"])
      if (jointId !== null && state.hasIn(["joints", jointId])){
        let pt = state.getIn(["joints", jointId]).toJS()
        let key = Math.round(pt.x) + "," + Math.round(pt.y)
        if (!explored.has(key)){
          points.push({x: pt.x, y:pt.y})
          explored.add(key)
        }
      }
    })
  }

  let mat = getInverseTransformationMatrix(state);      //GCf_matrix
  for (let i = 0; i < points.length; i++){
    let canvasX = matrix([points[i].x, -points[i].y, 1]); //point in Cf system.
    let GCS_X = multiply(mat, canvasX);
    points[i].x_ = GCS_X.get([0]);
    points[i].y_ = GCS_X.get([1]);
  }

  return points
}
