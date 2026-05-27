<script setup>

// Imports
import Header from './components/Header.vue';
import Footer from './components/Footer.vue';
import { ref, onMounted, computed } from 'vue';

// Reactive state variables enabling dynamic behaviour
const tasks = ref([]);
const newTask = ref("");
const category = ref("");
const priority = ref("");
const dueDate = ref("");
const errorMsg = ref("");
const loading = ref(true);

// Modal states
const showModal = ref(false);
const editTaskId = ref(null);
const editTitle = ref("");

const showDeleteModal = ref(false);
const deleteTaskId = ref(null);

const showAlertModal = ref(false);
const alertMessage = ref("");

// API configuration (backend communication)
const API_URL = "http://localhost:3000/tasks/";
const HEADERS = { "Content-Type": "application/json"};

// Backend call that fetches task data when the webpage loads
onMounted(async () => {
  try {
  const response = await fetch(API_URL);
  const data = await response.json();
  tasks.value = data;
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
    errorMsg.value = "Could not load tasks!";
  } finally {
    loading.value = false;
  }
});

// Automatically calculates task completion 
const completedTasks = computed(() => {
  return tasks.value.filter(task => task.completion).length;
});

const incompletedTasks = computed(() => {
  return tasks.value.filter(task => !task.completion).length;
});

// Checks task status based on due date, overdue or due today 
const isOverdue = (task) => {
  if (!task.dueDate) return false;

  const today = new Date();
  const due = new Date(task.dueDate);

  return !task.completion && due < today; 
};

const isDueToday = (task) => {
  if (!task.dueDate) return false;

  const today = new Date();
  const due = new Date(task.dueDate);

  return (!task.completion && 
  due.getFullYear() === today.getFullYear() && 
  due.getMonth() === today.getMonth() && 
  due.getDate() === today.getDate());
};

// Add new task
const addTask = async () => {
  if (!newTask.value.trim()) return;
  if (!category.value || !priority.value) {
    alertMessage.value = "Select a category & priority";
    showAlertModal.value = true;
    return;
  } 

  const newTaskEntry = {taskTitle: newTask.value, category: category.value, priority: priority.value, dueDate: dueDate.value};
  
  const response = await fetch(API_URL, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify(newTaskEntry)
  });

  const data = await response.json();
  tasks.value.push(data);

  newTask.value = "";
  category.value = "";
  priority.value = "";
  dueDate.value = "";
};

// Update task title
const openEditModal = (task) => {
  editTaskId.value = task.id;
  editTitle.value = task.taskTitle;
  showModal.value = true;
};

const saveTaskUpdate = async () => {
  if (!editTitle.value.trim()) return;
  
  const response = await fetch(API_URL + editTaskId.value, {
    method: "PUT",
    headers: HEADERS,
    body: JSON.stringify({ taskTitle: editTitle.value})
  });

  const updated = await response.json();
  
  const index = tasks.value.findIndex((task) => task.id === editTaskId.value);
  if (index !== -1) {
    tasks.value[index] = updated; 
  }

  showModal.value = false; 
};

// Remove task
const removeTask = (id) => {
  deleteTaskId.value = id;
  showDeleteModal.value = true;
};

const confirmDelete = async () => {
  const response = await fetch(API_URL + deleteTaskId.value, { method: "DELETE" });
  
  const data = await response.json();
  tasks.value = tasks.value.filter((task) => task.id !== deleteTaskId.value);
  
  alertMessage.value = data.message;
  showAlertModal.value = true; 
  showDeleteModal.value = false;
};

// Toggle task completion 
const selectCompletion = async (task) => {
  const response = await fetch(API_URL + task.id, {
    method: "PUT",
    headers: HEADERS,
    body: JSON.stringify({ completion: !task.completion })
  });

  const updated = await response.json();
  task.completion = updated.completion; 
};

</script>

