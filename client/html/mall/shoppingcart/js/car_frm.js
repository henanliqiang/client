/**
 *  购物车 逻辑功能
 * @authors 郭小北 (kubai666@126.com)
 * @date    2017-03-15 10:50:40
 * @version v0.0.1
 */

// 声明vue加载
var vm = new Vue({
    el: '#app-carslist-form',
    data: {
        goodslist_data: {
            goods_sum: 1,
            goodsList: [], //商品列表
        },
        goodssetList: {}, //商品设置
        totalprice: '', //商品总计
        checkgoodArr: [], //商品总计
        chossshopsgoods: [], //选择的商品数组
        goodsListAllArr: [], //所有上架的商品数组
        // 初始化全选按钮, 默认不选
        isCheckedAll: false
    },
    methods: {
        init: function() {
            vm.selectGoodsCart();
        },
        checkedOne: function(item) {
            if (item.putway == 0) {
                api.toast({
                    msg: '此商品已下架',
                    location: 'middle'
                });
                return false;
            }
            var idIndex = vm.chossshopsgoods.indexOf(item.id);
            if (idIndex >= 0) {
                // 如果已经包含了该id, 则去除(单选按钮由选中变为非选中状态)
                vm.chossshopsgoods.splice(idIndex, 1);
            } else {
                // 选中该checkbox
                vm.chossshopsgoods.push(item.id);
            }
            // 商品串
            var goodArridIndex = vm.checkgoodArr.indexOf(item);
            if (goodArridIndex >= 0) {
                // 如果已经包含了该id, 则去除(单选按钮由选中变为非选中状态)
                vm.checkgoodArr.splice(goodArridIndex, 1);
            } else {
                // 选中该checkbox
                vm.checkgoodArr.push(item);
            }
            console.log(vm.chossshopsgoods);
        },
        checkedAll: function() {
            vm.isCheckedAll = !vm.isCheckedAll;
            if (vm.isCheckedAll == false) {
                // 全选时
                vm.chossshopsgoods = [];
                vm.checkgoodArr = [];

            } else {

                vm.chossshopsgoods = [];
                vm.checkgoodArr = [];
                vm.goodslist_data.goodsList.forEach(function(item) {
                    if (item.putway == 1) {
                        vm.chossshopsgoods.push(item.id);
                        vm.checkgoodArr.push(item);
                    }

                });
            }

            console.log(vm.chossshopsgoods);
        },
        goods_detailbtn: function(goodsitem) {
            if (goodsitem.putway == 0) {
                api.toast({
                    msg: '此商品已下架',
                    location: 'middle'
                });
                return false;
            }
            // 跳转详情
            jumpUrl.goods_detail({ summaryId: goodsitem.summaryId, goodsId: goodsitem.goodsId });
        },
        goodsCountFun: function(item) {
            if (item.count == '' || item.count < item.minquantity) {
                item.count = item.minquantity;
            }
        },
        //购物车加1
        add_to_cart: function(index) {
            var goodsList = vm.goodslist_data.goodsList[index];
            if (goodsList.count >= goodsList.stock) {
                api.toast({
                    msg: '库存不足',
                    location: 'middle'
                });
                return false;
            }
            // 执行加入购物车动作
            goodsList.count++;
            // 加入购物车
            apps.axpost(
                "goodsCartManager/addOrUpdateGoodsCart", {
                    goodsId: goodsList.goodsId,
                    count: goodsList.count,
                    standardid: goodsList.standardid,
                    cartId: goodsList.id,
                },
                function(data) {

                });
        },
        //购物车减1
        cut_to_cart: function(index) {
            var goodsList = vm.goodslist_data.goodsList[index];
            // 验证购物车
            if (goodsList.count <= 1) {
                goodsList.count = 1;
                api.toast({
                    msg: '订购数量最低为 1',
                    location: 'middle'
                });
                return false;
            }
            goodsList.count--;
            // 加入购物车
            apps.axpost(
                "goodsCartManager/addOrUpdateGoodsCart", {
                    goodsId: goodsList.goodsId,
                    count: goodsList.count,
                    standardid: goodsList.standardid,
                    cartId: goodsList.id,
                },
                function(data) {

                });
        },
        //删除商品
        delete_to_cart: function(index, item) {
            var goodsList = vm.goodslist_data.goodsList[index];
            api.confirm({
                title: '确认要删除？',
                msg: item.name,
                buttons: ['确定', '取消']
            }, function(ret, err) {
                if (ret) {
                    if (ret.buttonIndex == 1) {
                        vm.goodslist_data.goodsList.splice(index, 1);
                        vm.goodslist_data.goodsList.$remove(item);

                        apps.axpost(
                            "goodsCartManager/deleteGoodsCart", {
                                id: item.id
                            },
                            function(data) {
                                vm.init();
                                //更新购物车数量
                                api.sendEvent({
                                    name: 'mallindex_cars_init',
                                });
                            });
                    }
                } else {
                    api.toast({
                        msg: '删除失败',
                        duration: 2000,
                        location: 'bottom'
                    });
                }
            });
        },
        // 下单
        create_order: function() {
            if (vm.chossshopsgoods.length < 1) {
                api.toast({
                    msg: '请先选购商品',
                    location: 'bottom'
                });
                return false;
            }
            // 添加【购物车商品下单列表】事件监听
            /* api.sendEvent({
                 name: 'CartForOrdergoodslist',
                 extra: {
                     checkgoodshop: JSON.stringify(vm.checkgoodshop)
                 }
             });*/

            jumpUrl.create_order({ cartIds: vm.chossshopsgoods });
            //更新购物车数量
            api.sendEvent({
                name: 'mallindex_cars_init',
            });
        },
        // 购物车商品列表
        selectGoodsCart: function() {
            apps.axget(
                "goodsCartManager/selectGoodsCart", {
                    /*pageNo: 1,
                    pageSize: 10*/
                },
                function(data) {
                    vm.goodslist_data.goodsList = data.datas;
                    vm.goodsListAllArr = [];
                    vm.goodslist_data.goodsList.forEach(function(item) {
                        if (item.putway == 1) {
                            vm.goodsListAllArr.push(item);
                        }

                    });
                });

        },
    }
});

//全选监控
vm.$watch('chossshopsgoods', function() {

    if (this.chossshopsgoods.length === this.goodsListAllArr.length) {
        vm.isCheckedAll = true;
    } else {
        vm.isCheckedAll = false;
    }
}, { deep: true });

vm.$watch('checkgoodArr', function() {
    var totalprice = 0;
    this.checkgoodArr.forEach(function(item) {
        totalprice += (item.price) * (item.count);
    })
    vm.totalprice = totalprice;
}, { deep: true });
// 初始化
apiready = function() {
    vm.init();
    // 下拉刷新数据...
    apps.pageDataF5(
        function() {
            // 初始化
            vm.init();
        }
    );
};