vq.CircVis.prototype.addEdges = function(edge_array) {
    if (_.isArray(edge_array)) {
        this._insertEdges(edge_array);
    }
    else {
        this._insertEdge(edge_array);
    }
};

vq.CircVis.prototype._insertEdges = function(edge_array) {
    _.each(edge_array, vq.CircVis.prototype._insertEdge, this);
};

vq.CircVis.prototype._insertEdge = function(edge) {
    var nodes = [edge.node1,edge.node2];
    var that = this;
    var edge_arr=[];
    var node_parent_map = {};
     //root node + chrom keyes

    _.chain(that.chromoData._network.nodes_array).first(that.chromoData._chrom.keys.length+1)
        .each(function(root,index){node_parent_map[root.chr]=index;});

        function same_feature(n1,n2) {
            return that.chromoData._network.node_key(n1) ==  that.chromoData._network.node_key(n2);
        }
    function same_edge(link1,link2) {
       return same_feature(link1.source,link2.source) &&
                    same_feature(link1.target,link2.target);
    }
        _.each(nodes,function(node,index) {
                //previously loaded this node, pull it from the node_array
            if ( _.any(that.chromoData._network.nodes_array,
                                        function(tick) { return same_feature(tick,node);})) {
                var old_node = _.find(that.chromoData._network.nodes_array,
                                    function(n) { return same_feature(n,node);});
                edge_arr.push(old_node);
            } else {
                vq.utils.VisUtils.layoutTile(node,that.chromoData.ticks.data_map[node.chr].length,
                    that.chromoData.ticks.data_map[node.chr],that.chromoData.ticks.overlap_distance);
                that.chromoData.ticks.data_map[node.chr].push(node);
                var parent = _.find(that.chromoData._network.nodes_array, function(n) { return n.chr == node.chr});
                var new_node = _.extend({parent:that.chromoData._network.nodes_array[node_parent_map[node.chr]]},node);
                parent.children.push(new_node);
                that.chromoData._network.nodes_array.push(new_node);
                edge_arr.push(new_node);
                that._add_ticks(node.chr,true);
                that._add_network_nodes(node.chr,true);
                that._add_wedge_data(node);
            }
        }
    );
    //list of keys that aren't node1,node2
    var keys = _.chain(edge).keys().reject(function(a){return a=='node1'|| a== 'node2';}).value();
    //append the source,target nodes
    var insert_edge = _.chain(edge).pick(keys).extend({source:edge_arr[0],target:edge_arr[1]}).value();

    //search for edge in current data
    if (_.any(that.chromoData._network.links_array,function(link) { return same_edge(insert_edge,link);})){     //old link
       // console.log('already have it!');
    }else {  //insert new edge
        that.chromoData._network.links_array.push(insert_edge);  //add it
        that._add_network_links(d3.select('g.links'));
    }
};