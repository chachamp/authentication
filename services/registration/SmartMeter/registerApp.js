require('dotenv').config()
const { Client } = require('@elastic/elasticsearch')
const client = new Client({ node: process.env.ElastisearchConfig })
class registrationGenerateServices {
    generatorCustomer(body) {
        var ApplicationName = body.ApplicationName
        var ApplicationAdjunct = body.ApplicationAdjunct
        var CustomerEmail = body.CustomerEmail
        var CustomerPassword = body.CustomerPassword
        var CustomerTitle = body.CustomerTitle
        var CustomerGender = body.CustomerGender
        var CustomerFirstName = body.CustomerFirstName
        var CustomerLastName = body.CustomerLastName
        var CustomerTelephone = body.CustomerTelephone
        const promise = new Promise((resolve, reject)=>{
            client.search({
                index: process.env.IndexOfElasticsearchAPIforProfile,
                body: {
                "size": 1,
                "sort": [ {
                    "CustomerID.keyword": "desc"
                    
                    }],    
                "query": {
                    "match_all": {}
                }
                }
                }, (err, result) => {
                if (err) return err
        
                var customerNewIDSignZeroFill = this.createNewCustomerID(result)
                var resultOfGenarateAuthentication = this.generateAuthentication(customerNewIDSignZeroFill, CustomerEmail, CustomerPassword, ApplicationName)
                var resultOfGenarateCustomerProfile = this.generateProfile(customerNewIDSignZeroFill, ApplicationName, ApplicationAdjunct, CustomerTitle, CustomerGender, CustomerFirstName, CustomerLastName, CustomerTelephone, CustomerEmail)
                Promise.all([customerNewIDSignZeroFill, resultOfGenarateAuthentication, resultOfGenarateCustomerProfile]).then(res =>{
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
                
                
        })
        return promise
    }
    createNewCustomerID(result) {
        var customerIDLatest = parseInt(result.body.hits.hits[0]._id)
        var customerIDIncremention = customerIDLatest + 1
        var customerIDIncrementionResultTransforming = customerIDIncremention.toString().length
        let customerNewIDList = []
        if (customerIDIncrementionResultTransforming != 6){ 
            for(var i = 0; i < 6-parseInt(customerIDIncrementionResultTransforming); i++) {
                var zeroPrefix = "0"
                customerNewIDList.push(zeroPrefix)
            }
            customerNewIDList.push(customerIDIncremention.toString())   
        }
        var customerNewIDSignZeroFill = customerNewIDList.join("")
        return customerNewIDSignZeroFill
    }

    generateAuthentication(customerNewIDSignZeroFill, CustomerEmail, CustomerPassword, ApplicationName) {
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
                              { "ApplicationName": [{"Name": ApplicationName}]
                            },
                              
                            
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

    generateProfile(customerNewIDSignZeroFill, ApplicationName, ApplicationAdjunct, CustomerTitle, CustomerGender, CustomerFirstName, CustomerLastName, CustomerTelephone, CustomerEmail) {
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

module.exports = registrationGenerateServices