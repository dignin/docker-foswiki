var FoswikiTiny={foswikiVars:null,metaTags:null,tml2html:new Array,html2tml:new Array,transformCbs:new Array,getFoswikiVar:function(name){if(FoswikiTiny.foswikiVars==null){var sets=tinyMCE.activeEditor.getParam("foswiki_vars","");FoswikiTiny.foswikiVars=eval(sets)}return FoswikiTiny.foswikiVars[name]},expandVariables:function(url){for(var i in FoswikiTiny.foswikiVars){if(i=="WEB"||i=="TOPIC"||i=="SYSTEMWEB")continue;if(FoswikiTiny.foswikiVars[i]=="")continue;url=url.replace("%"+i+"%",FoswikiTiny.foswikiVars[i],"g")}return url},saveEnabled:0,enableSaveButton:function(enabled){var status=enabled?null:"disabled";FoswikiTiny.saveEnabled=enabled?1:0;var elm=document.getElementById("save");if(elm){elm.disabled=status}elm=document.getElementById("quietsave");if(elm){elm.disabled=status}elm=document.getElementById("checkpoint");if(elm){elm.disabled=status}elm=document.getElementById("preview");if(elm){elm.style.display="none";elm.disabled=status}},transform:function(editor,handler,text,onSuccess,onFail){var url=FoswikiTiny.getFoswikiVar("SCRIPTURL");var suffix=FoswikiTiny.getFoswikiVar("SCRIPTSUFFIX");if(suffix==null)suffix="";url+="/rest"+suffix+"/WysiwygPlugin/"+handler;var path=FoswikiTiny.getFoswikiVar("WEB")+"."+FoswikiTiny.getFoswikiVar("TOPIC");tinymce.util.XHR.send({url:url,content_type:"application/x-www-form-urlencoded",type:"POST",data:"nocache="+encodeURIComponent((new Date).getTime())+"&topic="+encodeURIComponent(path)+"&text="+encodeURIComponent(text),async:true,scope:editor,success:onSuccess,error:onFail})},removeErasedSpans:function(ed,o){o.content=o.content.replace(/<span[^>]*class=['"][^'">]*WYSIWYG_HIDDENWHITESPACE[^>]+>&nbsp;<\/span>/g,"")},setUpContent:function(editor_id,body,doc){if(editor_id=="mce_fullscreen")return;var editor=tinyMCE.getInstanceById(editor_id);if(editor.initialisedFromServer)return;FoswikiTiny.switchToWYSIWYG(editor);editor.onGetContent.add(FoswikiTiny.removeErasedSpans);editor.initialisedFromServer=true},cleanBeforeSave:function(eid,buttonId){var el=document.getElementById(buttonId);if(el==null)return;el.onclick=function(){var editor=tinyMCE.getInstanceById(eid);editor.isNotDirty=true;return true}},onSubmitHandler:false,switchToRaw:function(editor){var text=editor.getContent();var el=document.getElementById("foswikiTinyMcePluginWysiwygEditHelp");if(el){el.style.display="none"}el=document.getElementById("foswikiTinyMcePluginRawEditHelp");if(el){el.style.display="block"}for(var i=0;i<FoswikiTiny.html2tml.length;i++){var cb=FoswikiTiny.html2tml[i];text=cb.apply(editor,[editor,text])}FoswikiTiny.enableSaveButton(false);editor.getElement().value="Please wait... retrieving page from server.";FoswikiTiny.transform(editor,"html2tml",text,function(text,req,o){editor.getElement().value=text;FoswikiTiny.enableSaveButton(true);for(var i=0;i<FoswikiTiny.transformCbs.length;i++){var cb=FoswikiTiny.transformCbs[i];cb.apply(editor,[editor,text])}},function(type,req,o){editor.setContent("<div class='foswikiAlert'>"+"There was a problem retrieving "+o.url+": "+type+" "+req.status+"</div>")});var eid=editor.id;var id=eid+"_2WYSIWYG";var el=document.getElementById(id);if(el){el.style.display="inline"}else{el=document.createElement("INPUT");el.id=id;el.type="button";el.value="WYSIWYG";el.className="foswikiButton";var pel=editor.getElement().parentNode;pel.insertBefore(el,editor.getElement())}el.onclick=function(){var el_help=document.getElementById("foswikiTinyMcePluginWysiwygEditHelp");if(el_help){el_help.style.display="block"}el_help=document.getElementById("foswikiTinyMcePluginRawEditHelp");if(el_help){el_help.style.display="none"}tinyMCE.execCommand("mceToggleEditor",null,eid);FoswikiTiny.switchToWYSIWYG(editor);return false};var body=document.getElementsByTagName("body")[0];tinymce.DOM.removeClass(body,"foswikiHasWysiwyg");editor.getElement().onchange=function(){var editor=tinyMCE.getInstanceById(eid);editor.isNotDirty=false;return true},editor.onSubmitHandler=function(ed,e){editor.initialized=false};editor.onSubmit.addToTop(editor.onSubmitHandler);FoswikiTiny.cleanBeforeSave(eid,"save");FoswikiTiny.cleanBeforeSave(eid,"quietsave");FoswikiTiny.cleanBeforeSave(eid,"checkpoint");FoswikiTiny.cleanBeforeSave(eid,"preview");FoswikiTiny.cleanBeforeSave(eid,"cancel")},switchToWYSIWYG:function(editor){editor.getElement().onchange=null;var text=editor.getElement().value;if(editor.onSubmitHandler){editor.onSubmit.remove(editor.onSubmitHandler);editor.onSubmitHandler=null}FoswikiTiny.enableSaveButton(false);var throbberPath=FoswikiTiny.getFoswikiVar("PUBURLPATH")+"/"+FoswikiTiny.getFoswikiVar("SYSTEMWEB")+"/"+"DocumentGraphics/processing.gif";editor.setContent("<img src='"+throbberPath+"' />");FoswikiTiny.transform(editor,"tml2html",text,function(text,req,o){for(var i=0;i<FoswikiTiny.tml2html.length;i++){var cb=FoswikiTiny.tml2html[i];text=cb.apply(this,[this,text])}if(editor.plugins.wordcount!==undefined&&editor.plugins.wordcount.block!==undefined){editor.plugins.wordcount.block=0}editor.setContent(text);editor.isNotDirty=true;FoswikiTiny.enableSaveButton(true);var id=editor.id+"_2WYSIWYG";var el=document.getElementById(id);if(el){el.style.display="none";var body=document.getElementsByTagName("body")[0];tinymce.DOM.addClass(body,"foswikiHasWysiwyg")}for(var i=0;i<FoswikiTiny.transformCbs.length;i++){var cb=FoswikiTiny.transformCbs[i];cb.apply(editor,[editor,text])}},function(type,req,o){editor.setContent("<div class='foswikiAlert'>"+"There was a problem retrieving "+o.url+": "+type+" "+req.status+"</div>")})},saveCallback:function(editor_id,html,body){var editor=tinyMCE.getInstanceById(editor_id);for(var i=0;i<FoswikiTiny.html2tml.length;i++){var cb=FoswikiTiny.html2tml[i];html=cb.apply(editor,[editor,html])}var secret_id=tinyMCE.activeEditor.getParam("foswiki_secret_id");if(secret_id!=null&&html.indexOf("<!--"+secret_id+"-->")==-1){html="<!--"+secret_id+"-->"+html}return html},convertLink:function(url,node,onSave){if(onSave==null)onSave=false;var orig=url;var pubUrl=FoswikiTiny.getFoswikiVar("PUBURL");var vsu=FoswikiTiny.getFoswikiVar("VIEWSCRIPTURL");var su=FoswikiTiny.getFoswikiVar("SCRIPTURL");url=FoswikiTiny.expandVariables(url);if(onSave){if(url.indexOf(pubUrl+"/")!=0&&url.indexOf(vsu+"/")==0&&su.indexOf(vsu)!=0){url=url.substr(vsu.length+1);url=url.replace(/\/+/g,".");if(url.indexOf(FoswikiTiny.getFoswikiVar("WEB")+".")==0){url=url.substr(FoswikiTiny.getFoswikiVar("WEB").length+1)}}}else{if(url.indexOf("/")==-1){var match=/^((?:\w+\.)*)(\w+)$/.exec(url);if(match!=null){var web=match[1];var topic=match[2];if(web==null||web.length==0){web=FoswikiTiny.getFoswikiVar("WEB")}web=web.replace(/\.+/g,"/");web=web.replace(/\/+$/,"");url=vsu+"/"+web+"/"+topic}}}return url},convertPubURL:function(url){url=FoswikiTiny.expandVariables(url);if(url.indexOf("/")==-1){var base=FoswikiTiny.getFoswikiVar("PUBURL")+"/"+FoswikiTiny.getFoswikiVar("WEB")+"/"+FoswikiTiny.getFoswikiVar("TOPIC")+"/";url=base+url}return url},getMetaTag:function(inKey){if(FoswikiTiny.metaTags==null||FoswikiTiny.metaTags.length==0){var head=document.getElementsByTagName("META");head=head[0].parentNode.childNodes;FoswikiTiny.metaTags=new Array;for(var i=0;i<head.length;i++){if(head[i].tagName!=null&&head[i].tagName.toUpperCase()=="META"){FoswikiTiny.metaTags[head[i].name]=head[i].content}}}return FoswikiTiny.metaTags[inKey]},install:function(init){if(!init){init=FoswikiTiny.init}if(init){tinyMCE.init(init);tinyMCE.each(tinyMCE.explode(init.plugins),function(p){if(p.charAt(0)=="-"){p=p.substr(1,p.length);var url=init.foswiki_plugin_urls[p];if(url)tinyMCE.PluginManager.load(p,url)}})}},getTopicPath:function(){return this.getFoswikiVar("WEB")+"."+this.getFoswikiVar("TOPIC")},getScriptURL:function(script){var scripturl=this.getFoswikiVar("SCRIPTURL");var suffix=this.getFoswikiVar("SCRIPTSUFFIX");if(suffix==null)suffix="";return scripturl+"/"+script+suffix},getRESTURL:function(fn){return this.getScriptURL("rest")+"/WysiwygPlugin/"+fn},getListOfAttachments:function(onSuccess){var url=this.getRESTURL("attachments");var path=this.getTopicPath();var params="nocache="+encodeURIComponent((new Date).getTime())+"&topic="+encodeURIComponent(path);tinymce.util.XHR.send({url:url+"?"+params,type:"POST",content_type:"application/x-www-form-urlencoded",data:params,success:function(atts){if(atts!=null){onSuccess(eval(atts))}}})}};