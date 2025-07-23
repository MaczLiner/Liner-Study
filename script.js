// === CRONÔMETRO DE 3 DIAS ===

// Define o intervalo de tempo de 3 dias em milissegundos
const intervalTime = 3 * 24 * 60 * 60 * 1000;

// Recupera a data de início salva no localStorage, ou usa o momento atual
let startTimestamp = parseInt(localStorage.getItem('startTimestamp')) || Date.now();

// Se não houver timestamp salvo, salva o timestamp atual
if (!localStorage.getItem('startTimestamp')) {
    localStorage.setItem('startTimestamp', startTimestamp);
}

// Função que atualiza o cronômetro na tela
function updateCountdown() {
    const countdown = document.getElementById('countdown');
    let startTimestamp = parseInt(localStorage.getItem('startTimestamp')) || Date.now();
    const endTime = startTimestamp + intervalTime; // Data de término (3 dias após o início)
    const now = Date.now();
    const remaining = endTime - now; // Tempo restante

    if (remaining <= 0) {
        // Se o tempo acabou, exibe aviso
        countdown.textContent = "🚨 Novos exercícios disponíveis!";
        // Atualiza o índice dos exercícios e reinicia o ciclo de 3 dias
        updateExerciseIndex();
        localStorage.setItem('startTimestamp', Date.now());

        // Renderiza os novos exercícios e atualiza progresso
        renderExercises();
        updateProgress();
        return;
    }

    // Converte milissegundos restantes em dias, horas, minutos e segundos
    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

    // Atualiza o texto do cronômetro
    countdown.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
}


// === EXERCÍCIOS ===

let exercises = []; // Lista de exercícios (carregada do JSON)
let exerciseIndex = 0; // Índice inicial dos exercícios visíveis

// Carrega os exercícios do arquivo JSON externo
fetch('exercises.json')
  .then(response => response.json())
  .then(data => {
    exercises = data.exercises;

    // Recupera índice salvo no localStorage (ou começa do 0)
    exerciseIndex = parseInt(localStorage.getItem('exerciseIndex')) || 0;

    renderExercises(); // Renderiza os exercícios na tela
    updateProgress(); // Atualiza a barra de progresso
    showLastCompletedDate(); // Mostra última data de conclusão
    updateCountdown(); // Inicia o cronômetro
    setInterval(updateCountdown, 1000); // Atualiza o cronômetro a cada segundo
  });

// Atualiza o índice dos exercícios (usado após 3 dias)
function updateExerciseIndex() {
    exerciseIndex += 3; // Avança para os próximos 3 exercícios

    // Se passar do total, volta para o início
    if (exerciseIndex >= exercises.length) {
        exerciseIndex = 0;
    }

    // Salva novo índice no localStorage
    localStorage.setItem('exerciseIndex', exerciseIndex);
}

// Renderiza os exercícios na interface
function renderExercises() {
    const container = document.getElementById("exercise-list");
    container.innerHTML = ""; // Limpa o conteúdo anterior

    // Seleciona os 3 exercícios a partir do índice atual
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

        // Recupera o estado salvo da checkbox (marcado ou não)
        const savedState = localStorage.getItem(ex.id);
        checkbox.checked = savedState === "true";

        // Salva o novo estado quando checkbox for alterada
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

// Atualiza visualmente a barra de progresso
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

// Verifica se todas as tarefas exibidas estão completas
function checkAllTasksCompleted() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    const allCompleted = [...checkboxes].every(cb => cb.checked);

    if (allCompleted) {
        // Se todas estiverem marcadas, salva a data de conclusão
        const now = new Date();
        const formattedDate = now.toLocaleString();
        localStorage.setItem('lastcompleted', formattedDate);
        showLastCompletedDate();
    }
}

// Mostra na tela a última data em que tudo foi completado
function showLastCompletedDate() {
    const lastDate = localStorage.getItem('lastcompleted');
    if (lastDate) {
        document.getElementById('last-completed').innerText =
            `✅ Parabéns! Todas as tarefas foram completadas pela última vez em: ${lastDate}`;
    }
}

// Reseta o progresso (desmarca os checkboxes visíveis)
function resetProgress() {
    const modal = document.getElementById("confirmModal");
    modal.classList.remove("hidden");

    // Botão "Sim, resetar"
    document.getElementById("confirmReset").onclick = () => {
        // Executa o reset de verdade
        exercises.slice(exerciseIndex, exerciseIndex + 3).forEach(ex => {
            localStorage.removeItem(ex.id);
        });

        localStorage.removeItem('lastcompleted');
        document.getElementById('last-completed').innerText = ""; // <- limpa o texto de finalizado dia tal.

        renderExercises();
        updateProgress();
        modal.classList.add("hidden");
    };

    // Botão "Cancelar"
    document.getElementById("cancelReset").onclick = () => {
        modal.classList.add("hidden");
    };
}

    // === TROCA DINÂMICA DE VÍDEO PELO HORÁRIO ===
    let videoAtual = null;


    function escolherVideoPorHorario() {
        const hora = new Date().getHours();
        const videoContainer = document.getElementById('myvideo-container');

        // Decide qual vídeo usar com base na hora

        let src;
        if (hora >= 7 && hora < 20) {
            // Horário diurno: 07h - 19h59
            src = "img/girl steam.mp4";
        } else {
            // Horário Nortuno: 20h - 06h59
            src="img/girl steam night.mp4";
        }
        
        // Só troca se o vídeo for diferente do atual
        if (src !== videoAtual) {
           videoAtual = src;

           const videoAtualElemento = document.querySelector('#myvideo-container video');
           if (videoAtualElemento) {
            // Fade out o vídeo atual
           videoContainer.style.transition = 'opacity 0.8s ease-in-out';
           videoContainer.style.opacity = 0;

           setTimeout(() => {
            // Troca o vídeo durante o fade-out
           videoContainer.innerHTML = `
              <video autoplay muted loop id="myvideo">
                <source src="${src}" type="video/mp4">
              </video>
           `;

           // Espera o navegador preparar o novo vídeo antes do fade-in
           const novoVideo = videoContainer.querySelector('video');
           novoVideo.addEventListener('loadeddata', () => {
            videoContainer.style.opacity = 1; // Fade-in
           });

        },800); // Tempo do fade-out
     } else {
        // Se não existir vídeo (primeira cvez), só cria direto com opacidade 1
        videoContainer.innerHTML = `
        <video autoplay muted loop id="myvideo" style="opacity:1; transition: opacity 0.8s ease-in-out.">
        <source src="${src}" type="video/mp4">
        `;
    }
  }

}

    // Chama a função imediatamente ao carregar
    escolherVideoPorHorario();

    // Verifica a cada 5 minutos (300.000 ms)
    setInterval(escolherVideoPorHorario, 300000);
