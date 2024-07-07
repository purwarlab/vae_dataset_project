Object.defineProperty(exports, "__esModule", {
    value: true
});


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
 * @param list 
 * 
 * will return the math.sqrt(*list)
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
 * Returns the angmap object, 
 * @param tpMat the topology matrix. 
 * @param pos the initial positions. 
 * 
 */

 var angmap = exports.angmap = (tpMat, pos) => {
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