/**
 * 我的电池
 * @authors 郭小北 (kubai666@126.com)
 * @date    2016-05-31 17:27:39
 * @version 0.0.1
 */

// 声明vue加载
var vm = new Vue({
    el: '#foregift-frm',
    data: {
        //信息
        ShopAndServicedata: {},
    },
    methods: {
        //初始化
        init: function() {
            vm.getShopAndService();
        },
        getShopAndService: function() {
            apps.axget(
                "renew/batteryInfo", {},
                function(data) {
                    vm.ShopAndServicedata = data;
                });

        },
        // 退押金
        inredeemBtn: function() {
            api.confirm({
                    title: '操作提示',
                    msg: '押金将退还至您的钱包，可在钱包功能中提现。确定要赎回押金？',
                    buttons: ['确定', '取消']
                },
                function(ret, err) {
                    if (ret.buttonIndex == 1) {
                        apps.axpost(
                            "deposit/redeem", {},
                            function(data) {
                                alert("押金已退还至您的钱包");
                                // 刷新我的
                                api.sendEvent({
                                    name: 'loginsucesspst'
                                });

                                api.sendEvent({
                                    name: 'setf5loadEvent'
                                });

                                // 跳转首页
                                api.sendEvent({
                                    name: 'indexinit'
                                });
                                setTimeout(function() {
                                    api.closeToWin({
                                        name: 'root'
                                    });
                                }, 300);
                            });
                    }
                }
            );
        },
        // 续租
        insertRenewBtn: function() {
            // 押金为0 时候 服务停止
            if (vm.ShopAndServicedata.deposit <= 0) {
                alert("押金为0，无可退押金，请重新开通");
                jumpUrl.backbatterysucess();
            } else {
                jumpUrl.battery_isrenew();
            }
        },

    }
});

apiready = function() {
    // 实现沉浸式效果
    $api.fixStatusBar($api.dom("header"));
    //下拉刷新
    apps.pageDataF5(function() {
        vm.init();
    });
    vm.init();
};