import { Feed } from '../models/Feed';
import { ImageData } from '../models/ImageData';
import { isBundledImage } from './imageDataHelpers';
import { Debug } from '../Debug';
import * as urlUtils from '../helpers/urlUtils';
import { RSSFeedManager } from '../RSSPostManager';

export const getFeedImage = (feed: Feed): ImageData => {
    if (isBundledImage(feed.favicon)) {
        return {
            localPath: feed.favicon,
        };
    }
    const image: ImageData = {
        uri: feed.favicon,
    };
    return image;
};

export const sortFeedsByName = (feeds: Feed[]): Feed[] => {
    return feeds.sort((a, b) => a.name.toLocaleLowerCase().localeCompare(b.name.toLocaleLowerCase()));
};

const getCanonicalUrlForRSS = (url: string): string => {
    const canonicalUrl = urlUtils.getCanonicalUrl(url);
    const humanHostName = urlUtils.getHumanHostname(canonicalUrl);
    if (humanHostName === 'theverge.com') {
        return 'https://www.theverge.com/';
    }
    if (humanHostName === urlUtils.REDDIT_COM && !url.endsWith('.rss')) {
        return canonicalUrl + '.rss';
    }
    return canonicalUrl;
};

export const fetchRSSFeedFromUrl = async (url: string): Promise<Feed | null> => {
    try {
        Debug.log('fetchRSSFeedFromUrl', 'url', url);
        const canonicalUrl = getCanonicalUrlForRSS(url);
        Debug.log('fetchRSSFeedFromUrl', 'canonicalUrl', canonicalUrl);
        const feed = await RSSFeedManager.fetchFeedFromUrl(canonicalUrl);
        Debug.log('fetchRSSFeedFromUrl', 'feed', feed);
        return feed;
    } catch (e) {
        Debug.log(e);
        return null;
    }
};
