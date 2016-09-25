

function Node(value) {

    this.value = value;
    this.children = [];
    this.parent = null;

    this.setParentNode = function(node) {
        this.parent = node;
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
}


//now need specific tree with id, type, and value
//(for m, use value to determine further elements, don't add to node)




$(document).ready(function() {
    var inputURL = $("#inputURL").bind("input", function() {

        var that = this;
        setTimeout(function() {
            var re = /data=!(.*)\?/
            var dataArray = that.value.match(re);
            if (dataArray && dataArray.length >= 1) {
                //console.log(dataArray[1]);
                var elemArray = dataArray[1].split("!");
                $("#parseResult").text(elemArray);
                //now iterate through elements, placing them at appropriate location in tree

                var root = new Node('root');
            }

        }, 500);

  });
});
