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
              className="btn btn-black"
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

function App() {
  try {
    const [isAuthenticated, setIsAuthenticated] = React.useState(false);
    const [currentUser, setCurrentUser] = React.useState(null);
    const [schedules, setSchedules] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
      initializeApp();
    }, []);

    const initializeApp = async () => {
      try {
        // Try to initialize demo data (silent fail if not possible)
        await SupabaseService.initializeDemoData();
      } catch (error) {
        console.log('Demo data initialization skipped');
      }
      
      checkAuthStatus();
      await loadSchedules();
    };

    React.useEffect(() => {
      if (isAuthenticated) {
        loadSchedules();
      }
    }, [isAuthenticated]);

    const checkAuthStatus = () => {
      const user = AuthService.getCurrentUser();
      if (user) {
        setCurrentUser(user);
        setIsAuthenticated(true);
      }
      setLoading(false);
    };

    const handleLogin = async (email, password) => {
      try {
        const user = await AuthService.login(email, password);
        setCurrentUser(user);
        setIsAuthenticated(true);
        await loadSchedules();
      } catch (error) {
        throw error;
      }
    };

    const handleLogout = () => {
      AuthService.logout();
      setCurrentUser(null);
      setIsAuthenticated(false);
      setSchedules([]);
    };

    const loadSchedules = async () => {
      try {
        const scheduleData = await DatabaseService.getSchedules();
        setSchedules(scheduleData);
      } catch (error) {
        console.error('Error loading schedules:', error);
        // Fallback to empty array if database fails
        setSchedules([]);
      }
    };

    const handleBooking = async (bookingData) => {
      try {
        await DatabaseService.createBooking(bookingData);
        // Force refresh schedules to ensure UI updates
        setSchedules([]);
        await loadSchedules();
      } catch (error) {
        console.error('Error creating booking:', error);
        throw error;
      }
    };

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="icon-loader-2 text-4xl text-[var(--primary-color)] animate-spin mb-4"></div>
            <p className="text-[var(--text-secondary)]">Memuat aplikasi...</p>
          </div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return (
        <div className="min-h-screen bg-[var(--background-color)]">
          <header className="bg-white shadow-sm border-b border-[var(--border-color)]">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
              <div className="mobile-header">
                <div className="flex items-center gap-2 sm:gap-3">
                  <img src="https://app.trickle.so/storage/public/images/usr_13477b4760000001/aae447b5-bf11-49de-9611-82edf71e9157.png" alt="Logo MAM 1 Paciran" className="h-8 w-8 sm:h-10 sm:w-10 object-contain" />
                  <h1 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">Lab Komputer MAM 1 Paciran</h1>
                </div>
                <div className="mobile-nav">
                  <a href="admin.html" className="btn btn-secondary">
                    <div className="icon-settings text-sm mr-1 sm:mr-2"></div>
                    Admin
                  </a>
                  <LoginForm onLogin={handleLogin} isModal={true} />
                </div>
              </div>
            </div>
          </header>
        <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
          <PublicSchedule schedules={schedules} />
        </main>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[var(--background-color)]" data-name="app" data-file="app.js">
        <header className="bg-white shadow-sm border-b border-[var(--border-color)]">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
            <div className="mobile-header">
              <div className="flex items-center gap-2 sm:gap-3">
                <img src="https://app.trickle.so/storage/public/images/usr_13477b4760000001/aae447b5-bf11-49de-9611-82edf71e9157.png" alt="Logo MAM 1 Paciran" className="h-8 w-8 sm:h-10 sm:w-10 object-contain" />
                <h1 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">Lab Komputer MAM 1 Paciran</h1>
              </div>
              <div className="mobile-nav">
                <span className="text-xs sm:text-sm text-[var(--text-secondary)] hidden sm:block">
                  Selamat datang, {currentUser?.name}
                </span>
                <button onClick={handleLogout} className="btn btn-secondary">
                  <div className="icon-log-out text-sm mr-1 sm:mr-2"></div>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ScheduleGrid 
                schedules={schedules} 
                onBooking={handleBooking}
                currentUser={currentUser}
              />
            </div>
            <div>
              <TeacherBookings 
                currentUser={currentUser}
                onRefresh={loadSchedules}
              />
            </div>
          </div>
        </main>
      </div>
    );
  } catch (error) {
    console.error('App component error:', error);
    return null;
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);