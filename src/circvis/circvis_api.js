vq.CircVis.prototype.removeEdges = function(edge_array) {
    if (_.isArray(edge_array)) {
        _.each(edge_aray,function(edge) {this._removeEdge(edge);});
    }
    else if (_.isNumber(edge_array) || _.isObject(edge_array)){
        this._removeEdge(edge_array);
    }
    else if (edge_array === 'all') {
        this._removeAllEdges();
    }
};

vq.CircVis.prototype._removeEdge = function(edge) {
    var edges = [];
    if (_.isNumber(edge)) {
        edges = this.chromoData._network.links_array.splice(0,edge);  //remove  
        //      this.removeNodes(this._edgeListToNodeList(edges));
    }
    else if (_.isObject(edge)) {
        this.chromoData._network.links_array = _.reject(this.chromoData._network.links_array,edge);
    }
    this._add_network_links(d3.select('g.links'));
};

vq.CircVis.prototype._removeAllEdges = function(edge) {
    var removed = this.chromoData._network.links_array.splice(0,this.chromoData._network.links_array.length);
    this._add_network_links(d3.select('g.links'));
    var removable = this._edgeListToNodeList(removed);
    var remaining_nodes = this._edgeListToNodeList(this.chromoData._network.links_array);
    if (!remaining_nodes.length) { this.removeNodes('all'); return;}
    var nodes_to_remove = _.difference(removable,remaining_nodes);
    this.removeNodes(nodes_to_remove);

};


vq.CircVis.prototype.removeNodes = function(node_array) {
    var that = this;
    if (_.isArray(node_array)) {
        _.each(node_array, function(node) {
            that._removeNode(node);
        });
    }
    else if (_.isNumber(node_array) || _.isObject(node_array)){
        that._removeNode(node_array);
    }
    else if (node_array === 'all') {
        _.each(_.keys(that.chromoData.ticks.data_map), function(chr) {
            that.chromoData.ticks.data_map[chr] = [];
            that.chromoData._network.nodes_array = [];
            that._add_ticks(chr);
            that._add_network_nodes(chr);
            that.chromoData._ideograms[chr].wedge = _.map(that.chromoData._ideograms[chr].wedge,function() { return [];});
            that._drawWedgeData(chr);
        });
        return;
    }
};

vq.CircVis.prototype._edgeListToNodeList = function(edges) {
    return _.uniq(_.flatten(_.chain(edges).map(function(edge){return [edge.source,edge.target];}).value()));
};

vq.CircVis.prototype._removeNode = function(node) {
    if (!_.isObject(node)) { return; }
    this.chromoData.ticks.data_map[node.chr] = _.reject(this.chromoData.ticks.data_map[node.chr],
        function(obj) { return obj === node;});
    this.chromoData._network.nodes_array = _.reject(this.chromoData._network.nodes_array,
            function(obj) { return obj === node;});
    this._remove_wedge_data(node);
    this._add_ticks(node.chr);
    this._add_network_nodes(node.chr);
};

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

vq.CircVis.prototype.same_edge= function(rf_assoc,circvis_assoc) {
    return this.same_feature(rf_assoc.source,circvis_assoc.source) &&
        this.same_feature(rf_assoc.target,circvis_assoc.target);
};

vq.CircVis.prototype._insertEdge = function(edge) {
    var nodes = [edge.node1,edge.node2];
    var that = this;
    var edge_arr=[];

    //quit if either node has an unmappable locationß
    _.each(nodes,function(node) {
        if (!_.include(_.keys(that.chromoData._chrom.groups),node.chr)) {return null;}
    });
    //insert/recover both nodes
    _.each(nodes,function(node) {
            edge_arr.push(that._insertNode(node));
        }
    );
    if(_.any(edge_arr,function(a){return _.isNull(a);})) { console.log('Unmappable chromosome in edge.');
        return;
    }
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
