import React from 'react';
import {Link} from 'react-router';
import counterpart from 'counterpart';
import {connect} from 'react-redux';
import classNames from 'classnames';
import Notices from './Notices';
import {AppActions, HelpActions} from '../../actions';
import Translate from 'react-translate-component';
import {bindActionCreators} from 'redux';

class Header extends React.Component {
  onLogoutClick(e) {
    e.preventDefault();
    this.props.logout();
  }

  onClickHelpLink(e) {
    this.props.toggleHelpModal(true);
    e.preventDefault();
  }

  render() {
    let settings = counterpart.translate('header.settings');
    let help = counterpart.translate('header.help');

    return (
      <div className='header'>
        <div className='box'>
          {}
          <Link to='/dashboard' className = 'logo' >
            <img src='images/logo_pp-2.png' alt=''/>
          </Link>
          <div className='nav__right nav-bdl'>
            <Link
              to='/settings'
              className={ classNames({' nav__link bb nav__link - set ': true, ' active ': (/\/settings/.test(this.props.pathname))}) }> {/* eslint-disable-line */}
              <span className='nav__linkAlign'>
                <span className='nav__linkIcon nav__linkIcon-blank icon-settings'></span>
                <span className='nav__linkIcon nav__linkIcon-filled icon-settings-filled'></span>
                <span className='nav__linkText'>{settings}</span>
              </span>
            </Link>
            <a
              onClick={ this.onClickHelpLink.bind(this) }
              href='/help'
              className='nav__link bb nav__link-help'>
              <span className='nav__linkAlign'>
                <span className='nav__linkIcon nav__linkIcon-blank icon-help'></span>
                <span className='nav__linkIcon nav__linkIcon-filled icon-help-filled'></span>
                <span className='nav__linkText'>{help}</span>
              </span>
            </a>
            <Notices/>
          </div>
          <nav className='nav'>
            <Link
              to='/dashboard'
              className={ classNames({
                'nav__link': true,
                'active': (/\/send|\/deposit-withdraw|\/account\/vesting/.test(this.props.pathname))
              }) }
              activeClassName='active'>
              <span className='nav__linkAlign'>
                <span className='nav__linkIcon nav__linkIcon-blank icon-funds'></span>
                <span className='nav__linkIcon nav__linkIcon-filled icon-funds-filled'></span>
                <Translate
                  component='span'
                  className='nav__linkText'
                  content='header.dashboard'/>
              </span>
            </Link>

            <Link to='/explore/voting' className='nav__link' activeClassName='active'>
              <span className='nav__linkAlign'>
                <span className='nav__linkIcon nav__linkIcon-blank icon-check2'></span>
                <span className='nav__linkIcon nav__linkIcon-filled icon-check2-filled'></span>
                <Translate component='span' className='nav__linkText' content='header.vote'/>
              </span>
            </Link>
            <Link to='/explore/blockchain' className='nav__link ' activeClassName='active'>
              <span className='nav__linkAlign'>
                <span className='nav__linkIcon nav__linkIcon-blank icon-arrows2'></span>
                <span className='nav__linkIcon nav__linkIcon-filled icon-arrows2-filled'></span>
                <Translate component='span' className='nav__linkText' content='header.network'/>
              </span>
            </Link>
          </nav>
          <nav className='nav__right'></nav>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    active : state.active,
    wallet : state.walletData.wallet,
    linkedAccounts : state.account.linkedAccounts,
    currentAccount : state.account.currentAccount,
    starredAccounts : state.account.starredAccounts,
    locked : state.wallet.locked,
    current_wallet : state.wallet.currentWallet,
  };
};

const mapDispatchToProps = (dispatch) => bindActionCreators(
  {
    logout: AppActions.logout,
    toggleHelpModal: HelpActions.toggleHelpModal
  },
  dispatch
);

export default connect(mapStateToProps, mapDispatchToProps)(Header);
