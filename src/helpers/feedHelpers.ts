import { Feed } from '../models/Feed';
import { ImageData } from '../models/ImageData';
import { isBundledImage } from './imageDataHelpers';
import * as urlUtils from '../helpers/urlUtils';
import { ContentWithMimeType, fetchContentWithMimeType, isRssMimeType, fetchFeedByContentWithMimeType } from './RSSPostHelpers';
import { importOpml } from './opmlImport';
import { isRedditLink, fetchRedditFeed } from './redditFeedHelpers';

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

const tryFetchFeedByContentWithMimeType = async (url: string, contentWithMimeType: ContentWithMimeType): Promise<Feed | Feed[] | undefined> => {
    const feed = await fetchFeedByContentWithMimeType(url, contentWithMimeType);
    if (feed != null) {
        return feed;
    }
    const feeds = await importOpml(contentWithMimeType.content);
    if (feeds != null) {
        return feeds;
    }
    return undefined;
};

export const fetchFeedsFromUrl = async (url: string): Promise<Feed | Feed[] | undefined> => {
    // special cases
    if (isRedditLink(url)) {
        return fetchRedditFeed(url);
    }
    const originalContentWithMimeType = await fetchContentWithMimeType(url);
    if (originalContentWithMimeType != null && isRssMimeType(originalContentWithMimeType?.mimeType)) {
        return tryFetchFeedByContentWithMimeType(url, originalContentWithMimeType);
    }
    const canonicalUrl = getCanonicalUrlForRSS(url);
    const contentWithMimeType = await fetchContentWithMimeType(canonicalUrl);
    if (contentWithMimeType == null) {
        return undefined;
    }

    if (contentWithMimeType.mimeType === FELFELE_FEEDS_MIME_TYPE) {
        try {
            const data = JSON.parse(contentWithMimeType.content) as {feeds: Feed[]};
            const rssFeeds = data.feeds.filter(feed => urlUtils.getHttpLinkFromText(feed.feedUrl) === feed.feedUrl);
            return rssFeeds;
        } catch (e) {
            return undefined;
        }
    } else {
        return tryFetchFeedByContentWithMimeType(canonicalUrl, contentWithMimeType);
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
