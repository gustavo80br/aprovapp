# -*- coding: utf-8 -*-

import os

from uuid import uuid1
from datetime import datetime

from PIL import Image, ImageChops, ImageOps

from flask import url_for

from flask_security.core import current_user

from sqlalchemy.ext.declarative import declared_attr, ConcreteBase
from sqlalchemy.event import listen

from aprovapp import db, app
from aprovapp.users.models import User


class TimestampMixin(object):

	@declared_attr
	def created_on(self):
		return db.Column(db.DateTime)

	@declared_attr
	def created_by(self):
		return db.relation('User', primaryjoin="User.id==%s.creator_id" % self.__name__)
	
	@declared_attr
	def creator_id(self):
		return db.Column(db.Integer, db.ForeignKey('user.id'))

	@declared_attr
	def updated_on(self):
		return db.Column(db.DateTime)
	
	@declared_attr
	def	updated_by(self):
		return db.relation('User', primaryjoin="User.id==%s.updater_id" % self.__name__)
	
	@declared_attr
	def updater_id(self):
		return db.Column(db.Integer, db.ForeignKey('user.id'))

	@staticmethod
	def _before_insert(mapper, connection, instance):
		instance.created_on = datetime.now()
		instance.creator_id = current_user.id
		instance.before_insert(mapper, connection, instance)
		instance.before_update_or_insert(mapper, connection, instance)

	@staticmethod
	def _before_update(mapper, connection, instance):
		instance.updated_on = datetime.now()
		instance.updater_id = current_user.id
		instance.before_update(mapper, connection, instance)
		instance.before_update_or_insert(mapper, connection, instance)

	@staticmethod
	def _before_delete(mapper, connection, instance):
		instance.before_delete(mapper, connection, instance)


	@staticmethod
	def before_update(mapper, connection, instance):
		pass

	@staticmethod
	def before_insert(mapper, connection, instance):
		pass

	@staticmethod
	def before_update_or_insert(mapper, connection, instance):
		pass

	@staticmethod
	def before_delete(mapper, connection, instance):
		pass

	@classmethod
	def __declare_last__(self):
		listen(self, 'before_insert', self._before_insert)
		listen(self, 'before_update', self._before_update)
		listen(self, 'before_delete', self._before_delete)





class UploadedFile(ConcreteBase, db.Model):

	__tablename__ = 'uploaded_file'

	id = db.Column(db.Integer, primary_key=True)
	uuid = db.Column(db.Unicode(255), nullable=False)
	original_filename = db.Column(db.Unicode(255))
	extension = db.Column(db.Unicode(255))
	temp = db.Column(db.Boolean, default=True)

	up_path = app.config['UPLOAD_FOLDER']
	temp_up_path = app.config['TEMP_UPLOAD_FOLDER']
	up_folder = 'uploads'
	temp_up_folder = 'tmp_uploads'

	def __init__(self, filename, file_obj):
		self.file = file_obj
		self.temp = True
		self.uuid = str(uuid1())
		self.original_filename = filename
		self.extension = self.extract_extension(filename)

	def filename(self):
		return '%s.%s' % (self.uuid, self.extension)

	def filepath(self):
		path = self.temp_up_path
		if not self.temp:
			path = self.up_path
		return os.path.join(path, self.filename())

	def file_url(self):
		folder = self.temp_up_folder
		if not self.temp:
			folder = self.up_folder
		return url_for('static', filename=os.path.join(folder, self.filename()))

	def thumbnail_url(self):
		return ''

	def store(self):
		temp_path = os.path.join(self.temp_up_path, self.filename())
		path =  os.path.join(self.up_path, self.filename())
		os.rename(temp_path, path)
		self.temp = False

	def save(self):
		self.file.save(self.filepath())

	def extract_extension(self, filename):
		return str(os.path.splitext(filename)[1]).lower().strip('.')

	@staticmethod
	def before_delete(mapper, connection, instance):
		try:
			os.remove(instance.filepath())
		except:
			pass


class UploadedImageFile(UploadedFile):
	
	__tablename__ = 'uploaded_image_file'
	__mapper_args__ = {
				'polymorphic_identity':'uploaded_image_file',
				'concrete':True}

	id = db.Column(db.Integer, primary_key=True)
	uuid = db.Column(db.Unicode(255), nullable=False)
	original_filename = db.Column(db.Unicode(255))
	extension = db.Column(db.Unicode(255))
	temp = db.Column(db.Boolean, default=True)

	width = db.Column(db.Integer)
	height = db.Column(db.Integer)
	
	thumbnail_width = db.Column(db.Integer)
	thumbnail_height = db.Column(db.Integer)

	def __init__(self, filename, file_obj, size=(1024,768)):
		super(UploadedImageFile, self).__init__(filename, file_obj)
		self.width = size[0]
		self.height = size[1]

	def thumbnail_filename(self):
		return '%s-thumb.%s' % (self.uuid, self.extension)

	def thumbnail_filepath(self):
		path = self.temp_up_path
		if not self.temp:
			path = self.up_path
		return os.path.join(path, self.thumbnail_filename())

	def thumbnail_url(self):
		folder = self.temp_up_folder
		if not self.temp:
			folder = self.up_folder
		return url_for('static', filename=os.path.join(folder, self.thumbnail_filename()))

	def smartResize(self, filepath, destination_path, size, pad):
		
		image = Image.open(filepath)
		image.thumbnail(size, Image.ANTIALIAS)
		image_size = image.size

		if pad:
			thumb = image.crop( (0, 0, size[0], size[1]) )
			offset_x = max( (size[0] - image_size[0]) / 2, 0 )
			offset_y = max( (size[1] - image_size[1]) / 2, 0 )
			thumb = ImageChops.offset(thumb, offset_x, offset_y)
		else:
			thumb = ImageOps.fit(image, size, Image.ANTIALIAS, (0.5, 0.5))

		thumb.save(destination_path)


	def makeThumbnail(self, size=(64,64), pad=False):
		self.smartResize(self.filepath(), self.thumbnail_filepath(), size, pad)
		self.thumbnail_width = size[0]
		self.thumbnail_height = size[1]


	def store(self):
		super(UploadedImageFile, self).store()
		temp_path = os.path.join(self.temp_up_path, self.thumbnail_filename())
		path =  os.path.join(self.up_path, self.thumbnail_filename())
		os.rename(temp_path, path)

	def save(self):
		super(UploadedImageFile, self).save()
		self.makeThumbnail()

	@staticmethod
	def before_delete(mapper, connection, instance):
		UploadedFile.before_delete(mapper, connection, instance)
		try:
			os.remove(instance.thumbnail_filepath())
		except:
			pass