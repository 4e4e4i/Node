process
    .stdin
    // вешаем на консоль событие data
    .on('data', (chunk) => {
        console.log(`Size: (${chunk.length}) - ${chunk.toString()}`);
    });
