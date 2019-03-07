import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import CommonMessageActions from '../../actions/CommonMessageActions';
import Config from '../../../config/Config';
import MessageType from '../../constants/MessageTypes';
import _ from 'lodash';
import './CommonMessage.scss';
import Immutable from 'immutable';

const compileMessage = (props) => {
  let messageList;

  if (props.location === 'header') {
    messageList = props.headerMessages;
  }

  // Filter the message list to only show the number of messages configured.
  messageList = messageList.slice(0, props.numOfCommonMessageToDisplay);

  const messages = messageList.map((pair, key) => {
    let messageType = pair.get('messageType');
    let id = pair.get('id');

    return (
      <div
        className={ 'cmn-msg__bkg cmn-msg__bkg--' + messageType }
        key={ key }
        id={ id }
      >
        <div className='cmn-msg__cont'>
          <span className='cmn-msg__cont-txt'>{pair.get('content') }</span>
          <p className='cmn-msg__cont-dismiss'onClick={ () => props.clearMessage(id) }>X</p>
        </div>
      </div>
    );
  });
  return messages;
};

class CommonMessage extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      timeout: null
    };

    this.timerList = Immutable.List();
    this.checkToAssignTimer = this.checkToAssignTimer.bind(this);
  }

  // Only the most recent message has an associated timer.
  // Other messages will not have a timer until they are shown.
  setTimer(id, index) {
    if (index === 0) {
      this.timerList = this.timerList.push(setTimeout(
        this.props.clearMessage.bind(this, id), Config.commonMessageModule.timeout
      ));
    } else {
      this.timerList.forEach((timer, index) => {
        if (index !== this.timerList.size-1) {
          clearTimeout(timer);
        }
      });

    }
  }

  checkToAssignTimer(messages) {
    messages.forEach((msg, index) => {
      let msgType = msg.get('messageType');

      if (msgType === MessageType.SUCCESS || msgType === MessageType.INFO) {
        this.setTimer(msg.get('id'), index);
      }
    });
  }


  componentDidUpdate(prevProps) {
    // Use lodash for a deep comparison of the merged messages.
    if (!_.isEqual(this.props.headerMessages, prevProps.headerMessages)) {
      this.checkToAssignTimer(this.props.headerMessages);
    }
  }

  componentDidMount() {
    this.checkToAssignTimer(this.props.headerMessages);
  }

  render() {
    return (
      <div className='cmn-msg'>
        {compileMessage(this.props)}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  const reverse = Config.commonMessageModule.sortingMethod === 'oldest';

  const messages = state.commonMessage;
  let headerMessages = messages.get('headerMessages');
  const numOfCommonMessageToDisplay = Config.commonMessageModule.numOfCommonMessageToDisplay;

  if (reverse) {
    headerMessages = headerMessages.reverse();
  }

  // Determine the number of messages for calculating the heigh offset needed.
  let numOfheaderMessages = headerMessages.size;

  if (numOfheaderMessages > numOfCommonMessageToDisplay) {
    numOfheaderMessages = numOfCommonMessageToDisplay;
  }

  //Calculate the heights of the header child div and the betslip child div.
  const messagingHeight = 35 * numOfheaderMessages;
  const domLoaded = document.getElementsByClassName('main').length > 0 &&
   document.getElementsByClassName('aside').length > 0;

  if (domLoaded) {
    // Add padding to the main.
    document.getElementsByClassName('main')[0].style.paddingTop = messagingHeight + 'px';

    // Due to the nature of the aside, we need to modify the top value.
    document.getElementsByClassName('aside')[0].style.marginTop = messagingHeight + 'px';
  }

  return {
    headerMessages,
    numOfCommonMessageToDisplay
  };
};

const mapDispatchToProps = (dispatch) => bindActionCreators(
  {
    clearMessage : CommonMessageActions.clearMessage
  },
  dispatch
);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CommonMessage);
