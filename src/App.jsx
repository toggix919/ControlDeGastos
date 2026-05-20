import React, { useState, useEffect } from 'react';
import { 
  auth, 
  db 
} from './firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile 
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  writeBatch 
} from 'firebase/firestore';
import { 
  Wallet, 
  PlusCircle, 
  Settings, 
  LogOut, 
  User, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  DollarSign, 
  CheckCircle, 
  X, 
  Pencil, 
  Trash2, 
  ChevronRight, 
  Loader2, 
  Lock, 
  Mail, 
  FileText, 
  AlertCircle, 
  RefreshCw,
  TrendingDown,
  Clock,
  Eye,
  Menu,
  XCircle,
  PiggyBank
} from 'lucide-react';

// --- CONFIGURACIÓN DE NOTIFICACIONES ---
function Notification({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-lg border border-gray-800 animate-slide-up text-sm font-medium">
      {type === 'error' ? <XCircle className="text-red-400" size={16} /> : <CheckCircle className="text-emerald-400" size={16} />}
      <span>{message}</span>
    </div>
  );
}

// --- PANTALLA DE AUTENTICACIÓN (LOGIN Y REGISTRO) ---
function AuthScreen({ showNotification }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim() || (!isLogin && !name.trim())) {
      showNotification('Por favor completa todos los campos', 'error');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        // Inicio de sesión
        const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
        const user = userCredential.user;
        
        // Verificar si existe el perfil en Firestore, si no, crearlo de forma segura
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (!userDocSnap.exists()) {
          await setDoc(userDocRef, {
            name: user.displayName || email.split('@')[0],
            email: email.trim()
          });
        }
        showNotification('Sesión iniciada con éxito');
      } else {
        // Registro de usuario nuevo
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const user = userCredential.user;

        // Actualizar perfil de Auth
        await updateProfile(user, { displayName: name.trim() });

        // Crear documento en Firestore de inmediato
        // Esto cumple la regla: allow create: if request.auth != null && request.auth.uid == userId;
        await setDoc(doc(db, 'users', user.uid), {
          name: name.trim(),
          email: email.trim()
        });
        showNotification('Cuenta creada y perfil registrado');
      }
    } catch (err) {
      console.error(err);
      let errMsg = 'Ocurrió un error en la autenticación';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        errMsg = 'Credenciales incorrectas';
      } else if (err.code === 'auth/email-already-in-use') {
        errMsg = 'El correo electrónico ya está registrado';
      } else if (err.code === 'auth/weak-password') {
        errMsg = 'La contraseña debe tener al menos 6 caracteres';
      } else if (err.code === 'auth/invalid-email') {
        errMsg = 'El formato de correo no es válido';
      }
      showNotification(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Círculos decorativos de fondo con gradientes */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-100/40 blur-3xl -z-10"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-violet-100/40 blur-3xl -z-10"></div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 p-8 relative z-10 transition-all duration-300">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-100 mb-4 animate-bounce">
            <PiggyBank size={28} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Control de Gastos Familiar</h2>
          <p className="text-sm text-gray-500 mt-1">
            {isLogin ? 'Ingresa a tu cuenta para gestionar el presupuesto' : 'Crea una cuenta para tu familia'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Nombre Completo</label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-gray-400" size={18} />
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  placeholder="Ej. Juan Pérez" 
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Correo Electrónico</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder="correo@ejemplo.com" 
                required
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="••••••••" 
                required
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-xl shadow-lg shadow-indigo-100 hover:shadow-indigo-200 transition-all text-sm flex justify-center items-center gap-2 mt-6 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              isLogin ? 'Iniciar Sesión' : 'Registrarse'
            )}
          </button>
        </form>

        <div className="text-center mt-6 pt-6 border-t border-gray-100">
          <button 
            type="button" 
            onClick={() => {
              setIsLogin(!isLogin);
              setName('');
              setEmail('');
              setPassword('');
            }}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            {isLogin ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya tienes una cuenta? Inicia sesión'}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- BOTÓN DE NAVEGACIÓN ---
function NavButton({ icon, label, active, onClick }) {
  return (
    <button 
      onClick={onClick} 
      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all w-full ${
        active 
          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' 
          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

// --- COMPONENTE PRINCIPAL ---
export default function App() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Datos de la App
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [users, setUsers] = useState([]);

  // Estados de interfaz
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [editingExpense, setEditingExpense] = useState(null);
  const [notification, setNotification] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  // 1. Escuchar estado de autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setLoadingAuth(false);
      }
    });
    return unsubscribe;
  }, []);

  // 2. Escuchar bases de datos en tiempo real cuando el usuario está logueado
  useEffect(() => {
    if (!user) {
      setExpenses([]);
      setCategories([]);
      setPaymentMethods([]);
      setUsers([]);
      setUserProfile(null);
      return;
    }

    setLoadingAuth(true);

    // Perfil del usuario actual
    const unsubProfile = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      if (docSnap.exists()) {
        setUserProfile(docSnap.data());
      }
      setLoadingAuth(false);
    }, (err) => {
      console.error("Error al obtener perfil:", err);
      setLoadingAuth(false);
    });

    // Categorías
    const unsubCategories = onSnapshot(collection(db, 'categories'), (snapshot) => {
      const list = [];
      snapshot.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      setCategories(list);
      
      // Auto-inicializar si está vacío
      if (snapshot.empty) {
        initializeDefaultCategories();
      }
    });

    // Métodos de Pago
    const unsubMethods = onSnapshot(collection(db, 'paymentMethods'), (snapshot) => {
      const list = [];
      snapshot.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      setPaymentMethods(list);
      
      // Auto-inicializar si está vacío
      if (snapshot.empty) {
        initializeDefaultMethods();
      }
    });

    // Lista de usuarios registrados en el sistema
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const list = [];
      snapshot.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      setUsers(list);
    });

    // Gastos
    const unsubExpenses = onSnapshot(collection(db, 'expenses'), (snapshot) => {
      const list = [];
      snapshot.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      // Ordenar por fecha descendente por defecto
      list.sort((a, b) => new Date(b.date) - new Date(a.date));
      setExpenses(list);
    });

    return () => {
      unsubProfile();
      unsubCategories();
      unsubMethods();
      unsubUsers();
      unsubExpenses();
    };
  }, [user]);

  // Inicializadores por defecto
  const initializeDefaultCategories = async () => {
    try {
      const defaults = ["Alimentación", "Servicios Públicos", "Transporte", "Entretenimiento", "Educación", "Salud", "Otros"];
      const batch = writeBatch(db);
      defaults.forEach(catName => {
        const docRef = doc(collection(db, 'categories'));
        batch.set(docRef, { name: catName });
      });
      await batch.commit();
    } catch (err) {
      console.error("Error al inicializar categorías por defecto:", err);
    }
  };

  const initializeDefaultMethods = async () => {
    try {
      const defaults = ["Efectivo", "Tarjeta de Crédito", "Tarjeta de Débito", "Transferencia Bancaria"];
      const batch = writeBatch(db);
      defaults.forEach(methodName => {
        const docRef = doc(collection(db, 'paymentMethods'));
        batch.set(docRef, { name: methodName });
      });
      await batch.commit();
    } catch (err) {
      console.error("Error al inicializar métodos de pago por defecto:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      showNotification('Sesión cerrada correctamente');
    } catch (err) {
      console.error(err);
      showNotification('Error al cerrar sesión', 'error');
    }
  };

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
        <span className="text-sm font-semibold text-gray-500">Conectando con la base de datos...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <AuthScreen showNotification={showNotification} />
        {notification && (
          <Notification 
            message={notification.message} 
            type={notification.type} 
            onClose={() => setNotification(null)} 
          />
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col md:flex-row">
      {/* BARRA LATERAL (PANTALLAS GRANDES) */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-150 p-6 shrink-0 justify-between">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-100">
              <Wallet size={20} />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 leading-none">Finanzas Fam</h1>
              <span className="text-xxs text-gray-400 font-medium uppercase tracking-wider">Control de Gastos</span>
            </div>
          </div>

          <nav className="space-y-1">
            <NavButton 
              icon={<Wallet size={18} />} 
              label="Resumen de Gastos" 
              active={currentTab === 'dashboard'} 
              onClick={() => setCurrentTab('dashboard')} 
            />
            <NavButton 
              icon={<PlusCircle size={18} />} 
              label="Registrar Gasto" 
              active={currentTab === 'add'} 
              onClick={() => setCurrentTab('add')} 
            />
            <NavButton 
              icon={<Settings size={18} />} 
              label="Configuración" 
              active={currentTab === 'settings'} 
              onClick={() => setCurrentTab('settings')} 
            />
          </nav>
        </div>

        <div className="space-y-4 pt-6 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-700 font-semibold text-sm flex items-center justify-center shrink-0">
              {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="truncate">
              <p className="text-sm font-semibold text-gray-800 leading-tight truncate">{userProfile?.name || 'Cargando...'}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm text-red-500 hover:bg-red-50 hover:text-red-700 transition-all w-full"
          >
            <LogOut size={18} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* CABECERA Y MENÚ MÓVIL */}
      <header className="md:hidden bg-white border-b border-gray-150 p-4 sticky top-0 z-40 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
            <Wallet size={16} />
          </div>
          <h1 className="font-bold text-gray-900 text-sm">Control Familiar</h1>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* DESPLEGABLE NAVEGACIÓN MÓVIL */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}>
          <div 
            className="bg-white w-3/4 max-w-xs h-full p-6 space-y-6 flex flex-col justify-between shadow-2xl animate-slide-right"
            onClick={e => e.stopPropagation()}
          >
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-700 font-semibold text-sm flex items-center justify-center shrink-0">
                  {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="truncate">
                  <p className="text-sm font-semibold text-gray-800 leading-tight truncate">{userProfile?.name}</p>
                  <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                </div>
              </div>

              <nav className="space-y-1">
                <NavButton 
                  icon={<Wallet size={18} />} 
                  label="Resumen de Gastos" 
                  active={currentTab === 'dashboard'} 
                  onClick={() => { setCurrentTab('dashboard'); setMobileMenuOpen(false); }} 
                />
                <NavButton 
                  icon={<PlusCircle size={18} />} 
                  label="Registrar Gasto" 
                  active={currentTab === 'add'} 
                  onClick={() => { setCurrentTab('add'); setMobileMenuOpen(false); }} 
                />
                <NavButton 
                  icon={<Settings size={18} />} 
                  label="Configuración" 
                  active={currentTab === 'settings'} 
                  onClick={() => { setCurrentTab('settings'); setMobileMenuOpen(false); }} 
                />
              </nav>
            </div>

            <button 
              onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm text-red-500 hover:bg-red-50 hover:text-red-700 transition-all w-full"
            >
              <LogOut size={18} />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      )}

      {/* ÁREA DE CONTENIDO */}
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
        {currentTab === 'dashboard' && (
          <Dashboard 
            expenses={expenses} 
            categories={categories} 
            paymentMethods={paymentMethods} 
            users={users}
            setEditingExpense={setEditingExpense}
            showNotification={showNotification}
          />
        )}
        {currentTab === 'add' && (
          <AddExpenseForm 
            categories={categories} 
            paymentMethods={paymentMethods} 
            users={users}
            setCurrentTab={setCurrentTab}
            showNotification={showNotification}
            currentUser={user}
          />
        )}
        {currentTab === 'settings' && (
          <SettingsView 
            categories={categories} 
            paymentMethods={paymentMethods} 
            users={users}
            currentUser={user}
            showNotification={showNotification}
          />
        )}
      </main>

      {/* MODAL DE EDICIÓN DE GASTOS */}
      {editingExpense && (
        <EditExpenseModal 
          expense={editingExpense} 
          categories={categories} 
          paymentMethods={paymentMethods} 
          users={users}
          onClose={() => setEditingExpense(null)} 
          showNotification={showNotification}
        />
      )}

      {/* COMPONENTE DE NOTIFICACIÓN */}
      {notification && (
        <Notification 
          message={notification.message} 
          type={notification.type} 
          onClose={() => setNotification(null)} 
        />
      )}
    </div>
  );
}

