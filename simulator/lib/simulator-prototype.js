Object.defineProperty(exports, "__esModule", {
    value: true
});

var _interpret = require("./interpret.js");

var _mathjs = require("mathjs");


var isFloat = (value) => {
    return typeof value === 'number' && !isNaN(value) && value % 1 !== 0;
}
  
let consoleShowCount = 0;

var rMatNoBrainer = exports.rMatNoBrainer = [
    [1, 1, 1, 1, 1], 
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1]
]

/**
 * Create a zeros given the input shape. 
 * @param {*} shapeArg shape of zero multi dimension array. 
 */
var zeros = exports.zeros = (shapeArg = []) => {
    let shape = JSON.parse(JSON.stringify(shapeArg));
    let sum = 1;
    while(shape.length > 0){
        sum = sum*shape.pop()
    };
    shape = JSON.parse(JSON.stringify(shapeArg))
    let dataIn = [];
    let dataOut = [];
    let dataMid = [];
    for(let i = 0; i<sum;i++){
        dataIn.push(0);
    };
    while(shape.length > 0){
        let counter = 0;
        let lastDim = shape.pop(0)
        while (counter < dataIn.length) {
            for (let i = 0; i<lastDim; i++) {
                dataMid.push(dataIn[counter]);
                counter = counter + 1;
            }
            dataOut.push(dataMid)
            dataMid = [];
        }
        dataIn = dataOut;
        dataOut = [];
    }
    return dataIn[0]
};

/**
 * Create a zeros given the input shape. 
 * @param {*} shapeArg shape of "value" multi dimension array. 
 */
var values = exports.values = (shapeArg = [], value = null) => {
    let shape = JSON.parse(JSON.stringify(shapeArg));
    let sum = 1;
    while(shape.length > 0){
        sum = sum*shape.pop()
    };
    shape = JSON.parse(JSON.stringify(shapeArg));
    let dataIn = [];
    let dataOut = [];
    let dataMid = [];
    for(let i = 0; i<sum;i++){
        dataIn.push(value);
    };
    while(shape.length > 0){
        let counter = 0;
        let lastDim = shape.pop(0)
        while (counter < dataIn.length) {
            for (let i = 0; i<lastDim; i++) {
                dataMid.push(dataIn[counter]);
                counter = counter + 1;
            }
            dataOut.push(dataMid)
            dataMid = [];
        }
        dataIn = dataOut;
        dataOut = [];
    }
    return dataIn[0]
};

/**
 * Flatten the input data to one dimension. 
 * @param data is some array of array or numbers. 
 */
 var flatten = exports.flatten = (data = []) => {
    let strippedData = [];
    for (let i = 0; i< data.length; i++) {
        if (typeof data[i] === 'number') {
            strippedData.push(data[i]) 
        } else {
            strippedData = strippedData.concat(stripData(data[i]))
        }
    };
    return strippedData
};

/**
 * more or less this works like np.reshape or reshape function in mathjs.
 * this also deep copies the array.
 * unlike that in numjs, this would cause memory leak if the size of the data is too big. 
 * @param {*} data Incoming Data without dimension 
 * @param {*} shapeArg shape argument
 * @returns 
 */
var reshape = exports.reshape = (data = [], shapeArg = []) => {
    let shape = JSON.parse(JSON.stringify(shapeArg));
    let dataOut = [];
    let dataMid = [];
    let dataIn = flatten(data);
    while(shape.length > 0){
        let counter = 0;
        let lastDim = shape.pop(0)
        while (counter < dataIn.length) {
            for (let i = 0; i<lastDim; i++) {
                dataMid.push(dataIn[counter]);
                counter = counter + 1;
            }
            dataOut.push(dataMid)
            dataMid = [];
        }
        dataIn = dataOut;
        dataOut = [];
    }
    return dataIn[0]
};

/**
 * From an online code. Find the maximum value of a given set of numbers. Infinite dimension. 
 * @param {*} [] any array of array
 * @returns {Number} max value of the given input 
 */
var getMax = exports.getMax = (a = []) => {
    return Math.max(...a.map(e => Array.isArray(e) ? getMax(e) : e));
};

/**
 * @param list will return the norm. 
 */
var norm = exports.norm = (list = []) => {
    let sum = 0;
    for (let i = 0; i< list.length;i++) {
        sum = sum + Math.pow(list[i],2)
    }
    return Math.sqrt(sum)
};

/**
 * Add zeros to the last dimension (a,b,c+1)
 * @param arr input array of array.
 */
 var addZeroColumn = exports.addZeroColumn = (arr = []) => {
    if (arr.length === 0) {
        return [0]
    }
    else if(typeof arr[0] === 'number')  { // this is an array of numbers. 
        let receiver = arr.slice()
        receiver.push(0);
        return receiver
    } else { // this is an array of array 
        let receiver = []
        for (let i =0; i < arr.length; i++) {
            receiver.push(addZeroColumn(arr[i]))
        }
        return receiver
    }
};

/**
 * Remove one column in the last dimension (a,b,c-1)
 * @param arr input array of array.
 */
 var removeColumn = exports.removeColumn = (arr = []) => {
    if (arr.length === 0) {
        return []
    }
    else if(typeof arr[0] === 'number')  { // this is an array of numbers. 
        let receiver = arr.slice()
        receiver.pop();
        return receiver
    } else { // this is an array of array 
        let receiver = []
        for (let i =0; i < arr.length; i++) {
            receiver.push(removeColumn(arr[i]))
        }
        return receiver
    }
};

/**
 * Multiply a data with a scalar value. 
 * @param arr array, or however deep/many dimensions the array is. 
 */
var arrayMul = exports.arrayMul = (arr, val) => {
    if (arr.length === 0) {
        return [0]
    } else if (typeof arr[0] === 'number') {
        let receiver = arr.slice()
        for (let i =0; i < arr.length; i++) {
            receiver[i] = arr[i]*val;
        }
        return receiver
    } else {
        let receiver = []
        for (let i =0; i < arr.length; i++) {
            receiver.push(arrayMul(arr[i], val))
        }
        return receiver
    }
};

/**
 * Flips part of the array from the highest dimension. 
 * DOES NOT DO DEEP COPY. 
 * @param arr input 
 * @startIdx idx as the start to flip 
 * @endIdx idx as the end to flip
 */
var arrayFlip = exports.arrayFlip = (arr, startIdx, endIdx) => {
    let temp;
    arrN = [...arr]
    while (startIdx < endIdx) {
        temp = arr[startIdx]
        arrN[startIdx] = arr[endIdx]
        arrN[endIdx] = temp
        startIdx += 1;
        endIdx -= 1;
    }
    return arrN
}

/**
 * Returns the cdist, 0 if not linked, non-0 length if linked. 
 * @param tpMat the topology matrix. 
 * @param pos the initial positions. 
 * 
 */
var cdist = exports.cdist = (tpMat, pos) => {
    // console.log(tpMat, pos)
    // There's no cdist in vanilla js. 
    let distMat = zeros([tpMat.length, tpMat.length])
    // console.log(distMat)
    for (let i = 0; i< tpMat.length; i++) {
        for (let j = 0; j< tpMat.length; j++) {
            if (i < j) {
                let temp = Math.sqrt(Math.pow(pos[i][0] - pos[j][0],2) + Math.pow(pos[i][1] - pos[j][1],2))* Math.abs(tpMat[i][j])
                distMat[i][j] = temp;
                distMat[j][i] = temp;
            }
        }
    }
    return distMat;
};

/**
 * # Forward kinematics, which is self-explainatory. 
 * @param {*} step determines root and destination of chain.
 * @param {*} rMat speed/rate matrix that defines angle of change. 
 * @param {*} pos_init the pose before computation 
 * @param {*} unitConvert speed is usually stored in degree, thus it is necessary to convert into radian.
 * @returns 
 */
var computeChainByStep = exports.computeChainByStep = (step, rMat, pos_init, unitConvert = Math.PI/180) => {
    // javascript array with a shape of [joint#, (x,y,angle)]
    // pos_init = x, y, angle(cumulative angle).
    let pos_new = pos_init.map(function(arr) {return arr.slice()}); //This is always two levels deep.
    let [dest, _operation, root] = step;
    pos_new[dest][2] = rMat[root][dest]*unitConvert + pos_new[root][2];
    let c = Math.cos(pos_new[dest][2]);
    let s = Math.sin(pos_new[dest][2]);
    let posVect =  [
        pos_new[dest][0] - pos_new[root][0], // x
        pos_new[dest][1] - pos_new[root][1]  // y
    ];
    pos_new[dest][0] = posVect[0]*c-posVect[1]*s+pos_new[root][0]
    pos_new[dest][1] = posVect[0]*s+posVect[1]*c+pos_new[root][1]
    return pos_new 
};


/**
 * # Inverse kinematics: 
 * @param {*} step determines root and destination of chain. destination -> solution; root (the two center of circles)
 * @param {*} posRef the pose before computation shape is some (joitns, 2/3)
 * @param {*} distMat see computeDistMat
 * @param {*} threshold determines if the solution is okay (not too different from the last solution)
 * @returns {'state': posNew, 'isGood': false/true};
 */
