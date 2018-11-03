var main = {};
main.debug = true;
main.debugRoot = 'http://91.235.136.123:2525/';
main.root = main.debug ? main.debugRoot : '';
main.routes = {
    getdevice: main.root + 'api/demo/getdevices',
    getchartperiod: main.root + 'api/demo/getchartperiod', //  ->  {'DeviceId':'100001001'}
    getchartday: main.root + 'api/demo/getchartday', //->  {'DeviceId':'100001001', 'Year':'2018', 'Month':'10', 'Day':'22'}
    setdevicedata: main.root + 'api/demo/setdevicedata' // ->  {'DeviceId':'100001001','Abonent':'abc', 'Address':'def', 'Impulse':'0.05'}
};
main.elements = {
    buttons: {},
    chart: {
        chartMain: {id: 'chartMain', el: ''},
        chartChild: {id: 'chartChild', el: ''}
    },
    table: {id: 'lines_dataTables', el: ''}
};

main.data = {
    main: [],
    chartmain: [],
    chartChild: [],
    table: [],
    device:'',
};

main.init = {
    elements: function () {
        // Графики
        main.elements.chart.chartMain.el = main.helpfunc.getobject(main.elements.chart.chartMain.id);
        main.elements.chart.chartMain.el = main.helpfunc.getobject(main.elements.chart.chartMain.id);
        // Таблица
        main.Table.object = main.helpfunc.getobject(main.elements.table.id);
        main.elements.table.el = main.helpfunc.getobject(main.elements.table.id);
    }
};


main.helpfunc = {
    getobject: function (id) {
        return $("#" + id);
    },
    closeInputInTable: function () {
        var inp = $('#manua_input');
        if (inp.length == 0) return;
        var inpprew = inp.data('prew');
        var td = inp.closest('td');
        td.empty();
        td.text(inpprew);
    }
};

main.hundlers = {
    getDataDevice: function (data) {
        if (data.IsSuccess) {
            main.data.main = data.Devices;
            main.hundlers.initActions();
        } else {
            console.log('Error get Data Device');

        }
    },
    initActions: function () {
        main.hundlers.insertTabledata(main.data.main);
        main.Table.dataTable.init(main.data.table);
    },
    insertTabledata: function (data) {
        main.data.table = [];
        data.forEach(function (obj) {
            var init = [];
            var objkey = Object.keys(obj);
            objkey.forEach(function (key) {
                init.push(obj[key]);
            });
            main.data.table.push(init);
        });
    },
    isetmainChartData: function (data) {
       return data.map(function (obj) {
            return [ moment(obj.Date).valueOf(), obj.Value ];
        });
    },
    isetchildChartData(data){
        return data.map(function (obj) {
            return [ moment(obj.Time).valueOf(), obj.Value ];
        });
    }

};


