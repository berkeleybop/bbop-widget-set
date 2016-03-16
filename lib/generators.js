
var us = require('underscore');
var bbop = require('bbop-core');

var html = require('./html');

var generators = {};

/*
 * Method: clickable_object
 * 
 * Generator for a clickable object.
 * 
 * TODO: May eventually expand it to include making a jQuery button.
 * 
 * Arguments:
 *  label - *[optional]* the text to use for the span or label (defaults to '')
 *  source - *[optional]* the URL source of the image (defaults to '')
 *  id - *[optional]* the id for the object (defaults to generate_id: true)
 * 
 * Returns:
 *  html.span or html.image
 */
generators.clickable_object = function(label, source, id){
    //this._is_a = 'bbop-widget-set.display.clickable_object';
    //var anchor = this;
    // // Per-UI logger.
    // var logger = new bbop.logger();
    // logger.DEBUG = true;
    // function ll(str){ logger.kvetch('W (clickable_object): ' + str); }

    // Default args.
    if( ! label ){ label = ''; }
    if( ! source ){ source = ''; }

    // Decide whether we'll use an incoming id or generate our own.
    var args = {};
    if( id ){
	args['id'] = id;
    }else{
	args['generate_id'] = true;
    }

    // Figure out an icon or a label.
    var obj = null;
    if( source === '' ){
	obj = new html.span(label, args);
    }else{
	args['src'] = source;
	args['title'] = label;
	obj = new html.image(args);
    }

    return obj;
};

/*
 * Package: text_buttom_sim.js
 * 
 * Namespace: bbop-widget-set.display.text_button_sim
 * 
 * BBOP object to produce a clickable text span, that in conjunction with the local CSS, should make an awfully button looking creature.
 * 
 * It uses the class: "bbop-js-text-button-sim".
 * 
 * Note: this is a method, not a constructor.
 */

/*
 * Method: text_button_sim_generator
 * 
 * Generator for a text span for use for buttons.
 * 
 * Arguments:
 *  label - *[optional]* the text to use for the span or (defaults to 'X')
 *  title - *[optional]* the hover text (defaults to 'X')
 *  id - *[optional]* the id for the object (defaults to generate_id: true)
 *  add_attrs - *[optional]* more attributes to be folded in to the span as hash
 * 
 * Returns:
 *  html.span
 */
generators.text_button_sim = function(label, title, id, add_attrs){
    
    // Default args.
    if( ! label ){ label = 'X'; }
    if( ! title ){ title = 'X'; }
    if( ! add_attrs ){ add_attrs = {}; }
    
    // Decide whether we'll use an incoming id or generate our own.
    var args = {
	'class': "bbop-js-text-button-sim",
	'title': title
    };
    if( id ){
	args['id'] = id;
    }else{
	args['generate_id'] = true;
    }

    // Addtional optional atrributes and overrides.    
    args = bbop.merge(args, add_attrs);

    var obj = new html.span(label, args);    
    return obj;
};

/*
 * Package: button_templates.js
 * 
 * Namespace: bbop-widget-set.display.button_templates
 * 
 * Template generators for various button "templates" that can be fed
 * into the <search_pane> widget.
 * 
 * These templates foten have functions that manipulate the
 * environment outside, such as window.*, etc. Be aware and look at
 * the code carefully--there is a reason they're in the
 * widgets/display area.
 * 
 * Note: this is a collection of methods, not a constructor/object.
 */

generators.button_templates = {};

/*
 * Method: field_download
 * 
 * Generate the template for a simple download button.
 * 
 * Arguments:
 *  label - the text to use for the hover
 *  count - the number of items to download
 *  fields - the field to download
 * 
 * Returns:
 *  hash form of jQuery button template for consumption by <search_pane>.
 */
