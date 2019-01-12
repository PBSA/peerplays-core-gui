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

import counterpart from 'counterpart';
import {ChainStore, ChainTypes} from "peerplaysjs-lib";
import market_utils from "common/market_utils";
import asset_utils from "common/asset_utils";
import utils from 'common/utils';

let {operations} = ChainTypes;


let ops = Object.keys(operations);

function convertAmount({amount, asset_id}) {
    let asset = ChainStore.getAsset(asset_id);
	if(!asset) return null;
    let number = amount / Math.pow(10, asset.get('precision'));
    return asset ? {amount: utils.round_number(number, asset), asset: asset.toJS()} : null;
}
/**
 * Dashboard, Recent Activity:  format the operations
 * @param obj
 * @returns {*}
 */
export function formatOperation(obj) {
    let sender, receiver, amount, price, base, quote;

    let op = obj.op;

    switch(op[0]) {
        case 0:
            sender = ChainStore.getAccount(op[1].from);
            receiver = ChainStore.getAccount(op[1].to);
            let amountValue = op[1].amount.amount;
            let asset = ChainStore.getAsset(op[1].amount.asset_id);
            let memo = op[1].memo ? op[1].memo : null;

            amount = asset ? `${amountValue / Math.pow(10, asset.get('precision'))} ${asset_utils.getSymbol(asset.get('symbol'))}` : null;
            return {
                operation: ops[op[0]],
                type: counterpart.translate('transaction.trxTypes.transfer'),
                sender: sender ? sender.get('name') : '',
                receiver: receiver ? receiver.get('name') : '',
                description: sender && receiver ?
                    counterpart.translate('activity.transfer', {from: sender.get('name'), to: receiver.get('name'), amount}) : '',
                memo,
            };

        case 1:
            let isAsk = market_utils.isAskOp(op[1]);

            base = isAsk ? convertAmount(op[1].min_to_receive) : convertAmount(op[1].amount_to_sell);
            quote =  isAsk ? convertAmount(op[1].amount_to_sell) : convertAmount(op[1].min_to_receive);
            let number = base && quote ? Math.round(quote.amount / base.amount * Math.pow(10, quote.asset.precision)) / Math.pow(10, quote.asset.precision) : null;
            price =  base && quote ? `${number} ${asset_utils.getSymbol(quote.asset.symbol)}/${asset_utils.getSymbol(base.asset.symbol)}` : null

            let total = quote ? `${quote.amount} ${asset_utils.getSymbol(quote.asset.symbol)}` : null;
            amount = base ? `${base.amount} ${asset_utils.getSymbol(base.asset.symbol)}` : null;
            sender = ChainStore.getAccount(op[1].seller);

            return {
                operation: ops[op[0]],
                type: counterpart.translate('transaction.trxTypes.limit_order_create'),
                sender: sender ? sender.get('name') : null,
                receiver: null,
                description: counterpart.translate(
                    isAsk ? "activity.limit_order_buy" : "activity.limit_order_sell",
                    {account: sender ? sender.get('name') : null, amount, price}
                )
            };

        case 2:
            sender = ChainStore.getAccount(op[1].fee_paying_account);
            return {
                operation: ops[op[0]],
                type: counterpart.translate('transaction.trxTypes.limit_order_cancel'),
                sender: sender ? sender.get('name') : null,
                receiver: null,
                description: counterpart.translate('activity.limit_order_cancel', {account: sender ? sender.get('name') : null, order: op[1].order.substring(4)})
            };
        case 3:
            sender = ChainStore.getAccount(op[1].funding_account);
            let debt = convertAmount(op[1].delta_debt);
            let collateral = convertAmount(op[1].delta_collateral);

            return {
                operation: ops[op[0]],
                type: counterpart.translate('transaction.trxTypes.call_order_update'),
                sender: sender ? sender.get('name') : null,
                receiver: null,
                description: counterpart.translate(
                    'activity.call_order_update',
                    {
                        account: sender ? sender.get('name') : null,
                        debtSymbol: debt ? debt.asset.symbol : null,
                        debt: debt ? debt.amount : null,
                        collateral: collateral ? collateral.amount : null
                    }
                )
            };
        case 4:
            sender = ChainStore.getAccount(op[1].account_id);
            amount = convertAmount({amount: op[1].fee.asset_id === op[1].receives.asset_id ? op[1].receives.amount - op[1].fee.amount : op[1].receives.amount, asset_id:op[1].receives.asset_id});
            base = convertAmount(op[1].pays);
            quote = convertAmount(op[1].receives);
            price = base && quote ? Math.round(quote.amount / base.amount * Math.pow(10, quote.asset.precision)) / Math.pow(10, quote.asset.precision) : null;
            return {
                operation: ops[op[0]],
                type: counterpart.translate('transaction.trxTypes.fill_order'),
                sender: sender ? sender.get('name') : null,
                receiver: null,
                description: counterpart.translate(
                    "activity.fill_order",
                    {
                        account: sender ? sender.get('name') : null,
                        received: amount ? `${amount.amount} ${asset_utils.getSymbol(amount.asset.symbol)}` : null,
                        price: base && quote ? `${price} ${asset_utils.getSymbol(quote.asset.symbol)}/${asset_utils.getSymbol(base.asset.symbol)}` : null
                    }
                )
            };
        case 5:
            sender = ChainStore.getAccount(op[1].registrar);

            return {
                operation: ops[op[0]],
                type: counterpart.translate('transaction.trxTypes.account_create'),
                sender: sender ? sender.get('name') : '',
                receiver: op[1].name,
                description: sender ?
                    counterpart.translate('activity.reg_account', {registrar: sender.get('name'), new_account: op[1].name}) : ''

            };
        case 6:
            sender = ChainStore.getAccount(op[1].account);

            return {
                operation: ops[op[0]],
                type: counterpart.translate('transaction.trxTypes.account_update'),
                sender: sender ? sender.get('name') : null,
                receiver: null,
                description: sender ?
                    counterpart.translate('activity.update_account', {account: sender.get('name')}) : ''
            };
        case 7:
            return {
                operation: ops[op[0]],
                type: null,
                sender: null,
                receiver: null,
                description: null
            };
        case 8:

            sender = ChainStore.getAccount(op[1].account_to_upgrade);

            return {
                operation: ops[op[0]],
                type: counterpart.translate('transaction.trxTypes.account_upgrade'),
                sender: sender ? sender.get('name') : '',
                receiver: null,
                description: op[1] && op[1]['upgrade_to_lifetime_member'] ? sender.get('name') + ' ' + counterpart.translate('account.member.lifetime') : null
            };
        case 9:
            return {
                operation: ops[op[0]],
                type: null,
                sender: null,
                receiver: null,
                description: null
            };
        case 10:
            return {
                operation: ops[op[0]],
                type: null,
                sender: null,
                receiver: null,
                description: null
            };
        case 11:
            return {
                operation: ops[op[0]],
                type: null,
                sender: null,
                receiver: null,
                description: null
            };
        case 12:
            return {
                operation: ops[op[0]],
                type: null,
                sender: null,
                receiver: null,
                description: null
            };
        case 13:
            return {
                operation: ops[op[0]],
                type: null,
                sender: null,
                receiver: null,
                description: null
            };
        case 14:
            sender = ChainStore.getAccount(op[1].issuer);
            receiver = ChainStore.getAccount(op[1].issue_to_account);
            amount = convertAmount(op[1].asset_to_issue);

            return {
                operation: ops[op[0]],
                type: counterpart.translate('transaction.trxTypes.asset_issue'),
                sender: sender ? sender.get('name') : null,
                receiver: receiver ? receiver.get('name') : null,
                description: sender && receiver && amount ? counterpart.translate('activity.asset_issue', {account: sender.get('name'), amount: `${amount.amount} ${amount.asset.symbol}`, to: receiver.get('name')}) : ''
            } ;
        case 15:
            return {
                operation: ops[op[0]],
                type: null,
                sender: null,
                receiver: null,
                description: null
            };
        case 16:
            return {
                operation: ops[op[0]],
                type: null,
                sender: null,
                receiver: null,
                description: null
            };
        case 17:
            return {
                operation: ops[op[0]],
                type: null,
                sender: null,
                receiver: null,
                description: null
            };
        case 18:
            return {
                operation: ops[op[0]],
                type: null,
                sender: null,
                receiver: null,
                description: null
            };
        case 19:
            return {
                operation: ops[op[0]],
                type: null,
                sender: null,
                receiver: null,
                description: null
            };
        case 20:
            sender = ChainStore.getAccount(op[1].witness_account).get('name');
            return {
                operation: ops[op[0]],
                type: counterpart.translate('transaction.trxTypes.witness_create'),
                sender,
                receiver: null,
                description: sender + ' ' + counterpart.translate('account.witness.create')
            };
        case 21:
            sender = ChainStore.getAccount(op[1].witness_account).get('name');
            return {
                operation: ops[op[0]],
                type: counterpart.translate('transaction.trxTypes.witness_update'),
                sender,
                receiver: null,
                description: sender + ' ' + counterpart.translate('account.witness.update')
            };
        case 22:
            sender = ChainStore.getAccount(op[1].fee_paying_account);

            return {
                operation: ops[op[0]],
                type: counterpart.translate('transaction.trxTypes.proposal_create'),
                sender: sender ? sender.get('name') : null,
                receiver: null,
                description: sender ? counterpart.translate('activity.proposal_create', {account: sender.get('name')}) : ''

            };
        case 23:
            return {
                operation: ops[op[0]],
                type: null,
                sender: null,
                receiver: null,
                description: null
            };
        case 24:
            return {
                operation: ops[op[0]],
                type: null,
                sender: null,
                receiver: null,
                description: null
            };
        case 25:
            return {
                operation: ops[op[0]],
                type: null,
                sender: null,
                receiver: null,
                description: null
            };
        case 26:
            return {
                operation: ops[op[0]],
                type: null,
                sender: null,
                receiver: null,
                description: null
            };
        case 27:
            return {
                operation: ops[op[0]],
                type: null,
                sender: null,
                receiver: null,
                description: null
            };
        case 28:
            return {
                operation: ops[op[0]],
                type: null,
                sender: null,
                receiver: null,
                description: null
            };
        case 29:
            return {
                operation: ops[op[0]],
                type: null,
                sender: null,
                receiver: null,
                description: null
            };
        case 30:
            return {
                operation: ops[op[0]],
                type: null,
                sender: null,
                receiver: null,
                description: null
            } ;
        case 31:
            return {
                operation: ops[op[0]],
                type: null,
                sender: null,
                receiver: null,
                description: null
            };
        case 32:
            return {
                operation: ops[op[0]],
                type: null,
                sender: null,
                receiver: null,
                description: null
            };
        case 33:

            sender = ChainStore.getAccount(op[1].owner);
            amount = convertAmount(op[1].amount);

            return {
                operation: ops[op[0]],
                type: counterpart.translate('transaction.trxTypes.vesting_balance_withdraw'),
                sender: sender ? sender.get('name') : null,
                receiver: sender ? sender.get('name') : null,
                description: sender && amount ? counterpart.translate('activity.vesting_balance_withdraw', {account: sender.get('name'), amount: `${amount.amount} ${amount.asset.symbol}`}) : ''
            };
        case 34:
            return {
                operation: ops[op[0]],
                type: null,
                sender: null,
                receiver: null,
                description: null
            };
        case 35:
            return {
                operation: ops[op[0]],
                type: null,
                sender: null,
                receiver: null,
                description: null
            };
        case 36:
            return {
                operation: ops[op[0]],
                type: null,
                sender: null,
                receiver: null,
                description: null
            };
        case 37:

            amount = convertAmount(op[1].total_claimed);
            sender = ChainStore.getAccount(op[1].deposit_to_account);

            return {
                operation: ops[op[0]],
                type: counterpart.translate('transaction.trxTypes.balance_claim'),
                sender: '—',
                receiver: sender ? sender.get('name') : '—',
                description:  amount && sender ? counterpart.translate('activity.balance_claim', {account: sender.get('name'), amount: `${amount.amount} ${asset_utils.getSymbol(amount.asset.symbol)}`}) : ''
            };
        case 38:
            return {
                operation: ops[op[0]],
                type: null,
                sender: null,
                receiver: null,
                description: null
            };
        case 39:
            return {
                operation: ops[op[0]],
                type: null,
                sender: null,
                receiver: null,
                description: null
            };
        case 40:
            return {
                operation: ops[op[0]],
                type: null,
                sender: null,
                receiver: null,
                description: null
            };
        case 41:
            return {
                operation: ops[op[0]],
                type: null,
                sender: null,
                receiver: null,
                description: null
            };
        case 42:
            return {
                operation: ops[op[0]],
                type: null,
                sender: null,
                receiver: null,
                description: null
            };
        case 43:
            return {
                operation: ops[op[0]],
                type: null,
                sender: null,
                receiver: null,
                description: null
            };
        case 44:
            return {
                operation: ops[op[0]],
                type: null,
                sender: null,
                receiver: null,
                description: null
            };
        case 45:
            sender = ChainStore.getAccount(op[1].creator);

            amount = convertAmount(op[1].options.buy_in);

            return {
                operation: ops[op[0]],
                type: counterpart.translate('transaction.trxTypes.tournament_create'),
                sender: sender ? sender.get('name') : null,
                receiver: '—',
                description: sender ? counterpart.translate('activity.tournament_create', {account: sender ? sender.get('name') : '', amount:  amount ? `${amount.amount} ${asset_utils.getSymbol(amount.asset.symbol)}` : ''}) : ''
            };

            return {
                operation: ops[op[0]],
                type: null,
                sender: null,
                receiver: null,
                description: null
            };
        case 46:
            sender = ChainStore.getAccount(op[1].player_account_id);

            return {
                operation: ops[op[0]],
                type: counterpart.translate('transaction.trxTypes.tournament_join'),
                sender: sender ? sender.get('name') : null,
                receiver: '—',
                description: sender ? counterpart.translate('activity.tournament_join', {account: sender ? sender.get('name') : '', tournament_id: op[1].tournament_id}) : ''
            };
        case 47:
            sender = ChainStore.getAccount(op[1].player_account_id);

            let description;

            if (op[1] && op[1]['move'] && op[1]['move'][1]['gesture']) {
                description = sender ? counterpart.translate('activity.game_move_commit', {gesture: op[1]['move'][1]['gesture'], account: sender ? sender.get('name') : '', game_id: op[1].game_id}) : '';
            } else {
                description = sender ? counterpart.translate('activity.game_move', {account: sender ? sender.get('name') : '', game_id: op[1].game_id}) : '';
            }

            return {
                operation: ops[op[0]],
                type: counterpart.translate('transaction.trxTypes.game_move'),
                sender: sender ? sender.get('name') : null,
                receiver: '—',
                description: description
            };
        case 48:
            return {
                operation: ops[op[0]],
                type: null,
                sender: null,
                receiver: null,
                description: null
            };
        case 49:
            sender = ChainStore.getAccount(op[1].account_id);
            return {
                operation: ops[op[0]],
                type: counterpart.translate('transaction.trxTypes.asset_dividend_distribution'),
                sender: '—',
                receiver: sender ? sender.get('name') : null,
                description: sender ? counterpart.translate('activity.asset_dividend_distribution', {account: sender ? sender.get('name') : ''}) : ''
            };
        case 50:
            // payout_amount
            receiver = ChainStore.getAccount(op[1].payout_account_id);
            amount = convertAmount(op[1].payout_amount);

            return {
                operation: 'tournament_payout_operation',
                type: counterpart.translate('transaction.trxTypes.tournament_payout_operation'),
                sender: '—',
                receiver: receiver ? receiver.get('name') : null,
                description: counterpart.translate('activity.tournament_payout_operation', {tournament_id: op[1].tournament_id, amount: amount ? `${amount.amount} ${asset_utils.getSymbol(amount.asset.symbol)}` : ''})
            };
        default:

            return {
                operation: op[0],
                type: op[0],
                sender: null,
                receiver: null,
                description: null
            };
    }
}
