let chart:any = {};
//let biggestOrder:any;

const truncate = (number:number, digits:number) : number => {
    //Truncate function: trunca "number" segun la cantidad de "digits"
    if (digits >= 0) {
        let stepper:number = 10.0 ** digits;
        return Math.trunc(stepper * number) / stepper;
    } else {
        return Math.trunc(number);
    }
}

const basic_request = (fullURL:string) : Promise<any> => {
    //Basic request
    //console.log(fullURL);
    return new Promise((resolve, reject) => {
        let settings = {
            "url": fullURL,
            "method": "GET",
            "timeout": 0,
            "mode":'no-cors',
            "crossorigin": true,
            "headers": { "Content-Type": "multipart/form-data"},
            "beforeSend": function(xhr:any){ xhr.withCredentials = true;}
          };
          $.ajax(settings)
          .done(data => resolve(data))
          .catch(err => reject(err));
    });
}

const get_order_book = (symb1:string) : Promise<any> => {
    return new Promise((resolve, reject) => {
        symb1 = symb1.toUpperCase();
        //Devuelve el order book
        let url = 'https://api.binance.com/api/v3/depth?symbol='+symb1+'&limit=500';
        //console.log(url)
        basic_request(url)
        .then(data => {
            //console.log(data);
            //console.log(`asks count: ${data.asks.length}, bids count: ${data.bids.length}`);
            resolve(data);
        })
        .catch(err => reject(err))
    });
}

const get_coin_price = (symb1:string) : Promise<any> => {
    //Busco el precio actual.
    return new Promise((resolve, reject) => {
        symb1 = symb1.toUpperCase();
        //Devuelve el order book
        let url = 'https://api.binance.com/api/v3/ticker/price?symbol='+symb1;
        //console.log(url)
        basic_request(url)
        .then(data => {
            //data = JSON.parse(data);
            //return res;
            //console.log(typeof(data))
            //console.log(data);
            resolve(Number(data.price)) //console.log(data);
        })
        .catch(err => reject(err))
    });
}

const analyze_list = (list:any[], decimals:number) : any[] => {
    //console.log('initial lenght: '+list.length)
    let output:any[] = [] //salida
    let exist:boolean = false //booleano de control

    for (let i:any = 0; i < list.length; i++) {
        const element:string = list[i];
        if (list.length > 0) { //ya tiene registros, puedo iterar
            for (let e:any = 0; e < output.length; e++) { //price,quantity acumulated,orders
                const sub_element:any[] = output[e];
                exist = false
                let item = truncate(Number(element[0]),decimals);
                if (item == sub_element[0]) { //Ya existe, actualizo
                    sub_element[1] += Number(element[1]);
                    sub_element[2] += 1;
                    exist = true;
                    break
                }
            }

            if (exist == false){ //No hay registros, debo insertar
                output.push([truncate(Number(element[0]),decimals),Number(element[1]),1])
            }
        } else {
            //Primer insercion
            output.push([truncate(Number(element[0]),decimals),Number(element[1]),1])
        }
    }
    return output
}

const print_all = (list:any[]) => {
    //Itero e imprimo todos los resultados
    for (let index = 0; index < list.length; index++) {
        const element = list[index];
        //console.log(`Price: ${element[0]}, quantity: ${element[1]}, unique orders: ${element[2]}`)
    }
}

const order_by = (list:any[], o:number) : any[] => {
    list.sort((a, b) => (a[o]> b[o]) ? 1 : -1)
    list.reverse();
    return list
}

const concat_labels = (asks:any[], bids:any[]) : any[] => {
    //Une los dos datasets, en el atributo del precio
    let labels = asks.map(function(a) {return a[0];});
    labels.concat(bids.map(function(a) {return a[0];}))
    //console.log(labels)
    return labels
}

