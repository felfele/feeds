import { connect } from 'react-redux'
import { AppState } from '../../../reducers/AppState'
import { StateProps, DispatchProps, FeedView } from './FeedView'
import { Actions } from '../../../actions/Actions'
import { AsyncActions } from '../../../actions/asyncActions'
import { Feed } from '../../../models/Feed'
import { getFeedPosts } from '../../../selectors/selectors'
import { TypedNavigation } from '../../../helpers/navigation'

const emptyFeed = (name: string = ''): Feed => ({
    name,
    feedUrl: '',
    url: '',
    favicon: '',
})

export const mapStateToProps = (state: AppState, ownProps: { navigation: TypedNavigation }): StateProps => {
    const feedUrl = ownProps.navigation.getParam<'Feed', 'feedUrl'>('feedUrl')
    const feedName = ownProps.navigation.getParam<'Feed', 'name'>('name')

    const selectedFeed = state.feeds.find(feed => feed.feedUrl === feedUrl) || emptyFeed(feedName)
    const posts = getFeedPosts(state, feedUrl)
    return {
        onBack: () => ownProps.navigation.popToTop(),
        navigation: ownProps.navigation,
        posts,
        feed: selectedFeed,
        initialScrollOffset: state.scrollOffset ?? 0,
    }
}

export const mapDispatchToProps = (dispatch: any): DispatchProps => {
    return {
        onRefreshPosts: (feeds: Feed[]) => {
            dispatch(AsyncActions.downloadPostsFromFeeds(feeds))
        },
        onUnfollowFeed: (feed: Feed) => {
            dispatch(Actions.unfollowFeed(feed))
        },
        onFollowFeed: (feed: Feed) => {
            dispatch(Actions.followFeed(feed))
        },
        onToggleFavorite: (feedUrl: string) => {
            dispatch(Actions.toggleFeedFavorite(feedUrl))
        },
        onRemoveFeed: (feed: Feed) => {
            dispatch(Actions.removeFeed(feed))
        },
        onChangeScrollOffset: (offset: number) => {
            dispatch(Actions.updateScrollOffset(offset))
        },
    }
}

export const FeedContainer = connect(
    mapStateToProps,
    mapDispatchToProps,
)(FeedView)
