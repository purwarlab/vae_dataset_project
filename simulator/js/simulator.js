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
  branch: Branch.ONE,
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
