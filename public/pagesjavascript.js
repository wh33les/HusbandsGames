/* JavaScript used on all the main pages */

$(function () {
	$('#header').load('../pagesheader.html');
}); /* Calls the header code */
$(function () {
	$('#lastmodified').load('../lastmodified.html');
}); /* Calls the last modified code */
function toggleShowHide(elementId) {
	var element = document.getElementById(elementId);
	if (element.style.display == "block") {
		element.style.display = "none";
	} else {
		element.style.display = "block";
	}
} /* Toggles hidden text.  Code modified from https://www.toptip.ca/2009/09/showhide-text-on-web-page.html. */