
var showTree = function(node, level=0) {
    if (0 === level) {
        $("#parseResult").html("");
    }

    if (!node.root) {
        var inset = level * 35;
        $("#parseResult").append("<div style=\"padding-left: " + inset + "px\">" + node.value.id + " " + node.value.type + " " + node.value.val + "</div>");
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
        setTimeout(showTree(parse(urlToParse)), 500);

    });

    showTree(parse($("#inputURL")[0].value));
});
