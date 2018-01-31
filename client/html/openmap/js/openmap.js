/**
 * 线上签约店铺管理
 * @authors 郭小北 (kubai666@126.com)
 * @date    2016-05-31 17:27:39
 * @version 0.0.1
 */

// 声明vue加载
var vm = new Vue({
    el: '#openmap-frm',
    data: {
        bMap: {},
	userNotice: {},
        storeSetdata: {},
        // 预约信息
        ShopAndServicedata: {},
        setLocationxy: {}, //当前xy 坐标

        // 店铺数据
        shopListdata: {
            shopList: []
            /*[{
                id: 1,
                x: 113.749292,
                y: 34.724314
            }, {
                id: 2,
                x: 113.742195,
                y: 34.731746
            }, {
                id: 3,
                x: 113.7342,
                y: 34.751486
            }];*/
        },
        // 地图店铺标记
        annotationsArr: [],
        // map地图数据
        setBmap: 
	{
            // 默认定位
            lon: 116.4021310000,
            lat: 39.9994480000
        },
	//用户公告状态
        noticeStatus: 0
    },
    computed: {
        // 缴费状态变化
        ispayfeeclass: function() {
            return {
                'block-item': this.storeSetdata.ispayfee == 1,
                'block-item-success': this.storeSetdata.ispayfee == 1,
                'block-item-click': this.storeSetdata.ispayfee == 0 && this.storeSetdata.auditstatus == 2
            }
        }
    },
    methods: {
        //初始化
        init: function() {
		//获取用户公告
          apps.axget(
              "userPlatformNoticeController/selectOneUserNotice", {},
              function(data) {
                if (data) {
                  vm.userNotice = data;
                }
            });
            vm.bMap = api.require('bMap');

            // 加载地图
            vm.openbmp();
	    // var notice = $api.getStorage("noticeCode");
            // if (notice === undefined) {
            //   setTimeout(function(){
            //     vm.popNotices();
            //   },1500);
            //   notice = 1;
            //   $api.setStorage("noticeCode",notice);
            // }
            setTimeout(function(){
              var notice = $api.getStorage("noticed");
              if (notice === undefined) {
                vm.popNotices();
                notice = 1;
                $api.setStorage("noticed",notice);
              }
            },2000);
            // 获取店铺列表数据
            vm.getselectShopList();
            // 覆盖物、状态栏显示
            vm.getShopAndService();
            // 是否定位
            vm.bMap.getLocationServices(function(ret, err) {
                if (ret.enable) {
                    // 开始定位
                    vm.bMap.getLocation({
                        accuracy: '10m',
                        autoStop: true,
                        filter: 1,
                    }, function(ret, err) {
                        if (ret.status) {
                            // alert(JSON.stringify(ret));
                            vm.setBmap.lon = ret.lon;
                            vm.setBmap.lat = ret.lat;
                            // 保存如本地缓存
                            $api.setStorage("setLocationxy", { x: vm.setBmap.lon, y: vm.setBmap.lat });
                            vm.setMapGpsst(ret.lon, ret.lat);
                        } else {
                            alert('定位异常码：' + err.code);
                        }
                    });
                } else {
                    alert("请开启定位功能");
                }
            });

            // vm.bMap.show();
        },
        // 获取预约等信息
        getShopAndService: function() {
            apps.axget(
                "bespeak/selectShopAndService", {},
                function(data) {
                    vm.ShopAndServicedata = data;
                    $api.setStorage("ShopAndServicedata", vm.ShopAndServicedata);
                    if (vm.ShopAndServicedata) {
                        vm.setmapIcons();
                    }
                });
            // 每隔 20秒请求一次最新状态
            /*setTimeout(function() {
                vm.getShopAndService();
            }, 30000);*/
        },
        // 获取店铺列表
        getselectShopList: function() {
            apps.axget(
                "bespeak/selectShopList", {},
                function(data) {
                    vm.shopListdata.shopList = data;
                    // 添加店铺覆盖物
                    if (vm.ShopAndServicedata) {
                        vm.addShopsmapInfos();
                    }

                });
        },
        openbmp: function() {
            vm.bMap.open({
                rect: {
                    x: 0,
                    y: 0,
                    w: api.winWidth,
                    h: api.winHeight,
                    marginL:0,
                    marginT:0,
                    marginB:0,
                    marginR:0
                },
                center: {
                    lon: vm.setBmap.lon,
                    lat: vm.setBmap.lat
                },
                zoomLevel: 15,
                showUserLocation: true,
                fixedOn: api.frameName,
                fixed: true
            }, function(ret) {
                if (ret.status) {
                    api.toast({
                        msg: '地图加载成功',
                        duration: 2000,
                        location: 'middle'
                    });
                }
            });
            // 设置百度地图相关属性
            /*取值范围：
            standard（ 标准地图）
            trafficOn（ 打开实时路况）
            trafAndsate（ 实时路况和卫星地图）
            satellite（ 卫星地图）*/
            /*vm.bMap.setMapAttr({
                type: 'standard'
            });*/
            // 监听地图点击
            /*vm.bMap.addEventListener({
                name: 'click'
            }, function(ret) {
                if (ret.status) {
                    // alert(JSON.stringify(ret));
                    // vm.setMapGpsst();
                }
            });*/
            // 设置百度地图指南针位置
            /*vm.bMap.setCompass({
                position: {
                    x: 100,
                    y: 300
                }
            });*/
            // 回到当前定位 等图标
            api.openFrame({
                name: 'bmap_iconcenter_frm',
                url: 'bmap_iconcenter_frm.html',
                rect: {
                    x: 10,
                    y: (api.winHeight * 0.7),
                    w: 50,
                    h: 110
                },
                bounces: false,
                vScrollBarEnabled: false,
                hScrollBarEnabled: false
            });
            // SOS 帮助
            api.openFrame({
                name: 'bmap_sos_frm',
                url: 'bmap_sos_frm.html',
                rect: {
                    x: (api.winWidth - 60),
                    y: (api.winHeight * 0.7 - 60),
                    w: 50,
                    h: 170
                },
                bounces: false,
                vScrollBarEnabled: false,
                hScrollBarEnabled: false
            });
        },
        // 状态栏、图标覆盖加载等
        setmapIcons: function(lon, lat) {

            setTimeout(function() {
                // 是否交了押金
                //isdeposit:"是否已缴纳押金    0：否 1：是",
                // isoverdue:"是否已逾期    0：否 1：是",
                // isinstall:"是否可安装电池  0：否 1：是",
                // isabnormal:"是否电池已损坏 0：否 1：是",
                if ((vm.ShopAndServicedata.isdeposit === 0 && vm.ShopAndServicedata.isabnormal === 0) || vm.ShopAndServicedata.isoverdue === 1) {
                    api.openFrame({
                        name: 'bmap_info_frm',
                        url: 'bmap_info_frm.html',
                        rect: {
                            x: 0,
                            y: 40,
                            w: 'auto',
                            h: 60
                        },
                        bounces: false,
                        reload: true,
                        pageParam: { ShopAndServicedata: vm.ShopAndServicedata },
                        vScrollBarEnabled: false,
                        hScrollBarEnabled: false
                    });
                    api.setFrameAttr({
                        name: 'bmap_info_frm',
                        hidden: false
                    });
                } else {
                    // 若有预约信息
                    if (vm.ShopAndServicedata.bespeak != '') {
                        // 预约提示状态栏-倒计时
                        api.openFrame({
                            name: 'bmap_appointinfo_frm',
                            url: 'bmap_appointinfo_frm.html',
                            rect: {
                                x: 0,
                                y: 40,
                                w: 'auto',
                                h: 150
                            },
                            bounces: false,
                            vScrollBarEnabled: false,
                            hScrollBarEnabled: false,
                            reload: true,
                            pageParam: { ShopAndServicedata: vm.ShopAndServicedata },
                        });
                        api.setFrameAttr({
                            name: 'bmap_info_frm',
                            hidden: true
                        });
                    } else {
                        /*api.setFrameAttr({
                            name: 'bmap_appointinfo_frm',
                            hidden: true
                        });*/
                        api.closeFrame({
                            name: 'bmap_appointinfo_frm'
                        });
                        // isinstall:"是否可安装电池 0：否 1：是",
                        if (vm.ShopAndServicedata.isinstall === 1 || vm.ShopAndServicedata.isSoon === 1) {
                            api.openFrame({
                                name: 'bmap_info_frm',
                                url: 'bmap_info_frm.html',
                                rect: {
                                    x: 0,
                                    y: 40,
                                    w: 'auto',
                                    h: 60
                                },
                                bounces: false,
                                reload: true,
                                pageParam: { ShopAndServicedata: vm.ShopAndServicedata },
                                vScrollBarEnabled: false,
                                hScrollBarEnabled: false
                            });
                            api.setFrameAttr({
                                name: 'bmap_info_frm',
                                hidden: false
                            });
                        } else {
                            // 发送监听 让预约状态栏-倒计时 上提
                            api.setFrameAttr({
                                name: 'bmap_info_frm',
                                hidden: true
                            });

                            api.closeFrame({
                                name: 'bmap_appointinfo_frm'
                            });
                        }
                    }
                }

            }, 600);
            // 接受当前监听
            api.addEventListener({
                name: 'setMapGpsEvent'
            }, function(ret, err) {
                vm.setMapGpsst();
            });
            // 接受重新加载监听
            api.addEventListener({
                name: 'setf5loadEvent'
            }, function(ret, err) {
                vm.setf5loadEvent();
            });
            // 接受SOS监听
            api.addEventListener({
                name: 'setSOSpgEvent'
            }, function(ret, err) {
                vm.setSOSpgEventBtn();
            });
            // 接受SOS监听
            api.addEventListener({
                name: 'setHelpEvent'
            }, function(ret, err) {
                vm.setHelpEventBtn();
            });
        },
        // 重新定位当前位置
        setMapGpsst: function(lon, lat) {
            api.toast({
                msg: '回到当前位置',
                duration: 2000,
                location: 'middle'
            });
            vm.bMap.showUserLocation({
                isShow: true,
                trackingMode: 'none'
            });
        },
        // 重新加载地图
        setf5loadEvent: function(lon, lat) {
            vm.bMap.close();
            api.toast({
                msg: '重新加载地图',
                duration: 2000,
                location: 'middle'
            });
            vm.init();
        },
        // SOS
        setSOSpgEventBtn: function(lon, lat) {
            alert('请与店家沟通，寻求支援');
            vm.setLocationxy = $api.getStorage("setLocationxy");
            // 获取店铺信息详情

            apps.axget(
                "bespeak/selectShopListByPage", {
                    x: vm.setLocationxy.x,
                    y: vm.setLocationxy.y,
                    pageNo: 1,
                    pageSize: 1,
                },
                function(data) {
                    var shopsosData = data.datas[0];
                    var hmlss = '' + shopsosData.name + '(' + shopsosData.no + ')' +
                        ' \n 地址：' + shopsosData.address+'\n 距离：' + (shopsosData.distance / 1000).toFixed(2) + '公里';
                    api.actionSheet({
                        title: hmlss,
                        cancelTitle: '取消',
                        // destructiveTitle: '红色警告按钮',
                        buttons: [shopsosData.contactcellphone]
                    }, function(ret, err) {
                        var index = ret.buttonIndex;
                        // 拨打电话
                        if (index == 1) {
                            api.call({
                                type: 'tel_prompt',
                                number: shopsosData.contactcellphone
                            });
                        }
                    });
                });
        },
        // help帮助
        setHelpEventBtn: function(lon, lat) {
            jumpUrl.hemlpagewe();
        },
        // 添加覆盖物-标识店铺位置
        addShopsmapInfos: function() {
            // 根据店铺信息遍历地图标记
            // 添加店铺覆盖物
            var shopList, setBubbleArr, annotationsArr, annotationsNohd = [];
            shopList = vm.shopListdata.shopList; // 店铺列表
            annotationsArr = vm.annotationsArr; // 坐标对象列表
            shopList.forEach(function(item) {
                // isActive:"是否参加活动 0：否 1：是"
                if (item.isActive == 1) {
                    annotationsArr.push({
                        id: item.id,
                        lon: item.x,
                        lat: item.y,
                    });
                } else {
                    annotationsNohd.push({
                        id: item.id,
                        lon: item.x,
                        lat: item.y,
                    });
                }

            });
            console.log('有活动商铺坐标:' + JSON.stringify(annotationsArr));
            console.log('无活动商铺坐标:' + JSON.stringify(annotationsNohd));

            if (annotationsArr) {
                vm.bMap.addAnnotations({
                    annotations: annotationsArr,
                    icon: 'widget://image/map/hdShopicon@3x.png',
                    draggable: true
                }, function(ret) {
                    if (ret) {
                        // alert(JSON.stringify(ret));
                        api.sendEvent({
                            name: 'setshopmapInfoEvent',
                            extra: {
                                shopid: ret.id
                            }
                        });
                        apps.openMapWinUrl('mapshops_infos_frm', 'openmap/shops_infos_frm.html', { shopid: ret.id });
                    }
                });
            }
            if (annotationsNohd) {
                vm.bMap.addAnnotations({
                    annotations: annotationsNohd,
                    icon: 'widget://image/map/ptShopicon@3x.png',
                    draggable: true
                }, function(ret) {
                    if (ret) {
                        // alert(JSON.stringify(ret));
                        api.sendEvent({
                            name: 'setshopmapInfoEvent',
                            extra: {
                                shopid: ret.id
                            }
                        });
                        apps.openMapWinUrl('mapshops_infos_frm', 'openmap/shops_infos_frm.html', { shopid: ret.id });
                    }
                });
            }

            // 遍历输出网点详情
            /*shopList.forEach(function(item) {
                // 点击商铺 弹出气泡信息
                vm.bMap.setBubble({
                    id: item.id,
                    // bgImg: 'widget://image/map/hdShopicon@3x.png',
                    content: {
                        title: item.name,
                        subTitle: item.address,
                        illus: 'http://ico.ooopic.com/ajax/iconpng/?id=145044.png'
                    },
                    styles: {
                        titleColor: '#000',
                        titleSize: 14,
                        subTitleColor: '#999',
                        subTitleSize: 12,
                        illusAlign: 'left'
                    }
                }, function(ret) {
                    if (ret) {
                        // alert(JSON.stringify(ret));
                        apps.openMapWinUrl('mapshops_infos_frm', 'openmap/shops_infos_frm.html', { shopid: item.id });
                    }
                });
            });*/
        },

	//弹出用户公告
        popNotices: function() {
          //获取用户公告
          apps.axget(
              "userPlatformNoticeController/selectOneUserNotice", {},
              function(data) {
                if (data) {
                  vm.userNotice = data;
                }
            });
          if (vm.userNotice.content) {
            //获取用户公告
            apps.axget(
                "userPlatformNoticeController/selectOneUserNotice", {},
                function(data) {
                  if (data) {
                    vm.userNotice = data;
                  }
              });

            var dialogBox = api.require('dialogBox');
            dialogBox.alert({
              texts: {
                title:vm.userNotice.title,
                content:vm.userNotice.content,
                leftBtnTitle: '取消',
                rightBtnTitle: '已阅读'
              },
              styles: {
                bg: '#fff',
                w: api.winWidth - 48,
                h: api.winHeight - 100,
                title: {
                  marginT: 20,
                  icon: './images/logo.png',
                  iconSize: 40,
                  titleSize: 17,
                  titleColor: '#000'
                },
                content: {
                  color: '#000',
                  size: 14
                },
                left: {
                  marginB: 7,
                  marginL: 20,
                  w: 100,
                  h: 35,
                  corner: 2,
                  bg: '#90EE90',
                  color: '#ffffff',
                  size: 12
                },
                right: {
                  marginB: 7,
                  marginL: 70,
                  w: 100,
                  h: 35,
                  corner: 2,
                  bg: '#90EE90',
                  color: '#ffffff',
                  size: 12
                }
              }
            }, function(ret) {
              if (ret.eventType == 'right' || ret.eventType == 'left') {
                var dialogBox = api.require('dialogBox');
                dialogBox.close({
                  dialogName: 'alert'
                });
              }
            });
          }
        }
    },
});

apiready = function() {
    // 实现沉浸式效果
    /*api.setStatusBarStyle({
        style: 'dark'
    });*/
    // ios特殊处理状态栏
    if (api.systemType == 'ios') {
        api.openFrame({
            name: 'btop_bgcolor_frm',
            url: 'btop_bgcolor_frm.html',
            rect: {
                x: 0,
                y: 0,
                w: 'auto',
                h: 20
            },
            bounces: false,
            vScrollBarEnabled: false,
            hScrollBarEnabled: false
        });
    }
    api.parseTapmode();
    vm.init();
    // 接受重新加载监听
    api.addEventListener({
        name: 'setf5loadEvent'
    }, function(ret, err) {
        vm.setf5loadEvent();
    });
};