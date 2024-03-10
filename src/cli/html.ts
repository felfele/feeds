import {OpenGraphData} from '../helpers/openGraph';
import { getHumanHostname } from '../helpers/urlUtils';
import {Post} from '../models/Post';
import {logoDataUrl} from './logo-data-url';

export type PostWithOpenGraphData = Post & {og?: OpenGraphData};

const WHITE_COLOR = '#fefefe'
const BLACK_COLOR = '#191919'
const COLOR_STEP_10 = '#272727'
const COLOR_STEP_20 = '#3f3f3f'

const FIREFOX_PRIVATE_COLOR = '#291e4f'
const FIREFOX_LIGHT_COLOR = '#f9f9fb'
const FEEDS_THEME_COLOR = '#6200EA'
const THEME_COLOR = COLOR_STEP_10
const APP_NAME = 'Feeds'
const PADDING = '10px'

function thumbnailImageSrc(post: PostWithOpenGraphData) {
  return post.images[0]?.uri ? post.images[0]?.uri : post.og?.image
}

function postTitle(post: PostWithOpenGraphData) {
  return post.rssItem?.title
}

function postLink(post: PostWithOpenGraphData) {
  return post.link ? post.link : post.og?.url ?? ''
}

function postText(post: PostWithOpenGraphData) {
  if (!post.text) {
    return
  }

  return post.text
    // remove bold text
    .replace(/^\*\*.*\*\*/m, '')
    // remove comment links
    .replace(/\[Comments\]\((.*?)\)/gm, '')
    // replace links with just the text
    .replace(/\[(.*?)\]\((.*?)\)/gm, '$1')
}

function fixYoutubeThumbnail(image: string | undefined) {
  const replacement = 'hq720'; // can be also 'mqdefault' for medium resolution
  return image ? image.replace(/hqdefault.jpg$/, `${replacement}.jpg`) : image;
}

function link(href: string, content: string, className = '') {
  return `<a href="${href}" class="${className}" target="_blank" rel="noopener noreferrer">${content}</a>`
}

function commentLink(post: Post): string | undefined {
  const match = post.text.match(/\[Comments\]\((.*?)\)/m)

  if (!match) {
    return
  }

  return match[1]
}

const verticalDotsIcon = (size = '20') => `
<svg version="1.1" id="icon" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" 
  width="${size}" height="${size}" viewBox="0 0 32 32" style="enable-background:new 0 0 32 32;" xml:space="preserve">
<style type="text/css">
	.st0{fill:none;}
</style>
<title>overflow-menu--vertical</title>
<circle cx="16" cy="8" r="2"/>
<circle cx="16" cy="16" r="2"/>
<circle cx="16" cy="24" r="2"/>
<rect id="_Transparent_Rectangle_" class="st0" width="32" height="32"/>
</svg>
`

export function card(post: PostWithOpenGraphData) {
  const postUpdateTime = post.updatedAt || post.createdAt
  const printableTime = postUpdateTime ? new Date(postUpdateTime).toLocaleString() : ''
  const url = post.link || ''
  const hostnameText = url === '' ? '' : getHumanHostname(url)
  const title = postTitle(post)
  const thumbnailImage = fixYoutubeThumbnail(thumbnailImageSrc(post));
  const text = postText(post);
  const comment = commentLink(post);
  const sharePost = `window.scripts.sharePost('${post._id}')`
  return `
<div class="card-parent">
    <a class="main-link" href="${postLink(post)}" target="_blank" rel="noopener noreferrer">
    </a>
    <div class="card">
        <div class="left" onclick="window.scripts.filterForAuthor('${post.author?.name || ''}')">
            <img src="${post.author?.image.uri}" />
        </div>
        <div class="right">
            <div class="title">${post.author?.name}</div>
            <div class="author"><span title="${printableTime}" class="tooltip?">${hostnameText}</span></div>
        </div>
        <div class="spacer"></div>
        <div class="share" onclick="${sharePost}">${verticalDotsIcon()}</div>
    </div>
    ${thumbnailImage ? link(postLink(post), `<img class="thumbnail" src="${thumbnailImage}" />`, 'image-link') : ''}
    ${title ? `<div class="text b">${link(postLink(post), title)}</div>` : ''}
    ${text ? `<div class="text">${link(postLink(post), text)}</div>` : ''}
    ${comment ? `<div class="text"><a class="link comment" href="${comment}" target="_blank" rel="noopener noreferrer">Comments</a></div>` : ''}
</div>
`;
}

