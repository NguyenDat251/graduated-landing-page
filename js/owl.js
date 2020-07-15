(function ($) {
    $('#owl-screen').owlCarousel({
        onDragged: callback
    });
    function callback(event) {
        console.log(event.target)
    }
})