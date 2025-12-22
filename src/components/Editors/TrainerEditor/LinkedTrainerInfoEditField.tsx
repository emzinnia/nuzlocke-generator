import { connect } from "react-redux";
import { editTrainer } from "actions";
import {
    TrainerInfoEditField,
    TrainerInfoEditFieldProps,
} from "./TrainerInfoEditField";
import { State } from "state";

const mapStateToProps = (
    state: Pick<State, keyof State>,
    ownProps: TrainerInfoEditFieldProps,
) => {
    return {
        value: state.trainer[ownProps.name],
    };
};

const mapDispatchToProps = (dispatch, ownProps: TrainerInfoEditFieldProps) => {
    return {
        onChange: (e: any) => {
            dispatch(
                editTrainer({
                    [ownProps.name]: e.target.value,
                }),
            );
        },
    };
};

export const LinkedTrainerInfoEditField = connect(
    mapStateToProps,
    mapDispatchToProps,
)(TrainerInfoEditField as any);
