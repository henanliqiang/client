/**
 * 线上签约店铺管理
 * @authors 郭小北 (kubai666@126.com)
 * @date    2016-05-31 17:27:39
 * @version 0.0.1
 */

// 声明vue加载
var vm = new Vue({
    el: '#info-frm',
    data: {
        tianniu_userSetdata: {},
        map_txtinfo: '正在努力获取数据 请稍后...',
        ShopAndServicedata: {}
    },
    methods: {
        //初始化
        init: function() {
            // var tianniu_userSetdata = vm.tianniu_userSetdata = $api.getStorage("tianniu_userSetdata");
            // 获取预约信息
            // vm.ShopAndServicedata = $api.getStorage("ShopAndServicedata");
            vm.ShopAndServicedata = api.pageParam.ShopAndServicedata;
            vm.isloginUrl();
        },
        // 是否交了押金等状态
        isloginUrl: function() {
            // 是否交了押金
            // isdeposit:"是否已缴纳押金 0：否 1：是",
            // isinstall:"是否可安装电池 0：否 1：是",
            if (vm.ShopAndServicedata.isdeposit === 0) {
                vm.map_txtinfo = '您还没有支付押金，暂时无法使用安装、换电服务';
            } else {
                vm.map_txtinfo = '请选择就近门店预约安装电池';
                api.setFrameAttr({
                    name: 'bmap_info_frm',
                    hidden: false
                });
                // 可以预约-提示消失
                if (vm.ShopAndServicedata.isSoon === 1) {
                    // 您的租期即将到期
                    vm.map_txtinfo = '您的租期即将到期，请尽快续租';
                }
                if (vm.ShopAndServicedata.isoverdue === 1) {
                    // 您的租期已逾期
                    vm.map_txtinfo = '您的租期已逾期，每日会扣除押金，请续租';
                }

            }
        },
        jumpinfoPages: function() {
            if (vm.ShopAndServicedata.isdeposit === 0) {
                // 没押金 强制跳转押金页面
                jumpUrl.welcome_nobatteries();
            }
            if (vm.ShopAndServicedata.isSoon === 1) {
                // 即将到期
                jumpUrl.battery_isrenew();
            }
            if (vm.ShopAndServicedata.isoverdue === 1) {
                // 您的租期已逾期
                jumpUrl.battery_isrenew();
            }
        },
    },
});

apiready = function() {
    api.parseTapmode();
    vm.init();
    // 接受重新加载监听
    api.addEventListener({
        name: 'setf5loadEvent'
    }, function(ret, err) {
        vm.init();
    });
}