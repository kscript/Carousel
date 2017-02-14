/*
 * 功能: 基于jquery的轮播插件
 * 时间: 2016/9/9
 * 作者: lr
 * 邮箱: 2046@live.cn
 * 项目地址：https://github.com/kscript/Carousel
 * 说明文档：https://kscript.github.io/Carousel/
 */
$.extend({
    widget:function(box,conf){
        var that=this;
        that.conf=conf=conf||{};
        extend({
            type          : "carousel",                 //插件类型 carousel
            effect        : "none",                     //切换类型 none/fade/scrollx/scrolly
            contentCls    : ".contentCls",              //视图容器
            navCls        : ".navCls",                  //导航容器
            nextBtnCls    : ".next",                    //下一屏
            prevBtnCls    : ".prev",                    //上一屏
            speend        : 500,                        //切换速度
            delay         : 5000,                       //焦点停留时间
            line          : "linear",                   //切换动画时间曲线
            width         : 0,                          //视图宽
            height        : 0,                          //视图高
            drift         : 0,                          //切换长度
            reverse       : 0,                          //倒序轮播
            autoplay      : 1,                          //自动轮播
            hasTriggers   : 1,                          //焦点切换
            triggerType   : "click",                    //切换类型 click/mouseover
            timeCls       : ".time-box",                //倒计时容器
            endtime       : 0,                          //结束时间
            status        : 0,
            timeUnitCls   : {y:".t-y",
                             m:".t-m",
                             d:".t-d",
                             h:".t-h",
                             i:".t-i",
                             s:".t-s"},
            move          : 0,
            pageX         : 0,                          //x轴定位 0/-1/auto/1~n 默认不定位/-1 auto 自动定位/1~n 用户自定义值
            pageY         : 0,                          //y轴定位 0/-1/auto/1~n 默认不定位/-1 auto 自动定位/1~n 用户自定义值
            key           : 0,                          //轮播定时器id
            timekey       : 0,                          //倒计时定时器id
            index         : 0,                          //当前焦点图索引
            endIndex      : 0,                          //结束焦点图索引
            num           : 0,                          //焦点图导航指向
            cid           : Math.random().toString(36).split(".")[1],//随机id识别码 用于插件内部识别 外部使用请定义keyid
            callback      : null,                       //回调函数
            render        : true                        //当前轮播是否要渲染
        },conf);
        this.toggle=toggle;
        box=box||$(".J_widget");

        var first,last,drift;
        var nav=box.children(conf.navCls);
        var content=box.children(conf.contentCls);
        var contLi=content.children("li");
        var navText=box.children(".navText");

        extend(box.data("config"),conf,1);
        conf.width=conf.view&&conf.view[0]||parseInt(contLi.css("width"));
        conf.height=conf.view&&conf.view[1]||parseInt(contLi.css("height"));
        drift=conf.drift;

        if(conf.endIndex<0){
            conf.endIndex=contLi.find("dd").length;
        }

        box.css({height:conf.height,width:conf.width,position:"relative",overflow:"hidden",lineHeight:0});

        if(conf.effect==="scrollx"||conf.effect==="scrolly"){

            first=content.children().first().clone();
            last=content.children().last().clone();

            conf.effect==="scrollx"&&content.css({width:(contLi.length+2)*conf.width,position:"absolute"}).css({left:(conf.pageX!=="auto"&&conf.pageX>0)?conf.pageX:-contLi.children().width()});
            conf.effect==="scrolly"&&content.css({height:(contLi.length+2)*conf.height,position:"absolute"}).css({top:(conf.pageY!=="auto"&&conf.pageY>0)?conf.pageY:-contLi.children().height()});
            
            conf.pageX==="auto"&&content.css({width:contLi.children().width()*3});
            conf.pageY==="auto"&&content.css({height:contLi.children().height()*3});

            last.insertBefore(content.children().first());
            first.insertAfter(content.children().last());
        }
        if(conf.effect==="none"||conf.effect==="fade"){
            contLi.eq(conf.index).css({
                position:"absolute",
                zIndex:32
            }).siblings().css({
                position:"absolute",
                zIndex:20,
                opacity:0
            });
        }
        conf.view&&box.css({width:conf.view[0],height:conf.view[1]})
        if(conf.render!=true)return;
        setEvent();
        
        function setEvent(){
            if(conf.hasTriggers){
                nav.on(conf.triggerType+" mouseenter mouseout click","li",function(e){
                    e=e||window.event;
                    if($(this).parent().hasClass("navText"))return ;
                    conf.status=e.type=="mouseenter"?2:0;
                    if(e.type==conf.triggerType||e.type=="click"){
                        conf.status=0;
                        toggle($(this).index(),1);
                    }
                })
            }
            nav.children("li").eq(conf.num).addClass("active");
            box.find(conf.prevBtnCls).on("click",function(){
                toggle(-1);
            });
            box.find(conf.nextBtnCls).on("click",function(){
                toggle(1);
            });
            if(conf.type==="tab"){
                $(conf.navCls).on(conf.triggerType,"li",function(){
                    $(this).next().show().css({float:"right"});$(this).prev().show().css({float:"left"});
                })
            }
            if(conf.autoplay){
                conf.key=setInterval(function(){
                    conf.status!=2&&toggle(conf.reverse?-1:1);
                },conf.delay)
            }
            if(conf.endtime!==0){
                var time1=new Date().getTime();
                var time2=new Date(conf.endtime).getTime();
                var td,th,ti,ts,_d,_h,_i,_s,_c;
                var dom=box.children(conf.timeCls)
                if(isNaN(time2)){
                    time2=$.getTime(conf.endtime);
                }
                td=dom.children(conf.timeUnitCls.d);
                th=dom.children(conf.timeUnitCls.h);
                ti=dom.children(conf.timeUnitCls.i);
                ts=dom.children(conf.timeUnitCls.s);
                conf.countTime=time2-time1;
                conf.dataTime=time2;
                if(conf.countTime>0){
                    conf.timekey=setInterval(function(){
                        conf.countTime=conf.dataTime-new Date().getTime();
                        _c=Math.floor(conf.countTime/1000);
                        _d=Math.floor(_c/86400);
                        _h=Math.floor((_c%86400)/3600);
                        _i=Math.floor(((_c%86400)%3600)/60);
                        _s=Math.floor(((_c%86400)%3600)%60);
                        td.html(_d);
                        th.html(_h);
                        ti.html(_i);
                        ts.html(_s);
                        if(conf.countTime<0){
                            dom.hide();
                            clearInterval(conf.timekey);
                        }
                    },500)
                }else{
                    dom.hide();
                }
            }
        }
        /*conf.index: 1~ conf.num: 0~*/
        function toggle(num,mod){
            var val;
            var n=1;
            var drift=0;
            var len=conf.endIndex||contLi.length;

            if(conf.effect=="scrollx"){
                drift=conf.drift||conf.width;
            }
            if(conf.effect=="scrolly"){
                drift=conf.drift||conf.height;
            }
            conf.drift=drift;
            if(conf.status==3){
            //触发鼠标悬停状态 此时不会再执行切换
                return ;
            }else
            if(conf.status==2){
            //鼠标悬停时 标记鼠标悬停状态 允许切换执行
                conf.status=3;
            }else if(conf.status==1){
            //如果是在执行切换过程中 //并且切换触发类型不是mouseover// 阻止重复切换
                return;
            }else{
            //当前状态为等待切换 //或者 切换触发类型是mouseover// 标记为切换状态 并执行切换 
                conf.status=1
            }

            conf.index=(mod?0:conf.index)+num;
            
            if(conf.move){
                n=len;
            }
            if(conf.index<0){
                conf.index=len-1;
                val=len;
                drift=(conf.move===0?(-(val+1)):(-n*2))*conf.drift;
            }else if(conf.index>=len){
                conf.index=0;
                val=0;
                drift=conf.move===0?0:(-(n-1)*conf.drift);
            }else{
                val=1
            }

            if(conf.effect==="scrollx"){
                val!=1&&content.css({left:drift});
                content.animate({left:-(conf.index+n)*conf.drift},conf.speend,conf.line,function(){
                    conf.callback&&conf.callback(that);
                    conf.status=conf.status==1?0:conf.status;
                })
            }else if(conf.effect==="scrolly"){
                val!=1&&content.css({top:drift});
                content.animate({top:-(conf.index+n)*conf.drift},conf.speend,conf.line,function(){
                    conf.callback&&conf.callback(that);
                    conf.status=conf.status==1?0:conf.status;
                })
            }else
            if(conf.effect==="none"||conf.effect==="fade"){

                if(conf.effect==="none"){
                    contLi.eq(conf.index).css({zIndex:32,opacity:1}).siblings().css("zIndex",20);
                    conf.status=conf.status==1?0:conf.status;
                    conf.callback&&conf.callback(that);
                }else{
                    contLi.eq(conf.index).css("zIndex",32).animate({opacity:1},100,conf.line).fadeIn("slow",function(){
                        conf.callback&&conf.callback(that);
                        conf.status=conf.status==1?0:conf.status;
                    }).siblings().css("zIndex",20).fadeOut(500);
                }
            }

            content.children().eq((conf.index+1+conf.move)).addClass("active").siblings().removeClass("active");
            nav.children().eq(conf.index).addClass("active").siblings().removeClass("active");
            if(navText.length!==0){
                navText.children("li").eq(conf.index).addClass("active").siblings().removeClass("active");
            }

        }
        function extend(source,target,mod){
            for(var k in source){
                if(mod===1||(!target[k]&&target[k]!==false&&target[k]!==0)){
                    target[k]=source[k];
                }
            }
        }
        box.data("init",1);
        return that;
    },
    render_all:function($dom,conf){
        var tmp,res=[];
        conf=conf||[{}];
        if(typeof $dom==="string"){
            $dom=$($dom);
        }
        if(!$dom){
            return;
        }
        $dom.each(function(i,k){
            if($(k).data("init")==1)return;
            tmp=new $.widget($(k),conf[i]);
            if(tmp.conf.keyid){
                res[tmp.conf.keyid]=tmp
            }
            res.push(tmp);
        });
        $.LrCarouselCache={"render":res};
        return res;
    },
    empty:function(obj){
        for(var i in obj){
            return false;
        }
        return true;
    },
    getTime:function (time){
        var arr=time.split(" ");
        var ary1=arr[0].split(/(:|,|-|\/)/);
        var ary2=arr[1].split(/(:|,|-|\/)/);
        var date=new Date();

        date.setUTCFullYear(parseInt(ary1[0]), parseInt(ary1[1] - 1), parseInt(ary1[2]));
        date.setUTCHours(parseInt(ary2[0]), parseInt(ary2[1]), parseInt(ary2[2]), 0);
        return date-(3600000*8);
    }
});
(function(){
    if($(".J_widget").length!=0&&!$.noLrCarousel){
        $.render_all(".J_widget");
    }
})();