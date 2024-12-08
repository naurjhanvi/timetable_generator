import { auth } from './auth.js';
import { timetableManager } from './timetable.js';
import { ui } from './ui.js';

// DOM Elements
const loginPage = document.getElementById('loginPage');
const dashboardPage = document.getElementById('dashboardPage');
const loginForm = document.getElementById('loginForm');
const subjectForm = document.getElementById('subjectForm');
const logoutBtn = document.getElementById('logoutBtn');
const generateBtn = document.getElementById('generateBtn');
const subjectList = document.getElementById('subjectList');

// Store subjects
let subjects = [];

// Event Listeners for Setup Wizard
document.addEventListener('DOMContentLoaded', () => {
    const semesterSelect = document.getElementById('semesterSelect');
    const cycleSelect = document.getElementById('cycleSelect');
    const departmentSelect = document.getElementById('departmentSelect');
    const nextToConfig = document.getElementById('nextToConfig');
    const nextToDepartment = document.getElementById('nextToDepartment');
    const finishSetup = document.getElementById('finishSetup');
    const backBtns = document.querySelectorAll('.back-btn');

    // Hide main content initially
    document.querySelector('.main-content').style.display = 'none';

    // Next button after semester selection
    nextToConfig.addEventListener('click', () => {
        const semester = semesterSelect.value;
        if (!semester) {
            ui.toast('Please select a semester', 'error');
            return;
        }

        if (semester === 'SEM_1' || semester === 'SEM_2') {
            ui.showStep('cycleStep');
        } else {
            ui.updateDepartmentOptions();
            ui.showStep('departmentStep');
        }
    });

    // Next button after cycle selection
    nextToDepartment.addEventListener('click', () => {
        const cycle = cycleSelect.value;
        if (!cycle) {
            ui.toast('Please select a cycle', 'error');
            return;
        }
        ui.updateDepartmentOptions(cycle);
        ui.showStep('departmentStep');
    });

    // Finish setup button
    finishSetup.addEventListener('click', () => {
        const department = departmentSelect.value;
        if (!department) {
            ui.toast('Please select a department', 'error');
            return;
        }
        document.querySelector('.setup-container').style.display = 'none';
        document.querySelector('.main-content').style.display = 'block';
        ui.toast('Setup complete! You can now add subjects.', 'success');
    });

    // Back buttons
    backBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const currentStep = btn.closest('.setup-step');
            if (currentStep.id === 'departmentStep' && 
                (semesterSelect.value === 'SEM_1' || semesterSelect.value === 'SEM_2')) {
                ui.showStep('cycleStep');
            } else {
                ui.showStep('semesterStep');
            }
        });
    });
});

// Event Listeners for main functionality
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const userId = document.getElementById('userId').value;
    const password = document.getElementById('password').value;

    if (auth.handleLogin(userId, password)) {
        ui.toast('Login successful!', 'success');
        loginPage.classList.remove('active');
        dashboardPage.classList.add('active');
    } else {
        ui.toast('Invalid credentials!', 'error');
    }
});

subjectForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    try {
        const subject = {
            name: document.getElementById('subjectName').value,
            code: document.getElementById('subjectCode').value,
            hoursPerWeek: parseInt(document.getElementById('hoursPerWeek').value),
            isLab: document.getElementById('isLab').checked,
            teachers: document.getElementById('teachers').value.split(',').map(t => t.trim()),
            priority: parseInt(document.getElementById('priority').value)
        };

        subjects.push(subject);
        ui.updateSubjectList(subjects, subjectList);
        ui.toast('Subject added successfully!', 'success');
        subjectForm.reset();
    } catch (error) {
        console.error('Error adding subject:', error);
        ui.toast('Failed to add subject. Please check all fields.', 'error');
    }
});

logoutBtn.addEventListener('click', () => {
    dashboardPage.classList.remove('active');
    loginPage.classList.add('active');
    loginForm.reset();
    subjects = [];
    ui.updateSubjectList(subjects, subjectList);
    ui.toast('Logged out successfully!', 'success');
});

generateBtn.addEventListener('click', async () => {
    if (subjects.length === 0) {
        ui.toast('Please add at least one subject first!', 'error');
        return;
    }

    const semester = document.getElementById('semesterSelect').value;
    const department = document.getElementById('departmentSelect').value;
    const cycle = semester === 'SEM_1' || semester === 'SEM_2' 
        ? document.getElementById('cycleSelect').value 
        : null;

    const result = timetableManager.generateTimetable(subjects, {
        semester,
        department,
        cycle
    });
    
    ui.updateTimetable(result.timetable);
    
    if (result.freeSlots.length > 0) {
        ui.toast(`Found ${result.freeSlots.length} free slots! You can fill them now.`, 'success');
        
        for (const freeSlot of result.freeSlots) {
            await new Promise(resolve => {
                ui.showFreeSlotDialog(freeSlot, (activity) => {
                    if (activity) {
                        result.timetable = timetableManager.addActivityToFreeSlot(
                            result.timetable, 
                            activity, 
                            freeSlot.day, 
                            freeSlot.slotIndex
                        );
                        ui.updateTimetable(result.timetable);
                    }
                    resolve();
                });
            });
        }
        
        ui.toast('Timetable updated with your activities!', 'success');
    }
});
