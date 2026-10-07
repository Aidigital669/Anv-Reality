'use client';

import React, { useState } from 'react';
import {
  Users,
  MapPin,
  UserCheck,
  Search,
  Car,
  ShieldCheck,
  Upload,
  Download,
  Plus,
  Table as TableIcon,
  LayoutGrid,
  Building,
  Check,
  X,
  Phone,
  Mail,
  ChevronDown,
  FileText,
  ExternalLink,
  Calendar,
  CheckCircle2,
  ArrowRight,
  MessageSquare
} from 'lucide-react';

export interface CustomerItem {
  id: string;
  code: string;
  name: string;
  initials: string;
  avatarBg: string;
  isOnline?: boolean;
  isNri?: boolean;
  phone: string;
  email: string;
  dnaTitle: string;
  dnaSubtext: string;
  budget: string;
  locations: string[];
  shortlistedCount: number;
  advisor: string;
  advisorInitials: string;
  advisorBg: string;
  lastActivity: string;
}

const INITIAL_CUSTOMERS: CustomerItem[] = [];

export function CrmCustomersTab() {
  const [customers, setCustomers] = useState<CustomerItem[]>(INITIAL_CUSTOMERS);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTag, setSearchTag] = useState('');
  const [statusFilter, setStatusFilter] = useState('Active');
  const [advisorFilter, setAdvisorFilter] = useState('All Advisors');
  const [locationFilter, setLocationFilter] = useState('All Locations');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedCustomerForDossier, setSelectedCustomerForDossier] = useState<CustomerItem | null>(null);
  const [activeCustomerTab, setActiveCustomerTab] = useState<'profile' | 'vault' | 'timeline'>('profile');

  // New customer form state
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newBudget, setNewBudget] = useState('₹2.0 - ₹2.5 Cr');
  const [newLocation, setNewLocation] = useState('Baner');

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/crm/customers');
      const data = await res.json();
      if (data.success && data.customers && data.customers.length > 0) {
        const mapped: CustomerItem[] = data.customers.map((c: any) => ({
          id: `cus-${c.id}`,
          code: c.code,
          name: c.name,
          initials: c.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase(),
          avatarBg: 'bg-[#182335] text-white',
          isOnline: true,
          phone: c.phone,
          email: c.email || `${c.name.toLowerCase().replace(/\s+/g, '.')}@client.com`,
          dnaTitle: c.unitBooked || '3 BHK Luxury Sky Suite',
          dnaSubtext: `${c.projectName || 'VTP Altair Residences'} • ${c.paymentStatus || 'Verified'}`,
          budget: c.totalValue || '₹2.10 Cr',
          locations: [c.projectName ? c.projectName.split(' ')[0] : 'Pune'],
          shortlistedCount: 3,
          advisor: c.relationshipManager || 'Vikram Malhotra',
          advisorInitials: 'VM',
          advisorBg: 'bg-[#8f6d2b] text-white',
          lastActivity: `KYC: ${c.kycStatus || 'Verified'} • Possession: ${c.possessionDate || '2026'}`
        }));
        setCustomers(mapped);
      }
    } catch (e) {
      console.log('Customer fetch fallback:', e);
    }
  };

  React.useEffect(() => {
    fetchCustomers();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.length === customers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(customers.map((c) => c.id));
    }
  };

  const handleToggleSelectRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleAddCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;

    const newCus: CustomerItem = {
      id: `cus-${Date.now()}`,
      code: `ANV - CUS - ${Math.floor(10000 + Math.random() * 90000)}`,
      name: newName.trim(),
      initials: newName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
      avatarBg: 'bg-[#182335] text-white',
      isOnline: true,
      phone: newPhone.trim(),
      email: newEmail.trim() || `${newName.toLowerCase().replace(/\s+/g, '.')}@client.com`,
      dnaTitle: '3 BHK Luxury Sky Suite',
      dnaSubtext: 'High Floor • Premium Corridor',
      budget: newBudget,
      locations: [newLocation],
      shortlistedCount: 2,
      advisor: 'Vikram Malhotra',
      advisorInitials: 'VM',
      advisorBg: 'bg-[#8f6d2b] text-white',
      lastActivity: 'Just now • Added to VIP Customers'
    };

    setCustomers([newCus, ...customers]);
    setIsAddModalOpen(false);
    showToast(`Added HNWI Customer: ${newCus.name}`);

    try {
      await fetch('/api/crm/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          phone: newPhone.trim(),
          email: newEmail.trim(),
          unitBooked: 'Unit 1402 (3 BHK Sky Suite)',
          projectName: 'VTP Altair Residences',
          totalValue: newBudget,
          relationshipManager: 'Vikram Malhotra'
        })
      });
      fetchCustomers();
    } catch (err) {
      console.error('Failed to commit customer to backend:', err);
    }

    setNewName('');
    setNewPhone('');
    setNewEmail('');
  };

  const handleExportData = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        'ID,Name,Phone,Email,Requirement DNA,Budget,Locations,Advisor,Last Activity',
        ...customers.map(
          (c) =>
            `"${c.code}","${c.name}","${c.phone}","${c.email}","${c.dnaTitle}","${c.budget}","${c.locations.join(
              '/'
            )}","${c.advisor}","${c.lastActivity}"`
        )
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ANV_HNWI_Customers_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Customer portfolio exported successfully');
  };

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
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-zinc-950 tracking-tight">Customers</h1>
            <span className="px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-zinc-600 font-semibold text-[10px] tracking-wide uppercase">
              Workspace
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Manage HNWI client profiles, curated property preferences, interactions, and sovereign sales activity.
          </p>
        </div>

        {/* Action Buttons: Import CSV, Export Data, + Add Customer */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => showToast('Select CSV file to import HNWI contacts')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 rounded-lg text-xs font-medium transition cursor-pointer shadow-2xs"
          >
            <Upload className="w-3.5 h-3.5 text-zinc-500" />
            <span>Import CSV</span>
          </button>

          <button
            onClick={handleExportData}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 rounded-lg text-xs font-medium transition cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-zinc-500" />
            <span>Export Data</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-black hover:bg-zinc-800 text-white rounded-lg text-xs font-bold transition shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-white" />
            <span>+ Add Customer</span>
          </button>
        </div>
      </div>

      {/* 2. 6 Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {/* TOTAL CUSTOMERS */}
        <div className="bg-white border border-zinc-200 rounded-xl p-3.5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              TOTAL CUSTOMERS
            </span>
            <Users className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-zinc-900">{customers.length}</div>
            <div className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 mt-0.5">
              <span>Verified Portfolios</span>
            </div>
          </div>
        </div>

        {/* ACTIVE CUSTOMERS */}
        <div className="bg-white border border-zinc-200 rounded-xl p-3.5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              ACTIVE CUSTOMERS
            </span>
            <MapPin className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-zinc-900">{customers.length}</div>
            <div className="text-xs text-zinc-400 font-medium mt-0.5">
              Ongoing Advisory
            </div>
          </div>
        </div>

        {/* NRI CLIENTS */}
        <div className="bg-white border border-zinc-200 rounded-xl p-3.5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              NRI CLIENTS
            </span>
            <UserCheck className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-zinc-900">{customers.filter(c => c.isNri).length}</div>
            <div className="text-[11px] font-semibold text-amber-700 mt-0.5">
              Global Patrons
            </div>
          </div>
        </div>

        {/* SHORTLISTED UNITS */}
        <div className="bg-white border border-zinc-200 rounded-xl p-3.5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              SHORTLISTED UNITS
            </span>
            <Search className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-zinc-900">{customers.reduce((acc, c) => acc + (c.shortlistedCount || 0), 0)}</div>
            <div className="text-xs text-zinc-400 font-medium mt-0.5">
              Curated Res.
            </div>
          </div>
        </div>

        {/* SITE VISITS */}
        <div className="bg-white border border-zinc-200 rounded-xl p-3.5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              SITE VISITS
            </span>
            <Car className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-zinc-900">0</div>
            <div className="text-[11px] font-semibold text-emerald-600 mt-0.5">
              Booked
            </div>
          </div>
        </div>

        {/* CONVERTED DEALS */}
        <div className="bg-white border border-zinc-200 rounded-xl p-3.5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              CONVERTED DEALS
            </span>
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-zinc-900">{customers.length}</div>
            <div className="text-xs font-semibold text-amber-800 mt-0.5">
              Closed
            </div>
          </div>
        </div>
      </div>

      {/* 3. Filter Controls Strip matching Screenshot 2 */}
      <div className="bg-white border border-zinc-200 rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-3 shadow-2xs text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Active Filter Tag */}
          {searchTag && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-800 font-medium">
              <span className="text-zinc-400">🔍</span>
              <span>{searchTag}</span>
              <button
                onClick={() => setSearchTag('')}
                className="hover:text-zinc-950 p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Status Dropdown */}
          <div className="flex items-center bg-white border border-zinc-200 rounded-lg px-2.5 py-1 text-zinc-700 font-medium">
            <span className="text-zinc-400 mr-1">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent focus:outline-hidden cursor-pointer"
            >
              <option value="Active">Active</option>
              <option value="All">All Statuses</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Advisor Dropdown */}
          <div className="flex items-center bg-white border border-zinc-200 rounded-lg px-2.5 py-1 text-zinc-700 font-medium">
            <span className="text-zinc-400 mr-1">Advisor:</span>
            <select
              value={advisorFilter}
              onChange={(e) => setAdvisorFilter(e.target.value)}
              className="bg-transparent focus:outline-hidden cursor-pointer"
            >
              <option value="Prem Sharma">Prem Sharma</option>
              <option value="Neha Patil">Neha Patil</option>
              <option value="Rajesh Varma">Rajesh Varma</option>
              <option value="All">All Advisors</option>
            </select>
          </div>

          {/* Location Dropdown */}
          <div className="flex items-center bg-white border border-zinc-200 rounded-lg px-2.5 py-1 text-zinc-700 font-medium">
            <span className="text-zinc-400 mr-1">Location:</span>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="bg-transparent focus:outline-hidden cursor-pointer"
            >
              <option value="Baner / Balewadi">Baner / Balewadi</option>
              <option value="Wakad">Wakad</option>
              <option value="Shivajinagar">Shivajinagar</option>
              <option value="All">All Locations</option>
            </select>
          </div>

          {/* Budget Dropdown */}
          <div className="flex items-center bg-white border border-zinc-200 rounded-lg px-2.5 py-1 text-zinc-700 font-medium">
            <span className="text-zinc-400 mr-1">Budget:</span>
            <select className="bg-transparent focus:outline-hidden cursor-pointer">
              <option value="All">All Ranges</option>
              <option value="1-2">₹1.5 - ₹2.0 Cr</option>
              <option value="3-5">₹3.5 - ₹5.0 Cr</option>
              <option value="above5">Above ₹5.0 Cr</option>
            </select>
          </div>
        </div>

        {/* View Switcher: [Table] [Grid] */}
        <div className="flex items-center bg-zinc-100 p-0.5 rounded-lg border border-zinc-200">
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
              viewMode === 'table'
                ? 'bg-white text-zinc-950 shadow-2xs'
                : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Table</span>
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-white text-zinc-950 shadow-2xs font-semibold'
                : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Grid</span>
          </button>
        </div>
      </div>

      {/* 4. Customers Table matching Screenshot 2 */}
      {viewMode === 'table' ? (
        <div className="bg-white border border-zinc-200 rounded-xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-50 text-zinc-500 font-bold border-b border-zinc-200 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === customers.length}
                      onChange={handleToggleSelectAll}
                      className="w-4 h-4 rounded border-zinc-300 text-black focus:ring-black cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-4">CUSTOMER & ID</th>
                  <th className="py-3 px-4">CONTACT & CHANNEL</th>
                  <th className="py-3 px-4">PROPERTY REQUIREMENT DNA</th>
                  <th className="py-3 px-4">BUDGET RANGE</th>
                  <th className="py-3 px-4">PREFERRED LOCATIONS</th>
                  <th className="py-3 px-4">SHORTLISTED UNITS</th>
                  <th className="py-3 px-4">ASSIGNED ADVISOR</th>
                  <th className="py-3 px-4">LAST ACTIVITY</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {customers.map((cus) => {
                  const isChecked = selectedIds.includes(cus.id);

                  return (
                    <tr
                      key={cus.id}
                      onClick={() => setSelectedCustomerForDossier(cus)}
                      className={`transition-colors cursor-pointer ${
                        selectedCustomerForDossier?.id === cus.id
                          ? 'border-l-4 border-l-amber-600 bg-amber-50/40'
                          : isChecked
                          ? 'border-l-4 border-l-amber-400 bg-amber-50/20'
                          : 'hover:bg-zinc-50/80'
                      }`}
                    >
                      {/* Checkbox */}
                      <td
                        className="py-3.5 px-4"
                        onClick={(e) => handleToggleSelectRow(cus.id, e)}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="w-4 h-4 rounded border-zinc-300 text-black focus:ring-black cursor-pointer"
                        />
                      </td>

                      {/* Customer & ID */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 select-none ${cus.avatarBg}`}
                          >
                            {cus.initials}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-zinc-950 text-xs">
                                {cus.name}
                              </span>
                              {cus.isOnline && (
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                              )}
                              {cus.isNri && (
                                <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-bold text-[9px] uppercase tracking-wider">
                                  NRI
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                              {cus.code}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact & Channel */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-xs text-zinc-800">
                          {cus.phone}
                        </div>
                        <div className="text-[11px] text-zinc-400 truncate max-w-[150px] mt-0.5">
                          {cus.email}
                        </div>
                      </td>

                      {/* Property Requirement DNA */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-zinc-900 text-xs">
                          {cus.dnaTitle}
                        </div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">
                          {cus.dnaSubtext}
                        </div>
                      </td>

                      {/* Budget Range */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-zinc-900 text-xs">
                          {cus.budget}
                        </div>
                      </td>

                      {/* Preferred Locations */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 flex-wrap">
                          {cus.locations.map((loc) => (
                            <span
                              key={loc}
                              className="px-2 py-0.5 bg-zinc-100 text-zinc-700 rounded text-[10px] font-medium"
                            >
                              {loc}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Shortlisted Units */}
                      <td className="py-3.5 px-4">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-100/90 hover:bg-zinc-200 rounded-lg text-zinc-800 font-semibold text-xs transition">
                          <Building className="w-3.5 h-3.5 text-zinc-600" />
                          <span>{cus.shortlistedCount} Properties</span>
                        </div>
                      </td>

                      {/* Assigned Advisor */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 select-none ${cus.advisorBg}`}
                          >
                            {cus.advisorInitials}
                          </div>
                          <span className="text-xs font-medium text-zinc-800 whitespace-nowrap">
                            {cus.advisor}
                          </span>
                        </div>
                      </td>

                      {/* Last Activity */}
                      <td className="py-3.5 px-4 text-xs text-zinc-600 font-medium max-w-[200px] truncate">
                        {cus.lastActivity}
                      </td>
                    </tr>
                  );
                })}
                {customers.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-zinc-400">
                      <Users className="w-8 h-8 mx-auto text-zinc-300 mb-2" />
                      <p className="text-sm font-semibold text-zinc-700">No customers found</p>
                      <p className="text-xs text-zinc-400 mt-0.5">Click &quot;+ Add Customer&quot; or convert qualified leads</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {customers.map((cus) => (
            <div
              key={cus.id}
              onClick={() => setSelectedCustomerForDossier(cus)}
              className="bg-white border border-zinc-200 hover:border-amber-400 rounded-xl p-4 shadow-2xs hover:shadow-md transition space-y-3 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${cus.avatarBg}`}>
                    {cus.initials}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-zinc-950">{cus.name}</h3>
                    <p className="text-[10px] font-mono text-zinc-400">{cus.code}</p>
                  </div>
                </div>
                <span className="font-bold text-xs text-zinc-900">{cus.budget}</span>
              </div>

              <div className="p-2.5 bg-zinc-50 rounded-lg space-y-1">
                <p className="text-xs font-semibold text-zinc-800">{cus.dnaTitle}</p>
                <p className="text-[10px] text-zinc-500">{cus.dnaSubtext}</p>
              </div>

              <div className="flex items-center justify-between text-xs text-zinc-500 pt-1 border-t border-zinc-100">
                <span>{cus.phone}</span>
                <span className="font-semibold text-zinc-800">{cus.advisor}</span>
              </div>
            </div>
          ))}
          {customers.length === 0 && (
            <div className="col-span-full py-12 text-center text-zinc-400 bg-white rounded-xl border border-zinc-200">
              <Users className="w-8 h-8 mx-auto text-zinc-300 mb-2" />
              <p className="text-sm font-semibold text-zinc-700">No customers found</p>
            </div>
          )}
        </div>
      )}

      {/* Add Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-zinc-200 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="font-bold text-base text-zinc-900">
                + Add HNWI Customer Profile
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCustomerSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                  Customer Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Client Name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:outline-hidden focus:border-zinc-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98201 44521"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:outline-hidden focus:border-zinc-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="r.mehta@techcorp.in"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:outline-hidden focus:border-zinc-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                    Budget Bracket
                  </label>
                  <select
                    value={newBudget}
                    onChange={(e) => setNewBudget(e.target.value)}
                    className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:outline-hidden focus:border-zinc-400"
                  >
                    <option value="₹1.5 – ₹2.0 Cr">₹1.5 – ₹2.0 Cr</option>
                    <option value="₹2.0 – ₹3.5 Cr">₹2.0 – ₹3.5 Cr</option>
                    <option value="₹3.5 – ₹5.0 Cr">₹3.5 – ₹5.0 Cr</option>
                    <option value="Above ₹5.0 Cr">Above ₹5.0 Cr</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                    Preferred Location
                  </label>
                  <select
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:outline-hidden focus:border-zinc-400"
                  >
                    <option value="Baner">Baner</option>
                    <option value="Balewadi High St">Balewadi High St</option>
                    <option value="Wakad">Wakad</option>
                    <option value="Shivajinagar">Shivajinagar</option>
                  </select>
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
                  Create Customer Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Customer 360° Profile & Document Vault Drawer (Persona 2) */}
      {selectedCustomerForDossier && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in">
          <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col border-l border-zinc-200 overflow-hidden animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="p-5 border-b border-zinc-200 bg-zinc-950 text-white flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="px-2 py-0.5 rounded bg-amber-400 text-black font-extrabold text-[10px] uppercase tracking-wider">
                    Customer 360° File
                  </span>
                  <span className="text-zinc-400 font-mono text-xs">
                    {selectedCustomerForDossier.code}
                  </span>
                  {selectedCustomerForDossier.isNri && (
                    <span className="px-2 py-0.5 rounded bg-indigo-900 text-indigo-200 font-bold text-[10px]">
                      NRI Patron
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold tracking-tight text-white">
                  {selectedCustomerForDossier.name}
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {selectedCustomerForDossier.email} &bull; {selectedCustomerForDossier.phone}
                </p>
              </div>
              <button
                onClick={() => setSelectedCustomerForDossier(null)}
                className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center border-b border-zinc-200 bg-zinc-50 px-4 text-xs font-bold text-zinc-600">
              <button
                onClick={() => setActiveCustomerTab('profile')}
                className={`py-3 px-4 border-b-2 transition cursor-pointer ${
                  activeCustomerTab === 'profile'
                    ? 'border-zinc-950 text-zinc-950 bg-white'
                    : 'border-transparent hover:text-zinc-950'
                }`}
              >
                Profile & DNA
              </button>
              <button
                onClick={() => setActiveCustomerTab('vault')}
                className={`py-3 px-4 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                  activeCustomerTab === 'vault'
                    ? 'border-zinc-950 text-zinc-950 bg-white'
                    : 'border-transparent hover:text-zinc-950'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-amber-600" />
                <span>Document Vault (4)</span>
              </button>
              <button
                onClick={() => setActiveCustomerTab('timeline')}
                className={`py-3 px-4 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                  activeCustomerTab === 'timeline'
                    ? 'border-zinc-950 text-zinc-950 bg-white'
                    : 'border-transparent hover:text-zinc-950'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                <span>Journey Timeline</span>
              </button>
            </div>

            {/* Drawer Body Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
              {/* TAB 1: PROFILE & DEDICATED CONCIERGE */}
              {activeCustomerTab === 'profile' && (
                <>
                  {/* Dedicated Concierge Desk Card */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-zinc-950 to-zinc-900 text-white shadow-md space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                        Dedicated Sales Concierge
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 font-bold text-[10px] border border-emerald-500/30">
                        Online Active
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-500 text-black font-extrabold flex items-center justify-center text-sm shadow-xs">
                        {selectedCustomerForDossier.advisorInitials || 'VM'}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white">
                          {selectedCustomerForDossier.advisor}
                        </h4>
                        <p className="text-[11px] text-zinc-400">
                          Senior Portfolio Advisor &bull; Desk Hotline: +91 93730 20701
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => showToast(`Calling ${selectedCustomerForDossier.advisor}...`)}
                        className="py-2 px-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl text-center flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Call Advisor</span>
                      </button>
                      <button
                        onClick={() => {
                          const text = `Namaste ${selectedCustomerForDossier.advisor}, this is regarding portfolio for ${selectedCustomerForDossier.name} (${selectedCustomerForDossier.code}).`;
                          if (typeof window !== 'undefined') {
                            navigator.clipboard.writeText(text);
                            showToast('WhatsApp message template copied to clipboard!');
                          }
                        }}
                        className="py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-center flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>WhatsApp Desk</span>
                      </button>
                    </div>
                  </div>

                  {/* Customer DNA & Residence Specifications */}
                  <div className="border border-zinc-200 rounded-xl p-4 bg-zinc-50/50 space-y-3">
                    <h4 className="font-bold text-zinc-900 text-xs uppercase tracking-wider">
                      Acquisition Portfolio & DNA
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-2.5 bg-white border border-zinc-200 rounded-lg">
                        <span className="text-[10px] text-zinc-400 block font-semibold">Unit Booked / Focus</span>
                        <span className="font-bold text-zinc-900 block mt-0.5">{selectedCustomerForDossier.dnaTitle}</span>
                      </div>
                      <div className="p-2.5 bg-white border border-zinc-200 rounded-lg">
                        <span className="text-[10px] text-zinc-400 block font-semibold">Total Consideration</span>
                        <span className="font-bold text-amber-800 block mt-0.5">{selectedCustomerForDossier.budget}</span>
                      </div>
                      <div className="p-2.5 bg-white border border-zinc-200 rounded-lg">
                        <span className="text-[10px] text-zinc-400 block font-semibold">Target Micro-markets</span>
                        <span className="font-bold text-zinc-900 block mt-0.5">{selectedCustomerForDossier.locations.join(', ')}</span>
                      </div>
                      <div className="p-2.5 bg-white border border-zinc-200 rounded-lg">
                        <span className="text-[10px] text-zinc-400 block font-semibold">Government KYC Status</span>
                        <span className="font-bold text-emerald-700 block mt-0.5">Verified (PAN & Aadhaar) ✓</span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* TAB 2: DIGITAL DOCUMENT VAULT */}
              {activeCustomerTab === 'vault' && (
                <div className="space-y-3">
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-zinc-800">
                    <p className="font-bold text-xs text-amber-900">Digital Document Vault (Encrypted & Tamper-Evident)</p>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      Statutory MahaRERA certifications, floor plans, and bank payment receipts for {selectedCustomerForDossier.name}.
                    </p>
                  </div>

                  {/* Vault Item 1 */}
                  <div className="p-3.5 bg-white border border-zinc-200 rounded-xl flex items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-200 font-bold text-[10px]">
                        PDF
                      </div>
                      <div>
                        <h5 className="font-bold text-zinc-900 text-xs">MahaRERA Registration Factsheet</h5>
                        <p className="text-[10px] text-zinc-400 mt-0.5">PRM/PUN/RERA/2026/0491 &bull; 2.4 MB &bull; Signed Copy</p>
                      </div>
                    </div>
                    <button
                      onClick={() => showToast('Opening MahaRERA Factsheet in preview...')}
                      className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-[11px] rounded-lg transition flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download</span>
                    </button>
                  </div>

                  {/* Vault Item 2 */}
                  <div className="p-3.5 bg-white border border-zinc-200 rounded-xl flex items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200 font-bold text-[10px]">
                        CAD
                      </div>
                      <div>
                        <h5 className="font-bold text-zinc-900 text-xs">Architectural Floor Plan & Unit Layout</h5>
                        <p className="text-[10px] text-zinc-400 mt-0.5">East Facing &bull; 1,250 sq.ft RERA Carpet &bull; 4.1 MB</p>
                      </div>
                    </div>
                    <button
                      onClick={() => showToast('Downloading architectural floor plan...')}
                      className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-[11px] rounded-lg transition flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download</span>
                    </button>
                  </div>

                  {/* Vault Item 3 */}
                  <div className="p-3.5 bg-white border border-zinc-200 rounded-xl flex items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200 font-bold text-[10px]">
                        TAX
                      </div>
                      <div>
                        <h5 className="font-bold text-zinc-900 text-xs">Statutory Cost Sheet & Subvention Breakdown</h5>
                        <p className="text-[10px] text-zinc-400 mt-0.5">7% Stamp Duty &bull; 0% GST Waiver Applied &bull; 1.2 MB</p>
                      </div>
                    </div>
                    <button
                      onClick={() => showToast('Downloading statutory cost sheet...')}
                      className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-[11px] rounded-lg transition flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download</span>
                    </button>
                  </div>

                  {/* Vault Item 4 */}
                  <div className="p-3.5 bg-white border border-zinc-200 rounded-xl flex items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-300 font-bold text-[10px]">
                        REC
                      </div>
                      <div>
                        <h5 className="font-bold text-zinc-900 text-xs">Booking Advance / Token Payment Receipt</h5>
                        <p className="text-[10px] text-zinc-400 mt-0.5">Bank Reference: HDFC-TXN-202610-8841 &bull; Verified ✓</p>
                      </div>
                    </div>
                    <button
                      onClick={() => showToast('Downloading booking payment receipt...')}
                      className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-[11px] rounded-lg transition flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: CUSTOMER JOURNEY TIMELINE */}
              {activeCustomerTab === 'timeline' && (
                <div className="space-y-4">
                  <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-200">
                    <div className="relative">
                      <div className="absolute -left-6 top-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-xs" />
                      <span className="text-[10px] text-zinc-400 font-mono">Today, 11:30 AM</span>
                      <h5 className="font-bold text-zinc-900 text-xs mt-0.5">Discovery Briefing Completed</h5>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        Client confirmed interest in 14th+ floor corner sky suite with HDFC loan pre-approval.
                      </p>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-6 top-0 w-4 h-4 rounded-full bg-amber-500 border-2 border-white shadow-xs" />
                      <span className="text-[10px] text-zinc-400 font-mono">Yesterday, 04:00 PM</span>
                      <h5 className="font-bold text-zinc-900 text-xs mt-0.5">Private Chauffeur Site Visit Dispatched</h5>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        Innova Crysta (MH 12 QX 4490) booked with driver Ramesh Kumar for Saturday 4 PM walk-through.
                      </p>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-6 top-0 w-4 h-4 rounded-full bg-zinc-400 border-2 border-white shadow-xs" />
                      <span className="text-[10px] text-zinc-400 font-mono">3 Days Ago</span>
                      <h5 className="font-bold text-zinc-900 text-xs mt-0.5">Omnichannel Ingestion via Website Search</h5>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        Ingested from ChatGPT Unified Intent search querying &quot;Baner 3 BHK luxury residences&quot;.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between">
              <span className="text-[11px] text-zinc-500">
                Activity updated in real-time
              </span>
              <button
                onClick={() => setSelectedCustomerForDossier(null)}
                className="px-4 py-2 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl font-bold text-xs transition cursor-pointer"
              >
                Close File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
