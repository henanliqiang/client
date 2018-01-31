/**
 * 地图默认图标加载
 * @authors 郭小北 (kubai666@126.com)
 * @date    2016-05-31 17:27:39
 * @version 0.0.1
 */

// 声明vue加载
var vm = new Vue({
    el: '#info-frm',
    data: {
	//用户公告
        userNotice: {},
        map_txtinfo: '定位中...',
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
        },
        // SOS求助我们
        setSOSpgEvent: function() {
            api.sendEvent({
                name: 'setSOSpgEvent'
            });
        },
        // 帮助页面
        setHelpEvent: function() {
            api.sendEvent({
                name: 'setHelpEvent'
            });
        },
    },
});

apiready = function() {
    api.parseTapmode();
    vm.init();
}