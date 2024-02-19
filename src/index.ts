import { Pool } from 'pg';
import { setTimeout } from 'timers/promises';
import cors from 'cors';
import express from 'express';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: [
    './.env.local',
    '../.env.local',
    '../../.env.local',
]});

const app = express();
const pool = new Pool({
    connectionString: process.env.PG_CONNECT_STRING,
});

// Set UI path to the current working directory plus /ui/dist:
const uiPath = path.join(process.cwd(), 'ui', 'build');

app.use(cors({origin: (o, cb) => {
    console.log("got cors for", o);
    cb(null, o || '*');
}}));
app.use(express.json());
app.use(express.static(uiPath));

const initDatabase = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS
            _ssc__ssc_blocked_md5s (
                md5 varchar(32) PRIMARY KEY,
                comment varchar NOT NULL
            )
        `)

        await pool.query(`
            CREATE TABLE IF NOT EXISTS
            _ssc_block_actions (
                id int PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
                user_id varchar(32) NOT NULL,
                post_count int NOT NULL,
                file_count int NOT NULL,
                md5s varchar(32)[] NOT NULL,
                created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        `)
    } catch (error) {
        console.error(new Date().toISOString());
        console.error('Could not initialise the database', error);
        process.exit(1);
    }
};

let repeatUsers = [] as string[];

const runQuery = async (): Promise<void> => {
    try {
        let query = `
            SELECT "userId"
            FROM drive_file
            WHERE
                md5 IN (
                    SELECT md5
                    FROM _ssc_blocked_md5s
                )
        `;
        let res = await pool.query(query);
        const userIds = res.rows.map((row) => row.userId as string);

        // sometimes we delete them so fast their posts are still creating,
        // so we redo them next loop as well.
        const doUsers = [...repeatUsers, ...userIds];
        repeatUsers = [...userIds];

        if (doUsers.length === 0) {
            return;
        }

        let userCount = 0;
        let noteCount = 0;
        let driveFileCount = 0;

        for (const userId of doUsers) {
            query = `
                UPDATE "user"
                SET "isSuspended" = true
                WHERE id = $1
                  AND "isSuspended" = false
            `;
            res = await pool.query(query, [userId]);
            userCount += res?.rowCount ?? 0;

            query = `
                DELETE FROM "note"
                WHERE "userId" = $1
            `;
            res = await pool.query(query, [userId]);
            const notes = res?.rowCount ?? 0;
            noteCount += notes;

            query = `
                DELETE FROM "drive_file"
                WHERE "userId" = $1
                RETURNING md5
            `;
            res = await pool.query(query, [userId]);
            const files = res?.rowCount ?? 0;
            driveFileCount += files;

            const md5s = res.rows
                .map((row) => row.md5)
                .reduce((acc, md5) => {
                    if (acc.includes(md5)) {
                        return acc;
                    }
                    return [...acc, md5];
                }, [])
                .sort();

            query = `
                INSERT INTO _ssc_block_actions
                  (user_id, post_count, file_count, md5s)
                VALUES ($1, $2, $3, $4)
            `;
            await pool.query(query, [userId, notes, files, md5s]);
        }

        console.log(new Date().toISOString());
        console.log('Detected', userIds);
        console.log('Found', userIds.length, 'users');
        console.log('Suspended users:', userCount);
        console.log('Deleted notes:', noteCount);
        console.log('Deleted files:', driveFileCount);
    } catch (error) {
        console.error(new Date().toISOString());
        console.error('Error running query', error);
    }
};

const sleepAndRepeat = async (): Promise<void> => {
    while (true) {
        await runQuery();
        await setTimeout(1000); // Sleep for 10 seconds
    }
};

// To add an MD5 sum using /api/add-md5, you can use the following curl command in bash:
// curl -d '{"md5":"your_md5_sum_here"}' localhost:3123/api/add-md5
app.post('/api/add-md5', async (req: express.Request, res: express.Response) => {
    const { md5, comment} = req.body;
    if (!md5) {
        return res.status(400).send({ error: 'MD5 checksum is required' });
    }

    try {
        const query = 'INSERT INTO _ssc_blocked_md5s(md5, comment) VALUES($1, $2) ON CONFLICT (md5) DO NOTHING';
        const result = await pool.query(query, [md5, comment || ""]);

        if (result.rowCount === 0) {
            return res.status(409).send({ message: 'MD5 checksum already exists' });
        }

        console.log(new Date().toISOString());
        console.log('Added MD5', md5);
        res.status(201).send({ message: 'MD5 checksum added successfully' });
    } catch (error) {
        console.error('Error adding MD5 checksum', error);
        res.status(500).send({ error: 'Internal server error' });
    }
});

app.delete('/api/remove-md5/:md5', async (req: express.Request, res: express.Response) => {
    const { md5 } = req.params;
    if (!md5) {
        return res.status(400).send({ error: 'MD5 checksum is required for removal' });
    }

    try {
        const query = 'DELETE FROM _ssc_blocked_md5s WHERE md5 = $1';
        const result = await pool.query(query, [md5]);

        if (result.rowCount === 0) {
            return res.status(404).send({ message: 'MD5 checksum not found' });
        }

        console.log(new Date().toISOString());
        console.log('Removed MD5', md5);
        res.status(200).send({ message: 'MD5 checksum removed successfully' });
    } catch (error) {
        console.error('Error removing MD5 checksum', error);
        res.status(500).send({ error: 'Internal server error' });
    }
});

app.get('/api/blocked-md5s', async (req: express.Request, res: express.Response) => {
    try {
        const query = 'SELECT md5, comment FROM _ssc_blocked_md5s';
        const result = await pool.query(query);

        console.log("got rows", result.rows)
        const output = result.rows
            .map((row) => ({md5: row.md5, comment: row.comment}));

        console.log(new Date().toISOString());
        console.log('Retrieved blocked MD5s', output);
        res.status(200).send(output);
    } catch (error) {
        console.error('Error retrieving blocked MD5 checksums', error);
        res.status(500).send({ error: 'Internal server error' });
    }
});

app.get('/healthz', (req: express.Request, res: express.Response) => {
    res.status(200).send({ message: 'OK' });
});

// Redirect all other un-specified paths to the UI index page.
app.get('*', (req: express.Request, res: express.Response) => {
    res.sendFile(path.resolve(uiPath, 'index.html'));
});

const address = process.env.WEBSERVER || 'localhost:3123';
let [host, port] = address.split(':');
if (!port && isNaN(Number(host)) === false) {
    port = host;
    host = 'localhost';
} else if (!port) {
    port = '3123';
}

console.log(`Starting up on ${host} port ${port}...`);

app.listen(Number(port), host, () => {
    console.log(new Date().toISOString());
    console.log(`API server running on: http://${host}:${port}`);
});

const main = async () => {
    await initDatabase();
    await sleepAndRepeat();
};

main().catch(err => {
    console.log(new Date().toISOString());
    console.error("Fatal error:", err);
});
