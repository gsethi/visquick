
/** private **/
vq.CircVis.prototype._add_ticks = function(ideogram_obj,chr) {
    var that = this;
    var dataObj = that.chromoData;
    var outerRadius  = (dataObj._plot.height / 2);

    var outerTickRadius = outerRadius - dataObj.ticks.outer_padding;
    var innerRadius = outerTickRadius - dataObj.ticks.height;
    var inner = dataObj.ticks.tile_ticks ?  function(feature) {
        return innerRadius +
            (feature.level * (dataObj.ticks.wedge_height * 1.3)) ;} :
                function(feature) { return innerRadius;};

    var outer = function(feature) { return inner(feature) + dataObj.ticks.wedge_height;};
    var tick_fill = function(c) { return dataObj.ticks.fill_style(c);};
    var tick_stroke = function(c) { return dataObj.ticks.stroke_style(c);};
    var label_key = dataObj.ticks.label_key;

    var tick_angle = function(tick) { var angle = tick_length / inner(tick); return  isNodeActive(tick) ? angle * 2 : angle; };
    var isNodeActive = function(c) { return true;};
//    ( c.active ||
//            (dataObj.tick_panel.activeTickList().filter(function(d) { return d == c[label_key];}).length > 0));};

    var tick_width = Math.PI / 180 * dataObj.ticks.wedge_width;
    var tick_length = tick_width * innerRadius;

    function tick_translate(tick) {
        var radius = (outer(tick) + inner(tick)) / 2;
        var angle =  ((that.chromoData._ideograms[chr].theta(tick.start) * 180 / Math.PI) - 90);
        var tick_rotation = (that.chromoData._ideograms[chr].startAngle + that.chromoData._ideograms[chr].theta(tick.start) >= Math.PI ? 180 : 0);
        return "rotate(" + angle + ")translate(" +  radius + ")rotate("+tick_rotation+")";}

    function tick_rotate(tick) {
        return "rotate(" + that.chromoData._ideograms[chr].theta(tick.start) +")";}


   var ticks =  ideogram_obj
                .append('svg:g')
                .attr('class','ticks');


          ticks.selectAll('svg.path')
               .data(dataObj.ticks.data_map[chr])
               .enter().append('svg:path')
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
                                });

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
//
//
//    if (dataObj.ticks.display_legend){
//
//        var corner = dataObj.ticks.legend_corner;
//
//        var legend = this.event_panel.add(pv.Panel)
//                .height(dataObj.ticks.label_map.length * 14)
//                .width(60)
//                .title('Tick Legend');
//
//        switch(corner) {
//            case 'ne' :
//                legend.right(0).top(0);
//                break;
//            case 'se' :
//                legend.right(0).bottom(0);
//                break;
//            case 'sw' :
//                legend.left(0).bottom(0);
//                break;
//            case 'nw' :
//            default :
//                legend.left(0).top(0);
//        }
//
//        legend.add(pv.Label)
//                .top(10)
//                .left(10)
//                .font("11px helvetica")
//                .text("Tick Legend");
//        legend.add(pv.Bar)
//                .data(dataObj.ticks.label_map)
//                .left(10)
//                .top(function() {return 20 + 15*this.index;} )
//                .fillStyle(function(d) {return tick_fill(d.key);})
//                .width(36)
//                .height(12)
//                .anchor("right").add(pv.Label)
//                .text(function(d) { return d.label;})
//                .font("11px helvetica")
//                .textMargin(6)
//                .textAlign("left");
//    }
};