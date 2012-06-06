
/** private **/
vq.CircVis.prototype._add_ticks = function(chr,append) {
    var append = append || Boolean(false);

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

    function tick_translate(tick) {
        var radius = (outer(tick) + inner(tick)) / 2;
        var angle =  ((that.chromoData._ideograms[chr].theta(tick.start) * 180 / Math.PI) - 90);
        var tick_rotation = (that.chromoData._ideograms[chr].startAngle + that.chromoData._ideograms[chr].theta(tick.start) >= Math.PI ? 180 : 0);
        return "rotate(" + angle + ")translate(" +  radius + ")rotate("+tick_rotation+")";}

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
    if (append) {
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

//        ideogram_obj.selectAll('.ticks path')   //label
//                        .selectAll('svg.text')
//                        .data(dataObj.ticks.data_map[chr],tick_key)
//                           .enter()
//                           .append('text')
//                           .attr('transform', function(tick)  { return tick_translate(tick);})
//                           .attr("x",8)
//                           .attr('data-label',function(d) { return d[label_key];})
//                           .attr('class','labels')
//                           // .attr("dy",".35em")
//                           // .attr('stroke','black')
//                           // .attr("text-anchor","middle")
//                           // .attr('visibility','hidden')
//                           .text(function(d) { return d[label_key];});
//
        return;
                    }

               
               var hovercard  = vq.hovercard({
                    include_header : false,
                    include_footer : true,
                    self_hover : true,
                    timeout : dataObj._plot.tooltip_timeout,
                    data_config : dataObj.ticks.tooltipItems,
                    tool_config : dataObj.ticks.tooltipLinks
                });




    if (!append) {
   var ticks =  ideogram_obj
                .append('svg:g')
                .attr('class','ticks');
    }

          var tick_wedges= ideogram_obj.select('g.ticks').selectAll('path')
               .data(dataObj.ticks.data_map[chr]);

               tick_wedges.enter()
                .append('path')
                .attr('class',function(tick) { return tick[label_key];})
                .attr('fill',tick_fill)
                .attr('stroke',tick_stroke)
                .attr('d',d3.svg.arc()
                .innerRadius( inner)
                .outerRadius( outer)
                .startAngle(function(point) { return that.chromoData._ideograms[chr].theta(point.start);})
                .endAngle(function(point) {
                            return that.chromoData._ideograms[chr].theta(point.start) +
                            tick_angle(point);})
                ).on('mouseover',function(d){
                                    d3.select('text[data-label=\''+d[label_key]+'\']').attr('visibility','visible');

                                })
                .on('mouseout',function(d){
                    d3.select('text[data-label=\''+d[label_key]+'\']').attr('visibility','hidden');
                })
                .on('mouseover',hovercard);

            tick_wedges.exit().remove();


    var labels = ticks
                .selectAll('svg.text')
                .data(dataObj.ticks.data_map[chr])
                   .enter()
                   .append('text')
                   .attr('transform', function(tick)  { return tick_translate(tick);})
                   .attr("x",8)
                   .attr('data-label',function(d) { return d[label_key];})
                   .attr('class','labels')
                   .attr("dy",".35em")
                   .attr('stroke','black')
                   .attr("text-anchor","middle")
                   .attr('visibility','hidden')
                   .text(function(d) { return d[label_key];});

};


vq.CircVis.prototype._draw_ticks = function() {

//    d3.selectAll('.ticks')
//       .transition()
//       .duration(1200)
//       .attr('opacity',1.0)

};
