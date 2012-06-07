Ext.ns('org.systemsbiology.visquick.circvis');

console.log('org.systemsbiology.visquick.circvis! available at:' + org.systemsbiology.visquick.circvis);

var CircvisContainer = Ext.extend(Object, {
    currentState: {},
    assembledData: {},

    logo: {
        url: "https://visquick.googlecode.com/hg/src/images/logo.png",
        label: "Circvis"
    },

    constructor: function(container) {
        console.log("org.systemsbiology.visquick.circvis.CircvisContainer(" + container + ")");
        Ext.apply(this, {contentEl:container});
    },

    draw: function(data, options) {
        console.log("org.systemsbiology.visquick.circvis.Container.draw(" + data + "," + options + ")");

        this.assembledData.chrom_keys = data.chrom_keys;

        Ext.Ajax.request({ url: data.feature_networks, method: "get", success: function(o) {
            this.parseNetwork(Ext.util.JSON.decode(o.responseText));
            this.assemble();
        }, scope: this });

        Ext.Ajax.request({ url: data.cytoband, method: "get", success: function(o) {
            this.assembledData["cytoband"] = Ext.util.JSON.decode(o.responseText);
            this.assemble();
        }, scope: this });
        
        Ext.Ajax.request({ url: data["chrom_info"], method: "get", success: function(o) {
            this.assembledData["chrom_info"] = Ext.util.JSON.decode(o.responseText);
            this.assemble();
        }, scope: this });
    },

    parseNetwork: function(responses) {
        var whole_net = responses.map(function(row) {
                var node1 = row.alias1.split(':');
                var node2 = row.alias2.split(':');
                var label_mod1 = node1.length >= 8 ? node1[7] : '';
                var label_mod2 = node2.length >= 8 ? node2[7] : '';
                return {node1: {id : row.f1id, source : node1[1], label : node1[2], chr : node1[3].slice(3),
                    label_mod : label_mod1,
                    start: node1[4] != '' ? parseInt(node1[4]) : -1, end:node1[5] != '' ? parseInt(node1[5]) : parseInt(node1[4]),genescore:row.f1genescore},
                    node2: {id : row.f2id, source : node2[1], label : node2[2], chr : node2[3].slice(3),
                        label_mod : label_mod2,
                        start: node2[4] != '' ? parseInt(node2[4]) : -1, end:node2[5] != '' ? parseInt(node2[5]) : parseInt(node2[4]),genescore:row.f2genescore},
                    pvalue : row.pvalue,importance : row.importance, correlation:row.correlation};
            }
        );

        var located_responses = whole_net.filter(function(feature) {
            return feature.node1.chr != '' && feature.node2.chr != '';
        });

        var unlocated_responses = whole_net.filter(function(feature) {
            return feature.node1.chr == '' || feature.node2.chr == '';
        });

        var feature_ids = {};
        var features = [];
        whole_net.forEach(function(link) {
            if (feature_ids[link.node1.id] == null) {
                feature_ids[link.node1.id] = 1;
                features.push(vq.utils.VisUtils.extend({value:link.node1.label}, link.node1));
            }
            if (feature_ids[link.node2.id] == null) {
                feature_ids[link.node2.id] = 1;
                features.push(vq.utils.VisUtils.extend({value:link.node2.label}, link.node2));
            }
        });

        this.assembledData['features'] = features;
        this.assembledData['network'] = located_responses;
        this.assembledData['unlocated'] = unlocated_responses;
        this.assembledData['unlocated_features'] = vq.utils.VisUtils.clone(features).filter(function(feature) {
            return feature.chr == '';
        });
        this.assembledData['located_features'] = vq.utils.VisUtils.clone(features).filter(function(feature) {
            return feature.chr != '';
        });
    },

    assemble: function() {
        if (this.assembledData["unlocated"] == null) {
            return;
        }
        if (this.assembledData["features"] == null) {
            return;
        }
        if (this.assembledData["cytoband"] == null) {
            return;
        }
        if (this.assembledData["chrom_keys"] == null) {
            return;
        }
        if (this.assembledData["chrom_info"] == null) {
            return;
        }
        if (this.assembledData["network"] == null) {
            return;
        }

        var width = 800;
        var height = 800;
        var ring_radius = width / 20;
        var stroke_style = "white";

        var karyotype_tooltip_items = {
            'Karyotype Label' : function(feature) {
                return  vq.utils.VisUtils.options_map(feature)['label'];
            },
            Location :  function(feature) {
                return 'Chr' + feature.chr + ' ' + feature.start + '-' + feature.end;
            }
        };

        var unlocated_tooltip_items = {
            Target :  function(feature) {
                return feature.sourceNode.source + ' ' + feature.sourceNode.label +
                    (feature.sourceNode.chr ? ' Chr' + feature.sourceNode.chr : '') +
                    (feature.sourceNode.start ? ' ' + feature.sourceNode.start : '') +
                    (feature.sourceNode.end ? '-' + feature.sourceNode.end : '') + ' ' +
                    feature.sourceNode.label_mod;
            },
            Predictor :  function(feature) {
                return feature.targetNode.source + ' ' + feature.targetNode.label +
                    (feature.targetNode.chr ? ' Chr' + feature.targetNode.chr : '') +
                    (feature.targetNode.start ? ' ' + feature.targetNode.start : '') +
                    (feature.targetNode.end ? '-' + feature.targetNode.end : '') + ' ' +
                    feature.targetNode.label_mod;
            }
        };

        var unlocated_map = vq.utils.VisUtils.clone(this.assembledData['unlocated']).filter(
            function(link) {
                return  link.node1.chr != '';
            }).map(
            function(link) {
                var node = vq.utils.VisUtils.extend(link.node2, { chr:link.node1.chr, start:link.node1.start,end:link.node1.end, value: 0});
                node.sourceNode = vq.utils.VisUtils.extend({}, link.node1);
                node.targetNode = vq.utils.VisUtils.extend({}, link.node2);
                return node;
            }).concat(vq.utils.VisUtils.clone(this.assembledData['unlocated']).filter(
            function(link) {
                return  link.node2.chr != '';
            }).map(function(link) {
                var node = vq.utils.VisUtils.extend(link.node1, { chr:link.node2.chr, start:link.node2.start,end:link.node2.end, value: 0});
                node.sourceNode = vq.utils.VisUtils.extend({}, link.node1);
                node.targetNode = vq.utils.VisUtils.extend({}, link.node2);
                return node;
            }));

        var all_source_list = pv.blend([['GEXP','METH','CNVR','MIRN','GNAB'], ['CLIN','SAMP']]);
        var all_source_map = pv.numerate(all_source_list);
        var source_color_scale = pv.Colors.category10();
        var link_sources_colors = function(link) { return "red" };

        var node_colors = function(source) {
            return source_color_scale(all_source_map[source]);
        };

        var loadedData = {
            GENOME: {
                DATA:{
                    key_order : this.assembledData["chrom_keys"],
                    key_length : vq.utils.VisUtils.clone(this.assembledData["chrom_info"])
                },
                OPTIONS: {
                    radial_grid_line_width: 1,
                    label_layout_style : 'clock',
                    label_font_style : '18pt helvetica'
                }
            },
            TICKS : {
                DATA : {
                    data_array : vq.utils.VisUtils.clone(this.assembledData['features'])
                },
                OPTIONS :{
                    display_legend : false,
                    stroke_style :stroke_style,
                    fill_style : function(tick) {
                        return node_colors(tick.source);
                    },
                    tooltip_items : {Tick : function(node) {
                        return node.label + ' ' + node.source + ' Chr' + node.chr + ' ' + node.start +
                            '-' + node.end + ' ' + node.label_mod;
                    }}
                }
            },
            PLOT: {
                width : width,
                height :  height,
                horizontal_padding : 30,
                vertical_padding : 30,
                container : Ext.getDom(this.contentEl),
                enable_pan : false,
                enable_zoom : false,
                show_legend: false,
                legend_include_genome : true,
                legend_corner : 'ne',
                legend_radius  : width / 15
            },
            WEDGE:[
                {
                    PLOT : {
                        height : ring_radius / 2,
                        type :   'karyotype'
                    },
                    DATA:{
                        data_array : this.assembledData.cytoband
                    },
                    OPTIONS: {
                        legend_label : 'Karyotype Bands' ,
                        legend_description : 'Chromosomal Karyotype',
                        outer_padding : 10,
                        tooltip_items : karyotype_tooltip_items
                    }
                },
                {
                    PLOT : {
                        height : ring_radius / 2,
                        type :   'scatterplot'
                    },
                    DATA:{
                        data_array : unlocated_map
                    },
                    OPTIONS: {
                        legend_label : 'Unmapped Feature Correlates' ,
                        legend_description : 'Feature Correlates with No Genomic Position',
                        outer_padding : 10,
                        base_value : 0,
                        min_value : -1,
                        max_value : 1,
                        radius : 4,
                        draw_axes : false,
                        shape:'dot',
                        fill_style  : function(feature) {
                            return link_sources_colors([feature.sourceNode.source,feature.targetNode.source]);
                        },
                        stroke_style : stroke_style,
                        tooltip_items : unlocated_tooltip_items
                    }
                }
            ],
            NETWORK:{
                DATA:{
                    data_array : this.assembledData['network']
                },
                OPTIONS: {
                    outer_padding : 15,
                    node_highlight_mode : 'isolate',
                    node_fill_style : 'ticks',
                    node_stroke_style : stroke_style,
                    link_line_width : 2,
                    node_key : function(node) {
                        return node['label'];
                    },
                    link_stroke_style : function(link) {
                        return link_sources_colors([link.sourceNode.source,link.targetNode.source]);
                    },
                    constant_link_alpha : 0.7,
                    node_tooltip_items :  {
                        Node : function(node) {
                            return node.label + ' ' + node.source + ' Chr' + node.chr + ' ' + node.start + '-' + node.end + ' ' + node.label_mod;
                        }},
                    link_tooltip_items :  {
                        'Target' : function(link) {
                            return link.sourceNode.label + ' ' + link.sourceNode.source + ' Chr' + link.sourceNode.chr + ' ' + link.sourceNode.start +
                                '-' + link.sourceNode.end + ' ' + link.sourceNode.label_mod;
                        },
                        'Predictor' : function(link) {
                            return link.targetNode.label + ' ' + link.targetNode.source + ' Chr' + link.targetNode.chr + ' ' + link.targetNode.start +
                                '-' + link.targetNode.end + ' ' + link.targetNode.label_mod;
                        },
                        'Importance' : 'importance',
                        Correlation : 'correlation',
                        pvalue : 'pvalue'
                    }
                }
            }
        };

        var circle_vis = new vq.CircVis();
        circle_vis.draw({
            DATATYPE : "vq.models.CircVisData",
            CONTENTS : loadedData
        });

        return circle_vis;
    },

    GetState: function() {
        console.log("org.systemsbiology.visquick.circvis.Container.GetState(): TODO: gather state from contained visualization");
        return this.currentState;
    },

    SetState: function(state) {
        this.currentState = state;
        console.log("org.systemsbiology.visquick.circvis.Container.SetState(" + state + "): TODO: pass state on to contained visualization");
    }
});

org.systemsbiology.visquick.circvis.Container = CircvisContainer;

org.systemsbiology.pages.apis.events.MessageBus.fireEvent("publish", {
    key: "org.systemsbiology.visquick.circvis.Container",
    payload: org.systemsbiology.visquick.circvis.Container
});