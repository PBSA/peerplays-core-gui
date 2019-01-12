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

/**
 * Created by shumer on 9/29/16.
 */

/* Libs */
import React from "react";
import { connect } from 'react-redux';

/* Components */
import {IntlProvider} from "react-intl";

import NotificationSystem from "react-notification-system";

import Header from "components/Header/Header";

import TransactionConfirmModal from "components/Modal/TransactionConfirmModal/TransactionConfirmModal";
import WalletUnlockModal from "components/Modal/WalletUnlockModal";
import ViewMemoModal from "components/Modal/ViewMemoModal";
import ReconnectModal from "components/Modal/ReconnectModal/ReconnectModal";
import CantConnectModal from "components/Modal/CantConnectModal/CantConnectModal";
import HelpModal from "../components/Help/HelpModal";

import intlData from "components/Utility/intlData";

/* Other */
import {routerShape} from "react-router/lib/PropTypes";

@connect((state) => {
    return {
        status: state.app.status,
        dbIsInit: state.app.dbIsInit,
        dbDataIsLoad: state.app.dbDataIsLoad,
        chainIsInit: state.app.chainIsInit,
        syncIsFail: state.app.syncIsFail,
        showHelpPopup: state.helpReducer.showHelpModal
    };

}, {

})
class App extends React.Component {

    static contextTypes = {
        router: routerShape
    }

	render() {

        let content = null;
        let urlsWithYellowBackground = ['/claims/bts', '/about', '/init-error', '/sign-up', '/login', '/forgot-password', '/forgot-password/decrypt', '/forgot-password/change', '/create-account', '/restore-account', '/account/recovery', '/account/recovery/confirm', '/account/recovery/download'];

        document.getElementsByTagName('body')[0].className = '';

        let loc = this.context.router.getCurrentLocation(),
            pathname = loc.pathname;

        if(this.props.syncIsFail) {
            content = (
                <div className="wrapper wrapper-with-footer"></div>
            );
        } else if(!this.props.dbIsInit || !this.props.dbDataIsLoad || !this.props.chainIsInit) {
            content = <div></div>;
        } else if(urlsWithYellowBackground.indexOf(this.props.location.pathname) >= 0) {
            document.getElementsByTagName('body')[0].className = 'loginBg';
            content = <div className="wrapper wrapper-with-footer">{this.props.children}</div>;
        } else {

            content = (
                <div className="wrapper wrapper-with-footer">
                    <Header pathname={pathname} />

                         {this.props.children}
                </div>
            );
        }

        if (this.props.status === 'reconnect') {

            return (
                <div className="out">
                    <ReconnectModal />
                </div>
            );

        }

        return (
            <div className="out">
                {content}
                <NotificationSystem ref="notificationSystem" allowHTML={true} />
                <TransactionConfirmModal />
                <WalletUnlockModal />
                <CantConnectModal />
                <ViewMemoModal />
                <HelpModal />
            </div>
        );
	}
}

@connect(
	(state) => {
		return {
			locale: state.settings.locale
		};
	}
)
export default class AppContainer extends React.Component {

	constructor(props) {
		super(props);
	}

	render() {
		return (
			<IntlProvider
				locale={this.props.locale.replace(/cn/, "zh")}
				formats={intlData.formats}
				initialNow={Date.now()}
			>
				<App {...this.props}/>
			</IntlProvider>
		);
	}
}