var computeArcSectByStep = exports.computeArcSectByStep  = (step, posRef, distMat, threshold = 0.1) => { //, threshold = 0.1
    let posNew = posRef.map(function(arr) {return arr.slice();});
    let [ptSect, _operation, centers] = step;
    let [cntr1, cntr2] = centers
    let r1s = distMat[cntr1][ptSect]
    let r2s = distMat[cntr2][ptSect]
    if (r1s < 10e-12){
        posNew[ptSect] = posRef[cntr1].slice();
        return {
            'state': posNew, 
            'isGood': true
        };
    }else if(r2s < 10e-12){
        posNew[ptSect] = posRef[cntr2].slice();
        return {
            'state': posNew, 
            'isGood': true
        };
    }else{
        let ptOld  = posRef[ptSect]
        let ptCen1 = posRef[cntr1]
        let ptCen2 = posRef[cntr2]
        let d12 = Math.sqrt(Math.pow(ptCen1[0] - ptCen2[0], 2) + Math.pow(ptCen1[1] - ptCen2[1], 2));
        if (d12 > r1s+r2s || d12 < Math.abs(r1s - r2s)) {
            return {
                'state': posRef, 
                'isGood': false
            };
        }else if (Math.abs(r1s + r2s - d12) < 10e-12 || Math.abs(Math.abs(r1s - r2s) - d12) < 10e-12){  // # Singular point 
            // For example: 
            // Also a bad one. This usually means collinear, collinear usually means singularity, 
            // Unless the solution is in a same rigid body. 
            // I disable the calculation for fourbar because 3 joints collinear = 2 links collinear  
            // posNew[ptSect][0] = (ptCen1[0] + ptCen2[0])/2;
            // posNew[ptSect][1] = (ptCen1[1] + ptCen2[1])/2;
            //console.log('radius too small!' )
            return {
                'state': posRef, 
                'isGood': false
            };
        } else {
            // # a means the LENGTH from cntr1 to the mid point between two intersection points. 
            // # h means the LENGTH from the mid point to either of the two intersection points. 
            // # v means the Vector from cntr1 to the mid point between two intersection points. 
            // # vT 90 deg rotation of v
            let a = (Math.pow(r1s, 2) - Math.pow(r2s, 2) + Math.pow(d12, 2))/(d12*2);
            let h = Math.sqrt(Math.pow(r1s, 2) - Math.pow(a, 2));
            let v = [ptCen2[0] - ptCen1[0], ptCen2[1] - ptCen1[1]];
            let vT= [-v[1], v[0]];
            let r1= a/d12;
            let r2= h/d12;
            let ptMid= [ptCen1[0] + v[0]*r1, 
                        ptCen1[1] + v[1]*r1];
            let sol1 = [ptMid[0] + vT[0]*r2,
                        ptMid[1] + vT[1]*r2];
            let sol2 = [ptMid[0] - vT[0]*r2,
                        ptMid[1] - vT[1]*r2];
            if (Math.sqrt(Math.pow(sol1[0] -ptOld[0], 2) + Math.pow(sol1[1] -ptOld[1], 2)) > 
                Math.sqrt(Math.pow(sol2[0] -ptOld[0], 2) + Math.pow(sol2[1] -ptOld[1], 2))) {
                posNew[ptSect][0] = sol2[0];
                posNew[ptSect][1] = sol2[1];
            } else {
                posNew[ptSect][0] = sol1[0];
                posNew[ptSect][1] = sol1[1];
            }
            
            // This does not happen a lot, but just in case. 
            /*
            if (Math.sqrt(Math.pow(posNew[ptSect][0] -ptOld[0], 2) + Math.pow(posNew[ptSect][1] -ptOld[1], 2)) > threshold) {
                 return {
                     'state': posRef, 
                     'isGood': false
                 };
            }
            */
        }
        
        return {
            'state': posNew, 
            'isGood': true
        };
    }
};

/**
 * # Inverse kinematics: 
 * @param {*} step determines root and destination of chain. destination -> solution; root (the two center of circles)
 * @param {*} posRef the pose before computation shape is some (joitns, 2/3)
 * @param {*} distMat see computeDistMat
 * @param {*} threshold determines if the solution is okay (not too different from the last solution)
 * @returns {'state': posNew, 'isGood': false/true};
 */
var computeArcSectByStep110523 = exports.computeArcSectByStep110523  = (step, posRef, distMat, threshold = 0.1) => { //, threshold = 0.1
    let posNew = posRef.map(function(arr) {return arr.slice();});
    const [ptSect, _operation, centers] = step;
    const [cntr1, cntr2] = centers
    const r1s = distMat[cntr1][ptSect]
    const r2s = distMat[cntr2][ptSect]
    if (r1s < 10e-12){ // Too small: do not compute
        posNew[ptSect] = posRef[cntr1].slice();
        return {
            'state': posNew, 
            'isGood': true
        };
    }else if(r2s < 10e-12){ // Too small: do not compute
        posNew[ptSect] = posRef[cntr2].slice();
        return {
            'state': posNew, 
            'isGood': true
        };
    }else{
        // Value can be considered to be used to compute
        const ptOld  = posRef[ptSect]
        const ptCen1 = posRef[cntr1]
        const ptCen2 = posRef[cntr2]
        const d12 = Math.sqrt(Math.pow(ptCen1[0] - ptCen2[0], 2) + Math.pow(ptCen1[1] - ptCen2[1], 2));
        if (d12 > r1s+r2s || d12 < Math.abs(r1s - r2s)) { // Out of config space: No solution 
            return {
                'state': posRef, 
                'isGood': false
            };
        }
        else if (Math.abs(r1s + r2s - d12) < 10e-12 || Math.abs(Math.abs(r1s - r2s) - d12) < 10e-12){ // Co-linear condition 
            if (Math.abs(r1s - r2s) < 10e-12) { // The precondition1 is r1 and r2 are very close to each other 
                // The precondition2.1 is d12 is almost the same length as r1+r2. 
                // The precondition2.2 is d12 is also small because Math.abs(Math.abs(r1s - r2s) - d12) < 10e-12
                if (d12 > 10e-12) {
                    // distance makes sense 
                    // intersection point is in the middle  
                    // Singular solution 
                    let sol1 = [(ptCen2[0] + ptCen1[0])/2, (ptCen2[1] + ptCen1[1])/2];
                    posNew[ptSect][0] = sol1[0];
                    posNew[ptSect][1] = sol1[1];
                    return {
                        'state': posNew, 
                        'isGood': true
                    };
                } else {
                    // distance is too small 
                    // p1 and p2 coincides. 
                    // infinite solution 
                    return {
                        'state': posRef, 
                        'isGood': false
                    };
                }
            } else { // The precondition1 is r1 and r2 are different to each other 
                let v = [ptCen2[0] - ptCen1[0], ptCen2[1] - ptCen1[1]];
                if (d12 > 10e-12) { // intersection point is in the middle of two centers 
                    posNew[ptSect][0] = ptCen1[0]+ v[0]*(r1s)/d12;
                    posNew[ptSect][1] = ptCen1[1]+ v[1]*(r1s)/d12;
                    // Return general solution 
                    return {
                        'state': posNew, 
                        'isGood': true
                    };
                } else { // intersection point is in either out from left (p1), or right (p2). either r1s > r2s, or r2s > r1s
                    if (r1s > r2s) {
                        // on the right (p2) side 
                        v = [ptCen2[0] - ptCen1[0], ptCen2[1] - ptCen1[1]];
                        posNew[ptSect][0] = ptCen1[0]+ v[0]*(r1s)/d12;
                        posNew[ptSect][1] = ptCen1[1]+ v[1]*(r1s)/d12;
                        // Return general solution 
                        return {
                            'state': posNew, 
                            'isGood': true
                        };
                    } else{ 
                        // on the left side
                        v = [ptCen1[0] - ptCen2[0], ptCen1[1] - ptCen2[1]];
                        posNew[ptSect][0] = ptCen2[0]+ v[0]*(r2s)/d12;
                        posNew[ptSect][1] = ptCen2[1]+ v[1]*(r2s)/d12;
                        // Return general solution 
                        return {
                            'state': posNew, 
                            'isGood': true
                        };
                    }
                }

            }
            
        } else { // General non-co-linear condition 
            // # a means the LENGTH from cntr1 to the mid point between two intersection points. 
            // # h means the LENGTH from the mid point to either of the two intersection points. 
            // # v means the Vector from cntr1 to the mid point between two intersection points. 
            // # vT 90 deg rotation of v
            let a = (Math.pow(r1s, 2) - Math.pow(r2s, 2) + Math.pow(d12, 2))/(d12*2);
            let h = Math.sqrt(Math.pow(r1s, 2) - Math.pow(a, 2));
            let v = [ptCen2[0] - ptCen1[0], ptCen2[1] - ptCen1[1]];
            let vT= [-v[1], v[0]];
            let r1= a/d12;
            let r2= h/d12;
            let ptMid= [ptCen1[0] + v[0]*r1, 
                        ptCen1[1] + v[1]*r1];
            let sol1 = [ptMid[0] + vT[0]*r2,
                        ptMid[1] + vT[1]*r2];
            let sol2 = [ptMid[0] - vT[0]*r2,
                        ptMid[1] - vT[1]*r2];
            if (Math.sqrt(Math.pow(sol1[0] -ptOld[0], 2) + Math.pow(sol1[1] -ptOld[1], 2)) > 
                Math.sqrt(Math.pow(sol2[0] -ptOld[0], 2) + Math.pow(sol2[1] -ptOld[1], 2))) {
                posNew[ptSect][0] = sol2[0];
                posNew[ptSect][1] = sol2[1];
            } else {
                posNew[ptSect][0] = sol1[0];
                posNew[ptSect][1] = sol1[1];
            }
            // This does not happen a lot, but just in case. 
            if (Math.sqrt(Math.pow(posNew[ptSect][0] -ptOld[0], 2) + Math.pow(posNew[ptSect][1] -ptOld[1], 2)) > threshold) { // Out of threshold: too fast in change 
                 return {
                     'state': posRef, 
                     'isGood': false
                 };
            }
        }
        // Return general solution 
        return {
            'state': posNew, 
            'isGood': true
        };
        
    }

};

