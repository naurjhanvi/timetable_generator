// UI Management Module
export const ui = {
    timeSlots: [
        "9:00-10:00",
        "10:00-11:00",
        "11:00-11:15",
        "11:15-12:15",
        "12:15-1:15",
        "1:15-2:15",
        "2:15-3:15",
        "3:15-4:15"
    ],

    toast(message, type = 'info') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type}`;
        toast.style.display = 'block';
        
        setTimeout(() => {
            toast.style.display = 'none';
        }, 3000);
    },

    updateDepartmentOptions(cycle = null) {
        const departmentSelect = document.getElementById('departmentSelect');
        const semester = document.getElementById('semesterSelect').value;
        departmentSelect.innerHTML = '<option value="">Choose Department</option>';

        let departments;
        if (semester === 'SEM_1' || semester === 'SEM_2') {
            departments = cycle === 'physics' 
                ? ['CSE', 'AIDS', 'AIML', 'ISE']
                : cycle === 'chemistry'
                ? ['ECE', 'EEE']
                : [];
        } else {
            departments = ['CSE', 'AIDS', 'AIML', 'ISE', 'ECE', 'EEE'];
        }

        departments.forEach(dept => {
            const option = document.createElement('option');
            option.value = dept;
            option.textContent = dept;
            departmentSelect.appendChild(option);
        });
    },

    updateSubjectList(subjects, container) {
        container.innerHTML = '';
        
        subjects.forEach((subject, index) => {
            const card = document.createElement('div');
            card.className = 'subject-card';
            
            card.innerHTML = `
                <h3>${subject.name} (${subject.code})</h3>
                <p>Hours per week: ${subject.hoursPerWeek}</p>
                <p>Type: ${subject.isLab ? 'Lab' : 'Theory'}</p>
                <p>Teachers: ${subject.teachers.join(', ')}</p>
                <p>Priority: ${subject.priority}</p>
                <button class="delete-subject" data-index="${index}">×</button>
            `;
            
            const deleteBtn = card.querySelector('.delete-subject');
            deleteBtn.addEventListener('click', () => {
                subjects.splice(index, 1);
                this.updateSubjectList(subjects, container);
                this.toast('Subject removed successfully!', 'success');
            });
            
            container.appendChild(card);
        });
    },

    showFreeSlotDialog(freeSlot, callback) {
        const dialog = document.createElement('div');
        dialog.className = 'free-slot-dialog';
        
        dialog.innerHTML = `
            <div class="dialog-content">
                <h3>Free Slot Available</h3>
                <p>${freeSlot.day} at ${freeSlot.timeSlot}</p>
                <div class="input-group">
                    <label for="activityName">What would you like to schedule? (Leave empty to keep it free)</label>
                    <input type="text" id="activityName" placeholder="e.g., Self Study, Library Time">
                </div>
                <div class="dialog-buttons">
                    <button class="add-btn">Done</button>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);

        const addBtn = dialog.querySelector('.add-btn');
        const nameInput = dialog.querySelector('#activityName');

        addBtn.addEventListener('click', () => {
            const activity = nameInput.value.trim() ? {
                name: nameInput.value.trim()
            } : null;
            document.body.removeChild(dialog);
            callback(activity);
        });
    },

    updateTimetable(timetableData) {
        const timetable = document.getElementById('timetable');
        const tbody = timetable.querySelector('tbody');
        tbody.innerHTML = '';
        
        ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].forEach(day => {
            const row = document.createElement('tr');
            
            const dayCell = document.createElement('td');
            dayCell.textContent = day;
            dayCell.className = 'day-header';
            row.appendChild(dayCell);
            
            this.timeSlots.forEach((time, index) => {
                const cell = document.createElement('td');
                
                if (time === "11:00-11:15") {
                    cell.textContent = "Tea Break";
                    cell.className = 'break-cell tea-break';
                    row.appendChild(cell);
                    return;
                }
                if (time === "1:15-2:15") {
                    cell.textContent = "Lunch Break";
                    cell.className = 'break-cell lunch-break';
                    row.appendChild(cell);
                    return;
                }

                const subject = timetableData[day][index];
                
                if (subject) {
                    cell.innerHTML = `
                        <strong>${subject.name}</strong><br>
                        <small>${subject.code}</small>
                    `;
                    
                    if (subject.isLab && subject.isLabSession) {
                        cell.style.backgroundColor = '#e8f5e9';
                        cell.innerHTML += '<br><small>(Lab Session)</small>';
                    } else if (subject.isTheoryOfLab) {
                        cell.style.backgroundColor = '#f3e5f5';
                        cell.innerHTML += '<br><small>(Theory)</small>';
                    } else if (subject.isCustomActivity) {
                        cell.style.backgroundColor = '#fff3e0';
                    }
                } else {
                    cell.textContent = 'FREE';
                    cell.style.backgroundColor = '#e3f2fd';
                }
                
                row.appendChild(cell);
            });
            
            tbody.appendChild(row);
        });
    },

    showStep(stepId) {
        const steps = document.querySelectorAll('.setup-step');
        steps.forEach(step => {
            step.classList.remove('active');
        });
        const nextStep = document.getElementById(stepId);
        if (nextStep) {
            nextStep.classList.add('active');
        }
    },

    showMainContent() {
        document.querySelector('.setup-container').style.display = 'none';
        document.querySelector('.main-content').style.display = 'block';
    }
};