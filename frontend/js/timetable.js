// Timetable Generation Module
export const timetableManager = {
    timeSlots: [
        "9:00-10:00",
        "10:00-11:00",
        "11:15-12:15",
        "12:15-1:15",
        "2:15-3:15",
        "3:15-4:15"
    ],

    isValidSlotForSubject(timetable, day, slot, subject) {
        // Check if slot is empty
        if (timetable[day][slot]) return false;

        // Skip break slots
        if (slot === 2 || slot === 5) return false; // Break times

        // Check adjacent slots for lab subjects
        if (subject.isLab && subject.isLabSession) {
            // Check if adjacent slots have any lab
            const prevSlot = timetable[day][slot - 1];
            const nextSlot = timetable[day][slot + 1];
            if (prevSlot?.isLab || nextSlot?.isLab) return false;

            // Check if there's already a lab session on this day
            const hasLabOnThisDay = timetable[day].some(s => s?.isLab && s?.isLabSession);
            if (hasLabOnThisDay) return false;
        }

        // Check adjacent slots for same subject (prevent consecutive theory classes)
        const prevSlot = timetable[day][slot - 1];
        const nextSlot = timetable[day][slot + 1];
        if (prevSlot?.name === subject.name || nextSlot?.name === subject.name) return false;

        // Priority balancing
        // For high priority subjects (priority < 3)
        if (subject.priority < 3) {
            // Check previous and next slots for high priority subjects
            if (prevSlot?.priority < 3 || nextSlot?.priority < 3) return false;
            
            // Check if there are too many high priority subjects in this day
            const highPriorityCountInDay = timetable[day].filter(s => s?.priority < 3).length;
            if (highPriorityCountInDay >= 2) return false; // Max 2 high priority subjects per day
        }

        // For low priority subjects (priority > 5)
        if (subject.priority > 5) {
            // Don't place low priority subjects at the start of the day
            if (slot === 0) return false;
        }

        return true;
    },

    generateTimetable(subjects, config) {
        // Sort subjects by priority (higher priority first)
        const sortedSubjects = [...subjects].sort((a, b) => b.priority - a.priority);
        
        // Different handling based on semester
        if (config.semester === 'SEM_1' || config.semester === 'SEM_2') {
            return this.generateCycleBasedTimetable(sortedSubjects, config);
        } else {
            return this.generateDepartmentBasedTimetable(sortedSubjects, config);
        }
    },

    generateCycleBasedTimetable(sortedSubjects, config) {
        // Existing timetable generation logic for 1st and 2nd semester
        const timetable = this.generateInitialTimetable(sortedSubjects);
        return {
            timetable,
            freeSlots: this.findFreeSlots(timetable)
        };
    },

    generateDepartmentBasedTimetable(sortedSubjects, config) {
        // New timetable generation logic for higher semesters
        // This can be customized based on department-specific requirements
        const timetable = this.generateInitialTimetable(sortedSubjects);
        
        // Additional department-specific rules can be added here
        // For example, specific time slots for department electives
        
        return {
            timetable,
            freeSlots: this.findFreeSlots(timetable)
        };
    },

    generateInitialTimetable(sortedSubjects) {
        const timetable = {};
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        
        days.forEach(day => {
            timetable[day] = Array(8).fill(null);
        });

        // First, schedule lab sessions with better distribution
        const labSubjects = sortedSubjects.filter(s => s.isLab);
        const regularSubjects = sortedSubjects.filter(s => !s.isLab);

        // Schedule labs - three times a week with 2 continuous hours each
        labSubjects.forEach(lab => {
            let labSessionsScheduled = 0;
            const requiredLabSessions = 3;
            const availableDays = [...days];
            let attempts = 0;
            const maxAttempts = 100;
            
            // Schedule lab sessions first
            while (labSessionsScheduled < requiredLabSessions && 
                   availableDays.length > 0 && 
                   attempts < maxAttempts) {
                const randomIndex = Math.floor(Math.random() * availableDays.length);
                const day = availableDays[randomIndex];
                
                // Try different starting slots
                const possibleStartSlots = [0, 1, 3, 4, 6]; // Avoiding break times
                const randomStartSlot = possibleStartSlots[Math.floor(Math.random() * possibleStartSlots.length)];
                
                const labSubject = { ...lab, isLabSession: true };
                if (this.isValidSlotForSubject(timetable, day, randomStartSlot, labSubject) && 
                    this.isValidSlotForSubject(timetable, day, randomStartSlot + 1, labSubject)) {
                    timetable[day][randomStartSlot] = labSubject;
                    timetable[day][randomStartSlot + 1] = labSubject;
                    labSessionsScheduled++;
                    availableDays.splice(randomIndex, 1);
                }
                attempts++;
            }

            // Now schedule theory classes for this lab subject
            if (lab.hoursPerWeek > 0) {
                let theoryHoursLeft = lab.hoursPerWeek;
                attempts = 0;
                
                // Create a theory version of the lab subject
                const theorySubject = {
                    ...lab,
                    isLab: false, // This ensures it's treated as a theory class
                    isTheoryOfLab: true // New flag to identify theory classes of lab subjects
                };

                while (theoryHoursLeft > 0 && attempts < maxAttempts) {
                    const day = days[Math.floor(Math.random() * days.length)];
                    const possibleSlots = [0, 1, 3, 4, 6, 7]; // Avoiding break times
                    const slot = possibleSlots[Math.floor(Math.random() * possibleSlots.length)];
                    
                    if (this.isValidSlotForSubject(timetable, day, slot, theorySubject)) {
                        timetable[day][slot] = theorySubject;
                        theoryHoursLeft--;
                    }
                    attempts++;
                }
            }
        });

        // Schedule regular subjects
        regularSubjects.forEach(subject => {
            let hoursLeft = subject.hoursPerWeek;
            let attempts = 0;
            const maxAttempts = 150;
            
            while (hoursLeft > 0 && attempts < maxAttempts) {
                const day = days[Math.floor(Math.random() * days.length)];
                const possibleSlots = [0, 1, 3, 4, 6, 7];
                const slot = possibleSlots[Math.floor(Math.random() * possibleSlots.length)];
                
                if (this.isValidSlotForSubject(timetable, day, slot, subject)) {
                    timetable[day][slot] = subject;
                    hoursLeft--;
                }
                attempts++;
            }
        });

        return timetable;
    },

    findFreeSlots(timetable) {
        const freeSlots = [];
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        days.forEach(day => {
            timetable[day].forEach((slot, index) => {
                if (!slot) {
                    freeSlots.push({
                        day,
                        slotIndex: index,
                        timeSlot: this.timeSlots[index]
                    });
                }
            });
        });

        return freeSlots;
    },

    addActivityToFreeSlot(timetable, activity, day, slotIndex) {
        const newTimetable = JSON.parse(JSON.stringify(timetable));
        newTimetable[day][slotIndex] = {
            name: activity.name,
            code: 'FREE-' + Math.random().toString(36).substr(2, 5),
            isCustomActivity: true
        };
        return newTimetable;
    },

    // Helper method to shuffle array
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
};