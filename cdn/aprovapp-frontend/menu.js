$(function() {

    $('.aprovapp-accordion').on('show', function (e) {
       $(this).prev().find('i').removeClass("icon-chevron-right");
       $(this).prev().find('i').addClass("icon-chevron-down");
    });

    $('.aprovapp-accordion').on('hide', function (e) {
       $(this).prev().find('i').addClass("icon-chevron-right");
       $(this).prev().find('i').removeClass("icon-chevron-down");
    });

})