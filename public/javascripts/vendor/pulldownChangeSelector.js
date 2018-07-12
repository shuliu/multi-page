// /*console with ie*/ (function(){for(var a,e=function(){},b="assert clear count debug dir dirxml error exception group groupCollapsed groupEnd info log markTimeline profile profileEnd table time timeEnd timeStamp trace warn".split(" "),c=b.length,d=window.console=window.console||{};c--;)a=b[c],d[a]||(d[a]=e)})();
/* *
 * 神腦EC網站下拉選單套件 senao ec pulldown change plugin
 * v0.0.2
 * @sh
 * sample code 在置底註解段落
 * */
// var PULLDOWNCHANGESELECTORDATA = {
//   "citytown": [],
//   "citytownstore": []
// };

(function($) {
  "use strict";

  $.fn.pulldownChangeSelector = function(options) {
    var then, defaults, ENV, SOURCEURL, SOURCEKEY, cityData, townData, zipData, storeData, cityValue, cityIndex, townValue, townIndex, storeValue, storeIndex;
    var PULLDOWNCHANGESELECTORDATA = { "citytown": [], "citytownstore": [] };

    if (this.length === 0) {
      return this;
    }

    // support multiple elements
    if (this.length > 1) {
      this.each(function() {
        $(this).pulldownChangeSelector(options);
      });
      return this;
    }

    then = this;
    var selector = {};
    defaults = {

      debug: false,

      // elements
      city: 'select:eq(0)', // 縣市 (jquery find search)
      town: 'select:eq(1)', // 鄉鎮 (jquery find search)
      zip: null, // 郵遞區號 (jquery find search)
      store: null, // 門市 (jquery find search)
      cityElement: null,
      townElement: null,
      zipElement: null,
      storeElement: null,

      // api type
      storeType: false, // 門市, if(storeType is true) island = 'stores'
      island: 'data', // 縣市鄉鎮不含門市選用的 json 資料位置 (default: data), json 內的 data, taiwan_data, island_data

      // callbacks
      onReady: function() { // return element and list data
        return true;
      }, // 回傳 this
      onChange: function() { // return change element, value and list data
        return true;
      },

      // console error string
      errorString: {
        "groupStart": "pulldownChangeSelector package debug log (%s)",
        "noElement": "can not get element (%s)",
        "noConnect": "can not connect to api"
      }
    };

    // $.extend(defaults, options);
    selector.settings = $.extend({}, defaults, options);

    if (selector.settings.debug) {
      console.group(selector.settings.errorString.groupStart, (then.prop("tagName") + '.' + then.attr('class').replace(/ /g, ".")));
    }

    // 判斷開發環境
    ENV = $('meta[name="env"]').attr('content') ? $('meta[name="env"]').attr('content') : "dev";
    /**
     * 資料來源 (api回傳抓取位置不同)
     * citytown: 縣市鄉鎮
     * citytownstore: 縣市鄉鎮門市
     **/
    SOURCEKEY = selector.settings.storeType === false ? 'citytown' : 'citytownstore';
    SOURCEURL = {
      "dev": {
        "citytown": "/public/apis/API_taiwan_area.json",
        "citytownstore": "/public/apis/APP_SenaoOnlineStore_type2.json"
      },
      "lab": {
        "citytown": "//m.senao.com.tw/apis/senao_online/EC_S3Resource.jsp?apiKey=API_taiwan_area.json",
        "citytownstore": "//m.senao.com.tw/apis/senao_online/EC_S3Resource.jsp?apiKey=APP_SenaoOnlineStore_type2.json"
      },
      "stg": {
        "citytown": "//stgapis.senao.com.tw/apis/senao_online/EC_S3Resource.jsp?apiKey=API_taiwan_area.json",
        "citytownstore": "//stgapis.senao.com.tw/apis/senao_online/EC_S3Resource.jsp?apiKey=APP_SenaoOnlineStore_type2.json"
      },
      "prd": {
        "citytown": "//apis.senao.com.tw/apis/senao_online/EC_S3Resource.jsp?apiKey=API_taiwan_area.json",
        "citytownstore": "//apis.senao.com.tw/apis/senao_online/EC_S3Resource.jsp?apiKey=APP_SenaoOnlineStore_type2.json"
      }
    };

    // 初始化抓取 api
    this._init = function() {

      // 設定作用域
      selector.settings.cityElement = $(this).find(selector.settings.city);
      selector.settings.townElement = $(this).find(selector.settings.town);
      if (selector.settings.zip !== null) {
        selector.settings.zipElement = $(this).find(selector.settings.zip);
        selector.settings.zip = selector.settings.zipElement.length <= 0 ? null : selector.settings.zip;
      }
      if (selector.settings.store !== null) {
        selector.settings.storeElement = $(this).find(selector.settings.store);
        selector.settings.store = selector.settings.storeElement.length <= 0 ? null : selector.settings.store;
      }

      if (selector.settings.cityElement.length <= 0 || selector.settings.townElement.length <= 0) {
        if (selector.settings.debug) {
          console.log(selector.settings.errorString.noElement, 'city or town');
        }
        return false;
      }

      then._initData();
      then._initOption();
      then._initEvent();
      then._initDefaultValue();
      selector.settings.onReady(then, PULLDOWNCHANGESELECTORDATA[SOURCEKEY]);
    };

    // 導入資料
    this._initData = function() {
      if (PULLDOWNCHANGESELECTORDATA[SOURCEKEY].length <= 0) {
        var $ajax;
        $ajax = $.ajax({
          url: SOURCEURL[ENV][SOURCEKEY],
          dataType: 'json',
          async: false
        });
        $ajax.done(function(jd) {
          PULLDOWNCHANGESELECTORDATA[SOURCEKEY] = jd[(selector.settings.storeType === false ? selector.settings.island : 'stores')];
          if (selector.settings.debug) {
            console.log(PULLDOWNCHANGESELECTORDATA[SOURCEKEY].length);
          }
          // then._initOption();
        });
        $ajax.fail(function() {
          if (selector.settings.debug) {
            console.log(selector.settings.errorString.noConnect);
          }
          return false;
        });
      } else {
        return false;
        // 目前先全抓, PULLDOWNCHANGESELECTORDATA 放到 package 內做區域變數
        // 因為有可能同一頁會有多個不同的 island (購物車頁的訂購人地址吃全縣市、收件人地址只吃本島)

        // console.log(selector.settings.island);
        // console.log(SOURCEURL[ENV][SOURCEKEY]);
        // PULLDOWNCHANGESELECTORDATA[SOURCEKEY] = SOURCEURL[ENV][SOURCEKEY][(selector.settings.storeType === false ? selector.settings.island : 'stores')];
        // then._initOption();
      }
    };

    // 設置預設 select option
    this._initOption = function() {
      cityValue = townValue = "";
      cityIndex = townIndex = 0;

      // set data tree
      cityData = PULLDOWNCHANGESELECTORDATA[SOURCEKEY];
      townData = selector.settings.storeType === false ? PULLDOWNCHANGESELECTORDATA[SOURCEKEY][cityIndex].districs : PULLDOWNCHANGESELECTORDATA[SOURCEKEY][cityIndex].data;

      // insert city and town option
      then.insertOption(selector.settings.cityElement, cityData, 'name', 0);
      then.insertOption(selector.settings.townElement, townData, 'name', 1);

      // set store
      if (selector.settings.storeType === true && selector.settings.storeElement.length > 0) {
        storeData = PULLDOWNCHANGESELECTORDATA[SOURCEKEY][cityIndex].data[townIndex].data;
        then.insertOption(selector.settings.storeElement, storeData, 'storeName', 2);
      }

      // set zip
      else if (selector.settings.zipElement !== null && selector.settings.zipElement.length > 0) {
        zipData = PULLDOWNCHANGESELECTORDATA[SOURCEKEY][cityIndex].districs[townIndex].zip_code;
        then.insertZip(selector.settings.zipElement, zipData);
      }

    };

    // select event
    this._initEvent = function() {

      // city change event
      selector.settings.cityElement.on('change', function() {

        // set town select list
        then.getIndex('city');
        // console.log(cityIndex, townIndex, storeIndex);
        // console.log(selector.settings);console.log(SOURCEKEY);console.log(cityIndex);console.log(PULLDOWNCHANGESELECTORDATA);
        townData = selector.settings.storeType === false ? PULLDOWNCHANGESELECTORDATA[SOURCEKEY][cityIndex].districs : PULLDOWNCHANGESELECTORDATA[SOURCEKEY][cityIndex].data;
        then.insertOption(selector.settings.townElement, townData, 'name', 1);

        // set store
        if (selector.settings.storeType === true && selector.settings.storeElement.length > 0) {
          // console.log( PULLDOWNCHANGESELECTORDATA[SOURCEKEY] );
          // console.log( PULLDOWNCHANGESELECTORDATA[SOURCEKEY][cityIndex] );
          // console.log( PULLDOWNCHANGESELECTORDATA[SOURCEKEY][cityIndex].data );
          // console.log( PULLDOWNCHANGESELECTORDATA[SOURCEKEY][cityIndex].data[townIndex] );
          storeData = PULLDOWNCHANGESELECTORDATA[SOURCEKEY][cityIndex].data[townIndex].data;
          then.insertOption(selector.settings.storeElement, storeData, 'storeName', 2);
        }
        
        // set zip
        else if (selector.settings.zipElement !== null && selector.settings.zipElement.length > 0) {
          zipData = PULLDOWNCHANGESELECTORDATA[SOURCEKEY][cityIndex].districs[townIndex].zip_code;
          then.insertZip(selector.settings.zipElement, zipData);
        }

        // trigger onChange callback
        selector.settings.onChange(this, cityValue, cityData[cityIndex]);

      });

      // town change event
      selector.settings.townElement.on('change', function() {

        // set town select list
        then.getIndex('town');
        // console.log(cityIndex, townIndex, storeIndex);

        // set store
        if (selector.settings.storeType === true && selector.settings.storeElement.length > 0) {
          storeData = PULLDOWNCHANGESELECTORDATA[SOURCEKEY][cityIndex].data[townIndex].data;
          then.insertOption(selector.settings.storeElement, storeData, 'storeName', 2);
        }

        // set zip
        else if (selector.settings.zipElement !== null && selector.settings.zipElement.length > 0) {
          zipData = PULLDOWNCHANGESELECTORDATA[SOURCEKEY][cityIndex].districs[townIndex].zip_code;
          then.insertZip(selector.settings.zipElement, zipData);
        }

        // trigger onChange callback
        selector.settings.onChange(this, townValue, townData[townIndex]);
      });

      // store change event
      if (selector.settings.storeType === true && selector.settings.storeElement.length > 0) {
        selector.settings.storeElement.on('change', function() {

          // set store select list
          then.getIndex('store');
          // console.log(cityIndex, townIndex, storeIndex);

          // set zip
          if (selector.settings.zipElement !== null && selector.settings.zipElement.length > 0) {
            zipData = PULLDOWNCHANGESELECTORDATA[SOURCEKEY][cityIndex].districs[townIndex].zip_code;
            then.insertZip(selector.settings.zipElement, zipData);
          }

          // trigger onChange callback
          selector.settings.onChange(this, storeValue, storeData[storeIndex]);
        });
      }
    };

    // 觸發預設值選取
    this._initDefaultValue = function() {
      if (selector.settings.cityElement.data('val') !== 'undefined') {
          selector.settings.cityElement.find('option[value="' + selector.settings.cityElement.data('val') + '"]').prop('selected', true).trigger('change');
      }
      if (selector.settings.townElement.data('val') !== 'undefined') {
        selector.settings.townElement.find('option[value="' + selector.settings.townElement.data('val') + '"]').prop('selected', true).trigger('change');
      }
      
      if (selector.settings.storeElement && selector.settings.storeElement.data('val') !== 'undefined') {
        selector.settings.storeElement.find('option[value="' + selector.settings.storeElement.data('val') + '"]').prop('selected', true).trigger('change');
      }
    };

    // 抓取 select option index and value
    this.getIndex = function(type) {
      // set town select list
      cityIndex = selector.settings.cityElement.find('option:selected').index() || 0;
      cityValue = selector.settings.cityElement.find('option:eq(' + cityIndex + ')').val() || "";
      if ( cityIndex < 0 ) { cityIndex = 0; }

      townIndex = ( type === 'city' ) ? 0 : (selector.settings.townElement.find('option:selected').index() || 0);
      townValue = selector.settings.townElement.find('option:eq(' + townIndex + ')').val() || "";
      if ( townIndex < 0 ) { townIndex = 0; }

      storeIndex = ( type === 'city' || type === 'town' || selector.settings.store === null ) ? 0 : (selector.settings.storeElement.find('option:selected').index() || 0);
      storeValue = selector.settings.store === null ? 0 : ( selector.settings.storeElement.find('option:eq(' + storeIndex + ')').val() || "");
      if ( storeIndex < 0 ) { storeIndex = 0; }
      return {
        "cityValue": cityValue,
        "cityIndex": cityIndex,
        "townValue": townValue,
        "townIndex": townIndex,
        "storeValue": storeValue,
        "storeIndex": storeIndex
      };
    };

    // 寫入 option
    this.insertOption = function(element, data, keyName, keyType) {
      if (typeof keyName === 'undefined') {
        keyName = 'name';
      }
      if (typeof keyType === 'undefined') {
        keyType = 0;
      }
      var el = $(element);
      if (el.length <= 0) {
        return false;
      }

      el.empty();
      $.each(data, function(i, v) {
        return el.append("<option value='" + v[keyName] + "' data-num='" + i + "' >" + v[keyName] + "</option>");
      });
      if (el.find('option').length === 0) {
        return el.append("<option value='' data-num='' data-store='' >尚無資料</option>");
      }
    };

    // 寫入 zip
    this.insertZip = function(element, data) {
      if ($(element).length <= 0) {
        if (selector.settings.debug) {
          console.log(selector.settings.errorString.noElement, 'zip');
        }
        return false;
      }
      return $(element)[($(element).is('input') ? 'val' : 'text')](data);
    };

    this._init();

    if (selector.settings.debug) {
      console.groupEnd();
    }

    return this;
  };
})(jQuery);

