require('dotenv').config()
var MongoClient = require('mongodb').MongoClient
var url = process.env.MongoConfig
class loggerServices {
    logAuthentication(value) {
        MongoClient.connect(url, { useUnifiedTopology: true }, function(err, db) {
          if (err) throw err;
          var dbo = db.db("Logger");
          dbo.collection("AuthenticationLog").insertOne(value, function(err, res) {
            if (err) throw err;
            var datetime = new Date();
            datetime.setHours( datetime.getHours() );
            var data = {
                Status: "1 document inserted ",
                DateTime: datetime,
                LogTitle: value.LogTitle
            }
            console.log("timestamp: "+data.DateTime+" | log title: "+data.LogTitle+" | status: "+data.Status)
            db.close();
          });
        });
    }
}


module.exports = loggerServices