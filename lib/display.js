/*
 * Package: clickable_object.js
 * 
 * Namespace: bbop-widget-set.display.clickable_object
 * 
 * BBOP object to produce a clickable image or a clickable text span,
 * both producing something that can give its id for later clickable
 * actions.
 * 
 * This is a method, not a constructor.
 */

var us = require('underscore');
var bbop = require('bbop-core');

// Code here will be ignored by JSHint, as we are technically
// "redefining" jQuery (although we are not).
/* jshint ignore:start */
var jQuery = require('jquery');
/* jshint ignore:end */

var html = require('../html');
var generators = require('../generators');

/*
 * Package: spinner.js
 * 
 * Namespace: bbop-widget-set.spinner
 * 
 * BBOP object to produce a self-constructing/self-destructing
 * spinner. It can display various spinner/throbber images and can
 * have a set timeout to deal with annoying servers and exotic race
 * conditions.
 * 
 * The class of the spinner image is "bbop-widget-spinner".
 * 
 * Visibility is controlled by the application and removal of
 * "bbop-js-spinner-hidden".
 * 
 * This is a completely self-contained UI.
 */

/*
 * Constructor: spinner
 * 
 * Contructor for the bbop-widget-set.spinner object.
 * 
 * A trivial invocation might be something like:
 * : var s = new bbop-widget-set.spinner("inf01", "http://localhost/amigo2/images/waiting_ajax.gif");
 * : s.hide();
 * : s.show();
 * 
 * Or, in a slightly different use case:
 * 
 * : var s = new bbop-widget-set.spinner("inf01", "http://localhost/amigo2/images/waiting_ajax.gif", {'timout': 5});
 * : s.start_wait();
 * 
 * The optional hash arguments look like:
 *  timeout - the number of seconds to wait before invoking <clear_waits>; 0 indicates waiting forever; defaults to 5
 *  visible_p - whether or not the spinner is visible on initialization; true|false; defaults to true
 *  classes - a string of space-separated classes that you want added to the spinner image
 * 
 * Arguments:
 *  host_elt_id - string id of the place to place the widget
 *  img_src - the URL for the image to use in the spinner
 *  argument_hash - *[optional]* optional hash of optional arguments
 * 
 * Returns:
 *  self
 */
var spinner = function(host_elt_id, img_src, argument_hash){
    
    this._is_a = 'bbop-widget-set.spinner';

    var anchor = this;

    // Per-UI logger.
    var logger = new bbop.logger();
    logger.DEBUG = false;
    //logger.DEBUG = true;
    function ll(str){ logger.kvetch('W (spinner): ' + str); }

    // Our argument default hash.
    var default_hash = {
	'timeout': 5,
	'visible_p': true,
	'classes': ''
    };
    var folding_hash = argument_hash || {};
    var arg_hash = bbop.fold(default_hash, folding_hash);

    // Spin out arguments.
    var timeout = arg_hash['timeout'];
    var visible_p = arg_hash['visible_p'];
    var classes = arg_hash['classes'];

    ///
    /// Part 1: Append the image into the given element id.
    ///

    // Use the incoming arguments to help determine the default
    // classes on the element.'
    var spinner_classes = ['bbop-js-spinner'];
    if( ! visible_p ){
	spinner_classes.push('bbop-js-spinner-hidden');
    }
    if( classes && classes !== '' ){
	spinner_classes.push(classes);
    }

    // Create new element.
    var spinner_elt = new html.image({'generate_id': true,
				      'src': img_src,
				      'title': "Please wait...",
				      'class': spinner_classes.join(' '),
				      'alt': "(waiting...)"});
    var spinner_elt_id = spinner_elt.get_id();

    // Append img to end of given element.
    jQuery('#' + host_elt_id).append(spinner_elt.to_string());
    
    ///
    /// Part 2: Dynamic display management.
    ///

    // Counts and accounting.
    var current_waits = 0;
    var timeout_queue = [];

    /*
     * Function: show
     * 
     * Show the spinner if it is hidden (regardless of current waits).
     * 
     * Parameters:
     *  n/a
     * 
     * Returns
     *  n/a
     */
    this.show = function(){
	ll("show");
	jQuery('#' + spinner_elt_id).removeClass('bbop-js-spinner-hidden');	

	// If the timeout is defined, push a timer onto
	// the queue.
	function _on_timeout(){
	    anchor.finish_wait();
	}
	if( timeout > 0 ){
	    setTimeout(_on_timeout, (timeout * 1000));
	}
	// foo=setTimeout(function(){}, 1000);
	// clearTimeout(foo);
    };

    /*
     * Function: hide
     * 
     * Hide the spinner if it is showing (regardless of current waits).
     * 
     * Parameters:
     *  n/a
     * 
     * Returns
     *  n/a
     */
    this.hide = function(){
	ll("hide");
	jQuery('#' + spinner_elt_id).addClass('bbop-js-spinner-hidden');	
    };

    /*
     * Function: start_wait
     * 
     * Displays the initial spinner if it is not already displayed and
     * adds one to the wait count.
     * 
     * Parameters:
     *  n/a
     * 
     * Returns
     *  n/a
     */
    this.start_wait = function(){

	ll("Start outstanding waits: " + current_waits);

	// 
	if( current_waits === 0 ){
	    anchor.show();
	}

	current_waits++;
    };

    /*
     * Function: finish_wait
     * 
     * Removes one from the wait count and hides the spinner if the
     * number of outstanding waits has reached zero.
     * 
     * Parameters:
     *  n/a
     * 
     * Returns
     *  n/a
     */
    this.finish_wait = function(){

	ll("Finish outstanding waits: " + current_waits);

	// Stay at least at 0--we might have stragglers or incoming
	// after a reset.
	if( current_waits > 0 ){
	    current_waits--;	    
	}

	// Gone if we are not waiting for anything.
	if( current_waits === 0 ){
	    anchor.hide();
	}
    };

    /*
     * Function: clear_waits
     * 
     * Hides the spinner and resets all the waiting counters. Can be
     * used during things like server errors or collisions.
     * 
     * Parameters:
     *  n/a
     * 
     * Returns
     *  n/a
     */
    this.clear_waits = function(){
	current_waits = 0;
	anchor.hide();
    };
};

