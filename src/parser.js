
//generic tree implementation
var Node = function(value) {

    this.value = value;
    this.children = [];
    this.parent = null;

    this.setParentNode = function(node) {
        this.parent = node;
        //FIXME this should also add the reverse (child) link to the parent node
    }

    this.getParentNode = function() {
        return this.parent;
    }

    this.addChild = function(node) {
        node.setParentNode(this);
        this.children[this.children.length] = node;
    }

    this.getChildren = function() {
        return this.children;
    }

    this.removeChildren = function() {
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


var PrBufNode = function(id, type, val) {
    this.value = {id, type, val}
    this.children = [];
    this.parent = null;
    if (undefined === id) {
        this.root = true;
    }
}

PrBufNode.prototype = new Node();
PrBufNode.prototype.constructor = PrBufNode;

//Compares the number of descendants with the value specified in the map element.
//If all the children have not yet been added, we continue adding to this element.
PrBufNode.prototype.findLatestIncompleteNode = function() {

    //if it's a branch (map) node ('m') and has room, or if it's the root, return this node
    if (((this.value.type === 'm') && (this.value.val > this.getTotalDescendantCount()))
        || (this.root)) {
        return this;
    }
    else {
        //if we've reached the root, return null
        if (this.parent === null) {
            return null;
        } else {
            //otherwise recurse up the tree
            return this.parent.findLatestIncompleteNode();
        }
    }
}



//parses the input URL 'data' protocol buffer parameter into a tree
var parse = function(urlToParse) {
    var root = null;
    var re = /data=!([^?&]+)/
    var dataArray = urlToParse.match(re);
    if (dataArray && dataArray.length >= 1) {
        console.log(dataArray);
        var elemArray = dataArray[1].split("!");

        var rootNode = new PrBufNode();
        var workingNode = rootNode;
        //we iterate through each of the elements, creating a node for it, and
        //deciding where to place it in the tree
        for (var i=0; i < elemArray.length; i++) {
            var elemRe = /^([0-9])([a-z])(.*)$/
            var elementCompositionArray = elemArray[i].match(elemRe);
            if (elementCompositionArray && elementCompositionArray.length > 3) {
                //console.log(elementCompositionArray);
                var id = elementCompositionArray[1];
                var type = elementCompositionArray[2];
                var value = elementCompositionArray[3];
                var elemNode = new PrBufNode(id, type, value);
                //if (!root) {
                //    root = elemNode;
                //    workingNode = root;
                //} else {
                    workingNode.addChild(elemNode);
                    workingNode = elemNode.findLatestIncompleteNode();
                    if (null == workingNode) {
                        //we've filled up the branches right back to the root, so nothing more we can add
                        break;
                    }
                //}
            }
        }
    }
    return rootNode;
}


