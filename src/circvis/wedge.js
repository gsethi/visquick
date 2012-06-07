

vq.CircVis.prototype._drawWedgeContents = function(chr, wedge_index,append) {
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
            this._drawWedgeData(chr, wedge_index,append);
            break;
        default:
            this._drawWedge_withRange(chr, wedge_index,append);
    }
};

/**private **/
vq.CircVis.prototype._add_wedge = function(chr) {
    var that = this;
    var dataObj = this.chromoData;
    var ideogram_obj = d3.select('.ideogram[data-region="'+chr+'"]');

    function outerRadius(index) {
        return dataObj._wedge[index]._outerRadius -  dataObj._wedge[index]._outer_padding
    }

    function innerRadius(index) {
        return outerRadius(index) - dataObj._wedge[index]._plot_height;
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
        .style("fill", "#ddd")
        .style("stroke", "#444")
        .style("opacity",0.6)
        .attr("d",d3.svg.arc()
            .innerRadius(  function(ring_index) { return innerRadius(ring_index); })
            .outerRadius( function(ring_index) { return outerRadius(ring_index);} )
            .startAngle(0)
            .endAngle( dataObj._chrom.groups[chr].angle)
        );

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
        }

        if (wedge_params._min_plotValue == wedge_params._max_plotValue) {
            wedge_params._min_plotValue = wedge_params._min_plotValue - 1;
            wedge_params._max_plotValue = wedge_params._max_plotValue + 1;
            console.warn('Invalid value range detected.  Range reset to [-1,1].');
        }
        that._drawWedgeContents(chr, wedge_index);
    }
};


vq.CircVis.prototype._drawWedge_withoutRange = function( chr, wedge_index,append) {
       var that = this;
    var dataObj = that.chromoData;
    var ideogram = dataObj._ideograms[chr];
    var wedge_params = dataObj._wedge[wedge_index];
    var wedge = ideogram.wedge[wedge_index];
};

vq.CircVis.prototype._drawWedge_withRange = function(chr, wedge_index,append) {
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

    that._drawWedgeData(chr, wedge_index,append);

};

vq.CircVis.prototype._drawWedgeData = function(chr, wedge_index, append) {
           var that = this;
    var wedge_params = that.chromoData._wedge[wedge_index];

    var funcName = '_drawWedgeData_'+ wedge_params._plot_type;
    if (that[funcName] !==undefined) {
        that[funcName](chr,wedge_index,append);
    }
};




vq.CircVis.prototype._drawWedgeData_histogram = function(chr, wedge_index) {
    var that = this;
    var wedge_params = that.chromoData._wedge[wedge_index];
    var wedge_data = that.chromoData._ideograms[chr].wedge[wedge_index];
    var value_key = wedge_params._value_key;
    var wedge_obj = d3.select('.ideogram[data-region="'+chr+'"] .wedge[data-ring="'+wedge_index+'"]');

    var histogramArcTween = function (point) {
        var _inner = wedge_params._thresholded_innerRadius(point[value_key]);
        var _outer = wedge_params._thresholded_outerRadius(point[value_key]);
        var start = that.chromoData._ideograms[chr].theta(point.start);
        var end = that.chromoData._ideograms[chr].theta(point.end);
     return d3.svg.arc()
        .innerRadius( _inner)
        .outerRadius(function(multiplier) { return _inner + (multiplier * (_outer - _inner));})
        .startAngle( start)
        .endAngle(end);
    };

    wedge_obj.select('g.data')
        .selectAll("path")
        .data(wedge_data,that.chromoData._network.node_key)
        .enter().append('svg:path')
        .attr('fill',wedge_params._fillStyle)
        .attr('stroke',wedge_params._strokeStyle)
        .attr('d',d3.svg.arc()
        .innerRadius(function(point) { return wedge_params._thresholded_innerRadius(point[value_key]);})
        .outerRadius(function(point) { return wedge_params._thresholded_outerRadius(point[value_key]);})
        .startAngle(function(point) { return that.chromoData._ideograms[chr].theta(point.start);})
        .endAngle(function(point) { return that.chromoData._ideograms[chr].theta(point.end);})
        )
        .transition()
        .delay(100)
        .duration(800)
        .attrTween('d',function(a) {
                        var i =d3.interpolate(0,1.0);
                         var arc = histogramArcTween(a);
                        return function(t) {return arc(i(t));};
                        })
        .attrTween('opacity', function(a) {
                            var i=d3.interpolate(0.2,1.0);
                                return function(t) {return  i(t);}
                        });

};

vq.CircVis.prototype._drawWedgeData_scatterplot = function(chr, wedge_index) {
    var that = this;
    var wedge_params = that.chromoData._wedge[wedge_index];
    var wedge_data = that.chromoData._ideograms[chr].wedge[wedge_index];
    var value_key = wedge_params._value_key;
    var wedge_obj = d3.select('.ideogram[data-region="'+chr+'"] .wedge[data-ring="'+wedge_index+'"]');
    
    wedge_obj.select('g.data')
        .selectAll("path")
        .data(wedge_data,that.chromoData._network.node_key)
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

};

vq.CircVis.prototype._drawWedgeData_band = function(chr, wedge_index) {
    var that = this;
    var wedge_params = that.chromoData._wedge[wedge_index];
    var wedge_data = that.chromoData._ideograms[chr].wedge[wedge_index];
    var value_key = wedge_params._value_key;

    var wedge_obj = d3.select('.ideogram[data-region="'+chr+'"] .wedge[data-ring="'+wedge_index+'"]');
    wedge_obj.select('g.data')
         .selectAll("path")
        .data(wedge_data,that.chromoData._network.node_key)
        .enter().append('svg:path')
        .attr('fill',wedge_params._fillStyle)
        .attr('stroke',wedge_params._strokeStyle)
        .attr('d',d3.svg.arc()
        .innerRadius( wedge_params._innerRadius)
        .outerRadius( wedge_params._outerPlotRadius)
        .startAngle(function(point) { return that.chromoData._ideograms[chr].theta(point.start);})
        .endAngle(function(point) { return that.chromoData._ideograms[chr].theta(point.end);})
    );
};

