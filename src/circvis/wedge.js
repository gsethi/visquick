//circvis.wedge.js


vq.CircVis = function() {
    vq.Vis.call(this);
};
vq.CircVis.prototype = pv.extend(vq.Vis);

/**
 *
 *  Constructs the Circvis model and adds the SVG tags to the defined DOM element.
 *
 * @param {JSON Object} circvis_object - the object defined above.
 */
vq.CircVis.prototype.draw = function(data) {

    var vis_data = new vq.models.CircVisData(data);

    if (vis_data.isDataReady()) {
        this.chromoData = vis_data;
        this._render();
    } else {
        console.warn('Invalid data input.  Check data for missing or improperly formatted values.');
    }
};

vq.CircVis.prototype._render = function() {

    var that = this;

    var dataObj = this.chromoData;
    var width = dataObj._plot.width, height = dataObj._plot.height;
    var outerRadius = height / 2;

    if (dataObj.ticks._data_array != undefined) {
        tick_padding = dataObj.ticks.outer_padding + dataObj.ticks.height;
    }

    var svg = d3.select(dataObj._plot.container)
        .append('svg:svg')
        .attr('width', width)
        .attr('height', height)
        .append('svg:g')
        .attr('class', 'circvis')
        .attr("transform", 'translate(' + width / 2 + ',' + height / 2 + ')');
        
var ideograms = svg.selectAll("svg.circvis")
        .data(dataObj._chrom.keys)
        .enter().append('svg:g')
            .attr('class',function(d) {return 'ideogram';})
            .each(draw_ideogram_rings);

function draw_ideogram_rings(d) {

    var ideogram = d3.select(this);
        function fade(opacity) {
        return function(g, i) {
            svg.selectAll("g.ideogram")
                .filter(function(d, i2) {
                    return d != g;
                })
                .transition()
                .style("opacity", opacity);
        };
    }

    ideogram
        .on("mouseover", fade(0.1))
        .on("mouseout", fade(1.0));

               that._add_wedge(ideogram, d);
    
}


};

vq.CircVis.prototype._drawWedgeContents = function(wedge_obj, chr, wedge_index) {
    var that = this;
    var dataObj = that.chromoData;
    var ideogram = dataObj._ideograms[chr];
    var wedge_params = dataObj._wedge[wedge_index];
    var wedge = ideogram.wedge[wedge_index];
    switch (wedge_params._plot_type) {
        case('karyotype'):
        case('tile'):
        case('band'):
        case('glyph'):
            this._drawWedge_withoutRange(wedge_obj, chr, wedge_index);
            break;
        default:
            this._drawWedge_withRange(wedge_obj, chr, wedge_index);
    }
};

