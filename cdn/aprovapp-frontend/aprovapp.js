	
var options = { 
	  target: '#content',   // target element(s) to be updated with server response 
	  beforeSubmit: function() {
	  	blockContent(); 
	  },
	  error: function (request, status, error) {
	  	$('#content').html(request.responseText);
	  },
	  success: function(data, text, xhr) {
	  	changeCheckbox();
	  	flashes();
	  	attachAjaxCallsEvents();
	  	attachTableRowsEvents();
	  	attachRemoveButtonEvents();
	  	attachAjaxForm();
	  	applyPlupload();
	  	Holder.run();
	  	setupFieldList();
	  	$('.datetimepicker').datetimepicker({
			format: 'dd/mm/yyyy hh:ii',
	  		startView: 4,
	  		autoclose: true,
	  		language: 'br',
	  		showMeridian: true
	  	});
	  },
	  clearForm: true,        // clear all form fields after successful submit 
	  resetForm: true        // reset the form after successful submit 
	  // $.ajax options can be used here too, for example: 
	  //timeout:   3000 
	}; 

	function flashes() {
		var alerts = $('.alert').not('.shown')
		alerts.prependTo("#right-navbar");
		alerts.delay(2600).fadeOut('slow', function() {
			$(this).remove();
		});
		alerts.addClass('.shown');
	}


	function deleteRows(rows, base_delete_url) {

		itens_num = rows.length;

		if(itens_num>0) {

			iten_text = (itens_num > 1) ? itens_num + ' items' : itens_num + ' item';

			setModal('Confirmação','Realmente deseja remover ' + iten_text, function() {

				console.log(rows);

				blockContent();

				var askingToDeleteRows = $.Deferred();
				var deletingRows

			// for each row, do
			rows.each(function(i,row){

				row = $(row);

				console.log(row.prop('value'));

				var delete_url = base_delete_url + row.prop('value');

				console.log(delete_url);

				if(deletingRows) {
					promise = deletingRows  
				} else {
					promise = askingToDeleteRows
				}

				deletingRows = promise.pipe(function() {
					return $.ajax({
						url: delete_url,
						complete: function(data) {
							$('#right-navbar').append(data.responseText);
							flashes();
						},
					});

				});

			});

			deletingRows.always(function() {
				setAjaxCall($('#aprovapp-refresh').data('refresh'), false);
				unblockContent();
			});

			askingToDeleteRows.resolve();

		});
		}

	};

	function setAjaxCall(call_url, block_ui) {

		console.log(call_url);

		return $.ajax({
			url: call_url,
			success: function(data, text, xhr) {
				var content_area = $('#content');
				content_area.html(data);
			},
			error: function (request, status, error) {
				//alert(request.responseText);
				$('#content').html(request.responseText);
			},
			beforeSend: function() {
				if(block_ui) { blockContent(); }
			},
			complete: function() {

				if(block_ui) { unblockContent(); }

				changeCheckbox();
				flashes();
				attachAjaxCallsEvents();
				attachTableRowsEvents();
				attachRemoveButtonEvents();
				attachAjaxForm();
				applyPlupload();
				Holder.run();
				setupFieldList();
				$('.datetimepicker').datetimepicker({
					format: 'dd/mm/yyyy hh:ii',
			  		startView: 4,
			  		autoclose: true,
			  		language: 'br',
			  		showMeridian: true
			  	});
			},
			statusCode: {
				404: function() {
					alert("page not found");
				}
			}
		});

	}


	function attachAjaxForm() {
		$('#test').ajaxForm(options);
	};

	function attachAjaxCallsEvents() {

		var ajax_call_links = $('.ajax_call').not('.events_attached')

		ajax_call_links.on('click', function() {
			setAjaxCall($(this).prop('href'), true);
			return false;
		});

		ajax_call_links.addClass('events_attached');

	};


	function attachTableRowsEvents() {

		var table_header_chkbox = $('thead tr .aprovapp-checkbox').not('.events_attached');	
		var table_rows = $('tbody tr').not('.events_attached');

		table_header_chkbox.on('click', function() {
			table_rows.each(function(i,row){
				$(row).trigger('click');
			});
		});

		table_rows.on('click', function(e) {
			r = $(this)
			r.toggleClass('info');
			var chkbox = $(this).find('input:checkbox');
			var btn = $(this).find('button');
			if(r.hasClass('info')) {
				setCheckBox(btn, chkbox);
			} else {
				unsetCheckBox(btn, chkbox);
			}
		});

		table_rows.addClass('events_attached');
		table_header_chkbox.addClass('events_attached');

	};


	function attachRemoveButtonEvents() {

		var remove_button = $('#remove').not('.events_attached');

		remove_button.on('click', function() {
			deleteRows($('input:checkbox:checked'), $(this).prop('href'));
			remove_button.addClass('events_attached');
			return false;
		});

	};