/*
 * Package: filter_table.js
 * 
 * Namespace: bbop-widget-set.filter_table
 * 
 * Create a dynamic filter for removing rows from a table (where the
 * rows are inside of a tbody).
 * 
 * The repaint_func argument takes the table id as its argument. If a
 * function is not specified, the default function will do nothing.
 */

// YANKED: ...apply the classes "even_row" and "odd_row" to the table.

/*
 * Method: filter_table
 * 
 * The table needs to keep the row information in a tbody, not just at
 * the top level.
 * 
 * Arguments:
 *  elt_id - the element to inject the filter into
 *  table_id - the table that we will operate on
 *  img_src - *[optional]* img source URL for the spinner image (defaults to no spinner)
 *  repaint_func - the repaint function to run after filtering (see above)
 *  label - *[optional]* the label to use for the filter
 * 
 * Returns:
 *  n/a
 */
var filter_table = function(elt_id, table_id, img_src, repaint_func, label){
    this._is_a = 'bbop-widget-set.filter_table';

    var anchor = this;
    
    var logger = new bbop.logger();
    //logger.DEBUG = true;
    logger.DEBUG = false;
    function ll(str){ logger.kvetch(str); }

    ll('init filter_table in ' + elt_id + ' for ' + table_id);

    // Sort out spinner image source.
    anchor.img_src = null;
    if( img_src ){
	anchor.img_src = img_src;
    }

    // Sort out repaint function.
    anchor.repaint_func = function (tid){};	
    // function (tid){
    //     jQuery('table#' + tid + ' tr:even').attr('class', 'even_row');
    //     jQuery('table#' + tid + ' tr:odd').attr('class', 'odd_row');
    // };
    if( repaint_func ){
    	anchor.repaint_func = repaint_func;
    }

    // Sort out label.
    anchor.label = 'Filter:';
    if( label ){
	anchor.label = label;
    }

    ll('finished args');
    
    // Create a label, input field, and a clear button.
    var input_attrs = {
	'type': 'text',
	'class': 'form-control bbop-js-filter-table-input',
	'value': '',
	'generate_id': true
    };
    var input = new html.input(input_attrs);

    var lbl_attrs = {
	'for': input.get_id(),
	'generate_id': true
    };
    var lbl = new html.tag('label', lbl_attrs, anchor.label);

    var clear_button_attrs ={
	'type': 'button',
	'class': 'btn btn-danger',
	'title': 'Clear filter',
	'generate_id': true
    };
    var clear_button =
	    //new bbop-widget-set.display.text_button_sim('&times;', 'Clear filter');
	    new html.button('&times;', clear_button_attrs);

    var cont_attrs = {
	'class': 'form-inline'
    };
    var cont = new html.tag('div', cont_attrs, [lbl, input,
						clear_button]);

    ll('widget gen done');

    // And add them to the DOM at the location.
    jQuery('#' + elt_id).empty();
    jQuery('#' + elt_id).append(cont.to_string());

    // Also, attach a spinner.
    var spinner = null;
    if( anchor.img_src ){
	jQuery('#' + elt_id).append('&nbsp;&nbsp;');
	spinner = new spinner(elt_id, anchor.img_src,
			      {
				  visible_p: false
			      });
    }
    
    ll('widget addition done');

    // Make the clear button active.
    jQuery('#' + clear_button.get_id()).click(function(){
	ll('click call');
	if( spinner ){ spinner.show(); }
        jQuery('#' + input.get_id()).val('');
	trs.show();
	// Recolor after filtering.
	anchor.repaint_func(table_id);
	if( spinner ){ spinner.hide(); }
    });

    // Cache information about the table.
    var trs = jQuery('#' + table_id + ' tbody > tr');
    var tds = trs.children();

    // Make the table filter active.
    jQuery('#' + input.get_id()).keyup(function(){
	
	if( spinner ){ spinner.show(); }
	
        var stext = jQuery(this).val();
	
	ll('keyup call: (' + stext + '), ' + trs);
	
	if( ! bbop.is_defined(stext) || stext === "" ){
	    // Restore when nothing found.
	    trs.show();
	}else{
	    // Want this to be insensitive.
	    stext = stext.toLowerCase();
	    
	    // All rows (the whole table) gets hidden.
	    trs.hide();
	    
	    // jQuery filter to match element contents against
	    // stext.
	    var _match_filter = function(){
		var retval = false;
		var lc = jQuery(this).text().toLowerCase();
		if( lc.indexOf(stext) >= 0 ){
		    retval = true;
		}
		return retval;
	    };

	    // If a td has a match, the parent (tr) gets shown.
	    // Or: show only matching rows.
	    tds.filter(_match_filter).parent("tr").show();
        }
	
	// Recolor after filtering.
	anchor.repaint_func(table_id);
	
	if( spinner ){ spinner.hide(); }
    });
};