/**private **/
vq.CircVis.prototype._add_wedge = function(ideogram_obj, chr) {
    var that = this;
    var dataObj = this.chromoData;
    var ideogram = dataObj._ideograms[chr];

    function outerRadius(index) {
        return dataObj._wedge[index]._outerRadius -  dataObj._wedge[index]._outer_padding
    }

    function innerRadius(index) {
        return outerRadius(index) - dataObj._wedge[index]._plot_height;
    }

    ideogram_obj.append("svg:g")
        .selectAll("path")
        .data(pv.range(0,dataObj._wedge.length))
        .enter()
        .append("svg:g")
        .attr("class", "wedge")
        .append("svg:path")
        .style("fill", "#ddd")
        .style("stroke", "#444")
        .style("opacity",0.6)
        .attr("d",d3.svg.arc()
            .innerRadius(  function(ring_index) { return innerRadius(ring_index); })
            .outerRadius( function(ring_index) { return outerRadius(ring_index);} )
            .startAngle(dataObj._chrom.groups[chr].startAngle)
            .endAngle( dataObj._chrom.groups[chr].endAngle)
        );

    ideogram_obj.selectAll("g.wedge")
        .each(checkAndPlot);

//
//    this.wedge_layer[index] = this.event_panel.add(pv.Wedge)
//            .data(dataObj._chrom.keys)
//            .left(width/2)
//            .top(height/2)
//            .innerRadius(innerRadius)
//            .outerRadius(outerPlotRadius)
//            .angle(function(d) { return dataObj.normalizedLength[d] * 2 * Math.PI;} )
//            .startAngle(function(d) { return dataObj.startAngle_map[d]; } )
//            .fillStyle("#ddd")
//            .strokeStyle("#444")
//            .lineWidth(1)
//            .overflow("hidden")
//            .add(pv.Wedge)
//            .innerRadius(innerRadius)
//            .outerRadius(outerPlotRadius)
//            .lineWidth(1)
//            .strokeStyle("#444");
//
    function checkAndPlot(wedge_index) {
        var wedge_obj = d3.select(this);
        var wedge_params = dataObj._wedge[wedge_index];
    if ((wedge_params._plot_type != 'karyotype') &&
        (wedge_params._plot_type != 'tile') &&
        (wedge_params._plot_type != 'band') &&
        (wedge_params._plot_type != 'glyph')) {
        if (isNaN(wedge_params._min_plotValue) || isNaN(wedge_params._max_plotValue)) {
            console.warn('Range of values for ring with index (' + wedge_index + ') not detected.  Data has not been plotted.');
            return;
        }
    }

    if (wedge_params._min_plotValue == wedge_params._max_plotValue) {
        wedge_params._min_plotValue = wedge_params._min_plotValue - 1;
        wedge_params._max_plotValue = wedge_params._max_plotValue + 1;
        console.warn('Invalid value range detected.  Range reset to [-1,1].');
    }


    that._drawWedgeContents(wedge_obj, chr, wedge_index);
}
//
//    var range_mean = dataObj._wedge[index]._base_plotValue != null ? dataObj._wedge[index]._base_plotValue :
//        (dataObj._wedge[index]._min_plotValue+ dataObj._wedge[index]._max_plotValue) / 2;
//    var y_axis = pv.Scale.linear(dataObj._wedge[index]._min_plotValue, dataObj._wedge[index]._max_plotValue).range(innerRadius,outerPlotRadius);
//    var thresholded_innerRadius = function(d) { return Math.max(y_axis(Math.min(d,range_mean)),innerRadius); };
//    var thresholded_outerRadius = function(d) { return Math.min(y_axis(Math.max(d,range_mean)),outerPlotRadius); };
//    var thresholded_value_to_radius = function(d) { return Math.min(Math.max(y_axis(d),innerRadius),outerPlotRadius); };
//    var thresholded_radius = function(d) { return Math.min(Math.max(d,innerRadius),outerPlotRadius); };
//    var thresholded_tile_innerRadius = function(c,d) { return innerRadius + (d._tile.height + d._tile.padding) * c.level;};
//    var thresholded_tile_outerRadius = function(c,d) { return innerRadius + ((d._tile.height + d._tile.padding) * c.level) + d._tile.height;};
//    var glyph_distance = function(c,d) { return (((d._tile.height + d._tile.padding) * c.level)
//        + innerRadius + (d._radius() * 2));};
//    var checked_endAngle = function(c,d) {
//	if (dataObj._chrom.keys.length == 1) {
//		return Math.min(dataObj.startAngle_map[d] + dataObj.theta[d](c.end||c.start+1),dataObj.startAngle_map[dataObj._chrom.keys[0]] + (Math.PI * 2));
//	}
//	else if (this.parent.index+1 == dataObj._chrom.keys.length) {
//		return Math.min(dataObj.startAngle_map[d] + dataObj.theta[d](c.end||c.start+1),dataObj.startAngle_map[dataObj._chrom.keys[0]] + (Math.PI * 2));
//	}
//        else {return Math.min(dataObj.startAngle_map[d] + dataObj.theta[d](c.end||c.start+1),
//            dataObj.startAngle_map[dataObj._chrom.keys[(this.parent.index+1)%dataObj._chrom.keys.length]]);
//        }
//    };
//    var feature_angle = function(d) { return dataObj.startAngle_map[d.chr] + dataObj.theta[d.chr](d.start); };
//
//    var value_key = dataObj._wedge[index]._value_key;
//
//    var behavior = function(d) {
//        return (pv.Behavior.hovercard(
//            {
//                include_header : false,
//                include_footer : true,
//                self_hover : true,
//                timeout: dataObj._plot.tooltip_timeout,
//                data_config :
//                    dataObj._wedge[index]._tooltipItems,
//                tool_config : dataObj._wedge[index]._tooltipLinks
//            }
//        ).call(this,d));};
//    //add a new panel each time we want to draw on top of the previously created image.
//    var panel_layer = this.event_panel.add(pv.Panel)
//            .fillStyle(null)
//            .data(dataObj._chrom.keys);
//
//    switch (dataObj._wedge[index]._plot_type) {
//        case 'histogram':
//                if(dataObj._wedge[index]._draw_axes) {
//            /* Circular grid lines. */
//             dot = this.event_panel.add(pv.Dot)
//                    .data(y_axis.ticks(4))
//                    .fillStyle(null)
//                    .strokeStyle("#444")
//                    .lineWidth(1)
//                    .radius(function(i) { return y_axis(i); } );
//            dot.anchor("top").add(pv.Label)
//                    .textBaseline("middle")
//                    .textAlign("right")
//                    .text(function(i) {return y_axis.tickFormat(i);});
//            dot.anchor("bottom").add(pv.Label)
//                    .textBaseline("middle")
//                    .textAlign("right")
//                    .text(function(i) {return y_axis.tickFormat(i);});
//                    }
//            panel_layer.add(pv.Wedge)	//histogram
//                .data(function(d) { return dataObj._wedge[index]._chr[d];})
//                .startAngle(function(c,d) { return dataObj.startAngle_map[d] + dataObj.theta[d](c.start);	})
//                .endAngle(checked_endAngle)
//                .innerRadius(function(c) { return thresholded_innerRadius(c[value_key]);} )
//                .outerRadius(function(c) { return thresholded_outerRadius(c[value_key]); } )
//                .strokeStyle(dataObj._wedge[index]._strokeStyle)
//                .fillStyle(dataObj._wedge[index]._fillStyle)
//                .cursor('pointer')
//                .event('click',function(c,d){ dataObj._wedge[index].listener(c);} )
//                .event('mouseover',behavior);
//            break;
//        case 'scatterplot':
//            if(dataObj._wedge[index]._draw_axes) {
//                dot = this.event_panel.add(pv.Dot)
//                        .data(y_axis.ticks(4))
//                        .fillStyle(null)
//                        .strokeStyle("#444")
//                        .lineWidth(1)
//                        .radius(function(i) { return y_axis(i); } );
//                dot.anchor("top").add(pv.Label)
//                        .textBaseline("middle")
//                        .textAlign("right")
//                        .text(function(i) {return y_axis.tickFormat(i);});
//                dot.anchor("bottom").add(pv.Label)
//                        .textBaseline("middle")
//                        .textAlign("right")
//                        .text(function(i) {return y_axis.tickFormat(i);});
//            }
//            panel_layer.add(pv.Dot)	//scatterplot
//                    .data(function(d) { return dataObj._wedge[index]._chr[d];})
//                    .left(function(c,d) { return width/2 + (thresholded_value_to_radius(c[value_key]) * Math.cos(feature_angle(c))); })
//                    .bottom(function(c,d) { return height/2 + (-1 * (thresholded_value_to_radius(c[value_key])) * Math.sin(feature_angle(c))); })
//                    .shape(dataObj._wedge[index]._shape)
//                    .radius(dataObj._wedge[index]._radius)
//                    .strokeStyle(dataObj._wedge[index]._strokeStyle)
//                    .fillStyle(dataObj._wedge[index]._fillStyle)
//                    .cursor('pointer')
//                    .event('click',function(c,d){ dataObj._wedge[index].listener(c);} )
//                    .event('mouseover',behavior);
//            break;
//        case 'glyph':
//            panel_layer.add(pv.Dot)	//glyph
//                    .data(function(d) { return dataObj._wedge[index]._chr[d];})
//                    .left(function(c,d) { return width/2 + (glyph_distance(c,dataObj._wedge[index])) *  Math.cos(feature_angle(c)); })
//                    .bottom(function(c,d) { return height/2 + (-1 * glyph_distance(c,dataObj._wedge[index]) * Math.sin(feature_angle(c))); })
//                    .shape(dataObj._wedge[index]._shape)
//                    .radius(dataObj._wedge[index]._radius)
//                    .strokeStyle(dataObj._wedge[index]._strokeStyle)
//                    .fillStyle(dataObj._wedge[index]._fillStyle)
//                    .cursor('pointer')
//                    .event('click',function(c,d){ dataObj._wedge[index].listener(c);} )
//                    .event('mouseover',behavior);
//            break;
//            case 'band':
//            panel_layer.add(pv.Wedge)	//tile
//                .data(function(d) { return dataObj._wedge[index]._chr[d];})
//                .startAngle(function(c,d) { return dataObj.startAngle_map[d] + dataObj.theta[d](c.start); })
//                .endAngle(checked_endAngle)
//                .innerRadius(innerRadius )
//                .outerRadius(outerPlotRadius )
//                .strokeStyle(dataObj._wedge[index]._strokeStyle)
//                .fillStyle(dataObj._wedge[index]._fillStyle)
//                .cursor('pointer')
//                .event('click',function(c,d){ dataObj._wedge[index].listener(c);} )
//                .event('mouseover',behavior);
//            break;
//        case 'tile':
//            panel_layer.add(pv.Wedge)	//tile
//                .data(function(d) { return dataObj._wedge[index]._chr[d];})
//                .startAngle(function(c,d) { return dataObj.startAngle_map[d] + dataObj.theta[d](c.start); })
//                .endAngle(checked_endAngle)
//                .innerRadius(function(c,d) { return thresholded_tile_innerRadius(c,dataObj._wedge[index]);} )
//                .outerRadius(function(c,d) { return thresholded_tile_outerRadius(c,dataObj._wedge[index]);} )
//                .strokeStyle(dataObj._wedge[index]._strokeStyle)
//                .fillStyle(dataObj._wedge[index]._fillStyle)
//                .cursor('pointer')
//                .event('click',function(c,d){ dataObj._wedge[index].listener(c);} )
//                .event('mouseover',behavior);
//            break;
//        case 'heatmap':
//            panel_layer.add(pv.Wedge)	//heatmap plot of cnv
//                .data(function(d) { return dataObj._wedge[index]._chr[d];})
//                .startAngle(function(c,d) { return dataObj.startAngle_map[d] + dataObj.theta[d](c.start); })
//                .endAngle(function(c,d) {
//                    if (this.parent.index+1 == dataObj._chrom.keys.length) { return dataObj.startAngle_map[dataObj._chrom.keys[0]] + (Math.PI * 2);}
//                    else {return Math.min(dataObj.startAngle_map[d] + dataObj.theta[d](c.end||c.start+1),
//                        dataObj.startAngle_map[dataObj._chrom.keys[(this.parent.index+1)%dataObj._chrom.keys.length]]);
//                    }
//                })
//                .innerRadius(thresholded_innerRadius(dataObj._wedge[index]._min_plotValue) )
//                .outerRadius(thresholded_outerRadius(dataObj._wedge[index]._max_plotValue) )
//                .strokeStyle(dataObj._wedge[index]._strokeStyle)
//                .fillStyle(dataObj._wedge[index]._fillStyle)
//                .cursor('pointer')
//                .event('click',function(c,d){ dataObj._wedge[index].listener(c);} )
//                .event('mouseover',behavior);
//            break;
//        case 'karyotype':
//            panel_layer.add(pv.Wedge)	//karyotype
//                .data(function(d) { return dataObj._wedge[index]._chr[d];})
//                .startAngle(function(c,d) { return dataObj.startAngle_map[d] + dataObj.theta[d](c.start); })
//                .endAngle(checked_endAngle)
//                .innerRadius(innerRadius )
//                .outerRadius(outerPlotRadius )
//                .fillStyle( function(d) {return d[value_key];})
//                .cursor('pointer')
//                .event('click',function(c,d){ dataObj._wedge[index].listener(c);} )
//                .event('mouseover',behavior);
//            break;
//        default:
//            console.warn('No plot type definition detected.');
//    }

};


