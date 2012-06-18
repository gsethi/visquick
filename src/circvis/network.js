

/** private **/
vq.CircVis.prototype._drawNetworkNodes = function (chr) {
    var     dataObj = this.chromoData;

    var network_radius = dataObj._network.network_radius[chr];
    var ideogram_obj = d3.select('.ideogram[data-region="'+chr+'"]');

    if(ideogram_obj.select('g.nodes').empty()) {
        ideogram_obj.append('svg:g').attr('class','nodes');
    }

    var node = ideogram_obj
        .select('g.nodes')
        .selectAll('circle.node')
        .data(dataObj._network.nodes_array.filter(function(node) { return !node.children && node.chr == chr;}),dataObj._network.node_key);

    node.enter().append('svg:circle')
        .attr('class','node')
        .attr('cx',0)
        .attr('cy',0)
        .attr('r',0)
        .attr('fill',dataObj._network.node_fillStyle)
        .attr('stroke',dataObj._network.node_strokeStyle)
        .attr('transform', function(node) {
            return 'rotate('+ ((dataObj._ideograms[chr].theta(node.start) / Math.PI * 180) - 90) +')translate(' + network_radius + ')';
        })
        .on('mouseover',function(d){d3.select(this).attr('opacity',1.0); dataObj._network.node_hovercard.call(this,d);})
        .transition()
        .delay(100)
        .duration(800)
        .attrTween('r',function(a) {
                                var i =d3.interpolate(dataObj._network.node_radius(a)*4,dataObj._network.node_radius(a));
                                return function(t) {return i(t)};
                                })
        .attrTween('opacity',function() {
                                    var i =d3.interpolate(0.2,1);
                                    return function(t) {return i(t)};
                                    });
    node.exit()
    .transition()
    .delay(100)
        .duration(800)
        .attrTween('r',function(a) {
                                var i =d3.interpolate(dataObj._network.node_radius(a),dataObj._network.node_radius(a)*4);
                                return function(t) {return i(t)};
                                })
        .attrTween('opacity',function() {
                                    var i =d3.interpolate(1,0);
                                    return function(t) {return i(t)};
                                    })
    .remove();
};

vq.CircVis.prototype._drawNetworkLinks= function(svg_obj) {

    var dataObj = this.chromoData;

    var bundle = d3.layout.bundle();


    var line = d3.svg.line.radial()
        .interpolate("bundle")
        .tension(.65)
        .radius(function(d) { return d.radius !== undefined ?
            d.radius :
            dataObj._network.network_radius[d.chr]
        })
        .angle(function(d) { return d.angle !== undefined ?
            d.angle :
            dataObj._ideograms[d.chr]._feature_angle(d.start);
        });

    var strokeWidthTween = function(begin,end){ return function(a) {
                                                var i =d3.interpolate(begin(a),end(a));
                                                return function(t) {return i(t)+'px'};
                                                };
                            };

    var opacityTween = function(begin,end) { return function(a) {
                                    var i =d3.interpolate(begin(a),end(a));
                                    return function(t) {return i(t)};
                                    };
                                };

    var edges = svg_obj.selectAll("path.link")
        .data(bundle(dataObj._network.links_array).map(function(b, index) { return _.extend(dataObj._network.links_array[index],{spline:b});}));

        edges
        .enter().insert("svg:path")
        .attr("class", function(d) {
            return "link t_" + d.source.chr + " p_"+ d.target.chr;
        })
        .attr('visibility','hidden')
         .attr('fill','none')
         .attr('stroke','steelblue')
        .attr('stroke-width',8)
        .attr('opacity',0.2)
        .attr("d", function(link) { return line(link.spline);})
        .on('mouseover',function(d){
            d3.select(this).attr('opacity',1.0); dataObj._network.link_hovercard.call(this,d);
        })
        .on('mouseout',function(d){d3.select(this).attr('opacity',dataObj._network.link_alpha(d));})
        .transition()
        .delay(100)
        .duration(800)
        .attr('visibility','visible')
        .attrTween('stroke-width',strokeWidthTween(function(a) { return dataObj._network.link_line_width(a)*3;},function(a) { return dataObj._network.link_line_width(a);}))
        .attrTween('opacity',opacityTween(function() { return 0.2; },function(a) { return dataObj._network.link_alpha(a);})
            );
                                    
        edges.exit()
        .transition()
        .delay(100)
        .duration(800)
         .attrTween('opacity',opacityTween(function(a) { return dataObj._network.link_alpha(a);},function() { return 0.0; }) )
         .attrTween('stroke-width',strokeWidthTween(function(a) { return dataObj._network.link_line_width(a);},function(a) { return dataObj._network.link_line_width(a)*3;}))
        .remove();


};

