!function($) {
    $.fn.scatterplot = function(options) {
        return this.each(function() {
            var $this = $(this);
            var vis = $(this).data("visquick.d3.scatterplot");
            if (!vis) {
                $this.data("visquick.d3.scatterplot", (vis = new vq.ScatterPlot()));
                vis.draw(options);
            }
        });
    };

    $.fn.reset_data = function(data_array) {
        return this.each(function() {
            var vis = $(this).data("visquick.d3.scatterplot");
            if (vis) {
                vis.resetData(data_array);
            }
        });
    };

    $.fn.enable_zoom = function() {
        return this.each(function() {
            var vis = $(this).data("visquick.d3.scatterplot");
            if (vis) {
                vis.enableZoom();
            }
        });
    };

    $.fn.enable_brush = function() {
        return this.each(function() {
            var vis = $(this).data("visquick.d3.scatterplot");
            if (vis) {
                vis.enableBrush();
            }
        });
    };
}(window.jQuery);
