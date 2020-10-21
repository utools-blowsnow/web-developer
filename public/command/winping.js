'use strict';

const Process = require('./process');

class Winping extends Process {
  constructor() {
    super('ping', []);
  }

  parseDestination(data) {
    console.log(data);
    let result = null;

    return result;
  }

  parseHop(hopData) {
    console.log(hopData);
    let result = null;

    return result;
  }
}

module.exports = Winping;
