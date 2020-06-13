// Library Imports
require('dotenv').config()
var https = require('https')
var fs = require('fs')
var options = {
  key: fs.readFileSync("./certificate/Private key.key"),
  cert: fs.readFileSync("./certificate/Origin Certificate.crt")
}
const express = require('express')
const authServicesImports = require('./services/authentication/checkLogin')
const authoServicesImports = require('./services/authorization/generateCustomerProfileAndAuthFromOtherApp')
const generateInitialServicesImports = require('./services/authorization/generateInitialCustomerProfileAndAuthAllApp')
const registerAppServicesImports = require('./services/registration/SmartMeter/registerApp')
const checkRegisterAppServicesImports = require('./services/registration/SmartMeter/checkRegistration')
const registerInitialAppServicesImports = require('./services/registration/SmartMeter/registerInitialApp')
const validationActiveServicesImports = require('./services/verification/validationActiveSystem')
const updateApplicationNameServicesImports = require('./services/authorization/update/updateApplicationName')
const validationPasswordServicesImports = require('./services/verification/validationPasswordSystem')
const logServicesImports = require('./services/logging/logger')
const bodyParser = require('body-parser')
const port = process.env.Port 
var cors = require('cors')
// App Using From Library
var app = express()
app.use(cors())
app.set('view engine', 'ejs')
app.use(bodyParser.json())
// app.listen(port, () => {
//   console.log(`Server listening on port ${port}`);
//   });

var authServices = new authServicesImports()
var authoServices = new authoServicesImports()
var generateInitialServices = new generateInitialServicesImports()
var registerAppServices = new registerAppServicesImports()
var checkRegisterAppServices = new checkRegisterAppServicesImports()
var registerInitialAppServices = new registerInitialAppServicesImports()
var validationActiveServices = new validationActiveServicesImports()
var updateApplicationNameServices = new updateApplicationNameServicesImports()
var validationPasswordServices = new validationPasswordServicesImports()
var logServices = new logServicesImports()
// ########################################## //


