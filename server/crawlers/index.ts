import { Crawler } from "./crawler";
import { AldiCrawler } from "./aldi";
import { DmCrawler } from "./dm";
import { LidlCrawler } from "./lidl";
import { MuellerCrawler } from "./mueller";
import { ReweCrawler } from "./rewe";

const crawlerList = [
    new AldiCrawler(),
    new DmCrawler(),
    new LidlCrawler(),
    // new MuellerCrawler(),
    // new ReweCrawler()
];

export const crawlers: Record<string, Crawler> = {};
crawlerList.forEach((crawler) => (crawlers[crawler.store.id] = crawler));
