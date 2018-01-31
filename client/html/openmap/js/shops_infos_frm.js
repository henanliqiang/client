/**
 * 地图店铺详情
 * @authors 郭小北 (kubai666@126.com)
 * @date    2016-05-31 17:27:39
 * @version 0.0.1
 */

// 声明vue加载
var vm = new Vue({
    el: '#shopsinfo-frm',
    data: {
        tianniu_userSetdata: {},
        selectShopInfo: {
            shopsAddress: '店铺地址'
        },
        // 默认底层布局
        mrdivbox_stats: true,
        shopid: '',
        UILoadId: '',
        // map地图数据
        setBmap: {
            // 默认定位
            lon: 116.4021310000,
            lat: 39.9994480000
        },
        setLocationxy: {}, //当前xy 坐标
        shodata: {
            "data": {
                "comprofile": "",
                "no": "A573697",
                "img": [
                    { "id": 21, "url": "http://qianniu-test.oss-cn-shanghai.aliyuncs.com/uploads/1509699558281/IMG_0058.JPG" },
                    { "id": 22, "url": "http://qianniu-test.oss-cn-shanghai.aliyuncs.com/uploads/1509699558281/IMG_0052.JPG" },
                    { "id": 23, "url": "http://qianniu-test.oss-cn-shanghai.aliyuncs.com/uploads/1509699558281/IMG_0006.PNG" },
                    { "id": 24, "url": "http://qianniu-test.oss-cn-shanghai.aliyuncs.com/uploads/1509699558281/IMG_0008.JPG" }
                ],
                "score": 0,
                "photo": "http://qianniu-test.oss-cn-shanghai.aliyuncs.com/uploads/1509697047883/C29C2AB9-F948-4D85-B221-1D9C5A3ADBB7-332-000001709E60BFAF.jpg",
                "isActive": 0,
                "shopid": 1,
                "provincename": "河南省",
                "countyname": "管城回族区",
                "contactcellphone": "13526705079",
                "address": "航海路美景小区楼下",
                "battery": [
                    { "id": 1, "distrinum": 1, "name": "6020锂电", "fullpowernum": 1, "stocknum": 1, "mode": "6020" },
                    { "id": 2, "distrinum": 1, "name": "7020锂电", "fullpowernum": 1, "stocknum": 1, "mode": "7020" },
                    { "id": 3, "distrinum": 2, "name": "6020锂电", "fullpowernum": 2, "stocknum": 2, "mode": "6020" },
                    { "id": 4, "distrinum": 2, "name": "7020锂电", "fullpowernum": 2, "stocknum": 2, "mode": "7020" }
                ],
                "name": "小伙伴电池",
                "cityname": "郑州市",
                "y": "34.724314",
                "x": "113.749292"
            }
        }
    },
    methods: {
        //初始化
        init: function() {
            vm.setLocationxy = $api.getStorage("setLocationxy");
            if (vm.shopid != '') {
                vm.getselectShop();
            }
        },
        // 获取店铺信息详情
        getselectShop: function() {
            // 加载框
            var UILoading = api.require('UILoading');
            UILoading.flower({
                center: {
                    x: (api.winWidth / 2),
                    y: (api.winHeight / 2),
                },
                size: 30,
                fixedOn: 'mapshops_infos_frm',
                fixed: true
            }, function(ret) {
                vm.UILoadId = ret.id;
            });
            /*var loadingLabel = api.require('loadingLabel');
            loadingLabel.open({
                centerX: (api.winWidth / 2),
                centerY: (api.winHeight / 2),
                x: 200,
                y: 200
            }, function(ret, err) {
                if (ret) {
                    vm.UILoadId = ret.id;
                }
            });*/
            vm.mrdivbox_stats = true;
            apps.axget(
                "bespeak/selectShop", {
                    shopid: vm.shopid
                },
                function(data) {
                    if (data) {
                        // 关闭打开的加载提示框
                        UILoading.closeFlower({
                            id: vm.UILoadId
                        });
                        /*loadingLabel.close({
                            id: vm.UILoadId
                        });*/
                        vm.mrdivbox_stats = false;
                        vm.selectShopInfo = data;
                        vm.selectShopInfo.shopsAddress = data.provincename + '' + data.cityname + '' + data.countyname + '' + data.address;
                    }
                });
        },
        //客服热线
        callus: function(telnumber) {
            api.call({
                type: 'tel_prompt',
                number: telnumber
            });
        },
        close_shopInfo: function() {
            api.setFrameAttr({
                name: 'mapshops_infos_frm',
                hidden: true
            });
        },
        // 安装电池预约
        battery_bespeakBtn: function(batteryIsstats) {
            vm.close_shopInfo();

            // 安装预约
            if (batteryIsstats == 'isinstall1') {
                jumpUrl.battery_isinstall({
                    shopid: vm.shopid,
                    batteryIsstats: batteryIsstats,
                });
            }
            // 换电预约
            if (batteryIsstats == 'isreplace1') {
                jumpUrl.battery_isreplace({
                    shopid: vm.shopid,
                    batteryIsstats: batteryIsstats,
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
                    //title: vm.selectShopInfo.name, // 描述信息
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
                        lon: vm.selectShopInfo.x, // 经度.
                        lat: vm.selectShopInfo.y // 纬度.
                    },
                    title: vm.selectShopInfo.name, // 描述信息
                    address: vm.selectShopInfo.shopsAddress // 地址信息，与position配合为空
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
    },
});

apiready = function() {
    api.parseTapmode();
    vm.shopid = api.pageParam.shopid; // 店铺id
    vm.init();
    // 接受重新加载监听
    api.addEventListener({
        name: 'setshopmapInfoEvent'
    }, function(ret, err) {
        vm.shopid = ret.value.shopid; // 店铺id
        if (vm.shopid) {
            vm.init();
        }
    });
}