app.post('/api/v1.0/login', (req, res) => {
    // console.log(req.body)
    var LoginType = req.body.LoginType
    switch(LoginType) {
      case "Zorka":
        var CustomerEmail = req.body.CustomerEmail
        var Password = req.body.CustomerPassword
        var ApplicationName = req.body.ApplicationName
        let buffNew = Buffer.from(Password)  
        let CustomerPassword = buffNew.toString('base64');
        var datetime = new Date();
        datetime.setHours( datetime.getHours() +7 );
        authServices.checkLoginZorka(CustomerEmail, CustomerPassword, ApplicationName).then(rs=>{

        if(rs[0] == 200) {
          var loggerLogin = { 
            LogTitle: "Login",
            AppType: LoginType,
            AppName: ApplicationName,
            CustomerEmail: CustomerEmail,
            LoginStatus: "Successesful",
            TimeStamp: datetime
          }

        
          var bodyResponse200 = { LoginType: LoginType, CustomerEmail: CustomerEmail, ResponseStatus: 200, CustomerID: rs[1] }
          console.log(loggerLogin)
          logServices.logAuthentication(loggerLogin)
          res.status(200).send(JSON.stringify(bodyResponse200))
        } 
        else if(rs == 201) {
          var loggerLogin = { 
            LogTitle: "Login",
            LoginType: LoginType,
            ApplicationName: ApplicationName,
            CustomerEmail: CustomerEmail,
            Result: { LoginStatus: "No Successesful", Reason:"Wrong Password !!"},
            TimeStamp: datetime
          }
          var bodyResponse201 = { LoginType: LoginType, CustomerEmail: CustomerEmail, ResponseStatus: 401, Reason: "Account Invalid" }
          console.log(loggerLogin)
          logServices.logAuthentication(loggerLogin)
          res.status(200).send(JSON.stringify(bodyResponse201))
        }
        else if(rs[0] == 401)  {

          var loggerLogin = { 
            LogTitle: "Login",
            LoginType: LoginType,
            ApplicationName: ApplicationName,
            CustomerEmail: CustomerEmail,
            Result: { LoginStatus: "No Successesful", Reason: rs[2]},
            TimeStamp: datetime
          }
          var bodyResponse401 = { LoginType: LoginType, CustomerEmail: CustomerEmail, ResponseStatus: 401, Reason: rs[2] }
          console.log(loggerLogin)
          logServices.logAuthentication(loggerLogin)
          res.status(200).send(JSON.stringify(bodyResponse401))
        }

        else if(rs == 404) {

          var loggerLogin = { 
            LogTitle: "Login",
            LoginType: LoginType,
            ApplicationName: ApplicationName,
            CustomerEmail: CustomerEmail,
            Result: { LoginStatus: "No Successesful", Reason: "Account Invalid"},
            TimeStamp: datetime
          }

          var bodyResponse404 = { LoginType: LoginType, CustomerEmail: CustomerEmail, ResponseStatus: 401, Reason: "Account Invalid" }
          console.log(loggerLogin)
          logServices.logAuthentication(loggerLogin)
          res.status(200).send(JSON.stringify(bodyResponse404))
        }
        
        })
        break
      case "Facebook":
        var FacebookID = req.body.FacebookID
        var FacebookName = req.body.FacebookName
        var FacebookEmail = req.body.FacebookEmail
        var ApplicationName = req.body.ApplicationName
        var ApplicationAdjunct = req.body.ApplicationAdjunct
        authServices.checkLoginFacebook(FacebookID).then(rs=>{
        var resultResponse = rs[0]
        var resultCustomerID = rs[1]
        var resulterrorComment = rs[2]
        var bodyResponse = { LoginType: LoginType, FacebookID:FacebookID, FacebookName: FacebookName, CustomerID: resultCustomerID }
        
        if(resultResponse == 200) { 
          var datetime = new Date();
          datetime.setHours( datetime.getHours() + 7 )


          var loggerLogin = { 
            LogTitle: "Login",
            AppType: LoginType,
            AppName: ApplicationName,
            AppID: FacebookID,
            AppEmail: FacebookEmail,
            Result: "Successesful",
            TimeStamp: datetime
          }
          
          console.log(loggerLogin)
          logServices.logAuthentication(loggerLogin)
          updateApplicationNameServices.updateApplicationFunction(resultCustomerID, ApplicationName, ApplicationAdjunct).then(responseUpdate => {
            var resultUpdateAuth = responseUpdate[0]
            var resultUpdateProfile = responseUpdate[1]
            var responseOfUpdateStatus = responseUpdate[2]
            if(responseOfUpdateStatus == 201) {
            var loggerUpdate = { 
              LogType: "Update",
              AppType: LoginType,
              AppName: ApplicationName,
              AppAdjunct, ApplicationAdjunct,
              AppID: FacebookID,
              AppEmail: FacebookEmail,
              Result: {Auth: resultUpdateAuth, Profile: resultUpdateProfile},
              TimeStamp: datetime
            }
            console.log(loggerUpdate)
            logServices.logAuthentication(loggerUpdate)
          }
          else if(responseOfUpdateStatus == 400) {

            var loggerUpdate = { 
              LogType: "Update",
              AppType: LoginType,
              AppName: ApplicationName,
              AppAdjunct, ApplicationAdjunct,
              AppID: FacebookID,
              AppEmail: FacebookEmail,
              Result: {Auth: resultUpdateAuth, Profile: resultUpdateProfile, Status: "error"},
              TimeStamp: datetime
            }

            console.log(loggerUpdate)
            logServices.logAuthentication(loggerUpdate)
          }
          })
          res.status(200).send(JSON.stringify(bodyResponse)) 
        }
        else if(resultResponse == 401) {

          var datetime = new Date();
          datetime.setHours( datetime.getHours() +7  );

          var loggerLogin = { 
            LogTitle: "Login",
            AppType: LoginType,
            AppName: ApplicationName,
            AppID: FacebookID,
            AppEmail: FacebookEmail,
            Result: resulterrorComment,
            TimeStamp: datetime
          }
          
          console.log(loggerLogin)
          logServices.logAuthentication(loggerLogin)
          res.status(400).send(resulterrorComment) 
        }
        // When account in system not yet then create 
        else if (rs == 201){
          authoServices.generatorCustomer(LoginType, FacebookID, FacebookName, FacebookEmail, ApplicationName, ApplicationAdjunct).then(responseGenerate =>{
            var customerID = responseGenerate[0]
            var resultAuth = responseGenerate[1]
            var resultProfile = responseGenerate[2]
            var datetime = new Date();
            datetime.setHours( datetime.getHours() +7  )


            var loggerGenerateAccount = { 
              LogTitle: "Registration",
              AppType: LoginType,
              AppName: ApplicationName,
              CustomerID: customerID,
              AppID: FacebookID,
              AppEmail: FacebookEmail,
              Result: { Auth: resultAuth, Profile: resultProfile},
              TimeStamp: datetime
            }
            console.log(loggerGenerateAccount)
            logServices.logAuthentication(loggerGenerateAccount)
            res.status(200).send(JSON.stringify(bodyResponse))
        })
        }
        else if (rs == 404) {
          generateInitialServices.generatorInitialCustomer(LoginType, FacebookID, FacebookName, FacebookEmail, ApplicationName, ApplicationAdjunct).then(responseGenerateInitial => {
            var customerID = responseGenerateInitial[0]
            var resultAuth = responseGenerateInitial[1]
            var resultProfile = responseGenerateInitial[2]
            var datetime = new Date();
            datetime.setHours( datetime.getHours() +7 );

            var loggerGenerateAccount = { 
              LogTitle: "Registration",
              AppType: LoginType,
              AppName: ApplicationName,
              CustomerID: customerID,
              AppID: FacebookID,
              AppEmail: FacebookEmail,
              Result: { Auth: resultAuth, Profile: resultProfile},
              TimeStamp: datetime
            }

            console.log(loggerGenerateAccount)
            logServices.logAuthentication(loggerGenerateAccount)
            res.status(200).send(JSON.stringify(bodyResponse))
        })
          
        }
        })
        break
      case "Google":
        var GoogleID = req.body.GoogleID
        var GoogleName = req.body.GoogleName
        var GoogleEmail = req.body.GoogleEmail
        var ApplicationName = req.body.ApplicationName
        var ApplicationAdjunct = req.body.ApplicationAdjunct
        authServices.checkLoginGoogle(GoogleID).then(rs=>{
        var resultResponse = rs[0]
        var resultCustomerID = rs[1]
        var resulterrorComment = rs[2]
        var bodyResponse = { LoginType: LoginType, GoogleID:GoogleID, GoogleName: GoogleName, CustomerID: resultCustomerID}
        
        if(resultResponse == 200) { 
          var datetime = new Date();
          datetime.setHours( datetime.getHours() +7  );

          var loggerLogin = { 
            LogTitle: "Login",
            AppType: LoginType,
            AppName: ApplicationName,
            AppID: GoogleID,
            AppEmail: GoogleEmail,
            Result: "Successesful",
            TimeStamp: datetime
          }
          
          console.log(loggerLogin)
          logServices.logAuthentication(loggerLogin)
          updateApplicationNameServices.updateApplicationFunction(resultCustomerID, ApplicationName, ApplicationAdjunct).then(responseUpdate => {
            var resultUpdateAuth = responseUpdate[0]
            var resultUpdateProfile = responseUpdate[1]
            var responseOfUpdateStatus = responseUpdate[2]
            if(responseOfUpdateStatus == 201) {

            var loggerUpdate = { 
              LogType: "Update",
              AppType: LoginType,
              AppName: ApplicationName,
              AppAdjunct, ApplicationAdjunct,
              AppID: GoogleID,
              AppEmail: GoogleEmail,
              Result: {Auth: resultUpdateAuth, Profile: resultUpdateProfile},
              TimeStamp: datetime
            }
            console.log(loggerUpdate)
            logServices.logAuthentication(loggerUpdate)
          }
          else if(responseOfUpdateStatus == 400) {

            var loggerUpdate = { 
              LogType: "Update",
              AppType: LoginType,
              AppName: ApplicationName,
              AppAdjunct, ApplicationAdjunct,
              AppID: GoogleID,
              AppEmail: GoogleEmail,
              Result: {Auth: resultUpdateAuth, Profile: resultUpdateProfile, Status: "error"},
              TimeStamp: datetime
            }
            console.log(loggerUpdate)
            logServices.logAuthentication(loggerUpdate)
          }
          })
          res.status(200).send(JSON.stringify(bodyResponse)) 
        }
        else if(resultResponse == 401) {

          var datetime = new Date();
          datetime.setHours( datetime.getHours() +7  );

          var loggerLogin = { 
            LogTitle: "Login",
            AppType: LoginType,
            AppName: ApplicationName,
            AppID: GoogleID,
            AppEmail: GoogleEmail,
            Result: resulterrorComment,
            TimeStamp: datetime
          }
          
          
          console.log(loggerLogin)
          logServices.logAuthentication(loggerLogin)
          res.status(400).send(resulterrorComment) 
        }
        else if (rs == 201){
          authoServices.generatorCustomer(LoginType, GoogleID, GoogleName, GoogleEmail, ApplicationName, ApplicationAdjunct).then(responseGenerate =>{
            var customerID = responseGenerate[0]
            var resultAuth = responseGenerate[1]
            var resultProfile = responseGenerate[2]
            var datetime = new Date();
            datetime.setHours( datetime.getHours() +7  )
            var loggerGenerateAccount = { 
              LogTitle: "Registration",
              AppType: LoginType,
              AppName: ApplicationName,
              CustomerID: customerID,
              AppID: GoogleID,
              AppEmail: GoogleEmail,
              Result: { Auth: resultAuth, Profile: resultProfile},
              TimeStamp: datetime
            }

            console.log(loggerGenerateAccount)
            logServices.logAuthentication(loggerGenerateAccount)
            res.status(200).send(JSON.stringify(bodyResponse))
        })
        }
        else if (rs == 404) {
          generateInitialServices.generatorInitialCustomer(LoginType, GoogleID, GoogleName, GoogleEmail, ApplicationName, ApplicationAdjunct).then(responseGenerateInitial => {
            var customerID = responseGenerateInitial[0]
            var resultAuth = responseGenerateInitial[1]
            var resultProfile = responseGenerateInitial[2]
            var datetime = new Date();
            datetime.setHours( datetime.getHours() +7 );
            var loggerGenerateAccount = { 
              LogTitle: "Registration",
              AppType: LoginType,
              AppName: ApplicationName,
              CustomerID: customerID,
              AppID: GoogleID,
              AppEmail: GoogleEmail,
              Result: { Auth: resultAuth, Profile: resultProfile},
              TimeStamp: datetime
            }
            console.log(loggerGenerateAccount)
            logServices.logAuthentication(loggerGenerateAccount)
            res.status(200).send(JSON.stringify(bodyResponse))
        })
          
        }
        })
        break
      case "Twitter":
        var TwitterID = req.body.TwitterID
        var TwitterName = req.body.TwitterName
        var TwitterEmail = req.body.TwitterEmail
        var ApplicationName = req.body.ApplicationName
        var ApplicationAdjunct = req.body.ApplicationAdjunct
        authServices.checkLoginTwitter(TwitterID).then(rs=>{
        var resultResponse = rs[0]
        var resultCustomerID = rs[1]
        var resulterrorComment = rs[2]
        var bodyResponse = { LoginType: LoginType, TwitterID:TwitterID, TwitterName: TwitterName, CustomerID: resultCustomerID }
        
        if(resultResponse == 200) { 
          var datetime = new Date();
          datetime.setHours( datetime.getHours() +7  )

          
          var loggerLogin = { 
            LogTitle: "Login",
            AppType: LoginType,
            AppName: ApplicationName,
            AppID: TwitterID,
            AppEmail: TwitterEmail,
            Result: "Successesful",
            TimeStamp: datetime
          }
          console.log(loggerLogin)
          logServices.logAuthentication(loggerLogin)
          updateApplicationNameServices.updateApplicationFunction(resultCustomerID, ApplicationName, ApplicationAdjunct).then(responseUpdate => {
            var resultUpdateAuth = responseUpdate[0]
            var resultUpdateProfile = responseUpdate[1]
            var responseOfUpdateStatus = responseUpdate[2]
            if(responseOfUpdateStatus == 201) {

            var loggerUpdate = { 
              LogType: "Update",
              AppType: LoginType,
              AppName: ApplicationName,
              AppAdjunct, ApplicationAdjunct,
              AppID: TwitterID,
              AppEmail: TwitterEmail,
              Result: {Auth: resultUpdateAuth, Profile: resultUpdateProfile},
              TimeStamp: datetime
            }
            console.log(loggerUpdate)
            logServices.logAuthentication(loggerUpdate)
          }
          else if(responseOfUpdateStatus == 400) {
            var loggerUpdate = { 
              LogType: "Update",
              AppType: LoginType,
              AppName: ApplicationName,
              AppAdjunct, ApplicationAdjunct,
              AppID: TwitterID,
              AppEmail: TwitterEmail,
              Result: {Auth: resultUpdateAuth, Profile: resultUpdateProfile, Status: "error"},
              TimeStamp: datetime
            }
            console.log(loggerUpdate)
            logServices.logAuthentication(loggerUpdate)
          }
          })
          res.status(200).send(JSON.stringify(bodyResponse)) 
        }
        else if(resultResponse == 401) {

          var datetime = new Date();
          datetime.setHours( datetime.getHours() +7  );

          var loggerLogin = { 
            LogTitle: "Login",
            AppType: LoginType,
            AppName: ApplicationName,
            AppID: TwitterID,
            AppEmail: TwitterEmail,
            Result: resulterrorComment,
            TimeStamp: datetime
          }
          

          console.log(loggerLogin)
          logServices.logAuthentication(loggerLogin)
          res.status(400).send(resulterrorComment) 
        }
        else if (rs == 201){
          authoServices.generatorCustomer(LoginType, TwitterID, TwitterName, TwitterEmail, ApplicationName, ApplicationAdjunct).then(responseGenerate =>{
            var customerID = responseGenerate[0]
            var resultAuth = responseGenerate[1]
            var resultProfile = responseGenerate[2]
            var datetime = new Date();
            datetime.setHours( datetime.getHours() +7  )
            var loggerGenerateAccount = { 
              LogTitle: "Registration",
              AppType: LoginType,
              AppName: ApplicationName,
              CustomerID: customerID,
              AppID: TwitterID,
              AppEmail: TwitterEmail,
              Result: { Auth: resultAuth, Profile: resultProfile},
              TimeStamp: datetime
            }
            console.log(loggerGenerateAccount)
            logServices.logAuthentication(loggerGenerateAccount)
            res.status(200).send(JSON.stringify(bodyResponse))
        })
        }
        else if (rs == 404) {
          generateInitialServices.generatorInitialCustomer(LoginType, TwitterID, TwitterName, TwitterEmail, ApplicationName, ApplicationAdjunct).then(responseGenerateInitial => {
            var customerID = responseGenerateInitial[0]
            var resultAuth = responseGenerateInitial[1]
            var resultProfile = responseGenerateInitial[2]
            var datetime = new Date();
            datetime.setHours( datetime.getHours() +7  )
            var loggerGenerateAccount = { 
              LogTitle: "Registration",
              AppType: LoginType,
              AppName: ApplicationName,
              CustomerID: customerID,
              AppID: TwitterID,
              AppEmail: TwitterEmail,
              Result: { Auth: resultAuth, Profile: resultProfile},
              TimeStamp: datetime
            }
            console.log(loggerGenerateAccount)
            logServices.logAuthentication(loggerGenerateAccount)
            res.status(200).send(JSON.stringify(bodyResponse))
        })
          
        }
        })
        break
      default:
        var loggerLogin = { 
          LogTitle: "Login",
          AppType: "None",
          AppName: ApplicationName,
          CustomerEmail: CustomerEmail,
          Result: "Bad Request",
          TimeStamp: datetime
        }
        logServices.logAuthentication(loggerLogin)
        res.status(400).send("Bad Request")
        break
    }


})

