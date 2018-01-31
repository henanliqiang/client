/**
 *  login 登录JS 逻辑功能
 * @authors 郭小北 (kubai666@126.com)
 * @date    2016-06-02 14:50:40
 * @version v0.0.1
 */

// 登录部分、操作
// 查看是否有本地数据（记住用户名）
// (function() {

// 声明vue加载
var vm = new Vue({
    el: '#app-login-form',
    data: {
        // login_data: {
        username: "",
        password: "",
        gloabluserToken: "",
        remembercheck: true,
        localrememberstas: '', //本地缓存记住状态
        tianniu_userSetdata: {}, //店铺数据基础设置缓存
        // },
    },
    methods: {
	init: function() {
          // vm.loadnoticeStorage();
          // vm.savenoticeStorage();
          // 获取本地记录数据
          vm.loadusernameStorage();
        },
        //登陆按钮
        loginBtn: function() {
            //验证 用户名、密码
            if (!loginUserName()) {
                return false;
            }
            if (!loginPassword()) {
                return false;
            }
            var password = Encrypt(vm.password); // 加密
            api.toast({
                msg: "正在登录，请稍后...",
                location: 'middle'
            });
            // 登录系统...
            apps.axpost(
                "n/customerLogin/login", { //需要提交的参数值
                    username: vm.username,
                    password: password
                },
                function(data) {
                    // 传值全局userToken标识
                    vm.gloabluserToken = GLOBALconfig.gloabluserToken = data.userToken;
                    vm.tianniu_userSetdata = data;
                    //api.setPrefs设置登录成功状态
                    api.setPrefs({
                        key: 'loginStatus',
                        value: 'loginSuccess'
                    });
                    // 添加【登录成功】事件监听
                    api.sendEvent({
                        name: 'loginSuccess',
                        extra: {
                            username: vm.username,
                            userToken: vm.gloabluserToken
                        }
                    });

                    // 存入本地缓存数据
                    vm.saveusernameStorage();
                });
        },
        // 记住用户名保存本地
        saveusernameStorage: function() {
            var remembercheck = vm.remembercheck;
            var username = vm.username;
	    var passwordNum = vm.password;
            /*if (remembercheck) {
                $api.setStorage("remembercheck", "yes");
            } else {
                var username = '';
                $api.setStorage("remembercheck", "no");
            }*/
            // 存入用户名和usertoken
            $api.setStorage("appusername", username);
	    $api.setStorage('apppassword', passwordNum);
            api.setPrefs({
                key: 'appusername',
                value: username
            });
	    api.setPrefs({
                key: 'apppassword',
                value: passwordNum
            });
            // usertoken
            $api.setStorage('gloabluserToken', vm.gloabluserToken);
            // 店铺基础设置
            $api.setStorage('tianniu_userSetdata', vm.tianniu_userSetdata);
            api.setPrefs({
                key: 'gloabluserToken',
                value: vm.gloabluserToken
            });
            vm.isloginUrl();
	    //用户公告
            // vm.popNotices();
        },
        // 读取本地缓存
        loadusernameStorage: function() {
            var username = $api.getStorage("appusername");
	    var passwordNum = $api.getStorage('apppassword');
            var remembercheck = $api.getStorage("remembercheck");
            vm.username = username;
	    vm.password = passwordNum;
            if (remembercheck == 'yes') {
                vm.remembercheck = true;
            } else {
                vm.remembercheck = false;
            }
        },
        init: function() {
            // 获取本地记录数据
            vm.loadusernameStorage();
        },
        // 登陆跳转页面
        isloginUrl: function() {
            var tianniu_userSetdata = $api.getStorage("tianniu_userSetdata");
            // 刷新我的
            api.sendEvent({
                name: 'loginsucesspst'
            });

            api.sendEvent({
                name: 'setf5loadEvent'
            });
            // 是否交了押金
            // isdeposit:"是否已缴纳押金 0：否 1：是",
            // isinstall:"是否可安装电池 0：否 1：是",
            // isabnormal:"电池是否损坏 0：否 1：是 "
            if (tianniu_userSetdata.isdeposit === 1 || tianniu_userSetdata.isabnormal === 1) {
                // 跳转首页
                api.sendEvent({
                    name: 'indexinit'
                });
                setTimeout(function() {
                    api.closeToWin({
                        name: 'root'
                    });
                }, 300);
            } else {
                // 没押金 强制跳转押金页面
                jumpUrl.welcome_nobatteries();
            }
        },
    }
});

// 用户名验证
var loginUserName = function() {
    //  * 前端判断状态 为空
    if (vm.username) {
        return true;
    } else {
        api.toast({
            msg: "手机号/用户名不能为空",
            location: 'middle'
        });
        return false;
    }
};

// 密码验证
var loginPassword = function() {
    if (vm.password) {
        vm.password_state = false;
        if (vm.password.length < 6) {
            // 密码少于6位数
            api.toast({
                msg: "密码最少为6位",
                location: 'middle'
            });
            return false;
        }
        return true;
    } else {
        api.toast({
            msg: "请输入有效密码",
            location: 'middle'
        });
        return false;
    }
};

// })();

apiready = function() {
    // 初始化
    vm.init();
}