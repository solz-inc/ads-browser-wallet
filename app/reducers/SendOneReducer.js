import * as actions from '../actions/transactionActions';
import ADS from '../utils/ads';

const initialState = {
  isSubmitted: false,
  isSignRequired: false,
  isTransactionSent: false,
  accountHash: null,
  transactionData: null,
  signature: null,
  inputs: {
    address: {
      isValid: null,
      value: '',
      errorMsg: ''
    },
    amount: {
      isValid: null,
      value: '',
      errorMsg: ''
    },
    message: {
      isValid: null,
      value: '',
      errorMsg: ''
    }
  }
};

const actionsMap = {
  [actions.INPUT_CHANGED](state, action) {
    return {
      ...state,
      inputs: {
        ...state.inputs,
        [action.inputName]: {
          ...state.inputs[action.inputName],
          value: action.inputValue,
        }
      }
    };
  },

  [actions.INPUT_VALIDATION_FAILURE](state, action) {
    return {
      ...state,
      inputs: {
        ...state.inputs,
        [action.inputName]: {
          ...state.inputs[action.inputName],
          isValid: false,
          errorMsg: action.errorMsg
        }
      }
    };
  },

  [actions.INPUT_VALIDATION_SUCCESS](state, action) {
    return {
      ...state,
      inputs: {
        ...state.inputs,
        [action.inputName]: {
          ...state.inputs[action.inputName],
          isValid: true,
          errorMsg: '',
        }
      }
    };
  },

  [actions.FORM_VALIDATION_SUCCESS](state, action) {
    return {
      ...state,
      ...action.payload
    };
  },

  [actions.FORM_VALIDATION_FAILURE](state, action) {
    return {
      ...state,
      ...action.payload
    };
  },

  [actions.CLEAN_FORM](state, action) {
    return {
      ...state,
      ...action,
      ...initialState
    };
  },

  [actions.SIGN_TRANSACTION](state, action) {
    return {
      ...state,
      isSignRequired: true,
      accountHash: action.accountHash,
      transactionData: action.transactionData
    };
  },

  [actions.TRANSACTION_REJECTED](state, action) {
    return {
      ...state,
      ...action,
      ...initialState
    };
  },

};

export default function (state = initialState, action) {
  if (action.transactionType !== ADS.TX_TYPES.SEND_ONE) return state;
  const reduceFn = actionsMap[action.type];
  if (!reduceFn) return state;
  return reduceFn(state, action);
}