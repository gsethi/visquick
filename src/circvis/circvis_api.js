/*EDGES*/

vq.CircVis.prototype.addEdges = function(edge_array,ignore_nodes) {
    var ignore = _.isBoolean(ignore_nodes) ? ignore_nodes : Boolean(false);
    var edges;
    if (_.isArray(edge_array)) {
        edges = this._insertEdges(edge_array);
    }
    else {
        edges = this._insertEdges([edge_array]);
    }
    this._drawNetworkLinks();

    if (ignore) { return;}

    var nodes = _.flatten(_.map(edges, function(edge) { return [edge.source,edge.target];}));
    this.addNodes(nodes);
};

vq.CircVis.prototype.removeEdges = function(edge_array, ignore_nodes) {
    var that = this;
    var ignore = _.isBoolean(ignore_nodes) ? ignore_nodes : Boolean(false);
    if (edge_array === 'all') {
            edge_array = this.chromoData._network.links_array;
        }

    if (_.isArray(edge_array)) {
        _.each(edge_array,function(edge) {that.chromoData._removeEdge(edge);});
    }
    else if ( _.isObject(edge_array)){
        this.chromoData._removeEdge(edge_array);
    }

    this._drawNetworkLinks();

    if(ignore) {return;}

    var removable = this._edgeListToNodeList(edge_array);
    var remaining_nodes = this._edgeListToNodeList(this.chromoData._network.links_array);
    var nodes_to_remove = _.difference(removable,remaining_nodes);
    this.removeNodes(nodes_to_remove);
};


vq.CircVis.prototype._insertEdges = function(edge_array) {
    //return the array of edges inserted
    return _.filter(_.map(edge_array, vq.models.CircVisData.prototype._insertEdge, this.chromoData),
        function(edge) { return !_.isNull(edge);});
};

/* NODES*/

vq.CircVis.prototype.addNodes = function(node_array) {
    var nodes;
    var that = this;
    if (_.isArray(node_array)) {
       nodes = this.chromoData._insertNodes(node_array);
    }
    else {
        nodes = this.chromoData._insertNodes([node_array]);
    }
    nodes = _.reject(nodes,function(n) {return _.isNull(n);});
    _.each(_.uniq(_.pluck(nodes,'chr')), function(chr) {
               that._drawTicks(chr);
               that._drawNetworkNodes(chr);
               that._drawWedgeData(chr);
           });
};

vq.CircVis.prototype.removeNodes = function(node_array) {
    var that = this;
    if (_.isFunction(node_array)) {
        node_array = _.filter(this.chromoData._network.nodes_array, node_array);
    }

    if (_.isArray(node_array)) {
        _.each(node_array, function(node) {
            that.chromoData._removeNode(node);
        });
        this.chromoData._retileNodes();
        _.each(_.uniq(_.pluck(node_array,'chr')), function(chr) {
            that._drawTicks(chr);
            that._drawNetworkNodes(chr);
            that._drawWedgeData(chr);
        });
    }
    else if (_.isObject(node_array)){
        that.chromoData._removeNode(node_array);
        that._drawTicks(node_array.chr);
        that._drawNetworkNodes(node_array.chr);
        that._drawWedgeData(node_array.chr);
    }

};


/*Utils*/

vq.CircVis.prototype._edgeListToNodeList = function(edges) {
    return _.uniq(_.flatten(_.chain(edges).map(function(edge){return [edge.source,edge.target];}).value()));
};