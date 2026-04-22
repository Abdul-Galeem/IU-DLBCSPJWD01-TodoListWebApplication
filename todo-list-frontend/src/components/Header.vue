<template>
    
    <!-- Header content area that contains app title and slogan/logo -->
    <header>
        
        <div class="main-title">
            <h1>Productive Task Manager</h1>
        </div>

        <div class="slogan-container">
            <img class="task-icon" src="/src/assets/header-image.png">
           
            <div class="slogan">
                <h2>Stay Organized | Stay Productive</h2>
            </div> 
        </div>    

    </header>

</template>

<style scoped>
    
    /* Styles the app title */
    .main-title {
        font-size: x-large;
        text-align: center;
        padding: 20px;
        background-color: rgba(164, 116, 4, 0.467);
    }

    /* Styles the slogan */
    .slogan {
        text-align: center;
        font-style: italic;
        font-size: larger;
    }

    /* Layout container for slogan and task icon (logo) */
    .slogan-container {
        padding: 20px;
        background-color: wheat;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
    }

    /* Controls size of the task icon */
    .task-icon {
      width: 40px;  
    }

</style>