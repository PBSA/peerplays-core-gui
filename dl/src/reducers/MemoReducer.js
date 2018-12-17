import {
  MEMO_SET_VIEW_STATUS,
  MEMO_RESET_VIEW_MODAL
} from '../constants/ActionTypes';

/**
 * Login Page Reducer is used to controlling login in an application
 * Initial State
 * status - Login form: Button state
 * errors - Login form: Common validation errors
 * accountForLogin - Login form: If the account exists and it's valid, then we work with it
 * @type {{status: string, errors: Array, accountForLogin: null}}
 */
let defaultState = {
  memo: {
    message: '',
    sender: '',
    receiver: '',
    date: ''
  },
  isOpen: false
};

export default function (state = defaultState, action) {
  switch (action.type) {
    case MEMO_SET_VIEW_STATUS:
      return Object.assign({}, state, {
        isOpen: action.isOpen,
        memo: action.memo
      });
    case MEMO_RESET_VIEW_MODAL:
      return defaultState;
    default:
      /**
       * We return the previous state in the default case
       */
      return state;
  }
}
