/**
 *  app 首页 逻辑功能
 * @authors 郭小北 (kubai666@126.com)
 * @date    2017-03-15 10:50:40
 * @version v0.0.1
 */

// 首页、商品等
var mySwiper; //轮播图变量

// 声明vue加载
var vm = new Vue({
    el: '#app-index',
    data: {
        goodslist_data: {
            goods_sum: 1,
            goodsList: [], //商品列表
        },
        goodssetList: {}, //商品设置
        advertList: [], //广告列表
        isshowpopup: 0, //是否显示渠道弹层 默认不显示
        //登录信息
        loginInfo: {
            companyName: '',
            channelList: [],
        },
        userId: '',
        pageSize: 10,
        pageNo: 1,
        totalPage: 0, //总页数
        topcartNum: 0 //购物车数量
    },
    methods: {
        init: function() {
            // 已经登录
            if (GLOBALconfig.gloabluserToken) {
                //进入账号
                vm.getIntoAccount();
                //初始化广告列表
                vm.getAdList();
                // 初始化，获取商品数据
                vm.getGoodsSet();
                vm.pageNo = 1;
                vm.selectGoodsList();
                vm.cartlistnum(); //更新购物车数量
            } else {
                jumpUrl.login();
            }
        },
        //进入账户
        getIntoAccount: function() {
            apps.axpost(
                "n/customerLogin/entryAccount", {
                },
                //请求成功时处理
                function(data) {
                    // 获取头部企业信息
                    vm.loginInfo.companyName = data.companyName;
                    vm.userId = data.userId;
                    setTimeout(function() {
                        vm.ajpushFun(data.userId);
                    }, 500);
                });
        },
        goods_detailbtn: function(goodsitem) {
            // 跳转详情
            jumpUrl.goods_detail({ summaryId: goodsitem.summaryId, goodsId: goodsitem.goodsId });
        },
        show_standardbtn: function(goodsitem) {
            if (goodsitem.putway == 0) {
                api.toast({
                    msg: '商品正在备货中',
                    location: 'middle'
                });
                return false;
            }
            // 弹出规格窗口
            jumpUrl.show_standard({ summaryId: goodsitem.summaryId, goodsId: goodsitem.goodsId });
        },
        //购物车数量
        cartlistnum: function() {
            apps.axget(
                "goodsCartManager/selectGoodsCart", { //需要提交的参数值
                },
                function(data) {
                    if (data.datas.length) {
                        vm.topcartNum = data.datas.length;
                    } else {
                        vm.topcartNum = 0;
                    }
                }
            );
        },
        //购物车加1
        add_to_cart: function(index) {
            var goodsList = vm.goodslist_data.goodsList[index];

            /* if (goodsList.minquantity > 0 && goodsList.goodsCount < goodsList.minquantity) {
                 goodsList.goodsCount = goodsList.minquantity;
                 api.toast({
                     msg: '订购数量不能少于最小限购量',
                     location: 'middle'
                 });
                 return false;
             }*/
            if (goodsList.limitquantity > 0 && goodsList.goodsCount > goodsList.limitquantity) {
                api.toast({
                    msg: '订购数量不能高于最大限购量',
                    location: 'middle'
                });
                return false;
            }
            if (goodsList.goodsCount >= goodsList.stock) {
                api.toast({
                    msg: '库存不足',
                    location: 'middle'
                });
                return false;
            }
            // 执行加入购物车动作
            if (goodsList.goodsCount == 0) {
                vm.topcartNum++;
            }
            goodsList.goodsCount++;
            apps.addcars_val(goodsList.goodsId, goodsList.goodsCount, goodsList.max, goodsList.min, goodsList.stock, 1);
        },
        //购物车减1
        cut_to_cart: function(index) {
            var goodsList = vm.goodslist_data.goodsList[index];

            if (goodsList.minquantity > 0 && goodsList.goodsCount <= goodsList.minquantity) {
                goodsList.goodsCount = goodsList.minquantity;
                api.toast({
                    msg: '订购数量不能少于最小限购量',
                    location: 'middle'
                });
                return false;
            }
            // 验证购物车
            if (goodsList.minquantity == 0 && goodsList.goodsCount <= 1) {
                goodsList.goodsCount = 1;
                api.toast({
                    msg: '订购数量最低为 1',
                    location: 'middle'
                });
                return false;
            }
            /*if (goodsList.goodsCount > goodsList.stock) {
                api.toast({
                    msg: '库存不足',
                    location: 'middle'
                });
                return false;
            }*/

            goodsList.goodsCount--;
            /*if(goodsList.goodsCount == 0){
                vm.topcartNum--;
            }*/
            // 执行加入购物车动作
            apps.addcars_val(goodsList.goodsId, goodsList.goodsCount, goodsList.max, goodsList.min, goodsList.stock, 1);
        },
        // 商品设置
        getGoodsSet: function() {
            apps.axget(
                "goodsCustomer/selectGoodsSet", {},
                function(data) {
                    vm.goodssetList = data;
                });
        },
        // 商品列表
        selectGoodsList: function() {
            apps.axget(
                "product/selectGoodsList", {
                    pageNo: vm.pageNo,
                    pageSize: vm.pageSize,
                },
                function(data) {
                    if (vm.pageNo == 1) {
                        vm.goodslist_data.goodsList = [];
                        data.datas.forEach(function(item) {
                            if (item) {
                                vm.goodslist_data.goodsList.push(item);
                            }
                        });
                        vm.totalPage = data.totalPage; //总页数
                    } else {
                        //如果存在数据并且当前的页面小于等于总页码时push
                        if (data.datas.length && vm.pageNo <= data.totalPage) {
                            data.datas.forEach(function(item) {
                                vm.goodslist_data.goodsList.push(item);
                            });
                        }
                    }
                    vm.pageNo++;


                });

        },
        //广告列表
        getAdList: function() {
            apps.axget(
                "reportCustomer/reportCustomerIndex", {},
                function(data) {
                    vm.advertList = data.advertList;

                    // vue判断dom是否加载完毕
                    setTimeout(function() {
                        vm.$nextTick(function() {
                            if (vm.advertList.length > 0) {
                                // 轮播图
                                setTimeout(function() {
                                    mySwiper = new Swiper('.swiper-container', {
                                        loop: true,
                                        autoplay: 4000,
                                        // 如果需要分页器
                                        pagination: '.swiper-pagination',
                                    });
                                }, 600);
                            }
                        });
                    }, 600);
                });
        },
        //广告跳转
        adjump: function(item) {
            var urlparam = item.relationurl;
            var RequestUrl = GetRequest(urlparam);
            if (item.relationtype == 4) {
                var id = RequestUrl["id"]; //
                var curobj = {
                    id: id
                };
                jumpUrl.noticedetail({ noticeobj: curobj });
            } else if (item.relationtype == 1) {
                var summaryId = RequestUrl["summaryId"]; //
                var goodsId = RequestUrl["goodsId"]; //
                // 跳转详情
                jumpUrl.goods_detail({ summaryId: summaryId, goodsId: goodsId });
            }
        },
        // 极光消息推送
        ajpushFun: function(aliasid) {
            // 极光推送
            var ajpush = api.require('ajpush');
            if (!ajpush) {
                api.toast({
                    msg: '消息推送模块未加载',
                    location: 'middle'
                });
                return false;
            }
            ajpush.init(function(ret) {
                if (ret && ret.status) {
                    //success
                    // alert('初始化推送服务注册成功');
                }
            });
            // 绑定用户 推送消息
            var param = {
                alias: aliasid,
                // tags: ['tag1', 'tag2']
            };
            ajpush.bindAliasAndTags(param, function(ret, err) {
                var statusCode = ret.statusCode;
                // alert('绑定账号成功：' + JSON.stringify(ret) + " 绑定账号失败： " + JSON.stringify(err));
            });
            // 设置消息监听
            ajpush.setListener(
                function(ret) {
                    var id = ret.id;
                    var title = ret.title;
                    var content = ret.content;
                    var extra = ret.extra;
                    // alert('消息内容：' + content);
                }
            );
            // 通知极光推送SDK当前应用恢复到前台。
            api.addEventListener({ name: 'resume' }, function(ret, err) {
                var ajpush = api.require('ajpush');
                ajpush.onResume();
            });
            // ios消息个数
            ajpush.setBadge({
                badge: 0
            });

            // 在Android平台，点击消息跳转
            api.addEventListener({
                name: 'appintent'
            }, function(ret, err) {
                if (ret && ret.appParam.ajpush) {
                    var ajpush = ret.appParam.ajpush;
                    var id = ajpush.id;
                    var title = ajpush.title;
                    var content = ajpush.content;
                    var extra = JSON.parse(ajpush.extra);
                    // skiptype:跳转类型；0：不跳转;1：订单详情;2：退单详情;3：资金交易流水;4：问题反馈 5:资金账户
                    if (extra.skiptype == '1') {
                        jumpUrl.orderdetail({ orderno: extra.param });
                    }
                    if (extra.skiptype == '2') {
                        jumpUrl.returnorderdetail({ no: extra.param });
                    }
                    if (extra.skiptype == '4') {
                        jumpUrl.fankui();
                    }
                }
            });

            // 在IOS平台，点击消息跳转
            api.addEventListener({
                name: 'noticeclicked'
            }, function(ret, err) {
                if (ret && ret.value) {
                    var ajpush = ret.value;
                    var content = ajpush.content;
                    var extra = JSON.parse(ajpush.extra);
                    // skiptype:跳转类型；0：不跳转;1：订单详情;2：退单详情;3：资金交易流水;4：问题反馈 5:资金账户
                    if (extra.skiptype == '1') {
                        jumpUrl.orderdetail({ orderno: extra.param });
                    }
                    if (extra.skiptype == '2') {
                        jumpUrl.returnorderdetail({ no: extra.param });
                    }
                    if (extra.skiptype == '4') {
                        jumpUrl.fankui();
                    }
                }
            });
        }
    }
});

