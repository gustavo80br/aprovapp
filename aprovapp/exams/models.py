# -*- coding: utf-8 -*-

from aprovapp import db as d
from aprovapp.crud import upload, upload_id
from aprovapp.crud.models import UploadedFile, UploadedImageFile, TimestampMixin

from sqlalchemy.ext.declarative import declared_attr
from sqlalchemy.ext.associationproxy import association_proxy


class ExaminingBoard(d.Model, TimestampMixin):
    __tablename__ = 'examining_board'   

    id = d.Column(d.Integer, primary_key=True)
    name = d.Column(d.Unicode(255), nullable=False)
    short_name = d.Column(d.String(10), nullable=False)
    url = d.Column(d.Unicode(255), nullable=True)
    
    """ File Upload """
    image_id = upload_id('image')
    image = upload(image_id, 'examining_boards', type='image')

    def __repr__(self):
        return '%s' % (self.short_name)


class Promoter(d.Model, TimestampMixin):
    __tablename__ = 'promoter'   

    id = d.Column(d.Integer, primary_key=True)
    name = d.Column(d.Unicode(255), nullable=False)
    short_name = d.Column(d.String(10), nullable=False)
    description = d.Column(d.Text, nullable=True)
    url = d.Column(d.Unicode(255), nullable=True)

    image_id = upload_id('image')
    image = upload(image_id, 'promoters', type='image')


    def __repr__(self):
        return '%s' % (self.name)


class FederalRegion(d.Model):
    __tablename__ = 'federal_region'   
    
    id = d.Column(d.Integer, primary_key=True)
    name = d.Column(d.Unicode(255), nullable=False)
    short_name = d.Column(d.String(10), nullable=False)


class FederalUnit(d.Model):
    __tablename__ = 'federal_unit'   

    id = d.Column(d.Integer, primary_key=True)
    name = d.Column(d.Unicode(255), nullable=False)
    short_name = d.Column(d.String(10), nullable=False)

    region = d.relationship('FederalRegion', backref=d.backref("federal_units", lazy="dynamic"))
    region_id = d.Column(d.Integer, d.ForeignKey('federal_region.id'), nullable=False)

    def __repr__(self):
        return '%s' % (self.name)


class ExamLevel(d.Model):
    __tablename__ = 'exam_level'   

    id = d.Column(d.Integer, primary_key=True)
    level = d.Column(d.Unicode(255), nullable=False)

    def __repr__(self):
        return '%s' % (self.level)

class ExamJobRole(d.Model):
    __tablename__ = 'exam_job_role'   

    id = d.Column(d.Integer, primary_key=True)
    role = d.Column(d.Unicode(255), nullable=False)

    def __repr__(self):
        return '%s' % (self.role)

class KnowledgeArea(d.Model, TimestampMixin):
    __tablename__ = 'knowledge_area'   

    id = d.Column(d.Integer, primary_key=True)  
    name = d.Column(d.Unicode(255), nullable=False)
    description = d.Column(d.Text, nullable=True)

    def __repr__(self):
        return '+ %s' % (self.name)


class Discipline(d.Model, TimestampMixin):
    __tablename__ = 'discipline'   

    id = d.Column(d.Integer, primary_key=True)
    name = d.Column(d.Unicode(255), nullable=False)
    description = d.Column(d.Text, nullable=True)
    
    knowledge_area = d.relationship('KnowledgeArea', backref=d.backref("disciplines", lazy="dynamic"))
    knowledge_area_id = d.Column(d.Integer, d.ForeignKey('knowledge_area.id'))
    
    def __repr__(self):
        return '%s' % (self.name)


class Subject(d.Model, TimestampMixin):
    __tablename__ = 'subject'   

    id = d.Column(d.Integer, primary_key=True)
    name = d.Column(d.Unicode(255), nullable=False)
    description = d.Column(d.Text, nullable=True)
    
    discipline = d.relationship('Discipline', backref=d.backref('subjects', lazy="dynamic"))
    discipline_id = d.Column(d.Integer, d.ForeignKey('discipline.id'))

    def __repr__(self):
        return '%s' % (self.name)


class CalendarEventTrigger(d.Model):
    __tablename__ = "calendar_event_trigger"

    id = d.Column(d.Integer, primary_key=True)
    name = d.Column(d.Integer, nullable=False)

    def __unicode__(self):
        return self.name


