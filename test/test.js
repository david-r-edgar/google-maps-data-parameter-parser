
var showTree = function(node, level=0) {
    if (0 === level) {
        $("#parseResult").html("");
    }

    if (null !== node.parent) {
        var inset = level * 35;
        $("#parseResult").append("<div style=\"padding-left: " + inset + "px\">" + node.id() + " " + node.type() + " " + node.value() + "</div>");
    }

    //iterate through children of elements
    for (child of node.getChildren()) {
        //recursively display other elements
        showTree(child, level+1);
    }
}


$(document).ready(function() {
    var inputURL = $("#inputURL").bind("input", function() {

        var urlToParse = this.value;
        setTimeout(showTree(PrBufNode.create(urlToParse)), 500);

        var gmdp = new Gmdp(urlToParse);
        console.log(gmdp.getMapType());
        console.log(gmdp.getRoute());
        console.log(gmdp.getRoute().getTransportation());
    });

    showTree(PrBufNode.create($("#inputURL")[0].value));
});
