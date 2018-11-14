let $spop ={};

// TODO не более одного инфо окна
$spop.spopSingelton = function () {
    return   $('.spop-container').find('.spop').length === 0;
};

$spop.message ={
    success:(text) => {
        if(!$spop.spopSingelton()) return;
        spop({
            template: `<h4 class="spop-title">Удачно</h4>${text}`,
            autoclose: 3000,
            style: 'success',
            position:'top-right'
        });
    },
    warn:(text) => {
        if(!$spop.spopSingelton()) return;
        spop({
            template: `<h4 class="spop-title">Предупреждение</h4>${text}`,
            autoclose: 3000,
            style: 'warning',
            position:'top-right'
        });
    },
    error:(text) => {
        if(!$spop.spopSingelton()) return;
        spop({
            template: `<h4 class="spop-title">Ошибка</h4>${text}`,
            autoclose: 3000,
            style: 'error',
            position:'top-right'
        });
    },

};
