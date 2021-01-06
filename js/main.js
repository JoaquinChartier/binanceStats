"use strict";
let orders = true;
let selectedOrders = 1;
let decimals = 0;
let stringPair = '';
let res;
let price;
let refresh = true;
async function render_all(pair, orders, selectedOrders, decimals, redraw, requery) {
    if (requery) {
        res = await get_order_book(pair);
        price = await get_coin_price(pair);
    }
    let bAskO = biggest_order(res.asks);
    $('#biggestAskOrder').html(`${Number(bAskO[1])} at $${Number(bAskO[0])}`);
    let bBidO = biggest_order(res.bids);
    $('#biggestBidOrder').html(`${Number(bBidO[1])} at $${Number(bBidO[0])}`);
    let asks = analyze_list(res.asks, decimals);
    let bids = analyze_list(res.bids, decimals);
    $('#actualPrice').html(`Actual price: $${price}`);
    let labels = concat_labels(asks, bids);
    let column = (orders == true) ? 2 : 1;
    let acumulated_asks = asks.map(function (a) { return a[column]; });
    let acumulated_bids = bids.map(function (a) { return a[column]; });
    let cAskO = order_by(asks, 2);
    $('#mostCommonAskOrder').html(`${cAskO[0][2]} times at $${cAskO[0][0]}`);
    let cBidO = order_by(bids, 2);
    $('#mostCommonBidOrder').html(`${cBidO[0][2]} times at $${cBidO[0][0]}`);
    draw_chart(labels, acumulated_asks, acumulated_bids, price, pair, redraw);
    bear_bull(price, selectedOrders, bids, asks);
}
window.onload = async function () {
    var _a, _b, _c, _d, _e, _f, _g;
    get_and_draw_pairs('ETHDAI');
    render_all('ETHDAI', true, 1, 0, false, true);
    (_a = document.getElementById('selectPair')) === null || _a === void 0 ? void 0 : _a.addEventListener('change', function () {
        let selectedPair = this;
        stringPair = selectedPair.value;
        render_all(selectedPair.value, orders, selectedOrders, decimals, true, true);
    });
    (_b = document.getElementById('ckbOrders')) === null || _b === void 0 ? void 0 : _b.addEventListener('change', function () {
        let checkbox = this;
        orders = checkbox.checked;
        $('#lblOrders').html((orders) ? 'Orders' : 'Volume');
        render_all(stringPair, orders, selectedOrders, decimals, true, false);
    });
    (_c = document.getElementById('toggle__input')) === null || _c === void 0 ? void 0 : _c.addEventListener('change', function () {
        let checkbox = this;
        refresh = checkbox.checked;
    });
    (_d = $('#ckbSelectedOrders .minus')) === null || _d === void 0 ? void 0 : _d.on('click', function () {
        (selectedOrders > 1) ? selectedOrders-- : selectedOrders;
        $('#inputSelectedOrders').val(selectedOrders);
        render_all(stringPair, orders, selectedOrders, decimals, true, false);
    });
    (_e = $('#ckbSelectedOrders .plus')) === null || _e === void 0 ? void 0 : _e.on('click', function () {
        (selectedOrders >= 1) ? selectedOrders++ : selectedOrders;
        $('#inputSelectedOrders').val(selectedOrders);
        render_all(stringPair, orders, selectedOrders, decimals, true, false);
    });
    (_f = $('#ckbDecimals .minus')) === null || _f === void 0 ? void 0 : _f.on('click', function () {
        (decimals > 0) ? decimals-- : decimals;
        $('#inputDecimals').val(decimals);
        render_all(stringPair, orders, selectedOrders, decimals, true, false);
    });
    (_g = $('#ckbDecimals .plus')) === null || _g === void 0 ? void 0 : _g.on('click', function () {
        (decimals >= 0) ? decimals++ : decimals;
        $('#inputDecimals').val(decimals);
        render_all(stringPair, orders, selectedOrders, decimals, true, false);
    });
    let timer = setInterval(refresh_event, 15000);
    function refresh_event() {
        if (refresh) {
            render_all(stringPair, orders, selectedOrders, decimals, true, true);
        }
    }
};
