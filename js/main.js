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
    preloader: {id: 'loader-wrapper', el: {}},
    chart: {
        chartMain: {id: 'chartMain', el: {}},
        chartChild: {id: 'chartChild', el: {}}
    },
    table: {id: 'lines_dataTables', el: {}},
    span: {
        // главный график
        // название прибора
        deviceInst: {id: 'deviceInst', el: {}},
        // адресс
        adressInst: {id: 'adressInst', el: {}},
        // расход за все время
        totalСonsumption: {id: 'totalСonsumption', el: {}},

        //  расход за сутки
        dayConsumption: {id: 'dayConsumption', el: {}}


    }
};

main.data = {
    main: [],
    chartmain: [],
    chartChild: [],
    table: [],
    device: '',
};

main.init = {
    elements: function () {
        // Графики
        main.elements.chart.chartMain.el = main.helpfunc.getobject(main.elements.chart.chartMain.id);
        main.elements.chart.chartMain.el = main.helpfunc.getobject(main.elements.chart.chartMain.id);
        // Таблица
        main.Table.object = main.helpfunc.getobject(main.elements.table.id);
        main.elements.table.el = main.helpfunc.getobject(main.elements.table.id);
        // preloader
        main.elements.preloader.el = main.helpfunc.getobject(main.elements.preloader.id);
        // span View
        main.elements.span.deviceInst.el = main.helpfunc.getobject(main.elements.span.deviceInst.id);
        main.elements.span.adressInst.el = main.helpfunc.getobject(main.elements.span.adressInst.id);
        main.elements.span.totalСonsumption.el = main.helpfunc.getobject(main.elements.span.totalСonsumption.id);
        main.elements.span.dayConsumption.el = main.helpfunc.getobject(main.elements.span.dayConsumption.id);

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
    },
    preloader: {
        show: function () {
            main.elements.preloader.el.prop('hidden', false);
        },
        hidden: function () {
            main.elements.preloader.el.prop('hidden', true);
        },
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
        // in future need delete
        if(!data[0].isOnline) {
            data.map((val,i) => {
                if(i%2 == 0) {
                    data[i].isOnlaine =true;
                    return val;
                }else{
                    data[i].isOnlaine =false;
                    return val;
                }
            })
        }

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
            return [moment.parseZone(obj.Date).valueOf(), obj.Value];
        });
    },
    isetchildChartData(data) {
        return data.map(function (obj) {
            return [moment.parseZone(obj.Time).valueOf(), obj.Value];
        });
    },
    span: {
        setMainSpan: function (id) {
          var resObj =  main.data.main.filter(function (val) {
                return  val.Id.toString() == id;
            })[0];
            main.hundlers.span.setTextSpan(main.elements.span.deviceInst.el, resObj.Id);
            main.hundlers.span.setTextSpan(main.elements.span.adressInst.el, resObj.Address);
           main.hundlers.span.setTextSpan(main.elements.span.totalСonsumption.el, resObj.Indication.toString()+' м3')

        },
        setChildSpan: function (total) {
          // var totalChild = main.data.chartChild.reduce(function (sum,next) {
          //     return sum + next[1];
          // },0);
            main.hundlers.span.setTextSpan(main.elements.span.dayConsumption.el, total.toString()+ ' м3');
        },
        setTextSpan: function (el, text) {
            el.text(text);
        },
        cleanSpanText: function (el) {
            el.text('')
        }
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
                "paging": false,
                // "pagingType": 'simple_numbers',
                "order": [],
                // "lengthMenu": [
                //     [15],
                //     [15]
                // ],
                // "select": true,
                "responsive": true,
                "data": leftTempListData,
                "columnDefs": [{
                    'targets': 1,
                    'searchable': true,
                    'orderable': false,
                    'className': 'dt-body-center manual number',
                    'render': function (data, type, full, meta) {
                        return data;
                    }
                },
                    {
                        'targets': 2,
                        'orderable': false,
                        'searchable': true,
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
                    },
                    {
                        'targets': 7,
                        'orderable': false,
                        'searchable': false,
                        'className': 'dt-body-center',
                        'render': function (data, type, full, meta) {
                            const url = data ? '../img/wi-fi-green.png': '../img/wi-fi-red.png';
                            return  `<img src=${url}/>`;

                        },
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
                     {title:"Связь"},
                ],
                "dom": "<'top'f>t<'clear'>",
            });


            main.Table.object.on('click', 'td', function () {
                var _this = $(this);
                var tr = main.Table.selected.closestTr(_this);
                if (main.Table.selected.isSelectedTr(false, tr) && !main.Table.hasOpenManual() && !main.Table.ismanualTd(_this)) {
                    $spop.message.warn('Данные устройства отображены');
                    return;
                }
                // if tr  selected and this no manual td
                if (main.Table.selected.isSelectedTr(false, tr) && !main.Table.ismanualTd(_this)) {
                    $spop.message.warn('Данные устройства отображены');
                    return;
                }
                // if this no selected tr and no  open manual td
                if (!main.Table.selected.isSelectedTr(false, tr) && !main.Table.hasOpenManual() && !main.Table.ismanualTd(_this)) {
                    main.Table.selected.remove(false, main.Table.selected.findSelected(_this));
                    main.Table.selected.set(_this);
                    var idDevice = main.Table.getIdDecive(_this);
                    main.hundlers.span.setMainSpan(idDevice);
                    // clean child total consumption
                    main.hundlers.span.cleanSpanText(main.elements.span.dayConsumption.el);
                    main.Table.getDataMainChart(idDevice);
                } else if (main.Table.ismanualTd(_this) && !main.Table.selected.isSelectedTr(false, tr) && !main.Table.hasOpenManual()) {
                    var inst = main.Table.manualInst(_this);
                    _this.empty();
                    _this.append(main.Table.inputHTML(inst));
                    main.Table.addfuncbtn();
                    main.Table.selected.remove(false, main.Table.selected.findSelected(_this));
                    main.Table.selected.set(_this);
                    var idDevice = main.Table.getIdDecive(_this);
                    main.hundlers.span.setMainSpan(idDevice);
                    // clean child total consumption
                    main.hundlers.span.cleanSpanText(main.elements.span.dayConsumption.el);
                    main.Table.getDataMainChart(idDevice);
                } else if (main.Table.ismanualTd(_this) && !main.Table.hasOpenManual() && main.Table.selected.isSelectedTr(false, tr)) {
                    var inst = main.Table.manualInst(_this);
                    _this.empty();
                    _this.append(main.Table.inputHTML(inst));
                    main.Table.addfuncbtn();
                } else {
                    $spop.message.warn('Закройте сначала поле для редактирования');
                    return;
                }
            });

        }
    },
    selected: {
        findSelected: function (el) {
            return el.closest('tbody').find('.selected')
        },
        set: function (td, tr) {
            tr ? tr.addClass('selected') : td.closest('tr').addClass('selected')
        },
        remove: function (td, tr) {
            tr ? tr.removeClass('selected') : td.closest('tr').removeClass('selected')
        },
        isSelectedTr: function (td, tr) {
            return tr ? tr.hasClass('selected') : td.hasClass('selected')
        },
        closestTr: function (el) {
            return el.closest('tr');
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
            main.data.chartmain = main.hundlers.isetmainChartData(dataChart);
            chart.init.main(main.data.chartmain);
        } else {
            console.log('error get mainChart Data');
            $spop.message.error('Ошибка получения данных главного графика');
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
        return {
            'DeviceId': `${result.Id}`,
            'Abonent': `${result.Abonent}`,
            'Address': `${result.Address}`,
            'Impulse': `${result.Impulse}`.replace('.', ',')
        }

    },
    setTdmanualvalue: function (input, key, newvalue) {
        var td = input.closest('tr').find('td')[key];
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
