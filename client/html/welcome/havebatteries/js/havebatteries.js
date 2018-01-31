/**
 * 交纳押金成功-去预约
 * @authors 郭小北 (kubai666@126.com)
 * @date    2016-05-31 17:27:39
 * @version 0.0.1
 */

// 声明vue加载
var vm = new Vue({
    el: '#havebatter-frm',
    data: {
        batteryjson: {}, //选择电池json
    },
    methods: {
        //初始化
        init: function() {
            vm.batteryjson = api.pageParam.batteryjson;
        },
        // 跳转首页导航
        jumpindexMap: function() {
            // 选择电池存入缓存
            // 跳转首页
            api.sendEvent({
                name: 'setf5loadEvent'
            });
            api.sendEvent({
                name: 'indexinit'
            });
            setTimeout(function() {
                api.closeToWin({
                    name: 'root'
                });
            }, 300);
        },
    }
});

apiready = function() {
    // 实现沉浸式效果
    $api.fixStatusBar($api.dom("header"));
    //下拉刷新
    apps.pageDataF5(function() {
        vm.init();
    });
    vm.init();
};