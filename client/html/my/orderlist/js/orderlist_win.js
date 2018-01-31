/**
 * 商城订单记录
 * @authors 郭小北 (kubai666@126.com)
 * @date    2016-05-31 17:27:39
 * @version 0.0.1
 */

// 声明vue加载
var vm = new Vue({
    el: '#myorderlist-frm',
    data: {
        BatteryOrder_data: {
            batteryOrderList: [], //商品列表
        },
        chooselectstats: true,
        tabbtnnum: '',
        tabbtnnumjx: '',
        moredatatxt: '',
        pageSize: 5,
        pageNo: 1,
        totalPage: 0, //总页数
    },
    methods: {
        //初始化
        init: function() {
            vm.tabbtnnumjx = api.pageParam.tabbtnnumjx;
            // 訂單全部
            vm.getselectBatteryOrder(vm.tabbtnnumjx);
            vm.tabonnfun();

        },
        tabonnfun:function(){
            vm.pageNo = 1;
            // tab效果
            var tab = new auiTab({
                element: document.getElementById("tab"),
            }, function(ret) {
                vm.pageNo = 1;
                // console.log(JSON.stringify(ret));
                // 订单状态 0：待发货；1：已发货 2：已完成 3:待付款
                if (ret.index == 1) {
                    vm.tabbtnnum = '';
                }
                // 代付款
                if (ret.index == 2) {
                    vm.tabbtnnum = 3;
                }
                if (ret.index == 3) {
                    vm.tabbtnnum = 0;
                }
                if (ret.index == 4) {
                    vm.tabbtnnum = 1;
                }
                if (ret.index == 5) {
                    vm.tabbtnnum = 2;
                }
                vm.getselectBatteryOrder(vm.tabbtnnum);
            });
        },
        // 获取订单列表
        getselectBatteryOrder: function(status) {
            apps.axget(
                "customerOrder/selectOrder", {
                    status: status,
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
        jumpOrderDetails: function(orderId) {
            // 订单详情
            jumpUrl.orderdetails({ orderId: orderId });
        },
        // 物流信息弹出
        logisticsBtn: function(item) {
            var hmlss = item.logistics + ' \n ' + item.dispatchname;
            api.actionSheet({
                title: hmlss,
                cancelTitle: '取消',
                // destructiveTitle: '红色警告按钮',
                buttons: [item.dispatchphone]
            }, function(ret, err) {
                var index = ret.buttonIndex;
                // 拨打电话
                if (index == 1) {
                    api.call({
                        type: 'tel_prompt',
                        number: item.dispatchphone
                    });
                }
            });
        },
        // 取消订单
        deleteorderBrn: function(orderId) {
            api.confirm({
                    title: '操作提示',
                    msg: '确定要取消当前订单',
                    buttons: ['确定', '取消']
                },
                function(ret, err) {
                    if (ret.buttonIndex == 1) {
                        // 退出系统...
                        apps.axpost(
                            "customerOrder/delete", { //需要提交的参数值
                                orderId: orderId
                            },
                            function(data) {
                                api.toast({
                                    msg: "取消成功",
                                    duration: 1000,
                                    location: 'middle'
                                });
                                vm.init();
                            });
                    }
                });
        },
    },
});

apiready = function() {
    api.parseTapmode();
    vm.init();
    //下拉刷新
    /*apps.pageDataF5(function() {
        vm.init();
    });*/
    //上拉加载
    api.addEventListener({
        name: 'scrolltobottom',
        extra: {
            threshold: 0 //设置距离底部多少距离时触发，默认值为0，数字类型
        }
    }, function(ret, err) {
        if (vm.pageNo <= vm.totalPage) {
            vm.getselectBatteryOrder(vm.tabbtnnum);
        }
    });

}