// ==UserScript==
// @name         B站/Bilibili/知乎推荐屏蔽｜隐藏推荐/关闭首页推荐/净化页面插件
// @namespace    https://greasyfork.org/zh-CN/users/1573237
// @version      1.2.5
// @description  隐藏B站/知乎导航栏、搜索框、首页、侧边栏推荐
// @author       zwb299
// @match        *://*.bilibili.com/*
// @match        *://*.zhihu.com/*
// @require      https://cdn.jsdelivr.net/npm/jquery@3.4.1/dist/jquery.min.js
// @icon         https://cdn.simpleicons.org/adblock
// @grant        none
// @license      MIT
// ==/UserScript==

(function() {
    'use strict';
    /* global $ */

    //初次执行
    simplifyBilibili();
    simplifyZhihu();

    //监听 DOM 变化
    const observer = new MutationObserver((mutations) => {
        simplifyBilibili();
        simplifyZhihu();
    });
    observer.observe(document.body, {childList: true, subtree: true});


    //===============================函数区===============================

    //清除B站推荐
    function simplifyBilibili(){
        // 导航栏
        $(".left-entry").css('visibility', 'hidden');
        $(".right-entry").css('visibility', 'hidden');
        $(".entry-title").css('visibility', 'visible');
        $(".mini-header__logo").css('visibility', 'visible');
        $(".header-entry-mini").css('visibility', 'visible');
        $(".left-entry__title").attr('href', 'https://search.bilibili.com/');

        // 搜索框
        $(".nav-search-input").attr('placeholder', '');
        $(".trending").hide();

        // 首页
        $(".feed2").hide();

        // 视频页
        $(".bpx-player-ending-related").hide();
        $(".recommend-list-v1").hide();
        $(".pop-live-small-mode").hide();
        $(".video-pod__body").css('max-height', '450px');
    }

    //清除知乎推荐
    function simplifyZhihu(){
        // 导航栏
        $(".css-72pd91").css('visibility', 'hidden');
        $(".css-1vbrp2j").css('visibility', 'hidden');

        // 搜索框
        $('<style>.Input::placeholder{color:transparent}</style>').appendTo('head');
        $(".SearchBar-label:first").hide();
        $('[id*="AutoComplete1-topSearch"]').hide();

        // 首页
        $(".Topstory-container").remove();

        // 搜索页
        $(".css-knqde").remove();
        $(".SearchMain").width('960px');

        // 问题页
        $(".Question-sideColumn").remove();
        $(".Question-mainColumn").width('960px');

        // 专栏页
        $(".Post-Row-Content-right").remove();
        $(".Post-Row-Content-left").width('960px');
        $(".Post-Sub").remove();
    }


})();
