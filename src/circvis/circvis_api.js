/*EDGES*/

vq.CircVis.prototype.addEdges = function(edge_array) {
    if (_.isArray(edge_array)) {
        this._insertEdges(edge_array);
    }
    else {
        this._insertEdge(edge_array);
    }
};

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
        this._removeAllEdges(edge);
    }
    else if (_.isObject(edge)) {
        this.chromoData._network.links_array = _.reject(this.chromoData._network.links_array,edge);
    }
    this._drawNetworkLinks(d3.select('g.links'));
};


vq.CircVis.prototype._removeAllEdges = function(num_edges) {
    var num = _.isNumber(num_edges) ? num_edges : this.chromoData._network.links_array.length
    var removed = this.chromoData._network.links_array.splice(0,num);
    this._drawNetworkLinks(d3.select('g.links'));
    var removable = this._edgeListToNodeList(removed);
    var remaining_nodes = this._edgeListToNodeList(this.chromoData._network.links_array);
    var nodes_to_remove = _.difference(removable,remaining_nodes);
    this.removeNodes(nodes_to_remove);

};

vq.CircVis.prototype._insertEdge = function(edge) {
    var nodes = [edge.node1,edge.node2];
    var that = this;
    var edge_arr=[];

    //quit if either node has an unmappable location
    if(_.any(nodes,function(a){return _.isNull(a) ||
        !_.include(_.keys(that.chromoData._chrom.groups),a.chr); })) {
        console.log('Unmappable chromosome in edge.');
        return;
    }
    //insert/recover both nodes
    edge_arr = that._insertNodes([nodes[0],nodes[1]]);

    //list of keys that aren't node1,node2
    var keys = _.chain(edge).keys().reject(function(a){return a=='node1'|| a== 'node2';}).value();
    //append the source,target nodes
    var insert_edge = _.chain(edge).pick(keys).extend({source:edge_arr[0],target:edge_arr[1]}).value();

    //search for edge in current data
    if (_.any(that.chromoData._network.links_array,function(link) { return that.same_edge(insert_edge,link);})){     //old link
    }else {  //insert new edge
        that.chromoData._network.links_array.push(insert_edge);  //add it
        that._drawNetworkLinks(d3.select('g.links'));
    }
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


/* NODES*/

vq.CircVis.prototype.addNodes = function(node_array) {
    if (_.isArray(node_array)) {
        this._insertNodes(node_array);
    }
    else {
        this._insertNode(node_array);
    }
};


vq.CircVis.prototype._removeNode = function(node) {
    var that = this;
    if (!_.isObject(node)) { return; }
    this.chromoData.ticks.data_map[node.chr] = _.reject(this.chromoData.ticks.data_map[node.chr],
        function(obj) { return that.same_feature(obj,node);});
    this.chromoData._network.nodes_array = _.reject(this.chromoData._network.nodes_array,
        function(obj) { return that.same_feature(obj,node);});
    this._remove_wedge_data(node);
};


vq.CircVis.prototype._removeAllNetworkNodes = function() {
    this.chromoData._network.nodes_array = _.filter(this.chromoData._network.nodes_array,function(node){ return !!node.children;});
};


vq.CircVis.prototype.removeNodes = function(node_array) {
    var that = this;
    var chr_batch={};
    if (_.isFunction(node_array)) {
        node_array = _.filter(this.chromoData._network.nodes_array, node_array);
    }
    if (_.isArray(node_array)) {
        _.each(node_array, function(node) {
            chr_batch[node.chr] = 1;
            that._removeNode(node);
        });
        _.each(_.keys(chr_batch), function(chr) {
            that._drawTicks(chr);
            that._drawNetworkNodes(chr);
            that._drawWedgeData(chr);
        });
    }
    else if (_.isNumber(node_array) || _.isObject(node_array)){
        that._removeNode(node_array);
        that._drawTicks(node_array.chr);
        that._drawNetworkNodes(node_array.chr);
        that._drawWedgeData(node_array.chr);
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
        that._add_wedge_data(node);
        return new_node;
    }
};


vq.CircVis.prototype._insertNodes = function(node_array) {
    var that = this,
     chr_batch = {},
        nodes = [];

    _.each(node_array, function(node) {
                var insert_node = that._insertNode(node);
                chr_batch[insert_node.chr] = 1;
                nodes.push(insert_node);
            }
        );
    _.each(_.keys(chr_batch), function(chr) {
            that._drawTicks(chr);
            that._drawNetworkNodes(chr);
            that._drawWedgeData(chr);
        });
    return nodes;
};


/*Utils*/

vq.CircVis.prototype._edgeListToNodeList = function(edges) {
    return _.uniq(_.flatten(_.chain(edges).map(function(edge){return [edge.source,edge.target];}).value()));
};