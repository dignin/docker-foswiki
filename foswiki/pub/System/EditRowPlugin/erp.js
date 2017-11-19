(function($){var instrument;var editing_element;if($.editable){$.editable.addInputType("datepicker",{element:function(settings,original){var input=$("<input>");if(settings.width!="none")input.width(settings.width);if(settings.height!="none")input.height(settings.height);input.attr("autocomplete","off");$(this).append(input);return input},plugin:function(settings,original){var form=this;settings.onblur="ignore";var inp=$(this).find("input");var cal=new Calendar(1,null,function(cal,date){if(cal.dateClicked){cal.hide();inp.val(date);$(form).trigger("submit")}},function(cal){cal.hide();original.reset.apply(original,[form]);$(original).addClass(settings.cssdecoration)});cal.showsOtherMonths=true;cal.setRange(1900,2070);cal.create();if(settings.format){cal.showsTime=settings.format.search(/%H|%I|%k|%l|%M|%p|%P/)!=-1;cal.setDateFormat(settings.format);cal.setTtDateFormat(settings.format)}cal.parseDate(original.revert.replace(/^\s+/,""));cal.showAtElement(inp[0],"Br")}});$.editable.addInputType("radio",{element:function(settings,original){var hinput=$('<input type="hidden" id="'+settings.name+'" name="'+settings.name+'" value="" />');$(this).append(hinput);var key,input,checked,id,cnt=1;for(key in settings.data){id=settings.name+"_button"+cnt;$(this).append('<label for="'+id+'">'+settings.data[key]+"</label>");checked=key===settings.text?' checked="checked"':"";input=$('<input type="radio" name="'+settings.name+'_buttons" id="'+id+'"'+checked+' value="'+key+'" />');$(this).append(input);input.click(function(){$("#"+settings.name).val($(this).val())});cnt++}return hinput}});$.editable.addInputType("erpselect",{element:function(settings,original){var select=$("<select />");$(this).append(select);return select},content:function(data,settings,original){console.debug("content");if(String==data.constructor){eval("var json = "+data)}else{var json=data}for(var i in json.order){var key=json.order[i];if(json.keys[key]==null)continue;var option=$("<option />").val(key).append(json.keys[key]);$("select",this).append(option)}$("select",this).children().each(function(){if($(this).val()==json.selected||$(this).text()==$.trim(original.revert)){$(this).attr("selected","selected")}})}});$.editable.addInputType("checkbox",{element:function(settings,original){var hinput=$('<input type="hidden" id="'+settings.name+'" name="'+settings.name+'" value="" />');$(this).append(hinput);var key,input,checked,id,cnt=1;var picked=new RegExp("\\b("+settings.text.replace(/\s*,\s*/,"|")+")\\b");for(key in settings.data){id=settings.name+"_button"+cnt;checked=picked.test(key)?' checked="checked"':"";input=$('<input type="checkbox" name="'+settings.name+'_buttons" id="'+id+'"'+checked+' value="'+key+'" />');$(this).append(input);$(this).append('<label for="'+id+'">'+settings.data[key]+"</label>");input.change(function(){var vs='input[name="'+settings.name+'_buttons"]';var vals=[];$(vs).each(function(i,e){if($(e).attr("checked"))vals.push($(e).val())});$("#"+settings.name).val(vals.join(","))});cnt++}return hinput}})}var onDrop=function(event,container,dragee,rows){var target=$(event.target);var edge;if(target.hasClass("drag-helper")){var top=rows.first().offset().top;var posY=event.pageY-top;edge=posY<(rows.last().offset().top()+rows.last().height()-top)/2?"top":"bottom";if(edge=="top")target=rows.first();else target=rows.last()}else{var posY=event.pageY-target.offset().top;edge=posY<target.height()/2?"top":"bottom"}var target_data=target.data("erp-data");var dragee_data=dragee.data("erp-data");var old_pos=dragee_data.row;var new_pos;if(target_data!=null)new_pos=target_data.row;else{if(target.next().size()>0)new_pos=0;else new_pos=target.parent().children().size()}var table=container.closest("table");var move_data=$.extend({noredirect:1},target_data);$.each(table.data("erp-data"),function(k,v){move_data["erp_"+k]=v});if(edge=="bottom")new_pos++;if(new_pos==old_pos)return;dragee.fadeTo("slow",0);container.css("cursor","wait");move_data.erp_action="moveRowCmd";move_data.old_pos=old_pos;move_data.new_pos=new_pos;if(move_data.erp_row==null)move_data.erp_row=old_pos;move_data.erp_stop_edit=1;$('input[name="validation_key"]').first().each(function(){var vkey=$(this);vkey.closest("form").each(function(){if(typeof StrikeOne!=="undefined")StrikeOne.submit(this)});move_data.validation_key=vkey.val()});table.css("cursor","wait");var tid=table.attr("id");if(!tid){tid="table"+Date.now();table.attr("id",tid)}$.ajax({url:foswiki.getPreference("SCRIPTURLPATH")+"/rest/EditRowPlugin/save",type:"POST",data:move_data,success:function(response){var table=$("#"+tid);if(response.indexOf("RESPONSE")!=0){container.replaceWith($(response).find("form[name='loginform']"));$("form[name='loginform'] input[name='noredirect']").remove()}else{var newtable=$(response.replace(/^RESPONSE/,""));newtable.addClass("erp_new_table");table.replaceWith(newtable);$(document).find(".erp_new_table").each(function(index,value){$(this).removeClass("erp_new_table");instrument($(this))})}if(edge=="top")dragee.insertBefore(target);else dragee.insertAfter(target);table.css("cursor","auto")},error:function(jqXHR,textStatus,errorThrown){dragee.fadeTo("fast",1);$("#"+tid).css("cursor","auto");var mess=jqXHR.responseText;if(mess&&mess.indexOf("RESPONSE")==0)mess=mess.replace(/^RESPONSE/,": ");else mess="";alert("Error "+jqXHR.status+" - Failed to move row"+mess)}})};var dragHelper=function(tr){var helper=tr.clone();var dv=$("<div><table></table></div>").find("table").append(helper.addClass("drag-helper")).end();return dv};var makeRowDraggable=function(tr){var container=tr.closest("thead,tbody,tfoot,table");tr.find("td").first().each(function(){var handle=$("<a href='#' class='ui-icon-arrow-2-n-s erp_drag_button ui-icon' title='Click and drag to move row'>move</a>");var div=$("<div class='erpJS_container'></div>");div.append(handle);$(this).append(div);handle.draggable({containment:container,axis:"y",appendTo:container,helper:function(event){return dragHelper(tr)},start:function(event,ui){tr.fadeTo("fast",.3);var rows=container.find("tr");rows.not(tr).not(".drag-helper").droppable({drop:function(event,ui){onDrop(event,container,tr,rows)}})},stop:function(){tr.fadeTo("fast",1)}})})};var editControls={onedit:function(settings,self){$(self).next().hide()},submitdata:function(value,settings){var d=$.extend({action:"saveCellCmd"},$(this).data("erp-data"),$(this).closest("tr").data("erp-data"),$(this).closest("table").data("erp-data")),sd={};$.each(d,function(k,v){sd["erp_"+k]=v});sd.noredirect=1;$(this).closest("form").each(function(){if(typeof StrikeOne!=="undefined")StrikeOne.submit(this);$(this).find('input[name="validation_key"]').each(function(){sd.validation_key=$(this).val()})});return sd},onsubmit:function(settings,self){if(self.isSubmitting)return false;self.isSubmitting=true;$("<div class='erp-clock'></div>").insertAfter($(self).next());return true},onreset:function(settings,self){$(self).next().show();return true},onerror:function(settings,self,xhr){var mess=xhr.responseText;self.isSubmitting=false;$(self).parent().find(".erp-clock").remove();$(self).next().show();if(mess.indexOf("RESPONSE")==0)alert(mess.replace(/^RESPONSE/,""))},onblur:"cancel"};var editCallback=function(el,value,settings,val2data){value=value.replace(/^RESPONSE/,"");$(el).html(value);if(val2data){settings.data=value}el.isSubmitting=false;$(el).parent().find(".erp-clock").remove();$(el).next().show()};var textCallback=function(value,settings){editCallback(this,value,settings,true)};var otherCallback=function(value,settings){editCallback(this,value,settings,false)};var onSaveComplete=function(jqXHR,status){var nonce=jqXHR.getResponseHeader("X-Foswiki-Validation");if(nonce){$("input[name='validation_key']").each(function(){$(this).val("?"+nonce)})}if(status!="success"){alert(jqXHR.responseText)}};var attachJEditable=function(el){var p=el.data("erp-data");if(!p||!p.type||p.type=="label")return;var div=$("<div class='erpJS_container'></div>");var button=$('<div class="erp-edit-button" title="Click to edit"></div>');div.append(button);el.closest("td").prepend(div);button.click(function(){editing_element=el;el.triggerHandler("erp_edit")});p=$.extend({event:"erp_edit",placeholder:'<div class="erp_empty"></div>',callback:p.type=="text"||p.type=="textarea"?textCallback:otherCallback,tooltip:"",ajaxoptions:{complete:onSaveComplete}},p,editControls);var url=foswiki.getPreference("SCRIPTURLPATH")+"/rest/EditRowPlugin/save";if(el.editable)el.editable(url,p)};var erp_dataDirty=false;var erp_dirtyVeto=false;var repair_table=function($table,info){var hr,fr;if(!info)return;if(typeof info.headerrows!=="undefined")hr=info.headerrows;else if(info.TABLE&&typeof info.TABLE.headerrows!=="undefined")hr=info.TABLE.headerrows;if(typeof info.footerrows!=="undefined")fr=info.footerrows;else if(info.TABLE&&typeof info.TABLE.footerrows!=="undefined")fr=info.TABLE.footerrows;var $tbody=$table.children("tbody");if($tbody.length===0)return;if(hr>0){var $thead=$table.children("thead");if($thead.length===0){$thead=$("<thead></thead>");$thead.prependTo($table)}while($thead.children().length<hr){if($tbody.children().length>0)$tbody.children().first().detach().appendTo($thead);else if($tfoot.children().length>0)$tfoot.children().first().detach().appendTo($thead);else break}}if(fr>0){var $tfoot=$table.children("tfoot");if($tfoot.length===0){$tfoot=$("<tfoot></tfoot>");$tfoot.appendTo($table)}while($tfoot.children().length<fr){if($tbody.children().length>0)$tbody.children().last().detach().prependTo($tfoot);else break}}};instrument=function(context){context.find(".erpJS_cell").each(function(){var p=$(this).data("erp-tabledata");if(p){var table=$(this).closest("table");table.data("erp-data",p);repair_table(table,p);table.addClass("erp_editable")}p=$(this).data("erp-trdata");if(p){var tr=$(this).closest("tr");tr.data("erp-data",p);tr.addClass("ui-draggable")}});context.find(".interactive_sort").first().each(function(){var p=$(this).data("sort");$(this).closest("table").data("sort",p).find(".tableSortIcon").remove()});context.find(".erpJS_input").change(function(){erp_dataDirty=true});context.find("a.erpJS_willDiscard").click(function(event){if(erp_dataDirty){if(!confirm("This action will discard your changes.")){erp_dirtyVeto=true;return false}}return true});if(!$.browser.msie||parseInt($.browser.version)>=8)context.find("a.erpJS_submit").button();context.find("a.erpJS_submit").click(function(){var cont=true;if(erp_dirtyVeto){erp_dirtyVeto=false;cont=false}else{var form=$(this).closest("form");if(form&&form.length>0){form[0].erp_action.value=$(this).attr("href");form.submit();cont=false}}return cont});$(".interactive_sort",context).click(function(){sortTable(this,$(this).data("sort"));return false}).each(function(){$(this).addClass("erpJS_sort")});$("table.erp_editable",context).find(".foswikiSortedCol").find(".interactive_sort").each(function(){var $this=$(this);$this.parent("a").each(function(){$this.unwrap()});var $t=$this.closest("table");$t.find(".tableSortIcon").remove();var s=$this.data("sort");$("<div></div>").addClass("tableSortIcon ui-icon erp-button "+"ui-icon-circle-triangle-"+(s&&s.reverse==1?"s":"n")).attr("title","Sorted "+(s&&s.reverse==1?"descending":"ascending")).appendTo($this.closest("td,th"))});var current_row=null;$(".ui-draggable").mouseover(function(e){var tr=$(this);if(!tr.is(".erp_instrumented")){tr.addClass("erp_instrumented");if(tr.closest("tbody,table").children().length>1)makeRowDraggable(tr);tr.find(".erpJS_cell").each(function(index,value){attachJEditable($(this))})}if(!current_row||tr[0]!=current_row[0]){if(current_row){current_row.find(".erpJS_container").fadeOut()}tr.find(".erp_drag_button,.erpJS_container").fadeIn();current_row=tr}})};$.ajaxSetup({error:function(jqXHR,textStatus,errorThrown){if(jqXHR.status==401)alert("Please log in before editing")}});$(function(){instrument($(document))});$(window).load(function(){var btn=$(".erp-edittable");var link=$(btn).parent();var href=$(link).attr("href");$(btn).click(function(){window.location.assign(href)})})})(jQuery);