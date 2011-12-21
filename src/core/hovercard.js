/* vq.hovercard.js */


/*
 * @class creates a Hovercard with options to persist the display and offer multiple actions, data, tools
 *
 * <pre>
 *     {
 *     timeout : {Number} - Milliseconds to persist the display after cursor has left the event source.  If self_hover is true, the
 *          hovercard also cancels the timer.
 *     target_mark : {HTMLElement} - Event source that represents the protovis Mark as an SVG/HTML Element
 *     data_config : {Object} - designates the display for the data section.  Each Object in the config consists of
 *              {title : property}
 *                      title : {String} - Title of the property to be displayed
 *                       property : {String/Function} - The string value of the property to be displayed or a function that returns a string.
 *                                                                  The function is passed the target's data as a parameter.
 *
 *      self_hover : {Boolean} - If true, placing the mouse cursor over the hovercard cancels the timer which hides the hovercard
 *      include_header : {Boolean} - If true, the header of the data panel is displayed.
*       include_footer : {Boolean} - If true, the footer containing the CLOSE [X} action is displayed at the bottom of the hovercard
*       include_frame : {Boolean} - If true, the frame that contains the hovercard actions (move,pin, etc) is displayed.
 *     </pre>
 */

vq.Hovercard = function(options) {
    this.id = 'hovercard_'+vq.utils.VisUtils.guid();
    this.hovercard = vq.utils.VisUtils.createDiv(this.id);
    this.hovercard.style.display = 'hidden';
    this.hovercard.style.zIndex=100000;
    this.hovercard.style.position='absolute';
    this.lock_display = false;
    if (options) {
        this.timeout = options.timeout || 800;
        this.target_mark = options.target || null;
        this.data_config = options.data_config || null;
        this.tool_config = options.tool_config ||  null;
        this.self_hover = options.self_hover || true;
        this.include_footer = options.include_footer != null ? options.include_footer : this.self_hover || false;
        this.include_header = options.include_header != null ? options.include_header :  this.self_hover || true;
        this.include_frame = options.include_frame != null ? options.include_frame :  false;
        this.transform = options.transform || new pv.Transform();
    }
    var that = this;
    vq.events.Dispatcher.addListener('zoom_select','tooltip',function() { that.togglePin();});
};

vq.Hovercard.prototype.show = function(anchorTarget,dataObject) {
    var that = this;
    if (!anchorTarget) { throw 'vq.Hovercard.show: target div not found.'; return;}
    this.target =  anchorTarget;
        this.hovercard.appendChild(this.renderCard(dataObject));
    if (this.tool_config) {
        var hr = document.createElement('div');
        hr.setAttribute('style',"height:1px;background:#000;border:1px solid #333");
        this.hovercard.appendChild(hr);
        this.hovercard.appendChild(this.renderTools(dataObject));
    }
    if (this.include_footer) this.hovercard.appendChild(this.renderFooter());
    this.hovercard.style.display = 'none';
    this.hovercard.style.backgroundColor = 'white';
    this.hovercard.style.borderWidth = '2px';
    this.hovercard.style.borderColor = '#222';
    this.hovercard.style.borderStyle = 'solid';
    this.hovercard.style.font = "9px sans-serif";
    this.hovercard.style.borderRadius = "10px";

    this.placeInDocument();

    this.getContainer().className ="temp";
    this.start = function() {that.startOutTimer();};
    this.cancel = function() {
        that.target_mark.removeEventListener('mouseout',that.start,false);
        that.cancelOutTimer();
    };
    this.close = function() {that.destroy();};
    this.target_mark.addEventListener('mouseout',that.start, false);
    this.getContainer().addEventListener('mouseover',that.cancel, false);
    this.getContainer().addEventListener('mouseout',that.start,false);

};

  vq.Hovercard.prototype.startOutTimer =   function() {
      var that = this;
        if (!this.outtimer_id){ this.outtimer_id = window.setTimeout(function(){that.trigger();},that.timeout); }
 };

 vq.Hovercard.prototype.cancelOutTimer =  function() {
        if (this.outtimer_id){
            window.clearTimeout(this.outtimer_id);
            this.outtimer_id = null;
        }
 };

 vq.Hovercard.prototype.trigger = function (){
        if(this.outtimer_id) {
            window.clearTimeout(this.outtimer_id);
            this.outtimer_id = null;
            this.destroy();
        }
        return false;
};

