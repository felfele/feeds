import { HtmlUtils } from './HtmlUtils'
import { createUrlFromUrn } from './urlUtils'

export interface OpenGraphData {
    title: string
    description: string
    image: string
    name: string
    url: string
}

export const fetchOpenGraphData = async (url: string): Promise<OpenGraphData> => {
    try {
        const response = await fetch(url)
        const html = await response.text()
        const data = parseOpenGraphData(html, url)
        return data    
    } catch (e) {
        return {
            title: '',
            description: '',
            image: '',
            name: '',
            url,
        }
    }
}

export const parseOpenGraphData = (html: string, baseUrl: string): OpenGraphData => {
    const document = HtmlUtils.parse(html)
    return getHtmlOpenGraphData(document, baseUrl)
}

export const getHtmlOpenGraphData = (document: HTMLElement, url: string): OpenGraphData => {
    const ogData: OpenGraphData = {
        title: '',
        description: '',
        image: '',
        name: '',
        url,
    }

    const baseUrl = new URL(url).origin
    const metaElements = HtmlUtils.findPath(document, ['html', 'head', 'meta'])
    for (const meta of metaElements) {
        ogData.title = getPropertyIfValueNotSet(ogData.title, meta, 'og:title')
        ogData.description = getPropertyIfValueNotSet(ogData.description, meta, 'og:description')
        ogData.image = getPropertyIfValueNotSet(ogData.image, meta, 'og:image')
        ogData.name = getPropertyIfValueNotSet(ogData.name, meta, 'og:site_name')
        ogData.url = getPropertyIfValueNotSet(ogData.url, meta, 'og:url')
    }
    return normalizeOpenGraphData(ogData, baseUrl)
}

const normalizeOpenGraphData = (ogData: OpenGraphData, baseUrl: string): OpenGraphData => {
    if (!ogData.image) {
        return ogData
    }

    // make relative path absolute
    const absoluteUrlImage = createUrlFromUrn(ogData.image, baseUrl) 

    // remove broken images pointing to the website and not an image
    const image = absoluteUrlImage === baseUrl + '/' ? '' : absoluteUrlImage

    return {
        ...ogData,
        image,
    }
}

const getPropertyIfValueNotSet = (value: string, node: Node, name: string): string => {
    return value === ''
        ? getOpenGraphPropertyContent(node, name) || ''
        : value
}

const getOpenGraphPropertyContent = (node: Node, name: string): string | null => {
    if (HtmlUtils.matchAttributes(node, [{name: 'property', value: name}])) {
        return HtmlUtils.getAttribute(node, 'content')
    }
    return null
}