function serializeAttr(attr: unknown) {
  return typeof attr === 'function' ? `(${attr})()` : `${attr}`;
}

function serializeAttrs(attrs = {}) {
  return Object.entries(attrs)
    .map((attr) => ` ${attr[0]}="${serializeAttr(attr[1])}"`)
    .join('');
}

function elem(name: string, attrs = {}, content: string = '') {
  return `<${name}${serializeAttrs(attrs)}>${content}</${name}>`;
}

export function listItem(content: string) {
  return `<li>${content}</li>`;
}

function list(posts: PostWithOpenGraphData[]) {
  return `
<ul id="list" class="one-column">
    ${posts.map((post) => listItem(card(post))).join('')}
</ul>
`;
}

function title(content: string) {
  return elem('title', {}, content);
}

interface WindowProps {
  scripts: typeof scripts
  posts: PostWithOpenGraphData[]
  feeds: {
    makeFeedPageHtml: typeof makeFeedPageHtml,
    listItem: typeof listItem,
    card: typeof card,
  }
}
declare var window: Window & WindowProps

const scripts = {
  // icons
  rotate360Icon(size = 20) {
    return `<svg id="icon" xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32"><defs><style>.cls-1{fill:none;}</style></defs><title>rotate--360</title><path d="M25.95,7.65l.0047-.0039c-.0918-.1094-.197-.2061-.2925-.3125-.1841-.2051-.3672-.41-.5635-.603-.1382-.1358-.2856-.2613-.43-.3907-.1831-.1645-.3657-.3286-.5581-.4824-.1592-.1279-.3244-.2466-.4895-.3667-.1921-.14-.3855-.2768-.5854-.4062-.1743-.1128-.3523-.2188-.5322-.3238q-.3081-.1786-.6253-.3408c-.1846-.0942-.37-.1846-.56-.27-.2224-.1-.449-.1914-.678-.2793-.1894-.0723-.3777-.1455-.5713-.209-.2463-.0815-.498-.1494-.7507-.2163-.1848-.0493-.3674-.1025-.5554-.1431-.29-.0634-.5865-.1074-.8833-.1508-.159-.023-.3145-.0552-.4754-.0728A12.9331,12.9331,0,0,0,6,7.7031V4H4v8h8V10H6.8115A10.961,10.961,0,0,1,16,5a11.1114,11.1114,0,0,1,1.189.0669c.1362.0146.268.042.4026.0615.2509.0366.5014.0742.7468.1275.1592.0346.3144.08.4712.1215.2131.0562.4258.1138.6335.1822.1643.0547.325.1167.4859.1782.1926.0742.3835.1509.5705.2349.1611.0727.3193.15.4763.23q.2677.1363.5262.2867c.153.0893.3046.18.4531.2758.1679.1089.3308.2242.4922.3413.1406.1026.2817.2037.417.3125.1616.1294.3156.2676.47.4063.1225.11.2478.2168.3652.332.1668.1636.3223.3379.4785.5117A10.9928,10.9928,0,1,1,5,16H3A13,13,0,1,0,25.95,7.65Z"/><rect id="_Transparent_Rectangle_" data-name="&lt;Transparent Rectangle&gt;" class="cls-1" width="32" height="32"/></svg>`
  },
  upArrowIcon(size = 20) {
    return  `<svg id="icon" xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32">
  <defs>
    <style>
      .cls-1 {
        fill: none;
      }
    </style>
  </defs>
  <polygon points="16 4 6 14 7.41 15.41 15 7.83 15 28 17 28 17 7.83 24.59 15.41 26 14 16 4"/>
  <rect id="_Transparent_Rectangle_" data-name="&lt;Transparent Rectangle&gt;" class="cls-1" width="32" height="32"/>
  </svg>
  `
  },
  threeColumnIcon(size = 20) {
    return `<svg id="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="${size}" height="${size}"><defs><style>.cls-1{fill:none;}</style></defs><title>thumbnail--2</title><path d="M8,30H4a2,2,0,0,1-2-2V24a2,2,0,0,1,2-2H8a2,2,0,0,1,2,2v4A2,2,0,0,1,8,30ZM4,24v4H8V24Z"/><path d="M18,30H14a2,2,0,0,1-2-2V24a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2v4A2,2,0,0,1,18,30Zm-4-6v4h4V24Z"/><path d="M28,30H24a2,2,0,0,1-2-2V24a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2v4A2,2,0,0,1,28,30Zm-4-6v4h4V24Z"/><path d="M8,20H4a2,2,0,0,1-2-2V14a2,2,0,0,1,2-2H8a2,2,0,0,1,2,2v4A2,2,0,0,1,8,20ZM4,14v4H8V14Z"/><path d="M18,20H14a2,2,0,0,1-2-2V14a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2v4A2,2,0,0,1,18,20Zm-4-6v4h4V14Z"/><path d="M28,20H24a2,2,0,0,1-2-2V14a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2v4A2,2,0,0,1,28,20Zm-4-6v4h4V14Z"/><path d="M8,10H4A2,2,0,0,1,2,8V4A2,2,0,0,1,4,2H8a2,2,0,0,1,2,2V8A2,2,0,0,1,8,10ZM4,4V8H8V4Z"/><path d="M18,10H14a2,2,0,0,1-2-2V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V8A2,2,0,0,1,18,10ZM14,4V8h4V4Z"/><path d="M28,10H24a2,2,0,0,1-2-2V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V8A2,2,0,0,1,28,10ZM24,4V8h4V4Z"/><rect id="_Transparent_Rectangle_" data-name="&lt;Transparent Rectangle&gt;" class="cls-1" width="32" height="32"/></svg>`
  },
  brightnessIcon(size = 20) {
    return `<svg id="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="${size}" height="${size}"><defs><style>.cls-1{fill:none;}</style></defs><title>brightness-contrast</title><rect x="15" y="2" width="2" height="3"/><rect x="27" y="15" width="3" height="2"/><rect x="15" y="27" width="2" height="3"/><rect x="2" y="15" width="3" height="2"/><rect x="6.22" y="5.73" width="2" height="3" transform="translate(-3 7.23) rotate(-45)"/><rect x="23.27" y="6.23" width="3" height="2" transform="translate(2.14 19.63) rotate(-45)"/><rect x="23.77" y="23.27" width="2" height="3" transform="translate(-10.26 24.77) rotate(-45)"/><polygon points="5.47 25.13 7.59 23 9 24.42 6.88 26.54 5.47 25.13"/><path d="M16,8a8,8,0,1,0,8,8A8,8,0,0,0,16,8Zm0,14a6,6,0,0,1,0-12Z"/><rect id="_Transparent_Rectangle_" data-name="&lt;Transparent Rectangle&gt;" class="cls-1" width="32" height="32"/></svg>`
  },
  
  // functions
  setLightMode(mode: 'light' | 'dark' | string) {
    sessionStorage.setItem('light-mode', mode)
    if (mode === 'light') {
      document.documentElement.style.setProperty('--background-color', 'var(--white)')
      document.documentElement.style.setProperty('--color', 'var(--black)')
    } else {
      document.documentElement.style.setProperty('--background-color', 'var(--black)')
      document.documentElement.style.setProperty('--color', 'var(--white)')
    }
  },
  setGridMode(mode: 'three-column' | 'one-column' | string) {
    const listElement = document.getElementById('list')!
    document.getElementById('grid-mode')!.innerHTML = mode === 'three-column' ? '⦙' : scripts.threeColumnIcon()
    listElement.className = mode
    sessionStorage.setItem('grid-mode', mode)
    document.documentElement.style.setProperty('--column-mode', `var(--${mode}-mode)`)
  },
  makeLinksClickable() {
    const cards = Array.from(document.querySelectorAll('div.card-parent'))
    cards.forEach(card => {
      const clickableLinks = Array.from(card.querySelectorAll('div.text a, div.share, div.left, a.image-link'))
      const mainLink = card.querySelector(".main-link");
      clickableLinks.forEach((ele) =>
        ele.addEventListener("click", (e) => e.stopPropagation())
      )

      // avoid triggering again
      mainLink?.addEventListener("click", (e) => e.stopPropagation())

      function handleClick(e: Event) {
        e.stopPropagation()
        const noTextSelected = !window.getSelection()?.toString();

        if (noTextSelected && mainLink) {
          (mainLink as HTMLLinkElement).click()
        }
      }

      card.addEventListener("click", handleClick)
    })
  },
  rerenderList(posts: PostWithOpenGraphData[]) {
    const list = document.getElementById('list')
    if (!list) {
      return
    }
    list.innerHTML = posts.map((post) => window.feeds.listItem(window.feeds.card(post))).join('')
    scripts.makeLinksClickable()
  },
  filterForAuthor(author: string) {
    const searchBar = (document.getElementsByClassName('searchbar')?.[0]) as HTMLInputElement
    if (searchBar) {
      searchBar.value = author
      scripts.searchPosts(author)
      // scroll can be cancelled when layout changes hence the delay
      setTimeout(() => scripts.scrollToTop(), 100)
    }
  },
  searchPosts(expr: string) {
    function normalize(s: string | undefined): string {
      if (!s) {
        return ''
      }
      return s && s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
    }
    expr = normalize(expr)
    const posts = 
      expr === '' 
      ? window.posts 
      : window.posts.filter(post => normalize(post.author?.name).includes(expr) || normalize(post.author?.uri).includes(expr) || normalize(post.text).includes(expr))

    scripts.rerenderList(posts)
  },
  sharePost(id: string | undefined) {
    const post = window.posts.find(post => post._id === id)
    if (!post) {
      return
    }
    const url = `${window.location.origin}/myfeed`
    console.debug({ url, post })
    fetch(url, { method: 'PUT', body: JSON.stringify(post) })
  },
  scrollToTop() {
    window.scrollTo({top: 0, behavior: 'smooth'})
  },
  showLoader() {
    document.getElementById('loader')!.style.display = 'block'
    document.getElementById('search')!.style.display = 'none'
  },
  showSearchBar() {
    document.getElementById('loader')!.style.display = 'none'
    document.getElementById('search')!.style.display = 'flex'
  },
  initSearchBar() {
    const searchBar = (document.getElementsByClassName('searchbar')?.[0]) as HTMLInputElement
    if (!searchBar) {
      return
    }

    searchBar.addEventListener('input', () => scripts.searchPosts(searchBar.value))
    if (!searchBar.form) {
      return
    }
    searchBar.form.addEventListener('reset', () => scripts.searchPosts(''))
    searchBar.form.addEventListener('submit', (e) => { e.preventDefault(); searchBar.blur() })
  },
  initScrollReloadButton() {
    const button = Array.from(document.getElementsByClassName('back-to-top'))[0]
    if (!button) {
      return
    }

    const reloadText = scripts.rotate360Icon()
    const backToTopText = scripts.upArrowIcon()
  
    let lastValue: string | undefined = undefined
    setInterval(() => {
      if (window.scrollY === 0) {
        if (lastValue !== reloadText) {
          button.innerHTML = reloadText
          lastValue = reloadText
        }
      } else {
        if (lastValue !== backToTopText) {
          button.innerHTML = backToTopText
          lastValue = backToTopText
        }
      }
    }, 1000)
  },
  reload() {
    fetch(window.location.href)
    .then(response => response.text())
    .then(html => {
      const backgroundColor = document.documentElement.style.getPropertyValue('--background-color')
      const color = document.documentElement.style.getPropertyValue('--color')
      const columnMode = sessionStorage.getItem('grid-mode')
      html = html.replace(':' + 'root {', ':' +`root {--stored-background-color: ${backgroundColor};--stored-color: ${color};--stored-column-mode: var(--${columnMode}-mode);`)
      document.write(html)
      document.close()
    })
  },
  init() {
    document.addEventListener('DOMContentLoaded', () => { 
      const columnMode = sessionStorage.getItem('grid-mode')
      if (columnMode) {
        scripts.setGridMode(columnMode)
      }

      const lightMode = sessionStorage.getItem('light-mode')
      if (lightMode) {
        scripts.setLightMode(lightMode)
      } else {
        scripts.setLightMode('light')
      }

      scripts.makeLinksClickable()
      scripts.initSearchBar()
      scripts.initScrollReloadButton()
      console.debug('onDOMContentLoaded', { sessionStorage, columnMode, lightMode })      
    })
  },
}

