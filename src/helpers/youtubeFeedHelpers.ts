import * as urlUtils from './urlUtils'
import { Feed } from '../models/Feed'
import { parse } from 'url'
import { fetchFeedFromUrl } from './RSSPostHelpers'

export const isYoutubeLink = (url: string): boolean => {
    const canonicalUrl = urlUtils.getCanonicalUrl(url)
    const humanHostName = urlUtils.getHumanHostname(canonicalUrl)
    return humanHostName === 'youtube.com'
}

export const fetchYoutubeFeed = async (url: string): Promise<Feed | undefined> => {
    const parsedUrl = parse(url)
    if (parsedUrl.path?.startsWith('/channel/')) {
        const channelId = parsedUrl.path?.replace('/channel/', '')
        const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`
        const feed = await fetchFeedFromUrl(feedUrl)
        if (feed != null) {
            return feed
        } else {
            return undefined
        }
    }
    return undefined
}