var computeNumericalByStep = exports.computeNumericalByStep = (step, posRef, distMat, optimKey, tol = 1e-10, maxIter = 300) => {
    let linkFunctions = step[2];
    // smallToBig, bigToSmall, smallToPos, posToSmall
    //let smallToBig = optimkey[0]; 
    //let bigToSmall = optimKey[1]; 
    let smallToPos = optimKey[2];
    let posToSmall = optimKey[3];
    let pos_new = posRef.map(function(arr) {return arr.slice()}); //This is always two levels deep.

    let numericalFunctions = {
        computeVectIJ: (xp, xq, xr, xs) => { // xp -> xi, xq -> xj, xr -> yi, xs -> yj
            return [xp-xq, xr-xs] 
        }, 
        computeDistIJ: (vectIJ) => {
            // it is called si in Zhijie's thesis 
            // vectIJ[0] -> v_1, vectIJ[1] -> v_2
            return Math.sqrt(vectIJ[0]**2 + vectIJ[1]**2)
        },
        computeRErrIJ: (r, distIJ) => {
            return 1 - r/distIJ
        },
        computeErrIJ: (r, distIJ) => {
            return (distIJ - r)**2
        },
        computeGradIJ: (vectIJ, ratioErrIJ) => {
            // #np.array([gradX, -gradX, gradY, -gradY]) #dF/dxp, dF/dxq, dF/dxr, dF/dxs 
            let gradx = vectIJ[0]*2*ratioErrIJ, grady = vectIJ[1]*2*ratioErrIJ;
            return [[gradx], [-gradx], [grady], [-grady]]
        },
        computeHmatIJ: (r, vectIJ, distIJ, ratioErrIJ) => {
            let temp1 = 2*(r/distIJ**3);              // t1
            let temp2 = [vectIJ[0]**2, vectIJ[1]**2]; // t2, t3
            let temp3 = vectIJ[0]*vectIJ[1];          // t4
            //#xpxp = xqxq [0], xrxr = xsxs [1]
            let HDiag = [temp1*(temp2[0]) + 2*ratioErrIJ, temp1*(temp2[1]) + 2*ratioErrIJ]; //#H1, H2
            //#xpxq = xqxp [0], xrxs = xsxr [1]
            let HSDim =[-HDiag[0], -HDiag[1]];                        //#-H1,-H2
            //#xpxr = xrxp = xqxs = xsxq
            let HDDimI= temp1*temp3;                  //#H3
            //#xpxs = xsxp = xqxr = xrxq
            let HDDimJ=-HDDimI  
            return [
                // xi,     xj,      yi,     yj
                [HDiag[0], HSDim[0], HDDimI, HDDimJ], // # [ H1,-H1, H3,-H3] xi
                [HSDim[0], HDiag[0], HDDimJ, HDDimI], // # [-H1, H1,-H3, H3] xj
                [HDDimI, HDDimJ, HDiag[1], HSDim[1]], // # [ H3,-H3, H2,-H2] yi
                [HDDimJ, HDDimI, HSDim[1], HDiag[1]], // # [-H3, H3,-H2, H2] yj
            ]
        },
        computeErrSum: (pos, linkFunctions, distMat, dispInfo = false) => {
            let errSum = 0;
            for (let k = 0; k < linkFunctions.length; k++) {
                let binlink = linkFunctions[k]
                let li = binlink[0];
                let lj = binlink[1];
                let dist = Math.sqrt((pos[li][0] - pos[lj][0])**2 + (pos[li][1] - pos[lj][1])**2)
                let err = (dist - distMat[li][lj])**2
                /*// Not happened here? Strange
                if (errSum == null) {
                    console.log('ji and pos', li, pos[li], 'jj and pos', lj, pos[lj], 'dist ', dist, 'with an error of', err)
                }
                //*/
                errSum += err;
            }
            //console.log('end with an errorSum of', errSum)
            return errSum
        },

        computeUpdatedPos: (pos, dirSmall, scale, smallToPos, posToSmall) => {
            let posUpdated = pos.map(function(arr) {return arr.slice()});  
            //console.log('fup', smallToPos)
            for (let i = 0; i< smallToPos.length; i += 2) { //dim = 2 (x,y)
                // one loop for two 
                let jix = smallToPos[i];
                let jiy = smallToPos[i+1];
                posUpdated[jix[0]][jix[1]] += dirSmall[i]*scale;
                posUpdated[jiy[0]][jiy[1]] += dirSmall[i+1]*scale;
            }
            return posUpdated
        }, 
        computeDescendScale: (pos, dir, linkFunctions, distMat, smallToPos, posToSmall) => {
            //# This is doing some gap reduce. This is golden section
            //# a c d b
            // returns [<update_scale>, <updated error>, <number of iterations>]
            let invphi = 0.61803398875; //# (math.sqrt(5) - 1) / 2  # 1 / phi
            let invphi2= 0.38196601125; //# (3 - math.sqrt(5)) / 2  # 1 / phi^2 
            let a = 0; // scaleMin 
            let b = 1; // scaleMax
            let h = b - a; // scale range 
            let tol = 1e-8;
            let sumA = numericalFunctions.computeErrSum(numericalFunctions.computeUpdatedPos(pos, dir, a, smallToPos, posToSmall), linkFunctions, distMat)
            let sumB = numericalFunctions.computeErrSum(numericalFunctions.computeUpdatedPos(pos, dir, b, smallToPos, posToSmall), linkFunctions, distMat)
            if (h <= tol) {
                if (sumA > sumB) {
                    return [b, sumB, 0]
                } else {
                    return [a, sumA, 0]
                }
            }
            //# Required steps to achieve tolerance
            let n = Math.ceil(Math.ceil(Math.log(tol / h) / Math.log(invphi)))
            let c = a + invphi2 * h
            let d = a + invphi * h
            let sumC = numericalFunctions.computeErrSum(numericalFunctions.computeUpdatedPos(pos, dir, c, smallToPos, posToSmall), linkFunctions, distMat)
            let sumD = numericalFunctions.computeErrSum(numericalFunctions.computeUpdatedPos(pos, dir, d, smallToPos, posToSmall), linkFunctions, distMat)
            for (let k = 0; k < n; k++) {
                if (sumC < sumD) {
                    h = invphi * h;
                    b = d;
                    sumB = sumD;
                    d = c;
                    sumD = sumC;
                    c = a + invphi2 * h;
                    sumC = numericalFunctions.computeErrSum(numericalFunctions.computeUpdatedPos(pos, dir, c, smallToPos, posToSmall), linkFunctions, distMat, k == n - 1)
                } else {
                    h = invphi * h;
                    a = c;
                    sumA = sumC ;
                    c = d;
                    sumC = sumD;
                    d = a + invphi * h;
                    sumD = numericalFunctions.computeErrSum(numericalFunctions.computeUpdatedPos(pos, dir, d, smallToPos, posToSmall), linkFunctions, distMat, k == n - 1)
                }
            }
            if (sumC < sumD) {
                if (sumA > sumD){
                    return [d, sumD, n]
                } else {
                    return [a, sumA, n]
                }
            }else{
                if (sumC > sumB) {
                    return [b, sumB, n]
                }else {
                    return [c, sumC, n]
                }
            }
        },
        // Newton Raphson 
        computeHessianAndGradient: (pos, linkFunctions, distMat, smallToPos, posToSmall) => {
            let mat_F = zeros([smallToPos.length, 1]) // Gradient         // (2n, 1)
            let mat_H = zeros([smallToPos.length, smallToPos.length]); //Jacobian (l, 2n)
            //console.log(posToSmall)
            for (let k = 0; k < linkFunctions.length; k++) {
                let binlink = linkFunctions[k]
                let li = binlink[0];
                let lj = binlink[1];
                let xi = pos[li][0], //Xi
                    xj = pos[lj][0], //Xj
                    yi = pos[li][1], //Yi
                    yj = pos[lj][1], //Yj 
                    r  = distMat[li][lj];
                let iP = posToSmall[([li, 0]).toString()], //Xi index in small, sometimes do not exist! 
                    iQ = posToSmall[([lj, 0]).toString()], //Xj index in small, sometimes do not exist! 
                    iR = posToSmall[([li, 1]).toString()], //Yi index in small, sometimes do not exist! 
                    iS = posToSmall[([lj, 1]).toString()]  //Yj index in small, sometimes do not exist! 
                //console.log('li, lj', [li, lj],'iP/xi, iQ/xj, iR/yi, iS/yj', iP, iQ, iR, iS)
                
                let vectIJ = numericalFunctions.computeVectIJ(xi, xj, yi, yj); // vi = [xi-xj, yi-yj] // p, q, r, s
                let distIJ = numericalFunctions.computeDistIJ(vectIJ);         // si = norm(vi)
                let rErrIJ = numericalFunctions.computeRErrIJ(r, distIJ);      // ei = RerrIJ = 1 - li/si 
                let gradIJ = numericalFunctions.computeGradIJ(vectIJ, rErrIJ); // gradIJ = [[gradx], [-gradx], [grady], [-grady]]
                let hMatIJ = numericalFunctions.computeHmatIJ(r, vectIJ, distIJ, rErrIJ)  
                // xixi, xixj, xiyi, xiyj
                // xixj, xjxj, xjyi, xjyj
                // xiyi, xjyi, yiyi, yiyj
                // xiyj, xjyj, yiyj, yiyi
                // console.log('v', vectIJ, 'd', distIJ, 'r', rErrIJ, 'g', gradIJ, 'h', hMatIJ)
                ////////////////////////// # update only the unknown ones (only unknown ones are in the matrix)
                //console.log(iP, iQ, iR, iS)
                if (iP != undefined && iQ != undefined) {
                    let idxLeft = [iP, iQ, iR, iS];         // index_xi, index_xj, index_yi, index_yj
                    let idxRght= [0, 1, 2, 3];              // for xi, xj, yi, yj    
                    for (let m = 0; m<idxLeft.length;m++){
                        // left <- right
                        // xi/xi, xj/xi, yi/xi, yj/xi <- xi/xi, xj/xi, yi/xi, yj/xi; xi <- xi
                        // xi/xj, xj/xj, yi/xj, yj/xj <- xi/xj, xj/xj, yi/xj, yj/xj; xj <- xj
                        // xi/yi, xj/yi, yi/yi, yj/yi <- xi/yi, xj/yi, yi/yi, yj/yi; yi <- yi
                        // xi/yj, xj/yj, yi/yj, yj/yj <- xi/yj, xj/yj, yi/yj, yj/yj; yj <- yj
                        mat_H[iP][idxLeft[m]] += hMatIJ[0][idxRght[m]]
                        mat_H[iQ][idxLeft[m]] += hMatIJ[1][idxRght[m]]
                        mat_H[iR][idxLeft[m]] += hMatIJ[2][idxRght[m]]
                        mat_H[iS][idxLeft[m]] += hMatIJ[3][idxRght[m]]
                        mat_F[idxLeft[m]][0] += gradIJ[idxRght[m]][0]
                    }
                    //console.log('both unknown')
                } else if (iQ != undefined) {
                    let idxLeft = [iQ, iS]
                    let idxRght = [1, 3]
                    for (let m = 0; m<idxLeft.length;m++){
                        mat_H[iQ][idxLeft[m]] += hMatIJ[1][idxRght[m]]
                        mat_H[iS][idxLeft[m]] += hMatIJ[3][idxRght[m]]
                        mat_F[idxLeft[m]][0] += gradIJ[idxRght[m]][0]
                    }
                    //console.log(lj, ' is unknown')
                } else if (iP != undefined) {
                    let idxLeft = [iP, iR]
                    let idxRght = [0, 2]
                    for (let m = 0; m<idxLeft.length;m++){
                        mat_H[iP][idxLeft[m]] += hMatIJ[0][idxRght[m]]
                        mat_H[iR][idxLeft[m]] += hMatIJ[2][idxRght[m]]
                        mat_F[idxLeft[m]][0] += gradIJ[idxRght[m]][0]
                    }
                    //console.log(li, ' is unknown')
                }
            }
            //console.log(mat_H, mat_F)
            return [mat_H, mat_F]
        }, 
        computeUpdateDirSmallNR: (mat_H, mat_F, scale = 0.01) => {
            let det = _mathjs.det(mat_H);
            if (Math.abs(det) > 1e-5) { // just make it robust idc
                let dir = _mathjs.multiply(_mathjs.inv(mat_H), mat_F);
                let vect = _mathjs.transpose(dir)[0]
                let norm = _mathjs.norm(vect);
                if (norm > scale) {
                    //console.log('norm bigger, scaling to ', scale, ', norm is', norm)
                    return [_mathjs.multiply(vect, -scale/norm), true];
                } else {
                    //console.log('norm smaller, no scaling is happened')
                    return [_mathjs.multiply(vect, -1), true]
                }
            }
            /*console.log('singular case of determinant:', det) // NaN > 0 is false
            consoleShowCount += 1
            if (consoleShowCount > 10) {
                console.clear();
                consoleShowCount = 0;
            }
            //*/
            return [zeros([mat_F.length,1]), false]
        }, 
        computeSingleDirUpdateNR: (pos, linkFunctions, distMat, mat_H, mat_F, smallToPos, posToSmall) => {
            let resultdir = numericalFunctions.computeUpdateDirSmallNR(mat_H, mat_F); 
            //console.log('resultdir', resultdir)
            if (resultdir[1]) {
                let dir = resultdir[0]
                let result = numericalFunctions.computeDescendScale(pos, dir, linkFunctions, distMat, smallToPos, posToSmall); // scale, error value, number of iterations. 
                let newpos = numericalFunctions.computeUpdatedPos(pos, dir, result[0], smallToPos, posToSmall);
                //console.log(newpos, result[1], result[2])
                return [newpos, result[1], result[2], true]
            } else {
                // return the pos immutably as new pos
                let newpos = pos.map(function(arr) {return arr.slice()});  
                // console.log('hello')
                return [newpos, null, 0 , false]
            }
        },

        // Gauss Newton (something is wrong, I have no idea where as of 10/06/2023)
        sqrMatDiag:(mat, scale = 1) => {
            let mat_Diag = zeros([mat.length,mat.length]); //Jacobian
            for (let k = 0; k < mat.length; k++) {
                mat_Diag[k][k] = mat[k][k] * scale
            }
            return mat_Diag
        },
        computeJRowXY: (vectIJ, distIJ) => {
            // Just to make my life easier. Instead of p,q,r,s, this is used instead
            // f/fi is the distance error equation/link equation, and 
            // they are stacking in the order as below
            // df/dxi, df/dyi, df/dxj, df/dyj, 
            let tempx = vectIJ[0]/distIJ;
            let tempy = vectIJ[1]/distIJ;
            return [[tempx], [tempy], [-tempx], [-tempy]]
        },
        computeJacobianAndError: (pos, linkFunctions, distMat, smallToPos, posToSmall) => {
            let mat_F = zeros([smallToPos.length, 1]) // Error Function, not squared        // (2n, 1)
            let mat_J = zeros([linkFunctions.length, smallToPos.length]); //Jacobian (l, 2n)
            for (let k = 0; k < linkFunctions.length; k++) {
                let binlink = linkFunctions[k]
                let li = binlink[0];
                let lj = binlink[1];
                let xi = pos[li][0], //Xi
                    xj = pos[lj][0], //Xj
                    yi = pos[li][1], //Yi
                    yj = pos[lj][1], //Yj 
                    r  = distMat[li][lj];
                let index_xi = posToSmall[([li, 0]).toString()], //Xi index in small, sometimes do not exist! 
                    index_xj = posToSmall[([lj, 0]).toString()], //Xj index in small, sometimes do not exist! 
                    index_yi = posToSmall[([li, 1]).toString()], //Yi index in small, sometimes do not exist! 
                    index_yj = posToSmall[([lj, 1]).toString()]  //Yj index in small, sometimes do not exist! 
                let indices = [index_xi, index_xj, index_yi, index_yj]; // iP, iQ, iR, iS 

                let vectIJ = numericalFunctions.computeVectIJ(xi, xj, yi, yj); // vi = [v1, v2]
                let distIJ = numericalFunctions.computeDistIJ(vectIJ);         // si = norm(vi)
                // let rErrIJ = numericalFunctions.computeRErrIJ(r, distIJ);      // ei = RerrIJ = 1 - li/si 
                let err = (Math.sqrt((pos[li][0] - pos[lj][0])**2 + (pos[li][1] - pos[lj][1])**2)) - distMat[li][lj]
                // This is correct I guess? 
                mat_F[k][0] = err;
                // let gradIJ = numericalFunctions.computeGradIJ(vectIJ, rErrIJ); // gradIJ = [[gradx], [grady], [-gradx], [-grady]], whose small col index are iP, iR, iQ, iS
                let jacobIJ= numericalFunctions.computeJRowXY(vectIJ, distIJ); // df/dxi, df/dyi, df/dxj, df/dyj 
                for (let m = 0; m < indices.length; m++) {
                    if (indices[m] != undefined) {
                        mat_J[k][indices[m]] = jacobIJ[m][0];
                    }
                }
            }
            return [mat_J, mat_F]
        },
        computeUpdateDirSmallGN: (matJ, matF, lambda = 1, scale = 1) => {
            let jTj = _mathjs.multiply(_mathjs.transpose(matJ), matJ);
            //console.log(jTj)
            // shape of the array for the following line is (n,1) 
            // inv(jTj + diag(jTj))*jT*f
            let dir = _mathjs.multiply(_mathjs.multiply((_mathjs.inv((_mathjs.add(jTj, numericalFunctions.sqrMatDiag(jTj, lambda))))), _mathjs.transpose(matJ)), matF);
            // This position is positive and needs to be flipped; 
            // Furthermore, transposing it so that it becomes a dimensionless array. 
            let vect= _mathjs.transpose(dir)[0];
            let norm = _mathjs.norm(vect);
            console.log(vect)
            if (norm > scale) {
                return _mathjs.multiply(vect, -scale/norm);
            } else {
                return _mathjs.multiply(vect, -1)
            }
        }, 
        computeSingleDirUpdateGN: (pos, linkFunctions, distMat, matJ, matF, smallToPos, posToSmall) => {
            let dir = numericalFunctions.computeUpdateDirSmallGN(matJ, matF); 
            let result = numericalFunctions.computeDescendScale(pos, dir, linkFunctions, distMat, smallToPos, posToSmall)[0]; // scale, error value, number of iterations. 
            let newpos = numericalFunctions.computeUpdatedPos(pos, dir, result[0], smallToPos, posToSmall);
            console.log(newpos, result[1], result[2])
            return [newpos, result[1], result[2]]
        }
    }

    let err = numericalFunctions.computeErrSum(pos_new, linkFunctions, distMat)
    let iterCtr= 0;
    let isGood = true

    // This is using NR
    while (iterCtr < maxIter && err > tol) {
        let HF = numericalFunctions.computeHessianAndGradient(pos_new, linkFunctions, distMat, smallToPos, posToSmall);
        let matH = HF[0], matF = HF[1];
        let result = numericalFunctions.computeSingleDirUpdateNR(pos_new, linkFunctions, distMat, matH, matF, smallToPos, posToSmall);
        pos_new = result[0];
        err = result[1];
        iterCtr += result[2];
        if (!result[3]) {
            isGood = false
            break
        }
    }
    //*/

    // This is using GN 
    /*/
    while (iterCtr < maxIter && err > tol) {
        let JF = numericalFunctions.computeJacobianAndError(pos_new, linkFunctions, distMat, smallToPos, posToSmall);
        let matJ = JF[0], matF = JF[1];
        let result = numericalFunctions.computeSingleDirUpdateGN(pos_new, linkFunctions, distMat, matJ, matF, smallToPos, posToSmall);
        pos_new = result[0];
        err = result[1];
        iterCtr += result[2];
    }
    //*/
    return {
        'state': pos_new , 
        'isGood': isGood && err < tol ,
        'err': err
    };
}

