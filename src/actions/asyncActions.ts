import { Feed } from '../models/Feed';
import { AppState } from '../reducers/AppState';
import { Actions, InternalActions } from './Actions';
import { migrateAppStateToCurrentVersion } from '../store';
import { RSSPostManager } from '../RSSPostManager';
import { FELFELE_ASSISTANT_URL } from '../reducers/defaultData';
import {
    mergeUpdatedPosts,
} from '../helpers/postHelpers';
import { Debug } from '../Debug';
import { Post } from '../models/Post';
import { ThunkTypes, Thunk, isActionTypes } from './actionHelpers';
import { ContentFilter } from '../models/ContentFilter';
import { Utils } from '../Utils';
import { isRedditLink, redditFeedUrl, fetchRedditFeed } from '../helpers/redditFeedHelpers';

export const AsyncActions = {
    addFeed: (feed: Feed): Thunk => {
        return async (dispatch) => {
            dispatch(InternalActions.addFeed(feed));
        };
    },
    cleanupContentFilters: (currentTimestamp: number = Date.now()): Thunk => {
        return async (dispatch, getState) => {
            const expiredFilters = getState().contentFilters.filter(filter =>
                filter ? filter.createdAt + filter.validUntil < currentTimestamp : false
            );
            expiredFilters.map(filter => {
                if (filter != null) {
                    dispatch(Actions.removeContentFilter(filter));
                }
            });
        };
    },
    applyContentFilters: (): Thunk => {
        return async (dispatch, getState) => {
            const rssPosts = getState().rssPosts;
            const contentFilters = getState().contentFilters;
            const filteredPosts = applyContentFiltersToPosts(rssPosts, contentFilters);
            dispatch(Actions.updateRssPosts(filteredPosts));
        };
    },
    downloadFollowedFeedPosts: (): Thunk => {
        return async (dispatch, getState) => {
            const feeds = getState()
                            .feeds
                            .filter(feed => feed.followed === true);

            dispatch(AsyncActions.downloadPostsFromFeeds(feeds));
        };
    },
    downloadPostsFromFeeds: (feeds: Feed[]): Thunk => {
        return async (dispatch, getState) => {
            Debug.log('downloadPostsFromFeeds', feeds);
            const previousPosts = getState().rssPosts;
            const feedsWithoutOnboarding = feeds.filter(feed => feed.feedUrl !== FELFELE_ASSISTANT_URL);
            const allFeedsTimeout = feeds.length > 40
                ? feeds.length * 500
                : 20 * 1000
            ;
            const allPosts = await Utils.timeout(allFeedsTimeout, RSSPostManager.loadPosts(feedsWithoutOnboarding));
            const posts = mergeUpdatedPosts(allPosts, previousPosts);
            const contentFilters = getState().contentFilters;
            const filteredPosts = applyContentFiltersToPosts(posts, contentFilters);
            dispatch(Actions.updateRssPosts(filteredPosts));
        };
    },
    chainActions: (thunks: ThunkTypes[], callback?: () => void): Thunk => {
        return async (dispatch, getState) => {
            for (const thunk of thunks) {
                if (isActionTypes(thunk)) {
                    dispatch(thunk);
                } else {
                    await thunk(dispatch, getState);
                }
            }
            if (callback != null) {
                callback();
            }
        };
    },
    restoreAppStateFromBackup: (appState: AppState): Thunk => {
        return async (dispatch) => {
            const currentVersionAppState = await migrateAppStateToCurrentVersion(appState);
            dispatch(InternalActions.appStateSet(currentVersionAppState));
        };
    },
    fixRedditFeeds: (): Thunk => {
        return async (dispatch, getState) => {
            const redditFeeds = getState().feeds.filter(feed => isRedditLink(feed.feedUrl));
            for (const feed of redditFeeds) {
                const updatedFeed = await fetchRedditFeed(feed.feedUrl);
                Debug.log('fixRedditFeeds', {updatedFeed, feed});
                if (updatedFeed != null) {
                    dispatch(InternalActions.updateFeed(feed.feedUrl, updatedFeed));
                }
            }
        };
    },
};

const matchContentFilters = (text: string, contentFilters: ContentFilter[]): boolean => {
    for (const filter of contentFilters) {
        const regexp = new RegExp(filter.text, 'i');
        if (text.search(regexp) !== -1) {
            return true;
        }
    }
    return false;
};

const applyContentFiltersToPosts = (posts: Post[], contentFilters: ContentFilter[]): Post[] => {
    return posts.filter(post => matchContentFilters(post.text, contentFilters) === false);
};
