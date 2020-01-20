
process
    .stdin
    // вешаем на консоль событие readable
    .on('readable', () => {
        let chunk;
        while ((chunk = process.stdin.read()) !== null) {
            console.log(`Size: (${chunk.length}) - ${chunk.toString()}`);
        }
    });
