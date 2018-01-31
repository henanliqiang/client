/**
 *  app 商品分类页 逻辑功能
 * @authors 郭小北 (kubai666@126.com)
 * @date    2017-03-15 10:50:40
 * @version v0.0.1
 */

// 声明vue加载
var popup = null;
var vm = new Vue({
    el: '#app-classify-form',
    data: {
        goodslist_data: {
            goods_sum: 1,
            size: 0,
            goodsList: [], //商品列表
        },
        selTypeobj: {
            selgoodsCategoryArray: [], //商品分类1
            goodsCategoryArraylevel2: [], //商品分类二级
            categoryId: '', //商品分类id
        },
        cateindex: 0, //左侧二级菜单选中标示
    },
    methods: {
        init: function() {
            // 初始化，获取商品数据
            vm.categoryList();
            // vm.selectGoodsList();
        },
        // 二级分类详情
        classifylistBtn: function(goodsitem) {
            // 跳转详情
            jumpUrl.classifylist({ categoryId: goodsitem.id });
        },
        // 商品类别列表
        categoryList: function() {
            apps.axget(
                "product/selectCategory", {

                },
                //请求成功时处理
                function(data) {
                    if (data) {
                        // 获取商品类别
                        vm.selTypeobj.selgoodsCategoryArray = data;
                        // 默认
                        vm.selctNewType(data[0],0)
                    }
                });
        },
        // 商品列表
        selectGoodsList: function(pageParam) {
            vm.goodslist_data.goodsList = [];
            apps.axget(
                "product/selectGoodsList", pageParam,
                function(data) {
                    /*vm.goodslist_data.size = data.size;
                    vm.goodslist_data.goodsList = data.datas;*/
                    if (vm.pageNo == 1) {
                        vm.goodslist_data.goodsList = [];
                        if (data.length) {
                            data.forEach(function(item) {
                                vm.goodslist_data.goodsList.push(item);
                            });
                        }
                        vm.totalPage = data.totalPage; //总页数

                    } else {
                        //如果存在数据并且当前的页面小于等于总页码时push
                        if (data.length && vm.pageNo <= data.totalPage) {
                            data.forEach(function(item) {
                                vm.goodslist_data.goodsList.push(item);
                            });
                        }
                    }
                    vm.pageNo++;
                });
        },
        //商品分类左侧导航“全部分类”被选中
        selectAllGoodsList: function() {
            vm.cateindex = -1; //左侧全部分类被选中
            /*初始化分页*/
            vm.pageNo = 1;
            vm.selTypeobj.categoryId = '';

            vm.selectGoodsList();
        },
        // 二级分类选择
        selctNewType: function(item,index) {
            vm.cateindex = index;
            vm.selTypeobj.categoryId = item.id;
            vm.selTypeobj.goodsCategoryArraylevel2 = [];
            apps.axget(
                "product/selectCategory", {
                    parentId: item.id,
                    gatelevel:2
                },
                //请求成功时处理
                function(data) {
                    if (data) {
                        // 获取商品类别
                        vm.selTypeobj.goodsCategoryArraylevel2 = data;
                    }
                });
        },

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

    vm.init();
    //监听购物车变化
    api.addEventListener({
        name: 'classify_win_init'
    }, function(ret, err) {
        vm.pageNo = 1;
        vm.goodslist_data.goodsList = [];
        vm.init();
    });
    // 下拉刷新数据...
    apps.pageDataF5(
        function() {
            // 初始化
            vm.init();
        }
    );


};