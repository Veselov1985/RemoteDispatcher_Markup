var main = {};
main.debug = true;
main.debugRoot = 'http://91.235.136.123:2525/';
main.root = main.debug ? main.debugRoot : '';
main.demo = true;
main.mode = main.demo ? 'demo' : 'data';
main.routes = {
    getdevice: main.root + `api/${main.mode}/getdevices`,
    getchartperiod: main.root + `api/${main.mode}/getchartperiod`, //  ->  {'DeviceId':'100001001'}
    getchartday: main.root + `api/${main.mode}/getchartday`, //->  {'DeviceId':'100001001', 'Year':'2018', 'Month':'10', 'Day':'22'}
    setdevicedata: main.root + `api/${main.mode}/setdevicedata` // ->  {'DeviceId':'100001001','Abonent':'abc', 'Address':'def', 'Impulse':'0.05'}
};
main.elements = {
    buttons: {},
    preloader: { id: 'loader-wrapper', el: {} },
    chart: {
        chartMain: { id: 'chartMain', el: {} },
        chartChild: { id: 'chartChild', el: {} }
    },
    table: { id: 'lines_dataTables', el: {} },
    span: {
        // главный график
        // название прибора
        deviceInst: { id: 'deviceInst', el: {} },
        // адресс
        adressInst: { id: 'adressInst', el: {} },
        // расход за все время
        totalСonsumption: { id: 'totalСonsumption', el: {} },

        //  расход за сутки
        dayConsumption: { id: 'dayConsumption', el: {} },

        // Фильт индикация главный график
        fromTime: { id: 'fromTime', el: {} },
        toTime: { id: 'toTime', el: {} },

        // range child
        childTime: { id: 'childTime', el: {} }


    }
};

main.data = {
    // Глобальная настройка первая загрузка
    firstInit: true,
    main: [],
    chartmain: [],
    chartChild: [],
    table: [],
    device: '',
};

main.init = {
    elements: function() {
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
        // span renge main
        main.elements.span.toTime.el = main.helpfunc.getobject(main.elements.span.toTime.id);
        main.elements.span.fromTime.el = main.helpfunc.getobject(main.elements.span.fromTime.id);
        // span range child
        main.elements.span.childTime.el = main.helpfunc.getobject(main.elements.span.childTime.id);


    }
};


main.helpfunc = {
    getobject: function(id) {
        return $("#" + id);
    },
    closeInputInTable: function() {
        var inp = $('#manua_input');
        if (inp.length == 0) return;
        var inpprew = inp.data('prew');
        var td = inp.closest('td');
        td.empty();
        td.text(inpprew);
    },
    preloader: {
        show: function() {
            main.elements.preloader.el.prop('hidden', false);
        },
        hidden: function() {
            main.elements.preloader.el.prop('hidden', true);
        },
    }
};

