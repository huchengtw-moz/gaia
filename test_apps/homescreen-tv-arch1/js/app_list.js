'use strict';

(function(exports) {
  function AppListPage(parent, pagingSize) {
    if (!parent) {
      throw new Error('AppListPage requires a parent object.');
    }

    this._dom = document.createElement('div');
    this._dom.classList.add('app-list-page');

    this._numIconsPerRow = pagingSize.numIconsPerRow || 0;
    this._numIconsPerCol = pagingSize.numIconsPerCol || 0;
    this._maxIconCount = this._numIconsPerRow * this._numIconsPerCol;

    parent.appendChild(this._dom);
  }

  AppListPage.prototype = {
    _dom: null,

    _numIconsPerRow: 0,
    _numIconsPerCol: 0,
    _maxIconCount: 0,
    _defaultIconUrl: '',

    _iconCount: 0,

    _updateIconNameAndIcon: function alpUpdateIconNameAndIcon(icon, entry) {
      var img = icon.firstChild;
      var text = icon.lastChild;

      img.src = Applications.DEFAULT_ICON_URL;
      text.innerHTML = icon.dataset.name = entry.name;

      Applications.getIconBlob(entry.origin, entry.entry_point, 32,
        function(blob) {
          if (!blob) {
            return;
          }
          var url = window.URL.createObjectURL(blob);
          img.addEventListener('load', function iconImageOnLoad() {
            if (this.src == url) {
              img.removeEventListener('load', iconImageOnLoad);
              window.URL.revokeObjectURL(url);
            }
          });
          img.src = url;
        }
      );
    },

    addIcon: function alpAddIcon(entry, tapHandler) {
      if (this.isFull()) {
        return false;
      }

      var img = new Image();
      img.className = 'icon';

      var text = document.createElement('span');

      var icon = document.createElement('div');
      icon.className = 'app-list-icon';
      icon.dataset.origin = entry.origin;
      icon.dataset.entry_point = entry.entry_point;
      icon.appendChild(img);
      icon.appendChild(text);
      icon.addEventListener('click', tapHandler);

      this.insertIcon(icon);
      this._updateIconNameAndIcon(icon, entry);

      return true;
    },

    insertIcon: function alpInsertIcon(iconElement) {
      this._dom.appendChild(iconElement);
      this._iconCount++;
    },

    removeIcon: function alpInsertIcon(index) {
      var elem = getIconElement(index);
      if (elem) {
        this._iconCount--;
      }
      return elem;
    },

    findIcon: function alpFindIcon(entry) {
      var icons = this._dom.childNodes;

      for (var i = 0; i < icons.length; i++) {
        if (icons[i].dataset.origin == entry.origin &&
            icons[i].dataset.entry_point == entry.entry_point) {
          return i;
        }
      }

      return -1;
    },

    updateIcon: function alpUpdateIcon(entry) {
      var index = this.findIcon(entry);
      if (index == -1) {
        return false;
      }
      this._updateIconNameAndIcon(this.getIconElement(index), entry);
      return true;
    },

    isFull: function alpIsFull() {
      if (this._iconCount == this._maxIconCount) {
        return true;
      }
      return false;
    },

    isEmpty: function alpIsEmpty() {
      return (this._iconCount == 0);
    },

    getIconElement: function alpGetIconElement(index) {
      if (index < 0 || index >= this._iconCount) {
        return null;
      }
      return this._dom.childNodes[index];
    },

    getIconCount: function alpGetIconCount() {
      return this._iconCount;
    }
  };

  function AppList() {
    this._appList = document.getElementById('app-list');
    this._container = document.getElementById('app-list-container');
    this._pageIndicator = document.getElementById('app-list-page-indicator');
    this._calcPagingSize();
  }

  AppList.prototype = evt({
    _appList: null,
    _container: null,
    _pageIndicator: null,

    _selectionBorder: null,
    _focus: -1,

    _containerDimensions: {},
    _iconDimensions: {},
    _pagingSize: {},

    _currentPage: 0,
    _pages: [],

    _iconTapHandler: null,

    oniconclick: null,

    _handleKeyDown: function appListHandleKeyDown(evt) {
      switch (evt.key) {
        case 'PageUp':
          this.previousPage();
          this.setFocus(0);
          break;
        case 'PageDown':
          this.nextPage();
          this.setFocus(0);
          break;
        case 'Up':
        case 'Down':
        case 'Left':
        case 'Right':
          this._handleArrowKey(evt.key);
          break;
        case 'Enter':
          var event = new MouseEvent('click', {
            'view': window,
            'bubbles': false,
            'cancelable': false
          });

          this._pages[this._currentPage].getIconElement(this._focus)
            .dispatchEvent(event);
          break;
        case 'Esc':
          this.hide();
          break;
        default:
          return false;
      }

      return true;
    },

    _handleArrowKey: function appListHandleArrowKey(direction) {
      var current_page = this._pages[this._currentPage];
      var icon_count = current_page.getIconCount();
      var numPerRow = this._pagingSize.numIconsPerRow;
      var new_focus;

      switch(direction) {
        case 'Up':
          new_focus = this._focus - numPerRow;
          break;
        case 'Down':
          new_focus = this._focus + numPerRow;
          break;
        case 'Left':
          if (this._focus % numPerRow == 0) {
            if (this._currentPage == 0) {
              return false;
            }

            this.previousPage();

            current_page = this._pages[this._currentPage];
            icon_count = current_page.getIconCount();
            new_focus = this._focus + numPerRow - 1;
          } else {
            new_focus = this._focus - 1;
          }
          break;
        case 'Right':
          if (this._focus % numPerRow == numPerRow - 1) {
            if (this._currentPage == this._pages.length - 1) {
              return false;
            }

            this.nextPage();

            current_page = this._pages[this._currentPage];
            icon_count = current_page.getIconCount();
            new_focus = this._focus - numPerRow + 1;

            if (new_focus >= icon_count) {
              new_focus = 0;
            }
          } else {
            new_focus = this._focus + 1;
          }
          break;
      }

      if (new_focus < 0 || new_focus >= icon_count) {
        return false;
      }

      return this.setFocus(new_focus);
    },

    _calcPagingSize: function appListCalcPagingSize() {
      this._appList.hidden = false;
      this._containerDimensions.width = this._container.clientWidth;
      this._containerDimensions.height = this._container.clientHeight;
      this._appList.hidden = true;

      var icon = document.createElement('div');
      icon.className = 'app-list-icon';
      this._container.appendChild(icon);

      var icon_computed_style = getComputedStyle(icon);

      this._iconDimensions.width =
        parseInt(icon_computed_style.getPropertyValue('width')) +
        parseInt(icon_computed_style.getPropertyValue('margin-left')) +
        parseInt(icon_computed_style.getPropertyValue('margin-right'));
      this._iconDimensions.height =
        parseInt(icon_computed_style.getPropertyValue('height')) +
        parseInt(icon_computed_style.getPropertyValue('margin-top')) +
        parseInt(icon_computed_style.getPropertyValue('margin-bottom'));

      this._container.removeChild(icon);

      this._pagingSize.numIconsPerRow = Math.floor(
        this._containerDimensions.width / this._iconDimensions.width);

      this._pagingSize.numIconsPerCol = Math.floor(
        this._containerDimensions.height / this._iconDimensions.height);
    },

    _handleAppInstall: function appListHandleAppInstall(entries) {
      var self = this;
      var page;

      if (!self._pages.length) {
        page = self.createPage();
      } else {
        page = self._pages[self._pages.length - 1];
      }

      entries.forEach(function(entry) {
        if (page.isFull()) {
          page = self.createPage();
        }
        page.addIcon(entry, self._iconTapHandler);
      });
    },

    _handleAppUpdate: function appListHandleAppUpdate(entries) {
      var pages = this._pages;
      var page_count = pages.length;

      entries.forEach(function(entry) {
        for(var i = 0; i < page_count; i++) {
          if (pages[i].updateIcon(entry)) {
            break;
          }
        }
      });
    },

    _handleAppUninstall: function appListHandleAppUninstall(entries) {
      // TBD
    },

    init: function appListInit() {
      var self = this;

      this._iconTapHandler = function(evt) {
        evt.preventDefault();

        var data = {
          origin: this.dataset.origin,
          entry_point: this.dataset.entry_point,
          name: this.dataset.name
        };

        if (self.fire('iconclick', data)) {
          Applications.launch(data.origin, data.entry_point);
        }
      };

      document.getElementById('app-list-close-button')
        .addEventListener('click', self);

      document.addEventListener('keydown', self);

      Applications.ready(function() {
        Applications.on('install', self._handleAppInstall.bind(self));
        Applications.on('update', self._handleAppUpdate.bind(self));
        Applications.on('uninstall', self._handleAppUninstall.bind(self));

        self._handleAppInstall(Applications.getAllEntries());
        self.setPage(0);

        self._selectionBorder = new SelectionBorder({
          multiple: false,
          container: self._container
        });

        self.fire('ready');
      });
    },

    uninit: function appListUninit() {
      this.oniconclick = null;

      this.hide();

      this._selectionBorder.deselectAll();
      this._container.innerHTML = '';

      this._iconTapHandler = null;

      Applications.off('install', self._handleAppInstall.bind(self));
      Applications.off('update', self._handleAppUpdate.bind(self));
      Applications.off('uninstall', self._handleAppUninstall.bind(self));

      document.removeEventListener('keydown', self);
      document.getElementById('app-list-close-button')
        .removeEventListener('click', this);
    },

    show: function appListShow() {
      if (!this.fire('opening')) {
        return false;
      }

      this._appList.hidden = false;

      if (this._focus < 0) {
        this._focus = 0;
      }

      this.setFocus(this._focus);
      this.fire('opened');
      return true;
    },

    hide: function appListHide() {
      if (!this.fire('closing')) {
        return false;
      }

      this._appList.hidden = true;
      this.fire('closed');
      return true;
    },

    isShown: function appListIsShown() {
      return !this._appList.hidden;
    },

    setFocus: function appListSetFocus(index) {
      var current_page = this._pages[this._currentPage];
      var icon_count = current_page.getIconCount();

      if (index >= 0) {
        if (index >= icon_count) {
          return false;
        }

        this._focus = index;
        this._selectionBorder
          .select(current_page.getIconElement(this._focus));
      } else if (this._focus >= 0) {
        this._focus = index;
        this._selectionBorder.deselectAll();
      }

      return true;
    },

    createPage: function appListCreatePage() {
      this._pages.push(new AppListPage(this._container, this._pagingSize));

      var item = document.createElement('span');
      item.classList.add('app-list-page-indicator-item');
      item.innerHTML = '*';

      this._pageIndicator.appendChild(item);

      return this._pages[this._pages.length - 1];
    },

    setPage: function appListSetPage(index) {
      if (index < 0 || index >= this._pages.length) {
        return false;
      }

      this._container.style.left =
        (-1 * index * this._containerDimensions.width) + 'px';

      var indicators = this._pageIndicator.childNodes;
      if (this._currentPage >= 0 || this._currentPage < indicators.length) {
        indicators[this._currentPage].classList.remove('focus');
      }
      indicators[index].classList.add('focus');

      this._currentPage = index;
      return true;
    },

    previousPage: function appListPreviousPage() {
      return this.setPage(this._currentPage - 1);
    },

    nextPage: function appListNextPage() {
      return this.setPage(this._currentPage + 1);
    },

    handleEvent: function appListHandleEvent(evt) {
      var target = evt.target;

      if (target.id == 'app-list-close-button' && evt.type == 'click') {
        this.hide();
        return;
      }

      switch (evt.type) {
        case 'keydown':
          if (!this.isShown()) {
            return;
          }
          if (this._handleKeyDown(evt)) {
            evt.preventDefault();
          }
          break;
      }
    }
  });

  exports.AppList = AppList;
})(window);
