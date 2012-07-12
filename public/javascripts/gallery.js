$(function() {

	var featureNode = document.getElementById('featured');

	if (featureNode) {
		// Orbit
		$('#featured').orbit({
			fluid: false
		});

		// Swipe
		// new Swipe(featureNode);
	}

});