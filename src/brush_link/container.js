Ext.ns('org.systemsbiology.visquick.brush_link');

console.log('org.systemsbiology.visquick.brush_link! available at:' + org.systemsbiology.visquick.brush_link);

var BrushLinkContainer = Ext.extend(Object, {
    currentState: {},
    
    logo: {
       url: "https://visquick.googlecode.com/hg/src/images/logo.png", 
       label: "Brush Link",
    },
    
    constructor: function(container) {
        console.log("org.systemsbiology.visquick.brush_link.Container(" + container + ")");
        Ext.apply(this, {contentEl:container});
    },

    draw: function(data, options) {
        console.log("org.systemsbiology.visquick.brush_link.Container.draw(" + data + "," + options + ")");

        options.container = Ext.getDom(this.contentEl);

        var loadFn = function(o) {
            var json = Ext.util.JSON.decode(o.responseText);

            var data ={
                DATATYPE : "vq.models.BrushLinkData",
                CONTENTS : {
                    PLOT : options,
                    data_array: json, 
                    columns: pv.permute(pv.keys(json[0]),[1,2,3])
                }
            };
            
            var brushLink = new vq.BrushLink();
            brushLink.draw(data);        
        };

        Ext.Ajax.request({ url: data.uri, method: "get", success: loadFn });
    },

    GetState: function() {
        console.log("org.systemsbiology.visquick.brush_link.Container.GetState(): TODO: gather state from contained visualization");
        return this.currentState;
    },

    SetState: function(state) {
        this.currentState = state;
        console.log("org.systemsbiology.visquick.brush_link.Container.SetState(" + state + "): TODO: pass state on to contained visualization");
    }
});

org.systemsbiology.visquick.brush_link.Container = BrushLinkContainer;

org.systemsbiology.pages.apis.events.MessageBus.fireEvent("publish", { 
  key: "org.systemsbiology.visquick.brush_link.Container", 
  payload: org.systemsbiology.visquick.brush_link.Container 
});
