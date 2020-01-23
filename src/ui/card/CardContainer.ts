import { connect } from 'react-redux';
import { AppState } from '../../reducers/AppState';
import { StateProps, DispatchProps, MemoizedCard, AuthorFeed } from './Card';
import { Post } from '../../models/Post';
import { Feed } from '../../models/Feed';
import { AsyncActions } from '../../actions/asyncActions';
import { TypedNavigation } from '../../helpers/navigation';
import { getAllFeeds } from '../../selectors/selectors';
import { Debug } from '../../Debug';
import { Actions } from '../../actions/Actions';

interface OwnProps {
    isSelected: boolean;
    post: Post;
    togglePostSelection: (post: Post) => void;
    navigation: TypedNavigation;
}

const getOriginalAuthorFeed = (post: Post, state: AppState): AuthorFeed | undefined => {
    if (post.references == null) {
        return;
    }
    const originalAuthor = post.references.originalAuthor;
    const knownFeed = getAllFeeds(state).find(feed => originalAuthor != null && feed.feedUrl === originalAuthor.uri);
    return knownFeed != null
        ? {
            ...knownFeed,
            isKnownFeed: true,
        }
        : {
            name: originalAuthor.name,
            feedUrl: originalAuthor.uri,
            url: originalAuthor.uri,
            favicon: originalAuthor.image.uri || '',
            isKnownFeed: false,
        }
    ;
};

const getAuthorFeedOrUndefined = (
    feed: Feed | undefined
) => {
    return feed != null
        ? {
            ...feed,
            isKnownFeed: true,
        }
        : undefined
    ;
};

const getAuthorFeed = (post: Post, state: AppState): AuthorFeed | undefined => {
    if (post.author == null) {
        return;
    }
    const postAuthor = post.author;
    const authorFeed = getAuthorFeedOrUndefined(
            state.feeds.find(feed => feed.feedUrl === postAuthor.uri),
        )
    ;

    return authorFeed;
};

const mapStateToProps = (state: AppState, ownProps: OwnProps): StateProps => {
    const authorFeed = getAuthorFeed(ownProps.post, state);
    const originalAuthorFeed = getOriginalAuthorFeed(ownProps.post, state);
    return {
        post: {
            ...ownProps.post,
        },
        currentTimestamp: state.currentTimestamp,
        isSelected: ownProps.isSelected,
        togglePostSelection: ownProps.togglePostSelection,
        showActions: state.settings.showDebugMenu,
        navigation: ownProps.navigation,
        authorFeed,
        originalAuthorFeed,
    };
};

const mapDispatchToProps = (dispatch: any, ownProps: { navigation: TypedNavigation }): DispatchProps => {
    return {
        onRemovePost: (post: Post) => {
            dispatch(Actions.removeRssPost(post));
        },
        onSharePost: (post: Post) => {
            // dispatch(AsyncActions.sharePost(post));
            Debug.log('onSharePost', post);
        },
        onDownloadFeedPosts: (feed: Feed) => {
            dispatch(AsyncActions.downloadPostsFromFeeds([feed]));
        },
    };
};

export const CardContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(MemoizedCard);
