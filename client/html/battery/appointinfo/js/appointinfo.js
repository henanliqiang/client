/**
 * 电池预约详情
 * @authors 郭小北 (kubai666@126.com)
 * @date    2016-05-31 17:27:39
 * @version 0.0.1
 */

// 声明vue加载
var vm = new Vue({
    el: '#appointinfo-frm',
    data: {
        selectAppointInfo: {},
        // 预约id
        appointid: '',
        sysDate: '',
        hintscore: '0',
        setLocationxy: {}, //当前xy 坐标
        shopsAddress: '',
        afterMinTimes: ' 0天 0 小时 0 分 0 秒后过期',
        MinTimesover: false,
    },
    methods: {
        //初始化
        init: function() {
            vm.appointid = api.pageParam.appointid;
            vm.sysDate = api.pageParam.sysDate;
            vm.setLocationxy = $api.getStorage("setLocationxy");

            setInterval(kiDateendtime, 1000);
            // 刷新地图状态
            api.sendEvent({
                name: 'setf5loadEvent'
            });
            if (vm.appointid != '') {
                vm.getShopApponit();
            } else {
                api.toast({
                    msg: '预约信息为空',
                    duration: 2000,
                    location: 'middle'
                });
            }
        },
        // 获取店铺信息详情
        getShopApponit: function() {
            // 加载框
            var UILoading = api.require('UILoading');
            UILoading.flower({
                center: {
                    x: (api.winWidth / 2),
                    y: (api.winHeight / 2)
                },
                size: 30,
                fixed: true
            }, function(ret) {
                vm.UILoadId = ret.id;
            });
            apps.axget(
                "batteryService/selectServiceInfo", {
                    id: vm.appointid
                },
                function(data) {
                    if (data) {
                        // 关闭打开的加载提示框
                        UILoading.closeFlower({
                            id: vm.UILoadId
                        });
                        vm.selectAppointInfo = data;
                        vm.shopsAddress = vm.selectAppointInfo.provincename + '' + vm.selectAppointInfo.cityname + '' + vm.selectAppointInfo.countyname + '' + vm.selectAppointInfo.address;
                        // 预约中再生成二维码
                        if (vm.selectAppointInfo.state == 0) {
                            vm.makeCodeqrcode();
                        }
                    }
                });
        },
        // 生成二维码程序
        makeCodeqrcode: function() {
            $('#qrcode').html('');
            // 生成二维码程序
            var qrcode = new QRCode(document.getElementById("qrcode"), {
                width: 100, //设置宽高
                height: 100
            });
            var identcode = vm.selectAppointInfo.identcode; //二维码内容
            qrcode.makeCode(identcode);

            // 生成大图二维码
            var qrcodeBig = new QRCode(document.getElementById("qrcodeBig"), {
                width: 300, //设置宽高
                height: 300
            });
            var identcode = vm.selectAppointInfo.identcode; //二维码内容
            qrcodeBig.makeCode(identcode);
        },
        qrcodebigImg: function() {
            // 二维码大图
            apps.openMapWinUrl('openqrcode_img', 'battery/appointinfo/openqrcode_img.html', { qrcodebigImg: $('#qrcodeBig').html() });
        },
        // 评分
        hintscoreBtn: function() {

            if (vm.hintscore <= 0) {
                alert('请您正确评分，最低1分');
                return false;
            }
            apps.axpost(
                "batteryService/evaluate", {
                    id: vm.appointid,
                    score: vm.hintscore,
                },
                function(data) {
                    alert('评分成功');
                });
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
                    //title: vm.selectAppointInfo.name, // 描述信息
                    //address: vm.selectShopInfo.shopsAddress // 地址信息，与position配合为空
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
                        lon: vm.selectAppointInfo.x, // 经度.
                        lat: vm.selectAppointInfo.y // 纬度.
                    },
                    title: vm.selectAppointInfo.name, // 描述信息
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
        // 安装电池预约
        battery_bespeakBtn: function() {
            // 安装重新预约
            if (vm.selectAppointInfo.type == 0) {
                jumpUrl.battery_isinstall({
                    shopid: vm.selectAppointInfo.shopid,
                    appointid: vm.appointid,
                });
            }
            // 更换重新预约
            if (vm.selectAppointInfo.type == 1) {
                jumpUrl.battery_isreplace({
                    shopid: vm.selectAppointInfo.shopid,
                    appointid: vm.appointid,
                });
            }
            // 退租重新预约
            if (vm.selectAppointInfo.type == 2) {
                jumpUrl.battery_isrent({
                    shopid: vm.selectAppointInfo.shopid,
                    appointid: vm.appointid,
                });
            }

        },
        // 取消预约
        undoService: function() {
            api.confirm({
                title: '撤消当前订单？',
                msg: '撤消后需重新提交预约；已付租金会退还至钱包，供下次预约使用；',
                buttons: ['确定', '取消']
            }, function(ret, err) {
                var index = ret.buttonIndex;
                if (index == 1) {
                    apps.axpost(
                        "batteryService/undoService", {
                            id: vm.appointid
                        },
                        function(data) {
                            api.toast({
                                msg: '撤销预约成功',
                                location: 'middle'
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
            });

        }
    },
});

apiready = function() {
    api.parseTapmode();
    // 评分
    setTimeout(function() {
        $.fn.raty.defaults.path = 'images';
        $('#half-demo').raty({
            half: true,
            targetType: 'number',
            numberMax: 5,
            number: 10,
            hints: ['2', '4', '6', '8', '10'],
            click: function(score, evt) {
                vm.hintscore = Number(score) * 2;
            }
        });
    }, 1500)

    //下拉刷新
    apps.pageDataF5(function() {
        vm.init();
    });
    vm.init();

}
// 倒计时时差
function kiDateendtime() {
    // 倒计时时差
    var EndTime = new Date(vm.selectAppointInfo.endtime.replace(/\-/g, "/")); //截止时间 前端路上
    var NowTime = new Date();
    var t = EndTime.getTime() - NowTime.getTime();


    var day = Math.floor(t / 1000 / 60 / 60 / 24);
    var hour = Math.floor(t / 1000 / 60 / 60 % 24);
    var min = Math.floor(t / 1000 / 60 % 60);
    var s = Math.floor(t / 1000 % 60);
    vm.afterMinTimes = day + ' 天' + hour + ' 小时' + min + ' 分' + s + ' 秒'
    if (t <= 0) {
        vm.MinTimesover = true;
    }
}