/**
 * 电池预约详情
 * @authors 郭小北 (kubai666@126.com)
 * @date    2016-05-31 17:27:39
 * @version 0.0.1
 */

// 声明vue加载
var vm = new Vue({
    el: '#earnintegral-frm',
    data: {
        selectuserInfo: {},
        UILoadId: '',
    },
    methods: {
        //初始化
        init: function() {
            vm.getuserInfo();
        },
        // 获取店铺信息详情
        getuserInfo: function() {
            // 加载框
            var UILoading = api.require('UILoading');
            UILoading.flower({
                center: {
                    x: (api.winWidth / 2),
                    y: (api.winHeight / 2)
                },
                size: 30,
                fixed: true
            }, function(ret) {
                vm.UILoadId = ret.id;
            });
            apps.axget(
                "customer/selectInfo", {},
                function(data) {
                    if (data) {
                        // 关闭打开的加载提示框
                        UILoading.closeFlower({
                            id: vm.UILoadId
                        });
                        vm.selectuserInfo = data;
                        // 预约中再生成二维码
                        vm.makeCodeqrcode();
                    }
                });
        },
        // 生成二维码程序
        makeCodeqrcode: function() {
            $('#qrcode').html('');
            // 生成二维码程序
            var qrcode = new QRCode(document.getElementById("qrcode"), {
                width: 100, //设置宽高
                height: 100
            });
            var identcode = GLOBALconfig.h5share_url + '?refereeuser=' + vm.selectuserInfo.username; //二维码内容
            qrcode.makeCode(identcode);

            // 生成大图二维码
            var qrcodeBig = new QRCode(document.getElementById("qrcodeBig"), {
                width: 300, //设置宽高
                height: 300
            });
            var identcode = GLOBALconfig.h5share_url + '?refereeuser=' + vm.selectuserInfo.username; //二维码内容
            qrcodeBig.makeCode(identcode);
        },
        qrcodebigImg: function() {
            // 二维码大图
            apps.openMapWinUrl('openqrcode_img', 'battery/appointinfo/openqrcode_img.html', { qrcodebigImg: $('#qrcodeBig').html() });
        },
    },
});

apiready = function() {
    api.parseTapmode();
    //下拉刷新
    apps.pageDataF5(function() {
        vm.init();
    });
    vm.init();

}