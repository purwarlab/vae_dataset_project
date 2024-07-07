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
