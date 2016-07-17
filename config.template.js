// Rename this to config.js after set up
module.exports = {
    "user": "your github user name",
    "token": "****************************************",
    "repos": [
      "user-name/repo-name",
      "another-user-name/another-repo-name"
    ],
    filter: function(repo){
      // For the repo data structure,
      // please refer to https://developer.github.com/v3/pulls/#list-pull-requests
      // `repo` is an object in the array
      return true;
    }
}
