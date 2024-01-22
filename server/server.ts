import compression from "compression";
import express from "express";
import * as fs from "fs";
import * as http from "http";
import * as pg from "../common/postgresql";
import * as analysis from "./analysis";


function scheduleFunction(hour: number, minute: number, second: number, func: () => Promise<void>) {
    const now = new Date();

    const scheduledTime = new Date();
    scheduledTime.setHours(hour);
    scheduledTime.setMinutes(minute);
    scheduledTime.setSeconds(second);

    if (now > scheduledTime) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
    }
    const delay = scheduledTime.getTime() - now.getTime();

    console.log("Scheduling next function call: " + scheduledTime.toString());

    setTimeout(async () => {
        await func();
        scheduleFunction(hour, minute, second, func);
    }, delay);
}

function parseArguments() {
    const args = process.argv.slice(2);
    let port = process.env.PORT !== undefined && process.env.PORT != "" ? parseInt(process.env.PORT) : 3000;
    let skipDataUpdate = false;
    for (let i = 0; i < args.length; i++) {
        if (args[i] === "-p" || args[i] === "--port") {
            port = parseInt(args[i + 1]);
            i++;
        } else if (args[i] === "-s" || args[i] === "--skip-data-update") {
            skipDataUpdate = true;
        } else if (args[i] === "-h" || args[i] === "--help") {
            console.log("Usage: node server.js [-p|--port PORT] [-l|--live-reload]");
            console.log();
            console.log("Options:");
            console.log("  -p, --port PORT         Port to listen on (default: 3000)");
            console.log("  -s, --skip-data-update  Skip fetching data");
            process.exit(0);
        }
    }

    return { port, skipDataUpdate };
}

(async () => {
    const dataDir = "data";
    const { port, skipDataUpdate } = parseArguments();

    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    pg.connect();
    pg.makeTable();

    if (!skipDataUpdate) {
        if (fs.existsSync(`${dataDir}/latest-canonical.json.${analysis.FILE_COMPRESSOR}`)) {
            analysis.updateData(dataDir);
        } else {
            await analysis.updateData(dataDir);
        }
        scheduleFunction(5, 0, 0, async () => {
            await analysis.updateData(dataDir);
        });
    }

    const app = express();
    app.use(compression());
    http.createServer(app).listen(port, () => {
        console.log(`App listening on port ${port}`);
    });
})();