var computeLinearActuatorByStep052024 = exports.computeLinearActuatorByStep = (step, rMat, distMat, refLength = 1/360) => {
    let [dest, _operation, root] = step;
    let actStep = distMat[root[0]][root[1]] * refLength * rMat[root[0]][root[1]]
    distMat[dest][root[0]] = distMat[dest][root[0]] + actStep
    distMat[root[0]][dest] = distMat[root[0]][dest] + actStep
    //console.log('linear', distMat[root[0]][dest])
    return distMat
}


/**
 * overall function without computing steps
 */
var computeCurveByStep = exports.computeChainByStep = (steps, pos_init, rMat, distMat = null, maxTicks = 360, baseSpeed= 1, threshold = 0.1) => { //increment every one deg by degfault
    threshold = getMax(distMat) * threshold
    let distCopy = distMat.map(row => row.slice());
    let poses = zeros([maxTicks, pos_init.length, 3]); //[tick][joint][x/y/angle]
    // set first tick 
    poses[0] = addZeroColumn(pos_init); //pos_init.map(function(arr) {return arr.slice();});
    let stripResult = keyStripMatch(distMat, steps);
    let optimKeys = stripResult[2];
    let meetAnEnd = false;
    let meetTwoEnd= false;
    let notMeetEnd= true;
    let tick = 0;
    let offset = 0;
    let time;
    // This is to compute a quasi-velocity 
    // let hasSecondState = false; // tick > 1

    while (!meetTwoEnd) {
        // get tick 
        tick += 1; // current tick 
        if (tick >= maxTicks) {
            break;
        }
        // define time
        if (!meetAnEnd) {
            time = tick * baseSpeed;
        } else {
            time = (tick - offset) * baseSpeed * (-1);
        }
        // step-wise switch solution: 
        outer_loop:
        for (const [stepIdx, [dest, operation, root]] of Object.entries(steps)) {
            
            switch(operation){
                case "fixed":{
                    poses[tick][dest][0] = poses[0][dest][0];
                    poses[tick][dest][1] = poses[0][dest][1];
                    notMeetEnd = true;
                    break
                }
                case "chain":{
                    ///console.log(dest, operation, root)
                    poses[tick] = computeChainByStep([dest, operation, root], arrayMul(rMat, time), addZeroColumn(pos_init))
                    notMeetEnd = true;
                    break
                }
                case "angleAct": {
                    console.log('Why are you here??')
                    meetTwoEnd = true
                    break
                }
                case "lineAct": {
                    
                    distMat = computeLinearActuatorByStep052024([dest, operation, root], arrayMul(rMat, time), distCopy.map(row => row.slice()))
                    if (distMat[root[0]][root[1]] > distMat[dest][root[0]] && distMat[dest][root[0]] > 0) {
                        notMeetEnd = true;
                    } else {
                        notMeetEnd = false;
                    }
                    if (!notMeetEnd && !meetAnEnd) { // first time meeting an end
                        meetAnEnd = true
                        // need to flip from 0 to tick. 
                        poses = arrayFlip(poses, 0, tick-1)
                        tick = tick - 1
                        offset = tick
                        distMat = distCopy // reset the distance matrix 
                        break outer_loop; //go to while
                    } else if (!notMeetEnd && meetAnEnd) { // second time meeting an end
                        // meet both ends 
                        poses = arrayFlip(poses, 0, tick-1) 
                        // remove unused ticks 
                        while (poses.length > tick) { // already tick number of valid solutions
                            poses.pop()
                        }
                        meetTwoEnd = true
                        break outer_loop;
                    } 
                    break
                }
                case "arcSect":{
                    // Compute posRef here 
                    if (tick <= 1) {
                        poses[tick][dest][0] = poses[tick-1][dest][0];
                        poses[tick][dest][1] = poses[tick-1][dest][1];
                    } else{
                        poses[tick][dest][0] = poses[tick-1][dest][0]*2 - poses[tick-2][dest][0];
                        poses[tick][dest][1] = poses[tick-1][dest][1]*2 - poses[tick-2][dest][1];
                    }

                    let {state, isGood} = computeArcSectByStep([dest, operation, root], poses[tick], distMat, threshold) //, threshold
                    // substitution
                    poses[tick][dest][0] = state[dest][0];
                    poses[tick][dest][1] = state[dest][1];
                    notMeetEnd = isGood // !notMeetEnd == not good
                    if (!notMeetEnd && !meetAnEnd) { // first time meeting an end
                        meetAnEnd = true
                        // need to flip from 0 to tick. 
                        poses = arrayFlip(poses, 0, tick-1)
                        tick = tick - 1
                        offset = tick
                        distMat = distCopy // reset the distance matrix 
                        break outer_loop; //go to while
                    } else if (!notMeetEnd && meetAnEnd) { // second time meeting an end
                        // meet both ends 
                        poses = arrayFlip(poses, 0, tick-1) 
                        // remove unused ticks 
                        while (poses.length > tick) { // already tick number of valid solutions
                            poses.pop()
                        }
                        meetTwoEnd = true
                        break outer_loop;
                    } 
                    break
                }
                case "optim": {
                    // Compute posRef here
                    if (tick <= 1) {
                        for (let k = 0; k <dest.length; k++){
                            poses[tick][dest[k]][0] = poses[tick-1][dest[k]][0]
                            poses[tick][dest[k]][1] = poses[tick-1][dest[k]][1]
                        }
                    } else{
                        for (let k = 0; k <dest.length; k++){
                            poses[tick][dest[k]][0] = poses[tick-1][dest[k]][0]*2 - poses[tick-2][dest[k]][0]
                            poses[tick][dest[k]][1] = poses[tick-1][dest[k]][1]*2 - poses[tick-2][dest[k]][1]
                        }
                    }
                    // You may want to change distMat here for linear actuators. 


                    let {state, isGood, err} = computeNumericalByStep([dest, operation, root], poses[tick], distMat, optimKeys[stepIdx], tol = 1e-12, maxIter = 300)
                    poses[tick][4][2] = err // testing computed result //wtf it is a null?  
                    // substitution of multiple values. 
                    for (let k = 0; k <dest.length; k++){
                        poses[tick][dest[k]][0] = state[dest[k]][0]
                        poses[tick][dest[k]][1] = state[dest[k]][1] //Mother fucker bug is here??? 
                    }
                    notMeetEnd = isGood // !notMeetEnd == not good
                    if (!notMeetEnd && !meetAnEnd) { // first time meeting an end
                        meetAnEnd = true
                        // need to flip from 0 to tick. 
                        poses = arrayFlip(poses, 0, tick-1)
                        tick = tick - 1
                        offset = tick
                        distMat = distCopy 
                        break outer_loop; //go to while
                    } else if (!notMeetEnd && meetAnEnd) { // second time meeting an end
                        // meet both ends 
                        poses = arrayFlip(poses, 0, tick-1) 
                        // remove unused ticks 
                        while (poses.length > tick) { // already tick number of valid solutions
                            poses.pop()
                        }
                        meetTwoEnd = true
                        break outer_loop;
                    }
                    break
                }
                default:{
                    console.log('Unknown operation: ' + operation, ' on step ' + toString(stepIdx))
                }
            }

            // adding time stamps at the bottom right of the Pslice
            // This was a code for convenience in debugging optimization. 
            // Comment these out as they will make errors for other purposes. 
            //poses[tick][5][2] = time
            //poses[tick][6][2] = tick 
        }
    }
    //console.log('maxVect', maxVect)
    // 
    return {'poses': removeColumn(poses), 'meetAnEnd': meetAnEnd}
}


