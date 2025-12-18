/**
 * --- REQUISITOS DO SISTEMA ---
 * * 1. TAILWIND CSS:
 * Este componente utiliza Tailwind CSS para todo o estilo visual.
 * Se o estilo não estiver carregando, certifique-se de ter o Tailwind instalado
 * ou adicione a seguinte tag no <head> do seu arquivo index.html (para testes):
 * <script src="https://cdn.tailwindcss.com"></script>
 * * 2. ÍCONES (LUCIDE-REACT):
 * É necessário instalar a biblioteca de ícones:
 * npm install lucide-react
 * * 3. FONTE (Opcional):
 * O design fica melhor com a fonte 'Inter' ou 'Roboto'.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Baby, 
  Calendar, 
  Activity, 
  Plus, 
  Search, 
  LogOut, 
  Menu, 
  X, 
  CheckCircle, 
  UserPlus, 
  FileText,
  Clock,
  ChevronRight,
  ChevronLeft,
  Stethoscope,
  Trash2,
  Puzzle,
  Filter,
  MoreVertical,
  Edit,
  Eye,
  EyeOff,
  AlertCircle,
  ShieldAlert
} from 'lucide-react';

// --- MOCK DATA & UTILS ---

const INITIAL_ADMIN = {
  email: 'admin@recriar.com.br',
  password: 'Recriar@2025',
  name: 'Administrador'
};

const ROLES = [
  'Aplicador ABA', 
  'Psicólogo', 
  'Fisioterapeuta', 
  'Nutricionista', 
  'Fonoaudiólogo', 
  'Acompanhante Terapêutico', 
  'Robótica'
];

// Helper para formatar CPF
const formatCPF = (value) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
};

// Helper para formatar Telefone
const formatPhone = (value) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{4})\d+?$/, '$1');
};

const getNowStr = () => new Date().toLocaleString('pt-BR');

// --- COMPONENTES UI REUTILIZÁVEIS ---

const PuzzleBackground = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
    <div className="absolute -top-10 -right-10 text-blue-100 opacity-50 transform rotate-12">
      <Puzzle size={300} strokeWidth={1} />
    </div>
    <div className="absolute -bottom-20 -left-20 text-blue-50 opacity-60 transform -rotate-45">
      <Puzzle size={400} strokeWidth={0.5} />
    </div>
    <div className="absolute top-1/3 right-1/4 text-blue-50 opacity-40 transform rotate-180">
      <Puzzle size={150} strokeWidth={1.5} />
    </div>
  </div>
);

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-blue-100 p-6 relative z-10 ${className}`}>
    {children}
  </div>
);

const Button = ({ children, onClick, variant = 'primary', type = 'button', className = '' }) => {
  const baseStyle = "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200",
    secondary: "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50",
    danger: "bg-red-50 text-red-600 hover:bg-red-100",
    ghost: "bg-transparent text-slate-500 hover:bg-blue-50 hover:text-blue-600"
  };
  return (
    <button type={type} onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

const InputGroup = ({ label, children, error }) => (
  <div className="flex flex-col gap-1 mb-4 w-full">
    <label className="text-sm font-semibold text-slate-600">{label}</label>
    {children}
    {error && <span className="text-xs text-red-500">{error}</span>}
  </div>
);

const SearchableSelect = ({ options, value, onChange, placeholder, label }) => {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  
  const selectedLabel = useMemo(() => {
    const found = options.find(opt => opt.value === value);
    return found ? found.label : '';
  }, [value, options]);

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative mb-4 w-full">
      <label className="text-sm font-semibold text-slate-600 mb-1 block">{label}</label>
      <div className="relative">
        <input
          type="text"
          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          placeholder={selectedLabel || placeholder}
          value={isOpen ? search : (selectedLabel || '')}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
            if(e.target.value === '') onChange('');
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        />
        <div className="absolute right-3 top-2.5 text-slate-400 pointer-events-none">
          <Search size={18} />
        </div>
      </div>
      
      {isOpen && filteredOptions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
          {filteredOptions.map((opt) => (
            <div
              key={opt.value}
              className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-slate-700"
              onMouseDown={() => {
                onChange(opt.value);
                setSearch('');
                setIsOpen(false);
              }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Componente Modal Genérico - Z-INDEX 9999 para garantir que fique ACIMA DE TUDO
const Modal = ({ title, isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-2 sm:p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl animate-fade-in relative flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10 rounded-t-2xl">
          <h3 className="text-lg sm:text-xl font-bold text-slate-800">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition">
            <X size={24} className="text-slate-500" />
          </button>
        </div>
        <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

// --- TELAS DO SISTEMA ---

// 1. LOGIN
const LoginScreen = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email === INITIAL_ADMIN.email && password === INITIAL_ADMIN.password) {
      onLogin();
    } else {
      setError('Credenciais inválidas. Tente admin@recriar.com.br');
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4 relative overflow-hidden">
      <PuzzleBackground />
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden relative z-10 border border-blue-100">
        <div className="bg-blue-600 p-8 text-center relative overflow-hidden">
           <Puzzle className="absolute top-2 right-2 text-blue-500 opacity-30" size={60} />
           <Puzzle className="absolute bottom-2 left-2 text-blue-500 opacity-30" size={40} />
          <div className="w-16 h-16 bg-white rounded-2xl rotate-3 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Puzzle className="text-blue-600 w-10 h-10 transform -rotate-3" />
          </div>
          <h1 className="text-2xl font-bold text-white">Espaço Recriar</h1>
          <p className="text-blue-100 text-sm mt-1">Sistema de Gestão Clínica</p>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <InputGroup label="Email">
             <input 
               type="email" 
               value={email} 
               onChange={e => setEmail(e.target.value)} 
               className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
               placeholder="seu@email.com"
             />
          </InputGroup>
          <div className="flex flex-col gap-1 mb-4 w-full">
            <label className="text-sm font-semibold text-slate-600">Senha</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"}
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all pr-12" 
                placeholder="••••••••"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          {error && <div className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</div>}
          <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200/50">
            Acessar Sistema
          </button>
        </form>
      </div>
    </div>
  );
};

// 2. DASHBOARD
const Dashboard = ({ db }) => {
  const stats = [
    { label: 'Crianças', value: db.children.length, icon: Baby, color: 'bg-blue-500' },
    { label: 'Profissionais', value: db.professionals.length, icon: Stethoscope, color: 'bg-cyan-500' },
    { label: 'Atividades', value: db.activities.length, icon: Activity, color: 'bg-indigo-500' },
    { label: 'Responsáveis', value: db.children.filter(c => c.guardian?.createAccount).length, icon: Users, color: 'bg-sky-500' },
  ];

  return (
    <div className="space-y-6 animate-fade-in relative z-10 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Bem-vindo ao Espaço Recriar</h1>
          <p className="text-slate-500">Resumo geral da clínica hoje.</p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-sm font-semibold text-blue-600">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <Card key={idx} className="flex items-center gap-4 hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
            <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center text-white shadow-md flex-shrink-0`}>
              <stat.icon size={24} />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-slate-500 font-medium truncate">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <h2 className="text-lg font-bold text-slate-700 mt-8 mb-4">Atividades Recentes</h2>
      <div className="bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden">
        {db.activities.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            Nenhuma atividade registrada ainda.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {db.activities.slice().reverse().slice(0, 5).map((activity) => (
              <div key={activity.id} className="p-4 hover:bg-slate-50 transition flex flex-col sm:flex-row items-start gap-4">
                <div className="bg-blue-50 text-blue-600 p-2 rounded-lg flex-shrink-0">
                  <Activity size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-800 truncate">{activity.childName}</h4>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mb-1">
                    <Clock size={12} /> {activity.date}
                  </p>
                  <p className="text-sm text-slate-600 line-clamp-2">{activity.generalObservation}</p>
                  {activity.proNotes.length > 0 && (
                    <div className="mt-2 flex gap-2 flex-wrap">
                      {activity.proNotes.map((note, i) => (
                        <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200">
                          {note.proName}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// 3. GERENCIAMENTO DE CRIANÇAS
const ChildrenManager = ({ childrenList, onSave }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({
    name: '', dob: '', cpf: '', phone: '', diagnosis: '',
    planName: '', planLastReport: '', planReportResult: '', planNumber: '',
    guardianName: '', guardianCpf: '', createAccount: false, guardianEmail: '', guardianPassword: '',
    pickupNotes: ''
  });

  const handleChange = (field, value) => {
    let finalValue = value;
    if (field === 'cpf' || field === 'guardianCpf') finalValue = formatCPF(value);
    if (field === 'phone') finalValue = formatPhone(value);
    setFormData(prev => ({ ...prev, [field]: finalValue }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    onSave({ ...formData, id: Date.now() });
    alert('Criança cadastrada com sucesso!');
    setIsModalOpen(false);
    setFormData({
      name: '', dob: '', cpf: '', phone: '', diagnosis: '',
      planName: '', planLastReport: '', planReportResult: '', planNumber: '',
      guardianName: '', guardianCpf: '', createAccount: false, guardianEmail: '', guardianPassword: '', pickupNotes: ''
    });
  };

  const filtered = childrenList.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.cpf.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Baby className="text-blue-600"/> Crianças
        </h2>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={20} /> Cadastrar Criança
        </Button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100">
        <div className="relative mb-4">
          <input 
            className="input-base pl-10" 
            placeholder="Buscar por nome ou CPF..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18}/>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="text-xs font-bold text-slate-500 uppercase border-b border-slate-100">
                <th className="p-3">Nome</th>
                <th className="p-3">Idade</th>
                <th className="p-3">Responsável</th>
                <th className="p-3">Telefone</th>
                <th className="p-3">Plano</th>
                <th className="p-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 ? (
                 <tr><td colSpan="6" className="p-8 text-center text-slate-400">Nenhum registro encontrado.</td></tr>
              ) : (
                filtered.map(child => (
                  <tr key={child.id} className="hover:bg-slate-50">
                    <td className="p-3 font-medium text-slate-700">{child.name}</td>
                    <td className="p-3 text-slate-600">{new Date().getFullYear() - new Date(child.dob).getFullYear()} anos</td>
                    <td className="p-3 text-slate-600">{child.guardianName}</td>
                    <td className="p-3 text-slate-600">{child.phone}</td>
                    <td className="p-3 text-slate-600">
                      {child.planName ? <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs">{child.planName}</span> : <span className="text-slate-400 text-xs">-</span>}
                    </td>
                    <td className="p-3 text-right">
                      <button className="text-blue-600 hover:bg-blue-50 p-2 rounded"><Edit size={16}/></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Novo Cadastro de Paciente">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
             <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2"><UserPlus size={16}/> Dados Pessoais</h4>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputGroup label="Nome Completo">
                <input required className="input-base bg-white" value={formData.name} onChange={e => handleChange('name', e.target.value)} />
              </InputGroup>
              <div className="grid grid-cols-2 gap-4">
                <InputGroup label="Data Nascimento">
                  <input type="date" required className="input-base bg-white" value={formData.dob} onChange={e => handleChange('dob', e.target.value)} />
                </InputGroup>
                <InputGroup label="CPF">
                  <input required className="input-base bg-white" placeholder="000.000.000-00" maxLength={14} value={formData.cpf} onChange={e => handleChange('cpf', e.target.value)} />
                </InputGroup>
              </div>
            </div>
            <InputGroup label="Diagnóstico Clínico">
              <input className="input-base bg-white" placeholder="Ex: TEA Nível 1, TDAH..." value={formData.diagnosis} onChange={e => handleChange('diagnosis', e.target.value)} />
            </InputGroup>
          </div>

          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2"><FileText size={16}/> Laudos e Convênio</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <InputGroup label="Nome do Plano"><input className="input-base bg-white" value={formData.planName} onChange={e => handleChange('planName', e.target.value)} /></InputGroup>
              <InputGroup label="Nº Carteirinha"><input className="input-base bg-white" value={formData.planNumber} onChange={e => handleChange('planNumber', e.target.value)} /></InputGroup>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <InputGroup label="Data Último Laudo">
                  <input type="date" className="input-base bg-white" value={formData.planLastReport} onChange={e => handleChange('planLastReport', e.target.value)} />
                </InputGroup>
              </div>
              <div className="md:col-span-2">
                <InputGroup label="Fala/Parecer do Último Laudo">
                  <input className="input-base bg-white" placeholder="Resumo do resultado..." value={formData.planReportResult} onChange={e => handleChange('planReportResult', e.target.value)} />
                </InputGroup>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
            <h4 className="font-bold text-emerald-800 mb-3 flex items-center gap-2"><ShieldAlert size={16}/> Responsáveis e Segurança</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputGroup label="Nome Responsável"><input required className="input-base bg-white" value={formData.guardianName} onChange={e => handleChange('guardianName', e.target.value)} /></InputGroup>
              <InputGroup label="Telefone"><input required className="input-base bg-white" value={formData.phone} onChange={e => handleChange('phone', e.target.value)} /></InputGroup>
            </div>
            
            <InputGroup label="Quem pode buscar a criança? (Observações)">
              <textarea 
                className="input-base bg-white h-20 resize-none" 
                placeholder="Ex: Avó Maria, Tio João. NÃO ENTREGAR para..."
                value={formData.pickupNotes}
                onChange={e => handleChange('pickupNotes', e.target.value)}
              />
            </InputGroup>

            <div className="mt-2 pt-2 border-t border-emerald-200">
               <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 text-emerald-600" checked={formData.createAccount} onChange={e => handleChange('createAccount', e.target.checked)}/>
                  <span className="text-sm font-semibold text-emerald-800">Criar acesso ao sistema para responsável</span>
               </label>
               {formData.createAccount && (
                  <div className="grid grid-cols-2 gap-4 mt-2 animate-fade-in">
                     <InputGroup label="Email"><input className="input-base bg-white" value={formData.guardianEmail} onChange={e => handleChange('guardianEmail', e.target.value)}/></InputGroup>
                     <InputGroup label="Senha"><input className="input-base bg-white" type="password" value={formData.guardianPassword} onChange={e => handleChange('guardianPassword', e.target.value)}/></InputGroup>
                  </div>
               )}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" className="w-full md:w-auto h-12 text-lg">
              <CheckCircle size={20} /> Salvar Cadastro
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

// 4. GERENCIAMENTO DE PROFISSIONAIS
const ProfessionalsManager = ({ professionalsList, onSave }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    name: '', role: '', customRole: '', email: '', password: ''
  });

  const handleSave = (e) => {
    e.preventDefault();
    const finalRole = formData.role === 'Outros' ? formData.customRole : formData.role;
    onSave({ ...formData, role: finalRole, id: Date.now() });
    alert('Profissional cadastrado!');
    setIsModalOpen(false);
    setFormData({ name: '', role: '', customRole: '', email: '', password: '' });
  };

  const filtered = professionalsList.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Stethoscope className="text-cyan-600"/> Profissionais
        </h2>
        <Button onClick={() => setIsModalOpen(true)} className="bg-cyan-600 hover:bg-cyan-700 shadow-cyan-200">
          <Plus size={20} /> Novo Profissional
        </Button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-cyan-100">
        <div className="relative mb-4">
          <input className="input-base pl-10" placeholder="Buscar profissional..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18}/>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.length === 0 ? (
             <div className="col-span-full text-center text-slate-400 p-8">Nenhum profissional encontrado.</div>
          ) : (
            filtered.map(pro => (
              <div key={pro.id} className="border border-slate-100 rounded-lg p-4 hover:shadow-md transition bg-slate-50">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center text-cyan-600 font-bold">
                    {pro.name[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">{pro.name}</h4>
                    <p className="text-xs text-slate-500">{pro.role}</p>
                  </div>
                </div>
                <div className="text-xs text-slate-400 mt-2 pt-2 border-t border-slate-200">
                  {pro.email}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Novo Profissional">
        <form onSubmit={handleSave} className="space-y-4">
          <InputGroup label="Nome Completo">
            <input required className="input-base" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </InputGroup>
          
          <div>
            <label className="text-sm font-semibold text-slate-600 mb-2 block">Função</label>
            <div className="grid grid-cols-2 gap-2">
              {ROLES.map(role => (
                <label key={role} className="flex items-center gap-2 p-2 border rounded hover:bg-slate-50 cursor-pointer">
                  <input type="radio" name="role" value={role} checked={formData.role === role} onChange={e => setFormData({...formData, role: e.target.value})} className="text-cyan-600"/>
                  <span className="text-xs">{role}</span>
                </label>
              ))}
              <label className="flex items-center gap-2 p-2 border rounded hover:bg-slate-50 cursor-pointer">
                  <input type="radio" name="role" value="Outros" checked={formData.role === 'Outros'} onChange={e => setFormData({...formData, role: e.target.value})} className="text-cyan-600"/>
                  <span className="text-xs">Outros</span>
              </label>
            </div>
            {formData.role === 'Outros' && <input className="input-base mt-2" placeholder="Qual?" value={formData.customRole} onChange={e => setFormData({...formData, customRole: e.target.value})}/>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-cyan-50 p-4 rounded-lg">
             <InputGroup label="Email"><input required type="email" className="input-base bg-white" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}/></InputGroup>
             <InputGroup label="Senha"><input required type="password" className="input-base bg-white" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}/></InputGroup>
          </div>
          <Button type="submit" className="w-full">Cadastrar</Button>
        </form>
      </Modal>
    </div>
  );
};

// 5. GERENCIAMENTO DE ATIVIDADES
const ActivitiesManager = ({ childrenList, professionalsList, activitiesList, onSave }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Form State
  const [selectedChildId, setSelectedChildId] = useState('');
  const [generalObs, setGeneralObs] = useState('');
  const [activityDate, setActivityDate] = useState(getNowStr());
  const [proNotes, setProNotes] = useState([{ id: Date.now(), proId: '', obs: '', time: getNowStr() }]);

  const childOptions = childrenList.map(c => ({ value: c.id, label: c.name }));
  const proOptions = professionalsList.map(p => ({ value: p.id, label: `${p.name} - ${p.role}` }));

  const addProNoteField = () => setProNotes([...proNotes, { id: Date.now(), proId: '', obs: '', time: getNowStr() }]);
  const removeProNoteField = (id) => { if (proNotes.length > 1) setProNotes(proNotes.filter(n => n.id !== id)); };
  const updateProNote = (id, field, value) => setProNotes(proNotes.map(n => n.id === id ? { ...n, [field]: value } : n));

  const handleEdit = (activity) => {
    setEditingId(activity.id);
    setSelectedChildId(activity.childId);
    setGeneralObs(activity.generalObservation);
    setActivityDate(activity.date);
    // Garante que o array de notas tenha IDs únicos para renderização correta
    const loadedNotes = activity.proNotes.length > 0 
      ? activity.proNotes.map((n, i) => ({ ...n, id: n.id || Date.now() + i })) 
      : [{ id: Date.now(), proId: '', obs: '', time: getNowStr() }];
    
    setProNotes(loadedNotes);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setSelectedChildId('');
    setGeneralObs('');
    setActivityDate(getNowStr());
    setProNotes([{ id: Date.now(), proId: '', obs: '', time: getNowStr() }]);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!selectedChildId) return alert('Selecione uma criança');
    
    const childName = childrenList.find(c => c.id === selectedChildId)?.name;
    const resolvedNotes = proNotes
      .filter(n => n.proId && n.obs)
      .map(n => ({ 
        ...n, 
        proName: professionalsList.find(p => p.id === n.proId)?.name 
      }));

    const activityData = {
      id: editingId || Date.now(),
      childId: selectedChildId,
      childName,
      date: activityDate, // Mantém data original se editando
      generalObservation: generalObs,
      proNotes: resolvedNotes
    };

    onSave(activityData);
    alert(editingId ? 'Atividade atualizada com sucesso!' : 'Atividade registrada com sucesso!');
    closeModal();
  };

  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Activity className="text-indigo-600"/> Diário de Atividades
        </h2>
        <Button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200">
          <Plus size={20} /> Registrar Sessão
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-indigo-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 font-bold text-slate-600">Histórico Recente</div>
        <div className="divide-y divide-slate-100">
           {activitiesList.length === 0 ? (
             <div className="p-8 text-center text-slate-400">Nenhuma atividade registrada.</div>
           ) : (
             activitiesList.slice().reverse().map(act => (
               <div key={act.id} className="p-4 hover:bg-slate-50 transition">
                 <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-800">{act.childName}</h4>
                      <span className="text-xs text-slate-400">{act.date}</span>
                    </div>
                    <button 
                      onClick={() => handleEdit(act)} 
                      className="text-indigo-600 hover:bg-indigo-50 p-2 rounded-lg transition"
                      title="Editar Atividade"
                    >
                      <Edit size={18} />
                    </button>
                 </div>
                 <p className="text-sm text-slate-600 mb-2">{act.generalObservation}</p>
                 <div className="flex gap-2 flex-wrap">
                   {act.proNotes.map((n, i) => (
                     <span key={i} className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-1 rounded">
                       {n.proName}
                     </span>
                   ))}
                 </div>
               </div>
             ))
           )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingId ? "Editar Sessão" : "Nova Sessão"}>
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <SearchableSelect label="Criança" placeholder="Busque..." options={childOptions} value={selectedChildId} onChange={setSelectedChildId} />
             <InputGroup label="Data"><input disabled value={activityDate} className="input-base bg-slate-100 text-slate-500" /></InputGroup>
          </div>
          <InputGroup label="Observação Geral">
            <textarea className="input-base h-20" value={generalObs} onChange={e => setGeneralObs(e.target.value)} placeholder="Como a criança chegou?"/>
          </InputGroup>
          <div className="space-y-4 border-t pt-4">
            <label className="font-bold text-slate-700">Evolução por Profissional</label>
            {proNotes.map((note, idx) => (
              <div key={note.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 relative animate-fade-in">
                 <div className="flex justify-between mb-2">
                   <span className="text-xs font-bold uppercase text-slate-400">Profissional {idx + 1}</span>
                   {proNotes.length > 1 && <button type="button" onClick={() => removeProNoteField(note.id)} className="text-red-400"><Trash2 size={16}/></button>}
                 </div>
                 <SearchableSelect label="Quem atendeu?" placeholder="Selecione..." options={proOptions} value={note.proId} onChange={v => updateProNote(note.id, 'proId', v)}/>
                 <textarea className="input-base bg-white h-20 mt-2" placeholder="O que foi feito?" value={note.obs} onChange={e => updateProNote(note.id, 'obs', e.target.value)}/>
              </div>
            ))}
            <Button type="button" variant="secondary" onClick={addProNoteField} className="w-full border-dashed"><Plus size={16}/> Adicionar outro profissional</Button>
          </div>
          <Button type="submit" className="w-full">{editingId ? "Atualizar Sessão" : "Salvar Sessão"}</Button>
        </form>
      </Modal>
    </div>
  );
};

// 6. AGENDA
const Agenda = ({ childrenList, professionalsList, appointments, onSave }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAppt, setNewAppt] = useState({ childId: '', proId: '', start: '', end: '', obs: '' });

  const childOptions = childrenList.map(c => ({ value: c.id, label: c.name }));
  const proOptions = professionalsList.map(p => ({ value: p.id, label: p.name }));
  const filteredAppointments = appointments.filter(apt => apt.date === date).sort((a, b) => a.start.localeCompare(b.start));

  const handleSave = () => {
    if(!newAppt.childId || !newAppt.proId || !newAppt.start) return alert('Preencha os campos obrigatórios');
    const childName = childrenList.find(c => c.id === newAppt.childId)?.name;
    const proName = professionalsList.find(p => p.id === newAppt.proId)?.name;
    onSave({ id: Date.now(), date, ...newAppt, childName, proName });
    setIsModalOpen(false);
    setNewAppt({ childId: '', proId: '', start: '', end: '', obs: '' });
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6 relative z-10 pb-20">
      <div className="lg:w-1/3 space-y-4">
        <Card className="bg-blue-600 text-white border-none">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Calendar size={24}/> Agenda</h2>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-3 rounded-lg text-slate-800 font-bold outline-none shadow-lg"/>
        </Card>
        <div className="bg-white p-4 rounded-xl border border-blue-100 text-sm text-blue-800 shadow-sm flex justify-between items-center">
          <span className="font-bold">{date.split('-').reverse().join('/')}</span>
          <span>{filteredAppointments.length} agendamentos</span>
        </div>
      </div>

      <div className="lg:w-2/3 flex flex-col h-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-slate-700">Horários</h3>
          <Button onClick={() => setIsModalOpen(true)}><Plus size={20} /> Agendar</Button>
        </div>
        <div className="flex-1 space-y-3">
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-10 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-white/50">Agenda livre.</div>
          ) : (
            filteredAppointments.map(apt => (
              <div key={apt.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-4 relative overflow-hidden">
                 <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                 <div className="flex sm:flex-col items-center sm:justify-center gap-2 sm:gap-0 sm:min-w-[80px] sm:border-r border-slate-100 sm:pr-4">
                   <span className="text-lg font-bold text-slate-800">{apt.start}</span>
                   <span className="text-xs text-slate-400">{apt.end}</span>
                 </div>
                 <div className="flex-1">
                   <h4 className="font-bold text-slate-800">{apt.childName}</h4>
                   <p className="text-sm text-blue-600 mb-1">{apt.proName}</p>
                   {apt.obs && <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded inline-block">{apt.obs}</p>}
                 </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Novo Agendamento">
         <div className="space-y-4">
            <SearchableSelect label="Criança" options={childOptions} value={newAppt.childId} onChange={v => setNewAppt({...newAppt, childId: v})} placeholder="Busque..."/>
            <SearchableSelect label="Profissional" options={proOptions} value={newAppt.proId} onChange={v => setNewAppt({...newAppt, proId: v})} placeholder="Busque..."/>
            <div className="grid grid-cols-2 gap-4">
              <InputGroup label="Início"><input type="time" className="input-base" value={newAppt.start} onChange={e => setNewAppt({...newAppt, start: e.target.value})} /></InputGroup>
              <InputGroup label="Fim"><input type="time" className="input-base" value={newAppt.end} onChange={e => setNewAppt({...newAppt, end: e.target.value})} /></InputGroup>
            </div>
            <InputGroup label="Obs"><input className="input-base" value={newAppt.obs} onChange={e => setNewAppt({...newAppt, obs: e.target.value})} /></InputGroup>
            <Button onClick={handleSave} className="w-full">Confirmar</Button>
         </div>
      </Modal>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL (LAYOUT) ---

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  
  // Sidebar States
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // Desktop
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);   // Mobile

  // MOCK DATABASE LOCAL
  const [db, setDb] = useState({
    children: [],
    professionals: [],
    activities: [],
    appointments: []
  });

  const addData = (collection, item) => {
    setDb(prev => {
      const list = prev[collection];
      // Verifica se o item já existe pelo ID
      const index = list.findIndex(i => i.id === item.id);
      
      if (index >= 0) {
        // Atualiza item existente
        const newList = [...list];
        newList[index] = item;
        return { ...prev, [collection]: newList };
      }
      
      // Adiciona novo item
      return { ...prev, [collection]: [...list, item] };
    });
  };

  if (!isLoggedIn) {
    return <LoginScreen onLogin={() => setIsLoggedIn(true)} />;
  }

  const MenuLink = ({ view, icon: Icon, label }) => {
    const isActive = currentView === view;
    return (
      <button 
        onClick={() => { setCurrentView(view); setIsMobileMenuOpen(false); }}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative
          ${isActive ? 'bg-blue-50 text-blue-700 font-bold shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}
          ${isSidebarCollapsed ? 'justify-center' : ''}
        `}
        title={isSidebarCollapsed ? label : ''}
      >
        <Icon size={20} className={isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'} />
        {!isSidebarCollapsed && <span>{label}</span>}
        {!isSidebarCollapsed && isActive && <ChevronRight size={16} className="ml-auto opacity-50"/>}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans relative overflow-hidden">
      <PuzzleBackground />

      {/* LAYOUT REESTRUTURADO: FLEXBOX 
         Sidebar agora é flex item (Desktop) ou absolute (Mobile) 
         para evitar sobreposição de conteúdo.
      */}
      
      {/* Sidebar Desktop - Sticky para rolar junto mas ocupar espaço */}
      <aside 
        className={`
          hidden md:flex flex-col border-r border-slate-200 bg-white z-20 transition-all duration-300 sticky top-0 h-screen flex-shrink-0
          ${isSidebarCollapsed ? 'w-20' : 'w-64'}
        `}
      >
        <div 
           className={`p-6 border-b border-slate-100 flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'} cursor-pointer hover:bg-slate-50 transition`}
           onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
           title="Clique para recolher/expandir"
        >
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0 shadow-sm">
            <Puzzle size={18} fill="white" className="text-blue-600"/>
          </div>
          {!isSidebarCollapsed && <span className="text-xl font-bold text-slate-800 whitespace-nowrap">Recriar</span>}
        </div>
        
        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
           <MenuLink view="dashboard" icon={Users} label="Dashboard" />
           <MenuLink view="agenda" icon={Calendar} label="Agenda" />
           
           <div className={`mt-6 mb-2 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider ${isSidebarCollapsed ? 'text-center' : ''}`}>
             {isSidebarCollapsed ? '...' : 'Cadastros'}
           </div>
           <MenuLink view="children" icon={Baby} label="Crianças" />
           <MenuLink view="professionals" icon={Stethoscope} label="Profissionais" />
           
           <div className={`mt-6 mb-2 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider ${isSidebarCollapsed ? 'text-center' : ''}`}>
             {isSidebarCollapsed ? '...' : 'Clínico'}
           </div>
           <MenuLink view="activity" icon={Activity} label="Atividades" />
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={() => setIsLoggedIn(false)} 
            className={`flex items-center gap-2 text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg w-full transition ${isSidebarCollapsed ? 'justify-center' : ''}`}
            title="Sair"
          >
            <LogOut size={18} />
            {!isSidebarCollapsed && <span>Sair</span>}
          </button>
        </div>
      </aside>

      {/* Sidebar Mobile - Absolute Overlay */}
      <div className={`md:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-2xl transform transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
         <div className="p-4 flex items-center justify-between border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">R</div>
              <span className="font-bold text-slate-800">Recriar</span>
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)}><X className="text-slate-500"/></button>
         </div>
         <nav className="p-4 space-y-2">
           <MenuLink view="dashboard" icon={Users} label="Dashboard" />
           <MenuLink view="agenda" icon={Calendar} label="Agenda" />
           <MenuLink view="children" icon={Baby} label="Crianças" />
           <MenuLink view="professionals" icon={Stethoscope} label="Profissionais" />
           <MenuLink view="activity" icon={Activity} label="Atividades" />
           <button onClick={() => setIsLoggedIn(false)} className="flex items-center gap-3 px-4 py-3 text-red-500 w-full mt-4"><LogOut size={20}/> Sair</button>
         </nav>
      </div>

      {/* Overlay Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/20 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen relative z-10 overflow-hidden">
        {/* Header Mobile */}
        <header className="bg-white border-b border-slate-200 p-4 flex items-center justify-between md:hidden sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">R</div>
            <span className="font-bold text-slate-800">Recriar</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
            <Menu />
          </button>
        </header>

        {/* Content Area - Scroll independente */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {currentView === 'dashboard' && <Dashboard db={db} />}
          
          {currentView === 'children' && (
            <ChildrenManager 
              childrenList={db.children} 
              onSave={(data) => addData('children', data)} 
            />
          )}
          
          {currentView === 'professionals' && (
            <ProfessionalsManager 
              professionalsList={db.professionals} 
              onSave={(data) => addData('professionals', data)} 
            />
          )}
          
          {currentView === 'activity' && (
             <ActivitiesManager 
               childrenList={db.children} 
               professionalsList={db.professionals} 
               activitiesList={db.activities}
               onSave={(data) => addData('activities', data)} 
             />
          )}
          
          {currentView === 'agenda' && (
             <Agenda 
               childrenList={db.children} 
               professionalsList={db.professionals} 
               appointments={db.appointments} 
               onSave={(data) => addData('appointments', data)} 
             />
          )}
        </div>
      </main>

      <style>{`
        .input-base {
          width: 100%;
          padding: 0.5rem 1rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          outline: none;
          transition: all 0.2s;
        }
        .input-base:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default App;