// **********************************************
//
//	applyPlupload()
//
//	Replace File Inputs by Plupload widgets
//	Author: Gustavo Goncalves
//
// **********************************************

var setupPlupload = function(field, browse_button, progress_bar, bar, preview_image, a_thumb, thumb, field_name, model_id) {

	var uploader = new plupload.Uploader({
		runtimes : 'gears,html5,flash,silverlight',
		browse_button : browse_button.prop('id'),
		max_file_size : '5mb',
		multi_selection: false,
		file_data_name: field_name,
		url : '/' + model_id + '/upload/',
		flash_swf_url : '/static/js/plupload/js/plupload.flash.swf',
		silverlight_xap_url : '/static/js/plupload/js/plupload.silverlight.xap',
		filters : [
			{title : "Image files", extensions : "jpg,gif,png"},
		]
	});

	//uploader.bind('Init', function(up, params) {
	//	$('#filelist').html("<div>Current runtime: " + params.runtime + "</div>");
	//});

	//browse_button.on('click', function(e) {
	//	uploader.start();
	//	e.preventDefault();
	//});

	uploader.init();

	uploader.bind('FilesAdded', function(up, files) {

		//if (uploader.files.length == 2) {
		//	console.log(uploader.files[0]);
		//	uploader.removeFile(uploader.files[0]);
		//} 

		//$.each(files, function(i, file) {
		//	$('#filelist').html(
		//		'<div id="' + file.id + '">' +
		//		file.name + ' (' + plupload.formatSize(file.size) + ') <b></b>' +
		//		'</div>');
		//});

        //up.refresh(); // Reposition Flash/Silverlight

        browse_button.hide();
        progress_bar.show();

        bar.css('width','0%');

        up.start();

    });

	uploader.bind('UploadProgress', function(up, file) {
		console.log(bar);
		console.log(file.percent);
		bar.css('width', file.percent + "%");
	});

	uploader.bind('Error', function(up, err) {
		$('#filelist').append("<div>Error: " + err.code +
			", Message: " + err.message +
			(err.file ? ", File: " + err.file.name : "") +
			"</div>"
			);

          up.refresh(); // Reposition Flash/Silverlight
      });

	uploader.bind('FileUploaded', function(up, file, response) {
		
		bar.css('width','100%');
		
		browse_button.show()
        progress_bar.hide()

		var json = jQuery.parseJSON(response.response); 
		file.uuid = json.uuid;

		console.log(field);
		field.val(json.uuid);

		preview_image.prop('src',json.thumb_url);
		
		a_thumb.prop('href',json.preview_url);
		a_thumb.attr('data-gallery','gallery');

		thumb.show();
	});

}



// **********************************************
//
//	applyPlupload()
//
//	Replace File Inputs by Plupload widgets
//	Author: Gustavo Goncalves
//
// **********************************************

