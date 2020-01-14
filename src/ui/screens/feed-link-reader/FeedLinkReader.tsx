import * as React from 'react';
import {
    StyleSheet,
    View,
    Dimensions,
    RegisteredStyle,
    ViewStyle,
} from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';

import { SimpleTextInput } from '../../../components/SimpleTextInput';
import { ComponentColors, Colors, defaultMediumFont } from '../../../styles';
import { NavigationHeader } from '../../../components/NavigationHeader';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { TypedNavigation } from '../../../helpers/navigation';
import { FragmentSafeAreaViewWithoutTabBar } from '../../misc/FragmentSafeAreaView';

const QRCameraWidth = Dimensions.get('window').width;
const QRCameraHeight = QRCameraWidth;

interface State {
}

export interface DispatchProps { }

export interface StateProps {
    navigation: TypedNavigation;
}

type Props = DispatchProps & StateProps;

export class FeedLinkReader extends React.Component<Props, State> {
    public render() {
        const icon = (name: string, size: number = 20) =>
            <Icon name={name} size={size} color={ComponentColors.NAVIGATION_BUTTON_COLOR} />;

        return (
            <FragmentSafeAreaViewWithoutTabBar>
                <NavigationHeader
                    title={'Add channel'}
                    leftButton={{
                        label: icon('close', 24),
                        onPress: () => this.props.navigation.goBack(null),
                    }}
                    navigation={this.props.navigation}
                />
                <View style={styles.container}>
                    <SimpleTextInput
                        style={styles.linkInput}
                        placeholder='Scan QR code or paste link here'
                        placeholderTextColor={Colors.MEDIUM_GRAY}
                        autoCapitalize='none'
                        autoFocus={true}
                        autoCorrect={false}
                        returnKeyType='done'
                        onSubmitEditing={(text) => this.handleLink(text)}
                        onEndEditing={() => {}}
                    />
                    <View style={styles.qrCameraContainer}>
                        <QRCodeScanner
                            onRead={(event) => this.onScanSuccess(event.data)}
                            containerStyle={styles.qrCameraStyle as any as RegisteredStyle<ViewStyle>}
                            cameraStyle={styles.qrCameraStyle as any as RegisteredStyle<ViewStyle>}
                            fadeIn={false}
                            cameraProps={{ratio: '1:1'}}
                        />
                    </View>
                </View>
            </FragmentSafeAreaViewWithoutTabBar>
        );
    }

    private handleLink(link: string) {
        this.props.navigation.replace('RSSFeedLoader', { feedUrl: link });
    }

    private onScanSuccess = (data: any) => {
        this.handleLink(data);
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
    },
});
