// @ts-nocheck
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    advert: {
        isLoading: false,
        fetching_adverts: false,
        advert: [],
    },
    survey: {
        isLoading: false,
        fetching_surveys: false,
        survey: [],
    },
};

export const STATE_KEY = 'offers';

const offersSlice = createSlice({
    name: STATE_KEY,
    initialState,
    reducers: {
        // advertise socket
        set_is_adding_advert(state, action) {
            state.advert.isLoading = action.payload;
        },
        set_is_fetching_advert(state, action) {
            state.advert.fetching_adverts = action.payload;
        },
        add_advert(state, action) {
            if (action.payload != undefined) {
                state.advert.advert.push(action.payload);
            }
        },
        delete_advert(state, action) {
            if (action.payload != undefined) {
                const index = action.payload;
                if (index != undefined) {
                    state.advert.advert.splice(index, 1);
                }
            }
        },

        set_edit_advert(state, action) {
            if (action.payload != undefined) {
                let update = state.advert.advert.findIndex(
                    value => value._id == action.payload._id,
                );
                if (update !== -1) {
                    state.advert.advert[update] = action.payload;
                }
            }
        },

        set_advert(state, action) {
            if (action.payload != undefined) {
                state.advert.advert = action.payload;
            }
        },

        // survey socket

        set_is_adding_survey(state, action) {
            state.survey.isLoading = action.payload;
        },
        set_is_fetching_survey(state, action) {
            state.survey.fetching_surveys = action.payload;
        },
        add_survey(state, action) {
            if (action.payload != undefined) {
                state.survey.survey.push(action.payload);
            }
        },

        delete_survey(state, action) {
            if (action.payload != undefined) {
                const index = action.payload;
                if (index != undefined) {
                    state.survey.survey.splice(index, 1);
                }
            }
        },

        update_is_active(state, action) {
            if (action.payload != undefined) {
                const { index, survey } = action.payload;
                if (index != undefined && survey) {
                    let active = state.survey.survey.find(
                        value => value.is_active === true,
                    );
                    if (active) {
                        active.is_active = false;
                    }
                    state.survey.survey[index] = survey;
                }
            }
        },
        set_edit_survey(state, action) {
            if (action.payload != undefined) {
                let active = state.survey.survey.findIndex(
                    value => value._id == action.payload._id,
                );
                if (active !== -1) {
                    state.survey.survey[active] = action.payload;
                }
            }
        },

        set_survey(state, action) {
            if (action.payload != undefined) {
                state.survey.survey = action.payload;
            }
        },
    },
});

export const {
    set_is_adding_advert,
    set_advert,
    set_is_fetching_advert,
    add_advert,
    set_edit_advert,
    delete_advert,

    set_is_adding_survey,
    set_survey,
    set_is_fetching_survey,
    add_survey,
    update_is_active,
    set_edit_survey,
    delete_survey,
} = offersSlice.actions;

// advertise thunks
export const create_advert = payload => async (dispatch, getState) => {
    const socket = getState().auth.socket;
    dispatch(set_is_adding_advert(true));
    socket.emit(
        'create_advert',
        { event_name: 'create_advert', data: payload },
        response => {
            dispatch(set_is_adding_advert(false));
            if (response.data) {
                dispatch(add_advert(response.data));
            }
        },
    );
};

export const remove_advert = (id, index) => async (dispatch, getState) => {
    const socket = getState().auth.socket;
    dispatch(set_is_fetching_advert(true));
    socket.emit(
        'remove_advert',
        { event_name: 'remove_advert', data: id },
        response => {
            dispatch(set_is_fetching_advert(false));
            if (response.data) {
                dispatch(delete_advert(index));
            }
        },
    );
};

export const edit_advert = payload => async (dispatch, getState) => {
    const socket = getState().auth.socket;
    dispatch(set_is_fetching_survey(true));
    socket.emit(
        'edit_advert',
        { event_name: 'edit_advert', data: payload },
        response => {
            dispatch(set_is_fetching_survey(false));
            if (response.data) {
                dispatch(set_edit_advert(response.data));
            }
        },
    );
};

export const get_adverts = () => async (dispatch, getState) => {
    const socket = getState().auth.socket;
    dispatch(set_is_fetching_advert(true));
    socket.emit('get_adverts', { event_name: 'get_adverts' }, response => {
        dispatch(set_is_fetching_advert(false));

        if (response.data) {
            dispatch(set_advert(response.data));
        }
    });
};

// survey thunks
export const create_survey = payload => async (dispatch, getState) => {
    const socket = getState().auth.socket;
    dispatch(set_is_adding_survey(true));
    socket.emit(
        'create_survey',
        { event_name: 'create_survey', data: payload },
        response => {
            dispatch(set_is_adding_survey(false));
            if (response.data) {
                dispatch(add_survey(response.data));
            }
        },
    );
};

export const remove_survey = (id, index) => async (dispatch, getState) => {
    const socket = getState().auth.socket;
    dispatch(set_is_fetching_survey(true));
    socket.emit(
        'remove_survey',
        { event_name: 'remove_survey', data: { id } },
        response => {
            dispatch(set_is_fetching_survey(false));
            if (response.data) {
                dispatch(delete_survey(index));
            }
        },
    );
};

export const active_survey =
    (id, workspace_id, widgetId, is_active, index) =>
        async (dispatch, getState) => {
            const socket = getState().auth.socket;
            dispatch(set_is_fetching_survey(true));
            socket.emit(
                'set_active_survey',
                {
                    event_name: 'set_active_survey',
                    data: { id, workspace_id, widgetId, is_active },
                },
                response => {
                    dispatch(set_is_fetching_survey(false));
                    if (response.data) {
                        dispatch(update_is_active({ index, survey: response.data }));
                    }
                },
            );
        };
export const edit_survey = payload => async (dispatch, getState) => {
    const socket = getState().auth.socket;
    dispatch(set_is_fetching_survey(true));
    socket.emit(
        'edit_survey',
        { event_name: 'edit_survey', data: payload },
        response => {
            dispatch(set_is_fetching_survey(false));
            if (response.data) {
                dispatch(set_edit_survey(response.data));
            }
        },
    );
};
export const get_survey = id => async (dispatch, getState) => {
    const socket = getState().auth.socket;
    dispatch(set_is_fetching_survey(true));
    socket.emit(
        'get_survey',
        { event_name: 'get_survey', data: id },
        response => {
            dispatch(set_is_fetching_survey(false));

            if (response.data) {
                dispatch(set_survey(response.data));
            }
        },
    );
};
export const get_surveys = () => async (dispatch, getState) => {
    const socket = getState().auth.socket;
    dispatch(set_is_fetching_survey(true));
    socket.emit('get_surveys', { event_name: 'get_surveys' }, response => {
        dispatch(set_is_fetching_survey(false));

        if (response.data) {
            dispatch(set_survey(response.data));
        }
    });
};

export const offersSelector = state => state[STATE_KEY];

export default offersSlice.reducer;
