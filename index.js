'use strict';
let request = require('request');
let _ = require('lodash');
let config = require('./config.json');

let user = config.user;
let token = config.token;
let repos = config.repos;

function requestAsync(settings){
  return new Promise((resolve, reject) => {
    request(settings, (error, response, body) => {
      if (error) {
        reject(error);
      }
      let data = JSON.parse(body);
      if (response.statusCode != 200) {
        reject({
          'error' : response.statusCode,
          'response' : data
        });
      }
      resolve(data);
    });
  });
}

let promises = _
  .map(repos, (repo) => {
    return requestAsync({
      'method' : 'GET',
      'url' : 'https://api.github.com/repos/' + repo + '/pulls',
      'headers' : {
        'User-Agent' : 'Bitbar-Github-Pull-Request-Plugin'
      },
      'auth' : {
        'user' : config.user,
        'pass' : config.token,
        'sendImmediately': true
      }
    })
  });


Promise
  .all(promises)
  .then(function(responses) { 
    let model = _.map(responses, (response) => {
      let groups = _
        .chain(response)
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
      return _
        .chain(sortedGroups)
        .map((group)=>{
          return {
            'milestone' : _.keys(group),
            'pullRequests' : _.map(group, (pullRequests)=>{
              return _
                .chain(pullRequests)
                .map((pullRequest)=>{
                  return pullRequest.title + ' | href=' + pullRequest.html_url;
                })
                .value();
            })
          };
        })
        .value();
    })
    console.log(model);
  })
  .catch((error) => {throw error});
