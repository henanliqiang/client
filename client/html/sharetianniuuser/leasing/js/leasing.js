/**
 *  注册JS 逻辑功能
 * @authors 郭小北 (kubai666@126.com)
 * @date    2017-03-14 14:50:40
 * @version v0.0.1
 */

// 登录部分、操作
// (function() {
// 声明vue加载
var vm = new Vue({
    el: '#app-register-form',
    data: {
        mobile: "",
        password: "",
        asspassword: "",
        smsCode: "",
        sendsmobilOK: true, // 手机合格，验证码发送
        sendsbtnst: "点击获取",
        agressredtxt: true,
        referee: "", //推荐人手机号
    },
    methods: {
        registerBtn: function() {
            //验证 手机号、短信等
            if (!loginUsermobile()) {
                return false;
            }
            if (vm.smsCode.trim() == '') {

                layer.open({
                    content: "请输入验证码",
                    skin: 'msg',
                    time: 2 //2秒后自动关闭
                });
                return false;
            }

            if (!loginPassword()) {
                return false;
            }
            if (!vm.asspasswordBtn()) {
                return false;
            }

            apps.axpost(
                "n/customerRegister/mobileUser", { //需要提交的参数值
                    mobile: vm.mobile,
                    password: vm.password,
                    smsCode: vm.smsCode,
                    referee: vm.referee,
                },
                function(data) {
                    // 注册成功
                    layer.open({
                        content: "注册成功",
                        skin: 'msg',
                        time: 2 //2秒后自动关闭
                    });
                    // jumpUrl.RegisterSucess();
                    window.location.href = GLOBALconfig.h5share_url + 'success.html?mobilentel=' + vm.mobile;
                });
        },
        sendsmsBtn: function(event) {
            // 短信验证码发送
            apps.axpost(
                "n/sms/sendMobileSms", {
                    mobile: vm.mobile,
                },
                function(data) {
                    // 60秒后才能发送效果
                    apps.sendtimeovers('60', '.sendsmsBtn');
                });
        },
        passwordvalBtn: function() {
            // 验证密码
            loginPassword();
        },
        mobileInfo: function() {
            // 验证手机号
            loginUsermobile()
        },
        asspasswordBtn: function() {
            if (vm.password != vm.asspassword) {
                layer.open({
                    content: "两次密码必须一致",
                    skin: 'msg',
                    time: 2 //2秒后自动关闭
                });
                return false;
            }
            return true;
        },
        init: function() {
            var RequestUrl = GetRequest();
            vm.referee = RequestUrl['refereeuser'];
        }
    }
});

// 用户名验证
var loginUsermobile = function() {
    var vmobile = vm.mobile;
    var re = /0?(13|14|15|17|18)[0-9]{9}/;
    if (vmobile.trim()) {
        if (re.test(vmobile)) {
            return true;
        } else {

            layer.open({
                content: "请输入正确的手机号码",
                skin: 'msg',
                time: 2 //2秒后自动关闭
            });
            return false;
        }
    } else {

        layer.open({
            content: "手机号不能为空",
            skin: 'msg',
            time: 2 //2秒后自动关闭
        });
        return false;
    }
};

// 密码验证
var loginPassword = function() {
    if (vm.password) {
        if (vm.password.length < 6) {
            // 密码少于6位数
            layer.open({
                content: "密码最少为6位",
                skin: 'msg',
                time: 2 //2秒后自动关闭
            });
            return false;
        }
        return true;
    } else {
        layer.open({
            content: "请输入有效密码",
            skin: 'msg',
            time: 2 //2秒后自动关闭
        });
        return false;
    }
};
// 初始化
vm.init();