(function (root) {
  'use strict';

  function escapeHtml(value = '') {
    return String(value).replace(/[&<>'"]/g, character => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    })[character]);
  }

  function nextProjectId(projects) {
    const highest = Math.max(0, ...projects.map(project => Number(project.id.match(/\d+/)?.[0]) || 0));
    return `PRJ-${String(highest + 1).padStart(3, '0')}`;
  }

  function filterProjects(projects, status = 'All', query = '') {
    const term = query.trim().toLowerCase();
    return projects.filter(project =>
      (status === 'All' || project.status === status) &&
      (!term || `${project.name} ${project.id} ${project.manager}`.toLowerCase().includes(term))
    );
  }

  function validateProjectInput(project, projects, originalId = null) {
    const errors = [];
    if (!project.name.trim()) errors.push('Enter a project name.');
    if (!/^PRJ-\d{3,}$/.test(project.id)) errors.push('Use a project ID such as PRJ-009.');
    if (projects.some(item => item.id === project.id && item.id !== originalId)) errors.push('That project ID is already in use.');
    if (!project.manager) errors.push('Select a project manager.');
    if (!project.start) errors.push('Choose a start date.');
    if (!project.target) errors.push('Choose a target completion date.');
    if (project.start && project.target && project.target < project.start) errors.push('The target date must be after the start date.');
    if (!Number.isFinite(project.progress) || project.progress < 0 || project.progress > 100) errors.push('Progress must be between 0 and 100.');
    if (project.budget < 0 || project.savings < 0) errors.push('Cost and savings cannot be negative.');
    return errors;
  }

  const api = { escapeHtml, nextProjectId, filterProjects, validateProjectInput };
  root.PMUtils = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
