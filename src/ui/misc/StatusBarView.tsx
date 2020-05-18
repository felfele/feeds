import * as React from 'react';
import {
    StyleSheet,
    View,
    StatusBar,
    Platform,
    StatusBarProps,
} from 'react-native';

interface Props extends StatusBarProps {
    backgroundColor: string;
}

export const StatusBarView = (props: Props) => (
    <View style={[styles.statusBar, { backgroundColor: props.backgroundColor }]}>
        <StatusBar translucent {...props} backgroundColor={props.backgroundColor} />
    </View>
);

const majorVersionIOS = parseInt(Platform.Version as string, 10);
const STATUSBAR_HEIGHT = Platform.OS === 'ios'
    ? majorVersionIOS < 11 ? 20 : 0
    : 0;

const styles = StyleSheet.create({
    statusBar: {
        height: STATUSBAR_HEIGHT,
    },
});
