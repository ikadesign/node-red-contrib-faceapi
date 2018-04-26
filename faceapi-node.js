var request = require('request');
var rp = require('request-promise');

module.exports = function(RED) {
  function FaceApiNode(config) {
      RED.nodes.createNode(this,config);
      var node = this;
      node.on('input', function(msg) {
        var subKey = this.credentials.key || 'no-key';
        var subServer = this.credentials.server || 'no-server';
        var groupID = this.credentials.groupid || 'no-id';
        var groupData = this.credentials.groupdata || 'no Description';
        var apiKind = msg.req.originalUrl.split('/')[2];

        console.log('---------------------------');
        console.log('key:' + subKey);
        console.log('server:' + subServer);
        console.log('id:' + groupID);
        console.log('api kind:', apiKind);
        console.log('---------------------------');

        const PersonGroup = () => {
          var GroupFeature = msg.req.originalUrl.split('/')[3];
          msg.topic = ('I am PersonGroup / ' + GroupFeature);

          console.log('GroupFeature:', GroupFeature);
          console.log( 'https://' + subServer + '/face/v1.0/persongroups/' + groupID);

          const GroupAddGroup = () => {
            const options = {
              uri: ( 'https://' + subServer + '/face/v1.0/persongroups/' + groupID),
              method: 'PUT',
              json: true,
              headers: {
                'Content-Type': 'application/json',
                'Ocp-Apim-Subscription-Key': subKey
              },
              body: {
                "name": groupID,
                "userData": groupData
              }
            };

            rp(options)
              .then(function (response) {
                msg.payload = response;
                node.send(msg);
              })
              .catch(function (err) {
                msg.error = err;
                node.send(msg);
              });
          }

          const GroupDeleteGroup = () => {
            const options = {
              uri: ( 'https://' + subServer + '/face/v1.0/persongroups/' + groupID),
              method: 'DELETE',
              json: true,
              headers: {
                'Content-Type': 'application/json',
                'Ocp-Apim-Subscription-Key': subKey
              },
              body: {
                "name": groupID,
                "userData": groupData
              }
            };

            rp(options)
              .then(function (response) {
                msg.payload = response;
                node.send(msg);
              })
              .catch(function (err) {
                msg.error = err;
                node.send(msg);
              });
          }

          const GroupGetGroup = () => {
            const options = {
              uri: ( 'https://' + subServer + '/face/v1.0/persongroups/' + groupID),
              method: 'GET',
              json: true,
              headers: {
                'Content-Type': 'application/json',
                'Ocp-Apim-Subscription-Key': subKey
              }
            };

            rp(options)
              .then(function (response) {
                msg.payload = response;
                node.send(msg);
              })
              .catch(function (err) {
                msg.error = err;
                node.send(msg);
              });
          }

          const GroupTrainingStatus = () => {
            const options = {
              uri: ( 'https://' + subServer + '/face/v1.0/persongroups/' + groupID + '/training'),
              method: 'GET',
              json: true,
              headers: {
                'Content-Type': 'application/json',
                'Ocp-Apim-Subscription-Key': subKey
              },
              body: {
                "name": groupID,
                "userData": groupData
              }
            };
            
            rp(options)
              .then(function (response) {
                msg.payload = response;
                node.send(msg);
              })
              .catch(function (err) {
                msg.error = err;
                node.send(msg);
              });
          }
          
          const GroupListGroup = () => {
            const options = {
              uri: ( 'https://' + subServer + '/face/v1.0/persongroups/?start=&top='),
              method: 'GET',
              json: true,
              headers: {
                'Content-Type': 'application/json',
                'Ocp-Apim-Subscription-Key': subKey
              }
            };

            rp(options)
              .then(function (response) {
                msg.payload = response;
                node.send(msg);
              })
              .catch(function (err) {
                msg.error = err;
                node.send(msg);
              });
          }

          const GroupTrainGroup = () => {
            const options = {
              uri: ( 'https://' + subServer + '/face/v1.0/persongroups/' + groupID + '/train'),
              method: 'POST',
              json: true,
              headers: {
                'Ocp-Apim-Subscription-Key': subKey
              }
            };
            
            rp(options)
              .then(function (response) {
                msg.payload = response;
                node.send(msg);
              })
              .catch(function (err) {
                msg.error = err;
                node.send(msg);
              });
          }

          if (groupID != 'no-id') {
            switch (GroupFeature) {
              case 'addgroup':
                GroupAddGroup();
                break;
              case 'deletegroup':
                GroupDeleteGroup();
                break;
              case 'getgroup':
                GroupGetGroup();
                break;
              case 'trainingstatus':
                GroupTrainingStatus();
                break;
              case 'list':
                GroupListGroup();
                break;
              case 'train':
                GroupTrainGroup();
                break;
              default:
                break;
            }
          }
        }
        const FaceList = () => {
          msg.topic = 'I am facelist';
        }
        const Verify = () => {
          msg.topic = 'I am verify';
        }
        const AddPerson = () => {
          msg.topic = 'I am addperson';
          var personName = msg.req.params.name;
          const options = {
            uri: ( 'https://' + subServer + '/face/v1.0/persongroups/' + groupID + '/persons'),
            method: 'POST',
            json: true,
            headers: {
              'Content-Type': 'application/json',
              'Ocp-Apim-Subscription-Key': subKey
            },
            body: {
              name: personName,
              userData: 'none'
            }
          };

          rp(options)
            .then(function (response) {
              msg.payload = response;
              node.send(msg);
            })
            .catch(function (err) {
              msg.error = err;
              node.send(msg);
            });
        }
        const AddPersonFace = () => {
          msg.topic = 'I am addpersonface';
          var personName = msg.req.params.name;  // ker: c3cda588-0fdd-4aef-a87f-4e22e0b6b548
          var personID = '';
          var imageUrl = msg.imageurl;
          // console.log(imageUrl);
          const queryPerson = (name) => {
            const options = {
              uri: ( 'https://' + subServer + '/face/v1.0/persongroups/' + groupID + '/persons?start=&top='),
              method: 'GET',
              json: true,
              headers: {
                'Content-Type': 'application/json',
                'Ocp-Apim-Subscription-Key': subKey
              }
            };
            function QueryCallback(value) {
              if (value.name == name) {
                personID = value.personId;
              }
            }
            rp(options)
              .then(function (response) {
                response.forEach(QueryCallback);
                if (personID != '') {
                  const options = {
                    uri: ( 'https://' + subServer + '/face/v1.0/persongroups/' + groupID + '/persons/' + personID + '/persistedFaces'),
                    method: 'POST',
                    json: true,
                    headers: {
                      'Content-Type': 'application/json',
                      'Ocp-Apim-Subscription-Key': subKey
                    },
                    body: {
                      url: imageUrl
                    }
                  };
                  // console.log(options.uri);
                  rp(options)
                    .then(function (response) {
                      msg.payload = response;
                      node.send(msg);
                    })
                    .catch(function (err) {
                      msg.error = err;
                      node.send(msg);
                    });
                }
              })
              .catch(function (err) {
                msg.error = err;
                node.send(msg);
              });
          }
          queryPerson(personName);  
          
        }

        const ListPerson = () => {
          msg.topic = 'I am listperson';

          const options = {
            uri: ( 'https://' + subServer + '/face/v1.0/persongroups/' + groupID + '/persons?start=&top='),
            method: 'GET',
            json: true,
            headers: {
              'Content-Type': 'application/json',
              'Ocp-Apim-Subscription-Key': subKey
            }
          };

          rp(options)
            .then(function (response) {
              msg.payload = response;
              node.send(msg);
            })
            .catch(function (err) {
              msg.error = err;
              node.send(msg);
            });

        }

        let detectedFaceId = msg.FaceIds;
        
        let detectUrl = msg.detecturl;

        const Detect = () => {
          msg.topic = 'I am detect';

          const options = {
            uri: ( 'https://' + subServer + '/face/v1.0/detect?returnFaceId=true' ),
            method: 'GET',
            json: true,
            headers: {
              'Content-Type': 'application/json',
              'Ocp-Apim-Subscription-Key': subKey
            },
            body: {
             url: detectUrl
            }
          };

          rp(options)
            .then(function (response) {
              msg.payload = response;
              node.send(msg);
            })
            .catch(function (err) {
              msg.error = err;
              node.send(msg);
            });

        }

        const Identify = () => {
          msg.topic = 'I am Identify';

          const options = {
            uri: ( 'https://' + subServer + '/face/v1.0/identify' ),
            method: 'POST',
            json: true,
            headers: {
              'Content-Type': 'application/json',
              'Ocp-Apim-Subscription-Key': subKey
            },
            body: {
             faceIds: detectedFaceId,
             personGroupId: groupID
            }
          };

          rp(options)
            .then(function (response) {
              msg.payload = response;
              node.send(msg);
            })
            .catch(function (err) {
              msg.error = err;
              node.send(msg);
            });

        }

        // Main
        (function(subServer, subKey) {
          if ( subServer == 'no-server' || subKey == 'no-key') {
            if ( subServer == 'no-server' ) {
              msg.error = 'You must input a server url to use this node.';
            }
            if ( subKey == 'no-key' ) {
              msg.error = 'You must input Subscription Key to use this node.';
            }
            if ( subServer == 'no-server' && subKey == 'no-key' ) {
              msg.error = 'You must input a server url and Subscription Key to use this node.';
            }
            // send msg to stop node
            node.send(msg);
          } else {
            switch (apiKind) {
              case 'persongroup':
                PersonGroup();
                break;
              case 'facelist':
                FaceList();
                break;
              case 'detect':
                Detect();
                break;
              case 'verify':
                Verify();
                break;
              case 'addperson':
                AddPerson();
                break;
              case 'addpersonface':
                AddPersonFace();
                break;
              case 'listperson':
                ListPerson();
                break;
              case 'identify':
                Identify();
                break;
              default:
                msg.topic = 'nothing happend';
                break;
            }
          }
        })(subServer, subKey);
        

      });
  }
  RED.nodes.registerType("faceapi-node",FaceApiNode, {
    credentials: {
      key: {
        type: "password"
      },
      server: {
        type: "text"
      },
      groupid:  {
        type: "text"
      },
      groupdata:  {
        type: "text"
      }
    }
  });
}