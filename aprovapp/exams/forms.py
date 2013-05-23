
from flask.ext.wtf import Form

from wtforms import Form as WTForm

from wtforms.fields import FormField, FieldList, TextField, BooleanField


from wtforms.ext.sqlalchemy.fields import QuerySelectField

from aprovapp.crud.forms import form_for
from aprovapp.crud.forms import UploadField, UploadImageField, \
    DateTimePickerField, CrudListWidget

from aprovapp.exams.models import ExaminingBoard, Promoter, ExamJobRole, \
    KnowledgeArea, Discipline, Subject, Announcement, Exam, ExamPosition, \
    Question, SingleChoiceQuestion, MultipleChoiceQuestion, BooleanQuestion, \
    Choice, FederalUnit, CalendarEvent, CalendarEventTrigger, ExamLevel


def factory_for(m):
    return lambda: m.query



class ExaminingBoardForm(form_for(ExaminingBoard)):
    image = UploadImageField()

class PromoterForm(form_for(Promoter)):
    image = UploadImageField()


class ExamJobRoleForm(form_for(ExamJobRole)):
    pass

class KnowledgeAreaForm(form_for(KnowledgeArea)):
    pass

class DisciplineForm(form_for(Discipline)):
    knowledge_area = QuerySelectField(query_factory=factory_for(KnowledgeArea))

class SubjectForm(form_for(Subject)):
    discipline = QuerySelectField(query_factory=factory_for(Discipline))


class CalendarEventInlineForm(WTForm):
    source_model = CalendarEvent
    trigger = QuerySelectField(query_factory=factory_for(CalendarEventTrigger))
    date = DateTimePickerField()

class ExamPositionInlineForm(WTForm):
    source_model = ExamPosition
    name = TextField()
    job_role = QuerySelectField(query_factory=factory_for(ExamJobRole))
    inscription_price = TextField()
    salary = TextField()
    places = TextField()

class ExamPositionForm(form_for(ExamPosition)):
    job_role = QuerySelectField(query_factory=factory_for(ExamJobRole))
    announcement = QuerySelectField(query_factory=factory_for(Announcement))
   
class AnnouncementForm(form_for(Announcement, exclude=['calendar_event_association'])):
    examining_board = QuerySelectField(query_factory=factory_for(ExaminingBoard))
    promoter = QuerySelectField(query_factory=factory_for(Promoter))
    federal_unit = QuerySelectField(query_factory=factory_for(FederalUnit))
    phase = QuerySelectField(query_factory=factory_for(CalendarEventTrigger))
    announcement_file = UploadField()
    calendar_events = FieldList(FormField(CalendarEventInlineForm), min_entries=3, widget=CrudListWidget(css_class='field_list_widget'))
    positions = FieldList(FormField(ExamPositionInlineForm), min_entries=3, widget=CrudListWidget(css_class='field_list_widget'))

class ExamForm(form_for(Exam, exclude=['calendar_event_association'])):
    announcement = QuerySelectField(query_factory=factory_for(Announcement))
    exam_position = QuerySelectField(query_factory=factory_for(ExamPosition))
    level = QuerySelectField(query_factory=factory_for(ExamLevel)) 
    exam_file = UploadField()
    answers_file = UploadField()
    calendar_events = FieldList(FormField(CalendarEventInlineForm), min_entries=3, widget=CrudListWidget(css_class='field_list_widget'))

class QuestionForm(form_for(Question, exclude=['type'])):
    exam = QuerySelectField(query_factory=factory_for(Exam))
    knowledge_area = QuerySelectField(query_factory=factory_for(KnowledgeArea))
    discipline = QuerySelectField(query_factory=factory_for(Discipline))
    subject = QuerySelectField(query_factory=factory_for(Subject))

class ChoiceForm(form_for(Choice)):
    source_model = Choice
    text = TextField()
    is_answer = BooleanField()

class ChoiceInlineForm(WTForm):
    source_model = Choice
    text = TextField()
    is_answer = BooleanField()

class SingleChoiceQuestionForm(QuestionForm, form_for(SingleChoiceQuestion, exclude=['type','right_choice'])):
    choices = FieldList(FormField(ChoiceInlineForm), min_entries=3, widget=CrudListWidget(css_class='field_list_widget'))

class MultipleChoiceQuestionForm(QuestionForm, form_for(MultipleChoiceQuestion, exclude=['type'])):
    pass

class BooleanQuestionForm(QuestionForm, form_for(BooleanQuestion, exclude=['type'])):
    pass


