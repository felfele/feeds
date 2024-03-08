import fs from 'fs'

import { addCommand } from "./cliParser"
import { output } from './cliHelpers'
import { PostWithOpenGraphData, makeFeedPageHtml } from './html'
import { loadPosts } from '../helpers/RSSPostHelpers'
import { fetchOpenGraphData } from '../helpers/openGraph'
import { mergeUpdatedPosts } from '../helpers/postHelpers'
import { Feed } from '../models/Feed'
import { makeRssFile } from './rss'

async function fetchPostsWithOpenGraph(feeds: Feed[], maxPostsValue: string = '20') {
    const allPosts = await loadPosts(feeds)
    const posts = mergeUpdatedPosts(allPosts, [])
    const maxPostsOrError = parseInt(maxPostsValue, 10)
    const maxPosts = isNaN(maxPostsOrError) ? undefined : maxPostsOrError
    const topPosts = posts.slice(0, maxPosts)
    // const topPostsWithOGPromises = topPosts.map(async post => { const ogData = await fetchOpenGraphData(post.link || ''); return { ...post, og: ogData }})
    // const topPostsWithOG = await Promise.all(topPostsWithOGPromises)
    // return topPostsWithOG
    return topPosts
}

export const publishCommand =
    addCommand('json <feeds-file> [max-posts=20]', 'Render posts as JSON', async (feedsFile: string, maxPostsValue = '20') => {
        const feedsData = fs.readFileSync(feedsFile, { encoding: 'utf-8' })
        const feedsObj = JSON.parse(feedsData)
        const feeds = feedsObj.feeds as Feed[]
        const previews = await fetchPostsWithOpenGraph(feeds, maxPostsValue)
        const previewsJSON = JSON.stringify(previews, undefined, 4)
        output(previewsJSON)
    })
    .
    addCommand('save-json <feeds-file> [max-posts=20]', 'Save fetched feed previews', async (feedsFile: string, maxPostsValue = '20') => {
        const feedsData = fs.readFileSync(feedsFile, { encoding: 'utf-8' })
        const feedsObj = JSON.parse(feedsData)
        const feeds = feedsObj.feeds as Feed[]
        const previews = await fetchPostsWithOpenGraph(feeds, maxPostsValue)
        const previewsJSON = JSON.stringify(previews, undefined, 4)
        const date = new Date().toISOString()
        const filePath = 'previews.json'
        fs.writeFileSync(filePath, previewsJSON)
        const historyFilePath = `previews-${date}.json`
        fs.writeFileSync(historyFilePath, previewsJSON)
        output(filePath)
    })
    .
    addCommand('json-to-html <previews-file>', 'Render previews file to HTML', async (previewsFile: string) => {
        const previewsJSON = fs.readFileSync(previewsFile, { encoding: 'utf-8' }) 
        const previews = JSON.parse(previewsJSON) as PostWithOpenGraphData[]
        const script = fs.readFileSync('dist/feeds.js', { encoding: 'utf-8' })
        const feedPageHtml = makeFeedPageHtml(previews, script)
        output(feedPageHtml)
    })
    .
    addCommand('json-to-rss <previews-file>', 'Render previews file as RSS', async (previewsFile: string) => {
        const previewsJSON = fs.readFileSync(previewsFile, { encoding: 'utf-8' }) 
        const posts = JSON.parse(previewsJSON) as PostWithOpenGraphData[]
        const rssFile = makeRssFile(posts)
        output(rssFile)
    })
    .
    addCommand('html <feeds-file> [max-posts=20]', 'Render fetched feed previews to HTML', async (feedsFile: string, maxPostsValue = '20') => {
        const feedsData = fs.readFileSync(feedsFile, { encoding: 'utf-8' })
        const feedsObj = JSON.parse(feedsData)
        const feeds = feedsObj.feeds as Feed[]
        const posts = await fetchPostsWithOpenGraph(feeds, maxPostsValue)
        const script = fs.readFileSync('dist/feeds.js', { encoding: 'utf-8' })
        const feedPageHtml = makeFeedPageHtml(posts, script)
        output(feedPageHtml)
    })
    .
    addCommand('rss <feeds-file> [max-posts=20]', 'Render fetched feed as RSS', async (feedsFile: string, maxPostsValue = '20') => {
        const feedsData = fs.readFileSync(feedsFile, { encoding: 'utf-8' })
        const feedsObj = JSON.parse(feedsData)
        const feeds = feedsObj.feeds as Feed[]
        const posts = await fetchPostsWithOpenGraph(feeds, maxPostsValue)
        const rssFile = makeRssFile(posts)
        output(rssFile)
    })
