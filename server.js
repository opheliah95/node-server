const fs = require('fs')
const http = require('http')
const fsPromises = require('fs').promises;
const path = require('path')
const EventEmitter = require("events");
const logEvent = require('./logEvents')

// emitter function
class MyEmitter extends EventEmitter { };
const myEmitter = new MyEmitter();
myEmitter.on("log", (msg, fileName) => {
    logEvent(msg, fileName)
})

const port = process.env.PORT || 3500;

const serveFile = async (filePath, contentType, response) => {
    try {
        const rawData = await fsPromises.readFile(filePath, 
            !contentType.includes("image")? "utf8" : ""
            );
        const data = contentType == "application/json" ?
            JSON.parse(rawData) : rawData;

        response.writeHead(
            !filePath.includes("404")?  404: 200,
            {'Content-Type' : contentType}
            )
        //console.log(`the data is ${rawData}`)
        response.end(
            contentType == 'application/json' ? JSON.stringify(data) : data);
    } catch (err) {
        console.log(err);
        response.statusCode = 500;
        myEmitter.emit('log', `${err.name}: ${err.message}`, 'errLog.txt');
        response.end();
    }
}

const server = http.createServer((req, res) => {
    console.log(req.url, req.method);
    myEmitter.emit('log', `${req.url}\t${req.method}`, 'reqLog.txt');

    const extension = path.extname(req.url);

    let contentType;

    switch (extension) {
        case '.css':
            contentType = 'text/css';
            break;
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.json':
            contentType = 'application/json';
            break;
        case '.jpg':
            contentType = 'image/jpeg';
            break;
        case '.png':
            contentType = 'image/png';
            break;
        case '.txt':
            contentType = 'text/plain';
            break;
        default:
            contentType = 'text/html';
    }
    console.log(`that is ${req.url.slice(-1)}`);
    let filePath =
        contentType === 'text/html' && req.url === '/'
            ? path.join(__dirname, 'views', 'index.html')
            : contentType === 'text/html' && req.url.slice(-1) === '/'
                ? path.join(__dirname, 'views', req.url, 'index.html')
                : contentType === 'text/html'
                    ? path.join(__dirname, 'views', req.url)
                    : path.join(__dirname, req.url);

    // makes .html extension not required in the browser
    if (!extension && req.url.slice(-1) !== '/') filePath += '.html';
    const fileExists = fs.existsSync(filePath);
    console.log(`the filepath is ${filePath}`)

    if (fileExists) {
        serveFile(filePath, contentType, res);
    } else {
        console.log("base for erro file: ", path.parse(filePath).base)
        switch (path.parse(filePath).base) {
            case 'old-page.html':
                res.writeHead(301, {
                    'Location': '/new-page.html'
                })
                res.end();
                break;
            case 'www-page.html':
                res.writeHead(301, {
                    'Location': '/',
                    'Content-Type': 'text/html'
                })
                res.end();
                break;
            default:
                serveFile(path.join(__dirname, "views", "404.html"), contentType, res)
                break;
        }


    }
});
server.listen(port, () => console.log(`Server running on port ${port}`));
