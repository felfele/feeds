import * as React from 'react';
import {
    View,
    StyleSheet,
    Dimensions,
    ActivityIndicator,
} from 'react-native';

import { RegularText } from './text';
import { ComponentColors, Colors } from '../../styles';

export const LoadingView = (props: {text: string}) => (
    <View style={styles.container}>
        <View style={styles.centerIcon}>
            <RegularText style={styles.activityText}>{props.text}</RegularText>
            <ActivityIndicator size='large' color='grey'/>
        </View>
    </View>
);

const styles = StyleSheet.create({
        container: {
        backgroundColor: ComponentColors.BACKGROUND_COLOR,
        flex: 1,
        flexDirection: 'column',
    },
    centerIcon: {
        width: '100%',
        justifyContent: 'center',
        flexDirection: 'column',
        height: 200,
        backgroundColor: ComponentColors.BACKGROUND_COLOR,
        paddingTop: 50,
    },
    activityText: {
        fontSize: 16,
        color: Colors.GRAY,
        alignSelf: 'center',
        marginBottom: 30,
    },
});
