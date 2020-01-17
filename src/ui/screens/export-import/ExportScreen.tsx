import * as React from 'react';
import {
    View,
    StyleSheet,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { NavigationHeader } from '../../misc/NavigationHeader';
import { Colors, ComponentColors, DefaultNavigationBarHeight, defaultMediumFont } from '../../../styles';
import { AppState } from '../../../reducers/AppState';
import { TypedNavigation } from '../../../helpers/navigation';
import { FragmentSafeAreaViewWithoutTabBar } from '../../misc/FragmentSafeAreaView';
import { TouchableView } from '../../misc/TouchableView';
import { MediumText, RegularText } from '../../misc/text';
import { WideButton } from '../../buttons/WideButton';
import { upload } from '../../../swarm/Swarm';
import { Debug } from '../../../Debug';
import { errorDialog, shareDialog } from '../../../helpers/dialogs';
import { FELFELE_FEEDS_MIME_TYPE } from '../../../helpers/feedHelpers';
import { makeFeedsLinkMessage } from '../../../helpers/linkHelpers';
import { LoadingView } from '../../misc/LoadingView';

const QRCodeWidth = Dimensions.get('window').width * 0.6;

export interface StateProps {
    navigation: TypedNavigation;
    appState: AppState;
}

export interface DispatchProps {
}

export type Props = StateProps & DispatchProps;

type State = |
    {
        type: 'saving';
    }
    |
    {
        type: 'saved';
        link: string;
    }
;

const QRCodeView = (props: {navigation: TypedNavigation, qrCodeValue: string, onPressShare: () => void}) => (
    <View style={styles.qrViewContainer}>
        <TouchableView style={styles.qrCodeContainer}>
            { props.qrCodeValue != null
            ?
                <QRCode
                    value={props.qrCodeValue}
                    size={QRCodeWidth}
                    color={Colors.BLACK}
                    backgroundColor={ComponentColors.BACKGROUND_COLOR}
                />
            :
                <ActivityIndicator />
        }
        </TouchableView>
        <View style={styles.qrCodeHintContainer}>
            <RegularText style={styles.qrCodeHint}>This is your feeds code.</RegularText>
            <RegularText style={styles.qrCodeHint}>Ask people to scan it or share as a link.</RegularText>
        </View>
        <WideButton
            label='Share link'
            icon={<Icon name='share' size={24} color={Colors.BRAND_PURPLE} />}
            onPress={props.onPressShare}
        />
    </View>
);

const uploadFeeds = async (appState: AppState): Promise<string> => {
    const exportedData = {
        feeds: appState.feeds.filter(feed => !feed.url.startsWith('local/')),
    };
    const data = JSON.stringify(exportedData);
    const link = await upload(
        data,
        appState.settings.swarmGatewayAddress,
        {
            'Content-type': FELFELE_FEEDS_MIME_TYPE,
        }
    );
    return link;
};

const showShareFeedsLinkDialog = (link: string) => {
    const title = 'Share your feeds';
    const message = makeFeedsLinkMessage(link);
    shareDialog(title, message);
};

export class ExportScreen extends React.PureComponent<Props, State> {
    public state: State = {
        type: 'saving',
    };

    public async componentDidMount() {
        try {
            const link = await uploadFeeds(this.props.appState);
            Debug.log('Backup.componentDidMount', {link});
            this.setState({
                type: 'saved',
                link,
            });
        } catch (e) {
            await errorDialog('Error', 'Failed to export feeds, check your network connection', 'Bummer!');
            this.props.navigation.goBack(null);
        }
    }

    public render = () => (
        <FragmentSafeAreaViewWithoutTabBar>
            <NavigationHeader
                title='Export all feeds'
                navigation={this.props.navigation}
            />
            { this.state.type === 'saving'
            ? <LoadingView text='Exporting feeds, hang tight...' />
            : <QRCodeView
                navigation={this.props.navigation}
                qrCodeValue={this.state.link}
                onPressShare={() => showShareFeedsLinkDialog((this.state as any).link)}
            />
            }
        </FragmentSafeAreaViewWithoutTabBar>
    )
}

const styles = StyleSheet.create({
    mainContainer: {
        height: '100%',
        flexDirection: 'column',
        backgroundColor: ComponentColors.HEADER_COLOR,
    },
    backupTextInput: {
        fontSize: 10,
        flex: 1,
        padding: 3,
        color: Colors.GRAY,
        backgroundColor: Colors.WHITE,
        marginBottom: DefaultNavigationBarHeight + 10,
    },
    secretContainer: {
        flexDirection: 'row',
    },
    secretTextInput: {
        width: '100%',
        backgroundColor: 'white',
        paddingHorizontal: 10,
        paddingVertical: 14,
        color: Colors.DARK_GRAY,
        fontSize: 14,
        fontFamily: defaultMediumFont,
        marginTop: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.WHITE,
        margin: 10,
        height: 44,
    },
    buttonIcon: {
        alignItems: 'center',
        paddingRight: 6,
    },
    buttonLabel: {
        fontSize: 12,
        color: Colors.BRAND_PURPLE,
    },
    qrViewContainer: {
        backgroundColor: ComponentColors.BACKGROUND_COLOR,
        flex: 1,
    },
    qrCodeContainer: {
        marginVertical: 20,
        width: QRCodeWidth,
        height: QRCodeWidth,
        padding: 0,
        alignSelf: 'center',
    },
    qrCodeHintContainer: {
        paddingBottom: 20,
    },
    qrCodeHint: {
        paddingHorizontal: 10,
        color: Colors.GRAY,
        fontSize: 14,
        alignSelf: 'center',
    },
});
