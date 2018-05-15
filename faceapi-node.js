module.exports = function(RED) {
  "user strict";
  var request = require('request');
  var rp = require('request-promise');

  // create
  function FaceApiCreate(config) {
    RED.nodes.createNode(this, config);
    var node = this;

    // Retrieve the config node
    this.server = RED.nodes.getNode(config.server);
    
    node.on('input', function(msg) {
      msg.payload = 'create';
      msg.config = this.config;
      node.send(msg);
    });
  };

  RED.nodes.registerType('faceapi create', FaceApiCreate);

  // train
  function FaceApiTraining() {
    RED.nodes.createNode(this, n);
    var node = this;
    node.on('input', function(msg) {
      msg.payload = 'train';
      node.send(msg);
    });
  };
  
  RED.nodes.registerType('faceapi train', FaceApiTraining);

  // identify
  function FaceApiIdentify() {
    RED.nodes.createNode(this, n);
    var node = this;
    node.on('input', function(msg) {
      msg.payload = 'identify';
      node.send(msg);
    });
  };
  
  RED.nodes.registerType('faceapi identify', FaceApiIdentify);

  // broker
  function FaceApiBroker(n) {
    RED.nodes.createNode(this, n);

    // broker options
    this.subkey = n.subkey;
    this.server = n.server;
    this.groupid = n.groupid;
    this.groupinfo = n.groupinfo;

    // broker state

  };
  
  RED.nodes.registerType('faceapi broker', FaceApiBroker, {
    credentials: {
      subkey: { type: "text" },
      server: { type: "text" },
      groupid: { type: "text" },
      groupinfo: { type: "text" }
    }
  });

}