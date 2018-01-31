/**
 *  图片附件上传 逻辑功能
 * @authors 郭小北 (6922043.com)
 * @date    2017-03-13 10:50:40
 * @version v0.0.1
 */

//声明加载vue

var vm = new Vue({
    el: "#order-list",
    data: {
        attachlist: [], //附件列表对象
        temp_attachlist: [],
        newaddattachlist: [], //新添加附件
        uploadstatus: 1, //上传状态
        attachTypesImgs: 'attach-1',
        attach_length: 1, // 允许附件个数
    },

    methods: {
        init: function() {
            if (api.pageParam.attachlist) {
                vm.attachlist = api.pageParam.attachlist;
            }
            if (api.pageParam.attachTypes == 'img') {
                vm.attachTypesImgs = 'attach-4';
                vm.attach_length = 4;
            } else {
                vm.attachTypesImgs = 'attach-1';
                vm.attach_length = 1;
            }
            console.log(JSON.stringify(vm.attachlist)); //保存oss临时文件路径集合
        },
        //从图片选择
        image_filter: function() {
            var UIMediaScanner = api.require('UIMediaScanner');
            UIMediaScanner.open({
                type: 'picture',
                column: 4,
                classify: true,
                max: 10,
                sort: {
                    key: 'time',
                    order: 'desc'
                },

            }, function(ret) {
                console.log('图片信息0022：' + JSON.stringify(ret));
                if (ret) {
                    // console.log(ret.eventType);
                    if (ret.eventType == 'confirm') {
                        vm.newaddattachlist = ret.list;
                        /*vm.newaddattachlist.forEach(function (item) {
                         if(item.thumbPath){//分割图片路径获取文件名
                         vm.attachlist.push(item.thumbPath);
                         }
                         });*/
                        vm.newaddattachlist.forEach(function(item) {
                            item.size = (item.size / 1024 / 1024).toFixed(2); //字节转为M
                            if (item.thumbPath) { //分割图片路径获取文件名
                                var strlist = [];
                                strlist = item.thumbPath.split('/');
                                item.filename = strlist[strlist.length - 1];
                            }
                        });
                        var middleobj = { //数组key值转化
                            "url": '',
                            "filename": '',
                            "filesize": ''
                        };
                        // 判断最多添加一张图
                        if (vm.newaddattachlist.length <= vm.attach_length) {
                            if (vm.attachlist.length >= vm.attach_length) {
                                toast("最多选择" + vm.attach_length + "张");
                                return false;
                            }
                            vm.newaddattachlist.forEach(function(item) {
                                middleobj.url = item.path;
                                middleobj.filename = item.filename;
                                middleobj.filesize = item.size;
                                vm.attachlist.push(middleobj);
                                vm.temp_attachlist.push(middleobj);
                                middleobj = {};
                            });

                        } else {
                            toast("最多选择" + vm.attach_length + "张");
                        }
                    }
                }
            });
        },
        //删除附件
        delimg: function(index, item) {
            vm.attachlist.$remove(item);
            vm.temp_attachlist.$remove(item);
            vm.attachlist.splice(index, 1);
            vm.temp_attachlist.splice(index, 1);
        },
        looksimgBtn: function(imgurl) {
            api.openWin({
                name: 'imgurl',
                url: imgurl,
                //slidBackEnabled: false, //禁止右滑 返回
            });
        },
        //拍照
        photograph: function() {
            console.log(33);
            var middleobj = { //数组key值转化
                "url": '',
                "filename": '',
                "filesize": ''
            };
            api.getPicture({
                sourceType: 'camera',
                encodingType: 'jpg',
                mediaValue: 'pic',
                destinationType: 'url',
                allowEdit: true,
                quality: 100,
                targetWidth: 500,
                targetHeight: 500,
                saveToPhotoAlbum: true //是否保存图片系统相册
            }, function(ret, err) {
                if (ret) {
                    console.log(JSON.stringify(ret));
                    var middleobj = { //数组key值转化
                        "url": '',
                        "filename": '',
                        "filesize": ''
                    };
                    middleobj.url = ret.data;
                    if (ret.data) { //分割图片路径获取文件名
                        var strlist = [];
                        strlist = ret.data.split('/');
                        // middleobj.filename = strlist[strlist.length - 1];
                        middleobj.filename = '拍摄图片';
                    }
                    middleobj.filesize = Math.random().toFixed(2);
                    if (vm.attachlist.length >= vm.attach_length) {
                        toast("最多选择" + vm.attach_length + "张");
                        return false;
                    }
                    vm.attachlist.push(middleobj);
                    vm.temp_attachlist.push(middleobj);
                    console.log(JSON.stringify(vm.attachlist));
                } else {
                    console.log(JSON.stringify(err));
                }
            });
        },
        saveattach: function() {
            var imglist = [];
            vm.temp_attachlist.forEach(function(item) {
                if (item.url) { //分割图片路径获取文件名
                    imglist.push(item.url);
                }
            });

            if (imglist.length) {
                vm.uploadstatus = 0;
                apps.axpostupload('attach/upload', {
                    file: imglist
                }, function(data) {
                    vm.attachlist.splice(vm.attachlist.length - imglist.length, imglist.length);
                    vm.temp_attachlist.length = 0;

                    data.forEach(function(item) {
                        item.filesize = item.filesize / 1024 / 1024;
                        item.filesize = item.filesize.toFixed(2);
                        vm.attachlist.push(item);
                    });
                    console.log(JSON.stringify(vm.attachlist));
                    // 附件分类
                    if (api.pageParam.attachTypes == 'contactID') {
                        api.sendEvent({
                            name: 'contactID_attach',
                            extra: { attachlist: vm.attachlist }
                        });
                    }
                    if (api.pageParam.attachTypes == 'businesslicense') {
                        api.sendEvent({
                            name: 'businesslicense_attach',
                            extra: { attachlist: vm.attachlist }
                        });
                    }
                    if (api.pageParam.attachTypes == 'headportrait') {
                        api.sendEvent({
                            name: 'headportrait_attach',
                            extra: { attachlist: vm.attachlist }
                        });
                    }
                    if (api.pageParam.attachTypes == 'batterishdamage') {
                        api.sendEvent({
                            name: 'batterishdamage_attach',
                            extra: { attachlist: vm.attachlist }
                        });
                    }
                    if (api.pageParam.attachTypes == 'photo') {
                        api.sendEvent({
                            name: 'photo_attach',
                            extra: { attachlist: vm.attachlist }
                        });
                    }
                    if (api.pageParam.attachTypes == 'img') {
                        api.sendEvent({
                            name: 'img_attach',
                            extra: { attachlist: vm.attachlist }
                        });
                    }

                    vm.uploadstatus = 1;
                    api.closeWin();
                });
            } else {
                toast("请选择附件后保存");
            }
        },
    }
});

