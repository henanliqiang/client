/**
 * Created by PhpStorm.
 * User: 1374123758@qq.com
 * NickName: 郭小北
 * Date: 2017/3/20 12:05
 */




// 声明vue加载
var vm = new Vue({
    el: '#reset-pwd-frm',
    data: {
        mobile: "",
        smsCode: '',
        password: "",
        asspassword: "",
    },
    methods: {
        saveBtn: function () {
            //验证 密码
            if (vm.password.trim() == '') {
                api.toast({
                    msg: "请输入密码",
                    location: 'middle'
                });
                return false;
            } else if (vm.password.trim().length < 6) {
                api.toast({
                    msg: "密码最少为6位",
                    location: 'middle'
                });
                return false;
            }
            if (vm.password != vm.asspassword) {
                api.toast({
                    msg: "两次密码必须一致",
                    location: 'middle'
                });
                return false;
            }
            apps.axpost(
                "n/customerRegister/forgetPassword", { //需要提交的参数值
                    bindcellphone: vm.mobile,
                    password: Encrypt(vm.password),
                    validateCode: vm.smsCode,
                    //token: GLOBALconfig.gloabltoken
                },
                function (data) {
                    alert('重设密码成功');
                    //跳转到 登录 页面
                    jumpUrl.login();
                });
        },
        init: function () {
        }
    }
});

apiready = function () {
    vm.mobile = api.pageParam.mobile;
    vm.smsCode = api.pageParam.smsCode;
    //下拉刷新
    apps.pageDataF5(function () {
        vm.init();
    });
    //初始化
    vm.init();
};