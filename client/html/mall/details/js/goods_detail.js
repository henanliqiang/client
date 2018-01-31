/**
 *  详情页win 逻辑功能
 * @authors 郭小北 (kubai666@126.com)
 * @date    2017-03-22 10:50:40
 * @version v0.0.1
 */

// 声明vue加载
var vm = new Vue({
    el: '#app-goodswin-frm',
    data: {
        goodsCount: 1, //购物车数量
        stock: 0,
        goodsId: 0,
        goodsdetail_data: {
            detail: ''
        }, // 商品数据
        goodsstand_list: {}, // 规格虚拟数据
        UILoadId: '',
        // 默认底层布局
        mrdivbox_stats: true,
        myfavoriteIcon: true, // 收藏状态
        standardid: '', // 规格id
    },
    methods: {
        init: function() {
            vm.goodsId = api.pageParam.goodsId;
            vm.goodsdetail(); //商品详情
        },
        // 商品详情
        goodsdetail: function() {
            // 加载框
            var UILoading = api.require('UILoading');
            UILoading.flower({
                center: {
                    x: (api.winWidth / 2),
                    y: (api.winHeight / 2),
                },
                size: 30,
                // fixedOn: 'mapshops_infos_frm',
                fixed: true
            }, function(ret) {
                vm.UILoadId = ret.id;
            });
            vm.mrdivbox_stats = true;

            apps.axget(
                "product/getGoodsDetails", {
                    goodsId: vm.goodsId
                },
                function(data) {
                    // 关闭打开的加载提示框
                    UILoading.closeFlower({
                        id: vm.UILoadId
                    });
                    vm.mrdivbox_stats = false;
                    vm.goodsdetail_data = data;
                    vm.goodsdetail_data.detail = data.detail;

                    // 虚拟 商品数据用于 切换规格
                    // 默认索引 0
                    vm.goodsstand_list = vm.goodsdetail_data.standardList[0];
                    var imgurlArr = [];
                    // 轮播
                    vm.goodsdetail_data.imgList.forEach(function(item) {
                        imgurlArr.push(item.url);
                    });
                    // vue判断dom是否加载完毕
                    setTimeout(function() {
                        vm.$nextTick(function() {
                            if (vm.goodsdetail_data.imgList.length > 0) {
                                // 轮播图
                                // 轮播
                                var UIScrollPicture = api.require('UIScrollPicture');
                                UIScrollPicture.open({
                                    rect: {
                                        x: 0,
                                        y: 0,
                                        w: api.winWidth,
                                        h: api.winHeight / 2.5
                                    },
                                    data: {
                                        paths: imgurlArr,
                                        // captions: ['apicloud', 'apicloud', 'apicloud', 'apicloud']
                                    },
                                    styles: {
                                        caption: {
                                            height: 35,
                                            color: '#E0FFFF',
                                            size: 13,
                                            bgColor: '#696969',
                                            position: 'bottom'
                                        },
                                        indicator: {
                                            dot: {
                                                w: 10,
                                                h: 10,
                                                r: 1,
                                                margin: 2
                                            },
                                            align: 'center',
                                            color: '#FFFFFF',
                                            activeColor: '#000000'
                                        }
                                    },
                                    placeholderImg: 'widget://html/assets/image/load-img.png',
                                    contentMode: 'scaleToFill',
                                    interval: 3,
                                    fixedOn: api.frameName,
                                    loop: true,
                                    fixed: false
                                }, function(ret, err) {
                                    /*if (ret) {
                                        alert(JSON.stringify(ret));
                                    } else {
                                        alert(JSON.stringify(err));
                                    }*/
                                });
                                // }, 600);
                            }
                        });
                    }, 600);

                });
        },
        // 选择规格事件
        checksStandardBtn: function(item, index) {
            // 规格串
            vm.goodsstand_list = vm.goodsdetail_data.standardList[index];
        },
        // 加减选择
        change_goods_num: function(index) {
            // 每个规格里的数量
            var goodsCount = vm.goodsstand_list.count;
            if (index == 1) {
                if (goodsCount >= vm.goodsstand_list.stock) {
                    api.toast({
                        msg: '库存不足',
                        location: 'middle'
                    });
                    return false;
                }
                vm.goodsstand_list.count++;
            } else {

                // 验证购物车
                if (goodsCount <= 1) {
                    goodsCount = 1;
                    api.toast({
                        msg: '订购数量最低为 1',
                        location: 'middle'
                    });
                    return false;
                }
                vm.goodsstand_list.count--;
            }
        },
        addCarts: function() {
            if (!vm.goodsstand_list.count) {
                api.toast({
                    msg: '商品数量不能为0',
                    location: 'middle'
                });
                return false;
            }
            // 验证购物车
            apps.addcars_val(vm.goodsId, vm.goodsstand_list.standardid, vm.goodsstand_list.count, vm.goodsstand_list.stock, vm.goodsstand_list.cartId);
        },

        myfavorite: function() {
            if (vm.goodsdetail_data.isfavorite == 0) {
                apps.axpost(
                    "goodsFavoriteManage/addGoodsFavorite", {
                        goodsId: vm.goodsId
                    },
                    function(data) {
                        api.toast({
                            msg: '收藏商品成功',
                            location: 'middle'
                        });
                        vm.goodsdetail_data.isfavorite = 1;
                    });
            }
            // 取消收藏
            if (vm.goodsdetail_data.isfavorite == 1) {
                apps.axpost(
                    "goodsFavoriteManage/deleteGoodsFavorite", {
                        goodsId: vm.goodsId
                    },
                    function(data) {
                        api.toast({
                            msg: '商品已取消收藏',
                            location: 'middle'
                        });
                        vm.goodsdetail_data.isfavorite = 0;
                    });
            }

        }
    }
});

function currentFun(index) {
    console.log(index);
}
apiready = function() {
    vm.init();
    // 下拉刷新数据...
    apps.pageDataF5(
        function() {
            // 初始化
            vm.init();
        }
    );
    // 监听数量变化
    api.addEventListener({
        name: 'addchangegoodsCount'
    }, function(ret, err) {
        var val = ret.value;
        if (val && val != '') {
            vm.goodsstand_list.count = val.goodsCount;
            vm.max = val.max;
            vm.min = val.min;
            vm.stock = val.stock;
            vm.goodsId = val.goodsId;
        }
    });

    $api.fixStatusBar($api.dom("header"));
};