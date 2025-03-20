// Auth state management
let authToken = localStorage.getItem('authToken');
let currentTaskId = null;

// Login function
async function login(email, password) {
    try {
        const response = await fetch('https://taskmaster-ch2e.onrender.com/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });
        
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Login failed');
        }
        
        authToken = data.token;
        localStorage.setItem('authToken', authToken);
        await loadTasks(); // Wait for tasks to load
        showTaskUI(); // Only show UI after successful login
    } catch (error) {
        console.error('Login error:', error);
        alert(error.message);
        showLoginForm(); // Ensure login form is shown on error
        return false;
    }
}


// Register function
async function register(email, password) {
    try {
        const response = await fetch('https://taskmaster-ch2e.onrender.com/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });
        
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error);
        }
        
        alert('Registration successful! Please log in.');
        showLoginForm();
    } catch (error) {
        console.error('Registration error:', error);
        alert(error.message);
    }
}

document.querySelector('#insert').onclick = async function(){
    if(document.querySelector('#new input').value.length == 0){
        alert("Please Enter a Task")
    }
    else{
        const taskName = document.querySelector('#new input').value;
        const priority = document.querySelector('#priority').value;
        
        try {
            const response = await fetch('https://taskmaster-ch2e.onrender.com/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ 
                    task_name: taskName,
                    priority: parseInt(priority)
                }),
            });
            
            if (!response.ok) {
                throw new Error('Failed to create task');
            }
            
            const result = await response.json();
            
            // Add task to UI with priority indicator
            document.querySelector('#current').innerHTML += `
                <div class="task priority-${priority}" data-id="${result.id}">
                    <span id="taskname">
                        ${taskName}
                    </span>
                    <div class="priority-indicator">Priority: ${priority}</div>
                    <div class="task-buttons">
                        <button class="edit">
                            <i class="fas fa-pen"></i>
                        </button>
                        <button class="delete">
                            <i class="fas fa-check"></i>
                        </button>
                    </div>
                </div>
            `;
            
            attachEventListeners();
            document.querySelector("#new input").value = "";
        } catch (error) {
            console.error('Error:', error);
            if (error.message.includes('401') || error.message.includes('403')) {
                showLoginForm(); // Show login form if authentication failed
            } else {
                alert('Failed to add task. Please try again.');
            }
        }
    }
}

