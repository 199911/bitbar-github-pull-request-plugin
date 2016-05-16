#!/usr/local/bin/node
'use strict';
let request = require('request');
let _ = require('lodash');
let config = require('./config.json');

let user = config.user;
let token = config.token;

const owner = 'stepcase';
const repo = 'lifehack-core';


let url = 'https://api.github.com/repos/' + owner + '/' + repo + '/pulls';
console.log(url);
request.get(
  {
    'url' : url,
    'headers' : {
      'User-Agent' : 'Bitbar-Pull-Request'
    },
    'auth' : {
      'user' : config.user,
      'pass' : config.token,
      'sendImmediately': true
    }
  },
  function(error, response, body){
    let data = JSON.parse(body);
    let pullRequests = _
      .chain(data)
      .map((pullRequest)=>{
        return _.pick(pullRequest, 'milestone', 'assignee', 'html_url', 'title');
      })
      .map((pullRequest)=>{
        if (pullRequest.milestone) {
          pullRequest.milestone = pullRequest.milestone.title
        }
        if (pullRequest.assignee) {
          pullRequest.assignee = pullRequest.milestone.login
        }
        return pullRequest;
      })
      .value();
    console.log(pullRequests);
  }
);

