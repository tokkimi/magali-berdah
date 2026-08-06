import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useStore } from '../lib/store';

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useStore();

  const isAuctions = location.search.includes('type=auction');
  const isSales = location.search.includes('type=fixed');

  const handleFavorites = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(user ? '/favoris' : '/');
  };

  return (
    <>
      <style>{`
        .bottom-nav-wrap {
          position: fixed;
          bottom: 18px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 300;
          width: calc(100% - 32px);
          max-width: 440px;
        }
        .bottom-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 10px;
          border-radius: 60px;
          background: rgba(248, 244, 239, 0.45);
          backdrop-filter: blur(28px) saturate(180%);
          -webkit-backdrop-filter: blur(28px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.6);
          box-shadow:
            0 8px 32px rgba(26, 26, 26, 0.14),
            0 2px 8px rgba(26, 26, 26, 0.08),
            inset 0 1px 0 rgba(255,255,255,0.75),
            inset 0 -1px 0 rgba(201,169,110,0.12);
        }
        .nav-pill {
          flex: 1;
          text-align: center;
          padding: 9px 8px;
          border-radius: 50px;
          text-decoration: none;
          transition: background 0.2s ease;
          font-family: 'Helvetica Neue', Arial, sans-serif;
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.13em;
        }
        .nav-pill.active {
          background: rgba(201, 169, 110, 0.88);
          color: white;
          box-shadow: 0 2px 10px rgba(201,169,110,0.35);
        }
        .nav-pill.inactive {
          color: #1a1a1a;
        }
        .nav-pill.inactive:hover {
          background: rgba(201,169,110,0.12);
        }
        .nav-heart {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin: 0 6px;
          background: linear-gradient(145deg, #d4b07a, #c9a96e, #b8935a);
          box-shadow:
            0 4px 15px rgba(201,169,110,0.45),
            0 1px 3px rgba(201,169,110,0.3),
            inset 0 1px 0 rgba(255,255,255,0.25);
          transition: transform 0.18s ease, box-shadow 0.18s ease;
        }
        .nav-heart:hover, .nav-heart:active {
          transform: scale(1.1);
          box-shadow: 0 6px 22px rgba(201,169,110,0.55), inset 0 1px 0 rgba(255,255,255,0.3);
        }
      `}</style>

      <div className="bottom-nav-wrap">
        <div className="bottom-nav">
          <Link
            to="/catalogue?type=fixed"
            className={`nav-pill ${isSales ? 'active' : 'inactive'}`}
          >
            VENTE
          </Link>

          <button className="nav-heart" onClick={handleFavorites}>
            <Heart size={20} color="white" fill="white" />
          </button>

          <Link
            to="/catalogue?type=auction"
            className={`nav-pill ${isAuctions ? 'active' : 'inactive'}`}
          >
            ENCHÈRES
          </Link>
        </div>
      </div>
    </>
  );
}
