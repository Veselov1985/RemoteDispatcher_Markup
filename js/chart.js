var chart = {};

chart.lang = {
    options: {
        weekdays: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
        months: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
        shortMonths: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
        rangeSelectorZoom: '',
        rangeSelectorFrom: 'С',
        rangeSelectorTo: 'по'
    },
    rangeSelector: {
        inputDateFormat: '%e %b, %Y',
        selected: 1,
        enabled: true,
        buttons: [{
                type: 'month',
                count: 1,
                text: '1 мес'
            },
            {
                type: 'month',
                count: 3,
                text: '3 мес'
            },
            {
                type: 'month',
                count: 6,
                text: '6 мес'
            },
            {
                type: 'ytd',
                text: 'С 1 янв'
            },
            {
                type: 'year',
                count: 1,
                text: '1 год'
            },
            {
                type: 'all',
                text: 'Все'
            }
        ],
        buttonSpacing: 4,
        buttonTheme: {
            width: 50
        }
    },
};

chart.data = {
    devices: [],
    devicesInst: [],
};

chart.helpfunc = {};

chart.hundlers = {
    error: function(err) {
        console.log(err);
        $spop.message.error(err);
    },
    getDataDevice: function(data) {
        if (data.IsSuccess) {
            $spop.message.success('Данные устройства обновлены');
        } else {
            $spop.message.error('Даные устройства не обновлены');
        }

    },
    getChildData: function(x) {
        // x => кол-во милесекунд (Дата по которой нужно плучить Child chart)
        var _moment = moment.utc(x).format('YYYY-MM-DD').split('-'); //getChildData
        var param = {
            'DeviceId': main.data.device,
            'Year': _moment[0],
            'Month': _moment[1],
            'Day': _moment[2]
        };

        chart.Ajax.sendFileToProccess(main.routes.getchartday, param, chart.hundlers.setChildData);
    },
    setChildData: function(data) {
        // Обработка данных Child графика
        if (data.IsSuccess) {
            main.data.firstInit = false;
            var dataChart = data.ChartDay.ChartHours;
            main.data.chartChild = main.hundlers.isetchildChartData(dataChart);
            // TODO возможно отображать расход за день нужно после получения данных с бэка (сейчас эти данные мы берем по клику на главном графике)
            // main.hundlers.span.setChildSpan();
            chart.init.child();
        } else {
            console.log('error get childChart Data');
        }

    },
    setTime: (from, to) => {
        main.elements.span.toTime.el.text(from);
        main.elements.span.fromTime.el.text(to);
    },
    setChildtime: (time) => {
        main.elements.span.childTime.el.text(time);
    }
};

chart.init = {
    child: function() {
        $('#chartChild').empty();
        Highcharts.setOptions({
            lang: chart.lang.options,
        });
        Highcharts.stockChart('chartChild', {

            chart: {
                alignTicks: false,
                events: {
                    load: () => {
                        const content = $('#chartChild .highcharts-range-selector-group');
                        let alltime = content.find('.highcharts-range-input').find('tspan')[0];
                        alltime = $(alltime).text();
                        chart.hundlers.setChildtime(alltime);
                        content.remove();

                    }
                }
            },
            rangeSelector: {
                enabled: true,
            },
            plotOptions: {
                series: {
                    cursor: 'pointer',
                }
            },
            series: [{
                type: 'column',
                name: 'Расход м3',
                data: main.data.chartChild,
                dataGrouping: {
                    units: [
                        [
                            'day', [1]
                        ],
                    ]
                }
            }]
        });
    },
    main: function() {
        $('#chartMain').empty();
        $('#chartChild').empty();
        Highcharts.setOptions({
            lang: chart.lang.options,
        });
        Highcharts.stockChart('chartMain', {
            chart: {
                alignTicks: false,
                events: {
                    load: function(e) {
                        let fromTime = $('#chartMain .highcharts-range-input').find('tspan')[0];
                        fromTime = $(fromTime).text();
                        let toTime = $('#chartMain .highcharts-range-input').find('tspan')[1];
                        toTime = $(toTime).text();
                        chart.hundlers.setTime(toTime, fromTime);
                    }
                }
            },
            xAxis: {
                events: {
                    setExtremes: function(e) {
                        let fromTime = $('#chartMain .highcharts-range-input').find('tspan')[0];
                        fromTime = $(fromTime).text();
                        let toTime = $('#chartMain .highcharts-range-input').find('tspan')[1];
                        toTime = $(toTime).text();
                        chart.hundlers.setTime(toTime, fromTime);
                    }
                }
            },

            rangeSelector: {
                inputDateFormat: '%e %b, %Y',
                selected: 0,
                enabled: true,
                buttons: [{
                        type: 'month',
                        count: 1,
                        text: '1 мес'
                    },
                    {
                        type: 'month',
                        count: 3,
                        text: '3 мес'
                    },
                    {
                        type: 'month',
                        count: 6,
                        text: '6 мес'
                    },
                    {
                        type: 'ytd',
                        text: 'С 1 янв'
                    },
                    {
                        type: 'year',
                        count: 1,
                        text: '1 год'
                    },
                    {
                        type: 'all',
                        text: 'Все'
                    }
                ],
                buttonSpacing: 4,
                buttonTheme: {
                    width: 50
                }
            },

            plotOptions: {
                series: {
                    cursor: 'pointer',
                    point: {
                        events: {
                            click: function() {
                                chart.hundlers.getChildData(this.x);
                                main.hundlers.span.setChildSpan(this.y)
                            }
                        }
                    }
                }
            },
            series: [{
                type: 'column',
                name: 'Расход м3',
                data: main.data.chartmain,
                dataGrouping: {
                    units: [
                        [
                            'day', [1]
                        ],
                    ]
                }
            }]
        });
    },
};


chart.Ajax = {
    sendFileToProccess: function(url, data, success, id) {
        $.ajax({
            url: url,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data ? data : {}),
            success: function(data, textStatus, jqXHR) {
                success(data, id);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                chart.hundlers.error(textStatus);
            },
            beforeSend: function() {
                main.helpfunc.preloader.show();
            },
            complete: function() {
                main.helpfunc.preloader.hidden();
            }
        });
    },
};