function topbar() {
  const logoOnClick = () => {
    window.scripts.showLoader()
    window.scrollTo({top: 0, behavior: 'smooth'});
    window.scripts.reload();
  };
  const lightModeOnClick = () => {
    if (sessionStorage.getItem('light-mode') === 'dark') {
      window.scripts.setLightMode('light')
    } else {
      window.scripts.setLightMode('dark')
    }
  }
  const gridModeOnClick = () => {
    if (document.getElementById('list')!.className === 'three-column') {
      window.scripts.setGridMode('one-column')
    } else {
      window.scripts.setGridMode('three-column')
    }
  }
  return elem(
    'header',
    {class: 'topbar'},
    elem('img', {src: logoDataUrl, class: 'logo', onclick: logoOnClick})
    +
    elem('div', {class: 'spacer' })
    +
    elem(
      'button',
      {
        id: 'grid-mode',
        onclick: gridModeOnClick,
      },
      scripts.threeColumnIcon(),
    )
    +
    elem(
      'button',
      {
        id: 'light-mode',
        onclick: lightModeOnClick,
      },
      scripts.brightnessIcon(),
    )
  )
}

const backToTopButton = () => {
  const reloadText = scripts.rotate360Icon()
  const onclick = () => {
    if (window.scrollY === 0) {
      window.scripts.showLoader()
      window.scripts.reload()
    } else {
      window.scripts.scrollToTop()
    }
  }
  return elem('div', { class: 'back-to-top', onclick }, reloadText)
}


