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

    function grow(outward) { return function(d,i) {
             d3.selectAll('g.ideogram.region'+d)
                .transition()
                .delay(100)
                .duration(300)
                .attrTween('transform', wedge_transform(outward));

    };}
    function wedge_transform(outward) { var sign = outward ? '-' : ''; 
        return function(d,i,a) {
        var i =d3.interpolateTransform(a,a+'translate(0' + ',' + sign + '20)');
     return function(t) {
        var c = i(t);
        return c;
    };};}

    var svg = d3.select(dataObj._plot.container)
        .append('svg:svg')
        .attr('width', width)
        .attr('height', height)
        .append('svg:g')
        .attr('class', 'circvis')
        .attr("transform", 'translate(' + width / 2 + ',' + height / 2 + ')');

var ideograms = svg.selectAll('g.ideogram')
        .data(dataObj._chrom.keys)
        .enter().append('svg:g')
            .attr('class',function(region) { return 'ideogram region' + region;})
            .attr('opacity',1.0)
            .attr('transform',function(key) { return 'rotate(' + dataObj._chrom.groups[key].startAngle * 180 / Math.PI + ')';})
            .each(draw_ideogram_rings);

                            ideograms.append('text')
            .attr('transform',function(key) { return 'rotate(' + (dataObj._chrom.groups[key].endAngle - dataObj._chrom.groups[key].startAngle) * 180 / Math.PI / 2+ ')translate(0,-600)';})
             .attr('class','region_label')
                           .attr('stroke','black')
                           .attr('text-anchor','middle')
                            .attr('dy','.35em')
            .text(function(f) { return f;})
            .on('mouseover',function(){});
            
    var f = fade(0.1);
    var unf=fade(1.0);

    // var g = grow(true);
    // var ung = grow(false);

     ideograms
     .on("mouseover", f)
         .on("mouseout", unf);

function draw_ideogram_rings(d) {

    var ideogram = d3.select(this);

               that._add_wedge(ideogram, d);
                that._add_ticks(ideogram, d);
                that._add_network_nodes(ideogram, d);
    
}

    that._add_network_links(svg.append('svg:g').attr('class','links'));

var graph = svg.selectAll("svg.circvis")


};