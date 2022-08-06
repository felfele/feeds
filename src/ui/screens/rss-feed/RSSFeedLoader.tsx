import * as React from 'react'
import {
    StyleSheet,
    View,
    Text,
    ActivityIndicator,
} from 'react-native'
import { ComponentColors, Colors } from '../../../styles'
import { NavigationHeader } from '../../misc/NavigationHeader'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { TypedNavigation } from '../../../helpers/navigation'
import { FragmentSafeAreaView } from '../../misc/FragmentSafeAreaView'

export interface DispatchProps {
    onLoad: () => void
}

export interface StateProps {
    title: string | undefined
    navigation: TypedNavigation
}

type Props = DispatchProps & StateProps

export class RSSFeedLoader extends React.Component<Props> {
    public async componentDidMount() {
        this.props.onLoad()
    }

    public render() {
        const icon = (name: string, size: number = 20) =>
            <Icon name={name} size={size} color={ComponentColors.NAVIGATION_BUTTON_COLOR}/>
        return (
            <FragmentSafeAreaView>
                <NavigationHeader
                    title={this.props.title || 'Add feed'}
                    leftButton={{
                        label: icon('close', 24),
                        onPress: () => this.props.navigation.goBack(null),
                    }}
                    navigation={this.props.navigation}
                />
                <View style={styles.container}>
                    <View style={styles.centerIcon}>
                        <Text style={styles.activityText}>Fetching feed, hang tight...</Text>
                        <ActivityIndicator size='large' color='grey'/>
                    </View>
                </View>
            </FragmentSafeAreaView>
        )
    }
}

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
})
