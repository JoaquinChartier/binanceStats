"use strict";
let orders = true; //Boolean que almacena el valor del switch
let selectedOrders = 1; //Number que almacena la cantidad del counter de orders
let decimals = 0; //Number que almacena la cantidad del counter de decimals
let stringPair = ''; //String que almacena
let res; //Var global que almacena la respuesta del order book
let price; //Var global que almacena la respuesta del price
let refresh = true;
async function render_all(pair, orders, selectedOrders, decimals, redraw, requery) {
    //Funcion main que renderiza todo la pantalla    
    /*Parametro orders: si esta en true, se ordena segun las ordenes, si esta en false, segun el volumen*/
    /*Parametro redraw sirve para no redibujar al pedo todo el chart. En false si se quiere dibujar por primera vez*/
    /*Parametro requery vuelve a consultar la API de Binance si esta en true */
    if (requery) {
        res = await get_order_book(pair); //Busco el orderbook
        price = await get_coin_price(pair); //Traigo precio actual
    }
    //Biggest order
    let bAskO = biggest_order(res.asks);
    $('#biggestAskOrder').html(`${Number(bAskO[1])} at $${Number(bAskO[0])}`);
    let bBidO = biggest_order(res.bids);
    $('#biggestBidOrder').html(`${Number(bBidO[1])} at $${Number(bBidO[0])}`);
    //Analizo la lista y parseo los datos
    let asks = analyze_list(res.asks, decimals);
    let bids = analyze_list(res.bids, decimals);
    $('#actualPrice').html(`Actual price: $${price}`);
    //Formateo
    let labels = concat_labels(asks, bids);
    let column = (orders == true) ? 2 : 1; //Segun el parametro seteo el valor de la columna
    let acumulated_asks = asks.map(function (a) { return a[column]; });
    let acumulated_bids = bids.map(function (a) { return a[column]; });
    //Most common order
    let cAskO = order_by(asks, 2);
    $('#mostCommonAskOrder').html(`${cAskO[0][2]} times at $${cAskO[0][0]}`);
    let cBidO = order_by(bids, 2);
    $('#mostCommonBidOrder').html(`${cBidO[0][2]} times at $${cBidO[0][0]}`);
    //Dibujo el chart
    draw_chart(labels, acumulated_asks, acumulated_bids, price, pair, redraw);
    //indicar de bear_bull
    bear_bull(price, selectedOrders, bids, asks);
}
window.onload = async function () {
    var _a, _b, _c, _d, _e, _f, _g;
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
    (_c = document.getElementById('toggle__input')) === null || _c === void 0 ? void 0 : _c.addEventListener('change', function () {
        /*CONTROLA EL CAMBIO DEL CHECKBOX DEL TIMER DE REFRESH*/
        let checkbox = this;
        refresh = checkbox.checked;
    });
    (_d = $('#ckbSelectedOrders .minus')) === null || _d === void 0 ? void 0 : _d.on('click', function () {
        /*Resta, selected orders */
        (selectedOrders > 1) ? selectedOrders-- : selectedOrders;
        $('#inputSelectedOrders').val(selectedOrders);
        render_all(stringPair, orders, selectedOrders, decimals, true, false);
        //console.log(selectedOrders);
    });
    (_e = $('#ckbSelectedOrders .plus')) === null || _e === void 0 ? void 0 : _e.on('click', function () {
        /*Suma, selected orders */
        (selectedOrders >= 1) ? selectedOrders++ : selectedOrders;
        $('#inputSelectedOrders').val(selectedOrders);
        render_all(stringPair, orders, selectedOrders, decimals, true, false);
        //console.log(selectedOrders);
    });
    (_f = $('#ckbDecimals .minus')) === null || _f === void 0 ? void 0 : _f.on('click', function () {
        /*Resta, decimals */
        (decimals > 0) ? decimals-- : decimals;
        $('#inputDecimals').val(decimals);
        render_all(stringPair, orders, selectedOrders, decimals, true, false);
        //console.log(decimals);
    });
    (_g = $('#ckbDecimals .plus')) === null || _g === void 0 ? void 0 : _g.on('click', function () {
        /*Suma, decimals */
        (decimals >= 0) ? decimals++ : decimals;
        $('#inputDecimals').val(decimals);
        render_all(stringPair, orders, selectedOrders, decimals, true, false);
        //console.log(decimals);
    });
    /*TIMER PARA REFRESCAR CADA 15 SEG */
    let timer = setInterval(refresh_event, 15000);
    function refresh_event() {
        if (refresh) {
            render_all(stringPair, orders, selectedOrders, decimals, true, true);
        }
    }
};
