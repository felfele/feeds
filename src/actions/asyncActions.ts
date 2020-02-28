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
            const allPosts = await Utils.timeout(19 * 1000, RSSPostManager.loadPosts(feedsWithoutOnboarding));
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
};

const loadRSSPostsFromFeeds = async (feeds: Feed[]): Promise<Post[]> => {
    const posts = await Utils.timeout(60000, RSSPostManager.loadPosts(feeds));
    return posts;
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
