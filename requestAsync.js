'use strict';
let request = require('request');

module.exports = function requestAsync(settings){
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
};
