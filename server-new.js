const fs = require("fs");
const http = require("http");
const analysis = require("./analysis");
const csv = require("./site/js/misc");
const express = require("express");
const compression = require("compression");

function copyItemsToSite(dataDir) {
    const items = analysis.readJSON(`${dataDir}/latest-canonical.json.${analysis.FILE_COMPRESSOR}`);
    analysis.writeJSON(`site-new/build/data/latest-canonical.json`, items);
    for (const store of analysis.STORE_KEYS) {
        const storeItems = items.filter((item) => item.store === store);
        analysis.writeJSON(`site-new/build/data/latest-canonical.${store}.compressed.json`, storeItems, false, 0, true);
    }
    const csvItems = csv.itemsToCSV(items);
    fs.writeFileSync("site-new/build/data/latest-canonical.csv", csvItems, "utf-8");
    console.log("Copied latest items to site.");
}

function scheduleFunction(hour, minute, second, func) {
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
        fs.mkdirSync(dataDir);
    }

    const outputDir = "site-new/build";
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
    if (!fs.existsSync(outputDir + "/data")) fs.mkdirSync(outputDir + "/data");

    if (!skipDataUpdate) {
        if (fs.existsSync(`${dataDir}/latest-canonical.json.${analysis.FILE_COMPRESSOR}`)) {
            copyItemsToSite(dataDir);
            analysis.updateData(dataDir, (_newItems) => {
                copyItemsToSite(dataDir);
            });
        } else {
            await analysis.updateData(dataDir);
            copyItemsToSite(dataDir);
        }
        scheduleFunction(5, 0, 0, async () => {
            items = await analysis.updateData(dataDir);
            copyItemsToSite(dataDir);
        });
    } else {
        copyItemsToSite(dataDir);
    }

    const app = express();
    app.use(compression());
    app.use(express.static("site-new"));
    http.createServer(app).listen(port, () => {
        console.log(`App listening on port ${port}`);
    });
})();