vq.CircVis.prototype._drawWedge_withoutRange = function(wedge_obj, chr, wedge_index) {
       var that = this;
    var dataObj = that.chromoData;
    var ideogram = dataObj._ideograms[chr];
    var wedge_params = dataObj._wedge[wedge_index];
    var wedge = ideogram.wedge[wedge_index];
};

vq.CircVis.prototype._drawWedge_withRange = function(wedge_obj, chr, wedge_index) {
           var that = this;
    var dataObj = that.chromoData;
    var ideogram = dataObj._ideograms[chr];
    var wedge_params = dataObj._wedge[wedge_index];
    var wedge = ideogram.wedge[wedge_index];

   // var other_labels = function(d) { return y_linear(d) * -1;};
//    var thresholded_innerRadius = function(d) { return Math.max(y_axis(Math.min(d,range_mean)),innerRadius); };
//    var thresholded_outerRadius = function(d) { return Math.min(y_axis(Math.max(d,range_mean)),outerPlotRadius); };
//    var thresholded_value_to_radius = function(d) { return Math.min(Math.max(y_axis(d),innerRadius),outerPlotRadius); };
//    var thresholded_radius = function(d) { return Math.min(Math.max(d,innerRadius),outerPlotRadius); };
//    var thresholded_tile_innerRadius = function(c,d) { return innerRadius + (d._tile.height + d._tile.padding) * c.level;};
//    var thresholded_tile_outerRadius = function(c,d) { return innerRadius + ((d._tile.height + d._tile.padding) * c.level) + d._tile.height;};
//    var glyph_distance = function(c,d) { return (((d._tile.height + d._tile.padding) * c.level)
//        + innerRadius + (d._radius() * 2));};
//    var checked_endAngle = function(c,d) {
//  if (dataObj._chrom.keys.length == 1) {
//      return Math.min(dataObj.startAngle_map[d] + dataObj.theta[d](c.end||c.start+1),dataObj.startAngle_map[dataObj._chrom.keys[0]] + (Math.PI * 2));
//  }
//  else if (this.parent.index+1 == dataObj._chrom.keys.length) {
//      return Math.min(dataObj.startAngle_map[d] + dataObj.theta[d](c.end||c.start+1),dataObj.startAngle_map[dataObj._chrom.keys[0]] + (Math.PI * 2));
//  }
//        else {return Math.min(dataObj.startAngle_map[d] + dataObj.theta[d](c.end||c.start+1),
//            dataObj.startAngle_map[dataObj._chrom.keys[(this.parent.index+1)%dataObj._chrom.keys.length]]);
//        }
//    };
//    var feature_angle = function(d) { return dataObj.startAngle_map[d.chr] + dataObj.theta[d.chr](d.start); };
//
//    var value_key = data._value_key;

    if (wedge_params._draw_axes) {
        /* Circular grid lines. */
        //add a new panel each time we want to draw on top of the previously created image.
        var p = dataObj._chrom.groups[chr];
        var startAngle = p.startAngle;
        var endAngle = p.endAngle;

        var angles = _.range(startAngle,endAngle,0.01);
        var radii = wedge_params._y_linear.ticks(4);
        var cross = _.map(radii, function(d) { return pv.cross(angles,[d]);});


        wedge_obj.append("svg:g")
                .attr('class','axes')
                .selectAll("path")
                .data(cross)
                .enter().append("svg:path")
                .style("fill", "none")
                .style("stroke", "#555")
                .style('stroke-width', '1.0px')
                .attr('d',  d3.svg.line.radial()
                        .interpolate('cardinal')
                        .radius(function(d) { return wedge_params._y_linear(d[1]);})
                        .angle(function(d) { return d[0];})
                );
 

//            axis.selectAll('svg.axes')
//                .data(radii)
//                .enter().append("svg:text")
//                .attr('text-anchor', 'start')
//                .attr("dy", "-.2em")
//                .attr("dx", ".35em")
//                .attr('y', y_linear)
//                .attr('x', 0)
//                .text(function(d) {
//                    return y_linear.tickFormat(4)(d);
//                });
//
//             axis.selectAll('svg.axes')
//                .data(radii)
//                .enter().append("svg:text")
//            .attr('text-anchor', 'end')
//            .attr("dy", "1em")
//            .attr("dx", "-.2em")
//            .attr('y', other_labels)
//            .attr('x', 0)
//            .text(function(d) {
//                return y_linear.tickFormat(4)(d);
//            });

    }

    that._drawWedgeData(wedge_obj, chr, wedge_index);

};
vq.CircVis.prototype._drawWedgeData = function(wedge_obj, chr, wedge_index) {
           var that = this;
    var wedge_params = that.chromoData._wedge[wedge_index];

    var funcName = '_drawWedgeData_'+ wedge_params._plot_type;
    if (that[funcName] !==undefined) {
        that[funcName](wedge_obj,chr,wedge_index);
    }
};

