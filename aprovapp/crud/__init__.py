from aprovapp import db as d
from aprovapp.crud.models import UploadedFile, UploadedImageFile

def upload(fk, backref, type=None):	
	clazz = UploadedFile
	if type == 'image':	
		clazz = UploadedImageFile
	return d.relationship(clazz, cascade='all, delete', foreign_keys=fk, backref=d.backref(backref, uselist=False))

def upload_id(type=None):
	key = 'uploaded_file.id'
	if type == 'image':	
		key = 'uploaded_image_file.id'
	return d.Column(d.Integer, d.ForeignKey(key))



