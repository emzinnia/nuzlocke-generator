import * as React from "react";
import { connect } from "react-redux";
import { editTrainer } from "actions";
import {
    TrainerInfoEditField,
    TrainerInfoEditFieldProps,
} from "./TrainerInfoEditField";
import { State } from "state";
import { Dispatch } from "redux";

const mapStateToProps = (
    state: Pick<State, keyof State>,
    ownProps: TrainerInfoEditFieldProps,
) => {
    return {
        value: state.trainer[ownProps.name],
    };
};

const mapDispatchToProps = (dispatch: Dispatch, ownProps: TrainerInfoEditFieldProps) => {
    return {
        onEdit: (e: React.ChangeEvent<HTMLInputElement>) => {
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
)(TrainerInfoEditField);
