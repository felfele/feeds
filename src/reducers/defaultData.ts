import { AppState } from './AppState';
import { Settings } from '../models/Settings';
import { Author } from '../models/Author';
import { Post } from '../models/Post';
import { Feed } from '../models/Feed';
import { defaultImages } from '../defaultImages';
import { defaultGateway } from '../swarm/Swarm';

export const defaultSettings: Settings = {
    showSquareImages: false,
    showDebugMenu: false,
    swarmGatewayAddress: defaultGateway,
};

export const DEFAULT_AUTHOR_NAME = '';

export const defaultAuthor: Author = {
    name: DEFAULT_AUTHOR_NAME,
    uri: '',
    image: {
        uri: '',
    },
};

export const FEEDS_ASSISTANT_NAME = 'Feeds app';
export const FEEDS_ASSISTANT_URL = 'local/onboarding';

const onboardingAuthor: Author = {
    name: FEEDS_ASSISTANT_NAME,
    uri: FEEDS_ASSISTANT_URL,
    image: {
        localPath: defaultImages.felfeleAssistant,
    },
};

const defaultPost1: Post = {
    _id: 0,
    createdAt: Date.now(),
    images: [],
    text: `Welcome to Feeds app!

Feeds is a completely free and independent mobile RSS reader with the following features:

- Follow news sites and blogs (e.g. Wordpress). Tap the plus icon on the top right and enter a link.

- You can also follow Reddit subs, Youtube channels, Tumblr and Mastodon

- No signup, registration or tracking: everything happens and stays on your phone

- Export and import feeds between your devices or with your friends

- No ads or algorithmic timeline: what you see is what you follow

- Mute content with keywords

- Explore new content with the built-in category browser. Tap the grid icon on the top left and select Explore.

We would like to hear about you! You can always ask questions or send feedback to us at [hello@felfele.org](mailto:hello@felfele.org)

If you find something is broken or you don't like please send us a bug report from the Settings menu.

`,
    author: onboardingAuthor,
};

export const defaultLocalPosts = [defaultPost1];

export const defaultCurrentTimestamp = 0;

export const defaultMetadata = {
    highestSeenPostId: defaultLocalPosts.length - 1,
};

export const defaultFeeds: Feed[] = [
    {
        name: FEEDS_ASSISTANT_NAME,
        url: FEEDS_ASSISTANT_URL,
        feedUrl: FEEDS_ASSISTANT_URL,
        favicon: defaultImages.felfeleAssistant,
        followed: true,
    },
];

export const defaultState: AppState = {
    contentFilters: [],
    feeds: defaultFeeds,
    settings: defaultSettings,
    currentTimestamp: defaultCurrentTimestamp,
    rssPosts: defaultLocalPosts,
};
