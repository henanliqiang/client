/**
 * Created by PhpStorm.
 * User: 1374123758@qq.com
 * NickName: 郭小北
 * Date: 2017/3/14 16:22
 */


// 声明vue加载
var vm = new Vue({
    el: '#modifypwd-frm',
    data: {
        oldpwd: '', //旧密码
        newpwd: '', //新密码
        confirmpwd: '', //确认新密码
    },
    methods: {
        //修改密码
        saveBtn: function() {
            var toast = new auiToast();
            if (!vm.oldpwd) {
                toast.fail({
                    title: "原密码不能为空",
                    duration: 2000
                });
                return false;
            }
            if (!vm.newpwd) {
                toast.fail({
                    title: "新密码不能为空",
                    duration: 2000
                });
                return false;
            }
            if (!vm.confirmpwd) {
                toast.fail({
                    title: "确认密码不能为空",
                    duration: 2000
                });
                return false;
            }
            if (vm.newpwd != vm.confirmpwd) {
                toast.fail({
                    title: "新密码与确认密码不一致",
                    duration: 2000
                });
                return false;
            }
            apps.axpost(
                "customer/updatePassword", { //需要提交的参数值
                    oldPassword: vm.oldpwd,
                    password: Encrypt(vm.newpwd),
                },
                function(data) {
                    alert("新密码修改成功");
                    //清空弹窗input内容
                    vm.oldpwd = '';
                    vm.newpwd = '';
                    vm.confirmpwd = '';
                    api.closeWin();
                });
        }
    }
});