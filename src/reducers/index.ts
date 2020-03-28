import { combineReducers } from 'redux';
import { Actions } from '../actions/Actions';
import { ContentFilter } from '../models/ContentFilter';
import { Feed } from '../models/Feed';
import { Settings } from '../models/Settings';
import { Post } from '../models/Post';
import { Debug } from '../Debug';
import {
    removeFromArray,
    updateArrayItem,
    containsItem,
} from '../helpers/immutable';
import {
    defaultFeeds,
    defaultSettings,
    defaultCurrentTimestamp,
    defaultState,
} from './defaultData';
import { AppState } from './AppState';
import { mergeFeeds } from '../helpers/feedHelpers';

const contentFiltersReducer = (contentFilters: ContentFilter[] = [], action: Actions): ContentFilter[] => {
    switch (action.type) {
        case 'ADD-CONTENT-FILTER': {
            const filter: ContentFilter = {
                text: action.payload.text,
                createdAt: action.payload.createdAt,
                validUntil: action.payload.validUntil,
            };
            return [...contentFilters, filter];
        }
        case 'REMOVE-CONTENT-FILTER': {
            const ind = contentFilters.findIndex(filter => filter != null && action.payload.filter.text === filter.text);
            if (ind === -1) {
                return contentFilters;
            }
            return removeFromArray(contentFilters, ind);
        }
        case 'REMOVE-ALL-CONTENT-FILTERS': {
            return [];
        }
        default: {
            return contentFilters;
        }
    }
};

const feedsReducer = (feeds: Feed[] = defaultFeeds, action: Actions): Feed[] => {
    switch (action.type) {
        case 'ADD-FEED': {
            const ind = feeds.findIndex(feed => feed != null && action.payload.feed.feedUrl === feed.feedUrl);
            if (ind === -1) {
                return [...feeds, {
                    ...action.payload.feed,
                    followed: true,
                }];
            } else if (feeds[ind].followed === false) {
                return updateArrayItem(feeds, ind, feed => {
                    return {
                        ...feed,
                        followed: true,
                    };
                });
            }

            return feeds;
        }
        case 'REMOVE-FEED': {
            const ind = feeds.findIndex(feed => feed != null && action.payload.feed.feedUrl === feed.feedUrl);
            if (ind === -1) {
                return feeds;
            }
            return removeFromArray(feeds, ind);
        }
        case 'FOLLOW-FEED': {
            const ind = feeds.findIndex(feed => feed != null && action.payload.feed.feedUrl === feed.feedUrl);
            if (ind === -1) {
                return feeds;
            }
            return updateArrayItem(feeds, ind, feed => {
                return {
                    ...feed,
                    followed: true,
                };
            });
        }
        case 'UNFOLLOW-FEED': {
            const ind = feeds.findIndex(feed => feed != null && action.payload.feed.feedUrl === feed.feedUrl);
            if (ind === -1) {
                return feeds;
            }
            return updateArrayItem(feeds, ind, feed => {
                return {
                    ...feed,
                    favorite: false,
                    followed: false,
                };
            });
        }
        case 'UPDATE-FEED-FAVICON': {
            const ind = feeds.findIndex(feed => feed != null && action.payload.feed.feedUrl === feed.feedUrl);
            if (ind === -1) {
                return feeds;
            }
            return updateArrayItem(feeds, ind, (feed) => ({
                ...feed,
                favicon: action.payload.favicon,
            }));
        }
        case 'UPDATE-FEED': {
            const ind = feeds.findIndex(feed => feed != null && action.payload.feedUrl === feed.feedUrl);
            if (ind === -1) {
                return feeds;
            }
            return updateArrayItem(feeds, ind, (feed) => ({
                ...feed,
                ...action.payload.feed,
            }));
        }
        case 'TOGGLE-FEED-FAVORITE': {
            const ind = feeds.findIndex(feed => feed != null && action.payload.feedUrl === feed.feedUrl);
            if (ind === -1) {
                return feeds;
            }
            return updateArrayItem(feeds, ind, (feed) => ({
                ...feed,
                favorite: !feed.favorite,
            }));
        }
        case 'CLEAN-FEEDS-FROM-OWN-FEEDS': {
            const feedsWithoutOwnFeeds = feeds
                .filter((feed: Feed) => !containsItem(action.payload.feedUrls, (feedUrl: string) => feedUrl === feed.feedUrl));
            return feedsWithoutOwnFeeds;
        }
        case 'REMOVE-ALL-FEEDS': {
            return [];
        }
        case 'MERGE_FEEDS_WITH_EXISTING_FEEDS': {
            const updatedFeeds = mergeFeeds(action.payload.feeds, feeds);
            return updatedFeeds;
        }
        default: {
            return feeds;
        }
    }
};

const settingsReducer = (settings = defaultSettings, action: Actions): Settings => {
    switch (action.type) {
        case 'CHANGE-SETTING-SHOW-SQUARE-IMAGES': {
            return {
                ...settings,
                showSquareImages: action.payload.value,
            };
        }
        case 'CHANGE-SETTING-SHOW-DEBUG-MENU': {
            return {
                ...settings,
                showDebugMenu: action.payload.value,
            };
        }
        case 'CHANGE-SETTING-SWARM-GATEWAY-ADDRESS': {
            return {
                ...settings,
                swarmGatewayAddress: action.payload.value,
            };
        }
    }
    return settings;
};

const currentTimestampReducer = (currentTimestamp = defaultCurrentTimestamp, action: Actions): number => {
    switch (action.type) {
        case 'TIME-TICK': {
            return Date.now();
        }
    }
    return currentTimestamp;
};

const rssPostsReducer = (rssPosts: Post[] = [], action: Actions): Post[] => {
    switch (action.type) {
        case 'UPDATE-RSS-POSTS': {
            return action.payload.posts;
        }
        case 'REMOVE-RSS-POST': {
            return rssPosts.filter(rssPost => rssPost.link !== action.payload.post.link);
        }
    }
    return rssPosts;
};

let ignoreActionsAfterReset = false;

export const appStateReducer = (state: AppState = defaultState, action: Actions): AppState => {
    const startTime = Date.now();
    if (ignoreActionsAfterReset === true) {
        return state;
    }
    switch (action.type) {
        case 'APP-STATE-RESET': {
            Debug.log('App state reset');
            ignoreActionsAfterReset = true;
            return defaultState;
        }
        case 'APP-STATE-SET': {
            Debug.log('App state set');
            return action.payload.appState;
        }
        default: {
            try {
                const newState = combinedReducers(state, action);
                if (action.type !== 'TIME-TICK') {
                    const elapsed = Date.now() - startTime;
                    // tslint:disable-next-line:no-console
                    console.log('appStateReducer', 'elapsed', elapsed, 'action', action, 'newState', newState);
                }
                return newState;
            } catch (e) {
                Debug.log('reducer error: ', e);
                return state;
            }
        }
    }
};

export const combinedReducers = combineReducers<AppState>({
    contentFilters: contentFiltersReducer,
    feeds: feedsReducer,
    settings: settingsReducer,
    currentTimestamp: currentTimestampReducer,
    rssPosts: rssPostsReducer,
});
