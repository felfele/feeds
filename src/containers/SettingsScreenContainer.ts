import { connect } from 'react-redux';
import { AppState } from '../reducers/AppState';
import { Actions } from '../actions/Actions';
import { StateProps, DispatchProps, SettingsScreen } from '../components/SettingsScreen';
import { TypedNavigation } from '../helpers/navigation';

const mapStateToProps = (state: AppState, ownProps: { navigation: TypedNavigation }): StateProps => {
    return {
        navigation: ownProps.navigation,
        settings: state.settings,
    };
};

const mapDispatchToProps = (dispatch: any): DispatchProps => {
    return {
        onShowSquareImagesValueChange: (value: boolean) => {
            dispatch(Actions.changeSettingShowSquareImages(value));
        },
        onShowDebugMenuValueChange: (value: boolean) => {
            dispatch(Actions.changeSettingShowDebugMenu(value));
        },
    };
};

export const SettingsEditorContainer = connect(
    mapStateToProps,
    mapDispatchToProps,
)(SettingsScreen);
