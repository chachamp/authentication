require('dotenv').config()
const { Client } = require('@elastic/elasticsearch')
const client = new Client({ node: process.env.ElastisearchConfig })
class UpdateApplicationServices {
    updateApplicationFunction(resultCustomerID, ApplicationName, ApplicationAdjunct) {
        const promise = new Promise((resolve, reject)=>{     
            var resultUpdateCustomerAuthorization = this.updateCustomerAuthentication(resultCustomerID, ApplicationName, ApplicationAdjunct)
            var resultUpdateCustomerProfile = this.updateCustomerProfile(resultCustomerID, ApplicationName, ApplicationAdjunct)
            Promise.all([resultUpdateCustomerAuthorization, resultUpdateCustomerProfile]).then(res =>{
                var resultList = []
                var resultUpdateCustomerAuthorization = res[0]
                var resultUpdateCustomerProfile = res[1]
                if(resultUpdateCustomerAuthorization == "exists" && resultUpdateCustomerProfile == "exists") var responseOfUpdateStatus = 200
                else if(resultUpdateCustomerAuthorization == "updated" && resultUpdateCustomerProfile == "updated") var responseOfUpdateStatus = 201
                else var responseOfUpdateStatus = 400
                resultList.push(resultUpdateCustomerAuthorization)
                resultList.push(resultUpdateCustomerProfile)
                resultList.push(responseOfUpdateStatus)
                resolve(resultList)
            })
        }) 
        return promise
    }
    updateCustomerAuthentication(resultCustomerID, ApplicationName) {
        const promise = new Promise((resolve)=>{   
            var resultCheckApplicationNameExistAuthentication = this.checkApplicationNameExistAuthentication(resultCustomerID, ApplicationName)

            resolve(resultCheckApplicationNameExistAuthentication)
        })
        
        return promise
    
    }
    checkApplicationNameExistAuthentication(resultCustomerID, ApplicationName) {
        const promise = new Promise((resolve)=>{
            client.search({
                index: process.env.IndexOfElasticsearchAPIforAuthentication,
                body: {
                    "query": {
                        "bool": {
                        "must": [
                            {
                            "match": {
                                "CustomerID": resultCustomerID
                            }
                            
                            }
                        ]
                        }
                    }
                }
                }, (err, result) => {
                    
                    var resultAppName = result.body.hits.hits[0]._source.CustomerAuthorization.ApplicationList.ApplicationName
                    
                    var list = []
                    for(var i = 0;i<resultAppName.length;i++) {
                        list.push(resultAppName[i].Name)
                    }
                    var resultOfCheckExists = list.includes(ApplicationName)
                    // Case Check List Have
                    if(resultOfCheckExists === true) {
                        var resultDetailsAuthentication = 'exists'
                        resolve(resultDetailsAuthentication)
                    }
                    if(resultOfCheckExists === false) {
                        
                        var resultList = result.body.hits.hits[0]._source.CustomerAuthorization.ApplicationList.ApplicationName
                        var resultNew = ApplicationName
                        var resultfFromNew  = {"Name": resultNew}
                        resultList.push(resultfFromNew)
                        var CustomerEmail = result.body.hits.hits[0]._source.CustomerType[0].Zorka[0].CustomerEmail
                        var CustomerPassword = result.body.hits.hits[0]._source.CustomerType[0].Zorka[1].CustomerPassword
                        var CustomerLoginBy = result.body.hits.hits[0]._source.CustomerLoginBy
                        var CustomerStatus = result.body.hits.hits[0]._source.CustomerStatus
                        var CustomerCreateOn = result.body.hits.hits[0]._source.CustomerCreateOn
                        this.getUpdateAuthentication(resultCustomerID, CustomerEmail, CustomerPassword, CustomerLoginBy, resultList, CustomerStatus, CustomerCreateOn).then(rs => {
                            resolve(rs)
                        })
                
                    }
              
                })
        })
        return promise
    }
    getUpdateAuthentication(resultCustomerID, CustomerEmail, CustomerPassword, CustomerLoginBy, resultList, CustomerStatus, CustomerCreateOn) {
        var datetime = new Date()
        datetime.setHours( datetime.getHours() + 7 )
        const promise = new Promise((resolve)=>{
            client.index({
                index:  process.env.IndexOfElasticsearchAPIforAuthentication,
                id: resultCustomerID,
                body: {
                        "CustomerID": resultCustomerID,
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
                            resultList
                        }   
                          },
                        "CustomerStatus": CustomerStatus,
                        "CustomerCreateOn": CustomerCreateOn,
                        "CustomerUpdateOn": datetime
                }
                }, (err, result) => {
                if (err) return err
                resolve(result.body.result)
                })
        })
        return promise
    }
    updateCustomerProfile(resultCustomerID, ApplicationName, ApplicationAdjunct) {
        const promise = new Promise((resolve, reject)=>{   
            var resultGetFromUpdateProfile = this.checkApplicationNameExistProfile(resultCustomerID, ApplicationName, ApplicationAdjunct)
            resolve(resultGetFromUpdateProfile)
        })
        
        return promise
 
    }
    checkApplicationNameExistProfile(resultCustomerID, ApplicationName, ApplicationAdjunct) {
        const promise = new Promise((resolve)=>{
            client.search({
                index: process.env.IndexOfElasticsearchAPIforProfile,
                body: {
                    "query": {
                        "bool": {
                        "must": [
                            {
                            "match": {
                                "CustomerID": resultCustomerID
                            }
                            
                            }
                        ]
                        }
                    }
                }
                }, (err, result) => {
                    
                    var resultAppName = result.body.hits.hits[0]._source.CustomerAdjunct.ApplicationList.ApplicationName
                    
                    var list = []
                    for(var i = 0;i<resultAppName.length;i++) {
                        list.push(resultAppName[i].Name)
                   
                    }
                    
                    var resultOfCheckExists = list.includes(ApplicationName)
                    // resolve(resultOfCheckExists)
                    // // Case Check List Have
                    if(resultOfCheckExists === true) {
                        var resultDetailsAuthentication = 'exists'
                        resolve(resultDetailsAuthentication)
                    }
                    if(resultOfCheckExists === false) {
                        
                        var resultList = result.body.hits.hits[0]._source.CustomerAdjunct.ApplicationList.ApplicationName
                        var resultNew = ApplicationName
                        var resultfFromNew  = {"Name": resultNew, ApplicationStatus: 'Active'}
                        // resultfFromNew.add(ApplicationName);
                        var newSet = { ...resultfFromNew, ...ApplicationAdjunct}
                        resultList.push(newSet)
                        // resolve(resultList)
                        var CustomerTitle = result.body.hits.hits[0]._source.CustomerTitle
                        var CustomerFirstName = result.body.hits.hits[0]._source.CustomerFirstName
                        var CustomerLastName = result.body.hits.hits[0]._source.CustomerLastName
                        var CustomerBirthday = result.body.hits.hits[0]._source.CustomerBirthday
                        var CustomerGender = result.body.hits.hits[0]._source.CustomerGender
                        var CustomerTelephone = result.body.hits.hits[0]._source.CustomerTelephone
                        var CustomerCreateOn = result.body.hits.hits[0]._source.CustomerCreateOn
                        var CustomerEmail = result.body.hits.hits[0]._source.CustomerEmail
                        var Facebook = result.body.hits.hits[0]._source.Facebook
                        var Google = result.body.hits.hits[0]._source.Google
                        var Twitter = result.body.hits.hits[0]._source.Twitter
                        this.getFromUpdateProfile(resultCustomerID, CustomerTitle, CustomerFirstName, CustomerLastName, CustomerBirthday, CustomerGender, CustomerTelephone, CustomerEmail, Facebook, Google, Twitter, resultList, CustomerCreateOn).then(rs => {
                            resolve(rs)
                        })
                
                    }
              
                })
        })
        return promise
    }
    getFromUpdateProfile(resultCustomerID, CustomerTitle, CustomerFirstName, CustomerLastName, CustomerBirthday, CustomerGender, CustomerTelephone, CustomerEmail, Facebook, Google, Twitter, resultList, CustomerCreateOn) {
        var datetime = new Date()
        datetime.setHours( datetime.getHours() + 7 )
        const promise = new Promise((resolve)=>{
            client.index({
                index: process.env.IndexOfElasticsearchAPIforProfile,
                id: resultCustomerID,
                body: {
                "CustomerID": resultCustomerID,
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
                        "ApplicationName": resultList
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
}


module.exports = UpdateApplicationServices