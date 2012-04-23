

vq.CircVis.prototype._drawWedgeContents = function(wedge_obj, chr, wedge_index) {
    var that = this;
    var dataObj = that.chromoData;
    var ideogram = dataObj._ideograms[chr];
    var wedge_params = dataObj._wedge[wedge_index];
    switch (wedge_params._plot_type) {
        case('karyotype'):
        case('tile'):
        case('band'):
        case('glyph'):
            this._drawWedgeData(wedge_obj, chr, wedge_index);
            break;
        default:
            this._drawWedge_withRange(wedge_obj, chr, wedge_index);
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

    ideogram_obj.append("svg:g")
        .attr('class','wedges')
        .selectAll("path")
        .data(pv.range(0,dataObj._wedge.length))
        .enter()
        .append("svg:g")
        .attr("class",  "wedge")
        .attr('data-ring',function(index) { return index;})
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
        that._drawWedgeContents(wedge_obj, chr, wedge_index);
    }
};


vq.CircVis.prototype._drawWedge_withoutRange = function( chr, wedge_index) {
       var that = this;
    var dataObj = that.chromoData;
    var ideogram = dataObj._ideograms[chr];
    var wedge_params = dataObj._wedge[wedge_index];
    var wedge = ideogram.wedge[wedge_index];
    var wedge_obj = d3.select('.ideogram[data-ring="'+wedge_index+'"]');
};

vq.CircVis.prototype._drawWedge_withRange = function( chr, wedge_index) {
           var that = this;
    var dataObj = that.chromoData;
    var ideogram = dataObj._ideograms[chr];
    var wedge_params = dataObj._wedge[wedge_index];
    var wedge = ideogram.wedge[wedge_index];
    var wedge_obj = d3.select('.ideogram[data-ring="'+wedge_index+'"]');

    if (wedge_params._draw_axes) {
        /* Circular grid lines. */
        //add a new panel each time we want to draw on top of the previously created image.
        var p = dataObj._chrom.groups[chr];
        var startAngle = p.startAngle;
        var endAngle = p.angle;

        var angles = _.range(0,endAngle,0.01);
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
        .startAngle(function(point) { return that.chromoData._ideograms[chr].theta(point.start);})
        .endAngle(function(point) { return that.chromoData._ideograms[chr].theta(point.end);})
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
            return "rotate(" + ((that.chromoData._ideograms[chr].theta(point.start) * 180 / Math.PI) - 90)+ ")translate(" +
                wedge_params._thresholded_value_to_radius(point[value_key]) + ")";} )
        .attr('d',d3.svg.symbol()
        .type(wedge_params._shape)
        .size(Math.pow(wedge_params._radius(),2)) );

};

vq.CircVis.prototype._drawWedgeData_band = function(wedge_obj, chr, wedge_index) {
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
        .innerRadius( wedge_params._innerRadius)
        .outerRadius( wedge_params._outerPlotRadius)
        .startAngle(function(point) { return that.chromoData._ideograms[chr].theta(point.start);})
        .endAngle(function(point) { return that.chromoData._ideograms[chr].theta(point.end);})
    );
};

vq.CircVis.prototype._drawWedgeData_glyph = function(wedge_obj, chr, wedge_index) {
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

vq.CircVis.prototype._drawWedgeData_tile = function(wedge_obj, chr, wedge_index) {
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
        .innerRadius( function(point) { return wedge_params._thresholded_tile_innerRadius(point,wedge_params);})
        .outerRadius( function(point) { return wedge_params._thresholded_tile_outerRadius(point,wedge_params);})
        .startAngle(function(point) { return that.chromoData._ideograms[chr].theta(point.start);})
        .endAngle(function(point) { return that.chromoData._ideograms[chr].theta(point.end);})
    );
};

vq.CircVis.prototype._drawWedgeData_karyotype = function(wedge_obj, chr, wedge_index) {
  var that = this;
    var wedge_params = that.chromoData._wedge[wedge_index];
    var wedge_data = that.chromoData._ideograms[chr].wedge[wedge_index];
    var value_key = wedge_params._value_key;
    wedge_obj.append("svg:g")
        .attr('class','data')
        .selectAll("path")
        .data(wedge_data)
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

vq.CircVis.prototype._drawWedgeData_heatmap = function(wedge_obj, chr, wedge_index) {
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
        .innerRadius( wedge_params._innerRadius)
        .outerRadius( wedge_params._outerPlotRadius)
        .startAngle(function(point) { return that.chromoData._ideograms[chr].theta(point.start);})
        .endAngle(function(point) { return that.chromoData._ideograms[chr].theta(point.end);})
    );
};
