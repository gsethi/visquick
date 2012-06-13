vq.CircVis.prototype.addEdges = function(edge_array) {
    if (_.isArray(edge_array)) {
        this._insertEdges(edge_array);
    }
    else {
        this._insertEdge(edge_array);
    }
};

vq.CircVis.prototype.addNodes = function(node_array) {
    if (_.isArray(node_array)) {
        this._insertNodes(node_array);
    }
    else {
        this._insertNode(node_array);
    }
};

vq.CircVis.prototype._insertNodes = function(node_array) {
    _.each(node_array, vq.CircVis.prototype._insertNode, this);
};

vq.CircVis.prototype._insertEdges = function(edge_array) {
    _.each(edge_array, vq.CircVis.prototype._insertEdge, this);
};

vq.CircVis.prototype.same_feature = function(n1,n2) {
         return this.chromoData._network.node_key(n1) ==  this.chromoData._network.node_key(n2);
     };

vq.CircVis.prototype.same_edge= function(link1,link2) {
    return this.same_feature(link1.source,link2.source) &&
        this.same_feature(link1.target,link2.target);
 };

vq.CircVis.prototype._insertEdge = function(edge) {
    var nodes = [edge.node1,edge.node2];
    var that = this;
    var edge_arr=[];

        _.each(nodes,function(node) {
               edge_arr.push(that._insertNode(node));
        }
    );
    if(_.any(edge_arr,function(a){return _.isNull(a);})) { console.log('Unmappable chromosome in edge.');}
    //list of keys that aren't node1,node2
    var keys = _.chain(edge).keys().reject(function(a){return a=='node1'|| a== 'node2';}).value();
    //append the source,target nodes
    var insert_edge = _.chain(edge).pick(keys).extend({source:edge_arr[0],target:edge_arr[1]}).value();

    //search for edge in current data
    if (_.any(that.chromoData._network.links_array,function(link) { return that.same_edge(insert_edge,link);})){     //old link
    }else {  //insert new edge
        that.chromoData._network.links_array.push(insert_edge);  //add it
        that._add_network_links(d3.select('g.links'));
    }
};


vq.CircVis.prototype._insertNode = function(node) {

    var that = this;
    var node_parent_map = {};

    _.chain(that.chromoData._network.nodes_array).first(that.chromoData._chrom.keys.length+1)
        .each(function(root,index){node_parent_map[root.chr]=index;});

                if (!_.include(_.keys(that.chromoData._chrom.groups),node.chr)) {return null;}
                //previously loaded this node, pull it from the node_array
            if ( _.any(that.chromoData._network.nodes_array,
                                        function(tick) { return that.same_feature(tick,node);})) {
                return _.find(that.chromoData._network.nodes_array,
                                    function(n) { return that.same_feature(n,node);});
            } else {
                vq.utils.VisUtils.layoutTile(node,that.chromoData.ticks.data_map[node.chr].length,
                    that.chromoData.ticks.data_map[node.chr],that.chromoData.ticks.overlap_distance);
                that.chromoData.ticks.data_map[node.chr].push(node);
                var parent = _.find(that.chromoData._network.nodes_array, function(n) { return n.chr == node.chr});
                var new_node = _.extend({parent:that.chromoData._network.nodes_array[node_parent_map[node.chr]]},node);
                parent.children.push(new_node);
                that.chromoData._network.nodes_array.push(new_node);
                that._add_ticks(node.chr);
                that._add_network_nodes(node.chr,true);
                that._add_wedge_data(node);
                return new_node;
            }
 };