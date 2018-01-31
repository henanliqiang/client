/**
 * 签约合同
 * @authors 郭小北 (kubai666@126.com)
 * @date    2016-05-31 17:27:39
 * @version 0.0.1
 */

// 声明vue加载
var vm = new Vue({
    el: '#agreement-frm',
    data: {
        agreeTxtSta: 1,
    },
    methods: {
        //初始化
        init: function() {},
    }
});

apiready = function() {
    //下拉刷新
    apps.pageDataF5(function() {
        vm.init();
    });
    vm.init();
};

function saveBtn() {
    if (vm.agreeTxtSta == 0) {
        api.toast({
            msg: "请阅读并同意勾选服务协议",
            duration: 2000,
            location: 'middle'
        });
        return false;
    }
    apps.axpost(
        "n/shopRegister/signTreaty", {},
        function(data) {
            api.toast({
                msg: "签约成功",
                duration: 2000,
                location: 'middle'
            });
            //店铺审核状态监听
            api.sendEvent({
                name: 'registerInfo_stats',
                extra: {
                    registerInfo_stats: 1,
                }
            });
            setTimeout(function() {
                api.closeWin();
            }, 1000);
        });
}