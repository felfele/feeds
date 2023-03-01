import { Feed } from '../models/Feed'
import { ImageData } from '../models/ImageData'
import { isBundledImage } from './imageDataHelpers'
import * as urlUtils from '../helpers/urlUtils'
import { fetchContentResult, fetchFeedByContentWithMimeType, ContentResult, ContentWithMimeType } from './RSSPostHelpers'
import { parseOPML } from './opmlImport'
import { isRedditLink, fetchRedditFeed } from './redditFeedHelpers'
import { exploreData } from '../models/recommendation/NewsSource'
import { isYoutubeLink, fetchYoutubeFeed } from './youtubeFeedHelpers'
import { fetchTwitterFeed, isTwitterLink } from './twitterFeedHelpers'

export const FELFELE_FEEDS_MIME_TYPE = 'application/felfele-feeds+json'

export const getFeedImage = (feed: Feed): ImageData => {
    if (isBundledImage(feed.favicon)) {
        return {
            localPath: feed.favicon,
        }
    }
    const image: ImageData = {
        uri: feed.favicon,
    }
    return image
}

export const sortFeedsByName = (feeds: Feed[]): Feed[] => {
    return feeds.sort((a, b) => a.name.toLocaleLowerCase().localeCompare(b.name.toLocaleLowerCase()))
}

const tryFetchFelfeleFeeds = (result: ContentResult): Feed[] | undefined => {
    try {
        const data = JSON.parse(result.content) as {feeds: Feed[]}
        const rssFeeds = data.feeds.filter(feed => urlUtils.getHttpLinkFromText(feed.feedUrl) === feed.feedUrl)
        return rssFeeds
    } catch (e) {
        return undefined
    }
}

export async function tryFetchFeedByContentWithMimeType(inputUrl: string, contentResult: ContentResult, fetchConfiguration = defaultFetchConfiguration): Promise<Feed | Feed[] | undefined> {
    if (contentResult.mimeType === FELFELE_FEEDS_MIME_TYPE) {
        return tryFetchFelfeleFeeds(contentResult)
    }
    const feed = await fetchConfiguration.fetchFeedByContentWithMimeType(contentResult.url, contentResult)
    if (feed != null) {
        return feed
    }
    const feeds = await fetchConfiguration.parseOPML(contentResult.content)
    if (feeds != null) {
        return feeds
    }
    const exploreFeed = tryFindFeedInExploreData(inputUrl, contentResult.url)
    if (exploreFeed != null) {
        return exploreFeed
    }

    return undefined
}

const feedsFromExploreDataCategory = (categoryName: string) => Object
    .entries(exploreData[categoryName])
    .reduce<Feed[]>((prev, curr) => prev.concat(curr[1]), [])

const feedsFromExploreData = (): Feed[] => Object
    .entries(exploreData)
    .reduce<Feed[]>((prev, curr) => prev.concat(feedsFromExploreDataCategory(curr[0])), [])
    .sort((a, b) => a.name.localeCompare(b.name))
    .filter((value, index, array) => (index > 0 && value.name === array[index - 1].name) === false)

const tryFindFeedInExploreData = (inputUrl: string, canonicalUrl: string): Feed | undefined => {
    const feeds = feedsFromExploreData()
        .filter(feed =>
            urlUtils.compareUrls(feed.feedUrl, canonicalUrl) ||
            urlUtils.compareUrls(feed.url, canonicalUrl) ||
            feed.name.toLocaleLowerCase() === inputUrl.toLocaleLowerCase()
        )
    return feeds.length > 0
        ? feeds[0]
        : undefined

}

export interface FetchConfiguration {
    fetchFeedByContentWithMimeType: (url: string, contentWithMimeType: ContentWithMimeType) => Promise<Feed | null>
    fetchContentResult: (url: string) => Promise<ContentResult | null>
    parseOPML: (xml: string) => Promise<Feed[] | undefined> 
}

const defaultFetchConfiguration: FetchConfiguration = {
    fetchFeedByContentWithMimeType,
    fetchContentResult,
    parseOPML,
}

// this is a bit messy because we try to interpret the user input
// and employ different heuristics to find the actual feed
export const fetchFeedsFromUrl = async (inputUrl: string, fetchConfiguration = defaultFetchConfiguration): Promise<Feed | Feed[] | undefined> => {
    // handling keywords, e.g. someone types "the verge"
    let url = inputUrl
    if (url.includes(' ')) {
        url = url.replace(/ /g, '')
    }
    if (!url.includes('.')) {
        url += '.com'
    }

    // special cases for certain websites
    if (isRedditLink(url)) {
        return fetchRedditFeed(url)
    }

    if (isYoutubeLink(url)) {
        return fetchYoutubeFeed(url, fetchConfiguration)
    }

    if (isTwitterLink(url)) {
        return fetchTwitterFeed(url)
    }

    // first try with the url the user entered
    const originalContentResult = await fetchConfiguration.fetchContentResult(url)
    if (originalContentResult != null) {
        const originalUrlFeed = await tryFetchFeedByContentWithMimeType(inputUrl, originalContentResult, fetchConfiguration)
        if (originalUrlFeed != null) {
            return originalUrlFeed
        }
    }

    // if the url the user entered did not work, form a canonical url and try with that
    const canonicalUrl = urlUtils.getCanonicalUrl(url)
    const result = await fetchConfiguration.fetchContentResult(canonicalUrl)
    if (result != null) {
        const feed = await tryFetchFeedByContentWithMimeType(inputUrl, result, fetchConfiguration)
        if (feed != null) {
            return feed
        }
    }

    return tryFindFeedInExploreData(inputUrl, canonicalUrl)
}

const feedId = (feed: Feed) => feed.feedUrl
const areFeedsEqual = (feedA: Feed, feedB: Feed): boolean => feedId(feedA) === feedId(feedB)

export const mergeFeeds = (feedsA: Feed[], feedsB: Feed[]): Feed[] => {
    return feedsA
        .concat(feedsB)
        .sort((a, b) => feedId(a).localeCompare(feedId(b)))
        .filter((value, i, feeds) =>
            i + 1 < feeds.length
            ? areFeedsEqual(value, feeds[i + 1]) === false
            : true
        )

}
