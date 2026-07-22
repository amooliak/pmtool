const projects = [
  ['Website Redesign','PRJ-001','Sarah Chen','Marketing','Execution','Active'],
  ['ERP Migration','PRJ-002','James Wilson','IT','Planning','Active'],
  ['Mobile App Launch','PRJ-003','Maria Lopez','Product','Testing','At Risk'],
  ['Data Warehouse','PRJ-004','David Kim','Engineering','Execution','Active'],
  ['Brand Refresh','PRJ-005','Emily Foster','Marketing','Closure','Completed'],
  ['Cloud Migration','PRJ-006','Alex Rivera','IT','Execution','Active'],
  ['Security Audit','PRJ-008','Tom Baker','Compliance','Execution','At Risk'],
  ['HR System Upgrade','PRJ-009','Rachel Green','HR','Planning','Active'],
  ['Analytics Platform','PRJ-010','Mike Chen','Engineering','Execution','Active'],
  ['Customer Portal','PRJ-007','Lisa Zhang','Product','Initiation','Active']
];

const rows = document.querySelector('#project-rows');
const empty = document.querySelector('#empty');

function render(filter = 'All Projects') {
  const visible = filter === 'All Projects' ? projects : projects.filter(project => project[5] === filter);
  rows.innerHTML = visible.map(project => {
    const statusClass = project[5] === 'Completed' ? 'completed' : project[5] === 'At Risk' ? 'risk' : '';
    const trend = ['ERP Migration','Mobile App Launch','Brand Refresh','Cloud Migration','Security Audit','Analytics Platform'].includes(project[0]) ? '<span class="trend">↗</span>' : '<span class="trend muted">−</span>';
    return `<tr><td>${project[0]}</td><td class="muted">${project[1]}</td><td>${project[2]}</td><td class="muted">${project[3]}</td><td>${project[4]}</td><td><span class="status ${statusClass}">${trend}${project[5]}</span></td></tr>`;
  }).join('');
  empty.style.display = visible.length ? 'none' : 'block';
}

document.querySelectorAll('.filters button').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('.filters button').forEach(item => item.classList.remove('active'));
  button.classList.add('active');
  render(button.dataset.filter);
}));

document.querySelectorAll('.page-tabs button').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('.page-tabs button').forEach(item => item.classList.remove('active'));
  button.classList.add('active');
}));

const menu = document.querySelector('#create-menu');
function toggleMenu() {
  menu.classList.toggle('open');
  menu.setAttribute('aria-hidden', String(!menu.classList.contains('open')));
}
document.querySelector('#fab').addEventListener('click', toggleMenu);
document.querySelector('#create-project').addEventListener('click', toggleMenu);
document.addEventListener('click', event => {
  if (!menu.contains(event.target) && !event.target.closest('#fab') && !event.target.closest('#create-project')) {
    menu.classList.remove('open');
  }
});

render();
