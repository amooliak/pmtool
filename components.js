(function (root) {
  'use strict';
  const { escapeHtml } = root.PMUtils;

  function slug(value) {
    return value.toLowerCase().replaceAll(' ', '-');
  }

  function projectTable(projects) {
    if (!projects.length) return '<div class="empty"><h3>No projects found</h3><p>Try changing your search or filters.</p></div>';
    const rows = projects.map(project => `
      <tr>
        <td><strong>${escapeHtml(project.name)}</strong></td>
        <td>${escapeHtml(project.id)}</td>
        <td>${escapeHtml(project.manager)}</td>
        <td>${escapeHtml(project.dept)}</td>
        <td>${escapeHtml(project.phase)}</td>
        <td><span class="badge ${slug(project.status)}">${escapeHtml(project.status)}</span></td>
        <td><span class="risk ${project.risk.toLowerCase()}">${escapeHtml(project.risk)}</span></td>
        <td><span class="progress"><i class="bar" aria-hidden="true"><i style="width:${project.progress}%"></i></i><span>${project.progress}%</span></span></td>
        <td><span class="row-actions">
          <button class="icon-button edit-project" type="button" data-id="${escapeHtml(project.id)}" aria-label="Edit ${escapeHtml(project.name)}" title="Edit project">✎</button>
          <button class="icon-button danger delete-project" type="button" data-id="${escapeHtml(project.id)}" aria-label="Delete ${escapeHtml(project.name)}" title="Delete project">⌫</button>
        </span></td>
      </tr>`).join('');

    return `<div class="table-wrap" tabindex="0" aria-label="Scrollable project table">
      <table>
        <thead><tr><th>Project name</th><th>Project ID</th><th>Manager</th><th>Department</th><th>Phase</th><th>Status</th><th>Risk</th><th>Progress</th><th>Actions</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
  }

  function filterControls(activeFilter, query) {
    const filters = ['All', 'On Track', 'Completed', 'At Risk'];
    const statuses = ['All', 'On Track', 'At Risk', 'Delayed', 'Completed'];
    return `<div class="filters">
      <div class="pills" aria-label="Quick project filters">${filters.map(filter => `<button type="button" class="filter ${activeFilter === filter ? 'active' : ''}" data-filter="${filter}" aria-pressed="${activeFilter === filter}">${filter}</button>`).join('')}</div>
      <label class="visually-hidden" for="project-search">Search projects</label>
      <input id="project-search" class="search" type="search" placeholder="Search projects…" value="${escapeHtml(query)}">
      <label class="visually-hidden" for="status-filter">Filter by status</label>
      <select id="status-filter" class="status-select">${statuses.map(status => `<option ${activeFilter === status ? 'selected' : ''}>${status}</option>`).join('')}</select>
    </div>`;
  }

  function projectCard(projects) {
    return `<section class="card" aria-labelledby="projects-heading">
      <div class="card-head"><h3 id="projects-heading">Projects overview</h3><button type="button" class="ghost export-csv">⇩ Export CSV</button></div>
      ${projectTable(projects)}
    </section>`;
  }

  function viewTitle(title, subtitle, action = '') {
    return `<div class="view-title"><div><h2>${title}</h2><p>${subtitle}</p></div>${action}</div>`;
  }

  function accordion(title, summary, body, open = false) {
    const id = slug(title);
    return `<section class="accordion ${open ? '' : 'closed'}">
      <div class="accordion-head">
        <button type="button" class="accordion-toggle" aria-expanded="${open}" aria-controls="${id}"><span class="arrow" aria-hidden="true">${open ? '⌄' : '›'}</span><strong>${title}</strong></button>
        <span class="summary">${summary}</span><button type="button" class="ghost export-csv">⇩ Export CSV</button>
      </div>
      <div class="accordion-body" id="${id}" ${open ? '' : 'hidden'}>${body}</div>
    </section>`;
  }

  root.PMComponents = { projectTable, filterControls, projectCard, viewTitle, accordion };
})(window);
