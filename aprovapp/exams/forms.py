
from flask.ext.wtf import Form

from wtforms import Form as WTForm

from wtforms.fields import FormField, FieldList, TextField, BooleanField

from aprovapp.crud.forms import form_for, select_for, field_list
from aprovapp.crud.forms import UploadField, UploadImageField, \
    DateTimePickerField, CrudListWidget

from aprovapp.exams.models import ExaminingBoard, Promoter, ExamJobRole, \
    KnowledgeArea, Discipline, Subject, Announcement, Exam, ExamPosition, \
    Question, SingleChoiceQuestion, MultipleChoiceQuestion, BooleanQuestion, \
    Choice, FederalUnit, CalendarEvent, CalendarEventTrigger, ExamLevel



class ExaminingBoardForm(form_for(ExaminingBoard)):
    image = UploadImageField()

class PromoterForm(form_for(Promoter)):
    image = UploadImageField()


class ExamJobRoleForm(form_for(ExamJobRole)):
    pass

class KnowledgeAreaForm(form_for(KnowledgeArea)):
    pass

class DisciplineForm(form_for(Discipline)):
    knowledge_area = select_for(KnowledgeArea)

class SubjectForm(form_for(Subject)):
    discipline = select_for(Discipline)


class CalendarEventInlineForm(WTForm):
    source_model = CalendarEvent
    trigger = select_for(CalendarEventTrigger)
    date = DateTimePickerField()

class ExamPositionInlineForm(WTForm):
    source_model = ExamPosition
    name = TextField()
    job_role = select_for(ExamJobRole)
    inscription_price = TextField()
    salary = TextField()
    places = TextField()

class ExamPositionForm(form_for(ExamPosition)):
    job_role = select_for(ExamJobRole)
    announcement = select_for(Announcement)
   
class AnnouncementForm(form_for(Announcement, exclude=['calendar_event_association'])):
    examining_board = select_for(ExaminingBoard)
    promoter = select_for(Promoter)
    federal_unit = select_for(FederalUnit)
    phase = select_for(CalendarEventTrigger)
    announcement_file = UploadField()
    calendar_events = field_list(CalendarEventInlineForm, 3)
    positions = field_list(ExamPositionInlineForm, 3)

class ExamForm(form_for(Exam, exclude=['calendar_event_association'])):
    announcement = select_for(Announcement)
    exam_position = select_for(ExamPosition)
    level = select_for(ExamLevel)
    exam_file = UploadField()
    answers_file = UploadField()
    calendar_events = field_list(CalendarEventInlineForm, 3)

class QuestionForm(form_for(Question, exclude=['type'])):
    exam = select_for(Exam)
    knowledge_area = select_for(KnowledgeArea)
    discipline = select_for(Discipline)
    subject = select_for(Subject)

class ChoiceForm(form_for(Choice)):
    source_model = Choice
    text = TextField()
    is_answer = BooleanField()

class ChoiceInlineForm(WTForm):
    source_model = Choice
    text = TextField()
    is_answer = BooleanField()

class SingleChoiceQuestionForm(QuestionForm, form_for(SingleChoiceQuestion, exclude=['type','right_choice'])):
    choices = field_list(ChoiceInlineForm, 3)

class MultipleChoiceQuestionForm(QuestionForm, form_for(MultipleChoiceQuestion, exclude=['type'])):
    pass

class BooleanQuestionForm(QuestionForm, form_for(BooleanQuestion, exclude=['type'])):
    pass


