/**
 * Created by PhpStorm.
 * User: 1374123758@qq.com
 * NickName: 郭小北
 * Date: 2017/3/20 12:05
 */




// 声明vue加载
var vm = new Vue({
    el: '#forget-pwd-frm',
    data: {
        mobile: "",
        smsCode: "",
        sendsbtnst: "点击获取",
    },
    methods: {
        validatePhoneBtn: function() {
            //验证 手机号、短信等
            if (!loginUsermobile()) {
                return false;
            }
            if (vm.smsCode.trim() == '') {
                api.toast({
                    msg: "请输入验证码",
                    location: 'middle'
                });
                return false;
            }

            apps.axpost(
                "n/sms/validate", { //需要提交的参数值
                    mobile: vm.mobile,
                    smsCode: vm.smsCode,
                },
                function(data) {
                    //跳转到 重设密码 页面
                    jumpUrl.reset_pwd({ mobile: vm.mobile, smsCode: vm.smsCode });
                });
        },
        sendsmsBtn: function() {
            //验证 手机号
            if (!loginUsermobile()) {
                return false;
            }
            var mobile = Encrypt('AOinitrp][tel' + vm.mobile); // 加密
            // 短信验证码发送
            apps.axpost(
                "n/sms/sendAppSms", {
                    mobile: mobile,
                },
                function(data) {
                    // 60秒后才能发送效果
                    apps.sendtimeovers('60', '.sendsmsBtn');
                });
        },
        init: function() {}
    }
});


apiready = function() {
    //下拉刷新
    apps.pageDataF5(function() {
        vm.init();
    });
    //初始化
    vm.init();
};


// 手机验证
var loginUsermobile = function() {
    var vmobile = vm.mobile;
    var re = /0?(13|14|15|17|18)[0-9]{9}/;
    if (vmobile.trim()) {
        if (re.test(vmobile)) {
            return true;
        } else {
            api.toast({
                msg: "请输入正确的手机号码",
                location: 'middle'
            });
            return false;
        }
    } else {
        api.toast({
            msg: "手机号不能为空",
            location: 'middle'
        });
        return false;
    }
};