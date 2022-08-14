import * as React from 'react'
import { StyleSheet, ScrollView, View } from 'react-native'
import MaterialIcon from 'react-native-vector-icons/MaterialIcons'
import { ContentFilter } from '../../../models/ContentFilter'
import { printableElapsedTime } from '../../../helpers/dateHelpers'
import { NavigationHeader } from '../../misc/NavigationHeader'
import { ComponentColors, Colors } from '../../../styles'
import { RowItem } from '../../buttons/RowButton'
import { TypedNavigation } from '../../../helpers/navigation'
import { FragmentSafeAreaView } from '../../misc/FragmentSafeAreaView'
import { BoldText, RegularText } from '../../misc/text'
import { WideButton } from '../../buttons/WideButton'

const AddWordIcon = (props: {color: string}) => <MaterialIcon name='add-box' size={24} color={props.color} />

export interface StateProps {
    navigation: TypedNavigation
    filters: ContentFilter[]
}

export interface DispatchProps {

}

export function FilterListScreen(props: StateProps & DispatchProps) {
    const editFilter = (filter: ContentFilter) => {
        props.navigation.navigate('EditFilter', { filter: filter })
    }

    const onAddFilter = () => {
        const filter: ContentFilter = {
            text: '',
            createdAt: 0,
            validUntil: 0,
        }
        props.navigation.navigate('EditFilter', { filter: filter })
    }

    const filterDescription = (filter: ContentFilter) => {
        if (filter.validUntil === 0) {
            return undefined
        }
        return 'Expires in ' + printableElapsedTime(Date.now(), Math.floor(filter.createdAt + (filter.validUntil * 1.05)))
    }

    return (
        <FragmentSafeAreaView>
            <NavigationHeader
                title='Muted words'
                navigation={props.navigation}
                rightButton1={{
                    onPress: onAddFilter,
                    label: <AddWordIcon color={ComponentColors.NAVIGATION_BUTTON_COLOR} />,
                }}
            />
            <ScrollView style={{ backgroundColor: ComponentColors.BACKGROUND_COLOR, paddingTop: 10 }}>
                {props.filters.length === 0 &&
                    <View style={styles.emptyContainer}>
                        <BoldText style={styles.emptyListTitle}>You aren't muting any words.</BoldText>
                        <RegularText style={styles.emptyListText}>When you mute words, you won't see new posts that include them for the specified time.</RegularText>
                        <WideButton
                            label='Add word'
                            icon={<AddWordIcon color={ComponentColors.BUTTON_COLOR} />}
                            onPress={onAddFilter}
                        />
                    </View>
                }
                {props.filters.map(filter => (
                    <RowItem
                        title={filter.text}
                        description={filterDescription(filter)}
                        key={filter.text}
                        buttonStyle='navigate'
                        onPress={() => {
                            editFilter(filter)
                        }}
                    />
                ))}
            </ScrollView>
        </FragmentSafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    emptyContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 20,
    },
    emptyListTitle: {
        color: ComponentColors.STRONG_TEXT,
    },
    emptyListText: {
        paddingVertical: 20,
        paddingHorizontal: 10,
        color: ComponentColors.HINT_TEXT_COLOR,
    },
})
