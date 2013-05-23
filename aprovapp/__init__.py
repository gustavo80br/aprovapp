# -*- coding: utf-8 -*-

from flask import Flask, render_template
from flask.ext.security import Security, SQLAlchemyUserDatastore, UserMixin, RoleMixin, login_required
from flask.ext.security.utils import login_user
from flask.ext.sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config.from_object('config')

db = SQLAlchemy(app)

#@app.errorhandler(404)
#def not_found(error):
#    return render_template('404.html'), 404

"""
FLASK SECURITY
"""
from aprovapp.users.models import User, Role
user_datastore = SQLAlchemyUserDatastore(db, User, Role)
security = Security(app, user_datastore)

# Create a user to test with
#@app.before_first_request
#def create_user():
#    pass
	#db.create_all()
	#user_datastore.create_user(email='gustavo@faprender.org', password='password')
	#db.session.commit()

"""
CRUD import
"""
import aprovapp.crud.views

"""
BLUEPRINTS (APPS)
"""
from aprovapp.exams.views import mod as examsModule
app.register_blueprint(examsModule)


"""
APP LEVEL URLS
"""
@app.route("/")
def admin_frame():
	return render_template("admin_frame.html")

"""
CREATE THE DATABASE
"""
def create_db():
	
	from aprovapp.exams.models import FederalRegion, FederalUnit, \
		ExaminingBoard, ExamLevel, Promoter, CalendarEventTrigger, \
		ExamJobRole, KnowledgeArea, Discipline, Subject

	db.create_all()
	user = user_datastore.create_user(email='gustavo@faprender.org', password='password')
	db.session.commit()

	ctx = app.test_request_context('/')
	ctx.push()

	login_user(user)

	db.session.add_all([
		FederalRegion(id = 1, name = u'Sul', short_name = u'S'),
		FederalRegion(id = 2, name = u'Sudeste', short_name = u'SE'),
		FederalRegion(id = 3, name = u'Centroeste', short_name = u'CO'),
		FederalRegion(id = 4, name = u'Nordeste', short_name = u'NE'),
		FederalRegion(id = 5, name = u'Norte', short_name = u'N'),
		FederalRegion(id = 6, name = u'Brasil', short_name = u'B'),
	])

	db.session.add_all([
		FederalUnit(name = u'NACIONAL', short_name = u'BR', region_id=6),
		FederalUnit(name = u'Acre', short_name = u'AC', region_id=5),
		FederalUnit(name = u'Alagoas', short_name = u'AL', region_id=4),
		FederalUnit(name = u'Amapá', short_name = u'AP', region_id=5),
		FederalUnit(name = u'Amazonas', short_name = u'AM', region_id=5),
		FederalUnit(name = u'Bahia', short_name = u'BA', region_id=4),
		FederalUnit(name = u'Ceará', short_name = u'CE', region_id=4),
		FederalUnit(name = u'Distrito Federal', short_name = u'DF', region_id=3),
		FederalUnit(name = u'Espírito Santo', short_name = u'ES', region_id=2), 
		FederalUnit(name = u'Goiás', short_name = u'GO', region_id=3), 
		FederalUnit(name = u'Maranhão', short_name = u'MA', region_id=4), 
		FederalUnit(name = u'Mato Grosso', short_name = u'MT', region_id=3), 
		FederalUnit(name = u'Mato Grosso do Sul', short_name = u'MS', region_id=3), 
		FederalUnit(name = u'Minas Gerais', short_name = u'MG', region_id=2), 
		FederalUnit(name = u'Pará', short_name = u'PA', region_id=5), 
		FederalUnit(name = u'Paraíba', short_name = u'PB', region_id=4),
		FederalUnit(name = u'Paraná', short_name = u'PR', region_id=1),
		FederalUnit(name = u'Pernambuco', short_name = u'PE', region_id=4), 
		FederalUnit(name = u'Piauí', short_name = u'PI', region_id=4), 
		FederalUnit(name = u'Rio de Janeiro', short_name = u'RJ', region_id=2), 
		FederalUnit(name = u'Rio Grande do Norte', short_name = u'RN', region_id=4), 
		FederalUnit(name = u'Rio Grande do Sul', short_name = u'RS', region_id=1), 
		FederalUnit(name = u'Rondônia', short_name = u'RO', region_id=5),
		FederalUnit(name = u'Roraima', short_name = u'RR', region_id=5), 
		FederalUnit(name = u'Santa Catarina', short_name = u'SC', region_id=1),
		FederalUnit(name = u'São Paulo', short_name = u'SP', region_id=2),
		FederalUnit(name = u'Sergipe', short_name = u'SE', region_id=4), 
		FederalUnit(name = u'Tocantins', short_name = u'TO', region_id=5),
	])

	db.session.add_all([
		ExaminingBoard(
			name = u'CESPE/UnB',
			short_name = u'CESPE',
			url = u'http://www.cespe.unb.br/concursos/'
		),
		ExaminingBoard(
			name = u'Fundação Getúlio Vargas',
			short_name = u'FGV',
			url = u'http://oab.fgv.br/'),
	])

	db.session.add_all([
		Promoter(
			name = u'Ordem dos Advogados do Brasil',
			short_name = u'OAB',
			url = u'http://www.oab.org.br/servicos/examedeordem'
		),
	])

	db.session.add_all([
		ExamLevel(level = u'Ensino Fundamental'),
		ExamLevel(level = u'Ensino Médio'),
		ExamLevel(level = u'Técnico'),
		ExamLevel(level = u'Superior'),
		ExamLevel(level = u'Mestrado'),
		ExamLevel(level = u'Doutorado'),
	])

	db.session.add_all([
		CalendarEventTrigger(id=1, name=u'Publicação'),
		CalendarEventTrigger(id=2, name=u'Início das Inscrições'),
		CalendarEventTrigger(id=3, name=u'Encerramento das Inscrições'),
		CalendarEventTrigger(id=4, name=u'Isenção de Inscrição'),
		CalendarEventTrigger(id=5, name=u'Recursos de Inscrição'),
		CalendarEventTrigger(id=6, name=u'Data e Local das Provas'),
		CalendarEventTrigger(id=7, name=u'Exame'),
		CalendarEventTrigger(id=8, name=u'Gabaritos'),
		CalendarEventTrigger(id=9, name=u'Resultado 1ª fase'),
		CalendarEventTrigger(id=10, name=u'Resultado 2ª fase'),
		CalendarEventTrigger(id=11, name=u'Resultado 3ª fase'),
		CalendarEventTrigger(id=12, name=u'Encerramento'),
	])

	db.session.add_all([
		ExamJobRole(role=u'Analista Judiciário'),
		ExamJobRole(role=u'Técnico Judiciário'),
		ExamJobRole(role=u'Oficial de Justiça)'),
	])

	db.session.add_all([
		KnowledgeArea(id=1, name=u'Direito'),
		Discipline(id=1, name=u'Direito Tributário', knowledge_area_id=1),
		Discipline(id=2, name=u'Direito Penal', knowledge_area_id=1),
		Subject(id=1, name=u'Substituição', discipline_id=1),
		Subject(id=2, name=u'Solidariedade', discipline_id=1),
		Subject(id=3, name=u'Penas', discipline_id=2),
		Subject(id=4, name=u'Dolo', discipline_id=2),
	])

	db.session.commit()

	ctx.pop()