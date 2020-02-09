const {Client} = require('pg');

const db = new Client({
    user: 'teplaya_postelka',
    host: 'localhost',
    database: 'test',
    password: '',
    post: 5432
});

async function connect() {
    await db.connect();

    await db.query(`CREATE TABLE groups(
        g_no text PRIMARY KEY,
        headman integer NOT NULL REFERENCES public.students(s_id)
        )`);
    await db.query(`ALTER TABLE public.students ADD g_no text REFERENCES groups(g_no)`);
    await db.query(`BEGIN`);
    await db.query(`INSERT INTO groups(g_no, headman)
    SELECT $1, s_id
    FROM public.students
    WHERE name = $2
    `, ['Super-team', 'Anna']);
    await db.query(`UPDATE public.students SET g_no = $1`, ['Super-team']);
    await db.query(`COMMIT`);
    const students = await db.query('SELECT * FROM public.students');
    console.log(students.rows);

    const grups = await db.query(`SELECT * FROM public.groups`);
    console.log(grups.rows);
    db.end;
}

connect();