function attachEventListeners() {
    var current_tasks = document.querySelectorAll(".delete");
    var edit_buttons = document.querySelectorAll(".edit");
    for(var i=0; i<current_tasks.length; i++){
        current_tasks[i].onclick = async function(){
            var taskElement = this.closest('.task');
            var taskId = taskElement.getAttribute('data-id');
            var taskName = taskElement.querySelector('#taskname').innerText;
            
            try {
                const response = await fetch(`https://taskmaster-ch2e.onrender.com/tasks/${taskId}/complete`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${authToken}`
                    }
                });
                
                if (!response.ok) {
                    throw new Error('Failed to update task');
                }
                
                document.querySelector('#newcurrent').innerHTML += `
                    <div class="completedtask">
                        <span id="taskname completed">
                            ${taskName}
                        </span>
                    </div>
                `;
                taskElement.remove();
            } catch (error) {
                console.error('Error:', error);
                alert('Failed to complete task. Please try again.');
            }
        }
    }

    for(var i=0; i<edit_buttons.length; i++){
        edit_buttons[i].onclick = function(){
            var taskElement = this.closest('.task');
            var taskNameElement = taskElement.querySelector('#taskname');
            var taskName = taskNameElement.innerText;
            var currentPriority = parseInt(taskElement.className.match(/priority-(\d)/)[1]);
            
            taskElement.classList.add('editing');
            taskElement.innerHTML = `
                <input type="text" value="${taskName}">
                <select class="edit-priority">
                    <option value="1" ${currentPriority === 1 ? 'selected' : ''}>Priority 1 (Highest)</option>
                    <option value="2" ${currentPriority === 2 ? 'selected' : ''}>Priority 2</option>
                    <option value="3" ${currentPriority === 3 ? 'selected' : ''}>Priority 3</option>
                    <option value="4" ${currentPriority === 4 ? 'selected' : ''}>Priority 4</option>
                    <option value="5" ${currentPriority === 5 ? 'selected' : ''}>Priority 5 (Lowest)</option>
                </select>
                <div class="edit-buttons">
                    <button class="save">
                        <i class="fas fa-save"></i>
                    </button>
                    <button class="cancel">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
    
            var saveButton = taskElement.querySelector('.save');
            var cancelButton = taskElement.querySelector('.cancel');
    
            saveButton.onclick = async function() {
                var newTaskName = taskElement.querySelector('input').value;
                var newPriority = taskElement.querySelector('.edit-priority').value;
                var taskId = taskElement.getAttribute('data-id');
    
                try {
                    const response = await fetch(`https://taskmaster-ch2e.onrender.com/tasks/${taskId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${authToken}`,
                        },
                        body: JSON.stringify({ 
                            task_name: newTaskName,
                            priority: parseInt(newPriority)
                        }),
                    });
    
                    if (!response.ok) {
                        throw new Error('Failed to update task');
                    }
    
                    // Remove old priority classes
                    taskElement.classList.remove('priority-1', 'priority-2', 'priority-3', 'priority-4', 'priority-5');
                    // Add new priority class
                    taskElement.classList.add(`priority-${newPriority}`);
    
                    taskElement.innerHTML = `
                        <span id="taskname">
                            ${newTaskName}
                        </span>
                        <div class="priority-indicator">Priority: ${newPriority}</div>
                        <div class="task-buttons">
                            <button class="edit">
                                <i class="fas fa-pen"></i>
                            </button>
                            <button class="delete">
                                <i class="fas fa-check"></i>
                            </button>
                        </div>
                    `;
                    taskElement.classList.remove('editing');
                    attachEventListeners();
                } catch (error) {
                    console.error('Error:', error);
                    alert('Failed to update task. Please try again.');
                }
            };
    
            cancelButton.onclick = function() {
                taskElement.innerHTML = `
                    <span id="taskname">
                        ${taskName}
                    </span>
                    <div class="priority-indicator">Priority: ${currentPriority}</div>
                    <div class="task-buttons">
                        <button class="edit">
                            <i class="fas fa-pen"></i>
                        </button>
                        <button class="delete">
                            <i class="fas fa-check"></i>
                        </button>
                    </div>
                `;
                taskElement.classList.remove('editing');
                attachEventListeners();
            };
        }
    }

    var taskNames = document.querySelectorAll(".task #taskname");
    for(var i=0; i<taskNames.length; i++){
        taskNames[i].onclick = function(event){
            event.stopPropagation(); // Prevent event from bubbling up to parent elements
            this.classList.toggle('completed');
        }
    }

    var taskNames = document.querySelectorAll(".task #taskname");
    for(var i=0; i<taskNames.length; i++){
      taskNames[i].onclick = async function(event){
        event.stopPropagation();
        const taskElement = this.closest('.task');
        currentTaskId = taskElement.getAttribute('data-id');
        
        try {
            const response = await fetch(`https://taskmaster-ch2e.onrender.com/tasks/${currentTaskId}/details`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            
            const modal = document.getElementById('taskDetailsModal');
            const form = document.getElementById('taskDetailsForm');
            const descriptionInput = document.getElementById('taskDescription');
            const startDateTimeInput = document.getElementById('startDateTime');
            const endDateTimeInput = document.getElementById('endDateTime');
            
            if (response.ok) {
                const details = await response.json();
                descriptionInput.value = details.description || '';
                startDateTimeInput.value = details.start_datetime ? new Date(details.start_datetime).toISOString().slice(0, 16) : '';
                endDateTimeInput.value = details.end_datetime ? new Date(details.end_datetime).toISOString().slice(0, 16) : '';
            } else {
                descriptionInput.value = '';
                startDateTimeInput.value = '';
                endDateTimeInput.value = '';
            }
            
            modal.classList.remove('hidden');
        } catch (error) {
            console.error('Error fetching task details:', error);
            alert('Error loading task details');
        }
    }
 }
}

function initializeSorting() {
    const sortSelect = document.querySelector('#sortTasks');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            sortTasks(e.target.value);
        });
        
        // Initial sort
        sortTasks(sortSelect.value);
    }
}

