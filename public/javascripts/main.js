(function() {
  'use strict';
  var root;

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  $(function() {
    var articleClass, scareClass, debug, googleMapClass, tool, unacceptable;
    debug = true;
    root.productionHost = "senao.com.tw";
    unacceptable = function(str, reg) { var re; re = new RegExp(reg, "g"); return str.match(re) !== null; };
    root.APIs = {
      "citytown": "/public/apis/API_taiwan_area.json",
      "citytownstore": "/public/apis/APP_SenaoOnlineStore_type2.json",
      "article": "/public/apis/Article/getArticles.json",
      'scare': "/public/apis/Article/getArticles.json",
    };
    root.twCityTownData;
    root.twCityTownDataOfStore;
    root.storeData;

    /*
    prototype
     */

    /* 字串中抓取數字 */
    if (!("getNumber" in String.prototype)) {
      String.prototype.getNumber = function() {
        var m, r, re;
        m = void 0;
        r = '';
        re = /\d+/ig;
        while ((m = re.exec(this.toString())) !== null) {
          r += this.substring(m.index, re.lastIndex);
        }
        return parseInt(r, 10) || 0;
      };
    }
    if (!("getNumber" in Number.prototype)) {
      Number.prototype.getNumber = function() {
        return this;
      };
    }
    if (!("numberWithCommas" in String.prototype)) {
      String.prototype.numberWithCommas = function() {
        return this.replace(/\d{1,3}(?=(\d{3})+$)/g, function(s) {
          return s + ",";
        });
      };
    }

    /*
     *  functions
     */

    /* Slider Lazy Load (建立在套件 bxSlider 下)
     **  1. 在 .bxSlider function 內的 onSlideBefore 裡呼叫此 function
     **     傳入參數 _this 為 onSlideBefore 的回傳參數 slideElement
     **  2. 在要做 lazy load 的 img 上做判斷 只要第一個跟最後一個 page 先顯示
     **     (如果是順時針方向自動輪播且無控制鈕的只要第一張先顯示就好)
     **     其他的 圖片來源 src 改成 data-src, 並給 src 一個同大小的 empty 圖片
     **  3. 添加 class "js-lazy" 給 img
     */
    function sliderLazyLoad(_this){
      var $sliderLazy = _this.find('.js-lazy');
      $sliderLazy.each(function( index ) {
        if( $( this ) && $( this ).attr("data-src") ){
          var $imgDataSrc = $( this ).attr("data-src");
          $( this ).attr("src", $imgDataSrc).removeAttr('data-src').removeClass("js-lazy");
        }
      });
    }


    /*
     * iframe onload resize
     * <iframe src="" onload="resizeIframe(this)" ></iframe>
     */
    root.resizeIframe = function(obj) {
      if (obj) {
        // return obj.style.height = obj.contentWindow.document.body.scrollHeight + 'px';
        obj.style.height = obj.contentWindow.document.body.scrollHeight + 'px';
      }
    };
    root.SetCwinHeight = function(iframeId) {
      var _iframe;
      _iframe = document.getElementById(iframeId);
      if (_iframe) {
        $(_iframe).height($("#" + iframeId)[0].contentWindow.top.document.body.scrollHeight);
      }
    };
    tool = (function() {
      var thistool;

      function tool() {}

      thistool = tool;


      /*
        === Header ===
       */


      /*
       * header購物車
       */

      tool.prototype.get_header_cart = function() {
        var header_cart, header_cart_items;
        header_cart_items = [];
        // header_cart = $.getJSON('/Cart/getCartNums');
        header_cart = $.getJSON('/cart/getCartNums');
        return header_cart.done(function(jd) {
          var itemTotal = parseInt(jd.nums.total, 10) || 0;

          var listBoxElement = $('#cart_nav .nav-list');
          var cartLinkBtnElement = $('#cart_nav .btn-block');

          /** 列表 - 空車 */
          if( itemTotal <= 0 ) {
            listBoxElement.empty().append('<p><br>購物車內沒有商品</p>');
            return true;
          }

          /** 列表 - 有產品 */
          listBoxElement.empty();
          $.each(jd.nums, function(i, v){
            if( typeof v.cart_type_name === 'undefined' ) {
              return;
            }
            var num = parseInt(v.nums, 10) || 0;

            /** 預購或數量 0 的不顯示 */
            if(num <= 0 || v.cart_type === '5') {
              return; // continue
            }
            listBoxElement.append('<a href="/Cart/main?type='+ v.cart_type +'">'+ v.cart_type_name +'<b class="value"><span id="cart_type_1">'+ v.nums +'</span></b></a>');
          });

          if( itemTotal < 0 || itemTotal === NaN ) {
            itemTotal = 0;
          }

          /** 結帳按鈕 */
          cartLinkBtnElement.text( itemTotal === 0 ? '開始購物' : '結帳' )
                            .attr('href', (itemTotal === 0 ? '/' : '/Cart/main'));

          /** 購物車產品總數 */
          $('#cart-items-total').text(itemTotal);

        });
      };


      /*
        === Slider ===
       */


      /*
       * 輪播
       * home.jade 首頁輪撥大版位 (pager 橫置文字)
       */

      tool.prototype.add_slider = function(_this, _num, _prefix) {
        var _then, _then_bxSlider, gallery_slider_btns_control;
        if (_num == null) {
          _num = 0;
        }
        if (_prefix == null) {
          _prefix = '';
        }
        _then = $(_this).find('.slider-view');
        gallery_slider_btns_control = $(_this).find('.bx-pager').attr('id', "gallery-slider-btns-control-" + _num).prop('id');
        _then_bxSlider = $(_then).bxSlider({
          pagerCustom: "#" + gallery_slider_btns_control,
          autoHover: true,
          auto: true,
          pause: 5000,
          speed: 500,
          controls: true,
          prevText: '<i class="icon icon-arrow-left"></i>',
          nextText: '<i class="icon icon-arrow-right"></i>',
          onSliderLoad: function(currentIndex) {
            return $(_this).find('.bx-prev, .bx-next').addClass('slider-arrow');
          },
          onSlideBefore: function(slideElement, oldIndex, Index) {
            sliderLazyLoad(slideElement); // for lazy load
            $( ( oldIndex < Index ? '.js-gallery-slider .bx-next.slider-arrow' : '.js-gallery-slider .bx-prev.slider-arrow' ) ).addClass('hide');
            return _then_bxSlider.stopAuto();
          },
          onSlideAfter: function(slideElement, oldIndex, Index) {
            $( ( oldIndex < Index ? '.js-gallery-slider .bx-next.slider-arrow' : '.js-gallery-slider .bx-prev.slider-arrow' ) ).removeClass('hide');
            return _then_bxSlider.startAuto();
          }
        });
      };


      /*
       * 側欄輪播版位
       * (1page = 4products)
       * /home
       */

      tool.prototype.add_slider_mini = function(_this, _num, _prefix) {
        var _btn_next, _btn_next_id, _btn_prev, _btn_prev_id, _slider, _then, _view_pages, product_slider_mini_count;
        if (_num == null) {
          _num = 0;
        }
        if (_prefix == null) {
          _prefix = '';
        }
        _then = $(_this).find('.widget-content');
        product_slider_mini_count = $(_then).find('ul').length;
        _btn_prev = $(_this).find('.js-btn-slider-left');
        _btn_next = $(_this).find('.js-btn-slider-right');
        _btn_prev_id = $(_btn_prev).attr('id', "btn-" + _prefix + _num + "-slider-prev").prop('id');
        _btn_next_id = $(_btn_next).attr('id', "btn-" + _prefix + _num + "-slider-next").prop('id');
        _view_pages = $(_this).find('span.divider.fn-sm.js-product-slider-mini-pages');
        if (product_slider_mini_count <= 1) {
          _view_pages.hide();
          $(_this).find('.btn-group').hide();
        }
        _slider = $(_then).bxSlider({
          auto: false,
          pause: 5000,
          speed: 500,
          controls: false,
          pager: false,
          onSliderLoad: function(Index) {
            return _view_pages.text((Index + 1) + " / " + product_slider_mini_count);
          },
          onSlideBefore: function(slideElement, oldIndex, Index) {
            sliderLazyLoad(slideElement); // for lazy load
            return _view_pages.text((Index + 1) + " / " + product_slider_mini_count);
          }
        });
        $("#" + _btn_next_id).unbind('click').on('click', function() {
          return _slider.goToNextSlide();
        });
        $("#" + _btn_prev_id).unbind('click').on('click', function() {
          return _slider.goToPrevSlide();
        });
      };

      /*
       * 側欄輪播版位 (無功能按鈕, 自動輪播)
       * (1page = 4products)
       * /home
       */

      tool.prototype.add_no_controll_slider_mini = function(_this, _num, _prefix) {
        var _btn_next, _btn_next_id, _btn_prev, _btn_prev_id, _slider, _then, _view_pages, product_slider_mini_count;
        if (_num == null) {
          _num = 0;
        }
        if (_prefix == null) {
          _prefix = '';
        }
        _then = $(_this).find('.widget-content');
        product_slider_mini_count = $(_then).find('ul').length;
        _view_pages = $(_this).find('span.divider.fn-sm.js-product-slider-mini-pages');
        if (product_slider_mini_count <= 1) {
          _view_pages.hide();
          $(_this).find('.btn-group').hide();
        }
        _slider = $(_then).bxSlider({
          auto: true,
          pause: 5000,
          speed: 500,
          controls: false,
          pager: false,
          onSlideBefore: function(slideElement, oldIndex, Index) { sliderLazyLoad(slideElement); } // for lazy load
        });
      };


      /*
       * 產品分類頁一二層 輪撥版位 (pager 使用預設圓點 ○ ● ○ ○ )
       * /Category/category-main, /Category/category-sub
       */

      tool.prototype.add_slider2 = function(_this, _num, _prefix) {
        var _then, _then_bxSlider;
        if (_num == null) {
          _num = 0;
        }
        if (_prefix == null) {
          _prefix = '';
        }
        _then = $(_this).find('.gallery-slider2-view');
        _then_bxSlider = $(_then).bxSlider({
          pagerType: 'full',
          autoHover: true,
          auto: true,
          pause: 5000,
          speed: 500,
          controls: $(_this).data('controls') === 'hide' ? 0 : 1,
          prevText: '<i class="icon icon-left-open-big" ></i>',
          nextText: '<i class="icon icon-right-open-big" ></i>',
          onSliderLoad: function(currentIndex) {
            return $(_this).find('.bx-prev, .bx-next').addClass('slider-arrow');
          },
          onSlideBefore: function(slideElement, oldIndex, Index) {
            sliderLazyLoad(slideElement); // for lazy load
            return _then_bxSlider.stopAuto();
          },
          onSlideAfter: function(slideElement, oldIndex, Index) {
            return _then_bxSlider.startAuto();
          }
        });
      };

      /*
       * 銀行版位banner 輪撥版位 ( 使用預設圓點 ○ ● ○ ○ )
       * 
       */

      tool.prototype.add_slider3 = function(_this, _num, _prefix) {
        var _then, _then_bxSlider;
        if (_num == null) {
          _num = 0;
        }
        if (_prefix == null) {
          _prefix = '';
        }
        _then = $(_this).find('.gallery-slider3-view');
        _then_bxSlider = $(_then).bxSlider({
          pagerType: 'full',
          autoHover: true,
          auto: false,
          pause: 5000,
          speed: 500,
          controls: $(_this).data('controls') === 'hide' ? 0 : 1,
          prevText: '<i class="icon icon-left-open-big" ></i>',
          nextText: '<i class="icon icon-right-open-big" ></i>',
          onSliderLoad: function(currentIndex) {
            return $(_this).find('.bx-prev, .bx-next').addClass('slider-arrow');
          },
          /*
          onSlideBefore: function(slideElement, oldIndex, Index) {
            sliderLazyLoad(slideElement); // for lazy load
            return _then_bxSlider.stopAuto();
          },
          onSlideAfter: function(slideElement, oldIndex, Index) {
            return _then_bxSlider.startAuto();
          }
          */
        });
      };



      /*
       * 產品總覽第一層 側邊廣告輪播 (本週強打, 熱銷紅星)
       * /Category/category-main
       */

      tool.prototype.add_slider_product_ad_mini = function(_this, _num, _prefix) {
        var _btn_next, _btn_next_id, _btn_prev, _btn_prev_id, _then, _then_bxSlider, _view_pages, product_slider_mini_count;
        if (_num == null) {
          _num = 0;
        }
        if (_prefix == null) {
          _prefix = '';
        }
        _then = $(_this).find('.widget-content');
        product_slider_mini_count = $(_this).find('.list-pager').length;
        _btn_prev = $(_this).find('.js-btn-slider-left');
        _btn_next = $(_this).find('.js-btn-slider-right');
        _btn_prev_id = $(_btn_prev).attr('id', "btn-" + _prefix + _num + "-slider-prev").prop('id');
        _btn_next_id = $(_btn_next).attr('id', "btn-" + _prefix + _num + "-slider-next").prop('id');
        _view_pages = $(_this).find('.js-product-slider-mini-pages');
        _then_bxSlider = $(_then).bxSlider({
          autoHover: true,
          controls: false,
          auto: true,
          pause: 5000,
          speed: 500,
          pager: false,
          onSliderLoad: function(Index) {
            return _view_pages.text((Index + 1) + " / " + product_slider_mini_count);
          },
          onSlideBefore: function(slideElement, oldIndex, Index) {
            sliderLazyLoad(slideElement); // for lazy load
            return _view_pages.text((Index + 1) + " / " + product_slider_mini_count);
          }
        });
        $("#" + _btn_next_id).unbind('click').on('click', function() {
          return _then_bxSlider.goToNextSlide();
        });
        $("#" + _btn_prev_id).unbind('click').on('click', function() {
          return _then_bxSlider.goToPrevSlide();
        });
      };


      /*
       * 產品detail的圖片輪撥組合 (pager btns)
       * /Category/product-detail
       */

      tool.prototype.add_slider_product_pager_box = function(_this, _prefix) {
        var _then;
        if (_prefix == null) {
          _prefix = '';
        }
        _then = $(_this).find('.slider-view');
        return $(_then).bxSlider({
          auto: false,
          pause: 5000,
          controls: true,
          pager: false,
          slideWidth: 90,
          minSlides: 5,
          maxSlides: 5,
          slideMargin: 8,
          infiniteLoop: false,
          prevText: '<i class="icon icon-arrow-left"></i>',
          nextText: '<i class="icon icon-arrow-right"></i>',
          onSliderLoad: function(currentIndex) {
            return $(_this).find('.bx-prev, .bx-next').addClass('slider-arrow mini');
          }
        });
      };


      /*
       * 產品detail的圖片輪撥組合 (view)
       * /Category/product-detail
       */

      tool.prototype.add_slider_product_view_box = function(_this, _prefix) {
        var _then;
        if (_prefix == null) {
          _prefix = '';
        }
        _then = $(_this).find('.gallery-slider-view');
        return $(_then).bxSlider({
          speed: 10,
          controls: false,
          pagerCustom: '#slider-product-pager-btns',
          mode: 'fade'
        });
      };


      /*
       * 產品頁的歷史紀錄
       * /Category/product-detail
       */

      tool.prototype.add_slider_history = function(_this, _num, _prefix) {
        var _then, _then_bxSlider, gallery_slider_btns_control;
        if (_num == null) {
          _num = 0;
        }
        if (_prefix == null) {
          _prefix = 'gallery-slider-history-btns-control';
        }
        _then = $(_this).find('.js-gallery-slider-view');
        gallery_slider_btns_control = $(_this).find('.bx-pager').attr('id', _prefix + "-" + _num).prop('id');
        return _then_bxSlider = $(_then).bxSlider({
          pagerCustom: "#" + gallery_slider_btns_control,
          pager: true,
          pagerType: 'full',
          controls: true,
          auto: false,
          pause: 5000,
          speed: 500,
          prevText: '<i class="icon icon-left-open-big" ></i>',
          nextText: '<i class="icon icon-right-open-big" ></i>',
          onSliderLoad: function(currentIndex) {
            return $(_this).find('.bx-prev, .bx-next').addClass('slider-arrow');
          }
        });
      };


      /*
       * 會員中心 - 活動訊息輪播
       * .js-slider-point
       * /Member
       */

      tool.prototype.add_slider_poing = function(_this, _num, _prefix) {
        var _then, _then_bxSlider, gallery_slider_btns_control;
        if (_num == null) {
          _num = 0;
        }
        if (_prefix == null) {
          _prefix = 'gallery-slider-poing-btns-control';
        }
        _then = $(_this).find('.slider-view');
        gallery_slider_btns_control = $(_this).find('.bx-pager').attr('id', _prefix + "-" + _num).prop('id');
        return _then_bxSlider = $(_then).bxSlider({
          pagerCustom: "#" + gallery_slider_btns_control,
          controls: false,
          pager: true,
          pagerType: 'full',
          auto: true,
          pause: 5000,
          speed: 500
        });
      };


      /*
       * 會員中心 - 跑馬燈輪播
       * .js-slider-marquee
       * /Member
       */

      tool.prototype.add_slider_marquee = function(_this, _num, _prefix) {
        var _then, _then_bxSlider;
        if (_num == null) {
          _num = 0;
        }
        if (_prefix == null) {
          _prefix = '';
        }
        _then = $(_this).find('.slider-view');
        return _then_bxSlider = $(_then).bxSlider({
          controls: true,
          pager: false,
          auto: true,
          pause: 5000,
          speed: 500,
          mode: 'vertical',
          prevText: '<i class="icon icon-arrow-left" ></i>',
          nextText: '<i class="icon icon-arrow-right" ></i>',
          onSliderLoad: function(currentIndex) {
            $(_this).css('opacity', 1);
            return $(_this).find('.bx-prev, .bx-next').addClass('marquee-arrow');
          }
        });
      };


      /*
        === Tab ===
       */


      /*
       * 產品欄整頁輪撥版位 (1tab = 1banner+3products)
       */

      tool.prototype.add_tab_slider = function(_this, _num, _prefix) {
        var _tab, _then, gallery_slider_btns_control;
        if (_num == null) {
          _num = 0;
        }
        if (_prefix == null) {
          _prefix = 'js-tab-one-and-three';
        }
        _then = $(_this);
        _tab = _then.find('.tab-pane');
        gallery_slider_btns_control = $(_this).find('.nav-tabs > .nav-tabs-list ').attr('id', _prefix + "-" + _num).prop('id');
        $("#" + gallery_slider_btns_control + " li:eq(0)").addClass('active');
        $(_tab).eq(0).addClass('active');
        $("#" + gallery_slider_btns_control + " li").unbind('click').on('click', function() {
          if (false === $(this).hasClass('active')) {
            $("#" + gallery_slider_btns_control + " li").removeClass('active');
            $(this).addClass('active');
            $(_tab).removeClass('active');
            return $(_tab).eq($(this).find('a').data('slide-index')).addClass('active');
          }
        });
      };


      /*
       * 產品頁的tab
       */

      tool.prototype.add_tab_of_product = function(_this, _num) {
        var _then;
        if (_num == null) {
          _num = 0;
        }
        _then = $(_this).find('li.nav-tabs-item');
        $(_then).find('li.nav-tabs-item:eq(0)').addClass('active');
        $(_then).find('.tab-content .tab-pane:eq(0)').addClass('active');
        return $(_then).on('click', function() {
          $(_then).removeClass('active');
          $(this).addClass('active');
          if ($('body').hasClass('home')) {
            $(_then).find('.tab-content .tab-pane').removeClass('active');
            return $(_then).find(".tab-content .tab-pane:eq(" + ($(this).index()) + ")").addClass('active');
          } else {
            $('.tab-content .tab-pane').removeClass('active');
            return $(".tab-content .tab-pane:eq(" + ($(this).index()) + ")").addClass('active');
          }
        });
      };


      /*
       * tab 切換
       */

      // tool.prototype.add_tab_event = function(_tab, _view) {
      //   $(_tab).eq(0).addClass('active');
      //   $(_view).eq(0).addClass('active');
      //   return $(_tab).on('click', function() {
      //     var _index;
      //     _index = $(this).data('num') ? $(this).data('num') : $(_tab).index($(this));
      //     $(_tab).removeClass('active');
      //     $(this).addClass('active');
      //     $(_view).removeClass('active');
      //     return $(_view).eq(_index).addClass('active');
      //   });
      // };

      /*
       * tab 切換 (有預設值)
       * 若控制端為 input 時，自動抓取 tab 設定的 index 並 addClass active
       */

      tool.prototype.add_tab_event = function(_tab, _view) {
        var _def = 0;
        _def = $(_tab).closest('.active').val() ? (parseInt($(_tab).closest('.active').val(), 10) - 1) : 0;
        $(_tab).removeClass('active');
        $(_tab).eq(_def).addClass('active').prop('checked', true);
        $(_view).removeClass('active');
        $(_view).eq(_def).addClass('active');
        $(_tab).on('click', function() {
          var _index;
          _index = $(this).data('num') ? $(this).data('num') : $(_tab).index($(this));
          $(_tab).removeClass('active');
          $(this).addClass('active');
          $(_view).removeClass('active');
          return $(_view).eq(_index).addClass('active');
        });
      };

      // tool.prototype.addTabGroup = function(groupElem, tabClassName, viewClassName) {
      //   var tabElem = groupElem.find(tabClassName);
      //   var viewElem = groupElem.find(viewClassName);
      //   var _def = 0;
      //   _def = $(tabElem).closest('.active').val() ?  (parseInt($(tabElem).closest('.active').val(), 10) - 1) : 0;
      //   console.log(_def);
      // };
    tool.prototype.addTabGroup = function(groupElem, tabClassName, viewClassName) {
      var tabElem = $(groupElem).find(tabClassName);
      var viewElem = $(groupElem).find(viewClassName);
      var activeNum = $(tabElem).closest('.active').val() ?  (parseInt($(tabElem).closest('.active').val(), 10)) : 0;
      $(tabElem).removeClass('active');
      $(tabElem).eq(activeNum).addClass('active').prop('checked', true);
      $(viewElem).removeClass('active');
      $(viewElem).eq(activeNum).addClass('active');

      $(tabElem).on('click', function(){
        var _index;
        _index = $(this).data('num') ? $(this).data('num') : $(tabElem).index($(this));
        $(tabElem).removeClass('active');
        $(this).addClass('active');
        $(viewElem).removeClass('active');
        $(viewElem).eq(_index).addClass('active');
      });
      };


      /*
        === Input ===
       */


      /*
       * 加減按鈕 Group
       */

      tool.prototype.add_number_group_control = function(_this, _num) {
        var _btns, _input, _then, _thtn_id;
        if (_num == null) {
          _num = 0;
        }
        _then = _this;
        _thtn_id = $(_then).attr('id', "number-group-control-" + _num).prop('id');
        _input = $(_then).find('input.number-view');
        _btns = $(_then).find('button');
        _btns.unbind('click').on('click', function() {
          var _max, _min, _v;
          _v = parseInt(_input.val(), 10);
          _max = _input.prop('max');
          _min = _input.prop('min');
          if (true === $(this).hasClass('number-less')) {
            if (_v <= _min) {
              return _input.val(_min);
            } else {
              return _input.val(_v - 1);
            }
          } else {
            if (_v >= _max) {
              return _input.val(_max);
            } else {
              return _input.val(_v + 1);
            }
          }
        });
        return $("#" + _thtn_id + " input").bind("input", function() {
          var _val;
          _val = this.value.getNumber();
          if (_val > parseInt($(this).attr('max'), 10)) {
            $(this).val(parseInt((_val + '').substr(1, 1), 10) || 1);
          }
          if ('' === $(this).val()) {
            return $(this).val($(this).attr('min'));
          }
        });
      };


      /*
       * checkbox 全選/取消全選
       */

      tool.prototype.add_checkbox_all_toggle = function(_this) {
        return $(_this).on('change', function() {
          if($(this).prop('disabled') === true) {
            return;
          }
          return $($(this).data('toggle')).prop('checked', $(this).prop('checked'));
        });
      };


      /*
       * textarea maxlength message 最大長度訊息
       */

      tool.prototype.add_textarea_message = function(_this) {
        return $(_this).bind('input', function() {
          var _length;
          _length = $(_this)[0].value.length;
          if (_length > 200) {
            _length = 200;
          }
          if (_length < 0) {
            _length = 0;
          }
          return $($(this).data('toggle')).text(_length);
        });
      };


      /*
       * content 文字大小
       */

      tool.prototype.add_content_contsize = function(_this) {
        var _then;
        _then = _this;
        $(_then).find('.btn').on('click', function(e) {
          $($(_then).data('view')).removeClass('large medium small').addClass($(this).data('size'));
          $(_then).find('.btn').removeClass('btn-query').addClass('btn-default');
          $(this).removeClass('btn-default').addClass('btn-query');
          return $.cookie('article-font', $(this).data('size'), {
            path: '/'
          });
        });
        if (typeof $.cookie('article-font') !== 'undefined') {
          return $(_then).find(".btn[data-size='" + ($.cookie('article-font')) + "']").trigger('click');
        }
      };

      /*
       * show password value
       */

      tool.prototype.showPassword = function(_this, _num) {
        var _base, _btn, _inp;
        if (_num == null) {
          _num = 0;
        }
        _base = $(_this).parents().eq(0);
        _inp = _base.find('input[type="password"]').addClass('showPassword-view');
        _btn = $(_base).find('a.hide-password');
        return _btn.unbind('click').on('click', function() {
          var passwordField, passwordIcon, togglePass;
          // console.log('clock show/hide password');
          togglePass = _btn;
          passwordIcon = togglePass.children('.icon');
          passwordField = _inp;
          if ('password' === passwordField.attr('type')) {
            passwordField.attr('type', 'text');
          } else {
            passwordField.attr('type', 'password');
          }
          if ('icon' === passwordIcon.toggleClass('icon-eye-hide')) {
            passwordIcon.toggleClass('icon-eye-hide');
          } else {
            passwordIcon.toggleClass('icon-eye-show');
          }
        });
      };

      /*
       * ajax get page view
       */

      tool.prototype.getPageView = function(_this, _num) {
        var _then = $(_this);
        var _url = _then.data('url');
        var isHttps = location.href.indexOf('https') !== -1;
        _url = _url.replace('labpdinfo', 'pdinfo');
        if(!isHttps) {
          _url = _url.replace('https://', 'http://');
        } else {
          _url = _url.replace('http://', 'https://');
        }
        var _ajax = $.ajax({ type: 'get', url: _url, cache: true, datatype: 'json' });
        _ajax.done(function(data) {
            if( parseInt(data.query.count, 10) <= 0 ) {
                _then.append( '<iframe src="'+_url+'" frameborder="0" scrolling="auto" style="min-height:4000px;" ></iframe>' );
            } else {
                try {
                    var _data = data.results[0];
                    _data = _data.replace('<html>', '').replace('</html>', '');
                    _data = _data.replace('<body>', '').replace('</body>', '');
                    _data = _data.replace(/&#xd;/g, "").replace(/\r\n|\n/g,"");
                    _data = _data.replace(/(<iframe)([a-zA-Z0-9 \/"=:.]+)(\/>)/g, '$1$2></iframe>');
                    _then.html( _data );
                } catch (e) {
                    _then.append( '<iframe src="'+_url+'" frameborder="0" scrolling="auto" style="min-height:4000px;" ></iframe>' );
                }
            }
        });
        _ajax.fail(function(data) {
          _then.append( '<iframe src="'+_url+'" frameborder="0" scrolling="auto" style="min-height:4000px;" ></iframe>' );
        });
      };


      /*
       --- other ---
       */

      return tool;

    })();
    googleMapClass = (function() {
      var _then, key;

      _then = googleMapClass;

      googleMapClass.loction;

      googleMapClass.storeLocation;

      root.map;

      googleMapClass.marker;


      /* development key */

      key = 'AIzaSyDYeg3Ln5OgLA7bM53EIWp_glnjrB-rk78';

      function googleMapClass() {
        $.when($.getScript("/public/javascripts/vendor/gmaps.min.js"), $.getScript("//maps.googleapis.com/maps/api/js?v=3.21&key=" + key), $.Deferred(function(deferred) {
          return $(deferred.resolve);
        })).done(function(jd) {
          return _then.initialize();
        });
      }

      googleMapClass.initialize = function() {

        /* callback function */
        root.map = new GMaps({
          el: "#map_canvas",
          lat: $('#gmapdata').data('lat'),
          lng: $('#gmapdata').data('lng')
        });
        return root.map.setCenter($('#gmapdata').data('lat'), $('#gmapdata').data('lng'));
      };


      /* 設定座標 */

      googleMapClass.prototype.setLocation = function(lat, lng, elementId, data) {
        var _hours, _hours_holiday, contentString;
        if (elementId == null) {
          elementId = 'map_canvas';
        }

        /* set date */
        _hours = "週一至週五 " + data['hours'];
        _hours = _hours.replace('一~五|', '');
        if (data['hours_holiday'].length > 0) {
          _hours_holiday = data['hours_holiday'].replace('六日', '');
          _hours += "，週六/日 " + _hours_holiday;
        }

        /* set infowindow content */
        contentString = "<div class=\"map-info\">" + ("<h3 class=\"caption\">" + data['storeName'] + " - " + data['typeShortName'] + "中心</h3>") + "<ul class=\"content\">" + ("<li>門市地址：" + data['county'] + data['district'] + data['address'] + "</li>") + ("<li>門市電話：" + data['storeTEL'] + "</li>") + ("<li>營業資訊：" + _hours + "</li>") + "<li>服務項目：維修代收 / 現場維修</li>" + ("<li>停車資訊：<a class=\"underline\" href=\"https://www.google.com.tw/maps/search/" + data['county'] + data['district'] + data['address'] + "+停車\" target=\"_blank\">查看資訊</a></li>") + "<li><i class=\"icon icon-print\"></i>&nbsp;<a class=\"underline\" href=\"javascript:$('#mapModal .modal-body').print();\">列印服務據點</a></li>" + "</ul><div class=\"btn-group\">" + ("<a class=\"btn btn-query btn-sm\" target=\"_blank\" href=\"http://maps.google.com.tw/maps?f=q&hl=zh-TW&geocode=&z=14&q=台彎省" + data['county'] + data['district'] + data['address'] + "+停車\">如何前往</a></div></div>");
        root.map.addMarker({
          lat: lat,
          lng: lng,
          zoom: 13,
          center: this.loction,
          controls: {
            panControl: true,
            mapTypeControl: false,
            scaleControl: false,
            streetViewControl: false,
            rotateControl: false
          },
          title: data['storeName'] + " - " + data['typeShortName'] + "中心",
          infoWindow: {
            content: contentString
          },
          click: function(e) {
            return ga('send', 'event', 'google-map-marker', 'click', data['storeName'] + " - " + data['typeShortName'] + "中心");
          }
        });
        google.maps.event.trigger(document.getElementById('map_canvas'), "resize");
        root.map.setCenter($('#gmapdata').data('lat'), $('#gmapdata').data('lng'));
      };

      googleMapClass.prototype.deleteOverlays = function() {
        root.map.removeMarkers();
      };


      /* events */

      $('#mapModal').on('shown.bs.modal', function(event) {
        return googleMap.setLocation($('#gmapdata').data('lat'), $('#gmapdata').data('lng'), 'map_canvas', storeData);
      });

      return googleMapClass;

    })();

    /** 神腦買情報 */
    articleClass = (function() {
      var _then;

      _then = articleClass;

      articleClass.page = 1;

      articleClass.show = 20;

      articleClass.count = 0;

      articleClass.totalPages = 0;

      articleClass.countNews = 0;

      articleClass.newsData;

      articleClass.tags = {
        'mobile': '手機話題',
        'topic': '發燒3C',
        'news': '獨家優惠',
        'app': '精彩生活',
        'knowledge': '神知識',
        'latest': '最新消息'
      };

      function articleClass() {
        $('.js-article-body .card-group').each(function(i, v) {
          return $(v).parents().eq(0).find('.js-article-btn')[$(v).find('section').length > 0 ? 'removeClass' : 'addClass']('hide');
        });
      }

      articleClass.prototype.getPage = function(_this) {
        var _ajax, _url;
        if (_this == null) {
          return;
        }
        var _type = $(_this).data('category') || '';
        var _page = $(_this).data('page') || 1;
        $.getJSON;
        _url = (APIs['article'] + "?show=" + _then.show + "&page=" + (_page + 1)) + (_type !== '' ? "&category=" + _type : '');
        _ajax = $.getJSON(_url);
        _ajax.done(function(jd) {
          if (_page >= jd['success']['totalPages']) {
            $(_this).addClass('hide');
            return false;
          }
          _then.newsData = jd['success']['list'];
          _then.tags = jd['success']['categorieNames'];
          if (_page + 1 >= jd['success']['totalPages']) {
              $(_this).addClass('hide');
          }
          return _then.setNewsView(_type, _page);
        });
      };

      articleClass.setNewsView = function(_type, _page) {
        if (_type == null) {
          _type = '';
        }
        if (_page == null) {
          _page = 1;
        }
        $.each(this.newsData, function(i, v) {
          var mySection, myTags, myTime;
          v['content'] = v['summary'] || v['title'];
          myTime = moment.unix(v['_published'].toString().substr(0, 10)).format("YYYY/MM/DD HH:ss");
          myTags = "";
          $.each(v['categories'], function(index, value) {
            return myTags += "<a href=\"/Article/List/" + value + "\" class=\"tag-text-primary\"><i class=\"icon icon-tag\"></i>" + _then.tags[value] + "</a>";
          });
          mySection = "<section class=\"card quarter \" data-tag=\"" + v['summary'] + "\">\n<div class=\"card-img\"><a href=\"/Article/Detail/" + v['_seqId'] + "\"><img alt=\"文章圖\" src=\"" + v['iconImg'] + "\"></a></div>\n<div class=\"card-content\">\n<h4 class=\"title\"><a href=\"/Article/Detail/" + v['_seqId'] + "\">" + v['title'] + "</a></h4>\n<p class=\"desc\">" + v['content'] + "</p>\n<div class=\"info\">\n<time datetime=\"" + myTime + "\" class=\"date has-inline\"><i class=\"icon icon-clock\"></i>" + myTime + "</time>\n<div class=\"tags-group\">" + myTags + "</div>\n</div>\n</div>\n</section>";
          return $(".js-article-body[data-category='" + _type + "'] .card-group").append(mySection);
        });
        $(".js-article-body[data-category='" + _type + "'] .js-article-btn").data('page', _page + 1);
      };

      return articleClass;

    })();

    /** S-Care */
    scareClass = (function() {
      var _then;

      _then = scareClass;

      scareClass.page = 1;

      scareClass.show = 20;

      scareClass.count = 0;

      scareClass.totalPages = 0;

      scareClass.countNews = 0;

      scareClass.newsData;

      scareClass.tags = {
        'mobile': '手機話題',
        'topic': '發燒3C',
        'news': '獨家優惠',
        'app': '精彩生活',
        'knowledge': '神知識',
        'latest': '最新消息'
      };

      function scareClass() {
        $('.js-scare-body .card-group').each(function(i, v) {
          return $(v).parents().eq(0).find('.js-scare-btn')[$(v).find('section').length > 0 ? 'removeClass' : 'addClass']('hide');
        });
      }

      scareClass.prototype.getPage = function(_this) {
        var _ajax, _url;
        if (_this == null) {
          return;
        }
        var _type = $(_this).data('category') || '';
        var _page = $(_this).data('page') || 1;
        $.getJSON;
        _url = (APIs['scare'] + "?show=" + _then.show + "&page=" + (_page + 1)) + (_type !== '' ? "&category=" + _type : '');
        _ajax = $.getJSON(_url);
        _ajax.done(function(jd) {
          if (_page >= jd['success']['totalPages']) {
            $(_this).addClass('hide');
            return false;
          }
          _then.newsData = jd['success']['list'];
          _then.tags = jd['success']['categorieNames'];
          if (_page + 1 >= jd['success']['totalPages']) {
              $(_this).addClass('hide');
          }
          return _then.setNewsView(_type, _page);
        });
      };

      scareClass.setNewsView = function(_type, _page) {
        if (_type == null) {
          _type = '';
        }
        if (_page == null) {
          _page = 1;
        }
        $.each(this.newsData, function(i, v) {
          var mySection, myTags, myTime;
          v['content'] = v['summary'] || v['title'];
          myTime = moment.unix(v['_published'].toString().substr(0, 10)).format("YYYY/MM/DD HH:ss");
          myTags = "";
          $.each(v['categories'], function(index, value) {
            return myTags += "<a href=\"/S-Care/List/" + value + "\" class=\"tag-text-primary\"><i class=\"icon icon-tag\"></i>" + _then.tags[value] + "</a>";
          });
          mySection = "<section class=\"card quarter \" data-tag=\"" + v['summary'] + "\">\n<div class=\"card-img\"><a href=\"/S-Care/Detail/" + v['_seqId'] + "\"><img alt=\"文章圖\" src=\"" + v['iconImg'] + "\"></a></div>\n<div class=\"card-content\">\n<h4 class=\"title\"><a href=\"/S-Care/Detail/" + v['_seqId'] + "\">" + v['title'] + "</a></h4>\n<p class=\"desc\">" + v['content'] + "</p>\n<div class=\"info\">\n<time datetime=\"" + myTime + "\" class=\"date has-inline\"><i class=\"icon icon-clock\"></i>" + myTime + "</time>\n<div class=\"tags-group\">" + myTags + "</div>\n</div>\n</div>\n</section>";
          return $(".js-scare-body[data-category='" + _type + "'] .card-group").append(mySection);
        });
        $(".js-scare-body[data-category='" + _type + "'] .js-scare-btn").data('page', _page + 1);
      };

      return scareClass;

    })();

    /*
     --- views ---
     */
    root.app = new tool;

    /*
      Header
     */

    /* 串header購物車 (部分功能暫時停用 - 剩下品項total顯示) */
    if ($('header .hc-right #cart-items-total').length > 0) {
      app.get_header_cart();
    }

    /* header menu 開關 */
    if ($('.js-header-menu').length > 0) {
      $('.js-header-menu .popover-nav a').unbind('click').on('click', function() {
        $('.js-header-menu')[$('.js-header-menu').hasClass('active') ? 'removeClass' : 'addClass']('active');
        $('body:not(.js-header-menu)').one('click', function() {
          if ($('.js-header-menu').hasClass('active')) {
            return $('.js-header-menu').removeClass('active');
          }
        });
        return false;
      });
    }

    /* header ad banner if cookie close */
    if (typeof $.cookie('ad-top-banner') !== 'undefined') {
      $('header .top-bannerbox').remove();
    }

    /* header ad banner remove or open/close */
    $('header .js-ad-popup').on('click', function() {
      var nextDay;
      if ($(this).data('close') === '&times;' || $(this).data('close') === '×') {
        $('header .top-bannerbox').remove();
        nextDay = moment().add(1, 'days').format('YYYY-MM-DD hh:mm:ss');
        return $.cookie('ad-top-banner', nextDay, {expires: 1, path: '/'});
      } else {
        $(this).text($('header .adbox.popup').hasClass('is-open') ? $(this).data('close') : $(this).data('open'));
        return $('header .adbox.popup')[$('header .adbox.popup').hasClass('is-open') ? 'removeClass' : 'addClass']('is-open');
      }
    });

    /*
      Slider
     */

    /**
     * 改至 slider-bxslider.js 或 slider-swiper.js
     * 首頁 slider /home
     */
    if ($('.js-gallery-slider').length > 0) {
      // app.add_slider($('.js-gallery-slider'), 0);
    }

    /* 熱門商品 title 有左右鍵的 /home (非神腦買情報及S-Care) */
    if ($('.js-slider-IE').length > 0) {
      $('.js-slider-IE').each(function(i, v) {
        return app.add_slider_mini(v, i, 'control_');
      });
    }

    /* 神腦買情報 title 完全無按鍵功能只能自動輪播的 slider /home */
    if ($('.js-slider-article').length > 0) {
      $('.js-slider-article').each(function(i, v) {
        return app.add_no_controll_slider_mini(v, i, 'no_control_');
      });
    }

    /* S-Care title 完全無按鍵功能只能自動輪播的 slider /home */
    if ($('.js-slider-scare').length > 0) {
      $('.js-slider-scare').each(function(i, v) {
        return app.add_no_controll_slider_mini(v, i, 'no_control_');
      });
    }

    /* 產品分類頁一二層 輪播 /Category/category-sub, /Category/category-main */
    if ($('.gallery-slider.gallery-slider-size2').length > 0) {
      app.add_slider2($('.gallery-slider.gallery-slider-size2'), 0);
    }
      
    /* 產品分類頁一二層 輪播 /Category/category-sub, /Category/category-main */
    if ($('.gallery-slider.gallery-slider-size3').length > 0) {
      app.add_slider3($('.gallery-slider.gallery-slider-size3'), 0);
    }

    /* 產品分類第一層 (本週強打 熱蕭紅星) /Category/category-main.jade */
    if ($('.js-slider-tab-pager-box').length > 0) {
      $('.js-slider-tab-pager-box').each(function(i, v) {
        return app.add_slider_product_ad_mini(v, i);
      });
    }

    /* 產品detail的圖片輪撥組合 /Category/product-detail (pager) */
    if ($('.slider.view-thumbnail').length > 0) {
      app.add_slider_product_pager_box($('.slider.view-thumbnail'));
    }

    /* 產品detail的圖片輪撥組合 /Category/product-detail (view) */
    if ($('.js-slider-product-view-box').length > 0) {
      app.add_slider_product_view_box($('.js-slider-product-view-box'));
    }

    /* 產品頁的歷史紀錄 /Category/product-detail */
    if ($('.js-history-slider').length > 0) {
      $('.js-history-slider').each(function(i, v) {
        return app.add_slider_history(v, i);
      });
    }

    /* 會員中心 - 活動訊息輪播 */
    if ($('.js-slider-point').length > 0) {
      $('.js-slider-point').each(function(i, v) {
        return app.add_slider_poing(v, i);
      });
    }

    /* 會員中心 - 跑馬燈輪播 */
    if ($('.js-slider-marquee').length > 0) {
      $('.js-slider-marquee').each(function(i, v) {
        return app.add_slider_marquee(v, i);
      });
    }

    /*
      Tab
     */

    /*
     * 3+1 tab 的產品框
     * /home, /Category/category-main
     */
    if ($('.js-tab-one-and-three, .js-tab-four-product').length > 0) {
      $('.js-tab-one-and-three, .js-tab-four-product').each(function(i, v) {
        return app.add_tab_slider(v, i, 'js-tab');
      });
    }

    /*
     * 產品頁的 (商品介紹 規格 配送與退貨說明) tab
     * /Category/product-detail
     */
    if ($('.js-nav-tabs-list').length > 0) {
      $('.js-nav-tabs-list').each(function(i, v) {
        return app.add_tab_of_product(v, i);
      });
    }

    /*
      Input
     */

    /*
     * 數量調整加減框
     * /Category/product-detail, /Cart/cart-list
     */
    if ($('.number-group').length > 0) {
      $('.number-group').each(function(i, v) {
        return app.add_number_group_control(v, i);
      });
    }

    /* checkbox 全選/取消全選 */
    if ($('.js-prd-all').length > 0) {
      $('.js-prd-all').each(function(i, v) {
        return app.add_checkbox_all_toggle(v);
      });
    }

    /* textarea maxlength message 最大長度訊息 */
    if ($('.js-textarea').length > 0) {
      $('.js-textarea').each(function(i, v) {
        return app.add_textarea_message(v);
      });
    }

    /* city town zip 連動 */
    if ($('.pulldownChange-group').length > 0) {
      $('.pulldownChange-group').pulldownChangeSelector({
        // debug: true,
        city: '.pulldownChange-city',
        town: '.pulldownChange-town',
        zip: '.pulldownChange-zip',
        island: 'data',
        defaultSelect: '請選擇'
      });
    }

    /* city town zip 連動 (不含離島地區) */
    if($('.pulldownChangeIfOverseas-group').length > 0) {
      $('.pulldownChangeIfOverseas-group').pulldownChangeSelector({
        // debug: true,
        city: '.pulldownChange-city',
        town: '.pulldownChange-town',
        zip: '.pulldownChange-zip',
        island: 'taiwan_data',
        defaultSelect: '請選擇',
        onReady: function(e, d) {
          if( typeof d[0] !== 'undefined' && typeof d[0].id !== 'undefined' ) {
            $('#receiptCityId').val( d[0].id );
            $('#receiptTownId').val( d[0].districs[0].ship_id );
          }
        },
        onChange: function(e, v, d) {
          if( $(e).attr('id') === 'citySelector_2' ) { // change city
            if( typeof d.id !== 'undefined' ) {
              $('#receiptCityId').val( d.id );
              $('#receiptTownId').val( d.districs[0].ship_id );
            }
          }
          if( $(e).attr('id') === 'townSelector_2' ) { // change town
            if( typeof d.ship_id !== 'undefined' ) {
              $('#receiptTownId').val( d.ship_id );
            }
          }
        }
      });
    }

    /* 字體大小 */
    if ($('.js-fontsize').length > 0) {
      $('.js-fontsize').each(function(i, v) {
        app.add_content_contsize(v);
      });
    }

    /*
      Other
     */

    /* 產品頁加購下面的加入購物車 (顯示) */
    if ($('.bar.gray.align.center.hide').length > 0) {
      $('.checkbox-label').on('click', function() {
        $('.bar.gray.align.center.hide').removeClass('hide');
      });
    }

    /* 首頁浮動廣告關閉紐 */
    $('.ad.ad-rail.fixed .btn-close').on('click', function() {
      var nextday;
      $('.ad.ad-rail.fixed').remove();
      nextday = moment().add(1, "days").format('YYYY-MM-DD hh:mm:ss');
      $.cookie('ad-rail-fixed', nextday, { expires: 1, path: '/' });
    });

    /*
     * 首頁浮動ad
     * ad-rail-fixed.jade
     */
    if (typeof $.cookie('ad-rail-fixed') !== 'undefined') {
      $('.ad.ad-rail.fixed').remove();
    }

    /*
     * 產品分類樹狀圖
     * /Category/category-main, /Category/category-sub, /Category/category-sub-child, /Category/product-detail
     */
    if ($('.category-tree-list').length > 0) {
      $('.category-tree-list .panel-title .arrow').on('click', function() {
        var _items;
        _items = $("#accordion .panel[data-toggle=" + ($(this).parents().eq(0).data('toggle')) + "]").eq(0);
        $(_items)[$(_items).hasClass('is-open') ? 'removeClass' : 'addClass']('is-open');
      });
      $('.category-tree-list .more').on('click', function() {
        var _items;
        _items = $(this).parents().eq(0);
        $(_items)[$(_items).hasClass('is-more') ? 'removeClass' : 'addClass']('is-more');
        $(this).text($(_items).hasClass('is-more') ? '更多' : '收合');
      });
    }

    /*
     * 首頁蓋台banner
     * remove cookie: $.removeCookie('index-big-banner-modal', {path: '/'})
     *
     */
    if ($('#index-big-banner-modal').length > 0 && typeof $.cookie('index-big-banner-modal') === 'undefined') {
      $('#index-big-banner-modal').modal('show');
      $('#index-big-banner-modal').on('hidden.bs.modal', function(e) {
        var nextday;
        nextday = moment().add(1, "days").format('YYYY-MM-DD hh:mm:ss');
        return $.cookie('index-big-banner-modal', nextday, {
          expires: 1,
          path: '/'
        });
      });
    } else {
      $('#index-big-banner-modal').remove();
    }

    /*
     * product detail
     */

    /*
     * product gift image modal
     * 產品頁贈品 click 後展開圖片
     */
    if( $('.js-modal-gift-image-btn').length > 0 ) {
      // 建立展開圖片 modal
      $('body').append('<div id="js-modal-gift-image-view" class="modal js-modal-gift-image-view"><div class="modal-dialog"><div class="modal-content"><div class="modal-body"><a href="javascript:;" data-dismiss="modal" aria-label="Close" class="btn btn-close"><span class="text">關閉視窗</span><i class="icon icon-close"></i></a><img src="/public/images/img-empty@1x.png" class="js-image"></div></div></div></div>');
      // click 事件
      $('.js-modal-gift-image-btn').on('click', function(){
        var _img = $(this).data('image');
        if( _img != '' ) {
          $('#js-modal-gift-image-view img.js-image').attr('src', _img);
          $('#js-modal-gift-image-view').modal('show');
        }
      });
    }

    /*
     * product gift image modal
     * 產品頁贈品 click 後展開圖片
     */
    if( $('.js-product-mini-modal-btn').length > 0 ) {
      // 建立展開iframe modal
      var _iframeModal = '';
      _iframeModal += '<div id="productModal-mini-modal" data-pid="mini" class="modal product-modal">';
      _iframeModal += '  <div class="modal-dialog">';
      _iframeModal += '    <div class="modal-content">';
      _iframeModal += '      <div class="modal-header">';
      _iframeModal += '        <h4 class="title">【 商品加購 】</h4><a href="" data-dismiss="modal" aria-label="Close" class="btn btn-close"><span class="text">關閉視窗</span><i class="icon icon-close"></i></a>';
      _iframeModal += '      </div>';
      _iframeModal += '      <div class="modal-body js-tab-in-modal" style="padding: 0; overflow: hidden;">';
      _iframeModal += '        <iframe src="/public/images/img-empty@1x.png" class="js-iframe" style="height: 100%;"></iframe>';
      _iframeModal += '      </div>';
      _iframeModal += '    </div>';
      _iframeModal += '  </div>';
      _iframeModal += '</div>';
      $('body').append(_iframeModal);

      // click 事件
      $('.js-product-mini-modal-btn').on('click', function(){
        var _pid = $(this).data('pid');
        var _url = '/productModal/' + _pid;
        if( _pid != '' ) {
          if( $('#productModal-mini-modal iframe.js-iframe').attr('src') !== _url ) {
            $('#productModal-mini-modal iframe.js-iframe').attr('src', _url );
          }
          $('#productModal-mini-modal').modal('show');
        }
      });
      // 跨網域關閉 modal 用
      window.closeModal = function(){
        $('#productModal-mini-modal').modal('hide');
      };
    }

    /*
      未完成、重切
     */
    if ($('.js-tab-btn').length > 0) {
      app.add_tab_event('.js-tab-btn', '.js-tab-view.hide');
    }
    if ($('.js-tab-btn2').length > 0) {
      app.add_tab_event('.js-tab-btn2', '.js-tab-view2.hide');
    }
    if ($('.js-tabs-group').length > 0) {
      $('.js-tabs-group').each(function(i,v){
        app.addTabGroup(v, '.js-tabs-btn', '.js-tabs-view');
      });
    }
    if ($('.js-tabs-group-invoice').length > 0) {
      $('.js-tabs-group-invoice').each(function(i,v){
        app.addTabGroup(v, '.js-tab-btn3', '.js-tab-view3');
      });
    }
    if ($('.login-switch').length > 0) {
      $('.login-switch').on('click', function() {
        var _change;
        _change = $(this).hasClass('change') ? 'removeClass' : 'addClass';
        $(this)[_change]('change');
        return $('.switch-content')[_change]('change');
      });
    }
    $('.hide-password').each(function(i, v) {
      if ($('.hide-password').length > 0) {
        return app.showPassword(v, i);
      }
    });
    $('.js-printView').on('click', function() {
      if ($('.js-printView').length > 0) {
        if ($(this).data('print') && $($(this).data('print')).length > 0) {
          return $($(this).data('print')).print();
        }
      }
    });
    if ($('.pulldownChangeStore-group').length > 0) {
      root.googleMap = new googleMapClass;
      return;
    }

    /* iframe height */
    if ($('.tab-content iframe').length > 0) {
      $('.tab-content iframe').each(function(i, v) {
        return $(v).on('load', function() {
          return resizeIframe(this);
        });
      });
    }

    /*
    vendor options
     */
    if ($('.js-article').length > 0) {
      root.mUp = new articleClass;
      $('.js-article-btn').on('click', function() {
        $(this).prop('disabled', true);
        mUp.getPage(this);
        return $(this).prop('disabled', false);
      });
    }

    /** S-Care */
    if ($('.js-scare').length > 0) {
      root.mUpScare = new scareClass;
      $('.js-scare-btn').on('click', function() {
        $(this).prop('disabled', true);
        mUpScare.getPage(this);
        return $(this).prop('disabled', false);
      });
    }

    /* checkbox group only one */
    if ($('.js-checkbox-group').length > 0) {
      return $('.js-checkbox-group').each(function(i, v) {
        return $(v).find('input[type="checkbox"]').unbind('click').on('click', function() {
          return $(v).find('input[type="checkbox"]').not(this).prop('checked', false);
        });
      });
    }
  });

  /* product detail 分期表 */
  if ($('.installment').length > 0) {
    var installment, installmentCont, installmentNav;
    installment = $('.installment');
    installmentNav = installment.find('.nav-stacked .nav-item');
    installmentCont = installment.find('.content .pane');
    installmentNav.eq(0).addClass('active');
    installmentCont.eq(0).addClass('active');
    installmentNav.hover(function() {
      var i;
      i = $(this).index();
      installmentNav.removeClass('active');
      $(this).addClass('active');
      installmentCont.hide();
      installmentCont.eq(i).show();
      if( $(this).hasClass('extra') ) {
        $(this).removeClass('active');
      }
      return false;
    });
  }

  /* 年月日連動 (大月小月潤月) */
  if($('.js-yearMonthDateSelector').length > 0) {
    $('.js-yearMonthDateSelector').yearMonthDateSelector({
      formatYear: '西元{{year}}年',
      formatMonth: '{{month}}月',
      formatDate: '{{date}}日'
    });
  }

}).call(this);
