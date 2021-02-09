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
  'dojo/Deferred',
  'jimu/BaseFeatureAction',
  'jimu/Role',
  'jimu/LayerInfos/LayerInfos',
  'jimu/WidgetManager',
  'jimu/portalUtils',
  "esri/tasks/query",
  "esri/tasks/QueryTask",
], function(declare, array, lang, Deferred, BaseFeatureAction, Role, LayerInfos, WidgetManager, portalUtils, EsriQuery, QueryTask){
  var clazz = declare(BaseFeatureAction, {
    map: null,
    iconClass: 'icon-edit',
   
    isFeatureSupported: function(featureSet, layerParam){
      /*jshint unused: false*/
      var resultDef = new Deferred();
      var layer = layerParam ||
        lang.getObject('_wabProperties.popupInfo.layerForActionWithEmptyFeatures', false, this.map.infoWindow);

      if(!layer) {
        resultDef.resolve(false);
        return resultDef;
      }

      var jimuLayerInfos = LayerInfos.getInstanceSync();
      var jimuLayerInfo = jimuLayerInfos.getLayerInfoByTopLayerId(layer && layer.id);
      /*
      var userDef = new Deferred();
      var portal = portalUtils.getPortal(window.portalUrl);
      portal.getUser().then(lang.hitch(this, function(user) {
        userDef.resolve(user);
      }), lang.hitch(this, function() {
        userDef.resolve(null);
      }));
      */

      var layerIsEditableDef = new Deferred();
      if(jimuLayerInfo) {
        layerIsEditableDef = jimuLayerInfo.isEditable();
      } else {
        layerIsEditableDef.resolve(false);
      }

      layerIsEditableDef.then(lang.hitch(this, function(isEditableLayer) {
        var layerHasBeenConfiged = false;
        var editConfig = this.appConfig.getConfigElementById(this.widgetId).config;
        
        if(!editConfig.editor.layerInfos) {
          layerHasBeenConfiged = false;
        } else if(editConfig.editor.layerInfos.length === 0) {
          layerHasBeenConfiged = true;
        } else {
            if(editConfig.editor.blockedUrl){
                  this.portal = portalUtils.getPortal(this.appConfig.portalUrl);
                  var user_name = this.portal.user.username;
                  var queryTask = new QueryTask(editConfig.editor.blockedUrl);
                  var query = new EsriQuery();
                  query.outFields = ["layer_name","field_names"];
                  query.where = `user_name='${user_name}'`;
                  queryTask.execute(query).then(lang.hitch(this, function(response){
                      if(response.features.length > 0){
                          var features = response.features;
                          var blocked_layers = [];
                          array.forEach(features, function(feature){
                            if(feature.attributes["field_names"]==null){
                              blocked_layers.push(feature.attributes["layer_name"]);
                            }
                          });
                          editConfig.editor.layerInfos = editConfig.editor.layerInfos.filter(lang.hitch(this,function(layerInfo){
                            for(var i=0;i<blocked_layers.length;i++){
                                if(layerInfo.featureLayer.id == this._getLayerId(blocked_layers[i])){
                                  return false;
                                }
                            }
                            return true;
                          }));
                      }
                      array.forEach(editConfig.editor.layerInfos.concat(editConfig.editor.tableInfos || []),
                      function(layerInfoParam) {
                        if(layer.id === layerInfoParam.featureLayer.id) {
                          layerHasBeenConfiged = true;
                        }
                      });
                      if(layerHasBeenConfiged &&
                        //layer.isEditable &&
                        //layer.isEditable()) {
                        jimuLayerInfo &&
                        jimuLayerInfo.getUrl() &&
                        //jimuLayerInfo.isEditable(user) &&
                        isEditableLayer) {
                        resultDef.resolve(true);
                        //result = true;
                      } else {
                        resultDef.resolve(false);
                        //result = false;                   
                      }
                      //return resultDef;
                  }));
            }else{
              array.forEach(editConfig.editor.layerInfos.concat(editConfig.editor.tableInfos || []),
              function(layerInfoParam) {
                if(layer.id === layerInfoParam.featureLayer.id) {
                  layerHasBeenConfiged = true;
                }
              });
              if(layerHasBeenConfiged &&
                //layer.isEditable &&
                //layer.isEditable()) {
                jimuLayerInfo &&
                jimuLayerInfo.getUrl() &&
                //jimuLayerInfo.isEditable(user) &&
                isEditableLayer) {
                resultDef.resolve(true);
                //result = true;
              } else {
                resultDef.resolve(false);
                //result = false;
              }
            }
        }
      }));
      return resultDef;
    },

    onExecute: function(featureSet, layerParam){
      //jshint unused:false
      var layer = layerParam ||
        lang.getObject('_wabProperties.popupInfo.layerForActionWithEmptyFeatures', false, this.map.infoWindow);
      var def = new Deferred();
      

      WidgetManager.getInstance().triggerWidgetOpen(this.widgetId)
      .then(function(editWidget) {
        editWidget.beginEditingByFeatures(featureSet.features, layer);
      });

      return def.promise;
    },

    _checkEditPrivilege: function(user) {
      var hasEditPrivilege = true;
      if(user) {
        var userRole = new Role({
          id: (user.roleId) ? user.roleId : user.role,
          role: user.role
        });
        if(user.privileges) {
          userRole.setPrivileges(user.privileges);
        }

        hasEditPrivilege = userRole.canEditFeatures();
      }
      return hasEditPrivilege;
    },
    _getLayerId: function(layer_name){
        var result = null;
        var layerInfos = LayerInfos.getInstanceSync(this.map, this.map.itemInfo);
        array.forEach(layerInfos.getLayerInfoArray(), function(layerInfo) {
        //this._jimuLayerInfos.traversal(function(layerInfo) {
          //console.log(layerInfo.title, layerInfo.id);
          if(layerInfo.title == layer_name){
            result = layerInfo.id;
            return;
          }
        });
        return result;
    }

  });
  return clazz;
});
