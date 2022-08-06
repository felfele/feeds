import * as React from 'react'
import { useState, useEffect } from 'react'
import {
    StyleSheet,
    View,
    Dimensions,
    RegisteredStyle,
    ViewStyle,
    Clipboard,
    Keyboard,
} from 'react-native'
import QRCodeScanner from 'react-native-qrcode-scanner'

import { SimpleTextInput } from '../../misc/SimpleTextInput'
import { ComponentColors, Colors, defaultMediumFont } from '../../../styles'
import { NavigationHeader } from '../../misc/NavigationHeader'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { TypedNavigation } from '../../../helpers/navigation'
import { FragmentSafeAreaView } from '../../misc/FragmentSafeAreaView'
import { getHttpLinkFromText } from '../../../helpers/urlUtils'
import { FEEDS_LINK_MESSAGE } from '../../../helpers/linkHelpers'
import { RegularText } from '../../misc/text'
import { TwoButton } from '../../buttons/TwoButton'
import { TouchableView } from '../../misc/TouchableView'

const QRCameraWidth = Dimensions.get('window').width
const QRCameraHeight = QRCameraWidth

interface State {
    showCode: boolean
}

export interface DispatchProps { }

export interface StateProps {
    navigation: TypedNavigation
}

type Props = DispatchProps & StateProps

const ButtonContainer = (props: {
    navigation: TypedNavigation,
    showCode: boolean,
    setShowCode: (showCode: boolean) => void,
    onAddLink: () => void,
    onClose: () => void,
}) => {
    return props.showCode
        ?
            <View style={{...styles.container, paddingTop: 10}}>
                <TouchableView onPress={props.onClose}>
                    <Icon name='close' size={24} color={Colors.GRAY}/>
                </TouchableView>
                <QRCodeScanner
                            onRead={(event) => props.navigation.replace('RSSFeedLoader', { feedUrl: event.data })}
                            containerStyle={styles.qrCameraStyle as any as RegisteredStyle<ViewStyle>}
                            cameraStyle={styles.qrCameraStyle as any as RegisteredStyle<ViewStyle>}
                            fadeIn={false}
                            cameraProps={{ratio: '1:1'}}
                />
            </View>
        :
            <TwoButton
                leftButton={{
                    label: 'Scan QR code',
                    icon: <Icon name='qrcode' size={24} color={Colors.BRAND_PURPLE}/>,
                    onPress: () => {
                        props.setShowCode(true)
                        Keyboard.dismiss()
                    },
                }}
                rightButton={{
                    label: 'Add link',
                    icon: <Icon name='link' size={24} color={Colors.BRAND_PURPLE}/>,
                    onPress: props.onAddLink,
                }}
            />
}

export function FeedLinkReader(props: Props) {
    const [showCode, setShowCode] = useState(false)
    const [linkText, setLinkText] = useState('')
    const [textRef, setTextRef] = useState<SimpleTextInput | null>(null)

    const icon = (name: string, size: number = 20) =>
        <Icon name={name} size={size} color={ComponentColors.NAVIGATION_BUTTON_COLOR} />

    useEffect(() => {
        Clipboard.getString().then(clipboardText => {
            if (clipboardText.startsWith(FEEDS_LINK_MESSAGE)) {
                const link = getHttpLinkFromText(clipboardText)
                if (link != null) {
                    props.navigation.replace('RSSFeedLoader', { feedUrl: link })
                }
            }
        })
    }, [])

    const handleLink = (text: string) => {
        if (text === '') {
            props.navigation.goBack(null)
            return
        }
        const feedUrl = text
        props.navigation.replace('RSSFeedLoader', { feedUrl })
    }

    const focusLinkText = () => {
        if (textRef) {
            (textRef as SimpleTextInput).focus()
        }
    }

    return (
        <FragmentSafeAreaView>
            <NavigationHeader
                title={'Add feed'}
                leftButton={{
                    label: icon('close', 24),
                    onPress: () => props.navigation.goBack(null),
                }}
                navigation={props.navigation}
            />
            <View style={styles.container}>
                <RegularText style={styles.hintLabel}>Enter a link of a website or a blog you want to follow. </RegularText>
                <RegularText style={styles.hintLabel}>You can also import Feeds or OPML links or scan QR codes from other people.</RegularText>
                <View style={{
                    flexDirection: 'row',
                }}>
                    <SimpleTextInput
                        style={styles.linkInput}
                        placeholder='Paste link here'
                        placeholderTextColor={Colors.MEDIUM_GRAY}
                        autoCapitalize='none'
                        autoFocus={true}
                        autoCorrect={false}
                        returnKeyType='done'
                        onSubmitEditing={(text) => handleLink(text)}
                        onEndEditing={() => {}}
                        onFocus={() => setShowCode(false)}
                        onChangeText={text => setLinkText(text)}
                        ref={value => setTextRef(value)}
                    />
                </View>
                <View style={styles.qrCameraContainer}>
                    <ButtonContainer
                        navigation={props.navigation}
                        showCode={showCode}
                        setShowCode={sc => setShowCode(sc)}
                        onAddLink={() => handleLink(linkText)}
                        onClose={() => {
                            setShowCode(false)
                            focusLinkText()
                        }}
                    />
                </View>
            </View>
        </FragmentSafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: ComponentColors.BACKGROUND_COLOR,
        flex: 1,
        flexDirection: 'column',
    },
    linkInput: {
        width: '100%',
        backgroundColor: 'white',
        paddingHorizontal: 10,
        paddingVertical: 14,
        color: Colors.DARK_GRAY,
        fontSize: 14,
        fontFamily: defaultMediumFont,
        marginTop: 10,
    },
    qrCameraContainer: {
        width: QRCameraWidth,
        height: QRCameraHeight,
        padding: 0,
        alignSelf: 'center',
        flexDirection: 'column',
    },
    qrCameraStyle: {
        width: QRCameraWidth,
        height: QRCameraHeight,
        paddingTop: 10,
    },
    hintLabel: {
        color: ComponentColors.HINT_TEXT_COLOR,
        paddingTop: 25,
        paddingLeft: 10,
        fontSize: 14,
    },
})