/*
 * Function: results_table_by_class_conf
 *
 * Using a conf class and a set of data, automatically populate and
 * return a results table.
 *  
 * This is the Bootstrap 3 version of this display. It affixes itself
 * directly to the DOM using jQuery at elt_id.
 *  
 * Parameters:
 *  class_conf - a <bbop.golr.conf_class>
 *  golr_resp - a <bbop.golr.response>
 *  linker - a linker object; see <amigo.linker> for more details
 *  handler - a handler object; see <amigo.handler> for more details
 *  elt_id - the element id to attach it to
 *  selectable_p - *[optional]* whether to create checkboxes (default true)
 *
 * Returns:
 *  this object
 *
 * See Also:
 *  <bbop-widget-set.display.results_table_by_class>
 */
var results_table_by_class_conf = function(cclass, golr_resp, linker,
					   handler, elt_id, selectable_p,
					   select_toggle_id,
					   select_item_name){

    //
    var anchor = this;

    // Temp logger.
    var logger = new bbop.logger();
    //logger.DEBUG = true;
    logger.DEBUG = false;
    function ll(str){ logger.kvetch('RTBCCBS3: ' + str); }

    // Tie important things down for cell rendering prototype.
    anchor._golr_response = golr_resp;
    anchor._linker = linker;
    anchor._handler = handler;

    // The context we'll deliver to
    var display_context = 'bbop-widget-sets.search_pane';

    // Only want to compile once.
    var ea_regexp = new RegExp("\<\/a\>", "i"); // detect an <a>
    var br_regexp = new RegExp("\<br\ \/\>", "i"); // detect a <br />

    // // Sort out whether we want to display checkboxes. Also, give life
    // // to the necessary variables if they will be called upon.
    // var select_toggle_id = null;
    // var select_item_name = null;
    // if( is_defined(selectable_p) && selectable_p == true ){

    // }

    // Now take what we have, and wrap around some expansion code
    // if it looks like it is too long.
    var trim_hash = {};
    var trimit = 100;
    function _trim_and_store( in_str ){

	var retval = in_str;

	//ll("T&S: " + in_str);

	// Skip if it is too short.
	//if( ! ea_regexp.test(retval) && retval.length > (trimit + 50) ){
	if( retval.length > (trimit + 50) ){
	    //ll("T&S: too long: " + retval);

	    // Let there be tests.
	    var list_p = br_regexp.test(retval);
	    var anchors_p = ea_regexp.test(retval);

	    var tease = null;
	    if( ! anchors_p && ! list_p ){
		// A normal string then...trim it!
		//ll("\tT&S: easy normal text, go nuts!");
		tease = new html.span(bbop.crop(retval, trimit, ''),
				      {'generate_id': true});
	    }else if( anchors_p && ! list_p ){
		// It looks like it is a link without a break, so not
		// a list. We cannot trim this safely.
		//ll("\tT&S: single link so cannot work on!");
	    }else{
		//ll("\tT&S: we have a list to deal with");
		
		var new_str_list = retval.split(br_regexp);
		if( new_str_list.length <= 3 ){
		    // Let's just ignore lists that are only three
		    // items.
		    //ll("\tT&S: pass thru list length <= 3");
		}else{
		    //ll("\tT&S: contruct into 2 plus tag");
		    var new_str = '';
		    new_str = new_str + new_str_list.shift();
		    new_str = new_str + '<br />';
		    new_str = new_str + new_str_list.shift();
		    tease = new html.span(new_str, {'generate_id': true});
		}
	    }

	    // If we have a tease, assemble the rest of the packet
	    // to create the UI.
	    if( tease ){
		// Setup the text for tease and full versions.
		var bgen = function(lbl, dsc){
		    var b = new html.button(
  			lbl,
			{
			    'generate_id': true,
			    'type': 'button',
			    'title': dsc || lbl,
			    //'class': 'btn btn-default btn-xs'
			    'class': 'btn btn-primary btn-xs'
			});
		    return b;
		};
		var more_b = new bgen('more...', 'Display the complete list');
		var full = new html.span(retval,
					 {'generate_id': true});
		var less_b = new bgen('less', 'Display the truncated list');
		
		// Store the different parts for later activation.
		var tease_id = tease.get_id();
		var more_b_id = more_b.get_id();
		var full_id = full.get_id();
		var less_b_id = less_b.get_id();
		trim_hash[tease_id] = 
		    [tease_id, more_b_id, full_id, less_b_id];
		
		// New final string.
		retval = tease.to_string() + " " +
		    more_b.to_string() + " " +
		    full.to_string() + " " +
		    less_b.to_string();
	    }
	}

	return retval;
    }

    // Create a locally mangled checkbox.
    function _create_select_box(val, id, name){
	if( ! bbop.is_defined(name) ){
	    name = select_item_name;	    
	}
	
	var input_attrs = {
	    'value': val,
	    'name': name,
	    'type': 'checkbox'
	};
	if( bbop.is_defined(id) ){
	    input_attrs['id'] = id;
	}
	var input = new html.input(input_attrs);
	return input;
    }

    ///
    /// Render the headers.
    ///

    // Start with score, and add the others by order of the class
    // results_weights field.
    // var headers = ['score'];
    // var headers_display = ['Score'];
    var headers = [];
    var headers_display = [];
    if( selectable_p ){
	// Hint for later.
	headers.push(select_toggle_id);

	// Header select for selecting all.
	var hinp = _create_select_box('', select_toggle_id, '');
	//headers_display.push('All ' + hinp.to_string());
	headers_display.push(hinp.to_string());
    }
    var results_order = cclass.field_order_by_weight('result');
    us.each(results_order,
	    function(fid){
		// Store the raw headers/fid for future use.
		headers.push(fid);
		// Get the headers into a presentable state.
		var field = cclass.get_field(fid);
		if( ! field ){ throw new Error('conf error: not found:' + fid); }
		//headers_display.push(field.display_name());
		var fdname = field.display_name();
		var fdesc = field.description() || '???';
		var head_span_attrs = {
		    // TODO/NOTE: to make the tooltip work properly, since the
		    // table headers are being created each time,
		    // the tooltop initiator would have to be called after
		    // each pass...I don't know that I want to do that.
		    //'class': 'bbop-js-ui-hoverable bbop-js-ui-tooltip',
		    'class': 'bbop-js-ui-hoverable',
		    'title': fdesc
		};
		// More aggressive link version.
		//var head_span = new html.anchor(fdname, head_span_attrs);
		var head_span = new html.span(fdname, head_span_attrs);
		headers_display.push(head_span.to_string());
	    });

    ///
    /// Render the documents.
    ///

    // Cycle through and render each document.
    // For each doc, deal with it as best we can using a little
    // probing. Score is a special case as it is not an explicit
    // field.
    var table_buff = [];
    var docs = golr_resp.documents();
    us.each(docs, function(doc){
	
	// Well, they had better be in here, so we're just gunna cycle
	// through all the headers/fids.
	var entry_buff = [];
	us.each(headers, function(fid){
	    // Detect out use of the special selectable column and add
	    // a special checkbox there.
	    if( fid === select_toggle_id ){
		// Also
		var did = doc['id'];
		var dinp = _create_select_box(did);
		entry_buff.push(dinp.to_string());
	    }else if( fid === 'score' ){
		// Remember: score is also
		// special--non-explicit--case.
		var score = doc['score'] || 0.0;
		score = bbop.to_string(100.0 * score);
		entry_buff.push(bbop.crop(score, 4) + '%');
	    }else{
		
		// Not "score", so let's figure out what we can
		// automatically.
		var field = cclass.get_field(fid);
		
		// Make sure that something is there and that we can
		// iterate over whatever it is.
		var bits = [];
		if( doc[fid] ){
		    if( field.is_multi() ){
			//ll("Is multi: " + fid);
			bits = doc[fid];
		    }else{
			//ll("Is single: " + fid);
			bits = [doc[fid]];
		    }
		}
		
		// Render each of the bits.
		var tmp_buff = [];
		us.each(bits, function(bit){		    
		    var out =
			    anchor.process_entry(bit, fid, doc, display_context);
		    tmp_buff.push(out);
		});
		// Join it, trim/store it, push to to output.
		var joined = tmp_buff.join('<br />');
		entry_buff.push(_trim_and_store(joined));
	    }
	});
	table_buff.push(entry_buff);
    });
    
    // Add the table to the DOM.
    var final_table =
	    new html.table(headers_display, table_buff,
			   {'class': 
			    'table table-striped table-hover table-condensed'});
    // new html.table(headers_display, table_buff,
    // 		    {'class': 'bbop-js-search-pane-results-table'});
    jQuery('#' + elt_id).append(bbop.to_string(final_table));
    
    // Add the roll-up/down events to the doc.
    us.each(trim_hash, function(val, key){
	var tease_id = val[0];
	var more_b_id = val[1];
	var full_id = val[2];
	var less_b_id = val[3];
	
	// Initial state.
	jQuery('#' + full_id ).hide();
	jQuery('#' + less_b_id ).hide();
	
	// Click actions to go back and forth.
	jQuery('#' + more_b_id ).click(function(){
	    jQuery('#' + tease_id ).hide();
	    jQuery('#' + more_b_id ).hide();
	    jQuery('#' + full_id ).show('fast');
	    jQuery('#' + less_b_id ).show('fast');
	});
	jQuery('#' + less_b_id ).click(function(){
	    jQuery('#' + full_id ).hide();
	    jQuery('#' + less_b_id ).hide();
	    jQuery('#' + tease_id ).show('fast');
	    jQuery('#' + more_b_id ).show('fast');
	});
    });

    // Since we already added to the DOM in the table, now add the
    // group toggle if the optional checkboxes are defined.
    if( select_toggle_id && select_item_name ){
	jQuery('#' + select_toggle_id).click(function(){
	    var cstr = 'input[id=' + select_toggle_id + ']';
	    var nstr = 'input[name=' + select_item_name + ']';
	    if( jQuery(cstr).prop('checked') ){
		jQuery(nstr).prop('checked', true);
	    }else{
		jQuery(nstr).prop('checked', false);
	    }
	});
    }
};

