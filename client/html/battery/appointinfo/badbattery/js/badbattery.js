/**
 * 重新开通服务
 * @authors 郭小北 (kubai666@126.com)
 * @date    2016-05-31 17:27:39
 * @version 0.0.1
 */

// 声明vue加载
var vm = new Vue({
    el: '#badbattery-frm',
    data: {
        batteryjson: {}, //选择电池json
        appoinid: '', //预约id
        lossimg: '', //报损图片
        finishtime: '', //报损时间
    },
    methods: {
        //初始化
        init: function() {
            vm.appoinid = api.pageParam.appoinid;
            vm.lossimg = api.pageParam.lossimg;
            vm.finishtime = api.pageParam.finishtime;
        },
        // 开通服务重新缴费
        welcome_open: function() {
            api.toast({
                msg: '正在处理，请稍后',
                location: 'middle'
            });
            // 先取消预约
            apps.axpost(
                "batteryService/undoService", {
                    id: vm.appoinid
                },
                function(data) {
                    jumpUrl.welcome_open();
                    api.sendEvent({
                        name: 'setf5loadEvent'
                    });
                    api.sendEvent({
                        name: 'loginsucesspst'
                    });
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