//circvis.wedge.js


vq.CircVis.Wedge = function() {
    vq.Vis.call(this);
};
vq.CircVis.Wedge.prototype = pv.extend(vq.Vis);

/** @private **/

vq.CircVis.Wedge.prototype._setOptionDefaults = function(options) {

    if (options.height != null) {this.height(options.height); }

    if (options.width != null) { this.width(options.width); }

    if (options.vertical_padding != null) { this.vertical_padding(options.vertical_padding);    }

    if (options.horizontal_padding != null) { this.horizontal_padding(options.horizontal_padding);}

    if (options.container) {  this.container(options.container);   }

};
/**
 *
 *  Constructs the Circvis model and adds the SVG tags to the defined DOM element.
 *
 * @param {JSON Object} circvis_object - the object defined above.
 */
vq.CircVis.prototype.draw = function(data) {

    var vis_data = new vq.models.CircVisData(data);

    if (vis_data.isDataReady()) {
        this._setOptionDefaults(vis_data);
        this.chromoData = vis_data;
        this._render();
    } else {
        console.warn('Invalid data input.  Check data for missing or improperly formatted values.');
    }
};


/**private **/
vq.CircVis.prototype._add_wedge = function(index,outerRadius) {
    var dataObj = this.chromoData, dot;
    var width = this.width(), height = this.height();
    var outerPlotRadius = outerRadius - dataObj._wedge[index]._outer_padding;
    var innerRadius = outerPlotRadius - dataObj._wedge[index]._plot_height;

    dataObj._wedge[index]._outer_radius = outerPlotRadius;
    dataObj._wedge[index]._inner_radius = innerRadius;

    this.wedge_layer[index] = this.event_panel.add(pv.Wedge)
            .data(dataObj._chrom.keys)
            .left(width/2)
            .top(height/2)
            .innerRadius(innerRadius)
            .outerRadius(outerPlotRadius)
            .angle(function(d) { return dataObj.normalizedLength[d] * 2 * Math.PI;} )
            .startAngle(function(d) { return dataObj.startAngle_map[d]; } )
            .fillStyle("#ddd")
            .strokeStyle("#444")
            .lineWidth(1)
            .overflow("hidden")
            .add(pv.Wedge)
            .innerRadius(innerRadius)
            .outerRadius(outerPlotRadius)
            .lineWidth(1)
            .strokeStyle("#444");

    if ((dataObj._wedge[index]._plot_type != 'karyotype') &&
        (dataObj._wedge[index]._plot_type != 'tile') &&
        (dataObj._wedge[index]._plot_type != 'band') &&
        (dataObj._wedge[index]._plot_type != 'glyph')) {
        if (isNaN(dataObj._wedge[index]._min_plotValue) || isNaN(dataObj._wedge[index]._max_plotValue)) {
            console.warn('Range of values for ring with index (' + index +') not detected.  Data has not been plotted.');
            return;
        }
    }

    if (dataObj._wedge[index]._min_plotValue == dataObj._wedge[index]._max_plotValue) {
        dataObj._wedge[index]._min_plotValue = dataObj._wedge[index]._min_plotValue - 1;
        dataObj._wedge[index]._max_plotValue = dataObj._wedge[index]._max_plotValue + 1;
    }

    var range_mean = dataObj._wedge[index]._base_plotValue != null ? dataObj._wedge[index]._base_plotValue :
        (dataObj._wedge[index]._min_plotValue+ dataObj._wedge[index]._max_plotValue) / 2;
    var y_axis = pv.Scale.linear(dataObj._wedge[index]._min_plotValue, dataObj._wedge[index]._max_plotValue).range(innerRadius,outerPlotRadius);
    var thresholded_innerRadius = function(d) { return Math.max(y_axis(Math.min(d,range_mean)),innerRadius); };
    var thresholded_outerRadius = function(d) { return Math.min(y_axis(Math.max(d,range_mean)),outerPlotRadius); };
    var thresholded_value_to_radius = function(d) { return Math.min(Math.max(y_axis(d),innerRadius),outerPlotRadius); };
    var thresholded_radius = function(d) { return Math.min(Math.max(d,innerRadius),outerPlotRadius); };
    var thresholded_tile_innerRadius = function(c,d) { return innerRadius + (d._tile_height + d._tile_padding) * c.level;};
    var thresholded_tile_outerRadius = function(c,d) { return innerRadius + ((d._tile_height + d._tile_padding) * c.level) + d._tile_height;};
    var glyph_distance = function(c,d) { return (((d._tile_height + d._tile_padding) * c.level)
        + innerRadius + (d._radius() * 2));};
    var checked_endAngle = function(c,d) {
	if (dataObj._chrom.keys.length == 1) {
		return Math.min(dataObj.startAngle_map[d] + dataObj.theta[d](c.end||c.start+1),dataObj.startAngle_map[dataObj._chrom.keys[0]] + (Math.PI * 2));
	}
	else if (this.parent.index+1 == dataObj._chrom.keys.length) { 
		return Math.min(dataObj.startAngle_map[d] + dataObj.theta[d](c.end||c.start+1),dataObj.startAngle_map[dataObj._chrom.keys[0]] + (Math.PI * 2));
	}	
        else {return Math.min(dataObj.startAngle_map[d] + dataObj.theta[d](c.end||c.start+1),
            dataObj.startAngle_map[dataObj._chrom.keys[(this.parent.index+1)%dataObj._chrom.keys.length]]);
        }
    };
    var feature_angle = function(d) { return dataObj.startAngle_map[d.chr] + dataObj.theta[d.chr](d.start); };

    var value_key = dataObj._wedge[index]._value_key;

    var behavior = function(d) {
        return (pv.Behavior.hovercard(
            {
                include_header : false,
                include_footer : true,
                self_hover : true,
                timeout: dataObj._plot.tooltip_timeout,
                data_config :
                    dataObj._wedge[index]._tooltipItems,
                tool_config : dataObj._wedge[index]._tooltipLinks
            }
        ).call(this,d));};
    //add a new panel each time we want to draw on top of the previously created image.
    var panel_layer = this.event_panel.add(pv.Panel)
            .fillStyle(null)
            .data(dataObj._chrom.keys);

    switch (dataObj._wedge[index]._plot_type) {
        case 'histogram':
                if(dataObj._wedge[index]._draw_axes) {
            /* Circular grid lines. */
             dot = this.event_panel.add(pv.Dot)
                    .data(y_axis.ticks(4))
                    .fillStyle(null)
                    .strokeStyle("#444")
                    .lineWidth(1)
                    .radius(function(i) { return y_axis(i); } );
            dot.anchor("top").add(pv.Label)
                    .textBaseline("middle")
                    .textAlign("right")
                    .text(function(i) {return y_axis.tickFormat(i);});
            dot.anchor("bottom").add(pv.Label)
                    .textBaseline("middle")
                    .textAlign("right")
                    .text(function(i) {return y_axis.tickFormat(i);});
                    }
            panel_layer.add(pv.Wedge)	//histogram
                .data(function(d) { return dataObj._wedge[index]._chr_map[d];})
                .startAngle(function(c,d) { return dataObj.startAngle_map[d] + dataObj.theta[d](c.start);	})
                .endAngle(checked_endAngle)
                .innerRadius(function(c) { return thresholded_innerRadius(c[value_key]);} )
                .outerRadius(function(c) { return thresholded_outerRadius(c[value_key]); } )
                .strokeStyle(dataObj._wedge[index]._strokeStyle)
                .fillStyle(dataObj._wedge[index]._fillStyle)
                .cursor('pointer')
                .event('click',function(c,d){ dataObj._wedge[index].listener(c);} )
                .event('mouseover',behavior);
            break;
        case 'scatterplot':
            if(dataObj._wedge[index]._draw_axes) {
                dot = this.event_panel.add(pv.Dot)
                        .data(y_axis.ticks(4))
                        .fillStyle(null)
                        .strokeStyle("#444")
                        .lineWidth(1)
                        .radius(function(i) { return y_axis(i); } );
                dot.anchor("top").add(pv.Label)
                        .textBaseline("middle")
                        .textAlign("right")
                        .text(function(i) {return y_axis.tickFormat(i);});
                dot.anchor("bottom").add(pv.Label)
                        .textBaseline("middle")
                        .textAlign("right")
                        .text(function(i) {return y_axis.tickFormat(i);});
            }
            panel_layer.add(pv.Dot)	//scatterplot
                    .data(function(d) { return dataObj._wedge[index]._chr_map[d];})
                    .left(function(c,d) { return width/2 + (thresholded_value_to_radius(c[value_key]) * Math.cos(feature_angle(c))); })
                    .bottom(function(c,d) { return height/2 + (-1 * (thresholded_value_to_radius(c[value_key])) * Math.sin(feature_angle(c))); })
                    .shape(dataObj._wedge[index]._shape)
                    .radius(dataObj._wedge[index]._radius)
                    .strokeStyle(dataObj._wedge[index]._strokeStyle)
                    .fillStyle(dataObj._wedge[index]._fillStyle)
                    .cursor('pointer')
                    .event('click',function(c,d){ dataObj._wedge[index].listener(c);} )
                    .event('mouseover',behavior);
            break;
        case 'glyph':
            panel_layer.add(pv.Dot)	//glyph
                    .data(function(d) { return dataObj._wedge[index]._chr_map[d];})
                    .left(function(c,d) { return width/2 + (glyph_distance(c,dataObj._wedge[index])) *  Math.cos(feature_angle(c)); })
                    .bottom(function(c,d) { return height/2 + (-1 * glyph_distance(c,dataObj._wedge[index]) * Math.sin(feature_angle(c))); })
                    .shape(dataObj._wedge[index]._shape)
                    .radius(dataObj._wedge[index]._radius)
                    .strokeStyle(dataObj._wedge[index]._strokeStyle)
                    .fillStyle(dataObj._wedge[index]._fillStyle)
                    .cursor('pointer')
                    .event('click',function(c,d){ dataObj._wedge[index].listener(c);} )
                    .event('mouseover',behavior);
            break;
            case 'band':
            panel_layer.add(pv.Wedge)	//tile
                .data(function(d) { return dataObj._wedge[index]._chr_map[d];})
                .startAngle(function(c,d) { return dataObj.startAngle_map[d] + dataObj.theta[d](c.start); })
                .endAngle(checked_endAngle)
                .innerRadius(innerRadius )
                .outerRadius(outerPlotRadius )
                .strokeStyle(dataObj._wedge[index]._strokeStyle)
                .fillStyle(dataObj._wedge[index]._fillStyle)
                .cursor('pointer')
                .event('click',function(c,d){ dataObj._wedge[index].listener(c);} )
                .event('mouseover',behavior);
            break;
        case 'tile':
            panel_layer.add(pv.Wedge)	//tile
                .data(function(d) { return dataObj._wedge[index]._chr_map[d];})
                .startAngle(function(c,d) { return dataObj.startAngle_map[d] + dataObj.theta[d](c.start); })
                .endAngle(checked_endAngle)
                .innerRadius(function(c,d) { return thresholded_tile_innerRadius(c,dataObj._wedge[index]);} )
                .outerRadius(function(c,d) { return thresholded_tile_outerRadius(c,dataObj._wedge[index]);} )
                .strokeStyle(dataObj._wedge[index]._strokeStyle)
                .fillStyle(dataObj._wedge[index]._fillStyle)
                .cursor('pointer')
                .event('click',function(c,d){ dataObj._wedge[index].listener(c);} )
                .event('mouseover',behavior);
            break;
        case 'heatmap':
            panel_layer.add(pv.Wedge)	//heatmap plot of cnv
                .data(function(d) { return dataObj._wedge[index]._chr_map[d];})
                .startAngle(function(c,d) { return dataObj.startAngle_map[d] + dataObj.theta[d](c.start); })
                .endAngle(function(c,d) {
                    if (this.parent.index+1 == dataObj._chrom.keys.length) { return dataObj.startAngle_map[dataObj._chrom.keys[0]] + (Math.PI * 2);}
                    else {return Math.min(dataObj.startAngle_map[d] + dataObj.theta[d](c.end||c.start+1),
                        dataObj.startAngle_map[dataObj._chrom.keys[(this.parent.index+1)%dataObj._chrom.keys.length]]);
                    }
                })
                .innerRadius(thresholded_innerRadius(dataObj._wedge[index]._min_plotValue) )
                .outerRadius(thresholded_outerRadius(dataObj._wedge[index]._max_plotValue) )
                .strokeStyle(dataObj._wedge[index]._strokeStyle)
                .fillStyle(dataObj._wedge[index]._fillStyle)
                .cursor('pointer')
                .event('click',function(c,d){ dataObj._wedge[index].listener(c);} )
                .event('mouseover',behavior);
            break;
        case 'karyotype':
            panel_layer.add(pv.Wedge)	//karyotype
                .data(function(d) { return dataObj._wedge[index]._chr_map[d];})
                .startAngle(function(c,d) { return dataObj.startAngle_map[d] + dataObj.theta[d](c.start); })
                .endAngle(checked_endAngle)
                .innerRadius(innerRadius )
                .outerRadius(outerPlotRadius )
                .fillStyle( function(d) {return d[value_key];})
                .cursor('pointer')
                .event('click',function(c,d){ dataObj._wedge[index].listener(c);} )
                .event('mouseover',behavior);
            break;
        default:
            console.warn('No plot type definition detected.');
    }

};


