# models.py
from sqlalchemy import create_engine, Column, Integer, String, Boolean, ForeignKey, Enum as SQLEnum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker
from enum import Enum

Base = declarative_base()

class Cycle(Enum):
    PHYSICS = "physics"
    CHEMISTRY = "chemistry"

class Department(Enum):
    CSE = "CSE"
    AIDS = "AIDS"
    AIML = "AIML"
    ISE = "ISE"
    ECE = "ECE"
    EEE = "EEE"

class Semester(Enum):
    SEM_1 = "1st Semester"
    SEM_2 = "2nd Semester"
    SEM_3 = "3rd Semester"
    SEM_4 = "4th Semester"
    SEM_5 = "5th Semester"
    SEM_6 = "6th Semester"
    SEM_7 = "7th Semester"
    SEM_8 = "8th Semester"

class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    department = Column(SQLEnum(Department), nullable=False)
    semester = Column(SQLEnum(Semester), nullable=False)
    cycle = Column(SQLEnum(Cycle), nullable=True)
    timetables = relationship("Timetable", back_populates="user")

class Subject(Base):
    __tablename__ = 'subjects'
    
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    code = Column(String, nullable=False)
    hours_per_week = Column(Integer, nullable=False)
    is_lab = Column(Boolean, default=False)
    priority = Column(Integer, nullable=False)
    timetable_id = Column(Integer, ForeignKey('timetables.id'))
    timetable = relationship("Timetable", back_populates="subjects")
    teachers = relationship("Teacher", secondary="subject_teachers")

class Teacher(Base):
    __tablename__ = 'teachers'
    
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    subjects = relationship("Subject", secondary="subject_teachers")

class SubjectTeacher(Base):
    __tablename__ = 'subject_teachers'
    
    subject_id = Column(Integer, ForeignKey('subjects.id'), primary_key=True)
    teacher_id = Column(Integer, ForeignKey('teachers.id'), primary_key=True)

class Timetable(Base):
    __tablename__ = 'timetables'
    
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'))
    user = relationship("User", back_populates="timetables")
    subjects = relationship("Subject", back_populates="timetable")
    slots = relationship("TimeTableSlot", back_populates="timetable")

class TimeTableSlot(Base):
    __tablename__ = 'timetable_slots'
    
    id = Column(Integer, primary_key=True)
    day = Column(String, nullable=False)
    slot_number = Column(Integer, nullable=False)
    subject_id = Column(Integer, ForeignKey('subjects.id'))
    is_lab_session = Column(Boolean, default=False)
    is_break = Column(Boolean, default=False)
    break_type = Column(String, nullable=True)  # 'tea' or 'lunch'
    custom_activity = Column(String, nullable=True)
    timetable_id = Column(Integer, ForeignKey('timetables.id'))
    timetable = relationship("Timetable", back_populates="slots")