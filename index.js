'use strict';
let request = require('request');
let _ = require('lodash');
let config = require('./config.json');

let user = config.user;
let token = config.token;

const owner = 'stepcase';
const repo = 'lifehack-core';


let url = 'https://api.github.com/repos/' + owner + '/' + repo + '/pulls';
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
    let milestoneGroups = _
      .chain(data)
      .map( (pullRequest) => _.pick(pullRequest, 'milestone', 'assignee', 'user', 'html_url', 'title') )
      .map( (pullRequest) => {
        if (pullRequest.milestone) {
          pullRequest.milestone = pullRequest.milestone.title;
        }
        if (pullRequest.assignee) {
          pullRequest.assignee = pullRequest.assignee.login;
        }
        if (pullRequest.user) {
          pullRequest.user = pullRequest.user.login;
        }
        return pullRequest;
      })
      .groupBy('milestone')
      .value();

    _
      .chain(milestoneGroups)
      .keys()
      .sort()
      .each( function (milestone) { 
        console.log(milestone);
        _
          .chain(milestoneGroups[milestone])
          .filter((pullRequest) => pullRequest.assignee == user || pullRequest.user == user)
          .each((pullRequest) => console.log(pullRequest.title + ' | href=' + pullRequest.html_url))
          .value();
      })
      .value();
    process.exit(0);
  }
);
