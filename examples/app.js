// exmaple 1

// var fs = require('fs'),
// path = require('path'),
//     dir = process.cwd(),
//     files = fs.readdirSync(dir);
//
// console.log('Name \t Size \t Date \n');
//
// files.forEach(function (filename) {
//     var fullname = path.join(dir, filename),
//         stats = fs.statSync(fullname);
//     if (stats.isDirectory()) {
//         console.log(filename + '\t DIR \t' + stats.mttime + '\n');
//     } else {
//         console.log(filename + '\t' + stats.size + '\t' + stats.mtime + '\n');
//     }
// });

// example 2

var argv = require('minimist')(process.argv.slice(2));
console.log(argv)


