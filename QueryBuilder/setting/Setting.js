///////////////////////////////////////////////////////////////////////////
// Copyright © Esri. All Rights Reserved.
//
// Licensed under the Apache License Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
///////////////////////////////////////////////////////////////////////////

define([
    'dojo/_base/declare',
    'dojo/on',
    'dojo/_base/lang',
    'dijit/_WidgetsInTemplateMixin',
    'jimu/BaseWidgetSetting',
    './FilterWidgetSetting',
    './QueryWidgetSetting',
    './GPWidgetSetting'
  ],
  function(declare, on, lang, _WidgetsInTemplateMixin, BaseWidgetSetting, FilterWidgetSetting, QueryWidgetSetting, GPWidgetSetting) {
  
    return declare([BaseWidgetSetting, _WidgetsInTemplateMixin], {
      
      baseClass: 'jimu-widget-querybuilder-setting',
  
      currentSetting: null,
  
      postCreate: function(){
        this.inherited(arguments);
        
        if(this.config){
          this.setConfig(this.config);
        }
      },
  
      _controlWidgetSettingRadio: function() {
        
        if(this.currentSetting){
          this.currentSetting.destroy();
        }
        this.currentSetting = null;
        
        if(this.filterRadio.get('checked')){
            this.currentSetting = new FilterWidgetSetting({
              nls: this.nls,
              map: this.map,
              folderUrl: this.folderUrl,
              //appConfig: this.appConfig,
              config: this.config
            });
        }else if(this.queryRadio.get('checked')){
            this.currentSetting = new QueryWidgetSetting({
              nls: this.nls,
              map: this.map,
              folderUrl:this.folderUrl,
              appConfig: this.appConfig,
              config: this.config
            });
        }else if(this.gpRadio.get('checked')){
            this.currentSetting = new GPWidgetSetting({
              nls: this.nls,
              map: this.map,
              appConfig: this.appConfig,
              config: this.config
            });
        }
        if(this.currentSetting){
           this.currentSetting.placeAt(this.widgetSettingContainer);
        }
      },
  
      setConfig: function(config){
        if(config.widgetSwitch == 'Filter'){
           this.filterRadio.set('checked', true);
        }else if(config.widgetSwitch == 'Query'){
           this.queryRadio.set('checked', true);
           
        }else if(config.widgetSwitch == 'GP'){
           this.gpRadio.set('checked', true);
        }
        this.cbxHideNonQueriedLayers.setLabel(this.nls.hideNonQueriedLayersTip);
        this.cbxHideNonQueriedLayers.setValue(config.hideNonQueriedLayers);
        this._controlWidgetSettingRadio();
      
        this.own(on(this.filterRadio, 'click', lang.hitch(this, this._controlWidgetSettingRadio)));
        this.own(on(this.queryRadio, 'click', lang.hitch(this, this._controlWidgetSettingRadio)));
        this.own(on(this.gpRadio, 'click', lang.hitch(this, this._controlWidgetSettingRadio)));
      },
  
      getConfig: function(){
        if(this.filterRadio.get('checked')){
           var widgetSwitch = 'Filter';
        }else if(this.queryRadio.get('checked')){
           var widgetSwitch = 'Query';
        }else if(this.gpRadio.get('checked')){
          var widgetSwitch = 'GP';
        }
        if(this.currentSetting){
          var config = this.currentSetting.getConfig();
          if(!config){
            return false;
          }
          config.widgetSwitch = widgetSwitch;
          config.hideNonQueriedLayers = this.cbxHideNonQueriedLayers.getValue();
        }
        return config;
      },
  
      destroy: function(){
        if(this.currentSetting){
          this.currentSetting.destroy();
          this.currentSetting = null;
        }
        this.inherited(arguments);
      },
    });
  });