vq.Hovercard.prototype.togglePin = function() {
  this.lock_display = !this.lock_display || false;
    var that = this;
            if (this.getContainer().className=="") {
                this.getContainer().addEventListener('mouseout',that.start,false);
                this.getContainer().className ="temp";
            } else {
                this.target_mark.removeEventListener('mouseout',that.start,false);
                this.getContainer().removeEventListener('mouseout',that.start,false);
                this.cancelOutTimer();
                this.getContainer().className ="";
            }
    this.pin_div.innerHTML = this.lock_display ? vq.Hovercard.icon.pin_in : vq.Hovercard.icon.pin_out;
};

vq.Hovercard.prototype.placeInDocument = function(){
    var card = this.hovercard;
    var target = this.target;
    var offset = vq.utils.VisUtils.cumulativeOffset(this.target);
    offset.height = target.offsetHeight;
    offset.width = target.offsetWidth;
    card.style.display='block';
    card.style.visibility='hidden';
    card.style.top = 0 +'px';
    card.style.left = 0 + 'px';
    document.body.appendChild(card);
     card.style.top = offset.top + offset.height + (20 * this.transform.invert().k ) + 'px';
     card.style.left = offset.left + offset.width + (20 * this.transform.invert().k  ) + 'px';
    card.style.visibility='visible';

    if (this.include_frame) {
        var hr = document.createElement('div');
        hr.setAttribute('style',"height:1px;background:#000;border:1px solid #333");
         this.hovercard.insertBefore(hr,this.hovercard.childNodes.item(0));
        this.frame = this.hovercard.insertBefore(this.renderFrame(),this.hovercard.childNodes.item(0));

        this.attachMoveListener();}
};

vq.Hovercard.prototype.hide = function() {
    if(!this.self_hover || !this.over_self) {
    this.hovercard.style.display = 'none';
    this.hovercard.style.visibility='hidden';
    }
};

vq.Hovercard.prototype.destroy = function() {
    this.hide();
    this.target_mark.removeEventListener('mouseout',this.start, false);
    this.getContainer().removeEventListener('mouseout',this.start,false);
    this.cancelOutTimer();
    if (this.getContainer().parentNode == document.body) {
        document.body.removeChild(this.getContainer());
    }
};

vq.Hovercard.prototype.isHidden = function() {
    return this.hovercard.style.display == 'none' || this.hovercard.style.visibility=='hidden';
};

vq.Hovercard.prototype.renderCard = function(dataObject) {
          return  this.renderData(dataObject);
};

vq.Hovercard.prototype.attachMoveListener = function() {
    var that = this;
    var pos= {}, offset = {};

    function activateDrag(evt) {
         var ev = !evt?window.event:evt;
        //don't listen for mouseout if its a temp card
        if (that.getContainer().className=="temp") {
                that.getContainer().removeEventListener('mouseout',that.start,false);
        }
        //begin tracking mouse movement!
        window.addEventListener('mousemove',trackMouse,false);
        offset = vq.utils.VisUtils.cumulativeOffset(that.hovercard);
        pos.top = ev.clientY ? ev.clientY : ev.pageY;
        pos.left = ev.clientX ? ev.clientX : ev.pageX;
        //don't allow text selection during drag
        window.addEventListener('selectstart',vq.utils.VisUtils.disabler,false);
    }
    function disableDrag() {
        //stop tracking mouse movement!
        window.removeEventListener('mousemove',trackMouse,false);
        //enable text selection after drag
        window.removeEventListener('selectstart',vq.utils.VisUtils.disabler,false);
        //start listening again for mouseout if its a temp card
        if (that.getContainer().className=="temp") {
            that.getContainer().addEventListener('mouseout',that.start,false);
        }
        pos = {};
    }
    function trackMouse(evt) {
        var ev = !evt?window.event:evt;
        var x = ev.clientX ? ev.clientX : ev.pageX;
        var y = ev.clientY ? ev.clientY : ev.pageY;
        that.hovercard.style.left = offset.left + (x - pos.left) + 'px';
        that.hovercard.style.top = offset.top +  (y - pos.top) + 'px';
    }
    //track mouse button for begin/end of drag
    this.move_div.addEventListener('mousedown',activateDrag,false);
    this.move_div.addEventListener('mouseup' , disableDrag,false);
    //track mouse button in window, too.
    window.addEventListener('mouseup' , disableDrag,false);
};