vq.CircVis.prototype._drawWedgeData_glyph = function(chr, wedge_index) {

      var that = this;
    var wedge_params = that.chromoData._wedge[wedge_index];
    var wedge_data = that.chromoData._ideograms[chr].wedge[wedge_index];
    var value_key = wedge_params._value_key;
    var wedge_obj = d3.select('.ideogram[data-region="'+chr+'"] .wedge[data-ring="'+wedge_index+'"]');

    wedge_obj.select('g.data')
     .selectAll("path")
        .data(wedge_data,that.chromoData._network.node_key)
        .enter().append('svg:path')
        .attr('fill',wedge_params._fillStyle)
        .attr('stroke',wedge_params._strokeStyle)
        .attr("transform",function(point) {
            return "translate(" +
                wedge_params._glyph_distance(point,wedge_params) *
                    Math.cos(that.chromoData._ideograms[chr].theta(point.start) ) +
                "," +
                wedge_params._glyph_distance(point,wedge_params) *
                    Math.sin(that.chromoData._ideograms[chr].theta(point.start)) +
                ")";} )
        .attr('d',d3.svg.symbol()
        .type(wedge_params._shape)
        .size(Math.pow(wedge_params._radius(),2)) );
};

vq.CircVis.prototype._drawWedgeData_tile = function(chr, wedge_index) {
 var that = this;
    var wedge_params = that.chromoData._wedge[wedge_index];
    var wedge_data = that.chromoData._ideograms[chr].wedge[wedge_index];
    var value_key = wedge_params._value_key;
    var wedge_obj = d3.select('.ideogram[data-region="'+chr+'"] .wedge[data-ring="'+wedge_index+'"]');
   
    wedge_obj.select('g.data')
      .selectAll("path")
        .data(wedge_data,that.chromoData._network.node_key)
        .enter().append('svg:path')
        .attr('fill',wedge_params._fillStyle)
        .attr('stroke',wedge_params._strokeStyle)
        .attr('d',d3.svg.arc()
        .innerRadius( function(point) { return wedge_params._thresholded_tile_innerRadius(point,wedge_params);})
        .outerRadius( function(point) { return wedge_params._thresholded_tile_outerRadius(point,wedge_params);})
        .startAngle(function(point) { return that.chromoData._ideograms[chr].theta(point.start);})
        .endAngle(function(point) { return that.chromoData._ideograms[chr].theta(point.end);})
    );
};

vq.CircVis.prototype._drawWedgeData_karyotype = function(chr, wedge_index) {
  var that = this;
    var wedge_params = that.chromoData._wedge[wedge_index];
    var wedge_data = that.chromoData._ideograms[chr].wedge[wedge_index];
    var value_key = wedge_params._value_key;    
    var wedge_obj = d3.select('.ideogram[data-region="'+chr+'"] .wedge[data-ring="'+wedge_index+'"]');
    wedge_obj.select('g.data')
      .selectAll("path")
        .data(wedge_data,that.chromoData._network.node_key)
        .enter().append('svg:path')
        .attr('fill',function(point) { return point[value_key];})
        .attr('stroke',wedge_params._strokeStyle)
        .attr('d',d3.svg.arc()
        .innerRadius( wedge_params._innerRadius)
        .outerRadius( wedge_params._outerPlotRadius)
        .startAngle(function(point) { return that.chromoData._ideograms[chr].theta(point.start);})
        .endAngle(function(point) { return that.chromoData._ideograms[chr].theta(point.end);})
    );
};

vq.CircVis.prototype._drawWedgeData_heatmap = function(chr, wedge_index) {
 var that = this;
    var wedge_params = that.chromoData._wedge[wedge_index];
    var wedge_data = that.chromoData._ideograms[chr].wedge[wedge_index];
    var value_key = wedge_params._value_key;
    var wedge_obj = d3.select('.ideogram[data-region="'+chr+'"] .wedge[data-ring="'+wedge_index+'"]');
  wedge_obj.select('g.data')
       .selectAll("path")
        .data(wedge_data,that.chromoData._network.node_key)
        .enter().append('svg:path')
        .attr('fill',wedge_params._fillStyle)
        .attr('stroke',wedge_params._strokeStyle)
        .attr('d',d3.svg.arc()
        .innerRadius( wedge_params._innerRadius)
        .outerRadius( wedge_params._outerPlotRadius)
        .startAngle(function(point) { return that.chromoData._ideograms[chr].theta(point.start);})
        .endAngle(function(point) { return that.chromoData._ideograms[chr].theta(point.end);})
    );
};

vq.CircVis.prototype._draw_axes_ticklabels = function(wedge_index) {
    var that = this;
    var dataObj = that.chromoData;
    var wedge_params = dataObj._wedge[wedge_index];

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
                    .attr('transform',function(r) {return 'translate(0,-'+wedge_params._y_linear(r) +')';})
                    .text(function(a) { return a;});
           }

};

vq.CircVis.prototype._add_wedge_data = function(data) {
    var that = this;
    var chr = data.chr;
    _.each(that.chromoData._ideograms[chr].wedge, function(wedge,index) {
        wedge.push(data);
        that._drawWedgeData(chr,index);
    });

};