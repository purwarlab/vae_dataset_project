Object.defineProperty(exports, "__esModule", {
    value: true
});

var zeros = (shapeArg = []) => {
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

var cdist = exports.cdist = (tpMat, pos) => {
    // console.log(tpMat, pos)
    // There's no cdist in vanilla js. 
    let distMat = zeros([tpMat.length, tpMat.length])
    // console.log(distMat)
    for (let i = 0; i< tpMat.length; i++) {
        for (let j = 0; j< tpMat.length; j++) {
            if (i < j) {
                let temp = Math.pow(pos[i][0] - pos[j][0],2) + Math.pow(pos[i][1] - pos[j][1],2);
                temp = Math.sqrt(temp* Math.abs(tpMat[i][j]));
                distMat[i][j] = temp;
                distMat[j][i] = temp;
            }
        }
    }
    return distMat;
};

var getRandomValue = () => {
    var num =  Math.random(); 
    return (num === 0) ? generateRandom() : num; // 0 and 1 not inclusive
}

var computeArcSect_presim = (step, posOld, eJcJDist, cJsJDist) => { //, threshold = 0.1
    let posNew = posOld.map(function(arr) {return arr.slice();});
    let [ptSect, _operation, centers] = step;
    let [cntr1, cntr2] = centers
    let r1s = eJcJDist; // j1 is eJ,  s is cJ
    let r2s = cJsJDist; //  s is cJ, j2 is sJ
    if (r1s < 10e-12){
        posNew[ptSect] = posOld[cntr1].slice();
        return {
            'state': posNew, 
            'isGood': true
        };
    }else if(r2s < 10e-12){
        posNew[ptSect] = posOld[cntr2].slice();
        return {
            'state': posNew, 
            'isGood': true
        };
    }else{
        let ptOld  = posOld[ptSect]
        let ptCen1 = posOld[cntr1]
        let ptCen2 = posOld[cntr2]
        let d12 = Math.sqrt(Math.pow(ptCen1[0] - ptCen2[0], 2) + Math.pow(ptCen1[1] - ptCen2[1], 2));
        if (d12 > r1s+r2s || d12 < Math.abs(r1s - r2s)) {
            return {
                'state': posOld, 
                'isGood': false
            };
        }else if (Math.abs(r1s + r2s - d12) < 10e-12 || Math.abs(Math.abs(r1s - r2s) - d12) < 10e-12){  // # Singular point 
            // For example: 
            // Also a bad one. This usually means collinear, collinear usually means singularity, 
            // Unless the solution is in a same rigid body. 
            // I disable the calculation for fourbar because 3 joints collinear = 2 links collinear  
            // posNew[ptSect][0] = (ptCen1[0] + ptCen2[0])/2;
            // posNew[ptSect][1] = (ptCen1[1] + ptCen2[1])/2;
            console.log('radius too small!' )
            return {
                'state': posOld, 
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
            
            posNew[ptSect][0] = sol2[0];
            posNew[ptSect][1] = sol2[1];
            
            
        }
        
        return {
            'state': posNew, 
            'isGood': true
        };
    }
};

var RRRRsol = exports.RRRRsol = (pos_init, returnExtraInfo = false) => {
    // B T and I are here to notify people what it looks like 
    // Check Zhijie's master thesis to see the definition. 

    // CC idx: 4 
    let B = [
        [1, 0, 1, 0, 0], 
        [1, 1, 0, 0, 0],
        [0, 0, 1, 1, 0],
        [0, 1, 0, 1, 1]
    ];

    let T = [
        [1, 1, 1, 0, 0],
        [1, 0, 0, 1, 1],
        [1, 0, 1, 1, 0],
        [0, 1, 1, 0, 1],
        [0, 1, 0, 1, 0]
    ];

    let I = [
        [2, 0, 1, 'R']
    ];

    let solStep = [
        [ 0, 'fixed', 0 ],
        [ 2, 'fixed', 2 ],
        [ 1, 'chain', 0 ],
        [ 3, 'arcSect', [ 1, 2 ] ],
        [ 4, 'arcSect', [ 1, 3 ] ]
    ];

    // -1: the x axis 
    // -1: use legacy chain computation
    let solStepExtra = [
        [ 0, 'fixed', [0]],
        [ 2, 'fixed', [2] ],
        [ 1, 'chain', [-1, 0, 1] ],
        [ 3, 'arcSect', [ 1, 2 ] ],
        [ 4, 'arcSect', [ 1, 3 ] ]
    ];

    let distMat = cdist(T, pos_init);

    return [distMat, solStep]
}

var RRRPsol = exports.RRRPsol = (pos_init, useRandom = false, errorScale = 1000, offsetScale = 0.01) => {
    let posNew = pos_init.map(function(arr) {return arr.slice();}); // make immutable

    // cc idx: 4
    // j5 being the slot joint 
    // j6 is the far joint 
    // j7 is the constraining joint
    let B = [
        [1, 0, 1, 1, 0, 0],
        [1, 1, 0, 0, 0, 0],
        [0, 1, 0, 0, 1, 1],
        [0, 0, 1, 1, 0, 0]
    ];

    let S = [[2, 5, 3]];

    let I = [[2, 0, 1, 'R']];

    let Bextend = [
        [1, 0, 1, 1, 0, 0, 1, 0], 
        [1, 1, 0, 0, 0, 0, 0, 0],
        [0, 1, 0, 0, 1, 1, 0, 0], 
        [0, 0, 1, 0, 0, 0, 0, 1],
        [0, 0, 0, 0, 0, 1, 0, 1] 
    ];
    
    let Textend = [
        [1, 1, 1, 1, 0, 0, 1, 0],
        [1, 0, 0, 0, 1, 1, 0, 0],
        [1, 0, 1, 1, 0, 0, 1, 1],
        [1, 0, 1, 1, 0, 0, 1, 0],
        [0, 1, 0, 0, 0, 1, 0, 0],
        [0, 1, 0, 0, 1, 0, 1, 1],
        [1, 0, 1, 1, 0, 1, 0, 0],
        [0, 0, 1, 0, 0, 1, 0, 0]
    ]

    let solStep = [
        [ 0, 'fixed', 0 ],
        [ 2, 'fixed', 2 ],
        [ 3, 'fixed', 3 ],
        [ 6, 'fixed', 6 ],
        [ 1, 'chain', 0 ],
        [ 5, 'arcSect', [ 1, 6 ] ],
        [ 7, 'arcSect', [ 2, 5 ] ], 
        [ 4, 'arcSect', [ 1, 5 ] ], 
    ];

    // Calculate additional initial positions 
    // use mid point as init slot pos 
    let j5 = [];
    if (useRandom){
        let t = Math.random()*0.7; //make random away from end points 
        // Calculate the random point coordinates using linear interpolation
        let x = (1 - t) * pos_init[2][0] + t * pos_init[3][0];
        let y = (1 - t) * pos_init[2][1] + t * pos_init[3][1];
        j5  = [x, y]
    } else {
        j5 = [(pos_init[2][0] + pos_init[3][0])/2, (pos_init[2][1] + pos_init[3][1])/2];
    }
    posNew.push(j5);

    // compute perpendicular vector 
    let v_23 = [pos_init[3][0]- pos_init[2][0], pos_init[3][1] - pos_init[2][1]];
    let l_23 = (v_23[0]**2 + v_23[1]**2)**0.5;
    let h = l_23 * errorScale; // No way 1000 is not great enough
    let v_23p= [-v_23[1]/l_23, v_23[0]/l_23];

    // the scaling directly scales from l_23. I don't bother to compute the error. 
    let j6 = [v_23p[0] * h + j5[0], v_23p[1] * h + j5[1]];
    posNew.push(j6);

    // j7 offsets are calculated with offsetScale
    let j7  = [null, null];
    let l_ec= l_23/2;
    let l_cs = l_23 * (0.5 - offsetScale);
    posNew.push(j7);

    let output = computeArcSect_presim([7, 'presimArcSect', [2, 5]], posNew, l_ec, l_cs)

    if (output['isGood']) {
        let distMat = cdist(Textend, output['state']);
        return [distMat, solStep, output['state'], true];
    } else {
        return [null, null, null, false];
    }
    
}

var RRPRsol = exports.RRPRsol = (pos_init, useRandom = false, errorScale = 1000, offsetScale = 0.01, l_56=0.333) => {
    // 7 points without conversion 
    let posNew = pos_init.map(function(arr) {return arr.slice();}); // make immutable

    // cc idx: 4
    let B = [
        [1, 0, 1, 0, 0, 0, 0],
        [1, 1, 0, 0, 0, 0, 0],
        [0, 1, 0, 0, 1, 1, 1],
        [0, 0, 1, 1, 0, 0, 0]
    ];

    let S = [
        [2, 5, 3],
        [2, 6, 3]
    ];

    let I = [[2, 0, 1, 'R']];

    // j5, j6 being the slot joint
    // j7 is the far joint 
    // j8, j9 is the constraining joint
    let Bextend = [
        [1, 0, 1, 0, 0, 0, 0, 0, 0, 0], 
        [1, 1, 0, 0, 0, 0, 0, 0, 0, 0], 
        [0, 1, 0, 0, 1, 1, 1, 1, 0, 0], 
        [0, 0, 1, 1, 0, 0, 0, 1, 0, 0],  
        [0, 0, 0, 0, 0, 1, 0, 0, 1, 0], 
        [0, 0, 0, 0, 0, 0, 1, 0, 0, 1], 
        [0, 0, 1, 0, 0, 0, 0, 0, 1, 0], 
        [0, 0, 1, 0, 0, 0, 0, 0, 0, 1]
    ];
    
    let Textend = [
        [1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
        [1, 0, 0, 0, 1, 1, 1, 1, 0, 0],
        [1, 0, 1, 1, 0, 0, 0, 1, 1, 1],
        [0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
        [0, 1, 0, 0, 0, 1, 1, 1, 0, 0],
        [0, 1, 0, 0, 1, 0, 1, 1, 1, 0],
        [0, 1, 0, 0, 1, 1, 0, 1, 0, 1],
        [0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
        [0, 0, 1, 0, 0, 1, 0, 0, 0, 0],
        [0, 0, 1, 0, 0, 0, 1, 0, 0, 0]
    ];

    let solStep = [
        [ 0, 'fixed', 0 ],
        [ 2, 'fixed', 2 ],
        [ 1, 'chain', 0 ],
        [ 7, 'arcSect', [ 1, 2 ] ],
        [ 6, 'arcSect', [ 1, 7 ] ],
        [ 5, 'arcSect', [ 6, 7 ] ], 
        [ 4, 'arcSect', [ 1, 6 ] ], 
        [ 8, 'arcSect', [ 2, 5 ] ], 
        [ 9, 'arcSect', [ 2, 6 ] ], 
        [ 3, 'arcSect', [ 2, 7 ] ],
    ];

    // Calculate additional initial positions 
    // use mid point as init slot pos 
    let j5 = [];
    let j6 = []
    if(useRandom){
        l_56 = getRandomValue();
        let l_56_diff = (1-l_56)/2;
        j5 = [(l_56_diff*pos_init[2][0] + (l_56_diff+l_56)*pos_init[3][0]), (l_56_diff*pos_init[2][1] + (l_56_diff+l_56)*pos_init[3][1])];
        posNew.push(j5);
        j6 = [((l_56_diff+l_56)*pos_init[2][0] + l_56_diff*pos_init[3][0]), ((l_56_diff+l_56)*pos_init[2][1] + l_56_diff*pos_init[3][1])];
        posNew.push(j6);
    } else {
        let p1 = 0.49
        let p2 = 0.51
        j5 = [p1 * pos_init[2][0] + p2 * pos_init[3][0],  p1 * pos_init[2][1] + p2 * pos_init[3][1]]
        j6 = [p2 * pos_init[2][0] + p1 * pos_init[3][0],  p2 * pos_init[2][1] + p1 * pos_init[3][1]]
        posNew.push(j5);
        posNew.push(j6);
    }
    
    // Compute far joint 
    // compute perpendicular vector 
    let v_23 = [pos_init[3][0]- pos_init[2][0], pos_init[3][1] - pos_init[2][1]];
    let l_23 = (v_23[0]**2 + v_23[1]**2)**0.5;
    let h = l_23 * errorScale; // No way 1000 is not great enough
    let v_23p= [-v_23[1]/l_23, v_23[0]/l_23];

    // the scaling directly scales from l_23. I don't bother to compute the error. 
    let j7 = [v_23p[0] * h + (pos_init[2][0] + pos_init[3][0])/2, v_23p[1] * h + j5[1] + (pos_init[2][1] + pos_init[3][1])/2];
    posNew.push(j7);

    // j8 offsets are calculated with offsetScale // Constraining link j8 and j9 
    let j8  = [null, null];
    posNew.push(j8);

    // compute constrain link lengths for j5 (also applicable to j6)
    let l_ec= l_23/2;
    let l_cs = l_23 * (0.5 - offsetScale);
    let output = computeArcSect_presim([8, 'presimArcSect', [2, 5]], posNew, l_ec, l_cs)

    if (output['isGood']){
        // j9 offsets are calculated with offsetScale
        let j9  = [null, null];
        output['state'].push(j9);
        output = computeArcSect_presim([9, 'presimArcSect', [2, 6]], output['state'], l_ec, l_cs)
    }

    if (output['isGood']) {
        let distMat = cdist(Textend, output['state']);
        return [distMat, solStep, output['state'], true];
    } else {
        return [null, null, null, false];
    }
    
}

var PRPRsol = exports.PRPRsol = (pos_init, useRandom = true, errorScale = 1000, offsetScale = 0.01, l_56=0.333, makeCorrection = true) => {
    let posNew = pos_init.map(function(arr) {return arr.slice();}); // make immutable 
    
    let B = [
        [1, 0, 1, 1, 0], 
        [0, 1, 0, 0, 1]
    ]

    let S = [
        [0, 1, 2], 
        [1, 3, 4]
    ]

    let I = [
        [0, 1, 2, 1] // prismatic/transitional actuator
    ]

    let Bextend = [
       // 0  1  2  3  4  5  6  7  8
        [ 1, 0, 1, 1, 0, 1, 0, 0, 0 ], 
        [ 0, 1, 0, 0, 1, 0, 0, 1, 0 ], 
        [ 0, 1, 0, 0, 0, 1, 0, 0, 0 ], 
        [ 1, 0, 0, 0, 0, 0, 1, 0, 0 ], 
        [ 0, 1, 0, 0, 0, 0, 1, 0, 0 ], //qc 
        [ 0, 0, 0, 1, 0, 0, 0, 1, 0 ], //fs
        [ 0, 1, 0, 0, 0, 0, 0, 0, 1 ], // 
        [ 0, 0, 0, 1, 0, 0, 0, 0, 1 ]
    ] 

    // dynamic link imposed. 
    let Textend = [
        [1, 1, 1, 1, 0, 1, 1, 0, 0],
        [1, 0, 0, 0, 1, 1, 1, 1, 1],
        [1, 0, 1, 1, 0, 1, 0, 0, 0],
        [1, 0, 1, 1, 0, 1, 0, 1, 1],
        [0, 1, 0, 0, 0, 0, 0, 1, 0],
        [1, 1, 1, 1, 0, 1, 0, 0, 0],
        [1, 1, 0, 0, 0, 0, 0, 0, 0],
        [0, 1, 0, 1, 1, 0, 0, 0, 0],
        [0, 1, 0, 1, 0, 0, 0, 0, 0]
    ]

    let solStep = [
        [ 0, 'fixed', 0 ],
        [ 2, 'fixed', 2 ],
        [ 3, 'fixed', 3 ],
        [ 5, 'fixed', 5 ],
        [ 1, 'lineAct', [ 0, 2 ]], 
        [ 1, 'arcSect', [ 0, 5 ]], 
        [ 6, 'arcSect', [ 0, 1 ]], 
        [ 7, 'arcSect', [ 1, 3 ]], 
        [ 4, 'arcSect', [ 1, 7 ]],
        [ 8, 'arcSect', [ 1, 3 ]]
    ];

    if (makeCorrection && useRandom) {
        //console.log('making correction')
        let t = Math.random()*0.7;
        // Calculate the random point coordinates using linear interpolation
        let x = (1 - t) * posNew[0][0] + t * posNew[2][0];
        let y = (1 - t) * posNew[0][1] + t * posNew[2][1];
        posNew[1] = [x, y]

        t = Math.random()*0.7; // otherwise the value can be too close to both ends 
        x = (1 - t) * posNew[1][0] + t * posNew[4][0];
        y = (1 - t) * posNew[1][1] + t * posNew[4][1];
        posNew[3] = [x, y]

        // console.log(posNew)
    }

    // Calculate additional initial positions 
    // use mid point as init slot pos 
    let jf1 = [null, null];
    let jc1 = [null, null]; 
    let jf2 = [null, null];
    let jc2 = [null, null]; 

    // compute perpendicular vector 
    let v_20 = [posNew[2][0]- posNew[0][0], posNew[2][1] - posNew[0][1]];
    let l_20 = (v_20[0]**2 + v_20[1]**2)**0.5;
    let h1 = l_20 * errorScale; // No way 1000 is not great enough
    let v_20p= [-v_20[1]/l_20, v_20[0]/l_20];

    // the scaling directly scales from l_20. I don't bother to compute the error. 
    jf1 = [v_20p[0] * h1 + (posNew[2][0] + posNew[0][0])/2, v_20p[1] * h1 + (posNew[2][1] + posNew[0][1])/2];
    posNew.push(jf1);

    // compute constraining joint pos 
    let l_ec = l_20/2;
    let l_cs = l_20 * (0.5 - offsetScale);
    posNew.push(jc1);
    let output = computeArcSect_presim([6, 'presimArcSect', [0, 1]], posNew, l_ec, l_cs)

    if (! output['isGood']) {
        return [null, null, null, false];        
    } 

    posNew = output['state']

    // compute perpendicular vector 
    let v_14 = [posNew[1][0]- posNew[4][0], posNew[1][1] - posNew[4][1]];
    let l_14 = (v_14[0]**2 + v_14[1]**2)**0.5;
    let h2 = l_14 * errorScale; // No way 1000 is not great enough
    let v_14p= [-v_14[1]/l_14, v_14[0]/l_14];
    
    // the scaling directly scales from l_20. I don't bother to compute the error. 
    jf2 = [v_14p[0] * h2 + (posNew[1][0] + posNew[4][0])/2, v_14p[1] * h2 + (posNew[1][1] + posNew[4][1])/2];
    posNew.push(jf2);
    
    // compute constraining joint pos 
    l_ec = l_14/2;
    l_cs = l_14 * (0.5 - offsetScale);
    posNew.push(jc2);
    output = computeArcSect_presim([8, 'presimArcSect', [1, 3]], posNew, l_ec, l_cs)

    if (output['isGood']) {
        let distMat = cdist(Textend, output['state']);
        return [distMat, solStep, output['state'], true];
    }
    
    return [null, null, null, false];

}

var Watt1T1A1Sol = exports.Watt1T1A1Sol = (pos_init) => {
    // B T and I are here to notify people what it looks like 
    // Check Zhijie's master thesis to see the definition. 
    // CC idx: 7
    let B = [
        [1, 0, 1, 0, 0, 0, 0, 0], 
        [1, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 1, 1, 0, 1, 0, 0],
        [0, 1, 0, 1, 1, 0, 0, 0], 
        [0, 0, 0, 0, 1, 0, 1, 1], 
        [0, 0, 0, 0, 0, 1, 1, 0]
    ];

    let T = [
        [1, 1, 1, 0, 0, 0, 0, 0],
        [1, 0, 0, 1, 1, 0, 0, 0],
        [1, 0, 1, 1, 0, 1, 0, 0],
        [0, 1, 1, 0, 1, 1, 0, 0],
        [0, 1, 0, 1, 0, 0, 1, 1],
        [0, 0, 1, 1, 0, 0, 1, 0],
        [0, 0, 0, 0, 1, 1, 0, 1],
        [0, 0, 0, 0, 1, 0, 1, 0]
    ];

    let I = [
        [2, 0, 1, 'R']
    ];

    let solStep = [
        [ 0, 'fixed', 0 ],
        [ 2, 'fixed', 2 ],
        [ 1, 'chain', 0 ],
        [ 3, 'arcSect', [ 1, 2 ] ],
        [ 4, 'arcSect', [ 1, 3 ] ],
        [ 5, 'arcSect', [ 2, 3 ] ],
        [ 6, 'arcSect', [ 4, 5 ] ],
        [ 7, 'arcSect', [ 4, 6 ] ]
    ];

    let distMat = cdist(T, pos_init);

    return [distMat, solStep]
}

var Watt1T2A1Sol = exports.Watt1T2A1Sol = (pos_init) => {
    // B T and I are here to notify people what it looks like 
    // Check Zhijie's master thesis to see the definition. 
    // CC idx: 7
    let B = [
        [1, 0, 1, 0, 0, 0, 0, 0], 
        [1, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 1, 1, 0, 1, 0, 0],
        [0, 1, 0, 1, 1, 0, 0, 0], 
        [0, 0, 0, 0, 1, 0, 1, 0], 
        [0, 0, 0, 0, 0, 1, 1, 1]
    ];

    let T = [
        [1, 1, 1, 0, 0, 0, 0, 0],
        [1, 0, 0, 1, 1, 0, 0, 0],
        [1, 0, 1, 1, 0, 1, 0, 0],
        [0, 1, 1, 0, 1, 1, 0, 0],
        [0, 1, 0, 1, 0, 0, 1, 0],
        [0, 0, 1, 1, 0, 0, 1, 1],
        [0, 0, 0, 0, 1, 1, 0, 1],
        [0, 0, 0, 0, 0, 1, 1, 0]
    ];

    let I = [
        [2, 0, 1, 'R']
    ];

    let solStep = [
        [ 0, 'fixed', 0 ],
        [ 2, 'fixed', 2 ],
        [ 1, 'chain', 0 ],
        [ 3, 'arcSect', [ 1, 2 ] ],
        [ 4, 'arcSect', [ 1, 3 ] ],
        [ 5, 'arcSect', [ 2, 3 ] ],
        [ 6, 'arcSect', [ 4, 5 ] ],
        [ 7, 'arcSect', [ 5, 6 ] ],
    ];

    let distMat = cdist(T, pos_init);

    return [distMat, solStep]
}

var Watt1T3A1Sol = exports.Watt1T3A1Sol = (pos_init) => {
    // B T and I are here to notify people what it looks like 
    // Check Zhijie's master thesis to see the definition. 
    // CC idx: 4 or 6 
    let B = [
        [1, 0, 1, 0, 0, 0, 0], 
        [1, 1, 0, 0, 0, 0, 0],
        [0, 0, 1, 1, 0, 1, 0],
        [0, 1, 0, 1, 1, 0, 0], 
        [0, 0, 0, 0, 1, 0, 1], 
        [0, 0, 0, 0, 0, 1, 1]
    ];

    let T = [
        [1, 1, 1, 0, 0, 0, 0],
        [1, 0, 0, 1, 1, 0, 0],
        [1, 0, 1, 1, 0, 1, 0],
        [0, 1, 1, 0, 1, 1, 0],
        [0, 1, 0, 1, 0, 0, 1], 
        [0, 0, 1, 1, 0, 0, 1], 
        [0, 0, 0, 0, 1, 1, 0]
    ];

    let I = [
        [2, 0, 1, 'R']
    ];

    let solStep = [
        [ 0, 'fixed', 0 ],
        [ 2, 'fixed', 2 ],
        [ 1, 'chain', 0 ],
        [ 3, 'arcSect', [ 1, 2 ] ],
        [ 4, 'arcSect', [ 1, 3 ] ],
        [ 5, 'arcSect', [ 2, 3 ] ],
        [ 6, 'arcSect', [ 4, 5 ] ]
    ];

    let distMat = cdist(T, pos_init);

    return [distMat, solStep]
}

var Watt1T1A2Sol = exports.Watt1T1A2Sol = (pos_init) => {
    // B T and I are here to notify people what it looks like 
    // Check Zhijie's master thesis to see the definition. 
    // CC idx: 7
    let B = [
        [1, 0, 1, 0, 0, 0, 0, 0], 
        [0, 0, 1, 1, 0, 0, 0, 0],
        [1, 1, 0, 0, 0, 1, 0, 0],
        [0, 1, 0, 1, 1, 0, 0, 0], 
        [0, 0, 0, 0, 1, 0, 1, 1], 
        [0, 0, 0, 0, 0, 1, 1, 0]
    ];

    let T = [
        [1, 1, 1, 0, 0, 1, 0, 0],
        [1, 0, 0, 1, 1, 1, 0, 0],
        [1, 0, 1, 1, 0, 0, 0, 0],
        [0, 1, 1, 0, 1, 0, 0, 0],
        [0, 1, 0, 1, 0, 0, 1, 1],
        [1, 1, 0, 0, 0, 0, 1, 0],
        [0, 0, 0, 0, 1, 1, 0, 1],
        [0, 0, 0, 0, 1, 0, 1, 0]
    ];

    let I = [
        [2, 0, 1, 'R']
    ];

    let solStep = [
        [ 0, 'fixed', 0 ],
        [ 2, 'fixed', 2 ],
        [ 1, 'chain', 0 ],
        [ 3, 'arcSect', [ 1, 2 ] ],
        [ 5, 'arcSect', [ 0, 1 ] ],
        [ 4, 'arcSect', [ 1, 3 ] ],
        [ 6, 'arcSect', [ 4, 5 ] ],
        [ 7, 'arcSect', [ 4, 6 ] ]
    ];

    let distMat = cdist(T, pos_init);

    return [distMat, solStep]
}

var Watt1T2A2Sol = exports.Watt1T2A2Sol = (pos_init) => {
    // B T and I are here to notify people what it looks like 
    // Check Zhijie's master thesis to see the definition. 
    // CC idx: 7
    let B = [
        [1, 0, 1, 0, 0, 0, 0, 0], 
        [0, 0, 1, 1, 0, 0, 0, 0],
        [1, 1, 0, 0, 0, 1, 0, 0],
        [0, 1, 0, 1, 1, 0, 0, 0], 
        [0, 0, 0, 0, 1, 0, 1, 0], 
        [0, 0, 0, 0, 0, 1, 1, 1]
    ];

    let T = [
        [1, 1, 1, 0, 0, 1, 0, 0],
        [1, 0, 0, 1, 1, 1, 0, 0],
        [1, 0, 1, 1, 0, 0, 0, 0],
        [0, 1, 1, 0, 1, 0, 0, 0],
        [0, 1, 0, 1, 0, 0, 1, 0],
        [1, 1, 0, 0, 0, 0, 1, 1],
        [0, 0, 0, 0, 1, 1, 0, 1],
        [0, 0, 0, 0, 0, 1, 1, 0]
    ];

    let I = [
        [2, 0, 1, 'R']
    ];

    let solStep = [
        [ 0, 'fixed', 0 ],
        [ 2, 'fixed', 2 ],
        [ 1, 'chain', 0 ],
        [ 3, 'arcSect', [ 1, 2 ] ],
        [ 5, 'arcSect', [ 0, 1 ] ],
        [ 4, 'arcSect', [ 1, 3 ] ],
        [ 6, 'arcSect', [ 4, 5 ] ],
        [ 7, 'arcSect', [ 5, 6 ] ]
    ];

    let distMat = cdist(T, pos_init);

    return [distMat, solStep]
}

var Watt1T3A2Sol = exports.Watt1T3A2Sol = (pos_init) => {
    // B T and I are here to notify people what it looks like 
    // Check Zhijie's master thesis to see the definition. 
    // CC idx: 4 or 6 
    let B = [
        [1, 0, 1, 0, 0, 0, 0], 
        [0, 0, 1, 1, 0, 0, 0],
        [1, 1, 0, 0, 0, 1, 0],
        [0, 1, 0, 1, 1, 0, 0], 
        [0, 0, 0, 0, 1, 0, 1], 
        [0, 0, 0, 0, 0, 1, 1]
    ];

    let T = [
        [1, 1, 1, 0, 0, 1, 0],
        [1, 0, 0, 1, 1, 1, 0],
        [1, 0, 1, 1, 0, 0, 0],
        [0, 1, 1, 0, 1, 0, 0],
        [0, 1, 0, 1, 0, 0, 1],
        [1, 1, 0, 0, 0, 0, 1],
        [0, 0, 0, 0, 1, 1, 0]
    ];

    let I = [
        [2, 0, 1, 'R']
    ];

    let solStep = [
        [ 0, 'fixed', 0 ],
        [ 2, 'fixed', 2 ],
        [ 1, 'chain', 0 ],
        [ 3, 'arcSect', [ 1, 2 ] ],
        [ 5, 'arcSect', [ 0, 1 ] ],
        [ 4, 'arcSect', [ 1, 3 ] ],
        [ 6, 'arcSect', [ 4, 5 ] ]
    ];

    let distMat = cdist(T, pos_init);

    return [distMat, solStep]
}

var Watt2Sol = exports.Watt2Sol = (pos_init) => {
    // Watt2 only outputs circular curves. 
    // B T and I are here to notify people what it looks like 
    // Check Zhijie's master thesis to see the definition. 
    let B = [
        [1, 0, 1, 0, 0, 0, 1], 
        [1, 1, 0, 0, 0, 0, 0],
        [0, 1, 0, 1, 0, 0, 0],
        [0, 0, 1, 1, 1, 0, 0],
        [0, 0, 0, 0, 1, 1, 0],
        [0, 0, 0, 0, 0, 1, 1]
    ];

    let T = [
        [1, 1, 1, 0, 0, 0, 1],
        [1, 0, 0, 1, 0, 0, 0],
        [1, 0, 1, 1, 1, 0, 1],
        [0, 1, 1, 0, 1, 0, 0],
        [0, 0, 1, 1, 0, 1, 0],
        [0, 0, 0, 0, 1, 0, 1],
        [1, 0, 1, 0, 0, 1, 1]
    ];

    let I = [
        [2, 0, 1, 'R']
    ];

    let solStep = [
        [ 0, 'fixed', 0 ],
        [ 2, 'fixed', 2 ],
        [ 6, 'fixed', 6 ],
        [ 1, 'chain', 0 ],
        [ 3, 'arcSect', [ 1, 2 ] ],
        [ 4, 'arcSect', [ 2, 3 ] ],
        [ 5, 'arcSect', [ 4, 6 ] ],
    ];

    let distMat = cdist(T, pos_init);

    return [distMat, solStep]

}

var Watt2T1A1Sol = exports.Watt2T1A1Sol = (pos_init) => {
    // Watt2 only outputs circular curves. 
    // B T and I are here to notify people what it looks like 
    // Check Zhijie's master thesis to see the definition. 
    let B = [
        [1, 0, 1, 0, 0, 0, 1, 0], 
        [1, 1, 0, 0, 0, 0, 0, 0],
        [0, 1, 0, 1, 0, 0, 0, 1],
        [0, 0, 1, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 1, 1, 0, 0],
        [0, 0, 0, 0, 0, 1, 1, 0]
    ];

    let T = [
        [1, 1, 1, 0, 0, 0, 1, 0],
        [1, 0, 0, 1, 0, 0, 0, 1],
        [1, 0, 1, 1, 1, 0, 1, 0],
        [0, 1, 1, 0, 1, 0, 0, 1],
        [0, 0, 1, 1, 0, 1, 0, 0],
        [0, 0, 0, 0, 1, 0, 1, 0],
        [1, 0, 1, 0, 0, 1, 1, 0],
        [0, 1, 0, 1, 0, 0, 0, 0]
    ];

    let I = [
        [2, 0, 1, 'R']
    ];

    let solStep = [
        [ 0, 'fixed', 0 ],
        [ 2, 'fixed', 2 ],
        [ 6, 'fixed', 6 ],
        [ 1, 'chain', 0 ],
        [ 3, 'arcSect', [ 1, 2 ] ],
        [ 4, 'arcSect', [ 2, 3 ] ],
        [ 5, 'arcSect', [ 4, 6 ] ],
        [ 7, 'arcSect', [ 1, 3 ] ],
    ];

    let distMat = cdist(T, pos_init);

    return [distMat, solStep]
}

var Watt2T2A1Sol = exports.Watt2T2A1Sol = (pos_init) => {
    // Watt2 only outputs circular curves. 
    // B T and I are here to notify people what it looks like 
    // Check Zhijie's master thesis to see the definition. 
    let B = [
        [1, 0, 1, 0, 0, 0, 1, 0], 
        [1, 1, 0, 0, 0, 0, 0, 0],
        [0, 1, 0, 1, 0, 0, 0, 0],
        [0, 0, 1, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 1, 1, 0, 1],
        [0, 0, 0, 0, 0, 1, 1, 0]
    ];

    let T = [
        [1, 1, 1, 0, 0, 0, 1, 0],
        [1, 0, 0, 1, 0, 0, 0, 0],
        [1, 0, 1, 1, 1, 0, 1, 0],
        [0, 1, 1, 0, 1, 0, 0, 0],
        [0, 0, 1, 1, 0, 1, 0, 1],
        [0, 0, 0, 0, 1, 0, 1, 1],
        [1, 0, 1, 0, 0, 1, 1, 0],
        [0, 0, 0, 0, 1, 1, 0, 0]
    ];

    let I = [
        [2, 0, 1, 'R']
    ];

    let solStep = [
        [ 0, 'fixed', 0 ],
        [ 2, 'fixed', 2 ],
        [ 6, 'fixed', 6 ],
        [ 1, 'chain', 0 ],
        [ 3, 'arcSect', [ 1, 2 ] ],
        [ 4, 'arcSect', [ 2, 3 ] ],
        [ 5, 'arcSect', [ 4, 6 ] ],
        [ 7, 'arcSect', [ 4, 5 ] ],
    ];

    let distMat = cdist(T, pos_init);

    return [distMat, solStep]
}

var Watt2T1A2Sol = exports.Watt2T1A2Sol = (pos_init) => {
    // Watt2 only outputs circular curves. 
    // B T and I are here to notify people what it looks like 
    // Check Zhijie's master thesis to see the definition. 
    let B = [
        [1, 0, 1, 0, 0, 0, 1, 0], 
        [0, 0, 1, 1, 0, 0, 0, 0],
        [0, 1, 0, 1, 0, 0, 0, 1],
        [1, 1, 0, 0, 1, 0, 0, 0],
        [0, 0, 0, 0, 1, 1, 0, 0],
        [0, 0, 0, 0, 0, 1, 1, 0]
    ];

    let T = [
        [1, 1, 1, 0, 1, 0, 1, 0],
        [1, 0, 0, 1, 1, 0, 0, 1],
        [1, 0, 1, 1, 0, 0, 1, 0],
        [0, 1, 1, 0, 0, 0, 0, 1],
        [1, 1, 0, 0, 0, 1, 0, 0],
        [0, 0, 0, 0, 1, 0, 1, 0],
        [1, 0, 1, 0, 0, 1, 1, 0],
        [0, 1, 0, 1, 0, 0, 0, 0]
    ];

    let I = [
        [2, 0, 1, 'R']
    ];

    let solStep = [
        [ 0, 'fixed', 0 ],
        [ 2, 'fixed', 2 ],
        [ 6, 'fixed', 6 ],
        [ 1, 'chain', 0 ],
        [ 3, 'arcSect', [ 1, 2 ] ],
        [ 4, 'arcSect', [ 0, 1 ] ],
        [ 5, 'arcSect', [ 4, 6 ] ],
        [ 7, 'arcSect', [ 1, 3 ] ],
    ];

    let distMat = cdist(T, pos_init);

    return [distMat, solStep]
}

var Watt2T2A2Sol = exports.Watt2T2A2Sol = (pos_init) => {
    // Watt2 only outputs circular curves. 
    // B T and I are here to notify people what it looks like 
    // Check Zhijie's master thesis to see the definition. 
    let B = [
        [1, 0, 1, 0, 0, 0, 1, 0], 
        [0, 0, 1, 1, 0, 0, 0, 0],
        [0, 1, 0, 1, 0, 0, 0, 0],
        [1, 1, 0, 0, 1, 0, 0, 0],
        [0, 0, 0, 0, 1, 1, 0, 1],
        [0, 0, 0, 0, 0, 1, 1, 0]
    ];

    let T = [
        [1, 1, 1, 0, 1, 0, 1, 0],
        [1, 0, 0, 1, 1, 0, 0, 0],
        [1, 0, 1, 1, 0, 0, 1, 0],
        [0, 1, 1, 0, 0, 0, 0, 0],
        [1, 1, 0, 0, 0, 1, 0, 1],
        [0, 0, 0, 0, 1, 0, 1, 1],
        [1, 0, 1, 0, 0, 1, 1, 0],
        [0, 0, 0, 0, 1, 1, 0, 0]
    ];

    let I = [
        [2, 0, 1, 'R']
    ];

    let solStep = [
        [ 0, 'fixed', 0 ],
        [ 2, 'fixed', 2 ],
        [ 6, 'fixed', 6 ],
        [ 1, 'chain', 0 ],
        [ 3, 'arcSect', [ 1, 2 ] ],
        [ 4, 'arcSect', [ 0, 1 ] ],
        [ 5, 'arcSect', [ 4, 6 ] ],
        [ 7, 'arcSect', [ 4, 5 ] ],
    ];

    let distMat = cdist(T, pos_init);

    return [distMat, solStep]
}

var Steph1Sol = exports.Steph1Sol = (pos_init) => {
    // B T and I are here to notify people what it looks like 
    // Check Zhijie's master thesis to see the definition. 

    // CC idx: 4 or 6 
    let B = [
        [1, 0, 1, 0, 0, 0, 0], 
        [1, 1, 0, 0, 1, 0, 0], 
        [0, 0, 1, 1, 0, 1, 0], 
        [0, 1, 0, 1, 0, 0, 0], 
        [0, 0, 0, 0, 1, 0, 1], 
        [0, 0, 0, 0, 0, 1, 1]
    ];

    let T = [
        [1, 1, 1, 0, 1, 0, 0], 
        [1, 0, 0, 1, 1, 0, 0],
        [1, 0, 1, 1, 0, 1, 0],
        [0, 1, 1, 0, 0, 1, 0], 
        [1, 1, 0, 0, 0, 0, 1], 
        [0, 0, 1, 1, 0, 0, 1], 
        [0, 0, 0, 0, 1, 1, 0]
    ];

    let I = [
        [2, 0, 1, 'R']
    ];

    let solStep = [
        [ 0, 'fixed', 0 ],
        [ 2, 'fixed', 2 ],
        [ 1, 'chain', 0 ],
        [ 3, 'arcSect', [ 1, 2 ] ],
        [ 4, 'arcSect', [ 0, 1 ] ],
        [ 5, 'arcSect', [ 2, 3 ] ],
        [ 6, 'arcSect', [ 4, 5 ] ]
    ];

    let distMat = cdist(T, pos_init);

    return [distMat, solStep]
}

var Steph1T1Sol = exports.Steph1T1Sol = (pos_init) => {
    // B T and I are here to notify people what it looks like 
    // Check Zhijie's master thesis to see the definition. 

    // CC idx: 4 or 6 
    let B = [
        [1, 0, 1, 0, 0, 0, 0, 0], 
        [1, 1, 0, 0, 1, 0, 0, 0], 
        [0, 0, 1, 1, 0, 1, 0, 0], 
        [0, 1, 0, 1, 0, 0, 0, 0], 
        [0, 0, 0, 0, 1, 0, 1, 1], 
        [0, 0, 0, 0, 0, 1, 1, 0]
    ];

    let T = [
        [1, 1, 1, 0, 1, 0, 0, 0],
        [1, 0, 0, 1, 1, 0, 0, 0],
        [1, 0, 1, 1, 0, 1, 0, 0],
        [0, 1, 1, 0, 0, 1, 0, 0],
        [1, 1, 0, 0, 0, 0, 1, 1],
        [0, 0, 1, 1, 0, 0, 1, 0],
        [0, 0, 0, 0, 1, 1, 0, 1],
        [0, 0, 0, 0, 1, 0, 1, 0]
    ];

    let I = [
        [2, 0, 1, 'R']
    ];

    let solStep = [
        [ 0, 'fixed', 0 ],
        [ 2, 'fixed', 2 ],
        [ 1, 'chain', 0 ],
        [ 3, 'arcSect', [ 1, 2 ] ],
        [ 4, 'arcSect', [ 0, 1 ] ],
        [ 5, 'arcSect', [ 2, 3 ] ],
        [ 6, 'arcSect', [ 4, 5 ] ],
        [ 7, 'arcSect', [ 4, 6 ] ],
    ];

    let distMat = cdist(T, pos_init);

    return [distMat, solStep]
}

var Steph1T2Sol = exports.Steph1T2Sol = (pos_init) => {
    // B T and I are here to notify people what it looks like 
    // Check Zhijie's master thesis to see the definition. 

    // CC idx: 4 or 6 
    let B = [
        [1, 0, 1, 0, 0, 0, 0, 0], 
        [1, 1, 0, 0, 1, 0, 0, 0], 
        [0, 0, 1, 1, 0, 1, 0, 0], 
        [0, 1, 0, 1, 0, 0, 0, 0], 
        [0, 0, 0, 0, 1, 0, 1, 0], 
        [0, 0, 0, 0, 0, 1, 1, 1]
    ];

    let T = [
        [1, 1, 1, 0, 1, 0, 0, 0],
        [1, 0, 0, 1, 1, 0, 0, 0],
        [1, 0, 1, 1, 0, 1, 0, 0],
        [0, 1, 1, 0, 0, 1, 0, 0],
        [1, 1, 0, 0, 0, 0, 1, 0],
        [0, 0, 1, 1, 0, 0, 1, 1],
        [0, 0, 0, 0, 1, 1, 0, 1],
        [0, 0, 0, 0, 0, 1, 1, 0]
    ]

    let I = [
        [2, 0, 1, 'R']
    ];

    let solStep = [
        [ 0, 'fixed', 0 ],
        [ 2, 'fixed', 2 ],
        [ 1, 'chain', 0 ],
        [ 3, 'arcSect', [ 1, 2 ] ],
        [ 4, 'arcSect', [ 0, 1 ] ],
        [ 5, 'arcSect', [ 2, 3 ] ],
        [ 6, 'arcSect', [ 4, 5 ] ],
        [ 7, 'arcSect', [ 5, 6 ] ]
    ];

    let distMat = cdist(T, pos_init);

    return [distMat, solStep]
}

var Steph1T3Sol = exports.Steph1T3Sol = (pos_init) => {
    // B T and I are here to notify people what it looks like 
    // Check Zhijie's master thesis to see the definition. 

    // CC idx: 4 or 6 
    let B = [
        [1, 0, 1, 0, 0, 0, 0, 0], 
        [1, 1, 0, 0, 1, 0, 0, 0], 
        [0, 0, 1, 1, 0, 1, 0, 0], 
        [0, 1, 0, 1, 0, 0, 0, 1], 
        [0, 0, 0, 0, 1, 0, 1, 0], 
        [0, 0, 0, 0, 0, 1, 1, 0]
    ];

    let T = [
        [1, 1, 1, 0, 1, 0, 0, 0],
        [1, 0, 0, 1, 1, 0, 0, 1],
        [1, 0, 1, 1, 0, 1, 0, 0],
        [0, 1, 1, 0, 0, 1, 0, 1],
        [1, 1, 0, 0, 0, 0, 1, 0],
        [0, 0, 1, 1, 0, 0, 1, 0],
        [0, 0, 0, 0, 1, 1, 0, 0],
        [0, 1, 0, 1, 0, 0, 0, 0]
    ];

    let I = [
        [2, 0, 1, 'R']
    ];

    let solStep = [
        [ 0, 'fixed', 0 ],
        [ 2, 'fixed', 2 ],
        [ 1, 'chain', 0 ],
        [ 3, 'arcSect', [ 1, 2 ] ],
        [ 4, 'arcSect', [ 0, 1 ] ],
        [ 5, 'arcSect', [ 2, 3 ] ],
        [ 6, 'arcSect', [ 4, 5 ] ],
        [ 7, 'arcSect', [ 1, 3 ] ]
    ];

    let distMat = cdist(T, pos_init);

    return [distMat, solStep]
}

// This requires optimization. You should have this solver before solving it. 
var Steph2T2A1Sol = exports.Steph2T2A1Sol = (pos_init) => {
    // B T and I are here to notify people what it looks like 
    // Check Zhijie's master thesis to see the definition. 

    // CC idx: 4 or 5
    let B = [
        [1, 0, 1, 0, 0, 0, 0], 
        [1, 1, 0, 0, 0, 0, 0],
        [0, 1, 0, 0, 1, 1, 0],
        [0, 0, 0, 1, 1, 0, 0],
        [0, 0, 0, 0, 0, 1, 1],
        [0, 0, 1, 1, 0, 0, 1]
    ];

    let T = [
        [1, 1, 1, 0, 0, 0, 0],
        [1, 0, 0, 0, 1, 1, 0],
        [1, 0, 1, 1, 0, 0, 1],
        [0, 0, 1, 0, 1, 0, 1],
        [0, 1, 0, 1, 0, 1, 0], 
        [0, 1, 0, 0, 1, 0, 1],
        [0, 0, 1, 1, 0, 1, 0]
    ];

    let I = [
        [2, 0, 1, 'R']
    ];

    let solStep = [
        [ 0, 'fixed', 0 ],
        [ 2, 'fixed', 2 ],
        [ 1, 'chain', 0 ],
        [ [3, 4, 5, 6], 'optim', [ [2, 6], [2, 3], [3, 6], [3, 4], [5, 6], [1, 4], [1, 5], [4, 5]] ], // Yeah this is so long; Placing the actuator on 2 will help slightly but not much 
    ];

    let distMat = cdist(T, pos_init);

    //console.log('distmat', distMat)
    return [distMat, solStep]
}

var Steph2T1A1Sol = exports.Steph2T1A1Sol = (pos_init) => {
    // B T and I are here to notify people what it looks like 
    // Check Zhijie's master thesis to see the definition. 

    // CC idx: 7
    let B = [
        [1, 0, 1, 0, 0, 0, 0, 0], 
        [1, 1, 0, 0, 0, 0, 0, 0],
        [0, 1, 0, 0, 1, 1, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, 1, 1],
        [0, 0, 1, 1, 0, 0, 1, 0]
    ];

    let T = [
        [1, 1, 1, 0, 0, 0, 0, 0],
        [1, 0, 0, 0, 1, 1, 0, 0],
        [1, 0, 1, 1, 0, 0, 1, 0],
        [0, 0, 1, 0, 1, 0, 1, 0],
        [0, 1, 0, 1, 0, 1, 0, 0],
        [0, 1, 0, 0, 1, 0, 1, 1],
        [0, 0, 1, 1, 0, 1, 0, 1],
        [0, 0, 0, 0, 0, 1, 1, 0]
    ];

    let I = [
        [2, 0, 1, 'R']
    ];

    let solStep = [
        [ 0, 'fixed', 0 ],
        [ 2, 'fixed', 2 ],
        [ 1, 'chain', 0 ],
        [ [3, 4, 5, 6], 'optim', [ [2, 6], [2, 3], [3, 6], [3, 4], [5, 6], [1, 4], [1, 5], [4, 5]] ], // Yeah this is so long; Placing the actuator on 2 will help slightly but not much 
        [ 7, 'arcSect', [ 5, 6 ] ]
    ];

    let distMat = cdist(T, pos_init);

    return [distMat, solStep]
}

// This requires optimization. You should have this solver before solving it. 
var Steph2T2A2Sol = exports.Steph2T2A2Sol = (pos_init) => {
    // B T and I are here to notify people what it looks like 
    // Check Zhijie's master thesis to see the definition. 

    // CC idx: 4 or 5
    let B = [
        [1, 0, 1, 0, 0, 0, 0], 
        [0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 1, 1, 1, 0],
        [0, 1, 0, 0, 1, 0, 0],
        [0, 0, 0, 0, 0, 1, 1],
        [1, 1, 0, 0, 0, 0, 1]
    ];

    let T = [
        [1, 1, 1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1, 0, 1],
        [1, 0, 1, 1, 0, 0, 0],
        [0, 0, 1, 0, 1, 1, 0],
        [0, 1, 0, 1, 0, 1, 0],
        [0, 0, 0, 1, 1, 0, 1],
        [1, 1, 0, 0, 0, 1, 0]
    ];

    let I = [
        [2, 0, 1, 'R']
    ];

    let solStep = [
        [ 0, 'fixed', 0 ],
        [ 2, 'fixed', 2 ],
        [ 1, 'chain', 0 ],
        [ [3, 4, 5, 6], 'optim', [ [0, 6], [1, 6], [1, 4], [2, 3], [3, 4], [3, 5], [4, 5], [5, 6]] ], // Yeah this is so long; Placing the actuator on 2 will help slightly but not much 
    ];

    let distMat = cdist(T, pos_init);

    //console.log('distmat', distMat)
    return [distMat, solStep]
}

var Steph2T1A2Sol = exports.Steph2T1A2Sol = (pos_init) => {
    // B T and I are here to notify people what it looks like 
    // Check Zhijie's master thesis to see the definition. 

    // CC idx: 7
    let B = [
        [1, 0, 1, 0, 0, 0, 0, 0], 
        [0, 0, 1, 1, 0, 0, 0, 0],
        [0, 0, 0, 1, 1, 1, 0, 0],
        [0, 1, 0, 0, 1, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, 1, 1],
        [1, 1, 0, 0, 0, 0, 1, 0]
    ];

    let T = [
        [1, 1, 1, 0, 0, 0, 1, 0],
        [1, 0, 0, 0, 1, 0, 1, 0],
        [1, 0, 1, 1, 0, 0, 0, 0],
        [0, 0, 1, 0, 1, 1, 0, 0],
        [0, 1, 0, 1, 0, 1, 0, 0],
        [0, 0, 0, 1, 1, 0, 1, 1],
        [1, 1, 0, 0, 0, 1, 0, 1],
        [0, 0, 0, 0, 0, 1, 1, 0]
    ];

    let I = [
        [2, 0, 1, 'R']
    ];

    let solStep = [
        [ 0, 'fixed', 0 ],
        [ 2, 'fixed', 2 ],
        [ 1, 'chain', 0 ],
        [ [3, 4, 5, 6], 'optim', [ [0, 6], [2, 3], [1, 6], [1, 4], [5, 6], [3, 4], [3, 5], [4, 5]] ], // Yeah this is so long; Placing the actuator on 2 will help slightly but not much 
        [ 7, 'arcSect', [ 5, 6 ] ]
    ];

    let distMat = cdist(T, pos_init);

    return [distMat, solStep]
}

var Steph3T1A1Sol = exports.Steph3T1A1Sol = (pos_init) => {
    // B T and I are here to notify people what it looks like 
    // Check Zhijie's master thesis to see the definition. 

    // CC idx: 4 or 5
    let B = [
        [1, 0, 1, 0, 0, 0, 1], 
        [1, 1, 0, 0, 0, 0, 0],
        [0, 0, 1, 1, 0, 0, 0],
        [0, 1, 0, 1, 1, 0, 0], 
        [0, 0, 0, 0, 1, 1, 0], 
        [0, 0, 0, 0, 0, 1, 1]
    ];

    let T = [
        [1, 1, 1, 0, 0, 0, 1],
        [1, 0, 0, 1, 1, 0, 0],
        [1, 0, 1, 1, 0, 0, 1],
        [0, 1, 1, 0, 1, 0, 0],
        [0, 1, 0, 1, 0, 1, 0],
        [0, 0, 0, 0, 1, 0, 1],
        [1, 0, 1, 0, 0, 1, 1]
    ];

    let I = [
        [2, 0, 1, 'R']
    ];

    let solStep = [
        [ 0, 'fixed', 0 ],
        [ 2, 'fixed', 2 ],
        [ 6, 'fixed', 6 ],
        [ 1, 'chain', 0 ],
        [ 3, 'arcSect', [ 1, 2 ] ],
        [ 4, 'arcSect', [ 1, 3 ] ],
        [ 5, 'arcSect', [ 4, 6 ] ],
    ];

    let distMat = cdist(T, pos_init);

    return [distMat, solStep]
}

var Steph3T2A1Sol = exports.Steph3T2A1Sol = (pos_init) => {
    // B T and I are here to notify people what it looks like 
    // Check Zhijie's master thesis to see the definition. 

    // CC idx: 7
    let B = [
        [1, 0, 1, 0, 0, 0, 1, 0], 
        [1, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 1, 1, 0, 0, 0, 0],
        [0, 1, 0, 1, 1, 0, 0, 0], 
        [0, 0, 0, 0, 1, 1, 0, 1], 
        [0, 0, 0, 0, 0, 1, 1, 0]
    ];

    let T = [
        [1, 1, 1, 0, 0, 0, 1, 0],
        [1, 0, 0, 1, 1, 0, 0, 0],
        [1, 0, 1, 1, 0, 0, 1, 0],
        [0, 1, 1, 0, 1, 0, 0, 0],
        [0, 1, 0, 1, 0, 1, 0, 1],
        [0, 0, 0, 0, 1, 0, 1, 1],
        [1, 0, 1, 0, 0, 1, 1, 0],
        [0, 0, 0, 0, 1, 1, 0, 0]
    ];

    let I = [
        [2, 0, 1, 'R']
    ];

    let solStep = [
        [ 0, 'fixed', 0 ],
        [ 2, 'fixed', 2 ],
        [ 6, 'fixed', 6 ],
        [ 1, 'chain', 0 ],
        [ 3, 'arcSect', [ 1, 2 ] ],
        [ 4, 'arcSect', [ 1, 3 ] ],
        [ 5, 'arcSect', [ 4, 6 ] ],
        [ 7, 'arcSect', [ 4, 5 ] ],
    ];

    let distMat = cdist(T, pos_init);

    return [distMat, solStep]
}

var Steph3T1A2Sol = exports.Steph3T1A2Sol = (pos_init) => {
    // B T and I are here to notify people what it looks like 
    // Check Zhijie's master thesis to see the definition. 

    // CC idx: 4
    let B = [
        [1, 0, 1, 0, 0, 0, 1], 
        [1, 1, 0, 0, 0, 0, 0],
        [0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 1, 1, 1, 0], 
        [0, 1, 0, 0, 1, 0, 0], 
        [0, 0, 0, 0, 0, 1, 1]
    ];

    let T = [
        [1, 1, 1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1, 0, 0],
        [1, 0, 1, 1, 0, 0, 1],
        [0, 0, 1, 0, 1, 1, 0],
        [0, 1, 0, 1, 0, 1, 0],
        [0, 0, 0, 1, 1, 0, 1],
        [1, 0, 1, 0, 0, 1, 1]
    ];

    let I = [
        [2, 0, 1, 'R']
    ];

    let solStep = [
        [ 0, 'fixed', 0 ],
        [ 2, 'fixed', 2 ],
        [ 6, 'fixed', 6 ],
        [ 1, 'chain', 0 ],
        [ [3, 4, 5], 'optim', [ [1,4], [2, 3], [5, 6], [3, 4], [3, 5], [4, 5] ] ], // Yeah this is so long; Placing the actuator on 2 will help slightly but not much 
    ];

    let distMat = cdist(T, pos_init);

    return [distMat, solStep]
}

var Steph3T2A2Sol = exports.Steph3T2A2Sol = (pos_init) => {
    // B T and I are here to notify people what it looks like 
    // Check Zhijie's master thesis to see the definition. 

    // CC idx: 7
    let B = [
        [1, 0, 1, 0, 0, 0, 1, 0], 
        [1, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 1, 1, 0, 0, 0, 0],
        [0, 0, 0, 1, 1, 1, 0, 0], 
        [0, 1, 0, 0, 1, 0, 0, 1], 
        [0, 0, 0, 0, 0, 1, 1, 0]
    ];

    let T = [
        [1, 1, 1, 0, 0, 0, 1, 0],
        [1, 0, 0, 0, 1, 0, 0, 1],
        [1, 0, 1, 1, 0, 0, 1, 0],
        [0, 0, 1, 0, 1, 1, 0, 0],
        [0, 1, 0, 1, 0, 1, 0, 1],
        [0, 0, 0, 1, 1, 0, 1, 0],
        [1, 0, 1, 0, 0, 1, 1, 0],
        [0, 1, 0, 0, 1, 0, 0, 0]
    ];

    let I = [
        [2, 0, 1, 'R']
    ];

    let solStep = [
        [ 0, 'fixed', 0 ],
        [ 2, 'fixed', 2 ],
        [ 6, 'fixed', 6 ],
        [ 1, 'chain', 0 ],
        [ [3, 4, 5], 'optim', [ [1,4], [2, 3], [5, 6], [3, 4], [3, 5], [4, 5] ] ], // Yeah this is so long; Placing the actuator on 2 will help slightly but not much 
        [ 7, 'arcSect', [ 1, 4 ] ],
    ];

    let distMat = cdist(T, pos_init);

    return [distMat, solStep]
}

var Watt2AnarSol = exports.Watt2AnarSol = (pos_init) => {
    // Watt2 only outputs circular curves. So Anar asked for a slightly modified version 
    // B T and I are here to notify people what it looks like 
    // Check Zhijie's master thesis to see the definition. 
    let B = [
        [1, 0, 1, 0, 0, 1, 0], 
        [1, 1, 0, 0, 0, 0, 0],
        [0, 0, 1, 1, 0, 0, 0],
        [0, 1, 0, 1, 1, 0, 0], 
        [0, 0, 0, 1, 0, 0, 1],
        [0, 0, 0, 0, 0, 1, 1]
    ];

    let T = [
        [1, 1, 1, 0, 0, 1, 0],
        [1, 0, 0, 1, 1, 0, 0],
        [1, 0, 1, 1, 0, 1, 0],
        [0, 1, 1, 0, 1, 0, 1],
        [0, 1, 0, 1, 0, 0, 0],
        [1, 0, 1, 0, 0, 1, 1],
        [0, 0, 0, 1, 0, 1, 0]
    ]


    let solStep = [
        [ 0, 'fixed', 0],
        [ 2, 'fixed', 2],
        [ 5, 'fixed', 5],
        [ 1, 'chain', 0],
        [ 3, 'arcSect', [ 1, 2 ] ],
        [ 4, 'arcSect', [ 1, 3 ] ], 
        [ 6, 'arcSect', [ 3, 5 ] ], 
    ];

    // -1: the x axis 
    // -1: use legacy chain computation
    let solStepExtra = [
        [ 0, 'fixed', [0]],
        [ 2, 'fixed', [2] ],
        [ 5, 'fixed', [5] ],
        [ 1, 'chain', [-1, 0, 1] ],
        [ 3, 'arcSect', [ 1, 2 ] ],
        [ 4, 'arcSect', [ 1, 3 ] ], 
        [ 6, 'arcSect', [ 3, 5 ] ], 
    ];

    let distMat = cdist(T, pos_init);

    return [distMat, solStep]
}

var RRRRoldSol = exports.RRRRoldSol = (pos_init) => {
    let ccidx = 4 
    
    let B = [
        [1,0,1,0,0],
        [1,1,0,0,0],
        [0,0,1,1,0],
        [0,1,0,1,1]
    ]

    let T = [
        [1, 1, 1, 0, 0],
        [1, 0, 0, 1, 1],
        [1, 0, 1, 1, 0],
        [0, 1, 1, 0, 1],
        [0, 1, 0, 1, 0]
    ];

    let I = [[2,0,1, 'R']]

    let solStep = [
        [ 0, 'fixed', 0 ],
        [ 2, 'fixed', 2 ],
        [ 1, 'chain', 0 ],
        [ 3, 'arcSect', [ 1, 2 ] ],
        [ 4, 'arcSect', [ 1, 3 ] ]
    ];

    let distMat = cdist(T, pos_init);

    return [distMat, solStep]
}

let Steph1OldSol = exports.Steph1OldSol = (pos_init) => {
    let ccidx = 7
    
    let B = [
        [1,0,0,1,0,0,0,0],
        [1,1,1,0,0,0,0,0],
        [0,0,0,1,1,1,0,0],
        [0,0,1,0,1,0,0,0],
        [0,0,0,0,0,1,1,0],
        [0,1,0,0,0,0,1,1]
    ]
    
    let I = [[3,0,1,0]] 
    
    let T = [
        [1, 1, 1, 1, 0, 0, 0, 0], // 0
        [1, 0, 1, 0, 0, 0, 1, 1], // 1
        [1, 1, 0, 0, 1, 0, 0, 0], // 2
        [1, 0, 0, 1, 1, 1, 0, 0], // 3
        [0, 0, 1, 1, 0, 1, 0, 0], // 4
        [0, 0, 0, 1, 1, 0, 1, 0], // 5
        [0, 1, 0, 0, 0, 1, 0, 1], // 6
        [0, 1, 0, 0, 0, 0, 1, 0]  // 7 
    ]

    let solStep = [
        [ 0, 'fixed', 0 ],
        [ 3, 'fixed', 3 ],
        [ 1, 'chain', 0 ],
        [ 2, 'arcSect', [ 0, 1 ] ],
        [ 4, 'arcSect', [ 2, 3 ] ], 
        [ 5, 'arcSect', [ 3, 4 ] ], 
        [ 6, 'arcSect', [ 1, 5 ] ], 
        [ 7, 'arcSect', [ 1, 6 ] ] 
    ];

    let distMat = cdist(T, pos_init);

    return [distMat, solStep]

}

let Watt1OldSol = exports.Watt1OldSol = (pos_init) => {
    let ccidx = 7 

    let B = [
        [1,0,1,0,0,0,0,0],
        [1,1,0,0,0,0,0,0],
        [0,0,1,1,1,0,0,0],
        [0,1,0,1,0,1,0,0],
        [0,0,0,0,1,0,1,0],
        [0,0,0,0,0,1,1,1]
    ]

    let T = [
        [1, 1, 1, 0, 0, 0, 0, 0], // 0
        [1, 0, 0, 1, 0, 1, 0, 0], // 1
        [1, 0, 1, 1, 1, 0, 0, 0], // 2
        [0, 1, 1, 0, 1, 1, 0, 0], // 3
        [0, 0, 1, 1, 0, 0, 1, 0], // 4
        [0, 1, 0, 1, 0, 0, 1, 1], // 5
        [0, 0, 0, 0, 1, 1, 0, 1], // 6
        [0, 0, 0, 0, 0, 1, 1, 0]  // 7
    ]

    let I = [[2,0,1, 'R']]

    let solStep = [
        [ 0, 'fixed', 0 ],
        [ 2, 'fixed', 2 ],
        [ 1, 'chain', 0 ],
        [ 3, 'arcSect', [ 1, 2 ] ],
        [ 4, 'arcSect', [ 2, 3 ] ],
        [ 5, 'arcSect', [ 1, 3 ] ],
        [ 6, 'arcSect', [ 4, 5 ] ],
        [ 7, 'arcSect', [ 5, 6 ] ],
    ];

    let distMat = cdist(T, pos_init);

    return [distMat, solStep]
}

let RRRRstripSol = exports.RRRRstripSol = (pos_init) => {
    // B T and I are here to notify people what it looks like 
    // Check Zhijie's master thesis to see the definition. 

    // CC idx: 4 
    let B = [
        [1, 0, 1, 0], 
        [1, 1, 0, 0],
        [0, 0, 1, 1],
        [0, 1, 0, 1]
    ];

    let T = [
        [1, 1, 1, 0],
        [1, 0, 0, 1],
        [1, 0, 1, 1],
        [0, 1, 1, 0],
    ];

    let I = [
        [2, 0, 1, 'R']
    ];

    let solStep = [
        [ 0, 'fixed', 0 ],
        [ 2, 'fixed', 2 ],
        [ 1, 'chain', 0 ],
        [ 3, 'arcSect', [ 1, 2 ] ]
    ];

    let distMat = cdist(T, pos_init);

    return [distMat, solStep]
}

let sixparallelSol = exports.sixparallelSol = (pos_init) => {
    let ccidx = 4 
    
    let B = [
        [1, 0, 1, 0, 0, 0, 0],
        [1, 1, 0, 0, 0, 1, 0],
        [0, 0, 1, 1, 0, 0, 0],
        [0, 1, 0, 1, 1, 0, 0],
        [0, 1, 0, 0, 0, 0, 1],
        [0, 0, 0, 0, 1, 0, 1]
    ]

    let T = [
        [1, 1, 1, 0, 0, 1, 0],
        [1, 2, 0, 1, 1, 1, 0],
        [1, 0, 1, 1, 0, 0, 0],
        [0, 1, 1, 2, 1, 0, 0], 
        [0, 1, 0, 1, 2, 0, 1],
        [1, 1, 0, 0, 0, 2, 1],
        [0, 0, 0, 0, 1, 1, 2]
    ]

    let I = [[2,0,1, 'R']]

    let solStep = [
        [ 0, 'fixed', 0 ],
        [ 2, 'fixed', 2 ],
        [ 1, 'chain', 0 ],
        [ 3, 'arcSect', [ 1, 2 ] ],
        [ 4, 'arcSect', [ 1, 3 ] ],
        [ 5, 'arcSect', [ 0, 1 ] ],
        [ 6, 'arcSect', [ 4, 5 ] ]
    ];

    let distMat = cdist(T, pos_init);
    return [distMat, solStep]
}

// Strange looking one 
let RRPRSol1 = exports.RRPRSol1 = (pos_init, errorScale = 1000, offsetScale = 0.01) => {
    let posNew = pos_init.map(function(arr) {return arr.slice();}); // make immutable
    let ccidx = 5 

    let B = [
        [1, 0, 1, 0, 0, 0],
        [1, 1, 0, 0, 0, 0], 
        [0, 1, 0, 1, 1, 1]
    ]

    let S = [
        [3, 2, 4]
    ]
    
    let I = [
        [2, 0, 1, 'R']
    ]

    let Bextend = [
        [1, 0, 1, 0, 0, 0, 0, 0], 
        [1, 1, 0, 0, 0, 0, 0, 0],
        [0, 1, 0, 1, 1, 1, 1, 0], 
        [0, 0, 1, 0, 0, 0, 1, 0],
        [0, 0, 0, 1, 0, 0, 0, 1], 
        [0, 0, 1, 0, 0, 0, 0, 1]
    ]

    let Textend = [
        [1, 1, 1, 0, 0, 0, 0, 0], 
        [1, 0, 0, 1, 1, 1, 1, 0], 
        [1, 0, 1, 0, 0, 0, 1, 1],
        [0, 1, 0, 0, 1, 1, 1, 1],
        [0, 1, 0, 1, 0, 1, 1, 0], 
        [0, 1, 0, 1, 1, 0, 1, 0],
        [0, 1, 1, 1, 1, 1, 0, 0], 
        [0, 0, 1, 1, 0, 0, 0, 0]
    ]

    let solStep = [
        [ 0, 'fixed', 0 ],
        [ 2, 'fixed', 2 ],
        [ 1, 'chain', 0 ],
        [ 6, 'arcSect' [1, 2] ],
        [ 3, 'arcSect' [1, 6] ], 
        [ 7, 'arcSect' [2, 3] ], 
        [ 4, 'arcSect' [1, 6] ], 
        [ 5, 'arcSect' [1, 6] ], 
    ];

    // Compute initial pos of far joint (j6)
    // compute perpendicular vector 
    let v_34 = [pos_init[4][0]- pos_init[3][0], pos_init[4][1] - pos_init[3][1]];
    let l_34 = (v_34[0]**2 + v_34[1]**2)**0.5;
    let h = l_34 * errorScale; // No way 1000 is not great enough
    let v_34p= [-v_34[1]/l_34, v_34[0]/l_34];
    // the scaling directly scales from l_34. I don't bother to compute the error. 
    let j6 = [v_34p[0] * h + (pos_init[4][0] + pos_init[3][0])/2, v_34p[1] * h + (pos_init[4][1] + pos_init[3][1])/2];
    posNew.push(j6);

    // Compute initial pos of constraining joint (j7)
    // j7 offsets are calculated with offsetScale
    let j7  = [null, null];
    let l_ec= l_34/2;
    let l_cs = l_34 * (0.5 - offsetScale);
    posNew.push(j7);

    let output = computeArcSect_presim([7, 'presimArcSect', [3, 2]], posNew, l_ec, l_cs) // 5 was for the slot joint, now it is 2. 

    if (output['isGood']) {
        let distMat = cdist(Textend, output['state']);
        return [distMat, solStep, output['state'], true];
    } else {
        return [null, null, null, false];
    }
}

// Standard RRPR requires more steps to compute/convert 
let RRPRSol2 = exports.RRPRSol2 = (pos_init, extensionScale = 5, errorScale = 1000, offsetScale = 0.01) => {
    // Error scale is also used in computing points in the computation of slot-related points
    let posNew = pos_init.map(function(arr) {return arr.slice();}); // make immutable
    let ccidx = 5 

    let B_draw = [
        [1, 0, 1, 0, 0],
        [1, 1, 0, 0, 0], 
        [0, 1, 0, 1, 1]
    ]

    // directional prismatic joint with only the end joint position and the piston joint position. 
    let P_draw = [
        [2, 3]
    ]

    let B = [
        [1, 0, 1, 0, 0, 0, 0], 
        [1, 1, 0, 0, 0, 0, 0],
        [0, 1, 0, 1, 1, 1, 0],
        [0, 0, 1, 0, 0, 0, 1]
    ]

    let S = [
        [2, 3, 6], 
        [2, 5, 6],
    ]

    let I = [
        [2, 0, 1, 'R']
    ]

    let Bextend = [ //j7 -> far joint. // j8 -> constraining joint for j3 // j9 -> constraining joint for j5
      // 0, 1, 2, 3, 4, 5, 6, 7, 8, 9  
        [1, 0, 1, 0, 0, 0, 0, 0, 0, 0], // ground link
        [1, 1, 0, 0, 0, 0, 0, 0, 0, 0], // actuation link
        [0, 1, 0, 1, 1, 1, 0, 1, 0, 0], // two far joint links are merged into this link because j3 j5 j7 form a triangle. 
        [0, 0, 1, 0, 0, 0, 1, 1, 0, 0], // slot conversion 
        [0, 0, 1, 0, 0, 0, 0, 0, 1, 0], // constraining link 1 for joint 2 and 3
        [0, 0, 0, 1, 0, 0, 0, 0, 1, 0], // constraining link 2 for joint 2 and 3
        [0, 0, 1, 0, 0, 0, 0, 0, 0, 1], // constraining link 1 for joint 2 and 5
        [0, 0, 0, 0, 0, 1, 0, 0, 0, 1], // constraining link 2 for joint 2 and 5
    ]

    let Textend = [
        [1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
        [1, 0, 0, 1, 1, 1, 0, 1, 0, 0],
        [1, 0, 1, 0, 0, 0, 1, 1, 1, 1],
        [0, 1, 0, 0, 1, 1, 0, 1, 1, 0],
        [0, 1, 0, 1, 0, 1, 0, 1, 0, 0],
        [0, 1, 0, 1, 1, 0, 0, 1, 0, 1],
        [0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
        [0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
        [0, 0, 1, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 1, 0, 0, 1, 0, 0, 0, 0]
    ]

    let solStep = [
        [ 0, 'fixed', 0 ],
        [ 2, 'fixed', 2 ], // first end joint
        [ 1, 'chain', 0 ], 
        [ 7, 'arcSect', [1, 2] ], // compute far joint 
        [ 3, 'arcSect', [1, 7] ], // compute one slot joint 
        [ 5, 'arcSect', [1, 7] ], // compute another slot joint
        [ 8, 'arcSect', [2, 3] ], // compute one constraining joint 
        [ 9, 'arcSect', [2, 5] ], // compute another constraining joint
        [ 4, 'arcSect', [1, 7] ], // compute coupler point 
        [ 6, 'arcSect', [2, 7] ], // compute another end joint (redundant conversion) 
    ];


    // Compute j5, j6, j7, and j8 and j9 initial pos. 
    // Compute j5 (on the side of j6)
    let j5 = [pos_init[3][0] + (pos_init[3][0]- pos_init[2][0])*offsetScale, pos_init[3][1] + (pos_init[3][1]- pos_init[2][1])*offsetScale]
    // Extend the slot 
    let v_26= [(pos_init[3][0]- pos_init[2][0])*extensionScale, (pos_init[3][1] - pos_init[2][1])*extensionScale];
    // Compute j6 
    let j6 = [pos_init[2][0] + v_26[0], pos_init[2][1] + v_26[1]]
    // Compute far joint (j7)
    let l_26 = (v_26[0]**2 + v_26[1]**2)**0.5;
    let h = l_26 * errorScale; // No way 1000 is not great enough
    let v_26p= [-v_26[1]/l_26, v_26[0]/l_26]; // unit perpendicular vector 
    let j7 = [v_26p[0] * h + (pos_init[2][0] + j6[0])/2, v_26p[1] * h + (pos_init[2][1] + j6[1])/2]
    posNew.push(j5);
    posNew.push(j6);
    posNew.push(j7);

    let l_ec= l_26/2;
    let l_cs = l_26 * (0.5 - offsetScale);

    // Compute initial pos of first constraining joint (j8)
    // j8 offsets are calculated with offsetScale
    let j8  = [null, null];
    posNew.push(j8);
    //print(posNew)
    let output1 = computeArcSect_presim([8, 'presimArcSect', [2, 3]], posNew, l_ec, l_cs) // end joint is j2 and slot joint is 3
    
    if (!output1['isGood']) {
        return [null, null, null, false];
    } 

    // Compute initial pos of another constraining joint (j9)
    // j9 offsets are calculated with offsetScale
    let j9  = [null, null];
    posNew = output1['state']
    posNew.push(j9);
    let output2 = computeArcSect_presim([9, 'presimArcSect', [2, 5]], posNew, l_ec, l_cs) // end joint is j2 and slot joint is 5
    if (!output2['isGood']) {
        return [null, null, null, false];
    } 

    let distMat = cdist(Textend, output2['state']);
    return [distMat, solStep, output2['state'], true];
}


console.log('interpret running')