generators.button_templates.field_download = function(label, count, fields){

    var dl_props = {
	'entity_list': null,
	'rows': count
    };
    var field_download_button = {
	label: label,
	diabled_p: false,
	// text_p: false,
	// icon: 'ui-icon-document',
	click_function_generator: function(manager, results_table){
	    return function(event){
		var dialog_props = {
		    title: 'Download',
		    buttons: {
			'Download': function(){
			    //alert('download');
			    dl_props['entity_list'] =
				results_table.get_selected_items();
			    var raw_gdl =
				    manager.get_download_url(fields, dl_props);
			    window.open(raw_gdl, '_blank');
			    //jQuery(this).dialog('destroy');
    			    jQuery(this).remove();
			},
			'Cancel': function(){
			    //jQuery(this).dialog('destroy');
    			    jQuery(this).remove();
			}
		    }
		};
		new widget.dialog('<h4>Download (up to ' + count + ')</h4><p>You may download up to ' + count + ' lines in a new window. If your request is large or if the the server busy, this may take a while to complete--please be patient.</p>',
				       dialog_props);
		//window.open(raw_gdl, '_blank');
	    };
	}
    };
    return field_download_button;
};

/*
 * Method: restmark
 * 
 * Generate the template for a simple bookmark button with pop-up.
 * 
 * Arguments:
 *  linker - the linker to be used for this bookmarking
 * 
 * Returns:
 *  hash form of jQuery button template for consumption by <search_pane>.
 */
generators.button_templates.restmark = function(linker){
    
    var bookmark_button = {
	label: 'Show URL/bookmark',
	diabled_p: false,
	text_p: false,
	icon: 'ui-icon-link',
	click_function_generator: function(manager){
	    return function(event){
		//alert('GAF download: ' + manager.get_query_url());
		//alert('URL: ' + manager.get_query_url());
		var raw_restmark = manager.get_filter_query_string();
		// var a_args = {
		// 	// Since we're using the whole URI as a
		// 	// parameter, we use the heavy hitter on top
		// 	// of the already encoded URI.
		// 	id: encodeURIComponent(raw_bookmark),
		// 	label: 'this search'
		// };
		//  linker.anchor(a_args, 'search', curr_personality)
		
		var restmark_anchor =
			'<a href="?' + raw_restmark + '">this search</a>';
		
		new widget.dialog('<p>Bookmark for: ' + restmark_anchor + '.</p><p>Please be aware that <strong>this bookmark does not save properties</strong> like currently selected items.</p><p>The AmiGO 2 bookmarking method may change in the future: at this point, <strong>it is intended as a temporary method</strong> (days, not weeks or months) of allowing the reruning of searches using a link.</p>',
				       {'title': 'Bookmark'});
	    };
	}
    };
    return bookmark_button;
};

/*
 * Method: bookmark
 * 
 * Generate the template for a simple bookmark (for search) button
 * with pop-up.
 * 
 * Arguments:
 *  linker - the linker to be used for this bookmarking
 * 
 * Returns:
 *  hash form of jQuery button template for consumption by <search_pane>.
 */
generators.button_templates.bookmark = function(linker){
    
    var bookmark_button = {
	label: 'Show URL/bookmark',
	diabled_p: false,
	text_p: false,
	icon: 'ui-icon-link',
	click_function_generator: function(manager){
	    return function(event){
		//alert('GAF download: ' + manager.get_query_url());
		//alert('URL: ' + manager.get_query_url());
		var raw_bookmark = manager.get_state_url();
		var curr_personality = manager.get_personality();
		var a_args = {
		    // Since we're using the whole URI as a
		    // parameter, we use the heavy hitter on top
		    // of the already encoded URI.
		    id: encodeURIComponent(raw_bookmark),
		    label: 'this search'
		};
		
		new widget.dialog('<p>Bookmark for: ' + linker.anchor(a_args, 'search', curr_personality) + '</p><p>Please be aware that <strong>this bookmark does not save properties</strong> like currently selected items.</p><p>The AmiGO 2 bookmarking method may change in the future: at this point, <strong>it is intended as a temporary method</strong> (days, not weeks or months) of allowing the reruning of searches using a link.</p>',
				       {'title': 'Bookmark'});
	    };
	}
    };
    return bookmark_button;
};

