"use strict";
let chart = {};
const truncate = (number, digits) => {
    if (digits >= 0) {
        let stepper = 10.0 ** digits;
        return Math.trunc(stepper * number) / stepper;
    }
    else {
        return Math.trunc(number);
    }
};
const basic_request = (fullURL) => {
    return new Promise((resolve, reject) => {
        let settings = {
            "url": fullURL,
            "method": "GET",
            "timeout": 0,
            "mode": 'no-cors',
            "crossorigin": true,
            "headers": { "Content-Type": "multipart/form-data" },
            "beforeSend": function (xhr) { xhr.withCredentials = true; }
        };
        $.ajax(settings)
            .done(data => resolve(data))
            .catch(err => reject(err));
    });
};
const get_order_book = (symb1) => {
    return new Promise((resolve, reject) => {
        symb1 = symb1.toUpperCase();
        let url = 'https://api.binance.com/api/v3/depth?symbol=' + symb1 + '&limit=500';
        basic_request(url)
            .then(data => {
            resolve(data);
        })
            .catch(err => reject(err));
    });
};
const get_coin_price = (symb1) => {
    return new Promise((resolve, reject) => {
        symb1 = symb1.toUpperCase();
        let url = 'https://api.binance.com/api/v3/ticker/price?symbol=' + symb1;
        basic_request(url)
            .then(data => {
            resolve(Number(data.price));
        })
            .catch(err => reject(err));
    });
};
const analyze_list = (list, decimals) => {
    let output = [];
    let exist = false;
    for (let i = 0; i < list.length; i++) {
        const element = list[i];
        if (list.length > 0) {
            for (let e = 0; e < output.length; e++) {
                const sub_element = output[e];
                exist = false;
                let item = truncate(Number(element[0]), decimals);
                if (item == sub_element[0]) {
                    sub_element[1] += Number(element[1]);
                    sub_element[2] += 1;
                    exist = true;
                    break;
                }
            }
            if (exist == false) {
                output.push([truncate(Number(element[0]), decimals), Number(element[1]), 1]);
            }
        }
        else {
            output.push([truncate(Number(element[0]), decimals), Number(element[1]), 1]);
        }
    }
    return output;
};
const print_all = (list) => {
    for (let index = 0; index < list.length; index++) {
        const element = list[index];
    }
};
const order_by = (list, o) => {
    list.sort((a, b) => (a[o] > b[o]) ? 1 : -1);
    list.reverse();
    return list;
};
const concat_labels = (asks, bids) => {
    let labels = asks.map(function (a) { return a[0]; });
    labels.concat(bids.map(function (a) { return a[0]; }));
    return labels;
};
const draw_chart = (labels, acumulated_asks, acumulated_bids, price, pair, redraw = false) => {
    let title = `Actual price ${pair}: $${price}`;
    if (redraw) {
        chart.options.title.text = title;
        chart.data.labels = labels;
        chart.data.datasets[0].data = acumulated_asks;
        chart.data.datasets[1].data = acumulated_bids;
        chart.update();
    }
    else {
        let aux = document.getElementById('myChart');
        let ctx = aux === null || aux === void 0 ? void 0 : aux.getContext('2d');
        chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                        label: 'asks',
                        borderColor: 'rgb(252, 3, 32)',
                        data: acumulated_asks
                    },
                    {
                        label: 'bids',
                        borderColor: 'rgb(3, 252, 20)',
                        data: acumulated_bids
                    }]
            },
            options: {
                responsive: true,
                title: {
                    display: true,
                    fontColor: "#FFFFFF",
                    text: title
                },
                scales: {
                    xAxes: [{
                            gridLines: { color: "rgba(255,255,255,0.5)" },
                            ticks: { fontColor: "rgba(255,255,255,0.5)" }
                        }],
                    yAxes: [{
                            gridLines: { color: "rgba(255,255,255,0.5)" },
                            ticks: { fontColor: "rgba(255,255,255,0.5)" }
                        }]
                },
                legend: {
                    labels: {
                        fontColor: "#FFFFFF"
                    }
                }
            }
        });
    }
};
const get_and_draw_pairs = (optionToSelect) => {
    let select = $("#selectPair");
    let url = 'https://api.binance.com/api/v3/exchangeInfo';
    basic_request(url)
        .then(data => {
        for (let i = 0; i < data.symbols.length; i++) {
            const elem = data.symbols[i];
            const name = elem.baseAsset + '/' + elem.quoteAsset;
            select.append(`<option id="${elem.symbol}" value="${elem.symbol}">${name}</option>`);
        }
        stringPair = optionToSelect;
        selectOption(optionToSelect);
    })
        .catch(err => console.log(err));
};
const bear_bull = (price, avg_magic_number, bid, ask) => {
    let avg_bid = 0;
    let avg_ask = 0;
    let per_bid = 0;
    let per_ask = 0;
    bid = order_by(bid, 2);
    ask = order_by(ask, 2);
    function percentage(partialValue, totalValue) {
        let value = (100 * partialValue) / totalValue;
        return truncate(value - 100, 2);
    }
    function func(orders, mod) {
        let count = 0;
        let _sum = 0;
        for (let i = 0; i < orders.length; i++) {
            const element = orders[i];
            if (count < avg_magic_number) {
                if ((mod == 'bid' && price >= element[0]) || (mod == 'ask' && price <= element[0])) {
                    _sum += element[0];
                    count += 1;
                }
            }
            else {
                break;
            }
        }
        return _sum / avg_magic_number;
    }
    avg_bid = func(bid, 'bid');
    avg_ask = func(ask, 'ask');
    per_bid = percentage(avg_bid, price);
    per_ask = percentage(avg_ask, price);
    $('#bearBull').text((Math.abs(per_bid) < Math.abs(per_ask)) ? `B: ${per_bid}% > A: ${per_ask}%` : `B: ${per_bid}% < A: ${per_ask}%`);
    $('#imgBearBull').attr('src', (Math.abs(per_bid) < Math.abs(per_ask)) ? 'css/bull.png' : 'css/bear.png');
};
const selectOption = (option) => {
    if (option.length != 0) {
        let optionToSelect = document.getElementById(option);
        optionToSelect === null || optionToSelect === void 0 ? void 0 : optionToSelect.setAttribute('selected', 'true');
    }
};
const biggest_order = (list) => {
    let order = [0, 0];
    for (let i = 0; i < list.length; i++) {
        const element = list[i];
        if (element[1] > order[1]) {
            order = element;
        }
    }
    return order;
};
