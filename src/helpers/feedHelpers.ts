import { Feed } from '../models/Feed';
import { ImageData } from '../models/ImageData';
import { isBundledImage } from './imageDataHelpers';
import { Debug } from '../Debug';
import * as urlUtils from '../helpers/urlUtils';
import { RSSFeedManager } from '../RSSPostManager';

export const FELFELE_FEEDS_MIME_TYPE = 'application/felfele-feeds+json';

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

export const fetchFeedsFromUrl = async (url: string): Promise<Feed | Feed[] | null> => {
    const originalContentWithMimeType = await RSSFeedManager.fetchContentWithMimeType(url);
    if (originalContentWithMimeType != null && RSSFeedManager.isRssMimeType(originalContentWithMimeType?.mimeType)) {
        return RSSFeedManager.fetchFeedByContentWithMimeType(url, originalContentWithMimeType);
    }
    const canonicalUrl = getCanonicalUrlForRSS(url);
    const contentWithMimeType = await RSSFeedManager.fetchContentWithMimeType(canonicalUrl);
    if (contentWithMimeType == null) {
        return null;
    }

    if (contentWithMimeType.mimeType === FELFELE_FEEDS_MIME_TYPE) {
        try {
            const data = JSON.parse(contentWithMimeType.content) as {feeds: Feed[]};
            const rssFeeds = data.feeds.filter(feed => urlUtils.getHttpLinkFromText(feed.feedUrl) === feed.feedUrl);
            return rssFeeds;
        } catch (e) {
            return null;
        }
    } else {
        return RSSFeedManager.fetchFeedByContentWithMimeType(canonicalUrl, contentWithMimeType);
    }
};

const feedId = (feed: Feed) => feed.feedUrl;
const areFeedsEqual = (feedA: Feed, feedB: Feed): boolean => feedId(feedA) === feedId(feedB);

export const mergeFeeds = (feedsA: Feed[], feedsB: Feed[]): Feed[] => {
    return feedsA
        .concat(feedsB)
        .sort((a, b) => feedId(a).localeCompare(feedId(b)))
        .filter((value, i, feeds) =>
            i + 1 < feeds.length
            ? areFeedsEqual(value, feeds[i + 1]) === false
            : true
        )
    ;
};
