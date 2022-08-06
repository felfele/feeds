import { ActionsUnion } from './types'
import { ActionTypes } from './ActionTypes'
import { createAction } from './actionHelpers'
import { Feed } from '../models/Feed'
import { ContentFilter } from '../models/ContentFilter'
import { AppState } from '../reducers/AppState'
import { Post } from '../models/Post'

export type Actions = ActionsUnion<typeof Actions & typeof InternalActions>

export const InternalActions = {
    addFeed: (feed: Feed) =>
        createAction(ActionTypes.ADD_FEED, { feed }),
    updateFeedFavicon: (feed: Feed, favicon: string) =>
        createAction(ActionTypes.UPDATE_FEED_FAVICON, {feed, favicon}),
    updateFeed: (feedUrl: string, feed: Feed) =>
        createAction(ActionTypes.UPDATE_FEED, { feedUrl, feed }),
    appStateSet: (appState: AppState) =>
        createAction(ActionTypes.APP_STATE_SET, { appState }),
}

export const Actions = {
    addContentFilter: (text: string, createdAt: number, validUntil: number) =>
        createAction(ActionTypes.ADD_CONTENT_FILTER, { text, createdAt, validUntil }),
    removeContentFilter: (filter: ContentFilter) =>
        createAction(ActionTypes.REMOVE_CONTENT_FILTER, { filter }),
    removeAllContentFilters: () =>
        createAction(ActionTypes.REMOVE_ALL_CONTENT_FILTERS),

    removeFeed: (feed: Feed) =>
        createAction(ActionTypes.REMOVE_FEED, { feed }),
    followFeed: (feed: Feed) =>
        createAction(ActionTypes.FOLLOW_FEED, { feed }),
    unfollowFeed: (feed: Feed) =>
        createAction(ActionTypes.UNFOLLOW_FEED, { feed }),
    toggleFeedFavorite: (feedUrl: string) =>
        createAction(ActionTypes.TOGGLE_FEED_FAVORITE, { feedUrl }),
    cleanFeedsFromOwnFeeds: (feedUrls: string[]) =>
        createAction(ActionTypes.CLEAN_FEEDS_FROM_OWN_FEEDS, { feedUrls }),
    removeAllFeeds: () =>
        createAction(ActionTypes.REMOVE_ALL_FEEDS),
    mergeFeedsWithExistingFeeds: (feeds: Feed[]) =>
        createAction(ActionTypes.MERGE_FEEDS_WITH_EXISTING_FEEDS, { feeds }),

    timeTick: () =>
        createAction(ActionTypes.TIME_TICK),

    updateRssPosts: (posts: Post[]) =>
        createAction(ActionTypes.UPDATE_RSS_POSTS, { posts }),
    removeRssPost: (post: Post) =>
        createAction(ActionTypes.REMOVE_RSS_POST, { post }),

    changeSettingShowSquareImages: (value: boolean) =>
        createAction(ActionTypes.CHANGE_SETTING_SHOW_SQUARE_IMAGES, { value }),
    changeSettingShowDebugMenu: (value: boolean) =>
        createAction(ActionTypes.CHANGE_SETTING_SHOW_DEBUG_MENU, { value }),
    changeSettingSwarmGatewayAddress: (value: string) =>
        createAction(ActionTypes.CHANGE_SETTING_SWARM_GATEWAY_ADDRESS, { value }),

    appStateReset: () =>
        createAction(ActionTypes.APP_STATE_RESET),
}
