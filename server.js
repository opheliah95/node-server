const fs = require('fs')
const http = require('http')
const fsPromises = require('fs').promises;
const path = require('path')
const EventEmitter = require("events");
const logEvent = require('./logEvents')

class MyEmitter extends EventEmitter { };
const myEmitter = new MyEmitter();
const port = process.env.PORT || 3500;

const server = http.createServer((req, res) => {
    console.log(req.url, req.method)

}).listen(port, () => {
    console.log(`server running on ${port}`)
});

// myEmitter.on('log', (msg) => {
//     logEvent(msg);
// })

// setTimeout(() => {
//     myEmitter.emit('log', 'log event emitted')
// }, 60)