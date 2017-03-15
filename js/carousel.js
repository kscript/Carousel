/*
 * 功能: 基于jQuery的轮播插件
 * 适用jQuery版本号:1.7.2
 * 时间: 2016/9/9
 * 作者: lr
 * 邮箱: 2046@live.cn
 */
;$.extend({widget:function(box,conf){var that=this;that.conf=conf=conf||{};extend({type:"carousel",effect:"none",contentCls:".contentCls",navCls:".navCls",nextBtnCls:".next",prevBtnCls:".prev",speend:500,delay:5e3,width:0,height:0,drift:0,reverse:0,autoplay:1,hasTriggers:1,triggerType:"click",timeCls:".time-box",endtime:0,timeUnitCls:{y:".t-y",m:".t-m",d:".t-d",h:".t-h",i:".t-i",s:".t-s"},move:0,pageX:0,pageY:0,key:0,timekey:0,index:0,endIndex:0,num:0,cid:Math.random().toString(36).split(".")[1],callback:null,render:true},conf);this.toggle=toggle;box=box||$(".J_widget");var first,last,drift,status=0;var nav=box.children(conf.navCls);var content=box.children(conf.contentCls);var contLi=content.children("li");var navText=box.children(".navText");extend(box.data("config"),conf,1);conf.width=conf.view&&conf.view[0]||parseInt(contLi.css("width"));conf.height=conf.view&&conf.view[1]||parseInt(contLi.css("height"));drift=conf.drift;if(conf.endIndex<0){conf.endIndex=contLi.find("dd").length;}box.css({height:conf.height,width:conf.width,position:"relative",overflow:"hidden",lineHeight:0});if(conf.effect==="scrollx"||conf.effect==="scrolly"){first=content.children().first().clone();last=content.children().last().clone();conf.effect==="scrollx"&&content.css({width:(contLi.length+2)*conf.width,position:"absolute"}).css({left:conf.pageX!=="auto"&&conf.pageX>0?conf.pageX:-contLi.children().width()});conf.effect==="scrolly"&&content.css({height:(contLi.length+2)*conf.height,position:"absolute"}).css({top:conf.pageY!=="auto"&&conf.pageY>0?conf.pageY:-contLi.children().height()});conf.pageX==="auto"&&content.css({width:contLi.children().width()*3});conf.pageY==="auto"&&content.css({height:contLi.children().height()*3});last.insertBefore(content.children().first());first.insertAfter(content.children().last());}if(conf.effect==="none"||conf.effect==="fade"){contLi.eq(conf.index).css({position:"absolute",zIndex:32}).siblings().css({position:"absolute",zIndex:20,opacity:0});}conf.view&&box.css({width:conf.view[0],height:conf.view[1]});if(conf.render!=true)return;setEvent();function setEvent(){if(conf.hasTriggers){nav.on(conf.triggerType+" mouseenter mouseout click","li",function(e){e=e||window.event;if($(this).parent().hasClass("navText"))return;status=e.type=="mouseenter"?2:0;if(e.type==conf.triggerType||e.type=="click"){status=0;toggle($(this).index(),1);}});}nav.children("li").eq(conf.num).addClass("active");box.find(conf.prevBtnCls).on("click",function(){toggle(-1);});box.find(conf.nextBtnCls).on("click",function(){toggle(1);});if(conf.type==="tab"){$(conf.navCls).on(conf.triggerType,"li",function(){$(this).next().show().css({"float":"right"});$(this).prev().show().css({"float":"left"});});}if(conf.autoplay){conf.key=setInterval(function(){status!=2&&toggle(conf.reverse?-1:1);},conf.delay);}if(conf.endtime!==0){var time1=new Date().getTime();var time2=new Date(conf.endtime).getTime();var td,th,ti,ts,_d,_h,_i,_s,_c;var dom=box.children(conf.timeCls);if(isNaN(time2)){time2=$.getTime(conf.endtime);}td=dom.children(conf.timeUnitCls.d);th=dom.children(conf.timeUnitCls.h);ti=dom.children(conf.timeUnitCls.i);ts=dom.children(conf.timeUnitCls.s);conf.countTime=time2-time1;conf.dataTime=time2;if(conf.countTime>0){conf.timekey=setInterval(function(){conf.countTime=conf.dataTime-new Date().getTime();_c=Math.floor(conf.countTime/1e3);_d=Math.floor(_c/86400);_h=Math.floor(_c%86400/3600);_i=Math.floor(_c%86400%3600/60);_s=Math.floor(_c%86400%3600%60);td.html(_d);th.html(_h);ti.html(_i);ts.html(_s);if(conf.countTime<0){dom.hide();clearInterval(conf.timekey);}},500);}else{dom.hide();}}}function toggle(num,mod){var val;var n=1;var drift=0;var len=conf.endIndex||contLi.length;if(conf.effect=="scrollx"){drift=conf.drift||conf.width;}if(conf.effect=="scrolly"){drift=conf.drift||conf.height;}conf.drift=drift;if(status==3){return;}else if(status==2){status=3;}else if(status==1){return;}else{status=1;}conf.index=(mod?0:conf.index)+num;if(conf.move){n=len;}if(conf.index<0){conf.index=len-1;val=len;drift=(conf.move===0?-(val+1):-n*2)*conf.drift;}else if(conf.index>=len){conf.index=0;val=0;drift=conf.move===0?0:-(n-1)*conf.drift;}else{val=1;}if(conf.effect==="scrollx"){val!=1&&content.css({left:drift});content.animate({left:-(conf.index+n)*conf.drift},conf.speend,function(){conf.callback&&conf.callback(that);status=status==1?0:status;});}else if(conf.effect==="scrolly"){val!=1&&content.css({top:drift});content.animate({top:-(conf.index+n)*conf.drift},conf.speend,function(){conf.callback&&conf.callback(that);status=status==1?0:status;});}else if(conf.effect==="none"||conf.effect==="fade"){if(conf.effect==="none"){contLi.eq(conf.index).css({zIndex:32,opacity:1}).siblings().css("zIndex",20);status=status==1?0:status;conf.callback&&conf.callback(that);}else{contLi.eq(conf.index).css("zIndex",32).animate({opacity:1},100).fadeIn("slow",function(){conf.callback&&conf.callback(that);status=status==1?0:status;}).siblings().css("zIndex",20).fadeOut(500);}}content.children().eq(conf.index+1+conf.move).addClass("active").siblings().removeClass("active");nav.children().eq(conf.index).addClass("active").siblings().removeClass("active");if(navText.length!==0){navText.children("li").eq(conf.index).addClass("active").siblings().removeClass("active");}}function extend(source,target,mod){for(var k in source){if(mod===1||!target[k]&&target[k]!==false&&target[k]!==0){target[k]=source[k];}}}box.data("init",1);return that;},render_all:function($dom,conf){var tmp,res=[];conf=conf||[{}];if(typeof $dom==="string"){$dom=$($dom);}if(!$dom){return;}$dom.each(function(i,k){if($(k).data("init")==1)return;tmp=new $.widget($(k),conf[i]);if(tmp.conf.keyid){res[tmp.conf.keyid]=tmp;}res.push(tmp);});$.LrCarouselCache={render:res};return res;},empty:function(obj){for(var i in obj){return false;}return true;},getTime:function(time){var arr=time.split(" ");var ary1=arr[0].split(/(:|,|-|\/)/);var ary2=arr[1].split(/(:|,|-|\/)/);var date=new Date();date.setUTCFullYear(parseInt(ary1[0]),parseInt(ary1[1]-1),parseInt(ary1[2]));date.setUTCHours(parseInt(ary2[0]),parseInt(ary2[1]),parseInt(ary2[2]),0);return date-36e5*8;}});(function(){if($(".J_widget").length!=0&&!$.noLrCarousel){$.render_all(".J_widget");}})();