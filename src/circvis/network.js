

/** private **/
vq.CircVis.prototype._add_network = function () {
    var     dataObj = this.chromoData,
            w = this.width(),
            h = this.height();
    var network_radius = dataObj._network.radius;
    var node_behavior = function(d) {
       return (pv.Behavior.hovercard(
       {
           include_header : false,
           include_footer : false,
           self_hover : true,
           timeout : dataObj._plot.tooltip_timeout,
           data_config :
           dataObj._network.node_tooltipItems,
           tool_config : dataObj._network.node_tooltipLinks
       }
               ).call(this,d),

        dataObj.network_panel.activeNetworkNode(this.index),
        populateConnectedNodes(this.index),
        dataObj.network_panel.render()
        );};

    var link_behavior = function(c,d) {
       return (pv.Behavior.hovercard(
       {
           include_header : false,
           include_footer : false,
           self_hover : true,
           param_data : true,
           timeout : dataObj._plot.tooltip_timeout,
           data_config :
           dataObj._network.link_tooltipItems,
           tool_config :
           dataObj._network.link_tooltipLinks
       }
               ).call(this,d),

        dataObj.network_panel.activeNetworkLink(this.parent.index),
        dataObj.network_panel.render()
        );};

    var feature_angle = function(d) { return dataObj.startAngle_map[d.chr] + dataObj.theta[d.chr](d.start); };

    var network_node_y = dataObj._network.tile_nodes ?
                    function(d) { return h/2 + (-1 * (network_radius - (d.level * 10)) * Math.sin(feature_angle(d))); }  :
                  function(d) { return h/2 + (-1 * (network_radius) * Math.sin(feature_angle(d))) };
    var network_node_x = dataObj._network.tile_nodes ?
            function(d) { return w/2 + ((network_radius - (d.level * 10)) * Math.cos(feature_angle(d))); } :
            function(d) { return w/2 + ((network_radius) * Math.cos(feature_angle(d))); };
    var node_angle = function(d) { return feature_angle(d) + Math.PI /2;};

    var link_color = function(link) {return pv.color(dataObj._network.link_strokeStyle(link));};
    /** @private */
    var node_colors;

        if (dataObj._network.node_fillStyle() == 'ticks') {
            node_colors = function(node) { return dataObj.ticks.fill_style(node);};
        } else {
            node_colors =  function(node) {return pv.color(dataObj._network.node_fillStyle(node));};
        }

    var node_stroke =  function(node) {return pv.color(dataObj._network.node_strokeStyle(node));};

    var link_active = function(c,d)  {return (dataObj.network_panel.activeNetworkNode() == null ||
            this.parent.index == dataObj.network_panel.activeNetworkLink() ||
            d.source == dataObj.network_panel.activeNetworkNode() ||
            d.target == dataObj.network_panel.activeNetworkNode()) &&
            (linkDegreeInBounds(d.sourceNode) || linkDegreeInBounds(d.targetNode));};

    var link_width_active = function(node, link) {
        return (this.parent.index == dataObj.network_panel.activeNetworkLink() ||
                link.source == dataObj.network_panel.activeNetworkNode() ||
                link.target == dataObj.network_panel.activeNetworkNode() ) ?
                dataObj._network.link_line_width(node, link) + 1.0 : dataObj._network.link_line_width(node, link);
    };

    function link_angle(node, link) {
        return (feature_angle(link.sourceNode) - feature_angle(link.targetNode) <= -1 * Math.PI) ? "polar" :
                (feature_angle(link.sourceNode) - feature_angle(link.targetNode) >= Math.PI) ? "polar-reverse" :
                        (feature_angle(link.sourceNode) - feature_angle(link.targetNode) >= 0) ? "polar" : "polar-reverse";
    }

    function link_eccentricity(c, d) {
        return Math.round(Math.pow(Math.sin(Math.abs(feature_angle(d.sourceNode) - feature_angle(d.targetNode))/ 2 ) ,4)*100)/100;
    }

    var link_visible = function(c,d) { return true;};

    switch(dataObj._network.node_highlightMode) {
        case('isolate'):
            link_visible = link_active;
            break;
        case('brighten'):
        default:
    }

    function link_strokeStyle(c,d) {
        return (this.parent.index == dataObj.network_panel.activeNetworkLink() ||
                d.source == dataObj.network_panel.activeNetworkNode() ||
                d.target == dataObj.network_panel.activeNetworkNode() ) ?
                link_color(d).darker(2).alpha(dataObj._network.link_alpha(d)) :
                link_color(d).alpha(dataObj._network.link_alpha(d) );
    }
    function linkDegreeInBounds(node) {
        return ( dataObj._network.min_node_linkDegree == null ? true : node.linkDegree >= dataObj._network.min_node_linkDegree) &&
                ( dataObj._network.max_node_linkDegree == null ? true : node.linkDegree <= dataObj._network.max_node_linkDegree);
    }

    function populateConnectedNodes(nodes_array_index) {
        var nodes1 = dataObj._network.links_array.filter(function(d) {
            return d.source == nodes_array_index;}).map(function(b) {
            return {node:b.targetNode,linkValue:b.linkValue};
        });
        var nodes2 = dataObj._network.links_array.filter(function(d) {
            return d.target == nodes_array_index;}).map(function(b) {
            return {node:b.sourceNode,linkValue:b.linkValue};
        });
        dataObj.network_panel.connectedToActiveNetworkNode(nodes1.concat(nodes2));
    }

    function link_listener(c,link) {
        dataObj._network.link_listener(link);
    }

    dataObj.network_panel = this.event_panel.add(pv.Layout.Network)
            .def('connectedToActiveNetworkNode', [])
            .def('activeNetworkNode', null)
            .def('activeNetworkLink', null)
            .nodes(dataObj._network.nodes_array)
            .links(dataObj._network.links_array);

    dataObj.network_panel.link.add(pv.Line)
            .visible(link_visible)
            .interpolate(link_angle)
            .strokeStyle(link_strokeStyle)
            .eccentricity(link_eccentricity)
            .cursor('pointer')
            .event('mouseover',link_behavior)
            .event('mouseout', function() {
        dataObj.network_panel.activeNetworkLink(null);
        dataObj.network_panel.render();
    })
            .event('click', link_listener)
            .lineWidth(link_width_active);

    dataObj.network_panel.node
            .bottom(network_node_y)
            .left(network_node_x)
            .fillStyle(function(c,d) { return node_colors(c).alpha(0.9); })
            .strokeStyle(function(c) { return node_stroke(c).alpha(0.9); });

    dataObj.network_panel.node.add(pv.Dot)
            .shape('dot')
            .lineWidth(1)
            .radius(2.0)
            .angle(node_angle)
            .event('mouseover',node_behavior)
            //.title(dataObj._network.node_tooltipFormat)
            .event('mouseout', function() {
        dataObj.network_panel.activeNetworkNode(null);
        dataObj.network_panel.connectedToActiveNetworkNode([]);
        dataObj.network_panel.render();
    })
            .cursor('pointer')
            .event('click', function(c) {
        dataObj._network.node_listener(c, dataObj.network_panel.connectedToActiveNetworkNode());
    });
};
