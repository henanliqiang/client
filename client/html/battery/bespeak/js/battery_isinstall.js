/**
 * 电池预约详情
 * @authors 郭小北 (kubai666@126.com)
 * @date    2016-05-31 17:27:39
 * @version 0.0.1
 */

// 声明vue加载
var vm = new Vue({
    el: '#bespeak-form',
    data: {
        selectAppointInfo: {},
        shopid: '',
        appointid: '',
        batteryIsstats: 'isinstall1',
        paymode: 0,
        usealipay: false,
        usewxpay: false,
        // 加减号
        goodsCount: 1,
        costprice: 0, //cost租金
        // 选择租期
        batteryrenttime: {
            // 显示加减号 日租
            rentimeId: 3, //默认值选中
            dayrentStas: true,
            // 默认租金
            rentMoney: 0,
            renttimeArr: [{
                    id: 3,
                    name: '日租',
                },
                {
                    id: 0,
                    name: '月租'
                },
                {
                    id: 1,
                    name: '季租'
                },
                {
                    id: 2,
                    name: '年租'
                },
            ]
        },

        // 几小时到店
        timerange: 1,
    },
    methods: {
        //初始化
        init: function() {
            vm.shopid = api.pageParam.shopid;
            vm.appointid = api.pageParam.appointid;
            if (vm.shopid != '') {
                vm.getselectShop();
            }
        },
        // 获取店铺信息详情
        getselectShop: function() {
            apps.axget(
                "batteryService/selectAppointInfo", {
                    shopid: vm.shopid
                },
                function(data) {
                    if (data) {
                        vm.selectAppointInfo = data;
                        vm.selectAppointInfo.shopsAddress = data.provincename + '' + data.cityname + '' + data.countyname + '' + data.address;
                        // 默认日租金
                        vm.batteryrenttime.rentMoney = vm.selectAppointInfo.dayrent;
                        vm.costprice = vm.batteryrenttime.rentMoney * vm.goodsCount;

                    }
                });
        },
        // 加减选择
        change_goods_num: function(num, index) {
            // var goodsCount = vm.goodsCount;
            if (num == 1) {
                vm.goodsCount++;
            } else {
                if (vm.goodsCount <= 1) {
                    vm.goodsCount = 1;
                    api.toast({
                        msg: '订购数量最低为 1',
                        location: 'middle'
                    });
                    return false;
                }
                vm.goodsCount--;
            }

        },
        // 电池租金属性
        mrdBattery: function(item) {
            vm.batteryrenttime.rentimeId = item.id;

            vm.batteryrenttime.dayrentStas = false;
            //日租金
            if (vm.batteryrenttime.rentimeId == 3) {
                vm.batteryrenttime.dayrentStas = true;
                vm.batteryrenttime.rentMoney = vm.selectAppointInfo.dayrent;
                vm.costprice = vm.batteryrenttime.rentMoney * vm.goodsCount;
            }
            if (vm.batteryrenttime.rentimeId == 0) {
                vm.costprice = vm.selectAppointInfo.monthrent;
            }
            if (vm.batteryrenttime.rentimeId == 1) {
                vm.costprice = vm.selectAppointInfo.quarterrent;
            }
            if (vm.batteryrenttime.rentimeId == 2) {
                vm.costprice = vm.selectAppointInfo.annualrent;
            }
        },
        // 租期选择
        chooserentBtn: function(index) {
            var item = vm.batteryrenttime.renttimeArr[index];
            vm.mrdBattery(item);
        },
        // 安装时间选择
        bespeakTimeBtn: function(index) {
            var item = vm.selectAppointInfo.bespeakTime[index];
            vm.timerange = item.time;
        },
        // 支付模式选择
        paymodeBtn: function(paymodeNum) {
            if (paymodeNum == '0') {
                vm.paymode = 0;
                vm.usealipay = true;
                vm.usewxpay = false;
            }
            if (paymodeNum == '1') {
                vm.paymode = 1;
                vm.usewxpay = true;
                vm.usealipay = false;
            }
            if (paymodeNum == '2') {
                vm.paymode = 2;
            }
        },
        //调用支付宝客户端支付
        aliPayfun: function() {
            var aliPayPlus = api.require('aliPayPlus');
            aliPayPlus.payOrder({
                orderInfo: vm.requestalipay
            }, function(ret, err) {
                if (ret) {
                    switch (ret.code) {
                        // code为 1 说明返回成功
                        case '9000':
                            alert("支付成功");
                            //发送从新加载地图的监听
                            api.sendEvent({
                                name: 'setf5loadEvent'
                            });
                            //支付成功跳转到 提示页面
                            jumpUrl.battesucess({ batteryIsstats: 'isinstall1' });
                            break;
                        case '4000':
                            api.toast({
                                msg: '系统异常',
                                location: 'middle'
                            });
                            break;
                        case '4006':
                            api.toast({
                                msg: '订单支付失败',
                                location: 'middle'
                            });
                            break;
                        case '6000':
                            api.toast({
                                msg: '支付服务正在进行升级操作',
                                location: 'middle'
                            });
                            break;
                        case '6001':
                            api.toast({
                                msg: '用户中途取消支付操作',
                                location: 'middle'
                            });
                            break;
                        case '0001':
                            api.toast({
                                msg: '缺少商户配置信息（商户id，支付公钥，支付密钥）',
                                location: 'middle'
                            });
                            break;
                        case '0002':
                            api.toast({
                                msg: '缺少参数（subject、body、amount、tradeNO）',
                                location: 'middle'
                            });
                            break;
                        case '0003':
                            api.toast({
                                msg: '签名错误（公钥私钥错误）',
                                location: 'middle'
                            });
                            break;
                        default:
                            alert(ret.code);
                            api.toast({
                                msg: '收款方支付宝账户状态异常',
                                location: 'middle'
                            });
                            break;
                    }
                } else {
                    alert('收款方账户状态异常');
                }
            });
        },
        //调用微信客户端支付
        wxpayfun: function() {
            var wxPay = api.require('wxPay');
            wxPay.payOrder({
                apiKey: vm.requestalipay.appid,
                orderId: vm.requestalipay.prepayid,
                mchId: vm.requestalipay.partnerid,
                nonceStr: vm.requestalipay.noncestr,
                timeStamp: vm.requestalipay.timestamp,
                package: vm.requestalipay.package,
                sign: vm.requestalipay.sign
            }, function(ret, err) {
                //支付成功
                if (ret.status) {
                    //支付成功
                    alert("支付成功");
                    //发送从新加载地图的监听
                    api.sendEvent({
                        name: 'setf5loadEvent'
                    });
                    //支付成功跳转到 提示页面
                    jumpUrl.battesucess({ batteryIsstats: 'isinstall1' });
                } else {
                    // code: 1
                    //错误码：
                    //-2（用户取消，发生场景：用户不支付了，点击取消，返回APP）
                    //-1（未知错误，可能的原因：签名错误、未注册APPID、项目设置APPID不正确、注册的APPID与设置的不匹配、其他异常等）
                    //1 (apiKey值非法)
                    // alert(err.code);
                    switch (err.code) {
                        case -1:
                            api.toast({
                                msg: '系统异常或者未知错误，请联系管理员',
                                location: 'middle'
                            });
                            break;
                        case -2:
                            api.toast({
                                msg: '用户中途取消支付操作',
                                location: 'middle'
                            });
                            break;
                        default:
                            api.toast({
                                msg: '收款方账户状态异常',
                                location: 'middle'
                            });
                            break;
                    }
                }
            });
        },
        close_shopInfo: function() {
            api.setFrameAttr({
                name: 'mapshops_infos_frm',
                hidden: true
            });
        },
    },
});

