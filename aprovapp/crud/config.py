# -*- coding: utf-8 -*-

from aprovapp.exams.models import ExaminingBoard, Promoter, ExamJobRole, KnowledgeArea, \
	Discipline, Subject, Announcement, ExamPosition, Exam, Choice, Question, \
	SingleChoiceQuestion, MultipleChoiceQuestion, BooleanQuestion

from aprovapp.exams.forms import ExaminingBoardForm, PromoterForm, ExamJobRoleForm, \
	KnowledgeAreaForm, DisciplineForm, SubjectForm, AnnouncementForm, \
	ExamPositionForm, ExamForm, BooleanQuestionForm, \
	SingleChoiceQuestionForm, MultipleChoiceQuestionForm, ChoiceForm

crud_config = {
	'examining-boards': {
		'model': ExaminingBoard,
		'form': ExaminingBoardForm,
		'title': "Banca Examinadora",
		#'headers': (
		#	{'field':'name','label':'Nome', 'order-by':True, 'order-direction': 'asc'},
		#	{'field':'short_name','label':'Abreviacao'},
		#	{'field':'description','label':'Descritivo'},
		#),
		'form_template': 'exams/examining_board_form.html'
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
	'announcements': {
		'model': Announcement,
		'form': AnnouncementForm,
		'title': 'Edital',
	},
	'exam-positions': {
		'model': ExamPosition,
		'form': ExamPositionForm,
		'title': u'Posições',
	},
	'exams': {
		'model': Exam,
		'form': ExamForm,
		'title': u'Provas',
	},
	'questions': {
		'model': Question,
		'headers': (
			{'field':'enunciation','label':'Enunciado'},
		),
		'form_by_type': {
			'boolean_question': BooleanQuestionForm,
			'single_choice_question': SingleChoiceQuestionForm,
			'multiple_choice_question': MultipleChoiceQuestionForm
		},
		'model_by_type': {
			'boolean_question': BooleanQuestion,
			'single_choice_question': SingleChoiceQuestion,
			'multiple_choice_question': MultipleChoiceQuestion
		},
		'include_by_type': {
			'boolean_question': u'Verdadeiro ou Falso',
			'single_choice_question': u'Multipla Escolha',
		},
		'title': u'Questões',
	},
	'choices': {
		'model': Choice,
		'form': ChoiceForm,
		'title': u'Respostas',
	},

}
