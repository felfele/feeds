import {OpenGraphData} from '../helpers/openGraph';
import {Post} from '../models/Post';
import {logoDataUrl} from './logo-data-url';

export type PostWithOpenGraphData = Post & {og?: OpenGraphData};

const THEME_COLOR = '#6200EA'
const APP_NAME = 'Feeds'

function thumbnailImageSrc(post: PostWithOpenGraphData) {
  return post.images[0]?.uri ? post.images[0]?.uri : post.og?.image;
}

function postTitle(post: PostWithOpenGraphData) {
  return post.rssItem?.title || post.author?.name;
}

function postLink(post: PostWithOpenGraphData) {
  return post.link ? post.link : post.og?.url ?? '';
}

function postText(post: PostWithOpenGraphData) {
  if (!post.text) {
    return;
  }

  return post.text
    .replace(/^\*\*.*\*\*/m, '')
    .replace(/\[(.*?)\]\((.*?)\)/gm, `</a><a class="text-link" target="_blank" rel="noopener noreferrer" href="$2">$1</a><a href="${postLink(post)}">`);
}

function fixYoutubeThumbnail(image: string | undefined) {
  const replacement = 'hq720'; // can be also 'mqdefault' for medium resolution
  return image ? image.replace(/hqdefault.jpg$/, `${replacement}.jpg`) : image;
}

function link(href: string, content: string) {
  return `<a href="${href}" target="_blank" rel="noopener noreferrer">${content}</a>`
}

function card(post: PostWithOpenGraphData) {
  const thumbnailImage = fixYoutubeThumbnail(thumbnailImageSrc(post));
  const text = postText(post);
  return `
<div class="card-parent">
    <a href="${postLink(post)}" target="_blank" rel="noopener noreferrer">
    ${thumbnailImage ? `<img class="thumbnail" src="${thumbnailImage}" />` : ''}
    <div class="card">
        <div class="left">
            <img src="${post.author?.image.uri}" />
        </div>
        <div class="right">
            <div class="title">${postTitle(post)}</div>
            <div class="author">${post.author?.name}</div>
        </div>
    </div>
    </a>
    ${text ? `<span class="text">${link(postLink(post), text)}</span>` : ''}
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

function listItem(content: string) {
  return `<li>${content}</li>`;
}

function list(posts: PostWithOpenGraphData[]) {
  return `
<ul id="list" class="three-column">
    ${posts.map((post) => listItem(card(post))).join('')}
</ul>
`;
}

function title(content: string) {
  return elem('title', {}, content);
}

const scripts = {
  setLightMode(mode: 'light' | 'dark' | string) {
    document.getElementById('light-mode')!.innerText = mode === 'light' ? 'dark' : 'light'
    sessionStorage.setItem('light-mode', mode)
    if (mode === 'light') {
      document.documentElement.style.setProperty('--background-color', 'white')
      document.documentElement.style.setProperty('--color', 'black')
    } else {
      document.documentElement.style.setProperty('--background-color', 'black')
      document.documentElement.style.setProperty('--color', 'white')
    }
  },
  setGridMode(mode: 'three-column' | 'one-column' | string) {
    const listElement = document.getElementById('list')!
    document.getElementById('grid-mode')!.innerText = mode === 'three-column' ? '1x' : '3x'
    listElement.className = mode
    sessionStorage.setItem('grid-mode', mode)
    document.documentElement.style.setProperty('--column-mode', `var(--${mode}-mode)`)
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
      }

      console.debug('onDOMContentLoaded', { sessionStorage, columnMode, lightMode })      
    })
  },
}

declare var window: Window & {scripts: typeof scripts}

function topbar() {
  const logoOnClick = () => {
    document.getElementById('loader')!.style.display = 'block'
    window.scrollTo({top: 0, behavior: 'smooth'});
    window.scripts.reload();
  };
  const lightModeOnClick = () => {
    if (document.getElementById('light-mode')!.innerText === 'light') {
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
    elem(
      'button',
      {
        id: 'light-mode',
        onclick: lightModeOnClick,
      },
      'light',
    ) +
      elem(
        'button',
        {
          id: 'grid-mode',
          onclick: gridModeOnClick,
        },
        '1x',
      ) +
      elem(
        'div',
        {class: 'logo-container'},
        elem('img', {src: logoDataUrl, class: 'logo', onclick: logoOnClick}),
      ),
  );
}
const spinner = `<div id="loader" class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>`

const spinnerStyle = `
    .lds-ellipsis {
        display: none;
        position: relative;
        width: 40px;
        height: 20px;
        margin-left: calc(50% - (80px / 2));
        margin-top: 1em;
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
        left: var(--loader-offset);
        animation: lds-ellipsis2 0.6s infinite;
      }
      .lds-ellipsis div:nth-child(3) {
        left: calc(var(--loader-offset) * 4);
        animation: lds-ellipsis2 0.6s infinite;
      }
      .lds-ellipsis div:nth-child(4) {
        left: calc(var(--loader-offset) * 6);
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
          transform: translate(24px, 0);
        }
      }     
