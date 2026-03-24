// ==UserScript==
// @name         B站/知乎/豆包推荐屏蔽｜隐藏推荐/关闭首页推荐/净化页面插件
// @namespace    https://greasyfork.org/zh-CN/users/1573237
// @version      1.3.2
// @description  隐藏B站/知乎/豆包导航栏、搜索框、首页、侧边栏推荐
// @author       zwb299
// @match        *://*.bilibili.com/*
// @match        *://*.zhihu.com/*
// @icon         https://cdn.simpleicons.org/adblock
// @require      https://cdn.jsdelivr.net/npm/jquery@3.4.1/dist/jquery.min.js
// @grant        GM_registerMenuCommand
// @grant        GM_getValue
// @grant        GM_setValue
// @license      MIT
// ==/UserScript==

(function() {
    'use strict';
    /* global $ */

    const enableBilibili = GM_getValue('enableBilibili', true);
    const enableZhihu = GM_getValue('enableZhihu', true);
    const enableDoubao = GM_getValue('enableDoubao', true);

    addToggleMenu('B站屏蔽', 'enableBilibili', enableBilibili);
    addToggleMenu('知乎屏蔽', 'enableZhihu', enableZhihu);
    addToggleMenu('豆包屏蔽', 'enableDoubao', enableDoubao);

    if (enableBilibili) simplifyBilibili();
    if (enableZhihu) simplifyZhihu();
    if (enableDoubao) simplifyDoubao();

    //监听 DOM 变化
    const observer = new MutationObserver((mutations) => {
        if (enableBilibili) simplifyBilibili();
        if (enableZhihu) simplifyZhihu();
        if (enableDoubao) simplifyDoubao();
    });
    observer.observe(document.body, {childList: true, subtree: true});


    //===============================函数区===============================
    
    function getStatusText(isOn) {
        if (isOn) {
            return '🟢 开启';
        } else {
            return '🔴 关闭';
        }
    }


    function addToggleMenu(name, key, currentValue) {
        const text = '⚙️ ' + name + ' | ' + getStatusText(currentValue);
        GM_registerMenuCommand(text, function () {
            const newValue = !currentValue;
            GM_setValue(key, newValue);
            location.reload();
        });
    }

    
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

    
     function simplifyDoubao(){
        // 首页
        $("#experiment-guidance-suggestions").remove();
    }
    
})();