class CalendarEventAssociation(d.Model):
    __tablename__ = "calendar_event_association"

    """Associates a collection of CalendarEvents objects
    with a particular parent.
    
    """
    id = d.Column(d.Integer, primary_key=True)  

    @classmethod
    def creator(cls, discriminator):
        """Provide a 'creator' function to use with 
        the association proxy."""

        return lambda calendar_events:CalendarEventAssociation(
                                calendar_events=calendar_events, 
                                discriminator=discriminator)

    discriminator = d.Column(d.String)
    """Refers to the type of parent."""

    @property
    def parent(self):
        """Return the parent object."""
        return getattr(self, "%s_parent" % self.discriminator)


class CalendarEvent(d.Model):
    __tablename__ = 'calendar_event'

    """The CalendrEvent class.   
    
    This represents all events records in a 
    single table.
    
    """
    id = d.Column(d.Integer, primary_key=True)      
    date = d.Column(d.DateTime, nullable=False)
    
    trigger_id = d.Column(d.Integer, d.ForeignKey("calendar_event_trigger.id"))
    trigger = d.relationship('CalendarEventTrigger', backref='calendar_events')

    association_id = d.Column(d.Integer, d.ForeignKey("calendar_event_association.id"))
    association = d.relationship("CalendarEventAssociation", backref="calendar_events")

    parent = association_proxy("association", "parent")


class HasCalendarEvents(object):
    """HasCalendarEvents mixin, creates a relationship to
    the calendar_event_association table for each parent.
    
    """
    @declared_attr
    def calendar_event_association_id(cls):
        return d.Column(d.Integer, d.ForeignKey("calendar_event_association.id"))

    @declared_attr
    def calendar_event_association(cls):
        discriminator = cls.__name__.lower()
        cls.calendar_events = association_proxy("calendar_event_association", "calendar_events", creator=CalendarEventAssociation.creator(discriminator))
        return d.relationship("CalendarEventAssociation", backref=d.backref("%s_parent" % discriminator, uselist=False))



class Announcement(HasCalendarEvents, TimestampMixin, d.Model):
    __tablename__ = 'announcement'

    id = d.Column(d.Integer, primary_key=True)      

    """ Foreign Keys """
    examining_board_id = d.Column(d.Integer, d.ForeignKey('examining_board.id'))
    promoter_id = d.Column(d.Integer, d.ForeignKey('promoter.id'))
    federal_unit_id = d.Column(d.Integer, d.ForeignKey('federal_unit.id'))
    phase_id = d.Column(d.Integer, d.ForeignKey('calendar_event_trigger.id'))

    """ Relationships """
    examining_board = d.relationship('ExaminingBoard', backref=d.backref('announcements', lazy="dynamic"))
    promoter = d.relationship('Promoter', backref=d.backref('announcements', lazy="dynamic"))
    federal_unit = d.relationship('FederalUnit', backref=d.backref('announcements', lazy="dynamic"))
    phase = d.relationship('CalendarEventTrigger', backref=d.backref('announcements', lazy="dynamic"))

    """ File Upload """
    announcement_file_id = upload_id()
    announcement_file = upload(announcement_file_id,'announcements')

    """ Properties """
    description  = d.Column(d.String, nullable=False)
    year = d.Column(d.Integer, nullable=False)
    month = d.Column(d.Integer, nullable=False)
    official = d.Column(d.Boolean)
    url = d.Column(d.Unicode(255), nullable=True)
    text  = d.Column(d.Text, nullable=True)
    enabled = d.Column(d.Boolean, nullable=True)

    def __unicode__(self):
        return unicode(self.description)


