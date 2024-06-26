import { Feed } from '../models/Feed'
import { fetchFeedFromUrl } from './RSSPostHelpers'
import { getHttpsUrl } from './urlUtils'
import { Debug } from './Debug'
import { timeout } from './Utils'

// tslint:disable-next-line: no-var-requires
const parseOpml = require('node-opml-parser')

interface OPMLFeed {
    title: string
    url: string
    feedUrl: string
    feedType: string
}

export const tryFetchOPML = async (url: string): Promise<Feed[] | undefined> => {
    try {
        const response = await fetch(url)
        const xml = await response.text()
        return parseOPML(xml)
    } catch (e) {
        return undefined
    }
}

export const readOPML = async (xml: string): Promise<OPMLFeed[]> => {
    return new Promise<OPMLFeed[]>((resolve, reject) => {
        try {
            parseOpml(xml, (err: any, items: OPMLFeed[]) => {
                if (err) {
                    console.error(err)
                    reject(err)
                    return
                }
                resolve(items)
            })
        } catch (e) {
            reject(e)
        }
    })
}

export const parseOPML = async (xml: string): Promise<Feed[] | undefined> => {
    try {
        const opmlFeeds = await new Promise<OPMLFeed[]>((resolve, reject) => {
            try {
                parseOpml(xml, (err: any, items: OPMLFeed[]) => {
                    if (err) {
                        console.error(err)
                        reject(err)
                        return
                    }
                    resolve(items)
                })
            } catch (e) {
                reject(e)
            }
        })
        Debug.log('parseOPML', {result: opmlFeeds})
        const feeds = await convertOPMLFeeds(opmlFeeds)
        const isFeed = (feed: Feed | undefined): feed is Feed => feed != null
        return feeds.filter<Feed>(isFeed)
    } catch (e) {
        Debug.log('parseOPML', {e})
        return undefined
    }
}

const findBestAlternative = (alternatives: (string | undefined)[]) => {
    for (const alt of alternatives) {
        if (alt != null && alt !== '') {
            return alt
        }
    }
    return ''
}

export const convertOPMLFeed = async (opmlFeed: OPMLFeed): Promise<Feed | undefined> => {
    Debug.log('convertOPMLFeed', {opmlFeed})
    const feedUrl = getHttpsUrl(opmlFeed.feedUrl)
    Debug.log('convertOPMLFeed', {feedUrl})
    try {
        const feed = await timeout(120_000, fetchFeedFromUrl(feedUrl))
        Debug.log('convertOPMLFeed', 'after timeout', {feed})
        if (feed == null) {
            return undefined
        }
        const completeFeed: Feed = {
            name: findBestAlternative([opmlFeed.title, feed?.name]),
            url: findBestAlternative([opmlFeed.url, feed?.url]),
            feedUrl: feedUrl,
            favicon: feed?.favicon || '',
            followed: true,
        }
        return completeFeed
    } catch (e) {
        Debug.log('convertOPMLFeed', {e})
        return undefined
    }
}

export const convertOPMLFeeds = async (opmlFeeds: OPMLFeed[]): Promise<(Feed | undefined)[]> => {
    return Promise.all(
        opmlFeeds
            .map(opmlFeed => convertOPMLFeed(opmlFeed))
    )
}
