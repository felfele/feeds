import * as React from 'react'
import { NavigationHeader } from '../../misc/NavigationHeader'
import { Colors, ComponentColors } from '../../../styles'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import {
    View,
    StyleSheet,
    ActivityIndicator,
    Platform,
    Text,
    ScrollView,
    KeyboardAvoidingView,
} from 'react-native'
import DeviceInfo from 'react-native-device-info'
import { restartApp } from '../../../helpers/restart'
import { BoldText } from '../../misc/text'
import { filteredLog } from '../../../helpers/log'
import { Version, BuildNumber } from '../../../Version'

import { Debug } from '../../../helpers/Debug'
import { TypedNavigation } from '../../../helpers/navigation'
import { SimpleTextInput } from '../../misc/SimpleTextInput'
import { WideButton } from '../../buttons/WideButton'
import { FragmentSafeAreaView } from '../../misc/FragmentSafeAreaView'
import { TabBarPlaceholder } from '../../misc/TabBarPlaceholder'
import { TwoButton } from '../../buttons/TwoButton'

const deviceInfo = () => {
    const brand = DeviceInfo.getBrand()
    const deviceID = DeviceInfo.getDeviceId()
    const systemName = DeviceInfo.getSystemName()
    const systemVersion = DeviceInfo.getSystemVersion()

    return `
System: ${systemName} ${systemVersion} (${brand} ${deviceID})
Version: ${Version}, build ${BuildNumber}
`
}

interface Props {
    navigation?: TypedNavigation
    errorView: boolean
}

interface State {
    isSending: boolean
    feedbackText: string
}

export const BugReportScren = (props: Props) => (
    <FragmentSafeAreaView>
        <BugReportView {...props}/>
    </FragmentSafeAreaView>
)

class BugReportView extends React.Component<Props, State> {
    public state: State = {
        isSending: false,
        feedbackText: '',
    }

    public render() {
        const logText = 'By sending a bug report, you will share some information (shown below) with us.\n\n' + this.getDeviceInfoAndLogs()
        return (
            <KeyboardAvoidingView style={styles.keyboardAvoidingContainer}>
                <NavigationHeader
                    navigation={this.props.navigation}
                    title='Bug Report'
                />
                <ScrollView
                    contentContainerStyle={styles.contentContainer}
                    keyboardShouldPersistTaps={'handled'}
                    keyboardDismissMode='interactive'
                >
                    {this.props.errorView
                        ? <View style={styles.iconContainer}>
                            <BoldText style={[styles.text, styles.title]}>
                                An error has occured!{'\n'}
                                We need to restart the app.
                            </BoldText>
                        </View>
                        :  null
                    }
                    {!this.props.errorView
                        ? <this.SendBugReportButton/>
                        : <TwoButton
                            leftButton={{
                                icon:
                                    <Icon
                                        name={'refresh'}
                                        size={24}
                                        color={Colors.BRAND_PURPLE}
                                    />
                                ,
                                label: 'RESTART',
                                onPress: restartApp,
                            }}
                            rightButton={{
                                icon: !this.state.isSending ?
                                    <Icon
                                        name={'send'}
                                        size={24}
                                        color={Colors.BRAND_PURPLE}
                                    /> :
                                    <ActivityIndicator size='small' color='grey' />
                                ,
                                label: 'SEND BUG REPORT',
                                onPress: this.onPressSend,
                            }}
                        />
                    }
                    <Text style={styles.text}>Please take a moment and let us know what happened:</Text>
                    <SimpleTextInput
                        style={styles.textInput}
                        multiline={true}
                        numberOfLines={6}
                        onChangeText={this.onChangeText}
                        placeholder={'Write here...'}
                        placeholderTextColor='gray'
                        underlineColorAndroid='transparent'
                    />
                    <View style={styles.logContainer}>
                        <Text style={styles.logText}>{logText}</Text>
                    </View>
                    <this.SendBugReportButton/>
                    <TabBarPlaceholder/>
                </ScrollView>
            </KeyboardAvoidingView>
        )
    }

    private SendBugReportButton = () => (
        <WideButton
            style={{marginBottom: 20}}
            icon={!this.state.isSending ?
                <Icon
                    name={'send'}
                    size={24}
                    color={Colors.BRAND_PURPLE}
                /> :
                <ActivityIndicator size='small' color='grey' />
            }
            onPress={this.onPressSend}
            label={'SEND BUG REPORT'}
        />
    )

    private onChangeText = (feedbackText: string) => {
        this.setState({ feedbackText })
    }

    private onPressSend = async () => {
        this.setState({
            isSending: true,
        })

        await this.sendBugReport()

        this.setState({
            isSending: false,
            feedbackText: '',
        })

        if (this.props.navigation != null) {
            this.props.navigation.goBack()
        } else if (this.props.errorView) {
            restartApp()
        }
    }

    private getBugReportBody = (): string => {
        return `User Feedback:

${this.state.feedbackText}
${this.getDeviceInfoAndLogs()}
`
    }

    private getDeviceInfoAndLogs = (): string => {
        const bugReportBody = `Device Info:

${deviceInfo()}
Logs:

${filteredLog()}`
        return bugReportBody
    }

    private sendBugReport = async () => {
        try {
            const response = await fetch('https://app.felfele.com/api/v1/bugreport/', {
                headers: {
                    'Content-Type': 'text/plain',
                },
                method: 'POST',
                body: this.getBugReportBody(),
            })
            Debug.log('success sending bugreport', response.status)
        } catch (e) {
            Debug.log('error sending bugreport', e)
        }
    }
}

const fontFamily = Platform.OS === 'ios' ? 'Courier' : 'monospace'

const styles = StyleSheet.create({
    mainContainer: {
        backgroundColor: ComponentColors.HEADER_COLOR,
        flex: 1,
    },
    keyboardAvoidingContainer: {
        backgroundColor: ComponentColors.BACKGROUND_COLOR,
        flex: 1,
    },
    contentContainer: {
        backgroundColor: ComponentColors.BACKGROUND_COLOR,
    },
    iconContainer: {
        paddingTop: 26,
    },
    title: {
        textAlign: 'center',
        fontSize: 18,
    },
    text: {
        textAlign: 'justify',
        paddingHorizontal: 10,
        paddingBottom: 10,
    },
    label: {
        alignSelf: 'flex-start',
        fontSize: 12,
        paddingHorizontal: 10,
        paddingTop: 9,
        paddingBottom: 7,
        color: Colors.GRAY,
    },
    logContainer: {
        width: '100%',
        marginVertical: 0,
        backgroundColor: Colors.LIGHTER_GRAY,
        paddingHorizontal: 10,
        paddingVertical: 12,
    },
    logText: {
        fontFamily: fontFamily,
        fontSize: 14,
        color: Colors.DARK_GRAY,
        backgroundColor: Colors.LIGHTER_GRAY,
    },
    restartButton: {
        paddingTop: 50,
    },
    textInput: {
        marginBottom: 1,
        padding: 10,
        backgroundColor: Colors.WHITE,
        fontSize: 16,
        height: 190,
        width: '100%',
        textAlignVertical: 'top',
    },
})
