// custom.js

// jQuery
(function($) {

    // document ready
    $(document).ready(function() {

        // toggle color scheme
        $("#colors").click(function() {
            $("#colors").slideToggle();
        });
        
        $('li a').bind('click', function(event) {
			var $anchor = $(this);
			var nav = $($anchor.attr('href'));
			if (nav.length) {
				$('html, body').stop().animate({
					scrollTop: $($anchor.attr('href')).offset().top
				}, 500, 'easeInOutExpo', function() {

				});
				event.preventDefault();
			}
		});
        
    });

})(jQuery);