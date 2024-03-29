import * as React from 'react'
import { View, TouchableNativeFeedback, TouchableWithoutFeedback, TouchableWithoutFeedbackProps, Platform, TouchableNativeFeedbackBase } from 'react-native'

export const TOUCHABLE_VIEW_DEFAULT_HIT_SLOP = {
    top: 20,
    left: 30,
    bottom: 20,
    right: 30,
}

export const ZERO_HIT_SLOP = {
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
}

const Touchable = Platform.OS === 'ios'
    ? TouchableWithoutFeedback
    : TouchableNativeFeedback

export interface TouchableViewProps extends TouchableWithoutFeedbackProps {
    children: React.ReactNode
}

export const TouchableView = (props: TouchableViewProps) => (
    <Touchable
        onPress={props.onPress}
        onLongPress={props.onLongPress}
        hitSlop={props.hitSlop ? props.hitSlop : TOUCHABLE_VIEW_DEFAULT_HIT_SLOP}
        testID={props.testID}
    >
        <View {...props} >
            {props.children}
        </View>
    </Touchable>
)
