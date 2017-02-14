/*
 *
 * 功能: 基于jquery的轮播插件
 * 时间: 2016/9/9
 * 作者: lr
 * 邮箱: 2046@live.cn
 * 项目地址：https://github.com/kscript/Carousel
 * 说明文档：https://kscript.github.io/Carousel/
 * 
 * 2016/11/9功能扩展：自定义鼠标悬停、JQ动画时间线
 * 2016/11/24插件维护：修复首屏切换过渡效果
 *
 * 
 */

$.extend({
    widget: function(box, conf) {
        var that = this;
        that.conf = conf = conf || {};
        extend({
            type: "carousel",               //插件类型
            effect: "none",                 //切换类型 可选参数：none/fade/scrollx/scrolly
            contentCls:".contentCls",       //视图容器class
            navCls: ".navCls",              //导航容器class
            nextBtnCls:".next",             //下一个
            prevBtnCls:".prev",             //上一个
            speend: 500,                    //切换速度
            delay: 5000,                    //停留时间
            line: "linear",                 //jquery动画时间线
            //view:[],                      //视图尺寸[宽,高] 该项在不需要设置时不应有值
            width: 0,                       //视图宽度
            height: 0,                      //视图高度
            drift: 0,                       //切换长度
            triggerType: "click",           //切换类型 可选参数：mouseover/click
            reverse: false,                 //倒序
            autoplay: true,                 //自动播放
            hasTriggers: true,              //获得焦点时停留
            status: 0,                      //轮播状态 0：轮播就绪 1：正在切换 2：获得焦点后继续完成当前切换任务并触发停留 3：轮播已暂停
            move: false,                    //是否为局部移动（dom结构有别于整屏切换，需获取视图的总数）
            pageX: 0,                       //x轴定位 可选参数：0/auto/n 默认不定位 auto 自动定位 n用户自定义值(同pageY 一般用于局部移动时视图修正位置不对)
            pageY: 0,                       //y轴定位 可选参数：0/auto/n 默认不定位 auto 自动定位 n用户自定义值
            key: 0,                         //轮播定时器id 可以手动清除以停止轮播
            timekey: 0,                     //倒计时的定时器id
            index: 0,                       //当前焦点图的索引
            endIndex: 0,                    //最后一个焦点图的索引
            num: 0,                         //焦点图导航指向(插件内使用，不建议设置该值)
            cid: Math.random().toString(36).split(".")[1],  //轮播随机识别码(外部调用插件方法：插件自动渲染方式下，自行设置$.lrCarousel对象的keyid，单个渲染方式下，存为变量即可)
            callback: null,                 //切换完成后的回调
            timeCls: ".time-box",           //倒计时容器class
            endtime: 0,                     //倒计时结束时间
            timeUnitCls: {                  //时间值要放入的class
                y: ".t-y",                  //年
                m: ".t-m",                  //月
                d: ".t-d",                  //日
                h: ".t-h",                  //时
                i: ".t-i",                  //分
                s: ".t-s"                   //秒
            },
            render: true                    //设置轮播结构后是否继续渲染轮播
        },
        conf);
        this.toggle = toggle;           //一个可以在外部调用切换的函数 接受参数-1（上一个）,1（下一个）
        box = box || $(".J_widget");    //轮播容器 box可在实例化插件时设置 是一个jquery对象
        conf.init && conf.init();       //判断是否要初始化
        
        var first, last, drift;
        var nav = box.children(conf.navCls);
        var content = box.children(conf.contentCls);
        var contLi = content.children("li");
        var navText = box.children(".navText");

        extend(box.data("config"), conf, 1);    //获得默认配置

        //首先确定视图的宽高 
        conf.width = conf.view && conf.view[0] || parseInt(contLi.css("width"));
        conf.height = conf.view && conf.view[1] || parseInt(contLi.css("height"));
        drift = conf.drift;

        //给轮播组件设置必要的css
        box.css({
            height: conf.height,
            width: conf.width,
            position: "relative",
            overflow: "hidden",
            lineHeight: 0
        });

        

        //设置在各个切换状态下需要的样式
        if (conf.effect === "scrollx" || conf.effect === "scrolly") {
            first = content.children().first().clone();
            last = content.children().last().clone();
            conf.effect === "scrollx" && content.css({
                width: (contLi.length + 2) * conf.width,
                position: "absolute"
            }).css({
                left: (conf.pageX !== "auto" && conf.pageX > 0) ? conf.pageX: -contLi.children().width()
            });
            conf.effect === "scrolly" && content.css({
                height: (contLi.length + 2) * conf.height,
                position: "absolute"
            }).css({
                top: (conf.pageY !== "auto" && conf.pageY > 0) ? conf.pageY: -contLi.children().height()
            });
            conf.pageX === "auto" && content.css({
                width: contLi.children().width() * 3
            });
            conf.pageY === "auto" && content.css({
                height: contLi.children().height() * 3
            });
            last.insertBefore(content.children().first());
            first.insertAfter(content.children().last())
        }
        if (conf.effect === "none" || conf.effect === "fade") {
            contLi.eq(conf.index).css({
                position: "absolute",
                zIndex: 32
            }).addClass("active").siblings().css({
                position: "absolute",
                zIndex: 20,
                opacity: 0,
                display:'none'
            });
        }
        //如果用户设置了view重新确定宽高
        conf.view && box.css({
            width: conf.view[0],
            height: conf.view[1]
        });
        //在局部切换时，确定在第几个轮播图结束
        if (conf.endIndex < 0) {
            conf.endIndex = contLi.find("dd").length
        }

        //渲染结构完毕 继续执行？
        if (conf.render != true) return;

        //设置事件
        setEvent();
        function setEvent() {
            //如果需要在获得焦点时停留
            if (conf.hasTriggers) {
                nav.on(conf.triggerType + " mouseenter mouseout click", "li",
                function(e) {
                    e = e || window.event;
                    if ($(this).parent().hasClass("navText")) return;
                    conf.status = e.type == "mouseenter" ? 2 : 0;
                    if (e.type == conf.triggerType || e.type == "click") {
                        conf.status = 0;
                        toggle($(this).index(), 1)
                    }
                })
            }
            nav.children("li").eq(conf.num).addClass("active");

            //轮播切换
            box.find(conf.prevBtnCls).on("click",
            function() {
                toggle(-1);
            });
            box.find(conf.nextBtnCls).on("click",
            function() {
                toggle(1)
            });
            if (conf.type === "tab") {
                $(conf.navCls).on(conf.triggerType, "li",
                function() {
                    $(this).next().show().css({
                        float: "right"
                    });
                    $(this).prev().show().css({
                        float: "left"
                    })
                })
            }
            //设置自动切换
            if (conf.autoplay) {
                conf.key = setInterval(function() {
                    conf.status != 2 && toggle(conf.reverse ? -1 : 1);
                },
                conf.delay);
            }
            //倒计时
            if (conf.endtime !== 0) {
                var time1 = new Date().getTime();
                var time2 = new Date(conf.endtime).getTime();
                var td, th, ti, ts, _d, _h, _i, _s, _c;
                var dom = box.children(conf.timeCls);
                if (isNaN(time2)) {
                    time2 = $.getTime(conf.endtime);
                }
                td = dom.children(conf.timeUnitCls.d);
                th = dom.children(conf.timeUnitCls.h);
                ti = dom.children(conf.timeUnitCls.i);
                ts = dom.children(conf.timeUnitCls.s);
                conf.countTime = time2 - time1;
                conf.dataTime = time2;
                if (conf.countTime > 0) {
                    conf.timekey = setInterval(function() {
                        conf.countTime = conf.dataTime - new Date().getTime();
                        _c = Math.floor(conf.countTime / 1000);
                        _d = Math.floor(_c / 86400);
                        _h = Math.floor((_c % 86400) / 3600);
                        _i = Math.floor(((_c % 86400) % 3600) / 60);
                        _s = Math.floor(((_c % 86400) % 3600) % 60);
                        td.html(_d);
                        th.html(_h);
                        ti.html(_i);
                        ts.html(_s);
                        if (conf.countTime < 0) {
                            dom.hide();
                            clearInterval(conf.timekey);
                        }
                    },
                    500)
                } else {
                    dom.hide();
                }
            }
        }

        function toggle(num, mod) {
            var val;
            var n = 1;
            var drift = 0;
            var len = conf.endIndex || contLi.length;

            if (conf.effect == "scrollx") {
                drift = conf.drift || conf.width;
            }
            if (conf.effect == "scrolly") {
                drift = conf.drift || conf.height;
            }
            conf.drift = drift;

            if (conf.status == 3) {
                //触发焦点停留并停止往下执行
                return;
            } else if (conf.status == 2) {
                //触发焦点停留并继续往下执行
                conf.status = 3;
            } else if (conf.status == 1) {
                //执行切换中
                return;
            } else {
                //status=0 设置状态为执行切换中
                conf.status = 1
            }

            conf.index = (mod ? 0 : conf.index) + num;
            
            if (conf.move) {
                n = len;
            }
            //计算轮播即将切换到的实际索引
            if (conf.index < 0) {
                conf.index = len - 1;
                val = len;
                drift = (conf.move === 0 ? ( - (val + 1)) : ( - n * 2)) * conf.drift;
            } else if (conf.index >= len) {
                conf.index = 0;
                val = 0;
                drift = conf.move === 0 ? 0 : ( - (n - 1) * conf.drift);
            } else {
                val = 1;
            }

            if (conf.effect === "scrollx") {
                val != 1 && content.css({
                    left: drift
                });
                content.animate({
                    left: -(conf.index + n) * conf.drift
                },conf.speend, conf.line,function() {
                    conf.callback && conf.callback(that);
                    conf.status = conf.status == 1 ? 0 : conf.status;
                })
            } else if (conf.effect === "scrolly") {
                val != 1 && content.css({
                    top: drift
                });
                content.animate({
                    top: -(conf.index + n) * conf.drift
                },conf.speend, conf.line,function() {
                    conf.callback && conf.callback(that);
                    conf.status = conf.status == 1 ? 0 : conf.status;
                })
            } else if (conf.effect === "none" || conf.effect === "fade") {
                if (conf.effect === "none") {
                    contLi.eq(conf.index).css({
                        zIndex: 32,
                        opacity: 1,
                        display:'block'
                    }).addClass("active").siblings().css({zIndex: 20,display:'none'});
                    conf.status = conf.status == 1 ? 0 : conf.status;
                    conf.callback && conf.callback(that);
                } else {
                    contLi.eq(conf.index).css("zIndex", 32).addClass("active").animate({
                        opacity: 1
                    },
                    100, conf.line).fadeIn("slow",
                    function() {
                        conf.callback && conf.callback(that);
                        conf.status = conf.status == 1 ? 0 : conf.status;
                    }).siblings().css("zIndex", 20).fadeOut(500);
                }
            }
            content.children().eq((conf.index + conf.move)).addClass("active").siblings().removeClass("active");
            nav.children().eq(conf.index).addClass("active").siblings().removeClass("active");
            if (navText.length !== 0) {
                navText.children("li").eq(conf.index).addClass("active").siblings().removeClass("active");
            }
        }
        //继承
        function extend(source, target, mod) {
            for (var k in source) {
                if (mod === 1 || (!target[k] && target[k] !== false && target[k] !== 0)) {
                    target[k] = source[k];
                }
            }
        }
        //初始化完毕
        box.data("init", 1);
        return that;
    },
    render_all: function($dom, conf) {
        var tmp, res = [];
        conf = conf || [{}];
        if (typeof $dom === "string") {
            $dom = $($dom)
        }
        if (!$dom) {
            return
        }
        $dom.each(function(i, k) {
            if ($(k).data("init") == 1) return;
            tmp = new $.widget($(k), conf[i]);
            if (tmp.conf.keyid) {
                res[tmp.conf.keyid] = tmp
            }
            res.push(tmp)
        });
        $.LrCarouselCache = {
            "render": res
        };
        return res
    },
    getTime: function(time) {
        var arr = time.split(" ");
        var ary1 = arr[0].split(/(:|,|-|\/)/);
        var ary2 = arr[1].split(/(:|,|-|\/)/);
        var date = new Date();
        date.setUTCFullYear(parseInt(ary1[0]), parseInt(ary1[1] - 1), parseInt(ary1[2]));
        date.setUTCHours(parseInt(ary2[0]), parseInt(ary2[1]), parseInt(ary2[2]), 0);
        return date - (3600000 * 8);
    }
});
(function() {
    //如果有要渲染的dom且插件没有被禁止
    if ($(".J_widget").length != 0 && !$.noLrCarousel) {
        $.render_all(".J_widget");
    }
})();