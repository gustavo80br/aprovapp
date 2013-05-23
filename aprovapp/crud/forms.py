# -*- coding: utf-8 -*-

from flask.ext.wtf import Form

from aprovapp.crud.models import UploadedFile, UploadedImageFile

from wtforms.widgets.core import HTMLString, html_params
from wtforms.widgets import TextInput
from wtforms.fields import TextField, DateTimeField

from wtforms.ext.sqlalchemy.orm import model_form, ModelConverter, converts


class CrudModelConverter(ModelConverter):

    @converts('ONETOMANY')
    def conv_OneToMany(self, field_args, **extra):
        return None

class CrudBaseForm(Form):

    def populate_obj(self, obj):
        for name, field in self._fields.iteritems():
            if not name in self.skip:
                field.populate_obj(obj, name)
        self.after_data_change()

    def after_data_change(self):
        pass

    def process(self, formdata=None, obj=None, **kwargs):
        super(CrudBaseForm, self).process(formdata, obj, **kwargs)
        self.after_data_change()


def form_for(model_class, timestamp_mixin=True, exclude=None, skip=[]):

    if timestamp_mixin and exclude:
        exclude = exclude + ['created_on','created_by','creator_id','updated_on','updated_by','updater_id']
    elif timestamp_mixin and not exclude:
        exclude = ['created_on','created_by','creator_id','updated_on','updated_by','updater_id']

    form_model_base = model_form(model_class, Form, exclude=exclude, converter=CrudModelConverter())

    def _populate_obj(self, obj):
        for name, field in self._fields.iteritems():
            if not name in self.skip:
                field.populate_obj(obj, name)

    def _pre_process_content(self):
        pass

    Frm = type("CrudExtraBaseForm", (form_model_base,), { 
        'source_class' : model_class,
        'skip': skip,
        'populate_obj': _populate_obj,
        'pre_process_content': _pre_process_content,
    })

    return Frm


class UploadWidget(object):

    upload_class = 'single_upload_widget'

    def __init__(self, typ=None):
        pass
        #if typ == 'image':
        #    self.upload_class = 'image_upload_widget'

    def __call__(self, field, **kwargs):
        
        kwargs.setdefault('id', field.id)
        value = field._value()
        c = kwargs.pop('class', '') or kwargs.pop('class_', '')
        kwargs['class'] = u'%s %s' % (self.upload_class, c)

        html = ''
        hidden_field = ''

        if value:
            upload = field.data
            file_url = upload.file_url()
            thumb_url = upload.thumbnail_url()

            kwargs.setdefault('value', value)
            
            if upload.temp:
                hidden_field = '<input id="%s-plupload-aux" type="text" style="display: none;" name="%s-plupload-aux" value="%s">' % (field.name, field.name, upload.uuid)

            html = """
            <ul class="thumbnails aprovapp-form-thumb">
                <li id="gallery" data-toggle="modal-gallery" data-target="#modal-gallery">
                    <a href="%s" class="thumbnail" data-gallery="gallery"><img src="%s" alt="%s"/></a>
                </li>
            </ul>""" % (file_url, thumb_url, upload.original_filename)

        return HTMLString('<input %s>' % html_params(name=field.name, type='file', **kwargs) + hidden_field + html)

class UploadField(TextField):
    handle_class = UploadedFile
    widget = UploadWidget()

class UploadImageField(TextField):
    handle_class = UploadedImageFile
    widget = UploadWidget(typ='image')


class DateTimePickerWidget(TextInput):
    
    def __init__(self, input_type=None, css_class='datetimepicker'):
        self.css_class = css_class
        super(DateTimePickerWidget, self).__init__(input_type=None)

    def __call__(self, field, **kwargs):
        c = kwargs.pop('class', '') or kwargs.pop('class_', '')
        kwargs['class'] = u'%s %s' % (self.css_class, c)
        kwargs['readonly'] = u''
        return '<div class="input-append date">' + super(DateTimePickerWidget, self).__call__(field, **kwargs) + '<span class="add-on"><i class="icon-calendar"></i></span></div>'


class DateTimePickerField(DateTimeField):
    widget = DateTimePickerWidget()



class CrudListWidget(object):
    """
    Renders a list of fields as a `ul` or `ol` list.

    This is used for fields which encapsulate many inner fields as subfields.
    The widget will try to iterate the field to get access to the subfields and
    call them to render them.

    If `prefix_label` is set, the subfield's label is printed before the field,
    otherwise afterwards. The latter is useful for iterating radios or
    checkboxes.
    """
    def __init__(self, html_tag='ul', css_class=None, prefix_label=True):
        assert html_tag in ('ol', 'ul')
        self.html_tag = html_tag
        self.prefix_label = prefix_label
        self.css_class = css_class

    def __call__(self, field, **kwargs):

        kwargs.setdefault('id', field.id)
        
        if self.css_class:
            c = kwargs.pop('class', '') or kwargs.pop('class_', '')
            kwargs['class'] = u'%s %s' % (self.css_class, c)

        html = ['<%s %s>' % (self.html_tag, html_params(**kwargs))]
        
        for subfield in field:
            if self.prefix_label:
                html.append('<li>%s: %s</li>' % (subfield.label, subfield()))
            else:
                html.append('<li>%s %s</li>' % (subfield(), subfield.label))
        
        html.append('</%s>' % self.html_tag)
        
        return HTMLString(''.join(html))