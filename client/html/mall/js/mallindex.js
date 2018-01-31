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
        goodssetList: {}, //商品设置
        show_sort: false,
        sortid: '1', //排序名称
        sortname: '全部', //排序名称
        sort_index: 0,
        sortvalue: '',
        sortlist: [{
            id: 0,
            name: '全部',
            value:''
        }, {
            id: 1,
            name: '按商品名称',
            value:'name_0'
        }, {
            id: 2,
            name: '按商品价格',
            value:'price_0'
        }], //排序
        nav_list: [],
        nav_index: 0,
        // 商品类别
        selTypeobj: {
            // 商品类别
            selgoodsCategoryArray: [],
            selgoodsCategoryName: '请选择商品类别',
            categoryId: '',
            gatelevel3: '', //三級分類
        },
        checkflag:0,   //左侧二级菜单选中标示
        cateindex:-1,   //左侧二级菜单选中标示
        pageSize: 10,
        pageNo: 1,
        totalPage:0,//总页数
        filterlist:'', //筛选list
        brandIdlist:'',//品牌id
        topcartNum:0 //购物车数量
    },
    methods: {
        init: function() {
            popup = new auiPopup();
            /*api.showProgress({
                title: '',
                text: '',
                modal: false
            });*/
            // 初始化，获取商品数据
            vm.getGoodsSet();
            vm.selectGoodsList();
            vm.categoryList();
            vm.cartlistnum();//更新购物车数量
        },
        goods_detailbtn: function(goodsitem) {
            // 跳转详情
            jumpUrl.goods_detail({ summaryId: goodsitem.summaryId, goodsId: goodsitem.goodsId });
        },
        show_standardbtn: function(goodsitem) {
            if (goodsitem.putway==0) {
                api.toast({
                    msg: '商品正在备货中',
                    location: 'middle'
                });
                return false;
            }
            // 弹出规格窗口
            jumpUrl.show_standard({ summaryId: goodsitem.summaryId, goodsId: goodsitem.goodsId });
        },
        //购物车加1
        add_to_cart: function(index) {
            var goodsList = vm.goodslist_data.goodsList[index];

            /*if (goodsList.minquantity > 0 && goodsList.goodsCount <= goodsList.minquantity) {
                goodsList.goodsCount = goodsList.minquantity;
                api.toast({
                    msg: '订购数量不能少于最少限购量',
                    location: 'middle'
                });
                return false;
            }*/
            if (goodsList.limitquantity > 0 && goodsList.goodsCount > goodsList.limitquantity) {
                api.toast({
                    msg: '订购数量不能高于限购量',
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
            if(goodsList.goodsCount == 0){
                vm.topcartNum++;
            }
            // 执行加入购物车动作
            goodsList.goodsCount ++;
            apps.addcars_val(goodsList.goodsId, goodsList.goodsCount, goodsList.max, goodsList.min, goodsList.stock,2);
        },
        //购物车减1
        cut_to_cart: function(index) {
            var goodsList = vm.goodslist_data.goodsList[index];

            if (goodsList.minquantity > 0 && goodsList.goodsCount <= goodsList.minquantity) {
                goodsList.goodsCount = goodsList.minquantity;
                api.toast({
                    msg: '订购数量不能少于最少限购量',
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

            goodsList.goodsCount --;
            // 执行加入购物车动作
            apps.addcars_val(goodsList.goodsId, goodsList.goodsCount, goodsList.max, goodsList.min, goodsList.stock,2);
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
        selectGoodsList: function(pageParam) {
            pageParam = (pageParam == null || pageParam == "" || typeof(pageParam) == "undefined") ? {} : pageParam;
            pageParam.pageSize = vm.pageSize;
            pageParam.pageNo = vm.pageNo;
            apps.axget(
                "product/selectGoodsList", pageParam,
                function(data) {
                    /*vm.goodslist_data.size = data.size;
                    vm.goodslist_data.goodsList = data.datas;*/
                    if (vm.pageNo == 1) {
                        vm.goodslist_data.goodsList=[];
                        if(data.datas.length){
                            data.datas.forEach(function (item) {
                                vm.goodslist_data.goodsList.push(item);
                            });
                        }
                        vm.totalPage = data.totalPage;//总页数
                        console.log(55);
                        console.log(JSON.stringify(vm.goodslist_data.goodsList));
                        console.log(555);
                    } else {
                        //如果存在数据并且当前的页面小于等于总页码时push
                        if (data.datas.length && vm.pageNo <= data.totalPage) {
                            data.datas.forEach(function(item) {
                                vm.goodslist_data.goodsList.push(item);
                            });
                        }
                    }
                    vm.pageNo ++;
                });
        },
        /*selectGoodsList: function(pageParam) {//上拉加载数据备份-暂时不用
            pageParam = (pageParam == null || pageParam == "" || typeof(pageParam) == "undefined") ? {} : pageParam;
            pageParam.pageSize = vm.pageSize;
            pageParam.pageNo = vm.pageNo;
            console.log(333);
            console.log(JSON.stringify(pageParam));
            console.log(333);
            apps.axget(
                "product/selectGoodsList", pageParam,
                function(data) {
                    vm.goodslist_data.size = data.size;
                    //vm.goodslist_data.goodsList = data.datas;

                    if (vm.pageNo == 1) {
                        vm.goodslist_data.goodsList = data.datas;
                    } else {
                        //如果存在数据并且当前的页面小于等于总页码时push
                        if (data.datas.length && vm.pageNo <= data.totalPage) {
                            data.datas.forEach(function(item) {
                                vm.goodslist_data.goodsList.push(item);
                            });
                        } /!*else {
                         api.toast({
                         msg: '没有更多数据',
                         location: 'bottom'
                         });
                         }*!/
                    }
                    vm.pageNo ++;
                });
        },*/
        //商品分类左侧导航“全部分类”被选中
        selectAllGoodsList:function () {
            vm.cateindex = -1;//左侧全部分类被选中
            /*初始化分页*/
            vm.pageNo = 1;
            vm.selTypeobj.categoryId = '';
            vm.goodslist_data.goodsList=[];
            vm.brandIdlist.length = 0;
            vm.filterlist.length = 0;
            vm.sortid = 0;
            vm.sort_index = 0;
            vm.sortname = '全部';
            vm.sortvalue = '';
            vm.selectGoodsList();
        },
        // 商品类别列表
        categoryList: function() {
            apps.axget(
                "goodsCustomer/selectCategory", {},
                //请求成功时处理
                function(data) {
                    if (data) {
                        // 获取商品类别
                        vm.selTypeobj.selgoodsCategoryArray = data;

                        var aheight = (data.length+1)*45;
                        $("#js_height").css({'height':aheight});

                        // 二级效果
                        setTimeout(function() {
                            var collapse = new auiCollapse({
                                autoHide: false //是否自动隐藏已经展开的容器
                            });
                        }, 600);
                    }
                });
        },
        /*showsort: function() {
            console.log(333);
            console.log(vm.show_sort);
            if (vm.show_sort) {
                vm.show_sort = false;
            } else {
                vm.show_sort = true;
            }
        },*/
        // 选择排序
        changesort: function(id, name,val) {
            console.log(id);
            vm.sortid = id;
            vm.sort_index = id;
            vm.sortname = name;
            vm.sortvalue = val;
            //vm.show_sort = false;
            /*初始化分页*/
            vm.pageNo = 1;

            vm.goodslist_data.goodsList=[];
            console.log(vm.sortvalue);
            /*if (id == 0) {
                vm.selectGoodsList();
            } else {*/
                vm.selectGoodsList({ categoryId:vm.selTypeobj.categoryId,sort: vm.sortvalue ,filter: vm.filterlist,brandId: vm.brandIdlist});
            //}
            popup.hide(document.getElementById("top"));
            //关闭遮罩和弹层
            //$(".aui-mask").hide();
            //$("#top").hide();
        },
        cg_nav: function(index) {
            vm.nav_index = index;
        },
        // 弹出规格
        filter_layout: function() {
            /*console.log(111);
            console.log(JSON.stringify(vm.brandIdlist));
            console.log(JSON.stringify(vm.filterlist));
            console.log(111);*/
            api.openFrame({
                name: 'classify_leftslid',
                url: '../classify/classify_leftslid.html',
                rect: {
                    x: 0,
                    y: 0,
                    w: 'auto',
                    h: api.winHeight
                },
                pageParam: {
                    //name: 'classify_leftslid'
                    bandlist: vm.brandIdlist,
                    filterlist: vm.filterlist
                },
                bounces: false,
                bgColor: 'rgba(0,0,0,0)',
                vScrollBarEnabled: true,
                hScrollBarEnabled: true,
                animation: {
                    type: "push", //动画类型（详见动画类型常量）
                    subType: "from_right", //动画子类型（详见动画子类型常量）
                    duration: 300 //动画过渡时间，默认300毫秒
                }
            });
            // apps.loadWinUrl('classify_leftslid', 'classify/classify_leftslid.html');

        },
        // 商品分类选择
        selctNewType: function(item, selType_name,index) {
            vm.cateindex = index;
            console.log(index);
            /*初始化分页*/
            vm.pageNo = 1;
            vm.goodslist_data.goodsList=[];
            // 商品分类
            if (selType_name == 'selgoodsCategory') {
                vm.selTypeobj.categoryId = item.id;
                vm.selectGoodsList({ categoryId: item.id ,sort: vm.sortvalue,filter: vm.filterlist,brandId: vm.brandIdlist});
            }
            //左侧二级菜单 选中标示
            if(vm.checkflag==0){
                vm.checkflag=1
            }else{
                vm.checkflag=0
            }

        },
        //购物车数量
        cartlistnum:function () {
            apps.axget(
                "goodsCartManager/selectGoodsCart", { //需要提交的参数值
                },
                function (data) {
                    if (data.datas.length) {
                        vm.topcartNum = data.datas.length;
                    } else {
                        vm.topcartNum = 0;
                    }
                }
            );
            //api.hideProgress();
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
    $api.fixStatusBar($api.dom("header"));

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
    //监听购物车变化
    api.addEventListener({
        name: 'classify_win_init'
    }, function (ret, err) {
        vm.pageNo = 1;
        vm.goodslist_data.goodsList=[];
        vm.init();
    });
    // 下拉刷新数据...
    /*apps.pageDataF5(
        function() {
            // 初始化
            vm.init();
        }
    );*/
    //上拉加载
    /*api.addEventListener({
        name: 'scrolltobottom',
        extra: {
            threshold: 0 //设置距离底部多少距离时触发，默认值为0，数字类型
        }
    }, function(ret, err) {
        console.log(777);
        if(vm.pageNo<=vm.totalPage){
            vm.selectGoodsList();
        }
    });*/
    //监听是否切换渠道
    api.addEventListener({
        name: 'changeChannel'
    }, function(ret, err) {
        vm.pageNo = 1;
        vm.goodslist_data.goodsList=[];
        vm.init();
        vm.selectAllGoodsList();//商品左侧分类
    });

    //监听筛选条件
    api.addEventListener({
        name: 'goodsclasschoisSuccess'
    }, function(ret) {
        var val = ret.value;
        console.log(JSON.stringify(val));
        vm.filterlist = val.filter;
        vm.brandIdlist = val.brandId;
        console.log(222+'='+vm.filterlist+'='+vm.brandIdlist);
        vm.selectGoodsList({ categoryId: vm.selTypeobj.categoryId ,sort: vm.sortvalue,filter: vm.filterlist,brandId: vm.brandIdlist});
    });
    //初始化 排序弹层
    //var popup = new auiPopup();

};

$(function () {
    setTimeout(function () {
        loaded();
    },1000);
});
var myScroll;
var myScrollleft;
var pullDownEl, pullDownL;
var pullUpEl, pullUpL;
var loadingStep = 0;//加载状态0默认，1显示加载状态，2执行加载数据，只有当为0时才能再次加载，这是防止过快拉动刷新
function pullDownAction() {//下拉事件
    setTimeout(function() {
        if(vm.pageNo<=vm.totalPage){
            vm.selectGoodsList();
        }
        pullDownEl.removeClass('loading');
        pullDownL.html('下拉显示更多...');
        pullDownEl['class'] = pullDownEl.attr('class');
        pullDownEl.attr('class','').hide();
        myScroll.refresh();
        loadingStep = 0;
    }, 500); //1秒
}
function pullUpAction() {//上拉事件
    setTimeout(function() {
        if(vm.pageNo<=vm.totalPage){
            vm.selectGoodsList();
        }
        pullUpEl.removeClass('loading');
        pullUpL.html('上拉显示更多...');
        pullUpEl['class'] = pullUpEl.attr('class');
        pullUpEl.attr('class','').hide();
        myScroll.refresh();
        loadingStep = 0;
    }, 500);
}
function loaded() {
    pullDownEl = $('#pullDown');
    pullDownL = pullDownEl.find('.pullDownLabel');
    pullDownEl['class'] = pullDownEl.attr('class');
    pullDownEl.attr('class','').hide();

    pullUpEl = $('#pullUp');
    pullUpL = pullUpEl.find('.pullUpLabel');
    pullUpEl['class'] = pullUpEl.attr('class');
    pullUpEl.attr('class','').hide();

    myScrollleft = new IScroll('#wrapper', {
        probeType: 3,//probeType：1对性能没有影响。在滚动事件被触发时，滚动轴是不是忙着做它的东西。probeType：2总执行滚动，除了势头，反弹过程中的事件。这类似于原生的onscroll事件。probeType：3发出的滚动事件与到的像素精度。注意，滚动被迫requestAnimationFrame（即：useTransition：假）。
        mouseWheel: true,//允许滑轮滚动
        fadeScrollbars: true,//滚动时显示滚动条，默认影藏，并且是淡出淡入效果
        bounce:true,//边界反弹
        interactiveScrollbars:true,//滚动条可以拖动
        shrinkScrollbars:'scale',// 当滚动边界之外的滚动条是由少量的收缩。'clip' or 'scale'.
        click: true ,// 允许点击事件
        keyBindings:true,//允许使用按键控制
        momentum:true// 允许有惯性滑动
    });
    myScroll = new IScroll('#class_box_inner', {
        probeType: 2,//probeType：1对性能没有影响。在滚动事件被触发时，滚动轴是不是忙着做它的东西。probeType：2总执行滚动，除了势头，反弹过程中的事件。这类似于原生的onscroll事件。probeType：3发出的滚动事件与到的像素精度。注意，滚动被迫requestAnimationFrame（即：useTransition：假）。
        scrollbars: true,//有滚动条
        mouseWheel: true,//允许滑轮滚动
        fadeScrollbars: true,//滚动时显示滚动条，默认影藏，并且是淡出淡入效果
        bounce:true,//边界反弹
        interactiveScrollbars:true,//滚动条可以拖动
        shrinkScrollbars:'scale',// 当滚动边界之外的滚动条是由少量的收缩。'clip' or 'scale'.
        click: true ,// 允许点击事件
        keyBindings:true,//允许使用按键控制
        momentum:true// 允许有惯性滑动
    });

    //滚动时
    myScroll.on('scroll', function(){
        if(loadingStep == 0 && !pullDownEl.attr('class').match('flip|loading') && !pullUpEl.attr('class').match('flip|loading')){
            if (this.y >= 0) {
                //下拉刷新效果
                pullDownEl.attr('class',pullUpEl['class'])
                pullDownEl.show();
                myScroll.refresh();
                pullDownEl.addClass('flip');
                pullDownL.html('准备刷新...');
                loadingStep = 1;
            }else if (this.y < (this.maxScrollY - 5)) {
                //上拉刷新效果
                pullUpEl.attr('class',pullUpEl['class'])
                pullUpEl.show();
                myScroll.refresh();
                pullUpEl.addClass('flip');
                pullUpL.html('准备刷新...');
                loadingStep = 1;
            }
        }
    });
    //滚动完毕
    myScroll.on('scrollEnd',function(){
        if(loadingStep == 1){
            if (pullUpEl.attr('class').match('flip|loading')) {
                pullUpEl.removeClass('flip').addClass('loading');
                pullUpL.html('Loading...');
                loadingStep = 2;
                pullUpAction();
            }else if(pullDownEl.attr('class').match('flip|loading')){
                pullDownEl.removeClass('flip').addClass('loading');
                pullDownL.html('Loading...');
                loadingStep = 2;
                pullDownAction();
            }
        }
    });
}
document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);