/**
 * 网点端APP page全局配置文件
 * @authors 郭小北 (kubai666@126.com)
 * @date    2016-05-31 17:27:39
 * @version 0.0.1
 *
 */

// 全局配置对象
var GLOBALconfig = {};
var apps = {}; //app所有交互函数包装
var jumpUrl = {}; //跳转页面

(function() {
    var serverconfig = {
        // 前端服务器IP
        'web_url': 'widget://html/',
        // 后端服务器IP
       //  'serviceIP': 'http://192.168.1.121:80/',
      //  'serviceIP': 'http://120.27.204.61:8080/',
	/** 访问后台接口 */
      //  'serviceIP': 'http://192.168.0.104:8080/tn/',
      /** 测试后台 */
      'serviceIP': 'http://192.168.0.234:8080/',
      /** 天牛网管理后台 */
      //  'serviceIP': 'http://tianniu.weidinghuo.com/',
        // 分享页面
        'h5share_url': 'sharetianniuuser/leasing/leasing.html'
    };

    // 项目访问 前端路径后缀
    var web_path = {
        agent: 'client/'
    };

    // 接口请求地址、后缀
    var http_api = {
        agent: 'battery/'
    };

    // 后端 接口请求地址
    var url_api = {
        agent: serverconfig.serviceIP + http_api.agent // 网点端 api
    };

    // html页面公共配置
    var html_config = {
        title: '天牛网',
        // 全局图形验证码
        vmcodeimgs: 'n/images/captcha.jpg'
    };

    // 暴露全局变量作用
    GLOBALconfig.web_url = serverconfig.web_url; // 项目访问页面地址
    GLOBALconfig.h5share_url = serverconfig.web_url + serverconfig.h5share_url; // 项目访问页面地址
    // GLOBALconfig.serviceIP = serverconfig.serviceIP; // 服務器地址
    GLOBALconfig.agent_api = url_api.agent; // 网点端 API 请求地址
    GLOBALconfig.vmcodeimgs = GLOBALconfig.agent_api + html_config.vmcodeimgs; // 全局图形验证码

    // 全局token
    GLOBALconfig.gloabltoken = ''; // token防止重复提交
    GLOBALconfig.gloabluserToken = $api.getStorage('gloabluserToken'); // userToken  验证持续登录
    GLOBALconfig.gloablappifycode = 'wdh_agentappskpi_identifycode-e95d40fc470f3a86033ec5306e88e29000186f8dcb0f3e0197bd4a046a47a078'; // app识别码
    GLOBALconfig.Encryptaes_key = 'uwG0Lsgt6ciMpxpO';
    GLOBALconfig.Encryptvi = 'Ae33d7d4cc6fcf46';
    GLOBALconfig.uploadurl = GLOBALconfig.agent_api + "attach/upload"; // 上传文件的路径';
    GLOBALconfig.edituploadFile = GLOBALconfig.agent_api + "attach/uploadFile"; // 富文本编辑器上传文件 路径';

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
        var userToken = GLOBALconfig.gloabluserToken;
        param.userToken = userToken;
        // app请求专一识别码
        param.appifycode = GLOBALconfig.gloablappifycode;
        // 加载框
        var UILoadingPost = api.require('UILoading');
        var UILoadIdPost;
        UILoadingPost.flower({
            center: {
                x: (api.winWidth / 2),
                y: (api.winHeight / 2),
            },
            size: 30,
            fixed: true
        }, function(ret) {
            UILoadIdPost = ret.id;
        });
        api.ajax({
            url: GLOBALconfig.agent_api + url + '.json',
            method: 'post',
	    async: 'true',
            timeout: 10,
            dataType: 'json',
            data: {
                values: param
            }
        }, function(getData, err) {
            // 关闭打开的加载提示框
            UILoadingPost.closeFlower({
                id: UILoadIdPost
            });
            // 通信成功
            if (getData) {

                // 成功返回后，各种状态码
                allSuccessFun(getData, successfn, codefn);
                console.log('传输参数：' + JSON.stringify(param));
            } else {
                allErrorsFun(err);
            }
        });
        // 3秒后关闭loading
        if (UILoadIdPost) {
            setTimeout(function() {
                // 关闭打开的加载提示框
                UILoadingPost.closeFlower({
                    id: UILoadIdPost
                });
            }, 3000)
        }
    };
    apps.axpostupload = function(url, param, successfn, codefn) {
        param = (param == null || param == "" || typeof(param) == "undefined") ? { "date": new Date().getTime() } : param;
        var userToken = $api.getStorage('gloabluserToken');
        /*param.userToken = userToken;
        // app请求专一识别码
        param.appifycode = GLOBALconfig.gloablappifycode;*/
        /*if (GLOBALconfig.gloabluserToken == '' || GLOBALconfig.gloabluserToken == null || typeof(GLOBALconfig.gloabluserToken) == "undefined") {
         api.toast({
         msg: '正在获取数据，请稍后...'
         });
         } else {*/
        //setTimeout(function() {
        api.ajax({
            url: GLOBALconfig.agent_api + url + '.json',
            method: 'post',
	    async: 'true',
            timeout: 10,
            returnAll: true,
            data: {
                values: {
                    userToken: userToken,
                    appifycode: GLOBALconfig.gloablappifycode
                },
                files: param,
            }
        }, function(getData, err) {
            // 通信成功
            if (getData) {
                // 成功返回后，各种状态码
                uploadSuccessFun(getData, successfn, codefn);
                console.log('传输参数：' + JSON.stringify(param));
            } else {
                allErrorsFun(err);
            }
        });
        //}, 600);
        // }

    };
    apps.axget = function(url, param, successfn, codefn) {
        // 如果userToken  不存在
        param = (param == null || param == "" || typeof(param) == "undefined") ? { "date": new Date().getTime() } : param;
        param.userToken = $api.getStorage('gloabluserToken');
        // app请求专一识别码
        param.appifycode = GLOBALconfig.gloablappifycode;

        /*if (GLOBALconfig.gloabluserToken == '' || GLOBALconfig.gloabluserToken == null || typeof(GLOBALconfig.gloabluserToken) == "undefined") {
            api.toast({
                msg: '您可能未登录，请登陆...'
            });
        } else {*/
        //setTimeout(function() {
        // 加载提示
        /*api.showProgress({
            title: '',
            text: '',
            modal: false
        });*/
        api.ajax({
            url: GLOBALconfig.agent_api + url + '.json',
            method: 'get',
	    async: 'true',
            timeout: 10,
            dataType: 'json',
            data: {
                values: param
            }
        }, function(getData, err) {

            // 通信成功
            if (getData) {
                // 成功返回后，各种状态码
                allSuccessFun(getData, successfn, codefn);
                console.log('传输参数：' + JSON.stringify(param));
            } else {
                allErrorsFun(err);
            }
        });
        //}, 600);
        // 5秒后加载消失
        /*setTimeout(function() {
            api.hideProgress();
        }, 5000);*/
    };

    /**
     * apicloud常用事件 - 打开跳转窗口
     * name 跳转页面name
     * url 页面实际地址
     * progresstype ：跳转类型  默认 type: "page"
     * 用法 ： apps.openWin(name, url)
     */
    apps.openWin = function(name, url, pageParam, bounces, progresstype) {
        bounces = (bounces == null || bounces == "" || typeof(bounces) == "undefined") ? true : bounces;
        pageParam = (pageParam == null || pageParam == "" || typeof(pageParam) == "undefined") ? {} : pageParam;
        progresstype = (progresstype == null || progresstype == "" || typeof(progresstype) == "undefined") ? "page" : progresstype;
        $api.fixStatusBar($api.dom("header"));
        api.openWin({
            name: name,
            url: GLOBALconfig.web_url + url,
            pageParam: pageParam,
            bounces: bounces,
            //slidBackEnabled: false, //禁止右滑 返回
            progress: { type: progresstype }
        });
    }

    /**
     * apicloud常用事件 - 页面默认加载 loadWinUrl
     * name 跳转页面name
     * url 页面实际地址
     */
    apps.loadWinUrl = function(name, url, pageParam) {
        pageParam = (pageParam == null || pageParam == "" || typeof(pageParam) == "undefined") ? {} : pageParam;
        $api.fixStatusBar($api.dom("header"));
        api.openFrame({
            name: name,
            url: GLOBALconfig.web_url + url,
            rect: {
                x: 0,
                y: $api.dom("header").offsetHeight,
                w: api.winWidth,
                h: api.winHeight - $api.dom('header').offsetHeight
            },
            pageParam: pageParam,
            bounces: true
        });
    };

    apps.openMapWinUrl = function(name, url, pageParam) {
        pageParam = (pageParam == null || pageParam == "" || typeof(pageParam) == "undefined") ? {} : pageParam;
        api.openFrame({
            name: name,
            url: GLOBALconfig.web_url + url,
            rect: {
                x: 0,
                y: 0,
                w: 'auto',
                h: 'auto'
            },
            animation: {
                type: "reveal", //动画类型（详见动画类型常量）
                subType: "from_right", //动画子类型（详见动画子类型常量）
                duration: 500
            },
            // reload: true,
            pageParam: pageParam,
            bounces: false,
            // reload: true,
            vScrollBarEnabled: false,
            hScrollBarEnabled: false
        })
    };

    /**
     * 下拉刷新
     * apicloud常用事件 - 下拉刷新 pageDataF5
     * codefn 执行刷新数据函数
     * url 页面实际地址
     */
    apps.pageDataF5 = function(codefn, bgColor, textColor) {
        // 背景色和文字颜色
        var bgColor = bgColor ? bgColor : '#f4f4f4';
        var textColor = textColor ? textColor : '#4d4d4d';
        api.parseTapmode();
        api.setRefreshHeaderInfo({
            loadingImg: 'widget://image/refresh_arrow.png',
            bgColor: bgColor,
            textColor: textColor,
            textUp: '松开立即刷新...',
            showTime: true
        }, function(ret, err) {
            setTimeout("api.refreshHeaderLoadDone()", 600);
            if (codefn) {
                codefn();
            }
        });
    };

    /**
     * 上滑加载数据
     * apicloud常用事件 - 上滑加载数据 pageDataF5
     * codefn 执行刷新数据函数
     * url 页面实际地址
     */
    apps.pageDataBtoom = function(pageNo, pageSize, getUrl, param, callback) {

        param = (param == null || param == "" || typeof(param) == "undefined") ? { "date": new Date().getTime() } : param;
        pageNo = (pageNo == null || pageNo == "" || typeof(pageNo) == "undefined") ? 1 : pageNo;
        pageSize = (pageSize == null || pageSize == "" || typeof(pageSize) == "undefined") ? 5 : pageSize;
        param.pageNo = pageNo;
        param.pageSize = pageSize;
        api.addEventListener({
            name: 'scrolltobottom',
            extra: {
                threshold: 0 //设置距离底部多少距离时触发，默认值为0，数字类型
            }
        }, function(ret) {
            if (ret) {
                apps.axget(
                    getUrl,
                    param,
                    function(data) {
                        var dataArray = data.datas;
                        var totalPage = data.totalPage;
                        var totalCount = data.totalCount;
                        // alert(totalCount);
                        // var datalistArr = dataArray;

                        if (pageNo == 1) {
                            datalistArr = data.datas;
                        } else {
                            //如果存在数据并且当前的页面小于等于总页码时push
                            if (totalCount > 0 && pageNo < totalPage) {
                                dataArray.forEach(function(item) {
                                    datalistArr.push(item);
                                });
                            } else {
                                api.toast({
                                    msg: '没有更多数据',
                                    location: 'bottom'
                                });
                            }
                        }
                        pageNo++;
                        // 数据成功后执行函数
                        if (callback && typeof(callback) === 'function') {
                            callback(datalistArr, totalCount, pageNo);
                        }
                        apps.pageDataBtoom(pageNo, pageSize, getUrl, param, callback);
                    }
                );
            }
        });
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

    // 登录监听
    apps.loginsListener = function(loginSuccessfn, loginOutfn) {
        api.addEventListener({
            name: 'loginSuccess'
        }, function(ret, err) {
            var val = ret.value;
            if (val && val != '') {
                // alert(JSON.stringify(ret.value));
                GLOBALconfig.gloabluserToken = ret.value.userToken;
                //已登录
                if (typeof(loginSuccessfn) === 'function') {
                    loginSuccessfn();
                }
            } else {
                //未登录
                if (typeof(loginOutfn) === 'function') {
                    loginOutfn();
                }
            }
        });
        // 监听退出登录
        api.addEventListener({
            name: 'loginOut'
        }, function(ret, err) {
            var val = ret.value;
            //未登录
            if (val && val != '') {
                if (typeof(loginOutfn) === 'function') {
                    loginOutfn();
                }
            }
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

    // 加入购物车全局验证
    apps.addcars_val = function(goodsId, standardid, goodsCount, stock, cartId, index) {
        // 数量变化验证
        if (!goodsId || !goodsCount) {
            api.toast({
                msg: '商品信息不正确',
                location: 'middle'
            });
            return false;
        }
        /*if ((max > 0 && goodsCount > max)) {
            api.toast({
                msg: '订购数量不能高于限购量',
                location: 'middle'
            });
            return false;
        }
        if (min > 0 && goodsCount < min) {
            api.toast({
                msg: '订购数量不能少于最少限购量',
                location: 'middle'
            });
            return false;
        }*/

        // if (goodsCount > stock && vm.goodssetList.isforbidorder == 1) {
        if (goodsCount > stock) {
            api.toast({
                msg: '库存不足',
                location: 'middle'
            });
            return false;
        }
        if (goodsCount < 1) {
            api.toast({
                msg: '订购数量最低为 1',
                location: 'middle'
            });
            return false;
        }
        // 加入购物车
        apps.axpost(
            "goodsCartManager/addOrUpdateGoodsCart", {
                goodsId: goodsId,
                count: goodsCount,
                standardid: standardid,
                cartId: cartId,
            },
            function(data) {
                api.toast({
                    msg: '添加购物车成功',
                    location: 'middle'
                });
                //更新购物车数量
                api.sendEvent({
                    name: 'mallindex_cars_init',
                });
                // jumpUrl.get_cart();
            });
    };

    // 跳转按钮、页面等
    //
    // 欢迎缴纳押金
    //
    // 没交押金
    jumpUrl.welcome_nobatteries = function() {
        apps.openWin('welcome_nobatteries', 'welcome/nobatteries/nobatteries_win.html')
    };

    // 押金支付
    jumpUrl.welcome_open = function() {
        apps.openWin('welcome_open', 'welcome/open/open_win.html')
    };

    // 押金支付成功
    jumpUrl.welcome_havebatteries = function(pageParam) {
        apps.openWin('welcome_havebatteries', 'welcome/havebatteries/haveavebatteries_win.html', pageParam)
    };

    jumpUrl.shops_infos_win = function(pageParam) {
        apps.openWin('shops_infos_win', 'openmap/shops_infos_win.html', pageParam)
    };

    // 安装电池预约
    jumpUrl.battery_isinstall = function(pageParam) {
        apps.openWin('battery_isinstall', 'battery/bespeak/battery_isinstall_win.html', pageParam)
    };

    // 更换电池预约
    jumpUrl.battery_isreplace = function(pageParam) {
        apps.openWin('battery_isreplace', 'battery/bespeak/battery_isreplace_win.html', pageParam)
    };

    // 续租+逾期
    jumpUrl.battery_isrenew = function(pageParam) {
        apps.openWin('battery_isrenew', 'battery/bespeak/battery_isrenew_win.html', pageParam)
    };

    // 退租
    jumpUrl.battery_isrent = function(pageParam) {
        apps.openWin('battery_isrenew', 'battery/bespeak/battery_isrent_win.html', pageParam)
    };

    // 预约成功页面提示
    jumpUrl.battesucess = function(pageParam) {
        apps.openWin('battesucess', 'welcome/havebatteries/battesucess_win.html', pageParam)
    };
    // 充值成功页面提示
    jumpUrl.rechargesuccess = function(pageParam) {
      apps.openWin('rechargesuccess', 'welcome/havebatteries/rechargesuccess_win.html', pageParam)
    }
    // 安装电池预约-导航到店
    jumpUrl.appointinfo = function(pageParam) {
        apps.openWin('appointinfo', 'battery/appointinfo/appointinfo_win.html', pageParam)
    };

    // 选择预约门店
    jumpUrl.chooseshoplist = function(pageParam) {
        apps.openWin('chooseshoplist', 'battery/chooseshop/chooseshoplist_win.html', pageParam)
    };

    // 救援门店详情
    jumpUrl.rescueshopinfo = function(pageParam) {
        apps.openWin('rescueshopinfo', 'battery/rescueshop/rescueshop_win.html', pageParam)
    };

    // 救援提交页
    jumpUrl.addrescue = function(pageParam) {
        apps.openWin('addrescue', 'battery/rescueshop/addrescue_win.html', pageParam)
    };

    // 救援列表
    jumpUrl.rescuelist = function(pageParam) {
        apps.openWin('rescuelist', 'my/rescuelist/rescuelist_win.html', pageParam)
    };

    // 救援位置
    jumpUrl.userbmapxy = function(pageParam) {
        apps.openWin('userbmapxy', 'battery/rescueshop/userbmapxy_win.html', pageParam)
    };

    // 商品详情
    jumpUrl.goods_detail = function(pageParam) {
        apps.openWin('details', 'mall/details/details_win.html', pageParam)
    };
    // 商品分类
    jumpUrl.classify = function() {
        apps.openWin('classify', 'mall/classify/classify_win.html')
    };
    // 商品结果页面
    jumpUrl.classifylist = function(pageParam) {
        apps.openWin('classifylist', 'mall/classifylist/classifylist_win.html', pageParam)
    };
    // 购物车
    jumpUrl.shoppingcart = function() {
        apps.openWin('shoppingcart', 'mall/shoppingcart/shoppingcart_win.html')
    };
    //生成订单
    jumpUrl.create_order = function(pageParam) {
        apps.openWin('createorder_win', 'mall/order/createorder_win.html', pageParam)
    };
    //新订单-下单成功
    jumpUrl.copyordersucc = function(pageParam) {
        apps.openWin('copyordersucc_win', 'mall/order/copyordersucc_win.html', pageParam)
    };
    // 钱包
    jumpUrl.wallet = function() {
        apps.openWin('wallet', 'my/wallet/wallet_win.html')
    };
    // 我的提现
    jumpUrl.withdrawcash = function() {
        apps.openWin('withdrawcash', 'my/withdrawcash/withdrawcash_win.html')
    };
    // 提现记录
    jumpUrl.cashregister = function() {
        apps.openWin('cashregister', 'my/cashregister/cashregister_win.html')
    };
    // 账号管理
    jumpUrl.settings = function() {
        apps.openWin('settings', 'my/settings/settings_win.html')
    };
    // 充值天牛币
    jumpUrl.rechargetianniu = function() {
        apps.openWin('rechargetianniu','my/rechargetianniu/rechargetianniu_win.html')
    };
    //修改密码
    jumpUrl.modifypwd = function() {
        apps.openWin('modifypwd', 'my/settings/modifypwd_win.html')
    };

    // 更改手机
    jumpUrl.changephone = function() {
        apps.openWin('changephone', 'my/settings/changephone/changephone_win.html')
    };
    // 天牛币
    jumpUrl.tncoin = function() {
        apps.openWin('tncoin', 'my/tncoin/tncoin_win.html')
    };
    // 我的会员
    jumpUrl.myassociator = function() {
        apps.openWin('myassociator', 'my/myassociator/myassociator_win.html')
    };
    // 赚取天牛币
    jumpUrl.earnintegral = function() {
        apps.openWin('earnintegral', 'my/tncoin/earnintegral/earnintegral_win.html')
    };
    // 我的电池
    jumpUrl.mybatteries = function(pageParam) {
        apps.openWin('mybatteries', 'my/mybatteries/mybatteries_win.html', pageParam)
    };
    // 电池押金
    jumpUrl.foregift = function() {
        apps.openWin('foregift', 'my/foregift/foregift_win.html')
    };
    // 租期
    jumpUrl.leaseterm = function() {
        apps.openWin('leaseterm', 'my/leaseterm/leaseterm_win.html')
    };
    // 预约记录
    jumpUrl.record = function() {
        apps.openWin('record', 'my/record/record_win.html')
    };
    // 预约记录详情
    jumpUrl.recorddetail = function() {
        apps.openWin('recorddetail', 'my/record/recorddetail/recorddetail_win.html')
    };

    // 退还电池预约重新开通
    jumpUrl.backbatterysucess = function(pageParam) {
        apps.openWin('backbattery_win', 'welcome/havebatteries/backbattery/backbattery_win.html', pageParam)
    };
    // 电池已损坏重新开通
    jumpUrl.badbatterysucess = function(pageParam) {
        apps.openWin('badbattery_win', 'battery/appointinfo/badbattery/badbattery_win.html', pageParam)
    };

    // 订单列表
    jumpUrl.orderlist = function(pageParam) {
        apps.openWin('orderlist', 'my/orderlist/orderlist_win.html', pageParam)
    };

    // 订单详情
    jumpUrl.orderdetails = function(pageParam) {
        apps.openWin('orderlist', 'my/orderlist/orderdetails_win.html', pageParam)
    };
    // 收货地址
    jumpUrl.addressmanage = function(pageParam) {
        apps.openWin('address', 'my/address/address_win.html', pageParam)
    };
    // 添加收货地址
    jumpUrl.addaddress = function() {
        apps.openWin('addaddress', 'my/address/addaddress/addaddress_win.html')
    };
    //修改收货地址
    jumpUrl.updateaddress = function(pageParam) {
        apps.openWin('updateaddress', 'my/address/addaddress/updateaddress_win.html', pageParam)
    };
    // 收藏商品
    jumpUrl.collect = function() {
        apps.openWin('collect', 'my/collect/collect_win.html')
    };

    //关于我们
    jumpUrl.abouttianniu = function() {
        apps.openWin('abouttianniu', 'my/about_tianniu_win.html')
    };
    //帮助页面
    jumpUrl.hemlpagewe = function() {
        apps.openWin('hemlpagewe', 'openmap/help/bmap_help_win.html')
    };

    // 申请店铺线上签约-join
    jumpUrl.join = function() {
        apps.openWin('join', 'join/join_win.html')
    };
    // 申请店铺表单 - 店铺信息注册
    jumpUrl.addstores = function() {
        apps.openWin('addstores', 'join/stores/addstores_win.html')
    };

    // 上传图片按钮
    jumpUrl.upimgattach = function(pageParam) {
        apps.openWin('upimgattach', 'upimgbox/upimgattachs.html', pageParam)
    };

    // 缴纳加盟费
    jumpUrl.fee = function() {
        apps.openWin('fee', 'join/fee/fee.html')
    };
    //合作协议
    jumpUrl.agreement = function() {
        apps.openWin('agreement', 'register/agreement/agreement_win.html')
    };
    //上传附件
    jumpUrl.createorder_attach = function(pageParam) {
        apps.openWin('createorderattach_win', 'order/createorderattach_win.html', pageParam)
    };

    // 我的
    jumpUrl.myuser = function() {
        apps.openWin('myuser', 'my/my_win.html')
    };

    //修改密码
    jumpUrl.modifypwd = function() {
        apps.openWin('modifypwd', 'my/modifypwd_win.html')
    };

    //关于我们
    jumpUrl.aboutwdh = function() {
        apps.openWin('aboutwdh', 'my/aboutwdh_win.html')
    };
    //公司信息
    jumpUrl.companyinfo = function() {
        apps.openWin('companyinfo', 'my/companyinfo_win.html')
    };

    //充值
    jumpUrl.recharge = function() {
        apps.openWin('recharge', 'my/recharge_win.html')
    };

    // 弹出多规格选项 购物车
    jumpUrl.show_standard = function(pageParam) {
        // 购物车选择弹出
        api.openFrame({
            name: 'index_stand',
            url: '../index/index_stand.html',
            rect: {
                x: 0,
                y: 0,
                w: 'auto',
                h: api.winHeight
            },
            pageParam: pageParam,
            bounces: false,
            bgColor: 'rgba(0,0,0,0)',
            vScrollBarEnabled: true,
            hScrollBarEnabled: true,
            animation: {
                type: "push", //动画类型（详见动画类型常量）
                subType: "from_bottom", //动画子类型（详见动画子类型常量）
            }
        });
    };
    //注册
    jumpUrl.register = function() {
        apps.openWin('register', 'register/reg_win.html')
    };

    //登录
    jumpUrl.login = function() {
        apps.openWin('login', 'login/login_win.html')
    };

    //忘记密码
    jumpUrl.forget_pwd = function() {
        apps.openWin('forget_pwd', 'register/forget_pwd_win.html')
    };

    //重设密码
    jumpUrl.reset_pwd = function(pageParam) {
        apps.openWin('reset_pwd', 'register/reset_pwd_win.html', pageParam)
    };

    //订单列表-付款-选择账户
    jumpUrl.selaccountlist = function(pageParam) {
        apps.openWin('selaccountlist_win', 'order/selaccountlist_win.html', pageParam)
    };
    //订单列表-付款-添加备注
    jumpUrl.payremark = function(pageParam) {
        apps.openWin('payremark_win', 'order/payremark_win.html', pageParam)
    };

})();

var all_errors_count = 0;
// ajax成功返回执行函数-全局
function allSuccessFun(getData, successfn, codefn) {

    all_errors_count = 0;
    if (getData) {
        console.log('返回数据：' + JSON.stringify(getData));

        // vue判断dom是否加载完毕
        /*vm.$nextTick(function() {
            console.log('dom渲染已经完成')
            api.hideProgress(); //加载框消失
        });*/
        //api.hideProgress(); //加载框消失
        var message = "" || getData.message;
        var code = "" || getData.code;
        var data = "" || getData.data;
        switch (code) {
            // code为 1 说明返回成功
            case 1:
                successfn(data);
                break;
            case 0:
            case 9999:
            case 9998:
            case 9997:
            case 9000:
                api.toast({
                    msg: message,
                    duration: 2000,
                    location: 'middle'
                });
                break;
            case 1006:
                if (codefn) {
                    codefn(code, message);
                }
                break;
            case 1021:
                // 如果没商品 进入需求列表页
                break;
            case 1007:
                api.toast({
                    msg: '登录超时，请重新登录'
                });
                // 跳入登录
                jumpUrl.login();
                break;
            default:
                api.toast({
                    msg: message,
                    duration: 2000,
                    location: 'middle'
                });
                if (codefn) {
                    codefn(code, message);
                }
                break;
        }
    }
};
//ajax成功返回执行函数-全局
function uploadSuccessFun(getData, successfn, codefn) {
    all_errors_count = 0;
    if (getData) {
        console.log('返回数据：' + JSON.stringify(getData));

        // vue判断dom是否加载完毕
        /*vm.$nextTick(function() {
         console.log('dom渲染已经完成')
         api.hideProgress(); //加载框消失
         });*/
        //api.hideProgress(); //加载框消失
        var message = "" || getData.body.message;
        var code = "" || getData.body.code;
        var data = "" || getData.body.data;
        switch (code) {
            // code为 1 说明返回成功
            case 1:
                successfn(data);
                break;
            case 0:
            case 9999:
            case 9998:
            case 9997:
            case 9000:
                api.toast({
                    msg: message,
                    duration: 2000,
                    location: 'middle'
                });
                break;
            case 1006:
                if (codefn) {
                    codefn(code, message);
                }
                break;
            case 1021:
                // 如果没商品 进入需求列表页
                break;
            case 1007:
                api.toast({
                    msg: '登录超时，请重新登录'
                });
                // 跳入登录
                jumpUrl.login();
                break;
            default:
                api.toast({
                    msg: message,
                    duration: 2000,
                    location: 'middle'
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
    console.log('网络错误参数：' + JSON.stringify(err));
    //code: 0, //错误码，数字类型。（0：连接错误、1：超时、2：授权错误、3：数据类型错误）
    if (err.code == 0) {
        api.toast({
            msg: '连接请求异常，请稍候重试',
            duration: 2000,
            location: 'middle'
        });
    }
    if (err.code == 1) {
        api.toast({
            msg: '网络不给力哦，请稍候重试',
            duration: 2000,
            location: 'middle'
        });
    }
};

//关闭当前窗口
function closeWin() {
    api.closeWin();
}

//清空缓存
function clear_cache() {
    api.clearCache(function() {
        api.toast({
            msg: '清除完成'
        });
    });
}

// 算法加密开始
function appencodeFun(pargams) {
    var keyStrjsm = "ABEF*+[]~MNOPQabc456defghijkl_mnRSTUVWXYZopqrstuv123789+/=" + GLOBALconfig.gloablappifycode;
    var uncodeoutput = "";
    var chr1, chr2, chr3 = "";
    var enc1, enc2, enc3, enc4 = "";
    var i = 0;
    do {
        chr1 = pargams.charCodeAt(i++);
        chr2 = pargams.charCodeAt(i++);
        chr3 = pargams.charCodeAt(i++);
        enc1 = chr1 >> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;
        if (isNaN(chr2)) {
            enc3 = enc4 = 64;
        } else if (isNaN(chr3)) {
            enc4 = 64;
        }
        uncodeoutput = uncodeoutput + keyStrjsm.charAt(enc1) + keyStrjsm.charAt(enc2) + keyStrjsm.charAt(enc3) + keyStrjsm.charAt(enc4);
        chr1 = chr2 = chr3 = "";
        enc1 = enc2 = enc3 = enc4 = "";
    } while (i < pargams.length);
    return uncodeoutput;
}
//获取当前的日期时间 格式“yyyy-MM-dd”
function getNowFormatDate() {
    var date = new Date();
    var seperator1 = "-";
    var seperator2 = ":";
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate;
    return currentdate;
}
/*
 * Vue自定义过滤器 @小北
 */

// 数字 -》状态 过滤
/*Vue.filter('filterstatus', function(value, txtarray) {
        if (value != undefined && value != null) {
            var itemtxt = txtarray[value];
            return itemtxt;
        } else {
            return '-';
        }
    })

Vue.filter('contentfilter', function(value) {
    if (!value) {
        return 0;
    }

    return value;
});*/
function toast(message) {
    api.toast({
        msg: message,
        duration: 2000,
        location: 'middle'
    });
}
