import { Version, BuildNumber } from '../Version'
import { Debug } from '../helpers/Debug'
import { parseArguments, addOption } from './cliParser'
import { output, setOutput } from './cliHelpers'
import * as urlUtils from '../helpers/urlUtils'
import { fetchOpenGraphData } from '../helpers/openGraph'
import { fetchHtmlMetaData } from '../helpers/htmlMetaData'
import { convertOPMLFeed, convertOPMLFeeds, readOPML, tryFetchOPML } from '../helpers/opmlImport'
import { fetchFeedsFromUrl } from '../helpers/feedHelpers'
import { fetchFeedFromUrl, loadPosts } from '../helpers/RSSPostHelpers'
import { Feed } from '../models/Feed'
import { mergeUpdatedPosts } from '../helpers/postHelpers'
import { Post } from '../models/Post'

import { readFileSync } from 'fs'
import { safeFetch } from '../helpers/safeFetch'
import { publishCommand } from './publish'
import { postCommand } from './post'

// tslint:disable-next-line:no-var-requires
const fetch = require('node-fetch')
// tslint:disable-next-line:no-var-requires
const FormData = require('form-data')
// tslint:disable-next-line: no-var-requires
const qrcode = require('qrcode')

declare var process: {
    argv: string[],
    env: any,
}
declare var global: any

global.__DEV__ = true
global.fetch = fetch
global.FormData = FormData

Debug.setDebugMode(false)
Debug.showTimestamp = true

