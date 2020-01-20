const fs = require('fs');

const originalRequire = require;

function loadModule(filename, module, require) {
    const wrapSrc = `
    (function(module, exports, require){
        ${fs.readFileSync(filename, 'utf-8')}
    })(module, module.exports, require)
  `;
    eval(wrapSrc);
}

var require = (moduleName) => {
    const id = require.resolve(moduleName); // чтобы правильно нашел путь до файла без ошибок

    // кешируем модуль
    if (require.cache[id]) {
        return require.cache[id].exports;
    }

    // сам модуль
    const module = {
        exports: {},
        id: id
    };

    // положили модуль в кеш
    require.cache[id] = module;

    // грузим модуль
    loadModule(id, module, require);

    // полсе загрузки модуля, возвращаем модуль
    return module.exports;
};

// создаем require.cache и require.resolve
require.cache = {};
require.resolve = (moduleName) => {
    return originalRequire.resolve(moduleName);
};

const test = require('./test');

test();
