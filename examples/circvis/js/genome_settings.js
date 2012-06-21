!(function() {
    vq.examples = _.isUndefined(vq.examples) ? {} : vq.examples;
    vq.examples.circvis = _.isUndefined(vq.examples.circvis) ? {} : vq.examples.circvis;
    vq.examples.circvis.genome = _.isUndefined(vq.examples.circvis.genome) ? {} : vq.examples.circvis.genome;

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
        'CLIN': '#aa4444',
        'SAMP': '#bcbd22',
        'other' : '#17becf'
    };

        function feature_type(feature) { return feature && feature.label && !!~feature.label.indexOf(':') ?
                    feature.label.split(':')[1] : 'other';}
        function clin_type(feature) { return feature && feature.clin_alias && !!~feature.clin_alias.indexOf(':')?
        feature.clin_alias.split(':')[1] : 'other';}

        var shape_map ={'CLIN':'square','SAMP':'cross','other':'diamond'};
    vq.examples.circvis.genome.shape = function(type) { return shape_map[type];}
    vq.examples.circvis.genome.clinical_shape = function(feature) { return shape(clin_type(feature));}

    vq.examples.circvis.genome.tick_colors = function(data) {
        return type_color(feature_type(data));
    };

    vq.examples.circvis.genome.type_color = function(type) {
        return color_scale[type] || color_scale['other'];
    };

    vq.examples.circvis.genome.label_map = {'METH' : 'DNA Methylation',
        'CNVR': 'Copy Number Variation Region',
        'MIRN' :'mircoRNA',
        'GNAB' : 'Gene Abberation',
        'GEXP': 'Gene Expression',
        'CLIN': 'Clinical Data',
        'SAMP': 'Tumor Sample'
    };

    var hovercard_items_config = {Feature:function(feature) { var label = feature.label.split(':'); return label[2] +
    ' (<span style="color:'+type_color(feature_type(feature))+'">' +
        label_map[feature_type(feature)] + '</span>)';},
        Location: function(feature) { return 'Chr ' + feature.chr + ' ' + feature.start + (feature.end ? '-' + feature.end : '');},
        'Somatic Mutations': 'mutation_count'};

    vq.examples.circvis.genome.clinical_hovercard_items_config  = _.extend({},hovercard_items_config);

     _.extend(vq.examples.circvis.genome.clinical_hovercard_items_config,
        {
            'Clinical Coorelate' : function(feature) { var label = feature.clin_alias.split(':');
                    return label[2] + ' (<span style="color:'+type_color(clin_type(feature)) +'">' + label_map[clin_type(feature)] + '</span>)';}
    }
        );

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

    vq.examples.circvis.genome.hovercard_links_config = {};

    _.each(links, function(item){vq.examples.circvis.genome.hovercard_links_config[item.label]=item;});

})(window);