import * as React from 'react';
import { StackNavigator, TabNavigator, NavigationRouteConfigMap, SwitchNavigator } from 'react-navigation';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { Platform, YellowBox } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import { SettingsEditorContainer } from './containers/SettingsEditorContainer';
import { Share } from './components/Share';
import { Debug } from './Debug';
import { RSSPostManager } from './RSSPostManager';
import { store, persistor } from './reducers';
import { FeedListEditorContainer } from './containers/FeedListEditorContainer';
import { EditFeedContainer } from './containers/EditFeedContainer';
import { NewsFeedContainer } from './containers/NewsFeedContainer';
import { FilterListEditorContainer } from './containers/FilterListEditorContainer';
import { EditFilterContainer } from './containers/EditFilterContainer';
import { YourFeedContainer } from './containers/YourFeedContainer';
import { EditPostContainer } from './containers/EditPostContainer';
import { IdentitySettingsContainer } from './containers/IdentitySettingsContainer';
import { DebugScreenContainer } from './containers/DebugScreenContainer';
import { LoadingScreenContainer } from './containers/LoadingScreenContainer';
import { WelcomeContainer } from './containers/WelcomeContainer';
import { appendToLog } from './components/LogViewer';
import { LogViewerContainer } from './containers/LogViewerContainer';
import { Colors } from './styles';
import { FeedContainer } from './containers/FeedContainer';

YellowBox.ignoreWarnings(['Method `jumpToIndex` is deprecated.']);
Debug.setDebug(true);
Debug.addLogger(appendToLog);

const Root = TabNavigator(
    {
        YourTab: {
            screen: ({navigation}) => (<YourFeedContainer
                                        navigation={navigation}
                                    />),
            path: '/',
            navigationOptions: {
                title: 'Your story',
                tabBarLabel: 'Your story',
                tabBarIcon: ({ tintColor, focused }) => (
                    <MaterialIcon
                        name={focused ? 'rss-feed' : 'rss-feed'}
                        size={20}
                        color={tintColor}
                    />
                ),
            },
        },
        NewsTab: {
            screen: ({navigation}) => (<NewsFeedContainer
                                        navigation={navigation}
                                        postManager={RSSPostManager} />),
            path: '/',
            navigationOptions: {
                title: 'New stories',
                tabBarLabel: 'New stories',
                tabBarIcon: ({ tintColor, focused }) => (
                    <FontAwesomeIcon
                        name={focused ? 'newspaper-o' : 'newspaper-o'}
                        size={20}
                        color={tintColor}
                    />
                ),
            },
        },
        SettingsTab: {
            screen: ({navigation}) => (<SettingsEditorContainer navigation={navigation} />),
            path: '/settings',
            navigationOptions: {
                header: undefined,
                title: 'Settings',
                tabBarIcon: ({ tintColor, focused }) => (
                    <MaterialIcon
                        name={focused ? 'settings' : 'settings'}
                        size={20}
                        color={tintColor}
                    />
                ),
            },
        },
    },
    {
        tabBarPosition: 'bottom',
        animationEnabled: false,
        swipeEnabled: false,
        tabBarOptions: Platform.OS === 'ios'
            ?
                {
                    showLabel: false,
                    activeTintColor: 'gray',
                    inactiveTintColor: 'lightgray',
                    style: {
                        opacity: 0.96,
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        bottom: 0,
                    },
                }
            :
                {
                    showLabel: false,
                    showIcon: true,
                    activeTintColor: 'gray',
                    inactiveTintColor: 'lightgray',
                    activeBackgroundColor: 'gray',
                    style: {
                        backgroundColor: Colors.BACKGROUND_COLOR,
                        opacity: 0.96,
                    },
                },
    },
);

const Scenes: NavigationRouteConfigMap = {
    Root: {
        screen: Root,
    },
    Post: {
        screen: EditPostContainer,
    },
    Feed: {
        screen: FeedContainer,
    },
    Debug: {
        screen: DebugScreenContainer,
    },
    IdentitySettingsContainer: {
        screen: IdentitySettingsContainer,
    },
    Share: {
        screen: Share,
    },
    FeedListEditorContainer: {
        screen: FeedListEditorContainer,
    },
    FilterListEditorContainer: {
        screen: FilterListEditorContainer,
    },
    EditFeed: {
        screen: EditFeedContainer,
    },
    EditFilter: {
        screen: EditFilterContainer,
    },
    LogViewer: {
        screen: LogViewerContainer,
    },
};

const AppNavigator = StackNavigator(Scenes,
    {
        mode: 'card',
        navigationOptions: {
            header: null,
        },
    },
);

const WelcomeNavigator = StackNavigator({
    Welcome: {
        screen: WelcomeContainer,
    },
}, {
    mode: 'card',
    navigationOptions: {
        header: null,
    },
});

const InitialNavigator = SwitchNavigator({
    Loading: LoadingScreenContainer,
    App: AppNavigator,
    Welcome: WelcomeNavigator,
}, {
    initialRouteName: 'Loading',
    backBehavior: 'initialRoute',
}
);

export default class App extends React.Component {
    public render() {
        return (
            <Provider store={store}>
                <PersistGate loading={null} persistor={persistor}>
                    <InitialNavigator/>
                </PersistGate>
            </Provider>
        );
    }
}
