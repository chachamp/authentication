require('dotenv').config()
const SHA256 = require('crypto-js/sha256')
const { Client } = require('@elastic/elasticsearch')
const client = new Client({ node: process.env.ElastisearchConfig })
var nodemailer = require('nodemailer')
const immer = require("immer")
class validationActiveServices {
    verifyCustomer(body) {
      const promise = new Promise((resolve)=>{
      var ApplicationName = body.ApplicationName
      var CustomerEmail = body.CustomerEmail
      var resultOfHash = this.calculateHash(ApplicationName, CustomerEmail)
      this.sendMessageToMail(ApplicationName, CustomerEmail, resultOfHash).then(rs => {
        // return rs
        resolve(rs)
      })
    })
    return promise
    }
    sendMessageToMail(ApplicationName, CustomerEmail, resultOfHash) {
      const promise = new Promise((resolve)=>{
      var urlByApp = 'http://'+process.env.HostOfResultVerify+':'+process.env.PortOfResultVerify
      var verifyLink = urlByApp+'/api/v1.0/result/template/verification?'+'hash='+resultOfHash+'&'+'appName='+ApplicationName+'&'+'customerEmail='+CustomerEmail
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
          subject: 'Verify email address after submission on '+ApplicationName+' application',
          html: '<center><div style="font-size:18px;color:rgb(0,0,0);border:solid 1px rgba(0,0,0,.2);max-width:500px;border-radius:10px;padding:30px 10px 30px 10px;"><h1>Thank you !</h1>'
          + '<br>Your submission has been received.'
          + '<br><br><a style="padding:10px 50px 10px 50px;margin:10px;background-color:#E277CD;color:rgb(255,255,255);border:none;border-radius:5px;font-size:20px" href="'+verifyLink+'">Verify</a>'+'<br><br> to verify your email address<br>'
          + '<br><hr style="border-top:solid 1px rgba(0,0,0,.2)!important;">'
          + '<br>'
          + 'You are receiving this email because you have subscribed to <strong>'+ApplicationName+'</strong> application'
          + '<br><br>'
          + '<div style="font-size:14px !important;">© Copyright ©2020 i-SKYNET ONE.Co.,Ltd. All rights reserved.</div></div><center>'
        }
        
        transporter.sendMail(mailOptions, function(error, info){
          if (error) {
            console.log(error);
            return error
          }
          else {
            // console.log('Email sent: ' + info.response);
            resolve([ApplicationName, CustomerEmail, resultOfHash, urlByApp, info.response])
          }
        })
        transporter.close()
      })
      
