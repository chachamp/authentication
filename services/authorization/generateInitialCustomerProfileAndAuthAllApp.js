require('dotenv').config()
const { Client } = require('@elastic/elasticsearch')
const client = new Client({ node: process.env.ElastisearchConfig })
class GenerateInitialServices {
    generatorInitialCustomer(loginType, otherAppID, otherAppName, otherAppEmail, applicationProjectName, ApplicationAdjunct) {
        const promise = new Promise((resolve)=>{
            var customerNewIDSignZeroFill = process.env.OffsetOfIncremention || "000000"
            var resultOfGenarateInitialAuthentication = this.generateInitialAuthentication(loginType, applicationProjectName, customerNewIDSignZeroFill)
            var resultOfGenarateInitialCustomerProfile = this.generateInitialProfile(loginType, otherAppID, otherAppName, otherAppEmail, applicationProjectName, customerNewIDSignZeroFill, ApplicationAdjunct)
            // resolve(resultOfGenarateInitialAuthentication)
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

    generateInitialAuthentication(loginType, applicationProjectName, customerNewIDSignZeroFill) {
        var datetime = new Date()
        datetime.setHours( datetime.getHours()  )
        const promise = new Promise((resolve)=>{
            client.index({
                index: process.env.IndexOfElasticsearchAPIforAuthentication,
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
                              { "ApplicationName": [{"Name": applicationProjectName}] }    
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

    generateInitialProfile(loginType, otherAppID, otherAppName, otherAppEmail, applicationProjectName, customerNewIDSignZeroFill, ApplicationAdjunct) {

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
                index: process.env.IndexOfElasticsearchAPIforProfile,
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
                if (err) return err
                resolve(result)
                })
        })
        return promise
    }
}


module.exports = GenerateInitialServices