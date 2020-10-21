'use strict';

const spawn = require('child_process').spawn;
const events = require('events');
const readline = require('readline');
// const validator = require('validator');

class Process extends events.EventEmitter {
    constructor(command, args) {
        super();

        this.command = command;
        this.args = args;
    }

    kill(){
      spawn('kill', [this.pid]);
    }

    trace(params) {
      let newArgs = [...this.args];
      if (Array.isArray(params)){
        newArgs.push(...params);
      }else{
        newArgs.push(params);
      }
      console.log("spawn",this.command, newArgs);
        const process = spawn(this.command, newArgs);
        process.on('close', (code) => {
            this.emit('close', code);
        });

        this.pid = process.pid;
        this.emit('pid', process.pid);

        let isDestinationCaptured = false;
        if (process.pid) {
            readline.createInterface({
                    input: process.stdout,
                    terminal: false
                })
                .on('line', (line) => {
                    if (!isDestinationCaptured) {
                        const destination = this.parseDestination(line);
                        if (destination !== null) {
                            this.emit('destination', destination);

                            isDestinationCaptured = true;
                        }
                    }

                    const hop = this.parseHop(line);
                    if (hop !== null) {
                        this.emit('hop', hop);
                    }
                });
        }
    }

    isValidDomainName(domainName) {
        return true;
        // return validator.isFQDN(domainName + '') || validator.isIP(domainName + '');
    }

    parseDestination(data) {}
    parseHop(hopData) {}
}

module.exports = Process;
