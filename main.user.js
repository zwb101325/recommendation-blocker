// ==UserScript==
// @name         recommendation-blocker
// @namespace    http://tampermonkey.net/
// @version      1.4.3
// @description  屏蔽常用网站导航栏、搜索框、首页、侧边栏推荐
// @author       You
// @match        *://*.bilibili.com/*
// @match        *://*.zhihu.com/*
// @match        *://*.doubao.com/*
// @icon         https://cdn.simpleicons.org/adblock
// @run-at       document-end
// @require      https://cdn.jsdelivr.net/npm/jquery@3.4.1/dist/jquery.min.js
// @grant        GM_registerMenuCommand
// @grant        GM_getValue
// @grant        GM_setValue
// @license      MIT
// ==/UserScript==

(function () {
    'use strict';
    /* global $ */

    // ============================================================
    // #region 初始化
    // ============================================================

    const enableBilibili = GM_getValue('enableBilibili', true);
    const enableZhihu = GM_getValue('enableZhihu', true);
    const enableDoubao = GM_getValue('enableDoubao', true);

    GM_registerMenuCommand('设置', openSettingsPanel);

    let simplifyCurrentSite = null;

    if (location.hostname.includes('bilibili.com') && enableBilibili) {
        simplifyCurrentSite = simplifyBilibili;
    } else if (location.hostname.includes('zhihu.com') && enableZhihu) {
        simplifyCurrentSite = simplifyZhihu;
    } else if (location.hostname.includes('doubao.com') && enableDoubao) {
        simplifyCurrentSite = simplifyDoubao;
    }

    if (!simplifyCurrentSite) return;

    simplifyCurrentSite();

    // #endregion



    // ============================================================
    // #region 动态监听
    // ============================================================

    let observerTimer = null;
    const observer = new MutationObserver(() => {
        clearTimeout(observerTimer);
        observerTimer = setTimeout(() => {
            simplifyCurrentSite();
            observerTimer = null;
        }, 150);
    });

    if (document.body) observer.observe(document.body, {childList: true, subtree: true });
        
    // #endregion



    // ============================================================
    // #region 通用函数
    // ============================================================

    function ensureStyle(id, cssText) {
        if (document.getElementById(id)) return;
        const style = document.createElement('style');
        style.id = id;
        style.textContent = cssText;
        document.head.appendChild(style);
    }

    function getStatusText(isOn) {
        return isOn ? '开启' : '关闭';
    }

    // #endregion



    // ============================================================
    // #region 设置面板
    // ============================================================

    function injectSettingsStyles() {
        ensureStyle('rb-settings-style', `
            #rb-settings-overlay {
                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.45);
                z-index: 2147483647;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            #rb-settings-panel {
                width: 360px;
                max-width: calc(100vw - 32px);
                background: #ffffff;
                color: #222;
                border-radius: 14px;
                box-shadow: 0 12px 36px rgba(0, 0, 0, 0.18);
                padding: 20px 18px 16px;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            }

            #rb-settings-title {
                font-size: 18px;
                font-weight: 700;
                margin-bottom: 14px;
            }

            .rb-setting-row {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 12px 0;
                border-bottom: 1px solid #eee;
            }

            .rb-setting-row:last-of-type {
                border-bottom: none;
            }

            .rb-setting-label {
                font-size: 15px;
            }

            .rb-setting-status {
                margin-right: 10px;
                font-size: 13px;
                color: #666;
            }

            .rb-switch {
                position: relative;
                width: 48px;
                height: 28px;
                flex: 0 0 auto;
            }

            .rb-switch input {
                opacity: 0;
                width: 0;
                height: 0;
            }

            .rb-slider {
                position: absolute;
                inset: 0;
                cursor: pointer;
                background: #ccc;
                border-radius: 999px;
                transition: 0.2s;
            }

            .rb-slider::before {
                content: "";
                position: absolute;
                width: 22px;
                height: 22px;
                left: 3px;
                top: 3px;
                background: white;
                border-radius: 50%;
                transition: 0.2s;
                box-shadow: 0 1px 4px rgba(0,0,0,0.2);
            }

            .rb-switch input:checked + .rb-slider {
                background: #4caf50;
            }

            .rb-switch input:checked + .rb-slider::before {
                transform: translateX(20px);
            }

            #rb-settings-actions {
                display: flex;
                justify-content: flex-end;
                gap: 10px;
                margin-top: 18px;
            }

            .rb-btn {
                border: none;
                border-radius: 10px;
                padding: 9px 14px;
                cursor: pointer;
                font-size: 14px;
            }

            .rb-btn-cancel {
                background: #f1f1f1;
                color: #333;
            }

            .rb-btn-save {
                background: #1677ff;
                color: white;
            }

            #rb-settings-tip {
                margin-top: 10px;
                font-size: 12px;
                color: #777;
            }
        `);
    }


    function buildSettingsHTML() {
        const overlay = document.createElement('div');
        overlay.id = 'rb-settings-overlay';
        overlay.innerHTML = `
            <div id="rb-settings-panel">
                <div id="rb-settings-title">recommendation-blocker 设置</div>

                <div class="rb-setting-row">
                    <div class="rb-setting-label">B站屏蔽</div>
                    <div style="display:flex; align-items:center;">
                        <span class="rb-setting-status" id="rb-status-bilibili">${getStatusText(GM_getValue('enableBilibili', true))}</span>
                        <label class="rb-switch">
                            <input type="checkbox" id="rb-toggle-bilibili" ${GM_getValue('enableBilibili', true) ? 'checked' : ''}>
                            <span class="rb-slider"></span>
                        </label>
                    </div>
                </div>

                <div class="rb-setting-row">
                    <div class="rb-setting-label">知乎屏蔽</div>
                    <div style="display:flex; align-items:center;">
                        <span class="rb-setting-status" id="rb-status-zhihu">${getStatusText(GM_getValue('enableZhihu', true))}</span>
                        <label class="rb-switch">
                            <input type="checkbox" id="rb-toggle-zhihu" ${GM_getValue('enableZhihu', true) ? 'checked' : ''}>
                            <span class="rb-slider"></span>
                        </label>
                    </div>
                </div>

                <div class="rb-setting-row">
                    <div class="rb-setting-label">豆包屏蔽</div>
                    <div style="display:flex; align-items:center;">
                        <span class="rb-setting-status" id="rb-status-doubao">${getStatusText(GM_getValue('enableDoubao', true))}</span>
                        <label class="rb-switch">
                            <input type="checkbox" id="rb-toggle-doubao" ${GM_getValue('enableDoubao', true) ? 'checked' : ''}>
                            <span class="rb-slider"></span>
                        </label>
                    </div>
                </div>

                <div id="rb-settings-actions">
                    <button class="rb-btn rb-btn-cancel" id="rb-settings-cancel">取消</button>
                    <button class="rb-btn rb-btn-save" id="rb-settings-save">保存并刷新</button>
                </div>

                <div id="rb-settings-tip">修改后会刷新当前页面。</div>
            </div>
        `;

        document.body.appendChild(overlay);
        return overlay;
    }


    function bindSettingsEvents(overlay) {
        const sites = [
            { id: 'Bilibili', checkbox: 'rb-toggle-bilibili', status: 'rb-status-bilibili' },
            { id: 'Zhihu',    checkbox: 'rb-toggle-zhihu',    status: 'rb-status-zhihu'    },
            { id: 'Doubao',   checkbox: 'rb-toggle-doubao',   status: 'rb-status-doubao'   },
        ];

        sites.forEach(({ id, checkbox, status }) => {
            const cb = document.getElementById(checkbox);
            const st = document.getElementById(status);
            cb.addEventListener('change', () => {
                st.textContent = getStatusText(cb.checked);
            });
        });

        document.getElementById('rb-settings-cancel').addEventListener('click', () => {
            overlay.remove();
        });

        document.getElementById('rb-settings-save').addEventListener('click', () => {
            sites.forEach(({ id, checkbox }) => {
                const cb = document.getElementById(checkbox);
                GM_setValue('enable' + id, cb.checked);
            });
            location.reload();
        });

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.remove();
        });
    }


    function openSettingsPanel() {
        if (document.getElementById('rb-settings-overlay')) return;
        injectSettingsStyles();
        const overlay = buildSettingsHTML();
        bindSettingsEvents(overlay);
    }

    // #endregion



    // ============================================================
    // #region 站点屏蔽
    // ============================================================

    function simplifyBilibili() {
        // 导航栏
        $('.left-entry__title').attr('href', 'https://search.bilibili.com/');
        $('.left-entry').css('visibility', 'hidden');
        $('.right-entry').css('visibility', 'hidden');
        $('.entry-title').css('visibility', 'visible');
        $('.mini-header__logo').css('visibility', 'visible');
        $('.header-entry-mini').css('visibility', 'visible');

        // 搜索框
        $('.nav-search-input').attr('placeholder', '');
        $('.trending').hide();

        // 首页
        $('.feed2').hide();

        // 视频页
        $('.bpx-player-ending-related').hide();
        $('.recommend-list-v1').hide();
        $('.pop-live-small-mode').hide();
        $('.video-pod__body').css('max-height', '450px');
    }


    function simplifyZhihu() {
        // 导航栏
        $('.css-lgijre > a').attr('href', 'https://www.zhihu.com/search');
        $('.css-72pd91').css('visibility', 'hidden');
        $('.css-1vbrp2j').css('visibility', 'hidden');

        // 搜索框
        ensureStyle('rb-zhihu-placeholder-style', '.Input::placeholder{color:transparent}');
        $('.SearchBar-label:first').hide();
        $('[id*="AutoComplete1-topSearch"]').hide();

        // 首页
        $('.Topstory-container').remove();

        // 搜索页
        $('.css-knqde').remove();
        $('.SearchMain').width('960px');

        // 问题页
        $('.Question-sideColumn').remove();
        $('.Question-mainColumn').width('960px');

        // 专栏页
        $('.Post-Row-Content-right').remove();
        $('.Post-Row-Content-left').width('960px');
        $('.Post-Sub').remove();
    }


    function simplifyDoubao() {
        // 首页
        $('#experiment-guidance-suggestions').remove();
    }

    // #endregion

})();
