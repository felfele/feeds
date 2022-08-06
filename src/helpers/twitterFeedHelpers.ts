import * as urlUtils from './urlUtils';
import { Feed } from '../models/Feed';
import { fetchFeedFromUrl } from './RSSPostHelpers';
import { fetchHtmlMetaData } from './htmlMetaData';

export function isTwitterLink(url: string): boolean {
    const canonicalUrl = urlUtils.getCanonicalUrl(url);
    const humanHostName = urlUtils.getHumanHostname(canonicalUrl);
    return humanHostName === 'twitter.com';
};

export const fetchTwitterFeed = async (url: string): Promise<Feed | undefined> => {
    const nitterUrl = url.replace('twitter.com', 'nitter.net');
    const canonicalUrl = urlUtils.getCanonicalUrl(nitterUrl);
    console.log({ url, nitterUrl, canonicalUrl })
    const feed = await fetchFeedFromUrl(canonicalUrl);
    if (!feed) {
        return undefined
    }
    const pageUrl = feed.feedUrl.replace(/\/rss$/, '')
    const meta = await fetchHtmlMetaData(pageUrl)
    console.log({ meta })
    const favicon = meta.image ?? feed.favicon
    return {
        ...feed,
        favicon,
    }
};
