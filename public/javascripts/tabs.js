$(function() {
  // articleSwipe
    new Swipe(document.getElementById('articleSwipe'));

  // tabs
      tabs = new Swipe(document.getElementById('tabs'), {
        callback: function(event,index,elem) {
          setTab(selectors[index]);
        }
      }),
      selectors = document.getElementById('tabSelector').children;

  for (var i = 0; i < selectors.length; i++) {
    var elem = selectors[i];
    elem.setAttribute('data-tab', i);
    elem.onclick = function(e) {
      e.preventDefault();
      setTab(this);
      tabs.slide(parseInt(this.getAttribute('data-tab'),10),300);
    }
  }
});

function setTab(elem) {
  for (var i = 0; i < selectors.length; i++) {
    selectors[i].className = selectors[i].className.replace('on',' ');
  }
  elem.className += ' on';
}