//监听商品数量判定
vm.$watch('goodslist_data.goodsList', function() {
    // 默认数量
    vm.goodslist_data.goodsList.forEach(function(item) {
        if (item.goodsCount == 0) {
            // 当购物车无此商品 == 最低限定量
            if (item.minquantity > 0) {
                item.goodsCount = item.minquantity;
            } else {
                item.goodsCount = 0;
            }
        }
    });

}, { deep: true });

// 初始化
apiready = function() {
    // 实现沉浸式效果
    $api.fixStatusBar($api.dom("header"));
    //根据系统 修改下拉弹层样式
    if (apps.ismobile(0) == 0) {
        $(".aui-popup-top").css({ 'top': '3rem' });
    }

    vm.init();
    // 监听登录是否成功
    apps.loginsListener(
        // 已登录
        function() {
            // 初始化
            vm.init();
        },
        // 未登录
        function() {
            // jumpUrl.login();
            vm.goodslist_data.goodsList = [];
        }
    );

    //监听商品列表变化
    api.addEventListener({
        name: 'index_win_init'
    }, function(ret, err) {
        vm.init();
    });

    // 下拉刷新数据...
    apps.pageDataF5(
        function() {
            // 初始化
            vm.init();
        }
    );
    //上拉加载
    api.addEventListener({
        name: 'scrolltobottom',
        extra: {
            threshold: 0 //设置距离底部多少距离时触发，默认值为0，数字类型
        }
    }, function(ret, err) {
        if (vm.pageNo <= vm.totalPage) {
            vm.selectGoodsList();
        }
    });
    new auiLazyload({
        errorImage: '../assets/image/error-img.png'
    });

};

//初始化 渠道弹层
var popup = new auiPopup();


/**
 *  对象表示法 获取&xx= 后面的字符
 */
function GetRequest(strinfo) {
    var theRequest = new Object();
    strs = strinfo.split("&"); //  &xx= 后面的字符
    for (var i = 0; i < strs.length; i++) {
        theRequest[strs[i].split("=")[0]] = (strs[i].split("=")[1]);
    }
    return theRequest;
}