/**
 * H5企业端分享 page全局配置文件
 * @authors 郭小北 (kubai666@126.com)
 * @date    2016-05-31 17:27:39
 * @version 0.0.1
 *
 */

// 全局配置对象
var GLOBALconfig = {};
var apps = {}; //app所有交互函数包装
var jumpUrl = {};

(function() {
    var serverconfig = {
         // 前端服务器IP
        'web_url': 'http://tianniu.weidinghuo.com/',
        // 后端服务器IP
        'serviceIP': 'http://tianniu.weidinghuo.com/',
        // 分享页面
        'h5share_url': 'sharetianniuuser/leasing/'
    };

    // 接口请求地址、后缀
    var http_api = {
        agent: 'battery/'
    };

    // 后端 接口请求地址
    var agent_api = {
        agent: serverconfig.serviceIP + http_api.agent // 供货端 api
    };

    // 暴露全局变量作用
    GLOBALconfig.serviceIP = serverconfig.serviceIP; // 服務器地址
    GLOBALconfig.h5share_url = serverconfig.web_url + serverconfig.h5share_ur; // 分享

    GLOBALconfig.sharecode = window.localStorage.getItem("sharecode"); // 全局分享分享码

    /**
     * ajax封装 post请求
     * url 发送请求的地址
     * data 发送到服务器的数据，数组存储，如：{"date": new Date().getTime(), "state": 1}
     * dataType 预期服务器返回的数据类型，常用的如：xml、html、json、text
     * successfn 成功回调函数
     * codefn 返回错误码回调函数
     *
     */

    apps.axpost = function(url, param, successfn, codefn) {
        param = (param == null || param == "" || typeof(param) == "undefined") ? { "date": new Date().getTime() } : param;
        setTimeout(function() {
            $.ajax({
                type: "post",
                data: param,
                url: agent_api.agent + url,
                dataType: "json",
                success: function(getData) {
                    allSuccessFun(getData, successfn, codefn);
                },
                error: function() {
                    allErrorsFun();
                }
            });
        }, 600);
    };

    apps.axget = function(url, param, successfn, codefn) {
        param = (param == null || param == "" || typeof(param) == "undefined") ? { "date": new Date().getTime() } : param;
        //loading层
        layer.open({
            type: 2,
            shade: 'background-color: rgba(0,0,0,.4)', //自定义遮罩的透明度
            time: 5
        });
        if (GLOBALconfig.sharecode) {
            setTimeout(function() {
                $.ajax({
                    type: "get",
                    data: param,
                    url: agent_api.agent + url,
                    dataType: "json",
                    success: function(getData) {
                        allSuccessFun(getData, successfn, codefn);
                    },
                    error: function() {
                        allErrorsFun();
                    }
                });
            }, 600);
        } else {
            layer.open({
                content: "分享码失效，请返回重新获取",
                skin: 'msg',
                time: 2 //2秒后自动关闭
            });
        }

    };

    // 发送验证码倒计时
    apps.sendtimeovers = function(sendcount, sendbtnclick) {
        var btn = $(sendbtnclick);
        console.log(sendcount);
        /*if ($.cookie("captcha")) {
            var sendcount = $.cookie("captcha");
        } else {
            var sendcount = sendcount;
        }*/
        var resend = setInterval(function() {
            sendcount--;
            if (sendcount > 0) {
                btn.val(sendcount + "s 后重新获取");
                // $.cookie("captcha", sendcount, { path: '/', expires: (1 / 86400) * sendcount });
                btn.attr('disabled', true).removeClass('aui-btn-info');
            } else {
                clearInterval(resend);
                btn.val("点击获取").removeAttr('disabled').addClass('aui-btn-info');
            }
        }, 1000);

    };

    // 发送验证码验证手机
    apps.sendsmsBtn6666 = function(mobile, sendcount, sendbtnclick) {
        // 手机验证
        var loginUsermobile = function() {
            var vmobile = mobile;
            var re = /0?(13|14|15|17|18)[0-9]{9}/;
            if (vmobile.trim()) {
                if (re.test(vmobile)) {
                    return true;
                } else {
                    layer.open({
                        content: "请输入正确的手机号码",
                        skin: 'msg',
                        time: 2 //2秒后自动关闭
                    });
                    return false;
                }
            } else {
                layer.open({
                    content: "手机号不能为空",
                    skin: 'msg',
                    time: 2 //2秒后自动关闭
                });
                return false;
            }
        };

        //验证 手机号
        if (!loginUsermobile()) {
            return false;
        }
        var mobile = Encrypt('APH5initrpSH][tel032' + mobile); // 加密
        apps.axpost(
            "n/sms/sendWXSms", {
                mobile: mobile,
            },
            function(data) {
                // 60秒后才能发送效果
                apps.sendtimeovers(sendcount, sendbtnclick);
            });
    };

    /**
     * [isMobile 判断平台]
     * @param test: 0:iPhone    1:Android
     */
    apps.ismobile = function(test) {
        var u = navigator.userAgent,
            app = navigator.appVersion;
        if (/AppleWebKit.*Mobile/i.test(navigator.userAgent) || (/MIDP|SymbianOS|NOKIA|SAMSUNG|LG|NEC|TCL|Alcatel|BIRD|DBTEL|Dopod|PHILIPS|HAIER|LENOVO|MOT-|Nokia|SonyEricsson|SIE-|Amoi|ZTE/.test(navigator.userAgent))) {
            if (window.location.href.indexOf("?mobile") < 0) {
                try {
                    if (/iPhone|mac|iPod|iPad/i.test(navigator.userAgent)) {
                        return '0';
                    } else {
                        return '1';
                    }
                } catch (e) {}
            }
        } else if (u.indexOf('iPad') > -1) {
            return '0';
        } else {
            return '1';
        }
    };

    //路由连接跳转
    jumpUrl.RegisterSucess = function() {
        window.location.href = GLOBALconfig.h5share_url + 'success.html';
    };

})();