//计算成本价
vm.$watch('goodsCount', function() {
    // 计算日租金
    vm.costprice = vm.batteryrenttime.rentMoney * vm.goodsCount;
    // console.log(JSON.stringify(vm.battery));
}, { deep: true });

apiready = function() {
    api.parseTapmode();
    //下拉刷新
    /*apps.pageDataF5(function() {
        vm.init();
    });*/
    vm.init();
}

function saveBtn() {
    apps.axpost(
        "batteryService/installAppoint", {
            //需要提交的参数值
            shopid: vm.shopid,
            appointid: vm.appointid,
            leaseTerm: vm.batteryrenttime.rentimeId,
            cost: vm.costprice,
            paymode: vm.paymode,
            days: vm.goodsCount,
            timerange: vm.timerange,
        },
        function(data) {
            vm.requestalipay = data;
            // 如果 支付宝支付
            if (vm.paymode==0) {
                api.toast({
                    msg: '请用支付宝付款',
                    location: 'middle'
                });
                if (vm.requestalipay) {
                    vm.aliPayfun();
                }
            }
            // 如果 微信支付
            if (vm.paymode==1) {
                api.toast({
                    msg: '请用微信付款',
                    location: 'middle'
                });
                if (vm.requestalipay) {
                    vm.wxpayfun();
                }
            }
            // 钱包支付
            if (data == "") {
                alert("支付成功");
                //支付成功跳转到 提示页面
                //发送从新加载地图的监听
                api.sendEvent({
                    name: 'setf5loadEvent'
                });
                jumpUrl.battesucess({ batteryIsstats: 'isinstall1' });
            }
        });
}