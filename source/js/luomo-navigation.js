/* Butterfly 4.13 navigation enhancements. */
(function () {
  'use strict';

  if (window.luomoNavigationReady) return;
  window.luomoNavigationReady = true;

  var searchReturnFocus = null;
  var sidebarReturnFocus = null;

  function setExpanded(toggle, expanded) {
    toggle.setAttribute('aria-expanded', String(expanded));
    toggle.parentElement.classList.toggle('is-open', expanded);
    if (toggle.closest('#sidebar-menus')) {
      toggle.classList.toggle('hide', !expanded);
    }
  }

  function closeDesktopMenus(except) {
    document.querySelectorAll('#nav [data-nav-toggle]').forEach(function (toggle) {
      if (toggle !== except) setExpanded(toggle, false);
    });
  }

  function isVisible(element) {
    return element && element.getClientRects().length > 0 &&
      window.getComputedStyle(element).visibility !== 'hidden';
  }

  function focusableWithin(container) {
    return Array.from(container.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), [tabindex="0"]'))
      .filter(isVisible);
  }

  function trapFocus(event, container) {
    var targets = focusableWithin(container);
    if (!targets.length) return;
    var first = targets[0];
    var last = targets[targets.length - 1];
    if (event.shiftKey && (document.activeElement === first || !container.contains(document.activeElement))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (document.activeElement === last || !container.contains(document.activeElement))) {
      event.preventDefault();
      first.focus();
    }
  }

  function initMenus() {
    document.querySelectorAll('[data-nav-menu]').forEach(function (item) {
      if (item.dataset.navBound) return;
      item.dataset.navBound = 'true';
      var toggle = item.querySelector('[data-nav-toggle]');
      var isDesktop = Boolean(item.closest('#nav'));
      setExpanded(toggle, !isDesktop && !toggle.classList.contains('hide'));
      if (!isDesktop) return;

      item.addEventListener('pointerenter', function (event) {
        if (event.pointerType === 'touch') return;
        closeDesktopMenus(toggle);
        setExpanded(toggle, true);
      });
      item.addEventListener('pointerleave', function () {
        if (!item.contains(document.activeElement)) setExpanded(toggle, false);
      });
      item.addEventListener('focusout', function (event) {
        if (!item.contains(event.relatedTarget)) setExpanded(toggle, false);
      });
    });
  }

  function initSidebar() {
    var sidebar = document.getElementById('sidebar-menus');
    if (!sidebar || sidebar.dataset.accessibilityBound) return;
    sidebar.dataset.accessibilityBound = 'true';
    sidebar.setAttribute('aria-label', '导航菜单');
    var wasOpen = false;
    function syncSidebar() {
      var open = sidebar.classList.contains('open');
      var toggle = document.querySelector('#toggle-menu button');
      sidebar.inert = !open;
      sidebar.setAttribute('aria-hidden', String(!open));
      if (toggle) {
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? '关闭导航菜单' : '打开导航菜单');
      }
      if (open && !wasOpen) {
        sidebarReturnFocus = toggle;
        var first = focusableWithin(sidebar)[0];
        if (first) first.focus();
      } else if (!open && wasOpen && sidebarReturnFocus && sidebarReturnFocus.isConnected) {
        sidebarReturnFocus.focus();
      }
      wasOpen = open;
    }
    new MutationObserver(syncSidebar).observe(sidebar, { attributes: true, attributeFilter: ['class'] });
    syncSidebar();
  }

  function initSearch() {
    var dialog = document.querySelector('#local-search .search-dialog');
    if (!dialog || dialog.dataset.accessibilityBound) return;
    dialog.dataset.accessibilityBound = 'true';
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-label', '搜索文章');
    var input = dialog.querySelector('input');
    if (input) input.setAttribute('aria-label', '搜索关键词');
    var close = dialog.querySelector('.search-close-button');
    if (close) close.setAttribute('aria-label', '关闭搜索');
    var wasVisible = false;
    function syncSearch() {
      var visible = isVisible(dialog);
      dialog.setAttribute('aria-hidden', String(!visible));
      if (visible && !wasVisible && !dialog.contains(document.activeElement)) {
        searchReturnFocus = document.activeElement;
      } else if (!visible && wasVisible && searchReturnFocus && searchReturnFocus.isConnected) {
        searchReturnFocus.focus();
      }
      wasVisible = visible;
    }
    new MutationObserver(syncSearch).observe(dialog, { attributes: true, attributeFilter: ['style'] });
    syncSearch();
  }

  function init() {
    initMenus();
    initSidebar();
    initSearch();
  }

  // Capture group clicks before the legacy sidebar delegate, which also
  // toggles .hide. Native buttons provide Enter and Space activation.
  document.addEventListener('click', function (event) {
    // Leaving the legacy player through PJAX can run stale audio callbacks.
    // Keep native navigation for ordinary links to this site on its music page.
    if (location.pathname === '/music/') {
      var link = event.target.closest('a[href]');
      var href = link && link.getAttribute('href').trim();
      if (link && href && !link.closest('.aplayer') &&
          !href.startsWith('#') && !/^javascript:/i.test(href) &&
          !event.defaultPrevented && event.button === 0 &&
          !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey &&
          (!link.target || link.target === '_self') && !link.hasAttribute('download')) {
        try {
          var destination = new URL(href, location.href);
          var isPageAnchor = destination.pathname === location.pathname &&
            destination.search === location.search && destination.hash;
          if (destination.origin === location.origin &&
              /^https?:$/.test(destination.protocol) && !isPageAnchor) {
            event.stopPropagation();
            return;
          }
        } catch (error) {
          // Invalid links keep their existing browser behavior.
        }
      }
    }
    var toggle = event.target.closest('[data-nav-toggle]');
    if (toggle) {
      event.preventDefault();
      event.stopPropagation();
      if (toggle.closest('#nav')) closeDesktopMenus(toggle);
      setExpanded(toggle, toggle.getAttribute('aria-expanded') !== 'true');
      return;
    }
    if (!event.target.closest('#nav [data-nav-menu]')) closeDesktopMenus();
  }, true);

  document.addEventListener('keydown', function (event) {
    var sidebar = document.getElementById('sidebar-menus');
    var searchDialog = document.querySelector('#local-search .search-dialog');
    if (event.key === 'Tab') {
      if (isVisible(searchDialog)) trapFocus(event, searchDialog);
      else if (sidebar && sidebar.classList.contains('open')) trapFocus(event, sidebar);
      return;
    }
    if (event.key === 'Escape') {
      var expanded = document.querySelector('#nav [data-nav-toggle][aria-expanded="true"]');
      if (expanded) {
        event.preventDefault();
        closeDesktopMenus();
        expanded.focus();
      }
      if (sidebar && sidebar.classList.contains('open')) {
        event.preventDefault();
        document.getElementById('menu-mask').click();
      }
      return;
    }
    var toggle = event.target.closest('[data-nav-toggle]');
    if (toggle && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
      event.preventDefault();
      if (toggle.closest('#nav')) closeDesktopMenus(toggle);
      setExpanded(toggle, true);
      var links = toggle.parentElement.querySelectorAll('.menus_item_child a');
      var target = event.key === 'ArrowUp' ? links[links.length - 1] : links[0];
      if (target) target.focus();
    }
  });

  // The theme ignores input before its asynchronous database fetch finishes.
  // Replay that input through the existing search implementation once ready.
  window.addEventListener('search:loaded', function () {
    // 4.13: #local-search-input; 5.x: .local-search-input
    var input = document.querySelector('#local-search-input input, #local-search .local-search-input input');
    if (input && input.value.trim()) input.dispatchEvent(new Event('input', { bubbles: true }));
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
  document.addEventListener('pjax:complete', init);
})();