main.hundlers = {
    getDataDevice: function(data) {
        if (data.IsSuccess) {
            main.data.main = main.hundlers.convertServerobject(data.Devices);
            main.hundlers.initActions();
            // first init block
            if (main.data.firstInit) {
                const id = main.data.main[0].Id;
                main.Table.getDataMainChart(id);
                main.Table.dataTable.dt.row(':eq(0)', { page: 'current' }).select();
                main.hundlers.span.setMainSpan(id);
            }
        } else {
            console.log('Error get Data Device');
            $spop.message.error('Ошибка в получении данных устройства.попробуйте повторить позже.')
        }
    },
    initActions: function() {
        main.hundlers.insertTabledata(main.data.main);
        main.Table.dataTable.init(main.data.table);
    },
    insertTabledata: function(data) {
        main.data.table = [];
        data.forEach(function(obj) {
            var init = [];
            var objkey = Object.keys(obj);
            objkey.forEach(function(key) {
                init.push(obj[key]);
            });
            main.data.table.push(init);
        });
    },
    convertServerobject: function(arr) {
        return arr.map(function(obj) {
            return {
                Id: obj.Id,
                Abonent: obj.Abonent,
                Address: obj.Address,
                ImpStart: obj.ImpStart,
                ImpWeight: obj.ImpWeight,
                Indication: obj.Indication,
                Error: obj.Error,
                Battery: obj.Battery,
                IsOnline: obj.IsOnline
            }
        })
    },
    isetmainChartData: function(data) {
        return data.map(function(obj) {
            return [moment.parseZone(obj.Date).valueOf(), obj.Value];
        });
    },
    isetchildChartData(data) {
        return data.map(function(obj) {
            return [moment.parseZone(obj.Time).valueOf(), obj.Value];
        });
    },
    span: {
        setMainSpan: function(id) {
            var resObj = main.data.main.filter(function(val) {
                return val.Id.toString() == id;
            })[0];
            main.hundlers.span.setTextSpan(main.elements.span.deviceInst.el, resObj.Id);
            main.hundlers.span.setTextSpan(main.elements.span.adressInst.el, resObj.Address);
            main.hundlers.span.setTextSpan(main.elements.span.totalСonsumption.el, resObj.Indication.toFixed(2).toString() + ' м3')

        },
        setChildSpan: function(total) {
            // var totalChild = main.data.chartChild.reduce(function (sum,next) {
            //     return sum + next[1];
            // },0);
            main.hundlers.span.setTextSpan(main.elements.span.dayConsumption.el, total.toFixed(2).toString() + ' м3');
        },
        setTextSpan: function(el, text) {
            el.text(text);
        },
        cleanSpanText: function(el) {
            el.text('')
        }
    },
    addEventsTable: function(table) {
        table.find('.btn_edit').on('click', function(e) {
            e.stopPropagation();
            main.hundlers.initEdit($(this));
        });

        table.find('.btn_save').on('click', function(e) {
            e.stopPropagation();
            main.hundlers.saveEdit($(this));
        });

        table.find('.btn_cancel').on('click', function(e) {
            e.stopPropagation();
            main.hundlers.cancelEdit($(this));
        });
    },
    initEdit: function(_that) {
        // Блок проверки
        var tr = main.Table.selected.closestTr(_that);
        // Устройство можно редактировать только  => данные устройства получены и данная строка selected
        if (main.Table.selected.isSelectedTr(false, tr)) {
            // показываем кнопки для редактирования
            main.css.showEdit(tr);
            // инициализация полей для редактирования
            main.hundlers.initEditField(tr);
        } else {
            $spop.message.warn('Для редактирования устройства его нужно сделать активным');
        }
    },
    initEditField: function(tr) {
        const arrfield = tr.find('.manual');
        $.each(arrfield, (i, el) => {
            const $elem = $(el);
            const inst = main.Table.manualInst($elem);
            const html = main.Table.inputhtml(inst);
            $elem.empty();
            $elem.append(html);
        });
    },
    cancelEdit: function(_that) {
        const tr = main.Table.selected.closestTr(_that);
        const inputField = tr.find('.manual-input');
        $.each(inputField, (i, el) => {
            const inp = $(el);
            const inpprew = inp.data('prew');
            var td = inp.closest('td');
            td.empty();
            td.text(inpprew);
        });
        main.css.showInit(tr);
    },
    saveEdit: function(_that) {
        const tr = main.Table.selected.closestTr(_that);
        const inputField = tr.find('.manual-input');
        const id = main.Table.getIddecive($(inputField[0]));
        if (!main.hundlers.validateinputField(inputField)) { return; }
        $.each(inputField, (i, el) => {
            const inp = $(el);
            const newData = inp.val().trim();
            const valInst = inp.data('inst');
            const td = inp.closest('td');
            td.empty();
            td.text(newData);
            main.Table.getsetdataRow(id, valInst, newData);
        });
        // TODO возможно нужно будет проверить все поля ли для редактирования заполнены чтоб понимать перезагружать график или нужно только обновить только данные девайса
        main.hundlers.insertTabledata(main.data.main);
        const data = main.data.main.filter(device => device.Id == +id)[0];
        const param = {
            'DeviceId': `${data.Id}`,
            'Abonent': `${data.Abonent}`,
            'Address': `${data.Address}`,
            'ImpWeight': main.demo ? `${data.ImpWeight}`.replace('.', ',') : `${data.ImpWeight}`.replace(',', '.'),
            'ImpStart': main.demo ? `${data.ImpStart}`.replace('.', ',') : `${data.ImpWeight}`.replace(',', '.'),
        };
        chart.Ajax.sendFileToProccess(main.routes.setdevicedata, param, main.Table.setNewDatasResponse, id);
        main.css.showInit(tr);
    },
    // Валидация ввода данных пользователем
    validateinputField: function(arrInp) {
        let state = true;
        $.each(arrInp, (i, inp) => {
            const $inp = $(inp);
            const inst = $inp.data('inst');
            const newValue = $inp.val().trim();

            switch (inst) {
                case 1:
                    if (newValue == '') {
                        $spop.message.warn('Поле номера абонента не может быть пустым');
                        state = false
                    }
                    break;
                case 2:
                    if (newValue == '') {
                        $spop.message.warn('Поле Адресс не может быть пустым');
                        state = false
                    }
                    break;
                case 3:
                    if (newValue == '' || isNaN(newValue)) {
                        $spop.message.warn('Поле Начальное значение не может быть пустым или не числом');
                        state = false
                    }
                    break;
                case 4:
                    if (newValue == '' || isNaN(newValue)) {
                        $spop.message.warn('Поле Вес импульса не может быть пустым или не числом');
                        state = false
                    }
                    break
            }

        });
        return state;
    }
};

