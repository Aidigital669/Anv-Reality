'use client';

import React, { useState } from 'react';
import {
  Users,
  UserCheck,
  Briefcase,
  UserCog,
  PhoneCall,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Download,
  Filter,
  Plus,
  Table as TableIcon,
  LayoutGrid,
  Users2,
  Search,
  RotateCcw,
  Check,
  X,
  Phone,
  Mail,
  Edit2,
  Key,
  Flame,
  Car,
  ChevronRight,
  ShieldCheck,
  Building,
  UserPlus
} from 'lucide-react';

export interface EmployeeItem {
  id: string;
  code: string;
  name: string;
  isYou?: boolean;
  role: string;
  department: string;
  phone: string;
  email: string;
  assignedLeads: number;
  upcomingVisits: number;
  pendingFollowups: number;
  status: 'Active' | 'On Leave' | 'Field';
  initials: string;
  avatarBg: string;
}

const INITIAL_EMPLOYEES: EmployeeItem[] = [];

export function CrmEmployeesTab() {
  const [employees, setEmployees] = useState<EmployeeItem[]>(INITIAL_EMPLOYEES);
  const [selectedEmpId, setSelectedEmpId] = useState<string>('');
  const [viewMode, setViewMode] = useState<'table' | 'card' | 'team'>('table');
  const [dossierTab, setDossierTab] = useState<'overview' | 'leads' | 'customers' | 'site_visits' | 'followups' | 'calls' | 'timeline' | 'permissions'>('overview');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filter dropdown states
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [deptFilter, setDeptFilter] = useState('All Departments');
  const [statusFilter, setStatusFilter] = useState('Active');
  const [hubFilter, setHubFilter] = useState('All Locations');

  // Add employee form
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('Sales Executive');
  const [newDept, setNewDept] = useState('Sales Department');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/crm/employees');
      const data = await res.json();
      if (data.success && data.employees && data.employees.length > 0) {
        const mapped: EmployeeItem[] = data.employees.map((e: any) => ({
          id: `emp-${e.id}`,
          code: `EMP-00${e.id + 100}`,
          name: e.name,
          role: e.role || 'Luxury Property Advisor',
          department: 'Sales & Advisory',
          phone: e.phone || '+91 98200 11000',
          email: e.email,
          assignedLeads: e.activeLeadsCount || 0,
          upcomingVisits: 0,
          pendingFollowups: 0,
          status: 'Active',
          initials: e.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase(),
          avatarBg: 'bg-zinc-900 text-white'
        }));
        setEmployees(mapped);
        if (mapped.length > 0) {
          setSelectedEmpId(mapped[0].id);
        }
      } else if (data.success && data.employees) {
        setEmployees([]);
        setSelectedEmpId('');
      }
    } catch (err) {
      console.log('Employees fetch fallback:', err);
    }
  };

  React.useEffect(() => {
    fetchEmployees();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newEmp: EmployeeItem = {
      id: `emp-${Date.now()}`,
      code: `EMP-00${Math.floor(130 + Math.random() * 800)}`,
      name: newName.trim(),
      role: newRole,
      department: newDept,
      phone: newPhone.trim() || '+91 98201 00000',
      email: newEmail.trim() || `${newName.toLowerCase().replace(/\s+/g, '.')}@anvrealty.com`,
      assignedLeads: 0,
      upcomingVisits: 0,
      pendingFollowups: 0,
      status: 'Active',
      initials: newName.slice(0, 2).toUpperCase(),
      avatarBg: 'bg-zinc-900 text-white'
    };

    setEmployees([...employees, newEmp]);
    setSelectedEmpId(newEmp.id);
    setIsAddModalOpen(false);
    setNewName('');
    showToast(`Added employee profile for ${newEmp.name}`);
  };

  const selectedEmployee = employees.find((e) => e.id === selectedEmpId) || employees[0];

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-zinc-950 text-white px-4 py-2.5 rounded-xl shadow-xl border border-zinc-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Page Header matching Screenshot 2 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 tracking-tight">Employees</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Manage your sales team, assignments, responsibilities and CRM sales activity
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => showToast('Exporting 32 employee records to CSV...')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 rounded-lg text-xs font-medium transition cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-zinc-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => showToast('Employee filter criteria expanded')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 rounded-lg text-xs font-medium transition cursor-pointer shadow-2xs"
          >
            <Filter className="w-3.5 h-3.5 text-zinc-500" />
            <span>Filter</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-black hover:bg-zinc-800 text-white rounded-lg text-xs font-bold transition shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-white" />
            <span>+ Add Employee</span>
          </button>
        </div>
      </div>

      {/* 2. 6 KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {/* TOTAL EMPLOYEES */}
        <div className="bg-white border border-zinc-200 rounded-xl p-3.5 shadow-2xs flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            TOTAL EMPLOYEES
          </span>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-zinc-900">{employees.length}</span>
              <span className="text-[11px] text-zinc-500">All Registered</span>
            </div>
          </div>
        </div>

        {/* ACTIVE */}
        <div className="bg-white border border-zinc-200 rounded-xl p-3.5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              ACTIVE
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-zinc-900">
                {employees.filter((e) => e.status === 'Active').length}
              </span>
              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                Available
              </span>
            </div>
          </div>
        </div>

        {/* SALES EXECUTIVES */}
        <div className="bg-white border border-zinc-200 rounded-xl p-3.5 shadow-2xs flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            SALES EXECUTIVES
          </span>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-zinc-900">
                {employees.filter((e) => e.role === 'Sales Executive').length}
              </span>
              <span className="text-[11px] text-zinc-500">Direct Quota</span>
            </div>
          </div>
        </div>

        {/* SALES MANAGERS */}
        <div className="bg-white border border-zinc-200 rounded-xl p-3.5 shadow-2xs flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            SALES MANAGERS
          </span>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-zinc-900">
                {employees.filter((e) => e.role === 'Sales Manager').length}
              </span>
              <span className="text-[11px] text-zinc-500">Team Leads</span>
            </div>
          </div>
        </div>

        {/* TELECALLERS */}
        <div className="bg-white border border-zinc-200 rounded-xl p-3.5 shadow-2xs flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            TELECALLERS
          </span>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-zinc-900">
                {employees.filter((e) => e.role === 'Telecaller').length}
              </span>
              <span className="text-[11px] text-zinc-500">Inbound Qual</span>
            </div>
          </div>
        </div>

        {/* ON LEAVE */}
        <div className="bg-white border border-zinc-200 rounded-xl p-3.5 shadow-2xs flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            ON LEAVE
          </span>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-zinc-900">
                {employees.filter((e) => e.status === 'On Leave').length}
              </span>
              <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded">
                Scheduled PTO
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. View Switcher & Dropdown Filter Row */}
      <div className="bg-white border border-zinc-200 rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-3 shadow-2xs text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Buttons */}
          <div className="flex items-center bg-zinc-100 p-0.5 rounded-lg border border-zinc-200">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-zinc-950 shadow-2xs' : 'text-zinc-600'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table View</span>
            </button>
            <button
              onClick={() => setViewMode('card')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                viewMode === 'card' ? 'bg-white text-zinc-950 shadow-2xs font-semibold' : 'text-zinc-600'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Card View</span>
            </button>
            <button
              onClick={() => setViewMode('team')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                viewMode === 'team' ? 'bg-white text-zinc-950 shadow-2xs font-semibold' : 'text-zinc-600'
              }`}
            >
              <Users2 className="w-3.5 h-3.5" />
              <span>Team View</span>
            </button>
          </div>

          <button className="p-1.5 bg-white border border-zinc-200 hover:bg-zinc-50 rounded-lg text-zinc-500">
            <Search className="w-3.5 h-3.5" />
          </button>

          {/* Role Filter */}
          <div className="flex items-center bg-white border border-zinc-200 rounded-lg px-2.5 py-1 text-zinc-700 font-medium">
            <span className="text-zinc-400 mr-1">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-transparent focus:outline-hidden cursor-pointer"
            >
              <option>All Roles</option>
              <option>Sales Executive</option>
              <option>Sales Manager</option>
              <option>Associate Advisor</option>
              <option>Telecaller</option>
              <option>Portfolio Director</option>
            </select>
          </div>

          {/* Dept Filter */}
          <div className="flex items-center bg-white border border-zinc-200 rounded-lg px-2.5 py-1 text-zinc-700 font-medium">
            <span className="text-zinc-400 mr-1">Dept:</span>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="bg-transparent focus:outline-hidden cursor-pointer"
            >
              <option>All Departments</option>
              <option>Sales Department</option>
              <option>Telecalling Department</option>
              <option>Management</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center bg-white border border-zinc-200 rounded-lg px-2.5 py-1 text-zinc-700 font-medium">
            <span className="text-zinc-400 mr-1">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent focus:outline-hidden cursor-pointer"
            >
              <option>Active</option>
              <option>All</option>
              <option>On Leave</option>
            </select>
          </div>

          {/* Hub Filter */}
          <div className="flex items-center bg-white border border-zinc-200 rounded-lg px-2.5 py-1 text-zinc-700 font-medium">
            <span className="text-zinc-400 mr-1">Hub:</span>
            <select
              value={hubFilter}
              onChange={(e) => setHubFilter(e.target.value)}
              className="bg-transparent focus:outline-hidden cursor-pointer"
            >
              <option>All Locations</option>
              <option>Baner Hub</option>
              <option>Balewadi Hub</option>
              <option>Shivajinagar HQ</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => {
            setRoleFilter('All Roles');
            setDeptFilter('All Departments');
            setStatusFilter('Active');
            setHubFilter('All Locations');
            showToast('Employee filters reset');
          }}
          className="flex items-center gap-1 text-zinc-600 hover:text-zinc-950 font-semibold cursor-pointer px-2 py-1"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* 4. Employees Table matching Screenshot 2 */}
      <div className="bg-white border border-zinc-200 rounded-xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-zinc-50 text-zinc-500 font-bold border-b border-zinc-200 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={employees.length > 0 && selectedEmpId !== ''}
                    onChange={() => {}}
                    className="w-4 h-4 rounded border-zinc-300 text-black focus:ring-black cursor-pointer"
                  />
                </th>
                <th className="py-3 px-4">EMPLOYEE</th>
                <th className="py-3 px-4">ROLE & DEPT</th>
                <th className="py-3 px-4">CONTACT</th>
                <th className="py-3 px-4">ASSIGNED LEADS</th>
                <th className="py-3 px-4">UPCOMING VISITS</th>
                <th className="py-3 px-4">PENDING FOLLOW-UPS</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-zinc-400">
                    <Users className="w-8 h-8 mx-auto mb-2 text-zinc-300" />
                    <p className="font-semibold text-sm text-zinc-600">No employees registered</p>
                    <p className="text-xs text-zinc-400 mt-1">Click "+ Add Employee" to register team members and advisors.</p>
                  </td>
                </tr>
              ) : (
                employees.map((emp) => {
                  const isSelected = selectedEmpId === emp.id;

                  return (
                    <tr
                      key={emp.id}
                      onClick={() => {
                        setSelectedEmpId(emp.id);
                        showToast(`Selected employee ${emp.name} profile`);
                      }}
                      className={`transition-colors cursor-pointer ${
                        isSelected
                          ? 'border-l-4 border-l-black bg-zinc-50/60'
                          : 'hover:bg-zinc-50/80'
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => setSelectedEmpId(emp.id)}
                          className="w-4 h-4 rounded border-zinc-300 text-black focus:ring-black cursor-pointer"
                        />
                      </td>

                      {/* Employee Name & Code */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 select-none ${emp.avatarBg}`}>
                            {emp.initials}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-zinc-950 text-xs">
                                {emp.name}
                              </span>
                              {emp.isYou && (
                                <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-bold text-[9px] uppercase tracking-wider border border-amber-300">
                                  You
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
                              {emp.code}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Role & Dept */}
                      <td className="py-3 px-4">
                        <p className="font-bold text-zinc-900 text-xs">{emp.role}</p>
                        <p className="text-[10px] text-zinc-400 mt-0.5">{emp.department}</p>
                      </td>

                      {/* Contact */}
                      <td className="py-3 px-4">
                        <p className="font-mono text-zinc-800 text-xs">{emp.phone}</p>
                        <p className="text-[10px] text-zinc-400 mt-0.5">{emp.email}</p>
                      </td>

                      {/* Assigned Leads */}
                      <td className="py-3 px-4 font-bold text-zinc-900 text-xs">
                        {emp.assignedLeads}
                      </td>

                      {/* Upcoming Visits with gold circle */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-900 font-bold text-xs">
                          {emp.upcomingVisits}
                        </span>
                      </td>

                      {/* Pending Follow-ups */}
                      <td className="py-3 px-4 font-bold text-zinc-900 text-xs">
                        {emp.pendingFollowups}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>Active</span>
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right">
                        {emp.isYou ? (
                          <button className="px-3 py-1 bg-white border border-zinc-200 text-zinc-800 hover:bg-zinc-50 rounded-lg text-xs font-semibold">
                            Dossier
                          </button>
                        ) : (
                          <button className="px-3 py-1 bg-white border border-zinc-200 text-zinc-800 hover:bg-zinc-50 rounded-lg text-xs font-semibold">
                            Assign
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-4 py-3 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
          <div>Showing {employees.length > 0 ? 1 : 0} to {employees.length} of {employees.length} employees</div>
          <div className="flex items-center gap-1">
            <button className="px-2.5 py-1 rounded border border-zinc-200 bg-white text-zinc-500">
              ‹
            </button>
            <button className="px-2.5 py-1 rounded font-bold bg-black text-white">
              1
            </button>
            <button className="px-2.5 py-1 rounded border border-zinc-200 bg-white text-zinc-700">
              ›
            </button>
          </div>
        </div>
      </div>

      {/* 5. Deep Employee Profile / Dossier */}
      {(() => {
        const selectedEmployee = employees.find((e) => e.id === selectedEmpId);
        if (!selectedEmployee) {
          return (
            <div className="bg-white border border-zinc-200 rounded-2xl p-8 text-center text-zinc-500 shadow-2xs">
              <Users className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
              <p className="font-semibold text-sm text-zinc-700">No employee selected</p>
              <p className="text-xs text-zinc-400 mt-1">Select an employee from the table above to view their dossier and assignment roster.</p>
            </div>
          );
        }

        return (
          <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-2xs space-y-5">
            {/* Profile Card Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-zinc-950 text-white font-black text-base flex items-center justify-center shadow-xs">
                  {selectedEmployee.initials}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-zinc-950">
                      {selectedEmployee.name}
                    </h2>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                      ● Active
                    </span>
                    <span className="font-mono text-xs text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded">
                      {selectedEmployee.code}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {selectedEmployee.role} • {selectedEmployee.department}
                  </p>
                </div>
              </div>

              {/* Header Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => showToast(`Calling ${selectedEmployee.name} (${selectedEmployee.phone})...`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-zinc-200 hover:bg-zinc-50 text-zinc-700 rounded-lg text-xs font-medium transition"
                >
                  <Phone className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Call ({selectedEmployee.phone})</span>
                </button>

                <button
                  onClick={() => showToast(`Composing email to ${selectedEmployee.email}`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-zinc-200 hover:bg-zinc-50 text-zinc-700 rounded-lg text-xs font-medium transition"
                >
                  <Mail className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Email</span>
                </button>

                <button
                  onClick={() => showToast('Opening Lead Assignment Dialog')}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-black hover:bg-zinc-800 text-white rounded-lg text-xs font-bold transition shadow-xs"
                >
                  <UserPlus className="w-3.5 h-3.5 text-white" />
                  <span>+ Assign Lead</span>
                </button>
              </div>
            </div>

            {/* 5 KPI Metric Cards for selected employee */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <div className="p-3 bg-zinc-50/70 border border-zinc-200 rounded-xl">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  CURRENT LEADS
                </span>
                <div className="text-2xl font-bold text-zinc-950 mt-1">{selectedEmployee.assignedLeads}</div>
                <div className="text-[10px] text-zinc-400 mt-0.5">
                  Assigned prospects
                </div>
              </div>

              <div className="p-3 bg-zinc-50/70 border border-zinc-200 rounded-xl">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  UPCOMING SITE VISITS
                </span>
                <div className="text-2xl font-bold text-amber-800 mt-1">{selectedEmployee.upcomingVisits}</div>
                <div className="text-[10px] text-amber-700 mt-0.5">
                  Scheduled walkthroughs
                </div>
              </div>

              <div className="p-3 bg-zinc-50/70 border border-zinc-200 rounded-xl">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  PENDING FOLLOW-UPS
                </span>
                <div className="text-2xl font-bold text-zinc-950 mt-1">{selectedEmployee.pendingFollowups}</div>
                <div className="text-[10px] text-zinc-400 mt-0.5">
                  Due calls & tasks
                </div>
              </div>

              <div className="p-3 bg-zinc-50/70 border border-zinc-200 rounded-xl">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  DEPARTMENT
                </span>
                <div className="text-sm font-bold text-zinc-950 mt-1 truncate">{selectedEmployee.department}</div>
                <div className="text-[10px] text-zinc-400 mt-0.5">
                  Operations role
                </div>
              </div>

              <div className="p-3 bg-zinc-50/70 border border-zinc-200 rounded-xl">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  STATUS
                </span>
                <div className="text-sm font-bold text-emerald-600 mt-1">{selectedEmployee.status}</div>
                <div className="text-[10px] text-zinc-400 mt-0.5">
                  Active in CRM
                </div>
              </div>
            </div>

            {/* Dossier Tabs: Overview, Leads, etc. */}
            <div className="border-b border-zinc-200 flex items-center gap-6 text-xs font-semibold overflow-x-auto">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'leads', label: `Leads (${selectedEmployee.assignedLeads})` },
                { id: 'site_visits', label: `Site Visits (${selectedEmployee.upcomingVisits})` },
                { id: 'followups', label: `Follow-ups (${selectedEmployee.pendingFollowups})` },
                { id: 'activity', label: 'Activity' }
              ].map((tab) => {
                const isActive = dossierTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setDossierTab(tab.id as any)}
                    className={`py-2 transition whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'text-zinc-950 border-b-2 border-zinc-950 font-bold'
                        : 'text-zinc-500 hover:text-zinc-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* 3 Grid Sections in Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Column 1: Active Assigned Leads & Opportunities */}
              <div className="p-4 bg-zinc-50/60 border border-zinc-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-zinc-950">
                    Active Assigned Leads
                  </span>
                </div>
                <div className="p-8 text-center text-zinc-400">
                  <p className="text-xs font-medium text-zinc-600">No active leads assigned</p>
                  <p className="text-[10px] text-zinc-400 mt-1">Assign prospects from the Leads tab to this advisor.</p>
                </div>
              </div>

              {/* Column 2: Upcoming Site Visits */}
              <div className="p-4 bg-zinc-50/60 border border-zinc-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-zinc-950">
                    Upcoming Site Visits
                  </span>
                </div>
                <div className="p-8 text-center text-zinc-400">
                  <p className="text-xs font-medium text-zinc-600">No site visits scheduled</p>
                  <p className="text-[10px] text-zinc-400 mt-1">Scheduled client walkthroughs will appear here.</p>
                </div>
              </div>

              {/* Column 3: Operational Activity Timeline */}
              <div className="p-4 bg-zinc-50/60 border border-zinc-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-zinc-950">
                    Operational Activity
                  </span>
                </div>
                <div className="p-8 text-center text-zinc-400">
                  <p className="text-xs font-medium text-zinc-600">No activity logged today</p>
                  <p className="text-[10px] text-zinc-400 mt-1">Call events and interactions will sync in real-time.</p>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Add Employee Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-zinc-200 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="font-bold text-base text-zinc-900">
                + Register New Employee / Advisor
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddEmployee} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amit Sharma"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:outline-hidden focus:border-zinc-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                    Role
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:outline-hidden focus:border-zinc-400 cursor-pointer"
                  >
                    <option value="Sales Executive">Sales Executive</option>
                    <option value="Sales Manager">Sales Manager</option>
                    <option value="Associate Advisor">Associate Advisor</option>
                    <option value="Telecaller">Telecaller</option>
                    <option value="Portfolio Director">Portfolio Director</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                    Department
                  </label>
                  <select
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value)}
                    className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:outline-hidden focus:border-zinc-400 cursor-pointer"
                  >
                    <option value="Sales Department">Sales Department</option>
                    <option value="Telecalling Department">Telecalling Department</option>
                    <option value="Management">Management</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98201 44521"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:outline-hidden focus:border-zinc-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                    Corporate Email
                  </label>
                  <input
                    type="email"
                    placeholder="amit.s@anvrealty.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:outline-hidden focus:border-zinc-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-zinc-600 hover:text-zinc-950 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-black hover:bg-zinc-800 text-white rounded-lg font-bold transition shadow-xs"
                >
                  Confirm Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
