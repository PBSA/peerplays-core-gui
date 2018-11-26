/*
 *  Copyright (c) 2015 Cryptonomex, Inc., and contributors.
 *
 *  The MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the "Software"), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */

import React from "react";
import {connect} from "react-redux";
import Logo from "../Forms/Logo";
import LoginForm from "./LoginForm"
import NavigateActions from "actions/NavigateActions";
import LoginActions from "actions/LoginActions";
import LanguageSwitcher from "../Common/LanguageSwitcher";
import Translate from "react-translate-component";

@connect(
    (state) => {
        return {
            status: state.loginPage.status,
            errors: state.loginPage.errors,
            locale: state.settings.locale
        };
    },
    {
        login: LoginActions.login,
        setLoginStatus: LoginActions.setLoginStatus,
        navigateToSignUp: NavigateActions.navigateToSignUp,
        navigateToForgotPassword: NavigateActions.navigateToForgotPassword,
    }
)
class Login extends React.Component {

    handleSubmit(values) {

        let next;

        if (this.props.location.query && this.props.location.query.next) {
            next = this.props.location.query.next;
        }

        this.props.setLoginStatus('loading');

        setTimeout(() => {
            this.props.login(values.accountName, values.password, values.remember_me, next);
        }, 0);

    }


    navigateToSignUp() {
        this.props.navigateToSignUp();
    }

    navigateToForgotPassword(e) {

        this.props.navigateToForgotPassword();
        e.preventDefault();

    }

    render() {
        return (
            <div className="main">
                <div className="yHelper active"></div>
                <section className="content">
                    <div className="box box-inPadding">
                        <div className="dialog dialog-login">
                            <LanguageSwitcher />
                            <Logo />
                            <Translate component="h1" className="h1" content="login.login_form_title" />

                            

                            <div className="form">
                                <LoginForm errors={this.props.errors} btnStatus={this.props.status}
                                           onSubmit={this.handleSubmit.bind(this)}
                                           navigateToForgotPassword={this.navigateToForgotPassword.bind(this)} />
                            </div>
                            <div className="login__footer">
                                <Translate component="div" className="login__footerTitle" content="login.login_form_sign_up_label" />
                                <button className="btn btn-sign btn-fsz-18" onClick={this.navigateToSignUp.bind(this)}>
                                    <Translate className="btnText" content="auth.sign_up_btn" />
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        );
    }

}

export default Login;