vq.Hovercard.prototype.renderFrame = function(pin_out) {
    var that = this;
    var frame = vq.utils.VisUtils.createDiv();
    frame.setAttribute('style','width:100%;cursor:arrow;background:#55eeff');
    var table = document.createElement('table');
    var tBody = document.createElement("tbody");
    table.appendChild(tBody);
    var trow = tBody.insertRow(-1);
    var tcell= trow.insertCell(-1);
    this.move_div = vq.utils.VisUtils.createDiv('hovercard_move');
    this.move_div.setAttribute('style','width:30px;height:15px;background:black;cursor:move;');
    this.move_div.setAttribute('title','Drag to move');
    vq.utils.VisUtils.disableSelect(this.move_div);
    tcell.appendChild(this.move_div);
    tcell=trow.insertCell(-1);
    this.pin_div = vq.utils.VisUtils.createDiv();
    tcell.appendChild(this.pin_div);
    function pin_toggle() {
        that.togglePin();
        return false;
    }
    this.pin_div.addEventListener('click', pin_toggle, false);
    this.pin_div.setAttribute('style', "width:15px;text-align:center;cursor:pointer;background:#FFF");
    vq.utils.VisUtils.disableSelect(this.pin_div);
    this.pin_div.innerHTML = vq.Hovercard.icon.pin_out;
    tcell=trow.insertCell(-1);
    var zoom_div = vq.utils.VisUtils.createDiv('hovercard_zoom');
    tcell.appendChild(zoom_div);
    function zoom() {
        vq.events.Dispatcher.dispatch(new vq.events.Event('zoom','tooltip',{hovercard:that}));
        return false;
    }
    zoom_div.addEventListener('click', zoom, false);
    tcell=trow.insertCell(-1);
    var select_div = vq.utils.VisUtils.createDiv('hovercard_select');
    tcell.appendChild(select_div);
    function select() {
        vq.events.Dispatcher.dispatch(new vq.events.Event('select','tooltip',{hovercard:that}));
        return false;
    }
    select_div.addEventListener('click', select, false);
    frame.appendChild(table);
    return frame;
};

vq.Hovercard.prototype.renderTools = function(dataObject) {
    var get = vq.utils.VisUtils.get;
    var table = document.createElement('table');
    table.setAttribute('style',"font-size:10px");
    var tBody = document.createElement("tbody");
    table.appendChild(tBody);

    if (this.tool_config) {
        for (var key in this.tool_config) {
            try {
                if (!this.tool_config.hasOwnProperty(key)) continue;
                var trow = tBody.insertRow(-1);
                var tcell= trow.insertCell(-1);
                var link = document.createElement('a');
                if (typeof  this.tool_config[key] == 'function') {
                    link.setAttribute('href',this.tool_config[key](dataObject));
                }else {
                    link.setAttribute('href', get(dataObject,this.tool_config[key]));
                }
                link.setAttribute('target',"_blank");
                link.innerHTML = key;
                tcell.appendChild(link);
            } catch(e) {
                console.warn('Data not found for tools in tooltip. ' + e);
            }
        }
    }
    return table;
};

vq.Hovercard.icon = {};
vq.Hovercard.icon.pin_in =  '<span style="font-size:15px;color:#000;" title="Click to unpin card from the window">O</span>';
vq.Hovercard.icon.pin_out =  '<span style="font-size:15px;color:#000" title="Click to pin card to the window">T</span>';

vq.Hovercard.prototype.renderData = function(dataObject) {
    var html = '';
    var get = vq.utils.VisUtils.get;
    var table = document.createElement('table');
    if (typeof dataObject == 'object') {
        if (this.include_header) {
            var thead = table.createTHead();
            var thead_row = thead.insertRow(-1);
            var thead_cell = thead_row.insertCell(-1);
            thead_cell.innerHTML = 'Property';
            thead_cell = thead_row.insertCell(-1);
            thead_cell.innerHTML = 'Value';
        }
        var tBody = document.createElement("tbody");
        table.appendChild(tBody);

        if (this.data_config) {
            for (var key in this.data_config) {
                try {
                    if (!this.data_config.hasOwnProperty(key)) continue;
                    var trow = tBody.insertRow(-1);
                    var tcell= trow.insertCell(-1);
                    tcell.innerHTML = '<b>' + key + '</b>:';
                    tcell.style.textAlign = 'right';
                    tcell= trow.insertCell(-1);
                    if (typeof  this.data_config[key] == 'function') {
                        tcell.innerHTML= '<span>' +  this.data_config[key](dataObject) + '</span>';
                    }else {
                        tcell.innerHTML= '<span>' +  get(dataObject,this.data_config[key]) + '</span>';
                    }
                } catch(e) {
                    console.warn('Data not found for tool tip: ' + e);
                }

            }
        } else {
            pv.keys(dataObject).forEach(function(key) {
                try {
                    var trow = tBody.insertRow(-1);
                    var tcell= trow.insertCell(-1);
                    tcell.innerHTML = '<b>' + key + '</b>:';
                    tcell = trow.insertCell(-1);
                    tcell.innerHTML = '<span>' + get(dataObject,key) + '</span>';
                } catch (e) {
                    console.warn('Data not found for tool tip: ' + e);
                }
            });
        }

    }
    else if ( typeof dataObject == 'string') {
        return dataObject;
    }
    return table;
};