var all_errors_count = 0;
// ajax成功返回执行函数-全局
function allSuccessFun(getData, successfn, codefn) {

    all_errors_count = 0;
    if (getData) {
        console.log('返回数据：' + JSON.stringify(getData));

        var message = "" || getData.message;
        var code = "" || getData.code;
        var data = "" || getData.data;
        switch (code) {
            // code为 1 说明返回成功
            case 1:
                successfn(data);
                // vue判断dom是否加载完毕
                vm.$nextTick(function() {
                    console.log('dom渲染已经完成')
                    layer.closeAll(); //加载框消失
                });
                break;
            case 0:
            case 9999:
            case 9998:
            case 9997:
            case 9000:
                layer.open({
                    content: message,
                    skin: 'msg',
                    time: 2 //2秒后自动关闭
                });
                break;
            case 1006:
                if (codefn) {
                    codefn(code, message);
                }
                break;
            case 1007:
                layer.closeAll(); //加载框消失
                layer.open({
                    content: '登录超时，请重新登录',
                    skin: 'msg',
                    time: 2 //2秒后自动关闭
                });
                break;
            default:
                layer.closeAll(); //加载框消失
                layer.open({
                    content: message,
                    skin: 'msg',
                    time: 2 //2秒后自动关闭
                });
                if (codefn) {
                    codefn(code, message);
                }
                break;
        }
    }
};
// ajax 通信失败函数-全局
function allErrorsFun(err) {
    // all_errors_count++;
    // if (all_errors_count > 3) {
    // if (err.statusCode == 0) {
    layer.open({
        content: '网络不给力哦，请稍候再试',
        skin: 'msg',
        time: 2 //2秒后自动关闭
    });
    // }
    // }
};

/**
 *  返回
 */
function closeWin(err) {
    window.history.back(-1);
};

function GetRequest() {
    var url = location.href; //获取url中"?"符后的字串
    var theRequest = new Object();
    if (url.indexOf("?") != -1) {
        var str = url.substr(1);
        strs = url.split("?")[1].split("&"); //  &xx= 后面的字符
        for (var i = 0; i < strs.length; i++) {
            theRequest[strs[i].split("=")[0]] = (strs[i].split("=")[1]);
        }
    }
    return theRequest;
}
