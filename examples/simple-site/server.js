var http = require('http');
var fs = require('fs');
var url = require('url');
var path = require('path');
var typeMime = {
    '.html': 'text/html',
    '.htm': 'text/htm',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/png',
};
var PORT = 8087;

http.createServer(function(req, res) {
    var _url = url.parse(req.url),
        filename = _url.pathname.substring(1),
        extname,
        type,
        img;

    if (_url.pathname === '/') {
        filename = 'index.html';
    }

    extname = path.extname(filename);
    type = typeMime[path.extname(filename)];

    if ((extname === '.png') || (extname === '.jpg')) {
        img = fs.readFileSync(filename);
        res.writeHead(200, {
            'Content-Type': type
        });
        res.write(img, 'hex');
        res.end();
    } else {
        fs.readFile(filename, 'utf8', function (err, content) {
            if (err) {
                res.writeHead(404, {
                    'Content-Type': 'text/plain; charset=utf-8'
                });
                res.write(err.message);
                res.end();
            } else {
                res.writeHead(200, {
                    'Content-Type': type
                });
                res.write(content);
                res.end();
            }
        })
    }
}).listen(PORT);

console.log(`HTTP server running on port ${PORT}`);
