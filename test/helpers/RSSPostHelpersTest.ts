import { htmlToMarkdown, extractTextAndImagesFromMarkdown, getFeedFromHtml, isTitleSameAsText, parseMimeType } from '../../src/helpers/RSSPostHelpers'

test('Parse CDATA descriptions from RSS', async () => {
    const text = 'text'
    const description = `<![CDATA[${text}]]>`
    const expectedResult = text

    const result = htmlToMarkdown(description)

    expect(result).toBe(expectedResult)
})

test('Parse image from RSS', async () => {
    const link = 'http://192.168.1.49:2368/content/images/2017/08/photo-34.jpg'
    const description = `<img src="${link}" alt="">`
    const expectedResult = `![](${link})`

    const result = htmlToMarkdown(description)

    expect(result).toBe(expectedResult)
})

test('Parse CDATA descriptions containing an image from RSS', async () => {
    const link = 'http://192.168.1.49:2368/content/images/2017/08/photo-34.jpg'
    const description = `<![CDATA[<img src="${link}" alt="">]]>`
    const expectedResult = `![](${link})`

    const result = htmlToMarkdown(description)

    expect(result).toBe(expectedResult)
})

test('Parse html with image', () => {
    const link = 'http://192.168.1.49:2368/content/images/2017/08/photo-34.jpg'
    const description = `<div><img src="${link}" alt=""></div>`
    const expectedResult = `![](${link})`

    const result = htmlToMarkdown(description)

    expect(result).toBe(expectedResult)
})

test('Parse image from markdown', () => {
    const link = 'http://192.168.1.49:2368/content/images/2017/07/photo-33.jpg'
    const markdown = `![](${link})`
    const expectedResult = ['', [{uri: link}]]

    const result = extractTextAndImagesFromMarkdown(markdown, '')

    expect(result).toEqual(expectedResult)
})

test('Parse link', () => {
    const hostname = 'example.com'
    const link = `http://${hostname}/content/2017/08/`
    const description = `<a href="${link}">description</a>`
    const expectedResult = `[description](${link})`

    const result = htmlToMarkdown(description)

    expect(result).toBe(expectedResult)
})

test('Parse description with multiline CDATA', () => {
    const description = `
    <![CDATA[
    a
    ]]>
    `
    const expectedResult = 'a'

    const result = htmlToMarkdown(description)

    expect(result).toBe(expectedResult)
})

test('Fetch RSS feed from URL', async () => {
    const htmlContent = `
        <!DOCTYPE html>
        <html class="no-js" lang="hu" prefix="og: http://ogp.me/ns# fb: http://ogp.me/ns/fb#">
        <head>
            <title>Index</title>
            <link rel="apple-touch-icon" sizes="180x180" href="/assets/images/favicons/apple-touch-icon.png" />
            <link rel="icon" type="image/png" href="/assets/images/favicons/favicon-32x32.png" sizes="32x32" />
            <link rel="icon" type="image/png" href="/assets/images/favicons/favicon-16x16.png" sizes="16x16" />
            <link rel="manifest" href="/assets/images/favicons/manifest.json" />
            <link rel="shortcut icon" href="/assets/images/favicons/favicon.ico" />
            <link rel="mask-icon" href="/assets/images/favicons/safari-pinned-tab.svg" color="#ff9900" />
            <link rel="alternate" type="application/rss+xml" title="Legfrissebb cikkeink" href="/24ora/rss/" />
    `

    const baseUrl = 'https://index.hu/'
    const expectedFeedUrl = 'https://index.hu/24ora/rss/'
    const expectedFavicon = 'https://index.hu/assets/images/favicons/apple-touch-icon.png'
    const expectedName = 'Index'

    const result = await getFeedFromHtml(baseUrl, htmlContent)

    expect(result).not.toBeNull()

    if (result != null ) {
        expect(result.feedUrl).toBe(expectedFeedUrl)
        expect(result.favicon).toBe(expectedFavicon)
        expect(result.name).toBe(expectedName)
        expect(result.url).toBe(baseUrl)
    }
})

test('Compare text with title with links removed', () => {
    const title = 'Monvid is based on Blockchain technology and is a decentralized application which relays on streaming nodes provided by the community. Everyone can join this community and share their resources with the platform.↵#ICO #MVID #Monvid'
    const text = 'Monvid is based on Blockchain technology and is a decentralized application which relays on streaming nodes provided by the community. Everyone can join this community and share their resources with the platform.[#ICO](https://twitter.com/hashtag/ICO?src=hash) [#MVID](https://twitter.com/hashtag/MVID?src=hash) [#Monvid](https://twitter.com/hashtag/Monvid?src=hash)'
    const result = isTitleSameAsText(title, text)

    expect(result).toBeTruthy()
})

test('Parse mime type', () => {
    const contentType = 'text/xml; charset=UTF-8'
    const result = parseMimeType(contentType)

    expect(result).toBe('text/xml')
})
