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
    // Groups of pull request with asignee or aurthor is user by milestone
    let groups = _
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
      .filter((pullRequest) => pullRequest.assignee == user || pullRequest.user == user)
      .groupBy('milestone')
      .value();
    let sortedGroups = _
      .chain(groups)
      .keys()
      .sort()
      .map((milestone) => _.pick(groups, milestone))
      .value();
    // to strings
    var string = _
      .chain(sortedGroups)
      .map((group)=>{
        let pair = [
          _.keys(group),
          _
            .chain(group)
            .map((pullRequests)=>{
              return _
                .chain(pullRequests)
                .map((pullRequest)=>{
                  return pullRequest.title + ' | href=' + pullRequest.html_url;
                })
                .value();
            })
            .join('\n')
            .value()
        ];
        return pair;
      })
      .flatten()
      .join('\n')
      .value();
    console.log(string);
    process.exit(0);
  }
);
