'use strict';
/* global SelectionBorder */

requireApp('homescreen-tv-arch1/js/selection_border.js');

suite('SelectionBorder', function() {

  var borderContainer;
  var sampleUI1;
  var sampleUI2;
  suiteSetup(function() {
    borderContainer = document.createElement('div');
    borderContainer.style.position = 'absolute';
    borderContainer.style.width = '1280px';
    borderContainer.style.height = '800px';

    sampleUI1 = document.createElement('div');
    sampleUI1.style.position = 'absolute';
    sampleUI1.style.left = '100px';
    sampleUI1.style.top = '100px';
    sampleUI1.style.width = '100px';
    sampleUI1.style.height = '100px';

    sampleUI2 = document.createElement('div');
    sampleUI2.style.position = 'absolute';
    sampleUI2.style.left = '500px';
    sampleUI2.style.top = '500px';
    sampleUI2.style.width = '10px';
    sampleUI2.style.height = '10px';

    document.body.appendChild(borderContainer);
  });

  suiteTeardown(function() {
    document.body.removeChild(borderContainer);
  });

  suite('single-selection', function() {
    var selector;
    setup(function() {
      borderContainer.appendChild(sampleUI1);
      borderContainer.appendChild(sampleUI2);
      selector = new SelectionBorder({ multiple: false,
                                       foreground: false,
                                       container: borderContainer });
    });

    teardown(function() {
      borderContainer.innerHTML = '';
    });

    test('select sampleUI1', function() {
      selector.select(sampleUI1);
      assert.equal(selector.selectedItems.length, 1);
      assert.equal(selector.selectedItems[0].dom, sampleUI1);
      assert.equal(selector.selectedItems[0].border.style.left, '100px');
      assert.equal(selector.selectedItems[0].border.style.top, '100px');
      assert.equal(selector.selectedItems[0].border.style.width, '100px');
      assert.equal(selector.selectedItems[0].border.style.height, '100px');
      assert.equal(selector.borders.length, 0);
    });

    test('deselect sampleUI1', function() {
      selector.select(sampleUI1);
      selector.deselect(sampleUI1);
      assert.equal(selector.selectedItems.length, 0);
      assert.equal(selector.borders.length, 1);
      assert.isTrue(selector.borders[0].hidden);
    });

    test('select sampleUI1 and sampleUI2', function() {
      selector.select(sampleUI1);
      assert.equal(selector.selectedItems.length, 1);
      assert.equal(selector.selectedItems[0].dom, sampleUI1);
      selector.select(sampleUI2);
      assert.equal(selector.selectedItems.length, 1);
      assert.equal(selector.selectedItems[0].dom, sampleUI2);
      assert.equal(selector.selectedItems[0].border.style.left, '500px');
      assert.equal(selector.selectedItems[0].border.style.top, '500px');
      assert.equal(selector.selectedItems[0].border.style.width, '10px');
      assert.equal(selector.selectedItems[0].border.style.height, '10px');
      assert.equal(selector.borders.length, 0);
    });

    test('selectRect', function() {
      var rect = { x: 10, y: 10, w: 10, h: 10};
      selector.selectRect(rect);
      assert.equal(selector.selectedItems.length, 1);
      assert.equal(selector.selectedItems[0].rect, rect);
      assert.equal(selector.selectedItems[0].border.style.left, '10px');
      assert.equal(selector.selectedItems[0].border.style.top, '10px');
      assert.equal(selector.selectedItems[0].border.style.width, '10px');
      assert.equal(selector.selectedItems[0].border.style.height, '10px');
      assert.equal(selector.borders.length, 0);
    });

    test('deselectRect', function() {
      var rect = { x: 10, y: 10, w: 10, h: 10};
      selector.selectRect(rect);
      selector.deselectRect(rect);
      assert.equal(selector.selectedItems.length, 0);
      assert.equal(selector.borders.length, 1);
      assert.isTrue(selector.borders[0].hidden);
    });

    test('selectRect rect1 and rect2', function() {
      var rect1 = { x: 10, y: 10, w: 10, h: 10};
      var rect2 = { x: 100, y: 100, w: 100, h: 100};
      selector.selectRect(rect1);
      assert.equal(selector.selectedItems.length, 1);
      assert.equal(selector.selectedItems[0].rect, rect1);
      selector.selectRect(rect2);
      assert.equal(selector.selectedItems.length, 1);
      assert.equal(selector.selectedItems[0].rect, rect2);
      assert.equal(selector.selectedItems[0].border.style.left, '100px');
      assert.equal(selector.selectedItems[0].border.style.top, '100px');
      assert.equal(selector.selectedItems[0].border.style.width, '100px');
      assert.equal(selector.selectedItems[0].border.style.height, '100px');
      assert.equal(selector.borders.length, 0);
    });
  });

  suite('multiple-selection', function() {
    var selector;
    setup(function() {
      borderContainer.appendChild(sampleUI1);
      borderContainer.appendChild(sampleUI2);
      selector = new SelectionBorder({ multiple: true,
                                       foreground: false,
                                       container: borderContainer });
    });

    teardown(function() {
      borderContainer.innerHTML = '';
    });

    test('select sampleUI1', function() {
      selector.select(sampleUI1);
      assert.equal(selector.selectedItems.length, 1);
      assert.equal(selector.selectedItems[0].dom, sampleUI1);
      assert.equal(selector.selectedItems[0].border.style.left, '100px');
      assert.equal(selector.selectedItems[0].border.style.top, '100px');
      assert.equal(selector.selectedItems[0].border.style.width, '100px');
      assert.equal(selector.selectedItems[0].border.style.height, '100px');
      assert.equal(selector.borders.length, 0);
    });

    test('select sampleUI1 and sampleUI2', function() {
      selector.select(sampleUI1);
      assert.equal(selector.selectedItems.length, 1);
      assert.equal(selector.selectedItems[0].dom, sampleUI1);
      selector.select(sampleUI2);
      assert.equal(selector.selectedItems.length, 2);
      assert.equal(selector.selectedItems[1].dom, sampleUI2);
      assert.equal(selector.selectedItems[1].border.style.left, '500px');
      assert.equal(selector.selectedItems[1].border.style.top, '500px');
      assert.equal(selector.selectedItems[1].border.style.width, '10px');
      assert.equal(selector.selectedItems[1].border.style.height, '10px');
      assert.equal(selector.borders.length, 0);
    });

    test('selectRect rect1 and rect2', function() {
      var rect1 = { x: 10, y: 10, w: 10, h: 10};
      var rect2 = { x: 100, y: 100, w: 100, h: 100};
      selector.selectRect(rect1);
      assert.equal(selector.selectedItems.length, 1);
      assert.equal(selector.selectedItems[0].rect, rect1);
      selector.selectRect(rect2);
      assert.equal(selector.selectedItems.length, 2);
      assert.equal(selector.selectedItems[1].rect, rect2);
      assert.equal(selector.selectedItems[1].border.style.left, '100px');
      assert.equal(selector.selectedItems[1].border.style.top, '100px');
      assert.equal(selector.selectedItems[1].border.style.width, '100px');
      assert.equal(selector.selectedItems[1].border.style.height, '100px');
      assert.equal(selector.borders.length, 0);
    });

    test('deselectAll', function() {
      var rect1 = { x: 10, y: 10, w: 10, h: 10};
      var rect2 = { x: 100, y: 100, w: 100, h: 100};
      selector.selectRect(rect1);
      assert.equal(selector.selectedItems.length, 1);
      assert.equal(selector.selectedItems[0].rect, rect1);
      selector.selectRect(rect2);
      assert.equal(selector.selectedItems.length, 2);
      assert.equal(selector.selectedItems[1].rect, rect2);
      selector.deselectAll();
      assert.equal(selector.borders.length, 2);
    });
  });
});
