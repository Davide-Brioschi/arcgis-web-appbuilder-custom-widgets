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
  'dojo/_base/lang',
  'dojo/_base/array',
  'dojo/_base/html',
  'dojo/on',
  'dijit/_WidgetsInTemplateMixin',
  'jimu/BaseWidgetSetting',
  'jimu/dijit/_FeaturelayerSourcePopup',
],
function(declare, lang, array, html, on, _WidgetsInTemplateMixin, BaseWidgetSetting,
         _FeaturelayerSourcePopup){

  return declare([BaseWidgetSetting, _WidgetsInTemplateMixin], {
    baseClass: 'jimu-widget-mydata-setting',

    postMixInProperties: function(){
      this.inherited(arguments);
      lang.mixin(this.nls, window.jimuNls.common);
      lang.mixin(this.nls, window.jimuNls.units);
    },

    postCreate: function(){
      //the config object is passed in
      this.setConfig(this.config);
    },

    _onChooseTaskClicked: function(){
        var args = {
          titleLabel: this.nls.setDataSource,

          dijitArgs: {
            multiple: false,
            createMapResponse: this.map.webMapResponse,
            portalUrl: this.appConfig.portalUrl,
            style: {
              height: '100%'
            }
          }
        };

        var featurePopup = new _FeaturelayerSourcePopup(args);

        this.own(on(featurePopup, 'ok', lang.hitch(this, function(item){
          
          if(this.config.taskUrl === item.url){
            featurePopup.close();
            return;
          }
          this.config.taskUrl = item.url;
          this.urlTextBox.set('value', this.config.taskUrl);
          //this.setConfig(this.config);
          featurePopup.close();
        })));

        this.own(on(featurePopup, 'cancel', lang.hitch(this, function(){
          featurePopup.close();
        })));
  
        featurePopup.startup();
    },
    setConfig: function(config){
      if(config.taskUrl){
        this.config = config;
        this.urlTextBox.set('value', config.taskUrl);
      }
    },

    getConfig: function(){
      return this.config;
    }
  });
});