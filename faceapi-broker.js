module.exports = function(RED) {
  "user strict";
  var request = require('request');
  var rp = require('request-promise');

  // broker
  function FaceApiBroker(config) {
    RED.nodes.createNode(this, config);

    // broker options
    this.subkey = config.subkey;
    this.server = config.server;
    this.groupid = config.groupid;
    this.groupinfo = config.groupinfo;

    // broker state

  };
  
  RED.nodes.registerType('faceapi-broker', FaceApiBroker, {
    credentials: {
      subkey: { type: "text" },
      server: { type: "text" },
      groupid: { type: "text" },
      groupinfo: { type: "text" }
    }
  });

}