import { connect } from 'react-redux'
import { AppState } from '../../../reducers/AppState'
import { StateProps, DispatchProps, FeedView } from './FeedView'
import { Actions } from '../../../actions/Actions'
import { AsyncActions } from '../../../actions/asyncActions'
import { Feed } from '../../../models/Feed'
import { getFeedPosts } from '../../../selectors/selectors'
import { mapDispatchToProps as defaultMapDispatchToProps } from './FeedContainer'
import { TypedNavigation } from '../../../helpers/navigation'

const mapStateToProps = (state: AppState, ownProps: { navigation: TypedNavigation }): StateProps => {
    const navParamFeed = ownProps.navigation.getParam<'NewsSourceFeed', 'feed'>('feed')
    const addedFeed = state.feeds.find(value => value.feedUrl === navParamFeed.feedUrl)
    const feed = addedFeed != null ? addedFeed : navParamFeed
    const posts = getFeedPosts(state, navParamFeed.feedUrl)
    return {
        onBack: () => ownProps.navigation.goBack(),
        navigation: ownProps.navigation,
        posts,
        feed,
    }
}

const mapDispatchToProps = (dispatch: any): DispatchProps => {
    return {
        ...defaultMapDispatchToProps(dispatch),
        onFollowFeed: (feed: Feed) => {
            dispatch(AsyncActions.addFeed(feed))
            dispatch(Actions.followFeed(feed))
        },
    }
}

export const NewsSourceFeedContainer = connect(
    mapStateToProps,
    mapDispatchToProps,
)(FeedView)
