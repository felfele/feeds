import * as React from 'react';
import { SafeAreaView } from 'react-native';
import { ComponentColors } from '../../styles';
import { StatusBarView } from './StatusBarView';

interface Props {
    children: React.ReactNode | React.ReactNode[];
    topBackgroundColor?: string;
    bottomBackgroundColor?: string;
}

export const FragmentSafeAreaView = (props: Props) => (
    <React.Fragment>
        <StatusBarView
            backgroundColor={props.topBackgroundColor || ComponentColors.HEADER_COLOR}
            hidden={false}
            translucent={false}
            barStyle='light-content'
            networkActivityIndicatorVisible={true}
        />
        <SafeAreaView style={{ flex: 0, backgroundColor: ComponentColors.HEADER_COLOR }} />
        {props.children}
    </React.Fragment>
);
