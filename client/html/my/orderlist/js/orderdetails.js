/**
 *  login 生成订单 逻辑功能
 * @authors 郭小北 (6922043.com)
 * @date    2017-03-13 10:50:40
 * @version v0.0.1
 */
//声明加载vue
var vm = new Vue({
    el: "#orderdetail-frm",
    data: {
        orderdetailData:{}, // 详情
        alladdress: '', //整个地址
        getOrderSet: '', //订单设置
        deliverAddress: '', //单条地址
        deliverAddresslist: '', //取收货地址列表
        addressId: '',
        oneaddressid: true, //是否是刚进来的Id
        // 商品选择
        addorder_proinfo: {
            addgoodRemark: [], //商品添加备注信息
            selectedList: [],
        },
        // 新增属性
        ordersum: 0.00, //订单金额
        totalprice: 0.00, // 应付总价钱
        distribution: {
            //全部托送方式
            distriArray: [
                { findsname: '送货上门', fid: 2 },
                { findsname: '物流配送', fid: 3 },
            ],
            addyfreightShow: false, // 添加运费按钮显示控制
            deliverymode: 3,
        },
        yunfei: 0.00, //运费
        paymode: 0,
        usealipay: false,
        usewxpay: false,
        goodsjson: {}
    },
    // 计算属性
    computed: {
        //商品串

    },
    methods: {
        init: function() {
            vm.orderId = api.pageParam.orderId;

            //取订单设置
            apps.axget(
                "customerOrder/getOrderSet", { //需要提交的参数值
                },
                function(data) {
                    vm.getOrderSet = data;
                }
            );
            // 取详情
            apps.axget(
                "customerOrder/selectOrderDetails", { //需要提交的参数值
                    orderId:vm.orderId
                },
                function(data) {
                    vm.orderdetailData = data;
                    // 地址
                   //拼接整个地址
                    vm.alladdress = vm.orderdetailData.provincename + vm.orderdetailData.cityname + vm.orderdetailData.countyname + vm.orderdetailData.address;
                }
            );
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
                                orderId: vm.orderId
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
        // 确认收货
        receiptGoodsBtn: function() {
            api.confirm({
                    title: '操作提示',
                    msg: '确认已收到货品？一经确认，资金将会转入卖家账户',
                    buttons: ['确定', '取消']
                },
                function(ret, err) {
                    if (ret.buttonIndex == 1) {
                        apps.axpost(
                            "customerOrder/receiptGoods", { //需要提交的参数值
                                orderId: vm.orderId
                            },
                            function(data) {
                                api.toast({
                                    msg: "确认成功",
                                    duration: 1000,
                                    location: 'middle'
                                });
                                vm.init();
                            });
                    }
                });
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

        // 共合计
        totalpriceFun: function() {
            vm.totalprice = 0.00;
            vm.totalprice = (Number(vm.ordersum) + Number(vm.yunfei)).toFixed(2);
        },
        goods_detailbtn: function(goodsitem) {
            // 跳转详情
            jumpUrl.goods_detail({ summaryId: goodsitem.summaryId, goodsId: goodsitem.goodsId });
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
                            //支付成功跳转到 提示页面
                            jumpUrl.copyordersucc();
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
                    //支付成功跳转到 提示页面
                    jumpUrl.copyordersucc();
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
    }
});

apiready = function() {
    // 下拉刷新数据...
    apps.pageDataF5(
        // 数据...
        function() {
            vm.init();
        }
    );
    vm.init();

};

// 再次付款
function saveBtn() {
    apps.axpost(
        "customerOrder/payOrder", {
            //需要提交的参数值
            orderId: vm.orderId,
            orderno: vm.orderdetailData.orderno,
            transprice: vm.orderdetailData.transprice,
            totalprice: vm.orderdetailData.totalprice,
            deliverymode: vm.orderdetailData.deliverymode,
            paymode: vm.paymode,
        },
        function(data) {
            // 更新购物车数量
            //更新购物车数量
            api.sendEvent({
                name: 'mallindex_cars_init',
            });
            vm.requestalipay = data;
            // 如果 支付宝支付
            if (vm.paymode == 0) {
                api.toast({
                    msg: '请用支付宝付款',
                    location: 'middle'
                });
                if (vm.requestalipay) {
                    vm.aliPayfun();
                }
            }
            // 如果 微信支付
            if (vm.paymode == 1) {
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
                jumpUrl.copyordersucc();
            }
        });
}