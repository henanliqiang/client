/**
 * 救援店铺详情
 * @authors 郭小北 (kubai666@126.com)
 * @date    2016-05-31 17:27:39
 * @version 0.0.1
 */

// 声明vue加载
var vm = new Vue({
    el: '#rescueshop-frm',
    data: {
        selectShop_data: {

        },
        shopid: '',
        shopdistance: '',
        alladdress: '', //整个地址
        setLocationxy: {}, //当前xy 坐标
        urlstats: '' // 跳转状态变量
    },
    methods: {
        //初始化
        init: function() {
            // vm.setLocationxy = $api.getStorage("setLocationxy");
            vm.shopid = api.pageParam.shopid;
            vm.shopdistance = api.pageParam.shopdistance;
            vm.getselectShop();
        },
        // 获取店铺信息详情
        getselectShop: function() {
            apps.axget(
                "rescue/selectShop", {
                    shopid: vm.shopid,
                },
                function(data) {
                    vm.selectShop_data = data;
                    //拼接整个地址
                    vm.alladdress = vm.selectShop_data.provincename + vm.selectShop_data.cityname + vm.selectShop_data.countyname + vm.selectShop_data.address;
                });
        },
        // 电话
        settelsBtn: function() {

            var hmlss = '' + vm.selectShop_data.name + '(' + vm.selectShop_data.no + ')' +
                ' \n 地址：' + vm.selectShop_data.address + '\n 距离：' + vm.shopdistance + '公里';
            api.actionSheet({
                title: hmlss,
                cancelTitle: '取消',
                // destructiveTitle: '红色警告按钮',
                buttons: [vm.selectShop_data.contactcellphone]
            }, function(ret, err) {
                var index = ret.buttonIndex;
                // 拨打电话
                if (index == 1) {
                    api.call({
                        type: 'tel_prompt',
                        number: vm.selectShop_data.contactcellphone
                    });
                }
            });
        },
        addrescueBtn: function() {
            jumpUrl.addrescue({ selectShop_data: vm.selectShop_data, shopdistance: vm.shopdistance });
        },
        userbmapxyBtn: function() {
            // 订单详情
            jumpUrl.userbmapxy({ x: vm.selectShop_data.x, y: vm.selectShop_data.y });
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