'use strict';
/* global Applications, evt */

(function(exports) {
  var DEFAULT_ICON_SIZE = 32;
  var MOVESTART_THRESHOLD = 20;
  var MOVEPAGE_THRESHOLD = 80;

  /**
   * WidgetListPage maintains icons within a single page of {@link WidgetList}.
   *
   * @class WidgetListPage
   * @access private
   * @param {DOMElement} parent The parent node of this page.
   * @param {Integer} maxIconCount The max number of the icons in this page. It
   *                               should be greater then 0.
   */
  function WidgetListPage(parent, maxIconCount) {
    if (!parent) {
      throw new Error('WidgetListPage requires a parent object.');
    }

    this._dom = document.createElement('div');
    this._dom.classList.add('widget-list-page');
    this._parent = parent;
    this._parent.appendChild(this._dom);
    this._maxIconCount = Math.max(maxIconCount, 1);
    this._iconCount = 0;
  }

  WidgetListPage.prototype = {
    /**
     * The sub-function for updating the name and image of the icon element.
     *
     * @access private
     * @param {DOMElement} icon The specified icon element.
     * @param {WidgetDefinition} widget An entry data got from {@link Applications}.
     * @memberof WidgetListPage.prototype
     */
    _updateIconNameAndIcon: function alpUpdateIconNameAndIcon(icon, widget) {
      var img = icon.firstChild;
      var text = icon.lastChild;

      img.src = Applications.DEFAULT_ICON_URL;
      text.innerHTML = icon.dataset.name = widget.name;

      Applications.getWidgetScreenShot(
        widget.manifestURL,
        widget.entryPoint,
        widget.id,
        function(blob) {
          if (!blob) {
            return;
          }

          var url = window.URL.createObjectURL(blob);
          img.addEventListener('load', function iconImageOnLoad() {
            img.removeEventListener('load', iconImageOnLoad);
            window.URL.revokeObjectURL(url);
          });
          img.src = url;
        }
      );
    },

    /**
     * Remove this page from {@link WidgetList}.
     *
     * @memberof WidgetListPage.prototype
     */
    remove: function alpRemove() {
      this._parent.removeChild(this._dom);
    },

    /**
     * Create an icon element and append to the page.
     *
     * @param {WidgetDefinition} widget A widget data got from
     *                                  {@link Applications}.
     * @param {Function} tapHandler A handler function for the "click" event of
     *                              the icons.
     * @return {DOMElement} The DOM element of the new icon or "null" if the
     *                      page is full.
     * @memberof WidgetListPage.prototype
     */
    addIcon: function alpAddIcon(widget, tapHandler) {
      if (this.isFull()) {
        return null;
      }

      var img = new Image();
      img.className = 'icon';

      var text = document.createElement('span');

      var icon = document.createElement('div');
      icon.className = 'widget-list-icon';
      icon.dataset.manifestURL = widget.manifestURL;
      icon.dataset.entryPoint = widget.entryPoint;
      icon.dataset.widgetId = widget.id;
      icon.dataset.name = widget.name;
      icon.appendChild(img);
      icon.appendChild(text);
      if (tapHandler) {
        icon.addEventListener('click', tapHandler);
      }

      this.insertIconElement(icon);
      this._updateIconNameAndIcon(icon, widget);

      return icon;
    },

    /**
     * Append an existing icon element to the page.
     *
     * @param {DOMElement} iconElement The icon element.
     * @memberof WidgetListPage.prototype
     */
    insertIconElement: function alpInsertIconElement(iconElement) {
      this._dom.appendChild(iconElement);
      this._iconCount++;
    },

    /**
     * Remove the specified icon by index.
     *
     * @param {Integer} index The icon index.
     * @return {DOMElement} The icon element which has been deleted.
     * @memberof WidgetListPage.prototype
     */
    removeIcon: function alpRemoveIcon(index) {
      var elem = this.getIconElement(index);
      if (elem) {
        this._dom.removeChild(elem);
        this._iconCount--;
      }
      return elem;
    },

    /**
     * Find the specified icon and return its index.
     *
     * @param {WidgetDefinition} widget A widget data got from
     *                                  {@link Applications}.
     * @return {Integer} The index number of the found icon or -1 if not found.
     * @memberof WidgetListPage.prototype
     */
    findIcon: function alpFindIcon(widget) {
      var icons = this._dom.childNodes;

      for (var i = 0; i < icons.length; i++) {
        if (icons[i].dataset.manifestURL == widget.manifestURL &&
            icons[i].dataset.entryPoint === widget.entryPoint &&
            icons[i].dataset.widgetId == widget.id) {
          return i;
        }
      }

      return -1;
    },

    /**
     * Update the name and image of the specified icon.
     *
     * @param {WidgetDefinition} widget A widget data got from
     *                                  {@link Applications}.
     * @return {Boolean} true if succeed or false if the icon doesn't exist.
     * @memberof WidgetListPage.prototype
     */
    updateIcon: function alpUpdateIcon(widget) {
      var index = this.findIcon(widget);
      if (index == -1) {
        return false;
      }
      this._updateIconNameAndIcon(this.getIconElement(index), widget);
      return true;
    },

    /**
     * Determine whether this page is full or not.
     *
     * @return {Boolean} true if the number of icons is equal to maxIconCount.
     * @memberof WidgetListPage.prototype
     */
    isFull: function alpIsFull() {
      return (this._iconCount == this._maxIconCount);
    },

    /**
     * Determine whether this page is empty or not.
     *
     * @return {Boolean} true if there is no icon in this page.
     * @memberof WidgetListPage.prototype
     */
    isEmpty: function alpIsEmpty() {
      return (this._iconCount === 0);
    },

    /**
     * Get the DOM element of the specified icon by index.
     *
     * @param {Integer} index The icon index.
     * @return {DOMElement} The icon element or "null" if the index is invalid.
     * @memberof WidgetListPage.prototype
     */
    getIconElement: function alpGetIconElement(index) {
      if (index < 0 || index >= this._iconCount) {
        return null;
      }
      return this._dom.childNodes[index];
    },

    /**
     * Get the total number of the icons in this page.
     *
     * @return {Integer} The total number of the icons in this page.
     * @memberof WidgetListPage.prototype
     */
    getIconCount: function alpGetIconCount() {
      return this._iconCount;
    }
  };

  /**
   * WidgetList is a dialog contains icons for users to choose and launch an app.
   *
   * @class WidgetList
   * @param {Object} options
   *        To generate elements, WidgetList needs three dom containers as
   *        follows:
   *
   * - widgetList: The main element which should contain the container and
   *   pageIndicator below. It's used to show/hide widgetList.
   * - container: It's used to contain pages and icons.
   * - pageIndicator: The container of page indicators which is used to indicate
   *   current page.
   */
  function WidgetList(options) {
    if (!options || !options.widgetList || !options.container ||
        !options.pageIndicator) {
      throw new Error('WidgetList requires valid options.');
    }

    this._widgetList = options.widgetList;
    this._container = options.container;
    this._pageIndicator = options.pageIndicator;

    this._containerDimensions = {};
    this._iconDimensions = {};
    this._pagingSize = {};

    this._currentPage = 0;
    this._pages = [];

    this._unbindAppEventHandler = null;
    this._iconTapHandler = null;

    this._touchStarted = false;
    this._touchData = null;

    this._calcPagingSize();
  }

  WidgetList.prototype = evt({
    /**
     * Calculate the max number of icons in one page based on its CSS style.
     *
     * @access private
     * @memberof WidgetList.prototype
     */
    _calcPagingSize: function widgetListCalcPagingSize() {
      this._widgetList.hidden = false;
      this._containerDimensions.width = this._container.clientWidth;
      this._containerDimensions.height = this._container.clientHeight;
      this._widgetList.hidden = true;

      var icon = document.createElement('div');
      icon.className = 'widget-list-icon';
      this._container.appendChild(icon);

      var icon_computed_style = window.getComputedStyle(icon);

      this._iconDimensions.width =
        parseInt(icon_computed_style.getPropertyValue('width'), 10) +
        parseInt(icon_computed_style.getPropertyValue('margin-left'), 10) +
        parseInt(icon_computed_style.getPropertyValue('margin-right'), 10);
      this._iconDimensions.height =
        parseInt(icon_computed_style.getPropertyValue('height'), 10) +
        parseInt(icon_computed_style.getPropertyValue('margin-top'), 10) +
        parseInt(icon_computed_style.getPropertyValue('margin-bottom'), 10);

      this._container.removeChild(icon);

      this._pagingSize.numIconsPerRow = Math.floor(
        this._containerDimensions.width / this._iconDimensions.width);

      this._pagingSize.numIconsPerCol = Math.floor(
        this._containerDimensions.height / this._iconDimensions.height);
    },
    /**
     * Dispatch iconclient event.
     *
     * The "iconclick" event will be fired before launch. Use "preventDefault"
     * if you don't want to launch this app.
     *
     * @access private
     * @param {DOMElement} icon The icon element.
     * @memberof AppList.prototype
     */
    _dispatchClickEvent: function widgetListDispatchClickEvent(icon) {
      var cancelled = false;

      var data = {
        manifestURL: icon.dataset.manifestURL,
        entryPoint: icon.dataset.entryPoint,
        id: icon.dataset.widgetId,
        name: icon.dataset.name,
        preventDefault: function() {
          cancelled = true;
        }
      };

      this.fire('iconclick', data);
    },
    /**
     * The handler for the app "install" event from {@link Applications}.
     *
     * @access private
     * @param {Array} entries An array contains {@link AppEntryPoint}.
     * @memberof WidgetList.prototype
     */
    _handleAppInstall: function widgetListHandleAppInstall(entries) {
      var page;
      if (!this._pages.length) {
        page = this._createPage();
      } else {
        page = this._pages[this._pages.length - 1];
      }

      var self = this;
      entries.forEach(function(entry) {
        var widgets = Applications.getWidgetEntries(entry.manifestURL,
                                                    entry.entryPoint);
        widgets.forEach(function(widget) {
          if (page.isFull()) {
            page = self._createPage();
          }
          page.addIcon(widget, self._iconTapHandler);
        });
      });
    },

    /**
     * The handler for the app "update" event from {@link Applications}.
     *
     * @access private
     * @param {Array} entries An array contains {@link AppEntryPoint}.
     * @memberof WidgetList.prototype
     */
    _handleAppUpdate: function widgetListHandleAppUpdate(entries) {
      var pages = this._pages;
      var page_count = pages.length;

      entries.forEach(function(entry) {
        var widgets = Applications.getWidgetEntries(entry.manifestURL,
                                                    entry.entryPoint);
        widgets.forEach(function(widget) {
          for (var i = 0; i < page_count; i++) {
            if (pages[i].updateIcon(widget)) {
              break;
            }
          }
        });
      });
    },

    /**
     * The handler for the app "uninstall" event from {@link Applications}.
     *
     * @access private
     * @param {Array} entries An array contains {@link AppEntryPoint}.
     * @memberof WidgetList.prototype
     */
    _handleAppUninstall: function widgetListHandleAppUninstall(entries) {
      var self = this;
      function updateWidgetIcon(widget) {
        var pages = self._pages;
        var page_count = pages.length;
        var page_index;
        var found = -1;

        for (page_index = 0; page_index < page_count; page_index++) {
          var index = pages[page_index].findIcon(widget);
          if (index != -1) {
            found = index;
            break;
          }
        }

        if (found != -1) {
          var previousIcon = null;

          if (found > 0) {
            previousIcon = pages[page_index].getIconElement(found - 1);
          } else if (found < pages[page_index].getIconCount() - 1) {
            previousIcon = pages[page_index].getIconElement(found + 1);
          } else if (page_index > 0) {
            previousIcon = pages[page_index - 1]
              .getIconElement(pages[page_index - 1].getIconCount() - 1);
          }

          for (var i = page_index + 1; i < page_count; i++) {
            var icon = pages[i].removeIcon(0);
            pages[i - 1].insertIconElement(icon);
          }

          self._reducePage();
        }
      }
      entries.forEach(function(entry) {
        var widgets = Applications.getWidgetEntries(entry.manifestURL,
                                                    entry.entryPoint);
        widgets.forEach(updateWidgetIcon);
      });
    },

    /**
     * Create an {@link WidgetListPage} and append to the page list.
     *
     * @access private
     * @return {WidgetListPage} The new page object.
     * @memberof WidgetList.prototype
     */
    _createPage: function widgetListCreatePage() {
      this._pages.push(new WidgetListPage(
        this._container,
        this._pagingSize.numIconsPerRow * this._pagingSize.numIconsPerCol
      ));

      var item = document.createElement('span');
      item.classList.add('widget-list-page-indicator-item');
      item.innerHTML = '*';

      this._pageIndicator.appendChild(item);

      return this._pages[this._pages.length - 1];
    },

    /**
     * Remove all empty pages from the page list.
     *
     * @access private
     * @memberof WidgetList.prototype
     */
    _reducePage: function widgetListReducePage() {
      while (this._pages.length) {
        var last_page = this._pages[this._pages.length - 1];
        if (!last_page.isEmpty()) {
          break;
        }

        this._pages.pop();
        last_page.remove();
        this._pageIndicator.removeChild(this._pageIndicator.lastChild);
      }

      if (this._currentPage >= this._pages.length) {
        this.setPage(this._pages.length - 1);
      }
    },

    /**
     * The handler for "touchstart" event.
     *
     * @access private
     * @param {DOMEvent} evt The DOM event object.
     * @memberof WidgetList.prototype
     */
    _handleTouchStart: function widgetListHandleTouchStart(evt) {
      var touches = evt.touches;
      if (touches.length != 1) {
        return;
      }

      this._touchStarted = true;
      this._touchData = {
        startMove: false,
        x: touches[0].pageX,
        y: touches[0].pageY,
        pageLeft: -1 * this._currentPage * this._container.offsetWidth,
        oldTransition: this._container.style.transition
      };
      this._container.style.transition = 'none';
    },

    /**
     * The handler for "touchmove" event.
     *
     * @access private
     * @param {DOMEvent} evt The DOM event object.
     * @memberof WidgetList.prototype
     */
    _handleTouchMove: function widgetListHandleTouchMove(evt) {
      if (!this._touchStarted) {
        return;
      }

      var touches = evt.touches;
      if (touches.length != 1) {
        this._handleTouchEnd(evt);
        return;
      }

      var diffX = touches[0].pageX - this._touchData.x;

      // disabling spring effect duo to patent issue
      if (this._currentPage === 0 && diffX > 0) {
        this._touchData.x = touches[0].pageX;
        diffX = 0;
      }
      if (this._currentPage == this._pages.length - 1 && diffX < 0) {
        this._touchData.x = touches[0].pageX;
        diffX = 0;
      }

      if (!this._touchData.startMove &&
          Math.abs(diffX) < MOVESTART_THRESHOLD) {
        return;
      }

      this._touchData.startMove = true;
      this._touchData.lastX = touches[0].pageX;
      this._touchData.lastY = touches[0].pageY;
      this._container.style.transform =
        'translateX(' + (this._touchData.pageLeft + diffX) + 'px)';
    },

    /**
     * The handler for "touchend" event.
     *
     * @access private
     * @param {DOMEvent} evt The DOM event object.
     * @memberof WidgetList.prototype
     */
    _handleTouchEnd: function widgetListHandleTouchEnd(evt) {
      if (!this._touchStarted) {
        return;
      }

      this._container.style.transition = this._touchData.oldTransition;

      if (this._touchData.startMove) {
        var diffX = this._touchData.lastX - this._touchData.x;
        if (Math.abs(diffX) >= MOVEPAGE_THRESHOLD) {
          var nextPage = this._currentPage - (diffX / Math.abs(diffX));

          if (nextPage < 0 || nextPage >= this._pages.length) {
            this.setPage(this._currentPage);
          } else {
            this.setPage(nextPage);
          }
        } else {
          this.setPage(this._currentPage);
        }
      }

      this._touchStarted = false;
      this._touchData = null;
    },

    /**
     * Initialize WidgetList.
     *
     * It depends on "Applications.ready". The "ready" event will be fired after
     * WidgetList is ready.
     *
     * @memberof WidgetList.prototype
     */
    init: function widgetListInit() {
      var self = this;
      Applications.ready(function() {
        var appEventHandler = {
          'install': self._handleAppInstall.bind(self),
          'update': self._handleAppUpdate.bind(self),
          'uninstall': self._handleAppUninstall.bind(self)
        };

        for (var type in appEventHandler) {
          Applications.on(type, appEventHandler[type]);
        }

        self._unbindAppEventHandler = function() {
          for (var type in appEventHandler) {
            Applications.off(type, appEventHandler[type]);
          }
        };

        self._iconTapHandler = function(evt) {
          self._dispatchClickEvent(this);
          evt.stopImmediatePropagation();
          evt.preventDefault();
        };

        self._handleAppInstall(Applications.getAllAppEntries());
        self.setPage(0);

        self.fire('ready');
      });
    },

    /**
     * Release Resources and Handlers.
     *
     * Remember to call "uninit" before deleting the instance of an WidgetList.
     *
     * @memberof WidgetList.prototype
     */
    uninit: function widgetListUninit() {
      this.hide();

      this._container.innerHTML = '';
      this._pageIndicator.innerHTML = '';

      this._unbindAppEventHandler();
      this._unbindAppEventHandler = null;

      this._iconTapHandler = null;

      this._containerDimensions = {};
      this._iconDimensions = {};
      this._pagingSize = {};

      this._currentPage = 0;
      this._pages = [];

      this._touchStarted = false;
      this._touchData = null;
    },

    /**
     * Show the dialog of WidgetList.
     *
     * The "opened" event will be fired after it is shown.
     *
     * @return {Boolean} true if succeed or false if it's already shown.
     * @memberof WidgetList.prototype
     */
    show: function widgetListShow() {
      if (!this._widgetList.hidden) {
        return false;
      }

      this._container.addEventListener('touchstart', this);
      this._container.addEventListener('touchmove', this);
      this._container.addEventListener('touchend', this);

      this._widgetList.hidden = false;
      this.fire('opened');
      return true;
    },

    /**
     * Hide the dialog of WidgetList.
     *
     * The "closed" event will be fired after it is hidden.
     *
     * @return {Boolean} true if succeed or false if it's already hidden.
     * @memberof WidgetList.prototype
     */
    hide: function widgetListHide() {
      if (this._widgetList.hidden) {
        return false;
      }

      this._container.removeEventListener('touchstart', this);
      this._container.removeEventListener('touchmove', this);
      this._container.removeEventListener('touchend', this);

      this._widgetList.hidden = true;
      this.fire('closed');
      return true;
    },

    /**
     * Determine whether WidgetList is visible or not.
     *
     * @return {Boolean} true if it's shown or false if it's not.
     * @memberof WidgetList.prototype
     */
    isShown: function widgetListIsShown() {
      return !this._widgetList.hidden;
    },

    /**
     * Switch to the specified page by index.
     *
     * @param {Integer} index The page index starts from zero.
     * @return {Boolean} true if succeed or false if the index is invalid.
     * @memberof WidgetList.prototype
     */
    setPage: function widgetListSetPage(index) {
      if (index < 0 || index >= this._pages.length) {
        return false;
      }

      this._container.style.transform = 'translateX(' +
        (-1 * index * this._container.offsetWidth) + 'px)';

      var indicators = this._pageIndicator.childNodes;
      if (this._currentPage >= 0 && this._currentPage < indicators.length) {
        indicators[this._currentPage].classList.remove('focus');
      }
      indicators[index].classList.add('focus');

      this._currentPage = index;
      return true;
    },

    handleEvent: function widgetListHandleEvent(evt) {
      switch (evt.type) {
        case 'touchstart':
          this._handleTouchStart(evt);
          break;
        case 'touchmove':
          this._handleTouchMove(evt);
          break;
        case 'touchend':
          this._handleTouchEnd(evt);
          break;
      }
    }
  });

  exports.WidgetList = WidgetList;
})(window);
