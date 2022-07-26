"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const morgan_1 = __importDefault(require("morgan"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const ansi_colors_1 = __importDefault(require("ansi-colors"));
const mssql_1 = __importDefault(require("mssql"));
const xrpl_1 = require("xrpl");
dotenv_1.default.config();
const sqlConfig = {
    user: process.env.MSSQL_USER,
    password: process.env.MSSQL_PASSWORD,
    database: process.env.MSSQL_DATABASE,
    server: process.env.MSSQL_SERVER,
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
const app = (0, express_1.default)();
const handleError = (middleware, req, res, next) => {
    middleware(req, res, (err) => {
        if (err)
            return res.sendStatus(400);
        next();
    });
};
app.use((0, morgan_1.default)('combined'));
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use((req, res, next) => handleError(express_1.default.json(), req, res, next));
app.use(express_1.default.urlencoded({
    extended: true,
}));
app.get("/ping", (req, res) => res.sendStatus(200));
app.get("/verify", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.query.xrpl_address) {
        return res.status(401).send('Missing required query parameter [xrpl_address] to use this endpoint.');
    }
    if (!(0, xrpl_1.isValidClassicAddress)((req.query.xrpl_address))) {
        return res.status(401).send('The XRPL address provided is not a valid classic address. Please check the address and try again.');
    }
    try {
        const startTime = process.uptime();
        const sqlRequest = new mssql_1.default.Request();
        const sqlResult = yield sqlRequest.query(`
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
        });
    }
    catch (err) {
        res.status(500).send(`Problem querying ${process.env.MSSQL_DATABASE} database!`);
    }
}));
app.post("/verify-bulk", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const sqlRequest = new mssql_1.default.Request();
        const sqlResult = yield sqlRequest.query(`
            SELECT 
                *
            FROM 
                ${process.env.MSSQL_TABLE} 
            WHERE 
                xrpl_address 
            IN 
                (${req.body.xrpl_addresses.map((address) => `'${address}'`).join(',')})
        `);
        const xrplAddressesCleaned = req.body.xrpl_addresses.filter((address) => !sqlResult.recordset.find((record) => record.xrpl_address === address));
        const xrplAddressesFarmers = sqlResult.recordset.map((record) => record.xrpl_address);
        const endTime = process.uptime();
        return res.json({
            xrplAddressesCleaned,
            xrplAddressesFarmers,
            totalRemoved: req.body.xrpl_addresses.length - xrplAddressesCleaned.length,
            lookupDurationSeconds: Number((endTime - startTime).toFixed(2))
        });
    }
    catch (err) {
        res.status(500).send(`Problem querying ${process.env.MSSQL_DATABASE} database!`);
    }
}));
const PORT = process.env.PORT || 3000;
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield mssql_1.default.connect(sqlConfig);
        app.listen(PORT, () => {
            console.log(`\n rippleitin.nz XRPL Farmer API \n`);
            console.log(`  Server running at:\n`);
            console.log(`  - Local:    ${ansi_colors_1.default.cyan(`http://localhost:${ansi_colors_1.default.bold(PORT)}`)}`);
        });
    }
    catch (err) {
        console.log('Failed to open a SQL Database connection.', err.message);
        process.exit(1);
    }
}))();
