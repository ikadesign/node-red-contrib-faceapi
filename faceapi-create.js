module.exports = function(RED) {
  "user strict";
  var request = require('request');
  var rp = require('request-promise');
  var fs = require('fs');
  // create
  function FaceApiCreate(config) {
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
      console.log(msg);
      msg.apiInfo = apiInfo;
      var personName = msg.personName;
      var personInfo = msg.personInfo;
      var imageBuffer;
      var imageMode;

      // check image url or binary file
      if ( !msg.payload && !Buffer.isBuffer(msg.payload)) {
        msg.error = 'Image file or url is required';
        node.send(msg);
      } else {
        imageBuffer = msg.payload;

        // check person name ( should be more easy to use )
        if ( !personName ) {
          msg.error = 'Person name is required.';
          node.send(msg);
        } else {
          // check all required value
          if ( apiInfo.subkey != '' && apiInfo.server != '' && apiInfo.groupid != '' && personName != '' ) {
            var apiSubkey = apiInfo.subkey;
            var apiServer = apiInfo.server;
            var apiGroupId = apiInfo.groupid;
            var apiGroupInfo = apiInfo.groupinfo || '';
            var apiPersonName = msg.personName;
            var apiPersonInfo = msg.personInfo || '';
            var apiPersonId;
            var getPersonId;
            var apiImage = imageBuffer;
            var apiContentType = 'url';

            if ( Buffer.isBuffer(msg.payload) ) {
              // file mode
              apiContentType = 'file';
            }
      
            // add person option
            var personAddOptions = {
              uri: ( 'https://' + apiServer + '/face/v1.0/persongroups/' + apiGroupId + '/persons'),
              method: 'POST',
              json: true,
              headers: {
                'Content-Type': 'application/json',
                'Ocp-Apim-Subscription-Key': apiSubkey
              },
              body: {
                name: apiPersonName,
                userData: apiPersonInfo
              }
            };
            
            // get person list option
            var personGetOptions = {
              uri: ( 'https://' + apiServer + '/face/v1.0/persongroups/' + apiGroupId + '/persons?start=&top='),
              method: 'GET',
              json: true,
              headers: {
                'Content-Type': 'application/json',
                'Ocp-Apim-Subscription-Key': apiSubkey
              }
            };
      
            // get person data option
            var personDataOptions = {
              uri: ( 'https://' + apiServer + '/face/v1.0/persongroups/' + apiGroupId + '/persons/' + apiPersonId),
              method: 'GET',
              json: true,
              headers: {
                'Content-Type': 'application/json',
                'Ocp-Apim-Subscription-Key': apiSubkey
              },
              body: {
              }
            };

            // get group option
            var groupGetOptions = {
              uri: ( 'https://' + apiServer + '/face/v1.0/persongroups/' + apiGroupId),
              method: 'GET',
              json: true,
              headers: {
                'Content-Type': 'application/json',
                'Ocp-Apim-Subscription-Key': apiSubkey
              }
            };

            // add group option
            var groupAddOptions = {
              uri: ( 'https://' + apiServer + '/face/v1.0/persongroups/' + apiGroupId),
              method: 'PUT',
              json: true,
              headers: {
                'Content-Type': 'application/json',
                'Ocp-Apim-Subscription-Key': apiSubkey
              },
              body: {
                'name': apiGroupId,
                'userData': apiGroupInfo
              }
            };

            // check name
            function QueryCallback(value) {
              // console.log(value)
              // console.log('person name = ', apiPersonName)
              if (value.name == apiPersonName) {
                getPersonId = value.personId;
                // console.log('person name = ', apiPersonName, ', person id = ', getPersonId)
              }
            }

            // check if group exist > add group first
            // check if person exist > add person > add face

            // start flow
            rp(groupAddOptions) 
              .then(response => {
                console.log('group added');
                // get group info 
                rp(groupGetOptions)
                  .then(response => {
                    msg.groupInfo = response
                  })
                  .catch(err => {
                    msg.error = err;
                    node.send(msg);
                  })

                // add person
                rp(personAddOptions)
                  .then(response => {
                    console.log('person added', response);

                    // get person id
                    getPersonId = response.personId;
                    
                    if (apiContentType == 'file') {
                      // add person face option: FILE
                      var personAddFaceOptions = {
                        uri: ( 'https://' + apiServer + '/face/v1.0/persongroups/' + apiGroupId + '/persons/' + getPersonId + '/persistedFaces' ),
                        method: 'POST',
                        body: msg.payload,
                        headers: {
                          'Content-Type': 'application/octet-stream', 
                          'Ocp-Apim-Subscription-Key': apiSubkey
                        }
                      };

                      rp(personAddFaceOptions)
                        .then(response => {
                          console.log('person face added', response);
                          // console.log('uri =', personAddFaceOptions.uri)

                          // get people info
                          var personDataOptions = {
                            uri: ( 'https://' + apiServer + '/face/v1.0/persongroups/' + apiGroupId + '/persons/' + getPersonId),
                            method: 'GET',
                            json: true,
                            headers: {
                              'Content-Type': 'application/json',
                              'Ocp-Apim-Subscription-Key': apiSubkey
                            }
                          };
                          rp(personDataOptions)
                            .then(response => {
                              console.log('get people info', response)
                              msg.personInfo = response;
                              node.send(msg);
                            })
                            .catch(err => {
                              msg.error = err;
                              node.send(msg);
                            })
                        })
                        .catch(err => {
                          msg.erro = ('add person face 1 FILE' + err);
                          node.send(msg);
                        })
                    } else {
                      
                      // add person face option: URL
                      var personAddFaceOptions = {
                        uri: ( 'https://' + apiServer + '/face/v1.0/persongroups/' + apiGroupId + '/persons/' + getPersonId + '/persistedFaces'),
                        method: 'POST',
                        json: true,
                        headers: {
                          'Content-Type': 'application/json',
                          'Ocp-Apim-Subscription-Key': apiSubkey
                        },
                        body: {
                          url: apiImage
                        }
                      };
                      
                      rp(personAddFaceOptions)
                        .then(response => {
                          console.log('person face added', response);
                          // console.log('uri =', personAddFaceOptions.uri)

                          // get people info
                          var personDataOptions = {
                            uri: ( 'https://' + apiServer + '/face/v1.0/persongroups/' + apiGroupId + '/persons/' + getPersonId),
                            method: 'GET',
                            json: true,
                            headers: {
                              'Content-Type': 'application/json',
                              'Ocp-Apim-Subscription-Key': apiSubkey
                            }
                          };
                          rp(personDataOptions)
                            .then(response => {
                              console.log('get people info', response)
                              msg.personInfo = response;
                              node.send(msg);
                            })
                            .catch(err => {
                              msg.error = err;
                              node.send(msg);
                            })
                        })
                        .catch(err => {
                          msg.erro = ('add person face 1 URL' + err);
                          node.send(msg);
                        })
                    }
                  })
                  .catch(err => {
                      msg.error = ('add person ' + err);
                      node.send(msg);
                    }
                  )
                    
                // end flow
              })
              .catch(err => { 
                // if error = 409 means group already exist
                if ( err.statusCode == '409' ) {
                  console.log('group exist, jump to add person') 
                  
                  function QueryCallback(value) {
                    // console.log('name', value.name)
                    // console.log('person name = ', apiPersonName)
                    if (value.name == apiPersonName) {
                      // console.log(value.name == apiPersonId);
                      getPersonId = value.personId;
                      // console.log('person name = ', apiPersonName, ', person id = ', getPersonId)
                    }
                  }

                  // get person before add
                  rp(personGetOptions)
                    .then(response => {
                      // callback to get person id
                      response.forEach(QueryCallback);

                      // if get id means person exist, jump to add person face
                      if ( getPersonId != undefined) {
                        console.log('person exist, jump to add person face')
                        // console.log(getPersonId);

                        // image mode check
                        if ( apiContentType == 'file' ) {
                          
                          // add person face option: FILE
                          var personAddFaceOptions = {
                            uri: ( 'https://' + apiServer + '/face/v1.0/persongroups/' + apiGroupId + '/persons/' + getPersonId + '/persistedFaces' ),
                            method: 'POST',
                            body: msg.payload,
                            headers: {
                              'Content-Type': 'application/octet-stream', 
                              'Ocp-Apim-Subscription-Key': apiSubkey
                            }
                          };

                          rp(personAddFaceOptions)
                            .then(response => {
                              console.log('person face added', response);

                              // get people info
                              var personDataOptions = {
                                uri: ( 'https://' + apiServer + '/face/v1.0/persongroups/' + apiGroupId + '/persons/' + getPersonId),
                                method: 'GET',
                                json: true,
                                headers: {
                                  'Content-Type': 'application/json',
                                  'Ocp-Apim-Subscription-Key': apiSubkey
                                }
                              };
                              rp(personDataOptions)
                                .then(response => {
                                  console.log('get people info', response)
                                  msg.personInfo = response;
                                  node.send(msg);
                                })
                                .catch(err => {
                                  msg.error = err;
                                  node.send(msg);
                                })
                            })
                            .catch(err => {
                              msg.erro = ('add person face 2 FILE ' + err);
                              node.send(msg);
                            })
                        } else {
                          // add person face option url
                          var personAddFaceOptions = {
                            uri: ( 'https://' + apiServer + '/face/v1.0/persongroups/' + apiGroupId + '/persons/' + getPersonId + '/persistedFaces'),
                            method: 'POST',
                            json: true,
                            headers: {
                              'Content-Type': 'application/json',
                              'Ocp-Apim-Subscription-Key': apiSubkey
                            },
                            body: {
                              url: apiImage
                            }
                          };

                          rp(personAddFaceOptions)
                            .then(response => {
                              console.log('face added 2 - url', response);
  
                              // get people info
                              var personDataOptions = {
                                uri: ( 'https://' + apiServer + '/face/v1.0/persongroups/' + apiGroupId + '/persons/' + getPersonId),
                                method: 'GET',
                                json: true,
                                headers: {
                                  'Content-Type': 'application/json',
                                  'Ocp-Apim-Subscription-Key': apiSubkey
                                }
                              };
                              rp(personDataOptions)
                                .then(response => {
                                  console.log('get people info 2 - url', response)
                                  msg.personInfo = response;
                                  node.send(msg);
                                })
                                .catch(err => {
                                  msg.error = ('person get 2 - url' + err);
                                  node.send(msg);
                                })
                            })
                            .catch(err => {
                              msg.error = ('add face 2 - url' + err);
                              node.send(msg);
                            })
                        }

                      } else {
                        // person not exist, add person > add face

                        // add person
                        rp(personAddOptions)
                        .then(response => {
                          console.log('person added', response);

                          // get person id
                          getPersonId = response.personId;

                          // add person face option
                          var personAddFaceOptions = {
                            uri: ( 'https://' + apiServer + '/face/v1.0/persongroups/' + apiGroupId + '/persons/' + getPersonId + '/persistedFaces'),
                            method: 'POST',
                            json: true,
                            headers: {
                              'Content-Type': apiContentType,
                              'Ocp-Apim-Subscription-Key': apiSubkey
                            },
                            body: {
                              url: apiImage
                            }
                          };

                          rp(personAddFaceOptions)
                            .then(response => {
                              console.log('person face added 3', response);
                              // console.log('uri =', personAddFaceOptions.uri)

                              // get people info
                              var personDataOptions = {
                                uri: ( 'https://' + apiServer + '/face/v1.0/persongroups/' + apiGroupId + '/persons/' + getPersonId),
                                method: 'GET',
                                json: true,
                                headers: {
                                  'Content-Type': 'application/json',
                                  'Ocp-Apim-Subscription-Key': apiSubkey
                                }
                              };
                              rp(personDataOptions)
                                .then(response => {
                                  console.log('get people info 3 ', response)
                                  msg.personInfo = response;
                                  node.send(msg);
                                })
                                .catch(err => {
                                  msg.error = err;
                                  node.send(msg);
                                })
                            })
                            .catch(err => {
                              msg.erro = ('add person face 3 ' + err);
                              node.send(msg);
                            })
                        })
                        .catch(err => {
                            msg.error = ('add person 3 ' + err);
                            node.send(msg);
                          }
                        )
                          
                      // end flow
                      }
                    })
                } else {
                  msg.error = ('group add ' + err.statusCode);
                  node.send(msg);
                }
              })
          } else {
            msg.error = 'Please complete setting fields at first.';
            node.send(msg);
          }
        }
      }

    });

  };

  RED.nodes.registerType('faceapi-create', FaceApiCreate);
}