import { combineReducers } from "redux";
import uiReducer from "./uiReducer";
import filterReducer from "./filterReducer";
import profileReducer from "./profileReducer";
import buyReducer from "./buyReducer";
import offerReducer from "./offerReducer";
import reloadReducer from "./reloadReducer";

const allReducers = combineReducers({
  uiData: uiReducer,
  filterData: filterReducer,
  profileData: profileReducer,
  buyData: buyReducer,
  offerData: offerReducer,
  reloadData: reloadReducer,

});
export default allReducers;
export type State = ReturnType<typeof allReducers>;