/**
 *
 * @class Internal data model for ring plots.
 *
 * @param data {JSON Object} - Configures a single ring plot.
 * @extends vq.models.VisData
 */
vq.models.CircVisData.WedgeData = function(data) {

    vq.models.VisData.call(this,{CONTENTS:data});

    this.setDataModel();
        this._build_data(this.getContents())

};

vq.models.CircVisData.WedgeData.prototype = pv.extend(vq.models.VisData);


vq.models.CircVisData.WedgeData.prototype.setDataModel = function() {
 this._dataModel = [
     {label : '_data', id: 'DATA.data_array', defaultValue : [ {"chr": "1", "end": 12784268, "start": 644269,
         "value": -0.058664}]},
     {label : '_value_key', id: 'DATA.value_key', defaultValue : 'value',cast: String },

     {label : 'listener', id: 'OPTIONS.listener', defaultValue :  function(a,b) {} },
     {label : '_plot_type', id: 'PLOT.type', defaultValue : 'histogram' },
     {label : '_plot_height', id: 'PLOT.height', cast: Number, defaultValue : 100 },
     {label : '_fillStyle', id: 'OPTIONS.fill_style', cast : vq.utils.VisUtils.wrapProperty, defaultValue : function(d) { return pv.color('red');} },
     {label : '_strokeStyle', id: 'OPTIONS.stroke_style', cast : vq.utils.VisUtils.wrapProperty, defaultValue : function(d) {return pv.color('red');} },
     {label : '_shape', id: 'OPTIONS.shape', cast : vq.utils.VisUtils.wrapProperty, defaultValue : function(d) {return 'circle';} },
     {label : '_radius', id: 'OPTIONS.radius', cast : vq.utils.VisUtils.wrapProperty, defaultValue : function(d) {return 2;} },
     {label : '_outer_padding', id: 'OPTIONS.outer_padding', cast : Number, defaultValue : 1 },
     {label : '_min_plotValue', id: 'OPTIONS.min_value',  cast : Number , optional : true },
     {label : '_max_plotValue', id: 'OPTIONS.max_value',  cast : Number , optional : true },
     {label : '_base_plotValue', id: 'OPTIONS.base_value', cast: Number, optional : true },
     {label : '_legend_label', id: 'OPTIONS.legend_label', cast: String, defaultValue : '' },
     {label : '_legend_desc', id: 'OPTIONS.legend_description', cast: String, defaultValue : '' },
     {label : '_draw_axes', id: 'OPTIONS.draw_axes', cast: Boolean, defaultValue : true },
     {label : '_tooltipFormat', id: 'OPTIONS.tooltipFormat', cast :vq.utils.VisUtils.wrapProperty,
         defaultValue : function(c,d) { return "Chr " + d + "\nStart: " + c.start + "\nEnd: " + c.end;}   },
     {label : '_tooltipItems', id: 'OPTIONS.tooltip_items',  defaultValue : {Chr:'chr',Start:'start',End:'end',Value:'value'} },
     {label : '_tooltipLinks', id: 'OPTIONS.tooltip_links',  defaultValue : {} },
     {label : '_tile_padding', id: 'OPTIONS.tile_padding', cast: Number, defaultValue : 5 },
     {label : '_tile_overlap_distance', id: 'OPTIONS.tile_overlap_distance', cast: Number, defaultValue : 0.1 },
     {label : '_tile_height', id: 'OPTIONS.tile_height', cast: Number, defaultValue : 5 },
     {label : '_tile_show_all_tiles', id: 'OPTIONS.tile_show_all_tiles', cast: Boolean, defaultValue : false }
    ];
};

vq.models.CircVisData.WedgeData.prototype._build_data = function(data_struct) {
    this._processData(data_struct)
};
