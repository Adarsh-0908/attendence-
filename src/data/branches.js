export const BRANCHES = [
  { 
    code: 'EC', 
    name: 'Electronics & Communication (EC)', 
    divisions: ['EC-I', 'EC-J', 'EC-K', 'EC-L'] 
  },
  { 
    code: 'ICT', 
    name: 'Information & Communication Technology (ICT)', 
    divisions: ['ICT-A', 'ICT-B', 'ICT-C'] 
  },
  { 
    code: 'CE', 
    name: 'Computer Engineering (CE)', 
    divisions: ['CE-1', 'CE-2', 'CE-3', 'CE-4'] 
  },
  { 
    code: 'IT', 
    name: 'Information Technology (IT)', 
    divisions: ['IT-A', 'IT-B', 'IT-C'] 
  },
  { 
    code: 'DS', 
    name: 'Data Science (DS)', 
    divisions: ['DS-1', 'DS-2'] 
  },
  { 
    code: 'Electrical', 
    name: 'Electrical Engineering', 
    divisions: ['EE-A', 'EE-B', 'EE-C'] 
  },
  { 
    code: 'Mechanical', 
    name: 'Mechanical Engineering', 
    divisions: ['ME-1', 'ME-2', 'ME-3'] 
  },
  { 
    code: 'Civil', 
    name: 'Civil Engineering', 
    divisions: ['Civil-A', 'Civil-B'] 
  },
  { 
    code: 'Chemical', 
    name: 'Chemical Engineering', 
    divisions: ['Chem-A', 'Chem-B'] 
  },
  { 
    code: 'IC', 
    name: 'Instrumentation & Control (IC)', 
    divisions: ['IC-A', 'IC-B'] 
  },
  { 
    code: 'PE', 
    name: 'Petroleum Engineering (PE)', 
    divisions: ['PE-1', 'PE-2'] 
  },
  { 
    code: 'E&I', 
    name: 'Electronics & Instrumentation (E&I)', 
    divisions: ['EI-A', 'EI-B'] 
  },
];

export const getDivisionsForBranch = (branchCode) => {
  const branch = BRANCHES.find(b => b.code === branchCode);
  return branch ? branch.divisions : ['Div-A', 'Div-B'];
};
