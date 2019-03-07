import Immutable from 'immutable';
import ActionTypes from '../constants/ActionTypes';

let initialState = Immutable.fromJS({
  messageCount: 0,
  headerMessages: [],
  activeMessage: false,
});

export default function(state = initialState, action) {
  switch (action.type) {
    case ActionTypes.COMMON_MSG_ADD_MSG: {
      const newMsg = Immutable.fromJS([{
        content: action.content,
        messageType: action.messageType,
        id: action.id
      }]);
      const location = action.loc + 'Messages';
      const messageCount = state.get('messageCount') + 1;
      const activeMessage = messageCount > 0  ? true : false;
      const newState = state.update(location, (msgs) => newMsg.concat(msgs))
        .set('messageCount', messageCount)
        .set('activeMessage', activeMessage);

      return newState;
    }

    case ActionTypes.COMMON_MSG_REMOVE_MSG: {
      // get current state of messages
      // operate on the one matching supplied id
      let messageCount = state.get('messageCount');
      const newMessageCount = messageCount > 0 ? --messageCount : 0; // cannot have negative count
      const id = action.id;
      const activeMessage = newMessageCount === 0 ? false : true;
      const newHeaderMsgState = state.get('headerMessages')
        .filter((m) => {
          let mID = m.get('id');

          //Filter exchange messages.
          return mID !== id;
        });

      return state.set('headerMessages', newHeaderMsgState)
        .set('messageCount', newMessageCount)
        .set('activeMessage', activeMessage);
    }

    case ActionTypes.COMMON_MSG_RESET: {
      return initialState;
    }

    default: {
      return state;
    }
  }
}
