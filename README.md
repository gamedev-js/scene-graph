# Scene Graph

Yet another scene graph library.

## Why?

Design for performance instead of user friendly. The code only contains scene graph operations such as calculating the transform, dispatching event and cloning nodes. It will not contains code relate with rendering.

## Reference

  - [playcanvas/engine/graph-node](https://github.com/playcanvas/engine/blob/master/src/scene/graph-node.js)
  - [litescene.js](https://github.com/jagenjo/litescene.js)
  - [kig/magi](https://github.com/kig/magi)

## TODO

  - node with transform and parent/children hierarchy
  - node enable/disable with hierarchy
  - node clone (always deep copy)
  - event system
  - DOP ??
  - prefab ??
  - serialization ??
  - 3d debug environment ??