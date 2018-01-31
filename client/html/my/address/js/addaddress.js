/**
 * 我的会员记录
 * @authors 郭小北 (kubai666@126.com)
 * @date    2016-05-31 17:27:39
 * @version 0.0.1
 */

// 声明vue加载
// 声明vue加载
var vm = new Vue({
    el: '#addressmanage-frm',
    data: {
        addresslist: [],
        currentindex: 0,
    },
    methods: {
        //收货地址列表
        addressList: function () {
            apps.axget(
                "deliverAddress/selectDeliverAddress", {},
                //请求成功时处理
                function (data) {
                    vm.addresslist = data;

                }
            );
        },
        //设置默认
        updateDefault: function (id, index) {
            apps.axpost(
                "deliverAddress/updateDefault", {
                    id: id
                },
                //请求成功时处理
                function (data) {
                    for (var i = 0; i < vm.addresslist.length; i++) {
                        vm.addresslist[i].isdefault = 0;
                    }
                    vm.addresslist[index].isdefault = 1;
                }
            )
        },
        //删除收货地址
        deleteDeliverAddress: function (item) {
            var dialog = new auiDialog({});
            dialog.alert({
                msg:'确定删除当前地址信息?',
                buttons:['取消','确定']
            },function(ret){
                if(ret.buttonIndex==2){
                    apps.axpost(
                        "deliverAddress/deleteAddressById", {
                            id: item.id,
                            isDefault: item.isdefault,
                            iscompaddress: 0
                        },
                        //请求成功时处理
                        function (data) {
                            api.toast({
                                msg:"删除成功",
                                duration: 2000,
                                location: 'middle'
                            });
                            //vm.addresslist.$remove(item);
                            vm.init();
                     })
                }
            })
        },
        //修改收货地址
        updateAddress: function (item) {
            jumpUrl.updateaddress({addobj:item});
        },
        //初始化
        init: function () {
            // 获取数据
            vm.addressList();
        },
        //地址切换
        changeAddress: function (e,index,item) {
            //console.log(e+'='+index);
            vm.currentindex = index;
            api.sendEvent({
                name: 'create_address_modify',
                extra: item
            });
        }
    }
});
apiready = function () {
    //下拉刷新
    apps.pageDataF5(function () {
        vm.init();
    });

    //页面初始化
    vm.init();

    api.addEventListener({
        name: 'address_list_init'//更新地址列表
    }, function (ret, err) {
        vm.init();
    });

};