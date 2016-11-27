

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
var GmdpWaypoint = function(lat, lng, primary) {
    this.lat = lat;
    this.lng = lng;
    this.primary = primary ? true : false;
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

GmdpRoute.prototype.setTransportation = function(transportation) {
    switch (transportation) {
        case '0':
            this.transportation = "car";
            break;
        case '1':
            this.transportation = "bike";
            break;
        case '2':
            this.transportation = "foot";
            break;
        case '3':
            this.transportation = "transit";
            break;
        case '4':
            this.transportation = "flight";
            break;
        default:
            this.transportation = transportation;
            break;
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
    this.mapType = "map";

    //top node, expected to be 4m
    var top = null;
    for (var child of this.prBufRoot.getChildren()) {
        if (child.id() == 3 && child.type() == 'm') {
            var mapTypeChildren = child.getChildren();
            if (mapTypeChildren && mapTypeChildren.length >= 1) {
                if (mapTypeChildren[0].id() == 1 && mapTypeChildren[0].type() == 'e') {
                    if (mapTypeChildren[0].value() == 3) {
                        this.mapType = "earth";
                    }
                }
            }
        } else if (child.id() == 4 && child.type() == 'm') {
            top = child;
        }
    }
    if (top) {
        var directions = null;
        for (var child of top.getChildren()) {
            if (child.id() == 4 && child.type() == 'm') {
                directions = child;
            }
        }
        if (directions) {
            this.route = new GmdpRoute();

            for (primaryChild of directions.getChildren()) {
                if (primaryChild.id() == 1 && primaryChild.type() == 'm') {
                    var addedPrimaryWpt = false;
                    var wptNodes = primaryChild.getChildren();
                    for (wptNode of wptNodes) {
                        if (wptNode.id() == 2) {
                            //this is the primary wpt, add coords
                            var coordNodes = wptNode.getChildren();
                            if (coordNodes &&
                                coordNodes.length >= 2 &&
                                coordNodes[0].id() == 1 &&
                                coordNodes[0].type() == 'd' &&
                                coordNodes[1].id() == 2 &&
                                coordNodes[1].type() == 'd') {
                                    this.route.pushWaypoint(
                                        new GmdpWaypoint(coordNodes[1].value(),
                                                         coordNodes[0].value(),
                                                         true));
                            }
                            addedPrimaryWpt = true;
                        } else if (wptNode.id() == 3) {
                            //this is a secondary (unnamed) wpt
                            //
                            //but first, if we haven't yet added the primary wpt,
                            //then the coordinates are apparently not specified,
                            //so we should add an empty wpt
                            if (!addedPrimaryWpt) {
                                this.route.pushWaypoint(new GmdpWaypoint(undefined, undefined, true));
                                addedPrimaryWpt = true;
                            }

                            //now proceed with the secondary wpt itself
                            var secondaryWpts = wptNode.getChildren();
                            if (secondaryWpts && secondaryWpts.length > 1) {
                                var coordNodes = secondaryWpts[0].getChildren();
                                if (coordNodes &&
                                    coordNodes.length >= 2 &&
                                    coordNodes[0].id() == 1 &&
                                    coordNodes[0].type() == 'd' &&
                                    coordNodes[1].id() == 2 &&
                                    coordNodes[1].type() == 'd') {
                                        this.route.pushWaypoint(
                                            new GmdpWaypoint(coordNodes[1].value(),
                                                             coordNodes[0].value(),
                                                             false));
                                }
                            }
                        }


                    }
                } else if (primaryChild.id() == 3 && primaryChild.type() == 'e') {
                    this.route.setTransportation(primaryChild.value());
                }
            }
        }
    }
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

/**
 * Returns the main map type ("map", "earth").
 */
Gmdp.prototype.getMapType = function() {
    return this.mapType;
}
