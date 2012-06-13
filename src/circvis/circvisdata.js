

vq.models.CircVisData = function(data) {

    vq.models.VisData.call(this, data);

    this.setDataModel();

    if (this.getDataType() == 'vq.models.CircVisData') {
        this._build_data(this.getContents())
    } else {
        console.warn('Unrecognized JSON object.  Expected vq.models.CircVisData object.');
    }
};


vq.models.CircVisData.prototype = vq.extend(vq.models.VisData);

vq.models.CircVisData.prototype.setDataModel = function() {
    this._dataModel = [
        {label: '_plot.width', id: 'PLOT.width', defaultValue: 400},
        {label: '_plot.height', id: 'PLOT.height', defaultValue: 400},
        {label : '_plot.container', id:'PLOT.container', optional : true},
        {label: 'vertical_padding', id: 'PLOT.vertical_padding', defaultValue: 0},
        {label: 'horizontal_padding', id: 'PLOT.horizontal_padding', defaultValue: 0},
        {label : '_chrom.keys', id: 'GENOME.DATA.key_order', defaultValue : ["1","2","3","4","5","6","7","8","9","10",
            "11","12","13","14","15","16","17","18","19","20","21","22","X","Y"] },
        {label : '_chrom.length', id: 'GENOME.DATA.key_length', defaultValue : [] },
        {label : '_chrom.reverse_list', id: 'GENOME.OPTIONS.key_reverse_list', optional : true },
        {label : '_chrom.gap_degrees', id: 'GENOME.OPTIONS.gap_degrees', cast : Number, defaultValue : 0 },
        {label : '_chrom.label_layout_style', id: 'GENOME.OPTIONS.label_layout_style', defaultValue : 'default' },
        {label : '_chrom.label_font_style', id: 'GENOME.OPTIONS.label_font_style', cast: String, defaultValue : "16px helvetica, monospaced" },
        {label : '_chrom.radial_grid_line_width', id: 'GENOME.OPTIONS.radial_grid_line_width', cast : Number, defaultValue : null },
        {label : '_chrom.listener', id: 'GENOME.OPTIONS.listener', cast: Function, defaultValue : function() {
            return null;
        }},

        {label : '_plot.enable_pan', id: 'PLOT.enable_pan', cast: Boolean, defaultValue : false },
        {label : '_plot.enable_zoom', id: 'PLOT.enable_zoom', cast: Boolean, defaultValue : false },
        {label : '_plot.show_legend', id: 'PLOT.show_legend', cast: Boolean, defaultValue : false },
        {label : '_plot.legend_corner', id: 'PLOT.legend_corner', cast: String, defaultValue : 'ne' },
        {label : '_plot.legend_radius', id: 'PLOT.legend_radius', cast: Number, defaultValue : 25 },
        {label : '_plot.legend_show_rings', id: 'PLOT.legend_show_rings', cast: Boolean, defaultValue : true },
        {label : '_plot.rotate_degrees', id: 'PLOT.rotate_degrees', cast: Number, defaultValue : 0 },
        {label : '_plot.tooltip_timeout', id: 'PLOT.tooltip_timeout', cast: Number, defaultValue : 200 },
        {label : '_network.data', id: 'NETWORK.DATA.data_array',  optional : true },
        //{label : '_network.radius', id: 'NETWORK.OPTIONS.network_radius', cast : Number, defaultValue : 100 },
        {label : '_network._outer_padding', id: 'NETWORK.OPTIONS.outer_padding',  optional : true },
        {label : '_network.node_listener', id: 'NETWORK.OPTIONS.node_listener', cast: Function, defaultValue : function() {
            return null;
        } },
        {label : '_network.link_listener', id: 'NETWORK.OPTIONS.link_listener', cast: Function, defaultValue : function() {
            return null;
        } },
        {label : '_network.link_tooltipItems', id: 'NETWORK.OPTIONS.link_tooltip_items',
            defaultValue :  { 'Node 1 Chr' : 'sourceNode.chr', 'Node 1 Start' : 'sourceNode.start', 'Node1 End' : 'sourceNode.end',
                'Node 2 Chr' : 'targetNode.chr', 'Node 2 Start' : 'targetNode.start', 'Node 2 End' : 'targetNode.end'} },
        {label : '_network.link_tooltipLinks', id: 'NETWORK.OPTIONS.link_tooltip_links',  defaultValue : {} },
        {label : '_network.link_line_width', id: 'NETWORK.OPTIONS.link_line_width', cast : vq.utils.VisUtils.wrapProperty,
            defaultValue : function(node, link) {
                return 1;
            }},
        {label : '_network.link_alpha', id: 'NETWORK.OPTIONS.link_alpha', cast : vq.utils.VisUtils.wrapProperty,  defaultValue : function() {
            return 0.7;
        } },
        {label : '_network.link_strokeStyle', id: 'NETWORK.OPTIONS.link_stroke_style', cast : vq.utils.VisUtils.wrapProperty, defaultValue : function() {
            return 'steelblue';
        } },
        {label : '_network.node_fillStyle', id: 'NETWORK.OPTIONS.node_fill_style', cast : vq.utils.VisUtils.wrapProperty, defaultValue : function() {
            return 'green';
        } },
        {label : '_network.node_radius', id: 'NETWORK.OPTIONS.node_radius', cast : vq.utils.VisUtils.wrapProperty, defaultValue : function() {
            return 3;
        } },
        {label : '_network.node_key', id: 'NETWORK.OPTIONS.node_key', cast : Function, defaultValue : function(node) {
            return node['chr'];
        } },
        {label : '_network.node_highlightMode', id: 'NETWORK.OPTIONS.node_highlight_mode', cast : String, defaultValue : 'brighten' },
        {label : '_network.node_tooltipFormat', id: 'NETWORK.OPTIONS.node_tooltipFormat', cast : vq.utils.VisUtils.wrapProperty, defaultValue : vq.utils.VisUtils.network_node_title },
        {label : '_network.node_tooltipItems', id: 'NETWORK.OPTIONS.node_tooltip_items', defaultValue :  { Chr : 'chr', Start : 'start', End : 'end'} },
        {label : '_network.node_tooltipLinks', id: 'NETWORK.OPTIONS.node_tooltip_links',  defaultValue : {} },
        {label : '_network.max_node_linkDegree', id: 'NETWORK.OPTIONS.max_node_linkdegree', cast : Number, defaultValue :  9999 },
        {label : '_network.min_node_linkDegree', id: 'NETWORK.OPTIONS.min_node_linkdegree', cast : Number, defaultValue :  0 },
        {label : '_network.node_overlap_distance', id: 'NETWORK.OPTIONS.node_overlap_distance', cast : Number, defaultValue :  12000000.0},
        {label : '_network.tile_nodes', id: 'NETWORK.OPTIONS.tile_nodes', cast : Boolean, defaultValue : false },
        {label : 'ticks.tooltipItems', id: 'TICKS.OPTIONS.tooltip_items', defaultValue :  { Chr : 'chr', Start : 'start', End : 'end', Label:'value'} },
        {label : 'ticks.tooltipLinks', id: 'TICKS.OPTIONS.tooltip_links',  defaultValue : {} },
        {label : 'ticks.label_map', id: 'TICKS.OPTIONS.label_map', defaultValue:[
            {key:'',label:''}
        ]},

        {label : 'ticks.label_key', id: 'TICKS.OPTIONS.label_key', defaultValue:'value',cast: String},
        {label : 'ticks._data_array', id: 'TICKS.DATA.data_array',  optional : true },
        {label : 'ticks.height', id: 'TICKS.OPTIONS.height', cast : Number, defaultValue: 60 },
        {label : 'ticks.wedge_width', id: 'TICKS.OPTIONS.wedge_width', cast : Number, defaultValue: 0.2 },
        {label : 'ticks.wedge_height', id: 'TICKS.OPTIONS.wedge_height', cast : Number, defaultValue: 10 },
        {label : 'ticks.outer_padding', id: 'TICKS.OPTIONS.outer_padding', cast : Number, defaultValue: 0 },
        {label : 'ticks.listener', id: 'TICKS.OPTIONS.listener', cast : Function, defaultValue : function() {
            return null;
        } },
        {label : 'ticks.display_legend', id: 'TICKS.OPTIONS.display_legend', cast : Boolean, defaultValue : true },
        {label : 'ticks.legend_corner', id: 'TICKS.OPTIONS.legend_corner', cast : String, defaultValue : 'nw' },
        {label : 'ticks.tile_ticks', id: 'TICKS.OPTIONS.tile_ticks', cast : Boolean, defaultValue: true },
        {label : 'ticks.overlap_distance', id: 'TICKS.OPTIONS.overlap_distance', cast : Number, optional: true},
        {label : 'ticks.fill_style', id: 'TICKS.OPTIONS.fill_style', cast : vq.utils.VisUtils.wrapProperty, defaultValue : function() {
            return 'red';
        }},
        {label : 'ticks.stroke_style', id: 'TICKS.OPTIONS.stroke_style', cast : vq.utils.VisUtils.wrapProperty, defaultValue : function() {
            return 'white';
        }},
        {label : '_wedge' , id:'WEDGE', optional : true}
    ];
};

