import * as React from 'react';
import { View, ViewStyle, ScrollView, Platform } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { getSerializedAppState, getAppStateFromSerialized } from '../../../store';
import { AppState } from '../../../reducers/AppState';
import { Debug } from '../../../helpers/Debug';
import { NavigationHeader } from '../../misc/NavigationHeader';
import * as Dialogs from '../../../helpers/dialogs';
import { Colors, ComponentColors } from '../../../styles';
import { RowItem } from '../../buttons/RowButton';
import { restartApp } from '../../../helpers/restart';
import { waitMillisec } from '../../../helpers/Utils';
import { TypedNavigation } from '../../../helpers/navigation';
import { Feed } from '../../../models/Feed';
import { FragmentSafeAreaView } from '../../misc/FragmentSafeAreaView';

export interface StateProps {
    appState: AppState;
    navigation: TypedNavigation;
}

export interface DispatchProps {
    onAppStateReset: () => void;
    onDeleteFeeds: () => void;
    onDeletePosts: () => void;
    onDeleteFilters: () => void;
    onAddFeed: (feed: Feed) => void;
    onRefreshFeeds: (feeds: Feed[]) => void;
    onFixRedditFeeds: () => void;
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
    <FragmentSafeAreaView>
        <NavigationHeader
            navigation={props.navigation}
            title='Debug menu'
        />
        <View style={{ backgroundColor: ComponentColors.BACKGROUND_COLOR, flex: 1 }}>
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
                        <MaterialCommunityIcon name='trash-can-outline' />
                    }
                    title='Delete all filters'
                    onPress={async () => await onDeleteFilters(props)}
                    buttonStyle='none'
                />
                <RowItem
                    icon={
                        <MaterialCommunityIcon name='auto-fix' />
                    }
                    title='Fix reddit feeds'
                    onPress={async () => await onFixRedditFeeds(props)}
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
                        <MaterialCommunityIcon name='server-network' />
                    }
                    title='Swarm settings'
                    onPress={async () => props.navigation.navigate('SwarmSettingsContainer', {})}
                    buttonStyle='navigate'
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
    </FragmentSafeAreaView>
);

const onAppStateReset = async (props: Props) => {
    const confirmed = await Dialogs.areYouSureDialog(
        'Are you sure you want to reset the app state?',
        'This will delete all your data and there is no undo!'
    );
    Debug.log('onAppStateReset: ', confirmed);
    if (confirmed) {
        props.onAppStateReset();
        const timeout = Platform.OS === 'android' ? 3000 : 1000;
        await waitMillisec(timeout);
        restartApp();
    }
};

const onDeleteFeeds = async (props: Props) => {
    const confirmed = await Dialogs.areYouSureDialog(
        'Are you sure you want to delete feeds?',
        'This will delete all your feeds and there is no undo!'
    );
    if (confirmed) {
        props.onDeleteFeeds();
    }
};

const onDeletePosts = async (props: Props) => {
    const confirmed = await Dialogs.areYouSureDialog(
        'Are you sure you want to delete all posts?',
        'This will delete all your posts and there is no undo!'
    );
    if (confirmed) {
        props.onDeletePosts();
    }
};

const onDeleteFilters = async (props: Props) => {
    const confirmed = await Dialogs.areYouSureDialog(
        'Are you sure you want to delete all posts?',
        'This will delete all your filters and there is no undo!'
    );
    if (confirmed) {
        props.onDeleteFilters();
    }
};

const onLogAppStateVersion = async () => {
    const serializedAppState = await getSerializedAppState();
    const appState = await getAppStateFromSerialized(serializedAppState);
    Debug.log('onLogAppStateVersion', appState._persist);
};

const onFixRedditFeeds = async (props: Props) => {
    props.onFixRedditFeeds();
};
