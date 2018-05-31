module.exports = function(RED) {
  "user strict";

  // broker
  function FaceApiBroker(config) {
    RED.nodes.createNode(this, config);

    // broker options
    this.subkey = config.subkey;
    this.server = config.server;
    this.groupid = config.groupid;
    this.groupinfo = config.groupinfo;
  };
  
  RED.nodes.registerType('faceapi-broker', FaceApiBroker);
}