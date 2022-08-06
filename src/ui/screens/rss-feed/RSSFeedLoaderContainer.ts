import { connect } from 'react-redux'
import { AppState } from '../../../reducers/AppState'
import { StateProps, DispatchProps } from './RSSFeedLoader'
import { TypedNavigation } from '../../../helpers/navigation'
import { RSSFeedLoader } from './RSSFeedLoader'
import { Alert } from 'react-native'
import { fetchFeedsFromUrl } from '../../../helpers/feedHelpers'
import { AsyncActions } from '../../../actions/asyncActions'
import { Actions } from '../../../actions/Actions'

const mapStateToProps = (state: AppState, ownProps: { navigation: TypedNavigation }): StateProps => {
    return {
        title: 'Add feed',
        navigation: ownProps.navigation,
    }
}

export const mapDispatchToProps = (dispatch: any, ownProps: { navigation: TypedNavigation }): DispatchProps => {
    return {
        onLoad: async () => {
            const feedUrl = ownProps.navigation.getParam<'RSSFeedLoader', 'feedUrl'>('feedUrl')
            const feeds = await fetchFeedsFromUrl(feedUrl)
            if (feeds != null) {
                if (Array.isArray(feeds)) {
                    dispatch(Actions.mergeFeedsWithExistingFeeds(feeds))
                    dispatch(AsyncActions.downloadPostsFromFeeds(feeds))
                    ownProps.navigation.popToTop()
                } else {
                    const feed = feeds
                    dispatch(AsyncActions.addFeed(feed))
                    dispatch(AsyncActions.downloadPostsFromFeeds([feed]))
                    ownProps.navigation.replace('Feed', {
                        feedUrl: feed.feedUrl,
                        name: feed.name,
                    })

                }
            } else {
                onFailedFeedLoad().then(() => ownProps.navigation.goBack(null))
            }
        },
    }
}

const onFailedFeedLoad = (): Promise<void> => {
    const promise = new Promise<void>((resolve) => {
        const options: any[] = [
            { text: 'Cancel', onPress: () => resolve(), style: 'cancel' },
        ]

        Alert.alert(
            'Failed to load feed!',
            undefined,
            options,
            { cancelable: true },
        )
    })

    return promise
}

export const RSSFeedLoaderContainer = connect(
    mapStateToProps,
    mapDispatchToProps,
)(RSSFeedLoader)
