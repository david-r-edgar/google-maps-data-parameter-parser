

//generic tree implementation
var Node = function(value) {

    this.value = value;
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
var PrBufNode = function(id, type, val) {
    this.value = {id, type, val}
    this.children = [];
    this.parent = null;
}

PrBufNode.prototype = new Node();
PrBufNode.prototype.constructor = PrBufNode;

//Compares the number of descendants with the value specified in the map element.
//If all the children have not yet been added, we continue adding to this element.
PrBufNode.prototype.findLatestIncompleteNode = function() {

    //if it's a branch (map) node ('m') and has room,
    //or if it's the root (identified by having a null parent), which has no element limit,
    //then return this node
    if (((this.value.type === 'm') && (this.value.val > this.getTotalDescendantCount()))
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
            var elemRe = /^([0-9])([a-z])(.*)$/
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

