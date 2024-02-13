import { Post, PublicPost } from '../models/Post'
import { ImageData } from '../models/ImageData'
import { Feed } from '../models/Feed'
import { findBestIconFromLinks, parseFaviconFromHtml, DEFAULT_FAVICON } from './favicon'
import * as urlUtils from './urlUtils'
import { HtmlUtils } from './HtmlUtils'
import { Debug } from './Debug'
import {
    HEADERS_WITH_FELFELE,
    HEADERS_WITH_SAFARI,
    RSSFeedWithMetrics,
    RSSFeed,
    RSSMedia,
    RSSEnclosure,
    loadRSSFeed,
    fetchFeed,
    HEADERS_WITH_CURL,
} from './RSSFeedHelpers'
import { safeFetch } from './safeFetch'
import { MINUTE } from './dateHelpers'
import { parseHtmlMetaData } from './htmlMetaData'
// tslint:disable-next-line:no-var-requires
const he = require('he')

export interface ContentWithMimeType {
    content: string
    mimeType: string
}

const RSSMimeTypes = [
    'application/rss+xml',
    'application/x-rss+xml',
    'application/atom+xml',
    'application/xml',
    'text/xml',
]

const getFeedUrlFromHtmlLink = (link: Node): string => {
    for (const mimeType of RSSMimeTypes) {
        const matcher = [{name: 'type', value: mimeType}]
        if (HtmlUtils.matchAttributes(link, matcher)) {
            const feedUrl = HtmlUtils.getAttribute(link, 'href') || ''
            if (feedUrl !== '') {
                return feedUrl
            }
        }
    }
    return ''
}

const parseFeedFromHtml = (html: any): Feed => {
    const feed: Feed = {
        name: '',
        url: '',
        feedUrl: '',
        favicon: '',
    }

    const document = HtmlUtils.parse(html)
    const links = HtmlUtils.findPath(document, ['html', 'head', 'link'])

    for (const link of links) {
        if (feed.feedUrl === '' && HtmlUtils.matchAttributes(link, [{name: 'rel', value: 'alternate'}])) {
            const feedUrl = getFeedUrlFromHtmlLink(link)
            if (feedUrl !== '') {
                feed.feedUrl = feedUrl
                break
            }
        }
    }

    if (!feed.feedUrl) {
        const bodyLinks = HtmlUtils.findPath(document, ['html', 'body', 'link'])

        for (const link of bodyLinks) {
            if (feed.feedUrl === '' && HtmlUtils.matchAttributes(link, [{name: 'rel', value: 'alternate'}])) {
                const feedUrl = getFeedUrlFromHtmlLink(link)
                if (feedUrl !== '') {
                    feed.feedUrl = feedUrl
                    break
                }
            }
        }
    }

    feed.favicon = findBestIconFromLinks(links) || ''

    const titles = HtmlUtils.findPath(document, ['html', 'head', 'title'])
    for (const title of titles) {
        if (title.childNodes.length > 0) {
            if (title.childNodes[0].textContent != null) {
                feed.name = title.childNodes[0].textContent!
                break
            }
            // The lib we use (react-native-parse-html) returns the value
            // incorrectly in 'value' instead of 'textContent'
            // @ts-ignore
            // tslint:disable-next-line:no-string-literal
            const value = title.childNodes[0]['value']
            if (value != null) {
                feed.name = value
                break
            }
        }
    }

    return feed
}

export interface ContentResult {
    content: string
    mimeType: string
    url: string
}

export const fetchContentResult = async (url: string): Promise<ContentResult | null> => {
    if (url.startsWith('http://')) {
        const urlHTTPS = url.replace('http://', 'https://')
        const contentWithMimeTypeHTTPS = await fetchContentWithMimeType(urlHTTPS)
        if (contentWithMimeTypeHTTPS != null) {
            return {
                content: contentWithMimeTypeHTTPS.content,
                mimeType: contentWithMimeTypeHTTPS.mimeType,
                url: urlHTTPS,
            }
        }
    }
    const contentWithMimeType = await fetchContentWithMimeType(url)
    return contentWithMimeType == null
        ? null
        : {
            content: contentWithMimeType.content,
            mimeType: contentWithMimeType.mimeType,
            url,
        }
}

export const parseMimeType = (contentType: string): string => {
    const parts = contentType.split(';', 2)
    const mimeType = parts.length > 1 ? parts[0] : contentType
    return mimeType
}

