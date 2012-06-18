

vq.CircVis.prototype._drawWedgeContents = function(chr, wedge_index) {
    var that = this;
    var dataObj = that.chromoData;
    var ideogram = dataObj._ideograms[chr];
    var wedge_obj = d3.select('.ideogram[data-region="'+chr+'"] .wedge[data-ring="'+wedge_index+'"]');
    var wedge_params = dataObj._wedge[wedge_index];
    switch (wedge_params._plot_type) {
        case('karyotype'):
        case('tile'):
        case('band'):
        case('glyph'):
            this._drawWedgeData(chr, wedge_index);
            break;
        default:
            this._drawWedge_withRange(chr, wedge_index);
    }
};

/**private **/
vq.CircVis.prototype._add_wedge = function(chr) {
    var that = this;
    var dataObj = this.chromoData;
    var ideogram_obj = d3.select('.ideogram[data-region="'+chr+'"]');

    function outerRadius(index) {
        return dataObj._wedge[index]._outerPlotRadius;
    }

    function innerRadius(index) {
        return dataObj._wedge[index]._innerRadius;
    }

    var wedge_obj = ideogram_obj.append("svg:g")
        .attr('class','wedges')
        .selectAll("path")
        .data(_.range(0,dataObj._wedge.length))
        .enter()
        .append("svg:g")
        .attr("class",  "wedge")
        .attr('data-ring',function(index) { return index;});

    wedge_obj
        .append("svg:path")
        .attr('class', 'background')
        .attr("d",d3.svg.arc()
        .innerRadius(  function(ring_index) { return innerRadius(ring_index); })
        .outerRadius( function(ring_index) { return outerRadius(ring_index);} )
        .startAngle(0)
        .endAngle( dataObj._chrom.groups[chr].angle)
    );


    // var clip_obj = ideogram_obj.append('defs').append('svg:clipPath')
    // .attr('')

    wedge_obj.append("svg:g")
        .attr('class','data');

    ideogram_obj.selectAll("g.wedge")
        .each(checkAndPlot);

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
            else if (wedge_params._min_plotValue == wedge_params._max_plotValue) {
                wedge_params._min_plotValue = wedge_params._min_plotValue - 1;
                wedge_params._max_plotValue = wedge_params._max_plotValue + 1;
                console.warn('Invalid value range detected.  Range reset to [-1,1].');
            }
        }
        that._drawWedgeContents(chr, wedge_index);
    }
};


vq.CircVis.prototype._drawWedge_withoutRange = function( chr, wedge_index) {
    var that = this;
    var dataObj = that.chromoData;
    var ideogram = dataObj._ideograms[chr];
    var wedge_params = dataObj._wedge[wedge_index];
    var wedge = ideogram.wedge[wedge_index];
};

vq.CircVis.prototype._drawWedge_withRange = function(chr, wedge_index) {
    var that = this;
    var dataObj = that.chromoData;
    var ideogram = dataObj._ideograms[chr];
    var wedge_params = dataObj._wedge[wedge_index];
    var wedge = ideogram.wedge[wedge_index];
    var wedge_obj = d3.select('.ideogram[data-region="'+chr+'"] .wedge[data-ring="'+wedge_index+'"]');

    if (wedge_params._draw_axes) {
        /* Circular grid lines. */
        //add a new panel each time we want to draw on top of the previously created image.
        var p = dataObj._chrom.groups[chr];
        var startAngle = p.startAngle;
        var endAngle = p.angle;

        //interpolate position for radial line
        var angles = _.range(0,endAngle,0.01);
        // generate ticks for y_axis
        var radii = wedge_params._y_linear.ticks(4);
        //make a vector of pairs (theta,r)
        var cross = _.map(radii, function(r) { return _.map(angles, function(theta) {return [theta,r];});});

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

    }

    that._drawWedgeData(chr, wedge_index);

};

