/**
 * 订货端APP page全局配置文件
 * @authors 郭小北 (kubai666@126.com)
 * @date    2016-05-31 17:27:39
 * @version 0.0.1
 *
 */

// 全局配置对象
var GLOBALconfig = {};
(function() {
    var serverconfig = {
        // 前端服务器IP
        'webIP': 'http://192.168.3.157:3000/',
        // 后端服务器IP
        // 'serviceIP': 'http://120.27.20.61:9000/'
        'serviceIP': 'http://192.168.3.120:8080/'
    };

    // 项目访问 前端路径后缀
    var web_path = {
        agent: 'agent/'
    };

    // 接口请求地址、后缀
    var http_api = {
        agent: 'm/'
    };

    // 后端 接口请求地址
    var url_api = {
        agent: serverconfig.serviceIP + http_api.agent // 订货端 api
    };

    // html页面公共配置
    var html_config = {
        title: '微订货',
        // 全局图形验证码
        vmcodeimgs: 'n/images/captcha.jpg'
    };

    // 暴露全局变量作用
    GLOBALconfig.webIP = serverconfig.webIP; // 项目访问地址
    GLOBALconfig.serviceIP = serverconfig.serviceIP; // 服務器地址

    GLOBALconfig.agent_api = url_api.agent; // 订货端 API 请求地址

    GLOBALconfig.agent_webIP = serverconfig.webIP + web_path.agent; // agent 订货端首頁 访问地址

    GLOBALconfig.title = html_config.title;
    GLOBALconfig.vmcodeimgs = GLOBALconfig.agent_api + html_config.vmcodeimgs; // 全局图形验证码

    // 全局token
    GLOBALconfig.gloabltoken = ''; // token防止重复提交

    GLOBALconfig.uploadurl = GLOBALconfig.agent_api + "attach/upload"; // 上传文件的路径';
    GLOBALconfig.edituploadFile = GLOBALconfig.agent_api + "attach/uploadFile"; // 富文本编辑器上传文件 路径';

    // 下拉刷新
    apiready = function() {
        api.parseTapmode();
        var header = $api.byId('header');
        $api.fixStatusBar(header);

        api.setRefreshHeaderInfo({
            loadingImg: 'widget://image/refresh_arrow.png',
            bgColor: '#f4f4f4',
            textColor: '#4d4d4d',
            textUp: '松开立即刷新...',
            showTime: true
        }, function(ret, err) {
            setTimeout("api.refreshHeaderLoadDone()", 600);
        });
    };

})();
