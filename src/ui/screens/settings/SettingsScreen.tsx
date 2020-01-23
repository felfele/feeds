import * as React from 'react';
import { StyleSheet, ScrollView, Vibration, Linking } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { Settings } from '../../../models/Settings';
import { Version, BuildNumber } from '../../../Version';
import { Colors, ComponentColors } from '../../../styles';
import { NavigationHeader } from '../../misc/NavigationHeader';
import { RowItem } from '../../buttons/RowButton';
import { RegularText } from '../../misc/text';
import { TabBarPlaceholder } from '../../misc/TabBarPlaceholder';
import { TypedNavigation } from '../../../helpers/navigation';
import { FragmentSafeAreaView } from '../../misc/FragmentSafeAreaView';
import { TouchableView } from '../../misc/TouchableView';
import { getBuildEnvironment } from '../../../BuildEnvironment';

export interface StateProps {
    navigation: TypedNavigation;
    settings: Settings;
}

export interface DispatchProps {
    onShowSquareImagesValueChange: (value: boolean) => void;
    onShowDebugMenuValueChange: (value: boolean) => void;
}

type Props = StateProps & DispatchProps;

export const SettingsScreen = (props: Props) => {
    const spacePrefix = (s: string) => s !== '' ? ' ' + s : '';
    const buildEnvironment = spacePrefix(getBuildEnvironment());
    const buildNumber = ` (Build number ${BuildNumber})`;
    const buildInfo = props.settings.showDebugMenu
        ? buildNumber
        : ''
    ;
    const versionLabel = 'Felfele News, Version: ' + Version + buildEnvironment + buildInfo;
    return (
        <FragmentSafeAreaView>
            <NavigationHeader
                title='Settings'
                navigation={props.navigation}
            />
            <ScrollView style={{
                backgroundColor: ComponentColors.BACKGROUND_COLOR,
                paddingTop: 10,
            }}>
                <RowItem
                    title='Mute keywords'
                    buttonStyle='navigate'
                    onPress={() => props.navigation.navigate('FilterListEditorContainer', {})}
                />
                <RowItem
                    title='Export & Import feeds'
                    buttonStyle='navigate'
                    onPress={() => props.navigation.navigate('ExportImport', {})}
                />
                <RowItem
                    title='Send bug report'
                    buttonStyle='navigate'
                    onPress={() => props.navigation.navigate('BugReportView', {})}
                />
                <RowItem
                    title='Terms & Privacy Policy'
                    buttonStyle='navigate'
                    onPress={() => Linking.openURL('https://felfele.org/legal')}
                />
                <RowItem
                    title='Visit website'
                    buttonStyle='navigate'
                    onPress={() => Linking.openURL('https://felfele.org/')}
                />

                <TouchableView
                    onLongPress={() => {
                        Vibration.vibrate(500, false);
                        props.onShowDebugMenuValueChange(!props.settings.showDebugMenu);
                    }}
                >
                    <RegularText style={styles.versionLabel}>{versionLabel}</RegularText>
                </TouchableView>
                { props.settings.showDebugMenu &&
                <RowItem
                    icon={
                        <Ionicons name='md-bug' size={24} color={ComponentColors.TEXT_COLOR}/>
                    }
                    title='Debug menu'
                    buttonStyle='navigate'
                    onPress={() => props.navigation.navigate('Debug', {})}
                />
                }
            </ScrollView>
            <TabBarPlaceholder/>
        </FragmentSafeAreaView>
    );
};

const styles = StyleSheet.create({
    label: {
        paddingHorizontal: 10,
        paddingTop: 20,
        paddingBottom: 7,
        color: Colors.GRAY,
    },
    versionLabel: {
        color: ComponentColors.HINT_TEXT_COLOR,
        paddingTop: 25,
        paddingBottom: 10,
        paddingLeft: 10,
        fontSize: 14,
    },
});
