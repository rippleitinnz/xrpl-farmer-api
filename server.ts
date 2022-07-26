import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import { NextHandleFunction } from 'connect';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import color from 'ansi-colors';
import sql from 'mssql';
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

const app: Express = express();

const handleError = (middleware: NextHandleFunction, req: Request, res: Response, next: NextFunction) => {
    middleware(req, res, (err: any) => {
        if (err) return res.sendStatus(400);
        next();
    });
};

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

const PORT = process.env.PORT || 3000;

(async () => {
    try {
        await sql.connect(sqlConfig)
        app.listen(PORT, () => {
            console.log(`\n rippleitin.nz Farmer API \n`);
            console.log(`  Server running at:\n`);
            console.log(`  - Local:    ${color.cyan(`http://localhost:${color.bold(PORT as string)}`)}`);
            console.log(`  - Network:  ${color.cyan('https://farmerapi.rippleitin.nz')}`);
        });
    } catch (err: any) {
        console.log('Failed to open a SQL Database connection.', err.message);
        process.exit(1)
    }
})();
