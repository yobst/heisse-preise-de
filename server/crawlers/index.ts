import { Crawler } from "./crawler";
import { SparCrawler } from "./spar";

const crawlerList = [new SparCrawler()];

export const crawlers: Record<string, Crawler> = {};
crawlerList.forEach((crawler) => (crawlers[crawler.store.id] = crawler));
