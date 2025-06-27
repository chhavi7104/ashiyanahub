import { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { loadUser } from './features/auth/authSlice';
import setAuthToken from './utils/setAuthToken';
import PrivateRoute from './components/routing/PrivateRoute';
import AdminRoute from './components/routing/AdminRoute';

// Pages
import Home from './pages/Home';
import Property from './pages/Property';
import Search from './pages/Search';
import Dashboard from './pages/Dashboard';
import Properties from './pages/Properties';
import AddProperty from './pages/AddProperty';
import EditProperty from './pages/EditProperty';
import AdminDashboard from './pages/AdminDashboard';
import Users from './pages/Users';
import Login from './pages/Login';
import Register from './pages/Register';

// Components
import Navbar from './components/layout/Navbar';
import Alert from './components/layout/Alert';
import Footer from './components/layout/Footer';

if (localStorage.token) {
  setAuthToken(localStorage.token);
}

const App = () => {
  useEffect(() => {
    store.dispatch(loadUser());
  }, []);

  return (
    <Provider store={store}>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <Alert />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/property/:id" element={<Property />} />
              <Route path="/search" element={<Search />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Private Routes */}
              <Route path="/dashboard" element={<PrivateRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
              </Route>
              <Route path="/my-properties" element={<PrivateRoute />}>
                <Route path="/my-properties" element={<Properties />} />
              </Route>
              <Route path="/add-property" element={<PrivateRoute />}>
                <Route path="/add-property" element={<AddProperty />} />
              </Route>
              <Route path="/edit-property/:id" element={<PrivateRoute />}>
                <Route path="/edit-property/:id" element={<EditProperty />} />
              </Route>
              
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminRoute />}>
                <Route path="/admin" element={<AdminDashboard />} />
              </Route>
              <Route path="/admin/users" element={<AdminRoute />}>
                <Route path="/admin/users" element={<Users />} />
              </Route>
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </Provider>
  );
};

export default App;