/*
 * Function: process_entry
 *
 * The function used to render a single entry in a cell in the results
 * table. It can be overridden to specify special behaviour. There may
 * be multiple entries within a cell, but they will all have this
 * function individually run over them.
 *
 * This function can access this._golr_response (a
 * <bbop.golr.response>), this._linker (a <bbop.linker>), and
 * this._handler (a <bbop.handler>).
 *
 * Arguments:
 *  bit - string (?) for the one entry in the cell
 *  field_id - string for the field under consideration
 *  document - the single document for this item from the solr response
 *
 * Returns:
 *  string or empty string ('')
 */
results_table_by_class_conf.prototype.process_entry = function(bit, field_id,
							       document,
							       display_context){
    
    var anchor = this;
    
    // First, allow the hanndler to take a whack at it. Forgive
    // the local return. The major difference that we'll have here
    // is between standard fields and special handler fields. If
    // the handler resolves to null, fall back onto standard.
    //ll('! B:' + bit + ', F:' + fid + ', D:' + display_context);
    var out = anchor._handler.dispatch(bit, field_id, display_context);
    if( bbop.is_defined(out) && out != null ){
	return out;
    }
    
    // Otherwise, use the rest of the context to try and render
    // the item.
    var retval = '';
    var did = document['id'];
    
    // BUG/TODO: First see if the filed will be multi or not.
    // If not multi, follow the first path. If multi, break it
    // down and try again.
    
    // Get a label instead if we can.
    var ilabel = anchor._golr_response.get_doc_label(did, field_id, bit);
    if( ! ilabel ){
    	ilabel = bit;
    }
    
    // Extract highlighting if we can from whatever our "label"
    // was.
    var hl = anchor._golr_response.get_doc_highlight(did, field_id, ilabel);
    
    // See what kind of link we can create from what we got.
    var ilink = anchor._linker.anchor({id:bit, label:ilabel, hilite:hl},
				      field_id);
    
    //ll('processing: ' + [field_id, ilabel, bit].join(', '));
    //ll('ilink: ' + ilink);
    
    // See what we got, in order of how much we'd like to have it.
    if( ilink ){
    	retval = ilink;
    }else if( ilabel ){
    	retval = ilabel;
    }else{
    	retval = bit;
    }
    
    return retval;
};

