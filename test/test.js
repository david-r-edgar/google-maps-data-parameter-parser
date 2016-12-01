
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



var processUrl = function(urlToParse) {

    $("#interpretedResult").text("");

    try {
        var gmdp = new Gmdp(urlToParse);
        $("#interpretedResult").append("<div>Map type: " + gmdp.getMapType() + "</div>");
        if (gmdp.getStreetviewURL()) {
            $("#interpretedResult").append("<div>Image URL: " + gmdp.getStreetviewURL() + "</div>");
        }
        var route = gmdp.getRoute();
        if (route) {

            console.log(route);
            $("#interpretedResult").append("<div>Route: ");
            for (wpt of route.getAllWaypoints()) {
                if (wpt.primary) {
                    $("#interpretedResult").append("<span style='margin-left: 1.6em;'>" + wpt.lat + ", " + wpt.lng + "</span><br>");
                } else {
                    $("#interpretedResult").append("<span style='margin-left: 2.4em;'>" + wpt.lat + ", " + wpt.lng + "</span><br>");
                }
            }
            $("#interpretedResult").append("</div>");

            $("#interpretedResult").append("<div>Method of transport: " + route.getTransportation() + "</div>");
        }

        showTree(PrBufNode.create(urlToParse));
    }
    catch (exc) {
        console.log(exc.message);
        $("#parseResult").html("");
    }
}


var setupTestUrlButtons = function() {

    var testUrls=
    [
        //route
        "https://www.google.co.uk/maps/dir/Seattle,+WA,+United+States/Cannon+Beach,+OR,+United+States/Columbus,+OH,+USA/Detroit,+MI,+United+States/Gatineau,+QC,+Canada/New+York+City,+NY,+United+States/@49.6058279,-121.7233097,4.5z/data=!4m48!4m47!1m5!1m1!1s0x5490102c93e83355:0x102565466944d59a!2m2!1d-122.3320708!2d47.6062095!1m15!1m1!1s0x5494a52740cfce5d:0x1bfe4f4cea593a21!2m2!1d-123.9615274!2d45.8917738!3m4!1m2!1d-122.7313895!2d45.5541553!3s0x54950832f8ce8cc3:0xa5c3f91e551b05b8!3m4!1m2!1d-109.9197657!2d49.7858191!3s0x531368a926a7dc3d:0x55f6f41a51fcca44!1m5!1m1!1s0x883889c1b990de71:0xe43266f8cfb1b533!2m2!1d-82.9987942!2d39.9611755!1m5!1m1!1s0x8824ca0110cb1d75:0x5776864e35b9c4d2!2m2!1d-83.0457538!2d42.331427!1m5!1m1!1s0x4cce1a7e0babee53:0x7cedf5701a140956!2m2!1d-75.7012723!2d45.4765446!1m5!1m1!1s0x89c24fa5d33f083b:0xc80b8f06e177fe62!2m2!1d-74.0059413!2d40.7127837!3e1",

        //route with unnamed waypoints and secondary waypoints
        "https://www.google.co.uk/maps/dir/Pskov,+Pskov+Oblast,+Russia/56.5490289,29.2219863/Riga,+Latvia/@56.7669085,22.2290708,6z/data=!4m35!4m34!1m15!1m1!1s0x46c0193affb48223:0xea1f6715fb9517f!2m2!1d28.3344734!2d57.8166994!3m4!1m2!1d28.1957393!2d57.2104923!3s0x46c1b7e963d7a1d7:0x7d8ebf076b76f8e0!3m4!1m2!1d28.6231614!2d56.9862038!3s0x46c1a74677d87c41:0x73473ff8db1af97c!1m10!3m4!1m2!1d26.2770917!2d56.20202!3s0x46e82a3d06f5fd75:0xed607a2fefe77cbd!3m4!1m2!1d25.1664991!2d56.2745477!3s0x46e85913095506c3:0x8d29cdfcdede59bf!1m5!1m1!1s0x46eecfb0e5073ded:0x400cfcd68f2fe30!2m2!1d24.1051864!2d56.9496487!3e0?hl=en",

        //streetview
        "https://www.google.co.uk/maps/@51.6886014,5.3101255,3a,75y,86.06h,90t/data=!3m7!1e1!3m5!1sYJm3ADIz89LrIM9SGlYE2w!2e0!6s%2F%2Fgeo1.ggpht.com%2Fcbk%3Fpanoid%3DYJm3ADIz89LrIM9SGlYE2w%26output%3Dthumbnail%26cb_client%3Dmaps_sv.tactile.gps%26thumb%3D2%26w%3D203%26h%3D100%26yaw%3D303.07285%26pitch%3D0%26thumbfov%3D100!7i13312!8i6656?hl=en",

        //photosphere + route
        "https://www.google.co.uk/maps/dir/Pskov,+Pskov+Oblast,+Russia/56.5490289,29.2219863/Riga,+Latvia/@51.6879915,5.3084641,3a,75y,271h,90t/data=!3m8!1e1!3m6!1s-VQLYGrkijOY%2FV48qLvLJE8I%2FAAAAAAAAQio%2Fy3aQW52lVKINdKOSVDKn9YJ-N4goWy3GgCJkC!2e4!3e11!6s%2F%2Flh5.googleusercontent.com%2F-VQLYGrkijOY%2FV48qLvLJE8I%2FAAAAAAAAQio%2Fy3aQW52lVKINdKOSVDKn9YJ-N4goWy3GgCJkC%2Fw203-h100-k-no-pi-2.9999962-ya40.49999-ro-0-fo100%2F!7i8704!8i4352!4m35!4m34!1m15!1m1!1s0x46c0193affb48223:0xea1f6715fb9517f!2m2!1d28.3344734!2d57.8166994!3m4!1m2!1d28.1957393!2d57.2104923!3s0x46c1b7e963d7a1d7:0x7d8ebf076b76f8e0!3m4!1m2!1d28.6231614!2d56.9862038!3s0x46c1a74677d87c41:0x73473ff8db1af97c!1m10!3m4!1m2!1d26.2770917!2d56.20202!3s0x46e82a3d06f5fd75:0xed607a2fefe77cbd!3m4!1m2!1d25.1664991!2d56.2745477!3s0x46e85913095506c3:0x8d29cdfcdede59bf!1m5!1m1!1s0x46eecfb0e5073ded:0x400cfcd68f2fe30!2m2!1d24.1051864!2d56.9496487!3e0?hl=en",

        //no data parameter
        "https://www.google.co.uk/maps/@53.4528765,-2.1994247,14.5z?hl=en"
    ];
    for (testUrl in testUrls) {
        $("#testUrlButtons").append("<div><button id=\"testUrl" + testUrl + "\" value=\"" + encodeURI(testUrls[testUrl]) + "\">url" + testUrl + "</button></div>");
        $("#testUrl" + testUrl).click(function() {
            $("#inputURL").val($(this).val());
            processUrl(decodeURI($(this).val()));
        });
    }
}



$(document).ready(function() {
    setupTestUrlButtons();

    var inputURL = $("#inputURL").bind("input", function() {
        processUrl(this.value);
    });

    processUrl($("#inputURL")[0].value);
});
