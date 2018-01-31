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
    el: '#app-success-form',
    data: {
        mobilentel: "",
        referee: "", //推荐人手机号
    },
    methods: {
        init: function() {
            var RequestUrl = GetRequest();
            vm.mobilentel = RequestUrl['mobilentel'];
        },
        androisapp: function() {
            window.location.href =GLOBALconfig.serviceIP+"jsp/isweixinapp.html";
        },
        iosisapp: function() {
            window.location.href ="https://itunes.apple.com/cn/app/%E5%A4%A9%E7%89%9B%E7%BD%91/id1323946853?l=en&mt=8";

        }
    }
});
// 初始化
vm.init();