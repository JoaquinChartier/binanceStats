"use strict";
let orders = true;
let selectedOrders = 1;
let decimals = 0;
let stringPair = '';
let res;
let price;
async function render_all(pair, orders, selectedOrders, decimals, redraw, requery) {
    //Funcion main que renderiza todo la pantalla    
    /*Parametro orders: si esta en true, se ordena segun las ordenes, si esta en false, segun el volumen*/
    /*Parametro redraw sirve para no redibujar al pedo todo el chart. En false si se quiere dibujar por primera vez*/
    /*Parametro requery vuelve a consultar la API de Binance si esta en true */
    if (requery) {
        res = await get_order_book(pair); //Busco el orderbook
        price = await get_coin_price(pair); //Traigo precio actual
    }
    let asks = analyze_list(res.asks, decimals); //Analizo la lista y parseo los datos
    let bids = analyze_list(res.bids, decimals);
    $('#actualPrice').html(`Actual price: $${price}`); //Asigno el precio
    //Formateo y dibujo el chart
    let labels = concat_labels(asks, bids);
    let column = (orders == true) ? 2 : 1; //Segun el parametro seteo el valor de la columna
    let acumulated_asks = asks.map(function (a) { return a[column]; });
    let acumulated_bids = bids.map(function (a) { return a[column]; });
    draw_chart(labels, acumulated_asks, acumulated_bids, price, pair, redraw);
    //indicar de bear_bull
    bear_bull(price, selectedOrders, bids, asks);
}
window.onload = async function () {
    var _a, _b, _c, _d, _e, _f;
    get_and_draw_pairs('ETHDAI'); //Traigo y dibujo los pares
    render_all('ETHDAI', true, 1, 0, false, true);
    (_a = document.getElementById('selectPair')) === null || _a === void 0 ? void 0 : _a.addEventListener('change', function () {
        /*CONTROLA EL CAMBIO DEL SELECTOR DE PAR*/
        let selectedPair = this;
        console.log('You selected: ', selectedPair.value);
        stringPair = selectedPair.value;
        render_all(selectedPair.value, orders, selectedOrders, decimals, true, true);
    });
    (_b = document.getElementById('ckbOrders')) === null || _b === void 0 ? void 0 : _b.addEventListener('change', function () {
        /*CONTROLA EL CAMBIO DEL CHECKBOX DE ORDERS Y VOLUME*/
        let checkbox = this;
        //console.log('Changed', checkbox.checked);
        orders = checkbox.checked;
        //console.log('orders', orders);
        $('#lblOrders').html((orders) ? 'Orders' : 'Volume');
        render_all(stringPair, orders, selectedOrders, decimals, true, false);
    });
    (_c = $('#ckbSelectedOrders .minus')) === null || _c === void 0 ? void 0 : _c.on('click', function () {
        /*Resta, selected orders */
        (selectedOrders > 1) ? selectedOrders-- : selectedOrders;
        $('#inputSelectedOrders').val(selectedOrders);
        render_all(stringPair, orders, selectedOrders, decimals, true, false);
        //console.log(selectedOrders);
    });
    (_d = $('#ckbSelectedOrders .plus')) === null || _d === void 0 ? void 0 : _d.on('click', function () {
        /*Suma, selected orders */
        (selectedOrders >= 1) ? selectedOrders++ : selectedOrders;
        $('#inputSelectedOrders').val(selectedOrders);
        render_all(stringPair, orders, selectedOrders, decimals, true, false);
        //console.log(selectedOrders);
    });
    (_e = $('#ckbDecimals .minus')) === null || _e === void 0 ? void 0 : _e.on('click', function () {
        /*Resta, decimals */
        (decimals > 0) ? decimals-- : decimals;
        $('#inputDecimals').val(decimals);
        render_all(stringPair, orders, selectedOrders, decimals, true, false);
        //console.log(decimals);
    });
    (_f = $('#ckbDecimals .plus')) === null || _f === void 0 ? void 0 : _f.on('click', function () {
        /*Suma, decimals */
        (decimals >= 0) ? decimals++ : decimals;
        $('#inputDecimals').val(decimals);
        render_all(stringPair, orders, selectedOrders, decimals, true, false);
        //console.log(decimals);
    });
};
