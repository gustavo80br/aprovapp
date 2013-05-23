
from flask.ext.wtf import Form

from aprovapp.crud.forms import form_for
from aprovapp.crud.forms import UploadField, UploadImageField, \
	DateTimePickerField, CrudListWidget

from aprovapp.exams.models import ExaminingBoard, Promoter, ExamJobRole, \
	KnowledgeArea, Discipline, Subject, Announcement, Exam, ExamPosition, \
	Question, SingleChoiceQuestion, MultipleChoiceQuestion, BooleanQuestion, \
	Choice

class ExaminingBoardForm(form_for(ExaminingBoard)):
	pass

class PromoterForm(form_for(Promoter)):
	pass

class ExamJobRoleForm(form_for(ExamJobRole)):
	pass

class KnowledgeAreaForm(form_for(KnowledgeArea)):
	pass

class DisciplineForm(form_for(Discipline)):
	pass

class SubjectForm(form_for(Subject)):
	pass

class AnnouncementForm(form_for(Announcement)):
	pass

class ExamForm(form_for(Exam)):
	pass

class ExamPositionForm(form_for(ExamPosition)):
	pass

class QuestionForm(form_for(Question)):
	pass

class SingleChoiceQuestionForm(form_for(SingleChoiceQuestion)):
	pass

class MultipleChoiceQuestionForm(form_for(MultipleChoiceQuestion)):
	pass

class BooleanQuestionForm(form_for(BooleanQuestion)):
	pass

class ChoiceForm(form_for(Choice)):
	pass


