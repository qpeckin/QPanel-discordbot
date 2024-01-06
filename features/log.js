const padRight = require("./padRight");
const chalk = require("chalk");

async function log(message, color) {
    console.log(
        chalk[color](padRight(message, 9))
    );
}

module.exports = log;
