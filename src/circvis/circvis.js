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
        d3.select(this).transition().delay(100).duration(300).attr('opacity',opacity);
    };
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
            .attr('class','ideogram')
            .attr('opacity',1.0)
            .each(draw_ideogram_rings);
    var f = fade(0.1);
    var unf=fade(1.0);

    ideograms.on("mouseover", f)
        .on("mouseout", unf);

function draw_ideogram_rings(d) {

    var ideogram = d3.select(this);

               that._add_wedge(ideogram, d);
                that._add_ticks(ideogram, d);
    
}

var graph = svg.selectAll("svg.circvis")


};