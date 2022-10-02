import { OFFER_STATUS } from "../types"
import { Dispatch, AnyAction } from "redux"

export const setOfferData = (action: string, data) => async (dispatch) => {
  console.log("dispatch", action, data)
  try {
    switch (action){
      case OFFER_STATUS:
        dispatch({
          type: action,
          payload: data,
        });
      break;
    }  
  } catch (error) {
    console.log(error)
  }
};