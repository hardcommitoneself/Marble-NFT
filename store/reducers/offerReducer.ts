import { OFFER_STATUS } from "../types";

const initialState = {
  offer_status: [],
};

const offerReducer = (state = initialState, action) => {
  switch (action.type) {
    case OFFER_STATUS:
      return {
        ...state,
        offer_status: action.payload,
      };
    default:
      return state;
  }
};

export default offerReducer;