app.post('/api/v1.0/register', (req, res) => {
  var body = req.body
  var ApplicationName = req.body.ApplicationName
  var CustomerEmail = req.body.CustomerEmail
    // SmartMeter Registration
  checkRegisterAppServices.checkRegistration(CustomerEmail, ApplicationName).then(rs => {
    var bodyResponse = { 
      ApplicationName: ApplicationName, 
      CustomerEmail: CustomerEmail,
      ResponseStatus: 401
    }
    if(rs == 200) { 
      var datetime = new Date();
      datetime.setHours( datetime.getHours() +7 );
      var loggerRegistration = { 
        LogTitle: "Registration",
        AppType: "Zorka",
        CustomerEmail: CustomerEmail,
        AppName: ApplicationName,
        Result: "Has been account in system",
        TimeStamp: datetime
      }
      console.log(loggerRegistration)
      logServices.logAuthentication(loggerRegistration)
      res.status(200).send(JSON.stringify(bodyResponse)) 
    }
    else if (rs == 401){

      registerAppServices.generatorCustomer(body).then(responseGenerate =>{
        var customerID = responseGenerate[0]
        var resultAuth = responseGenerate[1]
        var resultProfile = responseGenerate[2]
        var datetime = new Date();
        datetime.setHours( datetime.getHours() +7  );
        var bodyResponse401 = { 
          ApplicationName: ApplicationName, 
          CustomerEmail: CustomerEmail,
          CreateStatus: "Waiting Verify on Email " + CustomerEmail,
          ResponseStatus: 201
        }

        var loggerGenerateAccount = { 
          LogTitle: "Registration",
          AppType: "Zorka",
          AppName: ApplicationName,
          CustomerID: customerID,
          CustomerEmail: CustomerEmail,
          Result: {Auth: resultAuth, Profile: resultProfile, Status: "Waiting Verify on Email " + CustomerEmail},
          TimeStamp: datetime
        }

        console.log(loggerGenerateAccount)
        logServices.logAuthentication(loggerGenerateAccount)
        res.status(200).send(JSON.stringify(bodyResponse401))
    })
    }
    else if (rs == 404) {
      registerInitialAppServices.generatorInitialCustomer(body).then(responseGenerateInitial => {
        var customerID = responseGenerateInitial[0]
        var resultAuth = responseGenerateInitial[1]
        var resultProfile = responseGenerateInitial[2]
        var datetime = new Date();
        datetime.setHours( datetime.getHours() +7 );
        var loggerGenerateAccount = { 
          LogTitle: "Registration",
          AppType: "Zorka",
          AppName: ApplicationName,
          CustomerID: customerID,
          CustomerEmail: CustomerEmail,
          Result: {Auth: resultAuth, Profile: resultProfile, Status: "Waiting Verify on Email " + CustomerEmail},
          TimeStamp: datetime
        }

        var bodyResponse404 = { 
          ApplicationName: ApplicationName, 
          CustomerEmail: CustomerEmail,
          CreateStatus: "Waiting Verify on Email " + CustomerEmail,
          ResponseStatus: 201
        }
        console.log(loggerGenerateAccount)
        logServices.logAuthentication(loggerGenerateAccount)
        res.status(200).send(JSON.stringify(bodyResponse404))
    })
      
    }
    else {
      var datetime = new Date();
      datetime.setHours( datetime.getHours()+7  );
      var loggerGenerateAccount = { 
        LogTitle: "Registration",
        AppType: "Zorka",
        AppName: ApplicationName,
        CustomerEmail: CustomerEmail,
        Result: "Bad Request",
        TimeStamp: datetime
      }
      console.log(loggerGenerateAccount)
      logServices.logAuthentication(loggerGenerateAccount)
      res.status(400).send("Bad Request")
    } 
    //////////////////////////////////////////////////////////
  })

})

