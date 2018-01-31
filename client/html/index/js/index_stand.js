/**
 *  多规格弹出购物车 逻辑功能
 * @authors 郭小北 (kubai666@126.com)
 * @date    2017-03-22 10:50:40
 * @version v0.0.1
 */

// 声明vue加载
var vm = new Vue({
    el: '#app-indexstand-form',
    data: {
        goodsdetail_data: {
            name: '',
            sku: '' //商品列表
        },
        goodssetList: {}, //商品设置
        goodsCount: 0,
        isExistCurPro: 1,
        kucunnum: 0 //库存数量
    },
    methods: {
        init: function() {
            vm.getGoodsSet();
            vm.selectGoodsdetail();
        },
        goods_detailbtn: function(summaryId, goodsId) {
            // 跳转详情
            jumpUrl.goods_detail({ summaryId: summaryId, goodsId: goodsId });
        },

        addCarts: function(goodsId, goodsCount, max, min, stock) {
            // 验证购物车
            apps.addcars_val(goodsId, goodsCount, max, min, stock, 3);
        },
        goodsCountFun: function(item) {
            if (vm.goodsCount == '' || vm.goodsCount < item.minquantity) {
                vm.goodsCount = item.minquantity;
            }
        },
        // 加减选择
        change_goods_num: function(index) {
            var goodsCount = vm.goodsCount;
            if (index == 1) {

                if (vm.goodsdetail_data.minquantity > 0 && goodsCount < vm.goodsdetail_data.minquantity) {
                    api.toast({
                        msg: '订购数量不能少于最少限购量',
                        location: 'middle'
                    });
                    return false;
                }
                if (vm.goodsdetail_data.limitquantity > 0 && goodsCount > vm.goodsdetail_data.limitquantity) {
                    api.toast({
                        msg: '订购数量不能高于限购量',
                        location: 'middle'
                    });
                    return false;
                }
                if (goodsCount >= vm.goodsdetail_data.stock) {
                    api.toast({
                        msg: '库存不足',
                        location: 'middle'
                    });
                    return false;
                }
                vm.goodsCount++;
            } else {
                if (vm.goodsdetail_data.minquantity > 0 && goodsCount <= vm.goodsdetail_data.minquantity) {
                    goodsCount = vm.goodsdetail_data.minquantity;
                    api.toast({
                        msg: '订购数量不能少于最少限购量',
                        location: 'middle'
                    });
                    return false;
                }
                // 验证购物车
                if (vm.goodsdetail_data.minquantity == 0 && goodsCount <= 1) {
                    goodsCount = 1;
                    api.toast({
                        msg: '订购数量最低为 1',
                        location: 'middle'
                    });
                    return false;
                }
                /*if (goodsCount > vm.goodsdetail_data.stock) {
                    api.toast({
                        msg: '库存不足',
                        location: 'middle'
                    });
                    return false;
                }*/
                vm.goodsCount--;
            }
            // 添加【选购数量】事件监听
            api.sendEvent({
                name: 'addchangegoodsCount',
                extra: {
                    goodsCount: vm.goodsCount,
                    max: vm.goodsdetail_data.max,
                    min: vm.goodsdetail_data.min,
                    stock: vm.goodsdetail_data.stock
                }
            });
        },
        // 商品设置
        getGoodsSet: function() {
            apps.axget(
                "goodsCustomer/selectGoodsSet", {},
                function(data) {
                    vm.goodssetList = data;
                });
        },
        // 商品详情
        selectGoodsdetail: function() {
            apps.axget(
                "product/getGoodsDetails", {
                    summaryId: api.pageParam.summaryId,
                    goodsId: api.pageParam.goodsId
                },
                function(data) {
                    vm.goodsdetail_data = data;
                    vm.kucunnum = vm.goodsdetail_data.stock - vm.goodsdetail_data.prenumber; //库存数量
                    vm.kucunnum = vm.kucunnum > 0 ? vm.kucunnum : 0;
                });
        },
        // 点击规格提取详情
        selectStandardBtn: function(standard_pargam, standtaus) {
            if (standtaus == 'standard1') {
                vm.goodsdetail_data.standard1 = standard_pargam;
            }
            if (standtaus == 'standard2') {
                vm.goodsdetail_data.standard2 = standard_pargam;
            }
            if (standtaus == 'standard3') {
                vm.goodsdetail_data.standard3 = standard_pargam;
            }
            standchoicFn(vm.goodsdetail_data.standard1, vm.goodsdetail_data.standard2, vm.goodsdetail_data.standard3);
        },
    }
});

//监听商品数量判定
vm.$watch('goodsdetail_data.goodsCount', function() {
    // 默认数量
    if (vm.goodsdetail_data.goodsCount == 0) {
        // 当购物车无此商品 == 最低限定量
        if (vm.goodsdetail_data.minquantity > 0) {
            vm.goodsCount = vm.goodsdetail_data.minquantity;
        } else {
            vm.goodsCount = 0;
        }
    } else {
        vm.goodsCount = vm.goodsdetail_data.goodsCount;
    }
}, { deep: true });

apiready = function() {
    // 返回键监控
    if (api.systemType == 'android') {
        api.addEventListener({
            name: 'keyback'
        }, function(ret, err) {
            api.closeFrame({
                name: 'index_stand'
            });
        });
    }
    vm.init();
    apps.loginsListener(
        // 已登录
        function() {
            // 初始化
            vm.init();
        },
        // 未登录
        function() {
            jumpUrl.login();
        }
    );
    //防止弹出规格时，数据没加载完毕前，底部背景透明
    var js_popid = $api.byId('js_popid');
    js_popid.style.height = api.winHeight + 'px';
    js_popid.style.background = "#FFFFFF";
};

function closeFrame() {
    api.closeFrame({
        name: 'index_stand'
    });
}

// 商品规格点击
function standchoicFn(standard1, standard2, standard3) {

    // 根据id获取数据
    if (api.pageParam.summaryId && api.pageParam.goodsId) {
        apps.axget(
            "product/selectByStandard", { //需要提交的参数值
                // 商品基本信息
                // id: goodsid,
                summaryId: api.pageParam.summaryId,
                standard1: standard1,
                standard2: standard2,
                standard3: standard3
            },
            //请求成功时处理
            function(data) {
                /*console.log(555);
                console.log(JSON.stringify(data));
                console.log(666);*/
                if (data.sku == undefined) {
                    vm.isExistCurPro = 0;
                } else {
                    vm.isExistCurPro = 1;
                    //返回提示信息
                    vm.goodsdetail_data = data;
                    /*console.log(333);
                    console.log(data);
                    console.log(JSON.stringify(vm.goodsdetail_data));
                    console.log(44);*/
                }
            });
    } else {
        api.toast({
            msg: "您访问的商品不存在",
            location: 'middle'
        });
    }
}