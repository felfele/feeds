import { connect } from 'react-redux';
import { AppState } from '../../../reducers/AppState';
import { Actions } from '../../../actions/Actions';
import { StateProps, DispatchProps, DebugScreen } from './DebugScreen';
import { TypedNavigation } from '../../../helpers/navigation';
import { AsyncActions } from '../../../actions/asyncActions';
import { Feed } from '../../../models/Feed';

const mapStateToProps = (state: AppState, ownProps: { navigation: TypedNavigation }): StateProps => {
   return {
       navigation: ownProps.navigation,
       appState: state,
   };
};

const mapDispatchToProps = (dispatch: any): DispatchProps => {
   return {
        onAppStateReset: () => {
            dispatch(Actions.appStateReset());
        },
        onDeleteFeeds: () => {
            dispatch(Actions.removeAllFeeds());
        },
        onDeletePosts: () => {
            dispatch(Actions.updateRssPosts([]));
        },
        onDeleteFilters: () => {
            dispatch(Actions.removeAllContentFilters());
        },
        onAddFeed: (feed: Feed) => {
            dispatch(AsyncActions.addFeed(feed));
        },
        onRefreshFeeds: (feeds: Feed[]) => {
            dispatch(AsyncActions.downloadPostsFromFeeds(feeds));
        },
        onFixRedditFeeds: () => {
            dispatch(AsyncActions.fixRedditFeeds());
        },
   };
};

export const DebugScreenContainer = connect(
   mapStateToProps,
   mapDispatchToProps,
)(DebugScreen);
