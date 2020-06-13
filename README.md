# Authentication System - With Social Login and System Login

# Highlight
- Login with Zorka, Facebook, Google and Twitter
- Script develop by Node.js
- Database for authenticate is Elasticsearch
- Database for tracking error is MongoDB

# Feature
- Register system
- Validation system
- Login system
- Verify email system
- Change password system ( coming soon )

# Details
- Can look data structure of system in ZorkaAuthSpec-V.2.xlsx

# Architecture 
- Can look picture architect on directory -> Architecture

# How to use

## for install package of authentication system
Step 1) npm install

## Set up environment variable in file .env
Step 2) add value in file .env
- [HOST_IP_ADDRESS_FOR_VERIFY] = When client verify by email, redirect on website result of verify 
- [HOST_IP_ELASTICSEARCH] = IP Address of elasticsearch
- [MONGO_USER] = User of mongoDB
- [MONGO_PASSWORD] = Password of mongoDB
- [MONGO_HOST_IP] = IP Address of mongoDB

## Set up ip address for requestor ( validationSuccess.ejs )
- [HOST_IP_ADDRESS_FOR_VERIFY] = When client verify by email, redirect on website result of verify 

## Set up ip address for change password ( validationChangePassword.ejs ) - COMING SOON


# Starting on nodemon
Step 3) npm run devStart 

# Test API ( requesterAPI.rest ) 

# How to deploy 
- Install docker engine on server 
- Install docker-compose on server

## CMD 
- docker build -t zorka-authentication:1.0 .
- docker-compose -f docker-compose-prod.yml up -d

# Using this system on host
Step 4) 0.0.0.0:5000 - *Let's start*

================================ Let's go =====================================