vq.models.CircVisData.prototype._build_data = function(data_struct) {
    var data = data_struct;

    this._processData(data);

    if (this._wedge) {
        this._wedge = this._wedge.map(function(b) {
            return new vq.models.CircVisData.WedgeData(b);
        });
    }

    this._setupData();
};


vq.models.CircVisData.prototype._setupData = function() {
    var chrom_keys_order={},chrom_length_map,chrom_length_array = [],cnv_map, startAngle = {},
        cnv_array, cnv_height = [], startAngle_map = {},normalizedLength = {},
        deviation = [],median = [], theta = {}, totalChromLength;
    this.normalizedLength,this.theta = [],this.startAngle_map = {};

    var that = this;
    this._plot.id = vq.utils.VisUtils.guid();

//  Ideogram Data

    if (this._chrom.keys == [] || this._chrom.length == []) {
        console.warn('Chromosome/Ideogram information has not been detected.  Please verify that keys and length/key mappings have been ' +
            'passed into the GENOME.DATA object.');
        return;
    }

    var chrom_keys_array = this._chrom.keys;       //array in pre-sorted order    
    _.each(chrom_keys_array,function(val,index){chrom_keys_order[val]=index;});

    chrom_length_array = this._chrom.length.filter(function(d) {
        return chrom_keys_order[d['chr_name']] != null;
    });
    chrom_length_array.sort(function(c, d) {
        return chrom_keys_order[c['chr_name']] - chrom_keys_order[d['chr_name']] > 0;
    });  //sort by given order
    totalChromLength = vq.sum(chrom_length_array, function(d) {
        return d['chr_length'];
    });


    var shorten = totalChromLength / 360 * this._chrom.gap_degrees;

    chrom_length_map = {};
        _.each(chrom_length_array,function(obj) {
            chrom_length_map[obj['chr_name'].toUpperCase()] = obj['chr_length'];
            normalizedLength[obj['chr_name'].toUpperCase()] =  (obj['chr_length'] -shorten) / totalChromLength;
        });

    this.normalizedLength = normalizedLength;

    var chrom_groups = {};

    var rotation = (this._plot.rotate_degrees) * Math.PI / 180;

    var renormalize_factor =  this._chrom.gap_degrees * Math.PI / 180; //radians

    //for each index of chrom_keys ( pre-sorted)
    // sum all lengths from 1st index to last index of chrom_length (sorted to chrom_length)
    _.each(chrom_keys_array,function(d,index) {
        startAngle[d] = _.reduce(chrom_keys_array.slice(0, (chrom_keys_order[d])),
            function(a,b,index) {
                return a+(normalizedLength[chrom_keys_array[index]] * 2 * Math.PI)+renormalize_factor;
            },0);

        theta[d] = d3.scale.linear().domain([0, chrom_length_map[d.toUpperCase()]])
            .range([0, 2 * Math.PI * normalizedLength[d]]);

        if (that._chrom.reverse_list != undefined &&
            that._chrom.reverse_list.filter(
                function(c) {
                    return c == d;
                }).length > 0) {  //defined as reversed!
            theta[d] = d3.scale.linear().domain([0, chrom_length_map[d.toUpperCase()]])
                .range([2 * Math.PI * normalizedLength[d], 0]);

        } else {
            theta[d] = d3.scale.linear().domain([0, chrom_length_map[d.toUpperCase()]])
                .range([0, 2 * Math.PI * normalizedLength[d]]);

        }
        chrom_groups[d]={key:d, startAngle: startAngle[d], endAngle: startAngle[d] + 2 * Math.PI * normalizedLength[d], theta:theta[d],
        angle: 2 * Math.PI * normalizedLength[d]};
    });

    this.theta = theta;
    this._ideograms={};
    _.each(that._chrom.keys, function(d) {
            startAngle_map[d] =  startAngle[d] + rotation;
                that._ideograms[d] = _.extend(chrom_groups[d],{wedge:[],_feature_angle : function(a) { return this.startAngle + this.theta(a); }});
            });
    this.startAngle_map = startAngle_map;
    this._chrom.groups = chrom_groups;

//    Ring Data

    if (this._wedge != undefined) {
        _.each(this._wedge,function(wedge, index) {

            if (wedge._plot_type == 'tile' || wedge._plot_type == 'glyph') {
                var max_tile_level = wedge._tile.show_all_tiles ?
                    Math.floor((wedge._plot_height - (wedge._radius() * 4)) / (wedge._tile.height + wedge._tile.padding)) :
                    undefined;
                wedge._data = (wedge._plot_type == 'tile' ? vq.utils.VisUtils.layoutChrTiles(wedge._data, wedge._tile.overlap_distance, max_tile_level) :
                    vq.utils.VisUtils.layoutChrTicks(wedge._data, wedge._tile.overlap_distance, max_tile_level));
            }

            cnv_map = {};
             _.each(wedge._data, function(d) {
                if (cnv_map[d.chr] === undefined) { cnv_map[d.chr] = [];}
                    cnv_map[d.chr].push(d);
                });

            wedge._chr = {};
            _.each(that._chrom.keys, function(d) {
                wedge._chr[d] =  cnv_map[d] === undefined ? [] : _.extend(cnv_map[d],chrom_groups[d]);
            });
            wedge._outerRadius =
                (that._plot.height / 2) -
                    (vq.sum(that._wedge.slice(0, index), function(a) {
                        return a._plot_height;
                    }) + vq.sum(that._wedge.slice(0, index), function(a) {
                        return a._outer_padding;
                    })) - (that.ticks.outer_padding + that.ticks.height);

            wedge._outerPlotRadius = wedge._outerRadius - wedge._outer_padding;

            wedge._innerRadius = wedge._outerPlotRadius - wedge._plot_height;

            that._chrom.keys.forEach(function(d) {
                        that._ideograms[d]._outerRadius = (that._plot.height / 2) - (that.ticks.outer_padding + that.ticks.height);
                        that._ideograms[d].wedge[index] = wedge._chr[d]; //?
            });

            wedge.hovercard = vq.hovercard({
                                            canvas_id : that._plot.id,
                                            include_header : false,
                                            include_footer : true,
                                            self_hover : true,
                                            timeout : that._plot.tooltip_timeout,
                                            data_config : wedge._tooltipItems,
                                            tool_config : wedge._tooltipLinks
                                        });

            if(wedge._plot_type =='karyotype') { return;}

            var value_label = wedge._value_key;
            deviation = Math.sqrt(science.stats.variance(_.pluck(wedge._data,value_label)));
            median = science.stats.median(_.pluck(wedge._data,value_label));

            wedge._min_plotValue = (wedge._min_plotValue === undefined) ? parseFloat(((-1 * deviation) + median).toFixed(2)) : wedge._min_plotValue;
            wedge._max_plotValue = (wedge._max_plotValue === undefined) ? parseFloat((deviation + median).toFixed(2)) : wedge._max_plotValue;
            wedge._range_mean = wedge._base_plotValue != null ? wedge._base_plotValue : (wedge._min_plotValue + wedge._max_plotValue) / 2;
    wedge._y_linear = d3.scale.linear()
        .domain([wedge._min_plotValue, wedge._max_plotValue])
        .range([wedge._innerRadius,wedge._outerRadius - wedge._outer_padding]).nice();

    wedge._y_axis = d3.scale.linear().domain([wedge._min_plotValue, wedge._max_plotValue]).range([wedge._innerRadius,wedge._outerPlotRadius]);
    wedge._thresholded_innerRadius = function(d) { return Math.max(wedge._y_axis(Math.min(d,wedge._range_mean)),wedge._innerRadius); };
    wedge._thresholded_outerRadius = function(d) { return Math.min(wedge._y_axis(Math.max(d,wedge._range_mean)),wedge._outerPlotRadius); };
    wedge._thresholded_value_to_radius = function(d) { return Math.min(Math.max(wedge._y_axis(d),wedge._innerRadius),wedge._outerPlotRadius); };
    wedge._thresholded_radius = function(d) { return Math.min(Math.max(d,wedge._innerRadius),wedge._outerPlotRadius); };

    wedge._thresholded_tile_innerRadius = function(c,d) { return wedge._innerRadius + (d._tile.height + d._tile.padding) * c.level;};
    wedge._thresholded_tile_outerRadius = function(c,d) { return wedge._innerRadius + ((d._tile.height + d._tile.padding) * c.level) + d._tile.height;};
            if (wedge._plot_type == 'glyph') {
                wedge._glyph_distance = function(c) { return (((wedge._tile.height + wedge._tile.padding) * c.level)
                    + wedge._innerRadius );};
                wedge._checked_endAngle = function(feature,chr) {
                    if (that._chrom.keys.length == 1) {
                        return Math.min(that.startAngle_map[chr] + that.theta[chr](feature.end||feature.start+1),dataObj.startAngle_map[dataObj._chrom.keys[0]] + (Math.PI * 2));
                    }
                    else if (this.parent.index+1 == dataObj._chrom.keys.length) {
                        return Math.min(that.startAngle_map[chr] + that.theta[chr](feature.end||feature.start+1),dataObj.startAngle_map[dataObj._chrom.keys[0]] + (Math.PI * 2));
                    }
                    else {return Math.min(that.startAngle_map[chr] + that.theta[chr](feature.end||feature.start+1),
                        that.startAngle_map[that._chrom.keys[(this.parent.index+1)%that._chrom.keys.length]]);
                    }
                };
            }
            delete wedge._data;


        }); //foreach
    }
    //------------------- NETWORK DATA
    var nodes = {};
    _.each(that._chrom.keys, function(d) {
            nodes[d] = {};
    });
    var node_parent_map = {};
    var node_array = [{parent:null, chr:null, radius:0, angle:0,children:[]}];
    that._network.network_radius = {};
    chrom_keys_array.forEach(function(key,index) {
        var innerRadius = that._ideograms[key].wedge.length > 0 ? that._wedge[that._ideograms[key].wedge.length-1]._innerRadius :
                    (that._plot.height / 2) - that.ticks.outer_padding - that.ticks.height;
        var network_radius = that._network.network_radius[key] = innerRadius - that._network._outer_padding;
        node_parent_map[key] = index + 1;
        var node = {chr:key,parent:node_array[0],children:[],radius: network_radius / 2,
                angle : (that._chrom.groups[key].startAngle + that._chrom.groups[key].endAngle)/2};
        node_array[0].children.push(node);
        node_array.push(node);
    });
    
    var valid_chr = {};
    _.each(this._chrom.keys, function(a) { valid_chr[a] = {}; });
    var links_array = [];
    var length;
   var index1,index2;
    var node_key = this._network.node_key;
    if (this._network != undefined && this._network.data != undefined) {
        this._network.data.forEach(function(d) {
            index1 = null, node1_key = node_key(d.node1),
            index2 = null, node2_key = node_key(d.node2);
            if (valid_chr[d.node1.chr] === undefined || valid_chr[d.node2.chr] === undefined) return;
            if (nodes[node1_key] === undefined){
                        var temp_node = d.node1;
                        temp_node.nodeName = node1_key;
                        length = node_array.push(temp_node);
                        index1 = length - 1;
                        nodes[node1_key] = index1;
                    } else {
                        index1 = nodes[node1_key];
                    }
          if (nodes[node2_key] === undefined){
                        var temp_node = d.node2;
                        temp_node.nodeName = node2_key;
                        length = node_array.push(temp_node);
                        index2 = length - 1;
                        nodes[node2_key] = index2;
                    } else {
                        index2 = nodes[node2_key];
                    }

            if (index1 != null && index2 !=null) {
                //copy out useful properties
                var node = {source : index1, target : index2} ;
                for (var p in d) {
                    if (p != 'node1' && p!= 'node2') {
                        node[p] = d[p];
                    }
                }
                links_array.push(node);
            }
        });
        this._network.nodes_array = this._network.tile_nodes ?  vq.utils.VisUtils.layoutChrTiles(node_array,that._network.node_overlap_distance) : node_array;
        this._network.links_array = links_array;
        this._network.data = 'loaded';
        nodes = [];
        node_array = [];
        links_array = [];
        this._network.link_hovercard  =  vq.hovercard({
                            canvas_id : that._plot.id,
                            include_header : false,
                            include_footer : true,
                            self_hover : true,
                            timeout : that._plot.tooltip_timeout,
                            data_config : that._network.link_tooltipItems,
                            tool_config : that._network.link_tooltipLinks
                        });
        this._network.node_hovercard  =  vq.hovercard({
                                  canvas_id : that._plot.id,
                                  include_header : false,
                                  include_footer : true,
                                  self_hover : true,
                                  timeout : that._plot.tooltip_timeout,
                                  data_config : that._network.node_tooltipItems,
                                  tool_config : that._network.node_tooltipLinks
                              });
    }

//    Tick Data

    if (this.ticks != undefined && this.ticks._data_array != undefined && this.ticks._data_array != null) {
        if (that.ticks.overlap_distance === undefined) {
            var overlap_ratio = 7000000.0 / 3080419480;
            that.ticks.overlap_distance = overlap_ratio * totalChromLength;
        }
        var tick_array = that.ticks.tile_ticks ? vq.utils.VisUtils.layoutChrTicks(that.ticks._data_array, that.ticks.overlap_distance) :
            that.ticks._data_array;

        var ticks_map = {};
        _.each(tick_array,function(d) {
                ticks_map[d.chr] = d;
            });
            

        this.ticks.data_map = {};
        _.each(that._chrom.keys, function(d) {
            that.ticks.data_map[d] =  ticks_map[d] === undefined ? [] : ticks_map[d];
        });
        this.ticks._data_array = [];
        delete tick_array;
        ticks_map = [];

        this.ticks.hovercard =  vq.hovercard({
                    canvas_id : that._plot.id,
                    include_header : false,
                    include_footer : true,
                    self_hover : true,
                    timeout : that._plot.tooltip_timeout,
                    data_config : that.ticks.tooltipItems,
                    tool_config : that.ticks.tooltipLinks
                });

    }
    this.setDataReady(true);
};

