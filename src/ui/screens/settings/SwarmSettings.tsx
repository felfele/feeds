import * as React from 'react'
import {
    View,
    KeyboardAvoidingView,
    Text,
    StyleSheet,
    ScrollView,
} from 'react-native'
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons'

import { NavigationHeader } from '../../misc/NavigationHeader'
import { SimpleTextInput } from '../../misc/SimpleTextInput'
import { Colors, ComponentColors } from '../../../styles'
import { TypedNavigation } from '../../../helpers/navigation'
import { RowItem } from '../../buttons/RowButton'
import * as Swarm from '../../../swarm/Swarm'
import { FragmentSafeAreaView } from '../../misc/FragmentSafeAreaView'
import { safeFetch } from '../../../helpers/safeFetch'
import { Debug } from '../../../helpers/Debug'

export interface StateProps {
    swarmGatewayAddress: string
    navigation: TypedNavigation
}

export interface DispatchProps {
    onChangeSwarmGatewayAddress: (address: string) => void
}

export type Props = StateProps & DispatchProps

export interface State {
}

const pingSwarm = async (props: Props) => {
    try {
        const url = props.swarmGatewayAddress + '/'
        const result = await safeFetch(url)
        const hash = await Swarm.upload('hello', props.swarmGatewayAddress)
        Debug.log('SwarmSettings.pingSwarm', {result, hash})
    } catch (e) {
        Debug.log('SwarmSettings.pingSwarm', e)
    }
}

export const SwarmSettings = (props: Props) => (
    <FragmentSafeAreaView>
        <NavigationHeader
            navigation={props.navigation}
            title={'Swarm settings'}
        />
        <ScrollView keyboardShouldPersistTaps={'handled'}>
            <KeyboardAvoidingView style={styles.container}>
                <Text style={styles.tooltip}>Swarm gateway address</Text>
                <SimpleTextInput
                    style={styles.row}
                    defaultValue={props.swarmGatewayAddress}
                    placeholder={props.swarmGatewayAddress}
                    autoCapitalize='none'
                    autoCorrect={false}
                    selectTextOnFocus={true}
                    returnKeyType={'done'}
                    onSubmitEditing={props.onChangeSwarmGatewayAddress}
                    onEndEditing={() => {}}
                />

                <View style={{paddingBottom: 20}} />

                <RowItem
                    icon={
                        <MaterialCommunityIcon name='server-network' />
                    }
                    title={`Use default: ${Swarm.defaultGateway}`}
                    onPress={() => props.onChangeSwarmGatewayAddress(Swarm.defaultGateway)}
                    buttonStyle='none'
                />
                <RowItem
                    icon={
                        <MaterialCommunityIcon name='server-network' />
                    }
                    title={`Use debug server: ${Swarm.defaultDebugGateway}`}
                    onPress={() => props.onChangeSwarmGatewayAddress(Swarm.defaultDebugGateway)}
                    buttonStyle='none'
                />
                <RowItem
                    icon={
                        <MaterialCommunityIcon name='server-network' />
                    }
                    title={`Use public network: ${Swarm.defaultPublicGateway}`}
                    onPress={() => props.onChangeSwarmGatewayAddress(Swarm.defaultPublicGateway)}
                    buttonStyle='none'
                />

                <View style={{paddingBottom: 20}} />

                <RowItem
                    icon={
                        <MaterialCommunityIcon name='check-circle-outline' />
                    }
                    title={`Ping`}
                    onPress={() => pingSwarm(props)}
                    buttonStyle='none'
                />

            </KeyboardAvoidingView>
        </ScrollView>
    </FragmentSafeAreaView>
)

const styles = StyleSheet.create({
    mainContainer: {
        height: '100%',
        backgroundColor: ComponentColors.HEADER_COLOR,
        flex: 1,
    },
    container: {
        height: '100%',
        backgroundColor: ComponentColors.BACKGROUND_COLOR,
    },
    row: {
        width: '100%',
        backgroundColor: 'white',
        borderBottomColor: 'lightgray',
        borderBottomWidth: 1,
        borderTopColor: 'lightgray',
        borderTopWidth: 1,
        paddingHorizontal: 8,
        paddingVertical: 8,
        color: Colors.DARK_GRAY,
        fontSize: 16,
    },
    tooltip: {
        paddingHorizontal: 8,
        paddingTop: 8,
        paddingBottom: 2,
        color: Colors.GRAY,
    },
})
