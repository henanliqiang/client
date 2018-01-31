/**
 * Created by PhpStorm.
 * User: 1374123758@qq.com
 * NickName: 郭小北
 * Date: 2017/3/21 16:02
 */

// 声明vue加载
var vm = new Vue({
    el: '#updateaddress-frm',
    data: {
        addobj:{
            customername: '',    //是	 客户名称
            countryid: 100000,	//是	int	国家id
            countryname: '中国',	//是	string	国家名称
            provinceid: 0,	//是	int	省级id
            provincename: '',	//是	string	省级名称
            cityid: 0,	    //是	int	市级id
            cityname: '',	//是	string 市级名称
            countyid: 0,	//否	int	县级id
            countyname: '',	//否	string 县级名称
            address: '',	    //是 详细地址
            receiver: '',	//是	 收货人姓名
            cellphone: '',	//是	 联系人手机
            postcode: '',
        },

        // pos_province: '',
        // pos_city: '',
        // pos_district: '',
        pos_name: '',
    },
    methods: {
        //初始化
        init: function () {
            vm.pos_name = vm.addobj.provincename + '  ' + vm.addobj.cityname + '  ' + vm.addobj.countyname;
        }
    }
});

apiready = function () {
    vm.addobj = api.pageParam.addobj;

    //下拉刷新
    apps.pageDataF5(function () {
        vm.init();
    });

    //初始化
    vm.init();

    var addressView = api.require('addressView');
    addressView.open({
        file_addr: 'widget://res/district.txt', //数据源地址
        selected_color: '#ff0000', //颜色
        pro_id: 410000, //省id
        city_id: 410100, //市id
        dir_id: 410104 //区id
    });
    $api.addEvt($api.byId("addressView"), 'click', function () {
        addressView.show({}, function (ret, err) {
            if (ret.status) {
//                    vm.pos_province = ret.data[0].id;
//                    vm.pos_city = ret.data[1].id;
//                    vm.pos_district = ret.data[2].id;

                vm.addobj.provinceid = ret.data[0].id;
                vm.addobj.cityid = ret.data[1].id;
                vm.addobj.countyid = ret.data[2].id;
                vm.addobj.provincename = ret.data[0].name;
                vm.addobj.cityname = ret.data[1].name;
                vm.addobj.countyname = ret.data[2].name;

                vm.pos_name = ret.data[0].name + '  ' + ret.data[1].name + '  ' + ret.data[2].name;
            }
        });
    });
};


function saveBtn() {
    if (vm.pos_name == '') {
        api.toast({
            msg: "请选择收货地址",
            location: 'middle'
        });
        return false;
    }
    if (vm.addobj.address == '') {
        api.toast({
            msg: "请输入收货人姓名",
            location: 'middle'
        });
        return false;
    }
    if (vm.addobj.cellphone == '') {
        api.toast({
            msg: "请输入联系人手机",
            location: 'middle'
        });
        return false;
    }
    apps.axpost(
        "deliverAddress/update", { //需要提交的参数值
            id:vm.addobj.id,   //id
            customername: vm.addobj.customername,    //是	 客户名称
            countryid: vm.addobj.countryid,	//是	int	国家id
            countryname: vm.addobj.countryname,	//是	string	国家名称
            provinceid: vm.addobj.provinceid,	//是	int	省级id
            provincename: vm.addobj.provincename,	//是	string	省级名称
            cityid: vm.addobj.cityid,	    //是	int	市级id
            cityname: vm.addobj.cityname,	//是	string 市级名称
            countyid: vm.addobj.countyid,	//否	int	县级id
            countyname: vm.addobj.countyname,	//否	string 县级名称
            address: vm.addobj.address,	    //是 详细地址
            receiver: vm.addobj.receiver,	//是	 收货人姓名
            cellphone: vm.addobj.cellphone,	//是	 联系人手机
            postcode: vm.addobj.postcode,	//否	 邮编
        },
        function (data) {
            api.toast({
                msg:"修改成功",
                duration: 2000,
                location: 'middle'
            });
            api.sendEvent({
                name: 'address_list_init'
            });
            setTimeout(function () {
                jumpUrl.addressmanage();
            },200);
        });
}