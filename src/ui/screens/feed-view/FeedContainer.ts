import { connect } from 'react-redux';
import { AppState } from '../../../reducers/AppState';
import { StateProps, DispatchProps, FeedView, ViewFeed } from './FeedView';
import { Actions } from '../../../actions/Actions';
import { AsyncActions } from '../../../actions/asyncActions';
import { Feed } from '../../../models/Feed';
import { getFeedPosts } from '../../../selectors/selectors';
import { TypedNavigation } from '../../../helpers/navigation';

const emptyFeed = (name: string = '', isOwnFeed: boolean = false, isLocalFeed = false): ViewFeed => ({
    name,
    feedUrl: '',
    url: '',
    favicon: '',
    isOwnFeed,
    isLocalFeed,
});

const feedToViewFeed = (feed: Feed): ViewFeed => ({
    ...feed,
    isOwnFeed: false,
    isLocalFeed: false,
});

export const mapStateToProps = (state: AppState, ownProps: { navigation: TypedNavigation }): StateProps => {
    const feedUrl = ownProps.navigation.getParam<'Feed', 'feedUrl'>('feedUrl');
    const feedName = ownProps.navigation.getParam<'Feed', 'name'>('name');

    const otherFeeds = state.feeds;
    const otherFeed = otherFeeds.find(feed => feed.feedUrl === feedUrl);
    const selectedFeed = otherFeed != null
        ? feedToViewFeed(otherFeed)
        : emptyFeed()
    ;
    // Note: this is a moderately useful selector (recalculated if another feedUrl is opened (cache size == 1))
    // see https://github.com/reduxjs/reselect/blob/master/README.md#accessing-react-props-in-selectors
    const feedPosts = getFeedPosts(state, feedUrl);
    const posts = feedPosts;
    return {
        onBack: () => ownProps.navigation.popToTop(),
        navigation: ownProps.navigation,
        posts,
        feed: selectedFeed,
    };
};

export const mapDispatchToProps = (dispatch: any): DispatchProps => {
    return {
        onRefreshPosts: (feeds: Feed[]) => {
            dispatch(AsyncActions.downloadPostsFromFeeds(feeds));
        },
        onUnfollowFeed: (feed: Feed) => {
            dispatch(Actions.unfollowFeed(feed));
        },
        onFollowFeed: (feed: Feed) => {
            dispatch(Actions.followFeed(feed));
        },
        onToggleFavorite: (feedUrl: string) => {
            dispatch(Actions.toggleFeedFavorite(feedUrl));
        },
        onRemoveFeed: (feed: Feed) => {
            dispatch(Actions.removeFeed(feed));
        },
    };
};

export const FeedContainer = connect(
    mapStateToProps,
    mapDispatchToProps,
)(FeedView);
