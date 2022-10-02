import { BUY_STATUS } from "../types";

const initialState = {
  buy_status: "",
};

const buyReducer = (state = initialState, action) => {
  switch (action.type) {
    case BUY_STATUS:
      return {
        ...state,
        buy_status: action.payload,
      };
    default:
      return state;
  }
};

export default buyReducer;