/*
 * Method: send_fields_to_galaxy
 * 
 * Generate the template for a button that sends fields to a Galaxy
 * instance.
 * 
 * Arguments:
 *  label - the text to use for the hover
 *  count - the number of items to download
 *  fields - the field to download
 *  galaxy - the url to the galaxy instance we're sending to
 * 
 * Returns:
 *  hash form of jQuery button template for consumption by <search_pane>.
 */
generators.button_templates.send_fields_to_galaxy = function(label, count,
							     fields, galaxy){
    
    var dl_props = {
	'entity_list': null,
	'rows': count
    };
    var galaxy_button = {
	label: label,
	diabled_p: false,
	text_p: false,
	icon: 'ui-icon-mail-closed',
	click_function_generator: function(manager){
	    return function(event){
		
		// If we have something, construct a form
		if( ! galaxy || galaxy === "" ){
		    alert('Sorry: could not find a usable Galaxy.');
		}else{
		    // We have a galaxy, so let's try and kick out
		    // to it. Cribbing form POST from Gannet.
		    var bval = '1 field';
		    if( fields && fields.length > 1 ){
			bval = fields.length + ' fields';
		    }
		    var input_su = new html.input({name: 'submit',
						   type: 'submit',
						   value: bval});
			var input_um = new html.input({name: 'URL_method',
						       type: 'hidden',
						       value: 'get'});

			// See GAF download button for more info.
			dl_props['entity_list'] = manager.get_selected_items();
			var raw_gdl =
			    manager.get_download_url(fields, dl_props);
			var input_url = new html.input({name: 'URL',
							type: 'hidden',
							value: raw_gdl});
		    
		    var form = new html.tag('form', {
			id: 'galaxyform',
			name: 'galaxyform',
			method: 'POST',
			target: '_blank',
			action: galaxy
		    }, [input_su, input_um, input_url]);
		    
		    // Finally, bang out what we've constructed in
		    // a form.
		    new widget.dialog('Export to Galaxy: ' + form.to_string());
		}
	    };
	}
    };
    
    return galaxy_button;
};

/*
 * Method: open_facet_matrix
 * 
 * Generate the template for a button that sends the user to the
 * facet_matrix page with the current manager state and two facets.
 * 
 * TODO: The facet_matrix link should be handled by the linker, not
 * manually using the app_base info.
 * 
 * Arguments:
 *  gconf - a copy of the <golr_conf> for the currrent setup
 *  instance_data - a copy of an amigo.data.server() for app_base info
 * 
 * Returns:
 *  hash form of jQuery button template for consumption by <search_pane>.
 */
generators.button_templates.open_facet_matrix = function(gconf, instance_data){

    var facet_matrix_button = {
	label: 'Use a matrix to compare document counts for two facets (limit 50 on each axis).',
	diabled_p: false,
	text_p: false,
	//icon: 'ui-icon-caret-2-e-w',
	icon: 'ui-icon-calculator',
	click_function_generator: function(manager){
	    return function(event){
		
		// 
		var pers = manager.get_personality();
		var class_conf = gconf.get_class(pers);
		if( class_conf ){
		    
		    var filter_list = class_conf.field_order_by_weight('filter');
		    
		    // Get a list of all the facets that we can
		    // compare.
		    var facet_list_1 = [];
		    us.each(filter_list, function(filter_id, findex){
			var cf = class_conf.get_field(filter_id);
			var cname = cf.display_name();
			var cid = cf.id();
			var pset = [cname, cid];
			
			// Make sure the first one is
			// checked.
			if( findex === 0 ){ pset.push(true); }
			
			facet_list_1.push(pset);
		    });
		    // We need two though.
		    var facet_list_2 = bbop.clone(facet_list_1);
		    
		    // Stub sender.
		    var lss_args = {
			title: 'Select facets to compare',
			blurb: 'This dialog will launch you into a tool in another window where you can examine the document counts for two selected facets in a matrix (grid) view.',
			list_of_lists: [facet_list_1, facet_list_2],
			title_list: ['Facet 1', 'Facet 2'],
			action: function(selected_args){
			    var f1 = selected_args[0] || '';
			    var f2 = selected_args[1] || '';
			    var jmp_state = manager.get_state_url();
			    var mngr = encodeURIComponent(jmp_state);
			    var jump_url = instance_data.app_base() +
				    '/facet_matrix?'+
				    [
					'facet1=' + f1,
					'facet2=' + f2,
					'manager=' + mngr
				    ].join('&');
			    window.open(jump_url, '_blank');
			}};
		    new widget.list_select_shield(lss_args);
		}
	    };
	}
    };
    return facet_matrix_button;
};

