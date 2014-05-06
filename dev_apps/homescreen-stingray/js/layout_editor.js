/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- /
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

/* global evt */

(function(exports) {
  'use strict';

  /**
   * LayoutEditor is an object for handling grid-based layout. It calculates
   * rectangle bound for each place holder.
   *
   * There are two size in LayoutEditor: editor size and target size. The editor
   * size is the size and coordinate of design-time widget container which is
   * the dom argument of init function. The target size is the size and
   * coordinate of the run-time widget container which is the targetSize
   * argument of init function. All calculations are based on editor size. When
   * we call exportConfig func, it returns size in target size.
   *
   * For each place holder, we have two different type: static or non-static.
   * The static place is a place held by homescreen app and cannot be
   * customized by user. It is always returned with exportConfig. The non-static
   * place is a place where can be customized by user.
   *
   * @class LayoutEditor
   * @param {Object} options the configuration for this object, properties:
   *                 layout: the maximum grid size in vertical and horizontal,
   *                         default: {v: 3, h: 3}.
   *                 gap: the gap in pixel for each grid in vertical and
   *                      horizontal, default: {v: 10, h: 10}.
   *                 padding: the padding size in pixel of the editor container,
   *                          default: { t: 10, r: 10, b: 10, l: 10 }.
   *                 holders: the config of each place holder, default:
   *                          [{ static: true, x: 0, y: 0, w: 2, h: 2 },
   *                           { static: true, x: 0, y: 2, w: 1, h: 1 },
   *                           { x: 2, y: 0, w: 1, h: 1 },
   *                           { x: 2, y: 1, w: 1, h: 1 },
   *                           { x: 2, y: 2, w: 1, h: 1 },
   *                           { x: 1, y: 2, w: 1, h: 1 }]
   */
  function LayoutEditor(options) {
    this.options = options || {};
    this.options.layout = this.options.layout || { v: 3, h: 3 };
    this.options.gap = this.options.gap || { v: 10, h: 10 };
    this.options.padding = this.options.padding ||
                           { t: 10, r: 10, b: 10, l: 10 };
    this.options.holders = this.options.holders || [
                             { static: true, x: 0, y: 0, w: 2, h: 2 },
                             { static: true, x: 0, y: 2, w: 1, h: 1 },
                             { x: 2, y: 0, w: 1, h: 1 },
                             { x: 2, y: 1, w: 1, h: 1 },
                             { x: 2, y: 2, w: 1, h: 1 },
                             { x: 1, y: 2, w: 1, h: 1 }];
  }

  LayoutEditor.prototype = evt({
    /**
     * init the LayoutEditor. It calculates the size of each cell and creates
     * all place holder based on the config of holders.
     * @param {Element} dom the editor container where all place holders append
     *                      to.
     * @param {Object} targetSize the top, left, width, and height of the target
     *                            area for layouting widget. This is an optional
     *                            argument.
     */
    init: function hsle_init(dom, targetSize) {
      if (!targetSize) {
        // don't scale
        this.scaleRatio = 1;
        this.containerSize = {
          w: dom.clientWidth,
          h: dom.clientHeight
        };
        this.offsetPosition = {left: 0, top: 0};
      } else {
        // calculate scale ratio
        this.scaleRatio = Math.max(targetSize.w / dom.clientWidth,
                                   targetSize.h / dom.clientHeight);
        // recalculate editor size and respect targetSize's ratio.
        this.containerSize = {
          w: targetSize.w / this.scaleRatio,
          h: targetSize.h / this.scaleRatio
        };
        this.offsetPosition = {left: targetSize.left, top: targetSize.top};
      }

      this.container = dom;
      this._initSingleRect();
      this._createPlaceHolders();
      // return the initial widget
      return this.placeHolders[0];
    },

    /**
     * Exports all widget layout config based on target size.
     * @return {Array} this method returns an array of object. Each object
     *                 contains the positionId, static, x, y, w, h, origin and
     *                 entryPoints. If a place holder doesn's have app
     *                 associated and not a static place.
     */
    exportConfig: function hsle_export() {
      var ret = [];
      for (var i = 0; i < this.placeHolders.length; i++) {
        var place = this.placeHolders[i];
        if (place.app || place.static) {
          ret.push({
            positionId: i,
            static: place.static,
            x: this.offsetPosition.left + Math.round(place.x * this.scaleRatio),
            y: this.offsetPosition.top + Math.round(place.y * this.scaleRatio),
            w: Math.round(place.w * this.scaleRatio),
            h: Math.round(place.h * this.scaleRatio),
            origin: place.app ? place.app.origin : '',
            entryPoint: place.app ? place.app.entryPoint : ''
          });
        }
      }
      return ret;
    },

    /**
     * Loads a widget to the specified place.
     * @param {Object} config the widget config which must have two properties:
     *                        positionId: this is returned by exportConfig.
     *                        app: the app information which is the same as
     *                             the app argument of addWidget.
     *
     */
    loadWidget: function hsle_import(config) {
      if (config && this.placeHolders[config.positionId]) {
        this.addWidget(config.app, this.placeHolders[config.positionId]);
      }
    },

    /**
     * Get the first non static place holder.
     * @return returns the first non-static holder or null if not found.
     */
    getFirstNonStatic: function getFirstNonStatic() {
      for (var i = 0; i < this.placeHolders.length; i++) {
        if (this.placeHolders[i].static) {
          continue;
        }
        return this.placeHolders[i];
      }
      return null;
    },

    _createPlaceHolders: function hsle__createPlaceHolders() {
      this.placeHolders = [];
      for (var i = 0; i < this.options.holders.length; i++) {
        var place = this.options.holders[i];
        // convert grid to pixel coordinate system.
        var x = place.x * (this.options.gap.h + this.singleRect.width) +
                this.options.padding.l;
        var y = place.y * (this.options.gap.v + this.singleRect.height) +
                this.options.padding.t;
        var w = place.w * this.singleRect.width +
                (place.w - 1) * this.options.gap.h;
        var h = place.h * this.singleRect.height +
                (place.h - 1) * this.options.gap.v;
        var center = {
          x: (x + w / 2),
          y: (y + h / 2)
        };
        var placeHolder = { static: place.static,
                            center: center,
                            x: x, y: y, w: w, h: h };
        this._createPlaceHolderUI(placeHolder);
        this.placeHolders.push(placeHolder);
      }
    },

    _createPlaceHolderUI: function hsle__createPlaceHolderUI(place) {
      var div = document.createElement('div');
      div.classList.add('place-holder');
      if (place.static) {
        div.classList.add('static-place-holder');
      }

      var leftDiff = (this.container.clientWidth - this.containerSize.w) / 2;
      var topDiff = (this.container.clientHeight - this.containerSize.h) / 2;


      div.style.width = place.w + 'px';
      div.style.height = place.h + 'px';
      div.style.left = leftDiff + place.x + 'px';
      div.style.top = topDiff + place.y + 'px';

      this.container.appendChild(div);
      place.elm = div;
    },

    _updatePlaceHolderUI: function hsle__updatePlaceHolderUI(place) {
      if (place.app) {
        place.elm.dataset.appName = place.app.name;
        place.elm.style.backgroundImage = 'url(' + place.app.iconUrl + ')';
      } else {
        place.elm.dataset.appName = '';
        place.elm.style.backgroundImage = '';
      }
    },

    /*
     * add app as a widget at place.
     * @param {Object} app the app information which should contains: origin,
     *                     entryPoint (if it has), name, and iconUrl.
     * @param {Object} place the place object which can be found at holders.
     */
    addWidget: function hsle_add(app, place) {
      if (place.app) {
        this.removeWidget(place);
      }
      place.app = app;
      this._updatePlaceHolderUI(place);
    },

    /**
     * remove the associated widget at place
     * @param {Object} place the place object which can be found at holders.
     */
    removeWidget: function hsle_remove(place) {
      if (place.app) {
        // we need to fire this event for callers to revoke the iconUrl.
        this.fire('widget-removed', place.app);
        delete place.app;
        this._updatePlaceHolderUI(place);
      }
    },

    /**
     * This is a convenient function to remove widgets based on callback's
     * return.
     * @param {Function} callback the callback function which handles two 
     *                            arguments: place and resultCallback, like:
     *           function cb(place, resultCallback) {
     *             if (place is affected place) {
     *               ... async function call {
     *                 resultCallback(true, place);
     *               }
     *             } else {
     *               resultCallback(false, place);
     *             }
     *           }
     */
    removeWidgets: function hsle_removeItems(callback) {
      this._batchOps(callback, this.removeWidget.bind(this));
    },

    /**
     * This is a convenient function to update widgets' icon based on callback's
     * return.
     * @param {Function} callback the callback function which handles two 
     *                            arguments: place and resultCallback, like:
     *           function cb(place, resultCallback) {
     *             if (place is affected place) {
     *               ... async function call {
     *                 resultCallback(true, place);
     *               }
     *             } else {
     *               resultCallback(false, place);
     *             }
     *           }
     */
    updateWidgets: function hsle_updateItems(callback) {
      this._batchOps(callback, this._updatePlaceHolderUI.bind(this));
    },

    _batchOps: function hsle__batchOps(checkingFunc,
                                       affectedFunc) {
      if (!checkingFunc || (typeof checkingFunc) !== 'function' ||
          !affectedFunc || (typeof affectedFunc) !== 'function') {
        return;
      }
      function handleResult(affected, place) {
        if (affected) {
          affectedFunc(place);
        }
      }
      for (var i = 0; i < this.placeHolders.length; i++) {
        if (!this.placeHolders[i].app) {
          continue;
        }
        try {
          checkingFunc(this.placeHolders[i], handleResult);
        } catch (ex) {
          console.error('Error while trying to execute callback of ' +
                        'batch tasks with place #' + i, ex);
        }
      }
    },

    /**
     * remove all widgets from place holders.
     * @param {Function} callback this callback is called before we remove the
     *                            widget.
     */
    reset: function hsle_reset() {
      for (var i = 0; i < this.placeHolders.length; i++) {
        this.removeWidget(this.placeHolders[i]);
      }
    },

    _initSingleRect: function hsle__initSingleRect() {
      var width = (this.containerSize.w -
                   (this.options.layout.h - 1) * this.options.gap.h -
                   this.options.padding.l -
                   this.options.padding.r) / this.options.layout.h;
      var height = (this.containerSize.h -
                    (this.options.layout.v - 1) * this.options.gap.v -
                    this.options.padding.t -
                    this.options.padding.b) / this.options.layout.v;
      this.singleRect = {width: Math.round(width),
                         height: Math.round(height)};
    }
  });

  exports.LayoutEditor = LayoutEditor;
})(window);
