import { PostWithOpenGraphData } from "./html";

function postLink(post: PostWithOpenGraphData) {
    return post.link ? post.link : post.og?.url ?? ''
}

function postDescription(post: PostWithOpenGraphData) {
    return post.rssItem?.content ? post.rssItem.content : post.text
}

function escapeEnclosure(s: string | undefined): string {
    if (!s) {
        return ''
    }
    return s.replaceAll('&','&amp;')
}

function postEnclosure(post: PostWithOpenGraphData) {
    return post.images.length > 0
        ? `<enclosure url="${escapeEnclosure(post.images[0].uri)}" />`
        : ''
}

function postToItem(post: PostWithOpenGraphData) {
    return `
<item>
    <title>${post.rssItem?.title || ''}</title>
    <link>${postLink(post)}</link>
    <description>${postDescription(post)}</description>
    <pubDate>${new Date(post.createdAt).toUTCString()}</pubDate>
    ${postEnclosure(post)}
</item>
`
}

export function makeRssFile(posts: PostWithOpenGraphData[]): string {
    const pubDate = new Date().toUTCString()
    return `
<rss version="2.0">
    <channel>
        <title>Feeds</title>
        <pubDate>${pubDate}</pubDate>
        ${posts.map(post => postToItem(post)).join('')}
    </channel>
</rss>
`
}