/*
 * Method: flexible_download
 * 
 * Generate the template for a button that gives the user a DnD and
 * reorderable selector for how they want their tab-delimited
 * downloads.
 * 
 * Arguments:
 *  label - the text to use for the hover
 *  count - the number of items to be downloadable
 *  start_fields - ordered list of the initially selected fields 
 *  personality - the personality (id) that we want to work with
 *  gconf - a copy of the <golr_conf> for the currrent setup
 * 
 * Returns:
 *  hash form of jQuery button template for consumption by <search_pane>.
 */
generators.button_templates.flexible_download = function(label, count,
							 start_fields,
							 personality,
							 gconf){
    
    var dl_props = {
	'entity_list': null,
	'rows': count
    };

    // Aliases.
    var hashify = bbop.hashify;

    var flexible_download_button = {
	label: label,
	diabled_p: false,
	text_p: false,
	icon: 'ui-icon-circle-arrow-s',
	click_function_generator: function(manager){
	    
	    return function(event){
		
		var class_conf = gconf.get_class(personality);
		if( class_conf ){
		    
		    // First, a hash of our default items so we
		    // can check against them later to remove
		    // those items from the selectable pool.
		    // Then convert the list into a more
		    // interesting data type.
		    var start_hash = hashify(start_fields);
		    var start_list = [];
		    us.each(start_fields, function(field_id, field_index){
			var cf = class_conf.get_field(field_id);
			var cname = cf.display_name();
			var cid = cf.id();
			var pset = [cname, cid];
			start_list.push(pset);
		    });
		    
		    // Then get an ordered list of all the
		    // different values we want to show in
		    // the pool list.
		    var pool_list = [];
		    var all_fields = class_conf.get_fields();
		    us.each(all_fields, function(field, field_index){
			var field_id = field.id();
			if( start_hash[field_id] ){
			    // Skip if already in start list.
			}else{
			    var cname = field.display_name();
			    var cid = field.id();
			    var pset = [cname, cid];
			    pool_list.push(pset);
			}
		    });
		    
		    // To alphabetical.
		    pool_list.sort(function(a, b){
			var av = a[0];
			var bv = b[0];
			var val = 0;
			if( av < bv ){
			    return -1;
			}else if( av > bv){
			    return 1;
			}
			return val;
		    });
		    
		    // Stub sender.
		    var dss_args = {
			title: 'Select the fields to download (up to ' + count + ')',
			blurb: '<p><strong>Drag and drop</strong> the desired fields <strong>from the left</strong> column (available pool) <strong>to the right</strong> (selected fields). You may also reorder them.</p><p>Download up to ' + count + ' lines in a new window by clicking <strong>Download</strong>. If your request is large or if the the server busy, this may take a while to complete--please be patient.</p>',
			//blurb: 'By clicking "Download" at the bottom, you may download up to ' + count + ' lines in your browser in a new window. If your request is large or if the the server busy, this may take a while to complete--please be patient.',
			pool_list: pool_list,
			selected_list: start_list,
			action_label: 'Download',
			action: function(selected_items){
			    dl_props['entity_list'] =
			    	manager.get_selected_items();
			    var raw_gdl =manager.get_download_url(selected_items,
			    					  dl_props);
			    window.open(raw_gdl, '_blank');
			}};
		    new widget.drop_select_shield(dss_args);
		}
	    };
	}
    };
    return flexible_download_button;
};