class Exam(HasCalendarEvents, TimestampMixin, d.Model):

    id = d.Column(d.Integer, primary_key=True)      

    description = d.Column(d.String)
    phase = d.Column(d.Integer)

    """ Foreign Keys """
    announcement_id = d.Column(d.Integer, d.ForeignKey('announcement.id'))
    exam_position_id = d.Column(d.Integer, d.ForeignKey('exam_position.id'))
    exam_level_id = d.Column(d.Integer, d.ForeignKey('exam_level.id'))

    """ Relationships """
    announcement = d.relationship('Announcement', backref=d.backref('exams', lazy='dynamic'))
    exam_position = d.relationship('ExamPosition', backref=d.backref('exams', lazy='dynamic'))
    level = d.relationship('ExamLevel', backref=d.backref('exams', lazy="dynamic"))

    """ File Upload """

    exam_file_id = upload_id()
    exam_file = upload(exam_file_id, 'exams')

    answers_file_id =  upload_id()
    answers_file = upload(answers_file_id, 'exams_answers')


class ExamPosition(d.Model, TimestampMixin):
    __tablename__ = 'exam_position'   

    id = d.Column(d.Integer, primary_key=True)
    
    name = d.Column(d.String, nullable=True)
    inscription_price = d.Column(d.Float, nullable=True)
    salary = d.Column(d.Float, nullable=True)
    places = d.Column(d.Integer, nullable=True)

    job_role_id = d.Column(d.Integer, d.ForeignKey('exam_job_role.id'))
    announcement_id = d.Column(d.Integer, d.ForeignKey('announcement.id'))

    job_role = d.relationship('ExamJobRole', backref=d.backref('positions', lazy="dynamic"))
    announcement = d.relationship('Announcement', backref=d.backref('positions', lazy="dynamic"))

    def __unicode__(self):
        return u'%s' % (self.name)


class Question(d.Model, TimestampMixin):
    __tablename__ = 'question'

    id = d.Column(d.Integer, primary_key=True)

    exam_id = d.Column(d.Integer, d.ForeignKey('exam.id'))
    knowledge_area_id = d.Column(d.Integer, d.ForeignKey('knowledge_area.id'))
    discipline_id = d.Column(d.Integer, d.ForeignKey('discipline.id'))
    subject_id = d.Column(d.Integer, d.ForeignKey('subject.id'))

    exam = d.relationship('Exam', backref=d.backref('questions', lazy='dynamic'))
    knowledge_area = d.relationship('KnowledgeArea', backref=d.backref('questions', lazy='dynamic'))
    discipline = d.relationship('Discipline', backref=d.backref('questions', lazy='dynamic'))
    subject = d.relationship('Subject', backref=d.backref('questions', lazy='dynamic'))

    enunciation = d.Column(d.Text)

    type = d.Column(d.String(50))
    __mapper_args__ = {
        'polymorphic_identity':'question',
        'polymorphic_on':type
    }

    @staticmethod
    def before_insert_or_update(mapper, connection, instance):
        if instance.subject:
            instance.discipline = instance.subject.discipline
            instance.knowledge_area = instance.discipline.knowledge_area
        elif instance.discipline:
            instance.knowledge_area = instance.discipline.knowledge_area


class SingleChoiceQuestion(Question):
    __tablename__ = 'single_choice_question'
    id = d.Column(d.Integer, d.ForeignKey('question.id'), primary_key=True)

    right_choice_id = d.Column(d.Integer, d.ForeignKey('question_choice.id'))
    right_choice = d.relationship('Choice', backref=d.backref('right_answer_of', lazy='dynamic', uselist=True))
    __mapper_args__ = {
        'polymorphic_identity':'single_choice_question',
    }


class MultipleChoiceQuestion(Question):
    __tablename__ = 'multiple_choice_question'
    id = d.Column(d.Integer, d.ForeignKey('question.id'), primary_key=True)

    right_choices = d.Column(d.String)

    __mapper_args__ = {
        'polymorphic_identity':'multiple_choice_question',
    }


class BooleanQuestion(Question):
    __tablename__ = 'boolean_question'
    id = d.Column(d.Integer, d.ForeignKey('question.id'), primary_key=True)

    affirmative_is = d.Column(d.Boolean)

    __mapper_args__ = {
        'polymorphic_identity':'boolean_question',
    }


class Choice(d.Model, TimestampMixin):
    __tablename__ = 'question_choice'

    id = d.Column(d.Integer, primary_key=True)

    text = d.Column(d.Text)
    is_answer = d.Column(d.Boolean) # if True this choice should be checked

    question_id = d.Column(d.Integer, d.ForeignKey('question.id'))
    question = d.relationship('Question', backref=d.backref('choices', lazy="dynamic"))


    

        