function applyPlupload() {

	var plupload = function(el) {

		el.hide();

		frm = el.closest("form");
		frm.prop('enctype','application/x-www-form-urlencoded');
		model_id = frm.data('model');

		var id = el.prop('id');

		hidden_input = $('#' + id + '-plupload-aux');
		if (hidden_input.length == 0) {
			hidden_input = $(document.createElement('input'));
			hidden_input.hide();
			hidden_input.prop('id', id + '-plupload-aux');
			hidden_input.prop('name', id + '-plupload-aux');
			hidden_input.prop('type', 'text');
			el.after(hidden_input);
		}

		select_file_btn = $(document.createElement('button'));
		select_file_btn.prop('id', id + "-image-button");
		select_file_btn.addClass("btn");
		select_file_btn.addClass("plupload-image-button");
		select_file_btn.text('Escolher imagem');

		progress_bar = $(document.createElement('div'));
		progress_bar.prop('id',id + "-progress-bar");
		progress_bar.addClass('progress');
		progress_bar.addClass('progress-info');
		progress_bar.addClass('progress-stripped');
		progress_bar.hide()

		bar = $(document.createElement('div'));
		bar.addClass('bar');
		bar.prop('style', 'width: 0%');

		progress_bar.append(bar);
		el.after(select_file_btn);
		select_file_btn.after(progress_bar);

		if (el.attr('value') == undefined) {
			thumb = $(document.createElement('ul'));
			thumb.addClass('thumbnails');
			thumb.addClass('aprovapp-form-thumb');
			
			li_thumb = $(document.createElement('li'));
			li_thumb.prop('id','gallery');
			li_thumb.attr('data-toggle','modal-gallery');
			li_thumb.attr('data-target','#modal-gallery');

			a_thumb = $(document.createElement('a'));
			a_thumb.addClass('thumbnail');

			preview_image = $(document.createElement('img'));
			preview_image.prop('alt','Preview Image');
			preview_image.attr('data-src','holder.js/64x64');

			thumb.append(li_thumb);
			li_thumb.append(a_thumb);
			a_thumb.append(preview_image);

			progress_bar.after(thumb);
		}
		else {
			thumb = $('ul.aprovapp-form-thumb');
			a_thumb = $('a.thumbnail');
			preview_image = $('a.thumbnail>img');
		}

		setupPlupload(hidden_input, select_file_btn, progress_bar, bar, preview_image, a_thumb, thumb, id, model_id);
	}

	$('.single_upload_widget').each(function() {
		plupload($(this));
	});
}




// ************************************
//
//	blockContent()
//	unblockContent()
//
//	Block and Unblock Content DIV
//	Author: Gustavo Goncalves
//
// ************************************

function blockContent() {
	
	container = $('#content');
	
	container.block({
		overlayCSS: { backgroundColor: '#FFF', opacity:0.85 },
		message: null
	});
	
	container.spin({
		lines: 13, // The number of lines to draw
		length: 0, // The length of each line
		width: 4, // The line thickness
		radius: 12, // The radius of the inner circle
		corners: 1, // Corner roundness (0..1)
		rotate: 52, // The rotation offset
		direction: 1, // 1: clockwise, -1: counterclockwise
		color: '#000', // #rgb or #rrggbb
		speed: 0.6, // Rounds per second
		trail: 25, // Afterglow percentage
		shadow: false, // Whether to render a shadow
		hwaccel: false, // Whether to use hardware acceleration
		className: 'spinner', // The CSS class to assign to the spinner
		zIndex: 2e9, // The z-index (defaults to 2000000000)
		top: 'auto', // Top position relative to parent in px
		left: 'auto' // Left position relative to parent in px
	});
};


function unblockContent() {
	container = $('#main-area');
	container.spin(false);
	container.unblock();
};


// ************************************
//
//	changeCheckbox()
//
//	Replace a checkbox for a nice button
//	Author: Gustavo Goncalves
//
// ************************************

function setCheckBox(btn, chk_box) {
	check_class = 'btn-primary';
	if(btn.hasClass(check_class)) {
		chk_box.prop('checked', true);
	} else {
		btn.addClass(check_class);
		chk_box.prop('checked', true);
	}
}

function unsetCheckBox(btn, chk_box) {
	check_class = 'btn-primary';
	if(btn.hasClass(check_class)) {
		btn.removeClass(check_class);
		chk_box.prop('checked', false);
	} else {
		chk_box.prop('checked', false);
	}
}

function changeCheckbox() {
	$('input:checkbox').each(function() {
		chk_box = $(this);
		if(chk_box.is(':visible')) {
			$(this).hide();
			var btn = $(document.createElement('button'))
			btn.prop('type', "button");
			btn.addClass("btn");
			btn.addClass("aprovapp-checkbox");
			btn.attr('style', 'padding:6px');
			btn.append($(document.createElement('i')));
			$(this).after(btn);

			check_class = 'btn-primary';

			if(chk_box.prop('checked')) {
				btn.addClass(check_class);
			}

			btn.on('click', function() {
				
				if(btn.hasClass(check_class)) {
					btn.removeClass(check_class);
					chk_box.prop('checked', false);
				} else {
					btn.addClass(check_class);
					chk_box.prop('checked', true);
				}
			});
		}
	});
};