apiready = function() {
    $api.fixStatusBar($api.dom("header"));

    vm.init();
    // 下拉刷新数据...
    apps.pageDataF5(
        // 数据...
        function() {
            vm.init();
        }
    );
};
/*function backclose() {
 api.sendEvent({
 name: 'createorder_attach_frm',
 extra: {remark: vm.newaddattachlist}
 });
 api.closeWin();
 api.toast({
 msg: '提交成功',
 duration: 2000,
 location: 'bottom'
 });
 }*/
function openTakaPicView(data) {
    var data = data;
    closeCame();
    api.openFrame({
        name: 'takaPicViewi',
        //url : data_url,
        url: 'widget://html/zsy/takaPicView.html',
        rect: {
            x: 0, //左上角x坐标
            y: 0, //左上角y坐标
            w: 'auto', //宽度，若传'auto'，页面从x位置开始自动充满父页面宽度
            h: 'auto', //高度，若传'auto'，页面从y位置开始自动充满父页面高度
            marginBottom: 0
        },
        pageParam: data,
        slidBackEnabled: false,
        historyGestureEnabled: false,
        scrollEnabled: false
    });
    //end
}
//start 取消
function cameraMessagecCancel() {
    returnGo();
}
//返回上一个页面
function returnGo() {
    closeCame({
        callBack: function() {
            api.closeWin({});
        }
    });
}