vq.CircVis.prototype._drawWedgeData_histogram = function(wedge_obj, chr, wedge_index) {
    var that = this;
    var wedge_params = that.chromoData._wedge[wedge_index];
    var wedge_data = that.chromoData._ideograms[chr].wedge[wedge_index];
    var value_key = wedge_params._value_key;
    wedge_obj.append("svg:g")
        .attr('class','data')
        .selectAll("path")
        .data(wedge_data)
        .enter().append('svg:path')
        .attr('fill',wedge_params._fillStyle)
        .attr('stroke',wedge_params._strokeStyle)
        .attr('d',d3.svg.arc()
        .innerRadius(function(point) { return wedge_params._thresholded_innerRadius(point[value_key]);})
        .outerRadius(function(point) { return wedge_params._thresholded_outerRadius(point[value_key]);})
        .startAngle(function(point) { return that.chromoData._ideograms[chr]._feature_angle(point.start);})
        .endAngle(function(point) { return that.chromoData._ideograms[chr]._feature_angle(point.end);})
    );
};

vq.CircVis.prototype._drawWedgeData_scatterplot = function(wedge_obj, chr, wedge_index) {
    var that = this;
    var wedge_params = that.chromoData._wedge[wedge_index];
    var wedge_data = that.chromoData._ideograms[chr].wedge[wedge_index];
    var value_key = wedge_params._value_key;


    wedge_obj.append("svg:g")
        .attr('class','data')
        .selectAll("path")
        .data(wedge_data)
        .enter().append('svg:path')
        .attr('fill',wedge_params._fillStyle)
        .attr('stroke',wedge_params._strokeStyle)
        .attr("transform",function(point) {
            return "translate(" +
                wedge_params._thresholded_value_to_radius(point[value_key]) *
                    Math.cos(that.chromoData._ideograms[chr]._feature_angle(point.start) - Math.PI / 2) +
                "," +
                wedge_params._thresholded_value_to_radius(point[value_key]) *
                    Math.sin(that.chromoData._ideograms[chr]._feature_angle(point.start) -  Math.PI / 2) +
                ")";} )
        .attr('d',d3.svg.symbol()
        .type(wedge_params._shape)
        .size(Math.pow(wedge_params._radius(),2)) );

};

