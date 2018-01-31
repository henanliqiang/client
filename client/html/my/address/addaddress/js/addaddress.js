/**
 * Created by PhpStorm.
 * User: 1374123758@qq.com
 * NickName: 郭小北
 * Date: 2017/3/21 16:02
 */

// 声明vue加载
var vm = new Vue({
    el: '#addaddress-frm',
    data: {
        customername: '', //是    客户名称
        countryid: 100000, //是  int 国家id
        countryname: '中国', //是  string  国家名称
        provinceid: 0, //是  int 省级id
        provincename: '', //是   string  省级名称
        cityid: 0, //是  int 市级id
        cityname: '', //是   string 市级名称
        countyid: 0, //否    int 县级id
        countyname: '', //否 string 县级名称
        address: '', //是 详细地址
        receiver: '', //是    收货人姓名
        cellphone: '', //是   联系人手机
        postcode: '',

        // pos_province: '',
        // pos_city: '',
        // pos_district: '',
        pos_name: '',
    },
    methods: {
        //初始化
        init: function() {

        }
    }
});

apiready = function() {
    //下拉刷新
    apps.pageDataF5(function() {
        vm.init();
    });

    var addressView = api.require('addressView');
    addressView.open({
        file_addr: 'widget://res/district.txt', //数据源地址
        selected_color: '#ff0000', //颜色
        pro_id: 410000, //省id
        city_id: 410100, //市id
        dir_id: 410104 //区id
    });
    $api.addEvt($api.byId("addressView"), 'click', function() {
        addressView.show({}, function(ret, err) {
            if (ret.status) {
                vm.provincename = ret.data[0].name;
                vm.cityname = ret.data[1].name;
                vm.countyname = ret.data[2].name;

                vm.pos_name = ret.data[0].name + '  ' + ret.data[1].name + '  ' + ret.data[2].name;
            }
        });
    });
};


function saveBtn() {
    if (vm.pos_name.trim() == '') {
        api.toast({
            msg: "请选择收货地址",
            location: 'middle'
        });
        return false;
    }
    if (vm.receiver.trim() == '') {
        api.toast({
            msg: "请输入收货人姓名",
            location: 'middle'
        });
        return false;
    }
    if (vm.cellphone.trim() == '') {
        api.toast({
            msg: "请输入联系人手机",
            location: 'middle'
        });
        return false;
    }
    apps.axpost(
        "deliverAddress/save", { //需要提交的参数值
            customername: vm.customername, //是   客户名称

            countryname: vm.countryname, //是    string  国家名称

            provincename: vm.provincename, //是  string  省级名称

            cityname: vm.cityname, //是  string 市级名称

            countyname: vm.countyname, //否  string 县级名称
            address: vm.address, //是 详细地址
            receiver: vm.receiver, //是   收货人姓名
            cellphone: vm.cellphone, //是     联系人手机
            postcode: vm.postcode, //否   邮编
        },
        function(data) {
            api.toast({
                msg: "添加成功",
                duration: 2000,
                location: 'middle'
            });
            api.sendEvent({
                name: 'address_list_init'
            });
            setTimeout(function() {
                // api.closeWin({
                //     name: 'address_add_win'
                // });
                api.closeWin();
            }, 200);
        });
}