vq.CircVis.prototype._drawWedgeData = function(chr, wedge_index) {
    var that = this;

    //draw all wedges if parameter is left out.
    var all_wedges = _.isUndefined(wedge_index) || _.isNull(wedge_index);
    //return if ill-defined wedge
    if (!all_wedges && _.isNumber(wedge_index) && _.isFinite(wedge_index) &&
        wedge_index >= that.chromoData._wedge.length) {
        console.error('drawWedgeData: Invalid wedge #:' + wedge_index);
        return;
    }

    function drawWedge(index) {
        var wedge_params = that.chromoData._wedge[index];

        var funcName = '_drawWedgeData_'+ wedge_params._plot_type;
        if (that[funcName] !==undefined) {
            that[funcName](chr,index);
        }
        //get all the data points in this wedge
        var data = d3.selectAll('.ideogram[data-region="'+chr+'"] .wedge[data-ring="'+index+'"] .data > *');
        //set listener
        data.on('mouseover',function(d) { wedge_params.hovercard.call(this,d);});
    }

    if (all_wedges) {
        _.each(_.range(0,that.chromoData._wedge.length),function(i) { drawWedge.call(that,i);});
        return;
    }

    drawWedge.call(that,wedge_index);

};


vq.CircVis.prototype._drawWedgeData_histogram = function(chr, wedge_index) {
    var that = this;
    var wedge_params = that.chromoData._wedge[wedge_index];
    var wedge_data = that.chromoData._ideograms[chr].wedge[wedge_index];
    var value_key = wedge_params._value_key;
    var wedge_obj = d3.select('.ideogram[data-region="'+chr+'"] .wedge[data-ring="'+wedge_index+'"]');

    var histogramArc = function (point) {
        var _inner = wedge_params._innerRadius;
        //   var _outer = wedge_params._thresholded_outerRadius(point[value_key]);
        var start = that.chromoData._ideograms[chr].theta(point.start);
        var end = that.chromoData._ideograms[chr].theta(point.end);
        return d3.svg.arc()
            .innerRadius( _inner)
            .startAngle( start)
            .endAngle(end);
    };

    var hist = wedge_obj.select('g.data')
        .selectAll("path")
        .data(wedge_data,that.chromoData._network.node_key);
    hist
        .enter().append('svg:path')
        .attr('fill',wedge_params._fillStyle)
        .attr('stroke',wedge_params._strokeStyle)
        .attr('stroke-width',wedge_params._lineWidth)
        .transition()
        .delay(100)
        .duration(800)
        .attrTween('d',function(a) {
            var i =d3.interpolate({outerRadius:wedge_params._innerRadius},{outerRadius:wedge_params._thresholded_outerRadius(a[value_key])});
            var arc = histogramArc(a);
            return function(t) {return arc(i(t));};
        })
        .attrTween('opacity', function(a) {
            var i=d3.interpolate(0.2,1.0);
            return function(t) {return  i(t);}
        });

    hist.exit()
        .transition()
        .delay(100)
        .duration(800)
        .attrTween('d',function(a) {
            var i =d3.interpolate({outerRadius:wedge_params._thresholded_outerRadius(a[value_key])},{outerRadius:wedge_params._innerRadius});
            var arc = histogramArc(a);
            return function(t) {return arc(i(t));};
        })
        .attrTween('opacity', function(a) {
            var i=d3.interpolate(1.0,0);
            return function(t) {return  i(t);}
        })
        .remove();
};

vq.CircVis.prototype._drawWedgeData_scatterplot = function(chr, wedge_index) {
    var that = this;
    var wedge_params = that.chromoData._wedge[wedge_index];
    var wedge_data = that.chromoData._ideograms[chr].wedge[wedge_index];
    var value_key = wedge_params._value_key;
    var wedge_obj = d3.select('.ideogram[data-region="'+chr+'"] .wedge[data-ring="'+wedge_index+'"]');

    var scatter = wedge_obj.select('g.data')
        .selectAll("path")
        .data(wedge_data,that.chromoData._network.node_key);
    scatter
        .enter().append('svg:path')
        .attr('fill',wedge_params._fillStyle)
        .attr('stroke',wedge_params._strokeStyle)
        .attr('opacity',0.2)
        .attr("transform",function(point) {
            return "rotate(" + ((that.chromoData._ideograms[chr].theta(point.start) * 180 / Math.PI) - 90)+ ")translate(" +
                wedge_params._thresholded_value_to_radius(point[value_key]) + ")";} )
        .attr('d',d3.svg.symbol()
        .type(wedge_params._shape)
        .size(Math.pow(wedge_params._radius(),2)) )
        .transition()
        .delay(100)
        .duration(800)
        .attrTween('opacity',function(a) {
            var i =d3.interpolate(0.2,1.0);
            return function(t) { return i(t);}
        });
    scatter.exit().remove();
};

