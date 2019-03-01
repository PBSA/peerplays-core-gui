import React from 'react';
import {connect} from 'react-redux';
import counterpart from 'counterpart';
import Logo from 'components/Forms/Logo';
import {NavigateActions, ClaimBtsActions} from '../../actions';
import ClaimBtsForm from './ClaimBtsForm';
import Translate from 'react-translate-component';
import {bindActionCreators} from 'redux';

class ClaimBtsContainer extends React.Component {
  navigateToSignUp() {
    this.props.navigateToSignUp();
  }

  handleSubmit(values) {
    this.props.setStatus('loading');

    setTimeout(() => {
      this.props.loginAccountFromBts(values.private_bts_key);
    }, 0);
  }

  onClickLogin(e) {
    this.props.navigateToSignIn(null, false);
    e.preventDefault();
  }

  render() {
    let {status, errors} = this.props;
    let content = null;

    switch (status) {
      case 'connect':
        content = (
          <div className='dialog dialog-login dialog-loading'>
            <Logo />
            <div className='loader-splash'>
              <span className='loader loader-s' />
            </div>
          </div>
        );
        break;
      default:
        content = (
          <div className='dialog dialog-login'>
            <Logo />

            <h1 className='h1'>
              {counterpart.translate('login_bts.login_form_title')}
              <span className='tm'>TM</span>
            </h1>

            <div className='section__text'>
              <Translate component='div' className='section__textTitle' content='login_bts.title' />
              <div className='section__textItem'>
                <Translate
                  component='div'
                  className='section__textItemHead'
                  content='login_bts.note_title_1'
                />
                <div className='section__textItemBody'>
                  <Translate component='div' className='' content='login_bts.note_1' />
                </div>
              </div>

              <div className='section__textItem'>
                <Translate
                  component='div'
                  className='section__textItemHead'
                  content='login_bts.note_title_2'
                />
                <div className='section__textItemBody'>
                  <Translate component='div' className='' content='login_bts.note_2' />
                </div>
              </div>

              <div className='section__textItem'>
                <Translate
                  component='div'
                  className='section__textItemHead'
                  content='login_bts.note_title_3'
                />
                <div className='section__textItemBody'>
                  <Translate component='div' className='' content='login_bts.note_3' />
                </div>
              </div>
            </div>

            <div className='form'>
              <ClaimBtsForm
                errors={ errors }
                btnStatus={ status }
                onSubmit={ this.handleSubmit.bind(this) }
              />
            </div>

            <div className='login__footer'>
              <div className='login__footerTitle'>
                {counterpart.translate('login_bts.login_form_sign_up_label')}
              </div>

              <button
                className='btn btn-sign btn-fsz-18 '
                onClick={ this.navigateToSignUp.bind(this) }
              >
                <span className='btnText'>{counterpart.translate('auth.sign_up_btn')}</span>
              </button>
              <div className='loginCreate__note4'>
                <Translate
                  component='span'
                  content='sign_up.already_have_account'
                />
                <b>
                  <a
                    href='#login'
                    onClick={ this.onClickLogin.bind(this) }
                    className='mark2'
                  >
                    <Translate component='span' content='sign_up.login_link' />
                  </a>
                </b>
              </div>
            </div>
          </div>
        );
    }

    return (
      <div className='main'>
        <div className='yHelper active' />
        <section className='content'>
          <div className='box box-inPadding'>{content}</div>
        </section>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    status: state.claimBtsReducer.status,
    errors: state.claimBtsReducer.errors,
  };
};

const mapDispatchToProps = (dispatch) => bindActionCreators(
  {
    navigateToSignUp: NavigateActions.navigateToSignUp,
    navigateToSignIn : NavigateActions.navigateToSignIn,
    setStatus: ClaimBtsActions.setStatus,
    loginAccountFromBts: ClaimBtsActions.loginAccountFromBts,
  },
  dispatch
);

export default connect(mapStateToProps, mapDispatchToProps)(ClaimBtsContainer);