// // sample
// $(function() {
  // $('.pulldownChangeSelector-group').pulldownChangeSelector({
  //   debug: true,
  //   city: '.pulldownChange-city',
  //   town: '.pulldownChange-town',
  //   zip: '.pulldownChange-zip',
  //   storeType: false,
  //   island: 'island_data',
  //   onReady: function(e) {
  //     console.log(['package ready !', ((e.prop("tagName") + '.' + e.attr('class').replace(/ /g, ".")))]);
  //     e.css('background-color', 'rgba(10, 10, 10, 0.1)');
  //   },
  //   onChange: function(e, v) {
  //     // console.log(['select change !', e, v]);
  //     console.log($(e).find('option:selected').data('num'), v);
  //   }
  // });

  // $('.pulldownChangeSelectorStore-group').pulldownChangeSelector({
  //   debug: true,
  //   city: '.pulldownChange-city',
  //   town: '.pulldownChange-town',
  //   store: '.pulldownChange-store',
  //   storeType: true,
  //   island: 'island_data',
  //   onReady: function(e) {
  //     console.log(['package ready !', ((e.prop("tagName") + '.' + e.attr('class').replace(/ /g, ".")))]);
  //     e.css('background-color', 'rgba(10, 10, 10, 0.1)');
  //   },
  //   onChange: function(e, v, d) {
  //     console.log([e, v, d]);
  //     if( $(e).hasClass('pulldownChange-town') ) {
  //       console.log( "第一間門市：" + $(this)[0].storeElement.val() );
  //     }
  //     if( $(e).hasClass('pulldownChange-store') ) {
  //       console.log( "選取的門市：" + v );
  //     }
  //   }
  // });
// });