vq.Hovercard.prototype.getContainer = function() {
    return this.hovercard;
};

vq.Hovercard.prototype.renderFooter = function() {
    var that = this;
    var footer = document.createElement('div');
    footer.setAttribute('style',"text-align:right;font-size:13px;margin-right:5px;color:rgb(240,10,10);cursor:pointer;");
    var close = document.createElement('span');
        function hideHovercard() {
        that.destroy();
        return false;
    }
    close.addEventListener('click',hideHovercard,false);
    close.innerHTML = 'CLOSE [X]';
    footer.appendChild(close);
    return footer;
};

/**
 *
 * @class provides an anchor div for a target object this is "in scope" or using the mouse cursor.
 *  The anchor div's location is used to instantiate a vq.Hovercard object that
 *  provides self_hover, moveable, pin-able and tools
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

pv.Behavior.hovercard = function(opts) {

    var hovercard, anchor_div,target,relative_div;
    var hovercard_div_id =  'vq_hover';
    var outtimer_id, clear, retry_tooltip;

    //list all hovercards that are visible, yet have not been persisted/pinned to the screen.
    function recoverHovercard() {
        var nodes =  document.body.childNodes;
        var body_length = nodes.length;
        var node_arr = [];
        for (var i =0; i< body_length; i++) {
            if (nodes.item(i).id && nodes.item(i).id.slice(0,'hovercard_'.length) == 'hovercard_' &&
                nodes.item(i).className != "" ) {
                node_arr.push(nodes.item(i));
            }
        }
        return node_arr;
    }

    return function(d) {
        var info = opts.param_data ? d : (this instanceof pv.Mark ? (this.data() ||  this.title()) : d);
        var mouse_x, mouse_y;
        var retry = opts.retry || false;
        var that = this;
        if (!retry) {
            target = pv.event.target;
            mouse_x = this.parent.mouse().x;
            mouse_y = this.parent.mouse().y;
        } else {
            target =opts.target;
            mouse_x = opts.event.x;
            mouse_y = opts.event.y;
        }
        opts.self_hover = true;
        opts.include_frame = true;
        opts.include_footer = true;
        opts.target = target;
        var hovercard_arr = recoverHovercard();
        outtimer_id = null;
        clear = function(){
            window.clearTimeout(outtimer_id);
        };
        retry_tooltip = function(){
            pv.Behavior.hovercard(opts).call(that,info);
        };
        //set a timeout to retry after timeout milliseconds has passed
        // quit if there is already a temporary hovercard on the window and timeout has passed
        if (hovercard_arr.length > 0 && !retry) {
             opts.retry = true;
             opts.event = {x:this.parent.mouse().x,y:this.parent.mouse().y};
             opts.param_data = true;
             d=info;
             target.addEventListener('mouseout',clear,false);
             outtimer_id = window.setTimeout(retry_tooltip,opts.timeout || 100);
             return;
       	}// if there are still cards out and this is a retry, just give up
        else if (hovercard_arr.length > 0 && retry) { opts.retry = false; target.removeEventListener('mouseout',clear,false); return;}
        else if (retry) { clear(); target.removeEventListener('mouseout',clear,false);}

        opts.retry = false;
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
        anchor_div.style.left = opts.on_mark ? Math.floor(this.left() * t.k + t.x) + "px" : Math.floor(mouse_x  * t.k+ t.x)  + "px";
        anchor_div.style.top = opts.on_mark ? Math.floor(this.top() * t.k + t.y) + "px" : Math.floor(mouse_y * t.k + t.y) + "px";
        opts.transform = t;

        hovercard = new vq.Hovercard(opts);
        hovercard.show(anchor_div,info);
    };
};


