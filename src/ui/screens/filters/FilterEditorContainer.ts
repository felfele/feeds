import { connect } from 'react-redux'
import { AppState } from '../../../reducers/AppState'
import { Actions } from '../../../actions/Actions'
import { StateProps, DispatchProps, FilterEditorScreen } from './FilterEditorScreen'
import { ContentFilter } from '../../../models/ContentFilter'
import { TypedNavigation } from '../../../helpers/navigation'
import { AsyncActions } from '../../../actions/asyncActions'

const mapStateToProps = (state: AppState, ownProps: { navigation: TypedNavigation }): StateProps => {
    return {
        filter: ownProps.navigation.getParam<'EditFilter', 'filter'>('filter'),
        navigation: ownProps.navigation,
    }
}

const mapDispatchToProps = (dispatch: any): DispatchProps => {
    return {
        onAddFilter: (filter: ContentFilter) => {
            dispatch(Actions.addContentFilter(
                filter.text,
                filter.createdAt,
                filter.validUntil,
            ))
            dispatch(AsyncActions.applyContentFilters())
        },
        onRemoveFilter: (filter: ContentFilter) => {
            dispatch(Actions.removeContentFilter(filter))
        },
    }
}

export const FilterEditorContainer = connect(
    mapStateToProps,
    mapDispatchToProps,
)(FilterEditorScreen)