const definitions =
    addOption('-q, --quiet', 'quiet mode', () => setOutput(() => {}))
    .
    addOption('-v, --verbose', 'verbose mode', () => Debug.setDebugMode(true))
    .
    addOption('-n, --no-colors', 'no colors in output', () => Debug.useColors = false)
    .
    addCommand('version', 'Print app version', () => output(Version))
    .
    addCommand('buildNumber', 'Print app build number', () => output(BuildNumber))
    .
    addCommand('test [name]', 'Run integration tests', async (testName) => {
            const allTests: any = {
            }
            if (process.env.SWARM_GATEWAY != null) {
                output('Running with SWARM at', process.env.SWARM_GATEWAY)
            }
            if (testName == null) {
                for (const test of Object.keys(allTests)) {
                    output('Running test:', test)
                    await allTests[test]()
                    if (Debug.isDebugMode) {
                        output('Finished test:', test, '\n\n')
                    }
                }
                output(`${Object.keys(allTests).length} tests passed succesfully`)
            } else {
                const test = allTests[testName]
                output('\nRunning test: ', testName)
                await test()
            }
    })
    .addCommand('bugreport [endpoint]', 'Send bugreport to endpoint', async (endpoint) => {
    })
    .
    addCommand('rss <url>', 'Fetch RSS feed of url', async (url: string) => {
        const canonicalUrl = urlUtils.getCanonicalUrl(url)
        const feed = await fetchFeedFromUrl(canonicalUrl)
        output('rss feed', {feed})
    })
    .
    addCommand('rss-test <feed-file>', 'Test fetching feeds from file', async (filename: string) => {
        const content = readFileSync(filename, { encoding: 'utf-8' })
        const feeds = JSON.parse(content) as { feeds: [] }
        const feedUrls = feeds.feeds.map((f: { feedUrl: string}) => f.feedUrl)
        const fetchFeed = (url: string) => {
            const canonicalUrl = urlUtils.getCanonicalUrl(url)
            output(`fetching feed at ${canonicalUrl}`)
            return fetchFeedFromUrl(canonicalUrl)
        }
        const testResults = await Promise.allSettled(feedUrls.map(fetchFeed))
        if (!testResults.every(r => r.status === 'fulfilled')) {
            // tslint:disable-next-line: no-console
            console.error(testResults)
        }
    })
    .
    addCommand('qr <url>', 'Show QR code of url', async (url: string) => {
        qrcode.toString(url, {type: 'terminal'}, (err: any, code: string) => {
            output(code)
        })
    })
    .
    addCommand('rssQR <url>', 'Fetch RSS feed of url and show QR code', async (url: string) => {
        const canonicalUrl = urlUtils.getCanonicalUrl(url)
        const feed = await fetchFeedFromUrl(canonicalUrl)
        output('rss feed', {feed})
        if (feed?.feedUrl != null) {
            qrcode.toString(feed.feedUrl, {type: 'terminal'}, (err: any, code: string) => {
                output(code)
            })
        }
    })
    .
    addCommand('opengraph <url>', 'Fetch OpenGraph data of url', async (url: string) => {
        const data = await fetchOpenGraphData(url)
        output({data})
    })
    .
    addCommand('metadata <url>', 'Fetch metadata of url', async (url: string) => {
        const data = await fetchHtmlMetaData(url)
        output({data})
    })
    .
    addCommand('checkversions', 'Check package.json versions', async () => {
        const packageJSON = JSON.parse(readFileSync('package.json', { encoding: 'utf-8' }))
        checkVersions(packageJSON.dependencies)
        checkVersions(packageJSON.devDependencies)
    })
    .
    addCommand('opml <url>', 'Download and convert OPML data', async (url: string) => {
        const data = await tryFetchOPML(url)
        output({data})
    })
    .
    addCommand('opml-test <url>', 'Download and convert OPML data', async (url: string) => {
        const response = await fetch(url)
        const xml = await response.text()
        const opmlFeeds = await readOPML(xml)
        const feeds: Feed[] = []
        for await (const opmlFeed of opmlFeeds) {
            const feed = await convertOPMLFeed(opmlFeed)
            if (feed) {
                feeds.push(feed)
            }
        }
        // const feeds = await convertOPMLFeeds(opmlFeeds)
        // output({feeds})
        // const isFeed = (feed: Feed | undefined): feed is Feed => feed != null
        // const data =  feeds.filter<Feed>(isFeed)

        output({feeds})
    })
    .
    addCommand('addFeed <url>', 'Test add feed input', async (url: string) => {
        const feeds = await fetchFeedsFromUrl(url)
        output(JSON.stringify(feeds, undefined, 4))
    })
    .
    addCommand('fetchFeeds <feeds-file> [max-posts]', 'Fetch feeds from file', async (feedsFile: string, maxPostsValue: string) => {
        const feedsData = readFileSync(feedsFile, { encoding: 'utf-8' })
        const feedsObj = JSON.parse(feedsData)
        const feeds = feedsObj.feeds as Feed[]
        const allPosts = await loadPosts(feeds)
        const previousPosts: Post[] = []
        const posts = mergeUpdatedPosts(allPosts, previousPosts).map(post => `${post.author?.name}: ${post.text} ${post.link}`)
        const maxPostsOrError = parseInt(maxPostsValue, 10)
        const maxPosts = isNaN(maxPostsOrError) ? undefined : maxPostsOrError
        const topPosts = posts.slice(0, maxPosts)
        output(JSON.stringify(topPosts, undefined, 4))
    })
    .
    addCommand('fetchFeed <feed-url>', 'Fetch feed from url', async (url: string) => {
        const feed: Feed = {
            name: '',
            url,
            feedUrl: url,
            favicon: '',
        }
        const posts = await loadPosts([feed])
        output(JSON.stringify(posts, undefined, 4))
    })
    .
    addCommand('publish', 'Publish feeds', publishCommand)
    .
    addCommand('post', 'Post related commands', postCommand)
    .
    addCommand('f <feed-url>', 'Test', async (url: string) => {
        const feed = await safeFetch('https://www.youtube.com/@decino', { 
            headers: {
                'user-agent': 'curl/7.81.0',
                accept: '*/*',
                connection: 'undefined',
                'accept-encoding': 'undefined',
                host: '192.168.1.69:9000'
            }        
        })
        output(JSON.stringify(feed, undefined, 4))
    })
    .
    addCommand('discover <feed-url>', 'Discover new feeds', async (feedsFile: string) => {
        const feedsData = readFileSync(feedsFile, { encoding: 'utf-8' })
        const feedsObj = JSON.parse(feedsData)
        const feeds = feedsObj.feeds as Feed[]
        const posts = await loadPosts(feeds)
        function domain(link: string) {
            const url = new URL(link)
            return `${url.protocol}//${url.hostname}`
        }
        function makeUnique(links: (string | undefined)[]) {
            const uniqueLinks = new Map<string, string>()
            links.map(link => {
                if (link) {
                    if (!uniqueLinks.has(link)) {
                        uniqueLinks.set(link, link)
                    }
                }
            })
            return Array.from(uniqueLinks, ([name, value]) => name)
        }
        const links = posts.map(post => post.link).map(link => link ? domain(link) : link)
        const uniqueLinks = makeUnique(links)
        for await (const link of uniqueLinks) {
            if (link) {
                const feed = await fetchFeedsFromUrl(link)
                console.log({ link, feed })
            }
        }
        output(JSON.stringify(uniqueLinks, undefined, 4))
    })


const checkVersions = (deps: {[pack: string]: string}) => {
    const errors = []
    for (const key of Object.keys(deps)) {
        const version = deps[key]
        if (!version.substring(0, 1).match(/[0-9]/)) {
            errors.push(`${key}: ${version}`)
        }
    }
    if (errors.length > 0) {
        // tslint:disable-next-line: no-console
        output(errors)
        output('Fix the versions by specifying exact versions instead of ranges')
        throw new Error('invalid versions')
    }
}

parseArguments(process.argv, definitions, output, output)

