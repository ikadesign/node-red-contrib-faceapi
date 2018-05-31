module.exports = function(RED) {
  "user strict";
  var request = require('request');
  var rp = require('request-promise');

  // train
  function FaceApiTraining(config) {
    RED.nodes.createNode(this, config);
    var brokerConn = RED.nodes.getNode(config.broker);
    var apiInfo = {
      subkey: brokerConn.subkey,
      server: brokerConn.server,
      groupid: brokerConn.groupid,
      groupinfo: brokerConn.groupinfo
    };
    // console.log(apiInfo);
    var node = this;

    node.on('input', function(msg) {
      if (apiInfo != 'undefiend' ) {
        msg.apiInfo = apiInfo;
        var apiSubkey = apiInfo.subkey;
        var apiServer = apiInfo.server;
        var apiGroupId = apiInfo.groupid;
        var apiGroupInfo = apiInfo.groupinfo || '';

        // group training option
        var groupTrainingOption = {
          uri: ( 'https://' + apiServer + '/face/v1.0/persongroups/' + apiGroupId + '/train'),
          method: 'POST',
          json: true,
          headers: {
            'Ocp-Apim-Subscription-Key': apiSubkey
          }
        };

        // group training status option
        var groupTrainingStatusOption = {
          uri: ( 'https://' + apiServer + '/face/v1.0/persongroups/' + apiGroupId + '/training'),
          method: 'GET',
          json: true,
          headers: {
            'Content-Type': 'application/json',
            'Ocp-Apim-Subscription-Key': apiSubkey
          },
          body: {
            "name": apiGroupId,
            "userData": apiGroupInfo
          }
        };

        rp(groupTrainingOption)
        .then(function (response) {
          console.log('training triggered');
          rp(groupTrainingStatusOption)
            .then(function (response) {
              msg.payload = response;
              node.send(msg);
            })
            .catch(function (err) {
              msg.error = err;
              node.send(msg);
            });
        })
        .catch(function (err) {
          msg.error = err;
          node.send(msg);
        });
      } 
    });
  };
  
  RED.nodes.registerType('faceapi-train', FaceApiTraining);
}