app.post('/api/v1.0/verify', (req, res) => {
  // console.log(req)
  var body = req.body
  validationActiveServices.verifyCustomer(body).then(rs => {
    var ApplicationName = rs[0]
    var CustomerEmail = rs[1]
    var resultOfHash = rs[2]
    var urlByApp = rs[3]
    var info = rs[4]

    var loggerVerify = {
      LogTitle: "Validation",
      AppName: ApplicationName,
      CustomerEmail: CustomerEmail,
      Url: urlByApp,
      Hash: resultOfHash,
      Info: info
    }
    console.log(loggerVerify)
    logServices.logAuthentication(loggerVerify)
    res.status(200)
  })

})

app.get('/api/v1.0/result/template/verification', (req, res) => {
  res.render('validationSuccess')
})

app.post('/api/v1.0/validation/account', cors(), (req, res) => {
  var body = req.body
  var appName = body.appName
  var customerEmail = body.customerEmail
  var hash = body.hash
  // console.log(body)
  validationActiveServices.updateValidation(body).then(rs => {
    var loggerVerify = {
      LogTitle: "Validation",
      AppName: appName,
      CustomerEmail: customerEmail,
      Hash: hash,
      Result: rs
    }
    console.log(loggerVerify)
    logServices.logAuthentication(loggerVerify)
    res.send(rs)
  })

  
})


// app.get('/api/v1.0/result/template/changepassword', (req, res) => {
//   res.render('validationChangePassword')
// })
// app.post('/api/v1.0/changepassword', (req, res) => {
//   var body = req.body
//   validationPasswordServices.updatePassword(body).then(rs => {
//     console.log(rs)
//     res.send(rs)
//   })

// })
// app.post('/api/v1.0/validation/changepassword', (req, res) => {
//   var body = req.body
//   validationPasswordServices.updateValidationChangePassword(body).then(rs => {
//     console.log(rs)
//     res.send(rs)
//   })

  
// })

https.createServer(options, app, function (req, res) {
  res.writeHead(200);
 }).listen(port, function() {
  console.log(`Server listening on port ${port}`); // The server object listens on port 3000
})
