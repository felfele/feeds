import { Feed } from '../models/Feed';
import { ImageData } from '../models/ImageData';
import { isBundledImage } from './imageDataHelpers';
import * as urlUtils from '../helpers/urlUtils';
import { ContentWithMimeType, fetchContentWithMimeType, isRssMimeType, fetchFeedByContentWithMimeType } from './RSSPostHelpers';
import { fetchOPML } from './opmlImport';
import { isRedditLink, fetchRedditFeed } from './redditFeedHelpers';
import { exploreData } from '../models/recommendation/NewsSource';

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

const tryFetchFeedByContentWithMimeType = async (inputUrl: string, canonicalUrl: string, contentWithMimeType: ContentWithMimeType, fetchConfiguration = defaultFetchConfiguration): Promise<Feed | Feed[] | undefined> => {
    const feed = await fetchConfiguration.fetchFeedByContentWithMimeType(canonicalUrl, contentWithMimeType);
    if (feed != null) {
        return feed;
    }
    const feeds = await fetchConfiguration.fetchOPML(contentWithMimeType.content);
    if (feeds != null) {
        return feeds;
    }
    const exploreFeed = tryFindFeedInExploreData(inputUrl, canonicalUrl);
    if (exploreFeed != null) {
        return exploreFeed;
    }

    return undefined;
};

const feedsFromExploreDataCategory = (categoryName: string) => Object
    .entries(exploreData[categoryName])
    .reduce<Feed[]>((prev, curr) => prev.concat(curr[1]), [])
;

const feedsFromExploreData = (): Feed[] => Object
    .entries(exploreData)
    .reduce<Feed[]>((prev, curr) => prev.concat(feedsFromExploreDataCategory(curr[0])), [])
    .sort((a, b) => a.name.localeCompare(b.name))
    .filter((value, index, array) => (index > 0 && value.name === array[index - 1].name) === false)
;

const tryFindFeedInExploreData = (inputUrl: string, canonicalUrl: string): Feed | undefined => {
    const feeds = feedsFromExploreData()
        .filter(feed =>
            urlUtils.compareUrls(feed.feedUrl, canonicalUrl) ||
            urlUtils.compareUrls(feed.url, canonicalUrl) ||
            feed.name === inputUrl
        );
    return feeds.length > 0
        ? feeds[0]
        : undefined
    ;
};

const defaultFetchConfiguration = {
    fetchContentWithMimeType,
    fetchFeedByContentWithMimeType,
    fetchOPML,
};

// this is a bit messy because we try to interpret the user input
// and employ different heuristics to find the actual feed
export const fetchFeedsFromUrl = async (inputUrl: string, fetchConfiguration = defaultFetchConfiguration): Promise<Feed | Feed[] | undefined> => {
    // handling keywords, e.g. someone types "the verge"
    let url = inputUrl;
    if (url.includes(' ')) {
        url = url.replace(/ /g, '');
    }
    if (!url.includes('.')) {
        url += '.com';
    }

    // special cases
    if (isRedditLink(url)) {
        return fetchRedditFeed(url);
    }

    // the url was an RSS url
    const originalContentWithMimeType = await fetchConfiguration.fetchContentWithMimeType(url);
    if (originalContentWithMimeType != null && isRssMimeType(originalContentWithMimeType?.mimeType)) {
        return tryFetchFeedByContentWithMimeType(inputUrl, url, originalContentWithMimeType);
    }

    const canonicalUrl = urlUtils.getCanonicalUrl(url);
    const contentWithMimeType = await fetchConfiguration.fetchContentWithMimeType(canonicalUrl);
    if (contentWithMimeType == null) {
        // try searching in explore data as a last resort
        const feed = tryFindFeedInExploreData(inputUrl, canonicalUrl);
        return feed;
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
        return tryFetchFeedByContentWithMimeType(inputUrl, canonicalUrl, contentWithMimeType, fetchConfiguration);
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
