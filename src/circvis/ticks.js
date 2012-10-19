
/** private **/
var _drawTicks = function(chr) {
    var that = this;

    if(!chromoData.ticks.render_ticks) { return;}

    var ideogram_obj = d3.select('.ideogram[data-region="'+chr+'"]');
    
    var outerRadius  = (chromoData._plot.height / 2);
    var outerTickRadius = outerRadius - chromoData.ticks.outer_padding;
    var innerRadius = outerTickRadius - chromoData.ticks.height;
    var inner = chromoData.ticks.tile_ticks ?  function(feature) {
        return innerRadius +
            (feature.level * (chromoData.ticks.wedge_height * 1.3)) ;} :
        function(feature) { return innerRadius;};

    var outer = function(feature) { return inner(feature) + chromoData.ticks.wedge_height;};
    var label_key = chromoData.ticks.label_key;

    var tick_fill = function(c) { return chromoData.ticks.fill_style(c,label_key);};
    var tick_stroke = function(c) { return chromoData.ticks.stroke_style(c,label_key);};
    var tick_angle = function(tick) { var angle = tick_length / inner(tick); return  isNodeActive(tick) ? angle * 2 : angle; };
    var isNodeActive = function(c) { return true;};

    var tick_width = Math.PI / 180 * chromoData.ticks.wedge_width;
    var tick_length = tick_width * innerRadius;

    var generateArcTween = function (point) {
        var _inner = inner(point);
        var _outer = outer(point);
        var _theta = chromoData._ideograms[point.chr].theta(point.start);
        var _tick_angle = tick_angle(point);
        return d3.svg.arc()
            .innerRadius(function(multiplier) { return _inner - (multiplier *4);})
            .outerRadius(function(multiplier) { return _outer + (multiplier * 4);})
            .startAngle(function(multiplier) { return _theta -  (multiplier * Math.PI / 360);})
            .endAngle(function(multiplier) {
                return _theta + _tick_angle + (multiplier * Math.PI /  360);});
    };

    var tick_key = chromoData._network.node_key;

    if(ideogram_obj.select('g.ticks').empty()) {
        ideogram_obj
            .append('svg:g')
            .attr('class','ticks');
    }

    var ticks = ideogram_obj.select('g.ticks').selectAll('path')
        .data(chromoData.ticks.data_map[chr],tick_key);

    ticks.enter().append('path')
        .attr('class',function(tick) { return tick[label_key];})
        .style('fill',tick_fill)
        .style('stroke',tick_stroke)
        .style('fill-opacity', 1e-6)
                .style('stroke-opacity', 1e-6)
        .on('mouseover',function(d){
            d3.select('text[data-label=\''+d[label_key]+'\']').attr('visibility','visible');
            chromoData.ticks.hovercard.call(this,d);
        })
        .on('mouseout',function(d){
            d3.select('text[data-label=\''+d[label_key]+'\']').attr('visibility','hidden');
        })
        .transition()
        .duration(800)
        .attrTween('d',function(a) {
            var i =d3.interpolate(4,0);
            var arc = generateArcTween(a);
            return function(t) {return arc(i(t));};
        })
        .style('fill-opacity', 1)
        .style('stroke-opacity', 1);

    ticks.exit()
        .transition()
        .duration(800)
        .attrTween('d',function(a) {
            var i =d3.interpolate(0,4);
            var arc = generateArcTween(a);
            return function(t) {return arc(i(t));};
        })
        .style('fill-opacity', 1e-6)
                .style('stroke-opacity', 1e-6)
        .remove();

};
