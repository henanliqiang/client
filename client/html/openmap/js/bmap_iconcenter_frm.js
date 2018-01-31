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

        map_txtinfo: '定位中...',
    },
    methods: {
        //初始化
        init: function() {

        },
        // 重新定位当前位置-发送监听
        setMapGpsstEvent: function() {
            api.sendEvent({
                name: 'setMapGpsEvent'
            });
        },
        // 重新加载地图
        setf5loadEvent: function() {
            api.sendEvent({
                name: 'setf5loadEvent'
            });
        },
    },
});

apiready = function() {
    api.parseTapmode();
    vm.init();
}