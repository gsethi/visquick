

/** private **/
vq.CircVis.prototype._add_network_nodes = function (chr,append) {
    var append = append || Boolean(false);
    var     dataObj = this.chromoData;

    var ideogram_obj = d3.select('.ideogram[data-region="'+chr+'"]');
    var innerRadius = dataObj._ideograms[chr].wedge.length > 0 ? dataObj._wedge[dataObj._ideograms[chr].wedge.length-1]._innerRadius :
                     (dataObj._plot.height / 2) - dataObj.ticks.outer_padding - dataObj.ticks.height;
    var network_radius = dataObj._network.network_radius[chr];

    var feature_angle = dataObj._ideograms[chr]._feature_angle;

    var network_node_y = dataObj._network.tile_nodes ?
        function(d) { return ( (network_radius - (d.level * 10)) * Math.sin(dataObj._ideograms[chr]._feature_angle(d.start) )); }  :
        function(d) { return  ( (network_radius) * Math.sin(dataObj._ideograms[chr]._feature_angle(d.start) )) };
    var network_node_x = dataObj._network.tile_nodes ?
        function(d) { return ((network_radius - (d.level * 10)) * Math.cos(dataObj._ideograms[chr]._feature_angle(d.start) )); } :
        function(d) { return ((network_radius) * Math.cos(dataObj._ideograms[chr]._feature_angle(d.start) )); };
    if (!append) {
        ideogram_obj.append('svg:g').attr('class','nodes');
    }

    var node = ideogram_obj
        .select('g.nodes')
        .selectAll('circle.node')
        .data(dataObj._network.nodes_array.filter(function(node) { return !node.children && node.chr == chr;}));

    node.enter().append('svg:circle')
        .attr('class','node')
        .attr('cx',0)
        .attr('cy',0)
        .attr('r',dataObj._network.node_radius)
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

    node.exit().remove();
};

vq.CircVis.prototype._add_network_links= function(svg_obj, append) {
    var append = append || Boolean(false);
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
        .attrTween('opacity',function(a) {
                                    var i =d3.interpolate(0.2,dataObj._network.link_alpha(a));
                                    return function(t) {return i(t)};
                                    });
        edges.exit().remove();


};

