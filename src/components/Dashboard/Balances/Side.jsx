import React from 'react';
import {connect} from 'react-redux';
import Translate from 'react-translate-component';
import {FormattedNumber} from 'react-intl';
import AccountImage from '../../Account/AccountImage';
import {DashboardPageActions, NavigateActions} from '../../../actions';
import asset_utils from 'common/asset_utils';
import AppActions from 'actions/AppActions';
import SideVesting from './SideVesting';
import {bindActionCreators} from 'redux';
class Side extends React.Component {

  componentWillMount() {
    this.props.fetchCurrentBalance();
  }

  onLogoutClick(e) {
    e.preventDefault();
    this.props.logout();
  }

  navigateToDepositWithDraw() {
    this.props.navigateToDepositWithDraw();
  }

  render() {
    let {
      availableBalances,
    } = this.props;

    let availableKeys = Object.keys(availableBalances);

    return (
      <aside className='aside'>
        <div className='nav__user dd dd-hover'>
          <div className='nav__userDDTrigger ddTrigger'>
            <div className='nav__userPic'>
              <AccountImage
                size={ {
                  height: 40,
                  width: 40
                } }
                className='aside__headPic'
                account={
                  this.props.account
                    ? this.props.account
                    : null
                }
                custom_image={ null }
              />
            </div>
            <div className='nav__userInfo'>
              <div className='nav__userName'>
                {this.props.account}
              </div>
            </div>
          </div>
          <div className='nav__userDDMenu ddMenu'>
            <a
              href='#/logout'
              className='logout'
              onClick={ this.onLogoutClick.bind(this) }
            >
              <Translate component='span' className='' content='dashboard.side.logout'/>
            </a>
          </div>
        </div>
        <div className='aside__item bb'>
          <Translate
            component='div'
            className='aside__title'
            content='dashboard.side.available_balances'
          />
          {availableKeys.map((availableKey) => {
            let balance = availableBalances[availableKey];

            if (!balance) {
              return null;
            }

            let currentBalance = balance.coreTokenTotal + balance.cryptoTokensTotal;
            let precision = balance.precision;
            let decimals = balance.decimals;

            return (
              <div key={ balance.assetSymbol } className='aside__row'>
                <div className='aside__unit'>
                  {asset_utils.getSymbol(balance.assetSymbol)}
                </div>
                <div className='aside__num'>
                  <FormattedNumber
                    value={
                      (currentBalance && !isNaN(currentBalance / precision))
                        ? (currentBalance / precision)
                        : 0
                    }
                    minimumFractionDigits={ 0 }
                    maximumFractionDigits={ decimals }
                  />
                </div>
              </div>
            );
          })}
        </div>
        <SideVesting/>
      </aside>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    account: state.app.account,
    availableBalances: state.dashboardPage.availableBalances,
    headerMessages: state.commonMessage.get('headerMessages'),
  };
};

const mapDispatchToProps = (dispatch) => bindActionCreators(
  {
    fetchCurrentBalance: DashboardPageActions.fetchCurrentBalance,
    navigateToDepositWithDraw: NavigateActions.navigateToDepositWithDraw,
    logout: AppActions.logout
  },
  dispatch
);

export default connect(mapStateToProps, mapDispatchToProps)(Side);
