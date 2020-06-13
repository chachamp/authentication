require('dotenv').config()
const { Client } = require('@elastic/elasticsearch')
const client = new Client({ node: process.env.ElastisearchConfig })
class AuthoServices {
    generatorCustomer(loginType, otherAppID, otherAppName, otherAppEmail, applicationProjectName, ApplicationAdjunct) {
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
                var resultOfGenarateAuthentication = this.generateAuthentication(loginType, applicationProjectName,customerNewIDSignZeroFill)
                var resultOfGenarateCustomerProfile = this.generateProfile(loginType, otherAppID, otherAppName, otherAppEmail, applicationProjectName, customerNewIDSignZeroFill, ApplicationAdjunct)
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

    generateAuthentication(loginType, applicationProjectName, customerNewIDSignZeroFill) {
        var datetime = new Date()
        datetime.setHours( datetime.getHours()  )
        const promise = new Promise((resolve)=>{
            client.index({
                index:  process.env.IndexOfElasticsearchAPIforAuthentication,
                id: customerNewIDSignZeroFill,
                body: {
                        "CustomerID": customerNewIDSignZeroFill,
                        "CustomerType": [
                          {
                            "Zorka": [
                              { "CustomerEmail": ""},
                              { "CustomerPassword": "" }
                            ]
                          }
                        ],
                        "CustomerLoginBy": loginType,
                        "CustomerAuthorization":                          
                         {
                            "ApplicationList": 
                            { "ApplicationName": 
                            [{"Name": applicationProjectName}]
                        }   
                          },
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

    generateProfile(loginType, otherAppID, otherAppName, otherAppEmail, applicationProjectName, customerNewIDSignZeroFill, ApplicationAdjunct) {
        switch(loginType){
            case "Facebook":
                var FacebookID = otherAppID
                var FacebookName = otherAppName
                var GoogleID = ""
                var GoogleName = ""
                var TwitterID = ""
                var TwitterName = ""
                break
            case "Google":
                var FacebookID = ""
                var FacebookName = ""
                var GoogleID = otherAppID
                var GoogleName = otherAppName
                var TwitterID = ""
                var TwitterName = ""
                break
            case "Twitter":
                var FacebookID = ""
                var FacebookName = ""
                var GoogleID = ""
                var GoogleName = ""
                var TwitterID = otherAppID
                var TwitterName = otherAppName
                break

        }

        var resultList = []
        var resultfFromNew  = {"Name": applicationProjectName, ApplicationStatus: 'Active'}
        // resultfFromNew.add(ApplicationName);
        var newSet = { ...resultfFromNew, ...ApplicationAdjunct}
        resultList.push(newSet)
        var datetime = new Date()
        datetime.setHours( datetime.getHours()  )
        const promise = new Promise((resolve)=>{
            client.index({
                index:  process.env.IndexOfElasticsearchAPIforProfile,
                id: customerNewIDSignZeroFill,
                body: {
                "CustomerID": customerNewIDSignZeroFill,
                "CustomerTitle": "",
                "CustomerFirstName": "",
                "CustomerLastName": "",
                "CustomerBirthday": "",
                "CustomerGender": "",
                "CustomerTelephone": [
                    {
                    "Typeof": [
                        {
                        "Mobiles": []
                        },
                        {
                        "Faxs": []
                        }
                    ]
                    }
                ],
                "CustomerCreateOn": datetime,
                "CustomerUpdateOn": "",
                "CustomerEmail": otherAppEmail,
                "Facebook": [{ "FacebookID": FacebookID }, { "FacebookName": FacebookName }],
                "Google": [{ "GoogleID": GoogleID }, { "GoogleName": GoogleName }],
                "Twitter": [{ "TwitterID": TwitterID }, { "TwitterName": TwitterName }],
                "CustomerAdjunct": 
                    {
                    "ApplicationList": 
                        {
                        "ApplicationName": resultList
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


module.exports = AuthoServices