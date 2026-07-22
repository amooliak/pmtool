const test = require('node:test');
const assert = require('node:assert/strict');
const { escapeHtml, filterProjects, nextProjectId, validateProjectInput } = require('../utils.js');

const projects = [
  { id: 'PRJ-001', name: 'Website Redesign', manager: 'Sarah Chen', status: 'On Track' },
  { id: 'PRJ-008', name: 'ERP Migration', manager: 'James Wilson', status: 'At Risk' }
];

test('nextProjectId creates the next padded project ID', () => {
  assert.equal(nextProjectId(projects), 'PRJ-009');
});

test('filterProjects filters by status and searchable fields', () => {
  assert.deepEqual(filterProjects(projects, 'At Risk', ''), [projects[1]]);
  assert.deepEqual(filterProjects(projects, 'All', 'sarah'), [projects[0]]);
  assert.deepEqual(filterProjects(projects, 'All', 'PRJ-008'), [projects[1]]);
});

test('escapeHtml prevents project names from injecting markup', () => {
  assert.equal(escapeHtml('<script>"x"</script>'), '&lt;script&gt;&quot;x&quot;&lt;/script&gt;');
});

test('validateProjectInput accepts a valid project', () => {
  const valid = { name: 'New project', id: 'PRJ-009', manager: 'Sarah Chen', start: '2026-01-01', target: '2026-02-01', progress: 10, budget: 100, savings: 20 };
  assert.deepEqual(validateProjectInput(valid, projects), []);
});

test('validateProjectInput rejects duplicate IDs and invalid dates', () => {
  const invalid = { name: 'New project', id: 'PRJ-001', manager: 'Sarah Chen', start: '2026-03-01', target: '2026-02-01', progress: 101, budget: -1, savings: 0 };
  const errors = validateProjectInput(invalid, projects);
  assert.ok(errors.some(error => error.includes('already in use')));
  assert.ok(errors.some(error => error.includes('target date')));
  assert.ok(errors.some(error => error.includes('between 0 and 100')));
  assert.ok(errors.some(error => error.includes('cannot be negative')));
});
