/**
 * 我的电池
 * @authors 郭小北 (kubai666@126.com)
 * @date    2016-05-31 17:27:39
 * @version 0.0.1
 */

// 声明vue加载
var vm = new Vue({
    el: '#mybatteries-frm',
    data: {
        //信息
        ShopAndServicedata: {},
    },
    methods: {
        //初始化
        init: function() {
            vm.ShopAndServicedata = api.pageParam.ShopAndServicedata;
        },
        // 续租
        insertRenewBtn: function() {
            jumpUrl.battery_isrenew();
        },
        // 退租
        insrentBtn: function() {
            api.confirm({
                    title: '操作提示',
                    msg: '退租需预约一个门店完成电池退还。退还后，押金可提现。确定要退租？',
                    buttons: ['确定', '取消']
                },
                function(ret, err) {
                    if (ret.buttonIndex == 1) {
                         jumpUrl.battery_isrent();
                    }
                }
            );
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