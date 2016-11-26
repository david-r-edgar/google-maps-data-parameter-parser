

//generic tree implementation
var Node = function(val) {

    this.val = val;
    this.children = [];
    this.parent = null;

    this.setParentNode = function(node) {
        this.parent = node;
        node.children[node.children.length] = this;
    }

    this.getParentNode = function() {
        return this.parent;
    }

    this.addChild = function(node) {
        node.parent = this;
        this.children[this.children.length] = node;
    }

    this.getChildren = function() {
        return this.children;
    }

    this.removeChildren = function() {
        for (child of this.children) {
            child.parent = null;
        }
        this.children = [];
    }

    this.getTotalDescendantCount = function() {
        var count = 0;
        for (child of this.children) {
            count += child.getTotalDescendantCount();
        }
        return count + this.children.length;
    }
}

//Protocol Buffer implementation, which extends the functionality of Node
//while specifically typing the stored value
var PrBufNode = function(id, type, value) {
    this.val = {id, type, value}
    this.children = [];
    this.parent = null;
}

PrBufNode.prototype = new Node();
PrBufNode.prototype.constructor = PrBufNode;

PrBufNode.prototype.id = function() { return this.val.id; }
PrBufNode.prototype.type = function() { return this.val.type; }
PrBufNode.prototype.value = function() { return this.val.value; }

//Compares the number of descendants with the value specified in the map element.
//If all the children have not yet been added, we continue adding to this element.
PrBufNode.prototype.findLatestIncompleteNode = function() {

    //if it's a branch (map) node ('m') and has room,
    //or if it's the root (identified by having a null parent), which has no element limit,
    //then return this node
    if (((this.val.type === 'm') && (this.val.value > this.getTotalDescendantCount()))
        || (null === this.parent)) {
        return this;
    }
    else {
        return this.parent.findLatestIncompleteNode();
    }
}

//parses the input URL 'data' protocol buffer parameter into a tree
PrBufNode.create = function(urlToParse) {
    var rootNode = null;
    var re = /data=!([^?&]+)/
    var dataArray = urlToParse.match(re);
    if (dataArray && dataArray.length >= 1) {
        rootNode = new PrBufNode();
        var workingNode = rootNode;
        //we iterate through each of the elements, creating a node for it, and
        //deciding where to place it in the tree
        var elemArray = dataArray[1].split("!");
        for (var i=0; i < elemArray.length; i++) {
            var elemRe = /^([0-9]+)([a-z])(.+)$/
            var elemValsArray = elemArray[i].match(elemRe);
            if (elemValsArray && elemValsArray.length > 3) {
                var elemNode = new PrBufNode(elemValsArray[1], elemValsArray[2], elemValsArray[3]);
                workingNode.addChild(elemNode);
                workingNode = elemNode.findLatestIncompleteNode();
            }
        }
    }
    return rootNode;
}





/**
 * Represents a basic waypoint, with latitude and longitude.
 *
 * If both are not specified, the waypoint is considered to be valid
 * but empty waypoint (these can exist in the data parameter, where
 * the coordinates have been specified in the URL path.
 */
var GmdpWaypoint = function(lat, lng) {
    if (arguments.length >= 2) {
        this.lat = lat;
        this.lng = lng;
    }
}

/**
 * Represents a basic route, comprised of an ordered list of
 * GmdpWaypoint objects.
 */
var GmdpRoute = function() {
    this.route = new Array();
}

/**
 * Pushes a GmdpWaypoint on to the end of this GmdpRoute.
 */
GmdpRoute.prototype.pushWaypoint = function(wpt) {
    if (wpt instanceof GmdpWaypoint) {
        this.route.push(wpt);
    }
}

/**
 * Creates a new GmdpWaypoint from the provided latitude and longitude,
 * and pushes it on to the end of this GmdpRoute.
 */
GmdpRoute.prototype.pushWaypointLatLng = function(lat, lng) {
    var wpt = new GmdpWaypoint(lat, lng);
    this.pushWaypoint(wpt);
}

GmdpRoute.prototype.setTransportation = function(transportation) {
    if ('0' === transportation) {
        this.transportation = "car";
    } else if ('1' === transportation) {
        this.transportation = "bike";
    } else if ('2' === transportation) {
        this.transportation = "foot";
    } else if ('3' === transportation) {
        this.transportation = "transit";
    } else if ('4' === transportation) {
        this.transportation = "flight";
    } else {
        this.transportation = transportation;
    }
}

GmdpRoute.prototype.getTransportation = function() {
    return this.transportation;
}

/**
 * Represents a google maps data parameter, constructed from the passed URL.
 *
 * Utility methods defined below allow the user to easily extract interesting
 * information from the data parameter.
 */
var Gmdp = function(url) {
    this.prBufRoot = PrBufNode.create(url);

    //first node, expected to be 4m
    //FIXME search for a 4m among all top-level nodes
    var top = this.prBufRoot.getChildren()[0];
    if ((top.val.id != 4) || (top.val.type != 'm')) {
        console.log("unexpected node", top.val.id, top.val.type, top.val.value);
        throw("unexpected input");
    }

    var directions = top.getChildren()[0];
    //FIXME search for a 4m among all second-level nodes
    if ((top.val.id != 4) || (top.val.type != 'm')) {
        console.log("unexpected node", top.val.id, top.val.type, top.val.value);
        throw("unexpected input");
    }

    this.route = new GmdpRoute();

    for (primaryChild of directions.getChildren()) {
        console.log(primaryChild);

        if (primaryChild.val.id == 1 && primaryChild.val.type == 'm') {
            console.log("primary waypoint located");
        } else if (primaryChild.val.id == 3 && primaryChild.val.type == 'e') {
            console.log("mode of transport located", primaryChild.val.value);
            this.route.setTransportation(primaryChild.val.value);
        }




    }

//    console.log("val", this.prBufRoot.getChildren()[0].val.value);



    /*
    var wpt = new GmdpWaypoint(1,2);
    this.route.pushWaypoint(wpt);
    this.route.pushWaypointLatLng(3,4);
    this.route.pushWaypoint(new GmdpWaypoint());
    */
}

/**
 * Returns an ordered list of map layers shown on the current map.
 */
Gmdp.prototype.getMapLayers = function() {
    return this.prBufRoot;
}

/**
 * Returns the route defined by this data parameter.
 */
Gmdp.prototype.getRoute = function() {
    return this.route;
}

