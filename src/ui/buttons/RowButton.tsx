import * as React from 'react'
import { Colors } from '../../styles'
import {
    StyleSheet,
    Switch,
    View,
    GestureResponderEvent,
    TouchableWithoutFeedback,
    ViewStyle,
    StyleProp,
} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { RegularText } from '../misc/text'

interface Props {
    title: string
    description?: string
    icon?: React.ReactNode
    onPress?: (event?: GestureResponderEvent) => void
    onLongPress?: (event?: GestureResponderEvent) => void
    onSwitchValueChange?: (value: boolean) => void
    switchState?: boolean
    switchDisabled?: boolean
    buttonStyle: 'none' | 'switch' | 'navigate' | 'link'
    containerStyle?: StyleProp<ViewStyle>
}

export const RowItem = React.memo((props: Props) => {
    switch (props.buttonStyle) {
        case 'navigate':
        case 'link':
        case 'none': {
            return <RowButton {...props}/>
        }
        case 'switch': {
            return <RowSwitchButton {...props}/>
        }
        default: {
            return null
        }
    }
})

const RowButton = (props: Props) => {
    return (
        <TouchableWithoutFeedback
            style={props.containerStyle}
            onPress={props.onPress}
            onLongPress={props.onLongPress}
        >
            <View style={[styles.container, props.containerStyle]}>
                {props.icon &&
                <RowIcon>
                    {props.icon}
                </RowIcon>
                }
                <RegularText style={styles.title}>{props.title}</RegularText>
                <View style={styles.rightContainer}>
                    {props.description &&
                    <RegularText style={styles.description}>{props.description}</RegularText>
                    }
                    {props.buttonStyle === 'navigate' &&
                    <Icon
                        name='chevron-right'
                        size={24}
                        color={Colors.DARK_GRAY}
                    />
                    }
                    {props.buttonStyle === 'link' &&
                    <Icon
                        name='open-in-new'
                        size={20}
                        color={Colors.DARK_GRAY}
                    />
                    }
                </View>
            </View>
        </TouchableWithoutFeedback>
    )
}

const RowSwitchButton = (props: Props) => {
    return (
        <View style={[styles.container, props.containerStyle]}>
            {props.icon &&
            <RowIcon>
                {props.icon}
            </RowIcon>
            }
            <RegularText style={styles.title}>{props.title}</RegularText>
            {props.description &&
            <RegularText style={styles.description}>{props.description}</RegularText>
            }
            <Switch
                onValueChange={props.onSwitchValueChange}
                value={props.switchState}
                style={styles.rightContainer}
                disabled={props.switchDisabled}
            />
        </View>
    )
}

const RowIcon = (props: { children: React.ReactNode}) => (
    <View style={styles.rowIcon}>
        {props.children}
    </View>
)

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        backgroundColor: 'white',
        borderBottomColor: 'lightgray',
        borderBottomWidth: 0.5,
        paddingHorizontal: 10,
        height: 50,
    },
    title: {
        fontSize: 14,
        color: Colors.DARK_GRAY,
    },
    description: {
        fontSize: 14,
        color: Colors.LIGHTISH_GRAY,
    },
    rightContainer: {
        marginLeft: 'auto',
        flexDirection: 'row',
        alignItems: 'center',
    },
    rowIcon: {
        paddingRight: 10,
        alignItems: 'center',
    },
})
