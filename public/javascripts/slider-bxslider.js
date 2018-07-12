"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var sliderGenerator = function () {
  function sliderGenerator() {
    _classCallCheck(this, sliderGenerator);
  }

  /** change pagination active */


  sliderGenerator.prototype.sliderChangeActive = function sliderChangeActive(items, index) {
    if (typeof index !== 'number') {
      index = 0;
    }
    items.forEach(function (v, i) {
      if (index === i) {
        v.classList.add('active');
      } else {
        v.classList.remove('active');
      }
    });
  };

  sliderGenerator.prototype.sliderLazyLoad = function sliderLazyLoad(element) {
    var $sliderLazy = element.find('.js-lazy');
    $sliderLazy.each(function (index) {
      if ($(this) && $(this).attr("data-src")) {
        var $imgDataSrc = $(this).attr("data-src");
        $(this).attr("src", $imgDataSrc).removeAttr('data-src').removeClass("js-lazy");
      }
    });
  };

  /**
   * bigBannerAndTabs 首頁大輪播版位
   * {HTMLElement} element 外框 element
   * {string} 標記 id 的流水號
   */


  sliderGenerator.prototype.bigBannerAndTabs = function bigBannerAndTabs(element, listNumber, prefix) {

    var then, sliderView, thisSlider, gallerySliderBtnsControl;
    if (typeof listNumber === 'undefined') {
      listNumber = 0;
    }
    if (typeof prefix === 'undefined') {
      prefix = 'bigBannerAndTabs';
    }
    then = this;
    sliderView = $(element).find('.slider-view');
    gallerySliderBtnsControl = $(element).find('.bx-pager').attr('id', prefix + '-' + listNumber).prop('id');
    thisSlider = $(sliderView).bxSlider({
      pagerCustom: '#' + gallerySliderBtnsControl,
      autoHover: true,
      auto: true,
      pause: 5000,
      speed: 500,
      controls: true,
      prevText: '<i class="icon icon-arrow-left"></i>',
      nextText: '<i class="icon icon-arrow-right"></i>',
      onSliderLoad: function onSliderLoad() {
        return $(element).find('.bx-prev, .bx-next').addClass('slider-arrow');
      },
      onSlideBefore: function onSlideBefore(slideElement, oldIndex, Index) {
        then.sliderLazyLoad(slideElement); // for lazy load
        $(oldIndex < Index ? '.js-gallery-slider .bx-next.slider-arrow' : '.js-gallery-slider .bx-prev.slider-arrow').addClass('hide');
        return thisSlider.stopAuto();
      },
      onSlideAfter: function onSlideAfter(slideElement, oldIndex, Index) {
        $(oldIndex < Index ? '.js-gallery-slider .bx-next.slider-arrow' : '.js-gallery-slider .bx-prev.slider-arrow').removeClass('hide');
        return thisSlider.startAuto();
      }
    });
  };

  /**
   * flopBannerSlider 首頁側邊銀行版位 (手動換頁不自動翻轉)
   * {HTMLElement} element 觸發外框 element
   */
  sliderGenerator.prototype.flopBannerSlider = function flopBannerSlider(element) {

    var then, sliderView, thisSlider, gallerySliderBtnsControl;
    then = this;
    sliderView = $(element).find('.swiper-wrapper');
    thisSlider = $(sliderView).bxSlider({
      autoHover: false,
      auto: false,
      speed: 500,
      controls: true,
      pager: false,
      prevText: '<i class="icon icon-arrow-left"></i>',
      nextText: '<i class="icon icon-arrow-right"></i>'
    });
  };

  return sliderGenerator;
}();
// class sliderGenerator end

var mySliderGen = new sliderGenerator();

/**
 * events
 */
$(function () {

  if (document.querySelectorAll('.js-gallery-slider').length > 0) {
    document.querySelectorAll('.js-gallery-slider').forEach(function (item, index) {
      mySliderGen.bigBannerAndTabs(item, index, 'gallery-slider-btns-control');
    });
  }

  if (document.querySelectorAll('.js-flop-banner-slider').length > 0) {
    // TODO 首頁銀行翻牌 banner swiper 版 (jira 1745)
    document.querySelectorAll('.js-flop-banner-slider').forEach(function (item, index) {
      mySliderGen.flopBannerSlider(item);
    });
  }
});