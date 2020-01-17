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

import { SettingsEditorContainer } from './ui/screens/settings/SettingsScreenContainer';
import { Debug } from './Debug';
import { EditFeedContainer as FeedInfoContainer, RSSFeedInfoContainer } from './ui/screens/feed-info/FeedInfoContainer';
import { FilterListScreenContainer } from './ui/screens/filters/FilterListScreenContainer';
import { FilterEditorContainer } from './ui/screens/filters/FilterEditorContainer';
import { DebugScreenContainer } from './ui/screens/debug/DebugScreenContainer';
import { appendToLog } from './log';
import { LogViewerScreenContainer } from './ui/screens/log-viewer/LogViewerScreenContainer';
import { defaultTextProps } from './styles';
import { FeedContainer } from './ui/screens/feed-view/FeedContainer';
import { ExportImportScreen } from './ui/screens/export-import/ExportImportScreen';
import { ExportScreenContainer } from './ui/screens/export-import/ExportScreenContainer';
import { BugReportScren } from './ui/screens/bug-report/BugReportScreen';
import { TopLevelErrorBoundary } from './ui/misc/TopLevelErrorBoundary';
import { CategoriesContainer } from './ui/screens/explore/CategoriesContainer';
import { SubCategoriesContainer } from './ui/screens/explore/SubCategoriesContainer';
import { NewsSourceGridContainer } from './ui/screens/explore/NewsSourceGridContainer';
import { NewsSourceFeedContainer } from './ui/screens/feed-view/NewSourceFeedContainer';
import { initStore } from './store';
import { Persistor } from 'redux-persist';
import { felfeleInitAppActions } from './store/felfeleInit';
import { PublicChannelsContainer } from './ui/screens/public-channels/PublicChannelsContainer';
import { PublicChannelsListContainer } from './ui/screens/public-channels/PublicChannelsListContainer';
import { FeedLinkReaderContainer } from './ui/screens/feed-link-reader/FeedLinkReaderContainer';
import { RSSFeedLoaderContainer } from './ui/screens/rss-feed/RSSFeedLoaderContainer';
import { FeedViewContainer } from './ui/screens/feed-view/FeedViewContainer';
import { SwarmSettingsContainer } from './ui/screens/settings/SwarmSettingsContainer';

YellowBox.ignoreWarnings([
    'Method `jumpToIndex` is deprecated.',
    'unknown call: "relay:check"',
]);
Debug.setDebugMode(true);
Debug.addLogger(appendToLog);
setCustomText(defaultTextProps);

const Scenes: NavigationRouteConfigMap = {
    PublicChannelsContainer: {
        screen: PublicChannelsContainer,
    },
    Backup: {
        screen: ExportScreenContainer,
    },
    FeedInfo: {
        screen: FeedInfoContainer,
    },
    RSSFeedLoader: {
        screen: RSSFeedLoaderContainer,
    },
    RSSFeedInfo: {
        screen: RSSFeedInfoContainer,
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
    Settings: {
        screen: SettingsEditorContainer,
    },
    SwarmSettingsContainer: {
        screen: SwarmSettingsContainer,
    },
    Debug: {
        screen: DebugScreenContainer,
    },
    LogViewer: {
        screen: LogViewerScreenContainer,
    },
    ExportImport: {
        screen: ExportImportScreen,
    },
    EditFilter: {
        screen: FilterEditorContainer,
    },
    FilterListEditorContainer: {
        screen: FilterListScreenContainer,
    },
    BugReportView: {
        screen: ({navigation}: NavigationScreenProps) => (
            <BugReportScren navigation={navigation} errorView={false}/>
        ),
    },
    FeedFromList: {
        screen: FeedViewContainer,
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
        }
        this.setState({
            nativeAppState: nextAppState,
        });
    }
}