main.css = {
    showEdit: function(tr) {
        main.css.ofDisplay(main.css.findGroup1(tr));
        main.css.onDisplay(main.css.findGroup2(tr), true);
    },
    showInit: function(tr) {
        main.css.onDisplay(main.css.findGroup1(tr));
        main.css.ofDisplay(main.css.findGroup2(tr));
    },
    findGroup1: function(tr) {
        return tr.find('.group-1')
    },
    findGroup2: function(tr) {
        return tr.find('.group-2')
    },

    onDisplay: function(el, flex) {
        flex ? $(el).css({ display: 'flex' }) : $(el).css({ display: 'block' });
    },
    ofDisplay: function(el) {
        $(el).css({ display: 'none' });
    }
};

main.Table = {
    object: {},
    dataTable: {
        object: {},
        dt: {},
        clean: function() {
            if (!$.isEmptyObject(main.Table.dataTable.dt)) {
                main.Table.dataTable.dt.destroy();
                main.Table.object.find('tbody').remove();
                main.Table.dataTable.dt = {};
            }
        },
        init: function(leftTempListData) {
            main.Table.dataTable.clean();
            main.Table.dataTable.dt = main.Table.object.DataTable({
                "paging": true,
                // "pagingType": 'simple_numbers',
                "order": [],
                "lengthMenu": [
                    [5, 10, 50, -1],
                    [5, 10, 50, 'Все']
                ],
                // "select": true,
                "responsive": true,
                "data": leftTempListData,
                "columnDefs": [{
                        'targets': 1,
                        'searchable': true,
                        'orderable': false,
                        'className': 'dt-body-center manual number',
                        'render': function(data, type, full, meta) {
                            return data;
                        }
                    },
                    {
                        'targets': 2,
                        'orderable': false,
                        'searchable': true,
                        'className': 'dt-body-center manual adress',
                        'render': function(data, type, full, meta) {
                            return data;
                        }
                    },
                    {
                        'targets': 3,
                        'orderable': false,
                        'searchable': false,
                        'className': 'dt-body-center manual impstart',
                        'render': function(data, type, full, meta) {
                            return data;

                        }
                    },
                    {
                        'targets': 4,
                        'orderable': false,
                        'searchable': false,
                        'className': 'dt-body-center manual impuls',
                        'render': function(data, type, full, meta) {
                            return data;

                        },
                    },
                    {
                        'targets': 8,
                        'orderable': false,
                        'searchable': false,
                        'className': 'dt-body-center',
                        'render': function(data, type, full, meta) {
                            const url = data ? './img/wi-fi-green.png' : './img/wi-fi-red.png';
                            return `<img src=${url}>`;

                        },
                    },
                    {
                        'targets': 9,
                        'orderable': false,
                        'searchable': false,
                        'className': 'dt-body-center',
                        'render': function(data, type, full, meta) {
                            return '<div class="group-1"> ' +
                                '<button class="btn btn-primary btn_edit btn-sm" >Редактировать</button> ' +
                                '</div>' +
                                '<div class="group-2" style="display: none">' +
                                '<button class="btn btn-info btn-sm btn_save" style="margin-right: 2px">Сохранить</button>' +
                                '<button class="btn btn-danger btn-sm btn_cancel" >Отменить</button>' +
                                '</div>'
                        },
                    }
                ],
                "columns": [
                    { title: "ID" },
                    { title: "№ абонента" },
                    { title: "Адрес" },
                    { title: "Начальное Значение" },
                    { title: "Вес импульса" },
                    { title: "Показания" },
                    { title: "Ошибка" },
                    { title: "Заряд батареи" },
                    { title: "Связь" },
                    { title: 'Редактировать' }
                ],
                "dom": "<'row top'<'col-md-4'l><'col-md-4 imgbox'<'fltr img-filter'><'clrfltr img-filter'><'report img-filter'>><'col-md-4'f>>t<'clear'><'row'<'col-md-12'p>>",
            });
            // вешаем события Редактирования , Сохранения и Отмены
            main.hundlers.addEventsTable(main.Table.object);


            main.Table.object.on('click', 'td', function() {
                const _this = $(this);
                const tr = main.Table.selected.closestTr(_this);
                // клик по не активной строке и есть открытые окна редактироваания
                if (!main.Table.selected.isSelectedTr(false, tr) && main.Table.hasOpenManual()) {
                    $spop.message.warn('Сначало завершите редактирование выбраного устройства');
                    return;
                }
                // клик по активной строке которая selected
                if (main.Table.selected.isSelectedTr(false, tr)) {
                    $spop.message.warn('Данные устройства отображены');
                    return;
                }
                // Убираем selected  с  предыдушей строки
                main.Table.selected.remove(false, main.Table.selected.findSelected(tr));
                // устанавливаем селект на выбраную строку
                main.Table.selected.set(_this);
                const idDevice = main.Table.getIdDecive(_this);
                main.hundlers.span.setMainSpan(idDevice);
                //clean child total consumption
                main.hundlers.span.cleanSpanText(main.elements.span.dayConsumption.el);
                // получаем данные основного графика
                main.Table.getDataMainChart(idDevice);
            });

        }
    },
    selected: {
        findSelected: function(el) {
            return el.closest('tbody').find('.selected')
        },
        set: function(td, tr) {
            tr ? tr.addClass('selected') : td.closest('tr').addClass('selected')
        },
        remove: function(td, tr) {
            tr ? tr.removeClass('selected') : td.closest('tr').removeClass('selected')
        },
        isSelectedTr: function(td, tr) {
            return tr ? tr.hasClass('selected') : td.hasClass('selected')
        },
        closestTr: function(el) {
            return el.closest('tr');
        }
    },
    getDataMainChart: function(id) {
        chart.Ajax.sendFileToProccess(main.routes.getchartperiod, { 'DeviceId': id }, main.Table.setMainChartData);
    },
    getIdDecive: function(trElem) {
        return trElem.closest('tr').find('td:first').text();
    },
    setMainChartData: function(data) {
        // Обработка данных главного графика
        if (data.IsSuccess) {
            var dataChart = data.ChartPeriod.ChartDates;
            main.data.device = data.ChartPeriod.BelongsToDevice.toString();
            main.data.chartmain = main.hundlers.isetmainChartData(dataChart);
            chart.init.main(main.data.chartmain);

            // first init block - Child
            if (main.data.firstInit) {
                const value = main.data.chartmain[main.data.chartmain.length - 1][1];
                const time = main.data.chartmain[main.data.chartmain.length - 1][0];
                const _moment = moment(time).format('YYYY-MM-DD').split('-');
                const param = {
                    'DeviceId': main.data.device,
                    'Year': _moment[0],
                    'Month': _moment[1],
                    'Day': _moment[2]
                };
                chart.Ajax.sendFileToProccess(main.routes.getchartday, param, chart.hundlers.setChildData);
                main.hundlers.span.setChildSpan(value);

            }

        } else {
            console.log('error get mainChart Data');
            $spop.message.error('Ошибка получения данных главного графика');
        }

    },
    hasOpenManual: function() {
        return $('.manual-input').length > 0;
    },
    manualInst: function(el) {
        return el.hasClass('number') ? [1, el.text()] : el.hasClass('adress') ? [2, el.text()] : el.hasClass('impuls') ? [4, el.text()] : el.hasClass('impstart') ? [3, el.text()] : null;

    },
    inputhtml: function(data) {
        return `<div class="input-group" style="z-index:10">
            <input  type="text" data-prew="${data[1]}"  data-inst =${data[0]} value="${data[1]}" class="form-control manual-input"  aria-label="Recipient's username" aria-describedby="basic-addon2"  onclick="window.event.stopPropagation()">
            <div>`
    },
    getIddecive: function(inp) {
        return inp.closest('tr').find('td:first').text();
    },
    getsetdataRow: function(id, valInst, newvalue) {
        var result;
        main.data.main = main.data.main.map(function(el) {
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
            'ImpWeight': main.demo ? `${result.ImpWeight}`.replace('.', ',') : `${result.ImpWeight}`.replace(',', '.'),
            'ImpStart': main.demo ? `${result.ImpStart}`.replace('.', ',') : `${result.ImpWeight}`.replace(',', '.'),

        }

    },
    setNewDatasResponse: function(data, id) {
        if (data.IsSuccess) {
            main.Table.getUpdateDatadevice(id);

        } else {
            console.log('error save change device');
            $spop.message.error('Ошибка при Сохранении параметров устройства')
        }
    },
    getUpdateDatadevice: function(id) {
        chart.Ajax.sendFileToProccess(main.routes.getdevice, null, main.Table.getUpdateResponse, id);
    },
    getUpdateResponse: function(data, id) {
        if (data.IsSuccess) {
            const base = main.hundlers.convertServerobject(data.Devices);
            // Обновляем данные в активной строке
            const filteredDevice = base.filter(dev => dev.Id == id)[0];
            const tr = main.Table.object.find('tr');
            let _tr;
            $.each(tr, (i, elem) => {
                let td = $(elem).find('td:first')[0];
                td = $(td);
                if (td.text() == id) {
                    _tr = td.closest('tr');
                }
            });
            let elemUpdate = _tr.find('td')[5];
            $(elemUpdate).text(filteredDevice.Indication);
            // Обновляем график лавный график
            main.Table.getDataMainChart(id);

        } else {
            $spop.message.error('Не удалось обновить данные Устройства');
        }
    }
};

$(function() {
    main.init.elements();
    chart.Ajax.sendFileToProccess(main.routes.getdevice, null, main.hundlers.getDataDevice);
    // Инициализация тултипов
    $('[data-toggle="tooltip"]').tooltip();
});