function sortTasks(sortType) {
    const tasksContainer = document.querySelector('#current');
    const tasks = Array.from(tasksContainer.children);
    
    tasks.sort((a, b) => {
        switch(sortType) {
            case 'priority-asc':
                // Higher priority (lower number) comes first
                const priorityA = parseInt(a.className.match(/priority-(\d)/)[1]);
                const priorityB = parseInt(b.className.match(/priority-(\d)/)[1]);
                return priorityA - priorityB;
            
            case 'priority-desc':
                // Lower priority (higher number) comes first
                const priorityADesc = parseInt(a.className.match(/priority-(\d)/)[1]);
                const priorityBDesc = parseInt(b.className.match(/priority-(\d)/)[1]);
                return priorityBDesc - priorityADesc;
            
            case 'name-asc':
                // A to Z
                const nameA = a.querySelector('#taskname').textContent.trim().toLowerCase();
                const nameB = b.querySelector('#taskname').textContent.trim().toLowerCase();
                return nameA.localeCompare(nameB);
            
            case 'name-desc':
                // Z to A
                const nameADesc = a.querySelector('#taskname').textContent.trim().toLowerCase();
                const nameBDesc = b.querySelector('#taskname').textContent.trim().toLowerCase();
                return nameBDesc.localeCompare(nameADesc);
            
            default:
                return 0;
        }
    });
    
    // Clear and re-append sorted tasks
    tasksContainer.innerHTML = '';
    tasks.forEach(task => tasksContainer.appendChild(task));
}

async function deleteCompletedTasks() {
    try {
        const response = await fetch('https://taskmaster-ch2e.onrender.com/tasks/completed', {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete completed tasks');
        }
        
        const result = await response.json();
        console.log(result.message);
        
        // Clear the completed tasks from the UI
        document.querySelector('#newcurrent').innerHTML = '';
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to delete completed tasks. Please try again.');
    }
}

// Modal event listeners
document.querySelector('.close-modal').addEventListener('click', () => {
    document.getElementById('taskDetailsModal').classList.add('hidden');
});

document.querySelector('.modal-overlay').addEventListener('click', () => {
    document.getElementById('taskDetailsModal').classList.add('hidden');
});

document.getElementById('taskDetailsForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const description = document.getElementById('taskDescription').value;
    const startDateTime = document.getElementById('startDateTime').value;
    const endDateTime = document.getElementById('endDateTime').value;
    
    try {
        const method = 'POST'; // You might want to check if details exist first and use PUT instead
        const response = await fetch(`https://taskmaster-ch2e.onrender.com/tasks/${currentTaskId}/details`, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                description,
                start_datetime: startDateTime,
                end_datetime: endDateTime
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to save task details');
        }
        
        document.getElementById('taskDetailsModal').classList.add('hidden');
        alert('Task details saved successfully!');
    } catch (error) {
        console.error('Error saving task details:', error);
        alert('Error saving task details');
    }
});

// Load tasks on page load
async function loadTasks() {
    try {
        const response = await fetch('https://taskmaster-ch2e.onrender.com/tasks', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const tasks = await response.json();
        
        // Sort tasks by priority
        tasks.sort((a, b) => a.priority - b.priority);
        
        document.querySelector('#current').innerHTML = '';
        document.querySelector('#newcurrent').innerHTML = '';
        
        tasks.forEach(task => {
            if (task.status === 'pending') {
                document.querySelector('#current').innerHTML += `
                    <div class="task priority-${task.priority}" data-id="${task.id}">
                        <span id="taskname">
                            ${task.task_name}
                        </span>
                        <div class="priority-indicator">Priority: ${task.priority}</div>
                        <div class="task-buttons">
                            <button class="edit">
                                <i class="fas fa-pen"></i>
                            </button>
                            <button class="delete">
                                <i class="fas fa-check"></i>
                            </button>
                        </div>
                    </div>
                `;
            } else if (task.status === 'completed') {
                document.querySelector('#newcurrent').innerHTML += `
                    <div class="completedtask">
                        <span id="taskname completed">
                            ${task.task_name}
                        </span>
                    </div>
                `;
            }
        });
        
        attachEventListeners();
        initializeSorting(); 
    } catch (error) {
        console.error('Error loading tasks:', error);
        if (error.message.includes('401') || error.message.includes('403')) {
            showLoginForm();
        }
    }
}