main.Table = {
    object: {},
    dataTable: {
        object: {},
        dt: {},
        clean: function () {
            if (!$.isEmptyObject(main.Table.dataTable.dt)) {
                main.Table.dataTable.dt.destroy();
                main.Table.object.find('tbody').remove();
                main.Table.dataTable.dt = {};
            }
        },
        init: function (leftTempListData) {
            main.Table.dataTable.clean();
            main.Table.dataTable.dt = main.Table.object.DataTable({
                "pagingType": 'simple_numbers',
                "order": [],
                "lengthMenu": [
                    [15],
                    [15]
                ],
                "select": true,
                "responsive": true,
                "data": leftTempListData,
                "columnDefs": [{
                    'targets': 1,
                    'orderable': false,
                    'searchable': false,
                    'className': 'dt-body-center manual number',
                    'render': function (data, type, full, meta) {
                        return data;
                    }
                },
                    {
                        'targets': 2,
                        'orderable': false,
                        'searchable': false,
                        'className': 'dt-body-center manual adress',
                        'render': function (data, type, full, meta) {
                            return data;
                        }
                    },
                    {
                        'targets': 3,
                        'orderable': false,
                        'searchable': false,
                        'className': 'dt-body-center manual impuls',
                        'render': function (data, type, full, meta) {
                            return data;

                        }
                    }
                ],
                "columns": [
                    {title: "ID"},
                    {title: "№ абонента"},
                    {title: "Адрес"},
                    {title: "Вес импульса"},
                    {title: "Показания"},
                    {title: "Ошибка"},
                    {title: "Заряд батареи"},
                ],
                "dom": "t<'clear'><'row'<'col-md-12'p>>",
            });

            // main.Table.object.on('click', 'tr', function(e) {
            // });
            main.Table.object.on('click', 'td', function (e) {
                $e = e.target || e.srcElement;
                if ($($e).attr('id') == 'manua_input') return;
                var _this = $(this);
                if (!main.Table.inthisTrOpenInput(_this)) {
                    main.helpfunc.closeInputInTable();
                }
                if (main.Table.ismanualTd(_this) && !main.Table.hasOpenManual()) {
                    var inst = main.Table.manualInst(_this);
                    _this.empty();
                    _this.append(main.Table.inputHTML(inst));
                    main.Table.addfuncbtn();
                    main.Table.getDataMainChart(main.Table.getIdDecive(_this));
                } else {
                    main.Table.getDataMainChart(main.Table.getIdDecive(_this));
                }
            });

        }
    },
    getDataMainChart: function (id) {
        chart.Ajax.sendFileToProccess(main.routes.getchartperiod, {'DeviceId': id}, main.Table.setMainChartData);
    },
    getIdDecive: function (trElem) {
        return trElem.closest('tr').find('td:first').text();
    },
    setMainChartData: function (data) {
        // Обработка данных главного графика
        if (data.IsSuccess) {
            var dataChart = data.ChartPeriod.ChartDates;
            main.data.device = data.ChartPeriod.BelongsToDevice.toString();
            main.data.chartmain = main.hundlers.isetmainChartData( dataChart);
            chart.init.main(main.data.chartmain);

        } else {
            console.log('error get mainChart Data');
        }

    },
    hasOpenManual: function () {
        return $('#manua_input').length > 0;
    },
    inthisTrOpenInput: function (_this) {
        return _this.closest('tr').find('input').length > 0;
    },
    ismanualTd: function (el) {
        return el.hasClass('manual');

    },
    manualInst: function (el) {
        return el.hasClass('number') ? [1, el.text()] : el.hasClass('adress') ? [2, el.text()] : el.hasClass('impuls') ? [3, el.text()] : null;

    },

    inputHTML: function (data) {
        return `<div class="input-group" style="z-index:10">
        <input id="manua_input" type="text" data-prew="${data[1]}"  data-inst =${data[0]} value="${data[1]}" class="form-control"  aria-label="Recipient's username" aria-describedby="basic-addon2">
        <div class="input-group-append">
          <button id='btn_ok' class="btn btn-secondary btn-sm" type="button"><i class="fa fa-check" aria-hidden="true"></i></button>
          <button id='btn_cancel' class="btn btn-secondary btn-sm" type="button"><i class="fa fa-times" aria-hidden="true"></i></button>
        </div>
      </div>`;
    },
    addfuncbtn: function () {
        var input = $('#manua_input');
        var len = input.val().length;
        input[0].focus();
        input[0].setSelectionRange(len, len);
        $('#btn_ok').on('click', function (e) {
            e.stopPropagation();
            main.Table.setNewDataTable();
        });
        $('#btn_cancel').on('click', function (e) {
            e.stopPropagation();
            main.helpfunc.closeInputInTable();
        });
    },
    setNewDataTable: function () {
        var inp = $('#manua_input');
        var value = inp.val();
        var valInst = inp.data('inst');
        var id = main.Table.getIddecive(inp);
        var data = main.Table.getsetdataRow(id, valInst, value);
        main.hundlers.insertTabledata(main.data.main);
        chart.Ajax.sendFileToProccess(main.routes.setdevicedata, data, main.Table.setNewDatasResponse);
        main.Table.setTdmanualvalue(inp, valInst, value);
    },
    getIddecive: function (inp) {
        return inp.closest('tr').find('td:first').text();
    },
    getsetdataRow: function (id, valInst, newvalue) {
        var result;
        main.data.main = main.data.main.map(function (el) {
            if (el.Id == id) {
                var key = Object.keys(el)[valInst];
                el[key] = newvalue;
                result = el;
                return el;
            } else {
                return el;
            }
        });
        return result;
    },
    setTdmanualvalue: function (input, key, newvalue) {
        var td = input.closest('tr').find('td')[key]
        var $td = $(td);
        $td.empty();
        $td.text(newvalue);
    },
    setNewDatasResponse: function (data) {
        if (data.IsSuccess) {

        } else {
            console.log('error save change device');
        }
    }
};


$(function () {
    main.init.elements();
    chart.Ajax.sendFileToProccess(main.routes.getdevice, null, main.hundlers.getDataDevice);

});
