import * as React from 'react';
import {
    NavigationRouteConfigMap,
    createStackNavigator,
    NavigationScreenProps,
} from 'react-navigation';
import {
    YellowBox,
    AppState,
    AppStateStatus,
} from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
// @ts-ignore
import { setCustomText } from 'react-native-global-props';

import { SettingsEditorContainer } from './containers/SettingsEditorContainer';
import { Debug } from './Debug';
import { EditFeedContainer as FeedInfoContainer } from './containers/FeedInfoContainer';
import { FilterListEditorContainer } from './containers/FilterListEditorContainer';
import { EditFilterContainer } from './containers/EditFilterContainer';
import { DebugScreenContainer } from './containers/DebugScreenContainer';
import { appendToLog } from './log';
import { LogViewerContainer } from './containers/LogViewerContainer';
import { defaultTextProps } from './styles';
import { FeedContainer } from './containers/FeedContainer';
import { BackupRestore } from './components/BackupRestore';
import { RestoreContainer } from './containers/RestoreContainer';
import { BackupContainer } from './containers/BackupContainer';
import { SettingsFeedViewContainer } from './containers/SettingsFeedViewContainer';
import { BugReportViewWithTabBar } from './components/BugReportView';
import { TopLevelErrorBoundary } from './components/TopLevelErrorBoundary';
import { FeedSettingsContainer } from './ui/screens/feed-settings/FeedSettingsContainer';
import { CategoriesContainer } from './ui/screens/explore/CategoriesContainer';
import { SubCategoriesContainer } from './ui/screens/explore/SubCategoriesContainer';
import { NewsSourceGridContainer } from './ui/screens/explore/NewsSourceGridContainer';
import { NewsSourceFeedContainer } from './containers/NewSourceFeedContainer';
import { initializeNotifications } from './helpers/notifications';
import { initStore, getSerializedAppState, getAppStateFromSerialized } from './store';
import { Persistor } from 'redux-persist';
import { Actions } from './actions/Actions';
import { restartApp } from './helpers/restart';
import { felfeleInitAppActions } from './store/felfeleInit';
import { FELFELE_APP_NAME } from './reducers/defaultData';
import { PublicChannelsContainer } from './ui/screens/public-channels/PublicChannelsContainer';
import { PublicChannelsListContainer } from './ui/screens/public-channels/PublicChannelsListContainer';
import { FeedLinkReaderContainer } from './ui/screens/feed-link-reader/FeedLinkReaderContainer';

YellowBox.ignoreWarnings([
    'Method `jumpToIndex` is deprecated.',
    'unknown call: "relay:check"',
]);
Debug.setDebugMode(true);
Debug.addLogger(appendToLog);
setCustomText(defaultTextProps);
initializeNotifications();

const Scenes: NavigationRouteConfigMap = {
    PublicChannelsContainer: {
        screen: PublicChannelsContainer,
    },
    Restore: {
        screen: RestoreContainer,
    },
    Backup: {
        screen: BackupContainer,
    },
    FeedInfo: {
        screen: FeedInfoContainer,
    },
    FeedLinkReader: {
        screen: FeedLinkReaderContainer,
    },
    Feed: {
        screen: FeedContainer,
    },
    PublicChannelsListContainer: {
        screen: PublicChannelsListContainer,
    },
    CategoriesContainer: {
        screen: CategoriesContainer,
    },
    SubCategoriesContainer: {
        screen: SubCategoriesContainer,
    },
    NewsSourceGridContainer: {
        screen: NewsSourceGridContainer,
    },
    NewsSourceFeed: {
        screen: NewsSourceFeedContainer,
    },
    FeedFromList: {
        screen: SettingsFeedViewContainer,
    },
    FeedSettings: {
        screen: FeedSettingsContainer,
    },
    Settings: {
        screen: SettingsEditorContainer,
    },
    Debug: {
        screen: DebugScreenContainer,
    },
    LogViewer: {
        screen: LogViewerContainer,
    },
    BackupRestore: {
        screen: BackupRestore,
    },
    EditFilter: {
        screen: EditFilterContainer,
    },
    FilterListEditorContainer: {
        screen: FilterListEditorContainer,
    },
    BugReportView: {
        screen: ({navigation}: NavigationScreenProps) => (
            <BugReportViewWithTabBar navigation={navigation} errorView={false}/>
        ),
    },
};

const AppNavigator = createStackNavigator(Scenes,
    {
        mode: 'card',
        navigationOptions: {
            header: null,
        },
    },
);

interface FelfeleAppState {
    store: any;
    persistor: Persistor | null;
    nativeAppState: AppStateStatus;
}

export default class FelfeleApp extends React.Component<{}, FelfeleAppState> {
    public state: FelfeleAppState = {
        store: null,
        persistor: null,
        nativeAppState: AppState.currentState,
    };

    public render() {
        if (this.state.store == null) {
            return null;
        }
        return (
            <TopLevelErrorBoundary>
                <Provider store={this.state.store!}>
                    <PersistGate loading={null} persistor={this.state.persistor!}>
                        <AppNavigator/>
                    </PersistGate>
                </Provider>
            </TopLevelErrorBoundary>
        );
    }

    public async componentDidMount() {
        AppState.addEventListener('change', this.handleAppStateChange);
        const { store, persistor } = await initStore(felfeleInitAppActions);
        this.setState({
            store,
            persistor,
        });
    }

    public componentWillUnmount() {
      AppState.removeEventListener('change', this.handleAppStateChange);
    }

    private handleAppStateChange = async (nextAppState: AppStateStatus) => {
        if (this.state.nativeAppState.match(/inactive|background/) && nextAppState === 'active') {
            Debug.log('App has come to the foreground');
            if (this.state.store != null) {
                const serializedAppState = await getSerializedAppState();
                const appState = await getAppStateFromSerialized(serializedAppState);
                if (appState.lastEditingApp != null && appState.lastEditingApp !== FELFELE_APP_NAME) {
                    this.state.store.dispatch(Actions.updateAppLastEditing(FELFELE_APP_NAME));
                    restartApp();
                }
            }
        }
        this.setState({
            nativeAppState: nextAppState,
        });
    }
}
