import { RSSItem, RSSMedia } from './RSSFeedHelpers'

const getEntryDate = (entry: any): string | null => {
    if (entry.published != null) {
        return entry.published[0]
    }
    if (entry.updated != null) {
        return entry.updated[0]
    }
    return null
}

const getAtomEntryMedia = (entry: any): RSSMedia | undefined => {
    const atomMediaGroup = entry['media:group']
    const atomMediaThumbnail = atomMediaGroup?.[0]?.['media:thumbnail']?.[0]
    if (atomMediaThumbnail != null) {
        try {
            return {
                thumbnail: [{
                    url: [atomMediaThumbnail.url[0]],
                    width: [parseInt(atomMediaThumbnail.width[0], 10)],
                    height: [parseInt(atomMediaThumbnail.height[0], 10)],
                }],
            }
        } catch (e) {
            return undefined
        }
    }
    return undefined
}

const findBestLink = (entry: any): string => {
    if (!entry.link) {
        return ''
    }

    const htmlLinks = []
    for (const link of entry.link) {
        if (link.rel[0] === 'alternate') {
            return link.href[0]
        }
        if (link.type[0] === 'text/html') {
            htmlLinks.push(link)
        }
    }

    if (htmlLinks.length > 0) {
        return htmlLinks[0].href[0]
    }

    if (entry.link.length > 0) {
        return entry.link[0]
    }

    return ''
}

export const parseAtomFeed = (json: any) => {
    const feed = json.feed
    const rss: any = { items: [] }

    if (feed.title) {
        rss.title = typeof feed.title[0] === 'string' ? feed.title[0] : feed.title[0]?._ ?? ''
    }
    if (feed.icon) {
        rss.icon = feed.icon[0]
    }
    if (feed.link) {
        rss.url = feed.link[0].href[0]
    }

    rss.items = feed.entry.map((entry: any) => {
        const entryDate = getEntryDate(entry)
        const link = findBestLink(entry)
        const item: RSSItem = {
            title: entry.title
                ? entry.title[0]._
                    ? entry.title[0]._
                    : entry.title[0]
                : '',
            description: entry.summary
                ? entry.summary[0]._
                : entry.content ? entry.content[0]._ : '',
            created: entryDate ? Date.parse(entryDate) : Date.now(),
            link,
            url: link,
            media: getAtomEntryMedia(entry),
        }
        return item
    })

    return rss
}
