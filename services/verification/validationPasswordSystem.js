require('dotenv').config()
const SHA256 = require('crypto-js/sha256')
const { Client } = require('@elastic/elasticsearch')
const client = new Client({ node: process.env.ElastisearchConfig })
var nodemailer = require('nodemailer')
class validationConfirmPasswordServices {
    updatePassword(body) {
      var ChangePasswordType = body.ChangePasswordType
      var CustomerEmail = body.CustomerEmail
      var ApplicationName = body.ApplicationName
      var CustomerPasswordOld = body.CustomerPasswordOld
      var CustomerPasswordNew = body.CustomerPasswordNew
      let buff = Buffer.from(CustomerPasswordOld)  
      let CustomerPasswordOldBase64 = buff.toString('base64');
      let buffNew = Buffer.from(CustomerPasswordNew)  
      let CustomerPasswordNewBase64 = buffNew.toString('base64');
      const promise = new Promise((resolve, reject)=>{     
          switch(ChangePasswordType) {
              case "Zorka":
                this.checkStatusUpdateZorka(CustomerEmail, CustomerPasswordOldBase64, ApplicationName).then(response => {
                  resolve(response)
                  if(response[0] == 200) {
                    var status200 = "Can"
                    response.push(status200)
                    this.checkAccount(CustomerEmail, CustomerPasswordOldBase64, ApplicationName).then(rs => {
                    // case check if has data
                    if([rs].length != 0) {
                      var resultOfRequestVerifyPassword = this.verifyPassword([rs, CustomerPasswordNewBase64, ApplicationName])
                      resolve(resultOfRequestVerifyPassword)
                      }
                    })
                    resolve(response)
                  }
                  else if(response == 201) {
                    var status201 = "No have account in Database"
                    response.push(status201)
                    resolve(response)
                  }
                  else if(response == 404) {
                    var status201 = "No have account in Database"
                    response.push(status201)
                    resolve(response)
                  }
                  else if(response[0] == 401) {
                    resolve(response)
                  }
                })
                  break
              default:
                  // case type app fail
                  resolve(401)
                  break
          }
      }) 
      return promise
    }

    checkStatusUpdateZorka(CustomerEmail, CustomerPasswordOld, ApplicationName) {
      const promise = new Promise((resolve)=>{
          client.search({
              index: process.env.IndexOfElasticsearchAPIforAuthentication,
              body: {
                  "query": {
                    "bool": {
                    "must": [
                        {
                          "match": {
                            "CustomerType.Zorka.CustomerEmail": {"query" : CustomerEmail,
                            "cutoff_frequency" : 1,
                              "minimum_should_match":"100%"
                            }
                              }
                        },
                        {
                          "match": {
                            "CustomerType.Zorka.CustomerPassword": {"query" :CustomerPasswordOld}
                              }
                        },
                        {
                          "match": {
                            "CustomerAuthorization.ApplicationList.ApplicationName.Name": {"query" : ApplicationName,
                            "cutoff_frequency" : 1,
                              "minimum_should_match":"100%"
                            }
                              }
                        }
                    ]
                    }
                }
                }
              
              }, (err, result) => {
                  // resolve(result)
                  if(result.body.status == 404) {
                      var response = 404
                      resolve(response)
                  }
                  else {
                      var totalValue = result.body.hits.total.value
                      // Do you have account in database ?
                      if (totalValue != 0){
                          var getCustomerID = result.body.hits.hits[0]._source.CustomerID
                          this.checkAccountActive(getCustomerID).then(res => {
                          // Account Active ? 
                          if(res == true) {
                          // App Active ? 
                              this.checkAppZorkaActive(getCustomerID).then(rs => {
                                  // App Active !
                              
                                  if(rs == true) 
                                  {
                                      var getCustomerID = result.body.hits.hits[0]._source.CustomerID
                                      var response = 200
                                      Promise.all([response, getCustomerID]).then(res =>{
                                          var resultList = []
                                          var resultResponse = res[0]
                                          var resultCustomerID = res[1]
                                          resultList.push(resultResponse)
                                          resultList.push(resultCustomerID)
                                          resolve(resultList)
                                      })
                                      }
                                  // App Inactive !
                                  else if(rs == false) {
                                      var response = 401
                                      var errComment = "Application Inactive"
                                      Promise.all([response,"", errComment]).then(res =>{
                                          var resultList = []
                                          var resultResponse = res[0]
                                          var resultNone1 = res[1]
                                          var resulterrComment = res[2]
                                          resultList.push(resultResponse)
                                          resultList.push(resultNone1)
                                          resultList.push(resulterrComment)
                                          resolve(resultList)
                                      })
                                  }
                              })
                          }
                          // Account Inactive !
                          else if(res == false) {
                              var response = 401
                              var errComment = "Account Inactive"
                              Promise.all([response,"", errComment]).then(res =>{
                                  var resultList = []
                                  var resultResponse = res[0]
                                  var resultNone1 = res[1]
                                  var resulterrComment = res[2]
                                  resultList.push(resultResponse)
                                  resultList.push(resultNone1)
                                  resultList.push(resulterrComment)
                                  resolve(resultList)
                              })
                             
                          }
                          })
                      } 
                      // Don't have account in database
                      else if (totalValue == 0) {
                          var response = 201
                          resolve(response)
                      }
                  }
              })
      })
      return promise
    }
    checkAccountActive(getCustomerID) {
      const promise = new Promise((resolve)=>{
          client.search({
              index: process.env.IndexOfElasticsearchAPIforAuthentication,
              body:  {
                  "query": {
                      "bool": {
                      "must": [
                          {
                          "match": {
                              "CustomerID": getCustomerID
                          }
                          },
                          {
                          "match": { "CustomerStatus": "Active" }
                        }
                      ]
                      }
                  }
              }
              }, (err,result) => {
                  var totalValue = result.body.hits.total.value
                  if(totalValue == 0) {
                      resolve(false)
                  }
                  else if(totalValue != 0) {
                      resolve(true)
                  }
              })
      })
      return promise
    }
    checkAppZorkaActive(getCustomerID) {
      const promise = new Promise((resolve)=>{
          client.search({
              index: process.env.IndexOfElasticsearchAPIforProfile,
              body:  {
                  "query": {
                      "bool": {
                      "must": [
                          {
                          "match": {
                              "CustomerID": getCustomerID
                          }
                          
                          },
                          {
                          "match": { "CustomerAdjunct.ApplicationList.ApplicationName.ApplicationStatus": "Active" }
                        }
                      ]
                      }
                  }
              }
              }, (err,result) => {
                  // resolve(result)
                  var totalValue = result.body.hits.total.value
                  if(totalValue == 0) {
                      resolve(false)
                  }
                  else if(totalValue != 0) {
                      resolve(true)
                  }
              })
      })
      return promise
    }

