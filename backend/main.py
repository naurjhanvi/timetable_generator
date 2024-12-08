# main.py
from backend.models import Cycle, Department, Subject
from backend.timetable_generator import TimetableGenerator

def get_cycle_input():
    print("\n=== Timetable Generator ===")
    print("1. Physics Cycle")
    print("2. Chemistry Cycle")
    while True:
        choice = input("Select cycle (1/2): ")
        if choice == "1":
            return Cycle.PHYSICS
        elif choice == "2":
            return Cycle.CHEMISTRY
        print("Invalid choice. Please select 1 or 2.")

def get_department_input(cycle):
    departments = {
        Cycle.PHYSICS: ["1. CSE", "2. AIDS", "3. AIML", "4. ISE"],
        Cycle.CHEMISTRY: ["1. ECE", "2. EEE"]
    }
    
    print("\nAvailable Departments:")
    for dept in departments[cycle]:
        print(dept)
    
    while True:
        choice = input("Select department number: ")
        if cycle == Cycle.PHYSICS:
            if choice == "1": return Department.CSE
            elif choice == "2": return Department.AIDS
            elif choice == "3": return Department.AIML
            elif choice == "4": return Department.ISE
        else:
            if choice == "1": return Department.ECE
            elif choice == "2": return Department.EEE
        print("Invalid choice. Please try again.")

def get_subjects_input():
    subjects = []
    print("\nEnter subject details:")
    
    while True:
        name = input("\nEnter subject name (or 'done' to finish): ")
        if name.lower() == 'done':
            break
            
        code = input("Enter subject code: ")
        theory_hours = int(input("Enter theory hours per week: "))
        is_lab = input("Is this a lab subject? (yes/no): ").lower() == 'yes'
        
        total_hours = theory_hours
        if is_lab:
            total_hours += 6  # Add 6 hours (2 hours × 3 batches) for lab
        
        
        print("Enter teachers (type 'done' when finished):")
        teachers = []
        while True:
            teacher = input("Teacher name: ")
            if teacher.lower() == 'done':
                break
            teachers.append(teacher)
        
        priority = int(input("Enter priority (1 being highest): "))
        
        subject = Subject(name, code, total_hours, is_lab, teachers, priority)
        subjects.append(subject)
    
    return subjects

def display_timetable(timetable):
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    time_slots = ["9:00-10:00", "10:00-11:00", "11:15-12:15", 
                  "12:15-1:15", "2:15-3:15", "3:15-4:15"]
    
    print("\n=== Generated Timetable ===")
    
    for day in days:
        print(f"\n{day}:")
        print("Time\t\tSubject\t\tType\t\tLab Batch")
        for i, time in enumerate(time_slots):
            period = timetable[day]["periods"][i]
            if period is None:
                print(f"{time}\tFree\t\t-\t\t-")
            else:
                subject = period["subject"].name
                type_ = period["type"]
                batch = timetable[day]["lab_batch"] if type_ == "lab" else "-"
                print(f"{time}\t{subject}\t\t{type_}\t\t{batch}")

from flask import Flask, jsonify
from backend.models import Cycle, Department
from backend.timetable_generator import TimetableGenerator

app = Flask(__name__)

@app.route('/api/timetable', methods=['GET'])
def get_timetable():
    cycle = Cycle.PHYSICS  # Replace with user's selected cycle
    department = Department.CSE  # Replace with user's selected department
    generator = TimetableGenerator(cycle, department)

    # Get subjects input (you can reuse the existing code)
    subjects = get_subjects_input()
    for subject in subjects:
        generator.add_subject(subject)

    timetable = generator.generate_timetable()
    return jsonify(timetable)

if __name__ == '__main__':
    app.run(debug=True)

def main():
    # Get user input
    cycle = get_cycle_input()
    department = get_department_input(cycle)
    
    # Initialize generator
    generator = TimetableGenerator(cycle, department)
    
    # Get subjects
    subjects = get_subjects_input()
    
    # Add subjects to generator
    for subject in subjects:
        generator.add_subject(subject)
    
    # Generate and display timetable
    timetable = generator.generate_timetable()
    display_timetable(timetable)

if __name__ == "__main__":

    main()

if __name__ == '__main__':
    app = create_app()
    init_db()  # Initialize the database
    app.run(debug=True)