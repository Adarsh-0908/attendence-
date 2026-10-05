export const BRANCHES = [
  { code: 'EC', name: 'Electronics & Communication (EC)', defaultDivisions: ['EC-I', 'EC-J', 'EC-K'] },
  { code: 'ICT', name: 'Information & Communication Technology (ICT)', defaultDivisions: ['ICT-A', 'ICT-B', 'ICT-C'] },
  { code: 'CE', name: 'Computer Engineering (CE)', defaultDivisions: ['CE-1', 'CE-2', 'CE-3'] },
  { code: 'IT', name: 'Information Technology (IT)', defaultDivisions: ['IT-A', 'IT-B'] },
  { code: 'DS', name: 'Data Science (DS)', defaultDivisions: ['DS-1', 'DS-2'] },
  { code: 'Electrical', name: 'Electrical Engineering', defaultDivisions: ['EE-A', 'EE-B'] },
  { code: 'Mechanical', name: 'Mechanical Engineering', defaultDivisions: ['ME-1', 'ME-2'] },
  { code: 'Civil', name: 'Civil Engineering', defaultDivisions: ['Civil-A', 'Civil-B'] },
  { code: 'Chemical', name: 'Chemical Engineering', defaultDivisions: ['Chem-A', 'Chem-B'] },
  { code: 'IC', name: 'Instrumentation & Control (IC)', defaultDivisions: ['IC-A', 'IC-B'] },
  { code: 'PE', name: 'Petroleum Engineering (PE)', defaultDivisions: ['PE-1', 'PE-2'] },
  { code: 'E&I', name: 'Electronics & Instrumentation (E&I)', defaultDivisions: ['EI-A', 'EI-B'] },
];

export const DEFAULT_BRANCH_CODES = BRANCHES.map(b => b.code);
