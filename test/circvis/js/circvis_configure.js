(function() {

    var width=1200,
        height=1200,
        cnv_ring_height = 60,
        color_scale =    { 'GEXP': '#1f77b4',
            //blue
            'METH': '#2ca02c',
            //green
            'CNVR': '#ff7f0e',
            //orange
            'MIRN': '#9467bd',
            //purple
            'GNAB': '#d62728',
            //red
            'PRDM': '#8c564b',
            //pink
            'RPPA': '#e377c2',
            //brown
            'CLIN': '#7f7f7f',
            'SAMP': '#bcbd22',
            'other' : '#17becf'
        };

    var tick_colors = function(data) {
        var tick_key = data.source;
        return color_scale[tick_key] || color_scale['other'];
    };

    var label_map = {'METH' : 'DNA Methylation',
        'CNVR': 'Copy Number Variation Region',
        'MIRN' :'mircoRNA',
        'GNAB' : 'Gene Abberation',
        'GEXP': 'Gene Expression',
        CLIN: 'Clinical Data',
        'SAMP': 'Tumor Sample'};

    var hovercard_items_config = {Feature:function(feature) { var label = feature.label.split(':'); return label[2] + ' (<span style="color:'+tick_colors(feature)+'">' +
        label_map[label[1]] + '</span>)';},
        Location: function(feature) { return 'Chr ' + feature.chr + ' ' + feature.start + (feature.end ? '-' + feature.end : '');},
        'Somatic Mutations': 'mutation_count'};
    var links = [
        {
            label: 'UCSC Genome Browser',
            key: 'ucsc',
            url: 'http://genome.ucsc.edu/cgi-bin/hgTracks',
            uri: '?db=hg18&position=chr',
            href: function(feature) {
                return 'http://genome.ucsc.edu/cgi-bin/hgTracks?db=hg18&position=chr' + feature.chr + ':' + feature.start + (feature.end == '' ? '' : '-' + feature.end);
            }
        }, //ucsc_genome_browser
        {
            label: 'Ensembl',
            key: 'ensembl',
            url: 'http://uswest.ensembl.org/Homo_sapiens/Location/View',
            uri: '?r=',
            href: function(feature) {
                return 'http://uswest.ensembl.org/Homo_sapiens/Location/View?r=' + feature.chr + ':' + feature.start + (feature.end == '' ? '' : '-' + feature.end);
            }
        }, //ensemble
        {
            label: 'Cosmic',
            key: 'cosmic',
            url: 'http://www.sanger.ac.uk/perl/genetics/CGP/cosmic',
            uri: '?action=bygene&ln=',
            href: function(feature) {
                return _.include(['CNVR', 'MIRN','METH'],feature.source) ? 'http://www.sanger.ac.uk/perl/genetics/CGP/cosmic?action=bygene&ln=' + feature.label.split(':')[2] : null;
            }
        },
        {
            label: 'miRBase',
            key: 'mirbase',
            url: 'http://mirbase.org/cgi-bin/query.pl',
            uri: '?terms=',
            href: function(feature) {
                return feature.source == 'MIRN' ? 'http://www.mirbase.org/cgi-bin/query.pl?terms=' + feature.label.split(':')[2] : null;
            }
        }
    ];

    var hovercard_links_config = {};

    _.each(links, function(item){hovercard_links_config[item.label]=item;});
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
                key_order : chrom_keys,
                key_length :_.map(chrom_keys, function(key) {return {chr_name:key, chr_length:chrom_attr[key].length};})
            },
            OPTIONS: {
                radial_grid_line_width : 2,
                label_layout_style:'clock',
                label_font_style:'16px helvetica'
            }
        },

        WEDGE:[
            {
                PLOT : {
                    height : 35,
                    type : 'karyotype'
                } ,
                DATA:{
                    data_array : cytoband
                },
                OPTIONS: {

                    legend_label : 'Cytogenic Bands',
                    legend_description : 'Cytogenic Bands',
                    listener : function() {return null;},
                    outer_padding: 15,
                    stroke_style:'#777',
                    line_width:'0.5px',
                    tooltip_items:{'Cytogenic Band':'label',
                        "Location": function(feature) { return 'Chr ' + feature.chr + ' ' + feature.start + (feature.end ? '-' + feature.end : '');}
                    }
                }
            },
            {   PLOT : {
                height : cnv_ring_height,
                type : 'glyph'
            } ,
                DATA:{
                    data_array : [],//cnv
                    value_key:'clin_alias'
                },
                OPTIONS: {
                    fill_style:'orange',
                    stroke_style:'white',
                    line_width:1,
                    legend_label : 'Clinical Associations',
                    shape:'dot',
                    radius:4,
                    legend_description : 'Clinical Associations',
                    listener : function() {return null;},
                    outer_padding: 15,
                    tooltip_items: hovercard_items_config,
                    tooltip_links: hovercard_links_config
                }
            },
            {
                PLOT : {

                    height : 60,
                    type : 'scatterplot'
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
                    shape : 'circle',
                    outer_padding: 15,
                    stroke_style : null,
                    tooltip_items: hovercard_items_config,
                    tooltip_links: hovercard_links_config,
                    fill_style: tick_colors,
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
                fill_style : tick_colors,
                tooltip_items: hovercard_items_config,
                tooltip_links: hovercard_links_config
            }
        },

        NETWORK:{
            DATA:{
                data_array : []//
            },
            OPTIONS: {
                outer_padding : 10,
                node_radius:6,
                node_fill_style : tick_colors,
                link_stroke_style : 'red',
                link_line_width:8,
                link_alpha : 0.6,
                node_highlight_mode : 'isolate',
                node_key : function(node) { return node.label;},
                node_tooltip_items :  hovercard_items_config,
                node_tooltip_links: hovercard_links_config,
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
    }

})();