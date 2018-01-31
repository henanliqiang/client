/**
 * 租期记录
 * @authors 郭小北 (kubai666@126.com)
 * @date    2016-05-31 17:27:39
 * @version 0.0.1
 */

// 声明vue加载
var vm = new Vue({
    el: '#leaseterm-frm',
    data: {
        leaseTerm_data: {},
    },
    methods: {
        //初始化
        init: function() {
            vm.getselectBatteryOrder();
        },
        // 获取店铺信息详情
        getselectBatteryOrder: function() {
            apps.axget(
                "renew/leaseTerm", {},
                function(data) {
                    vm.leaseTerm_data = data;
                });
        },
        // 续租
        insertRenewBtn: function() {
            jumpUrl.battery_isrenew();
        },
    },
});

apiready = function() {
    api.parseTapmode();
    //下拉刷新
    apps.pageDataF5(function() {
        vm.init();
    });
    vm.init();

}