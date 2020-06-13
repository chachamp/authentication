require('dotenv').config()
const { Client } = require('@elastic/elasticsearch')
const client = new Client({ node: process.env.ElastisearchConfig })
class registrationInitialGenerateServices {
    generatorInitialCustomer(body) {
        var ApplicationName = body.ApplicationName
        var ApplicationAdjunct = body.ApplicationAdjunct
        var CustomerEmail = body.CustomerEmail
        var CustomerPassword = body.CustomerPassword
        var CustomerTitle = body.CustomerTitle
        var CustomerGender = body.CustomerGender
        var CustomerFirstName = body.CustomerFirstName
        var CustomerLastName = body.CustomerLastName
        var CustomerTelephone = body.CustomerTelephone
        const promise = new Promise((resolve)=>{
            var customerNewIDSignZeroFill = process.env.OffsetOfIncremention || "000000"
            var resultOfGenarateInitialAuthentication = this.generateInitialAuthentication(customerNewIDSignZeroFill, CustomerEmail, CustomerPassword, ApplicationName)
            var resultOfGenarateInitialCustomerProfile = this.generateInitialProfile(customerNewIDSignZeroFill, ApplicationName, ApplicationAdjunct, CustomerTitle, CustomerGender, CustomerFirstName, CustomerLastName, CustomerTelephone, CustomerEmail)
            Promise.all([customerNewIDSignZeroFill, resultOfGenarateInitialAuthentication, resultOfGenarateInitialCustomerProfile]).then(res =>{
                var resultList = []
                var resultCustomerID = res[0]
                var resultAuth = res[1].body.result 
                var resultProfile = res[2].body.result 
                resultList.push(resultCustomerID)
                resultList.push(resultAuth)
                resultList.push(resultProfile)
                resolve(resultList)
            })
        })
        return promise
    }

    generateInitialAuthentication(customerNewIDSignZeroFill, CustomerEmail, CustomerPassword, ApplicationName) {
      var datetime = new Date()
      datetime.setHours( datetime.getHours()  )
      let buff = Buffer.from(CustomerPassword)  
      let CustomerPasswordBase64 = buff.toString('base64')
      const promise = new Promise((resolve)=>{
            client.index({
                index: process.env.IndexOfElasticsearchAPIforAuthentication,
                id: customerNewIDSignZeroFill,
                body: {
                        "CustomerID": customerNewIDSignZeroFill,
                        "CustomerType": [
                          {
                            "Zorka": [
                              { "CustomerEmail": CustomerEmail},
                              { "CustomerPassword": CustomerPasswordBase64}
                            ]
                          }
                        ],
                        "CustomerLoginBy": "Zorka",
                        "CustomerAuthorization": 
                          {
                            "ApplicationList": 
                              { "ApplicationName": [{"Name": ApplicationName}] }
                            
                          }
                        ,
                        "CustomerStatus": "Active",
                        "CustomerCreateOn": datetime,
                        "CustomerUpdateOn": "",
                }
                }, (err, result) => {
                if (err) return err
                resolve(result)
                })
        })
        return promise
    }

    generateInitialProfile(customerNewIDSignZeroFill, ApplicationName, ApplicationAdjunct, CustomerTitle, CustomerGender, CustomerFirstName, CustomerLastName, CustomerTelephone, CustomerEmail) {
      var resultList = []
      var resultfFromNew  = {"Name": ApplicationName, ApplicationStatus: 'Inactive'}
      // resultfFromNew.add(ApplicationName);
      var newSet = { ...resultfFromNew, ...ApplicationAdjunct}
      resultList.push(newSet)
      var datetime = new Date()
      datetime.setHours( datetime.getHours()  )
        const promise = new Promise((resolve)=>{
            client.index({
                index: process.env.IndexOfElasticsearchAPIforProfile,
                id: customerNewIDSignZeroFill,
                body: {
                "CustomerID": customerNewIDSignZeroFill,
                "CustomerTitle": CustomerTitle || "",
                "CustomerFirstName": CustomerFirstName || "",
                "CustomerLastName": CustomerLastName || "",
                "CustomerBirthday": "",
                "CustomerGender": CustomerGender || "",
                "CustomerTelephone": CustomerTelephone || [{"Typeof": [ {"Mobiles": [] }, {"Faxs": []} ]}],
                "CustomerCreateOn": datetime,
                "CustomerUpdateOn": "",
                "CustomerEmail": CustomerEmail,
                "Facebook": [{ "FacebookID": "" }, { "FacebookName": "" }],
                "Google": [{ "GoogleID": "" }, { "GoogleName": "" }],
                "Twitter": [{ "TwitterID": "" }, { "TwitterName": "" }],
                "CustomerAdjunct": 
                    {
                    "ApplicationList": 
                        {
                        "ApplicationName":  resultList 
                        }
                        
                    }
                    
                }
                }, (err, result) => {
                // if (err) return err
                resolve(result)
                })
        })
        return promise
    }
    }

module.exports = registrationInitialGenerateServices