      return promise
    }
    calculateHash(ApplicationName, CustomerEmail) {
      var hashInit = ""
      var hash =  SHA256( 
          hashInit
          + JSON.stringify(ApplicationName).toString()
          + JSON.stringify(CustomerEmail).toString()
          ).toString()
      return hash
    }

    updateValidation(body) {
 
        var hash = body.hash
        var appName = body.appName
        var customerEmail = body.customerEmail
        const promise = new Promise((resolve)=>{
          this.getCheckActiveStatus(customerEmail, appName).then(res => {
              var listLength = res.CustomerAdjunct.ApplicationList.ApplicationName.length
              for(var i=0; i<listLength; i++) {
                if(res.CustomerAdjunct.ApplicationList.ApplicationName[i].Name == appName && res.CustomerAdjunct.ApplicationList.ApplicationName[i].ApplicationStatus == "Active") {
                  resolve("Validation gone")
                }
              }

              // Update status active from verify email
              this.updateValidateActiveStatus(hash, appName, res).then(rs1 => {
                resolve(rs1)
                // console.log(rs1)
                 })

              // var listOfUpdateValidateHash = []
              // Update hash from verify email
              this.getAuthenData(res.CustomerID).then(response => {
                // resolve(rs)
               this.updateValidateHash(hash, response).then(rs2 => {
                 })
              })

          })
        })
       

    return promise
    }
    getAuthenData(customerID) {
      const promise = new Promise((resolve)=>{
        client.search({
            index: process.env.IndexOfElasticsearchAPIforAuthentication,
            body: {
              "query": {
                "bool": {
                "must": [
                    {
                      "match": {
                        "CustomerID": {"query" : customerID,
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

    getCheckActiveStatus(customerEmail, appName) {
      const promise = new Promise((resolve)=>{
        client.search({
            index: process.env.IndexOfElasticsearchAPIforProfile,
            body: {
              "query": {
                "bool": {
                "must": [
                    {
                      "match": {
                        "CustomerEmail": {"query" : customerEmail,
                        "cutoff_frequency" : 1,
                          "minimum_should_match":"100%"
                        }
                          }
                    },
                    {
                      "match": {
                        "CustomerAdjunct.ApplicationList.ApplicationName.Name": {"query" : appName,
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
            var total = result.body.hits.total.value
            var list = []
            for(var i=0; i<total; i++) {
              var res = result.body.hits.hits[i]._source
              if(res.Facebook[0].FacebookID == "" && res.Google[0].GoogleID == "" && res.Twitter[0].TwitterID == "") {
                list.push(i)
              }
            }
            var value = list[0]
            var resultOfCustomer = result.body.hits.hits[value]._source
            resolve(resultOfCustomer)
            })
    })
    return promise
    }
    
    updateValidateActiveStatus(hash, appName, resultOfCustomer) {
      var CustomerID = resultOfCustomer.CustomerID
      var CustomerTitle = resultOfCustomer.CustomerTitle
      var CustomerFirstName = resultOfCustomer.CustomerFirstName
      var CustomerLastName = resultOfCustomer.CustomerLastName
      var CustomerBirthday = resultOfCustomer.CustomerBirthday
      var CustomerGender = resultOfCustomer.CustomerGender
      var CustomerTelephone = resultOfCustomer.CustomerTelephone
      var CustomerCreateOn = resultOfCustomer.CustomerCreateOn
      var CustomerEmail = resultOfCustomer.CustomerEmail
      var Facebook = resultOfCustomer.Facebook
      var Google = resultOfCustomer.Google
      var Twitter = resultOfCustomer.Twitter
      var datetime = new Date()
      datetime.setHours( datetime.getHours()  )
      var applicationName = resultOfCustomer.CustomerAdjunct.ApplicationList.ApplicationName
      var resultList = []
      for(var i=0; i<applicationName.length; i++) {
        if(applicationName[i].Name == appName) {
          
          var name = applicationName[i].Name
          var newName = {"Name": name}
          var newForm = {"ApplicationStatus": "Active"}
          var newSet = { ...newName, ...newForm}
          var index = i
          resultList.push(index)
        }
      }

      var list = []
      for(var j=0; j<applicationName.length; j++) {

          var result = applicationName[j]
          list.push(result)

      }
  
      const newArray = immer.produce(list, draft => {
        draft[resultList[0]] = newSet
      })

      const promise = new Promise((resolve)=>{
          client.index({
              index: process.env.IndexOfElasticsearchAPIforProfile,
              id: CustomerID,
              body: {
              "CustomerID": CustomerID,
              "CustomerTitle": CustomerTitle,
              "CustomerFirstName": CustomerFirstName,
              "CustomerLastName": CustomerLastName,
              "CustomerBirthday": CustomerBirthday,
              "CustomerGender": CustomerGender,
              "CustomerTelephone": CustomerTelephone,
              "CustomerCreateOn": CustomerCreateOn,
              "CustomerUpdateOn": datetime,
              "CustomerEmail": CustomerEmail,
              "Facebook": Facebook,
              "Google": Google,
              "Twitter": Twitter,
              "CustomerAdjunct": 
                  {
                  "ApplicationList": 
                      {
                      "ApplicationName": newArray
                      }
                      
                  }
                  
              }
              }, (err, result) => {
              if (err) return err
              resolve(result.body.result)
              })
      })
      return promise
    }

    updateValidateHash(hash, resultOfCustomer) {
      var CustomerID = resultOfCustomer.CustomerID
      var CustomerEmail = resultOfCustomer.CustomerType[0].Zorka[0].CustomerEmail
      var CustomerPassword = resultOfCustomer.CustomerType[0].Zorka[1].CustomerPassword
      var CustomerLoginBy = resultOfCustomer.CustomerLoginBy
      var ApplicationName = resultOfCustomer.CustomerAuthorization.ApplicationList.ApplicationName
      var CustomerStatus = resultOfCustomer.CustomerStatus
      var CustomerCreateOn = resultOfCustomer.CustomerCreateOn
      var PreviosHash = ""
      var Hash = hash
      var datetime = new Date()
      datetime.setHours( datetime.getHours()  )


      const promise = new Promise((resolve)=>{
          client.index({
              index: process.env.IndexOfElasticsearchAPIforAuthentication,
              id: CustomerID,
              body: {
                "CustomerID": CustomerID,
                "CustomerType": [
                  {
                    "Zorka": [
                      { "CustomerEmail": CustomerEmail},
                      { "CustomerPassword": CustomerPassword }
                    ]
                  }
                ],
                "CustomerLoginBy": CustomerLoginBy,
                "CustomerAuthorization":                          
                 {
                    "ApplicationList": 
                    { "ApplicationName": 
                    ApplicationName
                }   
                  },
                "CustomerStatus": CustomerStatus,                     
                "CustomerCreateOn": CustomerCreateOn,
                "CustomerUpdateOn": datetime,
                "PreviosHash": PreviosHash,
                "Hash": Hash,
        }
              }, (err, result) => {
              if (err) return err
              resolve(result.body.result)
              })
      })
      return promise
    }

   
  }

module.exports = validationActiveServices