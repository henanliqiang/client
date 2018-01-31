/**
 * 商城订单记录
 * @authors 郭小北 (kubai666@126.com)
 * @date    2016-05-31 17:27:39
 * @version 0.0.1
 */

// 声明vue加载
var vm = new Vue({
    el: '#rescuelist-frm',
    data: {
        BatteryOrder_data: {
            batteryOrderList: [], //商品列表
        },
        moredatatxt:'',
        pageSize: 5,
        pageNo: 1,
        totalPage: 0, //总页数
    },
    methods: {
        //初始化
        init: function() {
            // vm.tabbtnnum = api.pageParam.tabbtnnum;
            vm.pageNo = 1;
            vm.getselectBatteryOrder();
        },
        // 获取订单列表
        getselectBatteryOrder: function(status) {
            apps.axget(
                "rescue/selectRescueList", {
                    pageNo: vm.pageNo,
                    pageSize: vm.pageSize,
                },
                function(data) {
                    if (data.totalPage <= 1 || vm.pageNo == data.totalPage) {
                        vm.moredatatxt = "暂无更多记录";
                    } else {
                        vm.moredatatxt = "上滑获取更多记录";
                    }
                    if (vm.pageNo == 1) {
                        vm.BatteryOrder_data.batteryOrderList = [];
                        data.datas.forEach(function(item) {
                            if (item) {
                                // 预约中的时候-倒计时
                                if (item.state == 0) {

                                }
                                vm.BatteryOrder_data.batteryOrderList.push(item);
                            }
                        });
                        vm.totalPage = data.totalPage; //总页数
                    } else {
                        //如果存在数据并且当前的页面小于等于总页码时push
                        if (data.datas.length && vm.pageNo <= data.totalPage) {
                            data.datas.forEach(function(item) {
                                // 预约中的时候-倒计时
                                if (item.state == 0) {

                                }
                                vm.BatteryOrder_data.batteryOrderList.push(item);
                            });
                        }
                    }
                    vm.pageNo++;
                });
        },
        // 电话
        settelsBtn: function(item) {
            // 拨打电话

                    api.call({
                        type: 'tel_prompt',
                        number: item.cellphone
                    });

        },
        jumpOrderDetails: function(orderId) {
            // 订单详情
            jumpUrl.orderdetails({ orderId: orderId });
        },
    },
});

apiready = function() {
    api.parseTapmode();
    vm.init();
    //下拉刷新
    apps.pageDataF5(function() {
        vm.init();
    });
    //上拉加载
    api.addEventListener({
        name: 'scrolltobottom',
        extra: {
            threshold: 0 //设置距离底部多少距离时触发，默认值为0，数字类型
        }
    }, function(ret, err) {
        if (vm.pageNo <= vm.totalPage) {
            vm.getselectBatteryOrder();
        }
    });

}