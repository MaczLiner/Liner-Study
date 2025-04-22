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
    const startTimestamp = parseInt(localStorage.getItem('startTimestamp')) || Date.now();
    const endTime = startTimestamp + intervalTime; // Data de término (3 dias após o início)
    const now = Date.now();
    const remaining = endTime - now; // Tempo restante

    if (remaining <= 0) {
        // Se o tempo acabou, exibe aviso
        countdown.textContent = "🚨 Novos exercícios disponíveis!";
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
    // Remove o estado salvo dos exercícios visíveis
    exercises.slice(exerciseIndex, exerciseIndex + 3).forEach(ex => {
        localStorage.removeItem(ex.id);
    });

    // Re-renderiza os exercícios e atualiza a barra de progresso
    renderExercises();
    updateProgress();
}
