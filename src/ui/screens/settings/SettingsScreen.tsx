import * as React from 'react'
import { StyleSheet, ScrollView, Vibration, View, Linking } from 'react-native'
import Ionicons from 'react-native-vector-icons/Ionicons'

import { Settings } from '../../../models/Settings'
import { Version, BuildNumber } from '../../../Version'
import { Colors, ComponentColors } from '../../../styles'
import { NavigationHeader } from '../../misc/NavigationHeader'
import { RowItem } from '../../buttons/RowButton'
import { RegularText } from '../../misc/text'
import { TypedNavigation } from '../../../helpers/navigation'
import { FragmentSafeAreaView } from '../../misc/FragmentSafeAreaView'
import { TouchableView } from '../../misc/TouchableView'
import { getBuildEnvironment } from '../../../BuildEnvironment'

export interface StateProps {
    navigation: TypedNavigation
    settings: Settings
}

export interface DispatchProps {
    onShowSquareImagesValueChange: (value: boolean) => void
    onShowDebugMenuValueChange: (value: boolean) => void
}

type Props = StateProps & DispatchProps

export const SettingsScreen = (props: Props) => {
    const spacePrefix = (s: string) => s !== '' ? ' ' + s : ''
    const buildEnvironment = spacePrefix(getBuildEnvironment())
    const buildNumber = ` (Build number ${BuildNumber})`
    const buildInfo = props.settings.showDebugMenu
        ? buildNumber
        : ''

    const appName = 'Feeds – RSS reader by Felfele'
    const versionLabel = appName + ', Version: ' + Version + buildEnvironment + buildInfo
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
                    title='Muted words'
                    buttonStyle='navigate'
                    onPress={() => props.navigation.navigate('FilterListEditorContainer', {})}
                />
                <RowItem
                    title='Export & Import feeds'
                    buttonStyle='navigate'
                    onPress={() => props.navigation.navigate('ExportImport', {})}
                />

                <View style={{paddingTop: 20}} ></View>

                <RowItem
                    title='Send bug report'
                    buttonStyle='navigate'
                    onPress={() => props.navigation.navigate('BugReportView', {})}
                />
                <RowItem
                    title='Terms & Privacy Policy'
                    buttonStyle='navigate'
                    onPress={() => props.navigation.navigate('PrivacyPolicy', {})}
                />
                <RowItem
                    title='Visit Felfele Foundation website'
                    buttonStyle='link'
                    onPress={() => Linking.openURL('https://felfele.org/')}
                />

                { props.settings.showDebugMenu &&
                <React.Fragment>
                    <View style={{paddingTop: 20}} ></View>
                    <RowItem
                        icon={
                            <Ionicons name='md-bug' size={24} color={ComponentColors.TEXT_COLOR}/>
                        }
                        title='Debug menu'
                        buttonStyle='navigate'
                        onPress={() => props.navigation.navigate('Debug', {})}
                    />
                </React.Fragment>
                }

                <TouchableView
                    onLongPress={() => {
                        Vibration.vibrate(500, false)
                        props.onShowDebugMenuValueChange(!props.settings.showDebugMenu)
                    }}
                    style={styles.copyrightContainer}
                >
                    <RegularText style={styles.versionLabel}>{versionLabel}</RegularText>
                </TouchableView>
            </ScrollView>
        </FragmentSafeAreaView>
    )
}

const styles = StyleSheet.create({
    label: {
        paddingHorizontal: 10,
        paddingTop: 20,
        paddingBottom: 7,
        color: Colors.GRAY,
    },
    versionLabel: {
        color: ComponentColors.HINT_TEXT_COLOR,
        paddingLeft: 10,
        paddingVertical: 3,
        fontSize: 14,
    },
    copyrightContainer: {
        paddingTop: 15,
    },
})