// ************************************
//
//	setModal(label, text, confirm_handler)
//
//	Create a Modal with 'confirm' event
//	Author: Gustavo Goncalves
//
// ************************************

function setModal(label, text, confirm_handler) {

	modal = $('#aprovapp-modal');
	$('#aprovapp-modal-label').html(label);
	$('#aprovapp-modal .modal-body').html(text);
	
	attach_event = modal.data('attach-events');

	modal.off('confirm');
	modal.on('confirm', confirm_handler);

	if(!attach_event) {

		$('#aprovapp-modal .confirm').not('events-attached').on('click', function() {
			modal.modal('hide');
			modal.trigger('confirm');
			$(this).addClass('events-attached');
		});

		modal.data('attach-events', true);
	}

	modal.modal();

};


// ************************************
//
//	Document Ready Event
//
//	Main code loader
//	Author: Gustavo Goncalves
//
// ************************************

$(document).ready(function() { 

	attachAjaxForm();
	attachAjaxCallsEvents();
	attachTableRowsEvents();
	attachRemoveButtonEvents();

});






function getEntriesLen(widget) {
	entries = widget.find('li:visible');
	return entries_len = entries.length;
}

function getLast(widget) {
	return widget.find('li:last');
}


function setFiledListEnvironment(widget) {

	last = getLast(widget);
	template = widget.find('li:hidden').clone(false);
	entries_len = getEntriesLen(widget);

	add_btn = $(document.createElement('button'));
	//add_btn.prop('id', 'field_list_add');
	add_btn.addClass("btn");
	add_btn.text('Add');
	add_btn.on('click', {template:template, widget:widget}, function(e) {
		last = getLast(e.data.widget)
		entries_len = getEntriesLen(e.data.widget)
		new_last = setTemplate(e.data.template, entries_len)
		last.after(new_last);
		new_last.show();
		return false;
	});
	widget.before(add_btn);

	rmv_btn = $(document.createElement('button'));
	//rmv_btn.prop('id', 'field_list_add');
	rmv_btn.addClass("btn");
	rmv_btn.text('Remove');
	rmv_btn.on('click', {widget:widget}, function(e) {
		last = getLast(e.data.widget)
		entries_len = getEntriesLen(e.data.widget)
		if(entries_len > 1) {
			last.remove();
		}
		return false;
	});
	add_btn.after(rmv_btn);

}


// ************************************
//
//	Add Remove FieldList
//
//	Main code loader
//	Author: Gustavo Goncalves
//
// ************************************

function setupFieldList() {

	widgets = $('.field_list_widget').each(function() {
		
		widget = $(this);
	
		setFiledListEnvironment(widget);

	});

	
}


function setTemplate(template, number) {

	tmpl = template.clone(false);

	main_label = tmpl.find('label:first');
	main_label_for = main_label.prop('for');
	main_label_for = main_label_for.replace('-X','-' + number);
	main_label.prop('for', main_label_for);

	main_label_text = main_label.text();
	main_label_text = main_label_text.replace('-X','-' + number);
	main_label.text(main_label_text);

	main_table = tmpl.find('table:first');
	main_table_id = main_table.prop('id');
	main_table_id = main_table_id.replace('-X','-' + number);
	main_table.prop('id', main_table_id);

	main_table.find('label').each(function(){
		l = $(this);
		l_for = l.prop('for');
		l_for = l_for.replace('-X','-' + number);
		l.prop('for',l_for);
	});

	change_id_and_name = function() {
		i = $(this);
		i_id = i.prop('id');
		i_id = i_id.replace('-X','-' + number);
		i.prop('id', i_id);
		i_name = i.prop('name');
		i_name = i_name.replace('-X','-' + number);
		i.prop('name', i_name);
		i.val('');
	}

	main_table.find('input').each(change_id_and_name);
	main_table.find('select').each(change_id_and_name);
	main_table.find('textarea').each(change_id_and_name);

	return tmpl
}




