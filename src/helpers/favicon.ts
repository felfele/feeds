import { HtmlUtils } from '../HtmlUtils';
import { Debug } from '../Debug';
import { safeFetch } from './safeFetch';
import * as urlUtils from './urlUtils';

interface Icon {
    href: string;
    size: number;
}

export const fetchSiteFaviconUrl = async (url: string): Promise<string> => {
    const baseUrl = urlUtils.getBaseUrl(url);
    try {
        const favicon = await downloadIndexAndParseFavicon(baseUrl);
        if (favicon == null) {
            return urlUtils.createUrlFromUrn('favicon.ico', url);
        }
        return favicon;
    } catch (e) {
        Debug.log(e);
        return '';
    }
};

export const fetchFaviconUrl = async (url: string): Promise<string | undefined> => {
    try {
        return await downloadIndexAndParseFavicon(url);
    } catch (e) {
        Debug.log(e);
        return undefined;
    }
};

const fetchHtml = async (url: string): Promise<string> => {
    const response = await safeFetch(url);
    const html = await response.text();
    return html;
};

const matchRelAttributes = (node: Node, values: string[]): string | null => {
    for (const value of values) {
        if (HtmlUtils.matchAttributes(node, [{name: 'rel', value: value}])) {
            const favicon = HtmlUtils.getAttribute(node, 'href') || '';
            if (favicon !== '') {
                return favicon;
            }
        }
    }
    return null;
};

const getBestSizeFromAttribute = (sizesAttr: string): number => {
    const getSize = (sizeAttr: string) => parseInt(sizeAttr.split(/[xX]/)[0], 10) || 0;
    const sizes = sizesAttr.split(' ')
        .map(size => getSize(size))
        .sort((a, b) => b - a)
    ;
    return sizes.length > 0
        ? sizes[0]
        : 0
    ;
};

const findIconsInLinks = (links: Node[]): Icon[] => {
    const isIcon = (icon: Partial<Icon>): icon is Icon => icon.href != null && icon.size != null;
    return links.map(link => {
        const href = matchRelAttributes(link, ['shortcut icon', 'icon', 'apple-touch-icon']) || undefined;
        const sizes = HtmlUtils.getAttribute(link, 'sizes') || '';
        const size = getBestSizeFromAttribute(sizes);
        return {
            href,
            size,
        };
    })
    .filter<Icon>(isIcon);
};

const getBestIcon = (icons: Icon[]): Icon | undefined => {
    const iconExtensionWeight = (iconHref: string) => iconHref.endsWith('.png')
        ? 2
        : iconHref.endsWith('.ico')
            ? 1
            : 0
    ;
    const compareIconExtension = (a: string, b: string) => iconExtensionWeight(b) - iconExtensionWeight(a);
    const sortedIcons = icons.sort((a, b) => b.size - a.size || compareIconExtension(a.href, b.href));
    return sortedIcons.length > 0
        ? sortedIcons[0]
        : undefined
    ;
};

export const findBestIconFromLinks = (links: Node[]): string | undefined => {
    const icons = findIconsInLinks(links);
    const icon = getBestIcon(icons);
    return icon != null
        ? icon.href
        : undefined
    ;
};

const downloadIndexAndParseFavicon = async (url: string): Promise<string | undefined> => {
    const html = await fetchHtml(url);
    const favicon = parseFaviconFromHtml(html);
    if (favicon != null) {
        return urlUtils.createUrlFromUrn(favicon, url);
    }
    return undefined;
};

const parseFaviconFromHtml = (html: string): string | undefined => {
    const document = HtmlUtils.parse(html);
    const links = HtmlUtils.findPath(document, ['html', 'head', 'link']);
    return findBestIconFromLinks(links);
};
