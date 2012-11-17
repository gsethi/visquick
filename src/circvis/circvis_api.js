/*EDGES*/

circvis.addEdges = function(edge_array) {
    var edges;
    if (_.isArray(edge_array)) {
        edges = this._insertEdges(edge_array);
    }
    else {
        edges = this._insertEdges([edge_array]);
    }

    var nodes = _.flatten(_.map(edges, function(edge) { return [edge.source,edge.target];}));
    this.addNodes(nodes);

    _drawNetworkLinks();

};

circvis.removeEdges = function(edge_array, ignore_nodes) {
    var ignore = _.isBoolean(ignore_nodes) ? ignore_nodes : Boolean(false);
    if (edge_array === 'all') {
            edge_array = chromoData._network.links_array;
        }

    if (_.isArray(edge_array)) {
        _.each(edge_array,function(edge) {chromoData._removeEdge(edge);});
    }
    else if ( _.isObject(edge_array)){
        chromoData._removeEdge(edge_array);
    }

    if(ignore) {return;}

    var removable = _edgeListToNodeList(edge_array);
    var remaining_nodes = _edgeListToNodeList(chromoData._network.links_array);
    var nodes_to_remove = _.difference(removable,remaining_nodes);
    this.removeNodes(nodes_to_remove);

    _drawNetworkLinks();
};


circvis._insertEdges = function(edge_array) {
    //return the array of edges inserted
    return _.filter(_.map(edge_array, vq.models.CircVisData.prototype._insertEdge, chromoData),
        function(edge) { return !_.isNull(edge);});
};

/* NODES*/

circvis.addNodes = function(node_array) {
    var nodes;
    var that = this;
    if (_.isArray(node_array)) {
       nodes = chromoData._insertNodes(node_array);
    }
    else {
        nodes = chromoData._insertNodes([node_array]);
    }
    nodes = _.reject(nodes,function(n) {return _.isNull(n);});
    _.each(_.uniq(_.pluck(nodes,'chr')), function(chr) {
               _drawTicks(chr);
               _drawNetworkNodes(chr);
               _drawWedgeData(chr);
           });
};

circvis.removeNodes = function(node_array) {
    var that = this;
    if (_.isFunction(node_array)) {
        node_array = _.filter(chromoData._data.features, node_array);
    }

    if (_.isArray(node_array)) {
        _.each(node_array, function(node) {
            chromoData._removeNode(node);
        });
        chromoData._retile();
        _.each(_.uniq(_.pluck(node_array,'chr')), function(chr) {
            _drawTicks(chr);
            _drawNetworkNodes(chr);
            _drawWedgeData(chr);
        });
    }
    else if (_.isObject(node_array)){
        chromoData._removeNode(node_array);
        _drawTicks(node_array.chr);
        _drawNetworkNodes(node_array.chr);
        _drawWedgeData(node_array.chr);
    }

};


/*Utils*/

 function _edgeListToNodeList (edges) {
    return _.uniq(_.flatten(_.chain(edges).map(function(edge){return [edge.source,edge.target];}).value()));
};