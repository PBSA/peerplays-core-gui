import ActionTypes from '../constants/ActionTypes';
import MessageLocation from '../constants/MessageLocation';

class CommonMessagePrivateActions {
  static removeMessage(id) {
    return {
      type: ActionTypes.COMMON_MSG_REMOVE_MSG,
      id
    };
  }
  static addMessage(content, messageType, loc, id) {
    return {
      type: ActionTypes.COMMON_MSG_ADD_MSG,
      content,
      messageType,
      loc,
      id
    };
  }
}

class CommonMessageActions {
  static clearMessage(id) {
    return (dispatch) => {
      dispatch(CommonMessagePrivateActions.removeMessage(id));
    };
  }
  /**
   *
   *
   * @static
   * @param {string} content - The message to be added.
   * @param {string} messageType - 'info', 'success', 'warning', or 'error'
   * @param {string} loc - 'header' or 'aside'. Where the message is to appear.
   * @param {string} id - optional variable. If not supplied, one will be generated.
   * @returns
   * @memberof CommonMessageActions
   */
  static newMessage(content, messageType, loc, id) {
    return (dispatch, getState) => {
      // If an id has not been explicitely defined...
      if (!id) {
        // Generate a unique id for the new message based on the existing number of messages.
        id = getState().get('commonMessage').get('messageCount') + 1;

        if (loc === MessageLocation.HEADER) {
          id = 'h' + id;
        }
      }

      dispatch(CommonMessagePrivateActions.addMessage(content, messageType, loc, id));
    };
  }
}

export default CommonMessageActions;
