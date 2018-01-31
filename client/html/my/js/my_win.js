/**
 * 我的中心
 * @authors 郭小北 (kubai666@126.com)
 * @date    2016-05-31 17:27:39
 * @version 0.0.1
 */

// 声明vue加载
var vm = new Vue({
    el: '#mywin-frm',
    data: {
        shopUserInfodata: {},
        balancewallet: {},
        balanceintegral: {},
        // 预约信息
        ShopAndServicedata: {},
        mybattrytxt: '正在使用',
        batteryjson: {},
    },
    methods: {
        //初始化
        init: function() {
            vm.getshopUserInfo();
            vm.getShopAndService();
        },
        //获取
        getshopUserInfo: function() {
            // 天牛币
            apps.axget(
                "integral/balance", {},
                function(data) {
                    vm.balanceintegral = data;
                });
            apps.axget(
                "wallet/balance", {},
                function(data) {
                    vm.balancewallet = data;
                });
            // 用户信息
            apps.axget(
                "customer/selectInfo", {},
                function(data) {
                    vm.shopUserInfodata = data;
                });
        },
        // 获取预约等信息
        getShopAndService: function() {
            apps.axget(
                "renew/batteryInfo", {},
                function(data) {
                    vm.ShopAndServicedata = data;
                    vm.batteryjson.name = vm.ShopAndServicedata.batteryname;
                    vm.batteryjson.groupnum = vm.ShopAndServicedata.groupnum;
                    // 是否交了押金
                    // isdeposit:"是否已缴纳押金 0：否 1：是",
                    // isinstall:"是否可安装电池 0：否 1：是",
                    // isabnormal:"电池是否损坏 0：否 1：是 "
                    if (vm.ShopAndServicedata.isdeposit === 0 && vm.ShopAndServicedata.isabnormal === 0) {
                        // 没押金 强制跳转押金页面
                        vm.mybattrytxt = '请缴纳押金';
                    }
                    if (vm.ShopAndServicedata.isdeposit === 1) {
                        // 电池状态（已支付押金，未完成安装时）
                        if (vm.ShopAndServicedata.isinstall === 1) {
                            vm.mybattrytxt = '请预约安装电池';
                        } else {
                            // 损坏
                            if (vm.ShopAndServicedata.isabnormal === 1) {
                                vm.mybattrytxt = '电池已损坏';
                            } else {
                                vm.mybattrytxt = '正在使用';
                                // 逾期
                                if (vm.ShopAndServicedata.isoverdue === 1) {
                                    vm.mybattrytxt = '已逾期';
                                }
                            }
                        }
                    }
                });

        },
        getmybatteryBtn: function() {
            // 是否交了押金
            // isdeposit:"是否已缴纳押金 0：否 1：是",
            // isinstall:"是否可安装电池 0：否 1：是",
            // isabnormal:"电池是否损坏 0：否 1：是 "
            if (vm.ShopAndServicedata.isdeposit === 0 && vm.ShopAndServicedata.isabnormal === 0) {
                // 没押金 强制跳转押金页面
                jumpUrl.welcome_nobatteries();
            }
            if (vm.ShopAndServicedata.isdeposit === 1) {
                // 电池状态（已支付押金，未完成安装时）
                if (vm.ShopAndServicedata.isinstall === 1) {
                    jumpUrl.welcome_havebatteries({ batteryjson: vm.batteryjson });
                } else {
                    // 损坏
                    if (vm.ShopAndServicedata.isabnormal === 1) {
                        vm.mybattrytxt = '电池已损坏';
                    } else {
                        // 预约完成 使用中- 可以退租
                        jumpUrl.mybatteries({ ShopAndServicedata: vm.ShopAndServicedata });
                    }
                }
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

    api.addEventListener({
        name: 'loginsucesspst'
    }, function(ret) {
        vm.init();
    });
};