/*
 * Package: filter_shield.js
 * 
 * Namespace: bbop-widget-set.display.filter_shield
 * 
 * BBOP object to produce a self-constructing/self-destructing shield
 * to support very large filter selection in the live search/search
 * pane genre.
 */

/*
 * Constructor: filter_shield
 * 
 * Contructor for the bbop-widget-set.display.filter_shield object.
 * 
 * Support for <bbop-widget-set.search_pane> by way of
 * <bbop-widget-set.display.live_search>
 * 
 * Arguments:
 *  spinner_img_src - *[optional]* optional source of a spinner image to use
 *  wait_msg - *[optional]* the wait message to use; may be a string or html; defaults to "Waiting..."
 * 
 * Returns:
 *  self
 */
var filter_shield = function(spinner_img_src, wait_msg){

    this._is_a = 'bbop-widget-set.display.filter_shield';

    var anchor = this;

    // Per-UI logger.
    var logger = new bbop.logger();
    logger.DEBUG = true;
    function ll(str){ logger.kvetch('W (filter_shield): ' + str); }

    // Determine wait_msg, if any.
    if( ! wait_msg ){
	wait_msg = 'Waiting...';
    }else{
	// pass it through
    }

    // Variables that we'll need to keep.
    var is_open_p = false;
    var parea = new html.tag('div', {'generate_id': true});
    var pmsg = new html.tag('div', {'generate_id': true}, wait_msg);
    parea.add_to(pmsg);

    var div = new html.tag('div', {'generate_id': true}, parea);
    var pmsg_id = pmsg.get_id();
    //var pbar_id = pbar.get_id();
    var div_id = div.get_id();
    var diargs = {
	modal: true,
	draggable: false,
	width: 800,
	height: 600,
	close:
	function(){
	    // TODO: Could maybe use .dialog('destroy') instead?
	    jQuery('#' + div_id).remove();
	}	    
    };

    /*
     * Function: start_wait
     * 
     * Render an unpopulated modal shield with some kind of waiting
     * element. This is to act as a block for the IO if
     * desired--calling this before .draw() is not required (as
     * .draw() will call it anyways if you haven't).
     * 
     * Arguments:
     *  n/a
     * 
     * Returns:
     *  n/a
     */
    this.start_wait = function(){

	// Mark that we've finally opened it.
	is_open_p = true;

	// Append div to body.
	jQuery('body').append(div.to_string());	

	// If we have an image source specified, go ahead and add it to
	// the waiting display before popping it open.
	if( spinner_img_src && spinner_img_src !== '' ){
	    var s = new spinner(parea.get_id(), spinner_img_src);
	}

	// Pop open the dialog.
	var dia = jQuery('#' + div_id).dialog(diargs);
    };

    /*
     * Function: draw
     * 
     * Render a temporary modal filter shield.
     * 
     * Arguments:
     *  field_name - the name (id) of the filter field to display
     *  filter_list - a list of [[filter_id, filter_count], ...]
     *  manager - the manager that we'll use for the callbacks
     * 
     * Returns:
     *  n/a
     */
    this.draw = function(field_name, filter_list, manager){
	//ll(doc['id']);

	// Open the shield if it is not already open.
	if( ! is_open_p ){
	    anchor.open();
	}

	var txt = 'No filters...';
	var tbl = new html.table(null, null, {'generate_id': true});
	var button_hash = {};
	us.each(filter_list, function(field){
	    var fname = field[0];
	    var fcount = field[1];
	    
	    var b_plus =
		    new generators.text_button_sim('+', 'Add positive filter');
	    var b_minus =
		    new generators.text_button_sim('-', 'Add negative filter');
	    button_hash[b_plus.get_id()] = [field_name, fname, fcount, '+'];
	    button_hash[b_minus.get_id()] = [field_name, fname, fcount, '-'];
	    
	    tbl.add_to([fname, '(' + fcount + ')',
			b_plus.to_string(),
			b_minus.to_string()]);
	});
	txt = tbl.to_string();
	
	// Create a filter slot div.
	
	// Add filter slot and table text to div.
	jQuery('#' + div_id).empty();
	var fdiv = new html.tag('div', {'generate_id': true});
	jQuery('#' + div_id).append(fdiv.to_string());	
	jQuery('#' + div_id).append(txt);
	
	// Apply the filter to the table.
	var ft = null;
	if( spinner_img_src && spinner_img_src !== '' ){
	    ft = filter_table(fdiv.get_id(), tbl.get_id(), spinner_img_src,null);
	}else{
	    ft = filter_table(fdiv.get_id(), tbl.get_id(), null);
	}
	
	// Okay, now introducing a function that we'll be using a
	// couple of times in our callbacks. Given a button id (from
	// a button hash) and the [field, filter, count, polarity]
	// values from the props, make a button-y thing an active
	// filter.
	function filter_select_live(create_time_button_props, button_id){
	    var in_polarity = create_time_button_props[3];

	    // Decide on the button graphical elements.
	    var b_ui_icon = 'ui-icon-plus';
	    if( in_polarity === '-' ){
		b_ui_icon = 'ui-icon-minus';
	    }
	    var b_ui_props = {
		icons: { primary: b_ui_icon},
		text: false
	    };

	    // Create the button and immediately add the event.
	    jQuery('#' + button_id).click(function(){
		var tid = jQuery(this).attr('id');
		var call_time_button_props = button_hash[tid];
		var call_field = call_time_button_props[0];	 
		var call_filter = call_time_button_props[1];
		//var in_count = button_props[2];
		var call_polarity = call_time_button_props[3];
		
		// Change manager, fire, and close the dialog.
		manager.add_query_filter(call_field, call_filter,
			  		 [call_polarity]);
		manager.search();
		jQuery('#' + div_id).remove();
	    });
	}

	// Now let's go back and add the buttons, styles,
	// events, etc. in the main accordion section.
	us.each(button_hash, filter_select_live);
    };

};

///
/// Exportable body.
///

module.exports.display = {};
// Objects.
module.exports.display.spinner = spinner;
module.exports.display.filter_shield = filter_shield;
module.exports.display.filter_table = filter_table;
module.exports.display.results_table_by_class_conf = results_table_by_class_conf;