/*
 * Method: flexible_download
 * 
 * Generate the template for a button that gives the user a DnD and
 * reorderable selector for how they want their tab-delimited
 * downloads.
 * 
 * Arguments:
 *  label - the text to use for the hover
 *  count - the number of items to be downloadable
 *  start_fields - ordered list of the initially selected fields 
 *  personality - the personality (id) that we want to work with
 *  gconf - a copy of the <golr_conf> for the currrent setup
 * 
 * Returns:
 *  hash form of jQuery button template for consumption by other widgets
 */
generators.button_templates.flexible_download_b3 = function( label, count,
							     start_fields,
							     personality, gconf){

    var dl_props = {
	'entity_list': null,
	'rows': count
    };

    // Aliases.
    var hashify = bbop.hashify;
    
    var flexible_download_button = {
	label: label,
	diabled_p: false,
	click_function_generator: function(results_table, manager){
	    
	    return function(event){
		
		var class_conf = gconf.get_class(personality);
		if( class_conf ){
		    
		    // First, a hash of our default items so we
		    // can check against them later to remove
		    // those items from the selectable pool.
		    // Then convert the list into a more
		    // interesting data type.
		    var start_hash = hashify(start_fields);
		    var start_list = [];
		    us.each(start_fields, function(field_id, field_index){
			var cf = class_conf.get_field(field_id);
			var cname = cf.display_name();
			var cid = cf.id();
			var pset = [cname, cid];
			start_list.push(pset);
		    });
		    
		    // Then get an ordered list of all the
		    // different values we want to show in
		    // the pool list.
		    var pool_list = [];
		    var all_fields = class_conf.get_fields();
		    us.each(all_fields, function(field, field_index){
			var field_id = field.id();
			if( start_hash[field_id] ){
			    // Skip if already in start list.
			}else{
			    var cname = field.display_name();
			    var cid = field.id();
			    var pset = [cname, cid];
			    pool_list.push(pset);
			}
		    });
		    
		    // To alphabetical.
		    pool_list.sort(function(a, b){
			var av = a[0];
			var bv = b[0];
			var val = 0;
			if( av < bv ){
			    return -1;
			}else if( av > bv){
			    return 1;
			}
			return val;
		    });
		    
		    // Stub sender.
		    var dss_args = {
			title: 'Select the fields to download (up to ' + count + ')',
			blurb: '<p><strong>Drag and drop</strong> the desired fields <strong>from the left</strong> column (available pool) <strong>to the right</strong> (selected fields). You may also reorder them.</p><p>Download up to ' + count + ' lines in a new window by clicking <strong>Download</strong>. If your request is large or if the the server busy, this may take a while to complete--please be patient.</p>',
			//blurb: 'By clicking "Download" at the bottom, you may download up to ' + count + ' lines in your browser in a new window. If your request is large or if the the server busy, this may take a while to complete--please be patient.',
			pool_list: pool_list,
			selected_list: start_list,
			action_label: 'Download',
			action: function(selected_items){
			    // Get selected items from results
			    // checkboxes.
			    dl_props['entity_list'] = null;
			    if( ! us.isEmpty(results_table) ){
			    	dl_props['entity_list'] =
   				    results_table.get_selected_items();
			    }
			    // Download for the selected fields...
			    var raw_gdl =manager.get_download_url(selected_items,
			    					  dl_props);
			    // ...opening it in a new window.
			    window.open(raw_gdl, '_blank');
			}};
		    new widget.drop_select_shield(dss_args);
		}
	    };
	}
    };
    return flexible_download_button;
};

///
/// Exportable body.
///

module.exports = generators;