const spinner = `<div id="loader" class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>`

const spinnerStyle = `
    .lds-ellipsis {
        display: none;
        position: relative;
        width: 40px;
        height: 32px;
        margin-left: calc(50% - (${PADDING} * 4));
        margin-top: calc(2 * ${PADDING});
      }
      .lds-ellipsis div {
        position: absolute;
        width: var(--loader-size);
        height: var(--loader-size);
        border-radius: 50%;
        background: #88888888;
        animation-timing-function: cubic-bezier(0, 1, 1, 0);
      }
      .lds-ellipsis div:nth-child(1) {
        left: var(--loader-offset);
        animation: lds-ellipsis1 0.6s infinite;
      }
      .lds-ellipsis div:nth-child(2) {
        left: calc(var(--loader-offset) * 2);
        animation: lds-ellipsis2 0.6s infinite;
      }
      .lds-ellipsis div:nth-child(3) {
        left: calc(var(--loader-offset) * 4);
        animation: lds-ellipsis2 0.6s infinite;
      }
      .lds-ellipsis div:nth-child(4) {
        left: calc(var(--loader-offset) * 4);
        animation: lds-ellipsis3 0.6s infinite;
      }
      @keyframes lds-ellipsis1 {
        0% {
          transform: scale(0);
        }
        100% {
          transform: scale(1);
        }
      }
      @keyframes lds-ellipsis3 {
        0% {
          transform: scale(1);
        }
        100% {
          transform: scale(0);
        }
      }
      @keyframes lds-ellipsis2 {
        0% {
          transform: translate(0, 0);
        }
        100% {
          transform: translate(calc(var(--loader-size) * 2), 0);
        }
      }     
`

