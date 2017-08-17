import * as React from 'react';

import { StackNavigator, TabNavigator } from 'react-navigation';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { View, StatusBar } from 'react-native';

import { Config } from './Config';
import PostScreen from './components/PostScreen';
import Feed from './components/Feed';
import YourFeed from './components/YourFeed';
import Settings from './components/Settings';
import Location from './components/Location';
import DebugScreen from './components/DebugScreen';
import Share from './components/Share';
import { Debug } from './Debug';

Debug.setDebug(true);

const Root = TabNavigator(
    {
        YourTab: {
            screen: ({navigation}) => (<YourFeed
                                        uri={Config.baseUri} 
                                        post='Post' 
                                        error='Error'
                                        posts={[]}
                                        navigation={navigation} />),
            path: '/',
            navigationOptions: {
                header: <View style={{padding: 50}} />,
                title: 'Your story',
                tabBarLabel: 'Your story',
                tabBarIcon: ({ tintColor, focused }) => (
                    <Ionicons
                        name={focused ? 'ios-list-box' : 'ios-list-box-outline'}
                        size={20}
                        style={{ color: tintColor }}
                    />
                ),
            },
        },
        // PublicTab: {
        //     screen: ({navigation}) => (<Feed 
        //                                 uri={Config.baseUri} 
        //                                 post='Post' 
        //                                 error='Error'
        //                                 navigation={navigation} />),
        //     path: '/',
        //     navigationOptions: {
        //         header: <View style={{padding: 50}} />,
        //         title: 'Welcome',
        //         tabBarLabel: 'Public stories',
        //         tabBarIcon: ({ tintColor, focused }) => (
        //             <Ionicons
        //                 name={focused ? 'ios-paper' : 'ios-paper-outline'}
        //                 size={20}
        //                 style={{ color: tintColor }}
        //             />
        //         ),
        //     },
        // },
        // FeedTab: {
        //     screen: ({navigation}) => (<Feed 
        //                                 uri={Config.baseUri} 
        //                                 post='Post' 
        //                                 error='Error'
        //                                 navigation={navigation} />),
        //     path: '/',
        //     navigationOptions: {
        //         header: <View style={{padding: 50}} />,
        //         title: 'Welcome',
        //         tabBarLabel: 'All stories',
        //         tabBarIcon: ({ tintColor, focused }) => (
        //             <Ionicons
        //                 name={focused ? 'ios-globe' : 'ios-globe-outline'}
        //                 size={20}
        //                 style={{ color: tintColor }}
        //             />
        //         ),
        //     },
        // },
        SettingsTab: {
            screen: ({navigation}) => (<Settings config={Config} error='Error' navigation={navigation} />),
            path: '/settings',
            navigationOptions: {
                header: undefined,
                title: 'Settings',
                tabBarIcon: ({ tintColor, focused }) => (
                    <Ionicons
                        name={focused ? 'ios-settings' : 'ios-settings-outline'}
                        size={20}
                        style={{ color: tintColor }}
                    />
                ),
            },
        },
    },
    {
        tabBarPosition: 'bottom',
        animationEnabled: false,
        swipeEnabled: false,
        navigationOptions: {

        }
    }
);


const Scenes = {
    Root: {
        screen: Root
    },
    Post: {
        screen: PostScreen
    },
    Location: {
        screen: Location
    },
    Debug: {
        screen: DebugScreen
    },
    Share: {
        screen: Share
    },
}

const AppNavigator = StackNavigator(Scenes,
    {
        mode: 'modal',
        navigationOptions: {
            header: <View style={{height: 20}}>
                        <StatusBar barStyle="dark-content" />
                    </View>
        }
    }
);

export default class App extends React.Component {

    render() {
        return (
            <AppNavigator />
        );
    }
}
