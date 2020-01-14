import * as React from 'react';
import { View, ViewStyle, ScrollView, Platform } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { getSerializedAppState, getAppStateFromSerialized } from '../store';
import { AppState } from '../reducers/AppState';
import { Debug } from '../Debug';
import { NavigationHeader } from './NavigationHeader';
import * as AreYouSureDialog from './AreYouSureDialog';
import { Colors } from '../styles';
import { RowItem } from '../ui/buttons/RowButton';
import { restartApp } from '../helpers/restart';
import { Utils } from '../Utils';
import { TypedNavigation } from '../helpers/navigation';
import { Feed } from '../models/Feed';
import { FragmentSafeAreaViewWithoutTabBar } from '../ui/misc/FragmentSafeAreaView';

export interface StateProps {
    appState: AppState;
    navigation: TypedNavigation;
}

export interface DispatchProps {
    onAppStateReset: () => void;
    onDeleteFeeds: () => void;
    onDeletePosts: () => void;
    onAddFeed: (feed: Feed) => void;
    onRefreshFeeds: (feeds: Feed[]) => void;
}

type Props = StateProps & DispatchProps;

interface IconProps {
    name: string;
}

const IconContainer = (props: { children: React.ReactNode, style?: ViewStyle }) => (
    <View style={{
        alignItems: 'center',
        ...props.style,
    }}>
        {props.children}
    </View>
);

const IonIcon = (props: IconProps) => (
    <IconContainer>
        <Ionicons name={props.name} size={24} color={Colors.GRAY} {...props} />
    </IconContainer>
);

const MaterialCommunityIcon = (props: IconProps) => (
    <IconContainer>
        <MaterialCommunityIcons name={props.name} size={20} color={Colors.GRAY} {...props} />
    </IconContainer>
);

export const DebugScreen = (props: Props) => (
    <FragmentSafeAreaViewWithoutTabBar>
        <NavigationHeader
            navigation={props.navigation}
            title='Debug menu'
        />
        <View style={{ backgroundColor: '#EFEFF4', flex: 1 }}>
            <ScrollView>
                <RowItem
                    icon={
                        <IonIcon name='md-warning' />
                    }
                    title='App state reset'
                    onPress={async () => await onAppStateReset(props)}
                    buttonStyle='none'
                />
                <RowItem
                    icon={
                        <MaterialCommunityIcon name='trash-can-outline' />
                    }
                    title='Delete feeds'
                    onPress={async () => await onDeleteFeeds(props)}
                    buttonStyle='none'
                />
                <RowItem
                    icon={
                        <MaterialCommunityIcon name='trash-can-outline' />
                    }
                    title='Delete all posts'
                    onPress={async () => await onDeletePosts(props)}
                    buttonStyle='none'
                />
                <RowItem
                    icon={
                        <IonIcon name='md-information-circle-outline' />
                    }
                    title='Log app state persist info'
                    onPress={async () => await onLogAppStateVersion()}
                    buttonStyle='none'
                />
                <RowItem
                    icon={
                        <MaterialCommunityIcon name='backup-restore' />
                    }
                    title='Backup & Restore'
                    onPress={() => props.navigation.navigate('BackupRestore', {})}
                    buttonStyle='navigate'
                />
                <RowItem
                    icon={
                        <MaterialCommunityIcon name='server-network' />
                    }
                    title='Swarm settings'
                    onPress={async () => props.navigation.navigate('SwarmSettingsContainer', {})}
                    buttonStyle='navigate'
                />
                <RowItem
                    icon={
                        <MaterialCommunityIcon name='filter-outline' />
                    }
                    title='Mute keywords and phrases'
                    buttonStyle='navigate'
                    onPress={() => props.navigation.navigate('FilterListEditorContainer', {})}
                />
                <RowItem
                    icon={
                        <IonIcon name='md-list' />
                    }
                    title='View logs'
                    onPress={() => props.navigation.navigate('LogViewer', {})}
                    buttonStyle='navigate'
                />
            </ScrollView>
        </View>
    </FragmentSafeAreaViewWithoutTabBar>
);

const onAppStateReset = async (props: Props) => {
    const confirmed = await AreYouSureDialog.show(
        'Are you sure you want to reset the app state?',
        'This will delete all your data and there is no undo!'
    );
    Debug.log('onAppStateReset: ', confirmed);
    if (confirmed) {
        props.onAppStateReset();
        const timeout = Platform.OS === 'android' ? 3000 : 1000;
        await Utils.waitMillisec(timeout);
        restartApp();
    }
};

const onDeleteFeeds = async (props: Props) => {
    const confirmed = await AreYouSureDialog.show(
        'Are you sure you want to delete feeds?',
        'This will delete all your feeds and there is no undo!'
    );
    if (confirmed) {
        props.onDeleteFeeds();
    }
};

const onDeletePosts = async (props: Props) => {
    const confirmed = await AreYouSureDialog.show(
        'Are you sure you want to delete all posts?',
        'This will delete all your posts and there is no undo!'
    );
    if (confirmed) {
        props.onDeletePosts();
    }
};

const onLogAppStateVersion = async () => {
    const serializedAppState = await getSerializedAppState();
    const appState = await getAppStateFromSerialized(serializedAppState);
    Debug.log('onLogAppStateVersion', appState._persist);
};
