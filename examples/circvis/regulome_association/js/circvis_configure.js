(function() {

    var width=740,
        height=740;

    var data = function(div) { return {
        PLOT: {
            container: div,
            width : width,
            height: height,
            vertical_padding : 10,
            horizontal_padding: 10,
            enable_pan : false,
            enable_zoom : false,
            show_legend: true,
            legend_corner : 'ne',
            legend_radius  : 45
        },

        GENOME: {
            DATA:{
                key_order : vq.data.genome.chrom_keys,
                key_length :_.map(vq.data.genomechrom_keys, function(key) {return {chr_name:key, chr_length:vq.data.genome.chrom_attr[key].length};})
            },
            OPTIONS: {
                radial_grid_line_width : 2,
                label_layout_style:'clock',
                label_font_style:'16px helvetica',
                gap_degrees : 2
            }
        },

        WEDGE:[
            {
                PLOT : {
                    height : 35,
                    type : 'karyotype'
                } ,
                DATA:{
                    data_array : vq.data.genome.cytoband
                },
                OPTIONS: {

                    legend_label : 'Cytogenic Bands',
                    legend_description : 'Cytogenic Bands',
                    listener : function() {return null;},
                    outer_padding: 15,
                    stroke_style:'rgba(200,200,200,0.5)',
                    line_width:'0.5px',
                    tooltip_items:{'Cytogenic Band':'label',
                        "Location": function(feature) { return 'Chr ' + feature.chr + ' ' + feature.start + (feature.end ? '-' + feature.end : '');}
                    }
                }
            },
            {   PLOT : {
                height : 50,
                type : 'glyph'
            } ,
                DATA:{
                    data_array : [],//cnv
                    value_key:'clin_alias',
                    hash:function(point) { return point.label + '_' + point.clin_alias;}
                },
                OPTIONS: {
                    tile_height:10,
                    tile_padding:6,
                    tile_overlap_distance:10000000,
                    tile_show_all_tiles : true,
                    fill_style:function(feature) { return vq.examples.circvis.genome.type_color(vq.examples.circvis.genome.clin_type(feature));},
                    stroke_style:null,
                    line_width:3,
                    legend_label : 'Clinical Associations',
                    shape:vq.examples.circvis.genome.clinical_shape,
                    radius:12,
                    legend_description : 'Clinical Associations',
                    listener : function() {return null;},
                    outer_padding: 5,
                    tooltip_items: vq.examples.circvis.genome.clinical_hovercard_items_config,
                    tooltip_links: vq.examples.circvis.genome.hovercard_links_config
                }
            },
            {
                PLOT : {

                    height : 50,
                    type : 'histogram'
                },
                DATA:{
                    data_array : [],//link_density,
                    value_key : 'mutation_count'
                },
                OPTIONS: {
                    legend_label : 'Mutation Count',
                    legend_description : 'Mutation Count',
                    min_value : 0,
                    max_value : 6,
                    base_value : 0,
                    radius : 6,
                    outer_padding: 10,
                    stroke_style : 'orange',
                    line_width:6,
                    tooltip_items: vq.examples.circvis.genome.hovercard_items_config,
                    tooltip_links: vq.examples.circvis.genome.hovercard_links_config,
                    fill_style: 'orange',
                    listener : function() {return null;}
                }
            }
        ],

        TICKS : {
            DATA: {
                data_array:[]
            },
            OPTIONS : {
                wedge_height: 15,
                wedge_width:0.7,
                overlap_distance:10000000, //tile ticks at specified base pair distance
                height : 120,
                display_legend : true,
                legend_corner : 'nw',
                fill_style : vq.examples.circvis.genome.tick_colors,
                tooltip_items: vq.examples.circvis.genome.hovercard_items_config,
                tooltip_links: vq.examples.circvis.genome.hovercard_links_config
            }
        },

        NETWORK:{
            DATA:{
                data_array : []//
            },
            OPTIONS: {
                outer_padding : 10,
                tile_nodes : Boolean(true),
                node_overlap_distance: 3e8,
                node_radius:6,
                node_fill_style : vq.examples.circvis.genome.tick_colors,
                link_stroke_style : 'red',
                link_line_width:8,
                link_alpha : 0.6,
                node_highlight_mode : 'isolate',
                node_key : function(node) { return node.label;},
                node_tooltip_items :  vq.examples.circvis.genome.hovercard_items_config,
                node_tooltip_links: vq.examples.circvis.genome.hovercard_links_config,
                link_tooltip_items :  {
                    'Target' : function(link) { var label = link.source.label.split(':'); return '<span style="color:'+tick_colors(link.source)+'">' +
                        label_map[label[1]] + '</span> ' + label[2];},
                    'Target Location' : function(link) { return 'Chr ' + link.source.chr + ' ' + link.source.start +
                        (link.source.end ? '-' + link.source.end : '');},
                    'Predictor' : function(link) { var label = link.target.label.split(':'); return '<span style="color:'+tick_colors(link.target)+'">' +
                        label_map[label[1]] + '</span> ' + label[2];},
                    'Predictor Location' : function(link) { return 'Chr ' + link.target.chr + ' ' + link.target.start +
                        (link.target.end ? '-' + link.target.end : '');},
                    Importance:'assoc_value1'
                }
            }
        }
    };
    };

    circvis = {};
    circvis.plot = function(div) {
        var circle_vis = new vq.CircVis();
        var dataObject ={DATATYPE : "vq.models.CircVisData", CONTENTS : data(div) };
        circle_vis.draw(dataObject);
        return circle_vis;
    };

})();