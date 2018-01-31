/**
 * 提现
 * @authors 郭小北 (kubai666@126.com)
 * @date    2016-05-31 17:27:39
 * @version 0.0.1
 */

// 声明vue加载
var vm = new Vue({
    el: '#withdrawcash-frm',
    data: {
        balancewallet:{},
        paymode: 0,
        amount: 0,
        accounts: '',
    },
    methods: {
        //初始化
        init: function() {
            vm.getbatterySelect();
        },
        getbatterySelect: function() {
            apps.axget(
                "wallet/balance", {},
                function(data) {
                    vm.balancewallet = data;
                });
        },
        // 支付模式选择
        paymodeBtn: function(paymodeNum) {
            if (paymodeNum == '0') {
                vm.paymode = 0;
            }
            if (paymodeNum == '1') {
                vm.paymode = 1;
            }
        }
    }
});

apiready = function() {
    api.parseTapmode();
    //下拉刷新
    apps.pageDataF5(function() {
        vm.init();
    });
    vm.init();
};


function saveBtn() {
    apps.axpost(
        "wallet/withdrawalsCustomer", {
            //需要提交的参数值
            amount: vm.amount,
            accounts: vm.accounts,
            type: vm.paymode,
        },
        function(data) {
            api.alert({
                title: '操作提醒',
                msg: '提现申请成功，请等待审核',
            }, function(ret, err) {
                api.closeWin();
            });
        });
}