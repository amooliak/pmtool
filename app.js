(function () {
  'use strict';

  const STORAGE_KEY = 'pmtool-projects';
  const { filterProjects, nextProjectId, validateProjectInput } = window.PMUtils;
  const { projectTable, filterControls, projectCard, viewTitle, accordion } = window.PMComponents;
  const content = document.querySelector('#content');
  const modal = document.querySelector('#modal');
  const form = document.querySelector('#project-form');
  const modalTitle = document.querySelector('#modal-title');
  const modalSubmit = form.querySelector('button[type="submit"]');
  const formErrors = document.querySelector('#form-errors');
  const quickMenu = document.querySelector('#quick-menu');
  const fab = document.querySelector('#fab');
  const toast = document.querySelector('#toast');

  let state = { view: 'portfolio', filter: 'All', query: '', editingId: null };
  let projects = loadProjects();
  let previousFocus = null;
  let toastTimer = null;

  function loadProjects() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return Array.isArray(stored) ? stored : structuredClone(window.PM_DATA);
    } catch (error) {
      console.warn('Saved project data could not be loaded.', error);
      return structuredClone(window.PM_DATA);
    }
  }

  function saveProjects() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    } catch (error) {
      showToast('Changes could not be saved in this browser.', true);
      console.error(error);
    }
  }

  function visibleProjects() {
    return filterProjects(projects, state.filter, state.query);
  }

  function money(value) {
    return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(value);
  }

  function metrics() {
    return {
      active: projects.filter(project => project.status !== 'Completed').length,
      attention: projects.filter(project => ['At Risk', 'Delayed'].includes(project.status)).length,
      budget: projects.reduce((sum, project) => sum + Number(project.budget || 0), 0),
      savings: projects.reduce((sum, project) => sum + Number(project.savings || 0), 0)
    };
  }

  function render() {
    document.querySelectorAll('[data-view]').forEach(button => {
      const active = button.dataset.view === state.view;
      button.classList.toggle('active', active);
      button.setAttribute('aria-current', active ? 'page' : 'false');
    });

    if (state.view === 'dashboard') renderDashboard();
    if (state.view === 'projects') renderProjects();
    if (state.view === 'portfolio') renderPortfolio();
    if (state.view === 'reports') renderReports();
    bindViewEvents();
  }

  function renderDashboard() {
    const totals = metrics();
    content.innerHTML = `${viewTitle('Dashboard', 'A live overview of your project portfolio')}
      <div class="metrics">
        <article class="metric"><p>Active projects</p><b>${totals.active}</b><small>${projects.length} total projects</small></article>
        <article class="metric"><p>Projects needing attention</p><b>${totals.attention}</b><small>At risk or delayed</small></article>
        <article class="metric"><p>Total budget</p><b>${money(totals.budget)}</b><small>Across all projects</small></article>
        <article class="metric"><p>Forecasted savings</p><b>${money(totals.savings)}</b><small>Current portfolio</small></article>
      </div>`;
  }

  function renderProjects() {
    content.innerHTML = `${viewTitle('Projects', 'Create, find and update projects across your organization', '<button class="primary create-trigger" type="button">＋ Create project</button>')}${filterControls(state.filter, state.query)}${projectCard(visibleProjects())}`;
  }

  function renderPortfolio() {
    content.innerHTML = `${viewTitle('Project portfolio', 'Track and manage projects across your organization')}${filterControls(state.filter, state.query)}${projectCard(visibleProjects())}`;
  }

  function renderReports() {
    const totals = metrics();
    content.innerHTML = `${viewTitle('Reports', 'View, compare and export project performance and financial data', '<button class="ghost export-csv" type="button">⇩ Export all</button>')}
      <div class="report-filters" aria-label="Report filters"><select aria-label="Report date"><option>All dates</option><option>This quarter</option></select><select aria-label="Report department"><option>All departments</option><option>Marketing</option><option>IT</option></select><select aria-label="Report risk"><option>All risk levels</option><option>Low</option><option>Medium</option><option>High</option></select></div>
      ${accordion('Project overview', `${projects.length} projects`, projectTable(projects), true)}
      ${accordion('Savings report', `${money(totals.savings)} forecast`, '<p class="placeholder">Detailed savings reporting is planned for the next release.</p>')}
      ${accordion('Budget report', `${money(totals.budget)} total`, '<p class="placeholder">Detailed budget reporting is planned for the next release.</p>')}`;
  }

  function bindViewEvents() {
    document.querySelectorAll('.filter').forEach(button => button.addEventListener('click', () => {
      state.filter = button.dataset.filter;
      render();
    }));
    document.querySelector('#project-search')?.addEventListener('input', event => {
      state.query = event.target.value;
      renderProjectsTableOnly();
    });
    document.querySelector('#status-filter')?.addEventListener('change', event => {
      state.filter = event.target.value;
      render();
    });
    document.querySelectorAll('.create-trigger').forEach(button => button.addEventListener('click', openCreateModal));
    document.querySelectorAll('.edit-project').forEach(button => button.addEventListener('click', () => openEditModal(button.dataset.id)));
    document.querySelectorAll('.delete-project').forEach(button => button.addEventListener('click', () => deleteProject(button.dataset.id)));
    document.querySelectorAll('.export-csv').forEach(button => button.addEventListener('click', exportCSV));
    document.querySelectorAll('.accordion-toggle').forEach(button => button.addEventListener('click', toggleAccordion));
  }

  function renderProjectsTableOnly() {
    const tableOrEmpty = document.querySelector('.card .table-wrap, .card .empty');
    if (!tableOrEmpty) return;
    tableOrEmpty.outerHTML = projectTable(visibleProjects());
    document.querySelectorAll('.edit-project').forEach(button => button.addEventListener('click', () => openEditModal(button.dataset.id)));
    document.querySelectorAll('.delete-project').forEach(button => button.addEventListener('click', () => deleteProject(button.dataset.id)));
  }

  function toggleAccordion(event) {
    const button = event.currentTarget;
    const body = document.querySelector(`#${button.getAttribute('aria-controls')}`);
    const expanded = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!expanded));
    button.querySelector('.arrow').textContent = expanded ? '›' : '⌄';
    body.hidden = expanded;
    button.closest('.accordion').classList.toggle('closed', expanded);
  }

  function showModal() {
    previousFocus = document.activeElement;
    modal.hidden = false;
    document.body.classList.add('modal-open');
    form.querySelector('input, select, textarea').focus();
  }

  function closeModal() {
    modal.hidden = true;
    document.body.classList.remove('modal-open');
    formErrors.hidden = true;
    previousFocus?.focus();
  }

  function openCreateModal() {
    state.editingId = null;
    form.reset();
    form.elements.id.value = nextProjectId(projects);
    form.elements.progress.value = 0;
    modalTitle.textContent = 'Create a new project';
    modalSubmit.textContent = 'Create project';
    showModal();
  }

  function ensureOption(select, value) {
    if (value && ![...select.options].some(option => option.value === value)) select.add(new Option(value, value));
  }

  function openEditModal(id) {
    const project = projects.find(item => item.id === id);
    if (!project) return showToast('That project could not be found.', true);
    state.editingId = id;
    ensureOption(form.elements.manager, project.manager);
    ensureOption(form.elements.department, project.dept);
    Object.entries({ ...project, department: project.dept, cost: project.budget }).forEach(([key, value]) => {
      if (form.elements[key]) form.elements[key].value = value ?? '';
    });
    modalTitle.textContent = 'Edit project';
    modalSubmit.textContent = 'Save changes';
    showModal();
  }

  function projectFromForm() {
    const data = new FormData(form);
    return {
      name: data.get('name').trim(), id: data.get('id').trim().toUpperCase(), manager: data.get('manager'), dept: data.get('department'),
      phase: state.editingId ? projects.find(project => project.id === state.editingId)?.phase || 'Initiation' : 'Initiation',
      status: data.get('status'), risk: data.get('risk'), progress: Number(data.get('progress')), budget: Number(data.get('cost') || 0),
      savings: Number(data.get('savings') || 0), start: data.get('start'), target: data.get('target'), description: data.get('description').trim(), blockers: data.get('blockers').trim()
    };
  }

  function submitProject(event) {
    event.preventDefault();
    const project = projectFromForm();
    const errors = validateProjectInput(project, projects, state.editingId);
    if (errors.length) {
      formErrors.innerHTML = `<strong>Please fix the following:</strong><ul>${errors.map(error => `<li>${window.PMUtils.escapeHtml(error)}</li>`).join('')}</ul>`;
      formErrors.hidden = false;
      formErrors.focus();
      return;
    }
    if (state.editingId) projects = projects.map(item => item.id === state.editingId ? project : item);
    else projects.push(project);
    saveProjects();
    closeModal();
    state.view = 'projects';
    render();
    showToast(state.editingId ? 'Project updated.' : 'Project created.');
  }

  function deleteProject(id) {
    const project = projects.find(item => item.id === id);
    if (!project || !window.confirm(`Delete “${project.name}”? This cannot be undone.`)) return;
    projects = projects.filter(item => item.id !== id);
    saveProjects();
    render();
    showToast('Project deleted.');
  }

  function showToast(message, isError = false) {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.toggle('error', isError);
    toast.hidden = false;
    toastTimer = setTimeout(() => { toast.hidden = true; }, 3500);
  }

  function exportCSV() {
    const headers = ['Project name', 'Project ID', 'Manager', 'Department', 'Phase', 'Status', 'Risk', 'Progress'];
    const rows = visibleProjects().map(project => [project.name, project.id, project.manager, project.dept, project.phase, project.status, project.risk, `${project.progress}%`]);
    const csv = [headers, ...rows].map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    link.download = 'pmtool-projects.csv';
    link.click();
    URL.revokeObjectURL(link.href);
    showToast('CSV exported.');
  }

  document.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click', () => { state.view = button.dataset.view; render(); content.focus(); }));
  document.querySelectorAll('header .create-trigger').forEach(button => button.addEventListener('click', openCreateModal));
  fab.addEventListener('click', () => { const open = quickMenu.hidden; quickMenu.hidden = !open; fab.setAttribute('aria-expanded', String(open)); if (open) quickMenu.querySelector('button:not(:disabled)').focus(); });
  quickMenu.querySelector('.create-trigger').addEventListener('click', () => { quickMenu.hidden = true; fab.setAttribute('aria-expanded', 'false'); openCreateModal(); });
  document.querySelector('#close-modal').addEventListener('click', closeModal);
  document.querySelector('#cancel-modal').addEventListener('click', closeModal);
  modal.addEventListener('click', event => { if (event.target === modal) closeModal(); });
  form.addEventListener('submit', submitProject);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !modal.hidden) closeModal();
    if (event.key === 'Tab' && !modal.hidden) {
      const focusable = [...modal.querySelectorAll('button:not(:disabled), input, select, textarea')];
      const first = focusable[0], last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });

  render();
})();
