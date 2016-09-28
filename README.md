# Google Maps 'data' parameter parser

**A JavaScript parser for the Protocol Buffer implementation used for the 'data' parameter in google maps URLs.**

## Background

Google Maps directions URLs typically look something like this:
[https://www.google.co.uk/maps/dir/Bonn,+Germany/Berlin,+Germany/@51.6456171,7.9144552,7z/data=!3m1!4b1!4m13!4m12!1m5!1m1!1s0x47bee19f7ccbda49:0x86dbf8c6685c9617!2m2!1d7.0982068!2d50.73743!1m5!1m1!1s0x47a84e373f035901:0x42120465b5e3b70!2m2!1d13.404954!2d52.5200066?hl=en](https://www.google.co.uk/maps/dir/Bonn,+Germany/Berlin,+Germany/@51.6456171,7.9144552,7z/data=!3m1!4b1!4m13!4m12!1m5!1m1!1s0x47bee19f7ccbda49:0x86dbf8c6685c9617!2m2!1d7.0982068!2d50.73743!1m5!1m1!1s0x47a84e373f035901:0x42120465b5e3b70!2m2!1d13.404954!2d52.5200066?hl=en)

While the user-specified waypoint inputs (Bonn and Berlin in this example) are named in the path, and the map centre coordinates are specified clearly following the `@`, other properties, including the actual coordinates of the waypoints, the type of map and the selected mode of transport are encoded in the 'data' parameter in an URL-safe string representation of a 'Protocol Buffer'.

Elements are separated by `!` marks.
Each element consists of
* an integer *id*
* a single character alphabetic *type*
* a string *value* (whose format appears to vary according to the *type*, but is assumed to be composed of alphanumeric and URL-safe characters)

The meaning of an element depends on these properties, as well as the element's place in the tree.

## Dependencies

* jquery

## Functionality

The parser extracts the data parameter and forms it into a tree of nodes, each representing one of the elements in the Protocol Buffer.

## Usage

### Creation
```
var parsedProtocolBuffer = PrBufNode.create(url);
```

### Traversal
```
for (directChild of parsedProtocolBuffer.getChildren()) {
    console.log(directChild.value.id,
                directChild.value.type,
                directChild.value.val);
}
```
