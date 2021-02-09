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
    'dijit/_WidgetsInTemplateMixin',
    'jimu/BaseWidget',
    './FilterWidget',
    './QueryWidget',
    './GPWidget'
  ],
    function(declare, _WidgetsInTemplateMixin, BaseWidget, FilterWidget, QueryWidget, GPWidget){
       return declare([BaseWidget, _WidgetsInTemplateMixin], {
         name: 'QueryBuilder',
         baseClass: 'jimu-widget-querybuilder',
         currentWidget: null,
         
         postMixInProperties: function(){
          this.inherited(arguments);
         }, 
  
         postCreate: function(){
            this.inherited(arguments);
            if(this.currentWidget){
              this.currentWidget.destroy();
              this.currentWidget = null;
            }
            if(this.config.widgetSwitch == 'Filter'){
              this.currentWidget = new FilterWidget({
                wId: this.id,
                nls: this.nls,
                map: this.map,
                folderUrl:this.folderUrl,
                config: this.config,
                appConfig: this.appConfig
              });
            }else if(this.config.widgetSwitch == 'Query'){
              this.currentWidget = new QueryWidget({
                wId: this.id,
                nls: this.nls,
                map: this.map,
                folderUrl:this.folderUrl,
                config: this.config
              });
            }else if(this.config.widgetSwitch == 'GP'){
              this.currentWidget = new GPWidget({
                wId: this.id,
                nls: this.nls,
                map: this.map,
                config: this.config,
                appConfig: this.appConfig
              });
            }
            this.currentWidget.placeAt(this.widgetContainer);
         },
         
         startup: function(){
            if(this.currentWidget){
                if(this.config.widgetSwitch == 'Filter' || this.config.widgetSwitch == 'GP'){
                  this.currentWidget.startup();
                }  
              }
         },

         onOpen: function(){
            if(this.currentWidget){
              if(this.config.widgetSwitch == 'Query' || this.config.widgetSwitch == 'GP'){
                this.currentWidget.onOpen();
              }  
            }
         },
  
         onActive: function(){
            if(this.config.widgetSwitch == 'Query' && this.currentWidget){
              this.currentWidget.onActive();
            }
         },
  
         onDeActive: function(){
            if(this.currentWidget){
              if(this.config.widgetSwitch == 'Query' || this.config.widgetSwitch == 'GP'){
                this.currentWidget.onDeActive();
              }  
            }
         },
  
         onClose:function(){
            this.inherited(arguments);
            if(this.currentWidget){
              if(this.config.widgetSwitch == 'Query' || this.config.widgetSwitch == 'GP'){
                this.currentWidget.onClose();
              }
            }
         },
          
         destroy:function(){
            if(this.currentWidget){
              this.currentWidget.destroy();
              this.currentWidget = null;
            }
            this.inherited(arguments);
          }
       });
  });