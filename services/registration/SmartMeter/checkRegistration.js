require('dotenv').config()
const { Client } = require('@elastic/elasticsearch')
const client = new Client({ node: process.env.ElastisearchConfig })
class registrationServices {
    checkRegistration(CustomerEmail, ApplicationName) {
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
                  if(result.body.status == 404) {
                    var response = 404
                    resolve(response)
                }
                else {
                    var totalValue = result.body.hits.total.value
                    if (totalValue != 0){
                        var response = 200
                        resolve(response)
                    } 
                    else if (totalValue == 0) {
                        var response = 401
                        resolve(response)
                    }
                }
                })
        })
        return promise
    }
}


module.exports = registrationServices