function searchBar() {
  return `
<form class="search-form" id="search">
  <input type="search" id="searchbar" class="searchbar" placeholder="Search or filter..."></input>
  <button type="reset" class="search-reset">&times;</button>
</form>`
}

function style() {
  return `
<style>
:root {
  --color-base: #191919;
  --color-step-10: #272727;
  --color-step-20: #3f3f3f;
  --color-step-30: #7c7c7c;
  --color-step-40: #b3b3b3;
  --color-step-50: #ededed;
  --color-accent: #fefefe;

  --white: var(--color-step-50);
  --black: var(--color-base);

  --background-color: var(--stored-background-color, var(--white));
  --color: var(--stored-color, var(--color));

  --max-column-width: min(500px, max(100vmin, 320px)); 
  --three-column-mode: repeat(3, 1fr);
  --one-column-mode: var(--max-column-width);
  --column-mode: var(--stored-column-mode, var(--one-column-mode));

  --padding: ${PADDING};
  --half-padding: calc(var(--padding) / 2);

  --header-height: calc(var(--padding) * 5);

  --loader-offset: ${PADDING};
  --loader-size: ${PADDING}; 
}
body {
    width: 100vw;
    font-family: sans-serif;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    background-color: var(--background-color);
    color: var(--color);
    margin: 0;
    padding: 0;
    font-size: 15px;
    overflow-x: hidden;
    overflow-y: auto;
}
header {
    display: flex;
    flex-direction: row;
    width: 100vw;
    height: var(--header-height);
    z-index: 1;
    background-color: ${THEME_COLOR};
    top: 0;
}
input:focus {
    outline: none;
}
.header-placeholder {
    height: 0.1em;
}
ul {
    display: grid;
    gap: var(--padding);
    padding: 0;
    margin: 0;
    margin-top: 1em;
    margin-bottom: 1em;
    justify-content: center;
    list-style-type: none;
}
li {
    display: flex;
    flex-direction: column;
    overflow: wrap;
}
a {
    text-decoration: none;
    color: inherit;
    font-size: inherit;
}
button {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: calc(var(--padding) * 5);
    height: calc(var(--padding) * 3);
    background-color: inherit;
    border-radius: 4px;
    color: #fff8;
    fill: #fff8;
    font-size: 20px;
    cursor: pointer;  
    margin: var(--half-padding);
    padding: var(--padding);
    border: 1px solid #fff8;
    align-self: center;
    box-shadow: 0.5px 0.5px 1px #fff8;
}
.dark {
    background-color: ${BLACK_COLOR};
    color: ${WHITE_COLOR};
}
.light {
    background-color: ${WHITE_COLOR};
    color: ${BLACK_COLOR};
}
.three-column {
    grid-template-columns: var(--column-mode);
}
.one-column {
    grid-template-columns: var(--column-mode);
}
.thumbnail {
    width: 100%;
    height: auto;
}
.search-form {
  display: flex;
  flex-direction: row;
  justify-content: stretch;
  align-items: center;
  margin-left: calc((100vw - var(--max-column-width)) / 2 + var(--padding));
  margin-right: calc((100vw - var(--max-column-width)) / 2 + var(--padding));
  margin-top: var(--padding);
  border-color: #88888888;
  border-width: 1px;
  border-radius: 4px;
  border-style: solid;
  padding: var(--padding);
  background-color: var(--background-color);
  color: var(--color);
  height: 20px;
}
.searchbar {
  display: flex;
  flex-grow: 1;
  font-size: 14px;
  border: 0;
  padding: 0;
  background-color: var(--background-color);
  color: var(--color);
}
.search-reset {
  color: #888;
  margin: 0;
  padding: 0;
  min-width: unset;
  height: unset;
  border: 0;
  box-shadow: unset;
  font-size: 16px;
}
.card-parent {
    color: inherit;
    flex-direction: column;
    flex-grow: 1;
    background-color: #88888822;
    padding-bottom: var(--half-padding);
    position: relative;
    cursor: pointer;
}
.card-parent:hover {
    background-color: #88888888;
}
.card-parent:active {
    background-color: #88888822;
}
.card-link {
}
.card {
    display: flex;
    flex-direction: row;
    margin: var(--padding);
}
.left {
    align-items: center;
    display: flex;
}
.left img { 
    width: calc(3 * var(--padding));
    height: calc(3 * var(--padding));
}
.right {
    padding-left: var(--padding);
    display: flex;
    flex-direction: column;
}
.share {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 32px;
  cursor: pointer;
  color: var(--color-step-30);
  fill: var(--color-step-30);
}
.share:hover {
  background-color: var(--color-step-40);
}
.title {
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    -webkit-line-clamp: 2;
    font-size: 14px;
}
.author {
    font-size: 12px;
    color: gray;
}
.tooltip { border-bottom: 1px dotted #333; position: relative; cursor: pointer; }
.tooltip:hover:after { content: attr(title); position: absolute; white-space: nowrap; background: rgba(0, 0, 0, 0.85); padding: 3px 7px; color: #FFF; border-radius: 3px; -moz-border-radius: 3px; -webkit-border-radius: 3px; margin-left: 7px; margin-top: -3px; }
.text {
    margin: var(--padding);
    overflow: hidden;
    -webkit-line-clamp: 6;
    -webkit-box-orient: vertical;
    display: -webkit-box;
}
.comment {
    margin-top: var(--padding);
    margin-bottom: var(--padding);
}
.link {
  text-decoration: underline;
}
.b {
    font-weight: bold;
}
.logo-container {
    display: flex;
    flex-grow: 1;
    justify-content: flex-start;
}
.spacer {
  flex-grow: 1;
}
.logo {
  cursor: pointer;
}
.back-to-top {
  position: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  bottom: calc(var(--padding) * 5);
  right: calc(var(--padding) * 5);
  width: calc(var(--padding) * 5);
  height: calc(var(--padding) * 5);
  background-color: #88888844;
  border-radius: 4px;
  color: var(--color);
  fill: var(--color);
  font-size: 24px;
  cursor: pointer;
  user-select: none;
  backdrop-filter: blur(15px);
}
${spinnerStyle}
</style>
`;
}

