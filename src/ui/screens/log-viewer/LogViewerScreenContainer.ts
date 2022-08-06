import { connect } from 'react-redux'
import { AppState } from '../../../reducers/AppState'
import * as Actions from '../../../actions/Actions'
import { StateProps, DispatchProps, LogViewerScreen } from './LogViewerScreen'
import { TypedNavigation } from '../../../helpers/navigation'

const mapStateToProps = (state: AppState, ownProps: { navigation: TypedNavigation }): StateProps => {
    return {
        currentTimestamp: state.currentTimestamp,
        navigation: ownProps.navigation,
    }
}

const mapDispatchToProps = (dispatch: any): DispatchProps => {
    return {
        onTickTime: () => {
            dispatch(Actions.Actions.timeTick())
        },
    }
}

export const LogViewerScreenContainer = connect(
    mapStateToProps,
    mapDispatchToProps,
)(LogViewerScreen)
