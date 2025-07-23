const intervalTime = 3 * 24 * 60 * 60 * 1000;


let startTimestamp = parseInt(localStorage.getItem('startTimestamp')) || Date.now();


if (!localStorage.getItem('startTimestamp')) {
    localStorage.setItem('startTimestamp', startTimestamp);
}


function updateCountdown() {
    const countdown = document.getElementById('countdown');
    let startTimestamp = parseInt(localStorage.getItem('startTimestamp')) || Date.now();
    const endTime = startTimestamp + intervalTime; 
    const now = Date.now();
    const remaining = endTime - now; 

    if (remaining <= 0) {
       
        countdown.textContent = "🚨 Novos exercícios disponíveis!";
        
        updateExerciseIndex();
        localStorage.setItem('startTimestamp', Date.now());

        
        renderExercises();
        updateProgress();
        return;
    }

    
    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

    
    countdown.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

let exercises = []; 
let exerciseIndex = 0; 


fetch('exercises.json')
  .then(response => response.json())
  .then(data => {
    exercises = data.exercises;

   
    exerciseIndex = parseInt(localStorage.getItem('exerciseIndex')) || 0;

    renderExercises(); 
    updateProgress(); 
    showLastCompletedDate(); 
    updateCountdown();
    setInterval(updateCountdown, 1000); 
  });

function updateExerciseIndex() {
    exerciseIndex += 3; 

   
    if (exerciseIndex >= exercises.length) {
        exerciseIndex = 0;
    }

    localStorage.setItem('exerciseIndex', exerciseIndex);
}


function renderExercises() {
    const container = document.getElementById("exercise-list");
    container.innerHTML = ""; 

    const exercisesToDisplay = exercises.slice(exerciseIndex, exerciseIndex + 3);

    exercisesToDisplay.forEach(ex => {
        const section = document.createElement("section");
        section.className = "container";

        const label = document.createElement("label");
        label.className = "task-item";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = ex.id;
        checkbox.className = "exercise-checkbox";

        const savedState = localStorage.getItem(ex.id);
        checkbox.checked = savedState === "true";

        checkbox.addEventListener("change", () => {
            localStorage.setItem(ex.id, checkbox.checked);
            updateProgress();
            checkAllTasksCompleted();
        });

        const div = document.createElement("div");
        const h4 = document.createElement("h4");
        h4.innerText = ex.title;

        const p = document.createElement("p");
        p.innerText = ex.description;

        div.appendChild(h4);
        div.appendChild(p);
        label.appendChild(checkbox);
        label.appendChild(div);
        section.appendChild(label);
        container.appendChild(section);
    });
}

function updateProgress() {
    const checkboxes = document.querySelectorAll('.exercise-checkbox');
    const total = checkboxes.length;
    const checked = Array.from(checkboxes).filter(cb => cb.checked).length;
    const percent = total === 0 ? 0 : Math.round((checked / total) * 100);

    const progressFill = document.getElementById('progress-fill');
    const progressText = document.querySelector('.progress-text');

    progressFill.style.width = `${percent}%`;
    progressText.textContent = `${percent}% concluído`;
}

function checkAllTasksCompleted() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    const allCompleted = [...checkboxes].every(cb => cb.checked);

    if (allCompleted) {
        
        const now = new Date();
        const formattedDate = now.toLocaleString();
        localStorage.setItem('lastcompleted', formattedDate);
        showLastCompletedDate();
    }
}

function showLastCompletedDate() {
    const lastDate = localStorage.getItem('lastcompleted');
    if (lastDate) {
        document.getElementById('last-completed').innerText =
            `✅ Parabéns! Todas as tarefas foram completadas pela última vez em: ${lastDate}`;
    }
}

function resetProgress() {
    const modal = document.getElementById("confirmModal");
    modal.classList.remove("hidden");

  
    document.getElementById("confirmReset").onclick = () => {
       
        exercises.slice(exerciseIndex, exerciseIndex + 3).forEach(ex => {
            localStorage.removeItem(ex.id);
        });

        localStorage.removeItem('lastcompleted');
        document.getElementById('last-completed').innerText = ""; 

        renderExercises();
        updateProgress();
        modal.classList.add("hidden");
    };

    document.getElementById("cancelReset").onclick = () => {
        modal.classList.add("hidden");
    };
}

    let videoAtual = null;


    function escolherVideoPorHorario() {
        const hora = new Date().getHours();
        const videoContainer = document.getElementById('myvideo-container');


        let src;
        if (hora >= 7 && hora < 20) {
            
            src = "img/girl steam.mp4";
        } else {
            
            src="img/girl steam night.mp4";
        }
        
        if (src !== videoAtual) {
           videoAtual = src;

           const videoAtualElemento = document.querySelector('#myvideo-container video');
           if (videoAtualElemento) {
            
           videoContainer.style.transition = 'opacity 0.8s ease-in-out';
           videoContainer.style.opacity = 0;

           setTimeout(() => {
            
           videoContainer.innerHTML = `
              <video autoplay muted loop id="myvideo">
                <source src="${src}" type="video/mp4">
              </video>
           `;

           const novoVideo = videoContainer.querySelector('video');
           novoVideo.addEventListener('loadeddata', () => {
            videoContainer.style.opacity = 1;
           });

        },800); 
     } else {
        videoContainer.innerHTML = `
        <video autoplay muted loop id="myvideo" style="opacity:1; transition: opacity 0.8s ease-in-out.">
        <source src="${src}" type="video/mp4">
        `;
    }
  }

}

    escolherVideoPorHorario();

    setInterval(escolherVideoPorHorario, 300000);