export function serializeScripts(obj: object) {
  return Object.entries(obj).map(fun => `${fun[1]}`).join(',')
}

function page(posts: PostWithOpenGraphData[], script?: string) {
  const sanitizedPosts = posts.map(post => ({ ...post, rssItem: { ...post.rssItem, content: undefined }}))
  const manifest = JSON.stringify({
    name: APP_NAME,
    short_name: APP_NAME,
    background_color: THEME_COLOR,
    theme_color: THEME_COLOR,
    display: "standalone",
    start_url: 'https://test.felfele.org/feeds',
    icons: [
      {
        src: logoDataUrl,
        type: 'image/png',
        sizes: '128x128',
      }
    ]
  });
  const manifestDataUrl = `data:application/manifest+json,${encodeURIComponent(manifest)}`
  return `
    <!DOCTYPE html>
    ${elem(
      'html',
      {lang: 'en'},
      `
        ${elem(
          'head',
          {},
          `
            ${elem('meta', {charset: 'UTF-8'})}
            ${elem('meta', {name: 'theme-color', content: THEME_COLOR})}
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <!-- <meta name="viewport" content="viewport-fit=cover"> -->
            <meta name="mobile-web-app-capable" content="yes">
            <meta name="apple-mobile-web-app-capable" content="yes"> 
            <meta name="apple-mobile-web-app-status-bar-style" content="black-transparent">
            <meta name="apple-mobile-web-app-title" content="${APP_NAME}">
            <link rel="apple-touch-icon" href="${logoDataUrl}">
            <meta name="apple-mobile-web-app-capable" content="yes">
            <meta name="apple-touch-fullscreen" content="yes">
            ${elem('link', {rel: 'shortcut icon', href: logoDataUrl})}
            ${elem('script', {}, `scripts = {${serializeScripts(scripts)}}`)}
            ${style()}
            ${elem('link', {rel: 'manifest', href: manifestDataUrl})}
        `,
        )}
        ${elem(
          'body',
          {
          },
          `
            ${topbar()}
            ${elem('div', {class: 'header-placeholder'})}
            ${spinner}
            ${searchBar()}
            ${list(posts)}
            ${backToTopButton()}
          `,
        )}
        <script>
          scripts.init()
        </script>
        <!-- TODO escaping issue with posts -->
        ${elem('script', {}, `posts = ${JSON.stringify(sanitizedPosts, undefined, 4)};`)}
        ${script ? elem('script', {id: 'feeds.js'}, script) : ''}
    `,
    )}

`;
}

export function makeFeedPageHtml(
  posts: PostWithOpenGraphData[],
  script?: string,
) {
  return page(posts, script);
}
