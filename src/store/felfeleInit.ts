import { Store } from 'redux';
import { AppState } from '../reducers/AppState';
import { Actions } from '../actions/Actions';
import { AsyncActions } from '../actions/asyncActions';
import { Debug } from '../Debug';

export const felfeleInitAppActions = (store: Store<AppState, Actions>) => {
    // tslint:disable-next-line:no-console
    console.log('initStore: ', store.getState());

    // @ts-ignore
    store.dispatch(AsyncActions.cleanupContentFilters());
    store.dispatch(Actions.timeTick());
    if (!Debug.isDebugMode) {
        // @ts-ignore
        store.dispatch(AsyncActions.downloadFollowedFeedPosts());
    }

    setInterval(() => store.dispatch(Actions.timeTick()), 60000);
};