const draw_chart = (labels:any[], acumulated_asks:any[], acumulated_bids:any[], price:number, pair:string, redraw:boolean=false) => {
    let title:string = `Actual price ${pair}: $${price}`;

    if (redraw){
        //Si el modo es redraw (redibujar), agarro la variable global y manipulo el chart ya hecho
        chart.options.title.text = title;
        chart.data.labels = labels;
        chart.data.datasets[0].data = acumulated_asks;
        chart.data.datasets[1].data = acumulated_bids;
        chart.update();
    }
    else{
        //Si esta en falso quiere decir que debo dibujar la primera vez
        let aux:any = document.getElementById('myChart');
        let ctx:any = aux?.getContext('2d');

        chart = new Chart(ctx, {
            // tipo de grafico
            type: 'line',
            //la data
            data: {
                labels: labels, //eje y
                datasets: 
                [{
                    label: 'asks',
                    //backgroundColor: 'rgb(255, 99, 132)',
                    borderColor: 'rgb(252, 3, 32)',
                    data: acumulated_asks //eje x
                },
                {
                    label: 'bids',
                    //backgroundColor: 'rgb(255, 99, 132)',
                    borderColor: 'rgb(3, 252, 20)',
                    data: acumulated_bids //eje x
                }]
            },

            //configuraciones
            options: {
                responsive: true,
                title: {
                    display: true,
                    fontColor: "#FFFFFF",
                    text: title //${pairA}/${pairB}
                },
                scales: { //lineas horizontales y verticales del grid
                    xAxes: [{
                        gridLines: { color: "rgba(255,255,255,0.5)" }, //color de las lineas
                        ticks: {fontColor: "rgba(255,255,255,0.5)"} //color de las etiquetas
                    }],
                    yAxes: [{
                        gridLines: { color: "rgba(255,255,255,0.5)" },
                        ticks: {fontColor: "rgba(255,255,255,0.5)"}
                    }]
                },
                legend: { //legenda que se ubica debajo del titulo
                    labels: {
                        fontColor: "#FFFFFF"
                    }
                }
            }
        });
    }
}

const get_and_draw_pairs = (optionToSelect:string) => {
    let select:any = $("#selectPair")//document.getElementById("#selectPair");
    //console.log(select);
    //Traigo todos los pares
    let url = 'https://api.binance.com/api/v3/exchangeInfo';
    //console.log(url)
    basic_request(url)
    .then(data => {
        for (let i = 0; i < data.symbols.length; i++) { //data.symbols.length
            const elem = data.symbols[i];
            const name = elem.baseAsset+'/'+elem.quoteAsset;
            select.append(`<option id="${elem.symbol}" value="${elem.symbol}">${name}</option>`);
        }
        stringPair = optionToSelect;
        selectOption(optionToSelect); //Se usa para seleccionar el par ETHDAI en la primera ejecucion
    })
    .catch(err => console.log(err))
}

const bear_bull = (price:number, avg_magic_number:number, bid:any[], ask:any[]) => {
    //Detecta si el entorno es bullish o bearish
    //avg_magic_number = 4 //numero de iteraciones que hace el for, es la cantidad de elem ordenados de mayor a menor que se van a tomar del orderbook
    let avg_bid:number = 0
    let avg_ask:number = 0
    let per_bid:number = 0
    let per_ask:number = 0

    bid = order_by(bid, 2);
    ask = order_by(ask, 2);

    function percentage(partialValue:number, totalValue:number) {
        let value = (100 * partialValue) / totalValue;
        return truncate(value - 100,2);
    }

    function func(orders:any[], mod:string){
        let count = 0
        let _sum = 0

        for (let i = 0; i < orders.length; i++) {
            const element = orders[i];
            
            if (count < avg_magic_number){
                if ((mod == 'bid' && price >= element[0]) || (mod == 'ask' && price <= element[0])){ //Chequeo que no haya anomalia en los datos (que el precio de venta de una orden sea menor que el precio actual)
                    _sum += element[0]
                    count += 1
                }
            }
            else{
                break
            }
        }

        return _sum / avg_magic_number
    }

    avg_bid = func(bid, 'bid')
    avg_ask = func(ask, 'ask')
    per_bid = percentage(avg_bid, price)
    per_ask = percentage(avg_ask, price)
    //console.log(`${avg_bid}, ${avg_ask}, ${per_bid}, ${per_ask}`);
    $('#bearBull').text((Math.abs(per_bid) < Math.abs(per_ask)) ? `B: ${per_bid}% > A: ${per_ask}%` : `B: ${per_bid}% < A: ${per_ask}%`);
    $('#imgBearBull').attr('src', (Math.abs(per_bid) < Math.abs(per_ask)) ? 'css/bull.png' : 'css/bear.png');
}

const selectOption = (option:string) => {
    //Selecciono la opcion deseada
    if (option.length != 0){
        let optionToSelect = document.getElementById(option)
        optionToSelect?.setAttribute('selected','true');
        //console.log('selecting: '+option);
    }
}

const biggest_order = (list:any[]) : any => {
    /*Extraigo la orden mas grande por volumen */
    let order:any = [0,0];
    for (let i = 0; i < list.length; i++) {
        const element = list[i];
        if (element[1] > order[1]){ //Si es valido y es mayor, lo agrego
            order = element;
        }
    }
    return order;
}