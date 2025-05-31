(function() {
    var activeWindows = {};
    var highestZIndex = 10000;
    var windowCounter = 0;
    var mainUiContainerId = 'bmMainUiContainer';
    var showUiButtonId = 'bmShowUiButton';
    var minimizedBarId = 'bmMinimizedBar';
    var SNAP_THRESHOLD = 30;
    var CORNER_SNAP_THRESHOLD = 50;
    var SNAP_PREVIEW_ID = 'bmSnapPreview';
    var Z_INDEX_MAIN_UI = 2147483640;
    var Z_INDEX_MINIMIZED_BAR = 2147483639;
    var Z_INDEX_SHOW_UI_BUTTON = 2147483641;
    var Z_INDEX_CONTEXT_MENU = 2147483642;
    var LOADING_ICON_SRC = 'data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHLJTAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==';
    var searchEngines = {
        Google: 'https://www.google.com/search?igu=1&q=',
        Bing: 'https://www.bing.com/search?q=',
        DuckDuckGo: 'https://duckduckgo.com/?q=',
        Yahoo: 'https://search.yahoo.com/search?p='
    };
    var searchEngineHomepages = {
        Google: 'https://www.google.com',
        Bing: 'https://www.bing.com',
        DuckDuckGo: 'https://duckduckgo.com',
        Yahoo: 'https://www.yahoo.com'
    };
    var currentSearchEngine = 'Google';
    var showTabBarWhenUiHidden = true;
    var uiButtonLastPosition = null;
    var linkThroughEnabled = true;
    var originalPageFavicon = null;

    function getOriginalPageFavicon() {
        if (originalPageFavicon) return originalPageFavicon;
        const existingFavicon = document.querySelector('link[rel="icon"]') || document.querySelector('link[rel="shortcut icon"]');
        originalPageFavicon = existingFavicon ? existingFavicon.href : null;
        return originalPageFavicon;
    }

    function setBrowserFavicon(iconUrl) {
        let faviconLink = document.querySelector('link[id="bmBrowserFavicon"]');
        if (!faviconLink) {
            faviconLink = document.createElement('link');
            faviconLink.id = 'bmBrowserFavicon';
            faviconLink.setAttribute('rel', 'icon');
            document.head.appendChild(faviconLink);
        }
        faviconLink.setAttribute('href', iconUrl);
    }

    function applyBaseStyles(element) {
        element.style.fontFamily = 'Arial, Helvetica, sans-serif';
        element.style.fontSize = '14px';
        element.style.color = '#333';
        element.style.lineHeight = 'normal';
    }

    function applyButtonStyles(button) {
        applyBaseStyles(button);
        button.style.border = '1px solid #999';
        button.style.background = '#f0f0f0';
        button.style.color = '#333';
        button.style.cursor = 'pointer';
        button.style.padding = '5px 8px';
        button.style.margin = '0';
        button.style.borderRadius = '3px';
        button.style.textAlign = 'center';
    }

    function applyInputStyles(input) {
        applyBaseStyles(input);
        input.style.border = '1px solid #ccc';
        input.style.padding = '5px';
        input.style.margin = '0';
        input.style.borderRadius = '3px';
        input.style.backgroundColor = 'white';
        input.style.color = 'black';
    }

    function applySelectStyles(selectElement) {
        applyInputStyles(selectElement);
        selectElement.style.paddingRight = '25px';
        selectElement.style.height = '34px';
        selectElement.style.webkitAppearance = 'none';
        selectElement.style.mozAppearance = 'none';
        selectElement.style.appearance = 'none';
        selectElement.style.backgroundImage = 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20width%3D%27292.4%27%20height%3D%27292.4%27%3E%3Cpath%20fill%3D%27%23333333%27%20d%3D%27M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.4-12.8z%27%2F%3E%3C%2Fsvg%3E")';
        selectElement.style.backgroundRepeat = 'no-repeat';
        selectElement.style.backgroundPosition = 'right .7em top 50%, 0 0';
        selectElement.style.backgroundSize = '.65em auto, 100%';
        selectElement.style.boxSizing = 'border-box';
    }

    function getSnapPreview() {
        var preview = document.getElementById(SNAP_PREVIEW_ID);
        if (!preview) {
            preview = document.createElement('div');
            preview.id = SNAP_PREVIEW_ID;
            preview.style.all = 'initial';
            applyBaseStyles(preview);
            preview.style.position = 'fixed';
            preview.style.backgroundColor = 'rgba(0,100,200,0.3)';
            preview.style.border = '2px dashed rgba(0,80,180,0.7)';
            preview.style.zIndex = highestZIndex + 100;
            preview.style.display = 'none';
            preview.style.pointerEvents = 'none';
            preview.style.boxSizing = 'border-box';
            document.body.appendChild(preview);
        }
        return preview;
    }

    function getTabId(winId) {
        return 'bmTabItem-' + winId.split('-')[1];
    }

    function addMenuItem(menu, text, iconHTML, onClickAction, toolId, isSubmenuItem = false) {
        var itemWrapper = document.createElement('div');
        itemWrapper.style.all = 'initial';
        applyBaseStyles(itemWrapper);
        itemWrapper.style.display = 'flex';
        itemWrapper.style.justifyContent = 'space-between';
        itemWrapper.style.alignItems = 'center';
        itemWrapper.style.padding = isSubmenuItem ? '6px 10px 6px 20px' : '8px 12px';
        itemWrapper.style.cursor = 'pointer';
        itemWrapper.style.backgroundColor = 'white';
        if (toolId) itemWrapper.dataset.toolId = toolId;
        if (text) itemWrapper.dataset.title = text;
        if (iconHTML) itemWrapper.dataset.icon = iconHTML;

        var itemText = document.createElement('span');
        itemText.style.all = 'initial';
        applyBaseStyles(itemText);
        itemText.style.backgroundColor = 'transparent';
        itemText.textContent = text;

        itemWrapper.onmouseover = function() {
            this.style.backgroundColor = '#f0f0f0';
            var submenu = this.querySelector('.bm-submenu');
            if (submenu) submenu.style.display = 'block';
        };
        itemWrapper.onmouseout = function(e) {
            this.style.backgroundColor = 'white';
            var submenu = this.querySelector('.bm-submenu');
            if (submenu && !this.contains(e.relatedTarget) && !submenu.contains(e.relatedTarget)) submenu.style.display = 'none';
        };
        itemWrapper.onclick = function(e) {
            e.stopPropagation();
            onClickAction(itemWrapper);
            if (!itemWrapper.classList.contains('bm-submenu-parent')) {
                var topMenu = this.closest('.bm-tool-menu, #bmTabContextMenu');
                if (topMenu) topMenu.style.display = 'none';
            }
        };
        itemWrapper.appendChild(itemText);
        menu.appendChild(itemWrapper);
        return itemWrapper;
    }

    function populateToolMenu(menu, targetWin) {
        menu.innerHTML = '';
        addMenuItem(menu, targetWin.isMaximized ? 'Restore' : 'Maximize', targetWin.isMaximized ? '⧑' : '▢', function(menuItem) {
            targetWin.toggleMaximize();
            menuItem.firstChild.textContent = targetWin.isMaximized ? 'Restore' : 'Maximize';
            menuItem.dataset.icon = targetWin.isMaximized ? '⧑' : '▢';
        }, 'maximize');
        addMenuItem(menu, 'Minimize', '—', function() {
            targetWin.minimizeBtn.onclick({
                stopPropagation: function() {}
            });
        }, 'minimize');
        addMenuItem(menu, 'Reload', '↻', function() {
            targetWin.reloadToolMenuItem.click();
        }, 'reload');
        addMenuItem(menu, 'Back', '←', function() {
            targetWin.backToolMenuItem.click();
        }, 'back');
        addMenuItem(menu, 'Forward', '→', function() {
            targetWin.forwardToolMenuItem.click();
        }, 'forward');
        addMenuItem(menu, targetWin.isSearchBarVisible ? 'Hide Search Bar' : 'Show Search Bar', targetWin.isSearchBarVisible ? '🔍' : '🔎', function(menuItem) { // Using different unicode for visible/hidden states
            targetWin.isSearchBarVisible = !targetWin.isSearchBarVisible;
            targetWin.inWindowSearchBar.style.display = targetWin.isSearchBarVisible ? 'block' : 'none';
            menuItem.firstChild.textContent = targetWin.isSearchBarVisible ? 'Hide Search Bar' : 'Show Search Bar';
            menuItem.dataset.icon = targetWin.isSearchBarVisible ? '🔍' : '🔎';
        }, 'searchbar');
        addMenuItem(menu, targetWin.isProxied ? 'Disable Proxy' : 'Enable Proxy', targetWin.isProxied ? '🛡️' : '🌍', function(menuItem) { // Using different unicode for proxy states
            var newProxiedState = !targetWin.isProxied;
            var urlToToggle = targetWin.originalIframeSrc;
            if (targetWin.iframeEl.src.startsWith('about:') || targetWin.iframeEl.src.startsWith('data:')) return;

            if (!newProxiedState) {
                setIframeSourceAndLoadEvents(targetWin.iframeEl, targetWin.titleSpan, targetWin.faviconImg, targetWin, urlToToggle, false, urlToToggle, targetWin.currentIsUrlType, targetWin.currentQueryForTitle);
            } else {
                var currentNonProxiedUrl = targetWin.originalIframeSrc;
                var proxiedUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(currentNonProxiedUrl);
                setIframeSourceAndLoadEvents(targetWin.iframeEl, targetWin.titleSpan, targetWin.faviconImg, targetWin, proxiedUrl, true, currentNonProxiedUrl, targetWin.currentIsUrlType, targetWin.currentQueryForTitle);
            }
            menuItem.firstChild.textContent = newProxiedState ? 'Disable Proxy' : 'Enable Proxy';
            menuItem.dataset.icon = newProxiedState ? '🛡️' : '🌍';
        }, 'proxy');
        addMenuItem(menu, 'Share URL', '🔗️', function() { // Unicode for link
            const urlToCopy = targetWin.isProxied ? targetWin.originalIframeSrc : targetWin.iframeEl.src;
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(urlToCopy).then(function() {}, function(err) {
                    console.error('Could not copy:', err);
                    prompt("Copy URL:", urlToCopy);
                });
            } else {
                prompt("Copy URL:", urlToCopy);
            }
        }, 'share');
        addMenuItem(menu, 'Open in New Tab', '↗️', function() {
            const urlToOpen = targetWin.isProxied ? targetWin.originalIframeSrc : targetWin.iframeEl.src;
            window.open(urlToOpen, '_blank');
        }, 'opennewtab');
        addMenuItem(menu, 'Close Window', '✕', function() {
            targetWin.closeButton.click();
        }, 'closewindow');
    }


    function updateTabBar() {
        var bar = getMinimizedBar(true);
        var mainUi = document.getElementById(mainUiContainerId);
        if (mainUi && mainUi.style.display === 'none' && !showTabBarWhenUiHidden) {
            bar.style.display = 'none';
            return;
        }
        bar.style.display = 'block';
        bar.style.opacity = (mainUi && mainUi.style.display === 'none' && showTabBarWhenUiHidden) ? '0.7' : '1';
        bar.innerHTML = '';

        var newWindowBtn = document.createElement('button');
        newWindowBtn.style.all = 'initial';
        applyButtonStyles(newWindowBtn);
        newWindowBtn.innerHTML = '+';
        newWindowBtn.title = 'New Window';
        newWindowBtn.style.padding = '0 10px';
        newWindowBtn.style.fontSize = '18px';
        newWindowBtn.style.marginRight = '5px';
        newWindowBtn.onclick = function(e) {
            e.stopPropagation();
            createWindowInstance('nw://new', true);
        };
        bar.appendChild(newWindowBtn);

        var hasVisibleWindows = false;
        Object.values(activeWindows).forEach(function(win) {
            var tabId = getTabId(win.id);
            var tabItem = document.createElement('div');
            tabItem.style.all = 'initial';
            applyBaseStyles(tabItem);
            tabItem.id = tabId;
            tabItem.style.display = 'inline-flex';
            tabItem.style.alignItems = 'center';
            tabItem.style.padding = '5px 8px';
            tabItem.style.margin = '0 2px';
            tabItem.style.backgroundColor = win.isMinimized ? '#f0f0f0' : (win.style.zIndex == String(highestZIndex) ? '#e0e0ff' : '#d0d0d0');
            tabItem.style.border = '1px solid #aaa';
            tabItem.style.borderRadius = '3px';
            tabItem.style.cursor = 'pointer';
            tabItem.style.height = 'calc(100% - 2px)';
            tabItem.style.boxSizing = 'border-box';
            tabItem.style.maxWidth = '200px';

            var tabFavicon = document.createElement('img');
            tabFavicon.style.all = 'initial';
            tabFavicon.style.width = '16px';
            tabFavicon.style.height = '16px';
            tabFavicon.style.marginRight = '4px';
            tabFavicon.style.verticalAlign = 'middle';
            tabFavicon.style.flexShrink = '0';
            if (win.faviconImg && win.faviconImg.style.display !== 'none') {
                tabFavicon.src = win.faviconImg.src;
                tabFavicon.style.display = 'inline-block';
            } else {
                tabFavicon.style.display = 'none';
            }
            win.tabFaviconImg = tabFavicon;
            tabItem.appendChild(tabFavicon);

            var tabTitleText = win.currentTitle || 'Untitled';
            var tabTextNode = document.createElement('span');
            tabTextNode.style.all = 'initial';
            applyBaseStyles(tabTextNode);
            tabTextNode.style.overflow = 'hidden';
            tabTextNode.style.textOverflow = 'ellipsis';
            tabTextNode.style.whiteSpace = 'nowrap';
            tabTextNode.textContent = tabTitleText.substring(0, 20) + (tabTitleText.length > 20 ? '...' : '');
            tabItem.appendChild(tabTextNode);
            tabItem.title = tabTitleText;

            var tabCloseBtn = document.createElement('span');
            tabCloseBtn.style.all = 'initial';
            applyBaseStyles(tabCloseBtn);
            tabCloseBtn.innerHTML = '✕';
            tabCloseBtn.style.marginLeft = '5px';
            tabCloseBtn.style.padding = '0 2px';
            tabCloseBtn.style.cursor = 'pointer';
            tabCloseBtn.style.fontSize = '12px';
            tabCloseBtn.style.fontWeight = 'bold';
            tabCloseBtn.onmouseover = function() {
                this.style.color = 'red';
            };
            tabCloseBtn.onmouseout = function() {
                this.style.color = '#333';
            };
            tabCloseBtn.onclick = function(e) {
                e.stopPropagation();
                win.closeButton.click();
            };
            tabItem.appendChild(tabCloseBtn);

            tabItem.onclick = function() {
                if (win.isMinimized) {
                    win.restoreWindow();
                } else {
                    bringToFront(win);
                }
                updateTabBar();
            };
            tabItem.oncontextmenu = function(e) {
                e.preventDefault();
                e.stopPropagation();
                showTabContextMenu(e, win);
            };
            bar.appendChild(tabItem);
            if (!win.isMinimized) hasVisibleWindows = true;
        });

        if (Object.keys(activeWindows).length === 0 && !showTabBarWhenUiHidden) bar.style.display = 'none';
    }

    function getMinimizedBar(createIfNeeded = true) {
        var bar = document.getElementById(minimizedBarId);
        if (!bar && createIfNeeded) {
            bar = document.createElement('div');
            bar.id = minimizedBarId;
            bar.style.all = 'initial';
            applyBaseStyles(bar);
            bar.style.position = 'fixed';
            bar.style.bottom = '0';
            bar.style.left = '0';
            bar.style.width = '100%';
            bar.style.height = '35px';
            bar.style.backgroundColor = 'rgba(200,200,200,0.9)';
            bar.style.zIndex = Z_INDEX_MINIMIZED_BAR;
            bar.style.overflowX = 'auto';
            bar.style.overflowY = 'hidden';
            bar.style.whiteSpace = 'nowrap';
            bar.style.padding = '5px';
            bar.style.boxSizing = 'border-box';
            bar.style.borderTop = '1px solid #999';
            bar.style.display = 'block';
            var mainUi = document.getElementById(mainUiContainerId);
            if (mainUi && mainUi.style.display === 'none' && !showTabBarWhenUiHidden) bar.style.display = 'none';
            document.body.appendChild(bar);
        }
        return bar;
    }

    function bringToFront(winElem) {
        if (winElem.isMinimized) return;
        highestZIndex++;
        winElem.style.zIndex = highestZIndex;
        if (winElem.toolMenu) winElem.toolMenu.style.zIndex = highestZIndex + 1;
        updateTabBar();
    }

    function isValidURL(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    function handleAuxClick(e) {
        if (e.button === 1) { // Middle mouse button
            var targetLink = e.target.closest('a');
            if (targetLink && targetLink.href && !targetLink.href.startsWith('javascript:')) {
                e.preventDefault();
                e.stopPropagation();
                createWindowInstance(targetLink.href, true);
                return false;
            }
        }
    }

    function attachAuxClickListenerToDocument(docContext) {
        if (docContext && !docContext.bmAuxClickListenerAttached) {
            docContext.addEventListener('auxclick', handleAuxClick, true);
            docContext.bmAuxClickListenerAttached = true;
        }
    }

    function generateTitleForWindow(urlOrQuery, isSearch, originalInput) {
        if (isSearch) {
            return 'Search: ' + (originalInput ? originalInput.substring(0, 40) : '');
        } else {
            try {
                return (new URL(urlOrQuery)).hostname || urlOrQuery.substring(0, 50);
            } catch (e) {
                return urlOrQuery.substring(0, 50);
            }
        }
    }

    function setLoadingState(winObj, iframeEl, titleSpanEl, faviconImgEl) {
        faviconImgEl.src = LOADING_ICON_SRC;
        faviconImgEl.style.display = 'inline-block';
        if (winObj.tabFaviconImg) {
            winObj.tabFaviconImg.src = LOADING_ICON_SRC;
            winObj.tabFaviconImg.style.display = 'inline-block';
        }
    }

    function clearLoadingStateAndSetContent(winObj, iframeEl, titleSpanEl, faviconImgEl) {
        let currentTitle = '';
        let currentUrlForFavicon = '';
        try {
            if (iframeEl.contentWindow && iframeEl.contentWindow.document) {
                currentTitle = iframeEl.contentWindow.document.title;
            }
            if (iframeEl.contentWindow && iframeEl.contentWindow.location && iframeEl.contentWindow.location.href && iframeEl.contentWindow.location.href !== 'about:blank' && !iframeEl.contentWindow.location.href.startsWith('data:')) {
                currentUrlForFavicon = iframeEl.contentWindow.location.href;
            }
        } catch (e) { /* Cross-origin issues */ }

        if (!currentTitle || currentTitle.trim() === "") {
            currentTitle = generateTitleForWindow(winObj.isProxied ? winObj.originalIframeSrc : iframeEl.src, !winObj.currentIsUrlType, winObj.currentQueryForTitle);
        }
        titleSpanEl.textContent = currentTitle;
        winObj.currentTitle = currentTitle;

        const urlForApi = (winObj.isProxied && winObj.originalIframeSrc) ? winObj.originalIframeSrc : (currentUrlForFavicon || iframeEl.src);

        if (!urlForApi || urlForApi.startsWith('about:') || urlForApi.startsWith('data:')) {
            faviconImgEl.style.display = 'none';
            if (winObj.tabFaviconImg) winObj.tabFaviconImg.style.display = 'none';
        } else {
            const faviconApiUrl = 'https://www.google.com/s2/favicons?sz=16&domain_url=' + encodeURIComponent(urlForApi);
            let tempFaviconLoader = new Image();
            tempFaviconLoader.onload = function() {
                faviconImgEl.src = faviconApiUrl;
                faviconImgEl.style.display = 'inline-block';
                if (winObj.tabFaviconImg) {
                    winObj.tabFaviconImg.src = faviconApiUrl;
                    winObj.tabFaviconImg.style.display = 'inline-block';
                }
            };
            tempFaviconLoader.onerror = function() {
                faviconImgEl.style.display = 'none';
                if (winObj.tabFaviconImg) winObj.tabFaviconImg.style.display = 'none';
            };
            tempFaviconLoader.src = faviconApiUrl;
        }

        try {
            attachAuxClickListenerToDocument(iframeEl.contentDocument);
        } catch (e) { /* Cross-origin issues */ }
        updateTabBar();
    }


    function setIframeSourceAndLoadEvents(iframeEl, titleSpanEl, faviconImgEl, winObj, newSrc, newIsProxied, newOriginalSrc, newIsUrlType, newQueryForTitle) {
        winObj.isProxied = newIsProxied;
        winObj.originalIframeSrc = newOriginalSrc !== undefined ? newOriginalSrc : (newIsProxied ? winObj.originalIframeSrc : newSrc);
        winObj.currentQueryForTitle = newQueryForTitle;
        winObj.currentIsUrlType = newIsUrlType;

        setLoadingState(winObj, iframeEl, titleSpanEl, faviconImgEl);

        iframeEl.onload = null; // Clear previous onload
        iframeEl.onerror = null; // Clear previous onerror

        iframeEl.onload = function() {
            clearLoadingStateAndSetContent(winObj, iframeEl, titleSpanEl, faviconImgEl);
        };
        iframeEl.onerror = function() {
            titleSpanEl.textContent = "Error";
            winObj.currentTitle = "Error";
            faviconImgEl.style.display = 'none';
            if (winObj.tabFaviconImg) winObj.tabFaviconImg.style.display = 'none';
            updateTabBar();
        };
        iframeEl.src = newSrc;
    }


    function createWindowInstance(contentUrlOrQuery, isUrlInput) {
        windowCounter++;
        var winId = 'bmPopupWindow-' + windowCounter;
        var initialIframeSrc = '';
        var initialOriginalSrc = '';
        var initialIsProxied = false;
        var isNewTabPlaceholder = false;

        if (contentUrlOrQuery === 'nw://new') {
            isNewTabPlaceholder = true;
            initialIframeSrc = 'about:blank';
            initialOriginalSrc = 'about:blank';
            contentUrlOrQuery = 'New Tab';
            isUrlInput = false; // Treat "New Tab" as not a URL for title generation
        } else if (isUrlInput) {
            initialIframeSrc = contentUrlOrQuery;
            initialOriginalSrc = contentUrlOrQuery;
        } else {
            initialIframeSrc = searchEngines[currentSearchEngine] + encodeURIComponent(contentUrlOrQuery);
            initialOriginalSrc = initialIframeSrc; // For search, original is the search URL itself
        }

        var win = document.createElement('div');
        win.id = winId;
        win.style.all = 'initial';
        applyBaseStyles(win);
        win.isMinimized = false;
        win.originalStateBeforeMinimize = {};
        win.isSearchBarVisible = false;
        win.lastNonSnappedState = null;

        win.style.position = 'fixed';
        win.style.width = '600px';
        win.style.height = '400px';
        win.style.minWidth = '300px';
        win.style.minHeight = '200px';
        win.style.left = Math.max(0, (window.innerWidth - 600) / 2 + (Object.keys(activeWindows).length % 5) * 20) + 'px';
        win.style.top = Math.max(0, (window.innerHeight - 400) / 2 + (Object.keys(activeWindows).length % 5) * 20) + 'px';
        win.style.backgroundColor = 'white';
        win.style.border = '1px solid #666';
        win.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)';
        win.style.display = 'flex';
        win.style.flexDirection = 'column';
        win.style.userSelect = 'none';
        win.style.transition = 'width 0.1s ease-out, height 0.1s ease-out, top 0.1s ease-out, left 0.1s ease-out';
        win.style.boxSizing = 'border-box';

        win.isProxied = initialIsProxied;
        win.originalIframeSrc = initialOriginalSrc;
        win.currentQueryForTitle = contentUrlOrQuery; // Store the original query/URL for title generation if needed
        win.currentIsUrlType = isUrlInput;

        var header = document.createElement('div');
        header.style.all = 'initial';
        applyBaseStyles(header);
        header.style.backgroundColor = '#e8e8e8';
        header.style.padding = '5px 8px';
        header.style.cursor = 'move';
        header.style.borderBottom = '1px solid #ccc';
        header.style.userSelect = 'none';
        header.style.position = 'relative'; // For tool menu positioning
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.alignItems = 'center';
        header.style.boxSizing = 'border-box';

        var titleContainer = document.createElement('div');
        titleContainer.style.all = 'initial';
        applyBaseStyles(titleContainer);
        titleContainer.style.display = 'flex';
        titleContainer.style.alignItems = 'center';
        titleContainer.style.flexGrow = '1';
        titleContainer.style.overflow = 'hidden'; // Prevent title from pushing buttons

        var faviconImg = document.createElement('img');
        faviconImg.style.all = 'initial';
        faviconImg.style.width = '16px';
        faviconImg.style.height = '16px';
        faviconImg.style.marginRight = '5px';
        faviconImg.style.verticalAlign = 'middle';
        faviconImg.style.display = 'none'; // Initially hidden
        faviconImg.style.flexShrink = '0';
        win.faviconImg = faviconImg;


        var titleSpan = document.createElement('span');
        titleSpan.style.all = 'initial';
        applyBaseStyles(titleSpan);
        var initialWinTitle = isNewTabPlaceholder ? 'New Tab' : generateTitleForWindow(win.isProxied ? win.originalIframeSrc : initialIframeSrc, !win.currentIsUrlType, win.currentQueryForTitle);
        titleSpan.textContent = initialWinTitle;
        win.currentTitle = initialWinTitle;
        titleSpan.style.overflow = 'hidden';
        titleSpan.style.textOverflow = 'ellipsis';
        titleSpan.style.whiteSpace = 'nowrap';
        titleSpan.style.flexGrow = '1';
        titleSpan.style.minWidth = '0'; // Allow shrinking

        titleContainer.appendChild(faviconImg);
        titleContainer.appendChild(titleSpan);

        var headerActionButtons = document.createElement('div'); // For back, fwd, reload
        headerActionButtons.style.all = 'initial';
        headerActionButtons.style.display = 'flex';
        headerActionButtons.style.alignItems = 'center';


        var controlsDiv = document.createElement('div'); // For tool, min, max, close
        controlsDiv.style.all = 'initial';
        controlsDiv.style.display = 'flex';
        controlsDiv.style.alignItems = 'center';


        function createHeaderButton(html, title) {
            var btn = document.createElement('button');
            btn.style.all = 'initial';
            applyBaseStyles(btn);
            btn.innerHTML = html;
            btn.title = title;
            btn.style.border = 'none';
            btn.style.background = 'transparent';
            btn.style.fontSize = '16px';
            btn.style.cursor = 'pointer';
            btn.style.padding = '0 4px'; // Adjust padding for better spacing
            return btn;
        }

        var backBtnHeader = createHeaderButton('←', 'Back');
        var forwardBtnHeader = createHeaderButton('→', 'Forward');
        var reloadBtnHeader = createHeaderButton('↻', 'Reload');

        var toolBtn = createHeaderButton('⚙️', 'Tools'); // Settings/Gear icon
        var minimizeBtn = createHeaderButton('—', 'Minimize');
        minimizeBtn.style.fontWeight = 'bold';
        var maximizeBtn = createHeaderButton('▢', 'Maximize'); // Square for Maximize
        var closeBtn = createHeaderButton('✕', 'Close'); // Multiplication X for Close
        closeBtn.style.fontSize = '18px';
        closeBtn.style.fontWeight = 'bold';
        win.closeButton = closeBtn;

        var iframe = document.createElement('iframe');
        iframe.style.all = 'initial';
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';
        iframe.style.flexGrow = '1'; // Take remaining space
        iframe.style.display = 'block'; // Ensure it takes space
        win.iframeEl = iframe;

        var iframeSrcObserver = new MutationObserver(function(mutationsList) {
            for (var mutation of mutationsList) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'src') {
                    if (iframe.src && iframe.src !== 'about:blank') {
                         setLoadingState(win, iframe, titleSpan, faviconImg);
                    }
                    break;
                }
            }
        });
        iframeSrcObserver.observe(iframe, { attributes: true });
        win.iframeSrcObserver = iframeSrcObserver;


        setIframeSourceAndLoadEvents(iframe, titleSpan, faviconImg, win, initialIframeSrc, initialIsProxied, initialOriginalSrc, isUrlInput, contentUrlOrQuery);


        var inWindowSearchBar = document.createElement('div');
        inWindowSearchBar.className = 'bm-window-search-bar';
        inWindowSearchBar.style.all = 'initial';
        applyBaseStyles(inWindowSearchBar);
        inWindowSearchBar.style.padding = '5px';
        inWindowSearchBar.style.backgroundColor = '#f8f8f8';
        inWindowSearchBar.style.borderTop = '1px solid #ddd';
        inWindowSearchBar.style.display = isNewTabPlaceholder ? 'block' : 'none';
        inWindowSearchBar.style.boxSizing = 'border-box';
        if(isNewTabPlaceholder) win.isSearchBarVisible = true;


        var inWindowSearchInput = document.createElement('input');
        inWindowSearchInput.style.all = 'initial';
        applyInputStyles(inWindowSearchInput);
        inWindowSearchInput.type = 'text';
        inWindowSearchInput.placeholder = 'URL or Search (' + currentSearchEngine + ')';
        inWindowSearchInput.style.width = 'calc(100% - 70px)'; // Adjusted for button
        inWindowSearchInput.style.padding = '3px';
        inWindowSearchInput.style.marginRight = '5px';
        inWindowSearchInput.style.boxSizing = 'border-box';


        var inWindowSearchBtn = document.createElement('button');
        inWindowSearchBtn.style.all = 'initial';
        applyButtonStyles(inWindowSearchBtn);
        inWindowSearchBtn.textContent = 'Go';
        inWindowSearchBtn.style.padding = '3px 5px';

        inWindowSearchBar.appendChild(inWindowSearchInput);
        inWindowSearchBar.appendChild(inWindowSearchBtn);


        var isDragging = false,
            isResizing = false;
        var offsetX, offsetY, originalWidth, originalHeight, originalMouseX, originalMouseY;
        var isMaximized = false;
        var originalStateBeforeMaximize = {};

        win.onmousedown = function() {
            bringToFront(win);
        };

        function dragMouseMove(e) {
            if (!isDragging || win.isMinimized) return;
            var newX = e.clientX - offsetX;
            var newY = e.clientY - offsetY;

            if (isMaximized) { // If dragging a maximized window, restore it first
                toggleMaximize(); // This will restore to originalStateBeforeMaximize or lastNonSnappedState
                // Recalculate offsetX/Y based on the new restored size and mouse position
                offsetX = parseFloat(win.style.width) / 2; // Center the grab point horizontally
                offsetY = header.offsetHeight / 2; // Grab from middle of header vertically
                newX = e.clientX - offsetX;
                newY = e.clientY - offsetY;
            }

            win.style.left = newX + 'px';
            win.style.top = newY + 'px';

            var snapPreview = getSnapPreview();
            var currentSnapZone = null;
            var minBarHeightOffset = (getMinimizedBar(false) && getMinimizedBar(false).style.display !== 'none' ? getMinimizedBar(false).offsetHeight : 0);


            if (e.clientY < CORNER_SNAP_THRESHOLD && e.clientX < CORNER_SNAP_THRESHOLD) { // Top-left corner
                snapPreview.style.left = '0px';
                snapPreview.style.top = '0px';
                snapPreview.style.width = '50vw';
                snapPreview.style.height = 'calc(50vh - ' + (minBarHeightOffset/2) + 'px)';
                currentSnapZone = 'topLeft';
            } else if (e.clientY < CORNER_SNAP_THRESHOLD && e.clientX > window.innerWidth - CORNER_SNAP_THRESHOLD) { // Top-right corner
                snapPreview.style.left = '50vw';
                snapPreview.style.top = '0px';
                snapPreview.style.width = '50vw';
                snapPreview.style.height = 'calc(50vh - ' + (minBarHeightOffset/2) + 'px)';
                currentSnapZone = 'topRight';
            } else if (e.clientY > window.innerHeight - CORNER_SNAP_THRESHOLD - minBarHeightOffset && e.clientX < CORNER_SNAP_THRESHOLD) { // Bottom-left corner
                snapPreview.style.left = '0px';
                snapPreview.style.top = '50vh';
                snapPreview.style.width = '50vw';
                snapPreview.style.height = 'calc(50vh - ' + (minBarHeightOffset/2) + 'px)';
                currentSnapZone = 'bottomLeft';
            } else if (e.clientY > window.innerHeight - CORNER_SNAP_THRESHOLD - minBarHeightOffset && e.clientX > window.innerWidth - CORNER_SNAP_THRESHOLD) { // Bottom-right corner
                snapPreview.style.left = '50vw';
                snapPreview.style.top = '50vh';
                snapPreview.style.width = '50vw';
                snapPreview.style.height = 'calc(50vh - ' + (minBarHeightOffset/2) + 'px)';
                currentSnapZone = 'bottomRight';
            } else if (e.clientX < SNAP_THRESHOLD) { // Left edge
                snapPreview.style.left = '0px';
                snapPreview.style.top = '0px';
                snapPreview.style.width = '50vw';
                snapPreview.style.height = 'calc(100vh - ' + minBarHeightOffset + 'px)';
                currentSnapZone = 'left';
            } else if (e.clientX > window.innerWidth - SNAP_THRESHOLD) { // Right edge
                snapPreview.style.left = '50vw';
                snapPreview.style.top = '0px';
                snapPreview.style.width = '50vw';
                snapPreview.style.height = 'calc(100vh - ' + minBarHeightOffset + 'px)';
                currentSnapZone = 'right';
            } else if (e.clientY < SNAP_THRESHOLD && !isMaximized) { // Top edge (for maximizing)
                snapPreview.style.left = '0px';
                snapPreview.style.top = '0px';
                snapPreview.style.width = '100vw';
                snapPreview.style.height = 'calc(100vh - ' + minBarHeightOffset + 'px)';
                currentSnapZone = 'top';
            } else {
                snapPreview.style.display = 'none';
                win.currentSnapZone = null;
                return;
            }
            snapPreview.style.display = 'block';
            win.currentSnapZone = currentSnapZone;
        }

        function dragMouseUp(e) {
            if (!isDragging) return;
            isDragging = false;
            win.style.transition = 'width 0.1s ease-out, height 0.1s ease-out, top 0.1s ease-out, left 0.1s ease-out';
            document.body.style.userSelect = '';
            iframe.style.pointerEvents = 'auto';
            document.removeEventListener('mousemove', dragMouseMove);
            document.removeEventListener('mouseup', dragMouseUp);

            var snapPreview = getSnapPreview();
            snapPreview.style.display = 'none';

            var snappedZone = win.currentSnapZone;
            win.currentSnapZone = null; // Clear after use

            if (snappedZone) {
                if (!win.lastNonSnappedState && !isMaximized) { // Store pre-snap state if not already snapped/maximized
                     win.lastNonSnappedState = {
                        left: win.style.left,
                        top: win.style.top,
                        width: win.style.width,
                        height: win.style.height,
                        maximized: isMaximized // Store if it was maximized before snapping (though usually it wouldn't be)
                    };
                }

                var minBarHeight = (getMinimizedBar(false) && getMinimizedBar(false).style.display !== 'none' ? getMinimizedBar(false).offsetHeight : 0);
                var viewportHeight = 'calc(100vh - ' + minBarHeight + 'px)';
                var halfViewportHeight = 'calc(50vh - ' + (minBarHeight/2) + 'px)';


                if (snappedZone === 'left') {
                    win.style.left = '0px';
                    win.style.top = '0px';
                    win.style.width = '50vw';
                    win.style.height = viewportHeight;
                } else if (snappedZone === 'right') {
                    win.style.left = '50vw';
                    win.style.top = '0px';
                    win.style.width = '50vw';
                    win.style.height = viewportHeight;
                } else if (snappedZone === 'top') {
                    if (!isMaximized) toggleMaximize();
                } else if (snappedZone === 'topLeft') {
                    win.style.left = '0px'; win.style.top = '0px';
                    win.style.width = '50vw'; win.style.height = halfViewportHeight;
                } else if (snappedZone === 'topRight') {
                    win.style.left = '50vw'; win.style.top = '0px';
                    win.style.width = '50vw'; win.style.height = halfViewportHeight;
                } else if (snappedZone === 'bottomLeft') {
                    win.style.left = '0px'; win.style.top = '50vh';
                    win.style.width = '50vw'; win.style.height = halfViewportHeight;
                } else if (snappedZone === 'bottomRight') {
                    win.style.left = '50vw'; win.style.top = '50vh';
                    win.style.width = '50vw'; win.style.height = halfViewportHeight;
                }

                if (snappedZone !== 'top') { // If snapped to a side/corner, it's not maximized
                    isMaximized = false;
                    maximizeBtn.innerHTML = '▢';
                    maximizeBtn.title = 'Maximize';
                    resizeHandle.style.display = 'block';
                }
            } else { // If not snapped, clear any stored snap state if it wasn't maximized
                 if (!isMaximized) win.lastNonSnappedState = null;
            }
        }

        function toggleMaximize() {
            if (win.isMinimized) return;
            if (isMaximized) {
                var targetState = win.lastNonSnappedState || originalStateBeforeMaximize;
                win.style.width = targetState.width;
                win.style.height = targetState.height;
                win.style.top = targetState.top;
                win.style.left = targetState.left;
                isMaximized = false;
                win.lastNonSnappedState = null; // Clear snap state on restore
                resizeHandle.style.display = 'block';
                maximizeBtn.innerHTML = '▢';
                maximizeBtn.title = 'Maximize';
            } else {
                win.lastNonSnappedState = null; // Clear any previous snap state before maximizing
                originalStateBeforeMaximize = {
                    width: win.style.width,
                    height: win.style.height,
                    top: win.style.top,
                    left: win.style.left
                };
                win.style.top = '0px';
                win.style.left = '0px';
                win.style.width = '100vw';
                win.style.height = 'calc(100vh - ' + (getMinimizedBar(false) && getMinimizedBar(false).style.display !== 'none' ? getMinimizedBar(false).offsetHeight : 0) + 'px)';
                resizeHandle.style.display = 'none';
                isMaximized = true;
                maximizeBtn.innerHTML = '⧑'; // Restore icon (e.g., two squares)
                maximizeBtn.title = 'Restore';
            }
            bringToFront(win);
        }
        maximizeBtn.onclick = function(e) {
            e.stopPropagation();
            toggleMaximize();
        };
        header.ondblclick = toggleMaximize;

        win.restoreWindow = function() {
            if (!win.isMinimized) return;
            win.style.display = 'flex'; // Restore display
            win.style.width = win.originalStateBeforeMinimize.width;
            win.style.height = win.originalStateBeforeMinimize.height;
            win.style.top = win.originalStateBeforeMinimize.top;
            win.style.left = win.originalStateBeforeMinimize.left;
            win.isMinimized = false;
            bringToFront(win);
            if (win.originalStateBeforeMinimize.maximized) {
                isMaximized = false; // Ensure it's reset before toggleMaximize call
                toggleMaximize(); // This will correctly set it to maximized state
            } else {
                resizeHandle.style.display = 'block';
            }
            updateTabBar();
        };

        minimizeBtn.onclick = function(e) {
            e.stopPropagation();
            if (win.isMinimized) {
                win.restoreWindow();
                return;
            }
            win.originalStateBeforeMinimize = {
                width: win.style.width,
                height: win.style.height,
                top: win.style.top,
                left: win.style.left,
                maximized: isMaximized // Store if it was maximized
            };
            win.style.display = 'none';
            win.isMinimized = true;
            updateTabBar();
        };

        closeBtn.onclick = function(e) {
            e.stopPropagation();
            if (win.iframeSrcObserver) win.iframeSrcObserver.disconnect();
            win.remove();
            if (win.toolMenu) win.toolMenu.remove(); // Also remove tool menu if it exists
            delete activeWindows[winId];
            // Clean up global event listeners if they were specific to this window's drag/resize
            document.removeEventListener('mousemove', dragMouseMove);
            document.removeEventListener('mouseup', dragMouseUp);
            document.removeEventListener('mousemove', resizeMouseMove);
            document.removeEventListener('mouseup', resizeMouseUp);
            document.body.style.userSelect = ''; // Ensure userSelect is reset
            if (iframe) iframe.style.pointerEvents = 'auto'; // Ensure pointer events are re-enabled on iframe
            updateTabBar();
        };

        header.onmousedown = function(e) {
            var targetTagName = e.target.tagName.toLowerCase();
            var isControl = targetTagName === 'button' || e.target.closest('.bm-tool-menu') || e.target === faviconImg;
            if (isControl) return; // Don't drag if clicking a button or the menu itself

            e.preventDefault(); // Prevent text selection
            bringToFront(win);
            if (win.isMinimized) return;

            // If window was snapped, and not currently maximized, restore to its pre-snap size at cursor
            if (win.lastNonSnappedState && !isMaximized) {
                win.style.transition = 'none'; // No animation during this adjustment
                var restoredWidth = parseFloat(win.lastNonSnappedState.width);
                var restoredHeight = parseFloat(win.lastNonSnappedState.height);
                win.style.width = restoredWidth + 'px';
                win.style.height = restoredHeight + 'px';

                // Adjust offsetX/Y so the window appears centered under the mouse
                offsetX = restoredWidth / 2;
                offsetY = header.offsetHeight / 2; // Grab from middle of header
                win.style.left = (e.clientX - offsetX) + 'px';
                win.style.top = (e.clientY - offsetY) + 'px';

                isMaximized = win.lastNonSnappedState.maximized; // Restore maximized state if it was maximized before snapping (unlikely but for completeness)
                win.lastNonSnappedState = null; // Clear the snapped state
            } else {
                offsetX = e.clientX - parseFloat(win.style.left);
                offsetY = e.clientY - parseFloat(win.style.top);
            }

            isDragging = true;
            win.style.transition = 'none'; // Disable transition during drag for smoother movement
            document.body.style.userSelect = 'none'; // Prevent text selection on body
            iframe.style.pointerEvents = 'none'; // Prevent iframe from capturing mouse events
            document.addEventListener('mousemove', dragMouseMove);
            document.addEventListener('mouseup', dragMouseUp);
        };

        var resizeHandle = document.createElement('div');
        resizeHandle.style.all = 'initial';
        resizeHandle.style.position = 'absolute';
        resizeHandle.style.width = '12px';
        resizeHandle.style.height = '12px';
        resizeHandle.style.right = '0px';
        resizeHandle.style.bottom = '0px';
        resizeHandle.style.cursor = 'nwse-resize';
        resizeHandle.style.backgroundColor = 'rgba(0,0,0,0.1)'; // Subtle resize handle
        resizeHandle.style.display = 'block';


        function resizeMouseMove(e) {
            if (!isResizing || win.isMinimized) return;
            var newWidth = originalWidth + (e.clientX - originalMouseX);
            var newHeight = originalHeight + (e.clientY - originalMouseY);
            win.style.width = Math.max(parseInt(win.style.minWidth), newWidth) + 'px';
            win.style.height = Math.max(parseInt(win.style.minHeight), newHeight) + 'px';
        }

        function resizeMouseUp(e) {
            if (!isResizing) return;
            isResizing = false;
            win.style.transition = 'width 0.1s ease-out, height 0.1s ease-out, top 0.1s ease-out, left 0.1s ease-out';
            document.body.style.userSelect = '';
            iframe.style.pointerEvents = 'auto';
            document.removeEventListener('mousemove', resizeMouseMove);
            document.removeEventListener('mouseup', resizeMouseUp);
        }

        resizeHandle.onmousedown = function(e) {
            e.preventDefault();
            e.stopPropagation(); // Prevent header drag
            if (win.isMinimized || isMaximized) return; // No resize when minimized or maximized
            bringToFront(win);
            isResizing = true;
            win.style.transition = 'none'; // Disable transition during resize
            originalWidth = parseInt(win.style.width, 10);
            originalHeight = parseInt(win.style.height, 10);
            originalMouseX = e.clientX;
            originalMouseY = e.clientY;
            document.body.style.userSelect = 'none';
            iframe.style.pointerEvents = 'none';
            document.addEventListener('mousemove', resizeMouseMove);
            document.addEventListener('mouseup', resizeMouseUp);
        };

        var toolMenu = document.createElement('div');
        win.toolMenu = toolMenu;
        toolMenu.className = 'bm-tool-menu';
        toolMenu.style.all = 'initial';
        applyBaseStyles(toolMenu);
        toolMenu.style.position = 'absolute';
        toolMenu.style.top = (header.offsetHeight - 2) + 'px'; // Position below header
        toolMenu.style.right = '60px'; // Align with tool button general area
        toolMenu.style.backgroundColor = 'white';
        toolMenu.style.border = '1px solid #ccc';
        toolMenu.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
        toolMenu.style.zIndex = highestZIndex + 1; // Above the window
        toolMenu.style.display = 'none';
        toolMenu.style.minWidth = '180px';
        toolMenu.style.boxSizing = 'border-box';

        // Expose necessary elements/functions to the window object for populateToolMenu
        win.toggleMaximize = toggleMaximize;
        win.isMaximized = isMaximized; // Initial state for populateToolMenu
        win.minimizeBtn = minimizeBtn;
        win.reloadToolMenuItem = { click: function() { reloadBtnHeader.click(); } };
        win.backToolMenuItem = { click: function() { backBtnHeader.click(); } };
        win.forwardToolMenuItem = { click: function() { forwardBtnHeader.click(); } };
        win.titleSpan = titleSpan; // For updating title from menu actions if needed
        win.inWindowSearchBar = inWindowSearchBar;
        // win.isSearchBarVisible is already on win

        populateToolMenu(toolMenu, win); // Populate initially

        toolBtn.onclick = function(e) {
            e.stopPropagation();
            populateToolMenu(toolMenu, win); // Re-populate to reflect current state
            toolMenu.style.display = toolMenu.style.display === 'none' ? 'block' : 'none';
            bringToFront(win); // Ensure window and menu are on top
        };

        // Global click listener to close tool menu if clicked outside
        document.addEventListener('click', function(e) {
            if (win.toolMenu && win.toolMenu.style.display === 'block' && !win.toolMenu.contains(e.target) && e.target !== toolBtn) {
                win.toolMenu.style.display = 'none';
            }
        }, true); // Use capture phase

        win.appendChild(toolMenu); // Add tool menu to the window div itself


        inWindowSearchBtn.onclick = function() {
            var val = inWindowSearchInput.value.trim();
            if (val) {
                var isInputUrl = isValidURL(val) || val.startsWith('http://') || val.startsWith('https://') || (val.includes('.') && !val.includes(' '));
                var newIframeSrc;
                if (isInputUrl) {
                    newIframeSrc = (!(new RegExp('^https?:\/\/', 'i')).test(val)) ? 'http://' + val : val;
                } else {
                    newIframeSrc = searchEngines[currentSearchEngine] + encodeURIComponent(val);
                }
                setIframeSourceAndLoadEvents(iframe, titleSpan, faviconImg, win, newIframeSrc, false, newIframeSrc, isInputUrl, val);
                inWindowSearchInput.value = ''; // Clear input
                // Hide search bar after search
                win.isSearchBarVisible = false;
                inWindowSearchBar.style.display = 'none';
                var searchBarMenuItem = win.toolMenu.querySelector('[data-tool-id=searchbar]');
                if (searchBarMenuItem) {
                    searchBarMenuItem.firstChild.textContent = 'Show Search Bar';
                    searchBarMenuItem.dataset.icon = '🔎';
                }
            }
        };
        inWindowSearchInput.onkeyup = function(e) {
            if (e.key === 'Enter') inWindowSearchBtn.click();
        };


        header.appendChild(titleContainer);
        headerActionButtons.appendChild(backBtnHeader);
        headerActionButtons.appendChild(forwardBtnHeader);
        headerActionButtons.appendChild(reloadBtnHeader);
        header.appendChild(headerActionButtons); // Add back/fwd/reload to left of controls

        controlsDiv.appendChild(toolBtn);
        controlsDiv.appendChild(minimizeBtn);
        controlsDiv.appendChild(maximizeBtn);
        controlsDiv.appendChild(closeBtn);
        header.appendChild(controlsDiv);

        win.appendChild(header);
        win.appendChild(inWindowSearchBar);
        win.appendChild(iframe);
        win.appendChild(resizeHandle);

        document.body.appendChild(win);
        activeWindows[winId] = win;
        bringToFront(win);
    }

    function showTabContextMenu(event, winObj) {
        var existingMenu = document.getElementById('bmTabContextMenu');
        if (existingMenu) existingMenu.remove();

        var contextMenu = document.createElement('div');
        contextMenu.id = 'bmTabContextMenu';
        contextMenu.style.all = 'initial';
        applyBaseStyles(contextMenu);
        contextMenu.style.position = 'fixed';
        contextMenu.style.backgroundColor = 'white';
        contextMenu.style.border = '1px solid #ccc';
        contextMenu.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
        contextMenu.style.zIndex = Z_INDEX_CONTEXT_MENU;
        contextMenu.style.minWidth = '200px';

        populateToolMenu(contextMenu, winObj); // Use the same populate function

        addMenuItem(contextMenu, 'Move to Center', '', function() {
            if (winObj.isMinimized) winObj.restoreWindow();
            winObj.style.left = Math.max(0, (window.innerWidth - winObj.offsetWidth) / 2) + 'px';
            winObj.style.top = Math.max(0, (window.innerHeight - winObj.offsetHeight) / 2) + 'px';
            bringToFront(winObj);
        }, 'movetocenter');

        var snapActions = {
            'Snap Right': 'right',
            'Snap Left': 'left',
            'Snap Top-Right': 'topRight',
            'Snap Bottom-Right': 'bottomRight',
            'Snap Top-Left': 'topLeft',
            'Snap Bottom-Left': 'bottomLeft'
        };

        Object.keys(snapActions).forEach(function(label) {
            const currentZone = snapActions[label];
            addMenuItem(contextMenu, label, '', function() {
                if (winObj.isMinimized) winObj.restoreWindow();
                var minBarHeight = (getMinimizedBar(false) && getMinimizedBar(false).style.display !== 'none' ? getMinimizedBar(false).offsetHeight : 0);
                var vpHeight = 'calc(100vh - ' + minBarHeight + 'px)';
                var halfVpHeight = 'calc(50vh - ' + (minBarHeight / 2) + 'px)';

                if (!winObj.lastNonSnappedState && !winObj.isMaximized) { // isMaximized on winObj, not the local one
                    winObj.lastNonSnappedState = {
                        left: winObj.style.left, top: winObj.style.top,
                        width: winObj.style.width, height: winObj.style.height,
                        maximized: winObj.isMaximized
                    };
                }

                if (currentZone === 'left') {
                    winObj.style.left = '0px'; winObj.style.top = '0px';
                    winObj.style.width = '50vw'; winObj.style.height = vpHeight;
                } else if (currentZone === 'right') {
                    winObj.style.left = '50vw'; winObj.style.top = '0px';
                    winObj.style.width = '50vw'; winObj.style.height = vpHeight;
                } else if (currentZone === 'topLeft') {
                    winObj.style.left = '0px'; winObj.style.top = '0px';
                    winObj.style.width = '50vw'; winObj.style.height = halfVpHeight;
                } else if (currentZone === 'topRight') {
                    winObj.style.left = '50vw'; winObj.style.top = '0px';
                    winObj.style.width = '50vw'; winObj.style.height = halfVpHeight;
                } else if (currentZone === 'bottomLeft') {
                    winObj.style.left = '0px'; winObj.style.top = '50vh';
                    winObj.style.width = '50vw'; winObj.style.height = halfVpHeight;
                } else if (currentZone === 'bottomRight') {
                    winObj.style.left = '50vw'; winObj.style.top = '50vh';
                    winObj.style.width = '50vw'; winObj.style.height = halfVpHeight;
                }
                // After snapping, it's not maximized in the traditional sense
                winObj.isMaximized = false; // Directly set the property on winObj
                winObj.querySelector('button[title=Restore],button[title=Maximize]').innerHTML = '▢';
                winObj.querySelector('button[title=Restore],button[title=Maximize]').title = 'Maximize';
                winObj.querySelector('div[style*="cursor: nwse-resize"]').style.display = 'block'; // Show resize handle
                bringToFront(winObj);
            }, 'snap-' + currentZone);
        });


        document.body.appendChild(contextMenu);

        var menuRect = contextMenu.getBoundingClientRect();
        var parentRect = event.target.closest('div[id^=bmTabItem-]').getBoundingClientRect();
        var newLeft = event.clientX;
        var newTop = parentRect.bottom;

        if (newLeft + menuRect.width > window.innerWidth) newLeft = window.innerWidth - menuRect.width - 5;
        if (newTop + menuRect.height > window.innerHeight) newTop = parentRect.top - menuRect.height;
        if (newTop < 0) newTop = 5;
        if (newLeft < 0) newLeft = 5;

        contextMenu.style.left = newLeft + 'px';
        contextMenu.style.top = newTop + 'px';

        function closeContextMenu(eClick) {
            if (!contextMenu.contains(eClick.target)) {
                contextMenu.remove();
                document.removeEventListener('click', closeContextMenu, true);
            }
        }
        document.addEventListener('click', closeContextMenu, true); // Capture phase
    }


    function toggleMainUi() {
        var mainUi = document.getElementById(mainUiContainerId);
        var showUiBtn = document.getElementById(showUiButtonId);
        var minBar = getMinimizedBar(false); // Don't create if not exists

        if (mainUi) {
            if (mainUi.style.display === 'none') {
                mainUi.style.display = 'block';
                if (showUiBtn) showUiBtn.remove(); // Remove the "Show UI" button
            } else {
                mainUi.style.display = 'none';
                if (!showUiBtn) { // Create "Show UI" button if it doesn't exist
                    showUiBtn = document.createElement('button');
                    showUiBtn.id = showUiButtonId;
                    showUiBtn.style.all = 'initial';
                    applyButtonStyles(showUiBtn);
                    showUiBtn.textContent = 'UI';
                    showUiBtn.style.position = 'fixed';
                    if (uiButtonLastPosition) {
                        showUiBtn.style.left = uiButtonLastPosition.left;
                        showUiBtn.style.top = uiButtonLastPosition.top;
                    } else {
                        showUiBtn.style.bottom = '10px'; // Default position
                        showUiBtn.style.right = '10px';
                    }
                    showUiBtn.style.padding = '8px 12px';
                    showUiBtn.style.zIndex = Z_INDEX_SHOW_UI_BUTTON;
                    showUiBtn.style.userSelect = 'none';
                    showUiBtn.style.display = 'block'; // Ensure it's visible

                    var uiBtnIsDragging = false;
                    var uiBtnWasDragged = false;
                    var uiBtnOffsetX, uiBtnOffsetY;
                    var uiBtnInitialMouseX, uiBtnInitialMouseY;


                    showUiBtn.onmousedown = function(e) {
                        if (e.button !== 0) return; // Only left click
                        e.preventDefault();
                        uiBtnIsDragging = true;
                        uiBtnWasDragged = false; // Reset drag flag
                        uiBtnInitialMouseX = e.clientX;
                        uiBtnInitialMouseY = e.clientY;

                        var rect = showUiBtn.getBoundingClientRect();
                        // Ensure left/top are set for dragging if using right/bottom
                        if (showUiBtn.style.right || showUiBtn.style.bottom) {
                            showUiBtn.style.left = rect.left + 'px';
                            showUiBtn.style.top = rect.top + 'px';
                            showUiBtn.style.right = '';
                            showUiBtn.style.bottom = '';
                        } else if (!showUiBtn.style.left || !showUiBtn.style.top) {
                            // If no explicit left/top, set from rect
                            showUiBtn.style.left = rect.left + 'px';
                            showUiBtn.style.top = rect.top + 'px';
                        }


                        uiBtnOffsetX = e.clientX - parseFloat(showUiBtn.style.left);
                        uiBtnOffsetY = e.clientY - parseFloat(showUiBtn.style.top);
                        document.body.style.cursor = 'move'; // Indicate dragging

                        function uiBtnDragMouseMove(eMove) {
                            if (!uiBtnIsDragging) return;
                            if (!uiBtnWasDragged && (Math.abs(eMove.clientX - uiBtnInitialMouseX) > 5 || Math.abs(eMove.clientY - uiBtnInitialMouseY) > 5)) {
                                uiBtnWasDragged = true; // Mark as dragged if moved significantly
                            }

                            var newX = eMove.clientX - uiBtnOffsetX;
                            var newY = eMove.clientY - uiBtnOffsetY;
                            var btnWidth = showUiBtn.offsetWidth;
                            var btnHeight = showUiBtn.offsetHeight;

                            // Keep button within viewport
                            newX = Math.max(0, Math.min(newX, window.innerWidth - btnWidth));
                            newY = Math.max(0, Math.min(newY, window.innerHeight - btnHeight));

                            showUiBtn.style.left = newX + 'px';
                            showUiBtn.style.top = newY + 'px';
                        }

                        function uiBtnDragMouseUp(eUp) {
                            if (!uiBtnIsDragging) return;
                            uiBtnIsDragging = false;
                            document.removeEventListener('mousemove', uiBtnDragMouseMove, true);
                            document.removeEventListener('mouseup', uiBtnDragMouseUp, true);
                            document.body.style.cursor = ''; // Reset cursor

                            if (uiBtnWasDragged) {
                                eUp.stopPropagation(); // Prevent click if dragged
                                uiButtonLastPosition = {
                                    left: showUiBtn.style.left,
                                    top: showUiBtn.style.top
                                };
                            }
                        }

                        document.addEventListener('mousemove', uiBtnDragMouseMove, true);
                        document.addEventListener('mouseup', uiBtnDragMouseUp, true);
                    };

                    showUiBtn.onclick = function(e) {
                        if (uiBtnWasDragged) { // If it was dragged, don't toggle UI, just reset flag
                            uiBtnWasDragged = false;
                            return;
                        }
                        toggleMainUi();
                    };
                    document.body.appendChild(showUiBtn);
                }
            }
        }
        updateTabBar(); // Update tab bar visibility based on new UI state
    }

    function handleMainPageLinkClick(event) {
        if (!linkThroughEnabled) return;

        var targetLink = event.target.closest('a');
        if (targetLink && targetLink.href && !targetLink.href.startsWith('javascript:') && targetLink.target !== '_blank') {
            var href = targetLink.href;

            // If it's a same-page hash link, let the browser handle it
            if (href.startsWith(window.location.origin + window.location.pathname) && href.includes('#') && window.location.href.split('#')[0] === href.split('#')[0]) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();

            getOriginalPageFavicon(); // Store original favicon if not already stored
            setBrowserFavicon(LOADING_ICON_SRC); // Show loading icon in browser tab

            // Detach and store BM elements
            var bmElementsFragment = document.createDocumentFragment();
            [mainUiContainerId, minimizedBarId, showUiButtonId, SNAP_PREVIEW_ID].forEach(id => {
                var el = document.getElementById(id);
                if (el && el.parentNode) el.parentNode.removeChild(el);
                if (el) bmElementsFragment.appendChild(el);
            });
            Object.values(activeWindows).forEach(win => {
                if (win && win.parentNode) win.parentNode.removeChild(win);
                if (win) bmElementsFragment.appendChild(win);
            });


            fetch(href)
                .then(response => {
                    if (!response.ok) throw new Error('Network response was not ok ' + response.statusText + ' for ' + href);
                    return response.text();
                })
                .then(html => {
                    var parser = new DOMParser();
                    var newDoc = parser.parseFromString(html, 'text/html');

                    // Preserve our special favicon link if it exists
                    var currentProtectedFaviconLink = document.getElementById('bmBrowserFavicon');
                    if (currentProtectedFaviconLink && currentProtectedFaviconLink.parentNode) {
                        currentProtectedFaviconLink.parentNode.removeChild(currentProtectedFaviconLink);
                    }


                    // Clear head, then repopulate, preserving our favicon
                    document.head.innerHTML = '';
                    if (currentProtectedFaviconLink) document.head.appendChild(currentProtectedFaviconLink); // Add it back first

                    Array.from(newDoc.head.children).forEach(child => {
                        if (child.tagName.toLowerCase() === 'title') {
                            document.title = child.textContent || generateTitleForWindow(href, false, href);
                        } else if (!(child.tagName.toLowerCase() === 'link' && (child.getAttribute('rel') === 'icon' || child.getAttribute('rel') === 'shortcut icon')) && child.id !== 'bmBrowserFavicon') {
                            // Don't copy original favicons or our special one if it somehow got into newDoc.head
                            document.head.appendChild(child.cloneNode(true));
                        }
                    });


                    document.body.innerHTML = newDoc.body.innerHTML; // Replace body content
                    history.replaceState({ path: href, bmPage: true }, document.title, href); // Update URL

                    // Set favicon for the new page
                    var newPageFaviconTag = newDoc.querySelector('link[rel="icon"],link[rel="shortcut icon"]');
                    if (newPageFaviconTag && newPageFaviconTag.href) {
                        setBrowserFavicon(new URL(newPageFaviconTag.href, href).href); // Resolve relative URLs
                    } else {
                        setBrowserFavicon('https://www.google.com/s2/favicons?sz=16&domain_url=' + encodeURIComponent(href)); // Fallback
                    }


                    // Re-attach BM elements
                    document.body.appendChild(bmElementsFragment);


                    // Script execution logic (simplified for brevity in this example)
                    var scriptsToExecute = Array.from(newDoc.querySelectorAll('script'));
                    var docWriteBuffer = '';
                    var originalDocWrite = document.write;
                    var originalDocWriteln = document.writeln;

                    document.write = function() { for (var i = 0; i < arguments.length; i++) docWriteBuffer += arguments[i]; };
                    document.writeln = function() { for (var i = 0; i < arguments.length; i++) docWriteBuffer += arguments[i]; docWriteBuffer += '\n'; };


                    function executeScriptsSequentially(index) {
                        if (index >= scriptsToExecute.length) {
                            // Restore document.write and process buffer
                            document.write = originalDocWrite;
                            document.writeln = originalDocWriteln;
                            if (docWriteBuffer.length > 0) {
                                var tempDiv = document.createElement('div');
                                tempDiv.innerHTML = docWriteBuffer;
                                while (tempDiv.firstChild) document.body.appendChild(tempDiv.firstChild); // Append at end of body
                                docWriteBuffer = '';
                            }

                            // Dispatch DOMContentLoaded and load events
                            try { window.dispatchEvent(new Event('DOMContentLoaded', { bubbles: true, cancelable: true })); }
                            catch(e) { console.warn("Error dispatching DOMContentLoaded:", e); }
                            try { window.dispatchEvent(new Event('load', { bubbles: true, cancelable: true })); }
                            catch(e) { console.warn("Error dispatching load event:", e); }


                            // Re-attach global listeners for the new page content
                            if (!document.bmAuxClickListenerAttachedMain) {
                                document.addEventListener('auxclick', handleAuxClick, true);
                                document.bmAuxClickListenerAttachedMain = true;
                            }
                            if (!document.bmMainPageClickListenerAttached) {
                                document.addEventListener('click', handleMainPageLinkClick, true);
                                document.bmMainPageClickListenerAttached = true;
                            }
                            return;
                        }

                        var scriptTag = scriptsToExecute[index];
                        var newScript = document.createElement('script');
                        Array.from(scriptTag.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
                        newScript.textContent = scriptTag.textContent; // For inline scripts

                        // Determine where to insert the script (approximating original position)
                        var insertionPoint = scriptTag.parentNode && document.contains(scriptTag.parentNode) ? scriptTag.parentNode : document.body;
                        if (scriptTag.parentNode && scriptTag.parentNode.nodeName.toLowerCase() === 'head') insertionPoint = document.head;


                        if (newScript.src) { // External script
                            newScript.onload = function() {
                                if (docWriteBuffer.length > 0) { // Process document.write buffer
                                    var tempDiv = document.createElement('div');
                                    tempDiv.innerHTML = docWriteBuffer;
                                    while(tempDiv.firstChild) insertionPoint.insertBefore(tempDiv.firstChild, newScript.nextSibling);
                                    docWriteBuffer = '';
                                }
                                executeScriptsSequentially(index + 1);
                            };
                            newScript.onerror = function() {
                                console.error('Failed to load script:', newScript.src);
                                executeScriptsSequentially(index + 1); // Continue with next script
                            };
                            insertionPoint.appendChild(newScript);
                        } else { // Inline script
                            insertionPoint.appendChild(newScript); // Execute by appending
                             if (docWriteBuffer.length > 0) { // Process document.write buffer
                                var tempDiv = document.createElement('div');
                                tempDiv.innerHTML = docWriteBuffer;
                                while(tempDiv.firstChild) insertionPoint.insertBefore(tempDiv.firstChild, newScript.nextSibling);
                                docWriteBuffer = '';
                            }
                            executeScriptsSequentially(index + 1); // Sync execution for inline
                        }
                    }
                    executeScriptsSequentially(0);

                })
                .catch(error => {
                    console.error('Link Through failed:', error);
                    if(originalPageFavicon) setBrowserFavicon(originalPageFavicon); else setBrowserFavicon(''); // Restore original or clear
                    document.body.appendChild(bmElementsFragment); // Re-attach BM elements on failure
                    alert('Link Through failed: ' + error.message + '. Check console for details.');
                });
            return false; // Prevent default link navigation
        }
    }


    (function initMainUi() {
        // Attach global listeners if not already present
        if (!document.bmAuxClickListenerAttachedMain) {
            document.addEventListener('auxclick', handleAuxClick, true);
            document.bmAuxClickListenerAttachedMain = true;
        }
        if (!document.bmMainPageClickListenerAttached) {
             document.addEventListener('click', handleMainPageLinkClick, true);
             document.bmMainPageClickListenerAttached = true;
        }


        var mainUi = document.getElementById(mainUiContainerId);
        if (mainUi) { // If UI exists, toggle it (likely means bookmarklet was run again)
            toggleMainUi();
            return;
        }

        mainUi = document.createElement('div');
        mainUi.id = mainUiContainerId;
        mainUi.style.all = 'initial';
        applyBaseStyles(mainUi);
        mainUi.style.position = 'fixed';
        mainUi.style.top = '0';
        mainUi.style.left = '0';
        mainUi.style.width = '100%';
        mainUi.style.padding = '10px';
        mainUi.style.backgroundColor = 'rgba(240,240,240,0.95)';
        mainUi.style.zIndex = Z_INDEX_MAIN_UI;
        mainUi.style.borderBottom = '1px solid #ccc';
        mainUi.style.textAlign = 'center';
        mainUi.style.boxSizing = 'border-box';
        mainUi.style.display = 'block'; // Initially visible

        var input = document.createElement('input');
        input.style.all = 'initial';
        applyInputStyles(input);
        input.type = 'text';
        input.placeholder = 'URL or Search';
        input.style.padding = '8px';
        input.style.marginRight = '5px';
        input.style.minWidth = '300px';
        input.style.boxSizing = 'border-box';

        var openBtn = document.createElement('button');
        openBtn.style.all = 'initial';
        applyButtonStyles(openBtn);
        openBtn.textContent = 'Open';
        openBtn.style.padding = '8px 12px';
        openBtn.style.marginRight = '5px';

        var searchEngineSelect = document.createElement('select');
        searchEngineSelect.style.all = 'initial';
        applySelectStyles(searchEngineSelect);
        searchEngineSelect.style.marginRight = '10px';
        Object.keys(searchEngines).forEach(function(name) {
            var option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            if (name === currentSearchEngine) option.selected = true;
            searchEngineSelect.appendChild(option);
        });
        searchEngineSelect.onchange = function() {
            currentSearchEngine = this.value;
            // Update placeholder in existing window search bars
            Object.values(activeWindows).forEach(function(win) {
                if (win.isSearchBarVisible) {
                    var winSearchInput = win.querySelector('.bm-window-search-bar input[type=text]');
                    if(winSearchInput) winSearchInput.placeholder = 'URL or Search (' + currentSearchEngine + ')';
                }
            });
        };

        var closeAllBtn = document.createElement('button');
        closeAllBtn.style.all = 'initial';
        applyButtonStyles(closeAllBtn);
        closeAllBtn.textContent = 'Close All';
        closeAllBtn.style.padding = '8px 12px';
        closeAllBtn.style.marginRight = '10px';

        var toggleLinkThroughBtn = document.createElement('button');
        toggleLinkThroughBtn.style.all = 'initial';
        applyButtonStyles(toggleLinkThroughBtn);
        toggleLinkThroughBtn.textContent = linkThroughEnabled ? 'LinkThrough:ON' : 'LinkThrough:OFF';
        toggleLinkThroughBtn.title = 'Toggle main page link handling';
        toggleLinkThroughBtn.style.padding = '8px 12px';
        toggleLinkThroughBtn.style.marginRight = '10px';
        toggleLinkThroughBtn.onclick = function() {
            linkThroughEnabled = !linkThroughEnabled;
            this.textContent = linkThroughEnabled ? 'LinkThrough:ON' : 'LinkThrough:OFF';
        };

        var toggleTabBarVisibilityBtn = document.createElement('button');
        toggleTabBarVisibilityBtn.style.all = 'initial';
        applyButtonStyles(toggleTabBarVisibilityBtn);
        toggleTabBarVisibilityBtn.textContent = showTabBarWhenUiHidden ? 'TabBar:Vis' : 'TabBar:Hid';
        toggleTabBarVisibilityBtn.title = 'Toggle tab bar visibility when UI is hidden';
        toggleTabBarVisibilityBtn.style.padding = '8px 12px';
        toggleTabBarVisibilityBtn.style.marginRight = '10px';
        toggleTabBarVisibilityBtn.onclick = function() {
            showTabBarWhenUiHidden = !showTabBarWhenUiHidden;
            this.textContent = showTabBarWhenUiHidden ? 'TabBar:Vis' : 'TabBar:Hid';
            updateTabBar();
        };

        var toggleUiBtn = document.createElement('button');
        toggleUiBtn.style.all = 'initial';
        applyButtonStyles(toggleUiBtn);
        toggleUiBtn.textContent = 'Hide UI';
        toggleUiBtn.style.padding = '8px 12px';

        openBtn.onclick = function() {
            var val = input.value.trim();
            if (val) {
                var isUrl = isValidURL(val) || val.startsWith('http://') || val.startsWith('https://') || (val.includes('.') && !val.includes(' '));
                if (isUrl && !(new RegExp('^https?:\/\/', 'i')).test(val)) { // Add http if missing for URLs
                    val = 'http://' + val;
                }
                createWindowInstance(val, isUrl);
                input.value = ''; // Clear input
            }
        };
        input.onkeyup = function(e) {
            if (e.key === 'Enter') openBtn.click();
        };

        toggleUiBtn.onclick = toggleMainUi;

        closeAllBtn.onclick = function() {
            for (var id in activeWindows) {
                if (activeWindows[id]) {
                    var winToRemove = activeWindows[id];
                    if (winToRemove.iframeSrcObserver) winToRemove.iframeSrcObserver.disconnect();
                    winToRemove.remove();
                    if (winToRemove.toolMenu) winToRemove.toolMenu.remove();
                }
            }
            activeWindows = {};
            var showUiBtn = document.getElementById(showUiButtonId);
            if (showUiBtn) showUiBtn.remove();
            var minBar = getMinimizedBar(false);
            if (minBar) minBar.remove();
            var snapPreview = document.getElementById(SNAP_PREVIEW_ID);
            if (snapPreview) snapPreview.remove();
            updateTabBar(); // Clears the bar display
        };


        mainUi.appendChild(input);
        mainUi.appendChild(openBtn);
        mainUi.appendChild(searchEngineSelect);
        mainUi.appendChild(closeAllBtn);
        mainUi.appendChild(toggleLinkThroughBtn);
        mainUi.appendChild(toggleTabBarVisibilityBtn);
        mainUi.appendChild(toggleUiBtn);
        document.body.appendChild(mainUi);
        input.focus();

        // If a "Show UI" button exists from a previous hidden state, remove it as UI is now shown.
        var existingShowUiBtn = document.getElementById(showUiButtonId);
        if (existingShowUiBtn) existingShowUiBtn.remove();

        updateTabBar(); // Initialize or update the tab bar
    })();
})();
