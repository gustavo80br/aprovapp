# -*- coding: utf-8 -*-

import os

from math import ceil

from werkzeug import secure_filename

from flask import Blueprint, render_template, make_response, request, flash, redirect , url_for, abort, jsonify

from flask_security.decorators import login_required
from sqlalchemy import inspect
from wtforms.fields import BooleanField

from aprovapp import db
from aprovapp import app

from aprovapp.crud.models import UploadedImageFile
from aprovapp.crud.config import crud_config


def get_model_and_form(cfg, polymorphic=None):
	
	if polymorphic:
		try:
			model = cfg['model_by_type'][polymorphic]
			form = cfg['form_by_type'][polymorphic]
		except:
			raise "WRONG POLYMORPHIC"
	else:
		model = cfg['model']
		if 'form' in cfg:
			form = cfg ['form']
		else:
			form = None

	return model, form


@app.route("/<model_id>/include/", methods=['GET', 'POST'])
@app.route("/<model_id>/include/<polymorphic>", methods=['GET', 'POST'])
@app.route("/<model_id>/edit/<id>/", methods=['GET', 'POST'])
@app.route("/<model_id>/edit/<id>/<polymorphic>", methods=['GET', 'POST'])
@login_required
def crud_include(model_id, id=None, polymorphic=None):

	cfg = crud_config[model_id]

	model, form = get_model_and_form(cfg, polymorphic)
	
	flag_edit = False
	error_flag = False

	model_instance = None

	if id:
		flag_edit = True
		model_instance = model.query.get(id)
		
		if not form and model_instance:
			form = cfg['form_by_type'][model_instance.type]

		if request.method == 'POST':
			form_instance = form(request.form, model_instance)
		
		elif request.method == 'GET':
			form_instance = form(obj=model_instance)
	
	else:
		form_instance = form(request.form)

	form_instance.pre_process_content()

	if request.method == 'POST':
		
		if form_instance.validate():
			
			if not flag_edit:
				model_instance = model()

			form_instance.populate_obj(model_instance)

			# CHECK FIELD LIST
			for field in form_instance:
			
				sub_elements = []

				field_type = type(field).__name__ 
				if field_type == 'FieldList':

					u_field = field.unbound_field
					u_field_type = u_field.field_class.__name__

					if u_field_type == 'FormField':

						for e in field.entries:
							
							if e.object_data:
								e.form.populate_obj(e.object_data)
								sub_elements.append(e.object_data)
							else:
								source_class = e.form.__source_class__
								sub_element = source_class()
								e.form.populate_obj(sub_element)
								sub_elements.append(sub_element)
								db.session.add(sub_element)
								
					setattr(model_instance, field.name, sub_elements)
			
			# CHECK PLUPLOAD
			for key in request.form:
				val = request.form[key]
				if '-plupload-aux' in key and len(val)>0:
					field_id = key.strip('-plupload-aux')
					uploads = UploadedImageFile.query.filter_by(uuid=val)
					if uploads.count() > 0:
						upload = uploads[0]
						setattr(model_instance, field_id, upload)
						upload.store()

			if not flag_edit:
				db.session.add(model_instance)

			db.session.commit()

			if not flag_edit:
				flash('Successfully added','success')
				form_instance = form()
			else:
				flash('Successfully edited','success')
			
			status_code = 200
			
		else:

			plupload_flag = False

			for key in request.form:
				val = request.form[key]
				if '-plupload-aux' in key and len(val)>0:
					field_id = key.strip('-plupload-aux')
					uploads = UploadedImageFile.query.filter_by(uuid=val)
					if uploads.count() > 0:
						upload = uploads[0]
						field = getattr(form_instance, field_id)
						field.data = upload
						plupload_flag = True

			if not plupload_flag and model_instance:
				for field in form_instance:
					if type(field).__name__ == 'UploadImageField':
						field.data = getattr(model_instance, field.id)

			flash("Form fillment errors, please check", 'error')
			status_code = 400
			error_flag = True

	else: 

		status_code = 200


	return render_template("crud/include.html", 
		title = cfg['title'],
		model_id = model_id,
		instance_id = id,
		polymorphic = polymorphic,
		form = form_instance,
	), status_code


