import { connect } from 'react-redux'
import { AppState } from '../../../reducers/AppState'
import { Feed } from '../../../models/Feed'
import { StateProps, DispatchProps, PublicChannelsScreen } from './PublicChannelsScreen'
import { getAllFeeds, getAllPostsSorted } from '../../../selectors/selectors'
import { TypedNavigation } from '../../../helpers/navigation'
import { AsyncActions } from '../../../actions/asyncActions'
import { Actions } from '../../../actions/Actions'

const mapStateToProps = (state: AppState, ownProps: { navigation: TypedNavigation }): StateProps => {
    const followedFeeds = getAllFeeds(state)
    const filteredPosts = getAllPostsSorted(state)

    return {
        navigation: ownProps.navigation,
        posts: filteredPosts,
        feeds: followedFeeds,
        gatewayAddress: state.settings.swarmGatewayAddress,
        initialScrollOffset: state.scrollOffset || 0,
    }
}

const mapDispatchToProps = (dispatch: any): DispatchProps => {
    return {
        onRefreshPosts: (feeds: Feed[]) => {
            dispatch(AsyncActions.downloadPostsFromFeeds(feeds))
        },
        onChangeScrollOffset: (scrollOffset: number) => {
            dispatch(Actions.updateScrollOffset(scrollOffset))
        },
    }
}

export const PublicChannelsContainer = connect(
    mapStateToProps,
    mapDispatchToProps,
)(PublicChannelsScreen)
