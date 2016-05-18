'use strict';
let requestAsync = require('./requestAsync');
let _ = require('lodash');
let config = require('./config.json');

let user = config.user;
let token = config.token;
let repos = config.repos;

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
    let model = _
      .chain(responses)
      .map((response) => {
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
          .thru((groups) => {
            return _.zipWith(_.keys(groups), _.values(groups), (milestone, pullRequests) => {
              return {
                'milestone' : milestone,
                'pullRequests' : pullRequests
              }
            });
          })
          .sortBy('milestone')
          .value();
        // Return formated pull requests of each repo
        return groups
      })
      .zipWith(repos, function(milestones,repo){
        return {
          'repo' : repo,
          'milestones' : milestones
        };
      })
      .value();
    return model;
  })
  .catch((error) => {throw error})
  .then((result) => {console.log(result);})