// ==========================================
// VISTA DE DASHBOARD
// ==========================================
function Dashboard({ expenses, categories, paymentMethods, users, setEditingExpense, showNotification }) {
  // Estado para filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [filterUser, setFilterUser] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('all');
  const [filterMonth, setFilterMonth] = useState('all');
  const [processingId, setProcessingId] = useState(null);

  // Obtener meses únicos con gastos
  const uniqueMonths = Array.from(new Set(
    expenses.map(e => e.date.substring(0, 7))
  )).sort().reverse();

  // Filtrado de gastos
  const filteredExpenses = expenses.filter(exp => {
    const matchesSearch = exp.concept.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (exp.observaciones && exp.observaciones.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesUser = filterUser === 'all' || exp.user === filterUser;
    const matchesCategory = filterCategory === 'all' || exp.category === filterCategory;
    const matchesPayment = filterPaymentMethod === 'all' || exp.paymentMethod === filterPaymentMethod;
    const matchesMonth = filterMonth === 'all' || exp.date.startsWith(filterMonth);

    return matchesSearch && matchesUser && matchesCategory && matchesPayment && matchesMonth;
  });

  // Métricas
  const totalAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  
  // Gasto este mes (mes actual)
  const currentMonthStr = new Date().toISOString().substring(0, 7);
  const thisMonthExpenses = expenses.filter(e => e.date.startsWith(currentMonthStr));
  const thisMonthTotal = thisMonthExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Gastos recurrentes activos
  const recurringCount = expenses.filter(e => e.isRecurring).length;

  // Último gasto
  const lastExpense = expenses.length > 0 ? expenses[0] : null;

  // Distribución de gastos agrupados para visualización bento
  const groupData = (key, catalog) => {
    const summary = {};
    filteredExpenses.forEach(exp => {
      const id = exp[key];
      summary[id] = (summary[id] || 0) + exp.amount;
    });

    return Object.entries(summary)
      .map(([id, sum]) => {
        const item = catalog.find(c => c.id === id);
        return {
          name: item ? item.name : 'Desconocido',
          value: sum,
          percentage: totalAmount > 0 ? (sum / totalAmount) * 100 : 0
        };
      })
      .sort((a, b) => b.value - a.value);
  };

  const categoriesChart = groupData('category', categories);
  const usersChart = groupData('user', users);
  const methodsChart = groupData('paymentMethod', paymentMethods);

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este gasto?')) return;
    setProcessingId(id);
    try {
      await deleteDoc(doc(db, 'expenses', id));
      showNotification('Gasto eliminado correctamente');
    } catch (err) {
      console.error(err);
      showNotification('Error al eliminar el gasto', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val);
  };

  const getCategoryName = (id) => categories.find(c => c.id === id)?.name || 'Desconocido';
  const getMethodName = (id) => paymentMethods.find(m => m.id === id)?.name || 'Desconocido';
  const getUserName = (id) => users.find(u => u.id === id)?.name || 'Desconocido';

  return (
    <div className="space-y-6">
      {/* SECCIÓN MÉTRIQUES BENTO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total General Filtrado */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Filtrado</p>
            <h3 className="text-xl font-bold text-gray-800 mt-0.5">{formatCurrency(totalAmount)}</h3>
          </div>
        </div>

        {/* Total Mes Actual */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingDown size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Gastos de Este Mes</p>
            <h3 className="text-xl font-bold text-gray-800 mt-0.5">{formatCurrency(thisMonthTotal)}</h3>
          </div>
        </div>

        {/* Recurrentes */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Gastos Recurrentes</p>
            <h3 className="text-xl font-bold text-gray-800 mt-0.5">{recurringCount} activos</h3>
          </div>
        </div>

        {/* Último Gasto */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow truncate">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <Calendar size={24} />
          </div>
          <div className="truncate">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Último Gasto</p>
            <h3 className="text-sm font-bold text-gray-800 mt-0.5 truncate">{lastExpense ? lastExpense.concept : 'Ninguno'}</h3>
            <p className="text-xxs text-gray-400 mt-0.5">{lastExpense ? `${formatCurrency(lastExpense.amount)} · ${lastExpense.date}` : ''}</p>
          </div>
        </div>
      </div>

      {/* SECCIÓN FILTROS */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="font-bold text-gray-800 text-lg flex items-center gap-2">
            <Filter size={18} className="text-indigo-600" />
            Filtros y Búsqueda
          </h2>
          {(searchQuery || filterUser !== 'all' || filterCategory !== 'all' || filterPaymentMethod !== 'all' || filterMonth !== 'all') && (
            <button 
              onClick={() => {
                setSearchQuery('');
                setFilterUser('all');
                setFilterCategory('all');
                setFilterPaymentMethod('all');
                setFilterMonth('all');
              }}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5"
            >
              <RefreshCw size={12} />
              Limpiar filtros
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {/* Búsqueda por Concepto */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar por concepto..." 
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
            />
          </div>

          {/* Filtro por Miembro */}
          <select 
            value={filterUser}
            onChange={e => setFilterUser(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
          >
            <option value="all">Todos los miembros</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>

          {/* Filtro por Categoría */}
          <select 
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
          >
            <option value="all">Todas las categorías</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Filtro por Método de Pago */}
          <select 
            value={filterPaymentMethod}
            onChange={e => setFilterPaymentMethod(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
          >
            <option value="all">Todos los métodos</option>
            {paymentMethods.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>

          {/* Filtro por Mes */}
          <select 
            value={filterMonth}
            onChange={e => setFilterMonth(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
          >
            <option value="all">Todos los meses</option>
            {uniqueMonths.map(m => {
              const [year, month] = m.split('-');
              const dateName = new Date(year, month - 1).toLocaleString('es-ES', { month: 'long', year: 'numeric' });
              return <option key={m} value={m}>{dateName.charAt(0).toUpperCase() + dateName.slice(1)}</option>;
            })}
          </select>
        </div>
      </div>

      {/* SECCIÓN TABLA Y DISTRIBUCIONES (2 COLUMNAS) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* TABLA DE GASTOS */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden lg:col-span-2 flex flex-col h-[520px]">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center shrink-0">
            <h3 className="font-bold text-gray-800">Historial de Gastos</h3>
            <span className="text-xs font-semibold bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full">{filteredExpenses.length} Gastos</span>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredExpenses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <FileText size={48} strokeWidth={1} className="mb-2" />
                <p className="text-sm">No se encontraron gastos con los filtros aplicados.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {/* Cabecera oculta en móvil */}
                <div className="hidden md:grid grid-cols-12 gap-2 p-4 text-xxs font-bold text-gray-400 uppercase tracking-wider bg-slate-50/50">
                  <div className="col-span-4">Concepto</div>
                  <div className="col-span-2 text-right">Monto</div>
                  <div className="col-span-2">Miembro</div>
                  <div className="col-span-2">Categoría</div>
                  <div className="col-span-2 text-right">Acciones</div>
                </div>

                {filteredExpenses.map(exp => (
                  <div 
                    key={exp.id} 
                    className="grid grid-cols-1 md:grid-cols-12 gap-2 p-4 items-center hover:bg-slate-50/40 relative group transition-colors"
                  >
                    {processingId === exp.id && (
                      <div className="absolute inset-0 bg-white/70 flex justify-center items-center z-10">
                        <Loader2 className="animate-spin text-indigo-600" size={20} />
                      </div>
                    )}

                    {/* Móvil y Desktop: Concepto y Fecha */}
                    <div className="col-span-1 md:col-span-4 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-800 truncate">{exp.concept}</p>
                        {exp.isRecurring && (
                          <span className="text-xxs font-semibold bg-amber-50 text-amber-600 border border-amber-200 px-1.5 py-0.2 rounded-full flex items-center gap-0.5 select-none">
                            <Clock size={10} /> Rec
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2 items-center text-xs text-gray-400 mt-0.5">
                        <span>{exp.date}</span>
                        <span>·</span>
                        <span className="truncate">{getMethodName(exp.paymentMethod)}</span>
                      </div>
                    </div>

                    {/* Monto */}
                    <div className="col-span-1 md:col-span-2 text-left md:text-right font-bold text-gray-800 text-sm">
                      <span className="md:hidden text-xs font-medium text-gray-400 mr-1">Monto:</span>
                      {formatCurrency(exp.amount)}
                    </div>

                    {/* Miembro */}
                    <div className="col-span-1 md:col-span-2 text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-xxs uppercase text-gray-500 font-bold shrink-0">
                        {getUserName(exp.user).charAt(0)}
                      </div>
                      <span className="truncate">{getUserName(exp.user)}</span>
                    </div>

                    {/* Categoría */}
                    <div className="col-span-1 md:col-span-2">
                      <span className="inline-flex text-xxs font-semibold bg-indigo-50/70 text-indigo-700 px-2 py-0.5 rounded-md truncate max-w-full">
                        {getCategoryName(exp.category)}
                      </span>
                    </div>

                    {/* Acciones */}
                    <div className="col-span-1 md:col-span-2 flex justify-end gap-1 mt-2 md:mt-0">
                      <button 
                        onClick={() => setEditingExpense(exp)}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Editar Gasto"
                      >
                        <Pencil size={15} />
                      </button>
                      <button 
                        onClick={() => handleDelete(exp.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Eliminar Gasto"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* DISTRIBUCIÓN Y GRÁFICOS SENCILLOS */}
        <div className="space-y-6">
          {/* Distribución por Categoría */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-800 text-sm">Gastos por Categoría</h3>
            <div className="space-y-3">
              {categoriesChart.length === 0 && <p className="text-xs text-gray-400">Sin datos de gastos.</p>}
              {categoriesChart.slice(0, 5).map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-gray-600">
                    <span className="truncate">{item.name}</span>
                    <span>{formatCurrency(item.value)} ({item.percentage.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      style={{ width: `${item.percentage}%` }} 
                      className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Distribución por Miembro */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-800 text-sm">Distribución por Miembro</h3>
            <div className="space-y-3">
              {usersChart.length === 0 && <p className="text-xs text-gray-400">Sin datos de gastos.</p>}
              {usersChart.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-gray-600">
                    <span className="truncate">{item.name}</span>
                    <span>{formatCurrency(item.value)} ({item.percentage.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      style={{ width: `${item.percentage}%` }} 
                      className="bg-violet-500 h-full rounded-full transition-all duration-500"
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// FORMULARIO PARA REGISTRAR GASTO
// ==========================================
function AddExpenseForm({ categories, paymentMethods, users, setCurrentTab, showNotification, currentUser }) {
  const [concept, setConcept] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  
  // Recurrencia
  const [isRecurring, setIsRecurring] = useState(false);
  const [nextRecurrenceDate, setNextRecurrenceDate] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [saving, setSaving] = useState(false);

  // Inicializar el select de usuario con el usuario actual si existe
  useEffect(() => {
    if (users.length > 0) {
      const match = users.find(u => u.id === currentUser?.uid);
      if (match) {
        setSelectedUser(match.id);
      } else {
        setSelectedUser(users[0].id);
      }
    }
  }, [users, currentUser]);

  // Inicializar selects de categoría y método de pago con el primer elemento
  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) setSelectedCategory(categories[0].id);
  }, [categories, selectedCategory]);

  useEffect(() => {
    if (paymentMethods.length > 0 && !selectedPaymentMethod) setSelectedPaymentMethod(paymentMethods[0].id);
  }, [paymentMethods, selectedPaymentMethod]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!concept.trim() || !amount || !date || !selectedUser || !selectedCategory || !selectedPaymentMethod) {
      showNotification('Por favor completa los campos requeridos', 'error');
      return;
    }

    setSaving(true);
    try {
      const expenseData = {
        concept: concept.trim(),
        amount: parseFloat(amount),
        date: date,
        user: selectedUser,
        category: selectedCategory,
        paymentMethod: selectedPaymentMethod,
        isRecurring: isRecurring,
        nextRecurrenceDate: isRecurring ? (nextRecurrenceDate || null) : null,
        paymentDate: isRecurring ? (paymentDate || null) : null,
        observaciones: observaciones.trim(),
        createdBy: currentUser.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        recurringId: isRecurring ? `rec_${Date.now()}` : null
      };

      await addDoc(collection(db, 'expenses'), expenseData);

      showNotification('Gasto registrado exitosamente');
      // Resetear formulario
      setConcept('');
      setAmount('');
      setDate(new Date().toISOString().substring(0, 10));
      setIsRecurring(false);
      setNextRecurrenceDate('');
      setPaymentDate('');
      setObservaciones('');

      // Regresar al dashboard
      setCurrentTab('dashboard');
    } catch (err) {
      console.error(err);
      showNotification('Error al guardar el gasto', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Registrar Nuevo Gasto</h2>
        <p className="text-sm text-gray-400 mt-1">Ingresa los detalles del gasto familiar realizado.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Concepto */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Concepto *</label>
            <input 
              type="text" 
              required 
              placeholder="Ej. Supermercado semanal, Pago de luz..."
              value={concept}
              onChange={e => setConcept(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
            />
          </div>

          {/* Monto */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Monto ($ MXN) *</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 text-gray-400" size={16} />
              <input 
                type="number" 
                step="0.01" 
                required 
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all font-semibold"
              />
            </div>
          </div>

          {/* Fecha */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Fecha de Gasto *</label>
            <input 
              type="date" 
              required
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all font-semibold"
            />
          </div>

          {/* Miembro de la Familia */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Miembro Asignado *</label>
            <select 
              value={selectedUser}
              onChange={e => setSelectedUser(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
            >
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Categoría *</label>
            <select 
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
            >
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Método de Pago */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Método de Pago *</label>
            <select 
              value={selectedPaymentMethod}
              onChange={e => setSelectedPaymentMethod(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
            >
              {paymentMethods.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          {/* Activar Recurrencia */}
          <div className="flex items-center gap-3 pt-6">
            <input 
              type="checkbox" 
              id="isRecurring"
              checked={isRecurring}
              onChange={e => setIsRecurring(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
            />
            <label htmlFor="isRecurring" className="text-sm font-semibold text-gray-700 select-none cursor-pointer flex items-center gap-1">
              ¿Es un gasto recurrente?
            </label>
          </div>
        </div>

        {/* Campos de recurrencia adicionales */}
        {isRecurring && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl animate-fade-in">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Siguiente Fecha de Pago</label>
              <input 
                type="date" 
                value={nextRecurrenceDate}
                onChange={e => setNextRecurrenceDate(e.target.value)}
                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Fecha Límite de Pago</label>
              <input 
                type="date" 
                value={paymentDate}
                onChange={e => setPaymentDate(e.target.value)}
                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        )}

        {/* Observaciones */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Observaciones</label>
          <textarea 
            placeholder="Añade detalles o notas adicionales del gasto..."
            rows="3"
            value={observaciones}
            onChange={e => setObservaciones(e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all resize-none"
          ></textarea>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3 pt-4">
          <button 
            type="button" 
            onClick={() => setCurrentTab('dashboard')}
            className="px-5 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium text-sm rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            disabled={saving}
            className="px-5 py-2.5 bg-indigo-600 text-white font-medium text-sm rounded-xl hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-100 flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 className="animate-spin" size={16} /> : 'Guardar Gasto'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ==========================================
// MODAL DE EDICIÓN DE GASTOS
// ==========================================
function EditExpenseModal({ expense, categories, paymentMethods, users, onClose, showNotification }) {
  const [concept, setConcept] = useState(expense.concept);
  const [amount, setAmount] = useState(expense.amount);
  const [date, setDate] = useState(expense.date);
  const [selectedUser, setSelectedUser] = useState(expense.user);
  const [selectedCategory, setSelectedCategory] = useState(expense.category);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(expense.paymentMethod);
  const [isRecurring, setIsRecurring] = useState(expense.isRecurring || false);
  const [nextRecurrenceDate, setNextRecurrenceDate] = useState(expense.nextRecurrenceDate || '');
  const [paymentDate, setPaymentDate] = useState(expense.paymentDate || '');
  const [observaciones, setObservaciones] = useState(expense.observaciones || '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!concept.trim() || !amount || !date || !selectedUser || !selectedCategory || !selectedPaymentMethod) {
      showNotification('Completa todos los campos requeridos', 'error');
      return;
    }

    setSaving(true);
    try {
      const updatedData = {
        concept: concept.trim(),
        amount: parseFloat(amount),
        date: date,
        user: selectedUser,
        category: selectedCategory,
        paymentMethod: selectedPaymentMethod,
        isRecurring: isRecurring,
        nextRecurrenceDate: isRecurring ? (nextRecurrenceDate || null) : null,
        paymentDate: isRecurring ? (paymentDate || null) : null,
        observaciones: observaciones.trim(),
        updatedAt: new Date().toISOString()
      };

      await updateDoc(doc(db, 'expenses', expense.id), updatedData);
      showNotification('Gasto actualizado correctamente');
      onClose();
    } catch (err) {
      console.error(err);
      showNotification('Error al actualizar el gasto', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-gray-150 shadow-2xl w-full max-w-xl p-6 md:p-8 space-y-6 animate-scale-up relative">
        <button 
          onClick={onClose} 
          className="absolute right-6 top-6 p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-slate-50 border border-gray-100"
        >
          <X size={18} />
        </button>

        <div>
          <h2 className="text-xl font-bold text-gray-800">Editar Gasto</h2>
          <p className="text-xs text-gray-400 mt-0.5">Modifica los detalles del gasto familiar seleccionado.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Concepto */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Concepto *</label>
              <input 
                type="text" 
                required 
                value={concept}
                onChange={e => setConcept(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-500"
              />
            </div>

            {/* Monto */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Monto ($ MXN) *</label>
              <input 
                type="number" 
                step="0.01" 
                required 
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-gray-200 rounded-xl text-sm font-semibold outline-none focus:border-indigo-500"
              />
            </div>

            {/* Fecha */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Fecha *</label>
              <input 
                type="date" 
                required 
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-gray-200 rounded-xl text-sm font-semibold outline-none focus:border-indigo-500"
              />
            </div>

            {/* Miembro */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Miembro *</label>
              <select 
                value={selectedUser}
                onChange={e => setSelectedUser(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-500"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Categoría *</label>
              <select 
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-500"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Método de pago */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Método de Pago *</label>
              <select 
                value={selectedPaymentMethod}
                onChange={e => setSelectedPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-500"
              >
                {paymentMethods.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>

            {/* Toggle recurrente */}
            <div className="flex items-center gap-2 pt-4">
              <input 
                type="checkbox" 
                id="editIsRecurring"
                checked={isRecurring}
                onChange={e => setIsRecurring(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 border-gray-300"
              />
              <label htmlFor="editIsRecurring" className="text-sm font-semibold text-gray-700 select-none cursor-pointer">
                ¿Es gasto recurrente?
              </label>
            </div>
          </div>

          {isRecurring && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl animate-fade-in">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Siguiente Pago</label>
                <input 
                  type="date" 
                  value={nextRecurrenceDate}
                  onChange={e => setNextRecurrenceDate(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Límite Pago</label>
                <input 
                  type="date" 
                  value={paymentDate}
                  onChange={e => setPaymentDate(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs outline-none"
                />
              </div>
            </div>
          )}

          {/* Observaciones */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Observaciones</label>
            <textarea 
              rows="2"
              value={observaciones}
              onChange={e => setObservaciones(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-500"
            ></textarea>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-4">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 border border-gray-200 text-gray-600 font-semibold text-xs rounded-xl hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={saving}
              className="px-4 py-2 bg-indigo-600 text-white font-semibold text-xs rounded-xl hover:bg-indigo-700 flex items-center gap-2"
            >
              {saving ? <Loader2 size={12} className="animate-spin" /> : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// VISTA DE AJUSTES Y CONFIGURACIÓN
// ==========================================
function SettingsView({ categories, paymentMethods, users, currentUser, showNotification }) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Configuración del Sistema</h2>
        <p className="text-sm text-gray-400 mt-1">Administra los catálogos y miembros registrados en la cuenta familiar.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CRUD CATEGORÍAS */}
        <SettingsCrudList 
          title="Categorías" 
          collectionName="categories"
          items={categories} 
          placeholder="Nueva categoría..."
          showNotification={showNotification}
        />

        {/* CRUD MÉTODOS DE PAGO */}
        <SettingsCrudList 
          title="Métodos de Pago" 
          collectionName="paymentMethods"
          items={paymentMethods} 
          placeholder="Nuevo método..."
          showNotification={showNotification}
        />

        {/* LISTA DE USUARIOS (MIEMBROS DE LA FAMILIA) */}
        <UsersSettingsList 
          users={users} 
          currentUser={currentUser}
          showNotification={showNotification}
        />
      </div>
    </div>
  );
}

// --- CRUD GENÉRICO DE CONFIGURACIÓN (Firestore) ---
function SettingsCrudList({ title, collectionName, items, placeholder, showNotification }) {
  const [newItemName, setNewItemName] = useState('');
  const [processingId, setProcessingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  const handleAdd = async (e) => {
    e.preventDefault();
    const trimmed = newItemName.trim();
    if (!trimmed) return;

    if (items.some(i => i.name.toLowerCase() === trimmed.toLowerCase())) {
      showNotification('El elemento ya existe', 'error');
      return;
    }

    setProcessingId('new');
    try {
      await addDoc(collection(db, collectionName), { name: trimmed });
      showNotification(`${title.slice(0, -1)} agregada correctamente`);
      setNewItemName('');
    } catch (err) {
      console.error(err);
      showNotification('Error al crear elemento', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRemove = async (id) => {
    if (!window.confirm(`¿Seguro que deseas eliminar esta opción?`)) return;
    setProcessingId(id);
    try {
      await deleteDoc(doc(db, collectionName, id));
      showNotification('Elemento eliminado');
    } catch (err) {
      console.error(err);
      showNotification('Error al eliminar elemento', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleEditSave = async (id) => {
    const trimmed = editName.trim();
    if (!trimmed) return;

    if (items.some(i => i.id !== id && i.name.toLowerCase() === trimmed.toLowerCase())) {
      showNotification('El elemento ya existe', 'error');
      return;
    }

    setProcessingId(id);
    try {
      await updateDoc(doc(db, collectionName, id), { name: trimmed });
      showNotification('Elemento actualizado');
      setEditingId(null);
    } catch (err) {
      console.error(err);
      showNotification('Error al guardar cambios', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-96">
      <div className="p-4 bg-slate-50/50 border-b border-gray-100 flex justify-between items-center shrink-0">
        <h3 className="font-semibold text-gray-700 text-sm">{title}</h3>
        <span className="text-xxs font-semibold bg-white border border-gray-200 px-2 py-0.5 rounded-full">{items.length}</span>
      </div>

      <div className="p-4 flex-1 overflow-y-auto space-y-2 relative">
        {items.length === 0 && <p className="text-xs text-gray-400 text-center py-4">Lista vacía.</p>}
        {items.map(item => (
          <div key={item.id} className="flex justify-between items-center p-2 hover:bg-slate-50 rounded-xl group transition-colors relative">
            {processingId === item.id && (
              <div className="absolute inset-0 bg-white/70 flex justify-center items-center z-10">
                <Loader2 className="animate-spin text-indigo-500" size={14} />
              </div>
            )}

            {editingId === item.id ? (
              <div className="flex-1 flex items-center gap-1.5 mr-2">
                <input 
                  autoFocus 
                  type="text" 
                  value={editName} 
                  onChange={e => setEditName(e.target.value)} 
                  className="flex-1 px-2.5 py-1 border border-indigo-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button 
                  disabled={!!processingId} 
                  onClick={() => handleEditSave(item.id)} 
                  className="text-emerald-600 hover:text-emerald-700 p-1"
                >
                  <CheckCircle size={15} />
                </button>
                <button 
                  disabled={!!processingId} 
                  onClick={() => setEditingId(null)} 
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X size={15} />
                </button>
              </div>
            ) : (
              <>
                <span className="text-xs font-semibold text-gray-700">{item.name}</span>
                <div className="flex gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    disabled={!!processingId} 
                    onClick={() => { setEditingId(item.id); setEditName(item.name); }} 
                    className="text-gray-400 hover:text-indigo-600 p-1"
                  >
                    <Pencil size={14} />
                  </button>
                  <button 
                    disabled={!!processingId} 
                    onClick={() => handleRemove(item.id)} 
                    className="text-gray-400 hover:text-red-500 p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-gray-100 bg-white shrink-0">
        <form onSubmit={handleAdd} className="flex gap-2">
          <input 
            disabled={!!processingId} 
            type="text" 
            value={newItemName} 
            onChange={e => setNewItemName(e.target.value)} 
            placeholder={placeholder} 
            className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-100 disabled:opacity-50"
          />
          <button 
            type="submit" 
            disabled={!newItemName.trim() || !!processingId} 
            className="bg-indigo-600 text-white w-9 h-9 flex justify-center items-center rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors shrink-0"
          >
            {processingId === 'new' ? <Loader2 size={15} className="animate-spin" /> : <Plus size={16} />}
          </button>
        </form>
      </div>
    </div>
  );
}

// --- CRUD ESPECÍFICO PARA USUARIOS (Cumpliendo Reglas de Seguridad) ---
function UsersSettingsList({ users, currentUser, showNotification }) {
  const [processingId, setProcessingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  const handleEditSave = async (id) => {
    const trimmed = editName.trim();
    if (!trimmed) return;

    setProcessingId(id);
    try {
      // Modificar el perfil del propio usuario registrado en Firestore
      // Esto es permitido por request.auth.uid == userId
      await updateDoc(doc(db, 'users', id), { name: trimmed });
      
      // Intentar actualizar también displayName en Firebase Auth para sincronizar
      if (auth.currentUser && auth.currentUser.uid === id) {
        await updateProfile(auth.currentUser, { displayName: trimmed });
      }

      showNotification('Nombre de perfil actualizado correctamente');
      setEditingId(null);
    } catch (err) {
      console.error(err);
      showNotification('Error al actualizar tu perfil', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-96">
      <div className="p-4 bg-slate-50/50 border-b border-gray-100 flex justify-between items-center shrink-0">
        <h3 className="font-semibold text-gray-700 text-sm">Miembros de la Familia</h3>
        <span className="text-xxs font-semibold bg-white border border-gray-200 px-2 py-0.5 rounded-full">{users.length}</span>
      </div>

      <div className="p-4 flex-1 overflow-y-auto space-y-2 relative">
        {users.map(u => {
          const isMe = u.id === currentUser?.uid;

          return (
            <div key={u.id} className="flex justify-between items-center p-2 hover:bg-slate-50 rounded-xl group transition-colors relative">
              {processingId === u.id && (
                <div className="absolute inset-0 bg-white/70 flex justify-center items-center z-10">
                  <Loader2 className="animate-spin text-indigo-500" size={14} />
                </div>
              )}

              {editingId === u.id ? (
                <div className="flex-1 flex flex-col gap-1.5 mr-2">
                  <input 
                    autoFocus 
                    type="text" 
                    value={editName} 
                    onChange={e => setEditName(e.target.value)} 
                    className="w-full px-2.5 py-1 border border-indigo-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <div className="flex gap-2 justify-end">
                    <button 
                      disabled={!!processingId} 
                      onClick={() => setEditingId(null)} 
                      className="text-xxs text-gray-500 hover:text-gray-700 font-semibold"
                    >
                      Cancelar
                    </button>
                    <button 
                      disabled={!!processingId} 
                      onClick={() => handleEditSave(u.id)} 
                      className="text-xxs text-emerald-600 hover:text-emerald-700 font-semibold"
                    >
                      Guardar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                      {u.name}
                      {isMe && <span className="text-xxs bg-indigo-50 text-indigo-600 px-1 py-0.2 rounded font-medium">Tú</span>}
                    </span>
                    <span className="text-xxs text-gray-400">{u.email}</span>
                  </div>

                  {isMe && (
                    <button 
                      disabled={!!processingId} 
                      onClick={() => { setEditingId(u.id); setEditName(u.name); }} 
                      className="text-gray-400 hover:text-indigo-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Pencil size={14} />
                    </button>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="p-4 border-t border-gray-100 bg-slate-50/50 text-xxs text-gray-400 shrink-0">
        <p className="leading-normal">
          <AlertCircle size={10} className="inline mr-1 text-indigo-500" />
          Los miembros de la familia se registran con su propia cuenta en la pantalla inicial para colaborar de forma segura. Puedes editar tu propio nombre.
        </p>
      </div>
    </div>
  );
}
