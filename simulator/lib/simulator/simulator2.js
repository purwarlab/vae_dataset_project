Object.defineProperty(exports, "__esModule", {
    value: true
});

console.log('sim2 running ');

// The new simulator does not have extraction of solving procedure. They are hard coded. 

let RRRRsolsteps = [
    [0, 'fixed', ]
];



/**
 * # Inverse kinematics to solve two unknowns 
 * @param {*} step determines root and destination of chain. destination -> solution; root (the two center of circles)
 * @param {*} posOld the pose before computation shape is some (joitns, 2/3)
 * @param {*} distMat see computeDistMat
 * @param {*} threshold determines if the solution is okay (not too different from the last solution)
 * @returns {'state': posNew, 'isGood': false/true};
 */
var computeArcSectByStep_sim2  = (step, posOld, distMat, threshold = 0.1, vect = [null, null]) => { //, threshold = 0.1
    let posNew = posOld.map(function(arr) {return arr.slice();});
    let [ptSect, _operation, centers, extraInfo] = step; //You should use operation to save more information
    let [cntr1, cntr2] = centers
    let r1s = distMat[cntr1][ptSect]
    let r2s = distMat[cntr2][ptSect]
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
            if (vect[0] == null || vect[1] == null) {
                if (Math.sqrt(Math.pow(sol1[0] -ptOld[0], 2) + Math.pow(sol1[1] -ptOld[1], 2)) > 
                    Math.sqrt(Math.pow(sol2[0] -ptOld[0], 2) + Math.pow(sol2[1] -ptOld[1], 2))) {
                    posNew[ptSect][0] = sol2[0];
                    posNew[ptSect][1] = sol2[1];
                } else {
                    posNew[ptSect][0] = sol1[0];
                    posNew[ptSect][1] = sol1[1];
                }
            } 
            
            // This does not happen a lot, but just in case. 
            if (Math.sqrt(Math.pow(posNew[ptSect][0] -ptOld[0], 2) + Math.pow(posNew[ptSect][1] -ptOld[1], 2)) > threshold) {
                 return {
                     'state': posOld, 
                     'isGood': false
                 };
            }
        }
        
        return {
            'state': posNew, 
            'isGood': true
        };
    }
};


var computeDynamicLinkByStep_sim2 = (step, distMat, inputSlice) => {

}

var compute


/**
 * # Inverse kinematics to solve multiple unknowns
 * @param {*} step determines root and destination of chain. destination -> solution; root (the two center of circles)
 * @param {*} posOld the pose before computation shape is some (joitns, 2/3)
 * @param {*} distMat see computeDistMat
 * @param {*} threshold determines if the solution is okay (not too different from the last solution)
 * @returns {'state': posNew, 'isGood': false/true};
 */