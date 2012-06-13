
/** private **/
vq.CircVis.prototype._add_ticks = function(chr) {
    var that = this;

    var ideogram_obj = d3.select('.ideogram[data-region="'+chr+'"]');
    var dataObj = that.chromoData;

    var outerRadius  = (dataObj._plot.height / 2);
    var outerTickRadius = outerRadius - dataObj.ticks.outer_padding;
    var innerRadius = outerTickRadius - dataObj.ticks.height;
    var inner = dataObj.ticks.tile_ticks ?  function(feature) {
        return innerRadius +
            (feature.level * (dataObj.ticks.wedge_height * 1.3)) ;} :
                function(feature) { return innerRadius;};

    var outer = function(feature) { return inner(feature) + dataObj.ticks.wedge_height;};
    var label_key = dataObj.ticks.label_key;

    var tick_fill = function(c) { return dataObj.ticks.fill_style(c,label_key);};
    var tick_stroke = function(c) { return dataObj.ticks.stroke_style(c,label_key);};
    var tick_angle = function(tick) { var angle = tick_length / inner(tick); return  isNodeActive(tick) ? angle * 2 : angle; };
    var isNodeActive = function(c) { return true;};

    var tick_width = Math.PI / 180 * dataObj.ticks.wedge_width;
    var tick_length = tick_width * innerRadius;

    var generateArcTween = function (point) {
        var _inner = inner(point);
        var _outer = outer(point);
        var _theta = that.chromoData._ideograms[chr].theta(point.start);
        var _tick_angle = tick_angle(point);
     return d3.svg.arc()
        .innerRadius(function(multiplier) { return _inner - (multiplier *4);})
        .outerRadius(function(multiplier) { return _outer + (multiplier * 4);})
        .startAngle(function(multiplier) { return _theta -  (multiplier * Math.PI / 360);})
        .endAngle(function(multiplier) {
            return _theta + _tick_angle + (multiplier * Math.PI /  360);});
    };

    var tick_key = dataObj._network.node_key; //.tick_key = function(tick) { return tick.chr+':'+tick.start + ':' + tick.end + ':' + tick[label_key]};

    if(ideogram_obj.select('g.ticks').empty()) {
                ideogram_obj
                    .append('svg:g')
                    .attr('class','ticks');
        }

       var ticks = ideogram_obj.select('g.ticks').selectAll('path')
                    .data(dataObj.ticks.data_map[chr],tick_key);

                    ticks.enter().append('path')
                    .attr('class',function(tick) { return tick[label_key];})
                            .attr('fill',tick_fill)
                            .attr('stroke',tick_stroke)
                            .attr('visibility','hidden')
                            .attr('d',d3.svg.arc()
                            .innerRadius( inner)
                            .outerRadius( outer)
                            .startAngle(function(point) { return that.chromoData._ideograms[chr].theta(point.start);})
                            .endAngle(function(point) {
                                        return that.chromoData._ideograms[chr].theta(point.start) +
                                        tick_angle(point);})
                            ).on('mouseover',function(d){
                                                d3.select('text[data-label=\''+d[label_key]+'\']').attr('visibility','visible');
                                                dataObj.ticks.hovercard.call(this,d);
                                            })
                                            .on('mouseout',function(d){
                                                d3.select('text[data-label=\''+d[label_key]+'\']').attr('visibility','hidden');
                                            })
                    .transition()
                    .attr('visibility','visible')
                    .delay(100)
                    .duration(800)
                    .attrTween('d',function(a) {
                        var i =d3.interpolate(4,0);
                         var arc = generateArcTween(a);
                        return function(t) {return arc(i(t));};
                        })
                        .attrTween('opacity', function(a) {
                            var i=d3.interpolate(0.2,1.0);
                                return function(t) {return  i(t);}
                        });

                        ticks.exit().remove();

};
