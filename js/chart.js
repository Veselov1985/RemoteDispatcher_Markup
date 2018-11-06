var chart = {};

chart.data = {
    devices: [],
    devicesInst: [],
};

chart.helpfunc = {};

chart.hundlers = {
    error: function (err) {
        console.log(err);
        $spop.message.error(err);
    },
    getDataDevice: function (data) {
        if(data.IsSuccess){
            $spop.message.success('Данные устройства обновлены');
        }else {
            $spop.message.error('Даные устройства не обновлены');
        }

    },
    getChildData: function (y) {
        var data = main.data.chartmain.filter((arr) => arr[1] === y)[0][0];
        var _moment = moment(data).format('YYYY-MM-DD').split('-'); //getChildData
        var param = {
            'DeviceId': main.data.device,
            'Year': _moment[0],
            'Month': _moment[1],
            'Day': _moment[2]
        };

        chart.Ajax.sendFileToProccess(main.routes.getchartday, param, chart.hundlers.setChildData);
    },
    setChildData: function (data) {
        // Обработка данных Child графика
        if (data.IsSuccess) {
            var dataChart = data.ChartDay.ChartHours;
            main.data.chartChild = main.hundlers.isetchildChartData(dataChart);
            // TODO возможно отображать расход за день нужно после получения данных с бэка (сейчас эти данные мы берем по клику на главном графике)
            // main.hundlers.span.setChildSpan();
             chart.init.child();
        } else {
            console.log('error get childChart Data');
        }

    }
};

chart.init = {
    child: function () {
        $('#chartChild').empty();
        Highcharts.stockChart('chartChild', {
            chart: {
                alignTicks: false
            },
            rangeSelector: {
                selected: 1
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
                            'day',
                            [1]
                        ],
                    ]
                }
            }]
        });
    },
    main: function () {
        $('#chartMain').empty();
        $('#chartChild').empty();
        Highcharts.stockChart('chartMain', {
            chart: {
                alignTicks: false
            },

            rangeSelector: {
                selected: 1
            },

            plotOptions: {
                series: {
                    cursor: 'pointer',
                    point: {
                        events: {
                            click: function () {
                                chart.hundlers.getChildData(this.y);
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
                            'day',
                            [1]
                        ],
                    ]
                }
            }]
        });
    },
};


chart.Ajax = {
    sendFileToProccess: function (url, data, success) {
        $.ajax({
            url: url,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data ? data : {}),
            success: function (data, textStatus, jqXHR) {
                success(data);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                chart.hundlers.error(textStatus);
            },
            beforeSend: function () {
                main.helpfunc.preloader.show();
            },
            complete: function () {
                main.helpfunc.preloader.hidden();
            }
        });
    },
};

