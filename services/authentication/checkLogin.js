require('dotenv').config()
const { Client } = require('@elastic/elasticsearch')
const client = new Client({ node: process.env.ElastisearchConfig })
class AuthServices {
    checkLoginZorka(CustomerEmail, CustomerPassword, ApplicationName) {
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
                              "CustomerType.Zorka.CustomerPassword": {"query" :CustomerPassword}
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
                                this.checkLoginZorkaActive(getCustomerID).then(rs => {
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
    checkLoginZorkaActive(getCustomerID) {
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
    checkLoginFacebook(FacebookID) {
        const promise = new Promise((resolve)=>{
            client.search({
                index: process.env.IndexOfElasticsearchAPIforProfile,
                body:  {
                    "query": {
                        "bool": {
                        "must": [
                            {
                            "match": { "Facebook.FacebookID": FacebookID }
                            }
                        ]
                        }
                    }
                }
                }, (err,result) => {
         
      
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
                                this.checkLoginFacebookActive(FacebookID).then(rs => {
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
    checkLoginFacebookActive(FacebookID) {
        const promise = new Promise((resolve)=>{
            client.search({
                index: process.env.IndexOfElasticsearchAPIforProfile,
                body:  {
                    "query": {
                        "bool": {
                        "must": [
                            {
                            "match": {
                                "Facebook.FacebookID": FacebookID
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
    checkLoginGoogle(GoogleID) {
        const promise = new Promise((resolve)=>{
            client.search({
                index: process.env.IndexOfElasticsearchAPIforProfile,
                body:  {
                    "query": {
                        "bool": {
                        "must": [
                            {
                            "match": { "Google.GoogleID": GoogleID }
                            }
                        ]
                        }
                    }
                }
                }, (err,result) => {
         
      
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
                                this.checkLoginGoogleActive(GoogleID).then(rs => {
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
    checkLoginGoogleActive(GoogleID) {
        const promise = new Promise((resolve)=>{
            client.search({
                index: process.env.IndexOfElasticsearchAPIforProfile,
                body:  {
                    "query": {
                        "bool": {
                        "must": [
                            {
                            "match": {
                                "Google.GoogleID": GoogleID
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
    checkLoginTwitter(TwitterID) {
        const promise = new Promise((resolve)=>{
            client.search({
                index: process.env.IndexOfElasticsearchAPIforProfile,
                body:  {
                    "query": {
                        "bool": {
                        "must": [
                            {
                            "match": { "Twitter.TwitterID": TwitterID }
                            }
                        ]
                        }
                    }
                }
                }, (err,result) => {
         
      
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
                                this.checkLoginTwitterActive(TwitterID).then(rs => {
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
    checkLoginTwitterActive(TwitterID) {
        const promise = new Promise((resolve)=>{
            client.search({
                index: process.env.IndexOfElasticsearchAPIforProfile,
                body:  {
                    "query": {
                        "bool": {
                        "must": [
                            {
                            "match": {
                                "Twitter.TwitterID": TwitterID
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
    getApplicationAuthentication(getCustomerID) {
        const promise = new Promise((resolve)=>{
            client.search({
                index: process.env.IndexOfElasticsearchAPIforAuthentication,
                body: {
                    "query": {
                        "bool": {
                        "must": [
                            {
                            "match": {
                                "CustomerID": getCustomerID
                            }                           
                            }
                        ]
                        }
                    }
                }
                }, (err, result) => {
                    var getApplicationAuthentication = result.body.hits.hits[0]._source.CustomerAuthorization.ApplicationList
                    resolve(getApplicationAuthentication)
                })
        })
        return promise
    }

    
}


module.exports = AuthServices