var keyStripMatch = (distMat, steps) => {
    let posToBig = {} // pos to Big -> from (n,2) to (-1, 1)
    let BigToPos = [] // They both are the biggest possible. 
    let matCounter = 0;
    for (let i = 0; i < distMat.length;i++) {
        let jiX = [i, 0];
        let jiY = [i, 1];
        BigToPos.push(jiX);
        BigToPos.push(jiY);
        posToBig[jiX.toString()] = matCounter;
        posToBig[jiY.toString()] = matCounter + 1;
        matCounter += 2;
    }

    // For reference, stephensen2 looks like this: 
    // [ [3, 4, 5, 6], 'optim', [ [2, 6], [2, 3], [3, 6], [3, 4], [5, 6], [1, 4], [1, 5], [4, 5]] ]
    let optimKeys = []
    for (let step of steps) {
        let smallToBig = [];
        let bigToSmall = {};
        let smallToPos = [];
        let posToSmall = {};
        if (step[1] === 'optim') {
            let ctrMatSmall = 0;
            for (let jToSoli of step[0]) {
                smallToBig.push(jToSoli * 2); //get big index 
                smallToBig.push(jToSoli * 2 + 1); //get big index 
                smallToPos.push([jToSoli, 0]); //where ji_x in pos
                smallToPos.push([jToSoli, 1]); //where ji_y in pos 
                bigToSmall[posToBig[([jToSoli, 0]).toString()]] = ctrMatSmall ;
                bigToSmall[posToBig[([jToSoli, 1]).toString()]] = ctrMatSmall + 1;
                posToSmall[([jToSoli, 0]).toString()] = ctrMatSmall;
                posToSmall[([jToSoli, 1]).toString()] = ctrMatSmall + 1;
                ctrMatSmall += 2;
            }
            optimKeys.push([smallToBig, bigToSmall, smallToPos, posToSmall]);
        } else { 
            // Leave them as empty if they can be done by other methods. 
            // You can change the code here later to see speed difference of different methods. 
            let jToSoli = step[0]
            let ctrMatSmall = 0;
            smallToBig = [jToSoli * 2 , jToSoli * 2 + 1];
            posToSmall[([jToSoli, 0]).toString()] = ctrMatSmall ;
            posToSmall[([jToSoli, 1]).toString()] = ctrMatSmall + 1;
            bigToSmall[posToBig[([jToSoli, 0]).toString()]] = ctrMatSmall ;
            bigToSmall[posToBig[([jToSoli, 1]).toString()]] = ctrMatSmall + 1;
            optimKeys.push([smallToBig, bigToSmall, smallToPos, posToSmall])
        } 
    }
    return [posToBig, BigToPos, optimKeys] 
}


