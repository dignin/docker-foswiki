var ColoursDlg={preInit:function(){tinyMCEPopup.requireLangPack()},init:function(ed){tinyMCEPopup.resizeToInnerSize()},set:function(colour){var ted=tinyMCE.activeEditor;ted.formatter.apply("WYSIWYG_COLOR",{value:colour});tinyMCEPopup.close()}};ColoursDlg.preInit();tinyMCEPopup.onInit.add(ColoursDlg.init,ColoursDlg);