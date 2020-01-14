import { Feed } from '../models/Feed';
import { AppState } from '../reducers/AppState';
import { Actions, InternalActions } from './Actions';
import { migrateAppStateToCurrentVersion } from '../store';
import { RSSPostManager } from '../RSSPostManager';
import {
    isPostFeedUrl,
} from '../swarm-social/swarmStorage';
import { FELFELE_ASSISTANT_URL } from '../reducers/defaultData';
import {
    mergeUpdatedPosts,
} from '../helpers/postHelpers';
import { Debug } from '../Debug';
import { Post } from '../models/Post';
import { ThunkTypes, Thunk, isActionTypes } from './actionHelpers';

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
            const allPosts = await Promise.all([
                loadRSSPostsFromFeeds(feedsWithoutOnboarding),
            ]);
            const posts = mergeUpdatedPosts(allPosts[0], previousPosts);
            dispatch(Actions.updateRssPosts(posts));
        };
    },
    removePost: (post: Post): Thunk => {
        return async (dispatch) => {
            dispatch(Actions.deletePost(post));
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
    const rssFeeds = feeds.filter(feed => !isPostFeedUrl(feed.url));
    return await RSSPostManager.loadPosts(rssFeeds);
};
