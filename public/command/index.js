'use strict';

const os = require('os');

const tracert = require('./tracert');
const traceroute = require('./traceroute');

const winping = require('./winping');
const nslookup = require('./nslookup');


let tools = {
  nslookup: nslookup
};
if (os.platform() === 'win32'){
  tools = {
    ...tools,
    tracert: tracert,
    ping: winping
  }
}else{
  tools = {
      ...tools,
    tracert: traceroute
  }
}
module.exports = tools;

//clone https://github.com/zulhilmizainuddin/nodejs-traceroute
