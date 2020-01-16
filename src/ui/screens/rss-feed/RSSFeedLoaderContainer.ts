import { connect } from 'react-redux';
import { AppState } from '../../../reducers/AppState';
import { StateProps, DispatchProps } from './RSSFeedLoader';
import { TypedNavigation } from '../../../helpers/navigation';
import { RSSFeedLoader } from './RSSFeedLoader';
import { Alert } from 'react-native';
import { fetchRSSFeedFromUrl } from '../../../helpers/feedHelpers';
import { Debug } from '../../../Debug';
import { AsyncActions } from '../../../actions/asyncActions';

const mapStateToProps = (state: AppState, ownProps: { navigation: TypedNavigation }): StateProps => {
    return {
        title: 'Add channel',
        navigation: ownProps.navigation,
    };
};

export const mapDispatchToProps = (dispatch: any, ownProps: { navigation: TypedNavigation }): DispatchProps => {
    return {
        onLoad: async () => {
            const feedUrl = ownProps.navigation.getParam<'RSSFeedLoader', 'feedUrl'>('feedUrl');
            const feed = await fetchRSSFeedFromUrl(feedUrl);
            if (feed != null && feed.feedUrl !== '') {
                dispatch(AsyncActions.addFeed(feed));
                dispatch(AsyncActions.downloadPostsFromFeeds([feed]));
                ownProps.navigation.navigate('Feed', {
                    feedUrl: feed.feedUrl,
                    name: feed.name,
                });
            } else {
                onFailedFeedLoad().then(() => ownProps.navigation.goBack(null));
            }
        },
    };
};

const onFailedFeedLoad = (): Promise<void> => {
    const promise = new Promise<void>((resolve, reject) => {
        const options: any[] = [
            { text: 'Cancel', onPress: () => resolve(), style: 'cancel' },
        ];

        Alert.alert(
            'Failed to load channel!',
            undefined,
            options,
            { cancelable: true },
        );
    });

    return promise;
};

export const RSSFeedLoaderContainer = connect(
    mapStateToProps,
    mapDispatchToProps,
)(RSSFeedLoader);
