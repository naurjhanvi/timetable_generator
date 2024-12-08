# timetable_generator.py
from typing import List, Dict
import random
from backend.models import *

class TimetableGenerator:
    def __init__(self, cycle: Cycle, department: Department):
        self.cycle = cycle
        self.department = department
        self.subjects: List[Subject] = []
        self.batches = ["A", "B", "C"]
        self.timetable = self._initialize_timetable()

    def add_subject(self, subject: Subject):
        """Add a subject to the timetable generator"""
        self.subjects.append(subject)

    def _initialize_timetable(self) -> Dict:
        days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
        timetable = {}
        
        for day in days:
            timetable[day] = {
                "periods": [None] * 6,  # 6 periods per day
                "lab_batch": None  # Which batch has lab in case of lab periods
            }
        return timetable

    def generate_timetable(self):
        # Sort subjects by priority
        self.subjects.sort(key=lambda x: x.priority)
        
        # First, schedule lab sessions
        lab_subjects = [s for s in self.subjects if s.is_lab]
        self._schedule_lab_sessions(lab_subjects)
        
        # Then schedule regular classes
        regular_subjects = [s for s in self.subjects if not s.is_lab]
        self._schedule_regular_classes(regular_subjects)
        
        return self.timetable

    def _schedule_lab_sessions(self, lab_subjects: List[Subject]):
        days = list(self.timetable.keys())
        
        for lab in lab_subjects:
            # Need to schedule each lab three times (once for each batch)
            for batch in self.batches:
                scheduled = False
                while not scheduled:
                    day = random.choice(days)
                    # Try to schedule lab in morning (slots 0-1) or afternoon (slots 4-5)
                    slot_pairs = [(0,1), (4,5)]
                    random.shuffle(slot_pairs)
                    
                    for start_slot, end_slot in slot_pairs:
                        if self._can_schedule_lab(day, start_slot):
                            # Schedule 2-hour lab session
                            self.timetable[day]["periods"][start_slot] = {
                                "subject": lab,
                                "type": "lab"
                            }
                            self.timetable[day]["periods"][end_slot] = {
                                "subject": lab,
                                "type": "lab"
                            }
                            self.timetable[day]["lab_batch"] = batch
                            scheduled = True
                            break

    def _schedule_regular_classes(self, regular_subjects: List[Subject]):
        for subject in regular_subjects:
            hours_left = subject.hours_per_week
            while hours_left > 0:
                day = random.choice(list(self.timetable.keys()))
                slot = random.randint(0, 5)
                
                if self._can_schedule_regular(day, slot):
                    self.timetable[day]["periods"][slot] = {
                        "subject": subject,
                        "type": "regular"
                    }
                    hours_left -= 1

    def _can_schedule_lab(self, day: str, start_slot: int) -> bool:
        # Check if two consecutive slots are available
        if start_slot >= 5:
            return False
            
        # Check if no lab is already scheduled on this day
        if self.timetable[day]["lab_batch"] is not None:
            return False
            
        # Check if both slots are free
        return (self.timetable[day]["periods"][start_slot] is None and 
                self.timetable[day]["periods"][start_slot + 1] is None)

    def _can_schedule_regular(self, day: str, slot: int) -> bool:
        return self.timetable[day]["periods"][slot] is None