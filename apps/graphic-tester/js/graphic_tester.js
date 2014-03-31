'use strict';
(function(window) {
  var elemMenu = document.getElementById('menu');
  var panelContainer = document.getElementById('panel-container');
  var oframes = [];
  var indicatorContainer = document.getElementById('page-indicator');
  var pages = [];
  var indicators = [];
  var pageIndex = 0;
  var containerSize = panelContainer.offsetWidth;
  addPage();

  function handleClick(evt) {
    if (evt.target.id === 'static') {
      addApp(pages[pageIndex], 'static');
    } else if (evt.target.id === 'animation-3d') {
      addApp(pages[pageIndex], 'animation-3d');
    } else if (evt.target.id === 'animation-2d') {
      addApp(pages[pageIndex], 'animation-2d');
    } else if (evt.target.id === 'add-page') {
      addPage();
    } else if (evt.target.id === 'remove-page') {
      removePage();
    } else if (evt.target.id === 'page-up') {
      pageUp();
    } else if (evt.target.id === 'page-down') {
      pageDown();
    }
  }

  function addPage() {
    var item = document.createElement('span');
    item.classList.add('page-indicator-item');
    item.innerHTML = '*';
    indicatorContainer.appendChild(item);
    indicators.push(item);

    var container = document.createElement('div');
    container.classList.add('iframe-page');
    container.addEventListener('click', panelClickHandler);
    container.style.width = containerSize + 'px';
    panelContainer.appendChild(container);
    pages.push(container);
    setPage(panelContainer.childNodes.length - 1);
    panelContainer.style.width = pages.length * containerSize + 'px';
  }

  function removePage() {
    if (pages.length === 1) {
      return;
    }

    var container = pages[pageIndex];
    container.removeEventListener('click', panelClickHandler);
    panelContainer.removeChild(container);

    var indicator = indicators[pageIndex];
    indicatorContainer.removeChild(indicator);

    indicators.splice(pageIndex, 1);
    pages.splice(pageIndex, 1);
    if (pageIndex === pages.length) {
      setPage(pageIndex - 1);
    } else {
      setPage(pageIndex);
    }
  }

  function pageUp() {
    if (pageIndex === 0) {
      return;
    }

    setPage(pageIndex - 1);
  }

  function pageDown() {
    if (pageIndex === pages.length - 1) {
      return;
    }

    setPage(pageIndex + 1);
  }

  function setPage(index) {
    panelContainer.style.left =
        (-1 * index * containerSize) + 'px';

    indicators[pageIndex].classList.remove('focus');
    indicators[index].classList.add('focus');

    pageIndex = index;
  }

  function addApp(container, type) {
    var oframe = document.createElement('div'),
      closeBtn = document.createElement('div'),
      iframe = document.createElement('iframe'),
      protocol = window.location.protocol,
      port = window.location.port ? (':' + window.location.port) : '';
    if (type === 'static') {
      iframe.src =
        protocol + '//template.gaiamobile.org' + port + '/index.html';
    } else if (type === 'animation-3d') {
      iframe.src =
        protocol + '//bunnymark-easel.gaiamobile.org' +
        port + '/index.html';
    } else if (type === 'animation-2d') {
      iframe.src =
        protocol + '//bunnymark-easel.gaiamobile.org' +
        port + '/index.html?c2d=1';
    }
    iframe.className = 'browser-tab app-frame';
    iframe.setAttribute('mozbrowser', true);
    iframe.setAttribute('remote', true);
    closeBtn.textContent = '[X]';
    closeBtn.className = 'frame-close-button';
    oframe.className = 'oframe';
    oframe.id = 'id-' + (+new Date());
    oframe.appendChild(iframe);
    oframe.appendChild(closeBtn);
    oframes.push({
      id: oframe.id,
      oframe: oframe
    });
    oframe.style.width = '49%';
    container.appendChild(oframe);
  }

  function panelClickHandler(evt) {
    var oframeToRemove;

    if (evt.target.classList.contains('frame-close-button')) {
      oframeToRemove = evt.target.parentElement;
      oframeToRemove.remove();
      try {
        oframes.forEach(function(value, index) {
          if (value.id === oframeToRemove.id) {
            oframes.splice(index, 1);
            throw {};
          }
        });
      } catch (e) {
      }
    }
  }

  elemMenu.addEventListener('click', handleClick);
}(window));