let switchSol = exports.switchSol =(type, pos_init, maxTicks, baseSpeed, threshold) => {
    let result = {'poses': null, 'meetAnEnd': false, 'solvable': false}; 
    switch (type) {
        case "RRRR":{
            let output = _interpret.RRRRsol(pos_init)
            let distMat = output[0];
            let solStep = output[1];
            result = computeCurveByStep(solStep, pos_init, rMatNoBrainer, distMat, maxTicks, baseSpeed, threshold);
            result['solvable'] = true;
            break
        }
        case "RRRP":{
            let output = _interpret.RRRPsol(pos_init)
            let distMat = output[0];
            let solStep = output[1];
            let posInitNew = output[2];
            isGoodInit = output[3]
            if (isGoodInit){
                result = computeCurveByStep(solStep, posInitNew, rMatNoBrainer, distMat, maxTicks, baseSpeed, threshold);
                result['solvable'] = true;
                result['posInit'] = posInitNew
            } 
            break
        }
        case "RRPR":{
            let output = _interpret.RRPRsol(pos_init)
            let distMat = output[0];
            let solStep = output[1];
            let posInitNew = output[2];
            isGoodInit = output[3]
            if (isGoodInit){
                result = computeCurveByStep(solStep, posInitNew, rMatNoBrainer, distMat, maxTicks, baseSpeed, threshold);
                result['solvable'] = true;
                result['posInit'] = posInitNew
            } 
            break
        }
        case "PRPR":{
            let output = _interpret.PRPRsol(pos_init)
            let distMat = output[0];
            let solStep = output[1];
            let posInitNew = output[2];
            isGoodInit = output[3]
            if (isGoodInit){
                result = computeCurveByStep(solStep, posInitNew, rMatNoBrainer, distMat, maxTicks, baseSpeed, threshold);
                result['solvable'] = true;
                result['posInit'] = posInitNew
            } 
            break
        }
        case "Watt1T1A1":{
            let output = _interpret.Watt1T1A1Sol(pos_init)
            let distMat = output[0];
            let solStep = output[1];
            result = computeCurveByStep(solStep, pos_init, rMatNoBrainer, distMat, maxTicks, baseSpeed, threshold);
            result['solvable'] = true;
            break
        }
        case "Watt1T2A1":{
            let output = _interpret.Watt1T2A1Sol(pos_init)
            let distMat = output[0];
            let solStep = output[1];
            result = computeCurveByStep(solStep, pos_init, rMatNoBrainer, distMat, maxTicks, baseSpeed, threshold);
            result['solvable'] = true;
            break
        }
        case "Watt1T3A1":{
            let output = _interpret.Watt1T3A1Sol(pos_init)
            let distMat = output[0];
            let solStep = output[1];
            result = computeCurveByStep(solStep, pos_init, rMatNoBrainer, distMat, maxTicks, baseSpeed, threshold);
            result['solvable'] = true;
            break
        }
        case "Watt1T1A2":{
            let output = _interpret.Watt1T1A2Sol(pos_init)
            let distMat = output[0];
            let solStep = output[1];
            result = computeCurveByStep(solStep, pos_init, rMatNoBrainer, distMat, maxTicks, baseSpeed, threshold);
            result['solvable'] = true;
            break
        }
        case "Watt1T2A2":{
            let output = _interpret.Watt1T2A2Sol(pos_init)
            let distMat = output[0];
            let solStep = output[1];
            result = computeCurveByStep(solStep, pos_init, rMatNoBrainer, distMat, maxTicks, baseSpeed, threshold);
            result['solvable'] = true;
            break
        }
        case "Watt1T3A2":{
            let output = _interpret.Watt1T3A2Sol(pos_init)
            let distMat = output[0];
            let solStep = output[1];
            result = computeCurveByStep(solStep, pos_init, rMatNoBrainer, distMat, maxTicks, baseSpeed, threshold);
            result['solvable'] = true;
            break
        }
        case "Watt2T1A1":{
            let output = _interpret.Watt2T1A1Sol(pos_init)
            let distMat = output[0];
            let solStep = output[1];
            result = computeCurveByStep(solStep, pos_init, rMatNoBrainer, distMat, maxTicks, baseSpeed, threshold);
            result['solvable'] = true;
            break
        }
        case "Watt2T2A1":{
            let output = _interpret.Watt2T2A1Sol(pos_init)
            let distMat = output[0];
            let solStep = output[1];
            result = computeCurveByStep(solStep, pos_init, rMatNoBrainer, distMat, maxTicks, baseSpeed, threshold);
            result['solvable'] = true;
            break
        }
        case "Watt2":{
            let output = _interpret.Watt2Sol(pos_init)
            let distMat = output[0];
            let solStep = output[1];
            result = computeCurveByStep(solStep, pos_init, rMatNoBrainer, distMat, maxTicks, baseSpeed, threshold);
            result['solvable'] = true;
            break
        }
        case "Watt2T1A2":{
            let output = _interpret.Watt2T1A2Sol(pos_init)
            let distMat = output[0];
            let solStep = output[1];
            result = computeCurveByStep(solStep, pos_init, rMatNoBrainer, distMat, maxTicks, baseSpeed, threshold);
            result['solvable'] = true;
            break
        }
        case "Watt2T2A2":{
            let output = _interpret.Watt2T2A2Sol(pos_init)
            let distMat = output[0];
            let solStep = output[1];
            result = computeCurveByStep(solStep, pos_init, rMatNoBrainer, distMat, maxTicks, baseSpeed, threshold);
            result['solvable'] = true;
            break
        }
        case "Stephensen1":{
            let output = _interpret.Steph1Sol(pos_init)
            let distMat = output[0];
            let solStep = output[1];
            result = computeCurveByStep(solStep, pos_init, rMatNoBrainer, distMat, maxTicks, baseSpeed, threshold);
            result['solvable'] = true;
            break
        }
        case "Steph1T1":{
            let output = _interpret.Steph1T1Sol(pos_init)
            let distMat = output[0];
            let solStep = output[1];
            result = computeCurveByStep(solStep, pos_init, rMatNoBrainer, distMat, maxTicks, baseSpeed, threshold);
            result['solvable'] = true;
            break
        }
        case "Steph1T2":{
            let output = _interpret.Steph1T2Sol(pos_init)
            let distMat = output[0];
            let solStep = output[1];
            result = computeCurveByStep(solStep, pos_init, rMatNoBrainer, distMat, maxTicks, baseSpeed, threshold);
            result['solvable'] = true;
            break
        }
        case "Steph1T3":{
            let output = _interpret.Steph1T3Sol(pos_init)
            let distMat = output[0];
            let solStep = output[1];
            result = computeCurveByStep(solStep, pos_init, rMatNoBrainer, distMat, maxTicks, baseSpeed, threshold);
            result['solvable'] = true;
            break
        }
        case "Steph2T1A1":{
            let output = _interpret.Steph2T1A1Sol(pos_init)
            let distMat = output[0];
            let solStep = output[1];
            result = computeCurveByStep(solStep, pos_init, rMatNoBrainer, distMat, maxTicks, baseSpeed, threshold);
            result['solvable'] = true;
            break
        }
        case "Steph2T2A1":{
            let output = _interpret.Steph2T2A1Sol(pos_init)
            let distMat = output[0];
            let solStep = output[1];
            result = computeCurveByStep(solStep, pos_init, rMatNoBrainer, distMat, maxTicks, baseSpeed, threshold);
            result['solvable'] = true;
            break
        }
        case "Steph2T1A2":{
            let output = _interpret.Steph2T1A2Sol(pos_init)
            let distMat = output[0];
            let solStep = output[1];
            result = computeCurveByStep(solStep, pos_init, rMatNoBrainer, distMat, maxTicks, baseSpeed, threshold);
            result['solvable'] = true;
            break
        }
        case "Steph2T2A2":{
            let output = _interpret.Steph2T2A2Sol(pos_init)
            let distMat = output[0];
            let solStep = output[1];
            result = computeCurveByStep(solStep, pos_init, rMatNoBrainer, distMat, maxTicks, baseSpeed, threshold);
            result['solvable'] = true;
            break
        }
        case "Steph3T1A1":{
            let output = _interpret.Steph3T1A1Sol(pos_init)
            let distMat = output[0];
            let solStep = output[1];
            isGoodInit = true;
            result = computeCurveByStep(solStep, pos_init, rMatNoBrainer, distMat, maxTicks, baseSpeed, threshold);
            result['solvable'] = true;
            break
        }
        case "Steph3T2A1":{
            let output = _interpret.Steph3T2A1Sol(pos_init)
            let distMat = output[0];
            let solStep = output[1];
            isGoodInit = true;
            result = computeCurveByStep(solStep, pos_init, rMatNoBrainer, distMat, maxTicks, baseSpeed, threshold);
            result['solvable'] = true;
            break
        }
        case "Steph3T1A2":{
            let output = _interpret.Steph3T1A2Sol(pos_init)
            let distMat = output[0];
            let solStep = output[1];
            isGoodInit = true;
            result = computeCurveByStep(solStep, pos_init, rMatNoBrainer, distMat, maxTicks, baseSpeed, threshold);
            result['solvable'] = true;
            break
        }
        case "Steph3T2A2":{
            let output = _interpret.Steph3T2A2Sol(pos_init)
            let distMat = output[0];
            let solStep = output[1];
            isGoodInit = true;
            result = computeCurveByStep(solStep, pos_init, rMatNoBrainer, distMat, maxTicks, baseSpeed, threshold);
            result['solvable'] = true;
            break
        }
        case "Watt2Anar":{
            let output = _interpret.Watt2AnarSol(pos_init)
            let distMat = output[0];
            let solStep = output[1];
            result = computeCurveByStep(solStep, pos_init, rMatNoBrainer, distMat, maxTicks, baseSpeed, threshold);
            result['solvable'] = true;
            break
        }
        case "RRRRold": {
            let output = _interpret.RRRRoldSol(pos_init)
            let distMat = output[0];
            let solStep = output[1];
            result = computeCurveByStep(solStep, pos_init, rMatNoBrainer, distMat, maxTicks, baseSpeed, threshold);
            result['solvable'] = true;
            break
        }
        case "Stephensen1old": {
            let output = _interpret.Steph1OldSol(pos_init)
            let distMat = output[0];
            let solStep = output[1];
            result = computeCurveByStep(solStep, pos_init, rMatNoBrainer, distMat, maxTicks, baseSpeed, threshold);
            result['solvable'] = true;
            break
        }
        case "Watt1old": {
            let output = _interpret.Watt1OldSol(pos_init)
            let distMat = output[0];
            let solStep = output[1];
            result = computeCurveByStep(solStep, pos_init, rMatNoBrainer, distMat, maxTicks, baseSpeed, threshold);
            result['solvable'] = true;
            break
        }
        case "RRRRstrip":{
            let output = _interpret.RRRRstripSol(pos_init)
            let distMat = output[0];
            let solStep = output[1];
            result = computeCurveByStep(solStep, pos_init, rMatNoBrainer, distMat, maxTicks, baseSpeed, threshold);
            result['frames'] = computeFrames(result['poses'], 1, 3, distMat[1][3])
            result['TransMG'] = computeInitFrameInvMatrix(pos_init, 1, 3, distMat[1][3])
            result['solvable'] = true;
            break
        }
        case "sixparallelsol":{
            let output = _interpret.sixparallelSol(pos_init)
            let distMat = output[0];
            let solStep = output[1];
            result = computeCurveByStep(solStep, pos_init, rMatNoBrainer, distMat, maxTicks, baseSpeed, threshold);
            result['solvable'] = true;
            break
        }
        case "RRPR2":{
            let output = _interpret.RRPRSol2(pos_init)
            let distMat = output[0];
            let solStep = output[1];
            let posInitNew = output[2];
            isGoodInit = output[3]
            if (isGoodInit){
                result = computeCurveByStep(solStep, posInitNew, rMatNoBrainer, distMat, maxTicks, baseSpeed, threshold);
                result['solvable'] = true;
            } 
            break
        }
        default:{
            console.log('Unknown type: ' + type)
        }
    }
    return result
}