<template>
  
  <!-- Header section -->
  <Header/>
  
  <!-- Primary content area -->
  <main>
    
    <!-- Loading and error handling -->
    <p v-if="loading">Fetching your tasks...</p>
    
    <p v-if="errorMsg" class="server-error">
      {{ errorMsg }}
    </p>  
    
    <!-- Task input form -->
    <div class="form">
      
      <input v-model="newTask" placeholder="Enter task description">

      <div class="dropdowns">
        <select v-model="category">
          <option disabled value="">Select Category</option>
          <option>School</option>
          <option>Work</option>
          <option>Personal</option>
        </select>
      
        <select v-model="priority">
          <option disabled value="">Select Priority</option>      
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
      </div>

      <input type="date" v-model="dueDate">

      <!-- Task counter -->
      <div class="task-counter">
        &#x2705 {{ completedTasks }} completed | &#8987 {{ incompletedTasks }} remaining
      </div>

      <button @click="addTask">Add Task</button>
    
    </div>
    
    <!-- Task card list section -->
    <div>
      <ul>
        
        <li v-for="task in tasks" v-bind:key="task.id" class="task-card" v-bind:class="task.priority.toLowerCase()">
          
          <div class="main-task">
            
            <div class="task-row1">
              
              <div class="left-checkbox">
                <input type="checkbox" v-bind:checked="task.completion" @change="selectCompletion(task)" class="custom-checkbox">
                
                <div class="taskTitle" :class="{ done: task.completion}">
                  {{ task.taskTitle }}
                </div>  

                <div class="task-button">
                  <button @click="openEditModal(task)">Update</button>
                  <button @click="removeTask(task.id)">Remove</button>
                </div>
              </div>  
            </div>
      
            <div class="category-priority">
              <span class="category">{{ task.category }}</span>
              
              <span class="priority" v-bind:class="task.priority.toLowerCase()">{{ task.priority }}</span>
              
              <span class="date" v-if="task.dueDate" :class="{ overdue: isOverdue(task), today: isDueToday(task)}">
                {{ isDueToday(task) ? "Due Today:" : isOverdue(task) ? "Overdue:" : "Due By:" }} {{ task.dueDate }}
              </span>
            </div>
          
          </div>  
        </li>

      </ul>

      <!-- Update, delete and alert modals -->
      <div v-if="showModal" class="modal-overlay">
        <div class="modal">
          <h3>Update Task</h3>
          <input v-model="editTitle">

          <div class="modal-buttons">
            <button @click="saveTaskUpdate">Update</button>
            <button @click="showModal = false">Cancel</button>
          </div>
        </div>
      </div>

      <div v-if="showDeleteModal" class="modal-overlay">
        <div class="modal">
          <h3>Confirm Task Removal</h3>
          <p>Are you sure you want to remove your task?</p>

          <div class="modal-buttons">
            <button @click="confirmDelete">Yes</button>
            <button @click="showDeleteModal = false">Cancel</button>
          </div>
        </div>
      </div>
    
      <div v-if="showAlertModal" class="modal-overlay">
        <div class="modal">
          <p>{{ alertMessage }}</p>

          <div class="modal-buttons">
            <button @click="showAlertModal = false">OK</button>
          </div>
        </div>
      </div>

    </div>
    
  </main>

<!-- Footer section -->  
<Footer/>

</template>

<style scoped>
  
  /* Main layout and page structure */
  main {
    background-color:  wheat;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    width: 100%;
  }

  /* Error message styling */
  .server-error {
  color: red;
  background: white;
  padding: 10px;
  border: 1px solid red;
  border-radius: 8px;
  max-width: 400px;
  margin: 20px auto;
  text-align: center;
}

/* Form styling */
.form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 40px;
  width: 100%;
  max-width: 400px;
}

/* Input field styling */
input {
  width: 100%;
  box-sizing: border-box;
}

/* Shared form elements */
input,
select,
button {
  font-size: clamp(14px, 1.2vw, 16px);
  padding: clamp(8px, 1vw, 10px);
}

