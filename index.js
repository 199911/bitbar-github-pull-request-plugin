#!/usr/local/bin/node
"use strict";
let request = require('request');
let config = require('./config.json');

let user = config.user;
let token = config.token;

const owner = "stepcase";
const repo = "lifehack-core";


let url = "https://"+user+":"+token+"@api.github.com/repos/" + owner + "/" + repo + "/pulls";
console.log(url);
request.get(
  {
    "url" : url,
    "headers" : {
      "User-Agent" : "Bitbar-Pull-Request"
    }
  },
  function(error, response, body){
    console.log(error);
    // console.log(response);
    console.log(body);
  }
);

