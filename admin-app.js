class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-4">We're sorry, but something unexpected happened.</p>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-primary"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function AdminApp() {
  try {
    const [isAuthenticated, setIsAuthenticated] = React.useState(false);
    const [loading, setLoading] = React.useState(true);
    const [activeTab, setActiveTab] = React.useState('teachers');

    React.useEffect(() => {
      checkAuthStatus();
    }, []);

    const checkAuthStatus = () => {
      const isAdmin = AdminAuth.isAuthenticated();
      setIsAuthenticated(isAdmin);
      setLoading(false);
    };

    const handleLogin = async (password) => {
      try {
        const success = await AdminAuth.login(password);
        if (success) {
          setIsAuthenticated(true);
        }
        return success;
      } catch (error) {
        throw error;
      }
    };

    const handleLogout = () => {
      AdminAuth.logout();
      setIsAuthenticated(false);
    };

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="icon-loader-2 text-4xl text-[var(--primary-color)] animate-spin mb-4"></div>
            <p className="text-[var(--text-secondary)]">Memuat dashboard...</p>
          </div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return <AdminLogin onLogin={handleLogin} />;
    }

    return (
      <div className="min-h-screen bg-[var(--background-color)]" data-name="admin-app" data-file="admin-app.js">
        <header className="bg-white shadow-sm border-b border-[var(--border-color)]">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
            <div className="mobile-header">
              <div className="flex items-center gap-2 sm:gap-3">
                <img src="https://app.trickle.so/storage/public/images/usr_13477b4760000001/aae447b5-bf11-49de-9611-82edf71e9157.png" alt="Logo MAM 1 Paciran" className="h-8 w-8 sm:h-10 sm:w-10 object-contain" />
                <h1 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">Admin - MAM 1 Paciran</h1>
              </div>
              <div className="mobile-nav">
                <a href="index.html" className="btn btn-secondary">
                  <div className="icon-home text-sm mr-1 sm:mr-2"></div>
                  Lab Komputer
                </a>
                <button onClick={handleLogout} className="btn btn-danger">
                  <div className="icon-log-out text-sm mr-1 sm:mr-2"></div>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
          <div className="mb-6">
            <nav className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <button
                onClick={() => setActiveTab('teachers')}
                className={`btn ${activeTab === 'teachers' ? 'btn-primary' : 'btn-secondary'}`}
              >
                <div className="icon-users text-sm mr-1 sm:mr-2"></div>
                Manajemen Guru
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`btn ${activeTab === 'history' ? 'btn-primary' : 'btn-secondary'}`}
              >
                <div className="icon-calendar text-sm mr-1 sm:mr-2"></div>
                Riwayat Peminjaman
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className={`btn ${activeTab === 'reports' ? 'btn-primary' : 'btn-secondary'}`}
              >
                <div className="icon-chart-bar text-sm mr-1 sm:mr-2"></div>
                Laporan Penggunaan
              </button>
            </nav>
          </div>

          {activeTab === 'teachers' && <TeacherManagement />}
          {activeTab === 'history' && <BookingHistory />}
          {activeTab === 'reports' && <UsageReport />}
        </main>
      </div>
    );
  } catch (error) {
    console.error('AdminApp component error:', error);
    return null;
  }
}

const adminRoot = ReactDOM.createRoot(document.getElementById('admin-root'));
adminRoot.render(
  <ErrorBoundary>
    <AdminApp />
  </ErrorBoundary>
);