import * as React from 'react'
import { useState } from 'react'
import {
    Alert,
    StyleSheet,
    View,
    Text,
} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import RNPickerSelect from 'react-native-picker-select'

import { ContentFilter } from '../../../models/ContentFilter'
import { ComponentColors, defaultTextProps, Colors } from '../../../styles'
import { DAY, MONTH31, WEEK } from '../../../helpers/dateHelpers'
import { SimpleTextInput } from '../../misc/SimpleTextInput'
import { Debug } from '../../../helpers/Debug'
import { NavigationHeader } from '../../misc/NavigationHeader'
import { TypedNavigation } from '../../../helpers/navigation'
import { FragmentSafeAreaView } from '../../misc/FragmentSafeAreaView'
import { WideButton } from '../../buttons/WideButton'
import { TwoButton } from '../../buttons/TwoButton'
import { errorDialog } from '../../../helpers/dialogs'

export interface DispatchProps {
    onAddFilter: (filter: ContentFilter) => void
    onRemoveFilter: (filter: ContentFilter) => void
}

export interface StateProps {
    filter: ContentFilter
    navigation: TypedNavigation
}

type Props = DispatchProps & StateProps

export function FilterEditorScreen(props: Props) {
    const [filterText, setFilterText] = useState(props.filter.text)
    const [filterValue, setFilterValue] = useState( 2 * WEEK)

    const goBack = () => {
        props.navigation.goBack()
    }

    const onAddFilter = async () => {
        if (filterText.match(/^ ?$/) != null) {
            await errorDialog('Keyword is empty!', 'Please enter a keyword')
            return
        }
        const filter: ContentFilter = {
            text: filterText,
            validUntil: filterValue,
            createdAt: Date.now(),
        }
        props.onAddFilter(filter)
        goBack()
    }
    const deleteFilterAndGoBack = () => {
        props.onRemoveFilter(props.filter)
        goBack()
    }
    const onDeleteFilter = () => {
        const options: any[] = [
            { text: 'Yes', onPress: async () => deleteFilterAndGoBack() },
            { text: 'Cancel', onPress: () => Debug.log('Cancel Pressed'), style: 'cancel' },
        ]

        Alert.alert('Are you sure you want to delete the keyword?',
            undefined,
            options,
            { cancelable: true },
        )
    }

    const isDelete = props.filter.text.length > 0
    const addOrEditFilter = isDelete
        ? () => {
            props.onRemoveFilter(props.filter)
            onAddFilter()
        }
        : onAddFilter

    const button = isDelete
        ? <TwoButton
            leftButton={{
                label: 'Delete',
                icon: <Icon
                    name='delete'
                    size={20}
                    color={ComponentColors.WARNING_BUTTON_COLOR}
                />,
                onPress: onDeleteFilter,
                fontStyle: { color: ComponentColors.WARNING_BUTTON_COLOR},
            }}
            rightButton={{
                label: 'Save',
                icon: <Icon
                    name='done'
                    size={20}
                    color={ComponentColors.BUTTON_COLOR}
                />,
                onPress: addOrEditFilter,
            }}
        />
        : <WideButton
            label='Add word'
            icon={<Icon
                name='add-box'
                size={20}
                color={ComponentColors.BUTTON_COLOR}
            />}
            onPress={addOrEditFilter}
        />

    return (
        <FragmentSafeAreaView>
            <NavigationHeader
                title='Mute word'
                navigation={props.navigation}
            />
            <View style={styles.mainContainer}>
                <SimpleTextInput
                    defaultValue={filterText}
                    style={styles.linkInput}
                    onChangeText={(text) => setFilterText(text)}
                    placeholder='Words to be muted'
                    autoCapitalize='none'
                    returnKeyType='done'
                    onSubmitEditing={addOrEditFilter}
                    onEndEditing={() => {}}
                    autoFocus={true}
                    autoCorrect={false}
                />
                <View style={styles.sliderContainer}>
                    <Text style={styles.sliderText}>Mute until</Text>
                    <RNPickerSelect
                        onValueChange={(value) => setFilterValue(value)}
                        value={filterValue}
                        style={{
                            inputIOS: styles.pickerInput,
                            inputAndroid: styles.pickerInput,
                        }}
                        items={[
                            { label: 'One day', value: DAY },
                            { label: 'One week', value: WEEK },
                            { label: 'Two weeks', value: 2 * WEEK },
                            { label: 'One month', value: MONTH31 },
                            { label: 'Three months', value: 3 * MONTH31 },
                            { label: 'Six months', value: 6 * MONTH31 },
                            { label: 'Forever', value: 0 },
                        ]}
                    />
                </View>
                {button}
            </View>
        </FragmentSafeAreaView>
    )
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: ComponentColors.BACKGROUND_COLOR,
        flexDirection: 'column',
        justifyContent: 'flex-start',
    },
    titleInfo: {
        fontSize: 14,
        color: '#8e8e93',
    },
    linkInput: {
        width: '100%',
        backgroundColor: 'white',
        paddingHorizontal: 8,
        paddingVertical: 8,
        color: 'gray',
        fontSize: 16,
        marginTop: 12,
    },
    deleteButtonContainer: {
        backgroundColor: 'white',
        width: '100%',
        position: 'absolute',
        bottom: 0,
        left: 0,
        paddingHorizontal: 10,
        paddingVertical: 10,
    },
    centerIcon: {
        width: '100%',
        justifyContent: 'center',
        flexDirection: 'column',
        height: 40,
        backgroundColor: '#EFEFF4',
        paddingTop: 10,
    },
    sliderContainer: {
        paddingHorizontal: 10,
    },
    sliderText: {
        color: ComponentColors.TEXT_COLOR,
        paddingTop: 10,
    },
    slider: {
        flex: 1,
    },
    pickerInput: {
        ...defaultTextProps.style,
        padding: 10,
        marginVertical: 5,
        backgroundColor: Colors.WHITE,
        color: ComponentColors.TEXT_COLOR,
    },
})
