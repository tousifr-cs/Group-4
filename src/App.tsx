import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import './App.css';
import { FirebaseProvider } from './contexts/FirebaseContext';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import JobSearch from './components/JobSearch';
import JobListings from './components/JobListings';
import JobFilters from './components/JobFilters';
import PostJobModal from './components/PostJobModal';
import Profile from './components/Profile';
import CareerAdvice from './components/CareerAdvice';
import Companies from './components/Companies';
import AdminPanel from './components/AdminPanel';
import './utils/sampleData'; // Import sample data utility

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [filters, setFilters] = useState({
    jobType: '',
    experienceLevel: '',
    salaryRange: '',
    remote: false
  });
  const [showPostJobModal, setShowPostJobModal] = useState(false);

  return (
    <FirebaseProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <Header onPostJob={() => setShowPostJobModal(true)} />
            <Switch>
              <Route path="/profile" component={Profile} />
              <Route path="/career-advice" component={CareerAdvice} />
              <Route path="/companies" component={Companies} />
              <Route path="/admin" component={AdminPanel} />
              <Route path="/" exact>
                <main className="main-content">
                  <JobSearch 
                    searchQuery={searchQuery}
                    location={location}
                    onSearchChange={setSearchQuery}
                    onLocationChange={setLocation}
                  />
                  <div className="content-wrapper">
                    <JobFilters 
                      filters={filters}
                      onFiltersChange={setFilters}
                    />
                    <JobListings 
                      searchQuery={searchQuery}
                      location={location}
                      filters={filters}
                    />
                  </div>
                </main>
              </Route>
            </Switch>
                              {showPostJobModal && (
                    <PostJobModal
                      onClose={() => setShowPostJobModal(false)}
                    />
                  )}
                  

                </div>
              </Router>
            </AuthProvider>
          </FirebaseProvider>
        );
      }
      
      export default App;