`

function style() {
  return `
<style>
:root {
  --background-color: var(--stored-background-color, black);
  --color: var(--stored-color, white);
  --three-column-mode: repeat(3, 1fr);
  --one-column-mode: min(100vw, 66vh);
  --column-mode: var(--stored-column-mode, var(--one-column-mode));
  --header-height: max(3em, 6vh);
  --loader-offset: 8px;
  --loader-size: 10px;
}
body {
    width: 100vw;
    font-family: sans-serif;
    background-color: var(--background-color);
    color: var(--color);
    margin: 0;
    padding: 0;
}
header {
    display: flex;
    flex-direction: row-reverse;
    width: 100vw;
    height: var(--header-height);
    position: fixed;
    z-index: 1;
    background-color: #6200EA;
    top: 0;
    backdrop-filter: blur(15px);
}
.header-placeholder {
    height: calc(var(--header-height) + .1em);
}
ul {
    display: grid;
    gap: max(1em, 1.5vh);
    padding: 0;
    margin: 0;
    margin-top: 1em;
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
}
button {
    margin: 0.5em;
    padding-left: 0.4em;
    padding-right: 0.4em;
    min-width: max(4em, 5vh);
    font-size: max(1em, 1.1vh);
}
.dark {
    background-color: black;
    color: white;
}
.light {
    background-color: white;
    color: black;
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
.card-parent {
    color: inherit;
    flex-direction: column;
    flex-grow: 1;
    background-color: #88888822;
}
.card-parent:hover {
    background-color: #88888888;
}
.card-link {
}
.card {
    display: flex;
    flex-direction: row;
    margin: 0.8em;
}
.left {
    margin-left: 0.5vh;
    margin-top: 0.5vh;
    margin-right: 0.5vh;
}
.left img { 
    width: max(1.8em, 4vh);
    height: max(1.8em, 4vh);
}
.right {
    padding-left: 0.4em;
}
.title {
    font-size: max(1em, 1.8vh);
    font-weight: bold;
    display: -webkit-box;
    overflow: hidden;
    text-overflow: ellipsis;
    -webkit-line-clamp: 2;
}
.author {
    font-size: max(0.8em, 1.1vh);
    color: gray;
}
.text {
    margin: 0.8em;
    display: -webkit-box;
    overflow: hidden;
    -webkit-line-clamp: 6;
    -webkit-box-orient: vertical;
    font-size: max(1em, 1.8vh);
}
.text-link:hover {
  text-decoration: underline;
}
.logo-container {
    display: flex;
    flex-grow: 1;
    justify-content: flex-start;
}
.logo {
  cursor: pointer;
}
${spinnerStyle}
</style>
`;
}

function serializeScripts(obj: object) {
  return Object.entries(obj).map(fun => `${fun[1]}`).join(',')
}

function page(posts: PostWithOpenGraphData[], meta: Partial<OpenGraphData>) {
  const manifest = JSON.stringify({
    name: APP_NAME,
    short_name: APP_NAME,
    background_color: THEME_COLOR,
    theme_color: THEME_COLOR,
    display: "standalone",
    start_url: 'https://test.felfele.org/feeds',
    
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
            <meta name="viewport" content="viewport-fit=cover">
            <meta name="mobile-web-app-capable" content="yes">
            <meta name="apple-mobile-web-app-capable" content="yes"> 
            <meta name="apple-mobile-web-app-status-bar-style" content="black-transparent">
            <meta name="apple-mobile-web-app-title" content="${APP_NAME}">
            <link rel="apple-touch-icon" href="${logoDataUrl}">
            <meta name="apple-mobile-web-app-capable" content="yes">
            <meta name="apple-touch-fullscreen" content="yes">
            ${title(meta?.title || '')}
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
            ${list(posts)}
        `,
        )}
    `,
    )}
    </html>
    <script>
        scripts.init()
    </script>
`;
}

export function makeFeedPageHtml(
  posts: PostWithOpenGraphData[],
  meta: Partial<OpenGraphData> = {},
) {
  return page(posts, meta);
}