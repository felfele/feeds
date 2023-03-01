import * as urlUtils from './urlUtils'
import { Version } from '../Version'
import { loadRedditFeed, redditJsonFeedUrl } from './redditFeedHelpers'
import { Debug } from './Debug'
import { timeout } from './Utils'
import { safeFetch } from './safeFetch'
import { parseAtomFeed } from './atomFeedHelpers'

// tslint:disable-next-line:no-var-requires
const util = require('react-native-util')
// tslint:disable-next-line:no-var-requires
const xml2js = require('react-native-xml2js')

// this is needed for tumblr
export const HEADERS_WITH_SAFARI = {
    'User-Agent': 'Mozilla/5.0 (Macintosh Intel Mac OS X 10_14_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1.2 Safari/605.1.15',
    'Accept': '*/*',
}

// this is needed for reddit (https://github.com/reddit-archive/reddit/wiki/API)
export const HEADERS_WITH_FELFELE = {
    'User-Agent': `org.felfele.feeds:${Version}`,
    'Accept': '*/*',
}

export interface RSSEnclosure {
    url: string
    length: string
    type: string
}

export interface RSSThumbnail {
    height: number[]
    width: number[]
    url: string[]
}

export interface RSSMedia {
    thumbnail: RSSThumbnail[]
}

export interface RSSItem {
    title: string
    description: string
    link: string
    url: string
    created: number
    enclosures?: RSSEnclosure[]
    media?: RSSMedia
}

export interface RSSFeed {
    title: string
    description: string
    url: string
    icon?: string
    items: RSSItem[]
}

export interface RSSFeedWithMetrics {
    feed: RSSFeed
    url: string
    size: number
    downloadTime: number
    xmlTime: number
    parseTime: number
}

const FEED_FETCH_TIMEOUT = 15000

const fetchResponse = async (fetchUrl: string, headers: RequestInit): Promise<{response: Response, feedUrl: string}> => {
    if (fetchUrl.startsWith('http://')) {
        try {
            fetchUrl = fetchUrl.replace('http://', 'https://')
            return {
                response: await timeout(FEED_FETCH_TIMEOUT, safeFetch(fetchUrl, headers)),
                feedUrl: fetchUrl,
            }
        } catch (e) {
        }
    }

    const response = await timeout(FEED_FETCH_TIMEOUT, safeFetch(fetchUrl, headers))
    return {
        response,
        feedUrl: fetchUrl,
    }
}

export const fetchFeed = async (url: string): Promise<RSSFeedWithMetrics> => {
    const startTime = Date.now()
    const downloadTime = Date.now()
    const isRedditUrl = urlUtils.getHumanHostname(url) === urlUtils.REDDIT_COM
    Debug.log('rssFeedHelper.fetchResponse', {url, isRedditUrl})
    const headers = isRedditUrl ? HEADERS_WITH_FELFELE : HEADERS_WITH_SAFARI
    const fetchUrl = isRedditUrl ? redditJsonFeedUrl(url) : url
    const {response, feedUrl} = await fetchResponse(fetchUrl, { headers })
    Debug.log('rssFeedHelper.fetchResponse', {feedUrl})
    const text = await response.text()
    const feedLoader = isRedditUrl
        // in case of a reddit feed we want to use the original url, not the .json one
        ? Promise.resolve(loadRedditFeed(url, text, startTime, downloadTime))
        : loadRSSFeed(feedUrl, text, startTime, downloadTime)

    const feed = await timeout(FEED_FETCH_TIMEOUT, feedLoader)
    return feed
}

export const loadRSSFeed = async (url: string, xml: string, startTime = 0, downloadTime = 0): Promise<RSSFeedWithMetrics> => {
    const xmlTime = Date.now()
    const parser = new xml2js.Parser({ trim: false, normalize: true, mergeAttrs: true })
    parser.addListener('error', (err: string) => {
        throw new Error(err)
    })
    const rssFeed = await new Promise<RSSFeedWithMetrics>((resolve, reject) => {
        parser.parseString(xml, (err: string, result: any) => {
            if (err) {
                reject(err)
                return
            }
            const parseTime = Date.now()
            console.debug({ result })
            const rss = parseFeed(result)
            if (!rss) {
                reject(err)
                return
            }
            const feedWithMetrics: RSSFeedWithMetrics = {
                feed: rss,
                url: url,
                size: xml.length,
                downloadTime: downloadTime - startTime,
                xmlTime: xmlTime - downloadTime,
                parseTime: parseTime - xmlTime,
            }
            resolve(feedWithMetrics)
        })
    })

    console.debug({ rssFeed })
    return rssFeed
}

const parseFeed = (json: any): RSSFeed | undefined => {
    if (json.feed) {
        return parseAtomFeed(json)
    } else if (json.rss) {
        return parseRSSFeed(json)
    } else if (json['rdf:RDF']) {
        return parseRDFFeed(json)
    }
    return undefined
}

const parseRSSFeed = (json: any) => {
    const channel = util.isArray(json.rss.channel) ? json.rss.channel[0] : json.rss.channel 
    return parseRSSChannel(channel)
}

function parseRDFFeed(json: any) {
    const channel = util.isArray(json['rdf:RDF'].channel) ? json['rdf:RDF'].channel[0] : json['rdf:RDF'].channel
    const items = json['rdf:RDF'].item
    return parseRSSChannel(channel, items)
}

function getItems(channel: any, items?: [] | undefined) {
    if (items) {
        return items
    }
    if (!util.isArray(channel.item)) {
        return [channel.item]
    }
    return channel.item
}

function parseRSSChannel(channel: any, items?: [] | undefined) {
    const rss: any = { items: [] }
    if (channel.title) {
        rss.title = channel.title[0]
    }
    if (channel.description) {
        rss.description = channel.description[0]
    }
    if (channel.link) {
        rss.url = channel.link[0]
    }
    const channelItems = getItems(channel, items)
    if (channelItems) {
        channelItems.forEach((val: any) => {
            const obj: any = {}
            obj.title = !util.isNullOrUndefined(val.title) ? val.title[0] : ''
            obj.description = !util.isNullOrUndefined(val.description) ? val.description[0] : ''
            obj.url = obj.link = !util.isNullOrUndefined(val.link) ? val.link[0] : ''

            if (val.pubDate) {
                obj.created = Date.parse(val.pubDate[0])
            }
            if (val['media:content']) {
                obj.media = val.media || {}
                obj.media.content = val['media:content']
            }
            if (val['media:thumbnail']) {
                obj.media = val.media || {}
                obj.media.thumbnail = val['media:thumbnail']
            }
            if (val.enclosure) {
                obj.enclosures = []
                if (!util.isArray(val.enclosure)) {
                    val.enclosure = [val.enclosure]
                }
                val.enclosure.forEach((enclosure: any) => {
                    const enc: { [index: string]: any } = {}

                    // tslint:disable-next-line:forin
                    for (const x in enclosure) {
                        enc[x] = enclosure[x][0]
                    }
                    obj.enclosures.push(enc)
                })

            }
            rss.items.push(obj)
        })
    }
    return rss
}
