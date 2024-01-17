import { Crawler } from "./crawler";
import { AldiCrawler } from "./aldi";
import { DmCrawler } from "./dm";
import { EdekaCrawler } from "./edeka";
import { FlinkCrawler } from "./flink";
import { LidlCrawler } from "./lidl";
import { MuellerCrawler } from "./mueller";
import { ReweCrawler } from "./rewe";
import { BiomarktCrawler } from "./biomarkt";

const crawlerList = [
    new AldiCrawler(),
    new BiomarktCrawler(),
    new DmCrawler(),
    new EdekaCrawler(),
    new FlinkCrawler(),
    new LidlCrawler(),
    new MuellerCrawler(),
    new ReweCrawler(),
];

export const crawlers: Record<string, Crawler> = {};
crawlerList.forEach((crawler) => (crawlers[crawler.store.id] = crawler));