export const fetchContentWithMimeType = async (url: string): Promise<ContentWithMimeType | null> => {
    const isRedditUrl = urlUtils.getHumanHostname(url) === urlUtils.REDDIT_COM

    try {
        const response = await safeFetch(url, {
            headers: {
                ...isRedditUrl ? HEADERS_WITH_FELFELE : HEADERS_WITH_CURL,
            },
            cache: 'no-cache',
            keepalive: false,
        })

        const contentType = response.headers.get('Content-Type')
        Debug.log({ contentType, response })
        if (!contentType) {
            return null
        }

        const mimeType = parseMimeType(contentType)
        const content = await response.text()

        return {
            content: content,
            mimeType: mimeType,
        }
    } catch (e) {
        Debug.log('fetchContentWithMimeType', {url, e})
        return null
    }
}

export const getFeedFromHtml = (baseUrl: string, html: string): Feed => {
    const feed = parseFeedFromHtml(html)
    if (feed.feedUrl !== '') {
        feed.feedUrl = urlUtils.createUrlFromUrn(feed.feedUrl, baseUrl)
    }
    if (typeof feed.favicon === 'string' && feed.favicon !== '') {
        feed.favicon = urlUtils.createUrlFromUrn(feed.favicon, baseUrl)
    }
    if (feed.name.search(' - ') >= 0) {
        feed.name = feed.name.replace(/ - .*/, '')
    }
    feed.url = baseUrl
    return feed
}

export const isRssMimeType = (mimeType: string): boolean => {
    return RSSMimeTypes.includes(mimeType)
}

const fetchRSSFeedUrlFromUrl = async (url: string): Promise<ContentWithMimeType | null> => {
    const contentWithMimeType = await fetchContentWithMimeType(url)
    if (!contentWithMimeType) {
        return null
    }

    if (isRssMimeType(contentWithMimeType.mimeType)) {
        return contentWithMimeType
    }

    return null
}

const tryFetchFeedFromAltLocations = async (baseUrl: string, feed: Feed): Promise<Feed | null> => {
    const altFeedLocations = [
        '/rss',
        '/rss/',
        '/rss/index.rss',
        '/feed',
        '/social-media/feed/',
        '/feed/',
        '/feed/rss/',
        '/index.xml',
        '/',
    ]
    for (const altFeedLocation of altFeedLocations) {
        const altUrl = urlUtils.createUrlFromUrn(altFeedLocation, baseUrl)
        const rssContentWithMimeType = await fetchRSSFeedUrlFromUrl(altUrl)
        if (rssContentWithMimeType != null && isRssMimeType(rssContentWithMimeType.mimeType)) {
            feed.feedUrl = altUrl
            try {
                const rssFeed = await loadRSSFeed(altUrl, rssContentWithMimeType.content)
                return {
                    ...feed,
                    name: rssFeed.feed.title === '' ? feed.name : rssFeed.feed.title,
                }    
            } catch (e) {
                continue
            }
        }
    }
    return null
}

function normalizeName(name: string): string {
    const separator = ' - '
    if (name.includes(separator)) {
        return name.split(separator)[0]
    }
    return name
}

export const augmentFeedWithMetadata = async (url: string, feedName: string, rssFeed: RSSFeedWithMetrics, html?: string): Promise<Feed | null> => {
    Debug.log('RSSPostHelpers.augmentFeedWithMetadata', {url, rssFeed})
    const feedUrl = (rssFeed.feed && rssFeed.feed.url) || undefined
    const baseUrl = urlUtils.getBaseUrl(feedUrl || url).replace('http://', 'https://')
    Debug.log('RSSPostHelpers.augmentFeedWithMetadata', {url, baseUrl})
    const name = normalizeName(feedName || rssFeed.feed.title)
    const feed: Feed = {
        url: urlUtils.getCanonicalUrl(baseUrl),
        feedUrl: url,
        name: name,
        favicon: rssFeed.feed.icon || '',
    }
    // Fetch the website to augment the feed data with favicon and title
    if (!html) {
        const contentWithMimeType = await fetchContentWithMimeType(baseUrl)
        if (contentWithMimeType == null) {
            return null
        }
        html = contentWithMimeType.content
    }
    const feedFromHtml = getFeedFromHtml(baseUrl, html)
    if (feed.name === '') {
        feed.name = feedFromHtml.name
    }
    feed.favicon = feedFromHtml.favicon || rssFeed.feed.icon || ''
    if (feed.favicon === '') {
        const feedFavicon = parseFaviconFromHtml(html)
        if (feedFavicon != null) {
            feed.favicon = urlUtils.createUrlFromUrn(feedFavicon, baseUrl)
        } else  {
            const metadata = parseHtmlMetaData(baseUrl, html, feed)
            feed.favicon = metadata.image
        }

        if (feed.favicon === '') {
            feed.favicon = urlUtils.createUrlFromUrn(DEFAULT_FAVICON, baseUrl)
        }
    }
    return feed
}

