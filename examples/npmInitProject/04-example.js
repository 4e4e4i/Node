const argv = require('yargs')
    .usage('Usage: $0 <command> [options]')
    .command('count', 'Count the lines in a file')
    .example('$0 count -f foo.js', 'count the lines in the given file')
    .alias('f', 'file')
    .nargs('f', 1)
    .describe('f', 'Load a file')
    .demandOption(['f'])
    .help('h')
    .alias('h', 'help')
    .epilog('copyright 2019')
    .argv

const fs = require('fs')
const s = fs.createReadStream(argv.file)

let lines = 0
s.on('data', function (buf) {
    lines += buf.toString().match(/\n/g).length
})

s.on('end', function () {
    console.log(lines)
})
