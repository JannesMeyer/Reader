jQuery(document).ready(function ($) {

	/* Use this js doc for all application specific JS */

	var articleNode = document.getElementById('articleSwipe');
	var tabNode = document.getElementById('tabs');
	var prevSlide = document.getElementById('prev');
	var nextSlide = document.getElementById('next');


	// articleSwipe
	if (articleNode) {
		window.articles = new Swipe(articleNode);
		// next / previous slide
		if (prevSlide || nextSlide) {
		  prevSlide.onclick = articles.prev();
		  nextSlide.onclick = articles.next();
		}		
	}
	// 
	if (tabNode) {
		window.tabs = new Swipe(tabNode, {
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
		// Set tab helper function
		function setTab(elem) {
		  for (var i = 0; i < selectors.length; i++) {
		    selectors[i].className = selectors[i].className.replace('on',' ');
		  }
		  elem.className += ' on';
		}

		// next / previous slide
		// if (prevSlide || nextSlide) {
		//   prevSlide.onclick = tabs.prev();
		//   nextSlide.onclick = tabs.next();
		// }
	}


	/* COLOR PICKER */
	var colors = $('#colorpicker span');
	colors.on('click', function(e) {
		var content = $(this).data('color');
		$('#color').val(content);
		colors.removeClass('selected');
		$(this).addClass('selected');
	});

	/* Dropdowns */
	var dropdowns = $('.custom-dropdown');
	dropdowns.on('click', function (e) {
		// Hide all +other dropdown menus
		dropdowns.not(this).children('div.dropdown-content').removeClass('show-dropdown');
		// Toggle the current dropdown menu
		$(this).children('div.dropdown-content').toggleClass('show-dropdown');
	});

	/*ACTIVATE INVERTED STYLE*/
	var dark =$('#theme-dark');
	dark.on('click', function(e) {
		$("body").addClass("dark");
	});

	/*DEACTIVATE INVERTED STYLE*/
	var light =$('#theme-light');
	light.on('click', function(e) {
		$("body").removeClass("dark");
	});


	


	/* TABS --------------------------------- */
	/* Remove if you don't need :) */

	function activateTab($tab) {
		var $activeTab = $tab.closest('dl').find('dd.active'),
				contentLocation = $tab.children('a').attr("href") + 'Tab';

		// Strip off the current url that IE adds
		contentLocation = contentLocation.replace(/^.+#/, '#');

		// Strip off the current url that IE adds
		contentLocation = contentLocation.replace(/^.+#/, '#');

		//Make Tab Active
		$activeTab.removeClass('active');
		$tab.addClass('active');

		//Show Tab Content
		$(contentLocation).closest('.tabs-content').children('li').hide();
		$(contentLocation).css('display', 'block');
	}

	$('dl.tabs dd a').on('click.fndtn', function (event) {
		activateTab($(this).parent('dd'));
	});

	// if (window.location.hash) {
	//   activateTab($('a[href="' + window.location.hash + '"]'));
	//   $.foundation.customForms.appendCustomMarkup();
	// }

	/* ALERT BOXES ------------ */
	$(".alert-box").delegate("a.close", "click", function(event) {
		event.preventDefault();
		$(this).closest(".alert-box").fadeOut(function(event){
			$(this).remove();
		});
	});

	/* PLACEHOLDER FOR FORMS ------------- */
	/* Remove this and jquery.placeholder.min.js if you don't need :) */
	// $('input, textarea').placeholder();

	/* TOOLTIPS ------------ */
	// $(this).tooltips();

	/* UNCOMMENT THE LINE YOU WANT BELOW IF YOU WANT IE6/7/8 SUPPORT AND ARE USING .block-grids */
	//  $('.block-grid.two-up>li:nth-child(2n+1)').css({clear: 'left'});
	//  $('.block-grid.three-up>li:nth-child(3n+1)').css({clear: 'left'});
	//  $('.block-grid.four-up>li:nth-child(4n+1)').css({clear: 'left'});
	//  $('.block-grid.five-up>li:nth-child(5n+1)').css({clear: 'left'});


	/* DROPDOWN NAV ------------- */

	var lockNavBar = false;
	/* Windows Phone, sadly, does not register touch events :( */
	if (Modernizr.touch || navigator.userAgent.match(/Windows Phone/i)) {
		$('.nav-bar a.flyout-toggle').on('click.fndtn touchstart.fndtn', function(e) {
			e.preventDefault();
			var flyout = $(this).siblings('.flyout').first();
			if (lockNavBar === false) {
				$('.nav-bar .flyout').not(flyout).slideUp(500);
				flyout.slideToggle(500, function(){
					lockNavBar = false;
				});
			}
			lockNavBar = true;
		});
		$('.nav-bar>li.has-flyout').addClass('is-touch');
	} else {
		$('.nav-bar>li.has-flyout').hover(function() {
			$(this).children('.flyout').show();
		}, function() {
			$(this).children('.flyout').hide();
		});
	}

	/* DISABLED BUTTONS ------------- */
	/* Gives elements with a class of 'disabled' a return: false; */

	/* SPLIT BUTTONS/DROPDOWNS */
	$('.button.dropdown > ul').addClass('no-hover');

	$('.button.dropdown').on('click.fndtn touchstart.fndtn', function (e) {
		e.stopPropagation();
	});
	$('.button.dropdown.split span').on('click.fndtn', function (e) {
		// e.preventDefault();
		$('.button.dropdown').not($(this).parent()).children('ul').removeClass('show-dropdown');
		$(this).siblings('ul').toggleClass('show-dropdown');
	});
	$('.button.dropdown').not('.split').on('click.fndtn', function (e) {
		$('.button.dropdown').not(this).children('ul').removeClass('show-dropdown');
		$(this).children('ul').toggleClass('show-dropdown');		
	});
	$('body, html').on('click.fndtn', function () {
		$('.button.dropdown ul').removeClass('show-dropdown');
	});

	// Positioning the Flyout List
	var normalButtonHeight  = $('.button.dropdown:not(.large):not(.small):not(.tiny)').outerHeight() - 1,
			largeButtonHeight   = $('.button.large.dropdown').outerHeight() - 1,
			smallButtonHeight   = $('.button.small.dropdown').outerHeight() - 1,
			tinyButtonHeight    = $('.button.tiny.dropdown').outerHeight() - 1;

	$('.button.dropdown:not(.large):not(.small):not(.tiny) > ul').css('top', normalButtonHeight);
	$('.button.dropdown.large > ul').css('top', largeButtonHeight);
	$('.button.dropdown.small > ul').css('top', smallButtonHeight);
	$('.button.dropdown.tiny > ul').css('top', tinyButtonHeight);
	
	$('.button.dropdown.up:not(.large):not(.small):not(.tiny) > ul').css('top', 'auto').css('bottom', normalButtonHeight - 2);
	$('.button.dropdown.up.large > ul').css('top', 'auto').css('bottom', largeButtonHeight - 2);
	$('.button.dropdown.up.small > ul').css('top', 'auto').css('bottom', smallButtonHeight - 2);
	$('.button.dropdown.up.tiny > ul').css('top', 'auto').css('bottom', tinyButtonHeight - 2);

  /* CUSTOM FORMS */
  // $.foundation.customForms.appendCustomMarkup();

});