let switchSol8bar = exports.switchSol8bar =(T, solSteps, pos_init, maxTicks, baseSpeed, threshold) => {
    let result = {'poses': null, 'meetAnEnd': false, 'solvable': false}; 
    
    let distMat = _interpret.cdist(T, pos_init);
    result = computeCurveByStep(solSteps, pos_init, rMatNoBrainer, distMat, maxTicks, baseSpeed, threshold);
    result['solvable'] = true;
    console.log(result.poses.length)
    return result
}

let computeInitFrameInvMatrix = exports.computeInitFrameInvMatrix = (pos_init, idx1, idx2, l) => {
    let c = (pos_init[idx2][0] - pos_init[idx1][0])/l // cos
    let s = (pos_init[idx2][1] - pos_init[idx1][1])/l // sin
    let x = pos_init[idx1][0]
    let y = pos_init[idx1][0]
    // compute the matrix that helps to find where the points are in the frame 
    // 
    let mat = [
        [ c,  s, -c*x - s*y], 
        [-s,  c,  s*x - c*y],
        [ 0,  0,          1]
    ]
    return mat
}

let switchSolMulti = exports.switchSolMulti = (dataPacket = []) => {
    let outputPacket = []
    for (let i = 0; i<dataPacket.length; i++) {
        let packet = dataPacket[i];
        let type = dataPacket[i].type;
        let pos_init = dataPacket[i].params;
        let maxTicks = dataPacket[i].steps;
        let baseSpeed = dataPacket[i].speedScale;
        let threshold = dataPacket[i].relativeTolerance;
        outputPacket.push(switchSol(type, pos_init, maxTicks, baseSpeed, threshold)) //Remove test here
    }
    return outputPacket
}

let switchSolMulti8bar = exports.switchSolMulti8bar = (dataPacket = []) => {
    let outputPacket = []

    for (let i = 0; i<dataPacket.length; i++) {
        let packet = dataPacket[i];
        let T = dataPacket[i].T;
        let solSteps = dataPacket[i].solSteps;
        let pos_init = dataPacket[i].params;
        let maxTicks = dataPacket[i].steps;
        let baseSpeed = dataPacket[i].speedScale;
        let threshold = dataPacket[i].relativeTolerance;
        outputPacket.push(switchSol8bar(T, solSteps, pos_init, maxTicks, baseSpeed, threshold)) //Remove test here
    }

    return outputPacket
}



// BELOW ARE OLD (not used since 2023)
/**
 * @param arr jointData with a shape of (step, joint, (x,y,angle))
 * @param ccIdx coupler curve index/# of joint.
 * 
 */
var ccLen = exports.ccLen = (arr = [], ccIdx = 4) => {
    let sum = 0
    for (let i = 1; i<arr.length;i++) {
        let x = arr[i][ccIdx][0] - arr[i-1][ccIdx][0];
        let y = arr[i][ccIdx][1] - arr[i-1][ccIdx][1];
        sum = sum + norm([x,y])
    }
    return sum
}

/**
 * Graph traverse to find the order of solving the mechanism. But it can only deal with simple mechanisms (mechanism that only contains four bar loops)
 * Compute if the mechanism can be solved by dyadic decomposition. This works almost the same as getChainInfo in simulator.js. 
 * The mechanisms is solved by doing one forward kinematics and one inverse kinematics. 
 * I heard that adding a _ indicates that's useless. 
 * @param {object} tpMat -> See definition in the python script, which is an adjacency matrix for the mechanism topology. 
 * @returns {'kkcJ': kkcJ, 'chain': chain, 'isSimple': true/false}
 */
var isSimple = exports.isSimple = (tpMat = [], fixParam = [1,3]) => {
    // # simple: i.e., this can be solved with chain tree and intersection of circles/arc sects. 
    // # find links and set up joint table. 
    // # actuator will be noted with negative value. 
    let jT = {};
    let searchedJ=[];
    let kkcJ=[];
    let chain={};

    //# step 1, initialize, set all joints and links to unknown (0 in jointTable) and jointLinkTable. 
    for (let i = 0; i < tpMat.length;i++){
        jT[i] = 0;
        chain[i] = {'from': null, 'next': []};
    }

    // # step 2, set all ground joints to known (1 to be known)tr56
    for (let i = 0; i < tpMat.length;i++){
        for (const [idx, value] of Object.entries(fixParam)) {
            if (tpMat[i][i] === value) {
                jT[i] = 1;
                searchedJ.push(i);
                kkcJ.push([i, 'fixed', i]);
                chain[i]['from'] = i;
                break;
            }   
        }
    }

    // # step 3, set joints in the kinematic chain to known
    let pivotJ = searchedJ;
    let prevCtr = kkcJ.length;
    let newJ = [];
    while (true) {
        newJ = [];
        for (const [idx, i] of Object.entries(pivotJ)) {
            for (let j = 0; j < tpMat.length; j++) {
                if (tpMat[i][j] < 0 && jT[j] === 0) {
                    jT[j] = 1;
                    newJ.push(j);
                    kkcJ.push([j, 'chain', i]);
                    chain[i]['next'].push(j)
                    chain[j] = {'from': i, 'next': []}
                }
            }
        }
        if (kkcJ.length === prevCtr) {
            break;
        }else {
            pivotJ = newJ;
        }
        prevCtr = kkcJ.length;
    }

    if (kkcJ.length == tpMat.length) {
        return {'kkcJ': kkcJ, 'chain': chain, 'isReallySimple': true};
    }

    // # step 4, set joints that can be solved through the intersection of circles to known
    let foundNew = true;
    while (foundNew) {
        foundNew = false;
        outer_loop: 
        for (const [joint, isKnown] of Object.entries(jT)) {
            if (jT[joint] === 0){
                for (const [keySeqI, packI] of Object.entries(kkcJ)) {
                    for (const [keySeqJ, packJ] of Object.entries(kkcJ)) {
                        if (packI[0] < packJ[0] && tpMat[packI[0]][Number(joint)] * tpMat[packJ[0]][Number(joint)] != 0) {
                            foundNew = true;
                            jT[joint] = 1;
                            kkcJ.push([Number(joint), 'arcSect', [Number(packI[0]),Number(packJ[0])]])
                            break outer_loop;
                        }
                    }
                }
            }
        }
    }
    console.log(kkcJ)
    // # return chain and isSimple (meaning you can solve this with direct chain) 
    return {'kkcJ': kkcJ, 'chain': chain, 'isReallySimple': kkcJ.length === tpMat.length};
};

/**
 * overall function.
 */
