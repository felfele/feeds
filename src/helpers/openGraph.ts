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
    const response = await fetch(url)
    const html = await response.text()
    const data = parseOpenGraphData(html, url)
    return data
}

export const parseOpenGraphData = (html: string, baseUrl: string): OpenGraphData => {
    const document = HtmlUtils.parse(html)
    return getHtmlOpenGraphData(document, baseUrl)
}

export const getHtmlOpenGraphData = (document: HTMLElement, baseUrl: string): OpenGraphData => {
    const metaElements = HtmlUtils.findPath(document, ['html', 'head', 'meta'])

    const ogData: OpenGraphData = {
        title: '',
        description: '',
        image: '',
        name: '',
        url: baseUrl,
    }
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
    return {
        ...ogData,
        image: createUrlFromUrn(ogData.image, baseUrl),
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
