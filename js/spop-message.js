let $spop ={};

$spop.message ={
    success:(text) => {
        spop({
            template: `<h4 class="spop-title">Удачно</h4>${text}`,
            autoclose: 3000,
            style: 'success',
            position:'top-right'
        });
    },
    warn:(text) => {
        spop({
            template: `<h4 class="spop-title">Предупреждение</h4>${text}`,
            autoclose: 3000,
            style: 'warning',
            position:'top-right'
        });
    },
    error:(text) => {
        spop({
            template: `<h4 class="spop-title">Ошибка</h4>${text}`,
            autoclose: 3000,
            style: 'error',
            position:'top-right'
        });
    },
};
