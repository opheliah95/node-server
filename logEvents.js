const {format} = require('date-fns')
const {v4: uuid} = require('uuid');
const fsPromise = require('fs').promises;
const fs = require('fs')
const path = require('path')

const logEvent = async (message, fileName) => {
    const dateTime = `${format(new Date(), 'MM/dd/yyyy\tHH:mm:ss')}`;
    const logItem = `${dateTime}\t${uuid()}\t${message}`;
    const dir = path.join(__dirname, 'logs')
    console.log(`writing to ${dir}`)
    console.log(logItem);
    try{
        if(!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        await fsPromise.appendFile(path.join(dir, fileName), `\n${logItem}`, { encoding: 'utf8' })
    } catch (err){
        console.log("the error code is now: ", err)
        if(err.code === 'ENOENT') {
            console.log("building path")
            if(!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFile(path.join(dir, fileName), msg,{ encoding: 'utf8' })
        }
    }
}
console.log(format(new Date(), 'MM/dd/yyyy\tHH:mm:ss'))

console.log(`hello...${uuid()}`)

module.exports = logEvent;