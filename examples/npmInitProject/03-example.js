const yargs = require('yargs')

const argv = yargs
    .usage('Usage: $0 <command> [options]')
    .help('h')
    .alias('h', 'help')
    .version('v', 'version', '0.0.1')
    .alias('v', 'version')
    .demand('s')
    .nargs('s', 1)
    .describe('s', 'You enter phrase!')
    .alias('s', 'say')
    .argv

console.log('You say: ' + argv.s)
