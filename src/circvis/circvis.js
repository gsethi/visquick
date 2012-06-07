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

    function fade(opacity) { return function(d,i) {
        d3.selectAll('g.ideogram')
            .filter(function(g) { return g != d;})
            .transition()
            .delay(20)
            .duration(20)
            .attr('opacity',opacity);

        d3.selectAll('path.link').filter(function(g) { return g[0].chr != d && g[g.length-1].chr != d; })
            .transition()
            .delay(20)
            .duration(20)
            .attr('opacity',opacity);
    };
    }

    function dragmove(d,u) {
        var transform = d3.transform(d3.select(this).attr('transform'));
        var translate = transform.translate;
        var rotation = transform.rotate;
        var p = [d3.event.x - width /2, d3.event.y - height/2];
        var q = [d3.event.x - d3.event.dx - width/2, d3.event.y - d3.event.dy - height/2];
        function cross(a, b) { return a[0] * b[1] - a[1] * b[0]; }
        function dot(a, b) { return a[0] * b[0] + a[1] * b[1]; }
        var angle = Math.atan2(cross(q,p),dot(q,p)) * 180 / Math.PI;
        rotation += angle;
        d3.select(this).attr('transform','translate(' + translate[0]+','+translate[1]+')rotate('+rotation+')');
    }


    function dragstart(d,u) {}
    function dragend(d,u) {}

    var drag = d3.behavior.drag()
        .on("dragstart", dragstart)
        .on("drag", dragmove)
        .on("dragend", dragend);

    var svg = d3.select(dataObj._plot.container)
        .append('svg:svg')
        .attr('width', width)
        .attr('height', height)
        .append('svg:g')
        .attr('class', 'circvis')
        .attr("transform", 'translate(' + width / 2 + ',' + height / 2 + ')')
        .call(drag);

var ideograms = svg.selectAll('g.ideogram')
        .data(dataObj._chrom.keys)
        .enter().append('svg:g')
            .attr('class','ideogram')
            .attr('data-region',function(d) { return d;})
            .attr('opacity',1.0)
            .attr('transform',function(key) { return 'rotate(' + dataObj._chrom.groups[key].startAngle * 180 / Math.PI + ')';})
            .each(draw_ideogram_rings);
//calculate label placement as halfway along tick radial segment
    var outerRadius  = (dataObj._plot.height / 2);
    var outerTickRadius = outerRadius - dataObj.ticks.outer_padding;
    var innerRadius = outerTickRadius - dataObj.ticks.height;
    var label_height = (outerTickRadius + innerRadius) / 2;

           ideograms.append('text')
            .attr('transform',function(key) { return 'rotate(' + (dataObj._chrom.groups[key].endAngle - dataObj._chrom.groups[key].startAngle)
                   * 180 / Math.PI / 2 +
                   ' )translate(0,-'+label_height+')';})
             .attr('class','region_label')
                           .attr('stroke','black')
                           .attr('text-anchor','middle')
                            .attr('dy','.35em')
               .attr('cursor','pointer')
            .text(function(f) { return f;})
            .on('mouseover',function ideogram_label_click(obj){
                   var half_arc_genome = {};
                   var region_length = dataObj.normalizedLength[obj];
                   var new_length = 1.0 - region_length;
                   var num_regions = _.size(dataObj.normalizedLength);
                   _.each(dataObj.normalizedLength,function(value,key,list){
                        half_arc_genome[key] = value / new_length / 2;
                   });
                   half_arc_genome[obj] = 0.5;
               });
    if(!_.isNull(dataObj._chrom.radial_grid_line_width)&&
                dataObj._chrom.radial_grid_line_width > 0) {

        var network_radius = dataObj._network.network_radius;
                ideograms.selectAll('path.radial_lines')
                    .data(function(chr) {
                        return [[{x:0,y:-1*outerTickRadius},{x:0,y:-1*network_radius[chr]}]];
                    })
                    .enter().insert('svg:path','.wedges')
                    .attr('class','radial_lines')
                    .attr('d',d3.svg.line()
                    .x(function(point) {return point.x;})
                    .y(function(point) {return point.y;})
                    .interpolate('linear')
                    );
   }

//
//    var f = fade(0.1);
//    var unf=fade(1.0);

//    ideograms.on("mouseover", f)
//        .on("mouseout", unf);
    // var g = grow(true);
    // var ung = grow(false);

        function draw_ideogram_rings(d) {
            that._add_wedge( d);
            that._add_ticks( d);
            that._add_network_nodes( d);
        }

    that._draw_ticks();
    that._add_network_links(svg.insert('svg:g','.ideogram').attr('class','links'));
    _(_.range(0,dataObj._wedge.length)).each(that._draw_axes_ticklabels,that);

//var graph = svg.selectAll("svg.circvis")


};