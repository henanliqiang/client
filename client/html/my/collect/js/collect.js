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
    },
    methods: {
        init: function() {
            vm.selectGoodsCart();
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
        //删除商品
        delete_to_cart: function(index, item) {
            var goodsList = vm.goodslist_data.goodsList[index];
            api.confirm({
                title: '确认要取消收藏？',
                msg: item.name,
                buttons: ['确定', '取消']
            }, function(ret, err) {
                if (ret) {
                    if (ret.buttonIndex == 1) {
                        vm.goodslist_data.goodsList.splice(index, 1);
                        vm.goodslist_data.goodsList.$remove(item);

                        apps.axpost(
                            "goodsFavoriteManage/deleteGoodsFavorite", {
                                goodsId: item.goodsId
                            },
                            function(data) {
                                vm.init();
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
        // 购物车商品列表
        selectGoodsCart: function() {
            apps.axget(
                "goodsFavoriteManage/selectGoodsFavorite", {
                    /*pageNo: 1,
                    pageSize: 10*/
                },
                function(data) {
                    vm.goodslist_data.goodsList = data.datas;
                });

        },
    }
});
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