@app.route("/<model_id>/list/", methods=['GET'])
@app.route("/<model_id>/list/page/<int:page_size>/<int:page>/order-by/<order>/<order_direction>/", methods=['GET'])
@app.route("/<model_id>/list/order-by/<order>/<order_direction>/", methods=['GET'])
@app.route("/<model_id>/list/page/<int:page_size>/<int:page>/", methods=['GET'])
@login_required
def crud_list(model_id, order=None, order_direction=None, page_size=None, page=None):
	
	cfg = crud_config[model_id]
	model = cfg['model']

	if not 'headers' in cfg:
		form = cfg['form']
		headers = []
		for field in form():
			if not field.type == 'FieldList':
				headers.append({
					'field' : field.name,
					'label' : field.label,
				})
		cfg['headers'] = headers

	rows = model.query
	rows_count = rows.count()

	total_pages = None
	in_page = None
	pagination_flag = False

	direction = " "
	if order_direction:
		if order_direction in ('desc, asc'):
			direction = order + " " + order_direction
			rows = rows.order_by(direction)

	offset_num = 0
	if page and page_size:
		offset_num = (page - 1) * page_size
		rows = rows.limit(page_size).offset(offset_num)
		total_pages = int(ceil(float(rows_count) / float(page_size)))
		in_page = rows.count()
		pagination_flag = True

	data = []
	for r in rows:
		lst = [r.id]
		for th in cfg['headers']:
			if(hasattr(r,th['field'])):
				lst.append(getattr(r,th['field']))
		data.append(lst)
	
	if 'include_by_type' in cfg:
		include_by_type = [(url_for('crud_include',
							model_id=model_id,
							polymorphic= type_
							),
						  cfg['include_by_type'][type_]) for type_ in cfg['include_by_type']
						  ]
	else:
		include_by_type = []

	return render_template("crud/list.html",
		title = cfg['title'],
		getattr = getattr,
		model_id = model_id,
		results = rows.all(),
		data = data,
		total = rows_count,
		pages = total_pages,
		page = page,
		in_page = in_page,
		link_template = "/exams/list/page/%(page_size)s/%(page)s",
		order_template = "/order-by/%(field)s/%(direction)s/",
		page_size = page_size,
		pagination_enabled = pagination_flag,
		headers = cfg['headers'],
		url = url_for('crud_list', model_id=model_id, order=order, order_direction=order_direction, page_size=page_size, page=page),
		json_params = {
			'order-by': order,
			'order-direction': order_direction,
			'page-size': page_size,
			'page-num': page,
			'pages-total':total_pages,
		},
		include_by_type = include_by_type
	)


@app.route('/<model_id>/delete/', methods=['GET'])
@app.route('/<model_id>/delete/<id>/', methods=['GET'])
@login_required
def crud_delete(model_id, id=None):

	dependents_flag = False

	cfg = crud_config[model_id]
	model = cfg['model']

	model_instance = model.query.get(id)

	if model_instance:

		i = inspect(model)
		for relation in i.relationships:
			if relation.direction.name == 'ONETOMANY':
				dependents = getattr(model_instance, relation.key).count()
				if dependents > 0:
					flash('%s cannot delete, %s dependencies, remove dependencies first' % (model_instance,dependents), 'error')
					dependents_flag = True
					status_code = 412

		if not dependents_flag:
			db.session.delete(model_instance)
			db.session.commit()
			flash('%s successfully deleted' % model_instance, 'success')
			status_code = 200

	else:

		return abort(404)

	return render_template('crud/flash_messages.html'), status_code



def allowed_file(filename):
    extension = str(os.path.splitext(filename)[1]).lower().strip('.')
    return bool(extension in app.config['ALLOWED_EXTENSIONS'])

@app.route('/<model_id>/upload/', methods=['POST'])
@login_required
def crud_upload(model_id):

	for key,f in request.files.iteritems():

		form = crud_config[model_id]['form']()
		upload_field = getattr(form, key)

		handle_class = upload_field.handle_class

		if f and allowed_file(f.filename):
			
			filename = secure_filename(f.filename)
			upload = handle_class(filename, f)
			unique_id = upload.uuid
		
			upload.save()

			db.session.add(upload)
			db.session.commit()

			json_return = {
				'status':200,
				'filename':filename,
				'uuid':unique_id,
				'thumb_url': upload.thumbnail_url(),
				'preview_url':upload.file_url(),
			}

	return jsonify(json_return)
