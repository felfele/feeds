import * as React from 'react';
import {
    View,
    StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { NavigationHeader } from '../../misc/NavigationHeader';
import { TypedNavigation } from '../../../helpers/navigation';
import { FragmentSafeAreaView } from '../../misc/FragmentSafeAreaView';
import { TwoButton } from '../../buttons/TwoButton';
import { Colors, ComponentColors } from '../../../styles';

export interface StateProps {
    navigation: TypedNavigation;
}

export interface DispatchProps {
}

export type Props = StateProps & DispatchProps;

export interface State {
}

export const ExportImportScreen = (props: Props) => (
    <FragmentSafeAreaView>
        <NavigationHeader
            title='Export & Import feeds'
            navigation={props.navigation}
        />
        <View style={styles.buttonContainer}>
            <TwoButton
                leftButton={{
                    label: 'Export',
                    icon: <Icon name='cloud-upload' color={Colors.BRAND_PURPLE} size={24} />,
                    onPress: () => props.navigation.navigate('Backup', {}),
                }}
                rightButton={{
                    label: 'Import',
                    icon: <Icon name='cloud-download' color={Colors.BRAND_PURPLE} size={24} />,
                    onPress: () => props.navigation.navigate('FeedLinkReader', {}),
                }}
            />
        </View>
    </FragmentSafeAreaView>
);

const styles = StyleSheet.create({
    buttonContainer: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        backgroundColor: ComponentColors.BACKGROUND_COLOR,
    },
});
