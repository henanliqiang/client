/**
 * 电池预约信息状态
 * @authors 郭小北 (kubai666@126.com)
 * @date    2016-05-31 17:27:39
 * @version 0.0.1
 */

// 声明vue加载
var vm = new Vue({
    el: '#appointinfo-frm',
    data: {
        // map地图数据
        setBmap: {
            // 默认定位
            lon: 116.4021310000,
            lat: 39.9994480000
        },
        ShopAndServicedata: {},
        setLocationxy: {}, //当前xy 坐标
        shopsAddress: '',
        afterMinTimes: '0分0s过期',
        MinTimesover: false,
    },
    methods: {
        //初始化
        init: function() {
            // vm.ShopAndServicedata = $api.getStorage("ShopAndServicedata");
            vm.ShopAndServicedata = api.pageParam.ShopAndServicedata;
            vm.setLocationxy = $api.getStorage("setLocationxy");
            vm.getShopAndService();
        },
        // 获取预约信息
        getShopAndService: function() {
            // alert(JSON.stringify(vm.ShopAndServicedata));
            if (vm.ShopAndServicedata.bespeak) {
                // 如果有预约记录信息
                var bespeakinfo = vm.ShopAndServicedata.bespeak;
                vm.shopsAddress = bespeakinfo.provincename + '' + bespeakinfo.cityname + '' + bespeakinfo.countyname + '' + bespeakinfo.address;
                setInterval(kiDateendtime, 1000);

                api.setFrameAttr({
                    name: 'bmap_appointinfo_frm',
                    hidden: false
                });
            } else {
                // 无预约状态栏隐藏
                api.setFrameAttr({
                    name: 'bmap_appointinfo_frm',
                    hidden: true
                });
            }
        },
        // 导航到店
        waymap_NavigationBtn: function() {
            api.toast({
                msg: '正在调取导航功能，请稍候',
                duration: 2000,
                location: 'middle'
            });
            var baiduNavigation = api.require('baiduNavigation');
            baiduNavigation.start({
                start: { // 起点信息.
                    position: { // 经纬度，与address配合可为空
                        lon: vm.setLocationxy.x, // 经度.
                        lat: vm.setLocationxy.y // 纬度.
                    },
                    //title: vm.ShopAndServicedata.name, // 描述信息
                    //address: vm.ShopAndServicedata.shopsAddress // 地址信息，与position配合为空
                },
                /*goBy: [{ // 途经点位置信息.
                    position: { // 经纬度，与address配合可为空
                        lon: 109.77539000000002, // 经度
                        lat: 33.43144 // 纬度.
                    },
                    title: "释源", // 描述信息
                    address: "白马寺" // 地址信息，与position配合为空
                }],*/
                end: { // 终点信息.
                    position: { // 经纬度，与address配合可为空
                        lon: vm.ShopAndServicedata.bespeak.x, // 经度.
                        lat: vm.ShopAndServicedata.bespeak.y // 纬度.
                    },
                    title: vm.ShopAndServicedata.bespeak.name, // 描述信息
                    address: vm.shopsAddress // 地址信息，与position配合为空
                }
            }, function(ret, err) {
                if (ret.status) {
                    api.alert({
                        title: "提示",
                        msg: '导航成功'
                    });
                } else {
                    var msg = "未知错误";
                    if (1 == err.code) {
                        msg = "获取地理位置失败";
                    }
                    if (2 == err.code) {
                        msg = "定位服务未开启";
                    }
                    if (3 == err.code) {
                        msg = "线路取消";
                    }
                    if (4 == err.code) {
                        msg = "退出导航";
                    }
                    if (5 == err.code) {
                        msg = "退出导航声明页面";
                    }
                    api.alert({
                        title: "导航提示",
                        msg: msg
                    });
                }
            });

        },
        jumpAppointinfo: function() {
            // 跑去订单详情
            jumpUrl.appointinfo({ appointid: vm.ShopAndServicedata.bespeak.id, sysDate: vm.ShopAndServicedata.sysDate });
        }
    },
});

apiready = function() {
    api.parseTapmode();
    vm.init();
    // 接受重新加载监听
    api.addEventListener({
        name: 'setf5loadEvent'
    }, function(ret, err) {
        vm.init();
    });
}
// 倒计时时差
function kiDateendtime() {
    // 倒计时时差
    var EndTime = new Date(vm.ShopAndServicedata.bespeak.endtime.replace(/\-/g, "/")); //截止时间 前端路上 http://www.51xuediannao.com/qd63/
    var NowTime = new Date();
    var t = EndTime.getTime() - NowTime.getTime();

    var day = Math.floor(t / 1000 / 60 / 60 / 24);
    var hour = Math.floor(t / 1000 / 60 / 60 % 24);
    var min = Math.floor(t / 1000 / 60 % 60);
    var s = Math.floor(t / 1000 % 60);
    vm.afterMinTimes = day + '天' + hour + '小时' + min + '分' + s + '秒'
    if (t <= 0) {
        vm.MinTimesover = true;
    }
}