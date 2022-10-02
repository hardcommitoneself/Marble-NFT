import { RELOAD_STATUS } from "../types";

const initialState = {
  reload_status: 0,
};

const reloadReducer = (state = initialState, action) => {
  switch (action.type) {
    case RELOAD_STATUS:
      return {
        ...state,
        reload_status: action.payload,
      };
    default:
      return state;
  }
};

export default reloadReducer;
