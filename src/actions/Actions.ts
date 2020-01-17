import { ActionsUnion } from './types';
import { ActionTypes } from './ActionTypes';
import { createAction } from './actionHelpers';
import { Feed } from '../models/Feed';
import { ContentFilter } from '../models/ContentFilter';
import { AppState } from '../reducers/AppState';
import { Post } from '../models/Post';
import { ImageData } from '../models/ImageData';

export type Actions = ActionsUnion<typeof Actions & typeof InternalActions>;

export const InternalActions = {
    addFeed: (feed: Feed) =>
        createAction(ActionTypes.ADD_FEED, { feed }),
    updateFeedFavicon: (feed: Feed, favicon: string) =>
        createAction(ActionTypes.UPDATE_FEED_FAVICON, {feed, favicon}),
    appStateSet: (appState: AppState) =>
        createAction(ActionTypes.APP_STATE_SET, { appState }),
};

export const Actions = {
    addContentFilter: (text: string, createdAt: number, validUntil: number) =>
        createAction(ActionTypes.ADD_CONTENT_FILTER, { text, createdAt, validUntil }),
    removeContentFilter: (filter: ContentFilter) =>
        createAction(ActionTypes.REMOVE_CONTENT_FILTER, { filter }),

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

    deletePost: (post: Post) =>
        createAction(ActionTypes.DELETE_POST, { post }),
    removeAllPosts: () =>
        createAction(ActionTypes.REMOVE_ALL_POSTS),
    updatePostLink: (post: Post, link?: string) =>
        createAction(ActionTypes.UPDATE_POST_LINK, {post, link}),
    updatePostIsUploading: (post: Post, isUploading?: boolean) =>
        createAction(ActionTypes.UPDATE_POST_IS_UPLOADING, { post, isUploading }),
    updatePostImages: (post: Post, images: ImageData[]) =>
        createAction(ActionTypes.UPDATE_POST_IMAGES, {post, images}),
    updateRssPosts: (posts: Post[]) =>
        createAction(ActionTypes.UPDATE_RSS_POSTS, { posts }),

    changeSettingShowSquareImages: (value: boolean) =>
        createAction(ActionTypes.CHANGE_SETTING_SHOW_SQUARE_IMAGES, { value }),
    changeSettingShowDebugMenu: (value: boolean) =>
        createAction(ActionTypes.CHANGE_SETTING_SHOW_DEBUG_MENU, { value }),
    changeSettingSwarmGatewayAddress: (value: string) =>
        createAction(ActionTypes.CHANGE_SETTING_SWARM_GATEWAY_ADDRESS, { value }),

    appStateReset: () =>
        createAction(ActionTypes.APP_STATE_RESET),
};
