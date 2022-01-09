import { useState, useEffect } from 'react';
import { accessToken, logout, getCurrentUserProfile } from './spotify';
import { catchErrors } from './utils';

import {
  BrowserRouter as Router,
  Route,
  Routes,
  Link,
  Outlet,
  useLocation,
  useParams
} from 'react-router-dom'

import './App.css'

// Scroll to top of page when changing routes
// https://reactrouter.com/web/guides/scroll-restoration/scroll-to-top
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  const [token, setToken] = useState(null)
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    setToken(accessToken)

    const fetchData = async () => {
      const { data } = await getCurrentUserProfile()
      setProfile(data)
    }

    if (accessToken) {
      catchErrors(fetchData())
    }
  }, [])

  return (
    <div className="App">
      <header className="App-header">
      {!token ? (
          <a className="App-link" href="http://localhost:8888/login">
            Log in to Spotify
          </a>
        ) : (
          <Router>
            <ScrollToTop />
            <Routes>
              <Route path="/top-artists" element={<TopArtists />} />
              <Route path="/top-tracks" element={<TopTracks />} />
              <Route path="/playlists/:id" element={<Playlist />} />
              <Route path="/playlists" element={<Playlists />} />
              <Route path="/" element={<Home profile={profile} />} />
            </Routes>
          </Router>
        )}
      </header>
    </div>
  )
}

function TopArtists() {
  return (
    <>
      <h1>Top Artists</h1>
      <div>
        <nav>
          <Link to="/">Home</Link>
        </nav>

      </div>
    </>
  )
}

function TopTracks() {
  return (
    <>
      <h1>Top Tracks</h1>
      <div>
        <nav>
          <Link to="/">Home</Link>
        </nav>

      </div>
    </>
  )
}

function Playlist() {
  let { id } = useParams()  
  return (
    <>
      <h1>Playlist Id {id}</h1>
      <div>
        <nav>
          <Link to="/">Home</Link>
        </nav>

      </div>
    </>
  )
}

function Playlists() {
  return (
    <>
      <h1>Playlists</h1>
      <div>
        <nav>
          <Link to="/">Home</Link>
        </nav>

      </div>
    </>
  )
}

function Home({profile}) {
  return (
    <>
      <button onClick={logout}>Log Out</button>
      {profile && (
        <div>
          <h1>{profile.display_name}</h1>
          <p>{(profile.followers ? profile.followers.total : 0)} Followers</p>
          {profile.images && profile.images.length && profile.images[0].url && (
            <img src={profile.images[0].url} alt="Avatar"/>
          )}
        </div>
      )}
      <Outlet />
    </>
  )
}

export default App
