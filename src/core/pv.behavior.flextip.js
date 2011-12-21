
/**
 *
 * @class provides an anchor div for a target object this is "in scope" or using the mouse cursor.
 *  The anchor div's location is used to instantiate a vq.Hovercard object that appears onmouseover.  Not persist-able
 *
 *
 *
 * The configuration object has the following options:
 *
 * <pre>
 *
 * {
 *  timeout : {Number} - number of milliseconds (ms) before the box is shown. Default is 1000,
 *  close_timeout : {Number} - number of milliseconds (ms) the box continues to appear after 'mouseout' - Default is 0,
 *  param_data : {Boolean} -  If true, the object explicitly passed into the function at event (mouseover) time is used as the
 *          data.  If false, the data point underlying the event source (panel, dot, etc) is used.  Default is false.
 *  on_mark : {Boolean} - If true, the box is placed in respect to the event source mark.  If false, the box is placed in
 *          respect to the cursor/mouse position.  Defaults to false.
 *
 * include_header : {Boolean} - Place Label/Value headers at top of box.  Defaults to true.
 * include_footer : {Boolean} - Place "Close" footer at bottom of box.  Defaults to false.
 * self_hover : {Boolean} - If true, the box will remain visible when the cursor is above it.  Creates the "hovercard" effect.
 *          The footer must be rendered to allow the user to close the box.  Defaults to false.
 * data_config : {Object} - Important!  This configures the content of the hovering box.  This object is identical to the
 *          "tooltip_items" configuration in Circvis.  Ex. { Chr : 'chr', Start : 'start', End : 'end'}.  Defaults to null
 * }
 *
 * </pre>
 *
 * @param opts {JSON Object} - Configuration object defined above.
 */


pv.Behavior.flextip = function(opts) {

    var hovercard, anchor_div,relative_div;
    opts.timeout = opts.timeout || 800;
    var hovercard_div_id =  'vq_flex';

    function destroyAllCards() {
        vq.events.Dispatcher.dispatch(new vq.events.Event('close_all_tooltips','flextip',{}));
    }

    return function(d) {
        var info = opts.param_data ? d : (this instanceof pv.Mark ? (this.data() ||  this.title()) : d);
        destroyAllCards();
        var t= pv.Transform.identity, p = this.parent;
        do {
            t=t.translate(p.left(),p.top()).times(p.transform());
        } while( p=p.parent);

        var c = this.root.canvas();

        if (!document.getElementById(c.id+'_rel')) {
            relative_div = vq.utils.VisUtils.createDiv(c.id+'_rel');
            c.insertBefore(relative_div,c.firstChild);
            relative_div.style.position = "relative";
            relative_div.style.top = "0px";
            relative_div.style.zIndex=-1;
        }
        else {
            relative_div = document.getElementById(c.id+'_rel');
 	    }

        if (!document.getElementById(hovercard_div_id)) {
            anchor_div = vq.utils.VisUtils.createDiv(hovercard_div_id);
            relative_div.appendChild(anchor_div);
            anchor_div.style.position = "absolute";
            anchor_div.style.zIndex = -1;
        }
        else {
            anchor_div = document.getElementById(hovercard_div_id);
            if (anchor_div.parentNode.id != relative_div.id) {
                relative_div.appendChild(anchor_div);
            }
        }
        opts.include_frame = false;
        opts.include_footer = false;
        opts.target =  pv.event.target;
        hovercard = new vq.Hovercard(opts);

        if(this.properties.width) {
          anchor_div.style.width =  opts.on_mark ? Math.ceil(this.width() * t.k) + 1 : 1;
            anchor_div.style.height =  opts.on_mark ? Math.ceil(this.height() * t.k) + 1 : 1;
        }
        else if (this.properties.radius) {
            var r = this.radius();
            t.x -= r;
            t.y -= r;
            anchor_div.style.height = anchor_div.style.width = Math.ceil(2 * r * t.k);
        }
//        var width = this.width() ? this.width() : this.properties.radius ? this.radius() * 2 : 0;
//        var height = this.height() ? this.height() : this.properties.radius ? this.radius() * 2 : 0;

         anchor_div.style.left = opts.on_mark ? Math.floor(this.left() * t.k + t.x) + "px" : this.parent.mouse().x + t.x  + "px";
          anchor_div.style.top = opts.on_mark ? Math.floor(this.top() * t.k + t.y) + "px" : this.parent.mouse().y + t.y + "px";

        //be sure to destroy any visible flexible hovercards before displaying the current one.  Won't destroy pinned/persisted hovercards
        function deleteHovercard() {
            hovercard.destroy();
            vq.events.Dispatcher.removeListener('close_all_tooltips',deleteHovercard);
            return false;
        }

        vq.events.Dispatcher.addListener('close_all_tooltips',deleteHovercard);

        hovercard.show(anchor_div,info);

    };
};