// url can be either a website url or a feed url
export const fetchFeedFromUrl = async (url: string): Promise<Feed | null> => {
    const contentResult = await fetchContentResult(url)
    if (!contentResult) {
        return null
    }
    return await fetchFeedByContentWithMimeType(contentResult.url, contentResult)
}

export const fetchFeedByContentWithMimeType = async (url: string, contentWithMimeType: ContentWithMimeType): Promise<Feed | null> => {
    Debug.log('RSSPostHelpers.fetchFeedByContentWithMimeType', {url, mimeType: contentWithMimeType.mimeType})

    if (contentWithMimeType.mimeType === 'text/html') {
        const baseUrl = urlUtils.getBaseUrl(url).replace('http://', 'https://')
        Debug.log('RSSPostHelpers.fetchFeedByContentWithMimeType', {url, baseUrl})
        const feed = getFeedFromHtml(baseUrl, contentWithMimeType.content)
        Debug.log('RSSPostHelpers.fetchFeedByContentWithMimeType', {url, feed})
        if (feed.feedUrl !== '') {
            const rssFeed = await fetchFeed(feed.feedUrl)
            const augmentedFeed = await augmentFeedWithMetadata(feed.feedUrl, feed.name, rssFeed, contentWithMimeType.content)
            if (augmentedFeed != null) {
                return augmentedFeed
            }
        }

        const altFeed = await tryFetchFeedFromAltLocations(baseUrl, feed)
        if (altFeed != null && altFeed.feedUrl !== '') {
            const rssFeed = await fetchFeed(altFeed.feedUrl)
            const augmentedFeed = await augmentFeedWithMetadata(feed.feedUrl, feed.name, rssFeed, contentWithMimeType.content)
            if (augmentedFeed != null) {
                return augmentedFeed
            }
        }
    }

    // It looks like there is a valid feed on the url
    if (isRssMimeType(contentWithMimeType.mimeType)) {
        const rssFeed = await loadRSSFeed(url, contentWithMimeType.content)
        Debug.log('RSSPostHelpers.fetchFeedByContentWithMimeType', {rssFeed})
        const augmentedFeed = await augmentFeedWithMetadata(url, '', rssFeed)
        if (augmentedFeed != null) {
            return augmentedFeed
        }
    }

    return null
}

const feedFaviconString = (favicon: string | number): string => {
    return typeof favicon === 'string' ? favicon : ''
}

export const loadPosts = async (storedFeeds: Feed[]): Promise<Post[]> => {
    const posts: Post[] = []
    const metrics: RSSFeedWithMetrics[] = []

    const feedMap: { [index: string]: Feed } = {}
    for (const feed of storedFeeds) {
        feedMap[feed.feedUrl] = feed
    }

    const fetchFeedPromises = storedFeeds.map(feed => tryFetchFeed(feed.feedUrl))
    const feeds = await Promise.all(fetchFeedPromises)
    for (const feedWithMetrics of feeds) {
        if (feedWithMetrics) {
            try {
                const rssFeed = feedWithMetrics.feed
                const favicon = feedMap[feedWithMetrics.url]?.favicon
                const faviconString = feedFaviconString(favicon)
                const feedName = feedMap[feedWithMetrics.url]?.name || feedWithMetrics.feed.title
                const convertedPosts = convertRSSFeedtoPosts(rssFeed, feedName, faviconString, feedWithMetrics.url)
                posts.push.apply(posts, convertedPosts)
                metrics.push(feedWithMetrics)
            } catch (e) {
                Debug.log('loadPosts', 'error while parsing feed', {e, feedWithMetrics})
            }
        }
    }
    return posts
}

