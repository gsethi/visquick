

/** private **/
vq.CircVis.prototype._add_network_nodes = function (chr,append) {
    var append = append || Boolean(false);
    var     dataObj = this.chromoData;

    var ideogram_obj = d3.select('.ideogram[data-region="'+chr+'"]');
    var innerRadius = dataObj._ideograms[chr].wedge.length > 0 ? dataObj._wedge[dataObj._ideograms[chr].wedge.length-1]._innerRadius :
                     (dataObj._plot.height / 2) - dataObj.ticks.outer_padding - dataObj.ticks.height;
    var network_radius = dataObj._network.network_radius[chr];
//    var node_behavior = function(d) {
//       return (pv.Behavior.hovercard(
//       {
//           include_header : false,
//           include_footer : false,
//           self_hover : true,
//           timeout : dataObj._plot.tooltip_timeout,
//           data_config :
//           dataObj._network.node_tooltipItems,
//           tool_config : dataObj._network.node_tooltipLinks
//       }
//               ).call(this,d),
//
//        dataObj.network_panel.activeNetworkNode(this.index),
//        populateConnectedNodes(this.index),
//        dataObj.network_panel.render()
//        );};
//
//    var link_behavior = function(c,d) {
//       return (pv.Behavior.hovercard(
//       {
//           include_header : false,
//           include_footer : false,
//           self_hover : true,
//           param_data : true,
//           timeout : dataObj._plot.tooltip_timeout,
//           data_config :
//           dataObj._network.link_tooltipItems,
//           tool_config :
//           dataObj._network.link_tooltipLinks
//       }
//               ).call(this,d),
//
//        dataObj.network_panel.activeNetworkLink(this.parent.index),
//        dataObj.network_panel.render()
//        );};



    var feature_angle = dataObj._ideograms[chr]._feature_angle;

    var network_node_y = dataObj._network.tile_nodes ?
        function(d) { return ( (network_radius - (d.level * 10)) * Math.sin(dataObj._ideograms[chr]._feature_angle(d.start) )); }  :
        function(d) { return  ( (network_radius) * Math.sin(dataObj._ideograms[chr]._feature_angle(d.start) )) };
    var network_node_x = dataObj._network.tile_nodes ?
        function(d) { return ((network_radius - (d.level * 10)) * Math.cos(dataObj._ideograms[chr]._feature_angle(d.start) )); } :
        function(d) { return ((network_radius) * Math.cos(dataObj._ideograms[chr]._feature_angle(d.start) )); };
    //var node_angle = function(d) { return feature_angle(d.start) + Math.PI /2;};

    //var link_color = function(link) {return pv.color(dataObj._network.link_strokeStyle(link));};
    /** @private */
//    var node_colors;
//
//        if (dataObj._network.node_fillStyle() == 'ticks') {
//            node_colors = function(node) { return dataObj.ticks.fill_style(node);};
//        } else {
//            node_colors =  function(node) {return pv.color(dataObj._network.node_fillStyle(node));};
//        }
//
//    var node_stroke =  function(node) {return pv.color(dataObj._network.node_strokeStyle(node));};
//
//    var link_active = function(c,d)  {return (dataObj.network_panel.activeNetworkNode() == null ||
//            this.parent.index == dataObj.network_panel.activeNetworkLink() ||
//            d.source == dataObj.network_panel.activeNetworkNode() ||
//            d.target == dataObj.network_panel.activeNetworkNode()) &&
//            (linkDegreeInBounds(d.sourceNode) || linkDegreeInBounds(d.targetNode));};
//
//    var link_width_active = function(node, link) {
//        return (this.parent.index == dataObj.network_panel.activeNetworkLink() ||
//                link.source == dataObj.network_panel.activeNetworkNode() ||
//                link.target == dataObj.network_panel.activeNetworkNode() ) ?
//                dataObj._network.link_line_width(node, link) + 1.0 : dataObj._network.link_line_width(node, link);
//    };

//    var link_visible = function(c,d) { return true;};
//
//    switch(dataObj._network.node_highlightMode) {
//        case('isolate'):
//            link_visible = link_active;
//            break;
//        case('brighten'):
//        default:
//    }
//
//    function link_strokeStyle(c,d) {
//        return (this.parent.index == dataObj.network_panel.activeNetworkLink() ||
//                d.source == dataObj.network_panel.activeNetworkNode() ||
//                d.target == dataObj.network_panel.activeNetworkNode() ) ?
//                link_color(d).darker(2).alpha(dataObj._network.link_alpha(d)) :
//                link_color(d).alpha(dataObj._network.link_alpha(d) );
//    }
//    function linkDegreeInBounds(node) {
//        return ( dataObj._network.min_node_linkDegree == null ? true : node.linkDegree >= dataObj._network.min_node_linkDegree) &&
//                ( dataObj._network.max_node_linkDegree == null ? true : node.linkDegree <= dataObj._network.max_node_linkDegree);
//    }
//
//    function link_listener(c,link) {
//        dataObj._network.link_listener(link);
//    }


//    ideogram_obj.selectAll('path.link')
//                .data(splines = bundle(dataObj._network.links_array))
//                .enter().append('svg:path')
//                .attr('class','link')
//                .attr('d',line);
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



//    dataObj.network_panel = this.event_panel.add(pv.Layout.Network)
//            .def('connectedToActiveNetworkNode', [])
//            .def('activeNetworkNode', null)
//            .def('activeNetworkLink', null)
//            .nodes(dataObj._network.nodes_array)
//            .links(dataObj._network.links_array);
//
//    dataObj.network_panel.link.add(pv.Line)
//            .visible(link_visible)
//            .interpolate(link_angle)
//            .strokeStyle(link_strokeStyle)
//            .eccentricity(link_eccentricity)
//            .cursor('pointer')
//            .event('mouseover',link_behavior)
//            .event('mouseout', function() {
//        dataObj.network_panel.activeNetworkLink(null);
//        dataObj.network_panel.render();
//    })
//            .event('click', link_listener)
//            .lineWidth(link_width_active);
//
//    dataObj.network_panel.node
//            .bottom(network_node_y)
//            .left(network_node_x)
//            .fillStyle(function(c,d) { return node_colors(c).alpha(0.9); })
//            .strokeStyle(function(c) { return node_stroke(c).alpha(0.9); });
//
//    dataObj.network_panel.node.add(pv.Dot)
//            .shape('dot')
//            .lineWidth(1)
//            .radius(2.0)
//            .angle(node_angle)
//            .event('mouseover',node_behavior)
//            //.title(dataObj._network.node_tooltipFormat)
//            .event('mouseout', function() {
//        dataObj.network_panel.activeNetworkNode(null);
//        dataObj.network_panel.connectedToActiveNetworkNode([]);
//        dataObj.network_panel.render();
//    })
//            .cursor('pointer')
//            .event('click', function(c) {
//        dataObj._network.node_listener(c, dataObj.network_panel.connectedToActiveNetworkNode());
//    });
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

    svg_obj.selectAll("path.link")
        .data(bundle(dataObj._network.links_array).map(function(b, index) { return _.extend(dataObj._network.links_array[index],{spline:b});}))
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



};