vq.CircVis.prototype._drawWedgeData_band = function(chr, wedge_index) {
    var that = this;
    var wedge_params = that.chromoData._wedge[wedge_index];
    var wedge_data = that.chromoData._ideograms[chr].wedge[wedge_index];
    var value_key = wedge_params._value_key;

    var wedge_obj = d3.select('.ideogram[data-region="'+chr+'"] .wedge[data-ring="'+wedge_index+'"]');
    var band = wedge_obj.select('g.data')
        .selectAll("path")
        .data(wedge_data,that.chromoData._network.node_key);
    band
        .enter().append('svg:path')
        .attr('fill',wedge_params._fillStyle)
        .attr('stroke',wedge_params._strokeStyle)
        .attr('d',d3.svg.arc()
        .innerRadius( wedge_params._innerRadius)
        .outerRadius( wedge_params._outerPlotRadius)
        .startAngle(function(point) { return that.chromoData._ideograms[chr].theta(point.start);})
        .endAngle(function(point) { return that.chromoData._ideograms[chr].theta(point.end);})
    );

    band.exit().remove();
};

vq.CircVis.prototype._drawWedgeData_glyph = function(chr, wedge_index) {

    var that = this;
    var wedge_params = that.chromoData._wedge[wedge_index];
    var wedge_data = that.chromoData._ideograms[chr].wedge[wedge_index];
    var value_key = wedge_params._value_key;
    var wedge_obj = d3.select('.ideogram[data-region="'+chr+'"] .wedge[data-ring="'+wedge_index+'"]');

    var glyph = wedge_obj.select('g.data')
        .selectAll("path")
        .data(wedge_data,wedge_params._hash);
    glyph
        .enter().append('svg:path')
        .attr('fill',wedge_params._fillStyle)
        .attr('stroke',wedge_params._strokeStyle)
        .attr("transform",function(point) {
            return "rotate(" + ((that.chromoData._ideograms[chr].theta(point.start) * 180 / Math.PI) - 90)+ ")translate(" +
                wedge_params._glyph_distance(point) + ")";} )
        .transition()
        .delay(100)
        .duration(800)
        .attr('d',d3.svg.symbol()
        .type(wedge_params._shape)
        .size(Math.pow(wedge_params._radius(),2))
    )
        .attrTween('opacity',function(a) {
            var i =d3.interpolate(0.2,1.0);
            return function(t) { return i(t);}
        });
    glyph.exit()
        .transition()
        .delay(100)
        .duration(800)
        .attrTween('opacity',function(a) {
            var i =d3.interpolate(1.0,0);
            return function(t) { return i(t);}
        })
        .remove();
};

vq.CircVis.prototype._drawWedgeData_tile = function(chr, wedge_index) {
    var that = this;
    var wedge_params = that.chromoData._wedge[wedge_index];
    var wedge_data = that.chromoData._ideograms[chr].wedge[wedge_index];
    var value_key = wedge_params._value_key;
    var wedge_obj = d3.select('.ideogram[data-region="'+chr+'"] .wedge[data-ring="'+wedge_index+'"]');

    var tile = wedge_obj.select('g.data')
        .selectAll("path")
        .data(wedge_data,that.chromoData._network.node_key);
    tile
        .enter().append('svg:path')
        .attr('fill',wedge_params._fillStyle)
        .attr('stroke',wedge_params._strokeStyle)
        .attr('d',d3.svg.arc()
        .innerRadius( function(point) { return wedge_params._thresholded_tile_innerRadius(point,wedge_params);})
        .outerRadius( function(point) { return wedge_params._thresholded_tile_outerRadius(point,wedge_params);})
        .startAngle(function(point) { return that.chromoData._ideograms[chr].theta(point.start);})
        .endAngle(function(point) { return that.chromoData._ideograms[chr].theta(point.end);})
    );
    tile.exit().remove();
};