var computeCurveSimple = exports.computeCurveSimple = (tpMat, pos_init, rMat, distMat = null, maxTicks = 360, baseSpeed= 1, threshold = 0.1) => { //threshold = 0.1
    let {kkcJ, chain, isReallySimple} = isSimple(tpMat)
    if (!isReallySimple) {
        return null
    }  
    if (distMat === null) {
        distMat = cdist(tpMat, pos_init);
    }
    threshold = getMax(distMat) * threshold
    let poses = zeros([maxTicks, pos_init.length, 3]); //[tick][joint][x/y/angle]
    // set first tick 
    poses[0] = addZeroColumn(pos_init); //pos_init.map(function(arr) {return arr.slice();});
    
    let meetAnEnd = false;
    let meetTwoEnd= false;
    let notMeetEnd= true;
    let tick = 0;
    let offset = 0;
    let time;
    var maxVect = 0;
    while (!meetTwoEnd) {
        // get tick 
        tick += 1;
        if (tick >= maxTicks) {
            break;
        }
        // define time
        if (!meetAnEnd) {
            time = tick * baseSpeed;
        } else {
            time = (tick - offset) * baseSpeed * (-1);
        }
        // step-wise switch solution: 
        outer_loop:
        for (const [stepIdx, [dest, operation, root]] of Object.entries(kkcJ)) {
            switch(operation){
                case "fixed":{
                    poses[tick][dest][0] = poses[0][dest][0];
                    poses[tick][dest][1] = poses[0][dest][1];
                    notMeetEnd = true;
                    break
                }
                case "chain":{
                    poses[tick] = computeChainByStep([dest, operation, root], arrayMul(rMat, time), addZeroColumn(pos_init))
                    notMeetEnd = true;
                    break
                }
                case "arcSect":{
                    poses[tick][dest][0] = poses[tick-1][dest][0]
                    poses[tick][dest][1] = poses[tick-1][dest][1]
                    let {state, isGood} = computeArcSectByStep([dest, operation, root], poses[tick], distMat, threshold) //, threshold
                    // substitution
                    poses[tick][dest][0] = state[dest][0]
                    poses[tick][dest][1] = state[dest][1]
                    notMeetEnd = isGood // !notMeetEnd == not good
                    if (!notMeetEnd && !meetAnEnd) { // first time meeting an end
                        meetAnEnd = true
                        // need to flip from 0 to tick. 
                        poses = arrayFlip(poses, 0, tick-1)
                        tick = tick - 1
                        offset = tick
                        break outer_loop; //go to while
                    } else if (!notMeetEnd && meetAnEnd) { // second time meeting an end
                        // meet both ends 
                        poses = arrayFlip(poses, 0, tick-1) 
                        // remove unused ticks 
                        while (poses.length > tick) { // already tick number of valid solutions
                            poses.pop()
                        }
                        meetTwoEnd = true
                        break outer_loop;
                    }
                    break
                }
                default:{
                    console.log('Unknown operation: ' + operation, ' on step ' + toString(stepIdx))
                }
            }
        }
    }
    //console.log('maxVect', maxVect)
    return {'poses': removeColumn(poses), 'meetAnEnd': meetAnEnd, 'isReallySimple': isReallySimple}
}

var computeFrames = exports.computeFrames = (poses, idx1, idx2, l) => {
    // Frames included 
    let frames = []
    for (let i = 0; i < poses.length; i++) {
        //let a11 = 1 // w.r.t. x axis. 
        //let a12 = 0 // x axis \crossproduct the position vector.
        let a21 = (poses[i][idx2][0] - poses[i][idx1][0])/l // cos
        let a22 = (poses[i][idx2][1] - poses[i][idx1][1])/l // sin
        // matrix compute determinant -> let sin = a11*a22-a12*a21 = a22
        // matrix compute projection  -> let cos = a11*a21+a12*a22 = a21
        //let x = poses[i][idx1][0]
        //let y = poses[i][idx1][1]
        // T = [[cos, -sin, x], [sin, cos, y], [0, 0, 1]]
        // T = [[a21, -a22, poses[i][idx1][0]], [a22, a21, poses[i][idx1][1]], [0, 0, 1]]
        frames.push([a22, a21, poses[i][idx1][0], poses[i][idx1][1]])
    }
    return frames
}

var computeCurvesSimpleFourbar = exports.computeCurvesSimpleFourbar =  (pos_inits, rMat, maxTicks = 1440, baseSpeed= 0.25, threshold = 0.1, ccIdx = 4) => {
    let tpMat = [
        [1,-1, 1, 0], 
        [1, 2, 0, 1],
        [1, 0, 1, 1],
        [0, 1, 1, 2], 
    ]

    let {kkcJ, _chain, _isReallySimple} = isSimple(tpMat)
    //console.log(kkcJ)
    //let poses = zeros([maxTicks, pos_init.length, 3]); //[tick][joint][x/y/angle]
    let extendedData = []
    
    for (let i = 0; i<pos_inits.length;i++) {
        let maxVect = 0
        let pos_init = pos_inits[i]
        let distMat = cdist(tpMat, pos_init);
        threshold = getMax(distMat) * threshold
        let poses = zeros([maxTicks, pos_init.length, 3]); //[tick][joint][x/y/angle]
        // set first tick 
        poses[0] = addZeroColumn(pos_init); //pos_init.map(function(arr) {return arr.slice();});
        let meetAnEnd = false;
        let meetTwoEnd = false;
        let notMeetEnd = true;
        let tick = 0;
        let offset = 0;
        let time
        while (!meetTwoEnd) {
            // get tick 
            tick += 1;
            if (tick >= maxTicks) {
                break;
            }
            // define time
            if (!meetAnEnd) {
                time = tick * baseSpeed;
            } else {
                // console.log(tick - offset)
                time = (tick - offset) * baseSpeed * (-1);}
            // step-wise switch solution: 
            outer_loop:
            for (const [stepIdx, [dest, operation, root]] of Object.entries(kkcJ)) {
                switch (operation) {
                    case "fixed": {
                        poses[tick][dest][0] = poses[0][dest][0];
                        poses[tick][dest][1] = poses[0][dest][1];
                        notMeetEnd = true;
                        break
                    }
                    case "chain": {
                        poses[tick] = computeChainByStep([dest, operation, root], arrayMul(rMat, time), addZeroColumn(pos_init))
                        notMeetEnd = true;
                        break
                    }
                    case "arcSect": {
                        let vectx = 0
                        let vecty = 0
                        let speed = 0
                        // if (tick > 1) {
                        //     vectx = poses[tick-1][dest][0] - poses[tick-2][dest][0] 
                        //     vecty = poses[tick-1][dest][1] - poses[tick-2][dest][1] 
                        //     let speed= Math.sqrt(Math.pow(vectx, 2) + Math.pow(vecty, 2))/baseSpeed
                        //     if (speed > maxVect) {
                        //         maxVect = speed
                        //     }
                        // }
                        poses[tick][dest][0] = poses[tick - 1][dest][0]
                        poses[tick][dest][1] = poses[tick - 1][dest][1]
                        let { state, isGood } = computeArcSectByStep([dest, operation, root], poses[tick], distMat, threshold) //, threshold
                        
                        vectx = state[dest][0] - poses[tick-1][dest][0]
                        vecty = state[dest][1] - poses[tick-1][dest][1]
                        speed= Math.sqrt(Math.pow(vectx, 2) + Math.pow(vecty, 2))/baseSpeed
                        if (speed > 0.75/baseSpeed) {
                            isGood = false
                        }
                        notMeetEnd = isGood
                        if (!notMeetEnd && !meetAnEnd) {
                            meetAnEnd = true
                            // need to flip from 0 to tick. 
                            poses = arrayFlip(poses, 0, tick - 1)
                            poses[tick] = JSON.parse(JSON.stringify(poses[tick - 1]))
                            tick = tick - 1
                            offset = tick
                            break outer_loop;
                        } else if (!notMeetEnd && meetAnEnd) {
                            // meet both ends
                            poses = arrayFlip(poses, 0, tick - 1)
                            while (poses.length > tick) {
                                poses.pop()
                            }
                            meetTwoEnd = true
                            break outer_loop;
                        } else {
                            poses[tick][dest][0] = state[dest][0]
                            poses[tick][dest][1] = state[dest][1]
                        }
                        break
                    }
                    default: {
                        console.log('Unknown operation: ' + operation, ' on step ' + toString(stepIdx))
                    }
                }
            }
        }
        poses = removeColumn(poses)
        
        extendedData.push([poses, computeFrames(poses, 1, 3, distMat[1][3])])
    }

    return extendedData
}

/**
 * overall function to fit the use of simulating simple mechanisms in a pack. 
 * just read @function computeCurveSimple for this
 */
var computeCurveSimpleMulti = exports.computeCurveSimpleMulti = (tpMat, pos_inits, rMat, maxTicks = 720, baseSpeed= 0.5, threshold = 0.1, ccIdx = 4) => {
    let results = []
    for (let i = 0; i<pos_inits.length;i++) {
        let {poses, meetAnEnd, isReallySimple} = computeCurveSimple(tpMat, pos_inits[i], rMat, null, maxTicks, baseSpeed, threshold)
        let ccLength = ccLen(poses,ccIdx)
        results.push([poses, ccLength])
    }
    return results
}

var computeCurveSimpleMultiFullOnly = exports.computeCurveSimpleMultiFullOnly = (tpMat, pos_inits, rMat, maxTicks = 720, baseSpeed= 0.5, threshold = 0.1, ccIdx = 4) => {
    let results = []
    for (let i = 0; i<pos_inits.length;i++) {
        let {poses, meetAnEnd, isReallySimple} = computeCurveSimple(tpMat, pos_inits[i], rMat, null, maxTicks, baseSpeed, threshold)
        if (poses.length >= maxTicks) {
            //let ccLength = ccLen(poses,ccIdx)
            results.push(poses)
        }
        
    }
    return results
}


// Full test for the example mechanism: 
/*
let initPosTest = [
    [0, 0],
    [0, 3],
    [5, 0],
    [3, 2],
    [1, 2],
    [1, 4],
    [3, 4]
]

let resultSolTest = _interpret.Steph2Sol(initPosTest);
let distMatTest = resultSolTest[0];
let solStepTest = resultSolTest[1]; // All steps. Step 3 is the solStepTest
let resultTesut = computeCurveByStep(solStepTest, initPosTest, rMatNoBrainer, distMatTest, 720, 0.5, 1e-6)


let returnJank = exports.returnJank = () => {
    //console.log(resultTesut)
    return resultTesut
}


console.log(resultTesut)
//console.log(distMatTest)
///*/

/*
// RRRP works! Init state should be 5 points. 
// RRPR works! Init state should be 
// RRRR works... of course. Init state should be 5 points 
// PRPR ... working... but position of joint 3 is so picky 
// All require 5 points... and producing several addtional points. 
let posInitPRPR = [
    [0, 0], 
    [1, 0], //1,  2, 3
    [2, 0], 
    [2.5, 1], //3   
    [4, 2]  //4, 
];
something = _interpret.PRPRsol(posInitPRPR)

// PRPR is picky so... 
//console.log('something is... ') //posInit if modification is not required. 
//var resultTest4 = computeCurveByStep(something[1], something[2], rMatNoBrainer, something[0], 720, 0.5, 0.1)


for (let i = 0; i< resultTest4['poses'].length; i++) {
    console.log(resultTest4['poses'][i][4])
}
*/
