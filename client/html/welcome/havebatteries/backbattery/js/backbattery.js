/**
 * 交纳押金成功-去预约
 * @authors 郭小北 (kubai666@126.com)
 * @date    2016-05-31 17:27:39
 * @version 0.0.1
 */

// 声明vue加载
var vm = new Vue({
    el: '#backbattery-frm',
    data: {
        batteryjson: {}, //选择电池json
        batteryIsstats: 'isinstall1', //选择电池json
    },
    methods: {
        //初始化
        init: function() {
            vm.batteryIsstats = api.pageParam.batteryIsstats;
        },
        // 开通服务重新缴费
        welcome_open: function() {
            jumpUrl.welcome_open();
            // 跳转首页
            api.sendEvent({
                name: 'setf5loadEvent'
            });
            api.sendEvent({
                name: 'loginsucesspst'
            });
        },
        callus: function() {
            api.call({
                type: 'tel_prompt',
                number: '400-862-5918'
            });
        },
    }
});

apiready = function() {
    vm.init();
};