vq.CircVis.prototype._drawWedgeData_band = function(wedge_obj, chr, wedge_index) {

        wedge_obj.append("svg:g")
                .attr('class','data')
                .selectAll("path")
};

vq.CircVis.prototype._drawWedgeData_glyph = function(wedge_obj, chr, wedge_index) {

        wedge_obj.append("svg:g")
                .attr('class','data')
                .selectAll("path")
};

vq.CircVis.prototype._drawWedgeData_tile = function(wedge_obj, chr, wedge_index) {

        wedge_obj.append("svg:g")
                .attr('class','data')
                .selectAll("path")
};

vq.CircVis.prototype._drawWedgeData_karyotype = function(wedge_obj, chr, wedge_index) {

        wedge_obj.append("svg:g")
                .attr('class','data')
                .selectAll("path")
};

vq.CircVis.prototype._drawWedgeData_heatmap = function(wedge_obj, chr, wedge_index) {

        wedge_obj.append("svg:g")
                .attr('class','data')
                .selectAll("path")
};



vq.models.CircVisData = function(data) {

    vq.models.VisData.call(this, data);

    this.setDataModel();

    if (this.getDataType() == 'vq.models.CircVisData') {
        this._build_data(this.getContents())
    } else {
        console.warn('Unrecognized JSON object.  Expected vq.models.CircVisData object.');
    }
};


