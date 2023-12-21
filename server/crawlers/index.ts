import { Crawler } from "./crawler";
import { AldiCrawler } from "./aldi";
import { DmCrawler } from "./dm";
import { FlinkCrawler } from "./flink";
import { LidlCrawler } from "./lidl";
import { MuellerCrawler } from "./mueller";
import { ReweCrawler } from "./rewe";
import { BiomarktCrawler } from "./biomarkt";

const crawlerList = [
    new AldiCrawler(),
    new DmCrawler(),
    new LidlCrawler(),
    new MuellerCrawler(),
    new ReweCrawler(),
    new FlinkCrawler(),
    new BiomarktCrawler(),
];

export const crawlers: Record<string, Crawler> = {};
crawlerList.forEach((crawler) => (crawlers[crawler.store.id] = crawler));