vq.CircVis.prototype._drawWedgeData_karyotype = function(chr, wedge_index) {
    var that = this;
    var wedge_params = that.chromoData._wedge[wedge_index];
    var wedge_data = that.chromoData._ideograms[chr].wedge[wedge_index];
    var value_key = wedge_params._value_key;
    var wedge_obj = d3.select('.ideogram[data-region="'+chr+'"] .wedge[data-ring="'+wedge_index+'"]');
    var karyotype = wedge_obj.select('g.data')
        .selectAll("path")
        .data(wedge_data,that.chromoData._network.node_key);
    karyotype
        .enter().append('svg:path')
        .attr('fill',function(point) { return point[value_key];})
        .attr('stroke',wedge_params._strokeStyle)
        .attr('d',d3.svg.arc()
        .innerRadius( wedge_params._innerRadius)
        .outerRadius( wedge_params._outerPlotRadius)
        .startAngle(function(point) { return that.chromoData._ideograms[chr].theta(point.start);})
        .endAngle(function(point) { return that.chromoData._ideograms[chr].theta(point.end);})
    );
    karyotype.exit().remove();
};

vq.CircVis.prototype._drawWedgeData_heatmap = function(chr, wedge_index) {
    var that = this;
    var wedge_params = that.chromoData._wedge[wedge_index];
    var wedge_data = that.chromoData._ideograms[chr].wedge[wedge_index];
    var value_key = wedge_params._value_key;
    var wedge_obj = d3.select('.ideogram[data-region="'+chr+'"] .wedge[data-ring="'+wedge_index+'"]');

    var generateArcTween = function (point) {
        var _theta = that.chromoData._ideograms[chr].theta(point.start);
        var _end = that.chromoData._ideograms[chr].theta(point.end);
        return d3.svg.arc()
            .innerRadius(function(multiplier) { return wedge_params._innerRadius - (multiplier *4);})
            .outerRadius(function(multiplier) { return wedge_params._outerPlotRadius + (multiplier * 4);})
            .startAngle(function(multiplier) { return _theta -  (multiplier * Math.PI / 360);})
            .endAngle(function(multiplier) {  return _end + (multiplier * Math.PI /  360);});
    };

    var heat = wedge_obj.select('g.data')
        .selectAll("path")
        .data(wedge_data,that.chromoData._network.node_key);
    heat
        .enter().append('svg:path')
        .attr('fill',wedge_params._fillStyle)
        .attr('stroke',wedge_params._strokeStyle)
        .attr('stroke-width','1px')
        .attr('visibility','hidden')
        .attr('d',d3.svg.arc()
        .innerRadius( wedge_params._innerRadius)
        .outerRadius( wedge_params._outerPlotRadius)
        .startAngle(function(point) { return that.chromoData._ideograms[chr].theta(point.start);})
        .endAngle(function(point) { return that.chromoData._ideograms[chr].theta(point.end);})
    )
        .transition()
        .delay(100)
        .duration(800)
        .attr('visibility','visible')
        .attrTween('d',function(a) {
            var i =d3.interpolate(4,0);
            var arc = generateArcTween(a);
            return function(t) {return arc(i(t));};
        });

    heat.exit().remove();

};

vq.CircVis.prototype._draw_axes_ticklabels = function(wedge_index) {
    var that = this;
    var dataObj = that.chromoData;
    var wedge_params = dataObj._wedge[wedge_index];
    //don't do this for ring without a range.
    if(!_.isFunction(wedge_params._y_linear)) { return;}

    if (wedge_params._draw_axes) {
        /* Circular grid lines. */

        // generate ticks for y_axis
        var radii = wedge_params._y_linear.ticks(4);

        d3.select('.ideogram .wedge[data-ring="'+wedge_index+'"] .axes')
            .append("svg:g")
            .attr('class','labels')
            .selectAll('g.text')
            .data(radii)
            .enter().append("svg:text")
            .each(function() {$(this).disableSelection();})
            .attr('transform',function(r) {return 'translate(0,-'+wedge_params._y_linear(r) +')';})
            .text(function(a) { return a;});
    }

};

vq.CircVis.prototype._remove_wedge_data = function(node) {
    var that = this;
    var chr = node.chr;
    _.each(that.chromoData._ideograms[chr].wedge, function(wedge,index) {
        that.chromoData._ideograms[chr].wedge[index] = _.reject(wedge,
            function(obj) { return that.same_feature(obj,node);});
    });
};

vq.CircVis.prototype._add_wedge_data = function(data) {
    var that = this;
    var chr = data.chr;
    _.each(that.chromoData._ideograms[chr].wedge, function(wedge,index) {
        if(_.isUndefined(data[that.chromoData._wedge[index]._value_key]) || that.chromoData._wedge[index]._plot_type =='karyotype') { return;}
        wedge.push(data);
    });
};
