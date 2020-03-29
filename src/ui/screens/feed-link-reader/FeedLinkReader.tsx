import * as React from 'react';
import {
    StyleSheet,
    View,
    Dimensions,
    RegisteredStyle,
    ViewStyle,
    Clipboard,
    Keyboard,
} from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';

import { SimpleTextInput } from '../../misc/SimpleTextInput';
import { ComponentColors, Colors, defaultMediumFont } from '../../../styles';
import { NavigationHeader } from '../../misc/NavigationHeader';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { TypedNavigation } from '../../../helpers/navigation';
import { FragmentSafeAreaView } from '../../misc/FragmentSafeAreaView';
import { getHttpLinkFromText } from '../../../helpers/urlUtils';
import { FEEDS_LINK_MESSAGE } from '../../../helpers/linkHelpers';
import { RegularText } from '../../misc/text';
import { WideButton } from '../../buttons/WideButton';

const QRCameraWidth = Dimensions.get('window').width;
const QRCameraHeight = QRCameraWidth;

interface State {
    showCode: boolean;
}

export interface DispatchProps { }

export interface StateProps {
    navigation: TypedNavigation;
}

type Props = DispatchProps & StateProps;

const QRCodeButton = (props: {navigation: TypedNavigation, showCode: boolean, setShowCode: (showCode: boolean) => void}) => {
    return props.showCode
        ?
            <QRCodeScanner
                onRead={(event) => props.navigation.replace('RSSFeedLoader', { feedUrl: event.data })}
                containerStyle={styles.qrCameraStyle as any as RegisteredStyle<ViewStyle>}
                cameraStyle={styles.qrCameraStyle as any as RegisteredStyle<ViewStyle>}
                fadeIn={false}
                cameraProps={{ratio: '1:1'}}
            />
        :
            <WideButton
                label='SCAN QR CODE'
                icon={<Icon name='qrcode' size={24} color={Colors.BRAND_PURPLE}/>}
                onPress={() => {
                    props.setShowCode(true);
                    Keyboard.dismiss();
                }}
            />
    ;
};

export class FeedLinkReader extends React.Component<Props, State> {
    public state = {
        showCode: false,
    };

    public render() {
        const icon = (name: string, size: number = 20) =>
            <Icon name={name} size={size} color={ComponentColors.NAVIGATION_BUTTON_COLOR} />;

        return (
            <FragmentSafeAreaView>
                <NavigationHeader
                    title={'Add feed'}
                    leftButton={{
                        label: icon('close', 24),
                        onPress: () => this.props.navigation.goBack(null),
                    }}
                    navigation={this.props.navigation}
                />
                <View style={styles.container}>
                    <RegularText style={styles.hintLabel}>Enter a link of a website or a blog you want to follow. You can also import Feeds or OPML links.</RegularText>
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
                            onSubmitEditing={(text) => this.handleLink(text)}
                            onEndEditing={() => {}}
                            onFocus={() => this.setState({showCode: false})}
                        />
                    </View>
                    <RegularText style={styles.hintLabel}>You can also scan QR codes from other people.</RegularText>
                    <View style={styles.qrCameraContainer}>
                        <QRCodeButton
                            navigation={this.props.navigation}
                            showCode={this.state.showCode}
                            setShowCode={showCode => this.setState({showCode})}
                        />
                    </View>
                </View>
            </FragmentSafeAreaView>
        );
    }

    public async componentDidMount() {
        const clipboardText = await Clipboard.getString();
        if (clipboardText.startsWith(FEEDS_LINK_MESSAGE)) {
            const link = getHttpLinkFromText(clipboardText);
            if (link != null) {
                this.props.navigation.replace('RSSFeedLoader', { feedUrl: link });
            }
        }
    }

    private handleLink(text: string) {
        if (text === '') {
            this.props.navigation.goBack(null);
            return;
        }
        const feedUrl = text;
        this.props.navigation.replace('RSSFeedLoader', { feedUrl });
    }
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
});
