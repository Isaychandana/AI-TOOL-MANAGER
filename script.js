const tools = [
    {
      name: "ChatGPT",
      description: "Conversational AI by OpenAI",
      logo: "https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg",
      tags: ["Chatbot", "Text"],
      url: "https://chat.openai.com/"
    },
    {
      name: "Claude",
      description: "Anthropic's conversational AI assistant",
      logo: "https://claude.ai/favicon.ico",
      tags: ["Chatbot", "AI Assistant"],
      url: "https://claude.ai/"
    },
    {
      name: "Gemini",
      description: "Google's next-gen AI assistant",
      logo: "https://gemini.google.com/favicon.ico",
      tags: ["Chatbot", "AI Assistant"],
      url: "https://gemini.google.com/"
    }
  ];
  
  let sortAscending = true;
  let deletedToolsBackup = [];
  let undoTimeoutId = null;
  let countdownInterval = null;
  
  function displayTools(toolsToShow) {
    const toolList = document.getElementById("tool-list");
    toolList.innerHTML = "";
  
    const selectAllDiv = document.createElement("div");
    selectAllDiv.style.marginBottom = "10px";
    selectAllDiv.innerHTML = `
      <label><input type="checkbox" id="select-all-checkbox" onchange="toggleSelectAll(this)"> Select All</label>
    `;
    toolList.appendChild(selectAllDiv);
  
    toolsToShow.forEach((tool, index) => {
      const card = document.createElement("div");
      card.className = "tool-card";
  
      card.innerHTML = `
        <input type="checkbox" class="tool-checkbox" data-index="${index}" style="position: absolute; top: 10px; left: 10px; transform: scale(1.2);" onchange="handleSelectionChange()" />
        <a href="${tool.url}" target="_blank" rel="noopener noreferrer" style="text-decoration: none; color: inherit;">
          <img src="${tool.logo}" alt="${tool.name} logo" onerror="this.src='https://via.placeholder.com/50'" />
          <h3>${tool.name}</h3>
          <p>${tool.description}</p>
          <div class="tags">
            ${tool.tags.map(tag => `<span>${tag}</span>`).join("")}
          </div>
        </a>
      `;
  
      toolList.appendChild(card);
    });
  
    handleSelectionChange();
  }
  
  function toggleSelectAll(source) {
    const checkboxes = document.querySelectorAll(".tool-checkbox");
    checkboxes.forEach(cb => cb.checked = source.checked);
    handleSelectionChange();
  }
  
  function filterTools(category) {
    if (category === "All") {
      displayTools(tools);
    } else {
      const filtered = tools.filter(tool => tool.tags.includes(category));
      displayTools(filtered);
    }
  }
  
  function searchTools() {
    const query = document.getElementById("search-input").value.toLowerCase();
    const filtered = tools.filter(tool =>
      tool.name.toLowerCase().includes(query) ||
      tool.description.toLowerCase().includes(query)
    );
    displayTools(filtered);
  }
  
  function toggleTheme() {
    document.body.classList.toggle("dark-mode");
  }
  
  function toggleAddForm() {
    const form = document.getElementById("add-tool-form");
    form.style.display = form.style.display === "none" ? "block" : "none";
  }
  
  function toggleSortOrder() {
    sortAscending = !sortAscending;
    tools.sort((a, b) => sortAscending
      ? a.name.localeCompare(b.name)
      : b.name.localeCompare(a.name)
    );
    document.getElementById("sort-label").textContent = sortAscending ? "A-Z" : "Z-A";
    displayTools(tools);
  }
  
  function addNewTool() {
    const name = document.getElementById("tool-name").value;
    const description = document.getElementById("tool-description").value;
    const logo = document.getElementById("tool-logo").value;
    const tags = document.getElementById("tool-tags").value.split(",").map(tag => tag.trim());
    const url = document.getElementById("tool-url").value;
  
    if (!name || !description || !url) return alert("Please fill in all required fields");
  
    const newTool = { name, description, logo, tags, url };
    tools.push(newTool);
    displayTools(tools);
    toggleAddForm();
  }
  
  function handleSelectionChange() {
    const checkboxes = document.querySelectorAll(".tool-checkbox");
    const selected = Array.from(checkboxes).some(checkbox => checkbox.checked);
    document.getElementById("bulk-delete-container").style.display = selected ? "block" : "none";
  
    const selectAll = document.getElementById("select-all-checkbox");
    if (selectAll) {
      const allChecked = Array.from(checkboxes).every(cb => cb.checked);
      selectAll.checked = allChecked;
    }
  }
  
  function deleteSelectedTools() {
    const checkboxes = document.querySelectorAll(".tool-checkbox");
    const selectedIndexes = Array.from(checkboxes)
      .filter(checkbox => checkbox.checked)
      .map(checkbox => parseInt(checkbox.getAttribute("data-index")));
  
    if (selectedIndexes.length === 0) return;
  
    if (confirm(`Delete ${selectedIndexes.length} selected tool(s)?`)) {
      deletedToolsBackup = selectedIndexes.map(index => tools[index]);
  
      selectedIndexes.sort((a, b) => b - a).forEach(index => {
        tools.splice(index, 1);
      });
  
      displayTools(tools);
      showUndoBanner();
    }
  }
  
  function showUndoBanner() {
    let secondsLeft = 5;
    const container = document.getElementById("undo-banner");
  
    container.innerHTML = `
      <div style="background: #ffeeba; padding: 10px; border: 1px solid #f5c518; border-radius: 6px; margin-top: 10px;">
        <span>${deletedToolsBackup.length} tool(s) deleted.</span>
        <button id="undo-button">Undo (${secondsLeft}s)</button>
      </div>
    `;
    container.style.display = "block";
  
    clearInterval(countdownInterval);
    clearTimeout(undoTimeoutId);
  
    countdownInterval = setInterval(() => {
      secondsLeft--;
      const undoButton = document.getElementById("undo-button");
      if (undoButton) {
        undoButton.textContent = `Undo (${secondsLeft}s)`;
      }
      if (secondsLeft <= 0) {
        clearInterval(countdownInterval);
      }
    }, 1000);
  
    document.getElementById("undo-button").onclick = undoDelete;
  
    undoTimeoutId = setTimeout(() => {
      deletedToolsBackup = [];
      container.style.display = "none";
      clearInterval(countdownInterval);
    }, 5000);
  }
  
  function undoDelete() {
    clearTimeout(undoTimeoutId);
    clearInterval(countdownInterval);
    tools.push(...deletedToolsBackup);
    deletedToolsBackup = [];
    displayTools(tools);
    document.getElementById("undo-banner").style.display = "none";
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    displayTools(tools);
  });
  