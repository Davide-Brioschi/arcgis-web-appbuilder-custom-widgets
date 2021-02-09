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
  'dojo/_base/array',
  'dojo/_base/lang',
  'dojo/on',
  'dojo/keys',
  'dijit/_WidgetsInTemplateMixin',
  'jimu/BaseWidget',
  'jimu/portalUtils',
  'jimu/filterUtils',
  'jimu/LayerInfos/LayerInfos',
  'jimu/FilterManager',
  'esri/tasks/query',
  'esri/tasks/QueryTask',
],
function(
    declare, array, lang, on, keys, _WidgetsInTemplateMixin, BaseWidget, portalUtils, FilterUtils, LayerInfos, FilterManager,
    Query, QueryTask) {
  //To create a widget, you need to derive from BaseWidget.
  return declare([BaseWidget], {
    // DemoWidget code goes here

    //please note that this property is be set by the framework when widget is loaded.
    //templateString: template,
    name: 'MyData',
    baseClass: 'jimu-widget-mydata',
    _filters: null,

    postMixInProperties:function(){
      this.jimuNls = window.jimuNls;
    },

    postCreate: function() {
      this.inherited(arguments);
      this.layerInfosObj = LayerInfos.getInstanceSync();
      this.filterUtils = new FilterUtils();
      this.filterManager = FilterManager.getInstance();
      
      this._applyAllFilters();
      
    },
    _applyAllFilters: function(){
        if(this.config.taskUrl){
          this.portal = portalUtils.getPortal(this.appConfig.portalUrl);
          var user_name = this.portal.user.username;

          var queryTask = new QueryTask(this.config.taskUrl);
          var query = new Query();
          query.outFields = ["layer_name","definition_query"];
          query.where = `user_name='${user_name}'`;
          
          queryTask.execute(query).then(lang.hitch(this, function(response){
            if(response.features.length > 0){
                var features = response.features;
                var filter_array = [];
                array.forEach(features, function(feature){
                  filter_array.push(feature.attributes);
                });
                this._filters = filter_array;
                array.forEach(this._filters, lang.hitch(this, function(filterObj, idx) {
                  var layerId = this._getLayerId(filterObj.layer_name);
                  var layerFilterExpr = filterObj.definition_query;
                  //this.filterManager.applyWidgetFilter(layerId, this.id, layerFilterExpr, enableMapFilter, null, this.config.zoomto);
                  this.filterManager.applyWidgetFilter(layerId, this.id, layerFilterExpr, true, null, false);
                }));
            }
          }));
        }
    },
    _removeAllFilters: function(){
       if(this._filters == null){
        return;
      }else{
         array.forEach(this._filters, lang.hitch(this, function(filterObj, idx) {
            var layerId = this._getLayerId(filterObj.layer_name);
            this.filterManager.applyWidgetFilter(layerId, this.id, "", null, null, false);
         }));
      }
    },
    
    startup: function() {
      this.inherited(arguments);
    },

    _getLayerId: function(layer_name){
        var result = null;
        array.forEach(this.layerInfosObj.getLayerInfoArray(), function(layerInfo) {
        //this.layerInfosObj.traversal(function(layerInfo) {
          //console.log(layerInfo.title, layerInfo.id);
          if(layerInfo.title == layer_name){
            result = layerInfo.id;
            return;
          }
        });
        return result;
    },
    /*
    onOpen: function(){
      console.log('onOpen');
    },

    onClose: function(){
      console.log('onClose');
    },

    onMinimize: function(){
      console.log('onMinimize');
    },

    onMaximize: function(){
      console.log('onMaximize');
    },

    onSignIn: function(credential){
      console.log('onSignIn');
    },

    onSignOut: function(){
      console.log('onSignOut');
    },
    
    showVertexCount: function(count){
      this.vertexCount.innerHTML = 'The vertex count is: ' + count;
    },
    */    
   destroy: function(){
     this._removeAllFilters();
     this.inherited(arguments);
  }
  });
});