let orders:boolean = true;
let selectedOrders:number = 1;
let decimals:number = 0;
let stringPair:string = '';
let res:any;
let price:any;

async function render_all(pair:string, orders:boolean, selectedOrders:number, decimals:number, redraw:boolean, requery:boolean){
    //Funcion main que renderiza todo la pantalla    

    /*Parametro orders: si esta en true, se ordena segun las ordenes, si esta en false, segun el volumen*/
    /*Parametro redraw sirve para no redibujar al pedo todo el chart. En false si se quiere dibujar por primera vez*/
    /*Parametro requery vuelve a consultar la API de Binance si esta en true */

    if (requery){
        res = await get_order_book(pair); //Busco el orderbook
        price = await get_coin_price(pair); //Traigo precio actual
    }
    
    let asks = analyze_list(res.asks, decimals); //Analizo la lista y parseo los datos
    let bids = analyze_list(res.bids, decimals);
    $('#actualPrice').html(`Actual price: $${price}`); //Asigno el precio
    //Formateo y dibujo el chart
    let labels = concat_labels(asks, bids);
    let column:number = (orders == true) ? 2 : 1; //Segun el parametro seteo el valor de la columna
    let acumulated_asks = asks.map(function(a) {return a[column];});
    let acumulated_bids = bids.map(function(a) {return a[column];});

    draw_chart(labels, acumulated_asks, acumulated_bids, price, pair, redraw);
    //indicar de bear_bull
    bear_bull(price, selectedOrders, bids, asks);
}

window.onload = async function() {
    get_and_draw_pairs('ETHDAI'); //Traigo y dibujo los pares
    render_all('ETHDAI',true,1,0,false,true);

    document.getElementById('selectPair')?.addEventListener('change', function() {
        /*CONTROLA EL CAMBIO DEL SELECTOR DE PAR*/
        let selectedPair:any = this;
        console.log('You selected: ', selectedPair.value);
        stringPair = selectedPair.value;
        render_all(selectedPair.value,orders,selectedOrders,decimals,true,true);
    });

    document.getElementById('ckbOrders')?.addEventListener('change', function() {
        /*CONTROLA EL CAMBIO DEL CHECKBOX DE ORDERS Y VOLUME*/
        let checkbox:any = this;
        //console.log('Changed', checkbox.checked);
        orders = checkbox.checked;
        //console.log('orders', orders);
        $('#lblOrders').html((orders) ? 'Orders' : 'Volume');
        render_all(stringPair,orders,selectedOrders,decimals,true,false);
    });

    $('#ckbSelectedOrders .minus')?.on('click',function() {
        /*Resta, selected orders */
        (selectedOrders > 1) ? selectedOrders-- : selectedOrders;
        $('#inputSelectedOrders').val(selectedOrders);
        render_all(stringPair,orders,selectedOrders,decimals,true,false);
        //console.log(selectedOrders);
    });

    $('#ckbSelectedOrders .plus')?.on('click',function() {
        /*Suma, selected orders */
        (selectedOrders >= 1) ? selectedOrders++ : selectedOrders;
        $('#inputSelectedOrders').val(selectedOrders);
        render_all(stringPair,orders,selectedOrders,decimals,true,false);
        //console.log(selectedOrders);
    });

    $('#ckbDecimals .minus')?.on('click',function() {
        /*Resta, decimals */
        (decimals > 0) ? decimals-- : decimals;
        $('#inputDecimals').val(decimals);
        render_all(stringPair,orders,selectedOrders,decimals,true,false);
        //console.log(decimals);
    });

    $('#ckbDecimals .plus')?.on('click',function() {
        /*Suma, decimals */
        (decimals >= 0) ? decimals++ : decimals;
        $('#inputDecimals').val(decimals);
        render_all(stringPair,orders,selectedOrders,decimals,true,false);
        //console.log(decimals);
    });
}