export const htmlToMarkdown = (description: string): string => {
    const strippedHtml = description
        // strip spaces at the beginning of lines
        .replace(/^( *)/gm, '')
        // strip newlines
        .replace(/\n/gm, '')
        // replace CDATA tags with content
        .replace(/<!\[CDATA\[(.*?)\]\]>/gm, '$1')
        // replace html links to markdown links
        .replace(/<a.*?href=['"](.*?)['"].*?>(.*?)<\/a>/gi, '[$2]($1)')
        // replace html images to markdown images
        .replace(/<img.*?src=['"](.*?)['"].*?>/gi, '![]($1)')
        // replace html paragraphs to markdown paragraphs
        .replace(/<p.*?>/gi, '\n\n')
        // strip other html tags
        .replace(/<(\/?[a-z]+.*?>)/gi, '')
        // strip html comments
        .replace(/<!--.*?-->/g, '')
        // replace multiple space with one space
        .replace(/ +/g, ' ')

    return he.decode(strippedHtml)
}

export const extractTextAndImagesFromMarkdown = (markdown: string, baseUri: string): [string, ImageData[]] => {
    const images: ImageData[] = []
    const text = markdown.replace(/(\!\[\]\(.*?\))/gi, (uri) => {
        const image: ImageData = {
            uri: baseUri + uri
                    .replace('!', '')
                    .replace('[', '')
                    .replace(']', '')
                    .replace('(', '')
                    .replace(')', ''),
        }
        images.push(image)
        return ''
    })
    return [text, images]
}

const stringEquals = (a: string, b: string): boolean => {
    for (let i = 0; i < a.length; i++) {
        if (i >= b.length) {
            return false
        }
        if (a[i] !== b[i]) {
            return false
        }
    }
    return true
}

export const isTitleSameAsText = (title: string, text: string): boolean => {
    const replacedText = urlUtils.stripNonAscii(text.replace(/\[(.*?)\]\(.*?\)/g, '$1').trim())
    const trimmedTitle = urlUtils.stripNonAscii(title.trim())
    const isSame =  stringEquals(trimmedTitle, replacedText)
    return isSame
}

const tryFetchFeed = async (feedUrl: string): Promise<RSSFeedWithMetrics | null> => {
    try {
        const rss = await fetchFeed(feedUrl)
        return rss
    } catch (e) {
        Debug.log('tryFetchFeed', {e, feedUrl})
        return null
    }
}

const stripTrailing = (s: string, trail: string): string => {
    if (s.endsWith(trail)) {
        return s.substr(0, s.length - trail.length)
    }
    return s
}

const convertRSSFeedtoPosts = (rssFeed: RSSFeed, feedName: string, favicon: string, feedUrl: string): Post[] => {
    const links: Set<string> = new Set()
    const strippedFavicon = stripTrailing(favicon, '/')
    const now = Date.now()
    const adjustCreatedAt = (createdAt: number) => createdAt > now ? (now - 30 * MINUTE) : createdAt
    const posts = rssFeed.items.map(item => {
        try {
            const markdown = htmlToMarkdown(item.description)
            const contentMarkdown = item.content && htmlToMarkdown(item.content)
            const [text, markdownImages] = extractTextAndImagesFromMarkdown(markdown, '')
            const mediaImages = extractImagesFromMedia(item.media)
            const enclosureImages = extractImagesFromEnclosures(item.enclosures)
            const [contentText, contentImages] = contentMarkdown ? extractTextAndImagesFromMarkdown(contentMarkdown, '') : [undefined, undefined]
            const images = markdownImages
                            .concat(mediaImages)
                            .concat(markdownImages.length === 0 ? enclosureImages : [])
                            .concat(contentImages ? contentImages : [])
            const title = isTitleSameAsText(item.title, text)
                ? ''
                : item.title === '(Untitled)'
                    ? ''
                    : '**' + item.title + '**' + '\n\n'

            const post: Post = {
                _id: feedUrl + '/' + item.link,
                text: (title + text).trim(),
                createdAt: adjustCreatedAt(item.created),
                images,
                link:  item.link,
                author: {
                    name: feedName,
                    uri: feedUrl,
                    image: {
                        uri: strippedFavicon,
                    },
                },
                rssItem: item,
            }
            return post
        } catch (e) {
            return undefined
        }
    }).filter(post => {
        if (post == null) {
            return false
        }
        if (post.link != null && links.has(post.link)) {
            return false
        }
        if (post.text === '') {
            return false
        }
        if (post.link != null) {
            links.add(post.link)
        }

        return true
    })

    return posts as Post[]
}

const extractImagesFromMedia = (media?: RSSMedia): ImageData[] => {
    if (media == null || media.thumbnail == null) {
        return []
    }
    const images = media.thumbnail.map(thumbnail => ({
        uri: thumbnail.url[0],
        width: thumbnail.width?.[0],
        height: thumbnail.height?.[0],
    } as ImageData))
    return images
}

const isSupportedImageType = (type: string): boolean => {
    if (type === 'image/jpeg' || type === 'image/jpg' || type === 'image/png') {
        return true
    }
    return false
}

const extractImagesFromEnclosures = (enclosures?: RSSEnclosure[]): ImageData[] => {
    if (enclosures == null) {
        return []
    }
    const images = enclosures
                    .filter(enclosure => isSupportedImageType(enclosure.type))
                    .map(enclosure => ({uri: enclosure.url}))

    return images
}
