/**
 *  app 首页 逻辑功能
 * @authors 郭小北 (kubai666@126.com)
 * @date    2017-03-15 10:50:40
 * @version v0.0.1
 */

// 首页、商品等

// 声明vue加载
var vm = new Vue({
    el: '#appgoodlist-frm',
    data: {
        goodslist_data: {
            goods_sum: 1,
            goodsList: [], //商品列表
        },
        categoryId: '',
        goodsSellingList: [],
        pageSize: 100,
        pageNo: 1,
        totalPage: 0, //总页数
    },
    methods: {
        init: function() {
            vm.categoryId = api.pageParam.categoryId;
            vm.pageNo = 1;
            vm.selectGoodsList();
        },
        goods_detailbtn: function(goodsitem) {
            // 跳转详情
            jumpUrl.goods_detail({ summaryId: goodsitem.summaryId, goodsId: goodsitem.goodsId });
        },
        // 商品列表
        selectGoodsList: function() {
            // 全部商品
            apps.axget(
                "product/selectGoodsList", {
                    pageNo: vm.pageNo,
                    pageSize: vm.pageSize,
                    categoryId: vm.categoryId
                },
                function(data) {
                    if (vm.pageNo == 1) {
                        vm.goodslist_data.goodsList = [];
                        data.forEach(function(item) {
                            if (item) {
                                vm.goodslist_data.goodsList.push(item);
                            }
                        });
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
    vm.init();

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

};

var tab = new auiTab({
    element: document.getElementById("tab"),
}, function(ret) {
    console.log(ret)
});
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