vq.models.CircVisData.prototype = pv.extend(vq.models.VisData);

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
            return 'red';
        } },
        {label : '_network.node_fillStyle', id: 'NETWORK.OPTIONS.node_fill_style', cast : vq.utils.VisUtils.wrapProperty, defaultValue : function() {
            return 'blue';
        } },
        {label : '_network.node_strokeStyle', id: 'NETWORK.OPTIONS.node_stroke_style', cast : vq.utils.VisUtils.wrapProperty, defaultValue : function() {
            return 'blue';
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
        {label : 'ticks.wedge_width', id: 'TICKS.OPTIONS.wedge_width', cast : Number, defaultValue: 0.5 },
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
            return pv.color('red');
        }},
        {label : 'ticks.stroke_style', id: 'TICKS.OPTIONS.stroke_style', cast : vq.utils.VisUtils.wrapProperty, defaultValue : function() {
            return pv.color('white');
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
    var chrom_keys_order,chrom_length_map,chrom_length_array = [],cnv_map, startAngle = {},
        cnv_array, cnv_height = [], startAngle_map = {},normalizedLength = {},
        deviation = [],median = [], theta = {}, totalChromLength;
    this.normalizedLength,this.theta = [],this.startAngle_map;

    var that = this;

    if (this._chrom.keys == [] || this._chrom.length == []) {
        console.warn('Chromosome/Ideogram information has not been detected.  Please verify that keys and length/key mappings have been ' +
            'passed into the GENOME.DATA object.');
        return;
    }

    var chrom_keys_array = this._chrom.keys;       //array in pre-sorted order
    chrom_keys_order = pv.numerate(chrom_keys_array);

    chrom_length_array = this._chrom.length.filter(function(d) {
        return chrom_keys_order[d['chr_name']] != null;
    });
    chrom_length_array.sort(function(c, d) {
        return chrom_keys_order[c['chr_name']] - chrom_keys_order[d['chr_name']] > 0;
    });  //sort by given order
    totalChromLength = pv.sum(chrom_length_array, function(d) {
        return d['chr_length'];
    });

    chrom_length_map = pv.nest(chrom_length_array)
        .key(function(d) {
            return d['chr_name'].toUpperCase();
        })
        .sortKeys(function(c, d) {
            return chrom_keys_order[c['chr_name']] - chrom_keys_order[d['chr_name']] > 0;
        })//sort by given order
        .map();

    normalizedLength = pv.dict(chrom_keys_array, function(d) {
        return chrom_length_map[d.toUpperCase()][0]['chr_length'] / totalChromLength;
    });

    this.normalizedLength = normalizedLength;

    var chrom_groups = {};

    var rotation = (this._plot.rotate_degrees) * Math.PI / 180;

    //for each index of chrom_keys ( pre-sorted)
    // sum all lengths from 1st index to last index of chrom_length (sorted to chrom_length)
    chrom_keys_array.forEach(function(d) {
        startAngle[d] = pv.sum(chrom_keys_array.slice(0, (chrom_keys_order[d])),
            function() {
                return (normalizedLength[chrom_keys_array[this.index]] * 2 * Math.PI);
            });

        theta[d] = pv.Scale.linear(0, chrom_length_map[d.toUpperCase()][0]['chr_length'])
            .range(0, 2 * Math.PI * normalizedLength[d]);

        if (that._chrom.reverse_list != undefined &&
            that._chrom.reverse_list.filter(
                function(c) {
                    return c == d;
                }).length > 0) {  //defined as reversed!
            theta[d] = pv.Scale.linear(0, chrom_length_map[d.toUpperCase()][0]['chr_length'])
                .range(2 * Math.PI * normalizedLength[d], 0);

        } else {
            theta[d] = pv.Scale.linear(0, chrom_length_map[d.toUpperCase()][0]['chr_length'])
                .range(0, 2 * Math.PI * normalizedLength[d]);

        }
        chrom_groups[d]={key:d, startAngle: startAngle[d], endAngle: startAngle[d] + 2 * Math.PI * normalizedLength[d], theta:theta[d] };
    });


    startAngle_map = pv.dict(chrom_keys_array, (function(d) {
        return startAngle[d] - (Math.PI / 2) + rotation;
    } ));
    this.startAngle_map = startAngle_map;
    this._chrom.groups = chrom_groups;

    this.theta = theta;
    this._ideograms=pv.dict(that._chrom.keys, function(d) {
                return _.extend(chrom_groups[d],{wedge:[],_feature_angle : function(a) { return this.startAngle + this.theta(a); }});
            });

    if (this._wedge != undefined) {
        this._wedge.forEach(function(wedge, index) {

            if (wedge._plot_type == 'tile' || wedge._plot_type == 'glyph') {
                var max_tile_level = wedge._tile_show_all_tiles ?
                    Math.floor((wedge._plot_height - (wedge._radius() * 4)) / (wedge._tile_height + wedge._tile_padding)) :
                    undefined;
                wedge._data = (wedge._plot_type == 'tile' ? vq.utils.VisUtils.layoutChrTiles(wedge._data, wedge._tile_overlap_distance, max_tile_level) :
                    vq.utils.VisUtils.layoutChrTicks(wedge._data, wedge._tile_overlap_distance, max_tile_level));
            }

            cnv_map = pv.nest(wedge._data)
                .key(function(d) {
                    return d.chr;
                })
                .map();

            wedge._chr = [];
            wedge._chr = pv.dict(that._chrom.keys, function(d) {
                return cnv_map[d] === undefined ? [] : _.extend(cnv_map[d],chrom_groups[d]);
            });
            wedge._outerRadius =
                (that._plot.height / 2) -
                    (pv.sum(that._wedge.slice(0, index), function(a) {
                        return a._plot_height;
                    }) + pv.sum(that._wedge.slice(0, index), function(a) {
                        return a._outer_padding;
                    })) - (that.ticks.outer_padding + that.ticks.height);

            wedge._outerPlotRadius = wedge._outerRadius - wedge._outer_padding;

            wedge._innerRadius = wedge._outerPlotRadius - wedge._plot_height;

            that._chrom.keys.forEach(function(d) {
                        that._ideograms[d]._outerRadius = (that._plot.height / 2) - (that.ticks.outer_padding + that.ticks.height);
                        that._ideograms[d].wedge[index] = wedge._chr[d];
            });        

            var value_label = wedge._value_key;
            deviation = pv.deviation(wedge._data, function(d) {
                return d[value_label];
            });
            median = pv.median(wedge._data, function(d) {
                return d[value_label];
            });

            wedge._min_plotValue = (wedge._min_plotValue === undefined) ? parseFloat(((-1 * deviation) + median).toFixed(2)) : wedge._min_plotValue;
            wedge._max_plotValue = (wedge._max_plotValue === undefined) ? parseFloat((deviation + median).toFixed(2)) : wedge._max_plotValue;
            wedge._range_mean = wedge._base_plotValue != null ? wedge._base_plotValue : (wedge._min_plotValue + wedge._max_plotValue) / 2;
    wedge._y_linear = d3.scale.linear()
        .domain([wedge._min_plotValue, wedge._max_plotValue])
        .range([wedge._innerRadius,wedge._outerRadius - wedge._outer_padding]).nice();

    wedge._y_axis = pv.Scale.linear(wedge._min_plotValue, wedge._max_plotValue).range(wedge._innerRadius,wedge._outerPlotRadius);
    wedge._thresholded_innerRadius = function(d) { return Math.max(wedge._y_axis(Math.min(d,wedge._range_mean)),wedge._innerRadius); };
    wedge._thresholded_outerRadius = function(d) { return Math.min(wedge._y_axis(Math.max(d,wedge._range_mean)),wedge._outerPlotRadius); };
    wedge._thresholded_value_to_radius = function(d) { return Math.min(Math.max(wedge._y_axis(d),wedge._innerRadius),wedge._outerPlotRadius); };
    wedge._thresholded_radius = function(d) { return Math.min(Math.max(d,wedge._innerRadius),wedge._outerPlotRadius); };
    wedge._thresholded_tile_innerRadius = function(c,d) { return wedge._innerRadius + (d._tile.height + d._tile.padding) * c.level;};
    wedge._thresholded_tile_outerRadius = function(c,d) { return wedge._innerRadius + ((d._tile.height + d._tile.padding) * c.level) + d._tile.height;};
//    wedge._glyph_distance = function(c,d) { return (((d._tile.height + d._tile.padding) * c.level)
//        + innerRadius + (d._radius() * 2));};
//            wedge._checked_endAngle = function(feature,chr) {
//                if (dataObj._chrom.keys.length == 1) {
//                    return Math.min(dataObj.startAngle_map[chr] + dataObj.theta[chr](feature.end||feature.start+1),dataObj.startAngle_map[dataObj._chrom.keys[0]] + (Math.PI * 2));
//                }
//                else if (this.parent.index+1 == dataObj._chrom.keys.length) {
//                    return Math.min(dataObj.startAngle_map[chr] + dataObj.theta[chr](feature.end||feature.start+1),dataObj.startAngle_map[dataObj._chrom.keys[0]] + (Math.PI * 2));
//                }
//                else {return Math.min(dataObj.startAngle_map[chr] + dataObj.theta[chr](feature.end||feature.start+1),
//                    dataObj.startAngle_map[dataObj._chrom.keys[(this.parent.index+1)%dataObj._chrom.keys.length]]);
//                }
//            };
            delete wedge._data;
        }); //foreach       
    }
    //------------------- NETWORK DATA
    var nodes = pv.dict(this._chrom.keys, function() {
        return {};
    });
    var node_array = [];
    var links_array = [];
    var length;
    var index1,index2;
    if (this._network != undefined && this._network.data != undefined) {
        this._network.data.forEach(function(d) {
            index1 = null;
            index2 = null;
            if (nodes[d.node1.chr] != undefined) {
                if (nodes[d.node1.chr][d.node1.start] === undefined) {
                    nodes[d.node1.chr][d.node1.start] = {};
                    if (nodes[d.node1.chr][d.node1.start][d.node1.end] === undefined) {
                        var temp_node = d.node1;
                        temp_node.nodeName = d.node1.chr;
                        length = node_array.push(temp_node);
                        index1 = length - 1;
                        nodes[d.node1.chr][d.node1.start][d.node1.end] = index1;
                    } else {
                        index1 = nodes[d.node1.chr][d.node1.start][d.node1.end];
                    }
                } else {
                    index1 = nodes[d.node1.chr][d.node1.start][d.node1.end];
                }
            }
            if (nodes[d.node2.chr] != undefined) {
                if (nodes[d.node2.chr][d.node2.start] === undefined) {
                    nodes[d.node2.chr][d.node2.start] = {};
                    if (nodes[d.node2.chr][d.node2.start][d.node2.end] === undefined) {
                        var temp_node = d.node2;
                        temp_node.nodeName = d.node2.chr;
                        length = node_array.push(temp_node);
                        index2 = length - 1;
                        nodes[d.node2.chr][d.node2.start][d.node2.end] = index2;
                    } else {
                        index2 = nodes[d.node2.chr][d.node2.start][d.node2.end];
                    }
                } else {
                    index2 = nodes[d.node2.chr][d.node2.start][d.node2.end];
                }
            }

            if (index1 != null && index2 != null) {
                //copy out useful properties
                var node = {source : index1, target : index2};
                for (var p in d) {
                    if (p != 'node1' && p != 'node2') {
                        node[p] = d[p];
                    }
                }
                links_array.push(node);
            }
        });
        this._network.nodes_array = this._network.tile_nodes ? vq.utils.VisUtils.layoutChrTiles(node_array, that._network.node_overlap_distance) : node_array;
        this._network.links_array = links_array;
        this._network.data = 'loaded';
        nodes = [];
        node_array = [];
        links_array = [];
    }

    if (this.ticks != undefined && this.ticks._data_array != undefined && this.ticks._data_array != null) {
        if (that.ticks.overlap_distance === undefined) {
            var overlap_ratio = 7000000.0 / 3080419480;
            that.ticks.overlap_distance = overlap_ratio * totalChromLength;
        }
        var tick_array = that.ticks.tile_ticks ? vq.utils.VisUtils.layoutChrTicks(that.ticks._data_array, that.ticks.overlap_distance) :
            that.ticks._data_array;

        var ticks_map = pv.nest(tick_array)
            .key(function(d) {
                return d.chr;
            })
            .map();

        this.ticks.data_map = pv.dict(that._chrom.keys, function(d) {
            return ticks_map[d] === undefined ? [] : ticks_map[d];
        });
        this.ticks._data_array = [];
        delete tick_array;
        ticks_map = [];
    }
    this.setDataReady(true);
};


/**
 *
 * @class Internal data model for ring plots.
 *
 * @param data {JSON Object} - Configures a single ring plot.
 * @extends vq.models.VisData
 */
vq.models.CircVisData.WedgeData = function(data) {

    vq.models.VisData.call(this, {CONTENTS:data});

    this.setDataModel();
    this._build_data(this.getContents())

};

vq.models.CircVisData.WedgeData.prototype = pv.extend(vq.models.VisData);

vq.models.CircVisData.WedgeData.prototype.setDataModel = function() {
    this._dataModel = [
        {label : '_data', id: 'DATA.data_array', defaultValue : [
            {"chr": "1", "end": 12784268, "start": 644269,
                "value": -0.058664}
        ]},
        {label : '_value_key', id: 'DATA.value_key', defaultValue : 'value',cast: String },
        {label : 'listener', id: 'OPTIONS.listener', defaultValue :  function(a, b) {
        } },
        {label : '_plot_type', id: 'PLOT.type', defaultValue : 'histogram' },
        {label : '_plot_height', id: 'PLOT.height', cast: Number, defaultValue : 100 },
        {label : '_fillStyle', id: 'OPTIONS.fill_style', cast : vq.utils.VisUtils.wrapProperty, defaultValue : function(d) {
            return 'red';
        } },
        {label : '_strokeStyle', id: 'OPTIONS.stroke_style', cast : vq.utils.VisUtils.wrapProperty, defaultValue : function(d) {
            return 'red';
        } },
        {label : '_shape', id: 'OPTIONS.shape', cast : vq.utils.VisUtils.wrapProperty, defaultValue : function(d) {
            return 'circle';
        } },
        {label : '_radius', id: 'OPTIONS.radius', cast : vq.utils.VisUtils.wrapProperty, defaultValue : function(d) {
            return 2;
        } },
        {label : '_outer_padding', id: 'OPTIONS.outer_padding', cast : Number, defaultValue : 1 },
        {label : '_min_plotValue', id: 'OPTIONS.min_value',  cast : Number , optional : true },
        {label : '_max_plotValue', id: 'OPTIONS.max_value',  cast : Number , optional : true },
        {label : '_base_plotValue', id: 'OPTIONS.base_value', cast: Number, optional : true },
        {label : '_legend_label', id: 'OPTIONS.legend_label', cast: String, defaultValue : '' },
        {label : '_legend_desc', id: 'OPTIONS.legend_description', cast: String, defaultValue : '' },
        {label : '_draw_axes', id: 'OPTIONS.draw_axes', cast: Boolean, defaultValue : true },
        {label : '_tooltipFormat', id: 'OPTIONS.tooltipFormat', cast :vq.utils.VisUtils.wrapProperty,
            defaultValue : function(c, d) {
                return "Chr " + d + "\nStart: " + c.start + "\nEnd: " + c.end;
            }   },
        {label : '_tooltipItems', id: 'OPTIONS.tooltip_items',  defaultValue : {Chr:'chr',Start:'start',End:'end',Value:'value'} },
        {label : '_tooltipLinks', id: 'OPTIONS.tooltip_links',  defaultValue : {} },
        {label : '_tile.padding', id: 'OPTIONS.tile_padding', cast: Number, defaultValue : 5 },
        {label : '_tile.overlap_distance', id: 'OPTIONS.tile_overlap_distance', cast: Number, defaultValue : 0.1 },
        {label : '_tile.height', id: 'OPTIONS.tile_height', cast: Number, defaultValue : 5 },
        {label : '_tile.show_all_tiles', id: 'OPTIONS.tile_show_all_tiles', cast: Boolean, defaultValue : false }
    ];
};

vq.models.CircVisData.WedgeData.prototype._build_data = function(data_struct) {
    this._processData(data_struct)
};
