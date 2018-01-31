/**
 *  login 生成订单 逻辑功能
 * @authors 郭小北 (6922043.com)
 * @date    2017-03-13 10:50:40
 * @version v0.0.1
 */
//声明加载vue
var vm = new Vue({
    el: "#order-detail",
    data: {
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
        goodsjson: {},
        cartIds:[],//  购物车id 集合
    },
    // 计算属性
    computed: {
        //商品串

    },
    methods: {
        init: function() {
            vm.cartgoodsid = api.pageParam.cartgoodsid;
            vm.cartIds = api.pageParam.cartIds;

            //取订单设置
            apps.axget(
                "customerOrder/getOrderSet", { //需要提交的参数值
                },
                function(data) {
                    vm.getOrderSet = data;
                }
            );
            //取一条收货地址
            apps.axget(
                "deliverAddress/selectById", { //需要提交的参数值
                },
                function(data) {
                    vm.deliverAddress = data;
                    vm.addressId = data.id;
                    //拼接整个地址
                    vm.alladdress = vm.deliverAddress.provincename + vm.deliverAddress.cityname + vm.deliverAddress.countyname + vm.deliverAddress.address;
                }
            );
            //购物车下单的商品
            apps.axget(
                "goodsCartManager/selectGoodsCartList", {
                    cartIds:vm.cartIds
                },
                function(data) {
                    vm.ordersum = 0.00,
                        vm.addorder_proinfo.selectedList = data;
                    //计算货款合计
                    vm.addorder_proinfo.selectedList.forEach(function(item) {
                        vm.ordersum += item.goodscount * item.price; // 商品价格合计
                        // 可否上门安装
                        if (item.isinstall == 1) {
                            vm.distribution = {
                                //全部托送方式
                                distriArray: [
                                    { findsname: '上门安装', fid: 1 },
                                    { findsname: '送货上门', fid: 2 },
                                    { findsname: '物流配送', fid: 3 },
                                ],
                                deliverymode: 1,
                            };
                            vm.yunfei = vm.getOrderSet.installcost;
                        } else {
                            vm.yunfei = vm.getOrderSet.logisticscost;
                        }
                        vm.totalpriceFun();
                        // 商品穿
                        vm.goodsjsonSet();
                        // vm.weighttotal += item.weight;
                    });

                }
            );

        },
        goodsjsonSet: function() {
            var addproList = this.addorder_proinfo.selectedList;
            var goodsarray = [];
            var goodsList = {};
            for (var i = 0; i < addproList.length; i++) {
                var item = addproList[i];
                // goodsList['type'] = '1';
                goodsList['goodsId'] = item.goodsId;
                goodsList['goodscount'] = item.count;
                goodsList['price'] = item.price;
                // goodsList['taxfee'] = this.proitprice[i];
                goodsList['sumprice'] = (item.price) * (Number(item.count));
                goodsList['stock'] = item.stock;
                goodsList['standardid'] = item.standardid;
                var goodsListrg = JSON.stringify(goodsList)
                goodsarray.push(JSON.parse(goodsListrg));
            }

            vm.goodsjson = goodsarray;
            // return goodsjson;
        },
        // 选择地址
        select_address: function(ids) {
            jumpUrl.addressmanage({ deliverAddressId: vm.deliverAddress.id })

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

//监听所选订单配送变化
vm.$watch('distribution.deliverymode', function() {
    if (vm.distribution.deliverymode == 1) {
        vm.yunfei = vm.getOrderSet.installcost;
    }
    if (vm.distribution.deliverymode == 2) {
        vm.yunfei = vm.getOrderSet.delivercost;
    }
    if (vm.distribution.deliverymode == 3) {
        vm.yunfei = vm.getOrderSet.logisticscost;
    }
    vm.totalpriceFun();
}, { deep: true });
apiready = function() {
    // 下拉刷新数据...
    apps.pageDataF5(
        // 数据...
        function() {
            vm.init();
        }
    );
    vm.init();

    //地址管理
    api.addEventListener({
        name: 'create_address_modify'
    }, function(ret) {
        vm.deliverAddress = ret.value;
        //拼接整个地址
        vm.alladdress = vm.deliverAddress.countryname + vm.deliverAddress.provincename + vm.deliverAddress.cityname + vm.deliverAddress.countyname + vm.deliverAddress.address;

    });

};


function saveBtn() {
    apps.axpost(
        "customerOrder/placeOrder", {
            //需要提交的参数值
            ordersum: vm.ordersum,
            transprice: vm.yunfei,
            totalprice: vm.totalprice,
            addressId: vm.addressId,
            deliverymode: vm.distribution.deliverymode,
            paymode: vm.paymode,
            goods: vm.goodsjson,
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