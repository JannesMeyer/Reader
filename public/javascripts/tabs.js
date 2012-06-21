// Set tab helper function
function setTab(elem) {
  for (var i = 0; i < selectors.length; i++) {
    selectors[i].className = selectors[i].className.replace('on',' ');
  }
  elem.className += ' on';
}

// Onload
$(function() {
  var articleNode = document.getElementById('articleSwipe');
  var tabNode = document.getElementById('tabs');

  // articleSwipe
  if (articleNode) {
    new Swipe(articleNode);
  }
  // 
  if (tabNode) {
    var tabs = new Swipe(tabNode, {
      callback: function(event,index,elem) {
        setTab(selectors[index]);
      }
    });
    var selectors = document.getElementById('tabSelector').children;

    for (var i = 0; i < selectors.length; i++) {
      var elem = selectors[i];
      elem.setAttribute('data-tab', i);
      elem.onclick = function(e) {
        e.preventDefault();
        setTab(this);
        tabs.slide(parseInt(this.getAttribute('data-tab'),10),300);
      }
    } 
  }
});