/* Dropdown layout styling */
.dropdowns {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

/* Task counter styling */
.task-counter {
  margin-top: 5px;
  margin-bottom: 5px;
  font-size: 14px;
  color: #555;
}

/* Form button styling */
.form button {
  background-color: rgb(76, 171, 76);
  border-radius: 6px;
  cursor: pointer;
  border: none;
  color: white;
  box-shadow: 0 3px rgba(0,0,0,0.1);
  transition-duration: 0.4s;
}

.form button:hover {
  background-color: green;
  color: white;
}

/* Task card styling */
.task-card {
background: white;
padding: 16px;
margin: 12px 0;
width: 100%;
max-width: 420px;
border-radius: 12px;
box-shadow: 0 6px 15px rgba(0,0,0,0.08);
border-left: 6px solid gray;
transition: 0.2s;
overflow: hidden;
}

.task-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.12);
}

/* Task layout (inside task card) */
.main-task {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Checkbox and task title row layout */
.left-checkbox {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.left-checkbox input {
  width: auto;
  cursor: pointer;
}

/* Task title styling */
.taskTitle {
  font-size: 16px;
  font-weight: bold;
  color: black;
  overflow-wrap: break-word;
  flex: 1;
  min-width: 0;
}

/* Task completion styling */
.done {
  text-decoration: line-through;
  opacity: 0.6;
}

/* Task button layout container */
.task-button {
  display: flex;
  gap: 8px;
}

/* Task button styling inside container */
.task-button button {
  padding: clamp(6px, 1vw, 8px);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  border: 2px solid transparent;
  transition: all 0.2s ease;
}

.task-button button:hover {
  border: 2px solid #2196f3;
  box-shadow: 0 0 5px rgba(33, 150, 243, 0.5);
}

/* Task tags (category / priority / date) styling and layout */
.category-priority {
  display: flex;
  gap: 10px;
  margin-bottom: 5px;
}

.category {
  background-color: wheat;
  color: blue;
  padding: 4px 10px;
  border-radius: 20px;
}
  
.priority {
  background-color: wheat;
  padding: 4px 10px;
  border-radius: 20px;
}

.date {
  background-color: #e8f5e9;
  color: #2e7d32;
  padding: 4px 10px;
  border-radius: 20px;
}

/* Shared task tag elements */
.category,
.priority,
.date {
  font-size: clamp(12px, 1vw, 14px);
}

/* Priority colors */
.low {
  color: green;
  border-left-color: rgb(26, 125, 26);
}
  
.medium {
  color: orange;
  border-left-color: rgb(212, 151, 36);
}
  
.high {
  color: red;
  border-left-color: rgb(182, 32, 32);
}

/* Date status styling */
.overdue {
  background-color: #ffebee;
  color: red;
  font-weight: bold;
  border: 1px solid red;
}
  
.today {
  background-color: #fff3cd;
  color: #856404;
  font-weight: bold;
  border: 1px solid #ffeeba; 
}

/* Checkbox styling */
.custom-checkbox {
  appearance: none;
  width: 18px;
  height: 18px;
  border: 2px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
}

.custom-checkbox:checked {
  background-color: #4CAF50;
  border-color: #4CAF50;
  transform: scale(1.1);
}

.custom-checkbox:checked::after {
  content: "✓";
  color: white;
  font-size: 12px;
  position: absolute;
  top: 0;
  left: 3px;
}

.custom-checkbox:hover {
  border-color: #2196f3;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal {
  background: white;
  padding: 20px;
  border-radius: 12px;
  width: 300px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.modal-buttons {
  display: flex;
  justify-content: space-between;
}

.modal-buttons button {
  padding: clamp(6px, 1.5vw, 8px);
}

/* Mobile responsiveness */
@media (max-width: 480px) {
  .form,
  .task-card {
    max-width: 95%;
  }

  .task-row1 {
    display: flex;
    gap: 10px;
    justify-content: space-between;
    flex-wrap: wrap;
    align-items: center;
  }
    
  .task-button {
    flex-shrink: 0;
  }
}

</style>