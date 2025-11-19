import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { ListingDetailPage } from '@/pages/ListingDetailPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { AddListingPage } from '@/pages/AddListingPage';
import { FindRoommatePage } from '@/pages/FindRoommatePage';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/auth/register" element={<RegisterPage />} />
            <Route path="/oda-ilani/:slug" element={<ListingDetailPage />} />
            <Route path="/profil" element={<ProfilePage />} />
            <Route path="/oda-ilani-ver" element={<AddListingPage />} />
            <Route path="/oda-arkadasi-ara" element={<FindRoommatePage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
