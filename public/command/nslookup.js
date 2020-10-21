'use strict';

const Process = require('./process');

class Nslookup extends Process {
  constructor() {
    super('nslookup', []);
  }

  parseDestination(data) {
    let result = null;

    return data;
  }

  parseHop(hopData) {
    let result = null;

    return hopData;
  }
}

module.exports = Nslookup;
