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
from aprovapp.exams.models import ExaminingBoard, Promoter, ExamJobRole, KnowledgeArea, Discipline, Subject
from aprovapp.exams.forms import ExaminingBoardForm, PromoterForm, ExamJobRoleForm, KnowledgeAreaForm, DisciplineForm, SubjectForm

from aprovapp.exams.models import UploadedImageFile

mod = Blueprint('exams', __name__, url_prefix='/exams')


crud_config = {
	'examining-boards': {
		'model': ExaminingBoard,
		'form': ExaminingBoardForm,
		'title': "Banca Examinadora",
		'headers': (
			{'field':'name','label':'Nome', 'order-by':True, 'order-direction': 'asc'},
			{'field':'short_name','label':'Abreviacao'},
			{'field':'description','label':'Descritivo'},
		),
		'form_template': 'exams/examining_board_form.html',
	},
	'promoters': {
		'model': Promoter,
		'form': PromoterForm,
		'title': "Entidade Promotora",
		'headers': (
			{'field':'name','label':'Nome', 'order-by':True, 'order-direction': 'asc'},
			{'field':'short_name','label':'Abreviacao'},
			{'field':'description','label':'Descritivo'},
		),
	},
	'job-roles': {
		'model': ExamJobRole,
		'form': ExamJobRoleForm,
		'title': "Cargo Concorrido",
		'headers': (
			{'field':'role','label':'Cargo', 'order-by':True, 'order-direction': 'asc'},
		),
	},
	'knowledge-areas': {
		'model': KnowledgeArea,
		'form': KnowledgeAreaForm,
		'title': "Area de Conhecimento",
	},
	'disciplines': {
		'model': Discipline,
		'form': DisciplineForm,
		'title': "Disciplina",
	},
	'subjects': {
		'model': Subject,
		'form': SubjectForm,
		'title': "Assunto",
	},
}


@mod.route("/<model_id>/include/", methods=['GET', 'POST'])
@mod.route("/<model_id>/edit/<id>/", methods=['GET', 'POST'])
@login_required
def include(model_id, id=None):

	print 'CARAHO'

	cfg = crud_config[model_id]
	model = cfg['model']
	form = cfg ['form']
	flag_edit = False
	error_flag = False

	model_instance = None

	if id:
		flag_edit = True
		model_instance = model.query.get(id)
		if request.method == 'POST':
			form_instance = form(request.form, model_instance)
		elif request.method == 'GET':
			form_instance = form(obj=model_instance)
	else:
		form_instance = form(request.form)

	if request.method == 'POST':
		
		if form_instance.validate():
			
			if not flag_edit:
				model_instance = model()
			
			form_instance.populate_obj(model_instance)
			
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
				flash('Successfully added new Examining Board','success')
				form_instance = form()
			else:
				flash('Successfully edited Examining Board','success')
			
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
			error_flag = True

	print cfg
	if 'form_template' in cfg:
		print 'CHUTE'
		frm_tpl = cfg['form_template']
	else:
		print 'LALALA'
		frm_tpl = None

	return render_template("exams/include.html", 
		title = cfg['title'],
		model_id = model_id,
		instance_id = id,
		form = form_instance,
		form_template = frm_tpl
	)


@mod.route("/<model_id>/list/", methods=['GET'])
@mod.route("/<model_id>/list/page/<int:page_size>/<int:page>/order-by/<order>/<order_direction>/", methods=['GET'])
@mod.route("/<model_id>/list/order-by/<order>/<order_direction>/", methods=['GET'])
@mod.route("/<model_id>/list/page/<int:page_size>/<int:page>/", methods=['GET'])
@login_required
def lst(model_id, order=None, order_direction=None, page_size=None, page=None):
	
	cfg = crud_config[model_id]
	model = cfg['model']

	if not 'headers' in cfg:
		form = cfg['form']
		headers = []
		for field in form():
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
			lst.append(getattr(r,th['field']))
		data.append(lst)
	
	return render_template("exams/list.html",
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
		url = url_for('exams.lst', model_id=model_id, order=order, order_direction=order_direction, page_size=page_size, page=page),
		json_params = {
			'order-by': order,
			'order-direction': order_direction,
			'page-size': page_size,
			'page-num': page,
			'pages-total':total_pages,
		})


@mod.route('/<model_id>/delete/', methods=['GET'])
@mod.route('/<model_id>/delete/<id>/', methods=['GET'])
@login_required
def ddelete(model_id, id=None):

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

		if not dependents_flag:
			db.session.delete(model_instance)
			db.session.commit()
			flash('%s successfully deleted' % model_instance, 'success')

	else: 
		return abort(404)

	return render_template('forms/flash_messages.html')



def allowed_file(filename):
    extension = str(os.path.splitext(filename)[1]).lower().strip('.')
    return bool(extension in app.config['ALLOWED_EXTENSIONS'])


@mod.route('/upload_test/')
def upload_test():
	return render_template('tests/upload_test.html')


@mod.route('/upload/', methods=['POST'])
@login_required
def upload():

	for key,f in request.files.iteritems():

		if f and allowed_file(f.filename):
			
			filename = secure_filename(f.filename)
			upload = UploadedImageFile(filename)
			unique_id = upload.uuid

			f.save(upload.temp_filepath())

			upload.makeThumbnail()
			
			db.session.add(upload)
			db.session.commit()

			json_return = {
				'status':200,
				'filename':filename,
				'uuid':unique_id,
				'thumb_url': upload.temp_thumbnail_url(),
				'preview_url':upload.temp_file_url(),
			}

	return jsonify(json_return)
