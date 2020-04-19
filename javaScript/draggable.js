//draggable element must be class='dragMe'
function draggable(className){
	$(document).ready(function() {
		var $dragging = null;

		$(document.body).on("mousemove", function(e) {
			if ($dragging) {
				$dragging.offset({
					top: e.pageY,
					left: e.pageX
				});
			}
		});

		$(document.body).on("mousedown", className, function (e) {
			$dragging = $(e.target);
		});

		$(document.body).on("mouseup", function (e) {
			$dragging = null;
		});
	});
}