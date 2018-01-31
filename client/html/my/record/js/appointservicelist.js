/**
 * 订单预约记录
 * @authors 郭小北 (kubai666@126.com)
 * @date    2016-05-31 17:27:39
 * @version 0.0.1
 */

// 声明vue加载
var vm = new Vue({
    el: '#record-frm',
    data: {
        BatteryOrder_data: {
            batteryOrderList: [], //商品列表
        },
        chooselectstats: true,
        tabbtnnum: 1,
        moredatatxt: '',
        pageSize: 5,
        pageNo: 1,
        totalPage: 0, //总页数
    },
    methods: {
        //初始化
        init: function() {
            // 增配訂單
            vm.getselectBatteryOrder(1);
            vm.pageNo = 1;
            // tab效果
            var tab = new auiTab({
                element: document.getElementById("tab"),
            }, function(ret) {
                vm.pageNo = 1;
                // console.log(JSON.stringify(ret));
                if (ret.index == 1) {
                    vm.tabbtnnum = 1;
                    // 增配訂單
                }
                if (ret.index == 2) {
                    vm.tabbtnnum = 0;
                    // 简配訂單
                }
                if (ret.index == 3) {
                    vm.tabbtnnum = 2;

                    // 简配訂單
                }
                vm.getselectBatteryOrder(vm.tabbtnnum);
            });
        },
        // 获取店铺信息详情
        getselectBatteryOrder: function(type) {
            apps.axget(
                "batteryService/selectServicePage", {
                    type: type,
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
                                    var afterMinTimes = kiDateendtime(item.endtime);
                                    item.afterMinTimes = afterMinTimes;
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
                                    var afterMinTimes = kiDateendtime(item.endtime)
                                    item.afterMinTimes = afterMinTimes;
                                }
                                vm.BatteryOrder_data.batteryOrderList.push(item);
                            });
                        }
                    }
                    vm.pageNo++;
                });
        },
        jumpAppointinfo: function(appointid) {
            // 跑去订单详情
            jumpUrl.appointinfo({ appointid: appointid });
        }
    },
});

apiready = function() {
    api.parseTapmode();
    vm.init();
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
// 倒计时时差
function kiDateendtime(endtime) {
    var afterMinTimes = '0分0s过期';
    // 倒计时时差
    var EndTime = new Date(endtime.replace(/\-/g, "/")); //截止时间 前端路上 http://www.51xuediannao.com/qd63/
    var NowTime = new Date();
    var t = EndTime.getTime() - NowTime.getTime();

    var day = Math.floor(t / 1000 / 60 / 60 / 24);
    var hour = Math.floor(t / 1000 / 60 / 60 % 24);
    var min = Math.floor(t / 1000 / 60 % 60);
    var s = Math.floor(t / 1000 % 60);
    var afterMinTimes = day + '天' + hour + '小时' + min + '分' + s + '秒'
    if (t <= 0) {
        vm.MinTimesover = true;
    }
    return afterMinTimes;
}