module.exports = function(RED) {
  "user strict";
  var request = require("request");
  var rp = require("request-promise");

  // identify
  function FaceApiIdentify(config) {
    RED.nodes.createNode(this, config);
    var brokerConn = RED.nodes.getNode(config.broker);
    var apiInfo = brokerConn.credentials;
    // console.log(apiInfo);
    var node = this;

    node.on("input", function(msg) {
      // msg.apiInfo = apiInfo;
      var imageBuffer;
      var imageMode;

      if (!msg.payload && !Buffer.isBuffer(msg.payload)) {
        msg.error = "Image file or url is required";
        node.send(msg);
      } else {
        imageBuffer = msg.payload;

        // check all required value
        if ( apiInfo.subkey != "" && apiInfo.server != "" && apiInfo.groupid != "") {
          var apiSubkey = apiInfo.subkey;
          var apiServer = apiInfo.server;
          var apiGroupId = apiInfo.groupid;
          var apiGroupInfo = apiInfo.groupinfo || "";
          var apiImage = imageBuffer;
          var apiContentType = "application/json";
          var apiGetFaceId = [];

          // file mode pause
          if (Buffer.isBuffer(msg.payload)) {
            // file mode
            apiContentType = "file";
          }

          var faceDetectOption;
          // file mode detect
          if ( apiContentType == 'file') {
            // detect option file
            faceDetectOption = {
              uri: "https://" + apiServer + "/face/v1.0/detect?returnFaceId=true",
              method: "POST",
              body: apiImage,
              headers: {
                "Content-Type": "application/octet-stream",
                "Ocp-Apim-Subscription-Key": apiSubkey
              }
            };
          } else {
            // detect option url
            faceDetectOption = {
              uri: "https://" + apiServer + "/face/v1.0/detect?returnFaceId=true",
              method: "POST",
              json: true,
              headers: {
                "Content-Type": "application/json",
                "Ocp-Apim-Subscription-Key": apiSubkey
              },
              body: {
                url: apiImage
              }
            };
          }

          // the flow 1: use Detect api get image id
          rp(faceDetectOption)
            .then(response => {
              console.log('detect returns', response);
              if (response.length == 0) {
                console.log('no detect return');
              } else {
                if (apiContentType == 'file') {
                  var tempJson = JSON.parse(response.toString());
                  apiGetFaceId.push(tempJson[0].faceId);
                } else {
                  apiGetFaceId.push(response[0].faceId);
                }

                // identify opiton
                var faceIdentifyOption = {
                  uri: "https://" + apiServer + "/face/v1.0/identify",
                  method: "POST",
                  json: true,
                  headers: {
                    "Content-Type": "application/json",
                    "Ocp-Apim-Subscription-Key": apiSubkey
                  },
                  body: {
                    personGroupId: apiGroupId,
                    maxNumOfCandidatesReturned: 1,
                    confidenceThreshold: 0.5,
                    faceIds: apiGetFaceId
                  }
                };

                // the flow 2: use image id to identify from group
                rp(faceIdentifyOption)
                  .then(response => {                    
                    if (response[0].candidates.length == 0) {
                      // no person fit
                      msg.IdentifyResult = {
                        "Result": "Failed",
                        "Reason": "No Person fits to this face"
                      }
                      node.send(msg);
                    } else {
                      // get returned person id
                      apiGetPersonId = response[0].candidates[0].personId;
                      apiGetPersonConfidence = response[0].candidates[0].confidence;
                      
                      // flow 3: get person name by person id
                      var personDataOptions = {
                        uri: ( 'https://' + apiServer + '/face/v1.0/persongroups/' + apiGroupId + '/persons/' + apiGetPersonId),
                        method: 'GET',
                        json: true,
                        headers: {
                          'Content-Type': 'application/json',
                          'Ocp-Apim-Subscription-Key': apiSubkey
                        }
                      };

                      rp(personDataOptions)
                        .then(response => {
                          console.log('get people info', response);

                          //return name, info and confidence
                          msg.IdentifyResult = {
                            "Result": "Successed",
                            "Name": response.name,
                            "Info": response.userData,
                            "Identify confidence": apiGetPersonConfidence
                          }

                          node.send(msg);
                        })
                        .catch(err => {
                          msg.error = 'personData ' + err;
                          msg.IdentifyResult = {
                            "Result": "Failed",
                          }

                          node.send(msg);
                        })
                    }
                  })
                  .catch(err => {
                    msg.error = 'faceIdentify ' + err;
                    node.send(msg);
                  });
              }
            })
            .catch(err => {
              msg.error = 'faceDetect' + err;
              node.send(msg);
            });
        }
      }
    });
  }

  RED.nodes.registerType("faceapi-identify", FaceApiIdentify);
};
