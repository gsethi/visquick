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

var graph = svg.selectAll("svg.circvis")


};