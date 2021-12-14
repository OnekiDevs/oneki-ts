const fs = require('fs');

let classes = {}

for (const file of fs.readdirSync("./classes")) {
    const _ = require(`../classes/${file}`);
    classes[_.prototype.constructor.name]=_
}

module.exports = classes