    checkAccount(CustomerEmail, CustomerPasswordOld, ApplicationName) {
        const promise = new Promise((resolve)=>{
            client.search({
                index: process.env.IndexOfElasticsearchAPIforAuthentication,
                body: {
                    "query": {
                      "bool": {
                      "must": [
                          {
                            "match": {
                              "CustomerType.Zorka.CustomerEmail": {"query" : CustomerEmail,
                              "cutoff_frequency" : 1,
                                "minimum_should_match":"100%"
                              }
                                }
                          },
                          {
                            "match": {
                              "CustomerType.Zorka.CustomerPassword": {"query" :CustomerPasswordOld}
                                }
                          },
                          {
                            "match": {
                              "CustomerAuthorization.ApplicationList.ApplicationName.Name": {"query" : ApplicationName,
                              "cutoff_frequency" : 1,
                                "minimum_should_match":"100%"
                              }
                                }
                          }
                      ]
                      }
                  }
                  }
                
                }, (err, result) => {
                    resolve(result.body.hits.hits[0]._source)

                })
        })
        return promise
    }
    
    verifyPassword(body) {
      var CustomerEmail = body[0].CustomerType[0].Zorka[0].CustomerEmail
      var CustomerPasswordNew = body[1]
      var ApplicationName = body[2]
      let buffNew = Buffer.from(CustomerPasswordNew)  
      let CustomerPasswordNewBase64 = buffNew.toString('base64');

      var resultOfSendMessage = this.sendMessageToMail(ApplicationName, CustomerEmail, CustomerPasswordNewBase64)
      return resultOfSendMessage
    }
    calculateHash(ApplicationName, CustomerEmail, CustomerPasswordNew) {
      var hash =  SHA256(
          CustomerPasswordNew
          + JSON.stringify(ApplicationName).toString()
          + JSON.stringify(CustomerEmail).toString()
          ).toString()
      return hash
    }
    sendMessageToMail(ApplicationName, CustomerEmail, resultOfHash) {
      var urlByApp = 'http://'+process.env.HostOfResultVerify+':'+process.env.PortOfResultVerify
      var verifyLink = urlByApp+'/api/v1.0/result/template/changepassword?'+'hash='+resultOfHash+'&'+'appName='+ApplicationName+'&'+'customerEmail='+CustomerEmail
      var image = 'C:\Authentication\image\zorka-icon.png'
      var transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EmailSender,
            pass: process.env.PasswordSender
          }
        });
        
        var mailOptions = {
          from: process.env.EmailSender,
          to: CustomerEmail,
          subject: 'Verify change password after submission on '+ApplicationName+' application',
          html: '<b1>Thank you !</b1>'
          + '<br>Your submission has been received.'
          + '<br> Click '+'<a href="'+verifyLink+'">this link</a>'+' to verify your change password<br>'
          + '<br><hr>'
          + '<br><br><br><br><br><br><br>'
          + '<img src="'+image+'" alt="Zorka icon" height="30" width="30">'
          + '<br>'
          + 'You are receiving this email because you have subscribed to '+ApplicationName+' application'
          + '<br>'
          + '<a href="https://www.google.com">Privacy statement</a>'
          + '<br>'
          + '© Copyright ©2020 i-SKYNET ONE.Co.,Ltd. All rights reserved.'
        }
        
        transporter.sendMail(mailOptions, function(error, info){
          if (error) {
            console.log(error);
            return error
          }
          else {
            console.log('Email sent: ' + info.response);
            return ('Email sent: ' + info.response)
          }
        })
    }


    updateValidationChangePassword(body) {
      var Newhash = body.hash
      var appName = body.appName
      var customerEmail = body.customerEmail
      const promise = new Promise((resolve)=>{
        this.getDataAuthentication(customerEmail, appName).then(res => {
          let buff = Buffer.from(Newhash, 'base64')
          let password = buff.toString('ascii')
          // resolve(password)
          this.updateValidate(password, appName, customerEmail, res).then(rs => {
            resolve(rs)
            })
          
        
          
         
        })
      })
     

  return promise
    }

    getDataAuthentication(customerEmail, appName) {
      const promise = new Promise((resolve)=>{
        client.search({
            index: process.env.IndexOfElasticsearchAPIforAuthentication,
            body: {
              "query": {
                "bool": {
                "must": [
                    {
                      "match": {
                        "CustomerType.Zorka.CustomerEmail": {"query" : customerEmail,
                        "cutoff_frequency" : 1,
                          "minimum_should_match":"100%"
                        }
                          }
                    },
                    {
                      "match": {
                        "CustomerAuthorization.ApplicationList.ApplicationName.Name": {"query" : appName,
                        "cutoff_frequency" : 1,
                          "minimum_should_match":"100%"
                        }
                      }
                    }
                ]
                }
            }
            }
            
            }, (err, result) => {
            if (err) return err
            

            var resultOfCustomer = result.body.hits.hits[0]._source
            resolve(resultOfCustomer)
            })
    })
    return promise
    }
    
    updateValidate(password, appName, customerEmail, resultOfCustomer) {
    var resultOfHash = this.calculateHash(appName, customerEmail, password)
    var CustomerID = resultOfCustomer.CustomerID
    var CustomerEmail = resultOfCustomer.CustomerType[0].Zorka[0].CustomerEmail
    var CustomerLoginBy = resultOfCustomer.CustomerLoginBy
    var CustomerAuthorization = resultOfCustomer.CustomerAuthorization
    var CustomerStatus = resultOfCustomer.CustomerStatus
    var CustomerCreateOn = resultOfCustomer.CustomerCreateOn
    var PreviosHash = resultOfCustomer.Hash
    var datetime = new Date()
    datetime.setHours( datetime.getHours()  )
    var newCustomerType = [
      {
        "Zorka" : [
          {
            "CustomerEmail" : CustomerEmail
          },
          {
            "CustomerPassword" : password
          }
        ]
      }
    ]
      // return CustomerType[0].Zorka[1].CustomerPassword
    const promise = new Promise((resolve)=>{
        client.index({
            index: process.env.IndexOfElasticsearchAPIforAuthentication,
            id: CustomerID,
            body: {
            "CustomerID": CustomerID,
            "CustomerType": newCustomerType,
            "CustomerLoginBy": CustomerLoginBy,
            "CustomerAuthorization": CustomerAuthorization,
            "CustomerStatus": CustomerStatus,
            "CustomerCreateOn": CustomerCreateOn,
            "CustomerUpdateOn": datetime,
            "PreviosHash": PreviosHash,
            "Hash": resultOfHash
                
            }
            }, (err, result) => {
            if (err) return err
            resolve(result.body.result)
            })
    })
    return promise
    }


   
    }

module.exports = validationConfirmPasswordServices