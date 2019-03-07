import React from 'react';
import {connect} from 'react-redux';
import counterpart from 'counterpart';
import Translate from 'react-translate-component';
import BalanceList from './BalanceList';
import RecentActivityList from './RecentActivityList';
import {RSettingsActions, DashboardPageActions, NavigateActions} from '../../../actions';
import {bindActionCreators} from 'redux';

class Balances extends React.Component {
  onAfterChangeShow(type, value) {
    this.props.removeAssetToHidden(value);
    this.props.toggleAssetHidden(value, type, false);
  }

  onAfterChangeHide(type, value) {
    this.props.addAssetToHidden(value);
    this.props.toggleAssetHidden(value, type, true);
  }

  toggleShowHiddenAssets() {
    this.props.toggleShowHiddenAssets();
  }

  onNavigateToSend() {
    this.props.navigateToSend();
  }

  onNavigateToSendBySymbol(symbol) {
    this.props.navigateToSend(symbol);
  }

  onNavigateToDeposit(symbol) {
    this.props.navigateToDepositWithDraw(symbol);
  }

  renderBalanceList(list, title, showHideOption, onAfterChangeShow, onAfterChangeHide) {
    return (
      <BalanceList
        list={ list }
        title={ title }
        showHideOption={ showHideOption }
        onAfterChangeHide={ onAfterChangeHide }
        onAfterChangeShow={ onAfterChangeShow }
        onNavigateToDeposit={ this.onNavigateToDeposit.bind(this) }
        onNavigateToSend={ this.onNavigateToSend.bind(this) }
        showHiddenAssets={ this.props.showHiddenAssets }
        unit={ this.props.assetSymbol }
        precision={ this.props.precision }
        decimals={ this.props.decimals }
      />
    );
  }

  render() {
    let {showHiddenAssets, hiddenAssets} = this.props;

    return (
      <section className='content content-aside'>
        <div className='box'>
          <div className='content__head db'>
            <button
              type='button'
              className='btn btn-content__head pull-right'
              onClick={ this.onNavigateToSend.bind(this) }
            >
              <span className='content__headBtnIcon icon-arrow2'/>
              <span className=''>
                <Translate content='dashboard.send'/>
              </span>
            </button>
          </div>

          {this.renderBalanceList(
            this.props.coreTokenList,
            counterpart.translate('dashboard.core_tokens'),
            false,
            this.onAfterChangeShow.bind(this, 'coreToken'),
            this.onAfterChangeHide.bind(this, 'coreToken')
          )}
          {this.renderBalanceList(
            this.props.cryptoTokensList,
            counterpart.translate('dashboard.digital_currencies'),
            false,
            this.onAfterChangeShow.bind(this, 'cryptoTokens'),
            this.onAfterChangeHide.bind(this, 'cryptoTokens')
          )}
          {this.renderBalanceList(
            this.props.otherAssetsList,
            counterpart.translate('dashboard.other_assets'),
            true,
            this.onAfterChangeShow.bind(this, 'otherAssets'),
            this.onAfterChangeHide.bind(this, 'otherAssets')
          )}
          {
            hiddenAssets.size === 0
              ? null
              : <div className='table__btns'>
                {
                  showHiddenAssets
                    ? <button
                      onClick={ this.toggleShowHiddenAssets.bind(this) }
                      className='btn btn-neutral2 btn-table js-toggleAssetsVis'>
                      <Translate content='dashboard.hide_hidden'/>
                    </button>
                    : <button
                      onClick={ this.toggleShowHiddenAssets.bind(this) }
                      className='btn btn-neutral2 btn-table js-toggleAssetsVis'>
                      <Translate content='dashboard.show_hidden'/>
                    </button>
                }
              </div>
          }
          <RecentActivityList/>
          <div className='h100'></div>
        </div>
      </section>
    );
  }
}

const mapStateToProps = (state) => {
  const dashboard = state.dashboardPage;

  return {
    coreTokenList: dashboard.coreToken,
    cryptoTokensList: dashboard.cryptoTokens,
    otherAssetsList: dashboard.otherAssets,
    coreSymbol: dashboard.coreSymbol,
    assetSymbol: dashboard.assetSymbol,
    precision: dashboard.precision,
    decimals: dashboard.decimals,
    showHiddenAssets: dashboard.showHiddenAssets,
    hiddenAssets: state.settings.hiddenAssets,
  };
};

const mapDispatchToProps = (dispatch) => bindActionCreators(
  {
    removeAssetToHidden: RSettingsActions.removeAssetToHidden,
    addAssetToHidden: RSettingsActions.addAssetToHidden,
    toggleAssetHidden: DashboardPageActions.toggleAssetHidden,
    toggleShowHiddenAssets: DashboardPageActions.toggleShowHiddenAssets,
    navigateToSend: NavigateActions.navigateToSend,
    navigateToDepositWithDraw: NavigateActions.navigateToDepositWithDraw,
  },
  dispatch
);

export default connect(mapStateToProps, mapDispatchToProps)(Balances);