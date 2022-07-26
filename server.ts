import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import { NextHandleFunction } from 'connect';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import color from 'ansi-colors';
import sql from 'mssql';
import rateLimit from 'express-rate-limit'
import { isValidClassicAddress } from 'xrpl';
import { TFarmerRecord } from './types'

dotenv.config();

const sqlConfig: sql.config = {
    user: process.env.MSSQL_USER,
    password: process.env.MSSQL_PASSWORD,
    database: process.env.MSSQL_DATABASE,
    server: process.env.MSSQL_SERVER as string,
    port: Number(process.env.MSSQL_PORT),
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    },
    options: {
        trustServerCertificate: true
    }
};

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

const app: Express = express();

const handleError = (middleware: NextHandleFunction, req: Request, res: Response, next: NextFunction) => {
    middleware(req, res, (err: any) => {
        if (err) return res.sendStatus(400);
        next();
    });
};

app.use(limiter)
app.use(morgan('combined'))
app.use(helmet());
app.use(cors());
app.use((req, res, next) => handleError(express.json(), req, res, next));
app.use(
    express.urlencoded({
        extended: true,
    })
);

app.get("/ping", (req: Request, res: Response) => res.sendStatus(200));

app.get("/verify", async (req: Request, res: Response) => {
    if (!req.query.xrpl_address) {
        return res.status(401).send('Missing required query parameter [xrpl_address] to use this endpoint.');
    }
    if (!isValidClassicAddress((req.query.xrpl_address) as string)) {
        return res.status(401).send('The XRPL address provided is not a valid classic address. Please check the address and try again.');
    }
    try {
        const startTime = process.uptime();
        const sqlRequest = new sql.Request();
        const sqlResult: sql.IResult<TFarmerRecord> = await sqlRequest.query(`
            SELECT 
                * 
            FROM 
                ${process.env.MSSQL_TABLE} 
            WHERE 
                xrpl_address = '${req.query.xrpl_address}'
        `);
        const endTime = process.uptime();
        return res.json({
            isFarmer: !!sqlResult.recordset.length,
            lookupDurationSeconds: Number((endTime - startTime).toFixed(2))
        })
    } catch (err: any) {
        res.status(500).send(`Problem querying ${process.env.MSSQL_DATABASE} database!`)
    }
});

app.post("/verify-bulk", async (req: Request, res: Response) => {
    if (!req.body.xrpl_addresses) {
        return res.status(401).send('Missing required [xrpl_addresses] property from payload body.');
    }
    if (!Array.isArray(req.body.xrpl_addresses)) {
        return res.status(401).send('The [xrpl_addresses] property must be be of type array filled with XRPL addresses as strings.');
    }
    if (!req.body.xrpl_addresses.length) {
        return res.status(401).send('The [xrpl_addresses] property must contain minimum of 1 XRPL address string.');
    }
    try {
        const startTime = process.uptime();
        const sqlRequest = new sql.Request();
        const sqlResult: sql.IResult<TFarmerRecord> = await sqlRequest.query(`
            SELECT 
                *
            FROM 
                ${process.env.MSSQL_TABLE} 
            WHERE 
                xrpl_address 
            IN 
                (${req.body.xrpl_addresses.map((address: String) => `'${address}'`).join(',')})
        `);
        const xrplAddressesCleaned = req.body.xrpl_addresses.filter((address: String) => !sqlResult.recordset.find((record) => record.xrpl_address === address));
        const xrplAddressesFarmers = sqlResult.recordset.map((record) => record.xrpl_address);
        const endTime = process.uptime();
        return res.json({
            xrplAddressesCleaned,
            xrplAddressesFarmers,
            totalFarmersFound: xrplAddressesFarmers.length,
            lookupDurationSeconds: Number((endTime - startTime).toFixed(2)) 
        })
    } catch (err: any) {
        res.status(500).send(`Problem querying ${process.env.MSSQL_DATABASE} database!`)
    }
});

const PORT = process.env.PORT || 3000;

(async () => {
    try {
        await sql.connect(sqlConfig)
        app.listen(PORT, () => {
            console.log(`\n rippleitin.nz XRPL Farmer API \n`);
            console.log(`  Server running at:\n`);
            console.log(`  - Local:    ${color.cyan(`http://localhost:${color.bold(PORT as string)}`)}`);
        });
    } catch (err: any) {
        console.log('Failed to open a SQL Database connection.', err.message);
        process.exit(1)
    }
})();
